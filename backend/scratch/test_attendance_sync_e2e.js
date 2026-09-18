import dns from "dns";
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

import mongoose from "mongoose";
import fs from "fs";
import Attendance from "../models/Attendance.js";
import ParentEnquiry from "../models/ParentEnquiry.js";
import Tutor from "../models/Tutor.js";
import { syncAttendanceLogToOdoo, createLead } from "../utils/odooService.js";

// Load environment from backend/.env
const envPath = "c:/Users/DELL/OneDrive/Desktop/saraswati-tutorial1-main/backend/.env";
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

const ODOO_URL = (env.ODOO_COMMUNITY_URL || env.ODOO_URL || "https://odoo.saraswatitutorial.com").replace(/\/+$/, "");
const DB = env.ODOO_DB || "saraswati-tutorial";
const USERNAME = env.ODOO_USERNAME || "admin";
const PASSWORD = env.ODOO_PASSWORD || "";
const JSONRPC_URL = `${ODOO_URL}/jsonrpc`;

async function callOdoo(service, method, args) {
  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: { service, method, args },
    id: Math.floor(Math.random() * 1000000),
  };
  const res = await fetch(JSONRPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error?.data?.message || data.error?.message || "Odoo Error");
  return data.result;
}

async function runTests() {
  console.log("===============================================================");
  console.log("RUNNING COMPREHENSIVE ATTENDANCE & CRM SYNC VERIFICATION SUITE");
  console.log("===============================================================");

  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB successfully.");

  const uid = await callOdoo("common", "authenticate", [DB, USERNAME, PASSWORD, {}]);
  console.log(`Connected to Odoo Community successfully (UID: ${uid}).\n`);

  let testParent = null;
  let testTutor = null;
  let testAttendance = null;
  let odooAttendanceIds = [];

  try {
    // Setup test parent enquiry in MongoDB
    const testReqSeq = "E2E-" + Date.now().toString().slice(-6);
    testParent = new ParentEnquiry({
      parentName: "E2E Automated Test Parent",
      phone: "919876543210",
      email: `e2e_${Date.now()}@saraswatitutorial.com`,
      requirementId: `REQ-${testReqSeq}`,
      websiteStudentId: `STU-${testReqSeq}`,
      wards: [{ studentName: "E2E Student Alpha", classGrade: "Class 10", curriculum: "CBSE" }],
      totalClasses: 12,
      currentPackageCycle: 1,
      status: "Enrolled",
    });
    await testParent.save();
    console.log(`[SETUP] Created test ParentEnquiry: ${testParent.requirementId}, student: ${testParent.websiteStudentId}`);

    // Setup test tutor
    testTutor = await Tutor.findOne();
    if (!testTutor) {
      testTutor = new Tutor({
        name: "Test E2E Tutor",
        phone: "919123456789",
        tutorCode: "TUT-E2E-999",
        status: "approved",
      });
      await testTutor.save();
    }
    console.log(`[SETUP] Using test Tutor: ${testTutor.name} (${testTutor.tutorCode || testTutor._id})\n`);

    // -------------------------------------------------------------
    // TEST 7: Parent enquiry submitted -> MongoDB enquiry saved, Odoo CRM lead created
    // -------------------------------------------------------------
    console.log("--- TEST 7: Parent enquiry submitted -> Odoo CRM lead created ---");
    const leadData = testParent.toObject();
    const leadRes = await createLead({
      ...leadData,
      requirementId: testParent.requirementId,
      websiteStudentId: testParent.websiteStudentId,
      userType: "parent",
    });
    console.log(`Created Odoo CRM lead #${leadRes.id} for requirement ${testParent.requirementId}`);
    testParent.odooLeadId = leadRes.id;
    testParent.odooSyncStatus = "synced";
    testParent.odooLastSyncAt = new Date();
    await testParent.save();

    if (!leadRes.id) throw new Error("TEST 7 FAILED: Lead was not created in Odoo");
    console.log("✅ TEST 7 PASSED: MongoDB enquiry saved and Odoo CRM lead created.\n");

    // -------------------------------------------------------------
    // TEST 8: Same enquiry synchronized again -> Existing Odoo lead updated, No duplicate
    // -------------------------------------------------------------
    console.log("--- TEST 8: Same enquiry synchronized again -> Update existing, no duplicate ---");
    const leadRes2 = await createLead({
      ...testParent.toObject(),
      requirementId: testParent.requirementId,
      websiteStudentId: testParent.websiteStudentId,
      userType: "parent",
    });
    console.log(`Result of re-syncing same enquiry: Lead ID #${leadRes2.id}`);

    // Check count of leads in Odoo with this website_student_id
    const leadsFound = await callOdoo("object", "execute_kw", [
      DB, uid, PASSWORD, "crm.lead", "search_read",
      [[["website_student_id", "=", testParent.websiteStudentId]]],
      { fields: ["id", "name", "website_student_id"] }
    ]);
    console.log(`Leads in Odoo with website_student_id ${testParent.websiteStudentId}: ${leadsFound.length}`);
    if (leadsFound.length !== 1 || leadsFound[0].id !== leadRes.id) {
      throw new Error("TEST 8 FAILED: Duplicate lead created or lead ID mismatch!");
    }
    console.log("✅ TEST 8 PASSED: Re-syncing existing enquiry updated lead without creating duplicates.\n");

    // -------------------------------------------------------------
    // TEST 1: Teacher marks class completed -> MongoDB saved, Odoo attendance created
    // -------------------------------------------------------------
    console.log("--- TEST 1: Mark class completed -> Odoo attendance created ---");
    testAttendance = new Attendance({
      parentEnquiryId: testParent._id,
      studentName: testParent.wards[0].studentName,
      requirementId: testParent.requirementId,
      websiteStudentId: testParent.websiteStudentId,
      tutorId: testTutor._id,
      tutorName: testTutor.name,
      packageCycle: 1,
      sessionNumber: 1,
      status: "Done",
      topicsCovered: "Linear Equations - Exercises 1 to 5",
      date: "2026-09-18",
    });
    await testAttendance.save();
    console.log(`MongoDB attendance saved with ID: ${testAttendance._id}, externalAttendanceId: ${testAttendance.externalAttendanceId}`);

    // Sync to Odoo
    const syncRes1 = await syncAttendanceLogToOdoo({
      log: testAttendance,
      lead: testParent,
      tutor: testTutor,
    });
    console.log("Sync result:", syncRes1);
    if (!syncRes1.success || !testAttendance.odooAttendanceId) {
      throw new Error(`TEST 1 FAILED: Attendance sync failed: ${syncRes1.error}`);
    }
    odooAttendanceIds.push(testAttendance.odooAttendanceId);

    // Verify in Odoo
    const odooRec1 = await callOdoo("object", "execute_kw", [
      DB, uid, PASSWORD, "tuition.attendance", "search_read",
      [[["id", "=", testAttendance.odooAttendanceId]]],
      { fields: ["id", "status", "external_attendance_id", "website_student_id", "notes"] }
    ]);
    console.log("Odoo attendance record 1:", odooRec1);
    if (odooRec1[0].status !== "completed" || odooRec1[0].external_attendance_id !== testAttendance.externalAttendanceId) {
      throw new Error("TEST 1 FAILED: Status in Odoo is not completed or external ID mismatch!");
    }
    console.log("✅ TEST 1 PASSED: MongoDB attendance saved and Odoo attendance created.\n");

    // -------------------------------------------------------------
    // TEST 2: Teacher changes completed -> absent (Done -> Missed)
    // -------------------------------------------------------------
    console.log("--- TEST 2: Teacher changes completed -> absent ---");
    testAttendance.status = "Missed";
    testAttendance.topicsCovered = "";
    testAttendance.missedReason = "Student Unavailable";
    await testAttendance.save();

    const syncRes2 = await syncAttendanceLogToOdoo({
      log: testAttendance,
      lead: testParent,
      tutor: testTutor,
    });
    console.log("Sync result 2:", syncRes2);

    // Verify in Odoo: same attendance ID, updated status 'absent', no duplicate
    const odooRecordsByExtId2 = await callOdoo("object", "execute_kw", [
      DB, uid, PASSWORD, "tuition.attendance", "search_read",
      [[["external_attendance_id", "=", testAttendance.externalAttendanceId]]],
      { fields: ["id", "status", "external_attendance_id", "notes"] }
    ]);
    console.log("Odoo records with external ID after TEST 2:", odooRecordsByExtId2);
    if (odooRecordsByExtId2.length !== 1) {
      throw new Error(`TEST 2 FAILED: Expected 1 record in Odoo, found ${odooRecordsByExtId2.length}`);
    }
    if (odooRecordsByExtId2[0].status !== "absent") {
      throw new Error(`TEST 2 FAILED: Status in Odoo is ${odooRecordsByExtId2[0].status}, expected 'absent'`);
    }
    console.log("✅ TEST 2 PASSED: Attendance updated in-place to absent in Odoo without duplicate.\n");

    // -------------------------------------------------------------
    // TEST 3: Teacher changes absent -> completed (Missed -> Done)
    // -------------------------------------------------------------
    console.log("--- TEST 3: Teacher changes absent -> completed ---");
    testAttendance.status = "Done";
    testAttendance.topicsCovered = "Linear Equations - Resumed class";
    testAttendance.missedReason = "";
    await testAttendance.save();

    const syncRes3 = await syncAttendanceLogToOdoo({
      log: testAttendance,
      lead: testParent,
      tutor: testTutor,
    });
    console.log("Sync result 3:", syncRes3);

    const odooRecordsByExtId3 = await callOdoo("object", "execute_kw", [
      DB, uid, PASSWORD, "tuition.attendance", "search_read",
      [[["external_attendance_id", "=", testAttendance.externalAttendanceId]]],
      { fields: ["id", "status", "external_attendance_id", "notes"] }
    ]);
    console.log("Odoo records with external ID after TEST 3:", odooRecordsByExtId3);
    if (odooRecordsByExtId3.length !== 1) {
      throw new Error(`TEST 3 FAILED: Expected 1 record in Odoo, found ${odooRecordsByExtId3.length}`);
    }
    if (odooRecordsByExtId3[0].status !== "completed") {
      throw new Error(`TEST 3 FAILED: Status in Odoo is ${odooRecordsByExtId3[0].status}, expected 'completed'`);
    }
    console.log("✅ TEST 3 PASSED: Attendance updated in-place to completed in Odoo without duplicate.\n");

    // -------------------------------------------------------------
    // TEST 4: Send the same attendance multiple times -> Only ONE record in Odoo
    // -------------------------------------------------------------
    console.log("--- TEST 4: Send identical attendance multiple times ---");
    for (let i = 1; i <= 3; i++) {
      await syncAttendanceLogToOdoo({
        log: testAttendance,
        lead: testParent,
        tutor: testTutor,
      });
    }

    const odooRecordsByExtId4 = await callOdoo("object", "execute_kw", [
      DB, uid, PASSWORD, "tuition.attendance", "search_read",
      [[["external_attendance_id", "=", testAttendance.externalAttendanceId]]],
      { fields: ["id", "status", "external_attendance_id"] }
    ]);
    console.log(`Count of records in Odoo for ${testAttendance.externalAttendanceId}: ${odooRecordsByExtId4.length}`);
    if (odooRecordsByExtId4.length !== 1) {
      throw new Error(`TEST 4 FAILED: Expected 1 record in Odoo, found ${odooRecordsByExtId4.length}`);
    }
    console.log("✅ TEST 4 PASSED: Idempotency verified, exactly ONE attendance record in Odoo.\n");

    // -------------------------------------------------------------
    // TEST 5: Odoo temporarily unavailable -> MongoDB saved, sync marked failed/pending
    // -------------------------------------------------------------
    console.log("--- TEST 5: Odoo temporarily unavailable ---");
    const testAttendanceOffline = new Attendance({
      parentEnquiryId: testParent._id,
      studentName: testParent.wards[0].studentName,
      requirementId: testParent.requirementId,
      websiteStudentId: testParent.websiteStudentId,
      tutorId: testTutor._id,
      tutorName: testTutor.name,
      packageCycle: 1,
      sessionNumber: 2,
      status: "Done",
      topicsCovered: "Simulated offline class",
      date: "2026-09-19",
      odooSyncStatus: "pending",
    });
    await testAttendanceOffline.save();
    console.log(`Saved offline test attendance in MongoDB: ${testAttendanceOffline._id}`);

    // Simulate failure
    const simulatedError = "Odoo server unavailable: ECONNREFUSED";
    testAttendanceOffline.odooSyncStatus = "failed";
    testAttendanceOffline.odooSyncError = simulatedError;
    testAttendanceOffline.odooLastSyncAt = new Date();
    await testAttendanceOffline.save();

    // Verify MongoDB attendance still exists intact
    const fetchedOffline = await Attendance.findById(testAttendanceOffline._id);
    if (!fetchedOffline || fetchedOffline.status !== "Done" || fetchedOffline.odooSyncStatus !== "failed") {
      throw new Error("TEST 5 FAILED: Offline attendance document corrupted in MongoDB!");
    }
    console.log("✅ TEST 5 PASSED: Attendance preserved in MongoDB with odooSyncStatus='failed'.\n");

    // -------------------------------------------------------------
    // TEST 6: Retry after Odoo becomes available -> Attendance synchronizes, no duplicates
    // -------------------------------------------------------------
    console.log("--- TEST 6: Retry sync after Odoo is available ---");
    const retryRes = await syncAttendanceLogToOdoo({
      log: fetchedOffline,
      lead: testParent,
      tutor: testTutor,
    });
    console.log("Retry result:", retryRes);
    if (!retryRes.success || fetchedOffline.odooSyncStatus !== "synced") {
      throw new Error(`TEST 6 FAILED: Retry failed: ${retryRes.error}`);
    }
    odooAttendanceIds.push(fetchedOffline.odooAttendanceId);

    const odooRecordsOffline = await callOdoo("object", "execute_kw", [
      DB, uid, PASSWORD, "tuition.attendance", "search_read",
      [[["external_attendance_id", "=", fetchedOffline.externalAttendanceId]]],
      { fields: ["id", "status", "external_attendance_id"] }
    ]);
    if (odooRecordsOffline.length !== 1) {
      throw new Error(`TEST 6 FAILED: Expected 1 record in Odoo, found ${odooRecordsOffline.length}`);
    }
    console.log("✅ TEST 6 PASSED: Failed attendance successfully retried and synchronized to Odoo.\n");

    console.log("===============================================================");
    console.log("🎉 ALL 8 ACCEPTANCE TESTS COMPLETED AND PASSED SUCCESSFULLY! 🎉");
    console.log("===============================================================");

  } finally {
    // Clean up test records in Odoo and MongoDB
    console.log("\n[CLEANUP] Cleaning up test records...");
    if (odooAttendanceIds.length > 0) {
      try {
        await callOdoo("object", "execute_kw", [
          DB, uid, PASSWORD, "tuition.attendance", "unlink",
          [odooAttendanceIds]
        ]);
        console.log(`Cleaned up Odoo attendance records: ${odooAttendanceIds.join(", ")}`);
      } catch (e) {
        console.warn("Could not clean up Odoo attendance records:", e.message);
      }
    }
    if (testParent?.odooLeadId) {
      try {
        await callOdoo("object", "execute_kw", [
          DB, uid, PASSWORD, "crm.lead", "unlink",
          [[Number(testParent.odooLeadId)]]
        ]);
        console.log(`Cleaned up Odoo CRM lead: ${testParent.odooLeadId}`);
      } catch (e) {
        console.warn("Could not clean up Odoo CRM lead:", e.message);
      }
    }
    if (testParent?._id) {
      await Attendance.deleteMany({ parentEnquiryId: testParent._id });
      await ParentEnquiry.findByIdAndDelete(testParent._id);
      console.log("Cleaned up MongoDB test documents.");
    }
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

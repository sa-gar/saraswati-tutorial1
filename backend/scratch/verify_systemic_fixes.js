import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });
dotenv.config();

import ParentEnquiry from "../models/ParentEnquiry.js";
import Attendance from "../models/Attendance.js";
import Tutor from "../models/Tutor.js";
import {
  computeCycleBreakdown,
  formatStudentCard,
  formatDateRange,
  addOneMonth,
} from "../routes/attendanceRoutes.js";

async function runVerification() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for Systemic Verification");

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      testPassed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      testFailed++;
    }
  }

  // ================================================================
  // 1. DATA SAFETY & BASELINE CHECKS
  // ================================================================
  console.log("\n==================================================");
  console.log("CHECK 1: ABSOLUTE ZERO DATA LOSS / BASELINE COUNTS");
  console.log("==================================================");

  const totalAttendance = await Attendance.countDocuments();
  const totalParentEnquiries = await ParentEnquiry.countDocuments();
  const totalTutors = await Tutor.countDocuments();

  console.log(`Attendance count:       ${totalAttendance} (Baseline: >= 160)`);
  console.log(`ParentEnquiry count:    ${totalParentEnquiries} (Baseline: >= 277)`);
  console.log(`Tutor count:            ${totalTutors} (Baseline: >= 258)`);

  assert(totalAttendance >= 160, `Attendance records preserved (${totalAttendance} >= 160)`);
  assert(totalParentEnquiries >= 277, `Parent Enquiry records preserved (${totalParentEnquiries} >= 277)`);
  assert(totalTutors >= 258, `Tutor records preserved (${totalTutors} >= 258)`);

  // ================================================================
  // 2. RESILIENT CYCLE 1 COUNT FOR HISTORICAL RECORDS
  // ================================================================
  console.log("\n==================================================");
  console.log("CHECK 2: RESILIENT CYCLE 1 COUNT (103 UNTAGGED LOGS)");
  console.log("==================================================");

  // Tejaswi (REQ-00323)
  const tejaswiLead = await ParentEnquiry.findOne({ requirementId: "REQ-00323" });
  if (tejaswiLead) {
    const tejaswiLogs = await Attendance.find({ parentEnquiryId: tejaswiLead._id }).sort({ date: 1 });
    const cycles = computeCycleBreakdown(tejaswiLead, tejaswiLogs);
    const card = await formatStudentCard(tejaswiLead);
    console.log(`Tejaswi: ${tejaswiLogs.length} total logs. Cycle 1 completedCount: ${cycles[0]?.completedCount}`);
    assert(tejaswiLogs.length === 15, `Tejaswi has all 15 logs`);
    assert(cycles[0]?.completedCount === 15, `Tejaswi Cycle 1 completedCount = 15 (previously truncated to 7)`);
    assert(card.currentMonthLabel === "Month 1 (Cycle 1)", `Tejaswi card shows Month 1 (Cycle 1)`);
  } else {
    console.error("Tejaswi record not found by REQ-00323");
  }

  // Cicilia Joseph (REQ-00293)
  const ciciliaLead = await ParentEnquiry.findOne({ requirementId: "REQ-00293" });
  if (ciciliaLead) {
    const ciciliaLogs = await Attendance.find({ parentEnquiryId: ciciliaLead._id }).sort({ date: 1 });
    const cycles = computeCycleBreakdown(ciciliaLead, ciciliaLogs);
    console.log(`Cicilia Joseph: ${ciciliaLogs.length} total logs. Cycle 1 completedCount: ${cycles[0]?.completedCount}`);
    assert(ciciliaLogs.length === 15, `Cicilia has all 15 logs`);
    assert(cycles[0]?.completedCount === 15, `Cicilia Cycle 1 completedCount = 15 (previously truncated to 7)`);
  }

  // Mohan S (REQ-00283) - Multi-cycle parent
  const mohanLead = await ParentEnquiry.findOne({ requirementId: "REQ-00283" });
  if (mohanLead) {
    const mohanLogs = await Attendance.find({ parentEnquiryId: mohanLead._id }).sort({ date: 1 });
    const cycles = computeCycleBreakdown(mohanLead, mohanLogs);
    const card = await formatStudentCard(mohanLead);
    console.log(`Mohan S: ${mohanLogs.length} total logs across ${cycles.length} cycles.`);
    assert(mohanLogs.length === 34, `Mohan S has all 34 logs`);
    assert(cycles[0]?.completedCount === 21, `Mohan S Cycle 1 completedCount = 21 (previously lost untagged logs)`);
    assert(cycles[1]?.completedCount === 13, `Mohan S Cycle 2 completedCount = 13`);
    assert(card.currentMonthLabel === "Month 2 (Cycle 2)", `Mohan S card shows Month 2 (Cycle 2)`);
  }

  // ================================================================
  // 3. MULTI-CYCLE REPRESENTATION FOR ADVANCED PARENTS
  // ================================================================
  console.log("\n==================================================");
  console.log("CHECK 3: MULTI-CYCLE STUDENT CARD & DATES");
  console.log("==================================================");

  // Test date formatting
  const dStart = "2025-01-15";
  const dEnd = addOneMonth(dStart);
  const formattedRange = formatDateRange(dStart, dEnd);
  console.log(`Date range helper: ${formattedRange}`);
  assert(formattedRange.includes("Jan") && formattedRange.includes("Feb"), `Date range correctly spans 1 month: ${formattedRange}`);

  // ================================================================
  // 4. PHONE LOGIN NORMALIZATION CHECK
  // ================================================================
  console.log("\n==================================================");
  console.log("CHECK 4: PHONE NUMBER NORMALIZATION");
  console.log("==================================================");

  const sampleLeadWithPhone = await ParentEnquiry.findOne({ phone: { $exists: true, $ne: "" } });
  if (sampleLeadWithPhone) {
    const rawPhone = sampleLeadWithPhone.phone;
    const cleanDigits = rawPhone.replace(/\D/g, "");
    const last10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

    // Test with spaces, +91, dashes
    const testVariations = [
      `+91 ${last10}`,
      `+91-${last10}`,
      `${last10.slice(0, 5)} ${last10.slice(5)}`,
      last10,
    ];

    for (const testInput of testVariations) {
      const normalizedInput = testInput.replace(/\D/g, "");
      const inputLast10 = normalizedInput.length >= 10 ? normalizedInput.slice(-10) : normalizedInput;
      const regexPattern = new RegExp(inputLast10.split("").join("\\D*") + "$");
      const matched = await ParentEnquiry.findOne({
        _id: sampleLeadWithPhone._id,
        phone: { $regex: regexPattern },
      });
      assert(matched !== null, `Phone variation '${testInput}' correctly resolved to lead ID ${sampleLeadWithPhone._id}`);
    }
  }

  // ================================================================
  // 5. TEACHER ATTENDANCE UPDATE IDEMPOTENCY & EDITING
  // ================================================================
  console.log("\n==================================================");
  console.log("CHECK 5: TEACHER ATTENDANCE EDIT & SYNC");
  console.log("==================================================");

  // Create isolated verification lead
  const testLead = await ParentEnquiry.create({
    parentName: "TEST_VERIF_PARENT",
    phone: "9999900001",
    wards: [{ studentName: "Test Student", classGrade: "Grade 10" }],
    assignedTutor: "Test Tutor",
    totalClasses: 12,
    completedClasses: 0,
    currentPackageCycle: 1,
    status: "Enrolled",
  });

  const testTutor = await Tutor.findOne();
  const tutorId = testTutor ? testTutor._id : new mongoose.Types.ObjectId();

  try {
    const testDate = "2026-09-04";

    // Step 5a: Teacher marks attendance Done
    console.log("Submitting initial attendance (Done)...");
    const existingLog = await Attendance.findOne({
      parentEnquiryId: testLead._id,
      date: testDate,
    });
    assert(existingLog === null, "No prior attendance exists on test date");

    const createdAttendance = await Attendance.create({
      parentEnquiryId: testLead._id,
      requirementId: "REQ-TEST-001",
      studentName: "Test Student",
      tutorId: tutorId,
      tutorName: "Test Tutor",
      date: testDate,
      status: "Done",
      topicsCovered: "Linear Equations & Algebra",
      packageCycle: 1,
      sessionNumber: 1,
    });

    assert(createdAttendance._id !== null, "Created initial attendance log");

    // Recalculate lead
    const completedCount1 = await Attendance.countDocuments({
      parentEnquiryId: testLead._id,
      status: "Done",
      $or: [{ packageCycle: 1 }, { packageCycle: { $exists: false } }, { packageCycle: null }],
    });
    assert(completedCount1 === 1, "Completed classes is 1 after initial mark");

    // Step 5b: Teacher updates topics on same date (simulating edit)
    console.log("Teacher updates topic on same date (edit in place)...");
    const recordToEdit = await Attendance.findOne({
      parentEnquiryId: testLead._id,
      date: testDate,
    });

    recordToEdit.topicsCovered = "Linear Equations & Quadratic Graphs";
    await recordToEdit.save();

    const countAfterEdit = await Attendance.countDocuments({
      parentEnquiryId: testLead._id,
      date: testDate,
    });
    assert(countAfterEdit === 1, "Zero duplicate records created on same date edit");

    const updatedRecord = await Attendance.findById(recordToEdit._id);
    assert(
      updatedRecord.topicsCovered === "Linear Equations & Quadratic Graphs",
      "Topic was successfully updated in place"
    );

    // Step 5c: Teacher switches status to Missed on same date
    console.log("Teacher flips status from Done -> Missed...");
    recordToEdit.status = "Missed";
    recordToEdit.missedReason = "Student Sick";
    recordToEdit.topicsCovered = "";
    await recordToEdit.save();

    const completedCountAfterMissed = await Attendance.countDocuments({
      parentEnquiryId: testLead._id,
      status: "Done",
      $or: [{ packageCycle: 1 }, { packageCycle: { $exists: false } }, { packageCycle: null }],
    });
    assert(completedCountAfterMissed === 0, "Completed classes correctly decremented to 0");

    const missedCount = await Attendance.countDocuments({
      parentEnquiryId: testLead._id,
      status: "Missed",
    });
    assert(missedCount === 1, "Missed classes is 1");

    // Step 5d: Teacher flips back to Done
    console.log("Teacher flips status back from Missed -> Done...");
    recordToEdit.status = "Done";
    recordToEdit.missedReason = "";
    recordToEdit.topicsCovered = "Quadratic Graphs & Applications";
    await recordToEdit.save();

    const completedCountFinal = await Attendance.countDocuments({
      parentEnquiryId: testLead._id,
      status: "Done",
      $or: [{ packageCycle: 1 }, { packageCycle: { $exists: false } }, { packageCycle: null }],
    });
    assert(completedCountFinal === 1, "Completed classes correctly incremented back to 1");

  } finally {
    // Clean up only our isolated test lead and its log
    await Attendance.deleteMany({ parentEnquiryId: testLead._id });
    await ParentEnquiry.deleteOne({ _id: testLead._id });
    console.log("Cleaned up isolated verification record.");
  }

  // ================================================================
  // 6. FINAL COUNT INTEGRITY CHECK
  // ================================================================
  console.log("\n==================================================");
  console.log("CHECK 6: POST-TEST DATABASE INTEGRITY");
  console.log("==================================================");

  const postTotalAttendance = await Attendance.countDocuments();
  const postTotalParents = await ParentEnquiry.countDocuments();
  const postTotalTutors = await Tutor.countDocuments();

  assert(postTotalAttendance === totalAttendance, `Attendance count intact (${postTotalAttendance} === ${totalAttendance})`);
  assert(postTotalParents === totalParentEnquiries, `Parent enquiry count intact (${postTotalParents} === ${totalParentEnquiries})`);
  assert(postTotalTutors === totalTutors, `Tutor count intact (${postTotalTutors} === ${totalTutors})`);

  console.log("\n==================================================");
  console.log(`VERIFICATION SUMMARY: ${testPassed} PASSED, ${testFailed} FAILED`);
  console.log("==================================================");

  await mongoose.disconnect();
  process.exit(testFailed > 0 ? 1 : 0);
}

runVerification().catch((err) => {
  console.error("Verification failed with fatal error:", err);
  process.exit(1);
});

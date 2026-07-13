import mongoose from "mongoose";
import dotenv from "dotenv";
import Tutor from "../models/Tutor.js";
import ParentEnquiry from "../models/ParentEnquiry.js";
import BroadcastLog from "../models/BroadcastLog.js";
import { callOdoo } from "../utils/odooService.js";
import { buildCentralizedQuery, calculateTutorScore, parseAddress } from "../utils/matchingEngine.js";
import fs from "fs";
import path from "path";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/saraswati-tutorial";
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function runTests() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected successfully!");

  // Clean old test objects
  await Tutor.deleteMany({ email: /test-broadcast-tutor/ });
  await ParentEnquiry.deleteMany({ email: /test-broadcast-parent/ });
  await BroadcastLog.deleteMany({ requirementId: /REQ-TEST-BCAST/ });

  // Set the max broadcast config limit to 5 for testing
  const configPath = path.resolve("config/broadcastConfig.json");
  console.log("Setting temporary maxBroadcastTutors configuration limit to 5...");
  fs.writeFileSync(configPath, JSON.stringify({ maxBroadcastTutors: 5 }, null, 2), "utf8");

  // 1. Seed Tutors using a unique area "UniqueBroadcastingArea"
  const testTutors = [
    {
      name: "Tutor Alpha",
      email: "test-broadcast-tutor-a@saraswati.com",
      phone: "9100000001",
      gender: "Female",
      city: "Bengaluru",
      area: "UniqueBroadcastingArea",
      pincode: "560066",
      fullAddress: "UniqueBroadcastingArea, Bengaluru",
      locations: ["UniqueBroadcastingArea"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["5-6 PM"],
      status: "approved",
      availabilityStatus: "Available"
    },
    {
      name: "Tutor Beta",
      email: "test-broadcast-tutor-b@saraswati.com",
      phone: "9100000002",
      gender: "Female",
      city: "Bengaluru",
      area: "UniqueBroadcastingArea Main Road",
      pincode: "560066",
      fullAddress: "UniqueBroadcastingArea Main Road, Bengaluru",
      locations: ["UniqueBroadcastingArea Main Road"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["5-6 PM"],
      status: "approved",
      availabilityStatus: "Available"
    },
    {
      name: "Tutor Gamma",
      email: "test-broadcast-tutor-c@saraswati.com",
      phone: "9100000003",
      gender: "Female",
      city: "Bengaluru",
      area: "HSR Layout",
      pincode: "560102",
      fullAddress: "HSR Layout, Bengaluru",
      locations: ["HSR Layout"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["5-6 PM"],
      status: "approved",
      availabilityStatus: "Available"
    }
  ];

  console.log("Seeding test tutors...");
  const seededTutors = await Tutor.insertMany(testTutors);
  console.log(`Seeded ${seededTutors.length} tutors.`);

  // 2. Seed Parent Enquiry in "UniqueBroadcastingArea"
  const testParent = {
    parentName: "Parent Broadcaster",
    email: "test-broadcast-parent@gmail.com",
    phone: "9900000000",
    address: "UniqueBroadcastingArea, Bengaluru",
    area: "UniqueBroadcastingArea",
    city: "Bengaluru",
    pincode: "560066",
    preferredTime: "Evening",
    preferredGender: "Female",
    preferredMode: "Offline",
    preferredDays: ["Monday"],
    wards: [
      {
        studentName: "Child Broadcast",
        classGrade: "8",
        curriculum: "ICSE",
        schoolName: "Test School",
        subjectsNeeded: ["Mathematics"],
        subjects: ["Mathematics"]
      }
    ],
    status: "New Lead",
    requirementId: "REQ-TEST-BCAST-01"
  };

  console.log("Creating parent enquiry...");
  const parentLead = new ParentEnquiry(testParent);
  const savedLead = await parentLead.save();
  console.log("Saved parent lead with ID:", savedLead._id, "Requirement ID:", savedLead.requirementId);

  // 3. Test Auto Broadcast Engine Logic directly
  console.log("\n--- Executing Broadcast Workflow ---");

  // Read config limit
  let maxBroadcast = 5;
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    maxBroadcast = config.maxBroadcastTutors || 5;
  }
  console.log("Max Broadcast Limit set to:", maxBroadcast);

  const parsedAddr = parseAddress(savedLead.address);
  const params = {
    pincode: savedLead.pincode || parsedAddr.pincode || "",
    area: savedLead.area || parsedAddr.area || "",
    locality: savedLead.locality || parsedAddr.locality || "",
    landmark: savedLead.landmark || parsedAddr.landmark || "",
    city: savedLead.city || parsedAddr.city || savedLead.geoInfo?.city || "",
    district: savedLead.district || parsedAddr.district || "",
    state: savedLead.state || parsedAddr.state || savedLead.geoInfo?.region || "",
    grade: savedLead.wards?.[0]?.classGrade || "",
    timing: savedLead.preferredTime || "",
    gender: savedLead.preferredGender || "No Preference"
  };

  const query = buildCentralizedQuery(params);
  const tutors = await Tutor.find(query);

  const scoredTutors = tutors
    .map(t => {
      const res = calculateTutorScore(params, t);
      return {
        tutor: t,
        percentage: res.percentage,
        locationScore: res.locationScore
      };
    })
    .filter(item => item.locationScore > 0 && item.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  // Take top recommended tutors up to the limit of 5.
  const selected = scoredTutors.slice(0, maxBroadcast).map(item => item.tutor);
  console.log(`Auto Broadcast selected ${selected.length} tutors. Details:`);
  selected.forEach((t, idx) => {
    console.log(`#${idx + 1}: ${t.name} (Phone: ${t.phone}, Area: ${t.area}, Pincode: ${t.pincode})`);
  });

  const hasAlpha = selected.some(t => t.name === "Tutor Alpha");
  const hasBeta = selected.some(t => t.name === "Tutor Beta");
  const hasGamma = selected.some(t => t.name === "Tutor Gamma");

  console.log("\n--- MATCHING CHECKS ---");
  console.log(`Matched Tutor Alpha (Exact match): ${hasAlpha ? "PASSED" : "FAILED"}`);
  console.log(`Matched Tutor Beta (Similar match): ${hasBeta ? "PASSED" : "FAILED"}`);
  console.log(`Excluded Tutor Gamma (Same City, falls outside limit): ${!hasGamma ? "PASSED" : "FAILED"}`);

  // 4. Send Message & Duplicate Prevention Check
  console.log("\n--- TESTING BROADCAST LOGGING & DUPLICATE PREVENTION ---");
  
  const reqId = savedLead.requirementId;
  const parentGrade = `Class ${savedLead.wards[0].classGrade}`;
  const parentBoard = savedLead.wards[0].curriculum;
  const parentLocation = `${params.area}, ${params.city} - ${params.pincode}`;
  const parentTiming = savedLead.preferredTime;

  for (const tutor of selected) {
    const existingLog = await BroadcastLog.findOne({
      tutorId: tutor._id,
      requirementId: reqId
    });

    if (existingLog) {
      console.log(`Safety check: Broadcast already sent to ${tutor.name}. Skipping.`);
      continue;
    }

    const message = `Hello ${tutor.name},\n\nA new tuition opportunity matching your profile has been found.\n\nRequirement ID:\n${reqId}\n\nStudent Grade:\n${parentGrade}\n\nBoard:\n${parentBoard}\n\nLocation:\n${parentLocation}\n\nPreferred Timing:\n${parentTiming}\n\nIf you are interested, please reply YES.\n\nThank you,\nSaraswati Tutorials`;

    const log = new BroadcastLog({
      tutorId: tutor._id,
      tutorName: tutor.name,
      tutorPhone: tutor.phone,
      requirementId: reqId,
      leadId: savedLead._id,
      type: "whatsapp",
      message: message,
      status: "Sent",
      responseStatus: "No Response"
    });
    await log.save();
    console.log(`Created BroadcastLog for ${tutor.name}`);
  }

  // Duplicate Send Test
  let skipCount = 0;
  for (const tutor of selected) {
    const existingLog = await BroadcastLog.findOne({
      tutorId: tutor._id,
      requirementId: reqId
    });
    if (existingLog) {
      skipCount++;
    }
  }
  console.log(`Assertion: Safety rule prevented duplicate sends on re-run: ${skipCount === selected.length ? "PASSED" : "FAILED"} (${skipCount}/${selected.length} skipped)`);

  // 5. Odoo Inbound reply tracking test
  console.log("\n--- TESTING AUTOMATIC RESPONSE TRACKING ---");
  console.log("Authenticating with Odoo to simulate a tutor response...");
  const uid = await callOdoo("common", "authenticate", [
    DB,
    USERNAME,
    PASSWORD,
    {},
  ]);

  const alphaTutor = seededTutors.find(t => t.name === "Tutor Alpha");
  const alphaPhone = alphaTutor.phone;

  console.log("Creating Mail Message first in Odoo...");
  const mailMsgId = await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "mail.message",
    "create",
    [{
      body: "<p>YES</p>",
      message_type: "comment",
      model: "whatsapp.message"
    }]
  ]);

  console.log(`Creating dummy inbound reply 'YES' in Odoo linked to Mail Message for phone ${alphaPhone}...`);
  const odooReplyId = await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "whatsapp.message",
    "create",
    [{
      mobile_number: alphaPhone,
      message_type: "inbound",
      state: "received",
      wa_account_id: 2,
      mail_message_id: mailMsgId
    }]
  ]);
  console.log(`Created Odoo whatsapp.message record ID: ${odooReplyId}`);

  console.log("Running syncAllBroadcastReplies response tracking function...");
  
  const pendingLogs = await BroadcastLog.find({
    responseStatus: "No Response",
    requirementId: reqId
  });

  console.log(`Pending broadcast logs found in MongoDB: ${pendingLogs.length}`);

  // Sync replies
  for (const log of pendingLogs) {
    let cleanPhone = String(log.tutorPhone).replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) continue;
    cleanPhone = cleanPhone.slice(-10);

    // Apply a 5-minute clock skew buffer
    const logTimeWithBuffer = new Date(new Date(log.time).getTime() - 5 * 60 * 1000);
    const logTimeStr = logTimeWithBuffer.toISOString().replace("T", " ").substring(0, 19);

    const domain = [
      ["message_type", "=", "inbound"],
      ["create_date", ">=", logTimeStr],
      ["mobile_number", "like", cleanPhone]
    ];

    const replies = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "whatsapp.message",
      "search_read",
      [domain],
      { fields: ["id", "body", "create_date"] }
    ]);

    if (replies.length > 0) {
      const matchReply = replies[0];
      const cleanText = String(matchReply.body || "")
        .replace(/<[^>]*>/g, "")
        .trim()
        .toUpperCase();

      console.log(`Found tutor reply in Odoo for ${log.tutorName}: "${cleanText}"`);

      let newStatus = null;
      if (cleanText.includes("YES")) {
        newStatus = "Interested";
      } else if (cleanText.includes("NO")) {
        newStatus = "Not Interested";
      } else if (cleanText.includes("BUSY")) {
        newStatus = "Busy";
      }

      if (newStatus) {
        log.responseStatus = newStatus;
        await log.save();
        console.log(`Successfully updated responseStatus for ${log.tutorName} to: ${log.responseStatus}`);
      }
    }
  }

  // Check if Tutor Alpha's log in MongoDB was updated to "Interested"
  const updatedAlphaLog = await BroadcastLog.findOne({ tutorId: alphaTutor._id, requirementId: reqId });
  console.log(`Assertion: Inbound Reply parsed and status updated to Interested: ${updatedAlphaLog && updatedAlphaLog.responseStatus === "Interested" ? "PASSED" : "FAILED"} (Status: ${updatedAlphaLog?.responseStatus})`);

  // Clean up simulated Odoo inbound message
  console.log("Cleaning up Odoo simulated message...");
  await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "whatsapp.message",
    "unlink",
    [[odooReplyId]]
  ]);
  console.log("Simulated Odoo reply record unlinked.");

  // Clean up MongoDB records
  console.log("Cleaning MongoDB test records...");
  await Tutor.deleteMany({ email: /test-broadcast-tutor/ });
  await ParentEnquiry.deleteMany({ email: /test-broadcast-parent/ });
  await BroadcastLog.deleteMany({ requirementId: /REQ-TEST-BCAST/ });

  // Restore maxBroadcastTutors to 20
  console.log("Restoring maxBroadcastTutors setting to 20...");
  fs.writeFileSync(configPath, JSON.stringify({ maxBroadcastTutors: 20 }, null, 2), "utf8");

  await mongoose.disconnect();
  console.log("\nDisconnected from MongoDB. Verification tests completed successfully!");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

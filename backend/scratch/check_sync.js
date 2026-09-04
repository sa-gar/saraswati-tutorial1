import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import ParentEnquiry from "../models/ParentEnquiry.js";
import Attendance from "../models/Attendance.js";
import Tutor from "../models/Tutor.js";

async function checkSync() {
  await mongoose.connect(process.env.MONGO_URI);

  // Find all ParentEnquiries that have at least one attendance record
  const allAttendances = await Attendance.find();
  const peIdSet = new Set(allAttendances.map(a => a.parentEnquiryId.toString()));
  console.log(`Found ${allAttendances.length} attendance records across ${peIdSet.size} parents.\n`);

  for (const peId of peIdSet) {
    const lead = await ParentEnquiry.findById(peId);
    if (!lead) {
      console.log(`ParentEnquiry not found for ID: ${peId}`);
      continue;
    }

    const tutor = lead.assignedTutorId ? await Tutor.findById(lead.assignedTutorId) : null;
    const logs = await Attendance.find({ parentEnquiryId: lead._id }).sort({ date: 1 });
    const doneLogs = logs.filter(l => l.status === "Done");
    const missedLogs = logs.filter(l => l.status === "Missed");

    console.log("==================================================");
    console.log(`Parent: ${lead.parentName} (${lead.phone})`);
    console.log(`Requirement ID: ${lead.requirementId}`);
    console.log(`Lead ID: ${lead._id}`);
    console.log(`Lead Status: ${lead.status}`);
    console.log(`Lead Assigned Tutor: "${lead.assignedTutor}" | ID: ${lead.assignedTutorId}`);
    console.log(`Tutor in DB: ${tutor ? `${tutor.name} (${tutor.tutorCode})` : "NOT FOUND"}`);
    console.log(`Lead totalClasses: ${lead.totalClasses}`);
    console.log(`Lead completedClasses: ${lead.completedClasses}`);
    console.log(`Lead currentPackageCycle: ${lead.currentPackageCycle}`);
    console.log(`Lead packageStatus: ${lead.packageStatus}`);
    console.log(`Lead packageHistory:`, JSON.stringify(lead.packageHistory));

    console.log(`\nAttendance count in DB: Total: ${logs.length} (Done: ${doneLogs.length}, Missed: ${missedLogs.length})`);
    
    // Check cycle breakdown of attendance records
    const cycleCounts = {};
    logs.forEach(l => {
      cycleCounts[l.packageCycle] = (cycleCounts[l.packageCycle] || 0) + 1;
    });
    console.log(`Logs per packageCycle:`, cycleCounts);

    console.log("\nLogs detail:");
    logs.forEach(l => {
      console.log(`  [Cycle ${l.packageCycle}] Class ${l.sessionNumber} | Date: ${l.date} | Status: ${l.status} | Tutor: ${l.tutorName} (${l.tutorId}) | Topics/Reason: ${l.status === "Done" ? l.topicsCovered : (l.missedReason || l.customReason)}`);
    });

    console.log("");
  }

  await mongoose.disconnect();
}

checkSync().catch(console.error);

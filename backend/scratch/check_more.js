import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import ParentEnquiry from "../models/ParentEnquiry.js";
import Attendance from "../models/Attendance.js";

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const name of ["Mohan S", "Cicilia Joseph", "Tejaswi"]) {
    const lead = await ParentEnquiry.findOne({ parentName: name });
    if (!lead) continue;
    const logs = await Attendance.find({ parentEnquiryId: lead._id }).sort({ date: 1 });
    console.log(`\nParent: ${lead.parentName}, Total: ${lead.totalClasses}, Completed: ${lead.completedClasses}, Cycle: ${lead.currentPackageCycle}, Hist: ${JSON.stringify(lead.packageHistory)}`);
    console.log(`Logs (${logs.length}):`);
    logs.forEach(l => console.log(`  [Cycle ${l.packageCycle}] Class ${l.sessionNumber} (${l.date}) [${l.status}] Topics: ${l.topicsCovered}`));
  }
  await mongoose.disconnect();
}
check().catch(console.error);

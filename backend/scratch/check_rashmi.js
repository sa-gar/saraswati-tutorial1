import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Attendance from "../models/Attendance.js";
import ParentEnquiry from "../models/ParentEnquiry.js";

async function checkRashmi() {
  await mongoose.connect(process.env.MONGO_URI);

  const rashmi = await ParentEnquiry.findOne({ parentName: "Rashmi Lumba" });
  console.log("Rashmi lead:", {
    totalClasses: rashmi.totalClasses,
    completedClasses: rashmi.completedClasses,
    cycle: rashmi.currentPackageCycle,
    packageHistory: rashmi.packageHistory
  });

  const logs = await Attendance.find({ parentEnquiryId: rashmi._id }).sort({ date: 1 });
  console.log(`Total logs: ${logs.length}`);
  logs.forEach(l => {
    console.log(`Date: ${l.date} | Cycle in doc: ${l.packageCycle} | Status: ${l.status} | Session: ${l.sessionNumber}`);
  });

  await mongoose.disconnect();
}
checkRashmi().catch(console.error);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Attendance from "../models/Attendance.js";
import ParentEnquiry from "../models/ParentEnquiry.js";

async function inspectTimestamps() {
  await mongoose.connect(process.env.MONGO_URI);

  const tejaswi = await ParentEnquiry.findOne({ parentName: "Tejaswi" });
  console.log("Tejaswi enquiry created at:", tejaswi.createdAt, "updatedAt:", tejaswi.updatedAt);
  const logs = await Attendance.find({ parentEnquiryId: tejaswi._id }).sort({ date: 1, createdAt: 1 });
  for (const l of logs) {
    console.log(`Log ID: ${l._id} | Date: ${l.date} | Session: ${l.sessionNumber} | Cycle: ${l.packageCycle} | Status: ${l.status} | CreatedAt: ${l.createdAt}`);
  }

  await mongoose.disconnect();
}
inspectTimestamps().catch(console.error);

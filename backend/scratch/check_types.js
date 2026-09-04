import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Attendance from "../models/Attendance.js";
import ParentEnquiry from "../models/ParentEnquiry.js";

async function checkTypes() {
  await mongoose.connect(process.env.MONGO_URI);

  const tejaswi = await ParentEnquiry.findOne({ parentName: "Tejaswi" });
  const rawCollection = mongoose.connection.db.collection("attendances");
  const rawLogs = await rawCollection.find({ parentEnquiryId: tejaswi._id }).toArray();
  
  console.log("Total raw logs for Tejaswi:", rawLogs.length);
  rawLogs.forEach((l, i) => {
    console.log(`[${i}] date: ${l.date} | cycle: ${l.packageCycle} (${typeof l.packageCycle}) | session: ${l.sessionNumber} (${typeof l.sessionNumber}) | status: ${l.status}`);
  });

  const countWithCycleNumber1 = await Attendance.countDocuments({
    parentEnquiryId: tejaswi._id,
    packageCycle: 1,
    status: "Done",
  });
  console.log("\nAttendance.countDocuments with packageCycle: 1 ->", countWithCycleNumber1);

  await mongoose.disconnect();
}
checkTypes().catch(console.error);

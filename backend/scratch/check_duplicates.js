import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import ParentEnquiry from "../models/ParentEnquiry.js";
import Attendance from "../models/Attendance.js";

async function checkDuplicates() {
  await mongoose.connect(process.env.MONGO_URI);

  const phones = [
    "7207058987",
    "9986725100",
    "8867891038",
    "9736802476",
    "6006584020",
    "9945792869",
    "9663227128"
  ];

  for (const phone of phones) {
    const leads = await ParentEnquiry.find({ phone: { $regex: phone.slice(-10) } }).sort({ createdAt: -1 });
    console.log(`\nPhone: ${phone} -> Found ${leads.length} leads:`);
    for (const lead of leads) {
      const logsCount = await Attendance.countDocuments({ parentEnquiryId: lead._id });
      console.log(`  Lead ID: ${lead._id} | Req: ${lead.requirementId} | Student: ${lead.wards?.map(w => w.studentName).join(", ")} | Tutor: ${lead.assignedTutor} | Total: ${lead.totalClasses} | Comp: ${lead.completedClasses} | Status: ${lead.status} | Logs in DB: ${logsCount}`);
    }
  }

  await mongoose.disconnect();
}
checkDuplicates().catch(console.error);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI);

  const Attendance = mongoose.model("Attendance", new mongoose.Schema({}, { strict: false }));
  const attendances = await Attendance.find().sort({ date: 1, createdAt: 1 });
  console.log("Total attendances:", attendances.length);
  for (const a of attendances) {
    console.log({
      id: a._id,
      parentEnquiryId: a.parentEnquiryId,
      requirementId: a.requirementId,
      studentName: a.studentName,
      tutorName: a.tutorName,
      tutorId: a.tutorId,
      cycle: a.packageCycle,
      sessionNum: a.sessionNumber,
      status: a.status,
      date: a.date,
      topics: a.topicsCovered,
      missedReason: a.missedReason,
      customReason: a.customReason
    });
  }
  await mongoose.disconnect();
}
inspect().catch(console.error);

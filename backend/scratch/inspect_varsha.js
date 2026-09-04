import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI);

  const ParentEnquiry = mongoose.model("ParentEnquiry", new mongoose.Schema({}, { strict: false }));
  const Attendance = mongoose.model("Attendance", new mongoose.Schema({}, { strict: false }));

  const pe = await ParentEnquiry.findById("6a7f3a749e18173990addfbc");
  console.log("Varsha's ParentEnquiry record:");
  console.log(JSON.stringify(pe, null, 2));

  const attendancesForVarsha = await Attendance.find({ parentEnquiryId: "6a7f3a749e18173990addfbc" });
  console.log("\nAttendances for Varsha:", attendancesForVarsha.length);
  console.log(JSON.stringify(attendancesForVarsha, null, 2));

  await mongoose.disconnect();
}
inspect().catch(console.error);

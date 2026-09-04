import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function checkDateFields() {
  await mongoose.connect(process.env.MONGO_URI);
  const pe = mongoose.connection.db.collection("parentenquiries");

  const sample = await pe.find({ assignedTutor: { $ne: "" } }).toArray();
  const allKeys = new Set();
  sample.forEach(s => Object.keys(s).forEach(k => allKeys.add(k)));
  console.log("All keys on assigned parent enquiries:", Array.from(allKeys).sort());

  await mongoose.disconnect();
}
checkDateFields().catch(console.error);

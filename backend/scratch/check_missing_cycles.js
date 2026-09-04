import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function checkAllUndefinedCycles() {
  await mongoose.connect(process.env.MONGO_URI);
  const rawCollection = mongoose.connection.db.collection("attendances");

  const missingCycleLogs = await rawCollection.find({ packageCycle: { $exists: false } }).toArray();
  console.log("Total attendance logs with MISSING packageCycle:", missingCycleLogs.length);

  const byParent = {};
  missingCycleLogs.forEach(l => {
    byParent[l.parentEnquiryId] = (byParent[l.parentEnquiryId] || 0) + 1;
  });
  console.log("Breakdown by parentEnquiryId:", byParent);

  // Let's resolve the parent names
  const peCollection = mongoose.connection.db.collection("parentenquiries");
  for (const [id, count] of Object.entries(byParent)) {
    const p = await peCollection.findOne({ _id: new mongoose.Types.ObjectId(id) });
    console.log(`  Parent: ${p ? p.parentName : "Unknown"} (${p ? p.phone : ""}) | Req: ${p ? p.requirementId : ""} -> ${count} logs missing cycle`);
  }

  await mongoose.disconnect();
}
checkAllUndefinedCycles().catch(console.error);

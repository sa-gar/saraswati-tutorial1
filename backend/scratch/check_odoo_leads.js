import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const total = await mongoose.connection.db.collection("parentenquiries").countDocuments();
  const withOdooId = await mongoose.connection.db.collection("parentenquiries").countDocuments({ odooLeadId: { $ne: null } });
  const withReqId = await mongoose.connection.db.collection("parentenquiries").countDocuments({ requirementId: { $ne: "" } });
  console.log({ total, withOdooId, withReqId });

  // Sample one with odooLeadId
  const sample = await mongoose.connection.db.collection("parentenquiries").findOne({ odooLeadId: { $ne: null } });
  console.log("Sample lead with Odoo ID:", {
    _id: sample?._id,
    parentName: sample?.parentName,
    odooLeadId: sample?.odooLeadId,
    requirementId: sample?.requirementId,
    totalClasses: sample?.totalClasses,
    completedClasses: sample?.completedClasses,
  });

  process.exit(0);
}

run();

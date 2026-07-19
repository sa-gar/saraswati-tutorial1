import mongoose from "mongoose";
import dotenv from "dotenv";
import Tutor from "../models/Tutor.js";
import ParentEnquiry from "../models/ParentEnquiry.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/saraswati-tutorial";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");

  const leads = await ParentEnquiry.find({}, { requirementId: 1, odooLeadId: 1, name: 1 });
  console.log(`Found ${leads.length} leads in MongoDB:`);
  leads.forEach(l => {
    console.log(`- requirementId: ${l.requirementId}, odooLeadId: ${l.odooLeadId}, name: ${l.name}`);
  });

  const tutors = await Tutor.find({}, { name: 1, tutorCode: 1, phone: 1 });
  console.log(`Found ${tutors.length} tutors in MongoDB:`);
  tutors.forEach(t => {
    console.log(`- name: ${t.name}, tutorCode: ${t.tutorCode}, phone: ${t.phone}`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);

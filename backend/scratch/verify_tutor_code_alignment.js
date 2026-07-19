import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Tutor from "../models/Tutor.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB\n");

  // Sample tutor codes in MongoDB
  const sample = await Tutor.find({}, { name: 1, tutorCode: 1, phone: 1, whatsapp: 1, city: 1 }).limit(10).lean();
  console.log("Sample Tutor records from MongoDB:");
  sample.forEach(t => {
    console.log(`  name="${t.name}" tutorCode="${t.tutorCode}" phone="${t.phone}" city="${t.city}"`);
  });

  console.log("\nOdoo x_tutor record #5 confirmed fields:");
  console.log("  x_studio_tutor_id_4 = 'TUT-001'");
  console.log("  x_studio_full_name_1 = 'Nilesh Kumar'");
  console.log("  x_studio_mobile_number_3 = '8674892407'");
  console.log("  x_studio_whatsapp_number_2 = '8674892407'");
  console.log("  x_studio_city_3 = 'Bangalore'");
  console.log("  x_studio_area_3 = 'Spice garden'");
  console.log("  x_studio_pincode_3 = '560037'");

  const match = sample.find(t => t.tutorCode === "TUT-001" || t.phone === "8674892407");
  if (match) {
    console.log(`\n✅ MATCH FOUND in MongoDB: name="${match.name}" tutorCode="${match.tutorCode}" phone="${match.phone}"`);
  } else {
    console.log("\n⚠️  No direct match found between Odoo record #5 and MongoDB tutors in this sample.");
    console.log("   Either the tutor is not yet synced to MongoDB, or the tutorCode format differs.");
  }

  await mongoose.disconnect();
}

run().catch(console.error);

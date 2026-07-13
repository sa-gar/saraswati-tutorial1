import mongoose from "mongoose";
import dotenv from "dotenv";
import Tutor from "../models/Tutor.js";
import ParentEnquiry from "../models/ParentEnquiry.js";
import { buildCentralizedQuery } from "../utils/matchingEngine.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/saraswati-tutorial";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB\n");

  // Show all approved tutors and their locations
  const approvedTutors = await Tutor.find({ status: "approved" });
  console.log(`=== ALL APPROVED TUTORS (${approvedTutors.length}) ===`);
  approvedTutors.forEach(t => {
    console.log(`  ${t.name}: area="${t.area}" | pincode="${t.pincode}" | gender="${t.gender}" | grades=${JSON.stringify(t.grades)} | locations=${JSON.stringify(t.locations)}`);
  });

  // Show the latest parent leads
  const latestLeads = await ParentEnquiry.find().sort({ createdAt: -1 }).limit(5);
  console.log(`\n=== LATEST 5 PARENT LEADS ===`);
  latestLeads.forEach(l => {
    const firstWard = l.wards?.[0] || {};
    const pincode = l.pincode || "";
    const area = l.area || l.address || "";
    let city = "";
    if (l.address && l.address.includes(",")) {
      const parts = l.address.split(",");
      city = parts[parts.length - 2]?.trim() || "";
    }
    const params = {
      pincode, area, city: city || l.geoInfo?.city || "",
      grade: firstWard.classGrade || "",
      timing: l.preferredTime || "",
      gender: l.preferredGender || "No Preference"
    };
    const query = buildCentralizedQuery(params);
    
    // Run the count synchronously
    console.log(`  ${l.requirementId} | ${l.parentName} | address: "${l.address?.substring(0,40)}" | grade: ${firstWard.classGrade} | gender: ${l.preferredGender}`);
    console.log(`    → Params: area="${area.substring(0,40)}", pincode="${pincode}", grade="${firstWard.classGrade}", gender="${l.preferredGender}"`);
  });

  // Now run actual match counts for latest leads
  console.log(`\n=== MATCH COUNTS ===`);
  for (const l of latestLeads) {
    const firstWard = l.wards?.[0] || {};
    const pincode = l.pincode || "";
    const area = l.area || l.address || "";
    let city = "";
    if (l.address && l.address.includes(",")) {
      const parts = l.address.split(",");
      city = parts[parts.length - 2]?.trim() || "";
    }
    const params = {
      pincode, area, city: city || l.geoInfo?.city || "",
      grade: firstWard.classGrade || "",
      timing: l.preferredTime || "",
      gender: l.preferredGender || "No Preference"
    };
    const query = buildCentralizedQuery(params);
    const count = await Tutor.countDocuments(query);
    const matched = await Tutor.find(query).select("name area locations gender grades");
    console.log(`  ${l.requirementId}: ${count} matched`);
    matched.forEach(t => console.log(`    ✓ ${t.name} (area: ${t.area}, locs: ${JSON.stringify(t.locations)})`));
  }

  await mongoose.disconnect();
}

main().catch(console.error);

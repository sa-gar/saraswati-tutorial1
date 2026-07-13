import mongoose from "mongoose";
import dotenv from "dotenv";
import Tutor from "../models/Tutor.js";
import ParentEnquiry from "../models/ParentEnquiry.js";
import { buildCentralizedQuery } from "../utils/matchingEngine.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/saraswati-tutorial";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");

  const lead = await ParentEnquiry.findOne({ requirementId: "REQ-00270" });
  if (!lead) {
    console.error("Lead not found!");
    await mongoose.disconnect();
    return;
  }

  const firstWard = lead.wards?.[0] || {};
  const pincode = lead.pincode || "";
  const area = lead.area || lead.address || "";
  
  let city = "";
  if (lead.address && lead.address.includes(",")) {
    const parts = lead.address.split(",");
    city = parts[parts.length - 2]?.trim() || parts[parts.length - 1]?.trim() || "";
  }
  
  const params = {
    pincode: pincode,
    area: area,
    city: city || lead.geoInfo?.city || "",
    grade: firstWard.classGrade || "",
    timing: lead.preferredTime || "",
    gender: lead.preferredGender || "No Preference"
  };

  console.log("Params generated:", params);
  const query = buildCentralizedQuery(params);
  console.log("Compiled MongoDB Query:", JSON.stringify(query, null, 2));

  const matched = await Tutor.find(query);
  console.log(`Matched ${matched.length} tutors:`);
  matched.forEach(t => {
    console.log(`- ${t.name} (area: ${t.area}, gender: ${t.gender}, grades: ${JSON.stringify(t.grades)}, locations: ${JSON.stringify(t.locations)})`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);

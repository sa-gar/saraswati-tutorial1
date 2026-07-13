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

  // 1. Get the parent lead
  const lead = await ParentEnquiry.findOne({ requirementId: "REQ-00272" });
  if (!lead) {
    console.error("Lead REQ-00272 not found!");
    // Log the latest 3 leads to see if ID is different
    const latestLeads = await ParentEnquiry.find().sort({ createdAt: -1 }).limit(3);
    console.log("LATEST LEADS:", latestLeads.map(l => ({ id: l.requirementId, name: l.parentName })));
    await mongoose.disconnect();
    return;
  }
  console.log("LEAD DETAILS:", JSON.stringify(lead, null, 2));

  // 2. Get the latest registered tutor
  const latestTutors = await Tutor.find().sort({ createdAt: -1 }).limit(3);
  console.log("LATEST TUTORS:", JSON.stringify(latestTutors, null, 2));

  // 3. Build and log the matching query
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

  console.log("Compiled Params:", params);
  const query = buildCentralizedQuery(params);
  console.log("MongoDB Query:", JSON.stringify(query, null, 2));

  const matched = await Tutor.find(query);
  console.log(`Matched ${matched.length} tutors:`);
  matched.forEach(t => {
    console.log(`- ${t.name} (status: ${t.status}, area: ${t.area}, gender: ${t.gender}, pincode: ${t.pincode}, grades: ${JSON.stringify(t.grades)})`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);

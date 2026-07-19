import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import ParentEnquiry from "../models/ParentEnquiry.js";
import Tutor from "../models/Tutor.js";
import { getRecommendations, buildParamsFromLead } from "../utils/recommendationEngine.js";
import { parseAddress } from "../utils/matchingEngine.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Fetch Nilesh Kumar's Tutor record in Mongo
    const nilesh = await Tutor.findOne({ tutorCode: "TUT-001" });
    if (!nilesh) {
      console.log("❌ Could not find Nilesh Kumar (TUT-001) in MongoDB.");
      return;
    }
    console.log(`\nFound Tutor in MongoDB:`);
    console.log(`  Name:         ${nilesh.name}`);
    console.log(`  Gender:       ${nilesh.gender}`);
    console.log(`  Status:       ${nilesh.status}`);
    console.log(`  Availability: ${nilesh.availabilityStatus}`);
    console.log(`  Grades:       ${JSON.stringify(nilesh.grades)}`);
    console.log(`  Subjects:     ${JSON.stringify(nilesh.subjects)}`);

    // 2. Fetch a lead with odooLeadId = 457
    let lead = await ParentEnquiry.findOne({ odooLeadId: 457 });
    if (!lead) {
      lead = await ParentEnquiry.findOne({ odooLeadId: { $ne: null } });
    }

    if (!lead) {
      console.log("❌ No lead with odooLeadId found in MongoDB.");
      return;
    }

    // Modify the lead to match Nilesh Kumar's new criteria perfectly AND set gender preference to Flexible
    lead.city = "Bangalore";
    lead.pincode = "560037"; 
    lead.area = "Spice garden";
    lead.grade = "Class 9";
    lead.subject = "Mathematics";
    lead.preferredGender = "Flexible"; // Set to Flexible so Nilesh matches!
    
    // Ensure lead has a classGrade inside wards array (since buildParamsFromLead reads it there)
    lead.wards = [{
      studentName: "Test Student",
      classGrade: "Class 9-10 (Secondary)",
      curriculum: "CBSE",
      subjectsNeeded: ["Mathematics"]
    }];

    await lead.save();

    console.log(`\nModified Lead to match Nilesh Kumar perfectly:`);
    console.log(`  Requirement ID: ${lead.requirementId}`);
    console.log(`  Odoo Lead ID:   ${lead.odooLeadId}`);
    console.log(`  City:           ${lead.city}`);
    console.log(`  Pincode:        ${lead.pincode}`);
    console.log(`  Grade:          ${lead.grade}`);
    console.log(`  Subject:        ${lead.subject}`);
    console.log(`  Pref Gender:    ${lead.preferredGender}`);

    // 3. Run Recommendation Engine
    console.log("\nRunning recommendation engine...");
    const parsedAddr      = parseAddress(lead.address || "");
    const params          = buildParamsFromLead(lead, parsedAddr);
    const recommendations = await getRecommendations(params);

    console.log("\nRecommendation Results (Tutor Codes per tier):");
    const matchedCodes = [];
    
    const tiers = ["exact", "nearby", "city", "backup"];
    for (const tier of tiers) {
      const list = recommendations[tier] || [];
      const codes = list.map(t => `${t.name} (${t.tutorCode})`);
      console.log(`  ${tier}: ${JSON.stringify(codes)}`);
      list.forEach(t => {
        if (t.tutorCode === "TUT-001") {
          matchedCodes.push(tier);
        }
      });
    }

    if (matchedCodes.length > 0) {
      console.log(`\n✅ SUCCESS: Nilesh Kumar (TUT-001) matched in the following tiers: ${matchedCodes.join(", ")}`);
    } else {
      console.log(`\n❌ FAILED: Nilesh Kumar (TUT-001) was not matched in any tier.`);
    }

  } catch (err) {
    console.error("Error during verification:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

run();

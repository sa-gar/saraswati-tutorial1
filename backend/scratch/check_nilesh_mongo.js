import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Tutor from "../models/Tutor.js";
import ParentEnquiry from "../models/ParentEnquiry.js";
import { buildCentralizedQuery } from "../utils/matchingEngine.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const nilesh = await Tutor.findOne({ tutorCode: "TUT-001" }).lean();
    console.log("Nilesh Kumar in Mongo:", JSON.stringify(nilesh, null, 2));

    const lead = await ParentEnquiry.findOne({ odooLeadId: 457 }).lean();
    console.log("Lead in Mongo:", JSON.stringify(lead, null, 2));

    const firstWard = lead.wards?.[0] || {};
    const params = {
      pincode:   lead.pincode || "",
      area:      lead.area || "",
      locality:  "",
      landmark:  "",
      city:      lead.city || "",
      district:  "",
      state:     "",
      grade:     firstWard.classGrade || "",
      board:     firstWard.curriculum || "",
      subjects:  firstWard.subjectsNeeded || [],
      timing:    "",
      gender:    lead.preferredGender || "No Preference",
      latitude:  null,
      longitude: null,
    };

    console.log("Params:", JSON.stringify(params, null, 2));

    const query = buildCentralizedQuery(params);
    console.log("Query:", JSON.stringify(query, null, 2));

    const matchedTutors = await Tutor.find(query).lean();
    console.log("Matched Tutors count:", matchedTutors.length);
    matchedTutors.forEach(t => {
      console.log(`  - name="${t.name}" tutorCode="${t.tutorCode}" status="${t.status}" availability="${t.availabilityStatus}"`);
    });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

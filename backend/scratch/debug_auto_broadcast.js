import mongoose from "mongoose";
import dotenv from "dotenv";
import Tutor from "../models/Tutor.js";
import ParentEnquiry from "../models/ParentEnquiry.js";
import BroadcastLog from "../models/BroadcastLog.js";
import { buildCentralizedQuery, calculateTutorScore, parseAddress } from "../utils/matchingEngine.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/saraswati-tutorial";

async function runTests() {
  await mongoose.connect(MONGO_URI);

  const parentLead = await ParentEnquiry.findOne({ email: "test-broadcast-parent@gmail.com" });
  if (!parentLead) {
    console.log("No test parent lead found. Please run the seed first.");
    await mongoose.disconnect();
    return;
  }

  const parsedAddr = parseAddress(parentLead.address);
  const params = {
    pincode: parentLead.pincode || parsedAddr.pincode || "",
    area: parentLead.area || parsedAddr.area || "",
    locality: parentLead.locality || parsedAddr.locality || "",
    landmark: parentLead.landmark || parsedAddr.landmark || "",
    city: parentLead.city || parsedAddr.city || parentLead.geoInfo?.city || "",
    district: parentLead.district || parsedAddr.district || "",
    state: parentLead.state || parsedAddr.state || parentLead.geoInfo?.region || "",
    grade: parentLead.wards?.[0]?.classGrade || "",
    timing: parentLead.preferredTime || "",
    gender: parentLead.preferredGender || "No Preference"
  };

  console.log("Match parameters:", params);

  const query = buildCentralizedQuery(params);
  const tutors = await Tutor.find(query);
  console.log(`Query returned ${tutors.length} tutors.`);

  const scoredTutors = tutors
    .map(t => {
      const res = calculateTutorScore(params, t);
      return {
        name: t.name,
        area: t.area,
        pincode: t.pincode,
        percentage: res.percentage,
        locationScore: res.locationScore,
        category: res.matchCategory,
        details: res
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  console.log("\nAll candidate scores:");
  scoredTutors.forEach((t, idx) => {
    console.log(`#${idx + 1}: ${t.name} (Phone: ${t.pincode}/${t.area}) Match: ${t.percentage}%, Location: ${t.locationScore}, Category: ${t.category}`);
  });

  await mongoose.disconnect();
}

runTests().catch(console.error);

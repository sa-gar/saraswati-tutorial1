import mongoose from "mongoose";
import dotenv from "dotenv";
import Tutor from "../models/Tutor.js";
import { calculateTutorScore, buildCentralizedQuery } from "../utils/matchingEngine.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/saraswati-tutorial";

async function runTests() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected successfully!");

  // Clean old test tutors
  await Tutor.deleteMany({ email: /test-tutor-matching/ });

  // Create test dataset
  const testTutors = [
    {
      name: "Tutor 1 (Exact Area Exact Pincode)",
      email: "test-tutor-matching-1@saraswati.com",
      phone: "1111111111",
      gender: "Female",
      city: "Bengaluru",
      area: "Whitefield",
      pincode: "560066",
      fullAddress: "123 Main Road, Whitefield, Bengaluru",
      locations: ["Whitefield", "Hoodi"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["5-6 PM", "6-7 PM"],
      status: "approved"
    },
    {
      name: "Tutor 2 (Kadugodi Same Pincode, Diff Area)",
      email: "test-tutor-matching-2@saraswati.com",
      phone: "2222222222",
      gender: "Female",
      city: "Bengaluru",
      area: "Kadugodi",
      pincode: "560066",
      fullAddress: "456 Kadugodi Road, Bengaluru",
      locations: ["Kadugodi"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["8-9 AM", "9-10 AM"],
      status: "approved"
    },
    {
      name: "Tutor 3 (White Field - Space Fuzzy Match)",
      email: "test-tutor-matching-3@saraswati.com",
      phone: "3333333333",
      gender: "Male",
      city: "Bangalore", // Bangalore synonym test
      area: "White Field", // space difference
      pincode: "560099",
      fullAddress: "789 White Field, Bangalore",
      locations: ["White Field"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["5-6 PM"],
      status: "approved"
    },
    {
      name: "Tutor 4 (Whitefeild - Typo Fuzzy Match)",
      email: "test-tutor-matching-4@saraswati.com",
      phone: "4444444444",
      gender: "Female",
      city: "Bengaluru",
      area: "Whitefeild", // Typo
      pincode: "560099",
      fullAddress: "123 Whitefeild, Bengaluru",
      locations: ["Whitefeild"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["5-6 PM"],
      status: "approved"
    },
    {
      name: "Tutor 5 (Whitefield Female Morning - Primary Grade)",
      email: "test-tutor-matching-5@saraswati.com",
      phone: "5555555555",
      gender: "Female",
      city: "Bengaluru",
      area: "Whitefield",
      pincode: "560066",
      fullAddress: "123 Main Road, Whitefield, Bengaluru",
      locations: ["Whitefield"],
      grades: ["Class 1-5 (Primary)"], // Primary Grade, should be excluded for Grade 8
      timings: ["8-9 AM"],
      status: "approved"
    }
  ];

  console.log("Seeding test tutors...");
  await Tutor.insertMany(testTutors);
  console.log("Seeding completed!");

  // Parent Enquiry Parameters
  const params = {
    pincode: "560066",
    area: "Whitefield",
    city: "Bangalore", // Test synonym match with "Bengaluru"
    grade: "Grade 8",
    timing: "Evening",
    gender: "Female"
  };

  console.log("\n--- TEST CASE: INTEGRATED RECOMMENDATION & SCORING ---");
  console.log("Parent Requirements:", params);

  const query = buildCentralizedQuery(params);
  const candidates = await Tutor.find(query);
  
  console.log(`Found ${candidates.length} candidates after database-level filters (status approved, grade Middle/Class 8, gender Female).`);
  console.log("Note: Tutor 3 (Male) and Tutor 5 (Primary Grade) should be strictly filtered out by DB query.");
  
  // Calculate scores and sort
  const scored = candidates.map(tutor => {
    const res = calculateTutorScore(params, tutor);
    return {
      name: tutor.name,
      area: tutor.area,
      pincode: tutor.pincode,
      city: tutor.city,
      score: res.score,
      maxPossibleScore: res.maxPossibleScore,
      percentage: res.percentage,
      locationScore: res.locationScore
    };
  })
  .filter(tutor => {
    const hasLocationCriteria = !!(
      params.pincode ||
      params.area ||
      params.locality ||
      params.landmark ||
      params.city ||
      params.district ||
      params.state
    );
    if (hasLocationCriteria && tutor.locationScore === 0) {
      return false;
    }
    return tutor.percentage > 0;
  })
  .sort((a, b) => b.percentage - a.percentage);

  console.log("\nScored & Sorted Results:");
  scored.forEach((t, idx) => {
    console.log(`${idx + 1}. ${t.name}: Match = ${t.percentage}% (Score: ${t.score}/${t.maxPossibleScore}), LocationScore: ${t.locationScore}`);
  });

  // Assertions
  console.log("\n--- ASSERTIONS ---");
  
  // 1. Tutor 5 should not be in the candidates (primary class only)
  const hasTutor5 = candidates.some(c => c.name.includes("Tutor 5"));
  console.log(`Assertion 1 (Exclude wrong grade - Tutor 5): ${!hasTutor5 ? "PASSED" : "FAILED"}`);

  // 2. Tutor 3 should not be in candidates (Male gender requested Female)
  const hasTutor3 = candidates.some(c => c.name.includes("Tutor 3"));
  console.log(`Assertion 2 (Strict Gender Match - Tutor 3): ${!hasTutor3 ? "PASSED" : "FAILED"}`);

  // 3. Tutor 1 should have highest score (Exact Pincode, Exact Area, Same City, Correct Grade, Correct Timing, Preferred Gender)
  // Max possible: Pincode(40) + Area(25) + City(10) + Grade(20) + Timing(15) + Gender(10) = 120
  // Tutor 1 matches all: 40 + 25 + 10 + 20 + 15 + 10 = 120 (100%)
  const t1 = scored.find(s => s.name.includes("Tutor 1"));
  console.log(`Assertion 3 (Tutor 1 Full Match score): ${t1 && t1.percentage === 100 ? "PASSED" : "FAILED"} (${t1?.percentage}%)`);

  // 4. Tutor 2 matches Pincode (40), City (10), Grade (20), but not Area and not Timing (Morning)
  // Tutor 2 score: 40 (Pincode) + 10 (City) + 20 (Grade) + 10 (Gender) = 80 / 120 = 67%
  const t2 = scored.find(s => s.name.includes("Tutor 2"));
  console.log(`Assertion 4 (Tutor 2 Pincode priority score): ${t2 && t2.percentage === 67 ? "PASSED" : "FAILED"} (${t2?.percentage}%)`);

  // 5. Test spelling tolerance and synonym directly
  const testTutor4 = testTutors[3]; // Whitefeild
  const scoreInfo4 = calculateTutorScore(params, testTutor4);
  // Max possible: Pincode(40) + Area(25) + City(10) + Grade(20) + Timing(15) + Gender(10) = 120
  // Tutor 4 matches: Area fuzzy (20) + City (10) + Grade (20) + Timing (15) + Gender (10) = 75 / 120 = 63%
  console.log(`Assertion 5 (Tutor 4 Spelling mistake matching): ${scoreInfo4.percentage === 63 ? "PASSED" : "FAILED"} (${scoreInfo4.percentage}%)`);

  // Clean up
  await Tutor.deleteMany({ email: /test-tutor-matching/ });
  await mongoose.disconnect();
  console.log("\nDisconnected from MongoDB. Tests finished!");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

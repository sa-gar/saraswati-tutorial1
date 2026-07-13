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

  // Create test dataset matching priority groups
  const testTutors = [
    {
      name: "Tutor 1 (Exact Pincode + Exact Area)",
      email: "test-tutor-matching-1@saraswati.com",
      phone: "1111111111",
      gender: "Female",
      city: "Bengaluru",
      area: "Whitefield",
      pincode: "560066",
      fullAddress: "123 Main Road, Whitefield, Bengaluru",
      locations: ["Whitefield"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["5-6 PM"],
      status: "approved",
      availabilityStatus: "Available"
    },
    {
      name: "Tutor 8 (Exact Pincode + Similar Area)",
      email: "test-tutor-matching-8@saraswati.com",
      phone: "8888888888",
      gender: "Female",
      city: "Bengaluru",
      area: "Whitefield Main Road",
      pincode: "560066",
      fullAddress: "123 Whitefield Main Road, Bengaluru",
      locations: ["Whitefield Main Road"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["5-6 PM"],
      status: "approved",
      availabilityStatus: "Available"
    },
    {
      name: "Tutor 4 (Same Area / Similar Area, Diff Pincode)",
      email: "test-tutor-matching-4@saraswati.com",
      phone: "4444444444",
      gender: "Female",
      city: "Bengaluru",
      area: "Whitefeild", // Typo area
      pincode: "560099", // Different pincode
      fullAddress: "123 Whitefeild, Bengaluru",
      locations: ["Whitefeild"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["5-6 PM"],
      status: "approved",
      availabilityStatus: "Available"
    },
    {
      name: "Tutor 2 (Same Pincode, Diff Area)",
      email: "test-tutor-matching-2@saraswati.com",
      phone: "2222222222",
      gender: "Female",
      city: "Bengaluru",
      area: "Hoodi", // Different area
      pincode: "560066", // Same pincode
      fullAddress: "456 Hoodi Road, Bengaluru",
      locations: ["Hoodi"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["5-6 PM"],
      status: "approved",
      availabilityStatus: "Available"
    },
    {
      name: "Tutor 3 (Nearby Pincode, Diff Area)",
      email: "test-tutor-matching-3@saraswati.com",
      phone: "3333333333",
      gender: "Female",
      city: "Bengaluru",
      area: "Kadugodi",
      pincode: "560067", // Adjacent pincode (560067 is diff of 1 from 560066)
      fullAddress: "789 Kadugodi, Bengaluru",
      locations: ["Kadugodi"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["5-6 PM"],
      status: "approved",
      availabilityStatus: "Available"
    },
    {
      name: "Tutor 7 (Same City Match Only)",
      email: "test-tutor-matching-7@saraswati.com",
      phone: "7777777777",
      gender: "Female",
      city: "Bangalore", // Synonym test
      area: "HSR Layout",
      pincode: "560102",
      fullAddress: "123 HSR Layout, Bangalore",
      locations: ["HSR Layout"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["5-6 PM"],
      status: "approved",
      availabilityStatus: "Available"
    },
    {
      name: "Tutor 5 (Wrong Grade)",
      email: "test-tutor-matching-5@saraswati.com",
      phone: "5555555555",
      gender: "Female",
      city: "Bengaluru",
      area: "Whitefield",
      pincode: "560066",
      grades: ["Class 1-5 (Primary)"],
      status: "approved",
      availabilityStatus: "Available"
    },
    {
      name: "Tutor 6 (Wrong Gender)",
      email: "test-tutor-matching-6@saraswati.com",
      phone: "6666666666",
      gender: "Male",
      city: "Bengaluru",
      area: "Whitefield",
      pincode: "560066",
      grades: ["Class 6-8 (Middle)"],
      status: "approved",
      availabilityStatus: "Available"
    }
  ];

  console.log("Seeding test tutors...");
  await Tutor.insertMany(testTutors);
  console.log("Seeding completed!");

  // Parent Enquiry Requirements
  const params = {
    pincode: "560066",
    area: "Whitefield",
    city: "Bangalore",
    grade: "Grade 8",
    timing: "Evening",
    gender: "Female"
  };

  console.log("\n--- TEST CASE: NEAREST LOCATION PRIORITIZATION ---");
  console.log("Parent Requirements:", params);

  const query = buildCentralizedQuery(params);
  const candidates = await Tutor.find(query);
  
  // Calculate scores and filter/rank like backend
  const scored = candidates
    .map(tutor => {
      const res = calculateTutorScore(params, tutor);
      return {
        name: tutor.name,
        area: tutor.area,
        pincode: tutor.pincode,
        score: res.score,
        percentage: res.percentage,
        locationScore: res.locationScore,
        category: res.matchCategory
      };
    })
    .filter(tutor => {
      // Exclude location score 0
      return tutor.locationScore > 0 && tutor.percentage > 0;
    })
    .sort((a, b) => b.percentage - a.percentage);

  console.log("\nScored & Ranked Results (Expected Priority Order 1-8-4-2-3-7):");
  scored.forEach((t, idx) => {
    console.log(`#${idx + 1} - ${t.name}: Match = ${t.percentage}% (Location Score: ${t.locationScore}), Category: ${t.category}`);
  });

  // Assertions
  console.log("\n--- ASSERTIONS ---");
  
  // Exclusions check
  const hasWrongGrade = scored.some(s => s.name.includes("Wrong Grade"));
  console.log(`Assertion 1 (Exclude wrong grade): ${!hasWrongGrade ? "PASSED" : "FAILED"}`);

  const hasWrongGender = scored.some(s => s.name.includes("Wrong Gender"));
  console.log(`Assertion 2 (Exclude wrong gender): ${!hasWrongGender ? "PASSED" : "FAILED"}`);

  // Rank Order check (Tutor 1 -> Tutor 8 -> Tutor 4 -> Tutor 2 -> Tutor 3 -> Tutor 7)
  const order = scored.map(s => s.name.match(/Tutor \d+/)?.[0]).filter(Boolean);
  const expectedOrder = ["Tutor 1", "Tutor 8", "Tutor 4", "Tutor 2", "Tutor 3", "Tutor 7"];
  
  let orderPassed = true;
  for (let i = 0; i < expectedOrder.length; i++) {
    if (order[i] !== expectedOrder[i]) {
      orderPassed = false;
      console.log(`Rank mismatch at index ${i}: expected ${expectedOrder[i]}, got ${order[i]}`);
    }
  }
  console.log(`Assertion 3 (Strict Priority Ordering): ${orderPassed ? "PASSED" : "FAILED"}`);

  // Category labels check
  const t1 = scored.find(s => s.name.includes("Tutor 1"));
  console.log(`Assertion 4 (Tutor 1 Closest & Best Match): ${t1 && t1.category === "Closest & Best Match" ? "PASSED" : "FAILED"} (${t1?.category})`);

  const t8 = scored.find(s => s.name.includes("Tutor 8"));
  console.log(`Assertion 5 (Tutor 8 Closest & Best Match): ${t8 && t8.category === "Closest & Best Match" ? "PASSED" : "FAILED"} (${t8?.category})`);

  const t4 = scored.find(s => s.name.includes("Tutor 4"));
  console.log(`Assertion 6 (Tutor 4 Closest Match): ${t4 && t4.category === "Closest Match" ? "PASSED" : "FAILED"} (${t4?.category})`);

  const t2 = scored.find(s => s.name.includes("Tutor 2"));
  console.log(`Assertion 7 (Tutor 2 Closest Match): ${t2 && t2.category === "Closest Match" ? "PASSED" : "FAILED"} (${t2?.category})`);

  const t3 = scored.find(s => s.name.includes("Tutor 3"));
  console.log(`Assertion 8 (Tutor 3 Nearby Match): ${t3 && t3.category === "Nearby Match" ? "PASSED" : "FAILED"} (${t3?.category})`);

  const t7 = scored.find(s => s.name.includes("Tutor 7"));
  console.log(`Assertion 9 (Tutor 7 Same City Match): ${t7 && t7.category === "Same City Match" ? "PASSED" : "FAILED"} (${t7?.category})`);

  // Clean up
  await Tutor.deleteMany({ email: /test-tutor-matching/ });
  await mongoose.disconnect();
  console.log("\nDisconnected from MongoDB. Tests finished!");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

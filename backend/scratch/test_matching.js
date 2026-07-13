import mongoose from "mongoose";
import dotenv from "dotenv";
import Tutor from "../models/Tutor.js";
import { buildCentralizedQuery } from "../utils/matchingEngine.js";

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
      name: "Tutor 1 (Whitefield Female Evening)",
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
      name: "Tutor 2 (Kadugodi Female Morning)",
      email: "test-tutor-matching-2@saraswati.com",
      phone: "2222222222",
      gender: "Female",
      city: "Bengaluru",
      area: "Kadugodi",
      pincode: "560066", // Same pincode as Whitefield
      fullAddress: "456 Kadugodi Road, Bengaluru",
      locations: ["Kadugodi"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["8-9 AM", "9-10 AM"],
      status: "approved"
    },
    {
      name: "Tutor 3 (HSR Layout Female Evening)",
      email: "test-tutor-matching-3@saraswati.com",
      phone: "3333333333",
      gender: "Female",
      city: "Bengaluru",
      area: "HSR Layout",
      pincode: "560102",
      fullAddress: "789 HSR Layout, Bengaluru",
      locations: ["HSR Layout"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["5-6 PM", "6-7 PM"],
      status: "approved"
    },
    {
      name: "Tutor 4 (Whitefield Male Evening)",
      email: "test-tutor-matching-4@saraswati.com",
      phone: "4444444444",
      gender: "Male",
      city: "Bengaluru",
      area: "Whitefield",
      pincode: "560066",
      fullAddress: "123 Main Road, Whitefield, Bengaluru",
      locations: ["Whitefield"],
      grades: ["Class 6-8 (Middle)"],
      timings: ["5-6 PM", "6-7 PM"],
      status: "approved"
    },
    {
      name: "Tutor 5 (Whitefield Female Morning - Primary)",
      email: "test-tutor-matching-5@saraswati.com",
      phone: "5555555555",
      gender: "Female",
      city: "Bengaluru",
      area: "Whitefield",
      pincode: "560066",
      fullAddress: "123 Main Road, Whitefield, Bengaluru",
      locations: ["Whitefield"],
      grades: ["Class 1-5 (Primary)"],
      timings: ["8-9 AM"],
      status: "approved"
    }
  ];

  console.log("Seeding test tutors...");
  await Tutor.insertMany(testTutors);
  console.log("Seeding completed!");

  // Test Case 1: STRICT AND (Location: Whitefield, Grade: 8, Timing: Evening, Gender: Female)
  // Expecting: Tutor 1 only (since Tutor 4 is Male, Tutor 5 is Grade 1-5 Primary, Tutor 2 is Morning, Tutor 3 is HSR Layout)
  const params1 = {
    pincode: "560066",
    area: "Whitefield",
    city: "Bengaluru",
    grade: "Grade 8",
    timing: "Evening",
    gender: "Female"
  };
  const query1 = buildCentralizedQuery(params1);
  const res1 = await Tutor.find(query1);
  console.log("\n--- TEST CASE 1: STRICT ALL-FILTER MATCH ---");
  console.log(`Expected: 1 tutor ("Tutor 1")`);
  console.log(`Got: ${res1.length} tutors:`, res1.map(t => t.name));

  // Test Case 2: Pincode priority matching (Nearby areas under same pincode)
  // Parent Area: Whitefield, Pincode: 560066, Grade: 8, Timing: Morning, Gender: Female
  // Expecting: Tutor 2 (Kadugodi) and Tutor 5 (Primary? Wait! Tutor 5 is Grade 1-5, but parent wants Grade 8. So Tutor 5 should be excluded by grade, but Tutor 2 matches pincode 560066, Grade 8/Middle, Morning, Female!)
  const params2 = {
    pincode: "560066",
    area: "Whitefield",
    city: "Bengaluru",
    grade: "Grade 8",
    timing: "Morning",
    gender: "Female"
  };
  const query2 = buildCentralizedQuery(params2);
  const res2 = await Tutor.find(query2);
  console.log("\n--- TEST CASE 2: PINCODE NEIGHBOR MATCH ---");
  console.log(`Expected: 1 tutor ("Tutor 2 (Kadugodi)")`);
  console.log(`Got: ${res2.length} tutors:`, res2.map(t => t.name));

  // Test Case 3: Ignored gender (No Preference)
  // Location: Whitefield, Grade: 8, Timing: Evening, Gender: No Preference
  // Expecting: Tutor 1 (Female) and Tutor 4 (Male)
  const params3 = {
    pincode: "560066",
    area: "Whitefield",
    city: "Bengaluru",
    grade: "Class 8",
    timing: "Evening",
    gender: "No Preference"
  };
  const query3 = buildCentralizedQuery(params3);
  const res3 = await Tutor.find(query3);
  console.log("\n--- TEST CASE 3: IGNORED GENDER FILTER ---");
  console.log(`Expected: 2 tutors ("Tutor 1" & "Tutor 4")`);
  console.log(`Got: ${res3.length} tutors:`, res3.map(t => t.name));

  // Test Case 4: Ignore empty optional field (e.g. Empty timing)
  // Location: Whitefield, Grade: 8, Timing: "", Gender: Female
  // Expecting: Tutor 1 (Evening) and Tutor 5 (Wait, Tutor 5 is Primary, so only Tutor 1 matches)
  const params4 = {
    pincode: "560066",
    area: "Whitefield",
    city: "Bengaluru",
    grade: "8",
    timing: "",
    gender: "Female"
  };
  const query4 = buildCentralizedQuery(params4);
  const res4 = await Tutor.find(query4);
  console.log("\n--- TEST CASE 4: IGNORE EMPTY TIMING FILTER ---");
  console.log(`Expected: 1 tutor ("Tutor 1")`);
  console.log(`Got: ${res4.length} tutors:`, res4.map(t => t.name));

  // Clean up
  await Tutor.deleteMany({ email: /test-tutor-matching/ });
  await mongoose.disconnect();
  console.log("\nDisconnected from MongoDB. Tests finished!");
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});

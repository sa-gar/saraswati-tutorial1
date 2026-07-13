import mongoose from "mongoose";
import dotenv from "dotenv";
import Tutor from "../models/Tutor.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/saraswati-tutorial";

const sampleData = [
  {
    pincode: "560066",
    area: "whitefield",
    city: "Bangalore",
    gender: "Female",
    grades: ["Class 6-8 (Middle)", "Class 9-10 (Secondary)"],
    timings: ["6-7 AM", "5-6 PM", "6-7 PM"],
    locations: ["Whitefield", "Hoodi", "Kadugodi"]
  },
  {
    pincode: "560037",
    area: "marathahalli",
    city: "Bangalore",
    gender: "Female",
    grades: ["Class 1-5 (Primary)", "Class 6-8 (Middle)"],
    timings: ["8-9 AM", "10-11 AM", "5-6 PM"],
    locations: ["Marathahalli", "Brookefield"]
  },
  {
    pincode: "560102",
    area: "hsr layout",
    city: "Bangalore",
    gender: "Male",
    grades: ["Class 6-8 (Middle)", "Class 11-12 (Senior Secondary)"],
    timings: ["9-10 AM", "6-7 PM", "7-8 PM"],
    locations: ["HSR Layout", "Koramangala"]
  }
];

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");

  const tutors = await Tutor.find({ status: "approved" });
  console.log(`Found ${tutors.length} approved tutors to update`);

  // Let's also approve Nilesh Kumar so we have a male tutor in Marathahalli
  const nilesh = await Tutor.findOne({ name: "Nilesh Kumar" });
  if (nilesh) {
    nilesh.status = "approved";
    await nilesh.save();
    console.log("Approved Nilesh Kumar");
  }

  let idx = 0;
  for (const tutor of tutors) {
    // Distribute sample data evenly
    const sample = sampleData[idx % sampleData.length];
    
    tutor.pincode = sample.pincode;
    tutor.area = sample.area;
    tutor.city = sample.city;
    tutor.gender = sample.gender;
    tutor.grades = sample.grades;
    tutor.timings = sample.timings;
    tutor.locations = sample.locations;
    
    await tutor.save();
    console.log(`Updated tutor ${tutor.name} with area ${sample.area}, gender ${sample.gender}`);
    idx++;
  }

  console.log("Mock data update successfully completed!");
  await mongoose.disconnect();
}

main().catch(console.error);

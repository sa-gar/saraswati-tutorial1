import mongoose from "mongoose";
import dotenv from "dotenv";
import Tutor from "../models/Tutor.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/saraswati-tutorial";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");

  const total = await Tutor.countDocuments();
  console.log("Total Tutors in MongoDB:", total);

  const approved = await Tutor.find({ status: "approved" });
  console.log("Approved Tutors in MongoDB:", approved.length);

  const withPincode = await Tutor.find({ pincode: { $exists: true, $ne: "" } });
  console.log("Tutors with pincode:", withPincode.length);

  const withGrades = await Tutor.find({ grades: { $exists: true, $ne: [] } });
  console.log("Tutors with grades:", withGrades.length);

  const withGender = await Tutor.find({ gender: { $exists: true, $ne: "" } });
  console.log("Tutors with gender:", withGender.length);

  if (withPincode.length > 0) {
    console.log("Sample populated tutor:", JSON.stringify(withPincode[0], null, 2));
  } else {
    // Let's print some properties of all approved tutors
    console.log("All approved tutors keys:");
    approved.forEach(t => {
      console.log(`- ${t.name}: status=${t.status}, pincode=${t.pincode}, area=${t.area}, gender=${t.gender}, grades=${JSON.stringify(t.grades)}, timings=${JSON.stringify(t.timings)}`);
    });
  }

  await mongoose.disconnect();
}

main().catch(console.error);

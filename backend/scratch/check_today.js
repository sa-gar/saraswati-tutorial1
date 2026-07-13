import mongoose from "mongoose";
import dotenv from "dotenv";
import Tutor from "../models/Tutor.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/saraswati-tutorial";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");

  const tutors = await Tutor.find({ createdAt: { $gte: new Date('2026-07-12T00:00:00.000Z') } });
  console.log('TUTORS REGISTERED TODAY:', tutors.length);
  tutors.forEach(t => {
    console.log(`- ${t.name}: status=${t.status}, phone=${t.phone}, gender=${t.gender}, area=${t.area}, pincode=${t.pincode}, grades=${JSON.stringify(t.grades)}, locations=${JSON.stringify(t.locations)}, timings=${JSON.stringify(t.timings)}`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);

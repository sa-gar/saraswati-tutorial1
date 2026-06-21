import mongoose from "mongoose";
import dotenv from "dotenv";
import ParentEnquiry from "./models/ParentEnquiry.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const enquiries = await ParentEnquiry.find().sort({ createdAt: -1 }).limit(10);
    console.log(`Found ${enquiries.length} enquiries:`);
    for (const e of enquiries) {
      console.log({
        id: e._id,
        parentName: e.parentName,
        planType: e.planType,
        daysPerWeek: e.daysPerWeek,
        hoursPerDay: e.hoursPerDay,
        monthlyFees: e.monthlyFees,
        createdAt: e.createdAt,
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

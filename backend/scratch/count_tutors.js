import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/saraswati";

// Define a simple Schema for counting
const TutorSchema = new mongoose.Schema({
  status: String,
  availabilityStatus: String,
  name: String
}, { collection: "tutors" });

const Tutor = mongoose.model("TutorCount", TutorSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");
  
  const total = await Tutor.countDocuments({});
  console.log(`Total tutors in database: ${total}`);

  const statuses = await Tutor.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  console.log("Grouped by status:");
  console.log(statuses);

  const availability = await Tutor.aggregate([
    { $group: { _id: "$availabilityStatus", count: { $sum: 1 } } }
  ]);
  console.log("Grouped by availabilityStatus:");
  console.log(availability);

  // Check some sample records
  const samples = await Tutor.find({}).limit(5).lean();
  console.log("Sample tutors:", samples);

  await mongoose.disconnect();
}

run().catch(console.error);

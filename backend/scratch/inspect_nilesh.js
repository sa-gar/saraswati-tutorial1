import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/saraswati";

const TutorSchema = new mongoose.Schema({
  name: String,
  whatsapp: String,
  phone: String,
  status: String,
  onboardingCompleted: Boolean,
  email: String
}, { collection: "tutors" });

const Tutor = mongoose.model("TutorInspect", TutorSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");
  
  const tutors = await Tutor.find({ name: /Nilesh/i }).lean();
  console.log("Tutors with name 'Nilesh':", tutors);

  await mongoose.disconnect();
}

run().catch(console.error);

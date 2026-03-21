import mongoose from "mongoose";

const tutorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    qualification: { type: String, default: "" },
    subject: { type: String, required: true },
    expertise: { type: [String], default: [] },
    mode: { type: String, default: "Online & Offline" },
    location: { type: String, default: "" },
    price: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    verified: { type: Boolean, default: true },
    experience: { type: String, default: "" },
    occupation: { type: String, default: "" },
    tagline: { type: String, default: "" },
    languages: { type: [String], default: [] },
    category: { type: String, default: "Academic Tutors" },
    students: { type: Number, default: 0 },
    responseTime: { type: String, default: "30 mins" },
    availability: { type: [String], default: [] },
    about: { type: String, default: "" },
    photo: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Tutor", tutorSchema);

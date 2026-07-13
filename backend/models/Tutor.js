import mongoose from "mongoose";

const tutorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    qualification: { type: String, default: "" },
    subject: { type: String, default: "" },
    expertise: { type: [String], default: [] },
    mode: { type: String, default: "Online & Offline" },
    location: { type: String, default: "" },
    price: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    experience: { type: String, default: "" },
    occupation: { type: String, default: "" },
    tagline: { type: String, default: "" },
    languages: { type: [String], default: [] },
    category: { type: String, default: "Academic Tutors" },
    students: { type: Number, default: 0 },
    responseTime: { type: String, default: "30 mins" },
    availability: { type: [String], default: [] },
    about: { type: String, default: "" },
    photo: { type: String, default: "" },
    hasOccupation: { type: String, enum: ["yes", "no"], default: "no" },

    locations: { type: [String], default: [] },

    hasVehicle: { type: String, enum: ["yes", "no"], default: "no" },
    vehicleNumber: { type: String, default: "" },

    documents: {
      idProof: { type: String, default: "" },
      expCert: { type: String, default: "" },
      otherDoc: { type: String, default: "" }
    },

    timings: { type: [String], default: [] },

    agreement: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    adminComment: { type: String, default: "" },

    gender: { type: String, default: "" },
    dob: { type: String, default: "" },
    whatsapp: { type: String, default: "", trim: true },
    city: { type: String, default: "" },
    area: { type: String, default: "" },
    fullAddress: { type: String, default: "" },
    pincode: { type: String, default: "" },
    grades: { type: [String], default: [] },
    boards: { type: [String], default: [] },
    subjects: { type: [String], default: [] },
    maxTravelDistance: { type: String, default: "" },
    availabilityStatus: {
      type: String,
      enum: ["Available", "Busy", "Inactive", "Archived"],
      default: "Available"
    },

    odooLeadId: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  { timestamps: true }
);

// Indexing for scalability and performance
tutorSchema.index({ name: 1 });
tutorSchema.index({ status: 1 });
tutorSchema.index({ phone: 1 });
tutorSchema.index({ grades: 1 });
tutorSchema.index({ locations: 1 });
tutorSchema.index({ gender: 1 });
tutorSchema.index({ timings: 1 });
tutorSchema.index({ pincode: 1 });
tutorSchema.index({ area: 1 });
tutorSchema.index({ city: 1 });

export default mongoose.model("Tutor", tutorSchema);

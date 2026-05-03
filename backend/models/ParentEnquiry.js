import mongoose from "mongoose";

const wardSchema = new mongoose.Schema(
  {
    wardName: { type: String, required: true, trim: true },
    schoolName: { type: String, default: "", trim: true },
    classGrade: { type: String, required: true, trim: true },
curriculum: { type: String, default: "", trim: true },
   subjectsNeeded: {
  type: [String],   // ✅ array of strings
  required: true,
  default: []
},
    currentPerformance: { type: String, default: "", trim: true },
    specialNeeds: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const parentEnquirySchema = new mongoose.Schema(
  {
      
    parentName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },

    occupation: { type: String, default: "", trim: true },
    occupationType: { type: String, default: "", trim: true },

    area: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },

    preferredMode: { type: String, default: "", trim: true },
    preferredGender: { type: String, default: "", trim: true },
    preferredDays: { type: [String], default: [] },
    preferredTime: { type: String, default: "", trim: true },

    wards: {
      type: [wardSchema],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one ward is required",
      },
      required: true,
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Assigned", "Closed"],
      default: "New",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ParentEnquiry", parentEnquirySchema);
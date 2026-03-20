import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    parentName: { type: String, required: true, trim: true },
    studentName: { type: String, default: "", trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    subjectNeeded: { type: String, default: "" },
    message: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Enquiry", enquirySchema);
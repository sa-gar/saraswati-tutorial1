import mongoose from "mongoose";

const wardSchema = new mongoose.Schema({
  fullName: String,
  classGrade: String,
  board: String,
  subjectsNeeded: String,
  currentPerformance: String,
  specialNeeds: String,
});

const parentEnquirySchema = new mongoose.Schema(
  {
    parentName: String,
    relationshipToWard: String,
    phone: String,
    email: String,
    addressLine1: String,
    area: String,
    city: String,
    pincode: String,
    preferredMode: String,
    monthlyBudget: String,
    wards: [wardSchema],
  },
  { timestamps: true }
);

export default mongoose.model("ParentEnquiry", parentEnquirySchema);
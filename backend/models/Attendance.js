import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    parentEnquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParentEnquiry",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    requirementId: {
      type: String,
      required: true,
      trim: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },
    tutorName: {
      type: String,
      required: true,
      trim: true,
    },
    packageCycle: {
      type: Number,
      default: 1,
    },
    sessionNumber: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["Done", "Missed"],
      required: true,
    },
    topicsCovered: {
      type: String,
      default: "",
    },
    missedReason: {
      type: String,
      default: "",
    },
    customReason: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for fast querying & uniqueness
attendanceSchema.index({ parentEnquiryId: 1, packageCycle: 1, date: 1, status: 1 });
attendanceSchema.index({ parentEnquiryId: 1, packageCycle: 1, sessionNumber: 1 });
attendanceSchema.index({ tutorId: 1 });

export default mongoose.model("Attendance", attendanceSchema);

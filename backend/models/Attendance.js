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

// Indexes for fast querying
attendanceSchema.index({ parentEnquiryId: 1 });
attendanceSchema.index({ tutorId: 1 });
attendanceSchema.index({ date: 1 });

export default mongoose.model("Attendance", attendanceSchema);

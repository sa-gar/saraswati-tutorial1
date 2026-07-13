import mongoose from "mongoose";

const broadcastLogSchema = new mongoose.Schema(
  {
    time: {
      type: Date,
      default: Date.now,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },
    tutorName: {
      type: String,
      required: true,
    },
    tutorPhone: {
      type: String,
      default: "",
    },
    requirementId: {
      type: String,
      required: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParentEnquiry",
      required: true,
    },
    type: {
      type: String,
      enum: ["whatsapp", "email"],
      default: "whatsapp",
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Sent", "Delivered", "Failed"],
      default: "Sent",
    },
    responseStatus: {
      type: String,
      enum: ["Interested", "Not Interested", "No Response", "Follow-up Required", "Busy", "Pending"],
      default: "No Response",
    },
  },
  { timestamps: true }
);

// Indexing for scalability and performance
broadcastLogSchema.index({ tutorId: 1 });
broadcastLogSchema.index({ leadId: 1 });
broadcastLogSchema.index({ requirementId: 1 });
broadcastLogSchema.index({ responseStatus: 1 });

export default mongoose.model("BroadcastLog", broadcastLogSchema);

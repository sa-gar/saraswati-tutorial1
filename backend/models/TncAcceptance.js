import mongoose from "mongoose";

const tncAcceptanceSchema = new mongoose.Schema(
  {
    // Action taken by the visitor
    action: {
      type: String,
      enum: ["accepted", "dismissed"],
      required: true,
    },

    // Optional contact info — pre-filled if parent came from a link
    name: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // Tracking metadata
    ipAddress: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },

    referrer: {
      type: String,
      default: "",
    },

    // Which page / version of T&C they accepted
    pageVersion: {
      type: String,
      default: "v1",
    },

    source: {
      type: String,
      default: "tnc-page", // e.g. "tnc-page", "terms-conditions"
    },
  },
  { timestamps: true }
);

tncAcceptanceSchema.index({ action: 1 });
tncAcceptanceSchema.index({ createdAt: -1 });
tncAcceptanceSchema.index({ phone: 1 });

export default mongoose.model("TncAcceptance", tncAcceptanceSchema);

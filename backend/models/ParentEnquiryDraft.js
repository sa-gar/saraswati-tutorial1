import mongoose from "mongoose";

const parentEnquiryDraftSchema = new mongoose.Schema(
  {
    emailOrPhone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    stepReached: {
      type: Number,
      default: 1,
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    geoInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: "",
    },
    visitor_id: {
      type: String,
      default: "",
    },
    session_id: {
      type: String,
      default: "",
    },
    utm_source: {
      type: String,
      default: "",
    },
    utm_medium: {
      type: String,
      default: "",
    },
    utm_campaign: {
      type: String,
      default: "",
    },
    utm_content: {
      type: String,
      default: "",
    },
    utm_term: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ParentEnquiryDraft", parentEnquiryDraftSchema);

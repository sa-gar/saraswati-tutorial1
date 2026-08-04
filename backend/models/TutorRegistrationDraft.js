import mongoose from "mongoose";

const tutorRegistrationDraftSchema = new mongoose.Schema(
  {
    // Primary key: tutor's phone number (must be entered on step 1)
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    // Current step the tutor reached before leaving
    stepReached: {
      type: Number,
      default: 1,
    },
    // All serializable form fields (File objects excluded — stored via Cloudinary URLs)
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Whether WhatsApp == Mobile is checked
    sameAsMobile: {
      type: Boolean,
      default: true,
    },
    // Geo & session analytics (mirrors ParentEnquiryDraft)
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
  },
  { timestamps: true }
);

// TTL index: auto-delete drafts that haven't been updated in 30 days
tutorRegistrationDraftSchema.index(
  { updatedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

export default mongoose.model("TutorRegistrationDraft", tutorRegistrationDraftSchema);

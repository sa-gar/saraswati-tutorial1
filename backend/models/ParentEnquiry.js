import mongoose from "mongoose";

const wardSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    schoolName: {
      type: String,
      required: true,
      trim: true,
    },

    classGrade: {
      type: String,
      required: true,
      trim: true,
    },

    curriculum: {
      type: String,
      required: true,
      trim: true,
    },

    subjectsNeeded: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one subject is required",
      },
    },

    currentPerformance: {
      type: String,
      default: "",
      trim: true,
    },

    specialNeeds: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const parentEnquirySchema = new mongoose.Schema(
  {
    parentName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },


    address: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String,
      default: "",
      trim: true,
    },

    endTime: {
      type: String,
      default: "",
      trim: true,
    },

    preferredMode: {
      type: String,
      required: true,
      trim: true,
    },

    preferredGender: {
      type: String,
      required: true,
      trim: true,
    },

    preferredDays: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one preferred day is required",
      },
    },

    preferredTime: {
      type: String,
      required: true,
      trim: true,
    },

    classDuration: {
      type: String,
      default: "",
      trim: true,
    },

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

    planType: {
      type: String,
      default: "",
      trim: true,
    },

    daysPerWeek: {
      type: Number,
      default: null,
    },

    hoursPerDay: {
      type: Number,
      default: null,
    },

    monthlyFees: {
      type: Number,
      default: null,
    },

    odooLeadId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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

    status: {
      type: String,
      enum: [
        "New Lead",
        "Fees Finalized",
        "Demo Scheduled",
        "Feedback Pending",
        "Won",
        "Lost",
      ],
      default: "New Lead",
    },

    adminNotes: {
      type: String,
      default: "",
    },

    nextFollowUpDate: {
      type: String,
      default: "",
    },

    assignedTutor: {
      type: String,
      default: "",
    },

    demoDate: {
      type: String,
      default: "",
    },

    demoTime: {
      type: String,
      default: "",
    },

    feesFinalized: {
      type: Boolean,
      default: false,
    },

    finalFees: {
      type: Number,
      default: null,
    },

    lostReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Synchronized Schema
export default mongoose.model("ParentEnquiry", parentEnquirySchema);
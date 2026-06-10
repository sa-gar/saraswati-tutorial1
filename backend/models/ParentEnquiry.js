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

    occupation: {
      type: String,
      required: true,
      trim: true,
    },

    occupationType: {
      type: String,
      default: "",
      trim: true,
    },

    // Dynamic occupation fields
    businessName: {
      type: String,
      default: "",
      trim: true,
    },

    businessIndustryType: {
      type: String,
      default: "",
      trim: true,
    },

    businessRoleDesignation: {
      type: String,
      default: "",
      trim: true,
    },

    companyName: {
      type: String,
      default: "",
      trim: true,
    },

    jobTitle: {
      type: String,
      default: "",
      trim: true,
    },

    workingIndustry: {
      type: String,
      default: "",
      trim: true,
    },

    schoolInstituteName: {
      type: String,
      default: "",
      trim: true,
    },

    schoolPosition: {
      type: String,
      default: "",
      trim: true,
    },

    subjectsDepartment: {
      type: String,
      default: "",
      trim: true,
    },

    homemakerNotes: {
      type: String,
      default: "",
      trim: true,
    },

    professionType: {
      type: String,
      default: "",
      trim: true,
    },

    workDomain: {
      type: String,
      default: "",
      trim: true,
    },

    experience: {
      type: String,
      default: "",
      trim: true,
    },

    otherOccupation: {
      type: String,
      default: "",
      trim: true,
    },

    area: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
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
      default: "New",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ParentEnquiry", parentEnquirySchema);
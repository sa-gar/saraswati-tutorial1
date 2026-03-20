import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: false },
    tutorName: { type: String, required: true },
    learnerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    preferredDate: { type: String, default: "" },
    preferredSlot: { type: String, default: "" },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
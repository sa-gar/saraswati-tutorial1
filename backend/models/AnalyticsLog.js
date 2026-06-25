import mongoose from "mongoose";

const analyticsLogSchema = new mongoose.Schema(
  {
    visitor_id: { type: String, required: true },
    session_id: { type: String, required: true },
    city: { type: String, default: "Unknown City" },
    country: { type: String, default: "Unknown Country" },
    region: { type: String, default: "Unknown State" },
    source: { type: String, default: "Direct Visit" },
    page_visited: { type: String, required: true },
    plan_clicked: { type: String, default: "" },
    enquiry_submitted: { type: Boolean, default: false },
    device: { type: String, default: "Desktop" },
    browser: { type: String, default: "Unknown Browser" },
    os: { type: String, default: "Unknown OS" },
    action: { type: String, default: "page_view" },
    time_spent: { type: Number, default: 0 },
    scroll_depth: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Indexes to speed up queries
analyticsLogSchema.index({ visitor_id: 1 });
analyticsLogSchema.index({ session_id: 1 });
analyticsLogSchema.index({ createdAt: -1 });

export default mongoose.model("AnalyticsLog", analyticsLogSchema);

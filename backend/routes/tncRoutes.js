import express from "express";
import jwt from "jsonwebtoken";
import TncAcceptance from "../models/TncAcceptance.js";

const router = express.Router();

// ── Middleware: verify admin JWT (same pattern as the rest of the project) ───
function requireAdmin(req, res, next) {
  const auth  = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "").trim();
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tnc/record
// Called by the frontend when a parent clicks Accept or Dismiss.
// Public endpoint — no auth required.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/record", async (req, res) => {
  try {
    const { action, name, phone, pageVersion, source } = req.body;

    if (!action || !["accepted", "dismissed"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'accepted' or 'dismissed'.",
      });
    }

    const record = await TncAcceptance.create({
      action,
      name:        (name  || "").trim(),
      phone:       (phone || "").trim(),
      pageVersion: pageVersion || "v1",
      source:      source || "tnc-page",
      ipAddress:   req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "",
      userAgent:   req.headers["user-agent"] || "",
      referrer:    req.headers["referer"] || "",
    });

    return res.status(201).json({
      success: true,
      message: `T&C ${action} recorded successfully.`,
      id: record._id,
    });
  } catch (err) {
    console.error("[TNC] Record error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tnc/all  (Admin only)
// Returns all acceptance/dismissal records, newest first.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/all", requireAdmin, async (req, res) => {
  try {
    const { action, limit = 200 } = req.query;

    const filter = {};
    if (action && ["accepted", "dismissed"].includes(action)) {
      filter.action = action;
    }

    const records = await TncAcceptance.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    const totalAccepted  = await TncAcceptance.countDocuments({ action: "accepted" });
    const totalDismissed = await TncAcceptance.countDocuments({ action: "dismissed" });

    return res.json({
      success: true,
      totalAccepted,
      totalDismissed,
      total: totalAccepted + totalDismissed,
      records,
    });
  } catch (err) {
    console.error("[TNC] Fetch error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

export default router;

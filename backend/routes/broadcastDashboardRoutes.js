/**
 * broadcastDashboardRoutes.js — Saraswati Tutorials
 *
 * Admin broadcast monitoring dashboard APIs.
 * All routes require admin authentication.
 * All queries use aggregate() — no N+1 queries.
 *
 * Endpoints:
 *   GET /broadcast-dashboard/summary   — Today's KPIs + live queue status
 *   GET /broadcast-dashboard/list      — Paginated broadcast log
 *   GET /broadcast-dashboard/history   — Per-requirement history
 *   GET /broadcast-dashboard/failed    — Retryable failed logs
 *   GET /broadcast-dashboard/interested — Tutors who responded Interested
 *   GET /broadcast-dashboard/queue     — Live queue depth from BroadcastService
 */

import express from "express";
import BroadcastLog from "../models/BroadcastLog.js";
import ParentEnquiry from "../models/ParentEnquiry.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { broadcastService, RETRYABLE_FAILURE_REASONS } from "../utils/broadcastService.js";
import { getSyncState } from "../utils/syncService.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// GET /broadcast-dashboard/summary
// Today's KPIs, delivery breakdown, and live queue status.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/broadcast-dashboard/summary", verifyToken(["admin"]), async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Run all aggregate queries in parallel
    const [
      todayLeadsCount,
      statusBreakdown,
      interestedCount,
      retryQueueCount,
      syncState,
    ] = await Promise.all([
      // Leads created today
      ParentEnquiry.countDocuments({ createdAt: { $gte: todayStart } }),

      // Broadcast log breakdown for today
      BroadcastLog.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Interested responses (all time, for CTA)
      BroadcastLog.countDocuments({ responseStatus: "Interested" }),

      // Retryable failed logs
      BroadcastLog.countDocuments({
        status: "Failed",
        retryCount: { $lt: Number(process.env.RETRY_COUNT || 3) },
        failureReason: { $in: RETRYABLE_FAILURE_REASONS },
      }),

      // Sync state
      getSyncState(),
    ]);

    // Build delivery breakdown map
    const deliveryMap = {};
    statusBreakdown.forEach(({ _id, count }) => {
      deliveryMap[_id] = count;
    });

    const todayBroadcasts = Object.values(deliveryMap).reduce((a, b) => a + b, 0);
    const todayFailed = deliveryMap["Failed"] || 0;
    const todaySent = (deliveryMap["Sent"] || 0) + (deliveryMap["Delivered"] || 0) +
                      (deliveryMap["Read"] || 0) + (deliveryMap["Replied"] || 0);

    const tutorAcceptanceRate =
      todaySent > 0
        ? `${((interestedCount / todaySent) * 100).toFixed(1)}%`
        : "N/A";

    res.json({
      todayLeads:            todayLeadsCount,
      todayBroadcasts,
      interestedTutors:      interestedCount,
      failedBroadcasts:      todayFailed,
      retryQueue:            retryQueueCount,
      tutorAcceptanceRate,
      queueStatus:           broadcastService.getStatus(),
      deliveryBreakdown:     deliveryMap,
      syncStatus: {
        lastSyncAt:    syncState?.lastSyncAt || null,
        lastSyncCount: syncState?.lastSyncCount || 0,
        status:        syncState?.status || "idle",
        lastError:     syncState?.lastError || "",
      },
    });
  } catch (err) {
    console.error("[Dashboard] Summary error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /broadcast-dashboard/list
// Paginated broadcast log with optional filters.
// Query: ?page=1&limit=50&status=Failed&leadId=xxx&tutorId=xxx&date=2025-07-17
// ─────────────────────────────────────────────────────────────────────────────
router.get("/broadcast-dashboard/list", verifyToken(["admin"]), async (req, res) => {
  try {
    const page    = Math.max(1, parseInt(req.query.page  || "1"));
    const limit   = Math.min(200, parseInt(req.query.limit || "50"));
    const skip    = (page - 1) * limit;

    const filter = {};
    if (req.query.status)        filter.status = req.query.status;
    if (req.query.leadId)        filter.leadId = req.query.leadId;
    if (req.query.tutorId)       filter.tutorId = req.query.tutorId;
    if (req.query.requirementId) filter.requirementId = req.query.requirementId;
    if (req.query.responseStatus) filter.responseStatus = req.query.responseStatus;
    if (req.query.broadcastType) filter.broadcastType = req.query.broadcastType;

    if (req.query.date) {
      const d = new Date(req.query.date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.createdAt = { $gte: d, $lt: nextDay };
    }

    const [logs, total] = await Promise.all([
      BroadcastLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BroadcastLog.countDocuments(filter),
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[Dashboard] List error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /broadcast-dashboard/history
// Per-requirement broadcast history grouped by requirementId.
// Query: ?requirementId=REQ-00001&leadId=xxx
// ─────────────────────────────────────────────────────────────────────────────
router.get("/broadcast-dashboard/history", verifyToken(["admin"]), async (req, res) => {
  try {
    const filter = {};
    if (req.query.requirementId) filter.requirementId = req.query.requirementId;
    if (req.query.leadId)        filter.leadId = req.query.leadId;

    const logs = await BroadcastLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    // Group by requirementId
    const grouped = {};
    for (const log of logs) {
      const key = log.requirementId;
      if (!grouped[key]) {
        grouped[key] = {
          requirementId: key,
          leadId: log.leadId,
          logs: [],
          summary: { total: 0, sent: 0, failed: 0, interested: 0, notInterested: 0 },
        };
      }
      grouped[key].logs.push(log);
      grouped[key].summary.total++;
      if (["Sent", "Delivered", "Read", "Replied"].includes(log.status)) {
        grouped[key].summary.sent++;
      }
      if (log.status === "Failed") grouped[key].summary.failed++;
      if (log.responseStatus === "Interested") grouped[key].summary.interested++;
      if (log.responseStatus === "Not Interested") grouped[key].summary.notInterested++;
    }

    res.json({
      history: Object.values(grouped),
      total: Object.keys(grouped).length,
    });
  } catch (err) {
    console.error("[Dashboard] History error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /broadcast-dashboard/failed
// All failed logs that are eligible for retry.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/broadcast-dashboard/failed", verifyToken(["admin"]), async (req, res) => {
  try {
    const maxRetry = Number(process.env.RETRY_COUNT || 3);

    const [retryable, permanent] = await Promise.all([
      BroadcastLog.find({
        status: "Failed",
        retryCount: { $lt: maxRetry },
        failureReason: { $in: RETRYABLE_FAILURE_REASONS },
      })
        .sort({ createdAt: -1 })
        .limit(200)
        .lean(),

      BroadcastLog.find({
        status: "Failed",
        $or: [
          { retryCount: { $gte: maxRetry } },
          { failureReason: { $nin: RETRYABLE_FAILURE_REASONS } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
    ]);

    res.json({
      retryable,
      permanent,
      retryableCount: retryable.length,
      permanentCount: permanent.length,
    });
  } catch (err) {
    console.error("[Dashboard] Failed logs error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /broadcast-dashboard/interested
// All tutors who responded "Interested", with lead context.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/broadcast-dashboard/interested", verifyToken(["admin"]), async (req, res) => {
  try {
    const limit = Math.min(200, parseInt(req.query.limit || "100"));
    const page  = Math.max(1, parseInt(req.query.page || "1"));
    const skip  = (page - 1) * limit;

    const filter = { responseStatus: "Interested" };
    if (req.query.requirementId) filter.requirementId = req.query.requirementId;

    const [logs, total] = await Promise.all([
      BroadcastLog.find(filter)
        .sort({ respondedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BroadcastLog.countDocuments(filter),
    ]);

    // Bulk-fetch lead data for context (no N+1)
    const leadIds = [...new Set(logs.map((l) => String(l.leadId)).filter(Boolean))];
    const leads = await ParentEnquiry.find({ _id: { $in: leadIds } })
      .select("parentName phone area city requirementId status assignedTutor")
      .lean();
    const leadMap = Object.fromEntries(leads.map((l) => [String(l._id), l]));

    const enriched = logs.map((log) => ({
      ...log,
      lead: leadMap[String(log.leadId)] || null,
    }));

    res.json({
      interested: enriched,
      total,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[Dashboard] Interested error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /broadcast-dashboard/queue
// Live queue status from the BroadcastService singleton.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/broadcast-dashboard/queue", verifyToken(["admin"]), async (req, res) => {
  try {
    res.json({
      queueStatus: broadcastService.getStatus(),
      timestamp: new Date(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

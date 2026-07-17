/**
 * broadcastOdooRoutes.js — Saraswati Tutorials
 *
 * Odoo → Node.js broadcast trigger endpoint.
 *
 * This endpoint is called by Odoo Server Actions (Python) when the admin
 * clicks "Broadcast" or "Search Tutor" buttons in the CRM Lead view.
 *
 * Security: X-Webhook-Secret header required (same secret as WhatsApp webhook).
 *
 * Endpoints:
 *   POST /api/broadcast-from-odoo     — Trigger broadcast for a CRM lead
 *   GET  /api/recommend-from-odoo     — Get tutor recommendations for a CRM lead
 */

import express from "express";
import ParentEnquiry from "../models/ParentEnquiry.js";
import { getRecommendations, buildParamsFromLead } from "../utils/recommendationEngine.js";
import { broadcastService } from "../utils/broadcastService.js";
import { parseAddress } from "../utils/matchingEngine.js";
import { addOdooChatterMessage } from "../utils/odooService.js";

const router = express.Router();

/**
 * Middleware: validate X-Webhook-Secret header.
 * Applied to all routes in this file.
 */
function validateWebhookSecret(req, res, next) {
  const secret = req.headers["x-webhook-secret"];
  const expected = process.env.WEBHOOK_SECRET;

  if (!expected) {
    // No secret configured — warn but allow (dev mode)
    console.warn("[OdooRoutes] WEBHOOK_SECRET not set — skipping validation");
    return next();
  }

  if (secret !== expected) {
    return res.status(403).json({ message: "Unauthorized — invalid webhook secret." });
  }
  next();
}

router.use(validateWebhookSecret);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/broadcast-from-odoo
//
// Called by Odoo Server Action Python code when admin clicks "Broadcast" button.
//
// Body:
//   { "leadId": 123, "broadcastType": "manual", "adminName": "Admin", "force": false }
//
// Flow:
//   1. Find ParentEnquiry by odooLeadId
//   2. Build recommendation params
//   3. Get 4-bucket recommendations
//   4. Enqueue all tutors in BroadcastService
//   5. Post result to Odoo chatter
//   6. Return summary
// ─────────────────────────────────────────────────────────────────────────────
router.post("/broadcast-from-odoo", async (req, res) => {
  try {
    const { leadId, broadcastType = "manual", adminName = "Odoo Admin", force = false } = req.body;

    if (!leadId) {
      return res.status(400).json({ message: "leadId is required" });
    }

    // ── Find the lead ────────────────────────────────────────────────────────
    const lead = await ParentEnquiry.findOne({ odooLeadId: leadId }).lean();
    if (!lead) {
      return res.status(404).json({
        message: `No parent enquiry found with odooLeadId = ${leadId}. ` +
                 `Ensure the lead was created via the website or synced to MongoDB first.`,
      });
    }

    console.log(`[OdooRoutes] Broadcast triggered by Odoo for lead: ${lead.requirementId} (odooLeadId: ${leadId})`);

    // ── Build params and get recommendations ─────────────────────────────────
    const parsedAddr = parseAddress(lead.address);
    const params = buildParamsFromLead(lead, parsedAddr);
    const recommendations = await getRecommendations(params);

    const allTutors = [
      ...recommendations.exact,
      ...recommendations.nearby,
      ...recommendations.city,
      ...recommendations.backup,
    ];

    if (allTutors.length === 0) {
      // Post to Odoo chatter even on zero match
      await addOdooChatterMessage(
        leadId,
        `⚠️ Broadcast attempted for ${lead.requirementId} — No matching tutors found.\n` +
        `Area: ${params.area || "N/A"}, City: ${params.city || "N/A"}`
      ).catch(() => {});

      return res.json({
        message: "No matching tutors found",
        leadId,
        requirementId: lead.requirementId,
        queued: 0,
        buckets: { exact: 0, nearby: 0, city: 0, backup: 0 },
      });
    }

    // ── Enqueue broadcast ─────────────────────────────────────────────────────
    const { queued, alreadyQueued } = await broadcastService.enqueue(lead, allTutors, {
      force,
      adminName,
      adminEmail: "odoo@saraswatitutorial.com",
      source: "odoo",
    });

    // ── Post to Odoo chatter ──────────────────────────────────────────────────
    const chatterMsg =
      `✅ Broadcast started for <b>${lead.requirementId}</b><br/>` +
      `Tutors queued: <b>${queued}</b> | Already sent (skipped): ${alreadyQueued}<br/>` +
      `📍 Exact: ${recommendations.exact.length} | ` +
      `Nearby: ${recommendations.nearby.length} | ` +
      `City: ${recommendations.city.length} | ` +
      `Backup: ${recommendations.backup.length}`;

    await addOdooChatterMessage(leadId, chatterMsg).catch((err) =>
      console.warn("[OdooRoutes] Odoo chatter post failed:", err.message)
    );

    res.json({
      message: `Broadcast started. ${queued} tutors queued.`,
      leadId,
      requirementId: lead.requirementId,
      queued,
      alreadyQueued,
      buckets: {
        exact:  recommendations.exact.length,
        nearby: recommendations.nearby.length,
        city:   recommendations.city.length,
        backup: recommendations.backup.length,
      },
      queueStatus: broadcastService.getStatus(),
    });

  } catch (err) {
    console.error("[OdooRoutes] broadcast-from-odoo error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/recommend-from-odoo?leadId=123
//
// Called by Odoo "Search Tutor" Server Action.
// Returns recommendation data that Odoo posts to the lead chatter.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/recommend-from-odoo", async (req, res) => {
  try {
    const { leadId } = req.query;
    if (!leadId) {
      return res.status(400).json({ message: "leadId query param is required" });
    }

    const lead = await ParentEnquiry.findOne({ odooLeadId: leadId }).lean();
    if (!lead) {
      return res.status(404).json({
        message: `No parent enquiry found with odooLeadId = ${leadId}`,
      });
    }

    const parsedAddr = parseAddress(lead.address);
    const params = buildParamsFromLead(lead, parsedAddr);
    const recommendations = await getRecommendations(params);

    // Post summary to Odoo chatter
    const tierLines = [];
    for (const [tier, tutors] of Object.entries(recommendations)) {
      if (!Array.isArray(tutors) || tutors.length === 0) continue;
      tierLines.push(`<b>${tier.charAt(0).toUpperCase() + tier.slice(1)} Match (${tutors.length})</b>`);
      tutors.slice(0, 5).forEach((t) => {
        tierLines.push(
          `• ${t.name} — ${t.matchPercentage}% match` +
          (t.distanceKm != null ? `, ${t.distanceKm} km` : "") +
          ` | ${t.reason}`
        );
      });
    }

    const chatterMsg = tierLines.length
      ? `🔍 Tutor Recommendations for <b>${lead.requirementId}</b>:<br/>${tierLines.join("<br/>")}`
      : `🔍 No matching tutors found for ${lead.requirementId}`;

    await addOdooChatterMessage(leadId, chatterMsg).catch(() => {});

    res.json({
      lead: {
        requirementId: lead.requirementId,
        area: lead.area,
        city: lead.city,
      },
      recommendations,
    });

  } catch (err) {
    console.error("[OdooRoutes] recommend-from-odoo error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

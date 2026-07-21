/**
 * broadcastOdooRoutes.js — Saraswati Tutorials
 *
 * Odoo → Node.js broadcast trigger endpoints.
 *
 * ── Legacy (Odoo Self-hosted / Odoo.sh via Python Server Actions) ────────────
 *   POST /api/broadcast-from-odoo     — Trigger broadcast for a CRM lead
 *   GET  /api/recommend-from-odoo     — Get tutor recommendations for a CRM lead
 *
 * ── Odoo Online / SaaS (via "Send Webhook Notification" action) ──────────────
 *   POST /api/odoo/search-tutor       — Calculate recommendations & post chatter
 *   POST /api/odoo/broadcast          — Enqueue broadcast & post chatter
 *
 * Odoo Online does NOT allow Python imports (requests, json), so the legacy
 * Python "Execute Python Code" Server Action fails with:
 *   Validation Error: forbidden opcode(s): IMPORT_NAME
 * The new endpoints accept the native Odoo Online webhook payload instead.
 *
 * Security: X-Webhook-Secret header required (WEBHOOK_SECRET env var).
 */

import express from "express";
import ParentEnquiry from "../models/ParentEnquiry.js";
import { getRecommendations, buildParamsFromLead } from "../utils/recommendationEngine.js";
import { broadcastService } from "../utils/broadcastService.js";
import { parseAddress } from "../utils/matchingEngine.js";
import { addOdooChatterMessage, lookupOdooMasterTutorIds } from "../utils/odooService.js";

const router = express.Router();

// =============================================================================
// SHARED HELPERS
// (used by both legacy and Odoo Online endpoints to avoid code duplication)
// =============================================================================

/**
 * resolveLeadAndRecommend(odooLeadId)
 *
 * Finds a ParentEnquiry by Odoo Lead ID and calculates 4-bucket recommendations.
 * Returns { lead, params, recommendations, allTutors }.
 * Returns { lead: null } when the enquiry is not found (caller handles 404).
 *
 * @param {number|string} odooLeadId — Odoo CRM lead ID
 * @returns {Promise<{ lead, params, recommendations, allTutors }>}
 */
async function resolveLeadAndRecommend(odooLeadId) {
  const lead = await ParentEnquiry.findOne({ odooLeadId }).lean();
  if (!lead) return { lead: null };

  const parsedAddr      = parseAddress(lead.address);
  const params          = buildParamsFromLead(lead, parsedAddr);
  const recommendations = await getRecommendations(params);

  const allTutors = [
    ...recommendations.exact,
    ...recommendations.nearby,
    ...recommendations.city,
    ...recommendations.backup,
  ];

  return { lead, params, recommendations, allTutors };
}

/**
 * buildChatterSummary(recommendations)
 *
 * Formats per-tier tutor lists into an array of HTML lines for Odoo chatter.
 * Shows up to 5 tutors per tier with match percentage, distance, and reason.
 *
 * @param {{ exact, nearby, city, backup }} recommendations
 * @returns {string[]} Array of HTML lines (join with "<br/>" to embed in chatter)
 */
function buildChatterSummary(recommendations) {
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
  return tierLines;
}

// =============================================================================
// SECURITY MIDDLEWARE — applied to ALL routes in this file
// =============================================================================

/**
 * Middleware: validate X-Webhook-Secret header.
 * Applied to all routes in this file.
 */
function validateWebhookSecret(req, res, next) {
  const secret   = req.headers["x-webhook-secret"];
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

// =============================================================================
// LEGACY ENDPOINTS — Odoo Self-hosted / Odoo.sh (Python Server Actions)
// DO NOT MODIFY — kept for backward compatibility.
// =============================================================================

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
    const parsedAddr      = parseAddress(lead.address);
    const params          = buildParamsFromLead(lead, parsedAddr);
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

    const parsedAddr      = parseAddress(lead.address);
    const params          = buildParamsFromLead(lead, parsedAddr);
    const recommendations = await getRecommendations(params);

    // ── Resolve Odoo record IDs for matched tutors ─────────────────────────
    // Flatten all tiers into one list, then look up x_master_tutors by code
    // and phone. The Python action will use these IDs directly in the domain
    // filter so the window action shows exactly the matched tutors.
    const allRecommended = [
      ...( recommendations.exact  || []),
      ...( recommendations.nearby || []),
      ...( recommendations.city   || []),
      ...( recommendations.backup || []),
    ];
    const { odooIds, odooModel } = await lookupOdooMasterTutorIds(allRecommended)
      .catch((err) => {
        console.error("[OdooRoutes] lookupOdooMasterTutorIds failed:", err.message);
        return { odooIds: [], odooModel: "x_master_tutors" };
      });

    console.log(
      `[OdooRoutes] recommend-from-odoo — ` +
      `${allRecommended.length} tutors recommended, ${odooIds.length} matched in Odoo`
    );

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
      success: true,
      lead: {
        requirementId: lead.requirementId,
        area: lead.area,
        city: lead.city,
      },
      recommendations,
      // Odoo record IDs resolved from x_master_tutors — used by the Python
      // Server Action to open the Matching Tutors window with the exact domain.
      odooIds,
      odooModel,
    });

  } catch (err) {
    console.error("[OdooRoutes] recommend-from-odoo error:", err);
    res.status(500).json({ message: err.message });
  }
});

// =============================================================================
// ODOO ONLINE (SaaS) WEBHOOK ENDPOINTS
//
// Odoo Online does not support Python imports (requests, json) in Server
// Actions. "Execute Python Code" with `import requests` fails with:
//   Validation Error: forbidden opcode(s): IMPORT_NAME
//
// Solution: use Odoo's built-in "Send Webhook Notification" action type.
// Odoo sends a POST request with a JSON body containing the record metadata:
//
//   {
//     "_id":    123,                           — Odoo CRM Lead ID
//     "_model": "crm.lead",                   — model name (informational)
//     "_action": "Search Tutor (Saraswati)"   — action label (informational)
//   }
//
// Security: X-Webhook-Secret header (same WEBHOOK_SECRET env var).
//           Already enforced by router.use(validateWebhookSecret) above.
//
// Odoo Online configuration:
//   Action Type  : Send Webhook Notification
//   URL          : https://<backend>/api/odoo/search-tutor  (or /broadcast)
//   HTTP Method  : POST
//   Header Name  : X-Webhook-Secret
//   Header Value : <value of WEBHOOK_SECRET in .env>
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/odoo/search-tutor
//
// Odoo Online "Send Webhook Notification" for "Search Tutor" button.
//
// Payload:
//   { "_id": 123, "_model": "crm.lead", "_action": "Search Tutor (Saraswati)" }
//
// Flow:
//   1. Read _id as Odoo Lead ID
//   2. Find ParentEnquiry by odooLeadId == _id  (via resolveLeadAndRecommend)
//   3. Calculate 4-bucket recommendations
//   4. Format recommendation summary  (via buildChatterSummary)
//   5. Post formatted HTML summary to Odoo chatter  (via addOdooChatterMessage)
//   6. Return JSON success with per-bucket counts
// ─────────────────────────────────────────────────────────────────────────────
router.post("/odoo/search-tutor", async (req, res) => {
  try {
    const { _id: odooLeadId, _model, _action } = req.body;

    if (!odooLeadId) {
      return res.status(400).json({ message: "_id (Odoo Lead ID) is required in payload" });
    }

    console.log(
      `[OdooOnline] search-tutor — leadId: ${odooLeadId}, ` +
      `model: ${_model || "n/a"}, action: ${_action || "n/a"}`
    );

    const { lead, recommendations } = await resolveLeadAndRecommend(odooLeadId);

    if (!lead) {
      return res.status(404).json({
        message:
          `No parent enquiry found with odooLeadId = ${odooLeadId}. ` +
          `Ensure the lead was created via the website or synced to MongoDB first.`,
      });
    }

    // ── Resolve Odoo record IDs for matched tutors ─────────────────────────
    const allRecommended = [
      ...( recommendations.exact  || []),
      ...( recommendations.nearby || []),
      ...( recommendations.city   || []),
      ...( recommendations.backup || []),
    ];
    const { odooIds, odooModel } = await lookupOdooMasterTutorIds(allRecommended)
      .catch((err) => {
        console.error("[OdooOnline] lookupOdooMasterTutorIds failed:", err.message);
        return { odooIds: [], odooModel: "x_master_tutors" };
      });

    // ── Format and post chatter message ──────────────────────────────────────
    const tierLines  = buildChatterSummary(recommendations);
    const chatterMsg = tierLines.length
      ? `🔍 Tutor Recommendations for <b>${lead.requirementId}</b>:<br/>${tierLines.join("<br/>")}`
      : `🔍 No matching tutors found for ${lead.requirementId}`;

    await addOdooChatterMessage(odooLeadId, chatterMsg).catch((err) =>
      console.warn("[OdooOnline] search-tutor chatter post failed:", err.message)
    );

    res.json({
      success: true,
      message: "Recommendations calculated and posted to Odoo chatter.",
      odooLeadId,
      requirementId: lead.requirementId,
      recommendations,
      odooIds,
      odooModel,
      buckets: {
        exact:  recommendations.exact.length,
        nearby: recommendations.nearby.length,
        city:   recommendations.city.length,
        backup: recommendations.backup.length,
      },
      totalFound:
        recommendations.exact.length  +
        recommendations.nearby.length +
        recommendations.city.length   +
        recommendations.backup.length,
    });

  } catch (err) {
    console.error("[OdooOnline] search-tutor error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/odoo/broadcast
//
// Odoo Online "Send Webhook Notification" for "Broadcast Tutors" button.
//
// Payload:
//   { "_id": 123, "_model": "crm.lead", "_action": "Broadcast (Saraswati)" }
//
// Flow:
//   1. Read _id as Odoo Lead ID
//   2. Find ParentEnquiry by odooLeadId == _id  (via resolveLeadAndRecommend)
//   3. Calculate 4-bucket recommendations
//   4. Enqueue all matching tutors via broadcastService.enqueue()
//   5. Post broadcast result summary to Odoo chatter
//   6. Return JSON summary with queued counts and queue status
// ─────────────────────────────────────────────────────────────────────────────
router.post("/odoo/broadcast", async (req, res) => {
  try {
    const {
      _id:      odooLeadId,
      _model,
      _action,
      // Optional overrides — not sent by Odoo Online but useful for manual testing
      force     = false,
      adminName = "Odoo Online",
    } = req.body;

    if (!odooLeadId) {
      return res.status(400).json({ message: "_id (Odoo Lead ID) is required in payload" });
    }

    console.log(
      `[OdooOnline] broadcast — leadId: ${odooLeadId}, ` +
      `model: ${_model || "n/a"}, action: ${_action || "n/a"}`
    );

    const { lead, params, recommendations, allTutors } = await resolveLeadAndRecommend(odooLeadId);

    if (!lead) {
      return res.status(404).json({
        message:
          `No parent enquiry found with odooLeadId = ${odooLeadId}. ` +
          `Ensure the lead was created via the website or synced to MongoDB first.`,
      });
    }

    // ── Zero match — post to chatter and return early ─────────────────────────
    if (allTutors.length === 0) {
      await addOdooChatterMessage(
        odooLeadId,
        `⚠️ Broadcast attempted for ${lead.requirementId} — No matching tutors found.\n` +
        `Area: ${params.area || "N/A"}, City: ${params.city || "N/A"}`
      ).catch(() => {});

      return res.json({
        success: true,
        message: "No matching tutors found — broadcast not started.",
        odooLeadId,
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
      source: "odoo-online",
    });

    // ── Post broadcast summary to Odoo chatter ────────────────────────────────
    const chatterMsg =
      `✅ Broadcast started for <b>${lead.requirementId}</b><br/>` +
      `Tutors queued: <b>${queued}</b> | Already sent (skipped): ${alreadyQueued}<br/>` +
      `📍 Exact: ${recommendations.exact.length} | ` +
      `Nearby: ${recommendations.nearby.length} | ` +
      `City: ${recommendations.city.length} | ` +
      `Backup: ${recommendations.backup.length}`;

    await addOdooChatterMessage(odooLeadId, chatterMsg).catch((err) =>
      console.warn("[OdooOnline] broadcast chatter post failed:", err.message)
    );

    res.json({
      success: true,
      message: `Broadcast started. ${queued} tutors queued.`,
      odooLeadId,
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
    console.error("[OdooOnline] broadcast error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

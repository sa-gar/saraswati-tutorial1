/**
 * syncService.js — Saraswati Tutorials
 *
 * Bidirectional sync between Odoo x_master_tutors and MongoDB Tutor collection.
 *
 * Architecture Decision: Odoo is Master for tutor PROFILE fields.
 *                        MongoDB is Master for BROADCAST / OPERATIONAL fields.
 *
 * Conflict Resolution:
 *   - Profile fields (name, area, city, subjects, grades, timings, pincode):
 *       Odoo always wins — synced from Odoo to MongoDB every TUTOR_SYNC_INTERVAL_MIN minutes
 *   - Operational fields (onboardingCompleted, onboardingMessageSentAt, availabilityStatus,
 *       tutorCode, broadcast history):
 *       MongoDB always wins — NEVER overwritten by Odoo sync
 *
 * Sync Directions:
 *   1. Website → Odoo → MongoDB  (on tutor registration/update)
 *   2. Odoo    → MongoDB         (periodic, every 15 min, incremental since lastSyncAt)
 *   3. Website → Odoo + MongoDB  (on admin update from website panel)
 *   4. Archive: soft-delete in MongoDB → archive in Odoo
 */

import dotenv from "dotenv";
dotenv.config();

import Tutor from "../models/Tutor.js";
import SyncState from "../models/SyncState.js";
import { callOdooMethod, getOdooUid } from "./whatsappService.js";

const SYNC_INTERVAL_MIN = Number(process.env.TUTOR_SYNC_INTERVAL_MIN || 15);
const SYNC_KEY = "odoo_tutor_sync";

/**
 * Parse a comma-separated string into an array of trimmed strings.
 */
function parseCommaSeparated(str) {
  if (!str) return [];
  return String(str)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Fetch all Odoo x_master_tutors records changed since a given timestamp.
 *
 * @param {Date|null} since - Fetch records with write_date > since (null = fetch all)
 * @returns {Promise<Array>}
 */
async function fetchOdooTutorsSince(since) {
  try {
    const uid = await getOdooUid();

    const domain = [];
    if (since) {
      // Odoo datetime format: "YYYY-MM-DD HH:MM:SS"
      const sinceStr = since.toISOString().replace("T", " ").substring(0, 19);
      domain.push(["write_date", ">", sinceStr]);
    }

    const records = await callOdooMethod(
      uid,
      "x_master_tutors",
      "search_read",
      [domain],
      {
        fields: [
          "id",
          "x_tutor_id",
          "x_name",
          "x_gender",
          "x_mobile",
          "x_whatsapp",
          "x_email",
          "x_city",
          "x_area",
          "x_full_address",
          "x_pincode",
          "x_grades",
          "x_boards",
          "x_subjects",
          "x_preferred_timings",
          "x_max_travel_distance",
          "x_experience",
          "x_qualification",
          "x_availability",
          "x_locations_can_teach",
          "write_date",
        ],
        limit: 500, // process max 500 per sync cycle
      }
    );

    return records || [];
  } catch (err) {
    console.error("[SyncService] Failed to fetch Odoo tutors:", err.message);
    return [];
  }
}

/**
 * Sync changed Odoo tutor records into MongoDB.
 * Only PROFILE fields are updated — operational/broadcast fields are never touched.
 *
 * @returns {Promise<{synced: number, errors: number}>}
 */
export async function syncOdooTutorsToMongo() {
  // ── Load last sync state ──────────────────────────────────────────────────
  let state = await SyncState.findOne({ key: SYNC_KEY });
  const since = state?.lastSyncAt || null;

  // ── Mark sync as running ──────────────────────────────────────────────────
  await SyncState.findOneAndUpdate(
    { key: SYNC_KEY },
    { status: "running" },
    { upsert: true }
  );

  let synced = 0;
  let errors = 0;

  try {
    const odooTutors = await fetchOdooTutorsSince(since);
    console.log(
      `[SyncService] Fetched ${odooTutors.length} Odoo tutors changed since ` +
      `${since ? since.toISOString() : "beginning"}`
    );

    for (const ot of odooTutors) {
      try {
        if (!ot.x_tutor_id && !ot.x_mobile) {
          continue; // Can't match without tutor code or mobile
        }

        // ── Build profile-only update payload ──────────────────────────────
        // NEVER include: onboardingCompleted, onboardingMessageSentAt,
        //                availabilityStatus, broadcastHistory
        const profileUpdate = {
          name:              ot.x_name || undefined,
          gender:            ot.x_gender || undefined,
          email:             ot.x_email || undefined,
          city:              ot.x_city || undefined,
          area:              ot.x_area || undefined,
          fullAddress:       ot.x_full_address || undefined,
          pincode:           ot.x_pincode || undefined,
          experience:        ot.x_experience || undefined,
          qualification:     ot.x_qualification || undefined,
          maxTravelDistance: ot.x_max_travel_distance || undefined,
        };

        // Array fields — only update if Odoo has data
        if (ot.x_grades) {
          profileUpdate.grades = parseCommaSeparated(ot.x_grades);
        }
        if (ot.x_boards) {
          profileUpdate.boards = parseCommaSeparated(ot.x_boards);
        }
        if (ot.x_subjects) {
          profileUpdate.subjects = parseCommaSeparated(ot.x_subjects);
        }
        if (ot.x_preferred_timings) {
          profileUpdate.timings = parseCommaSeparated(ot.x_preferred_timings);
        }
        if (ot.x_locations_can_teach) {
          profileUpdate.locations = parseCommaSeparated(ot.x_locations_can_teach);
        }

        // Remove undefined keys
        Object.keys(profileUpdate).forEach(
          (k) => profileUpdate[k] === undefined && delete profileUpdate[k]
        );

        // ── Match by tutorCode first, fallback to mobile number ─────────────
        const matchQuery = ot.x_tutor_id
          ? { tutorCode: ot.x_tutor_id }
          : {
              $or: [
                { phone: { $regex: String(ot.x_mobile || "").replace(/\D/g, "").slice(-10) } },
                { whatsapp: { $regex: String(ot.x_whatsapp || ot.x_mobile || "").replace(/\D/g, "").slice(-10) } },
              ],
            };

        // Only update existing — never create from Odoo sync alone
        const result = await Tutor.findOneAndUpdate(
          matchQuery,
          { $set: profileUpdate },
          { new: false } // we don't need the updated doc
        );

        if (result) {
          synced++;
        } else {
          console.warn(
            `[SyncService] Tutor not found in MongoDB for Odoo record: ` +
            `tutorCode=${ot.x_tutor_id}, mobile=${ot.x_mobile}`
          );
        }
      } catch (tutorErr) {
        console.error(
          `[SyncService] Error syncing Odoo tutor ${ot.x_tutor_id}: ${tutorErr.message}`
        );
        errors++;
      }
    }

    // ── Update sync state ─────────────────────────────────────────────────
    await SyncState.findOneAndUpdate(
      { key: SYNC_KEY },
      {
        lastSyncAt: new Date(),
        lastSyncCount: synced,
        lastError: errors > 0 ? `${errors} tutor(s) failed to sync` : "",
        status: "idle",
      },
      { upsert: true }
    );

    console.log(`[SyncService] ✅ Sync complete: ${synced} updated, ${errors} errors`);
    return { synced, errors };

  } catch (err) {
    console.error("[SyncService] Critical sync error:", err.message);
    await SyncState.findOneAndUpdate(
      { key: SYNC_KEY },
      { lastError: err.message, status: "error" },
      { upsert: true }
    );
    return { synced, errors: errors + 1 };
  }
}

/**
 * Get the current sync state for monitoring.
 * @returns {Promise<Object|null>}
 */
export async function getSyncState() {
  try {
    return await SyncState.findOne({ key: SYNC_KEY });
  } catch {
    return null;
  }
}

/**
 * Start the periodic Odoo → MongoDB sync scheduler.
 * Runs every TUTOR_SYNC_INTERVAL_MIN minutes.
 */
export function startSyncScheduler() {
  const intervalMs = SYNC_INTERVAL_MIN * 60 * 1000;
  console.log(`[SyncService] Starting Odoo→MongoDB tutor sync every ${SYNC_INTERVAL_MIN} min`);

  // Run immediately on startup to catch any missed changes
  setTimeout(() => {
    syncOdooTutorsToMongo().catch((err) =>
      console.error("[SyncService] Initial sync error:", err.message)
    );
  }, 30_000); // 30-second delay to let DB connection stabilize

  setInterval(() => {
    syncOdooTutorsToMongo().catch((err) =>
      console.error("[SyncService] Scheduled sync error:", err.message)
    );
  }, intervalMs);
}

/**
 * syncService.js — Saraswati Tutorials
 *
 * Bidirectional sync between Odoo and MongoDB Tutor collection.
 *
 * Two sync sources:
 *   1. x_master_tutors  — legacy source, simpler field names (x_tutor_id, x_mobile, …)
 *   2. x_tutor          — confirmed active model used by Matching Tutors window action
 *                         uses x_studio_* field names (confirmed by live record inspection)
 *
 * Architecture Decision: Odoo is Master for tutor PROFILE fields.
 *                        MongoDB is Master for BROADCAST / OPERATIONAL fields.
 *
 * Conflict Resolution:
 *   - Profile fields (name, area, city, subjects, grades, timings, pincode, phone, tutorCode):
 *       Odoo always wins — synced from Odoo to MongoDB every TUTOR_SYNC_INTERVAL_MIN minutes
 *   - Operational fields (onboardingCompleted, onboardingMessageSentAt, availabilityStatus,
 *       broadcast history):
 *       MongoDB always wins — NEVER overwritten by Odoo sync
 *
 * Key field mapping (x_tutor → MongoDB):
 *   x_studio_tutor_id_4      → tutorCode   ← CONFIRMED correct by live Odoo record #5
 *   x_studio_full_name_1     → name
 *   x_studio_mobile_number_3 → phone       ← CONFIRMED correct by live Odoo record #5
 *   x_studio_whatsapp_number_2 → whatsapp  ← CONFIRMED correct by live Odoo record #5
 *   x_studio_email_address_2 → email
 *   x_studio_city_3          → city
 *   x_studio_area_3          → area
 *   x_studio_pincode_3       → pincode
 *   x_studio_full_address    → fullAddress
 *   x_studio_qualification_2 → qualification
 *   x_studio_experience_2    → experience
 *   x_studio_grade_can_teach → grades (comma-separated)
 *   x_studio_board_can_teach → boards (comma-separated)
 *   x_studio_subject_2       → subjects (comma-separated)
 *   x_studio_perferred_timings → timings (comma-separated)
 */

import dotenv from "dotenv";
dotenv.config();

import Tutor from "../models/Tutor.js";
import SyncState from "../models/SyncState.js";
import { callOdooMethod, getOdooUid } from "./whatsappService.js";

const SYNC_INTERVAL_MIN = Number(process.env.TUTOR_SYNC_INTERVAL_MIN || 15);
const SYNC_KEY      = "odoo_tutor_sync";
const SYNC_KEY_XTUTOR = "odoo_x_tutor_sync";

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

// =============================================================================
// x_tutor SYNC  (confirmed active model — used by Matching Tutors window)
// =============================================================================

/**
 * Fetch all records from Odoo x_tutor changed since a given timestamp.
 * Uses the confirmed correct x_studio_* field names.
 *
 * @param {Date|null} since
 * @returns {Promise<Array>}
 */
async function fetchXTutorsSince(since) {
  try {
    const uid = await getOdooUid();
    const domain = [];
    if (since) {
      const sinceStr = since.toISOString().replace("T", " ").substring(0, 19);
      domain.push(["write_date", ">", sinceStr]);
    }

    const records = await callOdooMethod(
      uid,
      "x_tutor",
      "search_read",
      [domain],
      {
        fields: [
          "id",
          // ── Identity (confirmed by live inspection of Odoo record #5) ──────
          "x_studio_tutor_id_4",    // tutorCode  e.g. "TUT-001"
          "x_studio_full_name_1",   // name
          // ── Contact ───────────────────────────────────────────────────────
          "x_studio_mobile_number_3",   // phone
          "x_studio_whatsapp_number_2", // whatsapp
          "x_studio_email_address_2",   // email
          // ── Location ──────────────────────────────────────────────────────
          "x_studio_city_3",        // city
          "x_studio_area_3",        // area
          "x_studio_pincode_3",     // pincode
          "x_studio_full_address",  // fullAddress
          // ── Profile ───────────────────────────────────────────────────────
          "x_studio_qualification_2",    // qualification
          "x_studio_experience_2",       // experience
          "x_studio_grade_can_teach",    // grades (comma-separated)
          "x_studio_board_can_teach",    // boards (comma-separated)
          "x_studio_subject_2",          // subjects (comma-separated)
          "x_studio_perferred_timings",  // timings (comma-separated)
          "x_studio_max_travel_distance",// maxTravelDistance
          // ── Status ────────────────────────────────────────────────────────
          "x_studio_availability_status", // availabilityStatus (selection)
          "write_date",
        ],
        limit: 500,
      }
    );
    return records || [];
  } catch (err) {
    console.error("[SyncService/x_tutor] Failed to fetch records:", err.message);
    return [];
  }
}

/**
 * Sync changed x_tutor records into MongoDB.
 *
 * Match strategy (in order):
 *   1. By tutorCode  (x_studio_tutor_id_4)  — most reliable
 *   2. By phone      (x_studio_mobile_number_3) — fallback
 *   3. By whatsapp   (x_studio_whatsapp_number_2) — second fallback
 *
 * Behaviour:
 *   - If a matching MongoDB Tutor exists → update profile + tutorCode/phone/whatsapp.
 *   - tutorCode is treated as a profile field here (it comes FROM Odoo, Odoo is master).
 *   - Operational fields (onboardingCompleted, availabilityStatus, etc.) are NEVER touched.
 *
 * @param {boolean} [fullResync=false] - If true, ignore lastSyncAt and fetch all records.
 * @returns {Promise<{synced: number, skipped: number, errors: number}>}
 */
export async function syncXTutorToMongo(fullResync = false) {
  let state = await SyncState.findOne({ key: SYNC_KEY_XTUTOR });
  const since = fullResync ? null : (state?.lastSyncAt || null);

  await SyncState.findOneAndUpdate(
    { key: SYNC_KEY_XTUTOR },
    { status: "running" },
    { upsert: true }
  );

  let synced  = 0;
  let skipped = 0;
  let errors  = 0;

  try {
    const odooTutors = await fetchXTutorsSince(since);
    console.log(
      `[SyncService/x_tutor] Fetched ${odooTutors.length} record(s) ` +
      `changed since ${since ? since.toISOString() : "beginning"}`
    );

    for (const ot of odooTutors) {
      try {
        const tutorCode = (ot.x_studio_tutor_id_4 || "").trim();
        const phone     = (ot.x_studio_mobile_number_3 || "").trim().replace(/\D/g, "").slice(-10);
        const whatsapp  = (ot.x_studio_whatsapp_number_2 || "").trim().replace(/\D/g, "").slice(-10);
        const name      = (ot.x_studio_full_name_1 || "").trim();

        if (!tutorCode && !phone && !name) {
          skipped++;
          continue; // nothing to match on
        }

        // ── Build match query ───────────────────────────────────────────────
        const orClauses = [];
        if (tutorCode)  orClauses.push({ tutorCode });
        if (phone)      orClauses.push({ phone:    { $regex: phone } });
        if (whatsapp)   orClauses.push({ whatsapp: { $regex: whatsapp } });
        if (name)       orClauses.push({ name:     { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } });

        const matchQuery = { $or: orClauses };

        // ── Build profile update payload ─────────────────────────────────────
        // tutorCode and phone/whatsapp are synced from Odoo (Odoo is master)
        const profileUpdate = {};
        if (tutorCode)  profileUpdate.tutorCode  = tutorCode;
        if (phone)      profileUpdate.phone      = phone;
        if (whatsapp)   profileUpdate.whatsapp   = whatsapp;
        if (name)       profileUpdate.name       = name;

        const email       = (ot.x_studio_email_address_2   || "").trim();
        const city        = (ot.x_studio_city_3            || "").trim();
        const area        = (ot.x_studio_area_3            || "").trim();
        const pincode     = (ot.x_studio_pincode_3         || "").trim();
        const fullAddress = (ot.x_studio_full_address      || "").trim();
        const qual        = (ot.x_studio_qualification_2   || "").trim();
        const exp         = (ot.x_studio_experience_2      || "").trim();
        const maxTravel   = (ot.x_studio_max_travel_distance || "").trim();

        if (email)       profileUpdate.email            = email;
        if (city)        profileUpdate.city             = city;
        if (area)        profileUpdate.area             = area;
        if (pincode)     profileUpdate.pincode          = pincode;
        if (fullAddress) profileUpdate.fullAddress      = fullAddress;
        if (qual)        profileUpdate.qualification    = qual;
        if (exp)         profileUpdate.experience       = exp;
        if (maxTravel)   profileUpdate.maxTravelDistance = maxTravel;

        if (ot.x_studio_grade_can_teach)   profileUpdate.grades   = parseCommaSeparated(ot.x_studio_grade_can_teach);
        if (ot.x_studio_board_can_teach)   profileUpdate.boards   = parseCommaSeparated(ot.x_studio_board_can_teach);
        if (ot.x_studio_subject_2)         profileUpdate.subjects = parseCommaSeparated(ot.x_studio_subject_2);
        if (ot.x_studio_perferred_timings) profileUpdate.timings  = parseCommaSeparated(ot.x_studio_perferred_timings);

        // NEVER touch: onboardingCompleted, onboardingMessageSentAt,
        //              availabilityStatus, status, broadcastHistory

        const result = await Tutor.findOneAndUpdate(
          matchQuery,
          { $set: profileUpdate },
          { new: false }
        );

        if (result) {
          synced++;
          console.log(
            `[SyncService/x_tutor] ✅ Updated: ${name || tutorCode || phone} ` +
            `(tutorCode: ${tutorCode || "(none)"})`
          );
        } else {
          skipped++;
          console.warn(
            `[SyncService/x_tutor] ⚠️  No MongoDB match for Odoo x_tutor record ` +
            `id=${ot.id} name="${name}" tutorCode="${tutorCode}" phone="${phone}"`
          );
        }
      } catch (tutorErr) {
        errors++;
        console.error(`[SyncService/x_tutor] ❌ Error for record id=${ot.id}:`, tutorErr.message);
      }
    }

    await SyncState.findOneAndUpdate(
      { key: SYNC_KEY_XTUTOR },
      {
        lastSyncAt:    new Date(),
        lastSyncCount: synced,
        lastError:     errors > 0 ? `${errors} record(s) failed` : "",
        status:        "idle",
      },
      { upsert: true }
    );

    console.log(
      `[SyncService/x_tutor] ✅ Sync complete: ${synced} updated, ` +
      `${skipped} skipped (no MongoDB match), ${errors} errors`
    );
    return { synced, skipped, errors };

  } catch (err) {
    console.error("[SyncService/x_tutor] Critical sync error:", err.message);
    await SyncState.findOneAndUpdate(
      { key: SYNC_KEY_XTUTOR },
      { lastError: err.message, status: "error" },
      { upsert: true }
    );
    return { synced, skipped, errors: errors + 1 };
  }
}

/**
 * Start the periodic Odoo → MongoDB sync scheduler.
 * Runs every TUTOR_SYNC_INTERVAL_MIN minutes.
 * Runs BOTH x_master_tutors sync AND x_tutor sync.
 */
export function startSyncScheduler() {
  const intervalMs = SYNC_INTERVAL_MIN * 60 * 1000;
  console.log(`[SyncService] Starting Odoo→MongoDB tutor sync every ${SYNC_INTERVAL_MIN} min (both x_master_tutors + x_tutor)`);

  const runBothSyncs = () => Promise.allSettled([
    syncOdooTutorsToMongo().catch(err => console.error("[SyncService] x_master_tutors sync error:", err.message)),
    syncXTutorToMongo().catch(err => console.error("[SyncService] x_tutor sync error:", err.message)),
  ]);

  // Run immediately on startup to catch any missed changes
  setTimeout(() => { runBothSyncs(); }, 30_000);

  setInterval(() => { runBothSyncs(); }, intervalMs);
}

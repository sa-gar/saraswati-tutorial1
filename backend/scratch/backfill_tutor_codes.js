/**
 * backfill_tutor_codes.js  (v2)
 *
 * Two-phase backfill:
 *
 * Phase 1: Odoo → MongoDB
 *   - Runs syncXTutorToMongo(fullResync=true)
 *   - Updates MongoDB tutors that have a matching x_tutor record in Odoo
 *
 * Phase 2: MongoDB self-repair
 *   - Cleans up tutorCode = "undefined" (literal string) → sets to "" (empty)
 *   - Generates local TUT-XXXX codes for all MongoDB tutors that STILL have no tutorCode
 *     using the same format as Odoo (TUT-0001, TUT-0002, ...)
 *   - Only generates codes for tutors NOT yet in Odoo (i.e., no x_tutor record match)
 *     so we don't conflict with Odoo's numbering
 *
 * Safe to run multiple times.
 *
 * Run: node scratch/backfill_tutor_codes.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Tutor from "../models/Tutor.js";
import { syncXTutorToMongo } from "../utils/syncService.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // ── Pre-check ──────────────────────────────────────────────────────────────
    const totalTutors = await Tutor.countDocuments({});
    const missingCode = await Tutor.countDocuments({
      $or: [
        { tutorCode: { $exists: false } },
        { tutorCode: "" },
        { tutorCode: "undefined" },
        { tutorCode: null },
      ],
    });
    console.log(`MongoDB Tutors: ${totalTutors} total, ${missingCode} missing/invalid tutorCode\n`);

    // ── Phase 1: Fix literal "undefined" strings ───────────────────────────────
    console.log("Phase 1: Cleaning up tutorCode = \"undefined\" strings...");
    const repairResult = await Tutor.updateMany(
      { tutorCode: "undefined" },
      { $set: { tutorCode: "" } }
    );
    console.log(`  Fixed: ${repairResult.modifiedCount} records\n`);

    // ── Phase 2: Odoo x_tutor → MongoDB sync (full resync) ────────────────────
    console.log("Phase 2: Syncing all x_tutor records from Odoo into MongoDB...");
    const syncResult = await syncXTutorToMongo(true);
    console.log(`  Synced:  ${syncResult.synced}`);
    console.log(`  Skipped: ${syncResult.skipped} (no MongoDB match)`);
    console.log(`  Errors:  ${syncResult.errors}\n`);

    // ── Phase 3: Generate local TUT codes for tutors with no Odoo record ───────
    console.log("Phase 3: Generating local TUT codes for unmatched MongoDB tutors...");

    // Find the highest existing tutorCode number (from Odoo or earlier runs)
    const existingCodes = await Tutor.distinct("tutorCode", {
      tutorCode: { $nin: ["", null, "undefined"] },
      tutorCode: { $exists: true },
    });

    // Parse numeric suffix from codes like "TUT-001", "TUT-0001", "TUT0001"
    let maxNum = 0;
    for (const code of existingCodes) {
      const m = String(code).match(/(\d+)$/);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    }
    console.log(`  Highest existing tutorCode number: ${maxNum}`);

    // Find all tutors still missing a code
    const noCodeTutors = await Tutor.find({
      $or: [
        { tutorCode: { $exists: false } },
        { tutorCode: "" },
        { tutorCode: null },
      ],
    }, { _id: 1, name: 1, phone: 1 }).lean();

    console.log(`  Tutors needing a generated code: ${noCodeTutors.length}`);

    let generated = 0;
    for (const tutor of noCodeTutors) {
      maxNum++;
      const newCode = `TUT-${String(maxNum).padStart(3, "0")}`;
      await Tutor.updateOne(
        { _id: tutor._id },
        { $set: { tutorCode: newCode } }
      );
      generated++;
    }
    console.log(`  Generated ${generated} new codes (TUT-${String(maxNum - generated + 1).padStart(3,"0")} → TUT-${String(maxNum).padStart(3,"0")})\n`);

    // ── Final summary ──────────────────────────────────────────────────────────
    const stillMissing = await Tutor.countDocuments({
      $or: [
        { tutorCode: { $exists: false } },
        { tutorCode: "" },
        { tutorCode: "undefined" },
        { tutorCode: null },
      ],
    });
    console.log("══════════════════════════════");
    console.log(`Final state: ${stillMissing} tutors still missing tutorCode (should be 0)`);

    const sample = await Tutor.find(
      {},
      { name: 1, tutorCode: 1, phone: 1, city: 1 }
    ).sort({ tutorCode: 1 }).limit(10).lean();

    console.log("\nSample (sorted by tutorCode):");
    sample.forEach(t =>
      console.log(`  name="${t.name}"  tutorCode="${t.tutorCode}"  phone="${t.phone}"  city="${t.city}"`)
    );
    console.log("══════════════════════════════");

  } catch (err) {
    console.error("Fatal error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

run();

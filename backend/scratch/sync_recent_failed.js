import dns from "dns";
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
import mongoose from "mongoose";
import fs from "fs";
import Attendance from "../models/Attendance.js";
import ParentEnquiry from "../models/ParentEnquiry.js";
import Tutor from "../models/Tutor.js";
import { syncAttendanceLogToOdoo } from "../utils/odooService.js";

const envPath = "c:/Users/DELL/OneDrive/Desktop/saraswati-tutorial1-main/backend/.env";
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

async function syncRecentFailed() {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Find the top 10 most recent attendance records that are not synced yet
  const logs = await Attendance.find({ odooSyncStatus: { $ne: "synced" } })
    .sort({ createdAt: -1 })
    .limit(10);

  console.log(`Found ${logs.length} recent unsynced attendance records. Syncing to Odoo...`);

  let successCount = 0;
  for (const log of logs) {
    try {
      const lead = await ParentEnquiry.findById(log.parentEnquiryId);
      const tutor = log.tutorId ? await Tutor.findById(log.tutorId) : null;
      console.log(`Syncing attendance ${log._id} for student: ${log.studentName} (${log.requirementId})...`);
      const res = await syncAttendanceLogToOdoo({ log, lead, tutor });
      if (res.success) {
        successCount++;
        console.log(`✅ Synced ${log.externalAttendanceId} -> Odoo Attendance #${res.data?.attendance_id}`);
      } else {
        console.warn(`❌ Failed: ${res.error}`);
      }
    } catch (err) {
      console.error(`Error on log ${log._id}:`, err.message);
    }
  }

  console.log(`\nBatch sync completed: ${successCount}/${logs.length} successfully synchronized to Odoo.`);
  await mongoose.disconnect();
}

syncRecentFailed().catch(console.error);

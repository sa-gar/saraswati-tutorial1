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

async function syncAllUnsyncedAttendance() {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const totalLogs = await Attendance.countDocuments();
  const alreadySynced = await Attendance.countDocuments({ odooSyncStatus: "synced" });
  const pendingLogs = await Attendance.find({ odooSyncStatus: { $ne: "synced" } }).sort({ date: 1, sessionNumber: 1 });

  console.log(`\n=== Attendance Sync Status in MongoDB ===`);
  console.log(`Total Attendance Records: ${totalLogs}`);
  console.log(`Already Synced to Odoo  : ${alreadySynced}`);
  console.log(`Remaining to Sync       : ${pendingLogs.length}\n`);

  if (pendingLogs.length === 0) {
    console.log("All attendance records are already synced to Odoo!");
    await mongoose.disconnect();
    return;
  }

  let successCount = 0;
  let failureCount = 0;
  const failedDetails = [];

  for (let i = 0; i < pendingLogs.length; i++) {
    const log = pendingLogs[i];
    try {
      const lead = await ParentEnquiry.findById(log.parentEnquiryId);
      const tutor = log.tutorId ? await Tutor.findById(log.tutorId) : null;

      const progress = `[${i + 1}/${pendingLogs.length}]`;
      const res = await syncAttendanceLogToOdoo({ log, lead, tutor, postChatter: false });

      if (res.success) {
        successCount++;
        console.log(`${progress} ✅ ${log.externalAttendanceId || log._id} -> Odoo Attendance #${res.data?.attendance_id || log.odooAttendanceId} (${log.studentName || "Student"})`);
      } else {
        failureCount++;
        console.warn(`${progress} ❌ ${log.externalAttendanceId || log._id} (${log.studentName}): ${res.error}`);
        failedDetails.push({ id: log._id, student: log.studentName, error: res.error });
      }
    } catch (err) {
      failureCount++;
      console.error(`[${i + 1}/${pendingLogs.length}] ❌ Exception for log ${log._id}:`, err.message);
      failedDetails.push({ id: log._id, student: log.studentName, error: err.message });
    }

    // Small 100ms pause to be polite to Odoo API
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n=== SYNC COMPLETE ===`);
  console.log(`Successfully Synced : ${successCount}`);
  console.log(`Failed              : ${failureCount}`);
  if (failedDetails.length > 0) {
    console.log("Failed items:", JSON.stringify(failedDetails.slice(0, 10), null, 2));
  }

  const finalSynced = await Attendance.countDocuments({ odooSyncStatus: "synced" });
  console.log(`Final Odoo-synced count in MongoDB: ${finalSynced}/${totalLogs}`);

  await mongoose.disconnect();
}

syncAllUnsyncedAttendance().catch(console.error);

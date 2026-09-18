import dns from "dns";
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
import mongoose from "mongoose";
import fs from "fs";
import Attendance from "../models/Attendance.js";
import ParentEnquiry from "../models/ParentEnquiry.js";
import Tutor from "../models/Tutor.js";
import { syncAttendanceLogToOdoo, createLead } from "../utils/odooService.js";

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

const ODOO_URL = (env.ODOO_COMMUNITY_URL || env.ODOO_URL || "https://odoo.saraswatitutorial.com").replace(/\/+$/, "");
const DB = env.ODOO_DB || "saraswati-tutorial";
const USERNAME = env.ODOO_USERNAME || "admin";
const PASSWORD = env.ODOO_PASSWORD || "";
const JSONRPC_URL = `${ODOO_URL}/jsonrpc`;

async function testSync346() {
  await mongoose.connect(env.MONGO_URI);

  const lead = await ParentEnquiry.findOne({ requirementId: "REQ-00346" });
  console.log("Lead 346 before:", {
    odooLeadId: lead.odooLeadId,
    requirementId: lead.requirementId,
    websiteStudentId: lead.websiteStudentId
  });

  // Call createLead to ensure it exists in Odoo
  const leadRes = await createLead({
    ...lead.toObject(),
    requirementId: lead.requirementId,
    websiteStudentId: lead.websiteStudentId,
    userType: "parent"
  });
  console.log("createLead result for 346:", leadRes);
  lead.odooLeadId = leadRes.id;
  await lead.save();

  // Now sync an attendance for 346
  const att = await Attendance.findOne({ parentEnquiryId: lead._id });
  console.log("Attendance before:", {
    id: att._id,
    externalAttendanceId: att.externalAttendanceId,
    status: att.status,
    odooSyncStatus: att.odooSyncStatus,
    odooSyncError: att.odooSyncError
  });

  const tutor = att.tutorId ? await Tutor.findById(att.tutorId) : null;
  const syncRes = await syncAttendanceLogToOdoo({
    log: att,
    lead,
    tutor
  });
  console.log("syncAttendanceLogToOdoo result:", syncRes);

  const attAfter = await Attendance.findById(att._id);
  console.log("Attendance after:", {
    odooSyncStatus: attAfter.odooSyncStatus,
    odooAttendanceId: attAfter.odooAttendanceId,
    odooSyncError: attAfter.odooSyncError
  });

  await mongoose.disconnect();
}

testSync346().catch(console.error);

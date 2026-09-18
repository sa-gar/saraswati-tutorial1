import dns from "dns";
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

import mongoose from "mongoose";
import fs from "fs";
import Attendance from "../models/Attendance.js";
import ParentEnquiry from "../models/ParentEnquiry.js";

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

async function callOdoo(service, method, args) {
  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: { service, method, args },
    id: Math.floor(Math.random() * 1000000),
  };
  const res = await fetch(JSONRPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error?.data?.message || data.error?.message || "Odoo Error");
  return data.result;
}

async function check() {
  await mongoose.connect(env.MONGO_URI);
  console.log("=== MONGODB ATTENDANCE STATUS ===");
  const totalMongo = await Attendance.countDocuments();
  console.log("Total Attendance in MongoDB:", totalMongo);

  const statusCounts = await Attendance.aggregate([
    { $group: { _id: "$odooSyncStatus", count: { $sum: 1 } } }
  ]);
  console.log("Sync Status Breakdown in MongoDB:", statusCounts);

  const recentAttendance = await Attendance.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  console.log("Most recent 5 MongoDB attendance records:");
  console.log(recentAttendance.map(a => ({
    id: a._id,
    externalAttendanceId: a.externalAttendanceId,
    studentName: a.studentName,
    requirementId: a.requirementId,
    websiteStudentId: a.websiteStudentId,
    status: a.status,
    odooSyncStatus: a.odooSyncStatus,
    odooAttendanceId: a.odooAttendanceId,
    date: a.date,
    createdAt: a.createdAt,
    odooSyncError: a.odooSyncError,
  })));

  console.log("\n=== ODOO COMMUNITY STATUS ===");
  const uid = await callOdoo("common", "authenticate", [DB, USERNAME, PASSWORD, {}]);
  console.log("Authenticated with Odoo, UID:", uid);

  // Total records in tuition.attendance
  const odooAttendanceCount = await callOdoo("object", "execute_kw", [
    DB, uid, PASSWORD, "tuition.attendance", "search_count",
    [[]]
  ]);
  console.log("Total records in Odoo tuition.attendance:", odooAttendanceCount);

  // List recent tuition.attendance records in Odoo
  const recentOdooAttendance = await callOdoo("object", "execute_kw", [
    DB, uid, PASSWORD, "tuition.attendance", "search_read",
    [[]],
    { fields: ["id", "lead_id", "website_student_id", "external_attendance_id", "tutor_name", "status", "class_datetime", "create_date"], limit: 10, order: "id desc" }
  ]);
  console.log("Recent Odoo attendance records:", JSON.stringify(recentOdooAttendance, null, 2));

  // Check Odoo Menus to see where attendance is shown in the UI
  const menus = await callOdoo("object", "execute_kw", [
    DB, uid, PASSWORD, "ir.ui.menu", "search_read",
    [[["name", "ilike", "attendance"]]],
    { fields: ["id", "name", "parent_id", "action"] }
  ]);
  console.log("\nOdoo menus mentioning 'attendance':", menus);

  // Check tuition menus
  const tuitionMenus = await callOdoo("object", "execute_kw", [
    DB, uid, PASSWORD, "ir.ui.menu", "search_read",
    [[["name", "ilike", "tuition"]]],
    { fields: ["id", "name", "parent_id", "action"] }
  ]);
  console.log("Odoo menus mentioning 'tuition':", tuitionMenus);

  // Check actions for tuition.attendance
  const actions = await callOdoo("object", "execute_kw", [
    DB, uid, PASSWORD, "ir.actions.act_window", "search_read",
    [[["res_model", "=", "tuition.attendance"]]],
    { fields: ["id", "name", "res_model", "view_mode"] }
  ]);
  console.log("Window actions for tuition.attendance:", actions);

  await mongoose.disconnect();
}

check().catch(console.error);

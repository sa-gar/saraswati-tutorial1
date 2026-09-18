import dns from "dns";
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
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
  const uid = await callOdoo("common", "authenticate", [DB, USERNAME, PASSWORD, {}]);

  // Check requirement REQ-00346 in MongoDB
  const lead346 = await ParentEnquiry.findOne({ requirementId: "REQ-00346" });
  console.log("MongoDB Lead REQ-00346:", {
    id: lead346?._id,
    reqId: lead346?.requirementId,
    stuId: lead346?.websiteStudentId,
    odooLeadId: lead346?.odooLeadId,
    odooSyncStatus: lead346?.odooSyncStatus
  });

  // Check in Odoo for this lead
  if (lead346?.odooLeadId) {
    const odooLead = await callOdoo("object", "execute_kw", [
      DB, uid, PASSWORD, "crm.lead", "search_read",
      [[["id", "=", Number(lead346.odooLeadId)]]],
      { fields: ["id", "name", "website_student_id", "requirement_id"] }
    ]);
    console.log("Odoo Lead by odooLeadId:", odooLead);
  }

  // Check in Odoo for any lead with website_student_id = STU-00346
  const odooByStu = await callOdoo("object", "execute_kw", [
    DB, uid, PASSWORD, "crm.lead", "search_read",
    [[["website_student_id", "=", "STU-00346"]]],
    { fields: ["id", "name", "website_student_id", "requirement_id"] }
  ]);
  console.log("Odoo Leads with website_student_id = STU-00346:", odooByStu);

  // Check in Odoo for any lead with requirement_id = REQ-00346
  const odooByReq = await callOdoo("object", "execute_kw", [
    DB, uid, PASSWORD, "crm.lead", "search_read",
    [[["requirement_id", "=", "REQ-00346"]]],
    { fields: ["id", "name", "website_student_id", "requirement_id"] }
  ]);
  console.log("Odoo Leads with requirement_id = REQ-00346:", odooByReq);

  // How many total leads in Odoo have website_student_id set?
  const countWithStuId = await callOdoo("object", "execute_kw", [
    DB, uid, PASSWORD, "crm.lead", "search_count",
    [[["website_student_id", "!=", false]]]
  ]);
  console.log("Total leads in Odoo with website_student_id set:", countWithStuId);

  // How many total leads in Odoo?
  const totalLeads = await callOdoo("object", "execute_kw", [
    DB, uid, PASSWORD, "crm.lead", "search_count",
    [[]]
  ]);
  console.log("Total crm.lead in Odoo:", totalLeads);

  await mongoose.disconnect();
}

check().catch(console.error);

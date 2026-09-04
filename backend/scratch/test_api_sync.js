import fetch from "node-fetch";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config({ path: "backend/.env" });

async function run() {
  const token = jwt.sign(
    { id: "admin-test", email: process.env.ADMIN_EMAIL, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // 1. Get a lead from /api/parent-enquiries
  const leadsRes = await fetch("http://localhost:5000/api/parent-enquiries", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const leads = await leadsRes.json();
  console.log(`Fetched ${leads.length} parent enquiries.`);

  // Pick a lead with completed classes > 0
  const targetLead = leads.find(l => (l.completedClasses || 0) > 0) || leads[0];
  console.log("Target lead for sync test:", {
    _id: targetLead._id,
    parentName: targetLead.parentName,
    studentName: targetLead.wards?.[0]?.studentName,
    requirementId: targetLead.requirementId,
    odooLeadId: targetLead.odooLeadId,
    completedClasses: targetLead.completedClasses,
    totalClasses: targetLead.totalClasses,
  });

  // 2. Call single-lead sync
  console.log(`Syncing lead ${targetLead._id} to Odoo...`);
  const syncRes = await fetch(`http://localhost:5000/api/attendance/sync-lead-to-odoo/${targetLead._id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });
  const syncData = await syncRes.json();
  console.log("Sync Response:", syncData);
}

run().catch(console.error);

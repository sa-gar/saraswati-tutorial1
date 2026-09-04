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

  console.log("Triggering batch sync to Odoo...");
  const startTime = Date.now();
  const res = await fetch("http://localhost:5000/api/attendance/sync-all-to-odoo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Sync finished in ${elapsed}s:`, data);
}

run().catch(console.error);

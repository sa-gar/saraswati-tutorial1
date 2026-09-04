import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function run() {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "common",
        method: "authenticate",
        args: [DB, USERNAME, PASSWORD, {}],
      },
      id: 1,
    }),
  });
  const authData = await res.json();
  const uid = authData.result;

  const targetFields = [
    "x_studio_completed_classes",
    "x_studio_total_classes",
    "x_studio_remaining_classes",
    "x_studio_last_attendance_status",
    "x_studio_last_class_topics",
    "x_studio_last_missed_reason",
  ];

  const checkRes = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          DB,
          uid,
          PASSWORD,
          "ir.model.fields",
          "search_read",
          [[
            ["model", "=", "crm.lead"],
            ["name", "in", targetFields]
          ]],
          { fields: ["name", "field_description", "ttype"] }
        ],
      },
      id: 2,
    }),
  });
  const checkData = await checkRes.json();
  console.log("Existing fields:", checkData.result);
}

run();

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
  console.log("Logged in UID:", uid);

  // Search for sample parent lead
  const leadRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
          "crm.lead",
          "search_read",
          [[["x_studio_type", "=", "Parent"]]],
          { fields: ["id", "name", "contact_name", "phone", "x_studio_requirement_id"], limit: 5 }
        ],
      },
      id: 2,
    }),
  });
  const leadData = await leadRes.json();
  console.log("Sample CRM Leads:", leadData.result);
}

run();

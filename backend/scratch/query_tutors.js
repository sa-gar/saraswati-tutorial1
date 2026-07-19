import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function authRpc(method, args) {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", method: "call", id: Math.random(),
      params: { service: "common", method, args },
    }),
  });
  const json = await res.json();
  return json.result;
}

async function rpc(uid, model, method, args = [], kwargs = {}) {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", method: "call", id: Math.random(),
      params: { service: "object", method: "execute_kw", args: [DB, uid, PASSWORD, model, method, args, kwargs] },
    }),
  });
  const json = await res.json();
  return json.result;
}

async function run() {
  const uid = await authRpc("authenticate", [DB, USERNAME, PASSWORD, {}]);
  
  // Let's get the list of fields on x_tutor
  const fields = await rpc(uid, "x_tutor", "fields_get", [], { attributes: ["string", "type"] });
  
  // Filter fields that are named x_studio_tutor_id or similar
  const tutorIdFields = Object.keys(fields).filter(k => k.includes("tutor_id"));
  console.log("Tutor ID fields on x_tutor:", tutorIdFields);

  // Search for any records in x_tutor
  const records = await rpc(uid, "x_tutor", "search_read", [[]], { limit: 10 });
  console.log(`Found ${records.length} records in x_tutor.`);
  
  if (records.length > 0) {
    console.log("Fields with values in the first record:");
    const firstRec = records[0];
    for (const [k, v] of Object.entries(firstRec)) {
      if (v !== false && v !== null && v !== "") {
        console.log(`  ${k} (${fields[k] ? fields[k].string : "unknown"}): ${JSON.stringify(v)}`);
      }
    }
  }
}

run().catch(console.error);

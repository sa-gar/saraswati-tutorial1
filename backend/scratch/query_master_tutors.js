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
  
  // Let's get the list of fields on x_master_tutors
  const fields = await rpc(uid, "x_master_tutors", "fields_get", [], { attributes: ["string", "type"] });
  console.log("Fields on x_master_tutors:", Object.keys(fields));

  // Search for any records in x_master_tutors
  const records = await rpc(uid, "x_master_tutors", "search_read", [[]], { limit: 10 });
  console.log(`Found ${records.length} records in x_master_tutors.`);
  if (records.length > 0) {
    console.log("First 3 records:");
    records.slice(0, 3).forEach(r => {
      console.log(`  id=${r.id}  x_name=${r.x_name}  x_tutor_id=${r.x_tutor_id}  x_mobile=${r.x_mobile}`);
    });
  }
}

run().catch(console.error);

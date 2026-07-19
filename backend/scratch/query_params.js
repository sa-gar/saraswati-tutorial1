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
  
  // Search for config parameters
  const params = await rpc(uid, "ir.config_parameter", "search_read", 
    [[["key", "like", "saraswati"]]], 
    { fields: ["key", "value"] }
  );
  console.log("Saraswati Config Parameters:", JSON.stringify(params, null, 2));
}

run().catch(console.error);

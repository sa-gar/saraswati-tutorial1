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

  const access = await (await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [DB, uid, PASSWORD, "ir.model.access", "search_read", [[["model_id.model", "=", "x_master_tutors"]]], {}],
      },
      id: 2,
    }),
  })).json();

  console.log("x_master_tutors access rules:", access.result);
}

run();

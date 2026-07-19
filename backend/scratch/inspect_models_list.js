import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function run() {
  try {
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
    console.log("Logged in, UID:", uid);

    // List window actions containing tutor or match or matching
    const actionsRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "ir.actions.act_window",
            "search_read",
            [[
              "|",
              "|",
              ["name", "like", "Tutor"],
              ["name", "like", "Match"],
              ["res_model", "like", "tutor"],
            ]],
            { fields: ["name", "res_model", "domain", "context", "binding_model_id"] }
          ],
        },
        id: 2,
      }),
    });
    const actionsData = await actionsRes.json();
    console.log("Found Window Actions:");
    console.log(JSON.stringify(actionsData.result, null, 2));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();

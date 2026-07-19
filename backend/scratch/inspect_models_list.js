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

    // List models from ir.model containing "Matching" or "Match" or "Tutor" in name or model
    const modelsRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "ir.model",
            "search_read",
            [[
              "|",
              "|",
              ["model", "like", "match"],
              ["name", "like", "Match"],
              ["name", "like", "Tutor"],
            ]],
            { fields: ["model", "name"] }
          ],
        },
        id: 2,
      }),
    });
    const modelsData = await modelsRes.json();
    console.log("Found models:");
    console.log(JSON.stringify(modelsData.result, null, 2));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();

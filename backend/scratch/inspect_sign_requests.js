import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function listSignRequests() {
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

    console.log("Searching for recent sign.request records...");
    const tmplRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "sign.request",
            "search_read",
            [[]],
            { fields: ["id", "reference", "state", "request_item_ids", "create_date"], limit: 5, order: "id desc" }
          ],
        },
        id: 2,
      }),
    });
    const tmplData = await tmplRes.json();
    console.log("Sign Requests:");
    console.log(JSON.stringify(tmplData.result, null, 2));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

listSignRequests();

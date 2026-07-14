import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function searchSign() {
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

    console.log("Searching sign.request.item records...");
    const searchRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "sign.request.item",
            "search_read",
            [[]], // search all first to see what values we have
            { fields: ["id", "signer_email", "sms_number", "state", "sign_link", "reference"], limit: 20, order: "id desc" }
          ],
        },
        id: 2,
      }),
    });
    const searchData = await searchRes.json();
    console.log("Results:");
    console.log(JSON.stringify(searchData.result, null, 2));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

searchSign();

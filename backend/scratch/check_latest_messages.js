import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function checkLatestMessages() {
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

    console.log("Checking latest WhatsApp messages status...");
    const msgRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "whatsapp.message",
            "search_read",
            [[]],
            { fields: ["id", "mobile_number", "state", "failure_type", "failure_reason", "create_date", "wa_template_id"], limit: 10, order: "id desc" }
          ],
        },
        id: 2,
      }),
    });
    const msgData = await msgRes.json();
    console.log("Latest messages:");
    console.log(JSON.stringify(msgData.result, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

checkLatestMessages();

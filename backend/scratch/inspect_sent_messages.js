import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function inspectSent() {
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

    console.log("Searching for successfully sent whatsapp.message records...");
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
            [[["state", "=", "sent"]]],
            { fields: ["id", "state", "mobile_number", "body", "create_date", "wa_template_id"], limit: 5, order: "id desc" }
          ],
        },
        id: 2,
      }),
    });
    const msgData = await msgRes.json();
    console.log("Sent messages:");
    console.log(JSON.stringify(msgData.result, null, 2));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

inspectSent();

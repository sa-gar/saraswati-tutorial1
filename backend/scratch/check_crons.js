import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function checkCrons() {
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

    console.log("Searching for cron jobs related to WhatsApp...");
    const cronRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "ir.cron",
            "search_read",
            [[["name", "ilike", "whatsapp"]]],
            { fields: ["id", "name", "active", "nextcall", "interval_number", "interval_type"] }
          ],
        },
        id: 2,
      }),
    });
    const cronData = await cronRes.json();
    console.log("WhatsApp Crons:");
    console.log(JSON.stringify(cronData.result, null, 2));

    // Also list all active crons that are due
    const allCronsRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "ir.cron",
            "search_read",
            [[["active", "=", true]]],
            { fields: ["id", "name", "nextcall", "interval_number", "interval_type"], limit: 30 }
          ],
        },
        id: 3,
      }),
    });
    const allCronsData = await allCronsRes.json();
    console.log("Active Crons:");
    console.log(JSON.stringify(allCronsData.result, null, 2));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

checkCrons();

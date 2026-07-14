import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function inspectModel() {
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

    console.log("Querying methods/buttons of whatsapp.message...");
    // We can fetch the fields first
    const fieldsRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "fields_get",
            [],
            {}
          ],
        },
        id: 2,
      }),
    });
    const fieldsData = await fieldsRes.json();
    console.log("Fields on whatsapp.message:", Object.keys(fieldsData.result || {}));

    // In Odoo, check if method 'send' or 'action_send' or 'send_message' exists.
    // Let's test calling 'action_send_message' or 'send'
    const testMethods = ["action_send_message", "action_send", "send", "send_message", "button_send"];
    for (const m of testMethods) {
      try {
        const testRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
                m,
                [[1]] // dummy ID
              ],
            },
            id: 3,
          }),
        });
        const testData = await testRes.json();
        console.log(`Method ${m} response:`, testData.error ? testData.error.data.message : "Success/No AttributeError");
      } catch (err) {
        console.log(`Method ${m} call failed:`, err.message);
      }
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
}

inspectModel();

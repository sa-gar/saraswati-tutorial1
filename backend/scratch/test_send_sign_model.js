import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function rpcCall(uid, model, method, args, kwargs = {}) {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [DB, uid, PASSWORD, model, method, args, kwargs],
      },
      id: Math.floor(Math.random() * 10000),
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}

async function sendTutorAgreementWithSignModel() {
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
    console.log("Authenticated. UID:", uid);

    // The Tutor Agreement template (ID 72) has model = sign.request
    // So we need to send from a sign.request record

    // Look for a sign.request record that has a sms_number matching our test phone
    // Or use the most recent sign.request
    const recentRequests = await rpcCall(uid, "sign.request", "search_read", [[]], { fields: ["id", "reference", "state", "request_item_ids"], limit: 5, order: "id desc" });
    console.log("Recent sign.request records:", recentRequests);

    if (!recentRequests || recentRequests.length === 0) {
      console.log("No sign.request records found.");
      return;
    }

    const signRequestId = recentRequests[0].id;
    console.log(`\nUsing sign.request ID: ${signRequestId}`);

    // Create composer with res_model = sign.request and res_ids = [signRequestId]
    const composerPayload = {
      res_model: "sign.request",
      res_ids: JSON.stringify([signRequestId]),
      wa_template_id: 72, // Tutor Agreement
      phone: "9380046541",  // Test phone number
      batch_mode: false,
      button_dynamic_url_1: "https://saraswati-tutorials.odoo.com/sign/document/236/34e44623-2aab-419b-93ad-1200fbeaab1c",
    };

    console.log("\nCreating whatsapp.composer with sign.request model...");
    console.log("Payload:", JSON.stringify(composerPayload, null, 2));

    const composerId = await rpcCall(uid, "whatsapp.composer", "create", [composerPayload]);
    console.log("Composer ID:", composerId);

    // Now trigger the send action
    console.log("\nSending template...");
    const result = await rpcCall(uid, "whatsapp.composer", "action_send_whatsapp_template", [[composerId]]);
    console.log("Send result:", result);

  } catch (err) {
    console.error("Error:", err.message);
  }
}

sendTutorAgreementWithSignModel();

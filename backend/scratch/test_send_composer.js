import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function testSend() {
  try {
    console.log("Authenticating...");
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

    const templateName = "Tutor Agreement";
    console.log("Searching for template:", templateName);
    const templatesRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "whatsapp.template",
            "search_read",
            [[["name", "=", templateName], ["status", "=", "approved"]]],
            { fields: ["id", "name"], limit: 1 }
          ],
        },
        id: 2,
      }),
    });
    const templatesData = await templatesRes.json();
    if (!templatesData.result || templatesData.result.length === 0) {
      console.log("Template not found!");
      return;
    }
    const templateId = templatesData.result[0].id;
    console.log("Template ID:", templateId);

    // Let's search for a valid res.partner ID to link to.
    const partnerRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "res.partner",
            "search",
            [[]],
            { limit: 1 }
          ],
        },
        id: 3,
      }),
    });
    const partnerData = await partnerRes.json();
    const partnerId = partnerData.result?.[0] || 1;
    console.log("Linking to partner ID:", partnerId);

    const composerPayload = {
      res_model: "res.partner",
      res_ids: JSON.stringify([partnerId]),
      wa_template_id: templateId,
      phone: "9380046541",
      batch_mode: false
    };
    console.log("Creating whatsapp.composer with payload:", composerPayload);
    const compRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "whatsapp.composer",
            "create",
            [composerPayload]
          ],
        },
        id: 4,
      }),
    });
    const compData = await compRes.json();
    console.log("Create composer response:", compData);
    if (compData.error) return;

    const composerId = compData.result;
    console.log("Composer created with ID:", composerId);

    console.log("Triggering action_send_whatsapp_template...");
    const sendRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "whatsapp.composer",
            "action_send_whatsapp_template",
            [[composerId]]
          ],
        },
        id: 5,
      }),
    });
    const sendData = await sendRes.json();
    console.log("Send response:", sendData);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testSend();

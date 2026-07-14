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
            { fields: ["id", "name", "body"], limit: 1 }
          ],
        },
        id: 2,
      }),
    });
    const templatesData = await templatesRes.json();
    console.log("Template search result:", templatesData.result);

    if (!templatesData.result || templatesData.result.length === 0) {
      console.log("Template not found!");
      return;
    }

    const templateId = templatesData.result[0].id;
    const phoneNumber = "9380046541";
    console.log(`Creating whatsapp.message for phone: ${phoneNumber}, template ID: ${templateId}...`);

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
            "create",
            [{
              mobile_number: phoneNumber,
              wa_template_id: templateId,
              free_text_json: {},
            }]
          ],
        },
        id: 3,
      }),
    });
    const msgData = await msgRes.json();
    console.log("Create message response:", msgData);

    if (msgData.error) {
      console.error("Create message error:", msgData.error);
      return;
    }

    const msgId = msgData.result;
    console.log("Message created with ID:", msgId);

    console.log("Attempting to send message via button_send_message...");
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
            "whatsapp.message",
            "button_send_message",
            [[msgId]]
          ],
        },
        id: 4,
      }),
    });
    const sendData = await sendRes.json();
    console.log("Send message response:", sendData);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testSend();

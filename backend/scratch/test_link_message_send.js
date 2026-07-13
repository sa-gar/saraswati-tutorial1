import { callOdoo } from "../utils/odooService.js";
import dotenv from "dotenv";

dotenv.config();

const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function main() {
  console.log("Authenticating with Odoo...");
  const uid = await callOdoo("common", "authenticate", [
    DB,
    USERNAME,
    PASSWORD,
    {},
  ]);
  console.log("Logged in with UID:", uid);

  const phone = "918674892407";

  console.log("1. Creating mail.message...");
  const mailMsgId = await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "mail.message",
    "create",
    [{
      body: "<p>Hello! Direct trigger of ir.cron test.</p>",
      message_type: "comment",
      model: "whatsapp.message"
    }]
  ]);
  console.log("Created Mail Msg ID:", mailMsgId);

  console.log("2. Creating outbound whatsapp.message linked to mail.message...");
  const msgId = await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "whatsapp.message",
    "create",
    [{
      mobile_number: phone,
      message_type: "outbound",
      state: "outgoing",
      wa_account_id: 2,
      mail_message_id: mailMsgId
    }]
  ]);
  console.log("Created WhatsApp Msg ID:", msgId);

  console.log("3. Triggering Odoo WhatsApp Cron immediately via ir.cron.method_direct_trigger...");
  try {
    const res = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "ir.cron",
      "method_direct_trigger",
      [[19]] // Cron ID 19 is "WhatsApp : Send In Queue Messages"
    ]);
    console.log("Cron execution triggered! Result:", res);
  } catch (cronErr) {
    console.error("Failed to run cron direct trigger:", cronErr.message);
  }

  // Poll for status update in Odoo
  console.log("4. Polling for delivery status update...");
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 3500));
    const msg = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "whatsapp.message",
      "read",
      [[msgId]],
      { fields: ["id", "state", "failure_type", "failure_reason", "body", "msg_uid"] }
    ]);
    console.log(`Poll #${i+1}: State = ${msg[0].state}, Failure: ${msg[0].failure_reason || "None"}, Msg UID: ${msg[0].msg_uid}`);
    if (msg[0].state !== "outgoing") {
      break;
    }
  }
}

main().catch(console.error);

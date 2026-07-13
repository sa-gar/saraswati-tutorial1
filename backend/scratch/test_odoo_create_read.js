import { callOdoo } from "../utils/odooService.js";
import dotenv from "dotenv";

dotenv.config();

const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function main() {
  const uid = await callOdoo("common", "authenticate", [
    DB,
    USERNAME,
    PASSWORD,
    {},
  ]);

  console.log("Creating mail.message first...");
  const mailMsgId = await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "mail.message",
    "create",
    [{
      body: "<p>YES</p>",
      message_type: "comment",
      model: "whatsapp.message"
    }]
  ]);
  console.log("Created Mail Msg ID:", mailMsgId);

  console.log("Creating inbound whatsapp.message linked to mail.message...");
  const msgId = await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "whatsapp.message",
    "create",
    [{
      mobile_number: "9100000001",
      message_type: "inbound",
      state: "received",
      wa_account_id: 2,
      mail_message_id: mailMsgId
    }]
  ]);
  console.log("Created WhatsApp Msg ID:", msgId);

  const msg = await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "whatsapp.message",
    "read",
    [[msgId]],
    { fields: ["id", "body", "mobile_number", "message_type", "state", "mail_message_id"] }
  ]);
  console.log("Read back record:", msg);

  // Clean up
  await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "whatsapp.message",
    "unlink",
    [[msgId]]
  ]);
  await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "mail.message",
    "unlink",
    [[mailMsgId]]
  ]);
}

main().catch(console.error);

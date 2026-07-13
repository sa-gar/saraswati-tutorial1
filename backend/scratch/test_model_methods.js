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

  const phone = "918674892407";

  console.log("Creating dummy mail.message...");
  const mailMsgId = await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "mail.message",
    "create",
    [{
      body: "<p>Hello! Direct method execution test.</p>",
      message_type: "comment",
      model: "whatsapp.message"
    }]
  ]);

  console.log("Creating outgoing whatsapp.message...");
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

  // Methods to try on the whatsapp.message record
  const methods = ["send", "action_send", "action_send_message", "action_send_whatsapp", "send_whatsapp", "process_message"];

  for (const method of methods) {
    console.log(`\nTrying method "${method}" on whatsapp.message record [${msgId}]...`);
    try {
      const res = await callOdoo("object", "execute_kw", [
        DB,
        uid,
        PASSWORD,
        "whatsapp.message",
        method,
        [[msgId]]
      ]);
      console.log(`Method "${method}" executed successfully! Result:`, res);
      // Read back status
      const msg = await callOdoo("object", "execute_kw", [
        DB,
        uid,
        PASSWORD,
        "whatsapp.message",
        "read",
        [[msgId]],
        { fields: ["state", "failure_reason"] }
      ]);
      console.log("Current state:", msg[0].state, "Failure:", msg[0].failure_reason);
      if (msg[0].state !== "outgoing") {
        console.log(`Success! Method "${method}" sent the message immediately.`);
        break;
      }
    } catch (err) {
      console.log(`Method "${method}" failed:`, err.message);
    }
  }

  // Clean up
  await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "whatsapp.message",
    "unlink",
    [[msgId]]
  ]);
}

main().catch(console.error);

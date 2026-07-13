import mongoose from "mongoose";
import dotenv from "dotenv";
import { callOdoo } from "../utils/odooService.js";
import { sendOdooWhatsApp } from "../utils/odooService.js";

dotenv.config();

const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function runTests() {
  console.log("Authenticating with Odoo...");
  const uid = await callOdoo("common", "authenticate", [
    DB,
    USERNAME,
    PASSWORD,
    {},
  ]);
  console.log("Logged in with UID:", uid);

  // Phone numbers for test tutors
  const activePhone = "918674892407"; // Coordinator phone 1
  const expiredPhone = "916362999434"; // Test phone 2

  // 1. Setup simulated active window for Tutor ActiveWindow (activePhone)
  console.log("\n--- TEST CASE 1: ACTIVE WINDOW TUTOR ---");
  console.log(`Creating dummy inbound message in Odoo to simulate active 24h window for phone ${activePhone}...`);
  
  const mailMsgId = await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "mail.message",
    "create",
    [{
      body: "<p>YES I am interested</p>",
      message_type: "comment",
      model: "whatsapp.message"
    }]
  ]);

  const activeInboundId = await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "whatsapp.message",
    "create",
    [{
      mobile_number: activePhone,
      message_type: "inbound",
      state: "received",
      wa_account_id: 2,
      mail_message_id: mailMsgId
    }]
  ]);
  console.log("Simulated active window inbound Msg ID:", activeInboundId);

  // Dispatch custom free-form notification
  console.log(`Sending custom free-form text broadcast to active window tutor ${activePhone}...`);
  const activeRes = await sendOdooWhatsApp(
    activePhone, 
    "Hello Active Tutor, a new mathematics teaching requirement has been assigned to you. Reply YES to confirm.",
    "Tutor ActiveWindow"
  );
  console.log("Active Tutor Send Result:", activeRes);

  // 2. Setup Tutor ExpiredWindow (expiredPhone) with no recent inbound messages
  console.log("\n--- TEST CASE 2: EXPIRED WINDOW TUTOR ---");
  console.log(`Sending broadcast to expired window tutor ${expiredPhone} (should trigger template ID 72)...`);
  const expiredRes = await sendOdooWhatsApp(
    expiredPhone,
    "Hello Expired Tutor, a new science requirement is available. Reply YES to confirm.",
    "Tutor ExpiredWindow"
  );
  console.log("Expired Tutor Send Result:", expiredRes);

  // 3. Validation Check: Empty Message Body
  console.log("\n--- TEST CASE 3: EMPTY BODY VALIDATION ---");
  console.log("Sending message with empty body...");
  const emptyRes = await sendOdooWhatsApp(activePhone, "", "Tutor EmptyBody");
  console.log("Empty Body Result:", emptyRes);

  // Cleanup active window simulation message (whatsapp.message only, mail.message is read-only)
  console.log("\n--- CLEANUP ---");
  console.log("Cleaning up simulated inbound message...");
  await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "whatsapp.message",
    "unlink",
    [[activeInboundId]]
  ]);

  // Clean up outgoing test messages from this test run in Odoo
  if (activeRes.id) {
    await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "whatsapp.message",
      "unlink",
      [[activeRes.id]]
    ]);
  }
  if (expiredRes.id) {
    await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "whatsapp.message",
      "unlink",
      [[expiredRes.id]]
    ]);
  }
  console.log("Test records cleaned up successfully!");
}

runTests().catch(err => {
  console.error("Test suite failed:", err);
});

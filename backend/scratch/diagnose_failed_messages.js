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

  console.log("\nSearching for all recent whatsapp.message records...");
  try {
    const messages = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "whatsapp.message",
      "search_read",
      [[]],
      { fields: ["id", "display_name", "mobile_number", "message_type", "state", "failure_type", "failure_reason", "wa_template_id", "msg_uid", "create_date"], limit: 15 }
    ]);
    console.log(`Found ${messages.length} recent messages:`);
    messages.forEach(msg => {
      console.log(`- [ID: ${msg.id}] to ${msg.mobile_number}: State: ${msg.state}, Failure Type: ${msg.failure_type}, Reason: ${msg.failure_reason}, Template: ${JSON.stringify(msg.wa_template_id)}, UID: ${msg.msg_uid}`);
    });
    
    // Check state counts
    console.log("\nCalculating state counts...");
    const allRecords = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "whatsapp.message",
      "read_group",
      [[[]], ["state"], ["state"]],
      {}
    ]);
    console.log("State counts:", allRecords);

  } catch (err) {
    console.error("Failed to query whatsapp.message records:", err.message);
  }
}

main().catch(console.error);

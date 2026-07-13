/**
 * Inspect available WhatsApp templates in Odoo
 * Run: node scratch/inspect_whatsapp.js
 */
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
dotenv.config();

const { ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD } = process.env;

async function callOdoo(service, method, args) {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { service, method, args },
      id: 1,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}

async function main() {
  console.log("Authenticating with Odoo...");
  const uid = await callOdoo("common", "authenticate", [ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {}]);
  console.log("UID:", uid);

  // List all WhatsApp templates
  console.log("\n--- WhatsApp Templates ---");
  try {
    const templates = await callOdoo("object", "execute_kw", [
      ODOO_DB, uid, ODOO_PASSWORD,
      "whatsapp.template",
      "search_read",
      [[]],
      { fields: ["id", "name", "status", "body"], limit: 100 }
    ]);
    console.log(`Found ${templates.length} templates. Saving to templates.json...`);
    fs.writeFileSync("scratch/templates.json", JSON.stringify(templates, null, 2), "utf8");
    console.log("Saved successfully!");
  } catch (err) {
    console.error("whatsapp.template error:", err.message);
  }

  // List WhatsApp accounts
  console.log("\n--- WhatsApp Accounts ---");
  try {
    const accounts = await callOdoo("object", "execute_kw", [
      ODOO_DB, uid, ODOO_PASSWORD,
      "whatsapp.account",
      "search_read",
      [[]],
      { fields: ["id", "name", "phone_uid", "account_uid", "state"], limit: 10 }
    ]);
    console.log(`Found ${accounts.length} accounts:`);
    accounts.forEach(a => console.log(`  [${a.id}] "${a.name}" | State: ${a.state} | Phone UID: ${a.phone_uid}`));
  } catch (err) {
    console.error("whatsapp.account error:", err.message);
  }

  // List discuss.channel (recent WhatsApp conversations)
  console.log("\n--- Recent WhatsApp Channels (last 5) ---");
  try {
    const channels = await callOdoo("object", "execute_kw", [
      ODOO_DB, uid, ODOO_PASSWORD,
      "discuss.channel",
      "search_read",
      [[["channel_type", "=", "whatsapp"]]],
      { fields: ["id", "name", "whatsapp_number", "write_date"], limit: 5, order: "write_date desc" }
    ]);
    console.log(`Found ${channels.length} recent WhatsApp channels:`);
    channels.forEach(c => console.log(`  [${c.id}] "${c.name}" | Number: ${c.whatsapp_number} | Last: ${c.write_date}`));
  } catch (err) {
    console.error("discuss.channel error:", err.message);
  }

  // Check x_master_tutors model
  console.log("\n--- x_master_tutors model fields ---");
  try {
    const fields = await callOdoo("object", "execute_kw", [
      ODOO_DB, uid, ODOO_PASSWORD,
      "x_master_tutors",
      "fields_get",
      [],
      { attributes: ["string", "type"] }
    ]);
    const fieldNames = Object.keys(fields);
    console.log(`Found ${fieldNames.length} fields:`);
    fieldNames.forEach(f => {
      if (f.startsWith("x_")) {
        console.log(`  ${f}: ${fields[f].string} (${fields[f].type})`);
      }
    });
  } catch (err) {
    console.error("x_master_tutors error:", err.message);
  }
}

main().catch(console.error);

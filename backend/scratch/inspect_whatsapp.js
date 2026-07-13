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

  console.log("\nSearching for Email templates (mail.template)...");
  try {
    const templates = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "mail.template",
      "search_read",
      [[]],
      { fields: ["id", "name", "subject", "model_id"], limit: 20 }
    ]);
    console.log(`Found ${templates.length} email templates:`);
    templates.forEach(t => {
      console.log(`- [ID: ${t.id}] ${t.name}: subject="${t.subject}", Model: ${JSON.stringify(t.model_id)}`);
    });
  } catch (err) {
    console.error("Failed to query mail.template:", err.message);
  }
}

main().catch(console.error);

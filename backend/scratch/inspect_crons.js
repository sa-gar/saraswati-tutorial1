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

  console.log("Searching for WhatsApp and mail cron jobs...");
  try {
    const crons = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "ir.cron",
      "search_read",
      [[["name", "ilike", "whatsapp"]]],
      { fields: ["id", "name", "active", "nextcall", "interval_number", "interval_type", "model_id"] }
    ]);
    console.log(`Found ${crons.length} WhatsApp crons:`);
    crons.forEach(c => {
      console.log(`- [ID: ${c.id}] Name: "${c.name}", Active: ${c.active}, Next Call: ${c.nextcall}, Interval: ${c.interval_number} ${c.interval_type}`);
    });
  } catch (err) {
    console.error("Failed to query ir.cron:", err.message);
  }

  try {
    const mailCrons = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "ir.cron",
      "search_read",
      [[["name", "ilike", "mail"]]],
      { fields: ["id", "name", "active", "nextcall"], limit: 10 }
    ]);
    console.log(`\nFound ${mailCrons.length} Mail crons:`);
    mailCrons.forEach(c => {
      console.log(`- [ID: ${c.id}] Name: "${c.name}", Active: ${c.active}, Next Call: ${c.nextcall}`);
    });
  } catch (err) {
    console.error("Failed to query mail crons:", err.message);
  }
}

main().catch(console.error);

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
  
  const templates = await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "whatsapp.template",
    "search_read",
    [[]],
    { fields: ["id", "name", "status"] }
  ]);
  
  console.log(`Found ${templates.length} total templates in Odoo:`);
  templates.forEach(t => {
    console.log(`- [ID: ${t.id}] Name: "${t.name}" (Status: ${t.status})`);
  });
}

main().catch(console.error);

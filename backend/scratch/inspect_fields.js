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

  // Read the fields description of whatsapp.message model
  console.log("Fetching whatsapp.message fields...");
  const fields = await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "whatsapp.message",
    "fields_get",
    [],
    { attributes: ["type", "string", "readonly"] }
  ]);
  
  for (const [name, meta] of Object.entries(fields)) {
    console.log(`- ${name}: type=${meta.type}, label="${meta.string}"${meta.readonly ? " (readonly)" : ""}`);
  }
}

main().catch(console.error);

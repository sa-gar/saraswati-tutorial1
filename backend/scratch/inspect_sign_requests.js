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

  console.log("Searching for sign.request records...");
  try {
    const records = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "sign.request",
      "search_read",
      [[]],
      { fields: ["id", "reference"], limit: 5 }
    ]);
    console.log(`Found ${records.length} sign requests:`, records);
  } catch (err) {
    console.error("Failed to query sign.request:", err.message);
  }
}

main().catch(console.error);

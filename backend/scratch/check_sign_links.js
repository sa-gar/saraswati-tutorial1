import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function checkLinks() {
  try {
    const res = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "common",
          method: "authenticate",
          args: [DB, USERNAME, PASSWORD, {}],
        },
        id: 1,
      }),
    });
    const authData = await res.json();
    const uid = authData.result;

    console.log("Reading fields of sign.request.item with ID 226...");
    const readRes = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            DB,
            uid,
            PASSWORD,
            "sign.request.item",
            "read",
            [[226]],
            { fields: ["id", "access_url", "access_token", "access_via_link", "sign_link", "document_link"] }
          ],
        },
        id: 2,
      }),
    });
    const readData = await readRes.json();
    console.log("Details for ID 226:");
    console.log(JSON.stringify(readData.result, null, 2));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

checkLinks();

import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function inspectComposer() {
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

    console.log("Querying fields of whatsapp.composer...");
    const fieldsRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "whatsapp.composer",
            "fields_get",
            [],
            {}
          ],
        },
        id: 2,
      }),
    });
    const fieldsData = await fieldsRes.json();
    console.log("Fields on whatsapp.composer:", Object.keys(fieldsData.result || {}));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

inspectComposer();

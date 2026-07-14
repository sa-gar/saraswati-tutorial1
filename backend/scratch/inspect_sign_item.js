import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function listSignRequestItems() {
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

    console.log("Reading fields of sign.request.item...");
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
            "sign.request.item",
            "fields_get",
            [],
            {}
          ],
        },
        id: 2,
      }),
    });
    const fieldsData = await fieldsRes.json();
    console.log("Fields:", Object.keys(fieldsData.result || {}));

    console.log("Reading request item ID 228 details...");
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
            [[228]],
            {}
          ],
        },
        id: 3,
      }),
    });
    const readData = await readRes.json();
    console.log("Request Item details:");
    console.log(JSON.stringify(readData.result, null, 2));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

listSignRequestItems();

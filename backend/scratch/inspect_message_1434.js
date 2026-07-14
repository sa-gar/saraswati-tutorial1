import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function inspectMessageFields() {
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

    // Read all fields of message 1434
    console.log("Reading all fields of message 1434 (the latest Tutor Agreement template message)...");
    const msgRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "whatsapp.message",
            "fields_get",
            [],
            {}
          ],
        },
        id: 2,
      }),
    });
    const fieldsData = await msgRes.json();
    const fields = Object.keys(fieldsData.result || {});
    console.log("All fields:", fields);

    // Now read message 1434
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
            "whatsapp.message",
            "read",
            [[1434]],
            {}
          ],
        },
        id: 3,
      }),
    });
    const readData = await readRes.json();
    console.log("Message 1434 details:");
    console.log(JSON.stringify(readData.result, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

inspectMessageFields();

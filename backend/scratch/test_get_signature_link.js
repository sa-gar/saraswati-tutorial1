import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function getSignatureLink(email) {
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

    console.log(`Searching signature link for email: ${email}`);
    const searchRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "search_read",
            [[["signer_email", "=", email]]],
            { fields: ["id", "document_link", "state"], limit: 1, order: "id desc" }
          ],
        },
        id: 2,
      }),
    });
    const searchData = await searchRes.json();
    console.log("Result:", searchData.result);

  } catch (err) {
    console.error("Error:", err.message);
  }
}

getSignatureLink("nileshrathore0806@gmail.com");
getSignatureLink("kavanasm45654@gmail.com");

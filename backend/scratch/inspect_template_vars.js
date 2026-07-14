import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function inspectTemplateVars() {
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

    // Read template 72 full details
    console.log("Inspecting whatsapp.template ID 72 (Tutor Agreement)...");
    const tmplRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "whatsapp.template",
            "read",
            [[72]],
            {}
          ],
        },
        id: 2,
      }),
    });
    const tmplData = await tmplRes.json();
    console.log("Template 72 details:");
    console.log(JSON.stringify(tmplData.result, null, 2));

    // Read variable 223 details
    console.log("\nInspecting whatsapp.template.variable ID 223...");
    const varRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "whatsapp.template.variable",
            "fields_get",
            [],
            {}
          ],
        },
        id: 3,
      }),
    });
    const varFields = await varRes.json();
    console.log("whatsapp.template.variable fields:", Object.keys(varFields.result || {}));

    // Get variable 223
    const v223Res = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "whatsapp.template.variable",
            "read",
            [[223]],
            {}
          ],
        },
        id: 4,
      }),
    });
    const v223Data = await v223Res.json();
    console.log("Variable 223 full details:");
    console.log(JSON.stringify(v223Data.result, null, 2));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

inspectTemplateVars();

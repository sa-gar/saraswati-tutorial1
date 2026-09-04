import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function run() {
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
            "ir.model.fields",
            "search_read",
            [[
              ["model", "=", "crm.lead"],
              "|",
              "|",
              "|",
              "|",
              ["field_description", "like", "class"],
              ["field_description", "like", "attend"],
              ["field_description", "like", "total"],
              ["field_description", "like", "completed"],
              ["field_description", "like", "cycle"]
            ]],
            { fields: ["name", "field_description", "ttype"] }
          ],
        },
        id: 2,
      }),
    });
    const fieldsData = await fieldsRes.json();
    console.log("Matching CRM lead fields by description:", fieldsData.result);

    // Also check x_master_tutors fields
    const tutorFieldsRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
            "ir.model.fields",
            "search_read",
            [[
              ["model", "=", "x_master_tutors"],
            ]],
            { fields: ["name", "field_description", "ttype"] }
          ],
        },
        id: 3,
      }),
    });
    const tutorFieldsData = await tutorFieldsRes.json();
    console.log("x_master_tutors fields:", tutorFieldsData.result?.map(f => `${f.name} (${f.field_description})`));

  } catch (err) {
    console.error("Error:", err);
  }
}

run();

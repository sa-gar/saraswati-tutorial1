import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function run() {
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

  // 1. Check if model crm.lead ID
  const models = await (await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [DB, uid, PASSWORD, "ir.model", "search_read", [[["model", "=", "crm.lead"]]], { fields: ["id", "model"] }],
      },
      id: 2,
    }),
  })).json();
  const crmLeadModelId = models.result[0].id;
  console.log("crm.lead model ID:", crmLeadModelId);

  // Check if x_studio_completed_classes or custom fields can be created
  const tryCreateField = await (await fetch(`${ODOO_URL}/jsonrpc`, {
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
          "create",
          [{
            name: "x_completed_classes",
            field_description: "Completed Classes",
            model_id: crmLeadModelId,
            ttype: "integer",
          }],
        ],
      },
      id: 3,
    }),
  })).json();

  console.log("tryCreateField result:", tryCreateField);
}

run();

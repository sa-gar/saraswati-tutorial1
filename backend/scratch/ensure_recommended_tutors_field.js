import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

function sanitizeEnv(val) {
  return (val || "").trim().replace(/^['"]|['"]$/g, "");
}

const _ODOO_URL    = sanitizeEnv(process.env.ODOO_URL).replace(/\/+$/, "");
const _DB          = sanitizeEnv(process.env.ODOO_DB);
const _USERNAME    = sanitizeEnv(process.env.ODOO_USERNAME);
const _PASSWORD    = sanitizeEnv(process.env.ODOO_PASSWORD);
const _JSONRPC_URL = `${_ODOO_URL}/jsonrpc`;

async function callOdoo(service, method, args) {
  const res = await fetch(_JSONRPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { service, method, args },
      id: Math.floor(Math.random() * 1000),
    }),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Non-JSON response (HTTP ${res.status}): ${text.substring(0, 200)}`);
  }

  if (data.error) {
    throw new Error(data.error?.data?.message || data.error?.message || "Odoo Error");
  }
  return data.result;
}

async function main() {
  console.log(`Connecting to Odoo at ${_ODOO_URL}...`);
  const uid = await callOdoo("common", "authenticate", [_DB, _USERNAME, _PASSWORD, {}]);
  if (!uid) {
    console.error("Authentication failed.");
    process.exit(1);
  }
  console.log(`Authenticated as UID ${uid}`);

  // 1. Find crm.lead model ID in ir.model
  const models = await callOdoo("object", "execute_kw", [
    _DB, uid, _PASSWORD,
    "ir.model", "search_read",
    [[["model", "=", "crm.lead"]]],
    { fields: ["id", "model", "name"] }
  ]);

  if (!models || models.length === 0) {
    console.error("crm.lead model not found in Odoo!");
    process.exit(1);
  }

  const crmLeadModelId = models[0].id;
  console.log(`Found crm.lead model ID: ${crmLeadModelId}`);

  // 2. Check if x_recommended_tutor_ids field exists on crm.lead
  const fields = await callOdoo("object", "execute_kw", [
    _DB, uid, _PASSWORD,
    "ir.model.fields", "search_read",
    [[
      ["model_id", "=", crmLeadModelId],
      ["name", "=", "x_recommended_tutor_ids"]
    ]],
    { fields: ["id", "name", "ttype", "relation"] }
  ]);

  if (fields && fields.length > 0) {
    console.log(`Field x_recommended_tutor_ids already exists in Odoo!`, fields[0]);
  } else {
    console.log(`Field x_recommended_tutor_ids does NOT exist. Attempting to create it via JSON-RPC...`);
    try {
      const fieldId = await callOdoo("object", "execute_kw", [
        _DB, uid, _PASSWORD,
        "ir.model.fields", "create",
        [{
          name: "x_recommended_tutor_ids",
          field_description: "Recommended Tutors",
          model_id: crmLeadModelId,
          ttype: "many2many",
          relation: "x_master_tutors",
        }]
      ]);
      console.log(`✅ Successfully created x_recommended_tutor_ids field on crm.lead! Field ID: ${fieldId}`);
    } catch (createErr) {
      console.error(`Could not create field automatically via JSON-RPC: ${createErr.message}`);
      console.log(`Create it manually in Odoo Studio or via Technical -> Database Structure -> Fields.`);
    }
  }
}

main().catch(err => console.error(err));

import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config({ path: "backend/.env" });

const _ODOO_URL    = (process.env.ODOO_URL || "").trim().replace(/^['"]|['"]$/g, "").replace(/\/+$/, "");
const _DB          = (process.env.ODOO_DB || "").trim().replace(/^['"]|['"]$/g, "");
const _USERNAME    = (process.env.ODOO_USERNAME || "").trim().replace(/^['"]|['"]$/g, "");
const _PASSWORD    = (process.env.ODOO_PASSWORD || "").trim().replace(/^['"]|['"]$/g, "");
const _JSONRPC_URL = `${_ODOO_URL}/jsonrpc`;

async function callOdoo(service, method, args) {
  const res = await fetch(_JSONRPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { service, method, args },
      id: 1,
    }),
  });
  const data = await res.json();
  return data.result;
}

async function run() {
  const uid = await callOdoo("common", "authenticate", [_DB, _USERNAME, _PASSWORD, {}]);

  // Read lead 846
  const leadData = await callOdoo("object", "execute_kw", [
    _DB, uid, _PASSWORD,
    "crm.lead", "read",
    [[846]],
    { fields: [
      "name",
      "x_studio_requirement_id",
      "x_completed_classes",
      "x_total_classes",
      "x_remaining_classes",
      "x_current_cycle",
      "x_package_status",
      "x_last_class_date",
      "x_last_attendance_status",
      "x_last_class_topics"
    ] }
  ]);
  console.log("Odoo Lead #846 details:", leadData);

  // Read attendance logs linked to lead 846
  const logs = await callOdoo("object", "execute_kw", [
    _DB, uid, _PASSWORD,
    "x_attendance_log", "search_read",
    [[["x_lead_id", "=", 846]]],
    { fields: [
      "x_name",
      "x_student_name",
      "x_tutor_name",
      "x_date",
      "x_package_cycle",
      "x_session_number",
      "x_status",
      "x_topics_covered"
    ] }
  ]);
  console.log("Linked x_attendance_log records in Odoo:", logs);
}

run();

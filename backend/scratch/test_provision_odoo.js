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
      id: Math.floor(Math.random() * 1000),
    }),
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error?.data?.message || data.error?.message || "Odoo Error");
  }
  return data.result;
}

async function run() {
  console.log("Authenticating with Odoo...");
  const uid = await callOdoo("common", "authenticate", [_DB, _USERNAME, _PASSWORD, {}]);
  console.log("Authenticated UID:", uid);

  // 1. Get crm.lead model
  const leadModels = await callOdoo("object", "execute_kw", [
    _DB, uid, _PASSWORD,
    "ir.model", "search_read",
    [[["model", "=", "crm.lead"]]],
    { fields: ["id", "model"] }
  ]);
  const crmLeadModelId = leadModels[0].id;
  console.log("crm.lead model ID:", crmLeadModelId);

  // Define CRM Lead fields
  const leadFieldsToEnsure = [
    { name: "x_completed_classes", field_description: "Completed Classes", ttype: "integer" },
    { name: "x_total_classes", field_description: "Total Package Classes", ttype: "integer" },
    { name: "x_remaining_classes", field_description: "Remaining Classes", ttype: "integer" },
    { name: "x_current_cycle", field_description: "Current Package Cycle", ttype: "integer" },
    { name: "x_package_status", field_description: "Package Status", ttype: "char" },
    { name: "x_last_class_date", field_description: "Last Class Date", ttype: "char" },
    { name: "x_last_attendance_status", field_description: "Last Attendance Status", ttype: "char" },
    { name: "x_last_class_topics", field_description: "Last Class Topics", ttype: "char" },
    { name: "x_last_missed_reason", field_description: "Last Missed Reason", ttype: "char" },
  ];

  for (const f of leadFieldsToEnsure) {
    const existing = await callOdoo("object", "execute_kw", [
      _DB, uid, _PASSWORD,
      "ir.model.fields", "search_read",
      [[["model_id", "=", crmLeadModelId], ["name", "=", f.name]]],
      { fields: ["id", "name"] }
    ]);
    if (existing && existing.length > 0) {
      console.log(`Field ${f.name} already exists (ID: ${existing[0].id})`);
    } else {
      console.log(`Creating field ${f.name}...`);
      const newFieldId = await callOdoo("object", "execute_kw", [
        _DB, uid, _PASSWORD,
        "ir.model.fields", "create",
        [{
          name: f.name,
          field_description: f.field_description,
          model_id: crmLeadModelId,
          ttype: f.ttype,
        }]
      ]);
      console.log(`Created field ${f.name} (ID: ${newFieldId})`);
    }
  }

  // 2. Ensure x_attendance_log model
  console.log("Checking if x_attendance_log model exists...");
  let attendModels = await callOdoo("object", "execute_kw", [
    _DB, uid, _PASSWORD,
    "ir.model", "search_read",
    [[["model", "=", "x_attendance_log"]]],
    { fields: ["id", "model", "name"] }
  ]);

  let attendModelId;
  if (attendModels && attendModels.length > 0) {
    attendModelId = attendModels[0].id;
    console.log(`Model x_attendance_log already exists (ID: ${attendModelId})`);
  } else {
    console.log("Creating model x_attendance_log...");
    attendModelId = await callOdoo("object", "execute_kw", [
      _DB, uid, _PASSWORD,
      "ir.model", "create",
      [{
        model: "x_attendance_log",
        name: "Attendance Log",
        state: "manual",
      }]
    ]);
    console.log(`Created model x_attendance_log (ID: ${attendModelId})`);

    // Add access rights for Admin and User
    console.log("Adding access rights for x_attendance_log...");
    await callOdoo("object", "execute_kw", [
      _DB, uid, _PASSWORD,
      "ir.model.access", "create",
      [{
        name: "x_attendance_log_admin",
        model_id: attendModelId,
        group_id: 4, // Role / Administrator
        perm_read: true,
        perm_write: true,
        perm_create: true,
        perm_unlink: true,
      }]
    ]);
    await callOdoo("object", "execute_kw", [
      _DB, uid, _PASSWORD,
      "ir.model.access", "create",
      [{
        name: "x_attendance_log_user",
        model_id: attendModelId,
        group_id: 1, // Role / User
        perm_read: true,
        perm_write: true,
        perm_create: true,
        perm_unlink: false,
      }]
    ]);
  }

  // Ensure fields on x_attendance_log
  const logFieldsToEnsure = [
    { name: "x_name", field_description: "Session Reference", ttype: "char" },
    { name: "x_student_name", field_description: "Student Name", ttype: "char" },
    { name: "x_parent_name", field_description: "Parent Name", ttype: "char" },
    { name: "x_requirement_id", field_description: "Requirement ID", ttype: "char" },
    { name: "x_tutor_name", field_description: "Tutor Name", ttype: "char" },
    { name: "x_date", field_description: "Class Date", ttype: "char" },
    { name: "x_package_cycle", field_description: "Cycle / Month", ttype: "integer" },
    { name: "x_session_number", field_description: "Session Number", ttype: "integer" },
    { name: "x_status", field_description: "Status", ttype: "char" },
    { name: "x_topics_covered", field_description: "Topics Covered", ttype: "char" },
    { name: "x_missed_reason", field_description: "Missed Reason", ttype: "char" },
    { name: "x_lead_id", field_description: "Student Lead", ttype: "many2one", relation: "crm.lead" },
  ];

  for (const f of logFieldsToEnsure) {
    const existing = await callOdoo("object", "execute_kw", [
      _DB, uid, _PASSWORD,
      "ir.model.fields", "search_read",
      [[["model_id", "=", attendModelId], ["name", "=", f.name]]],
      { fields: ["id", "name"] }
    ]);
    if (existing && existing.length > 0) {
      console.log(`Field ${f.name} on x_attendance_log already exists (ID: ${existing[0].id})`);
    } else {
      console.log(`Creating field ${f.name} on x_attendance_log...`);
      const payload = {
        name: f.name,
        field_description: f.field_description,
        model_id: attendModelId,
        ttype: f.ttype,
      };
      if (f.relation) payload.relation = f.relation;
      const newFieldId = await callOdoo("object", "execute_kw", [
        _DB, uid, _PASSWORD,
        "ir.model.fields", "create",
        [payload]
      ]);
      console.log(`Created field ${f.name} (ID: ${newFieldId})`);
    }
  }

  console.log("✅ All Odoo attendance schema successfully provisioned!");
}

run().catch(console.error);

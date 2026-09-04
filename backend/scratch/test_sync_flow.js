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
  const uid = await callOdoo("common", "authenticate", [_DB, _USERNAME, _PASSWORD, {}]);

  // Find a test lead
  const leads = await callOdoo("object", "execute_kw", [
    _DB, uid, _PASSWORD,
    "crm.lead", "search_read",
    [[["x_studio_type", "=", "Parent"]]],
    { fields: ["id", "name", "x_studio_requirement_id"], limit: 1 }
  ]);
  const testLead = leads[0];
  console.log("Using test lead:", testLead);

  // 1. Update lead attendance summary
  await callOdoo("object", "execute_kw", [
    _DB, uid, _PASSWORD,
    "crm.lead", "write",
    [
      [testLead.id],
      {
        x_completed_classes: 3,
        x_total_classes: 12,
        x_remaining_classes: 9,
        x_current_cycle: 1,
        x_package_status: "Active",
        x_last_class_date: "2026-09-04",
        x_last_attendance_status: "Done",
        x_last_class_topics: "Linear Equations Practice & Test",
      }
    ]
  ]);
  console.log("✅ Updated crm.lead attendance summary fields!");

  // 2. Create attendance log in x_attendance_log
  const logRef = `ATT-${testLead.x_studio_requirement_id || testLead.id}-2026-09-04-3`;
  const newLogId = await callOdoo("object", "execute_kw", [
    _DB, uid, _PASSWORD,
    "x_attendance_log", "create",
    [{
      x_name: logRef,
      x_student_name: testLead.name,
      x_parent_name: testLead.name,
      x_requirement_id: testLead.x_studio_requirement_id || "",
      x_tutor_name: "Test Tutor",
      x_date: "2026-09-04",
      x_package_cycle: 1,
      x_session_number: 3,
      x_status: "Done",
      x_topics_covered: "Linear Equations Practice & Test",
      x_lead_id: testLead.id,
    }]
  ]);
  console.log("✅ Created x_attendance_log record ID:", newLogId);

  // 3. Post chatter message
  const chatterMsg = `<div style="font-family: sans-serif; font-size: 13px;">
    <p style="margin: 0; font-weight: bold; color: #4338ca;">📚 Class 3 Logged (Month 1)</p>
    <p style="margin: 4px 0 0 0;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Completed (Done)</span></p>
    <p style="margin: 2px 0 0 0;"><strong>Date:</strong> 04 Sep 2026</p>
    <p style="margin: 2px 0 0 0;"><strong>Tutor:</strong> Test Tutor</p>
    <p style="margin: 2px 0 0 0;"><strong>Topics:</strong> Linear Equations Practice & Test</p>
    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 11px;">Cycle Progress: 3/12 Completed | 9 Remaining</p>
  </div>`;

  await callOdoo("object", "execute_kw", [
    _DB, uid, _PASSWORD,
    "crm.lead", "message_post",
    [[testLead.id]],
    {
      body: chatterMsg,
      message_type: "comment",
      subtype_xmlid: "mail.mt_note",
    }
  ]);
  console.log("✅ Posted message to Odoo CRM chatter!");

  // Clean up test x_attendance_log record
  await callOdoo("object", "execute_kw", [
    _DB, uid, _PASSWORD,
    "x_attendance_log", "unlink",
    [[newLogId]]
  ]);
  console.log("✅ Cleaned up test record.");
}

run().catch(console.error);

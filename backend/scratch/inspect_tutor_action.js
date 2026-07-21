import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function rpc(uid, model, method, args = [], kwargs = {}) {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", method: "call", id: Math.random(),
      params: { service: "object", method: "execute_kw", args: [DB, uid, PASSWORD, model, method, args, kwargs] },
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(JSON.stringify(json.error.data || json.error));
  return json.result;
}

async function authRpc(method, args) {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", method: "call", id: Math.random(),
      params: { service: "common", method, args },
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(JSON.stringify(json.error.data || json.error));
  return json.result;
}

async function run() {
  const uid = await authRpc("authenticate", [DB, USERNAME, PASSWORD, {}]);
  console.log("UID:", uid);

  // ── 1. Window Action ID 1019 (tutor → x_tutor) full details ────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("1. Window Action #1019 (x_tutor) full fields");
  const act1019 = await rpc(uid, "ir.actions.act_window", "read", [[1019]],
    { fields: ["name", "res_model", "domain", "context", "view_mode", "view_ids", "search_view_id", "binding_model_id", "binding_view_types"] });
  console.log(JSON.stringify(act1019, null, 2));

  // ── 2. All fields on x_tutor ────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("2. x_tutor fields (all)");
  const fields = await rpc(uid, "x_tutor", "fields_get", [], { attributes: ["string", "type", "relation", "store", "required"] });
  console.log(JSON.stringify(fields, null, 2));

  // ── 3. Existing records in x_tutor (show first 20, all fields) ─────────────
  console.log("\n═══════════════════════════════════════");
  console.log("3. Existing x_tutor records (first 20)");
  const records = await rpc(uid, "x_tutor", "search_read", [[]], { limit: 20 });
  if (!records.length) {
    console.log("  (no records)");
  } else {
    records.forEach(r => {
      console.log(`  id=${r.id}  x_name=${r.x_name}  x_studio_tutor_id=${r.x_studio_tutor_id}  x_studio_notes=${(r.x_studio_notes||"").slice(0,80)}`);
    });
  }

  // ── 4. Check if crm.lead has any field pointing to x_tutor ─────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("4. crm.lead fields that relate to x_tutor or matching");
  const crmFields = await rpc(uid, "crm.lead", "fields_get", [], { attributes: ["string", "type", "relation"] });
  const relevant = Object.entries(crmFields).filter(([fname, f]) =>
    (f.relation && (f.relation.includes("tutor") || f.relation.includes("match"))) ||
    fname.includes("tutor") || fname.includes("match")
  );
  console.log(relevant.map(([n, f]) => `  ${n}: type=${f.type} relation=${f.relation || ""}`).join("\n") || "  (none found)");

  // ── 5. Does x_tutor have any many2one to crm.lead? ─────────────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("5. x_tutor fields that relate to crm.lead or lead");
  const tutorFields = await rpc(uid, "x_tutor", "fields_get", [], { attributes: ["string", "type", "relation"] });
  const tutorLeadFields = Object.entries(tutorFields).filter(([fname, f]) =>
    (f.relation && (f.relation.includes("lead") || f.relation.includes("crm"))) ||
    fname.includes("lead") || fname.includes("crm")
  );
  console.log(tutorLeadFields.map(([n, f]) => `  ${n}: type=${f.type} relation=${f.relation || ""}`).join("\n") || "  (none found)");

  // ── 6. Test create attempt on x_tutor → capture EXACT Odoo error ───────────
  console.log("\n═══════════════════════════════════════");
  console.log("6. Testing create on x_tutor to capture exact Odoo error...");
  try {
    const newId = await rpc(uid, "x_tutor", "create", [{ x_name: "__TEST_PROBE__" }]);
    console.log("  CREATE succeeded (unexpected), id:", newId);
    // Immediately delete it
    await rpc(uid, "x_tutor", "unlink", [[newId]]);
    console.log("  Cleaned up test record.");
  } catch (err) {
    console.log("  CREATE error:", err.message);
  }

  // ── 7. Test unlink attempt on x_tutor (no-op to test permissions) ──────────
  console.log("\n═══════════════════════════════════════");
  console.log("7. Testing unlink on x_tutor with empty list...");
  try {
    const result = await rpc(uid, "x_tutor", "unlink", [[99999999]]);
    console.log("  UNLINK result:", result);
  } catch (err) {
    console.log("  UNLINK error:", err.message);
  }


  // ── 9. Check test records created by earlier sync ───────────────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("9. Looking for test records in x_tutor with notes containing REQ-TEST...");
  try {
    const testIds = await rpc(uid, "x_tutor", "search", [[["x_studio_notes", "like", "REQ-TEST"]]]);
    console.log("  Found IDs with REQ-TEST in notes:", testIds);
    if (testIds.length > 0) {
      const testRecs = await rpc(uid, "x_tutor", "read", [testIds], { fields: ["id", "x_name", "x_studio_notes"] });
      testRecs.forEach(r => console.log(`    id=${r.id} name=${r.x_name} notes_preview=${(r.x_studio_notes||"").slice(0,100)}`));
    }
  } catch (err) {
    console.log("  Error searching test records:", err.message);
  }
}

run().catch(err => console.error("Fatal:", err));

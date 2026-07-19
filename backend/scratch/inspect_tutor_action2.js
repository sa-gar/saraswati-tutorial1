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

  // ── 1. Read the ORIGINAL master tutor record (id=5) ─────────────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("1. Original master tutor record (id=5) — all fields:");
  const rec5 = await rpc(uid, "x_tutor", "read", [[5]]);
  console.log(JSON.stringify(rec5[0], null, 2));

  // ── 2. Inspect Server Actions bound to crm.lead ──────────────────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("2. Server Actions bound to crm.lead (all types):");
  const sas = await rpc(uid, "ir.actions.server", "search_read",
    [[["model_name", "=", "crm.lead"]]],
    { fields: ["name", "state", "code", "child_ids", "binding_model_id"] }
  );
  console.log(JSON.stringify(sas, null, 2));

  // ── 3. Inspect ALL ir.actions.act_window bound to crm.lead ──────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("3. ir.actions.act_window bound to crm.lead:");
  const crm_acts = await rpc(uid, "ir.actions.act_window", "search_read",
    [[["binding_model_id.model", "=", "crm.lead"]]],
    { fields: ["name", "res_model", "domain", "context", "view_mode", "binding_view_types"] }
  );
  console.log(JSON.stringify(crm_acts, null, 2));

  // ── 4. Inspect ir.actions.act_window REFERENCED from crm.lead views ─────────
  console.log("\n═══════════════════════════════════════");
  console.log("4. crm.lead views (checking button targets):");
  const views = await rpc(uid, "ir.ui.view", "search_read",
    [[["model", "=", "crm.lead"]]],
    { fields: ["name", "type", "arch_db"], limit: 10 }
  );
  views.forEach(v => {
    // Look for references to x_tutor or matching_tutor in the arch
    if (v.arch_db && (v.arch_db.includes("x_tutor") || v.arch_db.includes("tutor") || v.arch_db.includes("match"))) {
      console.log(`  View: ${v.name} (${v.type})`);
      // Print relevant lines only
      const lines = v.arch_db.split("\n").filter(l =>
        l.toLowerCase().includes("tutor") || l.toLowerCase().includes("match")
      );
      lines.forEach(l => console.log("    " + l.trim().slice(0, 200)));
    }
  });

  // ── 5. All x_tutor records with their tutor codes ───────────────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("5. All x_tutor records — id, name, tutor_id, notes_first100:");
  const all = await rpc(uid, "x_tutor", "search_read", [[]], {
    fields: ["id", "x_name", "x_studio_tutor_id", "x_studio_tutor_id_1", "x_studio_tutor_id_2", "x_studio_notes"],
    limit: 50
  });
  all.forEach(r => {
    const notes = (r.x_studio_notes || "").replace(/<[^>]+>/g, "").slice(0, 80);
    console.log(`  id=${r.id} name="${r.x_name}" tid=${r.x_studio_tutor_id}/${r.x_studio_tutor_id_1}/${r.x_studio_tutor_id_2} notes="${notes}"`);
  });

  // ── 6. Clean up the test records created earlier ──────────────────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("6. Cleaning up TEST records inserted by earlier sync...");
  // Records 6,7,8,9,12,13 are all test duplicates based on earlier output
  const testIds = await rpc(uid, "x_tutor", "search", [[
    "|",
    ["x_studio_notes", "like", "REQ-TEST"],
    ["x_studio_tutor_id", "in", ["TUT9999", "TUT8888"]],
  ]]);
  console.log("  IDs to delete:", testIds);
  if (testIds.length > 0) {
    try {
      const r = await rpc(uid, "x_tutor", "unlink", [testIds]);
      console.log("  Unlink result:", r);
    } catch (err) {
      console.log("  UNLINK error:", err.message);
    }
  } else {
    console.log("  Nothing to clean.");
  }

  // ── 7. Remaining x_tutor records after cleanup ────────────────────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("7. Remaining x_tutor records after cleanup:");
  const remaining = await rpc(uid, "x_tutor", "search_read", [[]], {
    fields: ["id", "x_name", "x_studio_tutor_id"],
    limit: 50
  });
  remaining.forEach(r => console.log(`  id=${r.id} name="${r.x_name}" tutor_id=${r.x_studio_tutor_id}`));
}

run().catch(err => console.error("Fatal:", err));

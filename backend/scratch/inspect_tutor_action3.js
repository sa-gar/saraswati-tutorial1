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

  // ── 1. Get server action 662 (Search Tutor, bound to crm.lead) ──────────────
  console.log("\n═══════════════════════════════════════");
  console.log("1. Server Action #662 (bound to Lead) — full details:");
  const sa662 = await rpc(uid, "ir.actions.server", "read", [[662]],
    { fields: ["name", "state", "code", "model_name", "binding_model_id", "child_ids"] });
  console.log(JSON.stringify(sa662, null, 2));

  // ── 2. ALL crm.lead views full arch (look for x_tutor, matching, tutor) ─────
  console.log("\n═══════════════════════════════════════");
  console.log("2. CRM Lead views with ANY tutor/match reference (full arch):");
  const views = await rpc(uid, "ir.ui.view", "search_read",
    [[["model", "=", "crm.lead"]]],
    { fields: ["name", "type", "key", "arch_db"], limit: 50 }
  );
  const relevant = views.filter(v =>
    v.arch_db && (
      v.arch_db.toLowerCase().includes("tutor") ||
      v.arch_db.toLowerCase().includes("match") ||
      v.arch_db.toLowerCase().includes("x_tutor")
    )
  );
  if (!relevant.length) {
    console.log("  (no crm.lead views reference tutor or match)");
  } else {
    relevant.forEach(v => {
      console.log(`\n  --- View: "${v.name}" type=${v.type} key=${v.key} ---`);
      // Print just lines with tutor/match
      const lines = v.arch_db.split("\n").filter(l =>
        l.toLowerCase().includes("tutor") || l.toLowerCase().includes("match")
      );
      lines.forEach(l => console.log("    " + l.trim().slice(0, 300)));
    });
  }

  // ── 3. Look for ANY Smart Button or stat button pointing to x_tutor ─────────
  console.log("\n═══════════════════════════════════════");
  console.log("3. Any CRM lead view arch containing x_tutor reference (full match):");
  const tutorViews = views.filter(v => v.arch_db && v.arch_db.includes("x_tutor"));
  if (!tutorViews.length) {
    console.log("  (none)");
  } else {
    tutorViews.forEach(v => {
      console.log(`\n  View: "${v.name}" (${v.type})`);
      console.log(v.arch_db);
    });
  }

  // ── 4. Check ALL ir.actions.act_window for x_tutor or matching ──────────────
  console.log("\n═══════════════════════════════════════");
  console.log("4. ALL window actions where res_model=x_tutor:");
  const tutor_acts = await rpc(uid, "ir.actions.act_window", "search_read",
    [[["res_model", "=", "x_tutor"]]],
    { fields: ["id", "name", "res_model", "domain", "context", "view_mode", "binding_model_id", "binding_view_types"] }
  );
  console.log(JSON.stringify(tutor_acts, null, 2));

  // ── 5. Check x_tutor record #5 full data (the original master record) ───────
  console.log("\n═══════════════════════════════════════");
  console.log("5. x_tutor record #5 — original master tutor, all fields:");
  const r5 = await rpc(uid, "x_tutor", "read", [[5]]);
  console.log(JSON.stringify(r5[0], null, 2));

  // ── 6. x_tutor_tag model fields (the related tag model) ─────────────────────
  console.log("\n═══════════════════════════════════════");
  console.log("6. x_tutor_tag model fields:");
  try {
    const tagFields = await rpc(uid, "x_tutor_tag", "fields_get", [], { attributes: ["string", "type", "relation"] });
    console.log(JSON.stringify(tagFields, null, 2));
    const tagRecs = await rpc(uid, "x_tutor_tag", "search_read", [[]], { limit: 10 });
    console.log("  Tag records:", JSON.stringify(tagRecs, null, 2));
  } catch (err) {
    console.log("  Error:", err.message.slice(0, 150));
  }

  // ── 7. Check if crm.lead has a one2many or many2many pointing to x_tutor ────
  console.log("\n═══════════════════════════════════════");
  console.log("7. ALL crm.lead relational fields:");
  const crmFields = await rpc(uid, "crm.lead", "fields_get", [], { attributes: ["string", "type", "relation", "store"] });
  const relFields = Object.entries(crmFields).filter(([, f]) =>
    ["many2one", "one2many", "many2many"].includes(f.type)
  );
  relFields.forEach(([fname, f]) => {
    console.log(`  ${fname}: ${f.type} → ${f.relation}`);
  });
}

run().catch(err => console.error("Fatal:", err));

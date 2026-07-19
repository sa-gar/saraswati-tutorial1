import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB       = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function authRpc(method, args) {
  const res  = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", method: "call", id: 1,
      params: { service: "common", method, args },
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(JSON.stringify(json.error.data || json.error));
  return json.result;
}

async function rpc(uid, model, method, args = [], kwargs = {}) {
  const res  = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", method: "call", id: Math.random(),
      params: {
        service: "object", method: "execute_kw",
        args: [DB, uid, PASSWORD, model, method, args, kwargs],
      },
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(JSON.stringify(json.error.data || json.error));
  return json.result;
}

async function run() {
  const uid = await authRpc("authenticate", [DB, USERNAME, PASSWORD, {}]);
  console.log("Authenticated as uid:", uid, "\n");

  // ── 1. Query ir.model for every model whose technical name contains "tutor" ──
  console.log("══════════════════════════════════════════════════════");
  console.log("1. ALL ir.model records with 'tutor' in the model name:");
  console.log("══════════════════════════════════════════════════════");
  const tutorModels = await rpc(uid, "ir.model", "search_read",
    [[["model", "like", "tutor"]]],
    { fields: ["id", "name", "model", "state", "transient"], order: "model asc" }
  );
  if (tutorModels.length === 0) {
    console.log("  (none found)");
  } else {
    tutorModels.forEach(m =>
      console.log(`  id=${m.id}  model="${m.model}"  name="${m.name}"  state=${m.state}  transient=${m.transient}`)
    );
  }

  // ── 2. Confirm x_master_tutors existence explicitly ───────────────────────
  console.log("\n══════════════════════════════════════════════════════");
  console.log("2. Exact existence check: model = 'x_master_tutors'");
  console.log("══════════════════════════════════════════════════════");
  const exactMatch = await rpc(uid, "ir.model", "search_read",
    [[["model", "=", "x_master_tutors"]]],
    { fields: ["id", "name", "model", "state", "info", "transient"] }
  );
  if (exactMatch.length === 0) {
    console.log("  ❌ x_master_tutors does NOT exist in ir.model");
  } else {
    console.log("  ✅ x_master_tutors EXISTS:");
    console.log(JSON.stringify(exactMatch[0], null, 4));
  }

  // ── 3. Confirm x_tutor existence explicitly ───────────────────────────────
  console.log("\n══════════════════════════════════════════════════════");
  console.log("3. Exact existence check: model = 'x_tutor'");
  console.log("══════════════════════════════════════════════════════");
  const xtutorMatch = await rpc(uid, "ir.model", "search_read",
    [[["model", "=", "x_tutor"]]],
    { fields: ["id", "name", "model", "state", "info", "transient"] }
  );
  if (xtutorMatch.length === 0) {
    console.log("  ❌ x_tutor does NOT exist in ir.model");
  } else {
    console.log("  ✅ x_tutor EXISTS:");
    console.log(JSON.stringify(xtutorMatch[0], null, 4));
  }

  // ── 4. Count live records in both models ─────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════");
  console.log("4. Live record counts");
  console.log("══════════════════════════════════════════════════════");
  for (const modelName of ["x_master_tutors", "x_tutor"]) {
    try {
      const count = await rpc(uid, modelName, "search_count", [[]]);
      console.log(`  ${modelName}: ${count} records`);
    } catch (err) {
      console.log(`  ${modelName}: ERROR — ${err.message.slice(0, 120)}`);
    }
  }

  // ── 5. Fields of x_master_tutors (names + types) ─────────────────────────
  console.log("\n══════════════════════════════════════════════════════");
  console.log("5. Fields on x_master_tutors (stored fields only):");
  console.log("══════════════════════════════════════════════════════");
  try {
    const fields = await rpc(uid, "x_master_tutors", "fields_get", [],
      { attributes: ["string", "type", "store"] }
    );
    Object.entries(fields)
      .filter(([, f]) => f.store)
      .forEach(([fname, f]) =>
        console.log(`  ${fname.padEnd(35)} type=${f.type.padEnd(12)} label="${f.string}"`)
      );
  } catch (err) {
    console.log("  ERROR:", err.message.slice(0, 120));
  }
}

run().catch(err => console.error("Fatal:", err));

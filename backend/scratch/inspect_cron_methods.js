import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function inspectCron() {
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

    console.log("Checking if we can inspect fields and methods of ir.cron...");
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
            "ir.cron",
            "fields_get",
            [],
            {}
          ],
        },
        id: 2,
      }),
    });
    const fieldsData = await fieldsRes.json();
    console.log("Fields on ir.cron:", Object.keys(fieldsData.result || {}));

    // In Odoo, trigger/run methods for cron could be: 'button_trigger', 'ir_cron_run_as_user', 'ir_cron_trigger', 'process_jobs'
    const testMethods = ["button_trigger", "ir_cron_run_as_user", "ir_cron_trigger", "process_jobs", "execute"];
    for (const m of testMethods) {
      const testRes = await fetch(`${ODOO_URL}/jsonrpc`, {
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
              "ir.cron",
              m,
              [[19]],
              {}
            ],
          },
          id: 3,
        }),
      });
      const testData = await testRes.json();
      console.log(`Method ${m} response:`, testData.error ? testData.error.data.message : "Success");
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
}

inspectCron();

import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function sendTutorAgreementViaSignRequest() {
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
    console.log("Authenticated. UID:", uid);

    // Step 1: Find the sign template
    console.log("\nSearching for sign template...");
    const stRes = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            DB, uid, PASSWORD,
            "sign.template",
            "search_read",
            [[]],
            { fields: ["id", "name"], limit: 5 }
          ],
        },
        id: 2,
      }),
    });
    const stData = await stRes.json();
    console.log("Sign templates:", stData.result);

    // Use the main Tutor Engagement template (ID 24)
    const signTemplateId = 24;

    // Step 2: Find/create a partner for the test tutor phone
    console.log("\nSearching for partner with phone 9380046541...");
    const partnerRes = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            DB, uid, PASSWORD,
            "res.partner",
            "search_read",
            [[["phone", "like", "9380046541"]]],
            { fields: ["id", "name", "phone", "email"], limit: 5 }
          ],
        },
        id: 3,
      }),
    });
    const partnerData = await partnerRes.json();
    console.log("Partner result:", partnerData.result);

    if (!partnerData.result || partnerData.result.length === 0) {
      console.log("No partner found for this phone. Searching by different criteria...");
      // Also search by mobile
      const partnerRes2 = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: {
            service: "object",
            method: "execute_kw",
            args: [
              DB, uid, PASSWORD,
              "res.partner",
              "search_read",
              [[["mobile", "like", "9380046541"]]],
              { fields: ["id", "name", "phone", "mobile", "email"], limit: 5 }
            ],
          },
          id: 4,
        }),
      });
      const partnerData2 = await partnerRes2.json();
      console.log("Partner by mobile:", partnerData2.result);
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
}

sendTutorAgreementViaSignRequest();

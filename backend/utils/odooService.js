import dotenv from "dotenv";
dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function callOdoo(service, method, args) {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service,
        method,
        args,
      },
      id: Math.floor(Math.random() * 1000),
    }),
  });

  const data = await res.json();
  if (data.error) {
    // console.error("Odoo FULL ERROR:", JSON.stringify(data.error, null, 2));
    throw new Error(data.error.message);
  }
  return data.result;
}

// export async function createLead(data) {
//   try {
//     //  STEP 1: LOGIN → GET UID
//     const uid = await callOdoo("common", "login", [
//       DB,
//       USERNAME,
//       PASSWORD,
//     ]);

//     console.log(" UID:", uid);

//     //  अगर uid false आया → login failed
//     if (!uid) {
//       throw new Error("Odoo login failed");
//     }

//     //  STEP 2: CREATE LEAD
//     const leadId = await callOdoo("object", "execute_kw", [
//       DB,
//       uid,
//       PASSWORD,
//       "crm.lead",
//       "create",
//       [
//         {
//           name: data.name,
//           contact_name: data.name,
//           phone: data.phone || "9999999999",
//           email_from: data.email,
//           x_user_type: data.userType || "tutor",
//         },
//       ],
//     ]);

//     console.log(" Lead Created ID:", leadId);

//     return leadId;

//   } catch (err) {
//     console.error(" Odoo Error:", err.message);
//     throw err;
//   }
// }

export async function createLead(data) {
  try {
    // STEP 1: LOGIN
    const uid = await callOdoo("common", "login", [
      DB,
      USERNAME,
      PASSWORD,
    ]);

    // console.log("UID:", uid);

    if (!uid) {
      throw new Error("Odoo login failed");
    }

    //  STEP 2: BUILD FULL PAYLOAD
    const leadPayload = {
      name: `${data.name}`,
      contact_name: data.name,
      phone: data.phone || "",
      email_from: data.email || "",

      //  REQUIRED BY CLIENT
      x_user_type: data.userType || "tutor",

      //  ADDRESS (use location as address)
      street: Array.isArray(data.locations)
        ? data.locations.join(", ")
        : data.address || "",

      //  CLEAN DESCRIPTION (optional but useful)
      description: `
Lead Type: ${data.userType}
Phone: ${data.phone}
Email: ${data.email}
Address: ${Array.isArray(data.locations)
          ? data.locations.join(", ")
          : "-"
        }
  `,
    };

    // console.log("📤 Sending to Odoo:", leadPayload);

    // STEP 3: CREATE LEAD
    const leadId = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "crm.lead",
      "create",
      [leadPayload],
    ]);

    // console.log(" Lead Created ID:", leadId);

    return leadId;

  } catch (err) {
    // console.error(" Odoo Error:", err.message);
    throw err;
  }
}
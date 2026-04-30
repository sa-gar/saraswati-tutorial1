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
    throw new Error(data.error.message);
  }
  return data.result;
}

async function imageUrlToBase64(url) {
  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();

    const contentType = res.headers.get("content-type"); // dynamic

    const base64 = Buffer.from(buffer).toString("base64");

    return `data:${contentType};base64,${base64}`;
  } catch (err) {
    // // console.error("Image conversion error:", err.message);
    return "";
  }
}

export async function createLead(data) {
  try {
    // // console.log("PHOTO URL:", data.photo);
    const uid = await callOdoo("common", "login", [
      DB,
      USERNAME,
      PASSWORD,
    ]);

    if (!uid) {
      throw new Error("Odoo login failed");
    }
    let imageBase64 = "";

    //  convert only if image present
    if (data.photo) {
      imageBase64 = await imageUrlToBase64(data.photo);
      // console.log(" BASE64 LENGTH:", imageBase64?.length);
    }

    let leadPayload = {};


    if (data.userType === "tutor") {

      leadPayload = {
        name: data.name,
        contact_name: data.name,
        phone: data.phone || "",
        email_from: data.email || "",
        x_studio_type: "Tutor",
        x_studio_experience: data.experience || "",
        x_studio_hasoccupation: data.hasOccupation,
        x_studio_occupation: data.occupation || "",
        x_studio_has_vehicle: data.hasVehicle,
        x_studio_vehicle_no: data.vehicleNumber || "",
        x_studio_source_1: "Website",
        // x_studio_profile_image: imageBase64,
      };
      // console.log("LEAD PHOTO:", data.photo);
    } else if (data.userType === "parent") {

      const ward = data.wards?.[0] || {};

      leadPayload = {
        name: data.parentName || "",

        contact_name: data.parentName || "",
        x_studio_parent_name : data.parentName || "",
        phone: data.phone || "",
        email_from: data.email || "",
        x_studio_student_name: data.studentName || "",
        x_studio_type: "Parent",
        x_studio_source_1: "Website",
        x_studio_class: ward.classGrade || "",
        x_studio_ward_name: ward.wardName || "",
        x_studio_subjects_intrested: (ward.subjectsNeeded || []).join(", "),
        x_studio_preferred_timings: data.preferredTime || "",
        x_studio_locality: data.area || "",
      };
    }
    // // console.log(" ODOO PAYLOAD IMAGE:", imageBase64 ? "YES" : "NO");

    //  CREATE LEAD
    const leadId = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "crm.lead",
      "create",
      [leadPayload],
    ]);

    return leadId;

  } catch (err) {
    throw err;
  }
}

export async function updateLead(leadId, values) {
  const uid = await callOdoo("common", "login", [
    DB,
    USERNAME,
    PASSWORD,
  ]);

  if (!uid) {
    throw new Error("Odoo login failed");
  }

  await callOdoo("object", "execute_kw", [
    DB,
    uid,
    PASSWORD,
    "crm.lead",
    "write",
    [[parseInt(leadId)], values],
  ]);

  return true;
}
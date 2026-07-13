import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

export async function callOdoo(service, method, args) {

  // console.log("ODOO REQUEST:", {
  //   service,
  //   method,
  // });

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

  // console.log("FULL ODOO RESPONSE:");
  // console.log(JSON.stringify(data, null, 2));

  if (data.error) {
    throw new Error(
      data.error?.data?.message ||
      data.error?.message ||
      "Odoo Error"
    );
  }

  return data.result;
}

export async function createLead(data) {

  try {
    // LOGIN
    const uid = await callOdoo("common", "authenticate", [
      DB,
      USERNAME,
      PASSWORD,
      {},
    ]);

    console.log("ODOO UID:", uid);

    if (!uid) {
      throw new Error("Odoo login failed");
    }

    let leadPayload = {};

    // TUTOR
    if (data.userType === "tutor") {

      leadPayload = {
        name: data.name || "",
        phone: data.phone || "",
        email_from: data.email || "",

        x_studio_type: "Tutor",
        x_studio_experience: data.experience || "",

        x_studio_hasoccupation: data.hasOccupation || false,
        x_studio_occupation: data.occupation || "",

        x_studio_has_vehicle: data.hasVehicle || false,
        x_studio_vehicle_no: data.vehicleNumber || "",

        x_studio_source_1: "Website",
      };

    }

    // PARENT
    else if (data.userType === "parent") {

      const ward = data.wards?.[0] || {};

      // Calculate curriculum/board selection
      let curriculumVal = "";
      const curr = String(ward.curriculum || "").toUpperCase();
      if (curr.includes("STATE")) {
        curriculumVal = "STATE";
      } else if (["CBSE", "ICSE", "NIOS", "IB", "IGCSE"].includes(curr)) {
        curriculumVal = curr;
      }

      // Calculate days/week selection
      let daysWeekVal = "";
      if (data.daysPerWeek) {
        daysWeekVal = `${data.daysPerWeek} Days`;
      } else {
        const daysCount = (data.preferredDays || []).length;
        if (daysCount >= 2 && daysCount <= 6) {
          daysWeekVal = `${daysCount} Days`;
        } else if (daysCount === 1) {
          daysWeekVal = "2 Days";
        } else if (daysCount >= 7) {
          daysWeekVal = "6 Days";
        }
      }

      // Calculate hours/days selection
      let hoursDaysVal = "";
      if (data.hoursPerDay) {
        const h = Number(data.hoursPerDay);
        hoursDaysVal = `${h} ${(h === 1 || h === 1.5) ? "Hr" : "Hrs"}`;
      } else {
        const dur = String(data.classDuration || "").toLowerCase();
        if (dur.includes("1.5")) {
          hoursDaysVal = "1.5 Hr";
        } else if (dur.includes("1")) {
          hoursDaysVal = "1 Hr";
        } else if (dur.includes("2")) {
          hoursDaysVal = "2 Hrs";
        }
      }

      leadPayload = {
        name: data.parentName || "",
        contact_name: data.parentName || "",

        phone: data.phone || "",
        email_from: data.email || "",

        x_studio_type: "Parent",
        x_studio_source_1: "Website",

        description: `UTM Source: ${data.utm_source || "Direct"}\nUTM Medium: ${data.utm_medium || "none"}\nUTM Campaign: ${data.utm_campaign || "none"}\nUTM Content: ${data.utm_content || "none"}\nUTM Term: ${data.utm_term || "none"}`,

        x_studio_parent_name: data.parentName || "",
        x_studio_class: ward.classGrade || "",

        x_studio_student_name: ward.studentName || "",

        x_studio_subjects_intrested:
          (ward.subjectsNeeded || []).join(", "),

        x_studio_preferred_timings:
          data.preferredTime || "",

        x_studio_locality:
          data.address || data.area || "",

        x_studio_preferred_tutor_gender:
          data.preferredGender === "Flexible" ? "No Preference" : (data.preferredGender?.toString() || "No Preference"),

        x_studio_registration_date:
          new Date().toISOString().split("T")[0],
      };

      if (curriculumVal) leadPayload.x_studio_curriculumboard = curriculumVal;
      if (daysWeekVal) leadPayload.x_studio_daysweek = daysWeekVal;
      if (hoursDaysVal) leadPayload.x_studio_hoursdays = hoursDaysVal;

      console.log("[Odoo] Generating sequential Requirement ID...");
      try {
        const count = await callOdoo("object", "execute_kw", [
          DB,
          uid,
          PASSWORD,
          "crm.lead",
          "search_count",
          [[["x_studio_type", "=", "Parent"]]],
        ]);
        const reqId = `REQ-${String(count + 1).padStart(5, "0")}`;
        leadPayload.x_studio_requirement_id = reqId;
        console.log("[Odoo] Generated Requirement ID:", reqId);
      } catch (seqErr) {
        console.error("[Odoo] Failed to generate Requirement ID:", seqErr);
      }
    }

    console.log("[Odoo] Creating lead for:", data.userType);

    // CREATE LEAD
    const leadId = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,

      "crm.lead",
      "create",

      [leadPayload],
    ]);

    console.log("[Odoo] Lead created with ID:", leadId);
    return { id: leadId, requirementId: leadPayload.x_studio_requirement_id || "" };

  } catch (err) {

    console.error("ODOO ERROR:", err);

    throw err;
  }
}

export async function updateLead(leadId, values) {

  try {

    const uid = await callOdoo("common", "authenticate", [
      DB,
      USERNAME,
      PASSWORD,
      {},
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

  } catch (err) {

    console.error("UPDATE LEAD ERROR:", err);

    throw err;
  }
}

export async function upsertMasterTutor(data) {
  try {
    const uid = await callOdoo("common", "authenticate", [
      DB,
      USERNAME,
      PASSWORD,
      {},
    ]);

    if (!uid) {
      throw new Error("Odoo login failed");
    }

    // Convert photo URL to base64 for Odoo binary field if present
    let photoBase64 = false;
    if (data.photo && data.photo.startsWith("http")) {
      try {
        const response = await fetch(data.photo);
        const arrayBuffer = await response.arrayBuffer();
        photoBase64 = Buffer.from(arrayBuffer).toString("base64");
      } catch (err) {
        console.error("[Odoo] Failed to fetch photo for base64 conversion:", err.message);
      }
    }

    // Standardize gender value
    let genderMapped = "";
    if (data.gender) {
      const g = data.gender.trim().toLowerCase();
      if (g === "male") genderMapped = "Male";
      else if (g === "female") genderMapped = "Female";
      else if (g === "other" || g === "both") genderMapped = "Other";
    }

    // Format DOB to YYYY-MM-DD
    let dobFormatted = false;
    if (data.dob) {
      try {
        dobFormatted = new Date(data.dob).toISOString().split("T")[0];
      } catch (e) {
        console.error("[Odoo] Failed parsing date of birth:", data.dob);
      }
    }

    const payload = {
      x_name: data.name || "",
      x_gender: genderMapped || "Male",
      x_mobile: data.phone || "",
      x_whatsapp: data.whatsapp || data.phone || "",
      x_email: data.email || "",
      x_city: data.city || "",
      x_area: data.area || "",
      x_full_address: data.fullAddress || "",
      x_pincode: data.pincode || "",
      x_grades: Array.isArray(data.grades) ? data.grades.join(", ") : (data.grades || ""),
      x_boards: Array.isArray(data.boards) ? data.boards.join(", ") : (data.boards || ""),
      x_subjects: Array.isArray(data.subjects) ? data.subjects.join(", ") : (data.subjects || ""),
      x_preferred_timings: Array.isArray(data.timings) ? data.timings.join(", ") : (data.timings || ""),
      x_max_travel_distance: data.maxTravelDistance || "",
      x_experience: data.experience || "",
      x_qualification: data.qualification || "",
      x_availability: data.availabilityStatus || "Available",
      x_locations_can_teach: Array.isArray(data.locations) ? data.locations.join(", ") : (data.locations || "")
    };

    if (photoBase64) {
      payload.x_profile_photo = photoBase64;
    }
    if (dobFormatted) {
      payload.x_dob = dobFormatted;
    }

    console.log("[Odoo] Searching for existing tutor with mobile:", data.phone);
    const existing = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "x_master_tutors",
      "search_read",
      [[["x_mobile", "=", data.phone]]],
      { fields: ["id", "x_tutor_id"] }
    ]);

    if (existing && existing.length > 0) {
      const recordId = existing[0].id;
      const tutorCode = existing[0].x_tutor_id;
      console.log("[Odoo] Duplicate tutor found. Updating record ID:", recordId, "Tutor ID:", tutorCode);
      
      await callOdoo("object", "execute_kw", [
        DB,
        uid,
        PASSWORD,
        "x_master_tutors",
        "write",
        [[recordId], payload]
      ]);

      return { id: recordId, tutorCode };
    } else {
      console.log("[Odoo] No existing tutor found. Generating sequential Tutor ID...");
      const count = await callOdoo("object", "execute_kw", [
        DB,
        uid,
        PASSWORD,
        "x_master_tutors",
        "search_count",
        [[]]
      ]);

      const tutorCode = `TUT${String(count + 1).padStart(4, "0")}`;
      payload.x_tutor_id = tutorCode;

      console.log("[Odoo] Creating new Master Tutor record with Tutor ID:", tutorCode);
      const recordId = await callOdoo("object", "execute_kw", [
        DB,
        uid,
        PASSWORD,
        "x_master_tutors",
        "create",
        [payload]
      ]);

      return { id: recordId, tutorCode };
    }

  } catch (err) {
    console.error("[Odoo] Error in upsertMasterTutor:", err);
    throw err;
  }
}

/**
 * Creates an outbound whatsapp.message record in Odoo to trigger sending a WhatsApp message
 */
export async function sendOdooWhatsApp(phone, messageText, tutorName) {
  try {
    const uid = await callOdoo("common", "authenticate", [
      DB,
      USERNAME,
      PASSWORD,
      {},
    ]);

    const payload = {
      mobile_number: phone,
      body: messageText,
      message_type: "outbound",
      state: "outgoing",
      wa_account_id: 2, // Saraswati Tutorials Account ID
      display_name: tutorName || ""
    };

    console.log(`[Odoo WhatsApp] Creating message for ${tutorName || ""} (${phone})`);
    const recordId = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "whatsapp.message",
      "create",
      [payload]
    ]);

    console.log(`[Odoo WhatsApp] Message created successfully with ID: ${recordId}`);
    return { success: true, id: recordId };
  } catch (err) {
    console.error("[Odoo WhatsApp Error]:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches recent inbound whatsapp.message records for a specific phone number since a certain date
 */
export async function fetchOdooWhatsAppReplies(tutorPhone, sinceDate) {
  try {
    const uid = await callOdoo("common", "authenticate", [
      DB,
      USERNAME,
      PASSWORD,
      {},
    ]);

    // Clean phone number to compare
    let cleanPhone = String(tutorPhone).replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      return []; // Skip sync for invalid phone numbers
    }
    cleanPhone = cleanPhone.slice(-10);

    // Format sinceDate to Odoo UTC format, subtracting a 5-minute buffer for clock skew
    const bufferTime = new Date(new Date(sinceDate).getTime() - 5 * 60 * 1000);
    const utcDateStr = bufferTime.toISOString().replace("T", " ").substring(0, 19);

    const domain = [
      ["message_type", "=", "inbound"],
      ["create_date", ">=", utcDateStr],
      "|",
      ["mobile_number", "like", cleanPhone],
      ["mobile_number_formatted", "like", cleanPhone]
    ];

    const replies = await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "whatsapp.message",
      "search_read",
      [domain],
      { fields: ["id", "body", "create_date"] }
    ]);

    return replies;
  } catch (err) {
    console.error("[Odoo fetch replies error]:", err.message);
    return [];
  }
}
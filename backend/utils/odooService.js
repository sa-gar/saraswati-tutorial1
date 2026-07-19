import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;

async function callOdoo(service, method, args) {

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
 * Sync tutor performance statistics to the Odoo Master Tutors record.
 * Called after assignment or status changes.
 *
 * @param {string|number} odooRecordId - The Odoo x_master_tutors record ID
 * @param {Object} stats
 * @param {number} stats.assignmentsCompleted
 * @param {number} stats.assignmentsActive
 * @param {number} stats.demoTaken
 * @param {number} stats.demoCancelled
 * @param {number} stats.successfulEnrollments
 * @param {number} stats.successRate - 0-100 percentage
 * @param {number} [stats.averageRating]
 */
export async function syncTutorStats(odooRecordId, stats) {
  try {
    const uid = await callOdoo("common", "authenticate", [DB, USERNAME, PASSWORD, {}]);
    if (!uid) throw new Error("Odoo login failed");

    const payload = {};
    if (stats.assignmentsCompleted != null) payload.x_assignments_completed = stats.assignmentsCompleted;
    if (stats.assignmentsActive != null) payload.x_assignments_active = stats.assignmentsActive;
    if (stats.demoTaken != null) payload.x_demo_taken = stats.demoTaken;
    if (stats.demoCancelled != null) payload.x_demo_cancelled = stats.demoCancelled;
    if (stats.successfulEnrollments != null) payload.x_successful_enrollments = stats.successfulEnrollments;
    if (stats.successRate != null) payload.x_success_rate = stats.successRate;
    if (stats.averageRating != null) payload.x_average_rating = stats.averageRating;

    await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "x_master_tutors",
      "write",
      [[parseInt(odooRecordId)], payload],
    ]);

    console.log("[Odoo] Tutor stats synced for record ID:", odooRecordId);
    return true;
  } catch (err) {
    console.error("[Odoo] Error in syncTutorStats:", err.message);
    return false;
  }
}

/**
 * Update a CRM lead (parent enquiry) with full tutor assignment details.
 *
 * @param {string|number} leadId - The Odoo crm.lead record ID
 * @param {Object} assignmentDetails
 * @param {string} assignmentDetails.tutorName
 * @param {string} [assignmentDetails.tutorCode]
 * @param {string} [assignmentDetails.tutorPhone]
 * @param {string} [assignmentDetails.demoDate]
 * @param {string} [assignmentDetails.demoTime]
 * @param {string} [assignmentDetails.requirementId]
 */
export async function updateLeadAssignment(leadId, assignmentDetails) {
  try {
    const uid = await callOdoo("common", "authenticate", [DB, USERNAME, PASSWORD, {}]);
    if (!uid) throw new Error("Odoo login failed");

    const payload = {};
    if (assignmentDetails.tutorName) payload.x_studio_assigned_tutor = assignmentDetails.tutorName;
    if (assignmentDetails.tutorCode) payload.x_studio_tutor_code = assignmentDetails.tutorCode;
    if (assignmentDetails.tutorPhone) payload.x_studio_assigned_tutor_phone = assignmentDetails.tutorPhone;
    if (assignmentDetails.demoDate) payload.x_studio_demo_date = assignmentDetails.demoDate;
    if (assignmentDetails.demoTime) payload.x_studio_demo_time = assignmentDetails.demoTime;
    payload.x_studio_lead_status = "Demo Scheduled";

    await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "crm.lead",
      "write",
      [[parseInt(leadId)], payload],
    ]);

    console.log("[Odoo] Lead assignment updated for lead ID:", leadId);
    return true;
  } catch (err) {
    console.error("[Odoo] Error in updateLeadAssignment:", err.message);
    return false;
  }
}

/**
 * Post a message to the Odoo CRM lead chatter.
 * Used to log broadcast events, tutor responses, and sync status directly
 * in the Odoo lead's activity feed so admins can see history without
 * switching to the Node.js dashboard.
 *
 * @param {string|number} leadId - The Odoo crm.lead record ID
 * @param {string} message - HTML or plain text message body
 * @param {string} [messageType="comment"] - "comment"|"email"|"notification"
 * @returns {Promise<boolean>}
 */
export async function addOdooChatterMessage(leadId, message, messageType = "comment") {
  try {
    const uid = await callOdoo("common", "authenticate", [DB, USERNAME, PASSWORD, {}]);
    if (!uid) throw new Error("Odoo login failed");

    await callOdoo("object", "execute_kw", [
      DB,
      uid,
      PASSWORD,
      "crm.lead",
      "message_post",
      [[parseInt(leadId)]],
      {
        body: message,
        message_type: messageType,
        subtype_xmlid: "mail.mt_note",
      },
    ]);

    console.log(`[Odoo] Chatter message posted to lead ${leadId}`);
    return true;
  } catch (err) {
    console.error("[Odoo] Error posting chatter message:", err.message);
    return false;
  }
}

/**
 * Sync tutor recommendations into the Odoo "Matching Tutors" model.
 *
 * The model name is read from the environment variable ODOO_MATCHING_TUTORS_MODEL
 * (defaults to "x_tutor").  A saraswati.matching_tutor_model Odoo config param
 * is also checked first so it can be set once inside Odoo without a redeploy.
 *
 * Duplicate prevention strategy:
 *   Before inserting fresh records the function searches the model for records
 *   whose x_studio_notes field contains the current lead's requirementId and
 *   deletes them.  This guarantees that every "Search Tutor" click produces a
 *   clean, up-to-date list with no duplicates.
 *
 * Resilience:
 *   All Odoo calls are individually wrapped.  If any step fails (delete, create,
 *   field-introspection) the error is logged and the function returns gracefully.
 *   The chatter message posted by the caller is NEVER affected by this function.
 *
 * @param {Object} lead            — ParentEnquiry document (lean or plain object)
 * @param {Object} recommendations — 4-bucket object: { exact, nearby, city, backup }
 * @returns {Promise<{ inserted: number, deleted: number, errors: number }>}
 */
export async function syncMatchingTutorsToOdoo(lead, recommendations) {
  // ── 1. Resolve model name ───────────────────────────────────────────────────
  let modelName = process.env.ODOO_MATCHING_TUTORS_MODEL || "x_tutor";

  // Also allow override via Odoo system parameter (takes priority)
  try {
    const uid = await callOdoo("common", "authenticate", [DB, USERNAME, PASSWORD, {}]);
    if (uid) {
      const cfgParam = await callOdoo("object", "execute_kw", [
        DB, uid, PASSWORD,
        "ir.config_parameter", "search_read",
        [[["key", "=", "saraswati.matching_tutor_model"]]],
        { fields: ["value"], limit: 1 },
      ]);
      if (cfgParam?.[0]?.value) {
        modelName = cfgParam[0].value;
        console.log(`[OdooService] Using Odoo-configured matching tutor model: "${modelName}"`);
      }
    }
  } catch (cfgErr) {
    // Non-fatal — continue with env/default value
    console.warn("[OdooService] Could not read saraswati.matching_tutor_model param:", cfgErr.message);
  }

  const requirementId = lead.requirementId || "";
  const odooLeadId   = lead.odooLeadId    || null;

  console.log(
    `[OdooService] syncMatchingTutorsToOdoo — model: "${modelName}", ` +
    `lead: ${requirementId} (odooLeadId: ${odooLeadId})`
  );

  let inserted = 0;
  let deleted  = 0;
  let errors   = 0;

  try {
    // ── 2. Authenticate ───────────────────────────────────────────────────────
    const uid = await callOdoo("common", "authenticate", [DB, USERNAME, PASSWORD, {}]);
    if (!uid) throw new Error("Odoo login failed");

    // ── 3. Introspect model fields once ───────────────────────────────────────
    let availableFields = new Set();
    try {
      const fieldsResult = await callOdoo("object", "execute_kw", [
        DB, uid, PASSWORD,
        modelName, "fields_get", [], {},
      ]);
      availableFields = new Set(Object.keys(fieldsResult || {}));
      console.log(`[OdooService] "${modelName}" has ${availableFields.size} fields`);
    } catch (fieldsErr) {
      console.warn(`[OdooService] Could not introspect "${modelName}" fields:`, fieldsErr.message);
      // Continue with best-effort mapping — payloads will skip unknown fields anyway
    }

    // Helper: only add a key/value pair if the field actually exists in the model
    const hasField = (f) => availableFields.size === 0 || availableFields.has(f);

    // ── 4. Detect CRM-lead relation field (if any) ───────────────────────────
    //       Looks for many2one fields pointing to crm.lead
    let leadRelField = null;
    for (const [fname, fdef] of Object.entries(
      availableFields.size > 0
        ? await callOdoo("object", "execute_kw", [DB, uid, PASSWORD, modelName, "fields_get", [], {}]).catch(() => ({}))
        : {}
    )) {
      if (fdef?.type === "many2one" && fdef?.relation === "crm.lead") {
        leadRelField = fname;
        console.log(`[OdooService] Found CRM-lead relation field: "${leadRelField}"`);
        break;
      }
    }

    // ── 5. Delete stale records for this lead ─────────────────────────────────
    //       Strategy A: if a crm.lead many2one field exists, filter by that
    //       Strategy B: filter by requirementId stored in x_studio_notes
    if (requirementId) {
      try {
        let domain;
        if (leadRelField && odooLeadId) {
          domain = [[leadRelField, "=", parseInt(odooLeadId)]];
        } else if (hasField("x_studio_notes")) {
          // We store "REQ-XXXXX" in notes — search for records we created
          domain = [["x_studio_notes", "like", requirementId]];
        }

        if (domain) {
          const oldIds = await callOdoo("object", "execute_kw", [
            DB, uid, PASSWORD,
            modelName, "search", [domain],
          ]);
          if (Array.isArray(oldIds) && oldIds.length > 0) {
            await callOdoo("object", "execute_kw", [
              DB, uid, PASSWORD,
              modelName, "unlink", [oldIds],
            ]);
            deleted = oldIds.length;
            console.log(
              `[OdooService] Deleted ${deleted} stale matching tutor records ` +
              `for ${requirementId}`
            );
          }
        }
      } catch (delErr) {
        // Non-fatal: log and continue to insertion
        console.warn("[OdooService] Could not delete stale matching records:", delErr.message);
      }
    }

    // ── 6. Flatten recommendations into a single ordered list ─────────────────
    const timestamp = new Date().toISOString();
    const tiers = [
      { key: "exact",  label: "Exact"  },
      { key: "nearby", label: "Nearby" },
      { key: "city",   label: "City"   },
      { key: "backup", label: "Backup" },
    ];

    const allTutors = [];
    for (const { key, label } of tiers) {
      const bucket = recommendations[key];
      if (!Array.isArray(bucket)) continue;
      for (const t of bucket) {
        allTutors.push({ ...t, matchCategory: label });
      }
    }

    if (allTutors.length === 0) {
      console.log("[OdooService] No tutors to insert into matching model.");
      return { inserted, deleted, errors };
    }

    // ── 7. Insert one record per recommended tutor ────────────────────────────
    for (const tutor of allTutors) {
      try {
        const payload = {};

        // Utility: conditionally add a field value
        const field = (f, val) => {
          if (hasField(f) && val != null && val !== "") payload[f] = val;
        };

        // ── CRM Lead relation ────────────────────────────────────────────────
        if (leadRelField && odooLeadId) {
          field(leadRelField, parseInt(odooLeadId));
        }

        // ── Core tutor identity ──────────────────────────────────────────────
        field("x_name",                       tutor.name              || "");
        field("x_studio_full_name",           tutor.name              || "");
        field("x_studio_full_name_1",         tutor.name              || "");
        field("x_studio_tutor_id",            tutor.tutorCode         || "");
        field("x_studio_tutor_id_1",          tutor.tutorCode         || "");
        field("x_studio_tutor_id_2",          tutor.tutorCode         || "");
        field("x_studio_tutor_name",          tutor.tutorCode         || "");

        // ── Contact ──────────────────────────────────────────────────────────
        field("x_studio_mobile_number",       tutor.phone             || tutor.whatsapp || "");
        field("x_studio_mobile_number_1",     tutor.phone             || tutor.whatsapp || "");
        field("x_studio_mobile_number_2",     tutor.phone             || tutor.whatsapp || "");
        field("x_studio_mobile_number_3",     tutor.phone             || tutor.whatsapp || "");
        field("x_studio_whatsapp_number",     tutor.whatsapp          || tutor.phone    || "");
        field("x_studio_whatsapp_number_1",   tutor.whatsapp          || tutor.phone    || "");
        field("x_studio_whatsapp_number_2",   tutor.whatsapp          || tutor.phone    || "");
        field("x_studio_partner_phone",       tutor.phone             || tutor.whatsapp || "");
        field("x_studio_email_address",       tutor.email             || "");
        field("x_studio_email_address_1",     tutor.email             || "");
        field("x_studio_email_address_2",     tutor.email             || "");
        field("x_studio_partner_email",       tutor.email             || "");

        // ── Location ─────────────────────────────────────────────────────────
        field("x_studio_city",                tutor.city              || "");
        field("x_studio_city_1",              tutor.city              || "");
        field("x_studio_city_2",              tutor.city              || "");
        field("x_studio_city_3",              tutor.city              || "");
        field("x_studio_area",                tutor.area              || "");
        field("x_studio_area_1",              tutor.area              || "");
        field("x_studio_area_2",              tutor.area              || "");
        field("x_studio_area_3",              tutor.area              || "");
        field("x_studio_pincode",             tutor.pincode           || "");
        field("x_studio_pincode_1",           tutor.pincode           || "");
        field("x_studio_pincode_2",           tutor.pincode           || "");
        field("x_studio_pincode_3",           tutor.pincode           || "");

        // ── Profile ──────────────────────────────────────────────────────────
        field("x_studio_qualification",       tutor.qualification     || "");
        field("x_studio_qualification_1",     tutor.qualification     || "");
        field("x_studio_qualification_2",     tutor.qualification     || "");
        field("x_studio_experience",          tutor.experience        || "");
        field("x_studio_experience_1",        tutor.experience        || "");
        field("x_studio_experience_2",        tutor.experience        || "");

        const gradesStr   = Array.isArray(tutor.grades)   ? tutor.grades.join(", ")   : (tutor.grades   || "");
        const subjectsStr = Array.isArray(tutor.subjects) ? tutor.subjects.join(", ") : (tutor.subjects || "");
        const timingsStr  = Array.isArray(tutor.timings)  ? tutor.timings.join(", ")  : (tutor.timings  || "");
        const boardsStr   = Array.isArray(tutor.boards)   ? tutor.boards.join(", ")   : (tutor.boards   || "");

        field("x_studio_grades_can_teach",    gradesStr);
        field("x_studio_grades_can_teach_1",  gradesStr);
        field("x_studio_grade",               gradesStr);
        field("x_studio_grade_can_teach",     gradesStr);
        field("x_studio_subjects",            subjectsStr);
        field("x_studio_subject",             subjectsStr);
        field("x_studio_subject_1",           subjectsStr);
        field("x_studio_subject_2",           subjectsStr);
        field("x_studio_boards_can_teach",    boardsStr);
        field("x_studio_boards_can_teach_1",  boardsStr);
        field("x_studio_board_can_teach",     boardsStr);
        field("x_studio_preferred_timings",   timingsStr);
        field("x_studio_preferred_timings_1", timingsStr);
        field("x_studio_perferred_timings",   timingsStr);

        // ── Availability ──────────────────────────────────────────────────────
        // x_studio_availability_status is a selection field — only pass if it's a valid selection value
        // Known values from Odoo model: Available, Busy, Inactive, Not Active, Archived, Blocked
        const avStatus = tutor.availabilityStatus || "Available";
        field("x_studio_availability_status", avStatus);
        field("x_studio_availability",        avStatus);
        field("x_studio_availability_1",      avStatus);

        // ── Matching score & metadata (stored in notes) ───────────────────────
        //    x_studio_success_rate_ and x_studio_rating are float fields — we
        //    map match percentage to success_rate for display convenience.
        field("x_studio_success_rate_", typeof tutor.matchPercentage === "number" ? tutor.matchPercentage : null);

        const notesLines = [
          `Requirement: ${requirementId}`,
          `Match Category: ${tutor.matchCategory}`,
          `Match %: ${tutor.matchPercentage ?? "N/A"}%`,
          tutor.distanceKm != null ? `Distance: ${tutor.distanceKm} km` : null,
          tutor.reason      ? `Reason: ${tutor.reason}` : null,
          `Synced at: ${timestamp}`,
        ].filter(Boolean).join("\n");

        field("x_studio_notes",               notesLines);
        field("x_studio_full_address",        tutor.fullAddress || "");

        // ── Insert record ─────────────────────────────────────────────────────
        const newId = await callOdoo("object", "execute_kw", [
          DB, uid, PASSWORD,
          modelName, "create", [payload],
        ]);

        inserted++;
        console.log(
          `[OdooService] ✅ Inserted matching tutor #${newId}: ` +
          `${tutor.name} | ${tutor.matchCategory} | ${tutor.matchPercentage}% ` +
          `${tutor.distanceKm != null ? `| ${tutor.distanceKm} km` : ""}`
        );

      } catch (tutorErr) {
        errors++;
        console.error(
          `[OdooService] ❌ Failed to insert matching tutor ${tutor.name}:`,
          tutorErr.message
        );
      }
    }

    console.log(
      `[OdooService] syncMatchingTutorsToOdoo complete — ` +
      `inserted: ${inserted}, deleted: ${deleted}, errors: ${errors}`
    );
    return { inserted, deleted, errors };

  } catch (err) {
    console.error("[OdooService] syncMatchingTutorsToOdoo critical error:", err.message);
    return { inserted, deleted, errors: errors + 1 };
  }
}
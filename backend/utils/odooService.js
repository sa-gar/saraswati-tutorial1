import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

// ─── Sanitize env vars ──────────────────────────────────────────────────────
// On some deployment platforms (Render, Heroku) env values set with surrounding
// single-quotes in the dashboard are passed literally with the quote characters.
// Strip them here so the _PASSWORD/URL are always clean strings.
function sanitizeEnv(val) {
  return (val || "").trim().replace(/^['"]|['"]$/g, "");
}

const _ODOO_URL      = sanitizeEnv(process.env.ODOO_URL).replace(/\/+$/, "");
const _DB            = sanitizeEnv(process.env.ODOO_DB);
const _USERNAME      = sanitizeEnv(process.env.ODOO_USERNAME);
const _PASSWORD      = sanitizeEnv(process.env.ODOO_PASSWORD);
const _JSONRPC_URL   = `${_ODOO_URL}/jsonrpc`;

async function callOdoo(service, method, args) {
  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: { service, method, args },
    id: Math.floor(Math.random() * 1000),
  };

  let res;
  try {
    res = await fetch(_JSONRPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (netErr) {
    console.error(`[OdooService] Network error connecting to "${_JSONRPC_URL}":`, netErr.message);
    throw new Error(`Odoo connection failed: ${netErr.message}`);
  }

  // Read body as text first — avoid crashing on HTML login/redirect pages
  const responseText = await res.text();
  let data;

  try {
    data = JSON.parse(responseText);
  } catch (parseErr) {
    const statusCode  = res.status;
    const finalUrl    = res.url;
    const contentType = res.headers.get("content-type") || "unknown";
    const bodySnippet = responseText.substring(0, 300);

    console.error(`[OdooService] ❌ Non-JSON response — Odoo JSON-RPC request failed:`);
    console.error(`  Target JSON-RPC URL : ${_JSONRPC_URL}`);
    console.error(`  HTTP Status Code    : ${statusCode}`);
    console.error(`  Final URL           : ${finalUrl}`);
    console.error(`  Content-Type        : ${contentType}`);
    console.error(`  Response snippet    :\n${bodySnippet}`);

    throw new Error(
      `Odoo returned non-JSON (HTTP ${statusCode}): ${bodySnippet.replace(/\s+/g, " ").trim().substring(0, 120)}`
    );
  }

  if (data.error) {
    const errMsg = data.error?.data?.message || data.error?.message || "Odoo Error";
    throw new Error(errMsg);
  }

  return data.result;
}


export async function createLead(data) {

  try {
    // LOGIN
    const uid = await callOdoo("common", "authenticate", [
      _DB,
      _USERNAME,
      _PASSWORD,
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
          _DB,
          uid,
          _PASSWORD,
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
      _DB,
      uid,
      _PASSWORD,

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
      _DB,
      _USERNAME,
      _PASSWORD,
      {},
    ]);

    if (!uid) {
      throw new Error("Odoo login failed");
    }

    await callOdoo("object", "execute_kw", [
      _DB,
      uid,
      _PASSWORD,

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
      _DB,
      _USERNAME,
      _PASSWORD,
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
      _DB,
      uid,
      _PASSWORD,
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
        _DB,
        uid,
        _PASSWORD,
        "x_master_tutors",
        "write",
        [[recordId], payload]
      ]);

      return { id: recordId, tutorCode };
    } else {
      console.log("[Odoo] No existing tutor found. Generating sequential Tutor ID...");
      const count = await callOdoo("object", "execute_kw", [
        _DB,
        uid,
        _PASSWORD,
        "x_master_tutors",
        "search_count",
        [[]]
      ]);

      const tutorCode = `TUT${String(count + 1).padStart(4, "0")}`;
      payload.x_tutor_id = tutorCode;

      console.log("[Odoo] Creating new Master Tutor record with Tutor ID:", tutorCode);
      const recordId = await callOdoo("object", "execute_kw", [
        _DB,
        uid,
        _PASSWORD,
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
    const uid = await callOdoo("common", "authenticate", [_DB, _USERNAME, _PASSWORD, {}]);
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
      _DB,
      uid,
      _PASSWORD,
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
    const uid = await callOdoo("common", "authenticate", [_DB, _USERNAME, _PASSWORD, {}]);
    if (!uid) throw new Error("Odoo login failed");

    const payload = {};
    if (assignmentDetails.tutorName) payload.x_studio_assigned_tutor = assignmentDetails.tutorName;
    if (assignmentDetails.tutorCode) payload.x_studio_tutor_code = assignmentDetails.tutorCode;
    if (assignmentDetails.tutorPhone) payload.x_studio_assigned_tutor_phone = assignmentDetails.tutorPhone;
    if (assignmentDetails.demoDate) payload.x_studio_demo_date = assignmentDetails.demoDate;
    if (assignmentDetails.demoTime) payload.x_studio_demo_time = assignmentDetails.demoTime;
    payload.x_studio_lead_status = "Demo Scheduled";

    await callOdoo("object", "execute_kw", [
      _DB,
      uid,
      _PASSWORD,
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
    const uid = await callOdoo("common", "authenticate", [_DB, _USERNAME, _PASSWORD, {}]);
    if (!uid) throw new Error("Odoo login failed");

    await callOdoo("object", "execute_kw", [
      _DB,
      uid,
      _PASSWORD,
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
 * Look up Odoo x_master_tutors record IDs for a flat list of recommended tutors.
 *
 * Two-pass strategy:
 *   Pass 1 — match by tutorCode (x_tutor_id).  Only tutors whose code was set
 *             by upsertMasterTutor() will match here.
 *   Pass 2 — match remaining tutors by phone/WhatsApp (last-10-digit suffix).
 *
 * @param {Array<{ tutorCode?: string, phone?: string, whatsapp?: string }>} tutors
 * @returns {Promise<{ odooIds: number[], odooModel: string }>}
 *   odooIds  — deduplicated list of matched x_master_tutors record IDs
 *   odooModel — always "x_master_tutors" (used by the Odoo window action)
 */
export async function lookupOdooMasterTutorIds(tutors) {
  const odooIds   = [];
  const odooModel = "x_master_tutors";

  if (!Array.isArray(tutors) || tutors.length === 0) {
    return { odooIds, odooModel };
  }

  try {
    const uid = await callOdoo("common", "authenticate", [_DB, _USERNAME, _PASSWORD, {}]);
    if (!uid) {
      console.warn("[OdooService] lookupOdooMasterTutorIds: Odoo login failed");
      return { odooIds, odooModel };
    }

    // ── Normalize a phone string to last-10 digits ────────────────────────────
    const normPhone = (raw) => {
      const digits = String(raw || "").replace(/\D/g, "");
      return digits.length >= 10 ? digits.slice(-10) : digits;
    };

    const codes  = [...new Set(tutors.map(t => (t.tutorCode || "").trim()).filter(Boolean))];
    const phones = [...new Set(
      tutors.flatMap(t => [t.phone, t.whatsapp])
            .filter(Boolean)
            .map(normPhone)
            .filter(p => p.length >= 6)
    )];

    // ── Pass 1: match by tutorCode ────────────────────────────────────────────
    if (codes.length > 0) {
      const byCode = await callOdoo("object", "execute_kw", [
        _DB, uid, _PASSWORD,
        "x_master_tutors", "search_read",
        [[[  "x_tutor_id", "in", codes ]]],
        { fields: ["id"], limit: 200 },
      ]);
      byCode.forEach(r => odooIds.push(r.id));
    }

    // ── Pass 2: match remaining tutors by phone suffix ────────────────────────
    if (phones.length > 0) {
      // Odoo domain OR is prefix notation: N leaf terms need N-1 "|" operators,
      // each placed before the pair it joins.
      // e.g. OR(A, B, C, D) → ["|", A, "|", B, "|", C, D]  (3 "|"s for 4 leaves)
      //
      // We produce 2 leaf conditions per phone (x_mobile LIKE p, x_whatsapp LIKE p),
      // then build the full OR chain.
      const leaves = [];
      phones.forEach(p => {
        leaves.push(["x_mobile",   "like", p]);
        leaves.push(["x_whatsapp", "like", p]);
      });

      // Prepend (leaves.length - 1) OR operators
      const phoneDomain = [];
      for (let i = 0; i < leaves.length - 1; i++) {
        phoneDomain.push("|");
      }
      leaves.forEach(leaf => phoneDomain.push(leaf));

      const byPhone = await callOdoo("object", "execute_kw", [
        _DB, uid, _PASSWORD,
        "x_master_tutors", "search_read",
        [phoneDomain],
        { fields: ["id"], limit: 200 },
      ]);
      byPhone.forEach(r => {
        if (!odooIds.includes(r.id)) odooIds.push(r.id);
      });
    }

    console.log(
      `[OdooService] lookupOdooMasterTutorIds — ` +
      `codes: ${codes.length}, phones: ${phones.length}, matched: ${odooIds.length}`
    );
  } catch (err) {
    console.error("[OdooService] lookupOdooMasterTutorIds error:", err.message);
  }

  return { odooIds, odooModel };
}

/**
 * Update crm.lead record in Odoo with recommended x_master_tutors IDs.
 * Uses Odoo ORM command [(6, 0, ids)] to replace the Many2many relation.
 * Field name: x_recommended_tutor_ids (related model: x_master_tutors)
 */
export async function updateLeadRecommendedTutors(odooLeadId, odooIds = []) {
  if (!odooLeadId) return;

  try {
    const uid = await callOdoo("common", "authenticate", [_DB, _USERNAME, _PASSWORD, {}]);
    if (!uid) {
      console.warn("[OdooService] updateLeadRecommendedTutors: Odoo auth failed");
      return;
    }

    const cleanLeadId = Number(odooLeadId);
    const cleanIds    = (odooIds || []).map(Number).filter((id) => !isNaN(id));

    await callOdoo("object", "execute_kw", [
      _DB,
      uid,
      _PASSWORD,
      "crm.lead",
      "write",
      [
        [cleanLeadId],
        {
          x_recommended_tutor_ids: [[6, 0, cleanIds]],
        },
      ],
    ]);

    console.log(
      `[OdooService] ✅ Updated crm.lead #${cleanLeadId} x_recommended_tutor_ids with ${cleanIds.length} tutor ID(s)`
    );
  } catch (err) {
    console.error(
      `[OdooService] Failed to update crm.lead #${odooLeadId} x_recommended_tutor_ids:`,
      err.message
    );
  }
}


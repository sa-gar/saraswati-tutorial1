import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

/* ============================================================================
   ENVIRONMENT CONFIGURATION
============================================================================ */

function sanitizeEnv(val) {
  return (val || "").trim().replace(/^['"]|['"]$/g, "");
}

const _ODOO_URL = sanitizeEnv(process.env.ODOO_URL).replace(/\/+$/, "");
const _DB = sanitizeEnv(process.env.ODOO_DB);
const _USERNAME = sanitizeEnv(process.env.ODOO_USERNAME);
const _PASSWORD = sanitizeEnv(process.env.ODOO_PASSWORD);

const _ATTENDANCE_API_TOKEN = sanitizeEnv(
  process.env.ODOO_ATTENDANCE_API_TOKEN
);

const _JSONRPC_URL = `${_ODOO_URL}/jsonrpc`;

const _ATTENDANCE_API_URL =
  `${_ODOO_URL}/tuition/api/v1/attendance`;


/* ============================================================================
   STARTUP DIAGNOSTICS
============================================================================ */

console.log(`[OdooService] Odoo base URL          : ${_ODOO_URL}`);
console.log(`[OdooService] Odoo JSON-RPC endpoint : ${_JSONRPC_URL}`);
console.log(`[OdooService] Attendance API         : ${_ATTENDANCE_API_URL}`);
console.log(`[OdooService] Odoo DB                : ${_DB}`);
console.log(`[OdooService] Odoo username          : ${_USERNAME}`);

console.log(
  `[OdooService] Attendance API token  : ${
    _ATTENDANCE_API_TOKEN ? "Configured ✅" : "Missing ❌"
  }`
);


/* ============================================================================
   GENERIC ODOO JSON-RPC CALL
============================================================================ */

async function callOdoo(service, method, args) {

  const payload = {
    jsonrpc: "2.0",
    method: "call",

    params: {
      service,
      method,
      args,
    },

    id: Math.floor(Math.random() * 1000000),
  };


  let res;

  try {

    res = await fetch(_JSONRPC_URL, {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify(payload),

    });

  } catch (netErr) {

    console.error(
      `[OdooService] Network error connecting to "${_JSONRPC_URL}":`,
      netErr.message
    );

    throw new Error(
      `Odoo connection failed: ${netErr.message}`
    );
  }


  const responseText = await res.text();

  let data;


  try {

    data = JSON.parse(responseText);

  } catch (parseErr) {

    const statusCode = res.status;
    const finalUrl = res.url;

    const contentType =
      res.headers.get("content-type") || "unknown";

    const bodySnippet =
      responseText.substring(0, 300);


    console.error(
      `[OdooService] ❌ Non-JSON response from Odoo`
    );

    console.error(`Target URL    : ${_JSONRPC_URL}`);
    console.error(`HTTP Status   : ${statusCode}`);
    console.error(`Final URL     : ${finalUrl}`);
    console.error(`Content-Type  : ${contentType}`);
    console.error(`Response      : ${bodySnippet}`);


    throw new Error(
      `Odoo returned non-JSON (HTTP ${statusCode}): ` +
      bodySnippet
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 120)
    );
  }


  if (data.error) {

    const errMsg =
      data.error?.data?.message ||
      data.error?.message ||
      "Odoo Error";

    throw new Error(errMsg);
  }


  return data.result;
}


/* ============================================================================
   ATTENDANCE HELPERS
============================================================================ */

/**
 * Convert website attendance values into values accepted by
 * the dedicated Odoo Tuition Attendance API.
 *
 * Odoo accepts ONLY:
 *
 * completed
 * absent
 * cancelled
 */
function mapAttendanceStatus(status) {

  const value = String(status || "")
    .trim()
    .toLowerCase();


  switch (value) {

    case "done":
    case "complete":
    case "completed":
    case "present":
      return "completed";


    case "missed":
    case "absent":
    case "absence":
      return "absent";


    case "cancelled":
    case "canceled":
    case "cancel":
      return "cancelled";


    default:
      throw new Error(
        `Unsupported attendance status "${status}". ` +
        `Allowed values are completed, absent, cancelled.`
      );
  }
}


/**
 * Create/normalize class_datetime.
 *
 * Odoo API expects something such as:
 *
 * 2026-09-10T10:00:00+05:30
 */
function normalizeClassDatetime(value, fallbackTime = "10:00:00") {

  if (!value) {
    return null;
  }

  const raw = String(value).trim();


  // Already contains time + timezone
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw) &&
    (raw.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(raw))
  ) {
    return raw;
  }


  // YYYY-MM-DD only
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {

    return `${raw}T${fallbackTime}+05:30`;
  }


  // JS-compatible date
  const parsed = new Date(raw);

  if (!Number.isNaN(parsed.getTime())) {

    return parsed.toISOString();
  }


  throw new Error(
    `Invalid class datetime: ${value}`
  );
}


/**
 * Try to obtain a stable student ID.
 *
 * IMPORTANT:
 * website_student_id must represent the same student every time.
 */
function resolveWebsiteStudentId(log, lead) {

  const firstWard =
    Array.isArray(lead?.wards) && lead.wards.length
      ? lead.wards[0]
      : {};


  return (

    log?.websiteStudentId ||

    log?.website_student_id ||

    log?.studentExternalId ||

    firstWard?.websiteStudentId ||

    firstWard?.studentId ||

    firstWard?.externalStudentId ||

    lead?.websiteStudentId ||

    null

  );
}


/**
 * Permanent unique attendance ID.
 *
 * The same attendance record must always send the SAME
 * external_attendance_id to prevent duplicates in Odoo.
 */
function resolveExternalAttendanceId(log) {

  if (log?.externalAttendanceId) {
    return String(log.externalAttendanceId);
  }

  if (log?.external_attendance_id) {
    return String(log.external_attendance_id);
  }

  if (log?._id) {
    return `ATT-${String(log._id)}`;
  }

  if (log?.id) {
    return `ATT-${String(log.id)}`;
  }

  throw new Error(
    "Unable to generate external attendance ID because attendance record has no ID."
  );
}


/* ============================================================================
   NEW DEDICATED ODOO ATTENDANCE API
============================================================================ */

/**
 * Send attendance to:
 *
 * POST /tuition/api/v1/attendance
 *
 * Authorization:
 * Bearer <TOKEN>
 *
 * Odoo itself handles:
 *
 * - attendance calculation
 * - completed class counting
 * - tuition progress
 * - 90% threshold
 * - payment flow
 * - notifications
 */
export async function syncAttendanceToOdooApi({

  websiteStudentId,
  externalAttendanceId,

  tutorExternalId,
  tutorName,

  classDatetime,

  status,

  notes = "",

}) {

  try {

    if (!_ATTENDANCE_API_TOKEN) {

      throw new Error(
        "ODOO_ATTENDANCE_API_TOKEN is not configured"
      );
    }


    if (!websiteStudentId) {

      throw new Error(
        "website_student_id is required by Odoo Attendance API"
      );
    }


    if (!externalAttendanceId) {

      throw new Error(
        "external_attendance_id is required by Odoo Attendance API"
      );
    }


    const normalizedStatus =
      mapAttendanceStatus(status);


    if (!classDatetime) {

      throw new Error(
        "class_datetime is required for attendance synchronization"
      );
    }


    const normalizedDatetime =
      normalizeClassDatetime(classDatetime);


    const payload = {

      jsonrpc: "2.0",

      method: "call",

      params: {

        website_student_id:
          String(websiteStudentId),

        external_attendance_id:
          String(externalAttendanceId),

        tutor_external_id:
          tutorExternalId
            ? String(tutorExternalId)
            : "",

        tutor_name:
          tutorName || "",

        class_datetime:
          normalizedDatetime,

        status:
          normalizedStatus,

        notes:
          notes || "",

      },

      id: Date.now(),

    };


    console.log(
      `[Odoo Attendance API] Sending attendance ${externalAttendanceId}`
    );

    console.log(
      `[Odoo Attendance API] Student=${websiteStudentId}, ` +
      `Status=${normalizedStatus}, ` +
      `Class=${normalizedDatetime}`
    );


    let response;


    try {

      response = await fetch(
        _ATTENDANCE_API_URL,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Accept:
              "application/json",

            Authorization:
              `Bearer ${_ATTENDANCE_API_TOKEN}`,

          },

          body:
            JSON.stringify(payload),

        }
      );

    } catch (networkError) {

      throw new Error(
        `Attendance API connection failed: ${networkError.message}`
      );
    }


    const responseText =
      await response.text();


    let result;


    try {

      result =
        JSON.parse(responseText);

    } catch (parseError) {

      console.error(
        "[Odoo Attendance API] ❌ Non-JSON response"
      );

      console.error(
        "Status:",
        response.status
      );

      console.error(
        "URL:",
        response.url
      );

      console.error(
        "Response:",
        responseText.substring(0, 500)
      );


      throw new Error(
        `Odoo Attendance API returned non-JSON ` +
        `(HTTP ${response.status})`
      );
    }


    if (!response.ok) {

      const errorMessage =

        result?.error?.data?.message ||

        result?.error?.message ||

        result?.message ||

        `HTTP ${response.status}`;


      throw new Error(
        errorMessage
      );
    }


    if (result?.error) {

      const errorMessage =

        result.error?.data?.message ||

        result.error?.message ||

        "Odoo Attendance API Error";


      throw new Error(
        errorMessage
      );
    }


    console.log(
      `[Odoo Attendance API] ✅ Successfully synced ${externalAttendanceId}`
    );


    return {

      success: true,

      externalAttendanceId,

      data:
        result?.result ?? result,

    };


  } catch (err) {

    console.error(
      `[Odoo Attendance API] ❌ Sync failed for ${externalAttendanceId || "unknown"}:`,
      err.message
    );


    return {

      success: false,

      externalAttendanceId,

      error:
        err.message,

    };
  }
}


/* ============================================================================
   CREATE CRM LEAD
============================================================================ */

export async function createLead(data) {

  try {

    const uid =
      await callOdoo(
        "common",
        "authenticate",
        [
          _DB,
          _USERNAME,
          _PASSWORD,
          {},
        ]
      );


    console.log(
      "[Odoo] UID:",
      uid
    );


    if (!uid) {
      throw new Error(
        "Odoo login failed"
      );
    }


    let leadPayload = {};


    /* ------------------------------------------------------------------------
       TUTOR LEAD
    ------------------------------------------------------------------------ */

    if (data.userType === "tutor") {

      leadPayload = {

        name:
          data.name || "",

        phone:
          data.phone || "",

        email_from:
          data.email || "",


        x_studio_type:
          "Tutor",

        x_studio_experience:
          data.experience || "",


        x_studio_hasoccupation:
          data.hasOccupation || false,

        x_studio_occupation:
          data.occupation || "",


        x_studio_has_vehicle:
          data.hasVehicle || false,

        x_studio_vehicle_no:
          data.vehicleNumber || "",


        x_studio_source_1:
          "Website",

      };
    }


    /* ------------------------------------------------------------------------
       PARENT LEAD
    ------------------------------------------------------------------------ */

    else if (data.userType === "parent") {

      const ward =
        data.wards?.[0] || {};


      let curriculumVal = "";

      const curr =
        String(
          ward.curriculum || ""
        ).toUpperCase();


      if (
        curr.includes("STATE")
      ) {

        curriculumVal =
          "STATE";

      } else if (
        [
          "CBSE",
          "ICSE",
          "NIOS",
          "IB",
          "IGCSE",
        ].includes(curr)
      ) {

        curriculumVal =
          curr;
      }


      let daysWeekVal = "";


      if (data.daysPerWeek) {

        daysWeekVal =
          `${data.daysPerWeek} Days`;

      } else {

        const daysCount =
          (data.preferredDays || []).length;


        if (
          daysCount >= 2 &&
          daysCount <= 6
        ) {

          daysWeekVal =
            `${daysCount} Days`;

        } else if (
          daysCount === 1
        ) {

          daysWeekVal =
            "2 Days";

        } else if (
          daysCount >= 7
        ) {

          daysWeekVal =
            "6 Days";
        }
      }


      let hoursDaysVal = "";


      if (data.hoursPerDay) {

        const h =
          Number(
            data.hoursPerDay
          );


        hoursDaysVal =
          `${h} ${
            h === 1 || h === 1.5
              ? "Hr"
              : "Hrs"
          }`;

      } else {

        const dur =
          String(
            data.classDuration || ""
          ).toLowerCase();


        if (
          dur.includes("1.5")
        ) {

          hoursDaysVal =
            "1.5 Hr";

        } else if (
          dur.includes("1")
        ) {

          hoursDaysVal =
            "1 Hr";

        } else if (
          dur.includes("2")
        ) {

          hoursDaysVal =
            "2 Hrs";
        }
      }


      const wardsInfo =
        (data.wards || [])
          .map(
            (w, idx) =>

              `Student ${idx + 1}: ` +

              `${w.studentName || "N/A"} ` +

              `(Class: ${w.classGrade || "N/A"}, ` +

              `Board: ${w.curriculum || "N/A"}, ` +

              `Subjects: ${
                (w.subjectsNeeded || [])
                  .join(", ") || "N/A"
              })`

          )
          .join("\n");


      const descriptionText = [

        `--- WEBSITE PARENT ENQUIRY ---`,

        `Parent Name: ${
          data.parentName || "N/A"
        }`,

        `Phone: ${
          data.phone || "N/A"
        }`,

        `Email: ${
          data.email || "N/A"
        }`,

        `Tuition Mode: ${
          data.preferredMode ||
          "Not Specified"
        }`,

        `Plan Type: ${
          data.planType
            ? data.planType.toUpperCase()
            : "Not Specified"
        }`,

        `Days / Week: ${
          data.daysPerWeek
            ? `${data.daysPerWeek} Days`
            : "Not Specified"
        }`,

        `Hours / Day: ${
          data.hoursPerDay
            ? `${data.hoursPerDay} Hr`
            : "Not Specified"
        }`,

        `Preferred Days: ${
          Array.isArray(
            data.preferredDays
          ) &&
          data.preferredDays.length > 0

            ? data.preferredDays.join(", ")

            : "Not Specified"
        }`,

        `Class Timing Slot: ${
          data.classTimingSlot ||
          "Not Specified"
        }`,

        `Monthly Fees: ${
          data.monthlyFees
            ? `₹${data.monthlyFees}`
            : "N/A"
        }`,

        `Final Price: ${
          data.finalPrice
            ? `₹${data.finalPrice}`
            : "N/A"
        }`,

        `Pricing Consent: ${
          data.pricingConsent
            ? "Yes (Accepted)"
            : "No"
        }`,

        `Address: ${
          data.address ||
          data.area ||
          "N/A"
        }`,

        `------------------------------`,

        wardsInfo
          ? `STUDENTS:\n${wardsInfo}`
          : `Student Name: ${
              ward.studentName || "N/A"
            }`,

        `------------------------------`,

        `UTM Source: ${
          data.utm_source ||
          "Direct"
        }`,

        `UTM Medium: ${
          data.utm_medium ||
          "none"
        }`,

        `UTM Campaign: ${
          data.utm_campaign ||
          "none"
        }`,

        `UTM Content: ${
          data.utm_content ||
          "none"
        }`,

        `UTM Term: ${
          data.utm_term ||
          "none"
        }`,

      ]
        .filter(Boolean)
        .join("\n");


      leadPayload = {

        name:
          data.parentName || "",

        contact_name:
          data.parentName || "",

        phone:
          data.phone || "",

        email_from:
          data.email || "",


        // ── Odoo Community native fields ──────────────────────────────────────
        lead_category:
          "Parent",

        website_student_id:
          data.websiteStudentId || "",

        requirement_id:
          data.requirementId || "",

        parent_name:
          data.parentName || "",

        student_name:
          ward.studentName || "",

        student_class:
          ward.classGrade || "",

        tuition_parent_whatsapp:
          data.phone || "",

        locality:
          data.address || data.area || "",

        subjects_intrested:
          (ward.subjectsNeeded || []).join(", "),

        preferred_timings:
          data.preferredTime || "",

        preferred_tutor_gender:
          data.preferredGender === "Flexible"
            ? "No Preference"
            : (data.preferredGender?.toString() || "No Preference"),


        // ── Odoo Studio/legacy fields (kept for backward compat) ──────────────
        x_studio_type:
          "Parent",

        x_studio_source_1:
          "Website",


        description:
          descriptionText,


        x_studio_parent_name:
          data.parentName || "",

        x_studio_class:
          ward.classGrade || "",

        x_studio_student_name:
          ward.studentName || "",


        x_studio_subjects_intrested:
          (ward.subjectsNeeded || [])
            .join(", "),


        x_studio_preferred_timings:
          data.preferredTime || "",


        x_studio_locality:
          data.address ||
          data.area ||
          "",


        x_studio_preferred_tutor_gender:
          data.preferredGender ===
          "Flexible"

            ? "No Preference"

            : (
                data.preferredGender
                  ?.toString() ||
                "No Preference"
              ),


        x_studio_registration_date:
          new Date()
            .toISOString()
            .split("T")[0],

      };


      if (curriculumVal) {

        leadPayload.x_studio_curriculumboard =
          curriculumVal;
      }


      if (daysWeekVal) {

        leadPayload.x_studio_daysweek =
          daysWeekVal;
      }


      if (hoursDaysVal) {

        leadPayload.x_studio_hoursdays =
          hoursDaysVal;
      }


      // Use caller-supplied requirementId (from MongoDB) if available,
      // otherwise fall back to querying Odoo for sequential count.
      if (data.requirementId) {

        leadPayload.x_studio_requirement_id = data.requirementId;
        leadPayload.requirement_id = data.requirementId;

        console.log(
          "[Odoo] Using pre-supplied Requirement ID:",
          data.requirementId
        );

      } else {

        console.log(
          "[Odoo] Generating Requirement ID from Odoo count..."
        );


        try {

          const count =
            await callOdoo(
              "object",
              "execute_kw",
              [
                _DB,
                uid,
                _PASSWORD,

                "crm.lead",

                "search_count",

                [
                  [
                    [
                      "x_studio_type",
                      "=",
                      "Parent",
                    ],
                  ],
                ],
              ]
            );


          const reqId =
            `REQ-${String(
              count + 1
            ).padStart(
              5,
              "0"
            )}`;


          leadPayload.x_studio_requirement_id =
            reqId;

          leadPayload.requirement_id =
            reqId;


          console.log(
            "[Odoo] Requirement ID:",
            reqId
          );


        } catch (seqErr) {

          console.error(
            "[Odoo] Failed to generate Requirement ID:",
            seqErr
          );
        }
      }
    }


    console.log(
      "[Odoo] Creating lead for:",
      data.userType
    );


    const leadId =
      await callOdoo(
        "object",
        "execute_kw",
        [
          _DB,
          uid,
          _PASSWORD,

          "crm.lead",

          "create",

          [leadPayload],
        ]
      );


    console.log(
      "[Odoo] Lead created:",
      leadId
    );


    return {

      id:
        leadId,

      requirementId:
        leadPayload.x_studio_requirement_id ||
        leadPayload.requirement_id ||
        "",

    };


  } catch (err) {

    console.error(
      "ODOO ERROR:",
      err
    );

    throw err;
  }
}


/* ============================================================================
   UPDATE CRM LEAD
============================================================================ */

export async function updateLead(
  leadId,
  values
) {

  try {

    const uid =
      await callOdoo(
        "common",
        "authenticate",
        [
          _DB,
          _USERNAME,
          _PASSWORD,
          {},
        ]
      );


    if (!uid) {

      throw new Error(
        "Odoo login failed"
      );
    }


    await callOdoo(
      "object",
      "execute_kw",
      [
        _DB,
        uid,
        _PASSWORD,

        "crm.lead",

        "write",

        [
          [parseInt(leadId)],
          values,
        ],
      ]
    );


    return true;


  } catch (err) {

    console.error(
      "UPDATE LEAD ERROR:",
      err
    );

    throw err;
  }
}


/* ============================================================================
   MASTER TUTOR UPSERT
============================================================================ */

export async function upsertMasterTutor(data) {

  try {

    const uid =
      await callOdoo(
        "common",
        "authenticate",
        [
          _DB,
          _USERNAME,
          _PASSWORD,
          {},
        ]
      );


    if (!uid) {

      throw new Error(
        "Odoo login failed"
      );
    }


    let photoBase64 =
      false;


    if (
      data.photo &&
      data.photo.startsWith("http")
    ) {

      try {

        const response =
          await fetch(data.photo);


        const arrayBuffer =
          await response.arrayBuffer();


        photoBase64 =
          Buffer
            .from(arrayBuffer)
            .toString("base64");


      } catch (err) {

        console.error(
          "[Odoo] Failed to convert tutor photo:",
          err.message
        );
      }
    }


    let genderMapped = "";


    if (data.gender) {

      const g =
        data.gender
          .trim()
          .toLowerCase();


      if (g === "male") {

        genderMapped =
          "Male";

      } else if (
        g === "female"
      ) {

        genderMapped =
          "Female";

      } else if (
        g === "other" ||
        g === "both"
      ) {

        genderMapped =
          "Other";
      }
    }


    let dobFormatted =
      false;


    if (data.dob) {

      try {

        const d =
          new Date(data.dob);


        if (
          !Number.isNaN(
            d.getTime()
          )
        ) {

          dobFormatted =
            d
              .toISOString()
              .split("T")[0];
        }


      } catch (e) {

        console.error(
          "[Odoo] Failed parsing DOB:",
          data.dob
        );
      }
    }


    const payload = {

      x_name:
        data.name || "",

      x_gender:
        genderMapped || "Male",

      x_mobile:
        data.phone || "",

      x_whatsapp:
        data.whatsapp ||
        data.phone ||
        "",

      x_email:
        data.email || "",

      x_city:
        data.city || "",

      x_area:
        data.area || "",

      x_full_address:
        data.fullAddress || "",

      x_pincode:
        data.pincode || "",


      x_grades:
        Array.isArray(data.grades)
          ? data.grades.join(", ")
          : data.grades || "",


      x_boards:
        Array.isArray(data.boards)
          ? data.boards.join(", ")
          : data.boards || "",


      x_subjects:
        Array.isArray(data.subjects)
          ? data.subjects.join(", ")
          : data.subjects || "",


      x_preferred_timings:
        Array.isArray(data.timings)
          ? data.timings.join(", ")
          : data.timings || "",


      x_max_travel_distance:
        data.maxTravelDistance || "",

      x_experience:
        data.experience || "",

      x_qualification:
        data.qualification || "",

      x_availability:
        data.availabilityStatus ||
        "Available",


      x_locations_can_teach:
        Array.isArray(data.locations)
          ? data.locations.join(", ")
          : data.locations || "",

    };


    if (photoBase64) {

      payload.x_profile_photo =
        photoBase64;
    }


    if (dobFormatted) {

      payload.x_dob =
        dobFormatted;
    }


    console.log(
      "[Odoo] Searching existing tutor:",
      data.phone
    );


    const existing =
      await callOdoo(
        "object",
        "execute_kw",
        [
          _DB,
          uid,
          _PASSWORD,

          "x_master_tutors",

          "search_read",

          [
            [
              [
                "x_mobile",
                "=",
                data.phone,
              ],
            ],
          ],

          {
            fields: [
              "id",
              "x_tutor_id",
            ],
          },
        ]
      );


    if (
      existing &&
      existing.length > 0
    ) {

      const recordId =
        existing[0].id;


      const tutorCode =
        existing[0].x_tutor_id;


      console.log(
        "[Odoo] Updating tutor:",
        recordId,
        tutorCode
      );


      await callOdoo(
        "object",
        "execute_kw",
        [
          _DB,
          uid,
          _PASSWORD,

          "x_master_tutors",

          "write",

          [
            [recordId],
            payload,
          ],
        ]
      );


      return {

        id:
          recordId,

        tutorCode,

      };


    } else {

      console.log(
        "[Odoo] Creating new tutor"
      );


      const count =
        await callOdoo(
          "object",
          "execute_kw",
          [
            _DB,
            uid,
            _PASSWORD,

            "x_master_tutors",

            "search_count",

            [[]],
          ]
        );


      const tutorCode =
        `TUT${String(
          count + 1
        ).padStart(
          4,
          "0"
        )}`;


      payload.x_tutor_id =
        tutorCode;


      const recordId =
        await callOdoo(
          "object",
          "execute_kw",
          [
            _DB,
            uid,
            _PASSWORD,

            "x_master_tutors",

            "create",

            [payload],
          ]
        );


      console.log(
        "[Odoo] Tutor created:",
        tutorCode
      );


      return {

        id:
          recordId,

        tutorCode,

      };
    }


  } catch (err) {

    console.error(
      "[Odoo] upsertMasterTutor error:",
      err
    );

    throw err;
  }
}


/* ============================================================================
   TUTOR PERFORMANCE STATS
============================================================================ */

export async function syncTutorStats(
  odooRecordId,
  stats
) {

  try {

    const uid =
      await callOdoo(
        "common",
        "authenticate",
        [
          _DB,
          _USERNAME,
          _PASSWORD,
          {},
        ]
      );


    if (!uid) {

      throw new Error(
        "Odoo login failed"
      );
    }


    const payload = {};


    if (
      stats.assignmentsCompleted != null
    ) {

      payload.x_assignments_completed =
        stats.assignmentsCompleted;
    }


    if (
      stats.assignmentsActive != null
    ) {

      payload.x_assignments_active =
        stats.assignmentsActive;
    }


    if (
      stats.demoTaken != null
    ) {

      payload.x_demo_taken =
        stats.demoTaken;
    }


    if (
      stats.demoCancelled != null
    ) {

      payload.x_demo_cancelled =
        stats.demoCancelled;
    }


    if (
      stats.successfulEnrollments != null
    ) {

      payload.x_successful_enrollments =
        stats.successfulEnrollments;
    }


    if (
      stats.successRate != null
    ) {

      payload.x_success_rate =
        stats.successRate;
    }


    if (
      stats.averageRating != null
    ) {

      payload.x_average_rating =
        stats.averageRating;
    }


    await callOdoo(
      "object",
      "execute_kw",
      [
        _DB,
        uid,
        _PASSWORD,

        "x_master_tutors",

        "write",

        [
          [
            parseInt(
              odooRecordId
            ),
          ],

          payload,
        ],
      ]
    );


    console.log(
      "[Odoo] Tutor stats synced:",
      odooRecordId
    );


    return true;


  } catch (err) {

    console.error(
      "[Odoo] syncTutorStats:",
      err.message
    );

    return false;
  }
}


/* ============================================================================
   TUTOR ASSIGNMENT → CRM LEAD
============================================================================ */

export async function updateLeadAssignment(
  leadId,
  assignmentDetails
) {

  try {

    const uid =
      await callOdoo(
        "common",
        "authenticate",
        [
          _DB,
          _USERNAME,
          _PASSWORD,
          {},
        ]
      );


    if (!uid) {

      throw new Error(
        "Odoo login failed"
      );
    }


    const payload = {};


    if (
      assignmentDetails.tutorName
    ) {

      payload.x_studio_assigned_tutor =
        assignmentDetails.tutorName;
    }


    if (
      assignmentDetails.tutorCode
    ) {

      payload.x_studio_tutor_code =
        assignmentDetails.tutorCode;
    }


    if (
      assignmentDetails.tutorPhone
    ) {

      payload.x_studio_assigned_tutor_phone =
        assignmentDetails.tutorPhone;
    }


    if (
      assignmentDetails.demoDate
    ) {

      payload.x_studio_demo_date =
        assignmentDetails.demoDate;
    }


    if (
      assignmentDetails.demoTime
    ) {

      payload.x_studio_demo_time =
        assignmentDetails.demoTime;
    }


    payload.x_studio_lead_status =
      "Demo Scheduled";


    await callOdoo(
      "object",
      "execute_kw",
      [
        _DB,
        uid,
        _PASSWORD,

        "crm.lead",

        "write",

        [
          [
            parseInt(
              leadId
            ),
          ],

          payload,
        ],
      ]
    );


    console.log(
      "[Odoo] Lead assignment synced:",
      leadId
    );


    return true;


  } catch (err) {

    console.error(
      "[Odoo] updateLeadAssignment:",
      err.message
    );

    return false;
  }
}


/* ============================================================================
   ODOO CHATTER
============================================================================ */

export async function addOdooChatterMessage(
  leadId,
  message,
  messageType = "comment"
) {

  try {

    const uid =
      await callOdoo(
        "common",
        "authenticate",
        [
          _DB,
          _USERNAME,
          _PASSWORD,
          {},
        ]
      );


    if (!uid) {

      throw new Error(
        "Odoo login failed"
      );
    }


    await callOdoo(
      "object",
      "execute_kw",
      [
        _DB,
        uid,
        _PASSWORD,

        "crm.lead",

        "message_post",

        [
          [
            parseInt(
              leadId
            ),
          ],
        ],

        {
          body:
            message,

          message_type:
            messageType,

          subtype_xmlid:
            "mail.mt_note",
        },
      ]
    );


    console.log(
      `[Odoo] Chatter posted to lead ${leadId}`
    );


    return true;


  } catch (err) {

    console.error(
      "[Odoo] Chatter error:",
      err.message
    );

    return false;
  }
}


/* ============================================================================
   LOOK UP MASTER TUTOR IDS
============================================================================ */

export async function lookupOdooMasterTutorIds(
  tutors
) {

  const odooIds = [];

  const odooModel =
    "x_master_tutors";


  if (
    !Array.isArray(tutors) ||
    tutors.length === 0
  ) {

    return {
      odooIds,
      odooModel,
    };
  }


  try {

    const uid =
      await callOdoo(
        "common",
        "authenticate",
        [
          _DB,
          _USERNAME,
          _PASSWORD,
          {},
        ]
      );


    if (!uid) {

      console.warn(
        "[OdooService] Tutor lookup authentication failed"
      );

      return {
        odooIds,
        odooModel,
      };
    }


    const normPhone = (
      raw
    ) => {

      const digits =
        String(raw || "")
          .replace(/\D/g, "");


      return digits.length >= 10
        ? digits.slice(-10)
        : digits;
    };


    const codes =
      [
        ...new Set(

          tutors
            .map(
              (t) =>
                (
                  t.tutorCode ||
                  ""
                ).trim()
            )
            .filter(Boolean)

        ),
      ];


    const phones =
      [
        ...new Set(

          tutors
            .flatMap(
              (t) => [
                t.phone,
                t.whatsapp,
              ]
            )
            .filter(Boolean)
            .map(normPhone)
            .filter(
              (p) =>
                p.length >= 6
            )

        ),
      ];


    if (
      codes.length > 0
    ) {

      const byCode =
        await callOdoo(
          "object",
          "execute_kw",
          [
            _DB,
            uid,
            _PASSWORD,

            "x_master_tutors",

            "search_read",

            [
              [
                [
                  "x_tutor_id",
                  "in",
                  codes,
                ],
              ],
            ],

            {
              fields: ["id"],
              limit: 200,
            },
          ]
        );


      byCode.forEach(
        (r) => {

          odooIds.push(
            r.id
          );
        }
      );
    }


    if (
      phones.length > 0
    ) {

      const leaves = [];


      phones.forEach(
        (p) => {

          leaves.push(
            [
              "x_mobile",
              "like",
              p,
            ]
          );

          leaves.push(
            [
              "x_whatsapp",
              "like",
              p,
            ]
          );
        }
      );


      const phoneDomain = [];


      for (
        let i = 0;
        i < leaves.length - 1;
        i++
      ) {

        phoneDomain.push("|");
      }


      leaves.forEach(
        (leaf) =>
          phoneDomain.push(
            leaf
          )
      );


      const byPhone =
        await callOdoo(
          "object",
          "execute_kw",
          [
            _DB,
            uid,
            _PASSWORD,

            "x_master_tutors",

            "search_read",

            [phoneDomain],

            {
              fields: ["id"],
              limit: 200,
            },
          ]
        );


      byPhone.forEach(
        (r) => {

          if (
            !odooIds.includes(
              r.id
            )
          ) {

            odooIds.push(
              r.id
            );
          }
        }
      );
    }


    console.log(
      `[OdooService] Tutor lookup: ` +
      `codes=${codes.length}, ` +
      `phones=${phones.length}, ` +
      `matched=${odooIds.length}`
    );


  } catch (err) {

    console.error(
      "[OdooService] Tutor lookup error:",
      err.message
    );
  }


  return {
    odooIds,
    odooModel,
  };
}


/* ============================================================================
   RECOMMENDED TUTORS → CRM
============================================================================ */

export async function updateLeadRecommendedTutors(
  odooLeadId,
  odooIds = []
) {

  if (!odooLeadId) {
    return;
  }


  try {

    const uid =
      await callOdoo(
        "common",
        "authenticate",
        [
          _DB,
          _USERNAME,
          _PASSWORD,
          {},
        ]
      );


    if (!uid) {

      console.warn(
        "[OdooService] Recommended tutor update auth failed"
      );

      return;
    }


    const cleanLeadId =
      Number(
        odooLeadId
      );


    const cleanIds =
      (odooIds || [])
        .map(Number)
        .filter(
          (id) =>
            !Number.isNaN(id)
        );


    await callOdoo(
      "object",
      "execute_kw",
      [
        _DB,
        uid,
        _PASSWORD,

        "crm.lead",

        "write",

        [
          [
            cleanLeadId,
          ],

          {
            x_recommended_tutor_ids: [
              [
                6,
                0,
                cleanIds,
              ],
            ],
          },
        ],
      ]
    );


    console.log(
      `[OdooService] ✅ Lead ${cleanLeadId} recommended tutors updated: ${cleanIds.length}`
    );


  } catch (err) {

    console.error(
      `[OdooService] Recommended tutors update failed for ${odooLeadId}:`,
      err.message
    );
  }
}


/* ============================================================================
   FIND / LINK MONGODB PARENT ENQUIRY TO ODOO CRM LEAD
============================================================================ */

export async function findOrLinkOdooLead(
  lead
) {

  if (!lead) {
    return null;
  }


  if (
    lead.odooLeadId &&
    !Number.isNaN(
      Number(
        lead.odooLeadId
      )
    )
  ) {

    return Number(
      lead.odooLeadId
    );
  }


  try {

    const uid =
      await callOdoo(
        "common",
        "authenticate",
        [
          _DB,
          _USERNAME,
          _PASSWORD,
          {},
        ]
      );


    if (!uid) {
      return null;
    }


    /* ------------------------------------------------------------------------
       PASS 1: REQUIREMENT ID
    ------------------------------------------------------------------------ */

    if (
      lead.requirementId &&
      lead.requirementId.trim()
    ) {

      const byReq =
        await callOdoo(
          "object",
          "execute_kw",
          [
            _DB,
            uid,
            _PASSWORD,

            "crm.lead",

            "search_read",

            [
              [
                [
                  "x_studio_requirement_id",
                  "=",
                  lead.requirementId.trim(),
                ],
              ],
            ],

            {
              fields: ["id"],
              limit: 1,
            },
          ]
        );


      if (
        byReq &&
        byReq.length > 0
      ) {

        const foundId =
          byReq[0].id;


        lead.odooLeadId =
          foundId;


        await lead
          .save({
            validateBeforeSave: false,
          })
          .catch(
            () => {}
          );


        console.log(
          `[OdooService] Linked Mongo lead ${lead._id} → Odoo #${foundId} using requirement ID`
        );


        return foundId;
      }
    }


    /* ------------------------------------------------------------------------
       PASS 2: PHONE
    ------------------------------------------------------------------------ */

    if (lead.phone) {

      const digits =
        String(
          lead.phone
        )
          .replace(/\D/g, "")
          .slice(-10);


      if (
        digits.length >= 8
      ) {

        const byPhone =
          await callOdoo(
            "object",
            "execute_kw",
            [
              _DB,
              uid,
              _PASSWORD,

              "crm.lead",

              "search_read",

              [
                [
                  [
                    "phone",
                    "like",
                    digits,
                  ],
                ],
              ],

              {
                fields: ["id"],
                limit: 1,
              },
            ]
          );


        if (
          byPhone &&
          byPhone.length > 0
        ) {

          const foundId =
            byPhone[0].id;


          lead.odooLeadId =
            foundId;


          await lead
            .save({
              validateBeforeSave: false,
            })
            .catch(
              () => {}
            );


          console.log(
            `[OdooService] Linked Mongo lead ${lead._id} → Odoo #${foundId} using phone`
          );


          return foundId;
        }
      }
    }


  } catch (err) {

    console.error(
      "[OdooService] findOrLinkOdooLead:",
      err.message
    );
  }


  return null;
}


/* ============================================================================
   NEW ATTENDANCE SYNCHRONIZATION
============================================================================ */

/**
 * IMPORTANT:
 *
 * This replaces the old direct x_attendance_log create/write logic.
 *
 * Attendance is now sent through:
 *
 * /tuition/api/v1/attendance
 *
 * Odoo handles attendance calculations and tuition/payment automation.
 */
export async function syncAttendanceLogToOdoo({

  log,
  lead,
  tutor,

  // Kept for backward compatibility.
  // Chatter is intentionally no longer required for the attendance engine.
  postChatter = true,

}) {

  try {

    if (!log) {

      throw new Error(
        "Attendance log is required"
      );
    }


    /* ------------------------------------------------------------------------
       STUDENT ID
    ------------------------------------------------------------------------ */

    const websiteStudentId =
      resolveWebsiteStudentId(
        log,
        lead
      );


    if (!websiteStudentId) {

      throw new Error(
        "No website_student_id found. " +
        "Add a permanent student ID to the Ward/Student record before syncing attendance."
      );
    }


    /* ------------------------------------------------------------------------
       EXTERNAL ATTENDANCE ID
    ------------------------------------------------------------------------ */

    const externalAttendanceId =
      resolveExternalAttendanceId(
        log
      );


    /* ------------------------------------------------------------------------
       STATUS
    ------------------------------------------------------------------------ */

    const status =
      mapAttendanceStatus(
        log.status
      );


    /* ------------------------------------------------------------------------
       DATETIME
    ------------------------------------------------------------------------ */

    let classDatetime =

      log.classDatetime ||

      log.classDateTime ||

      log.datetime ||

      null;


    /*
     * If your current attendance schema contains only `date`,
     * combine it with available class time.
     */
    if (
      !classDatetime &&
      log.date
    ) {

      const rawDate =
        String(
          log.date
        );


      if (
        /^\d{4}-\d{2}-\d{2}$/.test(
          rawDate
        )
      ) {

        let time =
          log.classTime ||
          log.time ||
          "10:00";


        time =
          String(time);


        if (
          /^\d{2}:\d{2}$/.test(
            time
          )
        ) {

          time =
            `${time}:00`;
        }


        classDatetime =
          `${rawDate}T${time}+05:30`;

      } else {

        classDatetime =
          log.date;
      }
    }


    if (!classDatetime) {

      throw new Error(
        "Attendance record does not contain classDatetime or date"
      );
    }


    /* ------------------------------------------------------------------------
       NOTES
    ------------------------------------------------------------------------ */

    let notes = "";


    if (
      status === "completed"
    ) {

      notes =
        log.topicsCovered ||
        log.notes ||
        "Class completed successfully";

    } else if (
      status === "absent"
    ) {

      notes =

        log.customReason ||

        log.missedReason ||

        log.notes ||

        "Student absent";

    } else if (
      status === "cancelled"
    ) {

      notes =

        log.customReason ||

        log.missedReason ||

        log.notes ||

        "Class cancelled";
    }


    /* ------------------------------------------------------------------------
       TUTOR ID
    ------------------------------------------------------------------------ */

    const tutorExternalId =

      tutor?.tutorCode ||

      tutor?.externalId ||

      tutor?.tutorId ||

      log?.tutorExternalId ||

      "";


    const tutorName =

      tutor?.name ||

      log?.tutorName ||

      "";


    /* ------------------------------------------------------------------------
       SEND TO NEW ODOO API
    ------------------------------------------------------------------------ */

    const result =
      await syncAttendanceToOdooApi({

        websiteStudentId,

        externalAttendanceId,

        tutorExternalId,

        tutorName,

        classDatetime,

        status,

        notes,

      });


    /* ------------------------------------------------------------------------
       UPDATE MONGODB SYNC STATE
    ------------------------------------------------------------------------ */

    if (result.success) {

      log.externalAttendanceId =
        externalAttendanceId;

      log.websiteStudentId =
        websiteStudentId;

      log.odooSyncStatus =
        "synced";

      log.odooSyncedAt =
        new Date();


      // Only assign if the schema supports it.
      if (
        Object.prototype.hasOwnProperty.call(
          log,
          "odooSyncError"
        ) ||
        log.schema?.path?.(
          "odooSyncError"
        )
      ) {

        log.odooSyncError =
          "";
      }


      await log
        .save({
          validateBeforeSave: false,
        })
        .catch(
          (saveErr) => {

            console.error(
              "[Odoo Attendance] Mongo sync metadata save failed:",
              saveErr.message
            );
          }
        );


      console.log(
        `[Odoo Attendance] ✅ Mongo attendance ${externalAttendanceId} synchronized`
      );


      return {

        success: true,

        externalAttendanceId,

        websiteStudentId,

        data:
          result.data,

      };
    }


    log.odooSyncStatus =
      "failed";


    if (
      Object.prototype.hasOwnProperty.call(
        log,
        "odooSyncError"
      ) ||
      log.schema?.path?.(
        "odooSyncError"
      )
    ) {

      log.odooSyncError =
        result.error ||
        "Unknown Odoo Attendance API error";
    }


    await log
      .save({
        validateBeforeSave: false,
      })
      .catch(
        () => {}
      );


    return result;


  } catch (err) {

    console.error(
      "[Odoo Attendance Sync] ❌",
      err.message
    );


    if (log) {

      log.odooSyncStatus =
        "failed";


      if (
        Object.prototype.hasOwnProperty.call(
          log,
          "odooSyncError"
        ) ||
        log.schema?.path?.(
          "odooSyncError"
        )
      ) {

        log.odooSyncError =
          err.message;
      }


      await log
        .save({
          validateBeforeSave: false,
        })
        .catch(
          () => {}
        );
    }


    return {

      success: false,

      error:
        err.message,

    };
  }
}


/* ============================================================================
   ATTENDANCE SUMMARY
============================================================================ */

/**
 * The dedicated Odoo attendance API now handles attendance calculations
 * internally.
 *
 * This function is retained so existing backend imports/calls do not break.
 *
 * It can still update CRM display-only attendance summary fields if your
 * dashboard currently depends on them.
 */
export async function syncLeadAttendanceSummaryToOdoo(
  lead,
  activeCycleData
) {

  if (!lead) {
    return false;
  }


  try {

    const odooLeadId =
      await findOrLinkOdooLead(
        lead
      );


    if (!odooLeadId) {

      console.warn(
        `[OdooService] Cannot sync attendance summary: no Odoo lead for ${lead._id}`
      );

      return false;
    }


    const uid =
      await callOdoo(
        "common",
        "authenticate",
        [
          _DB,
          _USERNAME,
          _PASSWORD,
          {},
        ]
      );


    if (!uid) {
      return false;
    }


    const currentCycle =

      activeCycleData?.cycleNumber ||

      lead.currentPackageCycle ||

      1;


    const scheduled =

      activeCycleData?.totalScheduled ||

      lead.totalClasses ||

      12;


    const completed =

      activeCycleData?.completedCount ??

      lead.completedClasses ??

      0;


    const remaining =

      activeCycleData?.remainingCount ??

      Math.max(
        0,
        scheduled - completed
      );


    const status =

      activeCycleData?.status ||

      lead.packageStatus ||

      (
        completed >= scheduled
          ? "Completed"
          : "Active"
      );


    const payload = {

      x_completed_classes:
        completed,

      x_total_classes:
        scheduled,

      x_remaining_classes:
        remaining,

      x_current_cycle:
        currentCycle,

      x_package_status:
        status === "Completed"
          ? `Month ${currentCycle} Completed`
          : "Active",

    };


    if (
      activeCycleData?.logs &&
      activeCycleData.logs.length > 0
    ) {

      const latestLog =
        activeCycleData.logs[
          activeCycleData.logs.length - 1
        ];


      payload.x_last_class_date =
        latestLog.date || "";


      payload.x_last_attendance_status =
        latestLog.status || "";


      payload.x_last_class_topics =
        latestLog.status === "Done"

          ? (
              latestLog.topicsCovered ||
              ""
            )

          : "";


      payload.x_last_missed_reason =
        latestLog.status === "Missed"

          ? (
              latestLog.missedReason ||
              ""
            )

          : "";
    }


    await callOdoo(
      "object",
      "execute_kw",
      [
        _DB,
        uid,
        _PASSWORD,

        "crm.lead",

        "write",

        [
          [
            odooLeadId,
          ],

          payload,
        ],
      ]
    );


    console.log(
      `[OdooService] ✅ Attendance summary synced to CRM lead #${odooLeadId}`
    );


    return true;


  } catch (err) {

    console.error(
      "[OdooService] syncLeadAttendanceSummaryToOdoo:",
      err.message
    );


    return false;
  }
}


/* ============================================================================
   DELETE ATTENDANCE
============================================================================ */

/**
 * IMPORTANT:
 *
 * The new API specification you received only defines POST attendance sync.
 *
 * Therefore we should NOT directly unlink Odoo attendance records anymore,
 * because Odoo now owns the attendance/payment workflow.
 *
 * This function is retained for compatibility so existing imports do not crash.
 */
export async function deleteOdooAttendanceLog(
  odooAttendanceId
) {

  console.warn(
    "[OdooService] deleteOdooAttendanceLog called, " +
    "but direct Odoo attendance deletion is disabled because attendance " +
    "is now controlled through /tuition/api/v1/attendance."
  );


  return false;
}
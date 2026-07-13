/**
 * WhatsApp Service — Saraswati Tutorials
 *
 * Sends WhatsApp messages to tutors via the existing Odoo WhatsApp Business Account.
 * Uses Odoo's JSON-RPC API to dispatch messages.
 *
 * Logic:
 *   - If the tutor has an active WhatsApp conversation within 24 hours → free-form text
 *   - If outside 24-hour window → approved template message
 *   - Retry up to MAX_RETRIES times for temporary failures
 *   - Permanent failures are NOT retried (invalid number, template missing, policy)
 *
 * Environment variables required:
 *   ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD
 *   WHATSAPP_TEMPLATE_NAME  (approved Meta template name, e.g. "tutor_broadcast_v1")
 *   WHATSAPP_TEMPLATE_LANG  (e.g. "en")
 */

import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const ODOO_URL = process.env.ODOO_URL;
const DB = process.env.ODOO_DB;
const USERNAME = process.env.ODOO_USERNAME;
const PASSWORD = process.env.ODOO_PASSWORD;
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "tutor_broadcast_v1";
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "en";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Errors that should NOT be retried
const PERMANENT_FAILURE_PATTERNS = [
  "invalid number",
  "invalid phone",
  "number does not exist",
  "template missing",
  "template not found",
  "template not approved",
  "policy rejection",
  "policy_enforcement",
  "meta policy",
  "body missing",
  "message body missing",
  "authentication failed",
  "access denied",
  "permission denied",
  "account disabled",
  "number blocked",
];

/**
 * Determine if an error message indicates a permanent (non-retryable) failure
 */
export function isPermanentFailure(errorMessage) {
  if (!errorMessage) return false;
  const msg = String(errorMessage).toLowerCase();
  return PERMANENT_FAILURE_PATTERNS.some(pattern => msg.includes(pattern));
}

/**
 * Classify a failure reason into a human-readable label
 */
export function classifyFailureReason(errorMessage) {
  if (!errorMessage) return "Unknown Error";
  const msg = String(errorMessage).toLowerCase();
  
  if (msg.includes("invalid number") || msg.includes("invalid phone") || msg.includes("number does not exist")) {
    return "Invalid Number";
  }
  if (msg.includes("template missing") || msg.includes("template not found") || msg.includes("template not approved")) {
    return "Template Missing";
  }
  if (msg.includes("policy") || msg.includes("enforcement")) {
    return "Meta Policy Rejection";
  }
  if (msg.includes("body missing") || msg.includes("message body")) {
    return "Message Body Missing";
  }
  if (msg.includes("authentication") || msg.includes("access denied") || msg.includes("permission denied")) {
    return "Authentication Failed";
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Rate Limited";
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return "Timeout";
  }
  if (msg.includes("network") || msg.includes("connection") || msg.includes("econnrefused")) {
    return "Network Error";
  }
  if (msg.includes("500") || msg.includes("server error") || msg.includes("internal error")) {
    return "Server Error";
  }
  if (msg.includes("blocked")) {
    return "Number Blocked";
  }
  return "Unknown Error";
}

/**
 * Authenticate with Odoo and return the UID
 */
async function getOdooUid() {
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
      id: Math.floor(Math.random() * 10000),
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error?.data?.message || data.error?.message || "Odoo auth failed");
  if (!data.result) throw new Error("Odoo authentication failed — check credentials");
  return data.result;
}

/**
 * Execute an Odoo model method via JSON-RPC
 */
async function callOdooMethod(uid, model, method, args, kwargs = {}) {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [DB, uid, PASSWORD, model, method, args, kwargs],
      },
      id: Math.floor(Math.random() * 10000),
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error?.data?.message || data.error?.message || "Odoo error");
  return data.result;
}

/**
 * Check if a tutor's WhatsApp number has an active conversation within 24 hours.
 * Returns the discuss channel ID if found, null otherwise.
 */
async function findActiveConversation(uid, phoneNumber) {
  try {
    const cleanPhone = String(phoneNumber || "").replace(/\D/g, "").slice(-10);
    if (!cleanPhone) return null;

    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Search for WhatsApp discuss channels linked to this phone number
    const channels = await callOdooMethod(
      uid,
      "discuss.channel",
      "search_read",
      [[
        ["channel_type", "=", "whatsapp"],
        ["write_date", ">=", cutoffDate],
        "|",
        ["whatsapp_number", "like", cleanPhone],
        ["name", "like", cleanPhone],
      ]],
      { fields: ["id", "name", "whatsapp_number", "write_date"], limit: 1 }
    );

    if (channels && channels.length > 0) {
      return channels[0].id;
    }
    return null;
  } catch (err) {
    console.warn("[WhatsApp] Could not check active conversation:", err.message);
    return null;
  }
}

/**
 * Send a free-form WhatsApp message via an existing Odoo conversation channel.
 * Only valid within the 24-hour service window.
 */
async function sendFreeformMessage(uid, channelId, messageBody) {
  const result = await callOdooMethod(
    uid,
    "discuss.channel",
    "message_post",
    [[channelId]],
    {
      body: messageBody,
      message_type: "whatsapp_message",
    }
  );
  return result;
}

/**
 * Send a WhatsApp template message via Odoo.
 * Used when outside the 24-hour service window.
 */
async function sendTemplateMessage(uid, phoneNumber, templateName, templateLang, templateVars) {
  // Look up the approved WhatsApp template in Odoo
  const templates = await callOdooMethod(
    uid,
    "whatsapp.template",
    "search_read",
    [[["name", "=", templateName], ["status", "=", "approved"]]],
    { fields: ["id", "name", "body"], limit: 1 }
  );

  if (!templates || templates.length === 0) {
    throw new Error(`template missing: WhatsApp template "${templateName}" not found or not approved in Odoo`);
  }

  const templateId = templates[0].id;

  // Create and send a WhatsApp message using the template
  const msgId = await callOdooMethod(
    uid,
    "whatsapp.message",
    "create",
    [{
      mobile_number: phoneNumber,
      wa_template_id: templateId,
      free_text_json: templateVars || {},
    }]
  );

  // Trigger the send action
  await callOdooMethod(uid, "whatsapp.message", "button_send_message", [[msgId]]);

  return msgId;
}

/**
 * Send a direct outbound free-form WhatsApp message using Odoo outbox.
 * Fallback when approved templates are not configured in Odoo.
 */
async function sendDirectOutboundMessage(uid, phoneNumber, messageBody) {
  const payload = {
    mobile_number: phoneNumber,
    body: messageBody,
    message_type: "outbound",
    state: "outgoing",
    wa_account_id: 2, // Saraswati Tutorials Account ID
  };

  console.log(`[WhatsApp] Creating direct outbound message for ${phoneNumber}`);
  const recordId = await callOdooMethod(
    uid,
    "whatsapp.message",
    "create",
    [payload]
  );
  
  try {
    await callOdooMethod(uid, "whatsapp.message", "button_send_message", [[recordId]]);
  } catch (btnErr) {
    console.log(`[WhatsApp] Info: button_send_message not triggered (Odoo will process outgoing via cron):`, btnErr.message);
  }

  return recordId;
}

/**
 * Main function: Send a WhatsApp message to a tutor.
 *
 * @param {Object} options
 * @param {string} options.phoneNumber - Tutor's WhatsApp number
 * @param {string} options.messageBody - The full message text to send
 * @param {Object} [options.templateVars] - Key-value pairs for template variables (if template used)
 * @param {boolean} [options.forceTemplate] - Force template even if within 24h window
 *
 * @returns {Promise<{
 *   success: boolean,
 *   messageId: string|null,
 *   usedTemplate: boolean,
 *   channelId: number|null,
 *   failureReason: string,
 *   retryCount: number,
 * }>}
 */
export async function sendWhatsAppToTutor(options) {
  const {
    phoneNumber,
    messageBody,
    templateVars = {},
    forceTemplate = false,
    templateName = TEMPLATE_NAME,
    templateLang = TEMPLATE_LANG,
  } = options;

  let lastError = null;
  let retryCount = 0;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      retryCount = attempt;
      console.log(`[WhatsApp] Retry attempt ${attempt}/${MAX_RETRIES} for ${phoneNumber}`);
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt));
    }

    try {
      const uid = await getOdooUid();

      // Check if within 24-hour active conversation window
      let channelId = null;
      let usedTemplate = false;
      let messageId = null;

      if (!forceTemplate) {
        channelId = await findActiveConversation(uid, phoneNumber);
      }

      if (channelId && !forceTemplate) {
        // Within 24h window — send free-form message
        console.log(`[WhatsApp] Sending free-form message to channel ${channelId} for ${phoneNumber}`);
        messageId = await sendFreeformMessage(uid, channelId, messageBody);
        usedTemplate = false;
      } else {
        // Outside 24h window — use approved template (or fallback to direct outbound)
        try {
          console.log(`[WhatsApp] Sending template "${templateName}" to ${phoneNumber}`);
          messageId = await sendTemplateMessage(uid, phoneNumber, templateName, templateLang, templateVars);
          usedTemplate = true;
        } catch (templateErr) {
          if (templateErr.message.includes("template missing")) {
            console.warn(`[WhatsApp] Template "${templateName}" is missing in Odoo. Falling back to direct outbound message...`);
            messageId = await sendDirectOutboundMessage(uid, phoneNumber, messageBody);
            usedTemplate = false;
          } else {
            throw templateErr;
          }
        }
      }

      console.log(`[WhatsApp] Message sent successfully to ${phoneNumber}. Message ID: ${messageId}`);
      return {
        success: true,
        messageId: String(messageId),
        usedTemplate,
        channelId,
        failureReason: "",
        retryCount,
      };

    } catch (err) {
      lastError = err;
      const reason = classifyFailureReason(err.message);
      console.error(`[WhatsApp] Attempt ${attempt + 1} failed for ${phoneNumber}: ${reason} — ${err.message}`);

      // Do not retry permanent failures
      if (isPermanentFailure(err.message)) {
        console.warn(`[WhatsApp] Permanent failure detected. Not retrying.`);
        break;
      }
    }
  }

  // All attempts exhausted
  const failureReason = classifyFailureReason(lastError?.message || "");
  console.error(`[WhatsApp] All attempts failed for ${phoneNumber}. Reason: ${failureReason}`);
  return {
    success: false,
    messageId: null,
    usedTemplate: false,
    channelId: null,
    failureReason,
    retryCount,
  };
}

/**
 * Build a privacy-safe broadcast message for a tutor.
 *
 * NEVER includes: Parent Name, Phone, Email, Exact Address, Map Link
 * ALWAYS includes: Grade, Board, Subjects, Mode, Timing, Area, City, Pincode, Budget, Req ID
 */
export function buildBroadcastMessage(tutorName, lead, ward, distanceTier) {
  const grade = ward?.classGrade ? `Class ${ward.classGrade}` : "N/A";
  const board = ward?.curriculum || "N/A";
  const subjects = Array.isArray(ward?.subjectsNeeded)
    ? ward.subjectsNeeded.join(", ")
    : (ward?.subjectsNeeded || "N/A");
  const mode = lead.preferredMode || "N/A";
  const timing = lead.preferredTime || "N/A";
  const area = lead.area || "N/A";
  const city = lead.city || lead.geoInfo?.city || "N/A";
  const distance = distanceTier && distanceTier !== "Unknown" ? distanceTier : "N/A";
  const budget = lead.monthlyFees ? `₹${lead.monthlyFees}/month` : "Negotiable";
  const reqId = lead.requirementId || "N/A";

  return `Hello *${tutorName}* 👋

A new tuition requirement is available matching your profile:

• Teacher Name: *${tutorName}*
• Requirement ID: *${reqId}*
• Board: *${board}*
• Grade: *${grade}*
• Subjects: *${subjects}*
• Tuition Type: *${mode}*
• Preferred Timing: *${timing}*
• Area: *${area}*
• City: *${city}*
• Approximate Distance: *${distance}*
• Expected Monthly Fee: *${budget}*

If you are interested in this tuition, please reply INTERESTED.

If you are not available, please reply NOT INTERESTED.

Parent contact details will be shared only after admin approval and tutor assignment.`;
}

/**
 * Build a fixed onboarding message for new tutors.
 * This is a one-time authorization/onboarding message matching Odoo Template ID 72.
 */
export function buildOnboardingMessage(tutorName) {
  return `Thank you for showing interest in a Saraswati Tutorials assignment.

To maintain verified and professional tutor allocation, all demo/class requests are processed through our *One-Time Tutor Authorisation System.*

✅ After authorisation, you will receive:
• Parent contact details;
• Exact Parent’s location (Society,Wing&Flat No.);
• Demo timings updates
For present & future interested opportunities from Us.

_____

Our verification team will review and proceed accordingly.`;
}

/**
 * Build a parent-details message sent to tutor after assignment.
 * Contains the full parent contact info — only sent post-assignment.
 */
export function buildAssignmentMessage(tutorName, lead, ward, demoDate, demoTime) {
  const grade = ward?.classGrade ? `Class ${ward.classGrade}` : "N/A";
  const board = ward?.curriculum || "N/A";
  const subjects = Array.isArray(ward?.subjectsNeeded)
    ? ward.subjectsNeeded.join(", ")
    : (ward?.subjectsNeeded || "N/A");
  const reqId = lead.requirementId || "N/A";
  const studentName = ward?.studentName || "N/A";
  const parentName = lead.parentName || "N/A";
  const parentPhone = lead.phone || "N/A";
  const fullAddress = lead.address || "N/A";
  const area = lead.area || "";
  const city = lead.city || lead.geoInfo?.city || "";
  const pincode = lead.pincode || "";
  const demoInfo = demoDate
    ? `\n📅 *Demo Date:* ${demoDate}${demoTime ? ` at ${demoTime}` : ""}`
    : "";

  let locationStr = [fullAddress, area, city, pincode].filter(Boolean).join(", ");

  return `🎉 *Congratulations ${tutorName}!*

You have been assigned a new student. Here are the complete parent details:

*📋 Requirement ID:* ${reqId}

*Student Details:*
• Student Name: ${studentName}
• Grade: ${grade}
• Board: ${board}
• Subjects: ${subjects}

*Parent Details:*
• Name: ${parentName}
• Phone: ${parentPhone}
• Address: ${locationStr}${demoInfo}

Please contact the parent at the earliest to schedule the demo class.

_Please maintain professionalism at all times._

— Saraswati Tutorials`;
}

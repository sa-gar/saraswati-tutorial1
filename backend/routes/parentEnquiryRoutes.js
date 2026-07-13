import express from "express";
import ParentEnquiry from "../models/ParentEnquiry.js";
import ParentEnquiryDraft from "../models/ParentEnquiryDraft.js";
import AnalyticsLog from "../models/AnalyticsLog.js";
import { createLead, updateLead, sendOdooWhatsApp, fetchOdooWhatsAppReplies } from "../utils/odooService.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { resolveGeo } from "../utils/geoLookup.js";
import Tutor from "../models/Tutor.js";
import BroadcastLog from "../models/BroadcastLog.js";
import { buildCentralizedQuery, calculateTutorScore, parseAddress } from "../utils/matchingEngine.js";
import fs from "fs";
import path from "path";

const router = express.Router();

/**
 * GET all parent enquiries
 * Final API:
 * GET /api/parent-enquiries
 */
router.get("/", verifyToken(["admin"]), async (req, res) => {
  try {
    const data = await ParentEnquiry.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    console.error("Parent enquiry fetch error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET all parent enquiry drafts (incomplete leads)
 * GET /api/parent-enquiries/drafts
 */
router.get("/drafts", verifyToken(["admin"]), async (req, res) => {
  try {
    const drafts = await ParentEnquiryDraft.find().sort({ updatedAt: -1 });
    res.json(drafts);
  } catch (error) {
    console.error("Draft enquiry fetch error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * AUTO-SAVE parent enquiry draft
 * POST /api/parent-enquiries/draft
 */
router.post("/draft", async (req, res) => {
  try {
    const {
      emailOrPhone,
      stepReached,
      formData,
      geoInfo,
      ipAddress,
      visitor_id,
      session_id,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term
    } = req.body;
    if (!emailOrPhone) {
      return res.status(400).json({ message: "emailOrPhone is required" });
    }

    // Resolve client IP
    let clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    if (clientIp) {
      if (clientIp.includes(",")) {
        clientIp = clientIp.split(",")[0].trim();
      }
      if (clientIp.startsWith("::ffff:")) {
        clientIp = clientIp.substring(7);
      }
    }

    let finalIp = ipAddress || clientIp;
    let finalGeo = geoInfo || {};

    if (!finalGeo.city || finalGeo.city === "Unknown City") {
      const resolved = await resolveGeo(finalIp);
      if (resolved.city !== "Unknown City") {
        finalGeo = {
          city: resolved.city,
          region: resolved.region,
          postal: resolved.postal,
          country: resolved.country,
          ip: resolved.ip,
          org: resolved.org
        };
      }
    }

    const draft = await ParentEnquiryDraft.findOneAndUpdate(
      { emailOrPhone: emailOrPhone.trim() },
      {
        stepReached,
        formData,
        geoInfo: finalGeo,
        ipAddress: finalIp,
        visitor_id,
        session_id,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term
      },
      { new: true, upsert: true }
    );

    res.status(200).json(draft);
  } catch (error) {
    console.error("Draft enquiry save error:", error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * DELETE parent enquiry draft
 * DELETE /api/parent-enquiries/drafts/:id
 */
router.delete("/drafts/:id", verifyToken(["admin"]), async (req, res) => {
  try {
    const draft = await ParentEnquiryDraft.findByIdAndDelete(req.params.id);
    if (!draft) {
      return res.status(404).json({ message: "Draft not found" });
    }
    res.json({ message: "Draft deleted successfully" });
  } catch (error) {
    console.error("Draft enquiry delete error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * CREATE parent enquiry
 * Final API:
 * POST /api/parent-enquiries
 */
router.post("/", async (req, res) => {
  try {
    // Resolve client IP
    let clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    if (clientIp) {
      if (clientIp.includes(",")) {
        clientIp = clientIp.split(",")[0].trim();
      }
      if (clientIp.startsWith("::ffff:")) {
        clientIp = clientIp.substring(7);
      }
    }

    let finalIp = req.body.ipAddress || clientIp;
    let finalGeo = req.body.geoInfo || {};

    if (!finalGeo.city || finalGeo.city === "Unknown City") {
      const resolved = await resolveGeo(finalIp);
      if (resolved.city !== "Unknown City") {
        finalGeo = {
          city: resolved.city,
          region: resolved.region,
          postal: resolved.postal,
          country: resolved.country,
          ip: resolved.ip,
          org: resolved.org
        };
      }
    }

    req.body.geoInfo = finalGeo;
    req.body.ipAddress = finalIp;

    // Log backend validation success event
    try {
      const logData = {
        visitor_id: req.body.visitor_id || "unknown",
        session_id: req.body.session_id || "unknown",
        city: finalGeo.city || "Unknown City",
        region: finalGeo.region || "Unknown State",
        country: finalGeo.country || "Unknown Country",
        source: req.body.utm_source || "Direct",
        page_visited: "/parent-enquiry",
        device: req.body.device || "Desktop",
        browser: req.body.browser || "Unknown Browser",
        os: req.body.os || "Unknown OS",
        ipAddress: finalIp,
        action: "backend_validation_success"
      };
      await new AnalyticsLog(logData).save();
    } catch (logErr) {
      console.error("Failed to log backend validation success:", logErr.message);
    }

    let odooRes = null;

    try {
      odooRes = await createLead({
        ...req.body,
        userType: "parent",
      });
    } catch (err) {
      console.error("Odoo create parent lead error:", err.message);
    }

    let requirementId = odooRes && typeof odooRes === "object" ? odooRes.requirementId : "";
    if (!requirementId) {
      try {
        const count = await ParentEnquiry.countDocuments({});
        requirementId = `REQ-${String(count + 1).padStart(5, "0")}`;
        console.log("[Fallback] Generated sequential Requirement ID:", requirementId);
      } catch (seqErr) {
        console.error("[Fallback] Failed to generate Requirement ID:", seqErr.message);
        requirementId = `REQ-${String(Date.now()).slice(-5)}`;
      }
    }

    const enquiry = new ParentEnquiry({
      ...req.body,
      status: req.body.status || "New Lead",
      odooLeadId: odooRes && typeof odooRes === "object" ? odooRes.id : odooRes,
      requirementId: requirementId,
    });

    const saved = await enquiry.save();

    // Trigger automatic broadcast workflow asynchronously
    triggerAutoBroadcast(saved._id).catch(err => {
      console.error("[AutoBroadcast Trigger Error]:", err.message);
    });

    // Log database saved successfully event
    try {
      const logData = {
        visitor_id: req.body.visitor_id || "unknown",
        session_id: req.body.session_id || "unknown",
        city: finalGeo.city || "Unknown City",
        region: finalGeo.region || "Unknown State",
        country: finalGeo.country || "Unknown Country",
        source: req.body.utm_source || "Direct",
        page_visited: "/parent-enquiry",
        device: req.body.device || "Desktop",
        browser: req.body.browser || "Unknown Browser",
        os: req.body.os || "Unknown OS",
        ipAddress: finalIp,
        action: "database_saved_success"
      };
      await new AnalyticsLog(logData).save();
    } catch (logErr) {
      console.error("Failed to log database saved success:", logErr.message);
    }

    // Clear drafts if any exist
    try {
      const email = req.body.email;
      const phone = req.body.phone;
      const queryList = [];
      if (email) queryList.push({ emailOrPhone: email.trim() });
      if (phone) queryList.push({ emailOrPhone: phone.trim() });
      
      if (queryList.length > 0) {
        await ParentEnquiryDraft.deleteMany({ $or: queryList });
      }
    } catch (draftErr) {
      console.error("Error clearing draft on submit:", draftErr.message);
    }

    res.status(201).json(saved);
  } catch (error) {
    console.error("Parent enquiry create error:", error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * UPDATE parent enquiry
 * Used for lead pipeline status update from AdminDashboard
 * Final API:
 * PUT /api/parent-enquiries/:id
 */
router.put("/:id", verifyToken(["admin"]), async (req, res) => {
  try {
    const allowedUpdates = {
      status: req.body.status,
      adminNotes: req.body.adminNotes,
      nextFollowUpDate: req.body.nextFollowUpDate,
      assignedTutor: req.body.assignedTutor,
      assignedTutorId: req.body.assignedTutorId,
      demoDate: req.body.demoDate,
      demoTime: req.body.demoTime,
      feesFinalized: req.body.feesFinalized,
      finalFees: req.body.finalFees,
      lostReason: req.body.lostReason,
    };

    if (req.body.assignedTutor !== undefined) {
      if (req.body.assignedTutor) {
        const tutor = await Tutor.findOne({ name: req.body.assignedTutor });
        if (tutor) {
          allowedUpdates.assignedTutorId = tutor._id;
        } else {
          allowedUpdates.assignedTutorId = null;
        }
      } else {
        allowedUpdates.assignedTutorId = null;
      }
    }

    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    const enquiry = await ParentEnquiry.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!enquiry) {
      return res.status(404).json({
        message: "Parent enquiry not found",
      });
    }

    // Optional: update Odoo lead also, only if Odoo lead exists
    if (enquiry.odooLeadId && allowedUpdates.status) {
      try {
        await updateLead(enquiry.odooLeadId, {
          x_studio_lead_status: allowedUpdates.status,
        });
      } catch (err) {
        console.error("Odoo update lead status error:", err.message);
      }
    }

    res.json(enquiry);
  } catch (error) {
    console.error("Parent enquiry update error:", error);
    res.status(500).json({
      message: "Failed to update parent enquiry",
      error: error.message,
    });
  }
});

/**
 * CONFIRM parent enquiry from confirmation link
 * Final API:
 * GET /api/parent-enquiries/confirm?lead=ODOO_LEAD_ID
 */
router.get("/confirm", async (req, res) => {
  try {
    const leadId = req.query.lead;

    if (!leadId) {
      return res.status(400).send("Lead ID is required");
    }

    await updateLead(leadId, {
      x_studio_response_status: "Yes",
    });

    res.send("Thank you! Your interest is confirmed.");
  } catch (err) {
    console.error("Confirm parent lead error:", err.message);
    res.send("Something went wrong");
  }
});

/**
 * DELETE parent enquiry
 * Final API:
 * DELETE /api/parent-enquiries/:id
 */
router.delete("/:id", verifyToken(["admin"]), async (req, res) => {
  try {
    const enquiry = await ParentEnquiry.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        message: "Enquiry not found",
      });
    }

    res.json({
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    console.error("Parent enquiry delete error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
});

/**
 * GET all broadcast logs
 * GET /api/parent-enquiries/broadcast-logs
 */
router.get("/broadcast-logs", verifyToken(["admin"]), async (req, res) => {
  try {
    // Sync replies from Odoo
    await syncAllBroadcastReplies().catch(err => {
      console.error("[RepliesSync Error]:", err.message);
    });
    const logs = await BroadcastLog.find().sort({ time: -1 });
    res.json(logs);
  } catch (error) {
    console.error("Fetch broadcast logs error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST broadcast to selected tutors
 * POST /api/parent-enquiries/:id/broadcast
 */
router.post("/:id/broadcast", verifyToken(["admin"]), async (req, res) => {
  try {
    const leadId = req.params.id;
    const { tutorIds, messageTemplate, type } = req.body;

    if (!Array.isArray(tutorIds) || tutorIds.length === 0) {
      return res.status(400).json({ message: "At least one tutor must be selected." });
    }

    const lead = await ParentEnquiry.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }

    const firstWard = lead.wards?.[0] || {};
    const parentGrade = firstWard.classGrade ? `Class ${firstWard.classGrade}` : "N/A";
    const parentLocation = lead.address || lead.area || "N/A";
    const parentTiming = lead.preferredTime || "N/A";
    const reqId = lead.requirementId || "REQ-XXXXX";

    const logs = [];

    for (const tId of tutorIds) {
      const tutor = await Tutor.findById(tId);
      if (!tutor) continue;

      let message = messageTemplate || "";
      if (type === "whatsapp") {
        message = message
          .replace(/\{\{TutorName\}\}/g, tutor.name)
          .replace(/\{\{ParentGrade\}\}/g, parentGrade)
          .replace(/\{\{Location\}\}/g, parentLocation)
          .replace(/\{\{Timing\}\}/g, parentTiming)
          .replace(/\{\{RequirementID\}\}/g, reqId);
      }

      // Mock delivery status selection
      const statuses = ["Sent", "Delivered", "Failed"];
      const finalStatus = Math.random() < 0.9 ? "Delivered" : "Failed";

      const log = new BroadcastLog({
        tutorId: tutor._id,
        tutorName: tutor.name,
        tutorPhone: tutor.phone || tutor.whatsapp || "",
        requirementId: reqId,
        leadId: lead._id,
        type: type || "whatsapp",
        message: message,
        status: finalStatus,
      });
      await log.save();
      logs.push(log);
    }

    res.json({ message: "Broadcast dispatched successfully", logs });
  } catch (error) {
    console.error("Tutor broadcast error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST assign tutor to parent lead
 * POST /api/parent-enquiries/:id/assign-tutor
 */
router.post("/:id/assign-tutor", verifyToken(["admin"]), async (req, res) => {
  try {
    const leadId = req.params.id;
    const { tutorId } = req.body;

    const lead = await ParentEnquiry.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found." });
    }

    lead.assignedTutor = tutor.name;
    lead.assignedTutorId = tutor._id;
    await lead.save();

    // Update Odoo
    if (lead.odooLeadId) {
      try {
        await updateLead(lead.odooLeadId, {
          x_studio_assigned_tutor: tutor.name,
        });
      } catch (err) {
        console.error("Odoo update assigned tutor error:", err.message);
      }
    }

    res.json({ message: "Tutor assigned successfully", lead });
  } catch (error) {
    console.error("Assign tutor error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT update broadcast log response status
 * PUT /api/parent-enquiries/broadcast-logs/:logId/response
 */
router.put("/broadcast-logs/:logId/response", verifyToken(["admin"]), async (req, res) => {
  try {
    const { responseStatus } = req.body;
    const allowedResponses = ["Interested", "Not Interested", "No Response", "Follow-up Required"];
    
    if (!allowedResponses.includes(responseStatus)) {
      return res.status(400).json({ message: "Invalid response status." });
    }

    const log = await BroadcastLog.findByIdAndUpdate(
      req.params.logId,
      { responseStatus },
      { new: true }
    );

    if (!log) {
      return res.status(404).json({ message: "Broadcast log not found." });
    }

    res.json(log);
  } catch (error) {
    console.error("Update broadcast log response error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET current broadcast settings
 * GET /api/parent-enquiries/settings/broadcast
 */
router.get("/settings/broadcast", verifyToken(["admin"]), async (req, res) => {
  try {
    let maxBroadcast = 20;
    const configPath = path.resolve("config/broadcastConfig.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      maxBroadcast = config.maxBroadcastTutors || 20;
    }
    res.json({ maxBroadcastTutors: maxBroadcast });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST update broadcast settings
 * POST /api/parent-enquiries/settings/broadcast
 */
router.post("/settings/broadcast", verifyToken(["admin"]), async (req, res) => {
  try {
    const { maxBroadcastTutors } = req.body;
    if (maxBroadcastTutors === undefined || isNaN(Number(maxBroadcastTutors))) {
      return res.status(400).json({ message: "Invalid maxBroadcastTutors value." });
    }

    const configPath = path.resolve("config/broadcastConfig.json");
    const newConfig = { maxBroadcastTutors: Number(maxBroadcastTutors) };
    
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), "utf8");
    
    res.json({ success: true, maxBroadcastTutors: Number(maxBroadcastTutors) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Automatic broadcast function running after Parent Enquiry creation
 */
async function triggerAutoBroadcast(leadId) {
  try {
    console.log(`[AutoBroadcast] Starting automatic broadcast workflow for Lead ID: ${leadId}`);
    const lead = await ParentEnquiry.findById(leadId);
    if (!lead) {
      console.error(`[AutoBroadcast] Lead not found: ${leadId}`);
      return;
    }

    // 1. Get max broadcast limit
    let maxBroadcast = 20;
    try {
      const configPath = path.resolve("config/broadcastConfig.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        if (config.maxBroadcastTutors && !isNaN(Number(config.maxBroadcastTutors))) {
          maxBroadcast = Number(config.maxBroadcastTutors);
        }
      }
    } catch (err) {
      console.error("[AutoBroadcast] Failed to read broadcast limit config:", err.message);
    }

    // 2. Build match params
    const firstWard = lead.wards?.[0] || {};
    const parsedAddr = parseAddress(lead.address);
    const params = {
      pincode: lead.pincode || parsedAddr.pincode || "",
      area: lead.area || parsedAddr.area || "",
      locality: lead.locality || parsedAddr.locality || "",
      landmark: lead.landmark || parsedAddr.landmark || "",
      city: lead.city || parsedAddr.city || lead.geoInfo?.city || "",
      district: lead.district || parsedAddr.district || "",
      state: lead.state || parsedAddr.state || lead.geoInfo?.region || "",
      grade: firstWard.classGrade || "",
      timing: lead.preferredTime || "",
      gender: lead.preferredGender || "No Preference"
    };

    // 3. Query approved tutors matching grade/gender strict rules
    const query = buildCentralizedQuery(params);
    const tutors = await Tutor.find(query);

    // 4. Score and filter/rank tutors
    const scoredTutors = tutors
      .map(tutor => {
        const scoreInfo = calculateTutorScore(params, tutor);
        return {
          tutor,
          matchPercentage: scoreInfo.percentage,
          locationScore: scoreInfo.locationScore
        };
      })
      .filter(item => {
        const hasLocationCriteria = !!(
          params.pincode ||
          params.area ||
          params.locality ||
          params.landmark ||
          params.city
        );
        if (hasLocationCriteria && item.locationScore === 0) {
          return false;
        }
        return item.matchPercentage > 0;
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Take top recommended tutors up to the max limit
    const selectedTutors = scoredTutors.slice(0, maxBroadcast).map(item => item.tutor);
    console.log(`[AutoBroadcast] Found ${scoredTutors.length} total matched tutors. Selected top ${selectedTutors.length} for broadcast.`);

    const reqId = lead.requirementId || "REQ-XXXXX";
    const parentGrade = firstWard.classGrade ? `Class ${firstWard.classGrade}` : "N/A";
    const parentBoard = firstWard.curriculum || "N/A";
    const parentLocation = `${params.area || parsedAddr.area || "N/A"}, ${params.city || "Bengaluru"} - ${params.pincode || "N/A"}`;
    const parentTiming = lead.preferredTime || "N/A";

    for (const tutor of selectedTutors) {
      // SAFETY RULE: Prevent duplicate broadcasts
      const existingLog = await BroadcastLog.findOne({
        tutorId: tutor._id,
        requirementId: reqId
      });
      
      if (existingLog) {
        console.log(`[AutoBroadcast] Broadcast already sent to tutor ${tutor.name} for Requirement ID ${reqId}. Skipping.`);
        continue;
      }

      // Generate personalized message
      const message = `Hello ${tutor.name},\n\nA new tuition opportunity matching your profile has been found.\n\nRequirement ID:\n${reqId}\n\nStudent Grade:\n${parentGrade}\n\nBoard:\n${parentBoard}\n\nLocation:\n${parentLocation}\n\nPreferred Timing:\n${parentTiming}\n\nIf you are interested, please reply YES.\n\nThank you,\nSaraswati Tutorials`;

      // Send via Odoo WhatsApp integration
      const tutorPhone = tutor.phone || tutor.whatsapp || "";
      if (!tutorPhone) {
        console.warn(`[AutoBroadcast] Tutor ${tutor.name} has no phone number. Skipping.`);
        continue;
      }

      let odooSuccess = false;
      let odooMsgId = null;
      try {
        const odooRes = await sendOdooWhatsApp(tutorPhone, message, tutor.name);
        if (odooRes.success) {
          odooSuccess = true;
          odooMsgId = odooRes.id;
        }
      } catch (err) {
        console.error(`[AutoBroadcast] Failed sending message to Odoo for ${tutor.name}:`, err.message);
      }

      // Create Broadcast Log
      const log = new BroadcastLog({
        tutorId: tutor._id,
        tutorName: tutor.name,
        tutorPhone: tutorPhone,
        requirementId: reqId,
        leadId: lead._id,
        type: "whatsapp",
        message: message,
        status: odooSuccess ? "Sent" : "Failed",
        responseStatus: "No Response"
      });
      
      await log.save();
      console.log(`[AutoBroadcast] Logged broadcast to ${tutor.name} (Status: ${log.status})`);
    }

    console.log(`[AutoBroadcast] Completed automatic broadcast workflow for Lead ID: ${leadId}`);
  } catch (err) {
    console.error("[AutoBroadcast] General error in auto broadcast:", err);
  }
}

/**
 * Sync replies from Odoo for pending BroadcastLog records
 */
async function syncAllBroadcastReplies() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // Sync for last 7 days

    const pendingLogs = await BroadcastLog.find({
      responseStatus: { $in: ["No Response", "Pending"] },
      time: { $gte: cutoffDate }
    });

    if (pendingLogs.length === 0) return;

    console.log(`[RepliesSync] Checking Odoo replies for ${pendingLogs.length} pending broadcast logs...`);

    const phoneToLogs = {};
    for (const log of pendingLogs) {
      const clean = String(log.tutorPhone).replace(/[^0-9]/g, "");
      if (clean.length >= 10) {
        if (!phoneToLogs[log.tutorPhone]) {
          phoneToLogs[log.tutorPhone] = [];
        }
        phoneToLogs[log.tutorPhone].push(log);
      }
    }

    for (const [phone, logs] of Object.entries(phoneToLogs)) {
      // Fetch replies starting with a 5-minute clock skew buffer
      const earliestTime = new Date(Math.min(...logs.map(l => new Date(l.time))) - 5 * 60 * 1000);
      
      const replies = await fetchOdooWhatsAppReplies(phone, earliestTime);
      if (replies.length > 0) {
        replies.sort((a, b) => new Date(a.create_date) - new Date(b.create_date));

        for (const log of logs) {
          const logTime = new Date(log.time);
          const logTimeWithBuffer = new Date(logTime.getTime() - 5 * 60 * 1000);
          const matchReply = replies.find(r => new Date(r.create_date) > logTimeWithBuffer);
          
          if (matchReply) {
            const cleanText = String(matchReply.body || "")
              .replace(/<[^>]*>/g, "")
              .trim()
              .toUpperCase();

            let newStatus = null;
            if (cleanText.includes("YES")) {
              newStatus = "Interested";
            } else if (cleanText.includes("NO")) {
              newStatus = "Not Interested";
            } else if (cleanText.includes("BUSY")) {
              newStatus = "Busy";
            }

            if (newStatus && log.responseStatus !== newStatus) {
              log.responseStatus = newStatus;
              await log.save();
              console.log(`[RepliesSync] Updated reply status for tutor ${log.tutorName} to ${newStatus} on Requirement ${log.requirementId}`);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("[RepliesSync] Error syncing replies from Odoo:", err.message);
  }
}

export default router;
import express from "express";
import ParentEnquiry from "../models/ParentEnquiry.js";
import ParentEnquiryDraft from "../models/ParentEnquiryDraft.js";
import AnalyticsLog from "../models/AnalyticsLog.js";
import { createLead, updateLead } from "../utils/odooService.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { resolveGeo } from "../utils/geoLookup.js";
import Tutor from "../models/Tutor.js";
import BroadcastLog from "../models/BroadcastLog.js";

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

export default router;
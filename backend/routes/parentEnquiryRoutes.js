import express from "express";
import ParentEnquiry from "../models/ParentEnquiry.js";
import ParentEnquiryDraft from "../models/ParentEnquiryDraft.js";
import { createLead, updateLead } from "../utils/odooService.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { resolveGeo } from "../utils/geoLookup.js";

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
    const { emailOrPhone, stepReached, formData, geoInfo, ipAddress, visitor_id, session_id } = req.body;
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
      { stepReached, formData, geoInfo: finalGeo, ipAddress: finalIp, visitor_id, session_id },
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

    let odooRes = null;

    try {
      odooRes = await createLead({
        ...req.body,
        userType: "parent",
      });
    } catch (err) {
      console.error("Odoo create parent lead error:", err.message);
    }

    const enquiry = new ParentEnquiry({
      ...req.body,
      status: req.body.status || "New Lead",
      odooLeadId: odooRes,
    });

    const saved = await enquiry.save();

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
      demoDate: req.body.demoDate,
      demoTime: req.body.demoTime,
      feesFinalized: req.body.feesFinalized,
      finalFees: req.body.finalFees,
      lostReason: req.body.lostReason,
    };

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

export default router;
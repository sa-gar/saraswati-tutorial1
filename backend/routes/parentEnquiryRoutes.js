import express from "express";
import ParentEnquiry from "../models/ParentEnquiry.js";
import { createLead, updateLead } from "../utils/odooService.js";

const router = express.Router();

/**
 * GET all parent enquiries
 * Final API:
 * GET /api/parent-enquiries
 */
router.get("/", async (req, res) => {
  try {
    const data = await ParentEnquiry.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    console.error("Parent enquiry fetch error:", error);
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
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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
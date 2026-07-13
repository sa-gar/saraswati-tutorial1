import express from "express";
import Tutor from "../models/Tutor.js";
import ParentEnquiry from "../models/ParentEnquiry.js";
import BroadcastLog from "../models/BroadcastLog.js";
import fetch from "node-fetch";
import { createLead, upsertMasterTutor } from "../utils/odooService.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import jwt from "jsonwebtoken";
import {
  buildCentralizedQuery,
  calculateTutorScore,
  parseAddress,
  compareTutors,
} from "../utils/matchingEngine.js";
import mongoose from "mongoose";

const router = express.Router();

// Helper to dynamically calculate and append tutor statistics from ParentEnquiry
async function appendStatsToTutor(tutor) {
  const assignedLeads = await ParentEnquiry.find({
    $or: [
      { assignedTutorId: tutor._id },
      { assignedTutor: tutor.name }
    ]
  });

  const totalAssignments = assignedLeads.length;
  const demoScheduled = assignedLeads.filter(l => l.status === "Demo Scheduled").length;
  const demoCancelled = assignedLeads.filter(l => l.status === "Demo Cancelled").length;
  const rejected = assignedLeads.filter(l => l.status === "Rejected" || l.status === "Lost").length;
  const successfullyEnrolled = assignedLeads.filter(l => l.status === "Enrolled" || l.status === "Won").length;
  const activeTuitionCount = successfullyEnrolled;
  const successPercentage = totalAssignments > 0 ? Math.round((successfullyEnrolled / totalAssignments) * 100) : 0;

  return {
    ...tutor.toObject(),
    performanceStats: {
      totalAssignments,
      demoScheduled,
      demoCancelled,
      rejected,
      successfullyEnrolled,
      activeTuitionCount,
      successPercentage
    }
  };
}

// GET all tutors
router.get("/", async (req, res) => {
  try {
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
        if (decoded.role === "admin") {
          isAdmin = true;
        }
      } catch (e) {}
    }

    let tutors;
    if (isAdmin) {
      tutors = await Tutor.find().sort({ createdAt: -1 });
    } else {
      // Exclude documents, phone, and email for public searches
      tutors = await Tutor.find({}, { documents: 0, phone: 0, email: 0 }).sort({ createdAt: -1 });
    }

    // Append performance stats dynamically
    const tutorsWithStats = await Promise.all(tutors.map(appendStatsToTutor));
    res.json(tutorsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET single tutor
router.get("/:id", async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const tutorWithStats = await appendStatsToTutor(tutor);
    res.json(tutorWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



router.post("/match", async (req, res) => {
  try {
    let params = req.body;
    let requirementId = null;

    // If leadId is provided, resolve and extract lead variables from database
    if (params.leadId) {
      let lead = null;

      // Check if it's a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(params.leadId)) {
        lead = await ParentEnquiry.findById(params.leadId);
      }

      // If not resolved by ObjectId, try to query by Odoo Lead ID
      if (!lead) {
        const numericOdooId = parseInt(params.leadId);
        if (!isNaN(numericOdooId)) {
          lead = await ParentEnquiry.findOne({
            $or: [
              { odooLeadId: numericOdooId },
              { odooLeadId: String(numericOdooId) },
            ],
          });
        }
      }

      if (!lead) {
        return res.status(404).json({ message: "Parent Enquiry lead not found" });
      }

      requirementId = lead.requirementId || null;
      const firstWard = lead.wards?.[0] || {};
      const parsedAddr = parseAddress(lead.address);

      params = {
        pincode: lead.pincode || parsedAddr.pincode || "",
        area: lead.area || parsedAddr.area || "",
        locality: lead.locality || parsedAddr.locality || "",
        landmark: lead.landmark || parsedAddr.landmark || "",
        city: lead.city || parsedAddr.city || lead.geoInfo?.city || "",
        district: lead.district || parsedAddr.district || "",
        state: lead.state || parsedAddr.state || lead.geoInfo?.region || "",
        grade: firstWard.classGrade || "",
        board: firstWard.curriculum || "",
        subjects: Array.isArray(firstWard.subjectsNeeded) ? firstWard.subjectsNeeded : [],
        timing: lead.preferredTime || "",
        gender: lead.preferredGender || "No Preference",
        // GPS coords (if available from form)
        latitude: lead.latitude || null,
        longitude: lead.longitude || null,
      };
    }

    // Build DB query — never includes Blocked tutors
    const query = buildCentralizedQuery(params);
    const tutors = await Tutor.find(query);

    // Append performance stats dynamically for matched tutors
    const tutorsWithStats = await Promise.all(tutors.map(appendStatsToTutor));

    // Fetch existing broadcast logs for this requirement (for status overlay)
    let existingBroadcastMap = {};
    if (requirementId) {
      const existingLogs = await BroadcastLog.find({ requirementId }).lean();
      for (const log of existingLogs) {
        existingBroadcastMap[String(log.tutorId)] = {
          status: log.status,
          responseStatus: log.responseStatus,
          logId: log._id,
        };
      }
    }

    // Calculate match scores and annotate with distance + broadcast status
    const scoredTutors = tutorsWithStats
      .map((tutor) => {
        const scoreInfo = calculateTutorScore(params, tutor);
        const broadcastInfo = existingBroadcastMap[String(tutor._id)] || null;
        return {
          ...tutor,
          matchScore: scoreInfo.score,
          matchPercentage: scoreInfo.percentage,
          locationScore: scoreInfo.locationScore,
          distanceKm: scoreInfo.distanceKm,
          distanceTier: scoreInfo.distanceTier,
          scoreBreakdown: scoreInfo.breakdown,
          broadcastStatus: broadcastInfo ? broadcastInfo.status : null,
          broadcastResponseStatus: broadcastInfo ? broadcastInfo.responseStatus : null,
          broadcastLogId: broadcastInfo ? broadcastInfo.logId : null,
        };
      })
      .filter((tutor) => {
        // Filter by location score if location criteria was specified
        const hasLocationCriteria = !!(
          params.pincode ||
          params.area ||
          params.locality ||
          params.landmark ||
          params.city ||
          params.district ||
          params.state
        );
        if (hasLocationCriteria && tutor.locationScore === 0) {
          return false;
        }
        return tutor.matchPercentage > 0;
      })
      // Primary: distance (if available), Secondary: match%, Tertiary: availability
      .sort(compareTutors);

    // Extract Odoo record IDs in sorted order
    const matchedOdooIds = scoredTutors
      .map((t) => t.odooLeadId)
      .filter((id) => id !== null && id !== undefined && !isNaN(parseInt(id)))
      .map((id) => parseInt(id));

    res.json({
      success: true,
      tutors: scoredTutors,
      matched_ids: matchedOdooIds,
    });
  } catch (error) {
    console.error("Match error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    let odooRes = null;
    try {
      odooRes = await upsertMasterTutor(req.body);
    } catch (err) {
      console.error("[Odoo Error in upsertMasterTutor]:", err.message);
    }

    const hasVehicle = req.body.hasVehicle === "yes" ? "yes" : "no";
    const hasOccupation = req.body.hasOccupation === "yes" ? "yes" : "no";

    // Check for duplicate in MongoDB by phone number
    let tutor = await Tutor.findOne({ phone: phone.trim() });

    // Explicitly extract all matching fields to ensure they are never lost during spread
    const body = req.body;
    const tutorData = {
      ...body,
      hasVehicle,
      hasOccupation,
      odooLeadId: odooRes ? odooRes.id : null,
      tutorCode: odooRes ? odooRes.tutorCode : null,
      // Matching fields — explicitly set so Mongoose strict mode never drops them
      gender: body.gender || "",
      dob: body.dob || "",
      whatsapp: body.whatsapp || body.phone || "",
      city: body.city || "",
      area: body.area || "",
      fullAddress: body.fullAddress || "",
      pincode: body.pincode || "",
      grades: Array.isArray(body.grades) ? body.grades : [],
      boards: Array.isArray(body.boards) ? body.boards : [],
      subjects: Array.isArray(body.subjects) ? body.subjects : [],
      timings: Array.isArray(body.timings) ? body.timings : [],
      locations: Array.isArray(body.locations) ? body.locations : [],
      maxTravelDistance: body.maxTravelDistance || "",
    };

    if (tutor) {
      console.log(`[MongoDB] Tutor with phone ${phone} already exists. Updating existing record...`);
      tutor = await Tutor.findByIdAndUpdate(tutor._id, tutorData, { new: true, runValidators: true });
    } else {
      console.log(`[MongoDB] Creating new tutor record with phone ${phone}...`);
      tutor = new Tutor(tutorData);
      await tutor.save();
    }

    res.status(201).json(tutor);

  } catch (error) {
    console.error("Server Error in tutor registration:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// MARK ONBOARDED
router.put("/:id/mark-onboarded", verifyToken(["admin"]), async (req, res) => {
  try {
    const { onboardingCompleted = true } = req.body;
    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    tutor.onboardingCompleted = onboardingCompleted;
    if (onboardingCompleted) {
      tutor.status = "approved";
    }
    await tutor.save();

    // Also update Odoo status if Odoo record is linked
    if (tutor.odooLeadId) {
      try {
        const { callOdoo } = await import("../utils/odooService.js");
        const DB = process.env.ODOO_DB;
        const USERNAME = process.env.ODOO_USERNAME;
        const PASSWORD = process.env.ODOO_PASSWORD;
        const uid = await callOdoo("common", "authenticate", [DB, USERNAME, PASSWORD, {}]);
        if (uid) {
          await callOdoo("object", "execute_kw", [
            DB,
            uid,
            PASSWORD,
            "x_master_tutors",
            "write",
            [[parseInt(tutor.odooLeadId)], {
              x_availability: onboardingCompleted ? "Available" : "Inactive"
            }]
          ]);
          console.log("[Odoo] Updated tutor availability for ID:", tutor.odooLeadId);
        }
      } catch (odooErr) {
        console.error("[Odoo Sync Error on mark-onboarded]:", odooErr.message);
      }
    }

    res.json(tutor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE tutor
router.put("/:id", verifyToken(["admin"]), async (req, res) => {
  try {
    const updatedTutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedTutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Sync to Odoo
    try {
      await upsertMasterTutor(updatedTutor.toObject());
    } catch (err) {
      console.error("[Odoo Sync Error on update]:", err.message);
    }

    res.json(updatedTutor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// DELETE tutor
router.delete("/:id", verifyToken(["admin"]), async (req, res) => {
  try {
    const deletedTutor = await Tutor.findByIdAndDelete(req.params.id);


    if (!deletedTutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }


    res.json({ message: "Tutor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;


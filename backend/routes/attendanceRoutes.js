import express from "express";
import jwt from "jsonwebtoken";
import Tutor from "../models/Tutor.js";
import ParentEnquiry from "../models/ParentEnquiry.js";
import Attendance from "../models/Attendance.js";
import { updateLead } from "../utils/odooService.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// =============================================================
// Helper: Get student card with latest status
// =============================================================
async function formatStudentCard(lead) {
  // Find the latest attendance log for this lead
  const latestLog = await Attendance.findOne({ parentEnquiryId: lead._id })
    .sort({ timestamp: -1 });

  const studentName = lead.wards?.map(w => w.studentName).join(", ") || "Unknown Student";
  const completed = lead.completedClasses || 0;
  const total = lead.totalClasses || 12;
  const remaining = Math.max(0, total - completed);

  // Count missed classes
  const missedClasses = await Attendance.countDocuments({
    parentEnquiryId: lead._id,
    status: "Missed",
  });

  return {
    _id: lead._id,
    studentName,
    tutorName: lead.assignedTutor || "Not Assigned",
    requirementId: lead.requirementId || "REQ-N/A",
    totalClasses: total,
    completedClasses: completed,
    remainingClasses: remaining,
    missedClasses,
    classSchedule: lead.classSchedule || lead.preferredTime || "Not Scheduled",
    classDuration: lead.classDuration || "Not provided",
    currentAttendanceStatus: latestLog ? latestLog.status : "Pending",
    latestLogDate: latestLog ? latestLog.date : null,
    leadStatus: lead.status,
  };
}

// =============================================================
// POST: Tutor Login (by tutorCode, email, or phone)
// =============================================================
router.post("/tutor-login", async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ message: "Identifier (code, email, or phone) is required." });
    }

    const cleanIdentifier = String(identifier).trim();

    // Query tutor
    const tutor = await Tutor.findOne({
      $or: [
        { tutorCode: { $regex: new RegExp(`^${cleanIdentifier}$`, "i") } },
        { email: { $regex: new RegExp(`^${cleanIdentifier}$`, "i") } },
        { phone: { $regex: cleanIdentifier.slice(-10) } },
        { whatsapp: { $regex: cleanIdentifier.slice(-10) } },
      ],
    });

    if (!tutor) {
      return res.status(401).json({ message: "Tutor not found with the provided credentials." });
    }

    if (tutor.status !== "approved") {
      return res.status(403).json({ message: "Your tutor profile is pending approval or rejected." });
    }

    // Sign JWT token
    const token = jwt.sign(
      { id: tutor._id, name: tutor.name, role: "tutor" },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      token,
      tutor: {
        id: tutor._id,
        name: tutor.name,
        tutorCode: tutor.tutorCode,
        email: tutor.email,
        phone: tutor.phone,
      },
    });
  } catch (error) {
    console.error("Tutor login error:", error);
    res.status(500).json({ message: error.message });
  }
});

// =============================================================
// GET: Tutor's Active Students
// =============================================================
router.get("/tutor/:tutorId/students", verifyToken(["admin", "tutor"]), async (req, res) => {
  try {
    const { tutorId } = req.params;

    // Retrieve active student parent enquiries for this tutor
    // Exclude cancelled/rejected/lost
    const activeLeads = await ParentEnquiry.find({
      assignedTutorId: tutorId,
      status: { $nin: ["Lost", "Rejected", "Demo Cancelled", "Cancelled"] },
    }).sort({ createdAt: -1 });

    const studentCards = await Promise.all(
      activeLeads.map(lead => formatStudentCard(lead))
    );

    res.json({ success: true, students: studentCards });
  } catch (error) {
    console.error("Fetch tutor students error:", error);
    res.status(500).json({ message: error.message });
  }
});

// =============================================================
// POST: Mark Attendance (Done / Missed)
// =============================================================
router.post("/mark", verifyToken(["admin", "tutor"]), async (req, res) => {
  try {
    const {
      parentEnquiryId,
      tutorId,
      status,
      topicsCovered,
      missedReason,
      customReason,
      date,
    } = req.body;

    if (!parentEnquiryId || !tutorId || !status || !date) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (status === "Done" && !topicsCovered?.trim()) {
      return res.status(400).json({ message: "Topics covered is required for completed classes." });
    }

    if (status === "Missed" && !missedReason?.trim()) {
      return res.status(400).json({ message: "Reason is required for missed classes." });
    }

    if (status === "Missed" && missedReason === "Other" && !customReason?.trim()) {
      return res.status(400).json({ message: "Custom reason description is required." });
    }

    // Fetch parent enquiry and tutor info
    const lead = await ParentEnquiry.findById(parentEnquiryId);
    if (!lead) return res.status(404).json({ message: "Student enquiry not found." });

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) return res.status(404).json({ message: "Tutor not found." });

    // Create the Attendance entry
    const attendance = new Attendance({
      parentEnquiryId,
      studentName: lead.wards?.map(w => w.studentName).join(", ") || "Unknown Student",
      requirementId: lead.requirementId || "REQ-N/A",
      tutorId,
      tutorName: tutor.name,
      status,
      topicsCovered: status === "Done" ? topicsCovered : "",
      missedReason: status === "Missed" ? missedReason : "",
      customReason: status === "Missed" && missedReason === "Other" ? customReason : "",
      date,
    });

    await attendance.save();

    // Recalculate Completed Classes count
    const completedCount = await Attendance.countDocuments({
      parentEnquiryId,
      status: "Done",
    });

    lead.completedClasses = completedCount;
    await lead.save({ validateBeforeSave: false });

    // Sync to Odoo crm.lead asynchronously
    if (lead.odooLeadId) {
      try {
        const remaining = Math.max(0, (lead.totalClasses || 12) - completedCount);
        await updateLead(lead.odooLeadId, {
          x_studio_completed_classes: completedCount,
          x_studio_total_classes: lead.totalClasses || 12,
          x_studio_remaining_classes: remaining,
          x_studio_last_attendance_status: status,
          x_studio_last_class_topics: status === "Done" ? topicsCovered : "",
          x_studio_last_missed_reason: status === "Missed" ? (missedReason === "Other" ? customReason : missedReason) : "",
        });
      } catch (odooErr) {
        console.error("[Odoo Attendance Sync Error]:", odooErr.message);
      }
    }

    const updatedCard = await formatStudentCard(lead);

    res.json({
      success: true,
      message: "Attendance recorded successfully.",
      attendance,
      updatedStudentCard: updatedCard,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({ message: error.message });
  }
});

// =============================================================
// GET: Attendance logs for a specific student/enquiry
// =============================================================
router.get("/logs/:parentEnquiryId", verifyToken(["admin", "tutor"]), async (req, res) => {
  try {
    const { parentEnquiryId } = req.params;
    const logs = await Attendance.find({ parentEnquiryId }).sort({ timestamp: -1 });
    res.json({ success: true, logs });
  } catch (error) {
    console.error("Fetch attendance logs error:", error);
    res.status(500).json({ message: error.message });
  }
});

// =============================================================
// POST: Parent Login / Search (by phone number)
// =============================================================
router.post("/parent-login", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    const cleanPhone = String(phone).trim().slice(-10);

    // Find enquiries matching parent's phone number
    const enquiries = await ParentEnquiry.find({
      phone: { $regex: cleanPhone },
    }).sort({ createdAt: -1 });

    if (!enquiries.length) {
      return res.status(404).json({ message: "No active student enquiry found for this phone number." });
    }

    // Format cards and retrieve history
    const results = await Promise.all(
      enquiries.map(async (lead) => {
        const card = await formatStudentCard(lead);
        const logs = await Attendance.find({ parentEnquiryId: lead._id }).sort({ timestamp: -1 });
        return {
          card,
          logs,
        };
      })
    );

    res.json({ success: true, results });
  } catch (error) {
    console.error("Parent login error:", error);
    res.status(500).json({ message: error.message });
  }
});

// =============================================================
// GET: Admin Alerts (Self-healing list of notifications)
// =============================================================
router.get("/admin-alerts", verifyToken(["admin"]), async (req, res) => {
  try {
    const alerts = [];

    // Condition 1: If a teacher has missed more than two classes in total
    const missedAggregation = await Attendance.aggregate([
      { $match: { status: "Missed" } },
      {
        $group: {
          _id: { tutorId: "$tutorId", tutorName: "$tutorName" },
          missedCount: { $sum: 1 },
        },
      },
      { $match: { missedCount: { $gt: 2 } } },
    ]);

    missedAggregation.forEach((item) => {
      alerts.push({
        id: `missed-${item._id.tutorId}`,
        type: "missed_classes",
        message: `Teacher ${item._id.tutorName} has missed more than two classes (${item.missedCount} missed).`,
        tutorId: item._id.tutorId,
        tutorName: item._id.tutorName,
        count: item.missedCount,
        severity: "high",
      });
    });

    // Condition 2: Payment reminders at >= 90% completion
    const activeLeads = await ParentEnquiry.find({
      status: { $nin: ["Lost", "Rejected", "Demo Cancelled", "Cancelled"] },
      totalClasses: { $gt: 0 },
    });

    activeLeads.forEach((lead) => {
      const completed = lead.completedClasses || 0;
      const total = lead.totalClasses || 12;
      const ratio = completed / total;
      if (ratio >= 0.9 && completed > 0) {
        alerts.push({
          id: `payment-${lead._id}`,
          type: "payment_reminder",
          message: `Requirement ${lead.requirementId || "REQ-N/A"} (${lead.wards?.map(w => w.studentName).join(", ") || "Unknown Student"}) has completed ${Math.round(ratio * 100)}% of scheduled classes. Payment review is recommended.`,
          parentEnquiryId: lead._id,
          requirementId: lead.requirementId,
          completed,
          total,
          severity: "medium",
        });
      }
    });

    res.json({ success: true, alerts });
  } catch (error) {
    console.error("Fetch admin alerts error:", error);
    res.status(500).json({ message: error.message });
  }
});

// =============================================================
// PUT: Update tuition details (Admin only)
// =============================================================
router.put("/update-tuition/:id", verifyToken(["admin"]), async (req, res) => {
  try {
    const { classDuration, totalClasses, classSchedule, completedClasses } = req.body;
    const lead = await ParentEnquiry.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Student enquiry not found." });

    if (classDuration !== undefined) lead.classDuration = classDuration;
    if (totalClasses !== undefined) lead.totalClasses = totalClasses;
    if (classSchedule !== undefined) lead.classSchedule = classSchedule;
    if (completedClasses !== undefined) lead.completedClasses = completedClasses;

    await lead.save({ validateBeforeSave: false });

    // Sync to Odoo if needed
    if (lead.odooLeadId) {
      try {
        const comp = lead.completedClasses || 0;
        const tot = lead.totalClasses || 12;
        const rem = Math.max(0, tot - comp);
        await updateLead(lead.odooLeadId, {
          x_studio_total_classes: tot,
          x_studio_completed_classes: comp,
          x_studio_remaining_classes: rem,
        });
      } catch (odooErr) {
        console.error("[Odoo sync error during manual update]:", odooErr.message);
      }
    }

    const card = await formatStudentCard(lead);
    res.json({ success: true, studentCard: card });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// =============================================================
// DELETE: Delete an attendance log (Admin only)
// =============================================================
router.delete("/log/:logId", verifyToken(["admin"]), async (req, res) => {
  try {
    const log = await Attendance.findById(req.params.logId);
    if (!log) return res.status(404).json({ message: "Log not found." });

    const parentEnquiryId = log.parentEnquiryId;
    await Attendance.findByIdAndDelete(req.params.logId);

    // Recalculate Completed Classes count
    const lead = await ParentEnquiry.findById(parentEnquiryId);
    if (lead) {
      const completedCount = await Attendance.countDocuments({
        parentEnquiryId,
        status: "Done",
      });
      lead.completedClasses = completedCount;
      await lead.save({ validateBeforeSave: false });

      if (lead.odooLeadId) {
        try {
          const remaining = Math.max(0, (lead.totalClasses || 12) - completedCount);
          await updateLead(lead.odooLeadId, {
            x_studio_completed_classes: completedCount,
            x_studio_total_classes: lead.totalClasses || 12,
            x_studio_remaining_classes: remaining,
          });
        } catch (odooErr) {
          console.error("[Odoo Sync Error after delete log]:", odooErr.message);
        }
      }
    }

    res.json({ success: true, message: "Attendance log deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// =============================================================
// PUT: Update an attendance log (Admin only)
// =============================================================
router.put("/log/:logId", verifyToken(["admin"]), async (req, res) => {
  try {
    const { status, date, topicsCovered, missedReason, customReason } = req.body;
    const log = await Attendance.findById(req.params.logId);
    if (!log) return res.status(404).json({ message: "Log not found." });

    if (status) log.status = status;
    if (date) log.date = date;
    if (status === "Done") {
      log.topicsCovered = topicsCovered || "";
      log.missedReason = "";
      log.customReason = "";
    } else if (status === "Missed") {
      log.topicsCovered = "";
      log.missedReason = missedReason || "";
      log.customReason = customReason || "";
    }

    await log.save();

    // Recalculate Completed Classes count for parent lead
    const parentEnquiryId = log.parentEnquiryId;
    const lead = await ParentEnquiry.findById(parentEnquiryId);
    if (lead) {
      const completedCount = await Attendance.countDocuments({
        parentEnquiryId,
        status: "Done",
      });
      lead.completedClasses = completedCount;
      await lead.save({ validateBeforeSave: false });

      if (lead.odooLeadId) {
        try {
          const remaining = Math.max(0, (lead.totalClasses || 12) - completedCount);
          await updateLead(lead.odooLeadId, {
            x_studio_completed_classes: completedCount,
            x_studio_total_classes: lead.totalClasses || 12,
            x_studio_remaining_classes: remaining,
            x_studio_last_attendance_status: status,
          });
        } catch (odooErr) {
          console.error("[Odoo Sync Error after update log]:", odooErr.message);
        }
      }
    }

    res.json({ success: true, log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

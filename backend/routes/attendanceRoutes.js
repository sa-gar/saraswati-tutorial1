import express from "express";
import jwt from "jsonwebtoken";
import Tutor from "../models/Tutor.js";
import ParentEnquiry from "../models/ParentEnquiry.js";
import Attendance from "../models/Attendance.js";
import { updateLead } from "../utils/odooService.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// =============================================================
// Helper: Get student card with authoritative status
// =============================================================
async function formatStudentCard(lead) {
  const cycle = lead.currentPackageCycle || 1;
  const total = lead.totalClasses || 12;

  // Count COMPLETED ("Done") classes for the active package cycle
  const completedCount = await Attendance.countDocuments({
    parentEnquiryId: lead._id,
    packageCycle: cycle,
    status: "Done",
  });

  const completed = Math.min(total, completedCount);
  const remaining = Math.max(0, total - completed);

  const missedClasses = await Attendance.countDocuments({
    parentEnquiryId: lead._id,
    packageCycle: cycle,
    status: "Missed",
  });

  const packageStatus = completed >= total ? "completed" : "active";

  // Keep Lead document state in sync with single source of truth
  if (lead.completedClasses !== completed || lead.packageStatus !== packageStatus) {
    lead.completedClasses = completed;
    lead.packageStatus = packageStatus;
    await lead.save({ validateBeforeSave: false }).catch(() => {});
  }

  const latestLog = await Attendance.findOne({
    parentEnquiryId: lead._id,
    packageCycle: cycle,
  }).sort({ timestamp: -1 });

  const studentName = lead.wards?.map(w => w.studentName).join(", ") || "Unknown Student";

  return {
    _id: lead._id,
    studentName,
    tutorName: lead.assignedTutor || "Not Assigned",
    requirementId: lead.requirementId || "REQ-N/A",
    totalClasses: total,
    completedClasses: completed,
    remainingClasses: remaining,
    missedClasses,
    currentPackageCycle: cycle,
    packageStatus,
    packageHistory: lead.packageHistory || [],
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

    const packageCycle = lead.currentPackageCycle || 1;
    const totalClasses = lead.totalClasses || 12;

    // Check existing completed count for this cycle
    const currentCompleted = await Attendance.countDocuments({
      parentEnquiryId,
      packageCycle,
      status: "Done",
    });

    // DUPLICATE COMPLETION PROTECTION:
    // If status is "Done", check if an attendance record for this exact date and student/cycle already exists
    if (status === "Done") {
      const existingDone = await Attendance.findOne({
        parentEnquiryId,
        packageCycle,
        date,
        status: "Done",
      });

      if (existingDone) {
        // Class already marked for this date. Return authoritative state without double-counting!
        const updatedCard = await formatStudentCard(lead);
        return res.json({
          success: true,
          message: "Attendance for this class date has already been recorded.",
          session: {
            sessionNumber: existingDone.sessionNumber || currentCompleted,
            status: "completed",
            date: existingDone.date,
          },
          package: {
            totalClasses: updatedCard.totalClasses,
            completedClasses: updatedCard.completedClasses,
            remainingClasses: updatedCard.remainingClasses,
            packageCycle,
            status: updatedCard.packageStatus,
          },
          attendance: existingDone,
          updatedStudentCard: updatedCard,
        });
      }

      // If current completed count reached or exceeded total classes, auto-rollover to next cycle
      if (currentCompleted >= totalClasses) {
        if (!lead.packageHistory) lead.packageHistory = [];
        lead.packageHistory.push({
          cycle: packageCycle,
          totalClasses: totalClasses,
          completedClasses: totalClasses,
          completedAt: new Date(),
        });
        lead.currentPackageCycle = packageCycle + 1;
        lead.completedClasses = 0;
        lead.packageStatus = "active";
        await lead.save({ validateBeforeSave: false });
      }
    }

    const activeCycle = lead.currentPackageCycle || 1;
    const activeTotal = lead.totalClasses || 12;

    const currentCompletedInActiveCycle = await Attendance.countDocuments({
      parentEnquiryId,
      packageCycle: activeCycle,
      status: "Done",
    });

    const sessionNumber = currentCompletedInActiveCycle + 1;

    // Create the Attendance entry
    const attendance = new Attendance({
      parentEnquiryId,
      studentName: lead.wards?.map(w => w.studentName).join(", ") || "Unknown Student",
      requirementId: lead.requirementId || "REQ-N/A",
      tutorId,
      tutorName: tutor.name,
      packageCycle: activeCycle,
      sessionNumber,
      status,
      topicsCovered: status === "Done" ? topicsCovered : "",
      missedReason: status === "Missed" ? missedReason : "",
      customReason: status === "Missed" && missedReason === "Other" ? customReason : "",
      date,
    });

    await attendance.save();

    // Recalculate Completed Classes count for active cycle
    const newCompletedCount = await Attendance.countDocuments({
      parentEnquiryId,
      packageCycle: activeCycle,
      status: "Done",
    });

    // Check if this attendance completion finishes the active cycle
    let cycleCompletedNotice = "";
    if (newCompletedCount >= activeTotal) {
      if (!lead.packageHistory) lead.packageHistory = [];
      lead.packageHistory.push({
        cycle: activeCycle,
        totalClasses: activeTotal,
        completedClasses: activeTotal,
        completedAt: new Date(),
      });
      lead.currentPackageCycle = activeCycle + 1;
      lead.completedClasses = 0;
      lead.packageStatus = "active";
      cycleCompletedNotice = ` Package Cycle ${activeCycle} is now completed! Automatically starting Cycle ${activeCycle + 1} (Class 1) for next month/period.`;
    } else {
      lead.completedClasses = newCompletedCount;
      lead.packageStatus = "active";
    }

    await lead.save({ validateBeforeSave: false });

    // Sync to Odoo crm.lead asynchronously
    if (lead.odooLeadId) {
      try {
        const remaining = Math.max(0, activeTotal - lead.completedClasses);
        await updateLead(lead.odooLeadId, {
          x_studio_completed_classes: lead.completedClasses,
          x_studio_total_classes: activeTotal,
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
      message: `Attendance recorded successfully.${cycleCompletedNotice}`,
      session: {
        sessionNumber,
        status: attendance.status,
        date: attendance.date,
      },
      package: {
        totalClasses: updatedCard.totalClasses,
        completedClasses: updatedCard.completedClasses,
        remainingClasses: updatedCard.remainingClasses,
        packageCycle: updatedCard.currentPackageCycle,
        status: updatedCard.packageStatus,
      },
      attendance,
      updatedStudentCard: updatedCard,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({ message: error.message });
  }
});

// =============================================================
// GET: Comprehensive Attendance History (all cycles)
// =============================================================
router.get("/history/:parentEnquiryId", async (req, res) => {
  try {
    const { parentEnquiryId } = req.params;
    const lead = await ParentEnquiry.findById(parentEnquiryId);
    if (!lead) return res.status(404).json({ message: "Student enquiry not found." });

    const logs = await Attendance.find({ parentEnquiryId }).sort({ timestamp: 1 });

    // Group logs by package cycle
    const cyclesMap = {};
    logs.forEach(log => {
      const cycleNum = log.packageCycle || 1;
      if (!cyclesMap[cycleNum]) {
        cyclesMap[cycleNum] = {
          cycle: cycleNum,
          logs: [],
          doneCount: 0,
          missedCount: 0,
          startDate: log.date,
          endDate: log.date,
        };
      }
      cyclesMap[cycleNum].logs.push(log);
      if (log.status === "Done") cyclesMap[cycleNum].doneCount++;
      if (log.status === "Missed") cyclesMap[cycleNum].missedCount++;
      cyclesMap[cycleNum].endDate = log.date;
    });

    const cycles = Object.values(cyclesMap);

    res.json({
      success: true,
      currentCycle: lead.currentPackageCycle || 1,
      totalClassesPerCycle: lead.totalClasses || 12,
      packageHistory: lead.packageHistory || [],
      cycles,
      allLogs: logs,
    });
  } catch (error) {
    console.error("Fetch history error:", error);
    res.status(500).json({ message: error.message });
  }
});

// =============================================================
// GET: Download CSV Attendance History
// =============================================================
router.get("/download-history/:parentEnquiryId", async (req, res) => {
  try {
    const { parentEnquiryId } = req.params;
    const cycleFilter = req.query.cycle; // 'all' or specific cycle number

    const lead = await ParentEnquiry.findById(parentEnquiryId);
    if (!lead) return res.status(404).json({ message: "Student enquiry not found." });

    const query = { parentEnquiryId };
    if (cycleFilter && cycleFilter !== "all" && !isNaN(Number(cycleFilter))) {
      query.packageCycle = Number(cycleFilter);
    }

    const logs = await Attendance.find(query).sort({ packageCycle: 1, sessionNumber: 1, timestamp: 1 });

    const studentName = lead.wards?.map(w => w.studentName).join(", ") || "Student";
    const reqId = lead.requirementId || "REQ";

    let csvContent = "Cycle,Class #,Date,Status,Student Name,Tutor Name,Requirement ID,Topics Covered / Reason\n";

    logs.forEach(log => {
      const cycleStr = `Cycle ${log.packageCycle || 1}`;
      const sessionStr = log.sessionNumber || 1;
      const dateStr = log.date || "";
      const statusStr = log.status || "";
      const sName = `"${(log.studentName || studentName).replace(/"/g, '""')}"`;
      const tName = `"${(log.tutorName || lead.assignedTutor || "").replace(/"/g, '""')}"`;
      const rId = `"${(log.requirementId || reqId).replace(/"/g, '""')}"`;
      
      let noteStr = "";
      if (log.status === "Done") {
        noteStr = log.topicsCovered || "";
      } else {
        noteStr = log.missedReason === "Other" ? (log.customReason || "Other") : (log.missedReason || "Missed");
      }
      noteStr = `"${noteStr.replace(/"/g, '""')}"`;

      csvContent += `${cycleStr},${sessionStr},${dateStr},${statusStr},${sName},${tName},${rId},${noteStr}\n`;
    });

    const filename = `Attendance_History_${reqId}_${cycleFilter ? `cycle_${cycleFilter}` : 'all'}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Download history error:", error);
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
// PUT: Update tuition details / Start New Package Cycle (Admin only)
// =============================================================
router.put("/update-tuition/:id", verifyToken(["admin"]), async (req, res) => {
  try {
    const { classDuration, totalClasses, classSchedule, completedClasses, startNewCycle } = req.body;
    const lead = await ParentEnquiry.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Student enquiry not found." });

    if (startNewCycle) {
      // Archive current cycle into packageHistory
      if (!lead.packageHistory) lead.packageHistory = [];
      lead.packageHistory.push({
        cycle: lead.currentPackageCycle || 1,
        totalClasses: lead.totalClasses || 12,
        completedClasses: lead.completedClasses || 0,
        completedAt: new Date(),
      });

      // Increment cycle, reset active counter to 0 (all DB attendance records from previous cycle remain untouched!)
      lead.currentPackageCycle = (lead.currentPackageCycle || 1) + 1;
      lead.completedClasses = 0;
      lead.packageStatus = "active";
      if (totalClasses !== undefined && totalClasses > 0) {
        lead.totalClasses = totalClasses;
      }
      if (classDuration !== undefined) lead.classDuration = classDuration;
      if (classSchedule !== undefined) lead.classSchedule = classSchedule;
    } else {
      if (classDuration !== undefined) lead.classDuration = classDuration;
      if (totalClasses !== undefined && totalClasses > 0) lead.totalClasses = totalClasses;
      if (classSchedule !== undefined) lead.classSchedule = classSchedule;
      if (completedClasses !== undefined) {
        lead.completedClasses = completedClasses;
        lead.packageStatus = completedClasses >= (lead.totalClasses || 12) ? "completed" : "active";
      }
    }

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
    const logCycle = log.packageCycle || 1;
    await Attendance.findByIdAndDelete(req.params.logId);

    // Recalculate Completed Classes count
    const lead = await ParentEnquiry.findById(parentEnquiryId);
    if (lead) {
      const activeCycle = lead.currentPackageCycle || 1;
      if (logCycle === activeCycle) {
        const completedCount = await Attendance.countDocuments({
          parentEnquiryId,
          packageCycle: activeCycle,
          status: "Done",
        });
        lead.completedClasses = Math.min(lead.totalClasses || 12, completedCount);
        lead.packageStatus = lead.completedClasses >= (lead.totalClasses || 12) ? "completed" : "active";
        await lead.save({ validateBeforeSave: false });

        if (lead.odooLeadId) {
          try {
            const remaining = Math.max(0, (lead.totalClasses || 12) - lead.completedClasses);
            await updateLead(lead.odooLeadId, {
              x_studio_completed_classes: lead.completedClasses,
              x_studio_total_classes: lead.totalClasses || 12,
              x_studio_remaining_classes: remaining,
            });
          } catch (odooErr) {
            console.error("[Odoo Sync Error after delete log]:", odooErr.message);
          }
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

    // Recalculate Completed Classes count for parent lead if in active cycle
    const parentEnquiryId = log.parentEnquiryId;
    const lead = await ParentEnquiry.findById(parentEnquiryId);
    if (lead) {
      const activeCycle = lead.currentPackageCycle || 1;
      const logCycle = log.packageCycle || 1;
      if (logCycle === activeCycle) {
        const completedCount = await Attendance.countDocuments({
          parentEnquiryId,
          packageCycle: activeCycle,
          status: "Done",
        });
        lead.completedClasses = Math.min(lead.totalClasses || 12, completedCount);
        lead.packageStatus = lead.completedClasses >= (lead.totalClasses || 12) ? "completed" : "active";
        await lead.save({ validateBeforeSave: false });

        if (lead.odooLeadId) {
          try {
            const remaining = Math.max(0, (lead.totalClasses || 12) - lead.completedClasses);
            await updateLead(lead.odooLeadId, {
              x_studio_completed_classes: lead.completedClasses,
              x_studio_total_classes: lead.totalClasses || 12,
              x_studio_remaining_classes: remaining,
              x_studio_last_attendance_status: status,
            });
          } catch (odooErr) {
            console.error("[Odoo Sync Error after update log]:", odooErr.message);
          }
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

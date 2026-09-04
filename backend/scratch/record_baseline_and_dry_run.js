import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import ParentEnquiry from "../models/ParentEnquiry.js";
import Attendance from "../models/Attendance.js";
import Tutor from "../models/Tutor.js";

async function runBaselineAndDryRun() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for Baseline & Dry-Run Analysis");

  // 1. Record Baseline Counts
  const totalAttendance = await Attendance.countDocuments();
  const totalParentEnquiries = await ParentEnquiry.countDocuments();
  const totalTutors = await Tutor.countDocuments();

  console.log("\n==================================================");
  console.log("BASELINE DATABASE METRICS (PRE-CHANGE)");
  console.log("==================================================");
  console.log(`Total Attendance Records:     ${totalAttendance}`);
  console.log(`Total Parent Enquiry Records: ${totalParentEnquiries}`);
  console.log(`Total Tutor Records:          ${totalTutors}`);

  // 2. Inspect All Records with Missing packageCycle
  const rawAttendanceCol = mongoose.connection.db.collection("attendances");
  const missingCycleDocs = await rawAttendanceCol.find({
    $or: [
      { packageCycle: { $exists: false } },
      { packageCycle: null }
    ]
  }).sort({ parentEnquiryId: 1, date: 1 }).toArray();

  console.log("\n==================================================");
  console.log(`DRY-RUN ANALYSIS: ${missingCycleDocs.length} RECORDS WITH MISSING packageCycle`);
  console.log("==================================================");

  // Group missing records by parentEnquiryId
  const byLead = {};
  for (const doc of missingCycleDocs) {
    const leadId = doc.parentEnquiryId?.toString() || "UNKNOWN";
    if (!byLead[leadId]) byLead[leadId] = [];
    byLead[leadId].push(doc);
  }

  const analysisReport = [];

  for (const [leadId, logs] of Object.entries(byLead)) {
    const lead = await ParentEnquiry.findById(leadId);
    if (!lead) {
      analysisReport.push({
        leadId,
        parentName: "NOT_FOUND",
        missingCount: logs.length,
        recommendation: "CANNOT_DETERMINE - LEAVE INTACT",
        reason: "Parent lead document does not exist"
      });
      continue;
    }

    // Inspect all logs for this lead (both with and without cycle)
    const allLeadLogs = await rawAttendanceCol.find({ parentEnquiryId: lead._id }).sort({ date: 1, _id: 1 }).toArray();
    const cycle1ExplicitLogs = allLeadLogs.filter(l => l.packageCycle === 1);
    const cycle2Logs = allLeadLogs.filter(l => l.packageCycle === 2);
    const cycle3Logs = allLeadLogs.filter(l => l.packageCycle === 3);

    // Look at date boundaries
    const missingDates = logs.map(l => l.date);
    const firstMissingDate = missingDates[0];
    const lastMissingDate = missingDates[missingDates.length - 1];

    // Determine confidence
    let confidence = "HIGH";
    let proposedCycle = 1;
    let reason = "";

    if (lead.currentPackageCycle === 1 && !lead.packageHistory?.length) {
      // Lead is still in Cycle 1, and no past cycles exist
      confidence = "HIGH";
      proposedCycle = 1;
      reason = `Lead is in Cycle 1 with no packageHistory. All ${logs.length} missing logs predate or align with Cycle 1.`;
    } else if (lead.currentPackageCycle > 1) {
      // Lead has moved to Cycle 2 or 3
      // Check if missing dates predate Cycle 2 dates
      const firstCycle2Date = cycle2Logs.length > 0 ? cycle2Logs[0].date : null;
      if (firstCycle2Date && lastMissingDate <= firstCycle2Date) {
        confidence = "HIGH";
        proposedCycle = 1;
        reason = `Missing logs (${firstMissingDate} to ${lastMissingDate}) all predate Cycle 2 start (${firstCycle2Date}). Corresponds to Cycle 1.`;
      } else {
        confidence = "MEDIUM";
        proposedCycle = 1;
        reason = `Lead is in Cycle ${lead.currentPackageCycle}. Missing logs span ${firstMissingDate} to ${lastMissingDate}.`;
      }
    }

    analysisReport.push({
      leadId: lead._id.toString(),
      parentName: lead.parentName,
      phone: lead.phone,
      requirementId: lead.requirementId || "REQ-N/A",
      leadCurrentCycle: lead.currentPackageCycle || 1,
      totalClasses: lead.totalClasses,
      packageHistoryCount: lead.packageHistory?.length || 0,
      missingLogsCount: logs.length,
      dateRange: `${firstMissingDate} to ${lastMissingDate}`,
      proposedCycle,
      confidence,
      reason
    });
  }

  console.log("\nSummary of Missing Cycle Analysis by Parent:");
  for (const item of analysisReport) {
    console.log(`- Parent: ${item.parentName} (${item.phone}) | Req: ${item.requirementId}`);
    console.log(`  Missing logs: ${item.missingLogsCount} (dates: ${item.dateRange})`);
    console.log(`  Lead current cycle: ${item.leadCurrentCycle}, History entries: ${item.packageHistoryCount}`);
    console.log(`  Confidence: ${item.confidence} -> Proposed Cycle: ${item.proposedCycle} (${item.reason})\n`);
  }

  console.log("==================================================");
  console.log("DRY RUN CONCLUSION:");
  console.log("1. Zero records were modified during this dry run.");
  console.log("2. Code will defensively query both packageCycle: 1 and missing packageCycle dynamically.");
  console.log("3. Existing data remains 100% untouched.");
  console.log("==================================================\n");

  await mongoose.disconnect();
}

runBaselineAndDryRun().catch(console.error);

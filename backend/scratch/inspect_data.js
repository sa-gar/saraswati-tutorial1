import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI);

  const ParentEnquiry = mongoose.model("ParentEnquiry", new mongoose.Schema({}, { strict: false }));
  const Attendance = mongoose.model("Attendance", new mongoose.Schema({}, { strict: false }));
  const Tutor = mongoose.model("Tutor", new mongoose.Schema({}, { strict: false }));

  const attendanceCount = await Attendance.countDocuments();
  console.log("Total Attendance records in DB:", attendanceCount);

  const attendances = await Attendance.find().sort({ createdAt: -1 });
  console.log(`\nALL ${attendances.length} Attendance records:`);
  for (const a of attendances) {
    console.log({
      id: a._id.toString(),
      parentEnquiryId: a.parentEnquiryId?.toString(),
      requirementId: a.requirementId,
      studentName: a.studentName,
      tutorName: a.tutorName,
      tutorId: a.tutorId?.toString(),
      packageCycle: a.packageCycle,
      sessionNumber: a.sessionNumber,
      status: a.status,
      date: a.date,
      topicsCovered: a.topicsCovered,
      missedReason: a.missedReason,
      createdAt: a.createdAt
    });
  }

  // Get unique parentEnquiryIds from attendance
  const peIds = [...new Set(attendances.map(a => a.parentEnquiryId?.toString()).filter(Boolean))];
  console.log("\nUnique ParentEnquiry IDs with attendance:", peIds);

  for (const peId of peIds) {
    const lead = await ParentEnquiry.findById(peId);
    console.log("\n--- ParentEnquiry with attendance ---");
    if (lead) {
      console.log({
        _id: lead._id.toString(),
        parentName: lead.parentName,
        phone: lead.phone,
        requirementId: lead.requirementId,
        wards: lead.wards,
        assignedTutor: lead.assignedTutor,
        assignedTutorId: lead.assignedTutorId?.toString(),
        totalClasses: lead.totalClasses,
        completedClasses: lead.completedClasses,
        currentPackageCycle: lead.currentPackageCycle,
        packageStatus: lead.packageStatus,
        packageHistory: lead.packageHistory,
        classSchedule: lead.classSchedule,
        classDuration: lead.classDuration,
        status: lead.status
      });
    } else {
      console.log("Lead not found for ID:", peId);
    }
  }

  // Also check other leads with assignedTutor
  const assignedLeads = await ParentEnquiry.find({
    assignedTutor: { $exists: true, $nin: ["", null] }
  });
  console.log("\nAll leads with assignedTutor (total: " + assignedLeads.length + "):");
  assignedLeads.forEach(l => {
    console.log({
      _id: l._id.toString(),
      parentName: l.parentName,
      phone: l.phone,
      requirementId: l.requirementId,
      assignedTutor: l.assignedTutor,
      assignedTutorId: l.assignedTutorId?.toString(),
      studentName: l.wards?.map(w => w.studentName).join(", "),
      totalClasses: l.totalClasses,
      completedClasses: l.completedClasses,
      cycle: l.currentPackageCycle,
      status: l.status
    });
  });

  await mongoose.disconnect();
}
inspect().catch(console.error);

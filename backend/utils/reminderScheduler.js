import ParentEnquiry from "../models/ParentEnquiry.js";
import Tutor from "../models/Tutor.js";
import { sendWhatsAppToTutor } from "./whatsappService.js";

// Helper to parse time strings (e.g. "19:00", "7:00 PM") to minutes since midnight
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  
  // Format: "19:00"
  let match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    return parseInt(match[1]) * 60 + parseInt(match[2]);
  }
  
  // Format: "7:00 PM"
  match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  
  return null;
}

// Fallback email sender (logs to console/logs as fallback)
async function sendEmailReminder(tutor, lead) {
  const teacherName = tutor.name || "Teacher";
  const recipient = tutor.email || "no-email@saraswatitutorial.com";
  
  console.log(`[Email Fallback] Dispatching email reminder to ${recipient} for tutor ${teacherName}`);
  console.log(`Subject: Saraswati Tutorials Attendance Reminder`);
  console.log(`Body: Hello ${teacherName}, Your scheduled class has ended. Please update today's attendance in the portal.`);
  return true;
}

export async function checkAndSendAttendanceReminders() {
  try {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const shortDaysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    const now = new Date();
    const todayIndex = now.getDay();
    const todayName = daysOfWeek[todayIndex];
    const todayShortName = shortDaysOfWeek[todayIndex];
    
    // YYYY-MM-DD
    const todayDateStr = now.toISOString().split("T")[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Fetch active enquiries with assigned tutors
    const enquiries = await ParentEnquiry.find({
      status: { $in: ["Enrolled", "Won", "Demo Scheduled"] },
      assignedTutorId: { $ne: null },
      lastReminderSentDate: { $ne: todayDateStr },
    });

    for (const lead of enquiries) {
      // 1. Verify if today is a scheduled day
      const preferredDays = Array.isArray(lead.preferredDays) ? lead.preferredDays : [];
      const scheduleString = String(lead.classSchedule || "").toLowerCase();
      
      const isTodayScheduled = 
        preferredDays.some(d => String(d).toLowerCase() === todayName.toLowerCase() || String(d).toLowerCase() === todayShortName.toLowerCase()) ||
        scheduleString.includes(todayName.toLowerCase()) || 
        scheduleString.includes(todayShortName.toLowerCase());

      if (!isTodayScheduled) continue;

      // 2. Parse class end time
      let classEndTime = lead.endTime || "";
      if (!classEndTime && lead.classSchedule) {
        // Try parsing from classSchedule string (e.g. "Mon, Wed, Fri @ 5 PM - 7 PM" or "5:00 PM - 7:00 PM")
        const timePartMatch = lead.classSchedule.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?\s*-\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
        if (timePartMatch) {
          classEndTime = `${timePartMatch[4]}:${timePartMatch[5] || "00"} ${timePartMatch[6]}`;
        }
      }

      if (!classEndTime) continue;

      const endTimeMinutes = parseTimeToMinutes(classEndTime);
      if (endTimeMinutes === null) continue;

      // Check if current time is exactly 15 to 25 minutes after the class ended
      if (currentMinutes >= endTimeMinutes + 15 && currentMinutes <= endTimeMinutes + 25) {
        const tutor = await Tutor.findById(lead.assignedTutorId);
        if (!tutor) continue;

        const teacherName = tutor.name || "Teacher";
        const phoneNumber = tutor.whatsapp || tutor.phone || "";
        const messageBody = `Hello ${teacherName}\n\nYour scheduled class has ended.\n\nPlease update today's attendance in the Saraswati Tutorials Teacher Portal.\n\nThank you.`;

        console.log(`[Reminder System] Triggering attendance reminder for ${teacherName} (Lead ID: ${lead._id})`);
        
        let sentSuccessfully = false;

        // Try WhatsApp primary
        if (phoneNumber) {
          try {
            const result = await sendWhatsAppToTutor({
              phoneNumber,
              messageBody,
              templateVars: { tutor_name: teacherName },
            });
            sentSuccessfully = result.success;
            if (!sentSuccessfully) {
              console.warn(`[Reminder System] WhatsApp dispatch failed: ${result.failureReason}`);
            }
          } catch (wsErr) {
            console.error(`[Reminder System] WhatsApp error:`, wsErr.message);
          }
        }

        // Fallback to Email if WhatsApp failed
        if (!sentSuccessfully) {
          console.log(`[Reminder System] WhatsApp delivery failed or unavailable. Falling back to Email.`);
          await sendEmailReminder(tutor, lead);
        }

        // Log execution to prevent duplicate notifications
        lead.lastReminderSentDate = todayDateStr;
        await lead.save({ validateBeforeSave: false });
      }
    }
  } catch (err) {
    console.error(`[Reminder System Error]:`, err.message);
  }
}

// Start Background Interval (runs every 60 seconds)
export function startReminderScheduler() {
  console.log(`[Reminder System] Starting automated attendance check daemon...`);
  setInterval(() => {
    checkAndSendAttendanceReminders();
  }, 60 * 1000);
}

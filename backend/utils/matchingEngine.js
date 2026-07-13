export function getTutorGradeOptions(parentGrade) {
  const g = String(parentGrade || "").toLowerCase().trim();
  const options = [];
  
  if (!g) return options;
  
  // Extract number from grade string if possible
  const numMatch = g.match(/\d+/);
  if (numMatch) {
    const num = parseInt(numMatch[0]);
    if (num >= 1 && num <= 5) options.push("Class 1-5 (Primary)");
    if (num >= 6 && num <= 8) options.push("Class 6-8 (Middle)");
    if (num >= 9 && num <= 10) options.push("Class 9-10 (Secondary)");
    if (num >= 11 && num <= 12) options.push("Class 11-12 (Senior Secondary)");
  } else {
    // String matching fallback
    if (g.includes("primary") || g.includes("nursery") || g.includes("kg") || g.includes("lkg") || g.includes("ukg")) {
      options.push("Class 1-5 (Primary)");
    }
    if (g.includes("middle")) {
      options.push("Class 6-8 (Middle)");
    }
    if (g.includes("secondary") && !g.includes("senior")) {
      options.push("Class 9-10 (Secondary)");
    }
    if (g.includes("senior") || g.includes("puc") || g.includes("college") || g.includes("high school")) {
      options.push("Class 11-12 (Senior Secondary)");
    }
  }
  return options;
}

export function buildCentralizedQuery(params) {
  const { pincode, area, city, grade, timing, gender } = params;
  
  const andConditions = [
    // Only return approved/active tutors
    { status: "approved" }
  ];

  // 1. Location filter (OR list across different location fields)
  const locationConditions = [];
  if (pincode && String(pincode).trim()) {
    locationConditions.push({ pincode: String(pincode).trim() });
  }
  
  if (area && String(area).trim()) {
    const rawArea = String(area).trim();
    // Split area/address by comma to extract locality parts, ignoring broad region/state/country keywords
    const parts = rawArea
      .split(",")
      .map(p => p.trim())
      .filter(p => p && !/bangalore|bengaluru|karnataka|india|mumbai|maharashtra/i.test(p));
      
    if (parts.length > 0) {
      // Create a regex pattern that matches any of the parsed address parts
      const pattern = parts.map(p => escapeRegExp(p)).join("|");
      locationConditions.push({ area: { $regex: pattern, $options: "i" } });
      locationConditions.push({ locations: { $regex: pattern, $options: "i" } });
      locationConditions.push({ fullAddress: { $regex: pattern, $options: "i" } });
      locationConditions.push({ location: { $regex: pattern, $options: "i" } }); // Match legacy location field
    } else {
      locationConditions.push({ area: { $regex: rawArea, $options: "i" } });
      locationConditions.push({ locations: { $regex: rawArea, $options: "i" } });
      locationConditions.push({ fullAddress: { $regex: rawArea, $options: "i" } });
      locationConditions.push({ location: { $regex: rawArea, $options: "i" } });
    }
  }
  
  // Same City Match (Lowest Priority, only if no specific area/pincode matched or provided)
  if (city && String(city).trim() && !pincode && locationConditions.length === 0) {
    locationConditions.push({ city: { $regex: String(city).trim(), $options: "i" } });
  }
  
  if (locationConditions.length > 0) {
    andConditions.push({ $or: locationConditions });
  }

  // 2. Grade filter — match tutors who teach the required grade OR who have no grades set yet
  const targetGrades = getTutorGradeOptions(grade);
  if (targetGrades.length > 0) {
    andConditions.push({
      $or: [
        { grades: { $in: targetGrades } },         // Has matching grade
        { grades: { $size: 0 } },                  // Grades not filled yet (new registration)
        { grades: { $exists: false } }             // Legacy record without grades field
      ]
    });
  }

  // 3. Timing filter
  const timingConditions = [];
  let cleanTime = String(timing || "").toLowerCase();
  
  // Skip plan details (e.g. "3 Days • 2 Hr (ADVANCE)") unless they explicitly contain timing keywords
  if (cleanTime.includes("days •") || cleanTime.includes("hr (")) {
    const hasTimingKeywords = /morning|evening|afternoon|am|pm/i.test(cleanTime);
    if (!hasTimingKeywords) {
      cleanTime = ""; // Ignore this timing filter
    }
  }

  if (cleanTime.trim()) {
    if (cleanTime.includes("morning") || cleanTime.includes("am")) {
      timingConditions.push({ timings: { $regex: "morning|am|\\b(6|7|8|9|10|11)-(7|8|9|10|11|12)\\s*am\\b", $options: "i" } });
    }
    if (cleanTime.includes("evening") || cleanTime.includes("pm")) {
      timingConditions.push({ timings: { $regex: "evening|pm|\\b(4|5|6|7)-(5|6|7|8)\\s*pm\\b", $options: "i" } });
    }
    if (cleanTime.includes("afternoon")) {
      timingConditions.push({ timings: { $regex: "afternoon|12-1|1-2|2-3|3-4", $options: "i" } });
    }
    if (cleanTime.includes("weekday")) {
      timingConditions.push({ timings: { $regex: "weekday|mon|tue|wed|thu|fri", $options: "i" } });
    }
    if (cleanTime.includes("weekend")) {
      timingConditions.push({ timings: { $regex: "weekend|sat|sun", $options: "i" } });
    }

    if (timingConditions.length > 0) {
      andConditions.push({ $or: timingConditions });
    } else {
      andConditions.push({ timings: { $regex: cleanTime.trim(), $options: "i" } });
    }
  }

  // 4. Gender filter — match preferred gender OR tutors whose gender is not filled yet
  const genderPref = String(gender || "").trim();
  if (genderPref && !["flexible", "no preference", "both"].includes(genderPref.toLowerCase())) {
    andConditions.push({
      $or: [
        { gender: { $regex: `^${genderPref}$`, $options: "i" } },  // Exact gender match
        { gender: "" },                                               // Gender not filled yet
        { gender: { $exists: false } }                               // Legacy record
      ]
    });
  }

  return { $and: andConditions };
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

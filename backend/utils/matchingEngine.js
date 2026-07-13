export const GENERIC_WORDS = new Set([
  "road", "rd", "street", "st", "cross", "main", "layout", "lyt", "stage",
  "near", "opposite", "opp", "behind", "landmark", "area", "locality",
  "city", "district", "state", "nagar", "halli", "village", "town",
  "floor", "phase", "bengaluru", "bangalore", "karnataka", "india"
]);

/**
 * Standard Levenshtein distance algorithm to find edit distance between two strings
 */
export function getLevenshteinDistance(a, b) {
  const tmp = [];
  for (let i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = a[i - 1] === b[j - 1]
        ? tmp[i - 1][j - 1]
        : Math.min(tmp[i - 1][j] + 1, tmp[i][j - 1] + 1, tmp[i - 1][j - 1] + 1);
    }
  }
  return tmp[a.length][b.length];
}

/**
 * Normalize and clean a location string for robust comparisons
 */
export function cleanLocationString(str) {
  if (!str) return "";
  let s = String(str).toLowerCase().trim();
  // Standardize Bangalore/Bengaluru
  s = s.replace(/\bbangalore\b/g, "bengaluru");
  // Clean punctuation and replace with spaces
  s = s.replace(/[^a-z0-9\s]/g, " ");
  // Replace multiple spaces with a single space
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Intelligently checks if two location strings are fuzzy-similar or match.
 * Tolerates spelling errors, space variations (e.g. White Field vs Whitefield),
 * and matches non-generic tokens.
 */
export function areStringsFuzzySimilar(str1, str2) {
  const clean1 = cleanLocationString(str1);
  const clean2 = cleanLocationString(str2);
  if (!clean1 || !clean2) return false;
  
  if (clean1 === clean2) return true;
  
  // Exact match after removing all spaces (e.g. "white field" <=> "whitefield")
  const spaceLess1 = clean1.replace(/\s+/g, "");
  const spaceLess2 = clean2.replace(/\s+/g, "");
  if (spaceLess1 === spaceLess2) return true;
  
  // Substring check for non-generic words
  if (clean1.includes(clean2) || clean2.includes(clean1)) {
    const shorter = clean1.length < clean2.length ? clean1 : clean2;
    if (!GENERIC_WORDS.has(shorter) && shorter.length >= 4) {
      return true;
    }
  }

  // Token-by-token comparison
  const tokens1 = clean1.split(" ").filter(t => t && !GENERIC_WORDS.has(t));
  const tokens2 = clean2.split(" ").filter(t => t && !GENERIC_WORDS.has(t));
  
  for (const t1 of tokens1) {
    for (const t2 of tokens2) {
      if (t1 === t2) return true;
      // Match with spelling error tolerance on tokens
      if (t1.length >= 4 && t2.length >= 4) {
        const dist = getLevenshteinDistance(t1, t2);
        const maxLen = Math.max(t1.length, t2.length);
        if ((1 - dist / maxLen) >= 0.75) {
          return true;
        }
      }
    }
  }
  
  // Fallback to entire string Levenshtein distance similarity
  const dist = getLevenshteinDistance(clean1, clean2);
  const maxLen = Math.max(clean1.length, clean2.length);
  return (1 - dist / maxLen) >= 0.75;
}

/**
 * Parses a comma-separated address to extract state, city, area, pincode components
 */
export function parseAddress(address) {
  const result = {
    area: "",
    city: "",
    state: "",
    pincode: "",
    locality: "",
    landmark: ""
  };
  
  if (!address) return result;
  
  // Extract pincode (6 digits)
  const pinMatch = address.match(/\b\d{6}\b/);
  if (pinMatch) {
    result.pincode = pinMatch[0];
  }
  
  const parts = address.split(",").map(p => p.trim()).filter(Boolean);
  if (parts.length > 0) {
    // Clean pincode out of address parts
    let cleanParts = parts.map(p => p.replace(/\b\d{6}\b/g, "").trim()).filter(Boolean);
    
    if (cleanParts.length >= 1) {
      const last = cleanParts[cleanParts.length - 1];
      // Check if last part is state
      if (/karnataka|maharashtra|delhi|tamil nadu|telangana|ap|andhra/i.test(last)) {
        result.state = last;
        if (cleanParts.length >= 2) {
          result.city = cleanParts[cleanParts.length - 2];
        }
        if (cleanParts.length >= 3) {
          result.area = cleanParts[cleanParts.length - 3];
        }
        if (cleanParts.length >= 4) {
          result.locality = cleanParts[cleanParts.length - 4];
        }
      } else {
        // Last part is likely city
        result.city = last;
        if (cleanParts.length >= 2) {
          result.area = cleanParts[cleanParts.length - 2];
        }
        if (cleanParts.length >= 3) {
          result.locality = cleanParts[cleanParts.length - 3];
        }
        if (cleanParts.length >= 4) {
          result.landmark = cleanParts[cleanParts.length - 4];
        }
      }
    }
  }
  return result;
}

/**
 * Maps standard class grades to tutor registration categories
 */
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

/**
 * Checks if tutor timings overlap with parent timings schedule
 */
export function matchTiming(parentTiming, tutorTimings) {
  if (!parentTiming) return true;
  if (!Array.isArray(tutorTimings) || tutorTimings.length === 0) return false;
  
  let cleanTime = String(parentTiming).toLowerCase();
  
  // Skip plan details unless they contain timing keywords
  if (cleanTime.includes("days •") || cleanTime.includes("hr (")) {
    const hasTimingKeywords = /morning|evening|afternoon|am|pm/i.test(cleanTime);
    if (!hasTimingKeywords) {
      return true; // Ignore timing check, treat as match
    }
  }
  
  for (const tTime of tutorTimings) {
    const cleanTutorTime = String(tTime).toLowerCase();
    
    if (cleanTime.includes("morning") || cleanTime.includes("am")) {
      const regex = /morning|am|\b(6|7|8|9|10|11)-(7|8|9|10|11|12)\s*am\b/i;
      if (regex.test(cleanTutorTime)) return true;
    }
    if (cleanTime.includes("evening") || cleanTime.includes("pm")) {
      const regex = /evening|pm|\b(4|5|6|7)-(5|6|7|8)\s*pm\b/i;
      if (regex.test(cleanTutorTime)) return true;
    }
    if (cleanTime.includes("afternoon")) {
      const regex = /afternoon|12-1|1-2|2-3|3-4/i;
      if (regex.test(cleanTutorTime)) return true;
    }
    if (cleanTime.includes("weekday")) {
      const regex = /weekday|mon|tue|wed|thu|fri/i;
      if (regex.test(cleanTutorTime)) return true;
    }
    if (cleanTime.includes("weekend")) {
      const regex = /weekend|sat|sun/i;
      if (regex.test(cleanTutorTime)) return true;
    }
    if (cleanTutorTime.includes(cleanTime.trim())) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculates the location proximity score based on parent parameters and tutor location fields.
 * Ranking Priority:
 * 1. Exact Pincode + Exact Area = 100
 * 2. Exact Pincode + Similar Area = 80
 * 3. Same Area = 60
 * 4. Same Pincode (Diff Area) = 40
 * 5. Nearby Pincode (pincode difference <= 2) = 25
 * 6. Same City = 10
 */
export function calculateLocationProximityScore(params, tutor) {
  let hasPincode = !!(params.pincode && tutor.pincode);
  const pPin = hasPincode ? String(params.pincode).trim() : "";
  const tPin = hasPincode ? String(tutor.pincode).trim() : "";
  
  const isExactPincode = hasPincode && pPin === tPin;

  // Extract all tutor area fields
  const tutorAreas = [tutor.area, tutor.location, ...(tutor.locations || [])].filter(Boolean);
  const parentAreas = [params.area, params.locality, params.landmark].filter(Boolean);

  let isExactArea = false;
  let isSimilarArea = false;

  if (parentAreas.length > 0 && tutorAreas.length > 0) {
    // Check exact area match
    for (const pArea of parentAreas) {
      const cp = cleanLocationString(pArea);
      for (const tArea of tutorAreas) {
        const ct = cleanLocationString(tArea);
        if (cp && ct && cp === ct) {
          isExactArea = true;
          break;
        }
      }
      if (isExactArea) break;
    }

    // Check fuzzy area match if not exact
    if (!isExactArea) {
      for (const pArea of parentAreas) {
        for (const tArea of tutorAreas) {
          if (areStringsFuzzySimilar(pArea, tArea)) {
            isSimilarArea = true;
            break;
          }
        }
        if (isSimilarArea) break;
      }
    }
  }

  // Tier 1: Exact Pincode + Exact Area
  if (isExactPincode && isExactArea) {
    return 100;
  }

  // Tier 2: Exact Pincode + Similar Area
  if (isExactPincode && isSimilarArea) {
    return 80;
  }

  // Tier 3: Same Area (Regardless of pincode)
  if (isExactArea || isSimilarArea) {
    return 60;
  }

  // Tier 4: Same Pincode (Different Area)
  if (isExactPincode) {
    return 40;
  }

  // Tier 5: Nearby Pincode (difference <= 2)
  if (hasPincode) {
    const pPinNum = parseInt(pPin, 10);
    const tPinNum = parseInt(tPin, 10);
    if (!isNaN(pPinNum) && !isNaN(tPinNum) && Math.abs(pPinNum - tPinNum) <= 2) {
      return 25;
    }
  }

  // Tier 6: Same City
  if (params.city && tutor.city) {
    const cp = cleanLocationString(params.city);
    const ct = cleanLocationString(tutor.city);
    if (cp && ct && cp === ct) {
      return 10;
    }
  }

  return 0;
}

/**
 * Calculates a matching score and percentage for a tutor against parent requirements.
 * Recommends closest and most relevant tutors first.
 */
export function calculateTutorScore(params, tutor) {
  let score = 0;
  let maxPossibleScore = 0;
  
  // 1. Proximity Location Score (max 100)
  const proximityScore = calculateLocationProximityScore(params, tutor);
  score += proximityScore;
  
  const hasLocationCriteria = !!(
    params.pincode ||
    params.area ||
    params.locality ||
    params.landmark ||
    params.city
  );
  if (hasLocationCriteria) {
    maxPossibleScore += 100;
  }
  
  // 2. Correct Grade (Strict filter in database, +30 weight)
  let isGradeMatch = false;
  if (params.grade) {
    const targetGrades = getTutorGradeOptions(params.grade);
    if (targetGrades.length === 0) {
      isGradeMatch = true;
    } else {
      const hasMatchingGrade = Array.isArray(tutor.grades) && tutor.grades.some(g => targetGrades.includes(g));
      const isNewOrLegacy = !tutor.grades || tutor.grades.length === 0;
      if (hasMatchingGrade || isNewOrLegacy) {
        isGradeMatch = true;
      }
    }
  } else {
    isGradeMatch = true;
  }
  if (isGradeMatch) score += 30;
  if (params.grade) maxPossibleScore += 30;
  
  // 3. Correct Timing (+20 weight)
  let isTimingMatch = false;
  if (params.timing) {
    if (matchTiming(params.timing, tutor.timings || [])) {
      isTimingMatch = true;
    }
  } else {
    isTimingMatch = true;
  }
  if (isTimingMatch) score += 20;
  if (params.timing) maxPossibleScore += 20;
  
  // 4. Preferred Gender Match (Strict in DB, +15 weight)
  let isGenderMatch = false;
  if (params.gender) {
    const genderPref = String(params.gender).trim().toLowerCase();
    const tGender = String(tutor.gender || "").trim().toLowerCase();
    if (["flexible", "no preference", "both", ""].includes(genderPref)) {
      isGenderMatch = true;
    } else if (tGender === genderPref || tGender === "" || !tutor.gender) {
      isGenderMatch = true;
    }
  } else {
    isGenderMatch = true;
  }
  if (isGenderMatch) score += 15;
  if (params.gender) maxPossibleScore += 15;
  
  // 5. Tutor Availability (+10 weight)
  const isAvailable = tutor.availabilityStatus === "Available";
  if (isAvailable) score += 10;
  maxPossibleScore += 10;

  // Base fallback if no requirements were selected
  if (maxPossibleScore === 0) maxPossibleScore = 100;
  
  const percentage = Math.min(100, Math.round((score / maxPossibleScore) * 100));
  
  // Match Category label based on location score hierarchy
  let matchCategory = "Same City Match";
  if (proximityScore >= 80) {
    matchCategory = "Closest & Best Match";
  } else if (proximityScore >= 40) {
    matchCategory = "Closest Match";
  } else if (proximityScore >= 25) {
    matchCategory = "Nearby Match";
  } else if (proximityScore >= 10) {
    matchCategory = "Same City Match";
  } else {
    matchCategory = "Academic Match";
  }

  return {
    score,
    maxPossibleScore,
    percentage,
    locationScore: proximityScore,
    matchCategory
  };
}

/**
 * Builds standard MongoDB database filters.
 * Recommends tutors strictly capable of handling the selected Grade/Class,
 * and matching preferred Gender if requested specifically.
 */
export function buildCentralizedQuery(params) {
  const { grade, gender } = params;
  
  const andConditions = [
    { status: "approved" }
  ];

  // Grade filter (Strict)
  const targetGrades = getTutorGradeOptions(grade);
  if (targetGrades.length > 0) {
    andConditions.push({
      $or: [
        { grades: { $in: targetGrades } },
        { grades: { $size: 0 } },
        { grades: { $exists: false } }
      ]
    });
  }

  // Gender filter (Strict if requested specifically)
  const genderPref = String(gender || "").trim();
  if (genderPref && !["flexible", "no preference", "both", ""].includes(genderPref.toLowerCase())) {
    andConditions.push({
      $or: [
        { gender: { $regex: `^${genderPref}$`, $options: "i" } },
        { gender: "" },
        { gender: { $exists: false } }
      ]
    });
  }

  return { $and: andConditions };
}

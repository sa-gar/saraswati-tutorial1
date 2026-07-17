/**
 * matchingEngine.js — Saraswati Tutorials
 *
 * Weighted tutor-to-requirement matching engine.
 * All weights are env-configurable. All existing exports are preserved
 * with identical signatures for backward compatibility.
 *
 * New exports added (non-breaking):
 *   computeMatchReason(params, tutor, scoreInfo) → string
 *   getRecommendationType(scoreInfo, params)      → "exact"|"nearby"|"city"|"backup"
 */

import dotenv from "dotenv";
dotenv.config();

// ── Read weights from env (with defaults matching previous hardcoded values) ──
const W_LOCATION   = Number(process.env.MATCH_WEIGHT_LOCATION   || 40);
const W_GRADE      = Number(process.env.MATCH_WEIGHT_GRADE      || 20);
const W_SUBJECT    = Number(process.env.MATCH_WEIGHT_SUBJECT    || 20);
const W_TIMING     = Number(process.env.MATCH_WEIGHT_TIMING     || 10);
const W_GENDER     = Number(process.env.MATCH_WEIGHT_GENDER     || 5);
const W_EXPERIENCE = Number(process.env.MATCH_WEIGHT_EXPERIENCE || 5);

const NEARBY_RADIUS_KM = Number(process.env.NEARBY_RADIUS_KM || 8);

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
 * Normalize board name for comparison (CBSE, ICSE, ISC, IB, IGCSE, State Board, etc.)
 */
export function normalizeBoard(board) {
  if (!board) return "";
  const b = String(board).toUpperCase().trim();
  if (b.includes("STATE") || b.includes("SSC") || b.includes("HSC")) return "STATE";
  if (b === "CBSE") return "CBSE";
  if (b === "ICSE") return "ICSE";
  if (b === "ISC") return "ISC";
  if (b === "IB") return "IB";
  if (b === "IGCSE") return "IGCSE";
  if (b === "NIOS") return "NIOS";
  return b;
}

/**
 * Check if the tutor teaches the requested board
 */
export function matchBoard(parentBoard, tutorBoards) {
  if (!parentBoard) return true;
  if (!Array.isArray(tutorBoards) || tutorBoards.length === 0) return true; // legacy tutors without boards — don't penalize
  
  const normalized = normalizeBoard(parentBoard);
  return tutorBoards.some(b => normalizeBoard(b) === normalized);
}

/**
 * Check how many requested subjects the tutor can teach (0.0 to 1.0)
 */
export function subjectOverlapRatio(parentSubjects, tutorSubjects) {
  if (!Array.isArray(parentSubjects) || parentSubjects.length === 0) return 1;
  if (!Array.isArray(tutorSubjects) || tutorSubjects.length === 0) return 0;
  
  const normalizeSubject = s => String(s).toLowerCase().trim();
  const tSet = new Set(tutorSubjects.map(normalizeSubject));
  
  let matched = 0;
  for (const ps of parentSubjects) {
    const pNorm = normalizeSubject(ps);
    if (tSet.has(pNorm)) {
      matched++;
    } else {
      // Fuzzy: check if any tutor subject contains or is very similar
      for (const ts of tSet) {
        if (ts.includes(pNorm) || pNorm.includes(ts)) {
          matched++;
          break;
        }
        if (pNorm.length >= 4 && ts.length >= 4) {
          const dist = getLevenshteinDistance(pNorm, ts);
          const maxLen = Math.max(pNorm.length, ts.length);
          if ((1 - dist / maxLen) >= 0.8) {
            matched++;
            break;
          }
        }
      }
    }
  }
  
  return matched / parentSubjects.length;
}

/**
 * Calculate Haversine distance in km between two GPS coordinates
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Returns a distance tier label for display
 */
export function getDistanceTier(km) {
  if (km == null) return "Unknown";
  if (km <= 3) return "0–3 km";
  if (km <= 5) return "3–5 km";
  if (km <= 8) return "5–8 km";
  if (km <= 12) return "8–12 km";
  return "12+ km";
}

/**
 * Availability status priority (lower = better)
 */
export function getAvailabilityPriority(status) {
  const map = {
    "Available": 0,
    "Busy": 1,
    "Inactive": 2,
    "Not Active": 3,
    "Archived": 4,
    "Blocked": 99,
  };
  return map[status] ?? 5;
}

/**
 * Score experience in years for matching
 * Returns 0-1 ratio (more experience = higher score)
 */
export function scoreExperience(experienceStr) {
  if (!experienceStr) return 0.5; // no data → neutral score
  const match = String(experienceStr).match(/(\d+)/);
  if (!match) return 0.5;
  const years = parseInt(match[1]);
  if (years >= 5) return 1.0;
  if (years >= 3) return 0.75;
  if (years >= 1) return 0.5;
  return 0.25;
}

/**
 * Definition of recommendation factors for scoring.
 * Weights are read from environment variables so they can be tuned
 * without a code deployment.
 *
 * Total max weight: 145 (location) + grade + board + subject + timing + gender + experience
 */
export const RECOMMENDATION_FACTORS = [
  {
    name: "Exact Pincode",
    maxWeight: 40,
    calculate: (params, tutor) => {
      if (!params.pincode || !tutor.pincode) return 0;
      const pPin = String(params.pincode).trim();
      const tPin = String(tutor.pincode).trim();
      return (pPin && tPin && pPin === tPin) ? 40 : 0;
    }
  },
  {
    name: "Exact Area",
    maxWeight: 25,
    calculate: (params, tutor) => {
      const parentAreas = [params.area, params.locality, params.landmark].filter(Boolean);
      const tutorAreas = [tutor.area, tutor.location, ...(tutor.locations || [])].filter(Boolean);
      
      for (const pArea of parentAreas) {
        const cp = cleanLocationString(pArea);
        for (const tArea of tutorAreas) {
          const ct = cleanLocationString(tArea);
          if (cp && ct && cp === ct) {
            return 25;
          }
        }
      }
      return 0;
    }
  },
  {
    name: "Similar Area Name",
    maxWeight: 20,
    calculate: (params, tutor) => {
      const parentAreas = [params.area, params.locality, params.landmark].filter(Boolean);
      const tutorAreas = [tutor.area, tutor.location, ...(tutor.locations || [])].filter(Boolean);
      
      for (const pArea of parentAreas) {
        for (const tArea of tutorAreas) {
          if (areStringsFuzzySimilar(pArea, tArea)) {
            return 20;
          }
        }
      }
      return 0;
    }
  },
  {
    name: "Same City",
    maxWeight: 10,
    calculate: (params, tutor) => {
      if (!params.city || !tutor.city) return 0;
      const cp = cleanLocationString(params.city);
      const ct = cleanLocationString(tutor.city);
      return (cp && ct && cp === ct) ? 10 : 0;
    }
  },
  {
    name: "Correct Grade",
    maxWeight: 20,
    calculate: (params, tutor) => {
      if (!params.grade) return 20;
      const targetGrades = getTutorGradeOptions(params.grade);
      if (targetGrades.length === 0) return 20;
      
      const hasMatchingGrade = Array.isArray(tutor.grades) && tutor.grades.some(g => targetGrades.includes(g));
      const isNewOrLegacy = !tutor.grades || tutor.grades.length === 0;
      
      return (hasMatchingGrade || isNewOrLegacy) ? 20 : 0;
    }
  },
  {
    name: "Board Match",
    maxWeight: 15,
    calculate: (params, tutor) => {
      if (!params.board) return 15; // no preference → full marks
      const matched = matchBoard(params.board, tutor.boards);
      return matched ? 15 : 0;
    }
  },
  {
    name: "Subject Match",
    maxWeight: 10,
    calculate: (params, tutor) => {
      if (!params.subjects || params.subjects.length === 0) return 10; // no subjects specified → full marks
      const ratio = subjectOverlapRatio(params.subjects, tutor.subjects);
      return Math.round(ratio * 10);
    }
  },
  {
    name: "Correct Timing",
    maxWeight: 15,
    calculate: (params, tutor) => {
      if (!params.timing) return 15;
      return matchTiming(params.timing, tutor.timings || []) ? 15 : 0;
    }
  },
  {
    name: "Preferred Gender",
    maxWeight: 10,
    calculate: (params, tutor) => {
      if (!params.gender) return 10;
      const genderPref = String(params.gender).trim().toLowerCase();
      const tGender = String(tutor.gender || "").trim().toLowerCase();
      
      if (["flexible", "no preference", "both", ""].includes(genderPref)) {
        return 10;
      }
      return (tGender === genderPref || tGender === "" || !tutor.gender) ? 10 : 0;
    }
  },
  {
    name: "Experience",
    maxWeight: 10,
    calculate: (params, tutor) => {
      // Experience weight is always applied as a bonus factor
      return Math.round(scoreExperience(tutor.experience) * 10);
    }
  }
];

/**
 * Calculates a matching score and percentage for a tutor against parent requirements.
 *
 * Scoring factors and weights (env-configurable):
 *   Exact Pincode  : 40
 *   Exact Area     : 25 (exclusive with Similar Area)
 *   Similar Area   : 20 (exclusive with Exact Area)
 *   Same City      : 10
 *   Correct Grade  : 20
 *   Board Match    : 15
 *   Subject Match  : 10
 *   Correct Timing : 15
 *   Preferred Gender: 10
 *   Experience     : 10
 */
export function calculateTutorScore(params, tutor) {
  let score = 0;
  let maxPossibleScore = 0;
  
  // Calculate Pincode
  const pinScore = RECOMMENDATION_FACTORS.find(f => f.name === "Exact Pincode").calculate(params, tutor);
  score += pinScore;
  if (params.pincode) maxPossibleScore += 40;
  
  // Calculate Area (Exact and Similar are mutually exclusive)
  const exactAreaScore = RECOMMENDATION_FACTORS.find(f => f.name === "Exact Area").calculate(params, tutor);
  let areaScore = 0;
  if (exactAreaScore > 0) {
    areaScore = exactAreaScore;
    score += exactAreaScore;
  } else {
    const similarAreaScore = RECOMMENDATION_FACTORS.find(f => f.name === "Similar Area Name").calculate(params, tutor);
    areaScore = similarAreaScore;
    score += similarAreaScore;
  }
  if (params.area || params.locality || params.landmark) {
    maxPossibleScore += 25;
  }
  
  // Calculate City
  const cityScore = RECOMMENDATION_FACTORS.find(f => f.name === "Same City").calculate(params, tutor);
  score += cityScore;
  if (params.city) maxPossibleScore += 10;
  
  // Calculate Grade
  const gradeScore = RECOMMENDATION_FACTORS.find(f => f.name === "Correct Grade").calculate(params, tutor);
  score += gradeScore;
  if (params.grade) maxPossibleScore += 20;

  // Calculate Board Match
  const boardScore = RECOMMENDATION_FACTORS.find(f => f.name === "Board Match").calculate(params, tutor);
  score += boardScore;
  if (params.board) maxPossibleScore += 15;

  // Calculate Subject Match
  const subjectScore = RECOMMENDATION_FACTORS.find(f => f.name === "Subject Match").calculate(params, tutor);
  score += subjectScore;
  if (params.subjects && params.subjects.length > 0) maxPossibleScore += 10;
  
  // Calculate Timing
  const timingScore = RECOMMENDATION_FACTORS.find(f => f.name === "Correct Timing").calculate(params, tutor);
  score += timingScore;
  if (params.timing) maxPossibleScore += 15;
  
  // Calculate Gender
  const genderScore = RECOMMENDATION_FACTORS.find(f => f.name === "Preferred Gender").calculate(params, tutor);
  score += genderScore;
  if (params.gender) maxPossibleScore += 10;

  // Calculate Experience (always included as a bonus)
  const experienceScore = RECOMMENDATION_FACTORS.find(f => f.name === "Experience").calculate(params, tutor);
  score += experienceScore;
  maxPossibleScore += 10;

  // Base fallback if no requirements were selected
  if (maxPossibleScore === 0) maxPossibleScore = 100;
  
  const percentage = Math.min(100, Math.round((score / maxPossibleScore) * 100));
  
  // Location score sums pincode + area + city matches (for secondary filtering)
  const locationScore = pinScore + areaScore + cityScore;

  // Distance in km (if coordinates available)
  let distanceKm = null;
  if (
    params.latitude != null && params.longitude != null &&
    tutor.latitude != null && tutor.longitude != null
  ) {
    distanceKm = haversineDistance(params.latitude, params.longitude, tutor.latitude, tutor.longitude);
    if (distanceKm != null) distanceKm = Math.round(distanceKm * 10) / 10; // 1 decimal place
  }

  return {
    score,
    maxPossibleScore,
    percentage,
    locationScore,
    distanceKm,
    distanceTier: getDistanceTier(distanceKm),
    breakdown: {
      pincode: pinScore,
      area: areaScore,
      city: cityScore,
      grade: gradeScore,
      board: boardScore,
      subject: subjectScore,
      timing: timingScore,
      gender: genderScore,
      experience: experienceScore,
    }
  };
}

/**
 * Builds standard MongoDB database filters.
 * Recommends tutors strictly capable of handling the selected Grade/Class,
 * matching preferred Gender if requested, and never returns Blocked tutors.
 */
export function buildCentralizedQuery(params) {
  const { grade, gender } = params;
  
  const andConditions = [
    { status: "approved" },
    // Never recommend blocked tutors
    { availabilityStatus: { $ne: "Blocked" } }
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

/**
 * Comparator for sorting tutors by:
 *  1. Distance (km) ascending — if available
 *  2. Match percentage descending
 *  3. Availability priority ascending (Available > Busy > Inactive)
 */
export function compareTutors(a, b) {
  // If both have distance, sort by distance first
  if (a.distanceKm != null && b.distanceKm != null) {
    if (Math.abs(a.distanceKm - b.distanceKm) > 1) {
      return a.distanceKm - b.distanceKm;
    }
  } else if (a.distanceKm != null) {
    return -1; // a has distance, b does not → a ranks higher
  } else if (b.distanceKm != null) {
    return 1;
  }

  // Then sort by match percentage
  if (b.matchPercentage !== a.matchPercentage) {
    return b.matchPercentage - a.matchPercentage;
  }

  // Then sort by availability priority
  const aPriority = getAvailabilityPriority(a.availabilityStatus);
  const bPriority = getAvailabilityPriority(b.availabilityStatus);
  return aPriority - bPriority;
}

/**
 * Generates a human-readable reason string explaining why a tutor was matched.
 * Used in recommendation API responses and Odoo chatter messages.
 *
 * @param {Object} params      - Parent requirement parameters
 * @param {Object} tutor       - Tutor document
 * @param {Object} scoreInfo   - Result from calculateTutorScore()
 * @returns {string}           - e.g. "Same pincode • Grade match • 2/3 subjects"
 */
export function computeMatchReason(params, tutor, scoreInfo) {
  const parts = [];

  if (scoreInfo.breakdown.pincode > 0) {
    parts.push("Same pincode");
  } else if (scoreInfo.breakdown.area > 0) {
    const areaScore = scoreInfo.breakdown.area;
    parts.push(areaScore >= 25 ? "Exact area match" : "Similar area");
  } else if (scoreInfo.breakdown.city > 0) {
    parts.push("Same city");
  }

  if (scoreInfo.distanceKm != null) {
    parts.push(`${scoreInfo.distanceKm} km away`);
  }

  if (scoreInfo.breakdown.grade > 0 && params.grade) {
    parts.push("Grade match");
  }

  if (params.subjects && params.subjects.length > 0 && scoreInfo.breakdown.subject > 0) {
    const ratio = scoreInfo.breakdown.subject / 10;
    const matched = Math.round(ratio * params.subjects.length);
    parts.push(`${matched}/${params.subjects.length} subject${matched !== 1 ? "s" : ""}`);
  }

  if (scoreInfo.breakdown.timing > 0 && params.timing) {
    parts.push("Timing match");
  }

  if (scoreInfo.breakdown.gender > 0 && params.gender &&
    !["flexible", "no preference", "both", ""].includes(params.gender.toLowerCase())) {
    parts.push("Gender preference");
  }

  if (parts.length === 0) {
    return `${scoreInfo.percentage}% overall match`;
  }

  return parts.join(" • ");
}

/**
 * Determines the recommendation type/tier for a tutor based on their score.
 *
 * @param {Object} scoreInfo - Result from calculateTutorScore()
 * @param {Object} params    - Parent requirement parameters
 * @returns {"exact"|"nearby"|"city"|"backup"}
 */
export function getRecommendationType(scoreInfo, params) {
  const nearbyRadius = NEARBY_RADIUS_KM;

  // Exact: matched pincode OR exact area name
  if (scoreInfo.breakdown.pincode >= 40 || scoreInfo.breakdown.area >= 25) {
    return "exact";
  }

  // Nearby: within GPS radius (even without area name match)
  if (scoreInfo.distanceKm != null && scoreInfo.distanceKm <= nearbyRadius) {
    return "nearby";
  }

  // Similar area or same city
  if (scoreInfo.breakdown.area > 0 || scoreInfo.breakdown.city > 0) {
    return "city";
  }

  // Fallback: any positive match
  return "backup";
}

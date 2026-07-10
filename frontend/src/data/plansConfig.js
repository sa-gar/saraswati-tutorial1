// Centralized Pricing Config & Engine
export const CBSE_MASTER_PRICES = {
  "Grades 1–5": {
    "3_1.5": 6353,
    "3_2.0": 7277,
    "5_1.5": 8663,
    "5_2.0": 9240
  },
  "Grade 6": {
    "3_1.5": 7277,
    "3_2.0": 8432,
    "5_1.5": 8663,
    "5_2.0": 9240
  },
  "Grade 7": {
    "3_1.5": 7796,
    "3_2.0": 9009,
    "5_1.5": 9529,
    "5_2.0": 10395
  },
  "Grade 8": {
    "3_1.5": 8316,
    "3_2.0": 9818,
    "5_1.5": 10395,
    "5_2.0": 11550
  },
  "Grade 9": {
    "3_1.5": 9009,
    "3_2.0": 10626,
    "5_1.5": 11781,
    "5_2.0": 13629
  },
  "Grade 10": {
    "3_1.5": 9818,
    "3_2.0": 11781,
    "5_1.5": 12936,
    "5_2.0": 15015
  },
  "Grade 11": {
    "3_1.5": 10973,
    "3_2.0": 12936,
    "5_1.5": 14438,
    "5_2.0": 16748
  },
  "Grade 12": {
    "3_1.5": 12128,
    "3_2.0": 14438,
    "5_1.5": 16170,
    "5_2.0": 18480
  },
  "Degree": {
    "3_1.5": 13860,
    "3_2.0": 16170,
    "5_1.5": 18480,
    "5_2.0": 20790
  }
};

export const BOARD_MULTIPLIERS = {
  "CBSE": 1.00,
  "ICSE": 1.10,
  "ISC": 1.10,
  "IGCSE": 1.25,
  "IB": 1.40,
  "State Board": 0.95,
  "PUC": 0.95,
  "NIOS": 0.90
};

export const PLAN_MULTIPLIERS = {
  "foundation": 0.82, // 18% OFF
  "advance": 1.18     // 18% EXTRA
};

export const mapClassToGroup = (classGrade) => {
  // Strip "Grade " or "Grades " prefix and replace en-dash/em-dash with standard hyphen
  const cg = String(classGrade || "")
    .trim()
    .replace(/^Grades?\s+/, "")
    .replace(/[–—]/g, "-");

  if (cg === "1 to 5" || cg === "1-5") return "Grades 1–5";
  if (cg === "6") return "Grade 6";
  if (cg === "7") return "Grade 7";
  if (cg === "8") return "Grade 8";
  if (cg === "9") return "Grade 9";
  if (cg === "10") return "Grade 10";
  if (cg === "11") return "Grade 11";
  if (cg === "12") return "Grade 12";
  if (cg === "PUC") return "Grade 12";
  if (cg.toLowerCase().includes("degree")) return "Degree";
  return "Grades 1–5"; // fallback
};

export const mapBoardToMultiplier = (board) => {
  const b = String(board || "")
    .trim()
    .replace(/\s+/g, ""); // Remove spaces to match ICSE/ISC, StateBoard/PUC, etc.

  if (b.includes("CBSE")) return BOARD_MULTIPLIERS["CBSE"];
  if (b.includes("ICSE") || b.includes("ISC")) return BOARD_MULTIPLIERS["ICSE"];
  if (b.includes("IGCSE")) return BOARD_MULTIPLIERS["IGCSE"];
  if (b.includes("IB")) return BOARD_MULTIPLIERS["IB"];
  if (b.includes("StateBoard") || b.includes("PUC")) return BOARD_MULTIPLIERS["State Board"];
  if (b.includes("NIOS")) return BOARD_MULTIPLIERS["NIOS"];
  return 1.00; // fallback
};

export const CBSE_ELITE_HOURLY_RATES = {
  "Grades 1–5": 450,
  "Grade 6": 500,
  "Grade 7": 550,
  "Grade 8": 600,
  "Grade 9": 700,
  "Grade 10": 800,
  "Grade 11": 900,
  "Grade 12": 1000,
  "Degree": 1100
};

export const ELITE_BOARD_MULTIPLIERS = {
  "CBSE": 1.00,
  "ICSE": 1.10,
  "ISC": 1.10,
  "IGCSE": 1.20,
  "IB": 1.30,
  "State Board": 0.95,
  "PUC": 0.95,
  "NIOS": 0.90
};

export const calculateEliteHourlyPrice = (classGrade, curriculum) => {
  const group = mapClassToGroup(classGrade);
  const baseRate = CBSE_ELITE_HOURLY_RATES[group] || 450;

  const b = String(curriculum || "")
    .trim()
    .replace(/\s+/g, "");

  let multiplier = 1.00;
  if (b.includes("CBSE")) multiplier = ELITE_BOARD_MULTIPLIERS["CBSE"];
  else if (b.includes("ICSE") || b.includes("ISC")) multiplier = ELITE_BOARD_MULTIPLIERS["ICSE"];
  else if (b.includes("IGCSE")) multiplier = ELITE_BOARD_MULTIPLIERS["IGCSE"];
  else if (b.includes("IB")) multiplier = ELITE_BOARD_MULTIPLIERS["IB"];
  else if (b.includes("StateBoard") || b.includes("PUC")) multiplier = ELITE_BOARD_MULTIPLIERS["State Board"];
  else if (b.includes("NIOS")) multiplier = ELITE_BOARD_MULTIPLIERS["NIOS"];

  return Math.round(baseRate * multiplier);
};

export const calculateEliteMonthlyPrice = (classGrade, curriculum, days, hours) => {
  const hourlyRate = calculateEliteHourlyPrice(classGrade, curriculum);
  const hoursPerDay = parseFloat(hours || 1.5);
  const daysPerWeek = parseInt(days || 3);
  return Math.round(hourlyRate * hoursPerDay * daysPerWeek * 4);
};

export const calculatePrice = (planId, classGrade, curriculum, days, hours) => {
  if (planId === "elite") {
    return calculateEliteMonthlyPrice(classGrade, curriculum, days, hours);
  }

  const group = mapClassToGroup(classGrade);
  const basePrices = CBSE_MASTER_PRICES[group];
  if (!basePrices) return 0;

  // Format hours to match keys e.g. "3_1.5" or "5_2.0"
  const formattedHours = parseFloat(hours || 1.5).toFixed(1);
  const key = `${days || 3}_${formattedHours}`;
  
  const basePrice = basePrices[key] || basePrices["3_1.5"];
  const boardMult = mapBoardToMultiplier(curriculum);
  const planMult = PLAN_MULTIPLIERS[planId] || 1.00;

  return Math.round(basePrice * boardMult * planMult);
};

export const PLANS = [
  {
    id: "foundation",
    title: "Foundation Plan",
    theme: "silver",
    badge: "SAVE UP TO 18%",
    description: "",
    price: "₹6,353",
    gradient: "from-[#F8FAFC] to-[#CBD5E1]",
    textColor: "text-slate-800",
    badgeTheme: "bg-slate-900/10 text-slate-800 border-slate-900/20",
    keyBenefit: "Background Verified, Homework Support & Beginner-Friendly",
    cardBenefits: [
      "Background Verified Tutors",
      "Homework Support",
      "Beginner-Friendly Tutors"
    ],
    pricingOptions: [
      { days: 3, hours: 1.5, price: 6353 },
      { days: 3, hours: 2, price: 7277 },
      { days: 5, hours: 1.5, price: 8663 },
      { days: 5, hours: 2, price: 9240 }
    ],
    fullDetails: {
      pricing: [
        { label: "Starting price", value: "₹6,353 / month" },
        { label: "Rate per class", value: "₹350 - ₹450 / Class" },
        { label: "Savings aspect", value: "Save up to 18%" }
      ],
      benefits: [
        { title: "Background Verified Tutors" },
        { title: "Homework Support" },
        { title: "Beginner-Friendly Tutors" }
      ],
      features: [],
      faqs: [
        { q: "Can we change classes if we miss a session?", a: "Yes, rescheduling is permitted with a 24-hour notice to the tutor." },
        { q: "Who are the tutors for this plan?", a: "Vetted tutors and university graduates with 0–1 year of teaching experience who excel in explaining core academic concepts." },
        { q: "Is there a curriculum choice?", a: "Supports CBSE, ICSE, IGCSE, IB, NIOS and State Boards." }
      ],
      additionalInfo: "Minimum commitment of 1 month. Free initial coordinator consultation to assess student learning style."
    }
  },
  {
    id: "advance",
    title: "Advance Growth Plan",
    theme: "gold",
    badge: "Most Recommended",
    description: "",
    price: "₹9,130",
    gradient: "from-[#FFE082] via-[#F59E0B] to-[#D97706]",
    textColor: "text-slate-955",
    textDarkColor: "text-slate-955",
    badgeTheme: "bg-black/10 text-slate-950 border-black/20",
    keyBenefit: "Strategy, Monthly Tests, Guidance, Allocation & Support",
    cardBenefits: [
      "Academic Strategy & Deadlines",
      "Internal Test/Assignment — Monthly",
      "Consistent Guidance & Regular Practice",
      "Tutor Allocation (5–8 km)",
      "Tutor Replacement Within 5 Days"
    ],
    pricingOptions: [
      { days: 3, hours: 1.5, price: 9130 },
      { days: 3, hours: 2, price: 10460 },
      { days: 5, hours: 1.5, price: 12450 },
      { days: 5, hours: 2, price: 13280 }
    ],
    fullDetails: {
      pricing: [
        { label: "Starting price", value: "₹9,130 / month" },
        { label: "Rate per class", value: "₹500 - ₹600 / Class" },
        { label: "Investment diff", value: "Only +18% vs Base Plan" }
      ],
      benefits: [
        { title: "Academic Strategy & Deadlines" },
        { title: "Internal Test/Assignment — Monthly" },
        { title: "Consistent Guidance & Regular Practice" },
        { title: "Tutor Allocation (5–8 km)" },
        { title: "Tutor Replacement Within 5 Days" }
      ],
      features: [],
      faqs: [
        { q: "How are tutors selected for this plan?", a: "We match tutors with 3 to 10 years of teaching experience, specifically verified for secondary grades." },
        { q: "What if a student struggles with a specific topic?", a: "Tutors will modify the lesson plan to dedicate additional time for remedial teaching." },
        { q: "Are test reports shared?", a: "Yes, monthly test scores and conceptual gap analysis reports are shared with parents." }
      ],
      additionalInfo: "Custom study materials tailored to the student's weak areas are provided free of cost."
    }
  },
  {
    id: "elite",
    title: "Elite Mentor Plan",
    theme: "black",
    badge: "Best Choice",
    description: "",
    price: "₹10,000",
    gradient: "from-[#111827] to-[#000000]",
    textColor: "text-white",
    textDarkColor: "text-white",
    badgeTheme: "bg-white/10 text-white border-white/10",
    experience: "10+ Years",
    keyBenefit: "Priority Allocation, Result-Oriented Mentorship & Support",
    cardBenefits: [
      "Priority Tutor Allocation",
      "Clean Result-Oriented Learning",
      "Online Academic Doubt Support",
      "Bi-Weekly Test/Assignment",
      "Priority Tutor Replacement",
      "Attendance & Compensation Access"
    ],
    pricingOptions: [
      { days: 3, hours: 1, price: 10000 },
      { days: 3, hours: 1.5, price: 11500 },
      { days: 5, hours: 1, price: 13000 },
      { days: 5, hours: 1.5, price: 16000 }
    ],
    fullDetails: {
      pricing: [
        { label: "Starting price", value: "₹10,000 / month" },
        { label: "Rate per class", value: "₹650 - ₹800 / Class" },
        { label: "Tutor matching", value: "Veteran mentors only" }
      ],
      benefits: [
        { title: "Priority Tutor Allocation", desc: "Nearest tutor matching from parents' location" },
        { title: "Clean Result-Oriented Learning", desc: "Accuracy, strategy & exam-focused preparation" },
        { title: "Online Academic Doubt Support", desc: "WhatsApp doubt support with the same tutor" },
        { title: "Bi-Weekly Test/Assignment", desc: "Bi-weekly tests and performance tracking" },
        { title: "Priority Tutor Replacement", desc: "Replacement support within 24–48 hours" },
        { title: "Attendance & Compensation Access", desc: "Attendance tracking & missed class support" }
      ],
      features: [],
      faqs: [
        { q: "Who are the Elite Mentors?", a: "They are school coordinators, board examiners, and veteran teachers with 10+ years of teaching experience." },
        { q: "Is the schedule highly flexible?", a: "Yes, elite members receive priority slots, meaning schedules can be adjusted dynamically." },
        { q: "Can this plan cover advanced entrance prep?", a: "Yes, it includes guidance for advanced board preparation and foundational entrance concepts." }
      ],
      additionalInfo: "Includes a dedicated counselor for academic planning and stress management during exams."
    }
  }
];

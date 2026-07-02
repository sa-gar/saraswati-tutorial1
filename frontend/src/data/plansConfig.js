export const PLANS = [
  {
    id: "foundation",
    title: "Foundation Plan",
    theme: "silver",
    badge: "SAVE UP TO 25%",
    description: "Affordable and practice-focused plan designed for students seeking consistent academic support.",
    price: "₹8,100",
    gradient: "from-[#F8FAFC] to-[#CBD5E1]",
    textColor: "text-slate-800",
    textDarkColor: "text-slate-900",
    badgeTheme: "bg-slate-900/10 text-slate-800 border-slate-900/20",
    keyBenefit: "Daily homework support & consistent practice",
    cardBenefits: [
      "Daily Homework Support & Consistent Practice",
      "Tutor Experience: 1–3 Years"
    ],
    pricingOptions: [
      { days: 3, hours: 1.5, price: 8100 },
      { days: 3, hours: 2, price: 9500 },
      { days: 5, hours: 1.5, price: 10500 },
      { days: 5, hours: 2, price: 12100 }
    ],
    fullDetails: {
      pricing: [
        { label: "Starting price", value: "₹8,100 / month" },
        { label: "Rate per class", value: "₹450 - ₹550 / Class" },
        { label: "Savings aspect", value: "Save up to 25%" }
      ],
      benefits: [
        { title: "Consistent Guidance", desc: "Regular classes focusing on fundamental basics." },
        { title: "Homework Support", desc: "Assistance in managing daily school assignments." },
        { title: "Daily Practice", desc: "Fostering academic discipline through systematic schedules." },
        { title: "Tutor Experience", desc: "Tutors with 1–3 years of teaching experience." }
      ],
      features: [
        "Monthly syllabus alignment review",
        "Access to digital learning sheets & practice banks",
        "Basic monthly progress report for parents"
      ],
      faqs: [
        { q: "Can we change classes if we miss a session?", a: "Yes, rescheduling is permitted with a 24-hour notice to the tutor." },
        { q: "Who are the tutors for this plan?", a: "Vetted tutors and university graduates with 1–3 years of teaching experience who excel in explaining core academic concepts." },
        { q: "Is there a curriculum choice?", a: "Supports state boards, CBSE, and ICSE." }
      ],
      additionalInfo: "Minimum commitment of 1 month. Free initial coordinator consultation to assess student learning style."
    }
  },
  {
    id: "advance",
    title: "Advance Growth Plan",
    theme: "gold",
    badge: "Most Recommended",
    description: "Enhanced learning experience with experienced tutors, structured guidance and additional academic support.",
    price: "₹9,000",
    gradient: "from-[#FFD700] to-[#F59E0B]",
    textColor: "text-slate-955",
    textDarkColor: "text-slate-950",
    badgeTheme: "bg-black/10 text-slate-950 border-black/20",
    keyBenefit: "Experienced tutors with concept clarity focus",
    cardBenefits: [
      "Tutor Experience: 3–10 Years",
      "Customized School Syllabus Tracking"
    ],
    pricingOptions: [
      { days: 3, hours: 1.5, price: 9000 },
      { days: 3, hours: 2, price: 10500 },
      { days: 5, hours: 1.5, price: 12000 },
      { days: 5, hours: 2, price: 13500 }
    ],
    fullDetails: {
      pricing: [
        { label: "Starting price", value: "₹9,000 / month" },
        { label: "Rate per class", value: "₹550 - ₹650 / Class" },
        { label: "Investment diff", value: "Only +18% vs Foundation Plan" }
      ],
      benefits: [
        { title: "Tutor Verification", desc: "Thoroughly vetted and background-verified home tutors with 3–10 years experience." },
        { title: "Tutor Location", desc: "Assigned tutors located within a 5–8 km radius for highly reliable schedules." },
        { title: "24 Hours Doubt Support", desc: "Instant academic assistance and doubt solving available round the clock." },
        { title: "Tutor Replacement Support", desc: "Quick replacement guarantee if the tutor's style doesn't match student needs." }
      ],
      features: [
        "Practice & Revision Support",
        "Academic Tests",
        "Academic Planning & Strategy",
        "Performance Review Sessions"
      ],
      faqs: [
        { q: "How are tutors selected for this plan?", a: "We match tutors with 3 to 10 years of teaching experience, specifically verified for secondary grades." },
        { q: "What if a student struggles with a specific topic?", a: "Tutors will modify the lesson plan to dedicate additional time for remedial teaching." },
        { q: "Are test reports shared?", a: "Yes, bi-weekly test scores and conceptual gap analysis reports are shared with parents." }
      ],
      additionalInfo: "Custom study materials tailored to the student's weak areas are provided free of cost."
    }
  },
  {
    id: "elite",
    title: "Elite Mentor Plan",
    theme: "black",
    badge: "Best Choice",
    description: "Premium mentorship with highly experienced tutors and personalized academic guidance.",
    price: "₹10,000",
    gradient: "from-[#111827] to-[#000000]",
    textColor: "text-white",
    textDarkColor: "text-white",
    badgeTheme: "bg-white/10 text-white border-white/10",
    experience: "10+ Years",
    keyBenefit: "Veteran mentors with 10+ Years Experience",
    cardBenefits: [
      "Veteran School Teachers & Board Examiners",
      "Tutor Experience: 10+ Years",
      "Dedicated Academic Counselor & Advanced Test Series"
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
        { title: "Tutor Verification", desc: "Top-tier school teachers, board examiners, and veteran mentors with 10+ years experience." },
        { title: "Tutor Location", desc: "Premium local mentors mapped within a 1–3 km radius for prompt sessions." },
        { title: "24 Hours Doubt Support", desc: "Priority 24/7 dedicated support and direct feedback channels with coordinators." },
        { title: "Tutor Replacement Support", desc: "Instant coordinator-guided replacement to ensure uninterrupted exam prep." }
      ],
      features: [
        "Practice & Revision Support",
        "Academic Tests",
        "Academic Planning & Strategy",
        "Performance Review Sessions"
      ],
      faqs: [
        { q: "Who are the Elite Mentors?", a: "They are school coordinators, board examiners, and veteran teachers with 10+ years of teaching experience." },
        { q: "Is the schedule highly flexible?", a: "Yes, elite members receive priority slots, meaning schedules can be adjusted dynamically." },
        { q: "Can this plan cover advanced entrance prep?", a: "Yes, it includes guidance for advanced board preparation and foundational entrance concepts." }
      ],
      additionalInfo: "Includes a dedicated counselor for academic planning and stress management during exams."
    }
  }
];

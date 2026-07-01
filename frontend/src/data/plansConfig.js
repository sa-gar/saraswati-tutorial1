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
      "Vetted Entry-Level Tutors"
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
        { title: "Vetted Tutors", desc: "Entry-level tutors matching basic curriculum criteria." }
      ],
      features: [
        "Monthly syllabus alignment review",
        "Access to digital learning sheets & practice banks",
        "Basic monthly progress report for parents"
      ],
      faqs: [
        { q: "Can we change classes if we miss a session?", a: "Yes, rescheduling is permitted with a 24-hour notice to the tutor." },
        { q: "Who are the tutors for this plan?", a: "Vetted entry-level tutors and university graduates who excel in explaining core academic concepts." },
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
      "Experienced Tutors (3 to 9 Years Experience)",
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
        { title: "Concept Clarity focus", desc: "Custom learning guides addressing critical knowledge gaps." },
        { title: "Thorough Syllabus Tracking", desc: "Regular testing intervals matching board blueprints." },
        { title: "Flexible Timings", desc: "Schedule adjustments to align with student routines." },
        { title: "All Core Subjects", desc: "Tutoring support across mathematics, sciences, and languages." }
      ],
      features: [
        "Standardized performance tracking dashboard access",
        "Customized mock examinations by subject experts",
        "Parent-tutor-coordinator meeting every 4 weeks"
      ],
      faqs: [
        { q: "How are tutors selected for this plan?", a: "We match tutors with at least 3 to 9 years of teaching experience, specifically verified for secondary grades." },
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
    experience: "10 to 25 Years",
    keyBenefit: "Veteran mentors with 10 to 25 Years Experience",
    cardBenefits: [
      "Veteran School Teachers & Board Examiners",
      "10 to 25 Years Tutoring Experience",
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
        { title: "10 to 25 Years Experience", desc: "Learn from veteran school teachers and board examiners." },
        { title: "Priority Support", desc: "Immediate coordinator assistance and direct feedback channel." },
        { title: "Weekly Assessment", desc: "Custom testing mapped specifically to school benchmarks." },
        { title: "Parent-Tutor Meets", desc: "Monthly reviews detailing progress and curriculum tracking." }
      ],
      features: [
        "Monthly detailed parent-mentor-coordinator advisory call",
        "Advanced test series and prep material for board/competitive exams",
        "Dedicated mental preparation and time-management coaching sessions"
      ],
      faqs: [
        { q: "Who are the Elite Mentors?", a: "They are school coordinators, board examiners, and veteran teachers with over a decade of teaching experience." },
        { q: "Is the schedule highly flexible?", a: "Yes, elite members receive priority slots, meaning schedules can be adjusted dynamically." },
        { q: "Can this plan cover advanced entrance prep?", a: "Yes, it includes guidance for advanced board preparation and foundational entrance concepts." }
      ],
      additionalInfo: "Includes a dedicated counselor for academic planning and stress management during exams."
    }
  }
];

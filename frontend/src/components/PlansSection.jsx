import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sparkles,
  Zap,
  Star,
  Award,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Clock,
  BookOpen,
  ArrowRight,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { PLANS } from "../data/plansConfig";
import { trackEvent } from "../utils/analytics";

const TIMELINE_STEPS = [
  {
    number: "1",
    title: "Choose Your Plan",
    desc: "Select the plan that best suits your goals, style, and schedule."
  },
  {
    number: "2",
    title: "Get Matched With the Right Tutor",
    desc: "We match a tutor based on your grade, board, and learning needs."
  },
  {
    number: "3",
    title: "Start Personalized Learning",
    desc: "Begin 1-on-1 classes with a customized study approach."
  },
  {
    number: "4",
    title: "Weekly Progress Tracking",
    desc: "Weekly tests and homework reviews ensure steady improvement."
  },
  {
    number: "5",
    title: "Monthly Parent Review",
    desc: "Receive regular progress reports to stay informed of growth."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export default function PlansSection() {
  const [activePlan, setActivePlan] = useState(null);
  const detailsRef = useRef(null);

  // Smooth scroll to the details section when activePlan changes
  useEffect(() => {
    if (activePlan && detailsRef.current) {
      setTimeout(() => {
        detailsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [activePlan]);

  const handleCardClick = (planId) => {
    if (activePlan === planId) {
      setActivePlan(null);
    } else {
      setActivePlan(planId);
      trackEvent("explore_plan", planId);
    }
  };

  const handleScrollToEnquiry = () => {
    if (activePlan) {
      trackEvent("choose_plan", activePlan);
      trackEvent("book_demo", activePlan);
    }
    const enquirySection = document.getElementById("parent-enquiry") || document.getElementById("home");
    if (enquirySection) {
      enquirySection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/parent-enquiry";
    }
  };

  const activePlanData = PLANS.find((p) => p.id === activePlan);

  return (
    <section id="plans" className="relative overflow-hidden bg-slate-950 py-12 text-white border-t border-b border-white/5">
      {/* CSS Styles for animations */}
      <style>{`
        @keyframes shineEffect {
          0% {
            transform: translateX(-150%) skewX(-15deg);
          }
          100% {
            transform: translateX(150%) skewX(-15deg);
          }
        }
        .shine-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
          );
          transform: translateX(-150%) skewX(-15deg);
        }
        .premium-shine-card:hover .shine-overlay {
          animation: shineEffect 1.5s ease-in-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-1/4 -top-1/4 h-[700px] w-[700px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[700px] w-[700px] rounded-full bg-indigo-600/10 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-black tracking-tight text-white md:text-6xl">
            Choose Your Learning Path
          </h2>
          <p className="mt-4 text-base font-semibold text-slate-400 md:text-lg max-w-2xl mx-auto">
            Flexible Plans • Expert Mentorship • Better Results
          </p>
        </motion.div>

        {/* Carousel / Cards Layout Wrapper */}
        <PlanCarousel
          plans={PLANS}
          activePlan={activePlan}
          onCardClick={handleCardClick}
        />

        {/* Expandable Details Section */}
        <div ref={detailsRef} className="mt-4">
          <AnimatePresence mode="wait">
            {activePlan && activePlanData && (
              <motion.div
                key={activePlan}
                initial={{ opacity: 0, height: 0, y: 30 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="overflow-hidden mt-4 max-w-6xl mx-auto"
              >
                <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 md:p-10 shadow-2xl relative backdrop-blur-xl">
                  {/* Close button */}
                  <button
                    onClick={() => setActivePlan(null)}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition"
                    aria-label="Collapse Details"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <PlanDetails
                    plan={activePlanData}
                    onCTA={handleScrollToEnquiry}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// Infinite Carousel Component
function PlanCarousel({ plans, activePlan, onCardClick }) {
  const scrollRef = useRef(null);
  const cardRef = useRef(null);
  const autoplayTimeoutRef = useRef(null);
  const targetIndexRef = useRef(12); // Start in the middle
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const [isHovered, setIsHovered] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cardWidth, setCardWidth] = useState(390);
  const [containerWidth, setContainerWidth] = useState(0);
  const [centeredIndex, setCenteredIndex] = useState(12); // Track centered card index

  // Repeat the plans array 10 times to enable seamless infinite scroll in both directions
  const slides = [];
  for (let i = 0; i < 10; i++) {
    slides.push(...plans);
  }

  // Calculate centered scroll position for a specific card index
  const getScrollPositionForIndex = (idx) => {
    return idx * cardWidth - (containerWidth - cardWidth) / 2;
  };

  // Measure card and container width dynamically with ResizeObserver
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const handleResize = () => {
      if (scrollEl) {
        setContainerWidth(scrollEl.offsetWidth);
      }
      if (cardRef.current) {
        setCardWidth(cardRef.current.offsetWidth);
      } else {
        const firstCard = scrollEl.querySelector(".flex-shrink-0");
        if (firstCard) {
          setCardWidth(firstCard.offsetWidth);
        }
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(scrollEl);

    // Initial measurement
    handleResize();

    return () => {
      observer.disconnect();
    };
  }, []);

  // Initialize and recalibrate scroll position
  useEffect(() => {
    if (scrollRef.current && cardWidth > 0 && containerWidth > 0) {
      const targetScrollLeft = getScrollPositionForIndex(targetIndexRef.current);
      scrollRef.current.scrollLeft = targetScrollLeft;
    }
  }, [cardWidth, containerWidth]);

  // Pause autoplay for 5 seconds on user click/interaction
  const triggerInteractionPause = () => {
    setIsUserInteracting(true);
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
    autoplayTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 5000);
  };

  // Clean up timeout
  useEffect(() => {
    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, []);

  // Autoplay effect (smooth scroll card-by-card every 4 seconds)
  useEffect(() => {
    if (isHovered || activePlan !== null || isUserInteracting || isDragging) {
      return;
    }

    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, activePlan, isUserInteracting, isDragging, cardWidth]);

  const handleNext = () => {
    if (!scrollRef.current || cardWidth === 0) return;
    triggerInteractionPause();
    targetIndexRef.current += 1;
    const targetScrollLeft = getScrollPositionForIndex(targetIndexRef.current);
    scrollRef.current.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth"
    });
  };

  const handlePrev = () => {
    if (!scrollRef.current || cardWidth === 0) return;
    triggerInteractionPause();
    targetIndexRef.current -= 1;
    const targetScrollLeft = getScrollPositionForIndex(targetIndexRef.current);
    scrollRef.current.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth"
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current || cardWidth === 0 || containerWidth === 0) return;

    const scrollLeft = scrollRef.current.scrollLeft;
    const singleCycleWidth = plans.length * cardWidth;

    // Wrap around boundaries
    if (!isUserInteracting || isDragging) {
      if (scrollLeft >= 7 * singleCycleWidth) {
        scrollRef.current.scrollLeft -= 3 * singleCycleWidth;
        targetIndexRef.current -= 3 * plans.length;
      } else if (scrollLeft <= 2 * singleCycleWidth) {
        scrollRef.current.scrollLeft += 3 * singleCycleWidth;
        targetIndexRef.current += 3 * plans.length;
      }
    }

    // Calculate current index
    const currentIndex = Math.round(
      (scrollRef.current.scrollLeft + (containerWidth - cardWidth) / 2) / cardWidth
    );

    if (isDragging || !isUserInteracting) {
      targetIndexRef.current = currentIndex;
    }

    if (currentIndex !== centeredIndex) {
      setCenteredIndex(currentIndex);
    }
  };

  const handleMouseDown = (e) => {
    if (e.target.closest("button")) return;
    setIsDragging(true);
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
    triggerInteractionPause();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollRef.current) {
        const currentScrollLeft = scrollRef.current.scrollLeft;
        const currentIndex = Math.round(
          (currentScrollLeft + (containerWidth - cardWidth) / 2) / cardWidth
        );
        targetIndexRef.current = currentIndex;
        const targetScrollLeft = getScrollPositionForIndex(currentIndex);
        scrollRef.current.scrollTo({
          left: targetScrollLeft,
          behavior: "smooth"
        });
      }
    }
  };

  const centeredPlan = slides[centeredIndex];

  return (
    <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 xl:gap-12 items-center max-w-6xl mx-auto w-full">
      {/* Left Column: Carousel */}
      <div
        className="relative w-full max-w-[380px] sm:max-w-[500px] md:max-w-[620px] mx-auto px-6 sm:px-8 md:px-12 flex items-center justify-center lg:-translate-x-16 xl:-translate-x-20 transition-transform duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Left Navigation Button */}
        <motion.button
          onClick={handlePrev}
          whileHover={{ scale: 1.08, boxShadow: "0 0 15px rgba(255, 255, 255, 0.15)" }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.15)"
          }}
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full text-white shadow-lg cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="h-4.5 w-4.5 md:h-5 md:w-5" />
        </motion.button>

        {/* Carousel Viewport (Native scroll container with hidden scrollbars) */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={() => triggerInteractionPause()}
          onWheel={() => triggerInteractionPause()}
          className="relative w-full overflow-x-auto py-6 no-scrollbar flex select-none"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {slides.map((plan, idx) => (
            <div
              key={`${plan.id}-${idx}`}
              ref={idx === 0 ? cardRef : null}
              className="w-[240px] min-w-[240px] sm:w-[310px] md:w-[360px] px-2 sm:px-2.5 flex-shrink-0"
              style={{
                perspective: "1000px"
              }}
            >
              <PlanCard
                plan={plan}
                isActive={activePlan === plan.id}
                isSelectedAny={activePlan !== null}
                isCenter={idx === centeredIndex}
                position={idx === centeredIndex ? "center" : idx < centeredIndex ? "left" : "right"}
                onClick={() => onCardClick(plan.id)}
              />
            </div>
          ))}
        </div>

        {/* Right Navigation Button */}
        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.08, boxShadow: "0 0 15px rgba(255, 255, 255, 0.15)" }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.15)"
          }}
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full text-white shadow-lg cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="h-4.5 w-4.5 md:h-5 md:w-5" />
        </motion.button>
      </div>

      {/* Right Column: "How It Works" Timeline Panel */}
      <div className="w-full max-w-[460px] lg:max-w-none mx-auto lg:mx-0 px-4 mt-4 lg:mt-0 relative z-30">
        <div className="rounded-[2.2rem] border border-white/10 bg-slate-900/40 px-6 py-5 sm:px-7 sm:py-5.5 backdrop-blur-xl relative overflow-hidden shadow-[0_15px_35px_-5px_rgba(0,0,0,0.6)] h-[410px] sm:h-[400px] flex flex-col justify-between">
          {/* Dynamic background glow matching the plan theme */}
          <div className={`absolute -right-24 -top-24 h-48 w-48 rounded-full blur-[80px] opacity-[0.12] transition-colors duration-700 pointer-events-none ${
            centeredPlan?.theme === "silver" ? "bg-slate-400" :
            centeredPlan?.theme === "gold" ? "bg-amber-500" : "bg-blue-500"
          }`} />

          <div className="relative z-10 flex flex-col h-full justify-between">
            {/* Section Header */}
            <div>
              <h3 className="text-base sm:text-[17px] font-black uppercase tracking-[0.2em] text-blue-500">
                HOW IT WORKS
              </h3>
              <p className="mt-1.5 text-xs sm:text-[12.5px] font-semibold text-slate-400 leading-normal">
                A simple and structured learning journey designed to ensure consistent academic growth and personalized guidance.
              </p>
            </div>

            {/* Premium Vertical Timeline */}
            <motion.div
              key={activePlan || "none"}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="relative flex-1 flex flex-col justify-between mt-4 py-1"
            >
              {/* Elegant connecting line */}
              <div className="absolute left-[12.5px] top-3 bottom-3 w-[1px] bg-gradient-to-b from-blue-500 via-indigo-500/30 to-blue-500/5 pointer-events-none" />

              {TIMELINE_STEPS.map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="relative flex items-start gap-3.5 pl-0.5"
                >
                  {/* Circular Numbered Icon */}
                  <div className="relative z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-slate-950 border border-blue-500 text-[11px] font-bold text-white shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                    {step.number}
                  </div>
                  
                  <div className="flex flex-col min-w-0 justify-center">
                    <h4 className="text-xs sm:text-[13px] font-bold text-white leading-tight">
                      {step.title}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 leading-normal mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal vector SVG illustration components for plans
const FoundationImage = () => (
  <svg
    viewBox="0 0 120 120"
    className="absolute bottom-16 right-3 w-24 h-24 text-current opacity-[0.06] pointer-events-none transition-all duration-700 group-hover:scale-110 group-hover:-translate-x-1 group-hover:-translate-y-1"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
  >
    {/* Book 1 (Bottom) */}
    <path d="M20 90 L70 105 L110 90 L60 75 Z" />
    <path d="M20 90 L20 96 C20 99, 60 114, 70 114 C80 114, 110 99, 110 96 L110 90" />
    <path d="M70 105 L70 114" />
    {/* Book 2 (Middle) */}
    <path d="M25 73 L75 88 L105 75 L55 60 Z" />
    <path d="M25 73 L25 79 C25 82, 65 97, 75 97 C85 97, 105 82, 105 79 L105 73" />
    <path d="M75 88 L75 97" />
    {/* Book 3 (Top) */}
    <path d="M35 55 L75 67 L95 57 L55 45 Z" />
    <path d="M35 55 L35 60 C35 63, 65 75, 75 75 C85 75, 95 63, 95 60 L95 55" />
    <path d="M75 67 L75 75" />
    {/* Graduation Cap / Star */}
    <path d="M65 20 L80 26 L65 32 L50 26 Z" fill="currentColor" opacity="0.1" />
    <path d="M50 26 L50 36" />
    <path d="M65 32 L65 40" />
    <circle cx="65" cy="26" r="2" fill="currentColor" />
  </svg>
);

const AdvanceImage = () => (
  <svg
    viewBox="0 0 120 120"
    className="absolute bottom-16 right-3 w-24 h-24 text-current opacity-[0.06] pointer-events-none transition-all duration-700 group-hover:scale-110 group-hover:-translate-x-1 group-hover:-translate-y-1"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
  >
    {/* Grid lines */}
    <line x1="20" y1="100" x2="100" y2="100" strokeDasharray="3 3" />
    <line x1="20" y1="80" x2="100" y2="80" strokeDasharray="3 3" />
    <line x1="20" y1="60" x2="100" y2="60" strokeDasharray="3 3" />
    <line x1="20" y1="40" x2="100" y2="40" strokeDasharray="3 3" />
    <line x1="20" y1="20" x2="100" y2="20" strokeDasharray="3 3" />
    {/* Growth curve */}
    <path d="M20 90 Q 40 85, 55 60 T 90 25" strokeWidth="2.5" strokeLinecap="round" />
    {/* Target circle at top right */}
    <circle cx="90" cy="25" r="6" strokeWidth="1.5" />
    <circle cx="90" cy="25" r="2" fill="currentColor" />
    {/* Area gradient under curve */}
    <path d="M20 100 L20 90 Q 40 85, 55 60 T 90 25 L 90 100 Z" fill="currentColor" opacity="0.03" />
    {/* Growth bar indicator */}
    <rect x="30" y="85" width="8" height="15" rx="1" fill="currentColor" opacity="0.2" />
    <rect x="50" y="65" width="8" height="35" rx="1" fill="currentColor" opacity="0.2" />
    <rect x="70" y="45" width="8" height="55" rx="1" fill="currentColor" opacity="0.2" />
  </svg>
);

const EliteImage = () => (
  <svg
    viewBox="0 0 120 120"
    className="absolute top-3 right-3 w-24 h-24 text-current opacity-[0.06] pointer-events-none transition-all duration-700 group-hover:scale-110 group-hover:rotate-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
  >
    {/* Premium shield outline */}
    <path d="M60 15 C 75 15, 95 20, 95 35 C 95 65, 75 90, 60 105 C 45 90, 25 65, 25 35 C 25 20, 45 15, 60 15 Z" strokeWidth="1.5" />
    {/* Inner shield accent */}
    <path d="M60 22 C 71 22, 87 26, 87 37 C 87 61, 71 83, 60 96 C 49 83, 33 61, 33 37 C 33 26, 49 22, 60 22 Z" opacity="0.5" />
    {/* Stars */}
    <circle cx="60" cy="35" r="3" fill="currentColor" />
    <circle cx="48" cy="39" r="2.5" fill="currentColor" />
    <circle cx="72" cy="39" r="2.5" fill="currentColor" />
    {/* Graduation Cap */}
    <path d="M60 48 L76 53 L60 58 L44 53 Z" strokeWidth="1.5" />
    <path d="M50 56.5 L50 63 C 50 66, 70 66, 70 63 L70 56.5" />
    <path d="M72 54.5 L72 65" />
    <circle cx="72" cy="65" r="1.5" fill="currentColor" />
    {/* Laurels / Leaves */}
    <path d="M40 75 Q 48 85, 60 85 Q 72 85, 80 75" />
  </svg>
);

const COMPARISON_POINTS = {
  foundation: [
    "Most affordable option",
    "Save up to 25% compared to premium plans",
    "Best for students who need regular practice and guidance",
    "Ideal for budget-conscious parents"
  ],
  advance: [
    "Better learning experience with only +18% more investment",
    "More structured guidance than Foundation",
    "Balanced pricing and premium features",
    "Best value for most students"
  ],
  elite: [
    "Learn from mentors with 5+ to 25+ years experience",
    "Premium mentorship and priority support",
    "Personalized academic strategy",
    "Effective cost of ₹650–₹800 per class"
  ]
};

// Plan Card Component
function PlanCard({ plan, isActive, isSelectedAny, isCenter, position, onClick }) {
  const isSilver = plan.theme === "silver";
  const isGold = plan.theme === "gold";
  const isBlack = plan.theme === "black";

  // Card theme classes
  const getCardThemeClasses = () => {
    if (isSilver) {
      return "bg-gradient-to-br from-[#F8FAFC] to-[#CBD5E1] border-white/30 text-slate-800 shadow-[0_15px_30px_-5px_rgba(203,213,225,0.15)] premium-shine-card";
    }
    if (isGold) {
      return "bg-gradient-to-br from-[#FFD700] to-[#F59E0B] border-[#FFD700]/30 text-slate-950 shadow-[0_15px_30px_-5px_rgba(245,158,11,0.25)] premium-shine-card";
    }
    return "bg-gradient-to-br from-[#111827] to-[#000000] border-white/12 text-white shadow-[0_15px_35px_-5px_rgba(0,0,0,0.6)] premium-shine-card";
  };

  // Badge theme classes
  const getBadgeThemeClasses = () => {
    if (isSilver) {
      return "bg-slate-900/10 text-slate-800 border-slate-900/20";
    }
    if (isGold) {
      return "bg-black/10 text-slate-950 border-black/20";
    }
    return "bg-white/10 text-white border-white/10";
  };

  // Highlight rings/shadows when card is active
  const getActiveStateClasses = () => {
    if (!isActive) return "";
    if (isSilver) {
      return "ring-[3px] ring-slate-400/80 shadow-[0_0_30px_rgba(203,213,225,0.3)]";
    }
    if (isGold) {
      return "ring-[3px] ring-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]";
    }
    return "ring-[3px] ring-white/60 shadow-[0_0_30px_rgba(255,255,255,0.15)]";
  };

  const getCardStyle = () => {
    const style = {
      transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      transformStyle: "preserve-3d"
    };

    if (isSelectedAny) {
      if (isActive) {
        return {
          ...style,
          transform: "perspective(1000px) rotateY(0deg) scale(1)",
          opacity: 1,
          filter: "blur(0px)"
        };
      } else {
        return {
          ...style,
          transform: "perspective(1000px) rotateY(0deg) scale(0.92)",
          opacity: 0.3,
          filter: "blur(1px)"
        };
      }
    }

    if (isCenter) {
      return {
        ...style,
        transform: "perspective(1000px) rotateY(0deg) scale(1)",
        opacity: 1,
        filter: "blur(0px)"
      };
    } else {
      const rotateDeg = position === "left" ? 8 : -8;
      return {
        ...style,
        transform: `perspective(1000px) rotateY(${rotateDeg}deg) scale(0.88)`,
        opacity: 0.45,
        filter: "blur(2px)"
      };
    }
  };

  const renderIllustration = () => {
    switch (plan.id) {
      case "foundation":
        return <FoundationImage />;
      case "advance":
        return <AdvanceImage />;
      case "elite":
        return <EliteImage />;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      style={getCardStyle()}
      className={`relative overflow-hidden rounded-[2.2rem] border p-6 sm:p-7 flex flex-col justify-between h-[410px] sm:h-[400px] cursor-pointer group ${getCardThemeClasses()} ${getActiveStateClasses()} ${
        isSelectedAny && !isActive ? "pointer-events-none md:pointer-events-auto" : ""
      }`}
    >
      {/* Background illustration */}
      {renderIllustration()}

      {/* Subtle shine effect overlay on hover (All Cards) */}
      <div className="shine-overlay pointer-events-none" />

      {/* Glow layer behind active card */}
      {isActive && (
        <div className="absolute inset-0 rounded-[2.2rem] ring-4 ring-current/10 blur-md pointer-events-none" />
      )}

      {/* Top Section */}
      <div className="flex flex-col items-start w-full">
        {/* Highlight Badge */}
        <div className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider border mb-6 ${getBadgeThemeClasses()}`}>
          {plan.badge}
        </div>

        {/* Plan Name */}
        <h3 className="text-2xl font-black tracking-tight">{plan.title}</h3>

        {/* Small Description */}
        <p className="mt-3 text-xs leading-relaxed font-medium opacity-85 select-none">
          {plan.description}
        </p>

        {/* Highlight details for specific plans */}
        {plan.experience && (
          <span className="mt-2 text-[10px] font-bold uppercase tracking-wider opacity-60">
            Tutor Experience: {plan.experience}
          </span>
        )}
      </div>

      {/* Middle Section: Key Benefits */}
      <div className="my-4 pt-4 border-t border-current/10 w-full flex flex-col gap-3">
        {plan.cardBenefits.map((benefit, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            <Check className="h-4.5 w-4.5 shrink-0 mt-0.5 text-current opacity-80" />
            <span className="text-xs font-semibold leading-snug">
              {benefit}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Section: Price & Minimal Action */}
      <div className="mt-auto pt-4 border-t border-current/10 flex items-center justify-between w-full">
        <div className="flex flex-col min-h-[40px] justify-center">
          {isActive ? (
            <>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 block">Investment</span>
              <span className="text-2xl font-extrabold tracking-tight">{plan.price}</span>
            </>
          ) : null}
        </div>

        {/* Explore Plan -> [ Minimal design ] */}
        <div className="text-[10px] font-black uppercase tracking-wider opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 py-1 px-3.5 rounded-full border border-current/25 bg-current/5">
          <span>Explore Plan</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
}

// Plan Details Component
function PlanDetails({ plan, onCTA }) {
  const { fullDetails, title, theme } = plan;

  const getHeaderBadgeClasses = () => {
    switch (theme) {
      case "silver":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "gold":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "black":
        return "bg-white/5 text-white border-white/10";
      default:
        return "bg-white/5 text-white border-white/10";
    }
  };

  const getCTABtnClasses = () => {
    switch (theme) {
      case "silver":
        return "bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-slate-100/10";
      case "gold":
        return "bg-white text-black hover:bg-slate-100 shadow-white/5";
      case "black":
        return "bg-white text-black hover:bg-slate-100 shadow-white/5";
      default:
        return "bg-white text-black hover:bg-slate-100";
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] text-white">
      {/* Left Column: Benefits, Features & FAQs */}
      <div className="space-y-8">
        <div>
          <h3 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Complete Plan Overview
          </h3>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            {plan.description}
          </p>
        </div>

        {/* Benefits Grid */}
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Core Benefits</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            {fullDetails.benefits.map((benefit, idx) => {
              const icons = [Award, Clock, BookOpen, ShieldCheck];
              const IconComp = icons[idx % icons.length];
              return (
                <div key={idx} className="flex gap-3 items-start rounded-2xl bg-white/5 border border-white/5 p-4 hover:bg-white/10 transition duration-300">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white shrink-0">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">{benefit.title}</h5>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features & FAQs Checklist */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Features */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">What's Included</h4>
            <ul className="space-y-3">
              {fullDetails.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FAQs */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Frequently Asked Questions</h4>
            <FAQAccordion faqs={fullDetails.faqs} />
          </div>
        </div>
      </div>

      {/* Right Column: Pricing Table & CTA */}
      <div className="rounded-3xl border border-white/5 bg-slate-950/70 p-6 flex flex-col justify-between h-full min-h-[380px]">
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Complete Pricing Breakdown</h4>
          <table className="w-full text-sm border-collapse text-left">
            <tbody>
              {fullDetails.pricing.map((row, idx) => (
                <tr key={idx} className="border-b border-white/5 last:border-0">
                  <td className="py-3.5 font-semibold text-slate-400">{row.label}</td>
                  <td className="py-3.5 text-right font-black text-white">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-6 text-[11px] leading-relaxed text-slate-500 border-t border-white/5 pt-4">
            * {fullDetails.additionalInfo}
          </p>
        </div>

        <button
          onClick={onCTA}
          className={`mt-8 w-full flex h-14 items-center justify-center gap-2 rounded-2xl font-black text-sm transition-all duration-300 active:scale-[0.98] shadow-xl ${getCTABtnClasses()}`}
        >
          Book Demo
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// FAQ Accordion Helper Component
function FAQAccordion({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-3 mt-4">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="border-b border-white/5 pb-3">
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full flex items-center justify-between text-left py-2 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
            >
              <span>{faq.q}</span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-slate-400 leading-relaxed mt-1 pb-1">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

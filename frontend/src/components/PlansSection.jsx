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
  X
} from "lucide-react";

import { PLANS } from "../data/plansConfig";

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
    }
  };

  const handleScrollToEnquiry = () => {
    const enquirySection = document.getElementById("parent-enquiry") || document.getElementById("home");
    if (enquirySection) {
      enquirySection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/parent-enquiry";
    }
  };

  const activePlanData = PLANS.find((p) => p.id === activePlan);

  return (
    <section id="plans" className="relative overflow-hidden bg-slate-950 py-20 text-white border-t border-b border-white/5">
      {/* CSS Styles for animations */}
      <style>{`
        @keyframes slideRightToLeft {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-25%, 0, 0);
          }
        }
        .animate-marquee-right-to-left {
          display: flex;
          width: max-content;
          animation: slideRightToLeft 35s linear infinite;
        }
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
          className="text-center mb-16"
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
        <div ref={detailsRef} className="mt-8">
          <AnimatePresence mode="wait">
            {activePlan && activePlanData && (
              <motion.div
                key={activePlan}
                initial={{ opacity: 0, height: 0, y: 30 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="overflow-hidden mt-8 max-w-6xl mx-auto"
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
  const [isHovered, setIsHovered] = useState(false);
  const isPaused = isHovered || activePlan !== null;

  // Quadruple the plans to ensure seamless infinite looping on wide viewports.
  // 3 plans * 4 = 12 items.
  const quadrupledPlans = [...plans, ...plans, ...plans, ...plans];

  return (
    <div
      className="relative w-full overflow-hidden py-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Fade overlay on the left and right edges for a premium slider feel */}
      <div className="absolute left-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

      <div
        className="animate-marquee-right-to-left flex"
        style={{
          width: "max-content",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {quadrupledPlans.map((plan, index) => (
          <div
            key={`${plan.id}-${index}`}
            className="w-[290px] sm:w-[350px] md:w-[390px] px-3.5 flex-shrink-0"
          >
            <PlanCard
              plan={plan}
              isActive={activePlan === plan.id}
              isSelectedAny={activePlan !== null}
              onClick={() => onCardClick(plan.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Plan Card Component
function PlanCard({ plan, isActive, isSelectedAny, onClick }) {
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
      return "ring-[3px] ring-slate-400/80 shadow-[0_0_30px_rgba(203,213,225,0.3)] scale-[1.02]";
    }
    if (isGold) {
      return "ring-[3px] ring-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] scale-[1.02]";
    }
    return "ring-[3px] ring-white/60 shadow-[0_0_30px_rgba(255,255,255,0.15)] scale-[1.02]";
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-[2.2rem] border p-8 flex flex-col justify-between h-[420px] transition-all duration-500 cursor-pointer group ${getCardThemeClasses()} ${getActiveStateClasses()} ${
        isSelectedAny && !isActive
          ? "opacity-45 blur-[0.5px] scale-[0.98] pointer-events-none md:pointer-events-auto"
          : "hover:scale-[1.01]"
      }`}
    >
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

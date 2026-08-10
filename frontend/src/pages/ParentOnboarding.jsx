import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  BookOpen,
  Clock,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
  Info,
  BadgeCheck,
  Banknote,
  CalendarX2,
  UserX,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   LOGO — uses the existing /public/logo.png asset
   The container enforces fixed height; object-contain prevents any distortion.
───────────────────────────────────────────────────────────────────────────── */
function SiteHeader() {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <a
          href="https://saraswatitutorial.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 shrink-0"
        >
          <div className="h-10 w-auto flex items-center">
            <img
              src="/logo.png"
              alt="Saraswati Tutorials"
              className="h-10 w-auto max-w-[160px] object-contain block"
              loading="eager"
            />
          </div>
        </a>

        {/* Badge */}
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-full px-3 py-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          Official Parent Guide
        </span>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION CARD — wrapper with consistent card styling
───────────────────────────────────────────────────────────────────────────── */
function SectionCard({ id, icon: Icon, iconBg, title, children }) {
  return (
    <section
      id={id}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      {/* Section Header */}
      <div className={`px-6 py-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 ${iconBg}`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 dark:bg-slate-700/60 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-base font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200">
          {title}
        </h2>
      </div>

      {/* Section Body */}
      <div className="px-6 py-5 space-y-4">{children}</div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   POLICY BULLET
───────────────────────────────────────────────────────────────────────────── */
function PolicyBullet({ icon: Icon = CheckCircle, iconClass = "text-emerald-500", children }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconClass}`} />
      <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{children}</span>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PILL BADGE
───────────────────────────────────────────────────────────────────────────── */
function Pill({ children, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    emerald: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
    amber: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700",
    red: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700",
    violet: "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700",
  };
  return (
    <span className={`inline-flex items-center text-xs font-semibold border rounded-full px-2.5 py-0.5 ${colors[color]}`}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DIVIDER
───────────────────────────────────────────────────────────────────────────── */
function Divider() {
  return <hr className="border-slate-100 dark:border-slate-700" />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   DEMO FEE CARDS
───────────────────────────────────────────────────────────────────────────── */
function DemoFeeCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Free */}
      <div className="relative rounded-xl border-2 border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-4 overflow-hidden">
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
          Free
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
          First Demo Session
        </p>
        <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300 leading-none">
          ₹0
        </p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
          Completely complimentary
        </p>
        <ul className="mt-3 space-y-1 text-xs text-emerald-700 dark:text-emerald-300">
          <li className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            1-hour session
          </li>
          <li className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            No obligation
          </li>
        </ul>
      </div>

      {/* Paid */}
      <div className="relative rounded-xl border-2 border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20 p-4 overflow-hidden">
        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
          Chargeable
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
          Additional Demo Sessions
        </p>
        <p className="text-3xl font-black text-amber-700 dark:text-amber-300 leading-none">
          ₹500
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
          Per 1-hour demo
        </p>
        <ul className="mt-3 space-y-1 text-xs text-amber-700 dark:text-amber-300">
          <li className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Duration: 1 hour
          </li>
          <li className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            Per additional tutor demo
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ADMISSION FEE SERVICES LIST — each item appears exactly once
───────────────────────────────────────────────────────────────────────────── */
const admissionServices = [
  {
    icon: Users,
    label: "Tutor Sourcing",
    desc: "Shortlisting tutors from 3200+ based on parent requirements.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: ShieldCheck,
    label: "Verification",
    desc: "Government ID and complete background verification.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    icon: BadgeCheck,
    label: "Allocation",
    desc: "Sending the tutor directly to the student's home / given location.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: Star,
    label: "Parent Support",
    desc: "Compensation for absence and support for changes in subject focus, strategy, and timings.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    icon: Users,
    label: "Backup — Replacement of Tutor",
    desc: "Replacement on parent request or emergency from tutor end, within 72 hours.",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-900/20",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   VERIFICATION CRITERIA GROUPS
───────────────────────────────────────────────────────────────────────────── */
const verificationGroups = [
  {
    label: "Parent Requirement Matching",
    items: ["Patient", "Strict", "Punctual", "School tutor", "Nearby location", "Female gender", "Other parent requirements"],
  },
  {
    label: "Teaching Experience",
    items: ["Past records", "Previous parent feedback", "Performance records"],
  },
  {
    label: "Academic Qualification",
    items: ["Original education certificate copies maintained in the database"],
  },
  {
    label: "Background Verification",
    items: ["Government ID", "Education certificates", "Digital verification"],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   ACKNOWLEDGEMENT SECTION
───────────────────────────────────────────────────────────────────────────── */
function AcknowledgementArea() {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
          <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
            Parent Acknowledgement
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            This document has been shared with you for your information and reference. Please read all policies before the demo session and feel free to contact us with any questions.
          </p>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <div
              onClick={() => setAcknowledged(!acknowledged)}
              className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                acknowledged
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 group-hover:border-blue-400"
              }`}
            >
              {acknowledged && (
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              I have read and understood the Saraswati Tutorials Parent Onboarding Guide, Demo Session Guidelines, and all stated policies.
            </span>
          </label>

          {acknowledged && (
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 animate-fadeIn">
              <CheckCircle className="h-4 w-4" />
              Thank you! Our team will be in touch with you shortly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function ParentOnboarding() {
  return (
    <>
      <Helmet>
        <title>Parent Onboarding &amp; Demo Guide | Saraswati Tutorials</title>
        <meta
          name="description"
          content="Read the official Saraswati Tutorials Parent Onboarding Guide. Learn about demo session policies, tutor verification, admission fees, no-bypass policy, and class policies."
        />
        <meta name="robots" content="index, follow" />

        {/* Open Graph — WhatsApp / social sharing */}
        <meta property="og:title" content="Parent Onboarding & Demo Guide | Saraswati Tutorials" />
        <meta
          property="og:description"
          content="Your complete guide before starting home tutoring with Saraswati Tutorials — demo policies, verification, admission fee, and class rules."
        />
        <meta property="og:url" content="https://tnc.saraswatitutorials.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://saraswatitutorial.com/logo.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Parent Onboarding & Demo Guide | Saraswati Tutorials" />
        <meta name="twitter:description" content="Official parent guide for home tutoring services at Saraswati Tutorials." />
      </Helmet>

      {/* Page wrapper — overrides any global dark BG so this page always feels light/clean */}
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-200">
        <SiteHeader />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* ── Hero Title ───────────────────────────────────────── */}
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full px-4 py-1.5 mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              Official Document
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 leading-tight tracking-tight">
              Parent Onboarding &amp;<br className="sm:hidden" /> Demo Guide
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Saraswati Tutorials — Bangalore &amp; Mumbai
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Please read all sections carefully before your demo session.
            </p>
          </div>

          {/* ── TABLE OF CONTENTS ──────────────────────────────── */}
          <nav className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Contents
            </p>
            <ol className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
              {[
                ["#demo", "1. Demo Session Guidelines"],
                ["#whatwedo", "2. What We Do For You"],
                ["#fee", "3. Admission & Service Fee"],
                ["#nobypass", "4. No-Bypass Policy"],
                ["#classpolicies", "5. Class Policies"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ══════════════════════════════════════════════════════
              SECTION 1 — DEMO SESSION GUIDELINES
          ══════════════════════════════════════════════════════ */}
          <SectionCard
            id="demo"
            icon={Star}
            iconBg="bg-amber-50 dark:bg-amber-900/20"
            title="Demo Session Guidelines"
          >
            {/* Complimentary Demo */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-3">
                Complimentary Demo
              </h3>
              <DemoFeeCards />
            </div>

            <Divider />

            {/* Tutor Reservation */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-3">
                Tutor Reservation
              </h3>
              <ul className="space-y-3">
                <PolicyBullet icon={Clock} iconClass="text-blue-500">
                  To reserve the same tutor, <strong>admission confirmation is mandatory within 24 hours</strong> of the demo session.
                </PolicyBullet>
                <PolicyBullet icon={AlertCircle} iconClass="text-amber-500">
                  After 24 hours, tutor availability cannot be guaranteed and the tutor may be offered to another waiting parent.
                </PolicyBullet>
              </ul>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════
              SECTION 2 — WHAT WE DO FOR YOU
          ══════════════════════════════════════════════════════ */}
          <SectionCard
            id="whatwedo"
            icon={ShieldCheck}
            iconBg="bg-violet-50 dark:bg-violet-900/20"
            title="What We Do For You"
          >
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every tutor is carefully shortlisted to ensure your child is learning with a <strong className="text-slate-800 dark:text-slate-200">safe and reliable mentor</strong>. Our selection process covers:
            </p>

            <div className="space-y-3">
              {verificationGroups.map((group) => (
                <div
                  key={group.label}
                  className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 px-4 py-3"
                >
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    {group.label}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full px-2.5 py-1"
                      >
                        <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Divider />

            {/* 1-year agreement */}
            <div className="flex items-start gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4">
              <BadgeCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                Tutors are bound by an agreement for <strong>one academic year</strong> to support continuity, reliability, and consistency — especially throughout examination periods.
              </p>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════
              SECTION 3 — ADMISSION & SERVICE FEE
          ══════════════════════════════════════════════════════ */}
          <SectionCard
            id="fee"
            icon={Banknote}
            iconBg="bg-emerald-50 dark:bg-emerald-900/20"
            title="Admission & Service Fee"
          >
            {/* One-time fee callout */}
            <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
                One-Time Admission Fee
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                A one-time admission fee equivalent to <strong className="text-emerald-700 dark:text-emerald-300">59% of one month's tuition fee</strong> is applicable upon tutor confirmation, before the first regular class.
              </p>
            </div>

            <Divider />

            {/* What it covers */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                This Covers
              </p>
              <ul className="space-y-3">
                {admissionServices.map((svc) => {
                  const Icon = svc.icon;
                  return (
                    <li
                      key={svc.label}
                      className={`flex items-start gap-3 rounded-xl border border-slate-100 dark:border-slate-700 ${svc.bg} px-4 py-3`}
                    >
                      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${svc.color}`} />
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-wider ${svc.color} mb-0.5`}>
                          {svc.label}
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {svc.desc}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Divider />

            {/* 1 year validity */}
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 px-4 py-3">
              <CalendarX2 className="h-5 w-5 text-slate-500 dark:text-slate-400 shrink-0" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Validity: <span className="text-slate-900 dark:text-white">1 Academic Year</span>
              </p>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════
              SECTION 4 — NO-BYPASS POLICY
          ══════════════════════════════════════════════════════ */}
          <SectionCard
            id="nobypass"
            icon={AlertCircle}
            iconBg="bg-red-50 dark:bg-red-900/20"
            title="No-Bypass Policy"
          >
            <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
                Direct hiring of a tutor, or continuing tutor engagement during demo or regular sessions <strong>without involvement of the institute, is not permitted</strong>.
              </p>
            </div>

            <ul className="space-y-3">
              <PolicyBullet icon={AlertCircle} iconClass="text-red-500">
                Direct or indirect payments to a tutor without institute confirmation are not permitted.
              </PolicyBullet>
            </ul>

            <Divider />

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Such Actions May Lead To
              </p>
              <ul className="space-y-2">
                <PolicyBullet icon={UserX} iconClass="text-red-500">
                  Service discontinuation
                </PolicyBullet>
                <PolicyBullet icon={UserX} iconClass="text-red-500">
                  Loss of all support benefits
                </PolicyBullet>
                <PolicyBullet icon={UserX} iconClass="text-red-500">
                  Applicable policy penalties / fine
                </PolicyBullet>
              </ul>
            </div>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════
              SECTION 5 — CLASS POLICIES
          ══════════════════════════════════════════════════════ */}
          <SectionCard
            id="classpolicies"
            icon={Clock}
            iconBg="bg-blue-50 dark:bg-blue-900/20"
            title="Class Policies"
          >
            <ul className="space-y-3">
              <PolicyBullet icon={Clock} iconClass="text-blue-500">
                <strong>24-hour advance notice</strong> is required for class rescheduling, or applicable compensation will apply.
              </PolicyBullet>
              <PolicyBullet icon={CalendarX2} iconClass="text-blue-500">
                <strong>15-day notice</strong> is required for replacement or discontinuation requests.
              </PolicyBullet>
            </ul>
          </SectionCard>

          {/* ── ACKNOWLEDGEMENT ─────────────────────────────────── */}
          <AcknowledgementArea />

          {/* ── FOOTER ──────────────────────────────────────────── */}
          <footer className="text-center py-6 space-y-1">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} Saraswati Tutorials. All rights reserved.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Bangalore &amp; Mumbai &nbsp;·&nbsp;
              <a
                href="https://saraswatitutorial.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-500 transition-colors"
              >
                saraswatitutorial.com
              </a>
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}

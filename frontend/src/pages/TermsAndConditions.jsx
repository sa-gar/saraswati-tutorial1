import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import {
  ShieldCheck, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp,
  Users, MapPin, Home, Clock, RefreshCw, LayoutDashboard,
  BadgeCheck, AlertTriangle, Info, IndianRupee, CalendarX2,
  ArrowRight, X as XIcon,
} from "lucide-react";
import { API_BASE } from "../config";
import { TNC_CONFIG, computeFees, formatINR } from "../data/tncConfig";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Read monthly tuition from URL param ?fee= or session storage */
function getMonthlyTuition() {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlFee = parseInt(params.get("fee"), 10);
    if (!isNaN(urlFee) && urlFee > 0) return urlFee;
    const storedFee = parseInt(sessionStorage.getItem("parentMonthlyFee") || "", 10);
    if (!isNaN(storedFee) && storedFee > 0) return storedFee;
  } catch { /* ignore */ }
  return TNC_CONFIG.exampleMonthlyTuition;
}

async function recordAction(action, snapshot = {}) {
  try {
    await fetch(`${API_BASE}/tnc/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        source: "terms-conditions",
        pageVersion: TNC_CONFIG.termsVersion,
        ...snapshot,
      }),
    });
  } catch (err) {
    console.error("[TNC] record error:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL DESIGN PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({ id, children, className = "" }) {
  return (
    <section
      id={id}
      className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHead({ icon: Icon, iconColor = "text-blue-600 dark:text-blue-400", bg = "bg-blue-50 dark:bg-blue-900/20", title, subtitle }) {
  return (
    <div className={`px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2.5 sm:gap-3 ${bg}`}>
      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 dark:bg-slate-700/60 shadow-sm">
        <Icon className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${iconColor}`} />
      </div>
      <div>
        <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
          {title}
        </h2>
        {subtitle && <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Divider() {
  return <hr className="border-slate-100 dark:border-slate-700 my-1" />;
}

function InfoBox({ icon: Icon = Info, color = "blue", children }) {
  const colors = {
    blue:   "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300",
    emerald:"bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300",
    amber:  "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300",
    red:    "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300",
    violet: "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700 text-violet-800 dark:text-violet-300",
  };
  const iconColors = {
    blue:   "text-blue-500", emerald: "text-emerald-500",
    amber:  "text-amber-500", red: "text-red-500", violet: "text-violet-500",
  };
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${colors[color]}`}>
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColors[color]}`} />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — SERVICES
// ─────────────────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: ShieldCheck,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    title: "Background-Verified Tutors",
    body: "Every tutor is verified before allocation. We check Government ID, education certificates, and previous teaching feedback and demo records.",
  },
  {
    icon: Users,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    title: "Tutor Shortlisting",
    body: "We shortlist tutors from our pool of 3200+ based on your requirements — location, subject, grade, teaching style, and other preferences.",
  },
  {
    icon: Home,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    title: "Tutor Home Allocation",
    body: "After matching your requirement, we allocate the tutor and send them directly to the student's home or given location.",
  },
  {
    icon: RefreshCw,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    title: "Tutor Replacement Support",
    body: "If there is a genuine concern with the tutor, replacement support is available. Maximum replacement timeline: within 72 hours.",
  },
  {
    icon: BadgeCheck,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    title: "Parent Support & Class Compensation",
    body: "We support parents for genuine class-related concerns, including applicable compensation for missed classes when 24-hour advance notice is provided.",
  },
  {
    icon: LayoutDashboard,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    title: "Parent Dashboard",
    body: "Access your parent dashboard to view tutor details, class and attendance records, progress updates, and topics covered.",
  },
];

function ServicesSection() {
  return (
    <SectionCard id="services">
      <SectionHead
        icon={CheckCircle}
        iconColor="text-emerald-600 dark:text-emerald-400"
        bg="bg-emerald-50 dark:bg-emerald-900/20"
        title="What Services We Provide"
        subtitle="Everything included when you enrol with Saraswati Tutorials"
      />
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SERVICES.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className={`rounded-xl border border-slate-100 dark:border-slate-700 ${s.bg} p-3.5 sm:p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 shrink-0 ${s.color}`} />
                <p className={`text-xs font-bold uppercase tracking-wider ${s.color}`}>{s.title}</p>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{s.body}</p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — ADMISSION FEE + CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────
function FeeSection({ fees }) {
  const pct = TNC_CONFIG.admissionFeePercent;
  return (
    <SectionCard id="fee">
      <SectionHead
        icon={IndianRupee}
        iconColor="text-emerald-600 dark:text-emerald-400"
        bg="bg-emerald-50 dark:bg-emerald-900/20"
        title="Admission / Onboarding Fee"
        subtitle="One-time consultation & onboarding fee — not a school admission fee"
      />
      <div className="p-4 sm:p-6 space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          A one-time prepaid fee of <strong className="text-slate-900 dark:text-slate-100">{pct}%</strong> of
          one month's tuition fee is applicable after tutor confirmation and before the first regular class.
          This covers all the onboarding and service work done by Saraswati Tutorials on your behalf.
        </p>

        {/* Calculator card */}
        <div className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 sm:p-5">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-3">
            Fee Example
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Monthly Tuition</p>
              <p className="text-2.5xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">{formatINR(fees.tuition)}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-xl font-bold">
              <span>×</span>
              <span className="text-base">{pct}%</span>
              <span>=</span>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">Admission / Onboarding Fee</p>
              <p className="text-2.5xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300">{formatINR(fees.admissionFee)}</p>
            </div>
          </div>
          {fees.tuition === TNC_CONFIG.exampleMonthlyTuition && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 text-center">
              * Example calculation. Actual amount depends on your finalized tuition fee.
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — WHAT THE FEE COVERS
// ─────────────────────────────────────────────────────────────────────────────
const FEE_BREAKDOWN = [
  { label: "Tutor Sourcing",            pct: 20, color: "blue",   desc: "Shortlisting from 3200+ tutors based on your requirements." },
  { label: "Verification",              pct: 20, color: "violet", desc: "Government ID and complete background verification." },
  { label: "Allocation & Home Visit",   pct: 20, color: "emerald",desc: "Sending the tutor directly to the student's home / given location." },
  { label: "Parent Support",            pct: 20, color: "amber",  desc: "Support for changes in subject focus, strategy, and timings." },
  { label: "Backup & Replacement",      pct: 20, color: "rose",   desc: "Replacement within 72 hours on parent request or tutor emergency." },
];

const pillColors = {
  blue:   "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  violet: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
  emerald:"bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  amber:  "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  rose:   "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
};

function FeeCoversSection({ fees }) {
  return (
    <SectionCard id="covers">
      <SectionHead
        icon={CheckCircle}
        iconColor="text-blue-600 dark:text-blue-400"
        bg="bg-blue-50 dark:bg-blue-900/20"
        title="What This Fee Covers"
        subtitle={`Based on admission fee of ${formatINR(fees.admissionFee)}`}
      />
      <div className="p-4 sm:p-6 space-y-3">
        {FEE_BREAKDOWN.map((item) => {
          const amount = Math.round(fees.admissionFee * item.pct / 100);
          return (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 px-3.5 py-3 sm:px-4"
            >
              <span className={`mt-0.5 inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${pillColors[item.color]}`}>
                {item.pct}%
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
              <p className="text-sm font-black text-slate-700 dark:text-slate-300 shrink-0">{formatINR(amount)}</p>
            </div>
          );
        })}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-right">
          Each item = {FEE_BREAKDOWN[0].pct}% of admission fee {formatINR(fees.admissionFee)}
        </p>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — DEMO POLICY (exactly 2 boxes)
// ─────────────────────────────────────────────────────────────────────────────
function DemoSection() {
  const { additionalDemoFeeRs, demoDurationHours } = TNC_CONFIG;
  return (
    <SectionCard id="demo">
      <SectionHead
        icon={Clock}
        iconColor="text-amber-600 dark:text-amber-400"
        bg="bg-amber-50 dark:bg-amber-900/20"
        title="Demo Session Policy"
      />
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Box 1 — FREE */}
        <div className="relative rounded-2xl border-2 border-emerald-400 dark:border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 sm:p-5 overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
            Complimentary
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">First Demo Session</p>
          <p className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-300 leading-none mb-2">₹0</p>
          <ul className="space-y-1 text-xs text-emerald-700 dark:text-emerald-300">
            <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />First demo is completely free</li>
            <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />Duration: {demoDurationHours} hour</li>
            <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />No obligation, full evaluation</li>
          </ul>
        </div>
        {/* Box 2 — PAID */}
        <div className="relative rounded-2xl border-2 border-amber-400 dark:border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 sm:p-5 overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
            Chargeable
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">Additional Demo Sessions</p>
          <p className="text-4xl font-black text-amber-700 dark:text-amber-300 leading-none mb-2">{formatINR(additionalDemoFeeRs)}</p>
          <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
            <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />Applicable from the 2nd demo onwards</li>
            <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />Duration: {demoDurationHours} hour per session</li>
            <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />Payable before the session begins</li>
          </ul>
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — TUTOR RESERVATION
// ─────────────────────────────────────────────────────────────────────────────
function ReservationSection() {
  const { tutorReservationHours } = TNC_CONFIG;
  return (
    <SectionCard id="reservation">
      <SectionHead
        icon={Clock}
        iconColor="text-blue-600 dark:text-blue-400"
        bg="bg-blue-50 dark:bg-blue-900/20"
        title="Tutor Reservation"
      />
      <div className="p-4 sm:p-6 space-y-3">
        <div className="flex items-start gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-black">
            {tutorReservationHours}h
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
            <strong>To reserve the same tutor,</strong> admission confirmation is required
            within <strong>{tutorReservationHours} hours</strong> of the demo session.
          </p>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed px-1">
          After {tutorReservationHours} hours, tutor availability cannot be guaranteed
          and the tutor may be offered to another waiting parent.
        </p>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — REFUND & CANCELLATION
// ─────────────────────────────────────────────────────────────────────────────
function RefundSection({ fees }) {
  const { backupReplacementPercent } = TNC_CONFIG;
  return (
    <SectionCard id="refund">
      <SectionHead
        icon={RefreshCw}
        iconColor="text-violet-600 dark:text-violet-400"
        bg="bg-violet-50 dark:bg-violet-900/20"
        title="Refund & Cancellation Policy"
      />
      <div className="p-4 sm:p-6 space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Once the applicable onboarding, verification, tutor allocation, and related services
          have been provided, that portion of the admission fee is not refundable.
        </p>

        {/* Refundable component — visually emphasized */}
        <div className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-3.5 sm:p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                {backupReplacementPercent}% Backup & Replacement Component — May Be Refunded
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
                {backupReplacementPercent}% of the admission fee ({formatINR(fees.backupComponent)}) allocated for
                backup and replacement support <strong>may be refunded</strong> if Saraswati Tutorials is
                unable to provide the required replacement under the applicable service commitment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — REPLACEMENT & CLASS COMPENSATION
// ─────────────────────────────────────────────────────────────────────────────
function ReplacementSection() {
  const { replacementTimelineHours, classCompensationNoticeHours } = TNC_CONFIG;
  return (
    <SectionCard id="replacement">
      <SectionHead
        icon={RefreshCw}
        iconColor="text-amber-600 dark:text-amber-400"
        bg="bg-amber-50 dark:bg-amber-900/20"
        title="Tutor Replacement & Class Compensation"
      />
      <div className="p-4 sm:p-6 space-y-4">
        {/* Replacement */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tutor Replacement</p>
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white text-[10px] font-black text-center leading-tight">
              72h<br/>max
            </div>
            <div className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              On a genuine concern regarding the allocated tutor, replacement can be requested.
              Maximum replacement timeline: <strong>within {replacementTimelineHours} hours.</strong>
            </div>
          </div>
        </div>
        <Divider />
        {/* Class compensation */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Class Compensation</p>
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white text-[10px] font-black text-center leading-tight">
              {classCompensationNoticeHours}h<br/>notice
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              If you inform us at least <strong>{classCompensationNoticeHours} hours in advance</strong> about
              a class rescheduling or cancellation, the applicable missed class can be compensated
              per the service policy.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — PAYMENT TERMS & BYPASS POLICY
// ─────────────────────────────────────────────────────────────────────────────
function PaymentSection({ fees }) {
  const { bypassPenaltyMonths } = TNC_CONFIG;
  return (
    <SectionCard id="payment">
      <SectionHead
        icon={IndianRupee}
        iconColor="text-blue-600 dark:text-blue-400"
        bg="bg-blue-50 dark:bg-blue-900/20"
        title="Payment Terms & Bypass Policy"
      />
      <div className="p-4 sm:p-6 space-y-5">
        {/* Two fee types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Admission / Onboarding Fee</p>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2"><ArrowRight className="h-3 w-3 text-blue-400 shrink-0" />One-time payment</li>
              <li className="flex items-center gap-2"><ArrowRight className="h-3 w-3 text-blue-400 shrink-0" />{TNC_CONFIG.admissionFeePercent}% of one month's tuition</li>
              <li className="flex items-center gap-2"><ArrowRight className="h-3 w-3 text-blue-400 shrink-0" />Payable after tutor confirmation</li>
              <li className="flex items-center gap-2"><ArrowRight className="h-3 w-3 text-blue-400 shrink-0" />Paid before first regular class</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">Monthly Tuition Fee</p>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2"><ArrowRight className="h-3 w-3 text-emerald-400 shrink-0" />Regular monthly tuition</li>
              <li className="flex items-center gap-2"><ArrowRight className="h-3 w-3 text-emerald-400 shrink-0" />Paid directly to Saraswati Tutorials</li>
              <li className="flex items-center gap-2"><ArrowRight className="h-3 w-3 text-emerald-400 shrink-0" />Starts from the beginning of the second month</li>
            </ul>
          </div>
        </div>

        <Divider />

        {/* Bypass policy */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Bypass / Direct Payment Policy — Prohibited
          </p>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 mb-3">
            {[
              "Directly hiring the tutor outside Saraswati Tutorials.",
              "Continuing tutor services without institute involvement.",
              "Making direct or indirect payments to the tutor without institute confirmation.",
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                {rule}
              </li>
            ))}
          </ul>

          {/* Bypass penalty */}
          <div className="flex items-start gap-3 rounded-xl border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-black text-red-700 dark:text-red-300 uppercase tracking-wide">
                Bypass Penalty — {bypassPenaltyMonths} Months' Tuition Fee
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                Penalty applicable: <strong>{formatINR(fees.bypassPenalty)}</strong> (= {bypassPenaltyMonths} × {formatINR(fees.tuition)})
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9 — TERMINATION & NOTICE
// ─────────────────────────────────────────────────────────────────────────────
function TerminationSection() {
  const { noticePeriodDays, academicYearValidity } = TNC_CONFIG;
  return (
    <SectionCard id="termination">
      <SectionHead
        icon={CalendarX2}
        iconColor="text-slate-600 dark:text-slate-400"
        bg="bg-slate-50 dark:bg-slate-700/40"
        title="Termination / Notice Period"
      />
      <div className="p-4 sm:p-6 space-y-3">
        <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-700 dark:bg-slate-600 text-white text-[10px] font-black text-center leading-tight">
            {noticePeriodDays}d
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Replacement or discontinuation requests require a minimum of{" "}
            <strong className="text-slate-900 dark:text-slate-100">{noticePeriodDays} days' notice.</strong>
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 px-4 py-2.5">
          <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Validity:</strong> {academicYearValidity} — Tutors are committed for the full academic year to
            ensure continuity through examination periods.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10 — ACCEPTANCE (checkbox + buttons)
// ─────────────────────────────────────────────────────────────────────────────
function AcceptanceSection({ fees, onAccept, onDecline, status }) {
  const [checked, setChecked] = useState(false);
  const disabled = !checked || status === "loading";

  return (
    <div id="acceptance" className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-blue-300 dark:border-blue-600 shadow-md p-4 sm:p-6 space-y-5">
      <div>
        <h2 className="text-base font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 mb-1">
          Terms & Conditions Acceptance
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Please read all sections above before proceeding.
        </p>
      </div>

      {/* Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group select-none">
        <div
          onClick={() => setChecked(!checked)}
          role="checkbox"
          aria-checked={checked}
          tabIndex={0}
          onKeyDown={(e) => e.key === " " && setChecked(!checked)}
          className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            checked
              ? "bg-blue-600 border-blue-600"
              : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 group-hover:border-blue-400"
          }`}
        >
          {checked && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          I have read and understood the Terms & Conditions and agree to proceed with{" "}
          <strong className="text-slate-900 dark:text-slate-100">Saraswati Tutorials.</strong>
        </span>
      </label>

      {!checked && (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Please check the box above to enable Accept and Decline.
        </p>
      )}

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          id="tnc-accept-btn"
          onClick={() => onAccept(fees)}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-sm px-6 py-3.5 transition-all duration-200 ${
            disabled
              ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-md shadow-emerald-500/20 cursor-pointer"
          }`}
        >
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          I Accept
        </button>
        <button
          id="tnc-decline-btn"
          onClick={onDecline}
          disabled={disabled}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border-2 font-bold text-sm px-6 py-3.5 transition-all duration-200 ${
            disabled
              ? "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed"
              : "border-red-600 dark:border-red-500 text-red-600 dark:text-red-450 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
          }`}
        >
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
          Decline
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW MODAL — shown after clicking Accept
// ─────────────────────────────────────────────────────────────────────────────
function PreviewModal({ fees, onConfirm, onBack, submitting }) {
  const cfg = TNC_CONFIG;
  // Prevent body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 shrink-0">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Confirmation Summary</p>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">Please review before confirming</p>
          </div>
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer">
            <XIcon className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Modal body — scrollable */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3 text-sm">
          <Row label="Monthly Tuition" value={formatINR(fees.tuition)} />
          <Row label="Admission / Onboarding Fee" value={`${cfg.admissionFeePercent}% — ${formatINR(fees.admissionFee)}`} accent />
          <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Services Included</p>
            {["Tutor Verification", "Tutor Shortlisting & Allocation", "Home Tutor Allocation", "Parent Support", "Backup / Replacement", "Parent Dashboard"].map((s) => (
              <p key={s} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 py-0.5">
                <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />{s}
              </p>
            ))}
          </div>
          <Row label="First Demo" value="FREE" />
          <Row label="Additional Demo" value={`${formatINR(cfg.additionalDemoFeeRs)} / ${cfg.demoDurationHours} hour`} />
          <Row label="Tutor Replacement" value={`Within ${cfg.replacementTimelineHours} hours`} />
          <Row label="Class Compensation" value={`With ${cfg.classCompensationNoticeHours}-hour advance notice`} />
          <Row label="Admission Fee" value="Prepaid after tutor confirmation" />
          <Row label="Tuition Starts" value="From beginning of 2nd month" />
          <Row label="Bypass Penalty" value={`${cfg.bypassPenaltyMonths} months' tuition fee`} warn />
          <Row label="Notice Period" value={`${cfg.noticePeriodDays} days`} />
          <Row label="Validity" value={cfg.academicYearValidity} />
          <Row label="Terms Version" value={cfg.termsVersion} />
        </div>

        {/* Modal footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={onBack}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-sm py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Go Back
          </button>
          <button
            id="tnc-confirm-btn"
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 shadow-md shadow-emerald-500/20 transition active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Confirm & Accept
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent, warn }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
      <span className={`font-semibold text-right ${warn ? "text-red-600 dark:text-red-400" : accent ? "text-emerald-700 dark:text-emerald-300" : "text-slate-800 dark:text-slate-200"}`}>
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DECLINE WARNING
// ─────────────────────────────────────────────────────────────────────────────
function DeclineWarning({ onGoBack }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center space-y-4 animate-fadeIn">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
        <XCircle className="h-7 w-7 text-slate-400 dark:text-slate-500" />
      </div>
      <div>
        <p className="font-bold text-slate-800 dark:text-slate-100">
          These Terms & Conditions are required to proceed.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          We are unable to proceed with tutor allocation or services without acceptance
          of these Terms & Conditions.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onGoBack}
          className="rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-sm px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          Go Back
        </button>
        <a
          href="https://wa.me/918904457689"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-6 py-3 transition cursor-pointer inline-flex items-center justify-center gap-2"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS STATE
// ─────────────────────────────────────────────────────────────────────────────
function AcceptedState() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-300 dark:border-emerald-600 p-6 text-center space-y-3 animate-fadeIn">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <p className="font-bold text-emerald-800 dark:text-emerald-300">Terms & Conditions Accepted!</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your acceptance has been recorded. Redirecting you to WhatsApp...
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────────────────────────────────────
function PageHeader() {
  return (
    <div className="flex items-center gap-2 sm:gap-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 px-3 py-2.5 sm:px-5 sm:py-4">
      <img
        src="/logo.png"
        alt="Saraswati Tutorials"
        className="h-8 sm:h-11 w-auto max-w-[100px] sm:max-w-[130px] object-contain block shrink-0"
        loading="eager"
      />
      <div className="h-8 sm:h-10 w-px bg-slate-200 dark:bg-slate-600 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm sm:text-base font-extrabold tracking-tight text-slate-800 dark:text-slate-100 leading-tight truncate">
          Saraswati Tutorials
        </p>
        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          Bangalore &amp; Mumbai
        </p>
      </div>
      <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-full px-3 py-1 shrink-0 whitespace-nowrap">
        <ShieldCheck className="h-3.5 w-3.5" />
        Official Document
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function TermsConditions() {
  const [monthlyTuition]  = useState(() => getMonthlyTuition());
  const fees               = computeFees(monthlyTuition);

  // "idle" | "preview" | "submitting" | "accepted" | "declined"
  const [flow, setFlow]   = useState("idle");
  const acceptRef          = useRef(null);

  const handleAcceptClick = () => setFlow("preview");

  const handleDeclineClick = () => {
    recordAction("dismissed");
    setFlow("declined");
  };

  const handleConfirm = async () => {
    setFlow("submitting");
    await recordAction("accepted", {
      feeSnapshot: {
        tuition:       fees.tuition,
        admissionFee:  fees.admissionFee,
        backupComponent: fees.backupComponent,
      },
    });
    setFlow("accepted");
    // WhatsApp redirect after short delay
    setTimeout(() => {
      window.location.href = TNC_CONFIG.whatsappReturnUrl;
    }, 2000);
  };

  const handleBack = () => setFlow("idle");

  // Scroll acceptance into view after decline → go back
  useEffect(() => {
    if (flow === "idle" && acceptRef.current) {
      acceptRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [flow]);

  return (
    <>
      <Helmet>
        <title>Parent Onboarding & Terms | Saraswati Tutorials</title>
        <meta name="description" content="Read and accept the official Saraswati Tutorials Parent Onboarding Guide — services, demo policy, fees, and terms." />
        <meta property="og:title" content="Parent Onboarding & Terms | Saraswati Tutorials" />
        <meta property="og:description" content="Your complete onboarding guide before starting home tutoring with Saraswati Tutorials." />
        <meta property="og:url" content="https://tnc.saraswatitutorials.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://saraswatitutorial.com/logo.png" />
      </Helmet>

      {/* Preview modal */}
      {(flow === "preview" || flow === "submitting") && (
        <PreviewModal
          fees={fees}
          onConfirm={handleConfirm}
          onBack={handleBack}
          submitting={flow === "submitting"}
        />
      )}

      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-200 pb-16">
        {/* Sticky header */}
        <div className="sticky top-0 z-40 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <PageHeader />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pt-6 space-y-4">

          {/* Hero */}
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full px-4 py-1.5 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              Official Parent Guide
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
              Parent Onboarding &amp; Terms
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Please read all sections carefully before accepting.
            </p>
          </div>

          {/* All sections */}
          <ServicesSection />
          <FeeSection fees={fees} />
          <FeeCoversSection fees={fees} />
          <DemoSection />
          <ReservationSection />
          <RefundSection fees={fees} />
          <ReplacementSection />
          <PaymentSection fees={fees} />
          <TerminationSection />

          {/* Acceptance / Decline / Accepted */}
          <div ref={acceptRef}>
            {flow === "idle" && (
              <AcceptanceSection
                fees={fees}
                onAccept={handleAcceptClick}
                onDecline={handleDeclineClick}
                status="idle"
              />
            )}
            {flow === "declined" && (
              <DeclineWarning onGoBack={handleBack} />
            )}
            {flow === "accepted" && (
              <AcceptedState />
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-4">
            © {new Date().getFullYear()} Saraswati Tutorials. All rights reserved.{" "}
            Terms Version: {TNC_CONFIG.termsVersion}
          </p>
        </div>
      </div>
    </>
  );
}
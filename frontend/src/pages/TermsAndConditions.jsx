import React, { useState } from "react";
import { ShieldCheck, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { API_BASE } from "../config";

async function recordTncAction(action) {
  try {
    await fetch(`${API_BASE}/tnc/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        source: "terms-conditions",
        pageVersion: "v1",
      }),
    });
  } catch (err) {
    console.error("TNC record error:", err);
  }
}

export default function TermsConditions() {
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "accepted" | "dismissed"

  const handleAccept = async () => {
    setStatus("loading");
    await recordTncAction("accepted");
    setStatus("accepted");
  };

  const handleDismiss = async () => {
    setStatus("loading");
    await recordTncAction("dismissed");
    setStatus("dismissed");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-200 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* ── HEADER — Logo + Brand Name ──────────────────────── */}
        <div className="flex items-center gap-4 mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 px-6 py-4">
          <img
            src="/logo.png"
            alt="Saraswati Tutorials"
            className="h-12 w-auto max-w-[120px] object-contain block shrink-0"
            loading="eager"
          />
          <div className="h-10 w-px bg-slate-200 dark:bg-slate-600 shrink-0" />
          <div>
            <p className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
              Saraswati Tutorials
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Bangalore &amp; Mumbai
            </p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-full px-3 py-1 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5" />
            Official Document
          </div>
        </div>

        {/* ── MAIN CARD ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">

          <h1 className="text-3xl font-bold mb-1 text-slate-900 dark:text-slate-100">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
            Last Updated: April 2026
          </p>

          <p className="mb-6 text-slate-700 dark:text-slate-300">
            By enrolling with <strong className="text-slate-900 dark:text-slate-100">Saraswati Tutorials</strong>, you agree to the following terms:
          </p>

          <hr className="border-slate-200 dark:border-slate-700 mb-6" />

          {/* SECTION 1 */}
          <section className="mb-7">
            <h2 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200">
              1. Admission Fee Structure
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              The admission fee is allocated towards the following services:
            </p>
            <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-2">
              <li><strong className="text-slate-900 dark:text-slate-100">20%</strong> – Tutor Assignment &amp; Demo Arrangement</li>
              <li><strong className="text-slate-900 dark:text-slate-100">20%</strong> – Tutor Background Verification (ID, education, experience, feedback)</li>
              <li><strong className="text-slate-900 dark:text-slate-100">20%</strong> – Backup &amp; Replacement Support</li>
              <li><strong className="text-slate-900 dark:text-slate-100">20%</strong> – Tutor Monitoring (attendance, punctuality, teaching quality)</li>
              <li><strong className="text-slate-900 dark:text-slate-100">20%</strong> – End-to-End Support Assistance</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-700 mb-6" />

          {/* SECTION 2 — DEMO SESSION POLICY (NEW) */}
          <section className="mb-7">
            <h2 className="font-bold text-lg mb-1 text-slate-800 dark:text-slate-200">
              2. Demo Session Policy
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Saraswati Tutorials offers a structured demo session process to help parents find the right tutor for their child.
            </p>

            {/* Two-card layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

              {/* Free first demo */}
              <div className="relative rounded-2xl border-2 border-emerald-400 dark:border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-5 overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                  Complimentary
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
                  First Demo Session
                </p>
                <p className="text-4xl font-black text-emerald-700 dark:text-emerald-300 leading-none mb-1">
                  ₹0
                </p>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Absolutely free — no charges, no obligation.
                </p>
                <ul className="mt-3 space-y-1 text-xs text-emerald-700 dark:text-emerald-300">
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    Duration: 1 hour
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    One demo per tutor shortlisted
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    Full evaluation with no commitment
                  </li>
                </ul>
              </div>

              {/* Paid additional demos */}
              <div className="relative rounded-2xl border-2 border-amber-400 dark:border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-5 overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                  Chargeable
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
                  Additional Demo Sessions
                </p>
                <p className="text-4xl font-black text-amber-700 dark:text-amber-300 leading-none mb-1">
                  ₹500
                </p>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Per additional 1-hour demo session.
                </p>
                <ul className="mt-3 space-y-1 text-xs text-amber-700 dark:text-amber-300">
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    Duration: 1 hour per session
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    Applicable from the 2nd demo onwards
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    Payable before the session begins
                  </li>
                </ul>
              </div>
            </div>

            {/* Policy note */}
            <div className="flex items-start gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 px-4 py-3">
              <span className="mt-0.5 text-blue-500 dark:text-blue-400 text-base leading-none shrink-0">ℹ</span>
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                <strong>Please note:</strong> If you wish to evaluate a different tutor after the first complimentary demo,
                each subsequent demo session will be charged at <strong>₹500 per hour</strong>. This policy ensures
                our tutors' time is respected and helps us maintain a high standard of service quality.
              </p>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-slate-700 mb-6" />

          {/* SECTION 3 */}
          <section className="mb-7">
            <h2 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200">
              3. Refund &amp; Cancellation Policy
            </h2>
            <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-2">
              <li>
                The admission fee is{" "}
                <strong className="text-red-600 dark:text-red-400">non-refundable</strong>,
                as services are initiated during the demo and onboarding stage.
              </li>
              <li>
                If Saraswati Tutorials is unable to provide a replacement tutor within{" "}
                <strong className="text-slate-900 dark:text-slate-100">7 days</strong>, the{" "}
                <strong className="text-slate-900 dark:text-slate-100">20%</strong> allocated for backup &amp; replacement will be refunded.
              </li>
              <li>No refunds will be provided once services have been initiated and fulfilled.</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-700 mb-6" />

          {/* SECTION 4 */}
          <section className="mb-7">
            <h2 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200">
              4. Payment Terms
            </h2>
            <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-2">
              <li>All payments must be made directly to Saraswati Tutorials.</li>
              <li>
                Parents/guardians are strictly{" "}
                <strong className="text-red-600 dark:text-red-400">prohibited</strong> from making direct payments to tutors.
              </li>
              <li>
                Any violation may result in{" "}
                <strong className="text-slate-900 dark:text-slate-100">immediate termination</strong> of services without refund.
              </li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-700 mb-6" />

          {/* SECTION 5 */}
          <section className="mb-7">
            <h2 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200">
              5. Tutor Assignment &amp; Replacement
            </h2>
            <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Tutors are assigned based on requirements and availability.</li>
              <li>Replacement requests will be considered for genuine reasons only.</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-700 mb-6" />

          {/* SECTION 6 */}
          <section className="mb-7">
            <h2 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200">
              6. Termination Policy
            </h2>
            <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Either party must provide a minimum <strong className="text-slate-900 dark:text-slate-100">15 days notice</strong> for termination.</li>
              <li>
                Immediate termination may occur in case of{" "}
                <strong className="text-slate-900 dark:text-slate-100">misconduct or policy violation</strong>.
              </li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-700 mb-6" />

          {/* SECTION 7 */}
          <section className="mb-7">
            <h2 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200">
              7. Conduct &amp; Responsibility
            </h2>
            <ul className="list-disc pl-5 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Parents and tutors are expected to maintain professional conduct.</li>
              <li>Saraswati Tutorials is not liable for personal disputes beyond service facilitation.</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-700 mb-6" />

          {/* SECTION 8 */}
          <section className="mb-7">
            <h2 className="font-bold text-lg mb-3 text-slate-800 dark:text-slate-200">
              8. Jurisdiction
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              All disputes are subject to the jurisdiction of{" "}
              <strong className="text-slate-900 dark:text-slate-100">Bangalore, India</strong>.
            </p>
          </section>

          {/* FOOTNOTE */}
          <div className="mt-6 mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl text-sm text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> Payment of fees confirms acceptance of all terms and policies stated above.
          </div>

          {/* ── ACCEPT / DISMISS BUTTONS ──────────────────────────── */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            {status === "idle" || status === "loading" ? (
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Accept */}
                <button
                  id="tnc-accept-btn"
                  onClick={handleAccept}
                  disabled={status === "loading"}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm px-6 py-3.5 shadow-md shadow-emerald-500/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  I Accept the Terms &amp; Conditions
                </button>

                {/* Dismiss */}
                <button
                  id="tnc-dismiss-btn"
                  onClick={handleDismiss}
                  disabled={status === "loading"}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-bold text-sm px-6 py-3.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Dismiss
                </button>
              </div>
            ) : status === "accepted" ? (
              /* Accepted confirmation */
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 px-5 py-4 animate-fadeIn">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                    Thank you! You have accepted the Terms &amp; Conditions.
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Your acceptance has been recorded. Our team will be in touch shortly.
                  </p>
                </div>
              </div>
            ) : (
              /* Dismissed confirmation */
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 px-5 py-4 animate-fadeIn">
                <XCircle className="h-6 w-6 text-slate-400 dark:text-slate-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                    Dismissed. Your response has been recorded.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    You can contact us anytime if you have questions about our policies.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          © {new Date().getFullYear()} Saraswati Tutorials. All rights reserved.
        </p>

      </div>
    </div>
  );
}
/**
 * TNC CONFIG — Saraswati Tutorials
 *
 * Single source of truth for all business rules on the
 * Parent Onboarding / Terms & Conditions page.
 *
 * To update any policy value, change it HERE only.
 * All calculations on the page derive from this object.
 */

export const TNC_CONFIG = {
  // ── Fee structure ────────────────────────────────────────────────────────
  /** Admission / Onboarding fee as % of one month's tuition */
  admissionFeePercent: 59,

  /** % of admission fee allocated to backup & replacement support
   *  This portion MAY be refundable under the applicable condition. */
  backupReplacementPercent: 20,

  /** Fallback example tuition when no parent enquiry data is available */
  exampleMonthlyTuition: 10000,

  // ── Demo policy ──────────────────────────────────────────────────────────
  /** First demo is free. Additional demos are charged at this amount (₹). */
  additionalDemoFeeRs: 500,

  /** Duration of every demo session (hours) */
  demoDurationHours: 1,

  // ── Service timelines ────────────────────────────────────────────────────
  /** Maximum tutor replacement timeline (hours) */
  replacementTimelineHours: 72,

  /** Advance notice required for class rescheduling (hours) */
  classCompensationNoticeHours: 24,

  /** Tutor reservation window after demo — confirm admission within (hours) */
  tutorReservationHours: 24,

  /** Notice period required for replacement or discontinuation (days) */
  noticePeriodDays: 15,

  /** Validity of admission/service arrangement */
  academicYearValidity: "1 Academic Year",

  // ── Bypass penalty ───────────────────────────────────────────────────────
  /** Penalty for bypass = N × monthly tuition fee */
  bypassPenaltyMonths: 3,

  // ── Terms versioning ─────────────────────────────────────────────────────
  termsVersion: "v1",

  // ── WhatsApp redirect ────────────────────────────────────────────────────
  /**
   * Parent WhatsApp return URL.
   * Update this when the client provides the final production link.
   * Do NOT expose tokens or sensitive credentials here.
   */
  whatsappReturnUrl: "https://wa.me/message/VX2T7QEATZPRL1",
};

// ── Calculation helpers ───────────────────────────────────────────────────────

/** Format a number as Indian rupee string e.g. ₹10,000 */
export function formatINR(amount) {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

/**
 * Compute all fee-related values from a monthly tuition amount.
 * @param {number} monthlyTuition
 */
export function computeFees(monthlyTuition) {
  const tuition          = Math.round(monthlyTuition);
  const admissionFee     = Math.round(tuition * TNC_CONFIG.admissionFeePercent / 100);
  const backupComponent  = Math.round(admissionFee * TNC_CONFIG.backupReplacementPercent / 100);
  const bypassPenalty    = Math.round(tuition * TNC_CONFIG.bypassPenaltyMonths);
  return { tuition, admissionFee, backupComponent, bypassPenalty };
}

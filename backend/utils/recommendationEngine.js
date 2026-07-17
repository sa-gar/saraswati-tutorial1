/**
 * recommendationEngine.js — Saraswati Tutorials
 *
 * Produces a 4-bucket tutor recommendation set for a given parent requirement.
 *
 * Buckets:
 *   exact  — Same pincode or exact area name match
 *   nearby — Within GPS radius (NEARBY_RADIUS_KM)
 *   city   — Same city / similar area (no exact match)
 *   backup — Any positive match score (fallback)
 *
 * Each tutor entry includes:
 *   matchPercentage, distanceKm, distanceTier, reason, recommendationType, breakdown
 *
 * Performance:
 *   - Single MongoDB query via buildCentralizedQuery()
 *   - All scoring done in-memory (no N+1 queries)
 *   - .lean() used for minimal memory footprint
 */

import dotenv from "dotenv";
dotenv.config();

import Tutor from "../models/Tutor.js";
import {
  buildCentralizedQuery,
  calculateTutorScore,
  compareTutors,
  computeMatchReason,
  getRecommendationType,
} from "./matchingEngine.js";

const BROADCAST_COUNT_EXACT  = Number(process.env.BROADCAST_COUNT_EXACT  || 20);
const BROADCAST_COUNT_NEARBY = Number(process.env.BROADCAST_COUNT_NEARBY || 20);
const BROADCAST_COUNT_CITY   = Number(process.env.BROADCAST_COUNT_CITY   || 30);
const BROADCAST_COUNT_BACKUP = Number(process.env.BROADCAST_COUNT_BACKUP || 30);

/**
 * Build recommendation params from a ParentEnquiry document.
 * Centralises all field extraction so callers don't need to know the schema.
 *
 * @param {Object} lead - ParentEnquiry Mongoose document or plain object
 * @param {Object} [parsedAddr] - Optional pre-parsed address (from parseAddress())
 * @returns {Object} params - Ready to pass into buildCentralizedQuery / calculateTutorScore
 */
export function buildParamsFromLead(lead, parsedAddr = {}) {
  const firstWard = lead.wards?.[0] || {};
  return {
    pincode:   lead.pincode   || parsedAddr.pincode   || "",
    area:      lead.area      || parsedAddr.area      || "",
    locality:  lead.locality  || parsedAddr.locality  || "",
    landmark:  lead.landmark  || parsedAddr.landmark  || "",
    city:      lead.city      || parsedAddr.city      || lead.geoInfo?.city || "",
    district:  lead.district  || parsedAddr.district  || "",
    state:     lead.state     || parsedAddr.state     || lead.geoInfo?.region || "",
    grade:     firstWard.classGrade || "",
    board:     firstWard.curriculum || "",
    subjects:  Array.isArray(firstWard.subjectsNeeded) ? firstWard.subjectsNeeded : [],
    timing:    lead.preferredTime || "",
    gender:    lead.preferredGender || "No Preference",
    latitude:  lead.latitude  || null,
    longitude: lead.longitude || null,
  };
}

/**
 * Get 4-bucket tutor recommendations for a given set of requirement params.
 *
 * @param {Object} params - Built via buildParamsFromLead() or constructed manually
 * @returns {Promise<{
 *   exact: Array,
 *   nearby: Array,
 *   city: Array,
 *   backup: Array,
 *   total: number,
 *   totalCandidates: number,
 * }>}
 */
export async function getRecommendations(params) {
  // ── 1. Single bulk DB query ───────────────────────────────────────────────
  const query = buildCentralizedQuery(params);
  const tutors = await Tutor.find(query).lean(); // .lean() → plain JS objects, faster

  console.log(`[RecommendationEngine] ${tutors.length} approved/unblocked tutors found`);

  // ── 2. Score all tutors in-memory ─────────────────────────────────────────
  const scored = tutors
    .map((tutor) => {
      const scoreInfo = calculateTutorScore(params, tutor);
      return {
        // Tutor fields
        _id:               tutor._id,
        name:              tutor.name,
        phone:             tutor.phone,
        whatsapp:          tutor.whatsapp,
        tutorCode:         tutor.tutorCode,
        area:              tutor.area,
        city:              tutor.city,
        pincode:           tutor.pincode,
        location:          tutor.location,
        locations:         tutor.locations,
        gender:            tutor.gender,
        grades:            tutor.grades,
        subjects:          tutor.subjects,
        boards:            tutor.boards,
        timings:           tutor.timings,
        experience:        tutor.experience,
        availabilityStatus: tutor.availabilityStatus,
        onboardingCompleted: tutor.onboardingCompleted,
        onboardingMessageSentAt: tutor.onboardingMessageSentAt,
        status:            tutor.status,
        // Scoring fields
        matchPercentage:   scoreInfo.percentage,
        matchScore:        scoreInfo.score,
        locationScore:     scoreInfo.locationScore,
        distanceKm:        scoreInfo.distanceKm,
        distanceTier:      scoreInfo.distanceTier,
        breakdown:         scoreInfo.breakdown,
        reason:            computeMatchReason(params, tutor, scoreInfo),
        recommendationType: getRecommendationType(scoreInfo, params),
      };
    })
    .filter((t) => t.matchPercentage > 0);

  console.log(`[RecommendationEngine] ${scored.length} tutors passed match filter`);

  // ── 3. Segment into 4 buckets (no duplicates across buckets) ─────────────
  const seen = new Set();

  const addToBucket = (filter, limit) =>
    scored
      .filter((t) => filter(t) && !seen.has(String(t._id)))
      .sort(compareTutors)
      .slice(0, limit)
      .map((t) => { seen.add(String(t._id)); return t; });

  const exact = addToBucket(
    (t) => t.recommendationType === "exact",
    BROADCAST_COUNT_EXACT
  );

  const nearby = addToBucket(
    (t) => t.recommendationType === "nearby",
    BROADCAST_COUNT_NEARBY
  );

  const city = addToBucket(
    (t) => t.recommendationType === "city",
    BROADCAST_COUNT_CITY
  );

  const backup = addToBucket(
    () => true, // any remaining tutor with matchPercentage > 0
    BROADCAST_COUNT_BACKUP
  );

  const total = seen.size;

  console.log(
    `[RecommendationEngine] Buckets — Exact: ${exact.length}, ` +
    `Nearby: ${nearby.length}, City: ${city.length}, Backup: ${backup.length} | Total: ${total}`
  );

  return {
    exact,
    nearby,
    city,
    backup,
    total,
    totalCandidates: scored.length,
  };
}

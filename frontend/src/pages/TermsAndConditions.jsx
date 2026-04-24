import React from "react";

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Last Updated: April 2026
        </p>

        <p className="mb-6 text-gray-700">
          By enrolling with <strong>Saraswati Tutorials</strong>, you agree to the following terms:
        </p>

        {/* SECTION 1 */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-3">
            1. Admission Fee Structure
          </h2>

          <p className="text-gray-700 mb-3">
            The admission fee is allocated towards the following services:
          </p>

          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li><strong>20%</strong> – Tutor Assignment & Demo Arrangement</li>
            <li><strong>20%</strong> – Tutor Background Verification (ID, education, experience, feedback)</li>
            <li><strong>20%</strong> – Backup & Replacement Support</li>
            <li><strong>20%</strong> – Tutor Monitoring (attendance, punctuality, teaching quality)</li>
            <li><strong>20%</strong> – End-to-End Support Assistance</li>
          </ul>
        </section>

        {/* SECTION 2 */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-3">
            2. Refund & Cancellation Policy
          </h2>

          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>
              The admission fee is <strong className="text-red-600">non-refundable</strong>, 
              as services are initiated during the demo and onboarding stage.
            </li>
            <li>
              If Saraswati Tutorials is unable to provide a replacement tutor within 
              <strong> 7 days</strong>, the <strong>20%</strong> allocated for backup & replacement will be refunded.
            </li>
            <li>
              No refunds will be provided once services have been initiated and fulfilled.
            </li>
          </ul>
        </section>

        {/* SECTION 3 */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-3">
            3. Payment Terms
          </h2>

          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>All payments must be made directly to Saraswati Tutorials.</li>
            <li>
              Parents/guardians are strictly <strong className="text-red-600">prohibited </strong> 
              from making direct payments to tutors.
            </li>
            <li>
              Any violation may result in <strong>immediate termination</strong> of services without refund.
            </li>
          </ul>
        </section>

        {/* SECTION 4 */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-3">
            4. Tutor Assignment & Replacement
          </h2>

          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>Tutors are assigned based on requirements and availability.</li>
            <li>Replacement requests will be considered for genuine reasons only.</li>
          </ul>
        </section>

        {/* SECTION 5 */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-3">
            5. Termination Policy
          </h2>

          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>Either party must provide a minimum <strong>15 days notice</strong> for termination.</li>
            <li>
              Immediate termination may occur in case of <strong>misconduct or policy violation</strong>.
            </li>
          </ul>
        </section>

        {/* SECTION 6 */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-3">
            6. Conduct & Responsibility
          </h2>

          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>Parents and tutors are expected to maintain professional conduct.</li>
            <li>
              Saraswati Tutorials is not liable for personal disputes beyond service facilitation.
            </li>
          </ul>
        </section>

        {/* SECTION 7 */}
        <section>
          <h2 className="font-semibold text-lg mb-3">
            7. Jurisdiction
          </h2>

          <p className="text-gray-700">
            All disputes are subject to the jurisdiction of <strong>Bangalore, India</strong>.
          </p>
        </section>

        {/* FOOT NOTE */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>Note:</strong> Payment of fees confirms acceptance of all terms and policies stated above.
        </div>

      </div>
    </div>
  );
}
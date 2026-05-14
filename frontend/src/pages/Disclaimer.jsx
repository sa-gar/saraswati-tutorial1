import React from "react";

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Disclaimer
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Last Updated: April 2026
        </p>

        <p className="mb-6 text-gray-700">
          Saraswati Tutorials acts as a facilitator connecting students/parents with qualified tutors.
        </p>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">1. No Guarantee of Results</h2>
          <p className="text-gray-700">
            We do not guarantee specific academic results, ranks, or exam outcomes.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">2. Tutor Performance</h2>
          <p className="text-gray-700">
            While we conduct background verification, teaching effectiveness may vary based on student compatibility and effort.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">3. Role of Platform</h2>
          <p className="text-gray-700">
            We provide tutor matching, support, and monitoring services. However, the actual teaching is conducted independently by tutors.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">4. Parental Responsibility</h2>
          <p className="text-gray-700">
            Parents/guardians are advised to monitor sessions and provide feedback for better outcomes.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">5. External Factors</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Student absence</li>
            <li>Technical issues (for online classes)</li>
            <li>External circumstances beyond our control</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">6. Limitation of Liability</h2>
          <p className="text-gray-700">
            Saraswati Tutorials shall not be held liable for indirect, incidental, or consequential damages arising from use of services.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">7. Policy Acceptance</h2>
          <p className="text-gray-700">
            By using our services, you acknowledge and agree to this disclaimer.
          </p>
        </section>

      </div>
    </div>
  );
}
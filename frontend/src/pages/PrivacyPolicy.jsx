import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Last Updated: April 2026
        </p>

        <p className="mb-6 text-gray-700">
          At <strong>Saraswati Tutorials</strong>, we are committed to protecting the privacy of our students, parents, and tutors.
        </p>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">1. Information We Collect</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Name of student/parent</li>
            <li>Contact details (phone number, email)</li>
            <li>Location/address for tutor assignment</li>
            <li>Academic details (class, subjects, curriculum)</li>
            <li>Payment-related information (processed securely via third-party providers)</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">2. How We Use Information</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>Assigning suitable tutors based on requirements</li>
            <li>Scheduling demo sessions and classes</li>
            <li>Providing customer support</li>
            <li>Improving our services</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">3. Data Protection</h2>
          <p className="text-gray-700">
            We take reasonable measures to protect personal data from unauthorized access, misuse, or disclosure.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">4. Sharing of Information</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            <li>We do not sell or rent personal data.</li>
            <li>Limited information may be shared with assigned tutors strictly for service purposes.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">5. Confidentiality</h2>
          <p className="text-gray-700">
            All tutor and student details are treated as confidential and used only for operational purposes.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">6. Third-Party Services</h2>
          <p className="text-gray-700">
            Payments and communications may involve trusted third-party platforms. Saraswati Tutorials is not responsible for third-party policies.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-2">7. Consent</h2>
          <p className="text-gray-700">
            By using our services, you consent to this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-lg mb-2">8. Updates</h2>
          <p className="text-gray-700">
            We may update this policy from time to time. Continued use of services implies acceptance of changes.
          </p>
        </section>

      </div>
    </div>
  );
}
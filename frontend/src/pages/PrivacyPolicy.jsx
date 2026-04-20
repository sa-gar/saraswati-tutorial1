import React from "react";


export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-6">Last Updated: April 2026</p>


        <section className="mb-5">
          <h2 className="font-semibold text-lg mb-2">1. Information We Collect</h2>
          <p>
            We collect information such as name, phone number, email address,
            location, and educational or professional details from tutors.
          </p>
        </section>


        <section className="mb-5">
          <h2 className="font-semibold text-lg mb-2">2. How We Use Your Information</h2>
          <p>
            Your data is used to connect parents with tutors, respond to inquiries,
            improve services, and send important updates.
          </p>
        </section>


        <section className="mb-5">
          <h2 className="font-semibold text-lg mb-2">3. Third-Party Tools</h2>
          <p>
            We may use third-party services like Zapier, Google Sheets, and WhatsApp
            for automation and communication purposes.
          </p>
        </section>


        <section className="mb-5">
          <h2 className="font-semibold text-lg mb-2">4. Data Protection</h2>
          <p>
            We take reasonable measures to protect your data, but no system is completely secure.
          </p>
        </section>


        <section className="mb-5">
          <h2 className="font-semibold text-lg mb-2">5. User Rights</h2>
          <p>
            Users can request access, correction, or deletion of their data and can opt-out of communications.
          </p>
        </section>


        <section>
          <h2 className="font-semibold text-lg mb-2">6. Contact Us</h2>
          <p>Email: support@saraswatitutorials.com</p>
        </section>
      </div>
    </div>
  );
}


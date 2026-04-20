import React from "react";


export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow">
        <h1 className="text-3xl font-bold mb-4">Disclaimer</h1>
        <p className="text-sm text-gray-500 mb-6">Last Updated: April 2026</p>


        <section className="mb-5">
          <h2 className="font-semibold text-lg mb-2">1. Platform Role</h2>
          <p>
            Saraswati Tutorials is a platform that connects tutors and parents.
          </p>
        </section>


        <section className="mb-5">
          <h2 className="font-semibold text-lg mb-2">2. No Guarantee</h2>
          <p>
            We do not guarantee tutor performance, student results, or availability of tutors.
          </p>
        </section>


        <section className="mb-5">
          <h2 className="font-semibold text-lg mb-2">3. Independent Users</h2>
          <p>
            Tutors and parents operate independently. We are not responsible for their actions or agreements.
          </p>
        </section>


        <section className="mb-5">
          <h2 className="font-semibold text-lg mb-2">4. Verification</h2>
          <p>
            While we may verify tutor documents, we do not guarantee complete accuracy.
          </p>
        </section>


        <section>
          <h2 className="font-semibold text-lg mb-2">5. Limitation of Liability</h2>
          <p>
            Saraswati Tutorials is not liable for disputes, losses, or damages arising from platform use.
          </p>
        </section>
      </div>
    </div>
  );
}


import { useEffect, useState } from "react";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

export default function AdminDashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/enquiries`)
      .then((res) => res.json())
      .then((data) => setEnquiries(data))
      .catch((err) => console.error(err));

    fetch(`${API_BASE}/bookings`)
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error(err));

    fetch(`${API_BASE}/tutors`)
      .then((res) => res.json())
      .then((data) => setTutors(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">Admin Dashboard</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-slate-800">Enquiries</h2>
        {enquiries.length === 0 ? (
          <p className="text-slate-500">No enquiries yet.</p>
        ) : (
          <div className="space-y-4">
            {enquiries.map((e) => (
              <div key={e._id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p><b>Parent:</b> {e.parentName}</p>
                <p><b>Student:</b> {e.studentName}</p>
                <p><b>Phone:</b> {e.phone}</p>
                <p><b>Email:</b> {e.email}</p>
                <p><b>Subject:</b> {e.subjectNeeded}</p>
                <p><b>Message:</b> {e.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold text-slate-800">Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-slate-500">No bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p><b>Tutor:</b> {b.tutorName}</p>
                <p><b>Learner:</b> {b.learnerName}</p>
                <p><b>Phone:</b> {b.phone}</p>
                <p><b>Date:</b> {b.preferredDate}</p>
                <p><b>Slot:</b> {b.preferredSlot}</p>
                <p><b>Status:</b> {b.status}</p>
                <p><b>Message:</b> {b.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold text-slate-800">Tutors</h2>
        {tutors.length === 0 ? (
          <p className="text-slate-500">No tutors yet.</p>
        ) : (
          <div className="space-y-4">
            {tutors.map((t) => (
              <div key={t._id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p><b>Name:</b> {t.name}</p>
                <p><b>Subject:</b> {t.subject}</p>
                <p><b>Qualification:</b> {t.qualification}</p>
                <p><b>Location:</b> {t.location}</p>
                <p><b>Experience:</b> {t.experience}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
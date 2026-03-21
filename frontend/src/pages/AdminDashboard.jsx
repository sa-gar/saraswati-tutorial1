import { useEffect, useState } from "react";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

export default function AdminDashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [eRes, bRes, tRes] = await Promise.all([
        fetch(`${API_BASE}/enquiries`),
        fetch(`${API_BASE}/bookings`),
        fetch(`${API_BASE}/tutors`)
      ]);

      const [eData, bData, tData] = await Promise.all([
        eRes.json(),
        bRes.json(),
        tRes.json()
      ]);

      setEnquiries(eData);
      setBookings(bData);
      setTutors(tData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ❌ DELETE tutor
  const deleteTutor = async (id) => {
    if (!confirm("Delete this tutor?")) return;

    await fetch(`${API_BASE}/tutors/${id}`, {
      method: "DELETE",
    });

    fetchData(); // refresh
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={fetchData}
          className="bg-black text-white px-4 py-2 rounded-xl"
        >
          Refresh
        </button>
      </div>

      {loading && <p>Loading data...</p>}

      {/* ENQUIRIES */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Enquiries</h2>
        {enquiries.map((e) => (
          <div key={e._id} className="bg-white p-4 rounded-xl shadow mb-3">
            <p><b>{e.parentName}</b> → {e.studentName}</p>
            <p>{e.phone} | {e.email}</p>
            <p>{e.subjectNeeded}</p>
          </div>
        ))}
      </section>

      {/* BOOKINGS */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Bookings</h2>
        {bookings.map((b) => (
          <div key={b._id} className="bg-white p-4 rounded-xl shadow mb-3">
            <p><b>{b.tutorName}</b></p>
            <p>{b.learnerName} | {b.phone}</p>
            <p>{b.preferredDate} - {b.preferredSlot}</p>
          </div>
        ))}
      </section>

      {/* TUTORS */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Tutors</h2>
        {tutors.map((t) => (
          <div key={t._id} className="bg-white p-4 rounded-xl shadow mb-3 flex justify-between items-center">
            <div>
              <p className="font-semibold">{t.name}</p>
              <p>{t.subject}</p>
              <p className="text-sm text-gray-500">{t.location}</p>
            </div>

            <button
              onClick={() => deleteTutor(t._id)}
              className="bg-red-500 text-white px-3 py-1 rounded-lg"
            >
              Delete
            </button>
          </div>
        ))}
      </section>

    </div>
  );
}
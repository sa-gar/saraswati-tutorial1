import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

export default function AdminDashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingTutor, setEditingTutor] = useState(null);
const [editForm, setEditForm] = useState({
  name: "",
  subject: "",
  qualification: "",
  location: "",
  experience: "",
  price: "",
  about: "",
  photo: "",
});
  const [showAddForm, setShowAddForm] = useState(false);

const [newTutor, setNewTutor] = useState({
  name: "",
  subject: "",
  qualification: "",
  location: "",
  experience: "",
  price: "",
  about: "",
  photo: "",
});

  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    navigate("/admin-login");
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eRes, bRes, tRes] = await Promise.all([
        fetch(`${API_BASE}/enquiries`),
        fetch(`${API_BASE}/bookings`),
        fetch(`${API_BASE}/tutors`),
      ]);

      const [eData, bData, tData] = await Promise.all([
        eRes.json(),
        bRes.json(),
        tRes.json(),
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

  const deleteTutor = async (id) => {
    if (!window.confirm("Delete this tutor?")) return;

    await fetch(`${API_BASE}/tutors/${id}`, {
      method: "DELETE",
    });

    fetchData();
  };

 const startEditTutor = (tutor) => {
  setEditingTutor(tutor);
  setEditForm({
    name: tutor.name || "",
    subject: tutor.subject || "",
    qualification: tutor.qualification || "",
    location: tutor.location || "",
    experience: tutor.experience || "",
    price: tutor.price || "",
    about: tutor.about || "",
    photo: tutor.photo || "",
  });
};

  const saveTutorEdit = async () => {
    if (!editingTutor) return;

    const res = await fetch(`${API_BASE}/tutors/${editingTutor._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editForm),
    });

    if (res.ok) {
      setEditingTutor(null);
      fetchData();
    } else {
      alert("Failed to update tutor");
    }
    
  };
  const createTutor = async () => {
  const res = await fetch(`${API_BASE}/tutors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTutor),
  });

  if (res.ok) {
    setShowAddForm(false);
    setNewTutor({
      name: "",
      subject: "",
      qualification: "",
      location: "",
      experience: "",
      price: "",
      about: "",
    });
    fetchData();
  } else {
    alert("Failed to add tutor");
  }
};

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-5 rounded-xl shadow text-center">
        <h3 className="text-sm text-gray-500">Total Tutors</h3>
        <p className="text-2xl font-bold">{tutors.length}</p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow text-center">
        <h3 className="text-sm text-gray-500">Total Enquiries</h3>
        <p className="text-2xl font-bold">{enquiries.length}</p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow text-center">
        <h3 className="text-sm text-gray-500">Total Bookings</h3>
        <p className="text-2xl font-bold">{bookings.length}</p>
      </div>
    </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="rounded-xl bg-black px-4 py-2 text-white"
          >
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-300 px-4 py-2"
          >
            Logout
          </button>
          <button
  onClick={() => setShowAddForm(true)}
  className="bg-green-600 text-white px-4 py-2 rounded-xl"
>
  + Add Tutor
</button>
{showAddForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="mb-4 text-2xl font-bold">Add Tutor</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="rounded-xl border px-4 py-3"
          placeholder="Name"
          value={newTutor.name}
          onChange={(e) => setNewTutor({ ...newTutor, name: e.target.value })}
        />
        <input
          className="rounded-xl border px-4 py-3"
          placeholder="Subject"
          value={newTutor.subject}
          onChange={(e) => setNewTutor({ ...newTutor, subject: e.target.value })}
        />
        <input
          className="rounded-xl border px-4 py-3"
          placeholder="Qualification"
          value={newTutor.qualification}
          onChange={(e) => setNewTutor({ ...newTutor, qualification: e.target.value })}
        />
        <input
          className="rounded-xl border px-4 py-3"
          placeholder="Location"
          value={newTutor.location}
          onChange={(e) => setNewTutor({ ...newTutor, location: e.target.value })}
        />
        <input
          className="rounded-xl border px-4 py-3"
          placeholder="Experience"
          value={newTutor.experience}
          onChange={(e) => setNewTutor({ ...newTutor, experience: e.target.value })}
        />
        <input
          className="rounded-xl border px-4 py-3"
          placeholder="Price"
          value={newTutor.price}
          onChange={(e) => setNewTutor({ ...newTutor, price: e.target.value })}
        />
        <input
  className="rounded-xl border px-4 py-3 md:col-span-2"
  placeholder="Photo URL"
  value={newTutor.photo}
  onChange={(e) => setNewTutor({ ...newTutor, photo: e.target.value })}
/>
      </div>

      <textarea
        className="mt-4 w-full rounded-xl border px-4 py-3"
        placeholder="About"
        value={newTutor.about}
        onChange={(e) => setNewTutor({ ...newTutor, about: e.target.value })}
      />

      <div className="mt-6 flex gap-3">
        <button
          onClick={createTutor}
          className="bg-black text-white px-5 py-3 rounded-xl"
        >
          Add Tutor
        </button>
        <button
          onClick={() => setShowAddForm(false)}
          className="border px-5 py-3 rounded-xl"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
        </div>
      </div>

      {loading && <p>Loading data...</p>}

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Enquiries</h2>
        {enquiries.length === 0 ? (
          <p className="text-slate-500">No enquiries yet.</p>
        ) : (
          enquiries.map((e) => (
            <div key={e._id} className="mb-3 rounded-xl bg-white p-4 shadow">
              <p><b>{e.parentName}</b> → {e.studentName}</p>
              <p>{e.phone} | {e.email}</p>
              <p>{e.subjectNeeded}</p>
              <p className="text-sm text-slate-500">{e.message}</p>
            </div>
          ))
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold">Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-slate-500">No bookings yet.</p>
        ) : (
          bookings.map((b) => (
            <div key={b._id} className="mb-3 rounded-xl bg-white p-4 shadow">
              <p><b>{b.tutorName}</b></p>
              <p>{b.learnerName} | {b.phone}</p>
              <p>{b.preferredDate} - {b.preferredSlot}</p>
              <p className="text-sm text-slate-500">{b.message}</p>
            </div>
          ))
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Tutors</h2>
        {tutors.length === 0 ? (
          <p className="text-slate-500">No tutors yet.</p>
        ) : (
          tutors.map((t) => (
            <div
  key={t._id}
  className="mb-3 flex flex-col justify-between gap-4 rounded-xl bg-white p-4 shadow md:flex-row md:items-center"
>
  <div className="flex items-center gap-4">
    {t.photo ? (
      <img
        src={t.photo}
        alt={t.name}
        className="h-16 w-16 rounded-xl object-cover"
      />
    ) : (
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        No Image
      </div>
    )}

    <div>
      <p className="font-semibold">{t.name}</p>
      <p>{t.subject}</p>
      <p className="text-sm text-gray-500">{t.location}</p>
    </div>
  </div>

  <div className="flex gap-2">
    <button
      onClick={() => startEditTutor(t)}
      className="rounded-lg bg-blue-600 px-3 py-1 text-white"
    >
      Edit
    </button>
    <button
      onClick={() => deleteTutor(t._id)}
      className="rounded-lg bg-red-500 px-3 py-1 text-white"
    >
      Delete
    </button>
  </div>
</div>
          ))
        )}
      </section>

      {editingTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold">Edit Tutor</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <input
                className="rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Subject"
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
              />
              <input
                className="rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Qualification"
                value={editForm.qualification}
                onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
              />
              <input
                className="rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
              <input
                className="rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Experience"
                value={editForm.experience}
                onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
              />
              <input
                className="rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Price"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              />
              <input
  className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2"
  placeholder="Photo URL"
  value={editForm.photo}
  onChange={(e) => setEditForm({ ...editForm, photo: e.target.value })}
/>
            </div>

            <textarea
              className="mt-4 min-h-[120px] w-full rounded-xl border border-slate-300 px-4 py-3"
              placeholder="About"
              value={editForm.about}
              onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={saveTutorEdit}
                className="rounded-xl bg-black px-5 py-3 text-white"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingTutor(null)}
                className="rounded-xl border border-slate-300 px-5 py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
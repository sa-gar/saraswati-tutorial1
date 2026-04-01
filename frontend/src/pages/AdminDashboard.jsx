import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

export default function AdminDashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [parentEnquiries, setParentEnquiries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  const [blogForm, setBlogForm] = useState({
    title: "",
    content: "",
    image: "",
  });
  const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"]
  ]
};

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
    phone: "",
    category: "",
    mode: "",
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
    phone: "",
    category: "",
    mode: "",
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
      const [eRes, peRes, bRes, tRes, blogRes] = await Promise.all([
        fetch(`${API_BASE}/enquiries`),
        fetch(`${API_BASE}/parent-enquiries`),
        fetch(`${API_BASE}/bookings`),
        fetch(`${API_BASE}/tutors`),
        fetch(`${API_BASE}/blogs`),
      ]);

      const [eData, peData, bData, tData, blogData] = await Promise.all([
        eRes.json(),
        peRes.json(),
        bRes.json(),
        tRes.json(),
        blogRes.json(),
      ]);

      setEnquiries(Array.isArray(eData) ? eData : []);
      setParentEnquiries(Array.isArray(peData) ? peData : []);
      setBookings(Array.isArray(bData) ? bData : []);
      setTutors(Array.isArray(tData) ? tData : []);
      setBlogs(Array.isArray(blogData) ? blogData : []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteTutor = async (id) => {
    const token = localStorage.getItem("adminToken");
    if (!window.confirm("Delete this tutor?")) return;

    try {
      const res = await fetch(`${API_BASE}/tutors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("Failed to delete tutor");
        return;
      }

      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete tutor");
    }
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
      phone: tutor.phone || "",
      category: tutor.category || "",
      mode: tutor.mode || "",
    });
  };

  const saveTutorEdit = async () => {
    const token = localStorage.getItem("adminToken");

    try {
      const res = await fetch(`${API_BASE}/tutors/${editingTutor._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setEditingTutor(null);
        fetchData();
      } else {
        alert("Failed to update tutor");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update tutor");
    }
  };

  const createTutor = async () => {
    const token = localStorage.getItem("adminToken");

    try {
      const res = await fetch(`${API_BASE}/tutors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
          photo: "",
          phone: "",
          category: "",
          mode: "",
        });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add tutor");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add tutor");
    }
  };

  const createBlog = async () => {
    try {
      const res = await fetch(`${API_BASE}/blogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogForm),
      });

      if (res.ok) {
        alert("Blog added");
        setBlogForm({ title: "", content: "", image: "" });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add blog");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add blog");
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm("Delete this blog?")) return;

    try {
      const res = await fetch(`${API_BASE}/blogs/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete blog");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete blog");
    }
  };
  const handleBlogImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Upload failed");
      return;
    }

    setBlogForm({
      ...blogForm,
      image: data.imageUrl,
    });

  } catch (error) {
    console.error(error);
    alert("Image upload failed");
  }
};

  const filteredTutors = tutors.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-xl bg-green-600 px-4 py-2 text-white"
          >
            + Add Tutor
          </button>

          <button
            onClick={fetchData}
            className="rounded-xl bg-black px-4 py-2 text-white"
          >
            Refresh
          </button>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-slate-900 px-4 py-2 text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded-xl bg-white p-5 text-center shadow">
          <h3 className="text-sm text-gray-500">Tutors</h3>
          <p className="text-2xl font-bold">{tutors.length}</p>
        </div>

        <div className="rounded-xl bg-white p-5 text-center shadow">
          <h3 className="text-sm text-gray-500">Enquiries</h3>
          <p className="text-2xl font-bold">{enquiries.length}</p>
        </div>

        <div className="rounded-xl bg-white p-5 text-center shadow">
          <h3 className="text-sm text-gray-500">Parent Enquiries</h3>
          <p className="text-2xl font-bold">{parentEnquiries.length}</p>
        </div>

        <div className="rounded-xl bg-white p-5 text-center shadow">
          <h3 className="text-sm text-gray-500">Bookings</h3>
          <p className="text-2xl font-bold">{bookings.length}</p>
        </div>

        <div className="rounded-xl bg-white p-5 text-center shadow">
          <h3 className="text-sm text-gray-500">Blogs</h3>
          <p className="text-2xl font-bold">{blogs.length}</p>
        </div>
      </div>

      {loading && <p className="mb-6">Loading data...</p>}

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Parent Enquiries
        </h2>

        {parentEnquiries.length === 0 ? (
          <p className="text-gray-500">No parent enquiries yet.</p>
        ) : (
          parentEnquiries.map((p) => (
            <div key={p._id} className="mb-4 rounded-xl bg-white p-4 shadow">
              <p>
                <b>Parent:</b> {p.parentName}
              </p>
              <p>
                <b>Phone:</b> {p.phone}
              </p>
              <p>
                <b>Email:</b> {p.email}
              </p>
              <p>
                <b>Occupation:</b> {p.occupation}
                {p.occupationType ? ` (${p.occupationType})` : ""}
              </p>
              <p>
                <b>Area:</b> {p.area}
              </p>
              <p>
                <b>PIN Code:</b> {p.pincode}
              </p>
              <p>
                <b>Preferred Mode:</b> {p.preferredMode}
              </p>
              <p>
                <b>Preferred Gender:</b> {p.preferredGender}
              </p>
              <p>
                <b>Preferred Time:</b> {p.preferredTime}
              </p>
              <p>
                <b>Preferred Days:</b> {p.preferredDays?.join(", ")}
              </p>

              <div className="mt-3">
                <p className="font-semibold">Wards:</p>
                {p.wards?.map((ward, index) => (
                  <div key={index} className="mt-2 rounded-lg bg-slate-50 p-3">
                    <p>
                      <b>Ward Name:</b> {ward.wardName || ward.fullName}
                    </p>
                    <p>
                      <b>School:</b> {ward.schoolName}
                    </p>
                    <p>
                      <b>Class:</b> {ward.classGrade}
                    </p>
                    <p>
                      <b>Subjects:</b> {ward.subjectsNeeded}
                    </p>
                    <p>
                      <b>Performance:</b> {ward.currentPerformance}
                    </p>
                    <p>
                      <b>Special Notes:</b> {ward.specialNeeds}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Enquiries
        </h2>

        {enquiries.length === 0 ? (
          <p className="text-gray-500">No enquiries yet.</p>
        ) : (
          enquiries.map((e) => (
            <div key={e._id} className="mb-3 rounded-xl bg-white p-4 shadow">
              <p>
                <b>{e.parentName}</b> → {e.studentName}
              </p>
              <p>
                {e.phone} | {e.email}
              </p>
              <p>{e.subjectNeeded}</p>
            </div>
          ))
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Bookings
        </h2>

        {bookings.length === 0 ? (
          <p className="text-gray-500">No bookings yet.</p>
        ) : (
          bookings.map((b) => (
            <div key={b._id} className="mb-3 rounded-xl bg-white p-4 shadow">
              <p>
                <b>{b.tutorName}</b>
              </p>
              <p>
                {b.learnerName} | {b.phone}
              </p>
              <p>
                {b.preferredDate} - {b.preferredSlot}
              </p>
            </div>
          ))
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Tutors</h2>

        <input
          placeholder="Search tutors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full rounded-xl border px-4 py-2"
        />

        {tutors.length === 0 ? (
          <p className="text-gray-500">No tutors yet.</p>
        ) : (
          filteredTutors.map((t) => (
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

      <section className="mt-10 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold">Add Blog</h2>

        <input
          placeholder="Title"
          className="mb-3 w-full rounded border p-2"
          value={blogForm.title}
          onChange={(e) =>
            setBlogForm({ ...blogForm, title: e.target.value })
          }
        />

        <textarea
          placeholder="Content"
          className="mb-3 w-full rounded border p-2"
          value={blogForm.content}
          onChange={(e) =>
            setBlogForm({ ...blogForm, content: e.target.value })
          }
        />

   <input
  type="file"
  accept="image/*"
  onChange={handleBlogImageUpload}
  className="mb-3 w-full rounded border p-2"
/>
{blogForm.image && (
  <img
    src={blogForm.image}
    alt="preview"
    className="mb-3 h-40 w-full rounded object-cover"
  />
)}
        <button
          onClick={createBlog}
          className="rounded bg-black px-4 py-2 text-white"
        >
          Add Blog
        </button>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">All Blogs</h2>

        {blogs.length === 0 ? (
          <p className="text-gray-500">No blogs yet.</p>
        ) : (
          blogs.map((blog) => (
            <div key={blog._id} className="mb-4 rounded-xl bg-white p-4 shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold">{blog.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {blog.content?.slice(0, 150)}...
                  </p>
                </div>

                <button
                  onClick={() => deleteBlog(blog._id)}
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
                className="rounded-xl border px-4 py-3"
                placeholder="Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Subject"
                value={editForm.subject}
                onChange={(e) =>
                  setEditForm({ ...editForm, subject: e.target.value })
                }
              />
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Qualification"
                value={editForm.qualification}
                onChange={(e) =>
                  setEditForm({ ...editForm, qualification: e.target.value })
                }
              />
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Location"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
              />
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Experience"
                value={editForm.experience}
                onChange={(e) =>
                  setEditForm({ ...editForm, experience: e.target.value })
                }
              />
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Price"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm({ ...editForm, price: e.target.value })
                }
              />
              <input
                className="rounded-xl border px-4 py-3 md:col-span-2"
                placeholder="Phone"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
              />
              <input
                className="rounded-xl border px-4 py-3 md:col-span-2"
                placeholder="Photo URL"
                value={editForm.photo}
                onChange={(e) =>
                  setEditForm({ ...editForm, photo: e.target.value })
                }
              />
            </div>

            <textarea
              className="mt-4 min-h-[120px] w-full rounded-xl border px-4 py-3"
              placeholder="About"
              value={editForm.about}
              onChange={(e) =>
                setEditForm({ ...editForm, about: e.target.value })
              }
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
                className="rounded-xl border px-5 py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold">Add Tutor</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Name"
                value={newTutor.name}
                onChange={(e) =>
                  setNewTutor({ ...newTutor, name: e.target.value })
                }
              />
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Subject"
                value={newTutor.subject}
                onChange={(e) =>
                  setNewTutor({ ...newTutor, subject: e.target.value })
                }
              />
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Qualification"
                value={newTutor.qualification}
                onChange={(e) =>
                  setNewTutor({ ...newTutor, qualification: e.target.value })
                }
              />
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Location"
                value={newTutor.location}
                onChange={(e) =>
                  setNewTutor({ ...newTutor, location: e.target.value })
                }
              />
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Experience"
                value={newTutor.experience}
                onChange={(e) =>
                  setNewTutor({ ...newTutor, experience: e.target.value })
                }
              />
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Price"
                value={newTutor.price}
                onChange={(e) =>
                  setNewTutor({ ...newTutor, price: e.target.value })
                }
              />
              <input
                className="rounded-xl border px-4 py-3"
                placeholder="Phone Number"
                value={newTutor.phone}
                onChange={(e) =>
                  setNewTutor({ ...newTutor, phone: e.target.value })
                }
              />
              <input
                className="rounded-xl border px-4 py-3 md:col-span-2"
                placeholder="Image URL (photo)"
                value={newTutor.photo}
                onChange={(e) =>
                  setNewTutor({ ...newTutor, photo: e.target.value })
                }
              />
            </div>

            <textarea
              className="mt-4 w-full rounded-xl border px-4 py-3"
              placeholder="About"
              value={newTutor.about}
              onChange={(e) =>
                setNewTutor({ ...newTutor, about: e.target.value })
              }
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={createTutor}
                className="rounded-xl bg-black px-5 py-3 text-white"
              >
                Add Tutor
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-xl border px-5 py-3"
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
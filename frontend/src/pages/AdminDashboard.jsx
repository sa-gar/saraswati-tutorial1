import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

<<<<<<< HEAD
const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://saraswati-tutorial1-2.onrender.com/api";
=======
const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";
const EDUCATION_CERT_PASSWORD = "saraswati7250";
>>>>>>> 8f142b29bf537008dd681b9eac78e44e8e54db5c

const LEAD_STATUSES = [
  "New Lead",
  "Fees Finalized",
  "Demo Scheduled",
  "Feedback Pending",
  "Won",
  "Lost",
];

const FILTER_OPTIONS = [
  "All Leads",
  "New Lead",
  "Fees Finalized",
  "Demo Scheduled",
  "Feedback Pending",
  "Won",
  "Lost",
];

const emptyTutor = {
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
};

function normalizeLeadStatus(status) {
  if (!status || status === "New") return "New Lead";
  if (status === "Contacted") return "Fees Finalized";
  if (status === "Assigned") return "Demo Scheduled";
  if (status === "Closed") return "Won";
  return status;
}

function formatSubmittedDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  const datePart = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timePart = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart} | ${timePart}`;
}

function getClassDuration(parentEnquiry) {
  return (
    parentEnquiry?.classDuration ||
    parentEnquiry?.duration ||
    parentEnquiry?.preferredClassDuration ||
    parentEnquiry?.tuitionDuration ||
    parentEnquiry?.preference?.classDuration ||
    parentEnquiry?.preferences?.classDuration ||
    "Not provided"
  );
}

function getPreferredDays(days) {
  if (Array.isArray(days) && days.length > 0) return days.join(", ");
  if (typeof days === "string" && days.trim()) return days;
  return "Not provided";
}

function getSubjects(subjects) {
  if (Array.isArray(subjects) && subjects.length > 0) return subjects.join(", ");
  if (typeof subjects === "string" && subjects.trim()) return subjects;
  return "Not provided";
}

function isOnlineLead(parentEnquiry) {
  return String(parentEnquiry?.preferredMode || "")
    .toLowerCase()
    .includes("online");
}

function getLeadLocation(parentEnquiry) {
  return (
    parentEnquiry?.area ||
    parentEnquiry?.location ||
    parentEnquiry?.locality ||
    "Location not provided"
  );
}

function buildSearchText(parentEnquiry) {
  const wardTexts =
    parentEnquiry?.wards?.map((ward) =>
      [
        ward.studentName,
        ward.fullName,
        ward.schoolName,
        ward.classGrade,
        ward.curriculum,
        Array.isArray(ward.subjectsNeeded)
          ? ward.subjectsNeeded.join(" ")
          : ward.subjectsNeeded,
      ]
        .filter(Boolean)
        .join(" ")
    ) || [];

  return [
    parentEnquiry.parentName,
    parentEnquiry.name,
    parentEnquiry.phone,
    parentEnquiry.email,
    parentEnquiry.area,
    parentEnquiry.pincode,
    parentEnquiry.address,
    parentEnquiry.preferredMode,
    parentEnquiry.preferredGender,
    parentEnquiry.preferredTime,
    parentEnquiry.startTime,
    parentEnquiry.endTime,
    getClassDuration(parentEnquiry),
    ...wardTexts,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function buildSuggestionValues(parentEnquiries) {
  const values = [];

  parentEnquiries.forEach((p) => {
    values.push(p.parentName, p.name, p.phone, p.area, p.pincode, p.address);

    p.wards?.forEach((ward) => {
      values.push(
        ward.studentName,
        ward.fullName,
        ward.schoolName,
        ward.classGrade,
        ward.curriculum
      );

      if (Array.isArray(ward.subjectsNeeded)) {
        values.push(...ward.subjectsNeeded);
      } else {
        values.push(ward.subjectsNeeded);
      }
    });
  });

  return [...new Set(values.filter(Boolean).map((v) => String(v).trim()))];
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [enquiries, setEnquiries] = useState([]);
  const [parentEnquiries, setParentEnquiries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tutors, setTutors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [leadFilter, setLeadFilter] = useState("All Leads");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [showParents, setShowParents] = useState(true);
  const [showTutors, setShowTutors] = useState(true);

  const [editingTutor, setEditingTutor] = useState(null);
  const [editForm, setEditForm] = useState(emptyTutor);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTutor, setNewTutor] = useState(emptyTutor);

  function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    navigate("/admin-login");
  }

  const fetchData = async () => {
    setLoading(true);

    try {
      const [eRes, peRes, bRes, tRes] = await Promise.all([
        fetch(`${API_BASE}/enquiries`),
        fetch(`${API_BASE}/parent-enquiries`),
        fetch(`${API_BASE}/bookings`),
        fetch(`${API_BASE}/tutors`),
      ]);

      const [eData, peData, bData, tData] = await Promise.all([
        eRes.json(),
        peRes.json(),
        bRes.json(),
        tRes.json(),
      ]);

      setEnquiries(Array.isArray(eData) ? eData : []);
      setParentEnquiries(Array.isArray(peData) ? peData : []);
      setBookings(Array.isArray(bData) ? bData : []);
      setTutors(Array.isArray(tData) ? tData : []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const suggestionValues = useMemo(() => {
    return buildSuggestionValues(parentEnquiries);
  }, [parentEnquiries]);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return [];

    return suggestionValues
      .filter((value) => value.toLowerCase().includes(q))
      .slice(0, 8);
  }, [search, suggestionValues]);

  const filteredParentEnquiries = useMemo(() => {
    const q = search.trim().toLowerCase();

    return parentEnquiries.filter((parentEnquiry) => {
      const status = normalizeLeadStatus(parentEnquiry.status);

      const matchesFilter =
        leadFilter === "All Leads" || status === leadFilter;

      const matchesSearch = !q || buildSearchText(parentEnquiry).includes(q);

<<<<<<< HEAD
      const matchesCity =
        selectedCity === "All Cities" ||
        (selectedCity === "Mumbai" && String(parentEnquiry.address || parentEnquiry.area || "").toLowerCase().includes("mumbai")) ||
        (selectedCity === "Bangalore" && !String(parentEnquiry.address || parentEnquiry.area || "").toLowerCase().includes("mumbai"));

      return matchesFilter && matchesSearch && matchesCity;
=======
      return matchesFilter && matchesSearch;
>>>>>>> 8f142b29bf537008dd681b9eac78e44e8e54db5c
    });
  }, [parentEnquiries, search, leadFilter]);

  const filteredTutors = useMemo(() => {
    return tutors.filter(
      (t) =>
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.subject?.toLowerCase().includes(search.toLowerCase()) ||
        t.location?.toLowerCase().includes(search.toLowerCase()) ||
        t.email?.toLowerCase().includes(search.toLowerCase()) ||
        t.phone?.toLowerCase().includes(search.toLowerCase())
    );
  }, [tutors, search]);

  const pendingTutors = tutors.filter(
    (t) => !t.status || t.status === "pending"
  ).length;

  const approvedTutors = tutors.filter((t) => t.status === "approved").length;
  const rejectedTutors = tutors.filter((t) => t.status === "rejected").length;

  const updateLeadStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/parent-enquiries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        alert("Failed to update lead status");
        return;
      }

      const updated = await res.json();

      setParentEnquiries((prev) =>
        prev.map((item) => (item._id === id ? updated : item))
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update lead status");
    }
  };

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
        setNewTutor(emptyTutor);
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

  const approveTutor = async (id) => {
    const token = localStorage.getItem("adminToken");

    if (!window.confirm("Approve this tutor?")) return;

    try {
      const res = await fetch(`${API_BASE}/tutors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          verified: true,
          status: "approved",
        }),
      });

      if (!res.ok) {
        alert("Failed to approve tutor");
        return;
      }

      alert("Tutor approved successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error approving tutor");
    }
  };

  const rejectTutor = async (id) => {
    const token = localStorage.getItem("adminToken");
    const comment = prompt("Enter rejection reason:");

    if (!comment) {
      alert("Rejection reason is required");
      return;
    }

    if (!window.confirm("Reject this tutor?")) return;

    try {
      const res = await fetch(`${API_BASE}/tutors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          verified: false,
          status: "rejected",
          adminComment: comment,
        }),
      });

      if (!res.ok) {
        alert("Failed to reject tutor");
        return;
      }

      alert("Tutor rejected with comment");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error rejecting tutor");
    }
  };

  const handleDeleteParentEnquiry = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/parent-enquiries/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setParentEnquiries((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-2xl md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
                Admin Control Center
              </p>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Saraswati Tutorial Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Manage parent leads, tutor approvals, bookings, search, filters,
                and lead pipeline from one dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
              >
                + Add Tutor
              </button>

              <button
                onClick={fetchData}
                className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20"
              >
                Refresh
              </button>

              <button
                onClick={handleLogout}
                className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-medium text-blue-700">
            Loading latest dashboard data...
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Tutors"
            value={tutors.length}
            subtitle={`${approvedTutors} approved`}
          />

          <StatCard
            title="Parent Leads"
<<<<<<< HEAD
            value={parentEnquiries.filter(p => selectedCity === "All Cities" || (selectedCity === "Mumbai" && String(p.address || p.area || "").toLowerCase().includes("mumbai")) || (selectedCity === "Bangalore" && !String(p.address || p.area || "").toLowerCase().includes("mumbai"))).length}
=======
            value={parentEnquiries.length}
>>>>>>> 8f142b29bf537008dd681b9eac78e44e8e54db5c
            subtitle={`${filteredParentEnquiries.length} visible`}
          />

          <StatCard
            title="General Enquiries"
            value={enquiries.length}
            subtitle="Website enquiries"
          />

          <StatCard
            title="Bookings"
            value={bookings.length}
            subtitle="Scheduled sessions"
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <MiniStat title="Pending Tutors" value={pendingTutors} color="yellow" />
          <MiniStat title="Approved Tutors" value={approvedTutors} color="green" />
          <MiniStat title="Rejected Tutors" value={rejectedTutors} color="red" />
        </div>

        <div className="mb-8 rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-3 md:grid-cols-[1fr_240px_auto_auto]">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Search parent, student, phone, area, subject, school..."
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none transition focus:border-slate-900"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-14 z-30 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onMouseDown={() => {
                        setSearch(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <select
              value={leadFilter}
              onChange={(e) => setLeadFilter(e.target.value)}
              className="h-12 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700 outline-none"
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowParents(!showParents)}
              className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
                showParents
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {showParents ? "Hide Parent Leads" : "Show Parent Leads"}
            </button>

            <button
              onClick={() => setShowTutors(!showTutors)}
              className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
                showTutors
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {showTutors ? "Hide Tutors" : "Show Tutors"}
            </button>
          </div>
        </div>

        {showParents && (
          <section className="mb-10">
            <SectionHeader
              title="Parent Leads"
              subtitle="Search, filter, and track every parent enquiry through the admission pipeline."
            />

            {filteredParentEnquiries.length === 0 ? (
              <EmptyState text="No parent leads found for this search or filter." />
            ) : (
              <div className="grid gap-5">
                {filteredParentEnquiries.map((p) => {
                  const currentStatus = normalizeLeadStatus(p.status);
                  const submittedAt = formatSubmittedDate(p.createdAt);
                  const online = isOnlineLead(p);
                  const leadLocation = getLeadLocation(p);

                  return (
                    <div
                      key={p._id}
                      className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-xl"
                    >
                      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-black text-slate-900">
                                {p.parentName || p.name || "Unnamed Parent"}
                              </h3>

                              <Badge
                                text={currentStatus}
                                color={getStatusColor(currentStatus)}
                              />

                              {online && <Badge text="Online" color="blue" />}

                              {!online && (
                                <Badge text={leadLocation} color="slate" />
                              )}
                            </div>

                            <p className="mt-2 text-sm font-semibold text-slate-500">
                              Submitted: {submittedAt}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <select
                              value={currentStatus}
                              onChange={(e) =>
                                updateLeadStatus(p._id, e.target.value)
                              }
                              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none"
                            >
                              {LEAD_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => {
                                if (window.confirm("Delete this enquiry?")) {
                                  handleDeleteParentEnquiry(p._id);
                                }
                              }}
                              className="h-11 rounded-2xl bg-red-500 px-4 text-sm font-bold text-white transition hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-5 p-5 lg:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
                            Parent Details
                          </h4>

                          <InfoRow label="Phone" value={p.phone} />
                          <InfoRow label="Email" value={p.email} />
                          {p.occupation && (
                            <InfoRow
                              label="Occupation"
                              value={`${p.occupation}${
                                p.occupationType ? ` (${p.occupationType})` : ""
                              }`}
                            />
                          )}
                          {p.address ? (
                            <InfoRow label="Address" value={p.address} />
                          ) : (
                            <>
                              <InfoRow label="Area" value={p.area} />
                              <InfoRow label="PIN Code" value={p.pincode} />
                            </>
                          )}
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
                            Tutor Preference
                          </h4>

                          <InfoRow label="Preferred Mode" value={p.preferredMode} />
                          <InfoRow
                            label="Preferred Gender"
                            value={p.preferredGender}
                          />
                          <InfoRow label="Preferred Time" value={p.preferredTime} />
                          <InfoRow
                            label="Class Duration"
                            value={getClassDuration(p)}
                          />
                          <InfoRow
                            label="Preferred Days"
                            value={getPreferredDays(p.preferredDays)}
                          />
                        </div>

                        {(p.businessName || p.professionType || p.otherOccupation) && (
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
                              Dynamic Occupation Info
                            </h4>

                            <InfoRow label="Business Name" value={p.businessName} />
                            <InfoRow
                              label="Profession Type"
                              value={p.professionType}
                            />
                            <InfoRow
                              label="Other Occupation"
                              value={p.otherOccupation}
                            />
                          </div>
                        )}
                      </div>

                      <div className="px-5 pb-5">
                        <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
                          Students / Wards
                        </h4>

                        <div className="grid gap-3 md:grid-cols-2">
                          {p.wards?.length ? (
                            p.wards.map((ward, index) => (
                              <div
                                key={index}
                                className="rounded-2xl border border-slate-200 bg-white p-4"
                              >
                                <div className="mb-3 flex items-center justify-between">
                                  <h5 className="font-black text-slate-900">
                                    Student {index + 1}
                                  </h5>
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                    {ward.classGrade || "Class NA"}
                                  </span>
                                </div>

                                <InfoRow
                                  label="Student Name"
                                  value={ward.studentName || ward.fullName}
                                />
                                <InfoRow label="School" value={ward.schoolName} />
                                <InfoRow label="Class" value={ward.classGrade} />
                                <InfoRow
                                  label="Curriculum"
                                  value={ward.curriculum}
                                />
                                <InfoRow
                                  label="Subjects"
                                  value={getSubjects(ward.subjectsNeeded)}
                                />
                                <InfoRow
                                  label="Special Notes"
                                  value={ward.specialNeeds}
                                />
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500">
                              No ward data available.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <section className="mb-10">
          <SectionHeader title="Enquiries" subtitle="General website enquiries." />

          {enquiries.length === 0 ? (
            <EmptyState text="No enquiries yet." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {enquiries.map((e) => (
                <div
                  key={e._id}
                  className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                >
                  <p className="text-lg font-black text-slate-900">
                    {e.parentName || e.name || "Unnamed"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Student: {e.studentName || "Not provided"}
                  </p>
                  <p className="mt-3 text-sm text-slate-700">
                    {e.phone || "No phone"} | {e.email || "No email"}
                  </p>
                  <p className="mt-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    {e.subjectNeeded || e.subject || "Subject not provided"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-10">
          <SectionHeader title="Bookings" subtitle="Student booking requests." />

          {bookings.length === 0 ? (
            <EmptyState text="No bookings yet." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                >
                  <p className="text-lg font-black text-slate-900">
                    {b.tutorName || "Tutor not provided"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {b.learnerName || "Learner not provided"} |{" "}
                    {b.phone || "No phone"}
                  </p>
                  <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    {b.preferredDate || "Date not provided"} -{" "}
                    {b.preferredSlot || "Slot not provided"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {showTutors && (
          <section>
            <SectionHeader
              title="Tutors"
              subtitle="Approve, reject, edit, and manage tutors."
            />

            {tutors.length === 0 ? (
              <EmptyState text="No tutors yet." />
            ) : (
              <div className="grid gap-5">
                {filteredTutors.map((t) => (
                  <div
                    key={t._id}
                    className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-xl"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row">
                      <div className="flex flex-col gap-5 sm:flex-row">
                        {t.photo ? (
                          <img
                            src={t.photo.replace(
                              "/upload/",
                              "/upload/f_auto,q_auto,w_180/"
                            )}
                            alt={t.name}
                            loading="lazy"
                            className="h-28 w-28 rounded-3xl object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-slate-100 text-sm font-bold text-slate-500">
                            No Image
                          </div>
                        )}

                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-black text-slate-900">
                              {t.name || "Unnamed Tutor"}
                            </h3>

                            {t.status === "approved" && (
                              <Badge text="Approved" color="emerald" />
                            )}
                            {t.status === "rejected" && (
                              <Badge text="Rejected" color="red" />
                            )}
                            {(!t.status || t.status === "pending") && (
                              <Badge text="Pending" color="yellow" />
                            )}
                          </div>

                          <div className="grid gap-x-8 gap-y-2 text-sm text-slate-700 md:grid-cols-2">
                            <InfoRow label="Email" value={t.email} />
                            <InfoRow label="Phone" value={t.phone} />
                            <InfoRow
                              label="Occupation"
                              value={
                                t.hasOccupation === "yes" ? t.occupation : "No"
                              }
                            />
                            <InfoRow label="Organization" value={t.organization} />
                            <InfoRow label="Experience" value={t.experience} />
                            <InfoRow
                              label="Preferred Locations"
                              value={t.locations?.join(", ")}
                            />
                            <InfoRow
                              label="Vehicle"
                              value={
                                t.hasVehicle === "yes"
                                  ? `Yes (${t.vehicleNumber || "No number"})`
                                  : "No"
                              }
                            />
                            <InfoRow
                              label="Timings"
                              value={t.timings?.join(", ")}
                            />
                          </div>

                          <div className="mt-4">
                            <p className="mb-2 text-sm font-black uppercase tracking-wide text-slate-500">
                              Documents
                            </p>

                            <div className="flex flex-wrap gap-2">
                              <DocumentLink
                                href={t.documents?.idProof}
                                label="ID Proof"
                              />

                              <ProtectedDocumentLink
                                href={t.documents?.expCert}
                                label="Education"
                                password={EDUCATION_CERT_PASSWORD}
                              />

                              <DocumentLink
                                href={t.documents?.otherDoc}
                                label="Experience"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-start gap-2 lg:flex-col">
                        <button
                          onClick={() => approveTutor(t._id)}
                          className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => rejectTutor(t._id)}
                          className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => startEditTutor(t)}
                          className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteTutor(t._id)}
                          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-black"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {editingTutor && (
          <TutorModal
            title="Edit Tutor"
            form={editForm}
            setForm={setEditForm}
            primaryText="Save Changes"
            onPrimary={saveTutorEdit}
            onClose={() => setEditingTutor(null)}
          />
        )}

        {showAddForm && (
          <TutorModal
            title="Add Tutor"
            form={newTutor}
            setForm={setNewTutor}
            primaryText="Add Tutor"
            onPrimary={createTutor}
            onClose={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  );
}

function getStatusColor(status) {
  if (status === "New Lead") return "blue";
  if (status === "Fees Finalized") return "purple";
  if (status === "Demo Scheduled") return "yellow";
  if (status === "Feedback Pending") return "orange";
  if (status === "Won") return "emerald";
  if (status === "Lost") return "red";
  return "slate";
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <p className="mt-2 text-4xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function MiniStat({ title, value, color }) {
  const colors = {
    yellow: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-red-50 text-red-700 ring-red-100",
  };

  return (
    <div className={`rounded-3xl p-5 ring-1 ${colors[color]}`}>
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-2xl font-black tracking-tight text-slate-900">
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
      {text}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <p className="text-sm leading-6">
      <span className="font-bold text-slate-800">{label}: </span>
      <span className="text-slate-600">
        {value || value === 0 ? value : "Not provided"}
      </span>
    </p>
  );
}

function Badge({ text, color = "slate" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    purple: "bg-purple-50 text-purple-700 ring-purple-100",
    orange: "bg-orange-50 text-orange-700 ring-orange-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    yellow: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${
        colors[color] || colors.slate
      }`}
    >
      {text}
    </span>
  );
}

function DocumentLink({ href, label }) {
  if (!href) {
    return (
      <span className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
        {label} Not Uploaded
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
    >
      {label}
    </a>
  );
}

function ProtectedDocumentLink({ href, label, password }) {
  const handleOpen = () => {
    if (!href) return;

    const enteredPassword = window.prompt(
      `Enter password to open ${label} certificate`
    );

    if (enteredPassword !== password) {
      alert("Incorrect password. Access denied.");
      return;
    }

    window.open(href, "_blank", "noopener,noreferrer");
  };

  if (!href) {
    return (
      <span className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
        {label} Not Uploaded
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="rounded-xl bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-100"
    >
      🔒 {label}
    </button>
  );
}

function TutorModal({ title, form, setForm, primaryText, onPrimary, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ModalInput
            placeholder="Name"
            value={form.name}
            onChange={(value) => setForm({ ...form, name: value })}
          />

          <ModalInput
            placeholder="Subject"
            value={form.subject}
            onChange={(value) => setForm({ ...form, subject: value })}
          />

          <ModalInput
            placeholder="Qualification"
            value={form.qualification}
            onChange={(value) => setForm({ ...form, qualification: value })}
          />

          <ModalInput
            placeholder="Location"
            value={form.location}
            onChange={(value) => setForm({ ...form, location: value })}
          />

          <ModalInput
            placeholder="Experience"
            value={form.experience}
            onChange={(value) => setForm({ ...form, experience: value })}
          />

          <ModalInput
            placeholder="Price"
            value={form.price}
            onChange={(value) => setForm({ ...form, price: value })}
          />

          <ModalInput
            placeholder="Phone Number"
            value={form.phone}
            onChange={(value) => setForm({ ...form, phone: value })}
          />

          <ModalInput
            placeholder="Image URL"
            value={form.photo}
            onChange={(value) => setForm({ ...form, photo: value })}
          />
        </div>

        <textarea
          className="mt-4 min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
          placeholder="About"
          value={form.about}
          onChange={(e) => setForm({ ...form, about: e.target.value })}
        />

        <div className="mt-6 flex gap-3">
          <button
            onClick={onPrimary}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-black"
          >
            {primaryText}
          </button>

          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalInput({ value, onChange, placeholder }) {
  return (
    <input
      className="h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-slate-900"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
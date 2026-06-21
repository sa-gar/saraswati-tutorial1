import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  UserCheck, 
  FileText, 
  Mail, 
  Calendar, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  LogOut, 
  Trash2, 
  Edit, 
  ShieldCheck, 
  ChevronDown, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  School, 
  BookOpen, 
  Lock, 
  Unlock, 
  Building2, 
  Check, 
  X,
  FileDown,
  Award,
  Settings,
  CreditCard
} from "lucide-react";

import { API_BASE } from "../config";
const EDUCATION_CERT_PASSWORD = "saraswati7250";

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
    ""
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
  const [drafts, setDrafts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [leadTab, setLeadTab] = useState("active");

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
      const token = localStorage.getItem("adminToken");
      const headers = {
        "Authorization": `Bearer ${token}`,
      };

      const [eRes, peRes, bRes, tRes, dRes] = await Promise.all([
        fetch(`${API_BASE}/enquiries`, { headers }),
        fetch(`${API_BASE}/parent-enquiries`, { headers }),
        fetch(`${API_BASE}/bookings`, { headers }),
        fetch(`${API_BASE}/tutors`, { headers }),
        fetch(`${API_BASE}/parent-enquiries/drafts`, { headers }),
      ]);

      const [eData, peData, bData, tData, dData] = await Promise.all([
        eRes.json(),
        peRes.json(),
        bRes.json(),
        tRes.json(),
        dRes.json(),
      ]);

      setEnquiries(Array.isArray(eData) ? eData : []);
      setParentEnquiries(Array.isArray(peData) ? peData : []);
      setBookings(Array.isArray(bData) ? bData : []);
      setTutors(Array.isArray(tData) ? tData : []);
      setDrafts(Array.isArray(dData) ? dData : []);
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

      return matchesFilter && matchesSearch;
    });
  }, [parentEnquiries, search, leadFilter]);

  const filteredDrafts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return drafts.filter((draft) => {
      const formData = draft.formData || {};
      const emailOrPhoneMatch = draft.emailOrPhone?.toLowerCase().includes(q);
      const nameMatch =
        formData.parentName?.toLowerCase().includes(q) ||
        formData.name?.toLowerCase().includes(q);
      const phoneMatch = formData.phone?.toLowerCase().includes(q);
      const emailMatch = formData.email?.toLowerCase().includes(q);
      const addressMatch = formData.address?.toLowerCase().includes(q);
      const cityMatch = draft.geoInfo?.city?.toLowerCase().includes(q);

      const matchesSearch =
        !q ||
        emailOrPhoneMatch ||
        nameMatch ||
        phoneMatch ||
        emailMatch ||
        addressMatch ||
        cityMatch;

      return matchesSearch;
    });
  }, [drafts, search]);

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
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/parent-enquiries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
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
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/parent-enquiries/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setParentEnquiries((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteDraft = async (id) => {
    if (!window.confirm("Are you sure you want to delete this incomplete draft lead?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_BASE}/parent-enquiries/drafts/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setDrafts((prev) => prev.filter((item) => item._id !== id));
      } else {
        alert("Failed to delete draft");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete draft");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe,transparent_35%),radial-gradient(circle_at_bottom_right,#f3e8ff,transparent_30%),linear-gradient(135deg,#f8fafc,#f1f5f9)] px-4 py-8 md:px-6 md:py-12">
      <style>{`
        .animate-slideFade {
          animation: slideFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes slideFade {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(226, 232, 240, 0.6);
        }
      `}</style>
      
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl relative border border-slate-800/80 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-blue-450 animate-ping" />
                <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-300">
                  Admin Control Center
                </p>
              </div>

              <h1 className="text-3.5xl font-black tracking-tight md:text-5xl bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Saraswati Tutorial Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-xs font-semibold leading-relaxed text-slate-400 md:text-sm">
                Manage parent leads, tutor approvals, bookings, search, filters,
                and lead pipeline from one unified portal.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition duration-300 hover:bg-emerald-600 hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
                Add Tutor
              </button>

              <button
                onClick={fetchData}
                className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/20 transition duration-300 hover:bg-white/20 hover:scale-[1.02] cursor-pointer"
              >
                <RefreshCw className="h-4.5 w-4.5 stroke-[2.5]" />
                Refresh
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition duration-300 hover:bg-rose-600 hover:scale-[1.02] cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5 stroke-[2.5]" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm font-medium text-blue-700 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            Loading latest dashboard data...
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Tutors"
            value={tutors.length}
            subtitle={`${approvedTutors} approved`}
            icon={Award}
            gradientClass="bg-indigo-50 text-indigo-650"
          />

          <StatCard
            title="Active Parent Leads"
            value={parentEnquiries.length}
            subtitle={`${filteredParentEnquiries.length} visible`}
            icon={Users}
            gradientClass="bg-blue-50 text-blue-650"
          />

          <StatCard
            title="Incomplete Drafts"
            value={drafts.length}
            subtitle={`${filteredDrafts.length} filtered`}
            icon={FileText}
            gradientClass="bg-amber-50 text-amber-650"
          />

          <StatCard
            title="General Enquiries"
            value={enquiries.length}
            subtitle="Website enquiries"
            icon={Mail}
            gradientClass="bg-teal-50 text-teal-650"
          />

          <StatCard
            title="Bookings"
            value={bookings.length}
            subtitle="Scheduled sessions"
            icon={Calendar}
            gradientClass="bg-purple-50 text-purple-650"
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <MiniStat title="Pending Tutors" value={pendingTutors} color="yellow" icon={Clock} />
          <MiniStat title="Approved Tutors" value={approvedTutors} color="green" icon={CheckCircle2} />
          <MiniStat title="Rejected Tutors" value={rejectedTutors} color="red" icon={XCircle} />
        </div>

        <div className="mb-8 rounded-3xl bg-white p-5 shadow-sm border border-slate-200/80">
          <div className="grid gap-4 md:grid-cols-[1fr_240px_auto_auto]">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="h-5 w-5" />
              </div>
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
                className="h-12 w-full rounded-2xl border border-slate-200/80 pl-11 pr-4 text-sm font-semibold outline-none transition duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-14 z-30 overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-slideFade">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onMouseDown={() => {
                        setSearch(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <select
                value={leadFilter}
                onChange={(e) => setLeadFilter(e.target.value)}
                className="h-12 w-full appearance-none rounded-2xl border border-slate-200/80 bg-white px-4 pr-10 text-sm font-bold text-slate-700 outline-none transition duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {FILTER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown className="h-4.5 w-4.5 stroke-[2.5]" />
              </div>
            </div>

            <button
              onClick={() => setShowParents(!showParents)}
              className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition duration-300 cursor-pointer ${
                showParents
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {showParents ? "Hide Parent Leads" : "Show Parent Leads"}
            </button>

            <button
              onClick={() => setShowTutors(!showTutors)}
              className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition duration-300 cursor-pointer ${
                showTutors
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20 hover:bg-purple-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {showTutors ? "Hide Tutors" : "Show Tutors"}
            </button>
          </div>
        </div>

        {showParents && (
          <section className="mb-10 animate-slideFade">
            <SectionHeader
              icon={Users}
              title="Parent Leads"
              subtitle="Search, filter, and track every parent enquiry through the admission pipeline."
            />

            {/* Sub-tabs for Parent Leads */}
            <div className="mb-6 flex border-b border-slate-200/80 gap-6">
              <button
                onClick={() => setLeadTab("active")}
                className={`pb-4 text-sm font-extrabold transition-all relative cursor-pointer ${
                  leadTab === "active"
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Active Leads ({filteredParentEnquiries.length})
                {leadTab === "active" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setLeadTab("drafts")}
                className={`pb-4 text-sm font-extrabold transition-all relative cursor-pointer ${
                  leadTab === "drafts"
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Incomplete Drafts ({filteredDrafts.length})
                {leadTab === "drafts" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            </div>

            {leadTab === "active" ? (
              filteredParentEnquiries.length === 0 ? (
                <EmptyState text="No parent leads found for this search or filter." />
              ) : (
                <div className="grid gap-5">
                  {filteredParentEnquiries.map((p) => {
                    const currentStatus = normalizeLeadStatus(p.status);
                    const submittedAt = formatSubmittedDate(p.createdAt);
                    const online = isOnlineLead(p);
                    const leadLocation = getLeadLocation(p);

                    const borderColors = {
                      "New Lead": "border-l-4 border-l-blue-500",
                      "Fees Finalized": "border-l-4 border-l-purple-500",
                      "Demo Scheduled": "border-l-4 border-l-amber-500",
                      "Feedback Pending": "border-l-4 border-l-orange-500",
                      "Won": "border-l-4 border-l-emerald-500",
                      "Lost": "border-l-4 border-l-rose-500",
                    };
                    const borderClass = borderColors[currentStatus] || "border-l-4 border-l-slate-400";

                    return (
                      <div
                        key={p._id}
                        className={`overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-200/80 transition duration-300 hover:shadow-lg ${borderClass} animate-slideFade`}
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

                                {!online && leadLocation && (
                                  <Badge text={leadLocation} color="slate" />
                                )}

                                {p.geoInfo?.city && (
                                  <Badge
                                    text={`Filled from: ${p.geoInfo.city}, ${p.geoInfo.region || ""}`}
                                    color="emerald"
                                  />
                                )}
                                
                                {p.ipAddress && (
                                  <span className="text-xs text-slate-400 font-semibold">
                                    IP: {p.ipAddress}
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 text-xs font-bold text-slate-450">
                                Submitted: {submittedAt}
                              </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                              <div className="relative">
                                <select
                                  value={currentStatus}
                                  onChange={(e) =>
                                    updateLeadStatus(p._id, e.target.value)
                                  }
                                  className="h-11 appearance-none rounded-2xl border border-slate-200 bg-white pl-4 pr-10 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                                >
                                  {LEAD_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                  <ChevronDown className="h-4 w-4" />
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  if (window.confirm("Delete this enquiry?")) {
                                    handleDeleteParentEnquiry(p._id);
                                  }
                                }}
                                className="h-11 flex items-center justify-center gap-1.5 rounded-2xl bg-rose-500 px-4 text-xs font-bold text-white transition hover:bg-rose-600 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-5 p-5 lg:grid-cols-3">
                          <div className="rounded-2xl bg-slate-50/60 border border-slate-100 p-5 transition hover:bg-slate-50">
                            <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <User className="h-4 w-4 text-blue-500" />
                              Parent Details
                            </h4>

                            <div className="space-y-1">
                              <InfoRow icon={Phone} label="Phone" value={p.phone} />
                              <InfoRow icon={Mail} label="Email" value={p.email} />
                              {p.occupation && (
                                <InfoRow
                                  icon={Briefcase}
                                  label="Occupation"
                                  value={`${p.occupation}${
                                    p.occupationType ? ` (${p.occupationType})` : ""
                                  }`}
                                />
                              )}
                              {p.address ? (
                                <InfoRow icon={MapPin} label="Address" value={p.address} />
                              ) : (
                                <>
                                  <InfoRow icon={MapPin} label="Area" value={p.area} />
                                  <InfoRow icon={MapPin} label="PIN Code" value={p.pincode} />
                                </>
                              )}
                            </div>
                          </div>

                          <div className="rounded-2xl bg-slate-50/60 border border-slate-100 p-5 transition hover:bg-slate-50">
                            <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <Settings className="h-4 w-4 text-purple-500" />
                              Tutor Preference
                            </h4>

                            <div className="space-y-1">
                              <InfoRow icon={BookOpen} label="Preferred Mode" value={p.preferredMode} />
                              <InfoRow icon={User} label="Preferred Gender" value={p.preferredGender} />
                              <InfoRow icon={Clock} label="Preferred Time" value={p.preferredTime} />
                              <InfoRow icon={Clock} label="Class Duration" value={getClassDuration(p)} />
                              <InfoRow icon={Calendar} label="Preferred Days" value={getPreferredDays(p.preferredDays)} />
                            </div>
                          </div>

                          {p.planType && (
                            <div className="rounded-2xl bg-blue-50/40 border border-blue-100 p-5 transition hover:bg-blue-50/60">
                              <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                                <Award className="h-4 w-4 text-blue-500" />
                                Selected Plan & Pricing
                              </h4>
                              <div className="space-y-1">
                                <InfoRow icon={Award} label="Plan Type" value={p.planType.charAt(0).toUpperCase() + p.planType.slice(1)} />
                                <InfoRow icon={Calendar} label="Days / Week" value={p.daysPerWeek ? `${p.daysPerWeek} Days` : "Not specified"} />
                                <InfoRow icon={Clock} label="Hours / Day" value={p.hoursPerDay ? `${p.hoursPerDay} Hr` : "Not specified"} />
                                <InfoRow icon={CreditCard} label="Monthly Fee" value={p.monthlyFees ? `₹${p.monthlyFees.toLocaleString('en-IN')}` : "Not specified"} />
                              </div>
                            </div>
                          )}

                          {(p.businessName || p.professionType || p.otherOccupation) && (
                            <div className="rounded-2xl bg-slate-50/60 border border-slate-100 p-5 transition hover:bg-slate-50">
                              <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Briefcase className="h-4 w-4 text-indigo-500" />
                                Dynamic Occupation Info
                              </h4>

                              <div className="space-y-1">
                                <InfoRow icon={Building2} label="Business Name" value={p.businessName} />
                                <InfoRow icon={Briefcase} label="Profession Type" value={p.professionType} />
                                <InfoRow icon={Briefcase} label="Other Occupation" value={p.otherOccupation} />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="px-5 pb-5">
                          <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <GraduationCap className="h-4.5 w-4.5 text-indigo-500" />
                            Students / Wards
                          </h4>

                          <div className="grid gap-4 md:grid-cols-2">
                            {p.wards?.length ? (
                              p.wards.map((ward, index) => (
                                <div
                                  key={index}
                                  className="rounded-2xl border border-slate-200/85 bg-white p-5 shadow-sm transition duration-200 hover:shadow"
                                >
                                  <div className="mb-3.5 flex items-center justify-between">
                                    <h5 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                      <User className="h-4 w-4 text-slate-400" />
                                      Student {index + 1}
                                    </h5>
                                    <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-650">
                                      {ward.classGrade ? `Class ${ward.classGrade}` : "Class NA"}
                                    </span>
                                  </div>

                                  <div className="space-y-0.5">
                                    <InfoRow icon={User} label="Student Name" value={ward.studentName || ward.fullName} />
                                    <InfoRow icon={School} label="School" value={ward.schoolName} />
                                    <InfoRow icon={GraduationCap} label="Class" value={ward.classGrade} />
                                    <InfoRow icon={BookOpen} label="Curriculum" value={ward.curriculum} />
                                    <InfoRow icon={BookOpen} label="Subjects" value={getSubjects(ward.subjectsNeeded)} />
                                    <InfoRow icon={AlertCircle} label="Special Notes" value={ward.specialNeeds} />
                                  </div>
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
              )
            ) : (
              filteredDrafts.length === 0 ? (
                <EmptyState text="No incomplete draft leads found for this search." />
              ) : (
                <div className="grid gap-5">
                  {filteredDrafts.map((p) => (
                    <div
                      key={p._id}
                      className="overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-200/80 border-l-4 border-l-amber-500 transition duration-300 hover:shadow-lg animate-slideFade"
                    >
                      <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50/20 to-white p-5">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-black text-slate-900">
                                {p.formData?.parentName || p.formData?.name || "Anonymous Parent"}
                              </h3>

                              <Badge
                                text={`Dropped at Step ${p.stepReached}`}
                                color="yellow"
                              />

                              {p.geoInfo?.city && (
                                <Badge
                                  text={`Filled from: ${p.geoInfo.city}, ${p.geoInfo.region || ""}`}
                                  color="emerald"
                                />
                              )}
                              
                              {p.ipAddress && (
                                <span className="text-xs text-slate-400 font-semibold">
                                  IP: {p.ipAddress}
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-xs font-bold text-slate-450">
                              Last Updated: {formatSubmittedDate(p.updatedAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteDraft(p._id)}
                              className="h-11 flex items-center justify-center gap-1.5 rounded-2xl bg-rose-500 px-4 text-xs font-bold text-white transition hover:bg-rose-650 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete Draft
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-5 p-5 lg:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50/60 border border-slate-100 p-5 transition hover:bg-slate-50">
                          <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <User className="h-4 w-4 text-blue-500" />
                            Contact Details
                          </h4>

                          <div className="space-y-1">
                            <InfoRow icon={Phone} label="Phone" value={p.formData?.phone || p.emailOrPhone} />
                            <InfoRow icon={Mail} label="Email" value={p.formData?.email || p.emailOrPhone} />
                            <InfoRow icon={MapPin} label="Address" value={p.formData?.address} />
                          </div>
                        </div>

                        {p.stepReached >= 3 && p.formData?.preferredMode ? (
                          <div className="rounded-2xl bg-slate-50/60 border border-slate-100 p-5 transition hover:bg-slate-50">
                            <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <Settings className="h-4 w-4 text-purple-500" />
                              Tutor Preference
                            </h4>
                            <div className="space-y-1">
                              <InfoRow icon={BookOpen} label="Preferred Mode" value={p.formData.preferredMode} />
                              <InfoRow icon={User} label="Preferred Gender" value={p.formData.preferredGender} />
                              <InfoRow icon={Clock} label="Preferred Time" value={p.formData.preferredTime || (p.formData.startTime && `${p.formData.startTime} - ${p.formData.endTime}`)} />
                              <InfoRow icon={Clock} label="Class Duration" value={p.formData.classDuration} />
                              <InfoRow icon={Calendar} label="Preferred Days" value={getPreferredDays(p.formData.preferredDays)} />
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl bg-slate-50/40 border border-dashed border-slate-200 p-5 flex flex-col justify-center items-center text-center">
                            <AlertCircle className="h-5 w-5 text-slate-400 mb-2" />
                            <p className="text-xs font-bold text-slate-400">Tutor Preferences</p>
                            <p className="text-[10px] text-slate-400 mt-1">Not reached/filled yet</p>
                          </div>
                        )}

                        {p.formData?.planType ? (
                          <div className="rounded-2xl bg-amber-50/20 border border-amber-100 p-5 transition hover:bg-amber-50/30">
                            <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-amber-750 flex items-center gap-1.5">
                              <Award className="h-4 w-4 text-amber-700" />
                              Selected Plan & Pricing
                            </h4>
                            <div className="space-y-1">
                              <InfoRow icon={Award} label="Plan Type" value={p.formData.planType.charAt(0).toUpperCase() + p.formData.planType.slice(1)} />
                              <InfoRow icon={Calendar} label="Days / Week" value={p.formData.daysPerWeek ? `${p.formData.daysPerWeek} Days` : "Not specified"} />
                              <InfoRow icon={Clock} label="Hours / Day" value={p.formData.hoursPerDay ? `${p.formData.hoursPerDay} Hr` : "Not specified"} />
                              <InfoRow icon={CreditCard} label="Monthly Fee" value={p.formData.monthlyFees ? `₹${p.formData.monthlyFees.toLocaleString('en-IN')}` : "Not specified"} />
                            </div>
                          </div>
                        ) : null}

                        {p.geoInfo && Object.keys(p.geoInfo).length > 0 && (
                          <div className="rounded-2xl bg-slate-50/60 border border-slate-100 p-5 transition hover:bg-slate-50">
                            <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-emerald-500" />
                              Geolocation Meta
                            </h4>
                            <div className="space-y-1">
                              <InfoRow icon={MapPin} label="IP Address" value={p.ipAddress} />
                              <InfoRow icon={MapPin} label="City" value={p.geoInfo.city} />
                              <InfoRow icon={MapPin} label="Region" value={p.geoInfo.region} />
                              <InfoRow icon={MapPin} label="Postal PIN" value={p.geoInfo.postal} />
                              <InfoRow icon={MapPin} label="Country" value={p.geoInfo.country} />
                              <InfoRow icon={Building2} label="Provider (Org)" value={p.geoInfo.org} />
                            </div>
                          </div>
                        )}
                      </div>

                      {p.stepReached >= 2 && p.formData?.wards?.length > 0 ? (
                        <div className="px-5 pb-5">
                          <h4 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <GraduationCap className="h-4.5 w-4.5 text-indigo-500" />
                            Wards/Students Details (Incomplete)
                          </h4>

                          <div className="grid gap-4 md:grid-cols-2">
                            {p.formData.wards.map((ward, index) => (
                              <div
                                key={index}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                              >
                                <div className="mb-3.5 flex items-center justify-between">
                                  <h5 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                    <User className="h-4 w-4 text-slate-400" />
                                    Student {index + 1}
                                  </h5>
                                  <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                                    {ward.classGrade ? `Class ${ward.classGrade}` : "Class NA"}
                                  </span>
                                </div>

                                <div className="space-y-0.5">
                                  <InfoRow icon={User} label="Student Name" value={ward.studentName || ward.fullName} />
                                  <InfoRow icon={School} label="School" value={ward.schoolName} />
                                  <InfoRow icon={GraduationCap} label="Class" value={ward.classGrade} />
                                  <InfoRow icon={BookOpen} label="Curriculum" value={ward.curriculum} />
                                  <InfoRow icon={BookOpen} label="Subjects" value={getSubjects(ward.subjectsNeeded)} />
                                  <InfoRow icon={AlertCircle} label="Special Notes" value={ward.specialNeeds} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )
            )}
          </section>
        )}

        <section className="mb-10 animate-slideFade">
          <SectionHeader icon={Mail} title="Enquiries" subtitle="General website enquiries." />

          {enquiries.length === 0 ? (
            <EmptyState text="No enquiries yet." />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {enquiries.map((e) => (
                <div
                  key={e._id}
                  className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 transition duration-300 hover:shadow-lg"
                >
                  <p className="text-lg font-black text-slate-900">
                    {e.parentName || e.name || "Unnamed"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Student: {e.studentName || "Not provided"}
                  </p>
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    {e.phone || "No phone"} | {e.email || "No email"}
                  </p>
                  <p className="mt-3 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                    Subject required: {e.subjectNeeded || e.subject || "Subject not provided"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-10 animate-slideFade">
          <SectionHeader icon={Calendar} title="Bookings" subtitle="Student booking requests." />

          {bookings.length === 0 ? (
            <EmptyState text="No bookings yet." />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 transition duration-300 hover:shadow-lg"
                >
                  <p className="text-lg font-black text-slate-900">
                    Tutor: {b.tutorName || "Tutor not provided"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-650">
                    Learner: {b.learnerName || "Learner not provided"} | Phone: {b.phone || "No phone"}
                  </p>
                  <p className="mt-3 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                    Slot: {b.preferredDate || "Date not provided"} - {b.preferredSlot || "Slot not provided"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {showTutors && (
          <section className="mb-10 animate-slideFade">
            <SectionHeader
              icon={Award}
              title="Tutors"
              subtitle="Approve, reject, edit, and manage tutors."
            />

            {tutors.length === 0 ? (
              <EmptyState text="No tutors yet." />
            ) : (
              <div className="grid gap-5">
                {filteredTutors.map((t) => {
                  const statusBorderColors = {
                    approved: "border-l-4 border-l-emerald-500",
                    rejected: "border-l-4 border-l-rose-500",
                    pending: "border-l-4 border-l-amber-500",
                  };
                  const tStatus = t.status || "pending";
                  const tBorderClass = statusBorderColors[tStatus] || "border-l-4 border-l-slate-400";
                  
                  return (
                    <div
                      key={t._id}
                      className={`rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 transition duration-300 hover:shadow-lg ${tBorderClass} animate-slideFade`}
                    >
                      <div className="flex flex-col justify-between gap-6 lg:flex-row">
                        <div className="flex flex-col gap-6 sm:flex-row items-start">
                          {t.photo ? (
                            <img
                              src={t.photo.replace(
                                "/upload/",
                                "/upload/f_auto,q_auto,w_180/"
                              )}
                              alt={t.name}
                              loading="lazy"
                              className="h-28 w-28 rounded-3xl object-cover border border-slate-200 shadow-sm"
                            />
                          ) : (
                            <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-400">
                              No Image
                            </div>
                          )}

                          <div className="flex-1">
                            <div className="mb-3.5 flex flex-wrap items-center gap-2">
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
                              <InfoRow icon={Mail} label="Email" value={t.email} />
                              <InfoRow icon={Phone} label="Phone" value={t.phone} />
                              <InfoRow
                                icon={Briefcase}
                                label="Occupation"
                                value={
                                  t.hasOccupation === "yes" ? t.occupation : "No"
                                }
                              />
                              <InfoRow icon={Building2} label="Organization" value={t.organization} />
                              <InfoRow icon={Award} label="Experience" value={t.experience} />
                              <InfoRow
                                icon={MapPin}
                                label="Locations"
                                value={t.locations?.join(", ")}
                              />
                              <InfoRow
                                icon={Briefcase}
                                label="Vehicle"
                                value={
                                  t.hasVehicle === "yes"
                                    ? `Yes (${t.vehicleNumber || "No number"})`
                                    : "No"
                                }
                              />
                              <InfoRow
                                icon={Clock}
                                label="Timings"
                                value={t.timings?.join(", ")}
                              />
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-100">
                              <p className="mb-2.5 text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <FileText className="h-4 w-4" />
                                Verification Documents
                              </p>

                              <div className="flex flex-wrap gap-2">
                                <DocumentLink
                                  href={t.documents?.idProof}
                                  label="ID Proof"
                                />

                                <ProtectedDocumentLink
                                  href={t.documents?.expCert}
                                  label="Education Certificate"
                                  password={EDUCATION_CERT_PASSWORD}
                                />

                                <DocumentLink
                                  href={t.documents?.otherDoc}
                                  label="Experience Certificate"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row flex-wrap items-center gap-2 lg:flex-col lg:items-stretch lg:justify-start lg:w-32 shrink-0 border-t border-slate-100 pt-4 lg:border-t-0 lg:pt-0 lg:pl-4 lg:border-l lg:border-slate-105">
                          <button
                            onClick={() => approveTutor(t._id)}
                            className="flex-1 flex items-center justify-center gap-1 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition duration-200 hover:bg-emerald-700 hover:scale-[1.02] cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            Approve
                          </button>

                          <button
                            onClick={() => rejectTutor(t._id)}
                            className="flex-1 flex items-center justify-center gap-1 rounded-2xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition duration-200 hover:bg-rose-700 hover:scale-[1.02] cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5 stroke-[2.5]" />
                            Reject
                          </button>

                          <button
                            onClick={() => startEditTutor(t)}
                            className="flex-1 flex items-center justify-center gap-1 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition duration-200 hover:bg-blue-700 hover:scale-[1.02] cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5 stroke-[2.5]" />
                            Edit
                          </button>

                          <button
                            onClick={() => deleteTutor(t._id)}
                            className="flex-1 flex items-center justify-center gap-1 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition duration-200 hover:bg-black hover:scale-[1.02] cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

function StatCard({ title, value, subtitle, icon: Icon, gradientClass }) {
  return (
    <div className="rounded-3xl p-6 shadow-sm border border-slate-205/60 transition duration-300 hover:-translate-y-1 hover:shadow-md glass-card flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{title}</p>
        <p className="mt-2 text-4xl font-black text-slate-900 tracking-tight">{value}</p>
        <p className="mt-1.5 text-xs font-bold text-slate-500">{subtitle}</p>
      </div>
      {Icon && (
        <div className={`p-3.5 rounded-2xl ${gradientClass || 'bg-slate-100 text-slate-650'}`}>
          <Icon className="h-5 w-5 stroke-[2.5]" />
        </div>
      )}
    </div>
  );
}

function MiniStat({ title, value, color, icon: Icon }) {
  const colors = {
    yellow: "bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-100",
    red: "bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-100",
  };

  return (
    <div className={`rounded-3xl p-5 border flex items-center justify-between shadow-sm transition hover:shadow-md ${colors[color]}`}>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider opacity-85">{title}</p>
        <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
      </div>
      {Icon && (
        <div className="p-3 bg-white/60 rounded-xl shadow-sm">
          <Icon className="h-5 w-5 stroke-[2.5]" />
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="mb-6 border-b border-slate-200/80 pb-4">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="h-6 w-6 text-slate-700" />}
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          {title}
        </h2>
      </div>
      {subtitle && <p className="mt-1.5 text-sm text-slate-500 pl-8 font-semibold">{subtitle}</p>}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-sm font-bold text-slate-400">
      {text}
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-2 py-1.5 text-xs font-bold text-slate-650">
      {Icon && <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />}
      <div className="min-w-0 flex-1">
        <span className="text-slate-800">{label}: </span>
        <span className="text-slate-600 font-semibold break-words leading-relaxed">
          {value || value === 0 ? value : <span className="text-slate-400 italic font-medium">Not provided</span>}
        </span>
      </div>
    </div>
  );
}

function Badge({ text, color = "slate" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200/50",
    purple: "bg-purple-50 text-purple-700 border-purple-200/50",
    orange: "bg-orange-50 text-orange-700 border-orange-200/50",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    red: "bg-rose-50 text-rose-700 border-rose-200/50",
    yellow: "bg-amber-50 text-amber-700 border-amber-200/50",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${
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
      <span className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-200/50 px-3 py-1.5 text-xs font-bold text-rose-600">
        <XCircle className="h-3.5 w-3.5" />
        {label} Missing
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-xl bg-blue-50 border border-blue-200/50 px-3 py-1.5 text-xs font-bold text-blue-700 transition duration-200 hover:bg-blue-100 hover:border-blue-300"
    >
      <FileDown className="h-3.5 w-3.5" />
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
      <span className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-200/50 px-3 py-1.5 text-xs font-bold text-rose-600">
        <XCircle className="h-3.5 w-3.5" />
        {label} Missing
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="inline-flex items-center gap-1 rounded-xl bg-purple-50 border border-purple-200/50 px-3 py-1.5 text-xs font-bold text-purple-700 transition duration-200 hover:bg-purple-100 hover:border-purple-300 cursor-pointer"
    >
      <Lock className="h-3.5 w-3.5" />
      🔒 {label}
    </button>
  );
}

function TutorModal({ title, form, setForm, primaryText, onPrimary, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-slideFade">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 md:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Edit className="h-6 w-6 text-slate-800" />
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 cursor-pointer"
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
          className="mt-4 min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm font-semibold"
          placeholder="About tutor..."
          value={form.about}
          onChange={(e) => setForm({ ...form, about: e.target.value })}
        />

        <div className="mt-6 flex gap-3 border-t border-slate-100 pt-4">
          <button
            onClick={onPrimary}
            className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 cursor-pointer"
          >
            {primaryText}
          </button>

          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
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
      className="h-12 rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm font-semibold"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
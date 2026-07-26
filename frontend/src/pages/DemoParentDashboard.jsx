import React, { useState } from "react";
import {
  X,
  User,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  FileText,
  CreditCard,
  Star,
  Lock,
  Award,
  Sparkles,
  GraduationCap,
  Phone,
  CheckCheck,
  XCircle,
  BarChart2,
  Target,
} from "lucide-react";

// ─── Sample Demo Data ────────────────────────────────────────────────────────

const DEMO_STUDENT = {
  name: "Aryan Sharma",
  class: "Class 9",
  board: "CBSE",
  school: "Delhi Public School",
  subjects: ["Mathematics", "Science", "English"],
  performance: "Good",
  avatar: "AS",
};

const DEMO_TEACHER = {
  name: "Mrs. Priya Nair",
  qualification: "M.Sc. Mathematics, B.Ed",
  experience: "8 Years",
  specialization: "Math & Science",
  phone: "+91 98XXX XXXXX",
  rating: 4.8,
  avatar: "PN",
};

const DEMO_PACKAGE = {
  plan: "Advance Plan",
  totalClasses: 20,
  completedClasses: 14,
  missedClasses: 1,
  remainingClasses: 6,
  daysPerWeek: 5,
  hoursPerDay: 1,
  schedule: "Mon, Tue, Wed, Thu, Fri",
  timing: "5:00 PM – 6:00 PM",
  monthlyFee: 8600,
  feePaid: true,
  nextRenewalDate: "Aug 15, 2025",
};

const DEMO_ATTENDANCE = [
  { date: "Jul 26, 2025", day: "Sat", status: "Done", topic: "Trigonometry – Introduction" },
  { date: "Jul 25, 2025", day: "Fri", status: "Done", topic: "Linear Equations – Revision" },
  { date: "Jul 24, 2025", day: "Thu", status: "Done", topic: "Quadratic Equations" },
  { date: "Jul 23, 2025", day: "Wed", status: "Missed", topic: "—" },
  { date: "Jul 22, 2025", day: "Tue", status: "Done", topic: "Polynomials – Part 2" },
  { date: "Jul 21, 2025", day: "Mon", status: "Done", topic: "Polynomials – Part 1" },
];

const DEMO_HOMEWORK = [
  { subject: "Mathematics", task: "Exercise 8.3 – Q1 to Q10", due: "Tomorrow", status: "Pending" },
  { subject: "Science", task: "Lab Report – Photosynthesis", due: "Jul 28", status: "Submitted" },
  { subject: "English", task: "Essay: My Favourite Season", due: "Jul 30", status: "Pending" },
];

const DEMO_REMARKS = [
  {
    date: "Jul 26, 2025",
    remark: "Aryan has shown excellent improvement in Trigonometry. Grasped concepts quickly. Recommend more practice on angle calculations.",
    sentiment: "positive",
  },
  {
    date: "Jul 21, 2025",
    remark: "Completed all polynomial exercises with 90%+ accuracy. Moving to next chapter ahead of schedule.",
    sentiment: "positive",
  },
  {
    date: "Jul 14, 2025",
    remark: "Slightly distracted during the first 15 mins. Suggest reducing screen time before class. Performance recovered well in the second half.",
    sentiment: "neutral",
  },
];

const DEMO_TOPICS = [
  { subject: "Mathematics", topic: "Polynomials", status: "Completed" },
  { subject: "Mathematics", topic: "Linear Equations in 2 Variables", status: "Completed" },
  { subject: "Mathematics", topic: "Quadratic Equations", status: "In Progress" },
  { subject: "Mathematics", topic: "Trigonometry", status: "Started" },
  { subject: "Science", topic: "Matter in Our Surroundings", status: "Completed" },
  { subject: "Science", topic: "Is Matter Around Us Pure?", status: "Completed" },
  { subject: "Science", topic: "Atoms and Molecules", status: "In Progress" },
  { subject: "English", topic: "The Fun They Had", status: "Completed" },
  { subject: "English", topic: "The Sound of Music", status: "Completed" },
];

const DEMO_UPCOMING = [
  { date: "Jul 28, Mon", time: "5:00 PM", topic: "Trigonometry – Identities", subject: "Mathematics" },
  { date: "Jul 29, Tue", time: "5:00 PM", topic: "Atoms and Molecules – Part 2", subject: "Science" },
  { date: "Jul 30, Wed", time: "5:00 PM", topic: "Trigonometry – Problem Set", subject: "Mathematics" },
];

const SUBJECT_PROGRESS = [
  { subject: "Mathematics", percent: 68, color: "#3B82F6" },
  { subject: "Science", percent: 75, color: "#10B981" },
  { subject: "English", percent: 85, color: "#F59E0B" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionCard({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color = "text-slate-800", bg = "bg-slate-100" }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
      <div className={`p-1.5 rounded-xl ${bg}`}>
        <Icon className={`h-3.5 w-3.5 ${color}`} />
      </div>
      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">{title}</h3>
    </div>
  );
}

function LockedModule({ title, desc, icon: Icon }) {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/80 overflow-hidden opacity-80">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-center p-4 bg-white/50 backdrop-blur-[2px]">
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 shadow-sm">
          <Lock className="h-3 w-3 text-amber-600" />
          <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Available in Elite Plan</span>
        </div>
        <p className="text-[10px] font-semibold text-slate-500 max-w-[180px]">{desc}</p>
      </div>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 blur-sm">
        <div className="p-1.5 rounded-xl bg-slate-200">
          <Icon className="h-3.5 w-3.5 text-slate-500" />
        </div>
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{title}</h3>
      </div>
      <div className="p-4 space-y-2 blur-sm">
        <div className="h-3 bg-slate-200 rounded-full w-3/4" />
        <div className="h-3 bg-slate-200 rounded-full w-1/2" />
        <div className="h-3 bg-slate-200 rounded-full w-2/3" />
        <div className="h-8 bg-slate-200 rounded-xl mt-3" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DemoParentDashboard({ onClose, selectedPlan = "advance" }) {
  const [activeTab, setActiveTab] = useState("overview");

  const completedPercent = Math.round((DEMO_PACKAGE.completedClasses / DEMO_PACKAGE.totalClasses) * 100);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "homework", label: "Homework", icon: FileText },
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-slate-50 rounded-[1.6rem] shadow-2xl border border-slate-200 my-4 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "calc(100vh - 2rem)", minHeight: "600px" }}
      >

        {/* ── TOP BAR ────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-[#1e3a5f] via-[#1a3a8f] to-[#0f2460] px-5 py-5 flex items-center justify-between gap-4 shrink-0">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-indigo-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-white/10 text-white font-black text-sm border border-white/20 shrink-0">
              {DEMO_STUDENT.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-white font-black text-base leading-tight">{DEMO_STUDENT.name}</h2>
                <span className="text-[10px] font-black bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded-full px-2 py-0.5 uppercase tracking-wide">
                  Demo Preview
                </span>
              </div>
              <p className="text-blue-200 text-[11px] font-medium mt-0.5">
                {DEMO_STUDENT.class} &bull; {DEMO_STUDENT.board} &bull; {DEMO_PACKAGE.plan}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── DEMO BANNER ─────────────────────────────────────────────── */}
        <div className="bg-amber-50 border-b border-amber-200/70 px-4 py-2 flex items-center gap-2 shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <p className="text-[11px] font-semibold text-amber-700">
            This is a <strong>demo preview</strong> using sample data. Your actual dashboard will show real attendance, progress, and teacher remarks.
          </p>
        </div>

        {/* ── TABS ────────────────────────────────────────────────────── */}
        <div className="flex border-b border-slate-200 bg-white px-4 gap-0.5 shrink-0 overflow-x-auto">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <TabIcon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── SCROLLABLE BODY ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">

          {/* ══ OVERVIEW TAB ══════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-4">

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Classes", value: DEMO_PACKAGE.totalClasses, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Completed", value: DEMO_PACKAGE.completedClasses, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Remaining", value: DEMO_PACKAGE.remainingClasses, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Missed", value: DEMO_PACKAGE.missedClasses, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
                ].map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-3 shadow-sm">
                      <div className={`p-2 rounded-xl ${stat.bg} shrink-0`}>
                        <StatIcon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                        <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-2">

                {/* Student Profile */}
                <SectionCard>
                  <SectionHeader icon={GraduationCap} title="Student Profile" color="text-blue-600" bg="bg-blue-50" />
                  <div className="p-4 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                      {DEMO_STUDENT.avatar}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h4 className="font-black text-slate-900 text-sm">{DEMO_STUDENT.name}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold">{DEMO_STUDENT.class} &bull; {DEMO_STUDENT.board}</p>
                      <p className="text-[11px] text-slate-500">{DEMO_STUDENT.school}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {DEMO_STUDENT.subjects.map((s) => (
                          <span key={s} className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full px-2 py-0.5">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* Teacher Profile */}
                <SectionCard>
                  <SectionHeader icon={User} title="Assigned Teacher" color="text-purple-600" bg="bg-purple-50" />
                  <div className="p-4 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                      {DEMO_TEACHER.avatar}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-900 text-sm">{DEMO_TEACHER.name}</h4>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-black text-amber-600">{DEMO_TEACHER.rating}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold">{DEMO_TEACHER.qualification}</p>
                      <p className="text-[11px] text-slate-500">{DEMO_TEACHER.experience} Experience &bull; {DEMO_TEACHER.specialization}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" /> Contact shared after enrollment
                      </p>
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* Package Progress */}
              <SectionCard>
                <SectionHeader icon={Target} title="Package Progress" color="text-emerald-600" bg="bg-emerald-50" />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-600">
                      {DEMO_PACKAGE.completedClasses} / {DEMO_PACKAGE.totalClasses} Classes Completed
                    </span>
                    <span className="text-[11px] font-black text-emerald-600">{completedPercent}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                      style={{ width: `${completedPercent}%` }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: "Schedule", value: `${DEMO_PACKAGE.daysPerWeek} Days/Week` },
                      { label: "Class Time", value: DEMO_PACKAGE.timing },
                      { label: "Next Renewal", value: DEMO_PACKAGE.nextRenewalDate },
                    ].map((item) => (
                      <div key={item.label} className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/60">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</p>
                        <p className="text-xs font-black text-slate-800 mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* Fee Status */}
              <SectionCard>
                <SectionHeader icon={CreditCard} title="Fee Status" color="text-indigo-600" bg="bg-indigo-50" />
                <div className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs font-bold text-slate-500">Monthly Fee</p>
                    <p className="text-2xl font-black text-slate-900">&#8377;{DEMO_PACKAGE.monthlyFee.toLocaleString("en-IN")}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Next renewal: {DEMO_PACKAGE.nextRenewalDate}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-sm ${
                    DEMO_PACKAGE.feePaid
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {DEMO_PACKAGE.feePaid ? <CheckCheck className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {DEMO_PACKAGE.feePaid ? "Paid" : "Pending"}
                  </div>
                </div>
              </SectionCard>

              {/* Latest Remark */}
              <SectionCard>
                <SectionHeader icon={MessageSquare} title="Latest Teacher Remark" color="text-violet-600" bg="bg-violet-50" />
                <div className="p-4 flex gap-3">
                  <div className="h-2 w-2 rounded-full mt-2 shrink-0 bg-emerald-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700 leading-relaxed">{DEMO_REMARKS[0].remark}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">— {DEMO_TEACHER.name} &middot; {DEMO_REMARKS[0].date}</p>
                  </div>
                </div>
              </SectionCard>

              {/* Elite locked modules */}
              <div className="grid gap-4 sm:grid-cols-2">
                <LockedModule
                  title="Weekly Learning Report"
                  desc="Detailed weekly analysis of learning pace, concept mastery and weak areas."
                  icon={TrendingUp}
                />
                <LockedModule
                  title="Academic Gap Analysis"
                  desc="AI-powered gap identification with chapter-level recommendations."
                  icon={Target}
                />
              </div>
            </div>
          )}

          {/* ══ ATTENDANCE TAB ════════════════════════════════════════ */}
          {activeTab === "attendance" && (
            <div className="space-y-4">
              <SectionCard>
                <SectionHeader icon={Calendar} title="Attendance Timeline" color="text-blue-600" bg="bg-blue-50" />
                <div className="divide-y divide-slate-100">
                  {DEMO_ATTENDANCE.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        entry.status === "Done" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                      }`}>
                        {entry.status === "Done" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-slate-800 truncate">{entry.topic}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{entry.date} &middot; {entry.day}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                        entry.status === "Done"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard>
                <SectionHeader icon={Clock} title="Upcoming Classes" color="text-sky-600" bg="bg-sky-50" />
                <div className="divide-y divide-slate-100">
                  {DEMO_UPCOMING.map((cls, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-3">
                      <div className="h-8 w-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-slate-800 truncate">{cls.topic}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{cls.date} &middot; {cls.time}</p>
                      </div>
                      <span className="text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 rounded-full px-2.5 py-1 shrink-0">
                        {cls.subject}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══ PROGRESS TAB ══════════════════════════════════════════ */}
          {activeTab === "progress" && (
            <div className="space-y-4">

              <SectionCard>
                <SectionHeader icon={TrendingUp} title="Subject Progress" color="text-emerald-600" bg="bg-emerald-50" />
                <div className="p-4 space-y-4">
                  {SUBJECT_PROGRESS.map((s) => (
                    <div key={s.subject}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[11px] font-extrabold text-slate-700">{s.subject}</span>
                        <span className="text-[11px] font-black" style={{ color: s.color }}>{s.percent}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${s.percent}%`, backgroundColor: s.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard>
                <SectionHeader icon={BookOpen} title="Topics Covered" color="text-violet-600" bg="bg-violet-50" />
                <div className="p-4">
                  {["Mathematics", "Science", "English"].map((subj) => {
                    const topics = DEMO_TOPICS.filter((t) => t.subject === subj);
                    return (
                      <div key={subj} className="mb-4 last:mb-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{subj}</p>
                        <div className="space-y-1.5">
                          {topics.map((t, idx) => (
                            <div key={idx} className="flex items-center gap-2.5">
                              <div className={`h-2 w-2 rounded-full shrink-0 ${
                                t.status === "Completed" ? "bg-emerald-500" :
                                t.status === "In Progress" ? "bg-blue-500" : "bg-slate-300"
                              }`} />
                              <span className="text-[11px] text-slate-700 font-semibold flex-1">{t.topic}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                t.status === "Completed" ? "bg-emerald-50 text-emerald-700" :
                                t.status === "In Progress" ? "bg-blue-50 text-blue-700" :
                                "bg-slate-100 text-slate-500"
                              }`}>
                                {t.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard>
                <SectionHeader icon={Award} title="Progress Summary" color="text-amber-600" bg="bg-amber-50" />
                <div className="p-4 space-y-0.5">
                  {[
                    { label: "Topics Completed", value: "9 / 12", highlight: false },
                    { label: "Average Test Score", value: "82%", highlight: true },
                    { label: "Homework Completion", value: "78%", highlight: false },
                    { label: "Punctuality", value: "93%", highlight: true },
                    { label: "Overall Performance", value: "Good", highlight: false },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                      <span className="text-[11px] font-semibold text-slate-600">{item.label}</span>
                      <span className={`text-[11px] font-black ${item.highlight ? "text-emerald-600" : "text-slate-800"}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard>
                <SectionHeader icon={MessageSquare} title="Teacher Remarks" color="text-purple-600" bg="bg-purple-50" />
                <div className="divide-y divide-slate-100">
                  {DEMO_REMARKS.map((r, idx) => (
                    <div key={idx} className="p-4 flex gap-3">
                      <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${
                        r.sentiment === "positive" ? "bg-emerald-500" : "bg-amber-400"
                      }`} />
                      <div>
                        <p className="text-xs text-slate-700 font-semibold leading-relaxed">{r.remark}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">— {DEMO_TEACHER.name} &middot; {r.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <LockedModule
                title="AI Academic Gap Analysis"
                desc="Personalized chapter-level gap identification with weekly remediation plan."
                icon={Target}
              />
            </div>
          )}

          {/* ══ HOMEWORK TAB ══════════════════════════════════════════ */}
          {activeTab === "homework" && (
            <div className="space-y-4">
              <SectionCard>
                <SectionHeader icon={FileText} title="Homework Assignments" color="text-rose-600" bg="bg-rose-50" />
                <div className="divide-y divide-slate-100">
                  {DEMO_HOMEWORK.map((hw, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-3.5">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        hw.status === "Submitted" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      }`}>
                        {hw.status === "Submitted" ? <CheckCheck className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-slate-800">{hw.task}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{hw.subject} &middot; Due: {hw.due}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                        hw.status === "Submitted"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {hw.status}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <LockedModule
                title="Live Doubt Sessions"
                desc="Schedule WhatsApp or video doubt sessions directly with your assigned mentor."
                icon={MessageSquare}
              />
              <LockedModule
                title="Assignment Performance Tracking"
                desc="Score tracking per assignment with subject-wise trend analysis."
                icon={BarChart2}
              />
            </div>
          )}

        </div>

        {/* ── FOOTER ──────────────────────────────────────────────── */}
        <div className="shrink-0 bg-white border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-[10px] font-semibold text-slate-400">
            This is a demo preview. Your actual dashboard will be available after enrollment.
          </p>
          <button
            onClick={onClose}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition cursor-pointer"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}

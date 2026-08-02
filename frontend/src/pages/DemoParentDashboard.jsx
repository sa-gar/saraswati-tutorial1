import React, { useState } from "react";
import {
  X,
  User,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageSquare,
  FileText,
  Star,
  Award,
  GraduationCap,
  Phone,
  CheckCheck,
  XCircle,
  BarChart2,
  Target,
  Info,
  Users,
  Activity
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
  experience: "8 Years Experience",
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
  nextRenewalDate: "Aug 15, 2026",
};

const DEMO_ATTENDANCE = [
  { date: "Jul 26, 2026", day: "Sat", status: "Done", topic: "Trigonometry – Introduction" },
  { date: "Jul 25, 2026", day: "Fri", status: "Done", topic: "Linear Equations – Revision" },
  { date: "Jul 24, 2026", day: "Thu", status: "Done", topic: "Quadratic Equations" },
  { date: "Jul 23, 2026", day: "Wed", status: "Missed", topic: "—" },
  { date: "Jul 22, 2026", day: "Tue", status: "Done", topic: "Polynomials – Part 2" },
  { date: "Jul 21, 2026", day: "Mon", status: "Done", topic: "Polynomials – Part 1" },
];

const DEMO_HOMEWORK = [
  { subject: "Mathematics", task: "Exercise 8.3 – Q1 to Q10", due: "Tomorrow", status: "Pending" },
  { subject: "Science", task: "Lab Report – Photosynthesis", due: "Jul 28", status: "Submitted" },
  { subject: "English", task: "Essay: My Favourite Season", due: "Jul 30", status: "Pending" },
];

const DEMO_REMARKS = [
  {
    date: "Jul 26, 2026",
    remark: "Aryan has shown excellent improvement in Trigonometry. Grasped concepts quickly. Recommend more practice on angle calculations.",
    sentiment: "positive",
  },
  {
    date: "Jul 21, 2026",
    remark: "Completed all polynomial exercises with 90%+ accuracy. Moving to next chapter ahead of schedule.",
    sentiment: "positive",
  },
];

const WEEKLY_DAYS = [
  { day: "Mon", subject: "Maths", time: "5:00 PM", color: "bg-black" },
  { day: "Tue", subject: "Science", time: "5:00 PM", color: "bg-black" },
  { day: "Wed", subject: "English", time: "6:00 PM", color: "bg-black" },
  { day: "Thu", subject: "Maths", time: "5:00 PM", color: "bg-black" },
  { day: "Fri", subject: "Science", time: "5:00 PM", color: "bg-black" },
  { day: "Sat", subject: "Test", time: "10:00 AM", color: "bg-zinc-700" },
  { day: "Sun", subject: "—", time: "No Class", color: "bg-zinc-300" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DemoParentDashboard({ onClose, selectedPlan = "advance" }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNotice, setShowNotice] = useState(true);

  const completedPercent = Math.round((DEMO_PACKAGE.completedClasses / DEMO_PACKAGE.totalClasses) * 100);

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "homework", label: "Homework", icon: FileText },
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-[#F8F9FA] rounded-[1.8rem] shadow-2xl border border-zinc-300/80 my-auto flex flex-col overflow-hidden text-zinc-900"
        onClick={(e) => e.stopPropagation()}
        style={{ height: "calc(100vh - 2rem)", maxHeight: "900px" }}
      >
        {/* ── 1. TOP HEADER BANNER (BLACK & WHITE HIGH-CONTRAST HEADER) ────────── */}
        <div className="bg-black px-5 sm:px-7 py-4.5 flex items-center justify-between gap-4 shrink-0 border-b border-zinc-800">
          {/* Left: Avatar + Student Info */}
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-zinc-900 border border-zinc-700 text-white font-black text-base shadow-md shrink-0">
              {DEMO_STUDENT.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-white font-black text-lg tracking-tight leading-none">
                  {DEMO_STUDENT.name}
                </h2>
                <span className="text-[10px] font-black bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                  Demo Preview
                </span>
              </div>
              <p className="text-zinc-400 text-xs font-semibold mt-1">
                {DEMO_STUDENT.class} &bull; {DEMO_STUDENT.board} &bull; {DEMO_PACKAGE.plan}
              </p>
            </div>
          </div>

          {/* Right: Actions (Close Button) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer shrink-0"
              title="Close Preview"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* ── 2. DASHBOARD BODY (LEFT SIDEBAR + MAIN CONTENT AREA) ─────────── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── LEFT SIDEBAR (PURE WHITE WITH BLACK ACTIVE ACCENT) ──────────── */}
          <aside className="w-60 shrink-0 bg-white border-r border-zinc-200 p-4 font-semibold text-zinc-700 flex flex-col justify-between hidden md:flex">
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const ItemIcon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-black text-white shadow-lg shadow-black/15 scale-[1.01]"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
                    }`}
                  >
                    <ItemIcon className={`h-4 w-4 ${isActive ? "text-white" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sidebar Bottom Promo Card with Saraswati Tutorials Logo */}
            <div className="bg-zinc-50 border border-zinc-200/90 rounded-2xl p-4 text-center relative overflow-hidden shadow-sm">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-white border border-zinc-200 shadow-sm p-1.5 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Saraswati Tutorials Logo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/100x100?text=ST";
                  }}
                />
              </div>
              <h4 className="font-extrabold text-black text-xs mt-2.5">Keep Learning, Keep Growing!</h4>
              <p className="text-[10px] text-zinc-500 font-semibold mt-1 leading-relaxed">
                You're doing great. Keep up the momentum!
              </p>
            </div>
          </aside>

          {/* ── MAIN CONTENT AREA (CLEAN BLACK & WHITE CARDS) ──────────────── */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

            {/* Top Demo Notice Alert Banner */}
            {showNotice && (
              <div className="bg-zinc-900 text-white border border-zinc-800 rounded-2xl p-4 text-xs font-medium flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-800 text-white shrink-0">
                    <Info className="h-4 w-4" />
                  </div>
                  <p className="text-zinc-200">
                    <strong className="text-white font-extrabold">This is a demo preview</strong> using sample data. Your actual dashboard will show real attendance, progress, and teacher remarks.
                  </p>
                </div>
                <button
                  onClick={() => setShowNotice(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* ══ OVERVIEW TAB CONTENT ══════════════════════════════════ */}
            {activeTab === "overview" && (
              <div className="space-y-6">

                {/* ── ROW 1: 4 STAT CARDS ───────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Total Classes */}
                  <div className="bg-white rounded-3xl border border-zinc-200/90 p-5 flex items-center gap-4 shadow-sm hover:border-zinc-300 transition">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 border border-zinc-200 text-black shrink-0 shadow-inner">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Total Classes</p>
                      <p className="text-2xl font-black text-black mt-0.5">{DEMO_PACKAGE.totalClasses}</p>
                      <p className="text-xs font-bold text-zinc-500 mt-0.5">All Scheduled</p>
                    </div>
                  </div>

                  {/* Card 2: Completed */}
                  <div className="bg-white rounded-3xl border border-zinc-200/90 p-5 flex items-center gap-4 shadow-sm hover:border-zinc-300 transition">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shrink-0 shadow-md">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Completed</p>
                      <p className="text-2xl font-black text-black mt-0.5">{DEMO_PACKAGE.completedClasses}</p>
                      <p className="text-xs font-extrabold text-black mt-0.5">{completedPercent}% Completed</p>
                    </div>
                  </div>

                  {/* Card 3: Remaining */}
                  <div className="bg-white rounded-3xl border border-zinc-200/90 p-5 flex items-center gap-4 shadow-sm hover:border-zinc-300 transition">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 border border-zinc-200 text-black shrink-0 shadow-inner">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Remaining</p>
                      <p className="text-2xl font-black text-black mt-0.5">{DEMO_PACKAGE.remainingClasses}</p>
                      <p className="text-xs font-bold text-zinc-600 mt-0.5">Upcoming Classes</p>
                    </div>
                  </div>

                  {/* Card 4: Missed */}
                  <div className="bg-white rounded-3xl border border-zinc-200/90 p-5 flex items-center gap-4 shadow-sm hover:border-zinc-300 transition">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 border border-zinc-300 text-zinc-900 shrink-0 shadow-inner">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Missed</p>
                      <p className="text-2xl font-black text-black mt-0.5">{DEMO_PACKAGE.missedClasses}</p>
                      <p className="text-xs font-bold text-zinc-500 mt-0.5">Needs Attention</p>
                    </div>
                  </div>
                </div>

                {/* ── ROW 2: STUDENT PROFILE & ASSIGNED TEACHER ─────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Student Profile Card */}
                  <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 border-b border-zinc-100 pb-3.5 mb-4">
                      <User className="h-4 w-4 text-black" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Student Profile</h3>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white font-black text-xl shadow-md shrink-0">
                        {DEMO_STUDENT.avatar}
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-xl font-black text-black">{DEMO_STUDENT.name}</h4>
                        <p className="text-xs font-bold text-zinc-600">{DEMO_STUDENT.class} &bull; {DEMO_STUDENT.board}</p>
                        <p className="text-xs font-semibold text-zinc-500">{DEMO_STUDENT.school}</p>
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {DEMO_STUDENT.subjects.map((subj) => (
                            <span key={subj} className="text-[11px] font-extrabold bg-zinc-100 text-black border border-zinc-200 rounded-xl px-3 py-1">
                              {subj}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Teacher Card */}
                  <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-zinc-100 pb-3.5 mb-4">
                      <User className="h-4 w-4 text-black" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Assigned Teacher</h3>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white font-black text-xl shadow-md shrink-0">
                        {DEMO_TEACHER.avatar}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="text-xl font-black text-black">{DEMO_TEACHER.name}</h4>
                          <div className="flex items-center gap-1 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-lg">
                            <Star className="h-3.5 w-3.5 fill-black text-black" />
                            <span className="text-xs font-black text-black">{DEMO_TEACHER.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-zinc-600">{DEMO_TEACHER.qualification}</p>
                        <p className="text-xs font-semibold text-zinc-500">{DEMO_TEACHER.experience} &bull; {DEMO_TEACHER.specialization}</p>
                        <p className="text-xs text-zinc-400 italic pt-1 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" /> Contact shared after enrollment
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── ROW 3: LEARNING PROGRESS & UPCOMING CLASS ─────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Learning Progress Card (2 cols) */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5 mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-black" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Learning Progress</h3>
                      </div>
                      <span className="text-xs font-black text-black">{completedPercent}%</span>
                    </div>

                    <p className="text-xs font-bold text-zinc-700 mb-2">
                      {DEMO_PACKAGE.completedClasses} / {DEMO_PACKAGE.totalClasses} Classes Completed
                    </p>
                    <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden mb-5">
                      <div className="h-full bg-black rounded-full transition-all duration-700" style={{ width: `${completedPercent}%` }} />
                    </div>

                    {/* 3 Mini Stat Boxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3.5 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-black text-white shrink-0">
                          <Target className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Average Score</p>
                          <p className="text-base font-black text-black mt-0.5">82%</p>
                          <p className="text-[10px] text-zinc-500 font-semibold">Across Subjects</p>
                        </div>
                      </div>

                      <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3.5 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-black text-white shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Assignments</p>
                          <p className="text-base font-black text-black mt-0.5">8 / 10</p>
                          <p className="text-[10px] text-zinc-500 font-semibold">Submitted</p>
                        </div>
                      </div>

                      <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3.5 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-black text-white shrink-0">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Improvement</p>
                          <p className="text-base font-black text-black mt-0.5">+18%</p>
                          <p className="text-[10px] text-zinc-500 font-semibold">Since Last Month</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Class Card (1 col) */}
                  <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-black" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Upcoming Class</h3>
                        </div>
                        <button className="text-xs font-extrabold text-black hover:underline cursor-pointer">View All</button>
                      </div>

                      <div className="bg-zinc-900 text-white rounded-2xl p-4.5 space-y-3 shadow-md">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-zinc-800 text-white shrink-0">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white">Mathematics – Algebra</h4>
                            <p className="text-[11px] font-medium text-zinc-400">Chapter 4: Linear Equations</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                            <Clock className="h-3.5 w-3.5 text-zinc-400" />
                            <span>Today, 5:00 PM – 6:00 PM</span>
                          </div>
                          <span className="bg-white text-black text-[10px] font-black px-2.5 py-1 rounded-lg">
                            In 2h 30m
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 font-semibold pt-3 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> {DEMO_TEACHER.name}
                    </p>
                  </div>
                </div>

                {/* ── ROW 4: WEEKLY SCHEDULE & RECENT ACTIVITY ────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Weekly Schedule Grid (2 cols) */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-black" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Weekly Schedule</h3>
                      </div>
                      <button className="text-xs font-extrabold text-black hover:underline cursor-pointer">View Full Schedule</button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                      {WEEKLY_DAYS.map((day) => (
                        <div key={day.day} className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3 text-center">
                          <p className="text-xs font-black text-black">{day.day}</p>
                          <div className="flex items-center justify-center gap-1 my-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${day.color}`} />
                            <span className="text-[11px] font-bold text-zinc-800">{day.subject}</span>
                          </div>
                          <p className="text-[10px] font-semibold text-zinc-400">{day.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity (1 col) */}
                  <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5 mb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-black" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Recent Activity</h3>
                      </div>
                      <button className="text-xs font-extrabold text-black hover:underline cursor-pointer">View All</button>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-full bg-zinc-100 text-black">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-black">Science assignment submitted</span>
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-400">2 hours ago</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-full bg-zinc-100 text-black">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-black">Maths test conducted</span>
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-400">1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ══ ATTENDANCE TAB CONTENT ════════════════════════════════ */}
            {activeTab === "attendance" && (
              <div className="space-y-6">
                {/* Attendance Summary Stat Row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white rounded-3xl border border-zinc-200/90 p-4.5 flex items-center gap-3.5 shadow-sm">
                    <div className="p-3 rounded-2xl bg-zinc-100 text-black border border-zinc-200">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400">Total Classes</p>
                      <p className="text-xl font-black text-black">20</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-zinc-200/90 p-4.5 flex items-center gap-3.5 shadow-sm">
                    <div className="p-3 rounded-2xl bg-black text-white shadow-md">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400">Classes Attended</p>
                      <p className="text-xl font-black text-black">14</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-zinc-200/90 p-4.5 flex items-center gap-3.5 shadow-sm">
                    <div className="p-3 rounded-2xl bg-zinc-100 text-black border border-zinc-200">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400">Classes Missed</p>
                      <p className="text-xl font-black text-black">1</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-zinc-200/90 p-4.5 flex items-center gap-3.5 shadow-sm">
                    <div className="p-3 rounded-2xl bg-zinc-100 text-black border border-zinc-200">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400">Upcoming</p>
                      <p className="text-xl font-black text-black">6</p>
                    </div>
                  </div>
                </div>

                {/* Attendance Timeline Table Card */}
                <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-5">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-black" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Class Attendance Log</h3>
                    </div>
                    <span className="text-xs font-bold text-zinc-500">Jul 2026</span>
                  </div>

                  <div className="divide-y divide-zinc-100">
                    {DEMO_ATTENDANCE.map((entry, idx) => (
                      <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`p-2.5 rounded-xl shrink-0 ${
                            entry.status === "Done" ? "bg-black text-white" : "bg-zinc-100 text-black border border-zinc-200"
                          }`}>
                            {entry.status === "Done" ? <CheckCircle2 className="h-4.5 w-4.5" /> : <XCircle className="h-4.5 w-4.5" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-black">{entry.topic}</h4>
                            <p className="text-[11px] font-semibold text-zinc-400 mt-0.5">{entry.date} &bull; {entry.day} &bull; Teacher: Mrs. Priya Nair</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black px-3 py-1 rounded-full shrink-0 ${
                          entry.status === "Done" ? "bg-black text-white" : "bg-zinc-100 text-black border border-zinc-200"
                        }`}>
                          {entry.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ PROGRESS TAB CONTENT ══════════════════════════════════ */}
            {activeTab === "progress" && (
              <div className="space-y-6">
                {/* Subject Progress Card */}
                <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3.5 mb-5">
                    <TrendingUp className="h-4 w-4 text-black" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Subject-wise Progress</h3>
                  </div>

                  <div className="space-y-5">
                    {[
                      { subject: "Mathematics", percent: 68, teacher: "Mrs. Priya Nair" },
                      { subject: "Science", percent: 75, teacher: "Mrs. Priya Nair" },
                      { subject: "English", percent: 85, teacher: "Mr. Anish Sen" },
                    ].map((item) => (
                      <div key={item.subject} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-black">{item.subject}</span>
                          <span className="font-black text-black">{item.percent}%</span>
                        </div>
                        <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full bg-black rounded-full transition-all duration-700" style={{ width: `${item.percent}%` }} />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-semibold">Teacher: {item.teacher}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topics Covered Grid */}
                <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3.5 mb-5">
                    <BookOpen className="h-4 w-4 text-black" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Syllabus & Topics Tracker</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        subj: "Mathematics",
                        topics: [
                          { name: "Polynomials", status: "Completed" },
                          { name: "Linear Equations", status: "Completed" },
                          { name: "Quadratic Equations", status: "In Progress" },
                          { name: "Trigonometry", status: "Started" },
                        ]
                      },
                      {
                        subj: "Science",
                        topics: [
                          { name: "Matter in Our Surroundings", status: "Completed" },
                          { name: "Is Matter Pure?", status: "Completed" },
                          { name: "Atoms & Molecules", status: "In Progress" },
                        ]
                      },
                      {
                        subj: "English",
                        topics: [
                          { name: "The Fun They Had", status: "Completed" },
                          { name: "The Sound of Music", status: "Completed" },
                          { name: "Grammar & Tenses", status: "In Progress" },
                        ]
                      }
                    ].map((col) => (
                      <div key={col.subj} className="bg-zinc-50 border border-zinc-200/90 rounded-2xl p-4 space-y-3">
                        <h4 className="text-xs font-black uppercase text-black border-b border-zinc-200 pb-2">{col.subj}</h4>
                        <div className="space-y-2">
                          {col.topics.map((t, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-zinc-800">{t.name}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                                t.status === "Completed" ? "bg-black text-white" :
                                t.status === "In Progress" ? "bg-zinc-200 text-black" :
                                "bg-zinc-100 text-zinc-600 border border-zinc-200"
                              }`}>
                                {t.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teacher Remarks */}
                <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3.5 mb-4">
                    <MessageSquare className="h-4 w-4 text-black" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Teacher Remarks</h3>
                  </div>

                  <div className="space-y-3">
                    {DEMO_REMARKS.map((r, i) => (
                      <div key={i} className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 flex gap-3.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-black mt-1.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-zinc-900 leading-relaxed">{r.remark}</p>
                          <p className="text-[10px] text-zinc-400 font-bold mt-1.5">— {DEMO_TEACHER.name} &bull; {r.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ HOMEWORK TAB CONTENT ══════════════════════════════════ */}
            {activeTab === "homework" && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5 mb-5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-black" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Homework & Assignments</h3>
                    </div>
                    <span className="text-xs font-bold text-zinc-500">3 Total Assignments</span>
                  </div>

                  <div className="space-y-3">
                    {DEMO_HOMEWORK.map((hw, idx) => (
                      <div key={idx} className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`p-2.5 rounded-xl ${hw.status === "Submitted" ? "bg-black text-white" : "bg-zinc-200 text-black"}`}>
                            {hw.status === "Submitted" ? <CheckCheck className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-black">{hw.task}</h4>
                            <p className="text-[11px] font-semibold text-zinc-500 mt-0.5">{hw.subject} &bull; Due: {hw.due}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black px-3 py-1 rounded-full shrink-0 ${
                          hw.status === "Submitted" ? "bg-black text-white" : "bg-zinc-100 text-black border border-zinc-200"
                        }`}>
                          {hw.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

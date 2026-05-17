import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  MapPin,
  Clock3,
  Users,
  ShieldCheck,
  GraduationCap,
  Languages,
  Music,
  Code2,
  Dumbbell,
  HeartHandshake,
  CheckCircle2,
  X,
  Phone,
  Mail,
  Facebook,
  Instagram,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Menu,
  BookOpenCheck,
  Home,
  UserCheck,
  Trophy,
  MessageCircle,
  CalendarCheck,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Helmet } from "react-helmet-async";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

const categories = [
  {
    name: "Academic Tutors",
    icon: GraduationCap,
    description: "School & college academics",
  },
  {
    name: "Spoken English",
    icon: Languages,
    description: "Fluency and confidence",
  },
  {
    name: "Music Classes",
    icon: Music,
    description: "Creative learning at home",
  },
  {
    name: "Programming",
    icon: Code2,
    description: "Coding and technology",
  },
  {
    name: "Fitness Trainers",
    icon: Dumbbell,
    description: "Personal training support",
  },
  {
    name: "Soft Skills",
    icon: HeartHandshake,
    description: "Communication and personality",
  },
];

const trustStats = [
  {
    label: "Verified tutors",
    value: "100+",
    icon: ShieldCheck,
  },
  {
    label: "Subjects covered",
    value: "35+",
    icon: BookOpenCheck,
  },
  {
    label: "Flexible learning",
    value: "Online + Home",
    icon: Home,
  },
  {
    label: "Parent-first support",
    value: "Quick demo",
    icon: UserCheck,
  },
];

const processSteps = [
  {
    title: "Share requirement",
    description:
      "Tell us class, curriculum, subjects, location, and preferred timing.",
    icon: MessageCircle,
  },
  {
    title: "Get matched",
    description:
      "Our team shortlists suitable tutors based on subject, area, and teaching mode.",
    icon: UserCheck,
  },
  {
    title: "Book demo",
    description:
      "Try a demo class and continue only when the tutor is the right fit.",
    icon: CalendarCheck,
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getInitials(name = "ST") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getTutorImage(photo) {
  if (!photo) return "";

  return photo.includes("/upload/")
    ? photo.replace("/upload/", "/upload/f_auto,q_auto,w_220/")
    : photo;
}

function SectionTitle({ eyebrow, title, subtitle, center = false }) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
      {eyebrow ? (
        <p className="mb-3 inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-700 ring-1 ring-blue-100">
          {eyebrow}
        </p>
      ) : null}

      <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
        {title}
      </h2>

      {subtitle ? (
        <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: 28, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/90 px-6 py-5 backdrop-blur">
              <h3 className="text-xl font-black text-slate-950">{title}</h3>

              <button
                onClick={onClose}
                className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function InfoPill({ icon: Icon, text, highlight }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
      <Icon
        className={cn(
          "h-4 w-4 flex-shrink-0",
          highlight ? "text-amber-500" : "text-slate-500"
        )}
      />
      <span className="truncate font-semibold text-slate-700">{text}</span>
    </div>
  );
}

function TutorCard({ tutor, onViewProfile, onBook, swipeMode = false }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.22 }}
      className={
        swipeMode
          ? "w-[88vw] max-w-sm flex-shrink-0 snap-start sm:w-[420px]"
          : ""
      }
    >
      <Card className="group h-full overflow-hidden rounded-[2rem] border-0 bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-2xl hover:shadow-slate-200">
        <CardContent className="p-0">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/30 blur-3xl" />
            <div className="absolute bottom-0 left-8 h-20 w-20 rounded-full bg-emerald-400/20 blur-2xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                {tutor.photo ? (
                  <img
                    src={getTutorImage(tutor.photo)}
                    alt={tutor.name}
                    loading="lazy"
                    width="72"
                    height="72"
                    className="h-[72px] w-[72px] rounded-3xl object-cover ring-4 ring-white/10"
                  />
                ) : (
                  <Avatar className="h-[72px] w-[72px] rounded-3xl ring-4 ring-white/10">
                    <AvatarFallback className="flex h-[72px] w-[72px] items-center justify-center rounded-3xl bg-white/10 text-lg font-black text-white">
                      {getInitials(tutor.name)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-xl font-black text-white">
                      {tutor.name || "Expert Tutor"}
                    </h3>

                    {tutor.verified ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-300/20">
                        <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                        Verified
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-sm text-slate-300">
                    {tutor.subject || tutor.category || "Subject expert"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 px-3 py-2 text-right ring-1 ring-white/15">
                <div className="text-sm font-black text-white">
                  ₹{tutor.price || 0}/hr
                </div>
                <div className="text-[11px] text-slate-300">Starting fee</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="line-clamp-3 text-sm leading-6 text-slate-600">
              {tutor.tagline ||
                tutor.about ||
                "Experienced tutor available for personalized learning support and demo classes."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(tutor.languages || ["English", "Hindi"])
                .slice(0, 4)
                .map((lang) => (
                  <Badge
                    key={lang}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    {lang}
                  </Badge>
                ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-600">
              <InfoPill icon={Star} text={tutor.rating || "4.8"} highlight />
              <InfoPill
                icon={MapPin}
                text={tutor.location || tutor.locations?.[0] || "Bangalore"}
              />
              <InfoPill
                icon={Clock3}
                text={tutor.experience || "Experienced"}
              />
              <InfoPill icon={Users} text={tutor.mode || "Online/Home"} />
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 font-bold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-black"
                onClick={() => onBook(tutor)}
              >
                Request Demo
              </Button>
<Link
  to="/payment"
  className="inline-flex items-center rounded-2xl bg-green-600 px-6 py-4 font-black text-white shadow-xl shadow-green-900/20 transition hover:-translate-y-0.5 hover:bg-green-700"
>
  Pay for Demo Class
</Link>

              <Button
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-800 transition hover:bg-slate-50"
                onClick={() => onViewProfile(tutor)}
              >
                View Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [bookingTutor, setBookingTutor] = useState(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const sliderRef = useRef(null);

  const [bookingForm, setBookingForm] = useState({
    learnerName: "",
    phone: "",
    preferredDate: "",
    preferredSlot: "",
    message: "",
  });

  useEffect(() => {
    fetch(`${API_BASE}/tutors`)
      .then((res) => res.json())
      .then((data) => {
        const approvedTutors = Array.isArray(data)
          ? data.filter((tutor) => tutor.status === "approved")
          : [];

        setTutors(approvedTutors);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setToast("Could not load tutors.");
      });
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredTutors = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    return [...tutors]
      .filter((tutor) => {
        const matchesQuery =
          !normalizedQuery ||
          tutor.name?.toLowerCase().includes(normalizedQuery) ||
          tutor.subject?.toLowerCase().includes(normalizedQuery) ||
          tutor.location?.toLowerCase().includes(normalizedQuery) ||
          tutor.locations?.join(" ").toLowerCase().includes(normalizedQuery) ||
          tutor.category?.toLowerCase().includes(normalizedQuery);

        const matchesCategory =
          selectedCategory === "All" || tutor.category === selectedCategory;

        const matchesVerified = !verifiedOnly || tutor.verified;

        const matchesOnline =
          !onlineOnly || (tutor.mode || "").toLowerCase().includes("online");

        return (
          matchesQuery && matchesCategory && matchesVerified && matchesOnline
        );
      })
      .sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      );
  }, [tutors, query, selectedCategory, verifiedOnly, onlineOnly]);

  async function submitBooking() {
    if (!bookingTutor) return;

    if (!bookingForm.learnerName.trim() || !bookingForm.phone.trim()) {
      setToast("Please enter learner name and phone number.");
      return;
    }

    const payload = {
      tutorId: bookingTutor._id,
      tutorName: bookingTutor.name,
      ...bookingForm,
    };

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setToast(`Demo requested with ${bookingTutor.name}`);
        setBookingTutor(null);
        setBookingForm({
          learnerName: "",
          phone: "",
          preferredDate: "",
          preferredSlot: "",
          message: "",
        });
      } else {
        setToast("Booking failed");
      }
    } catch {
      setToast("Booking failed");
    }
  }

  function scrollTutors(direction) {
    if (!sliderRef.current) return;

    const amount = direction === "left" ? -360 : 360;
    sliderRef.current.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Helmet>
        <title>
          Private Home Tutors near me in Bangalore | Saraswati Tutorials
        </title>

        <meta
          name="description"
          content="Hire patient, experienced, background-verified home tutors in Bangalore for Classes 6–12, graduation, competitive exams, and skills."
        />
      </Helmet>

      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Saraswati Tutorial Logo"
              className="h-12 w-12 rounded-2xl object-contain shadow-sm"
            />

            <div>
              <div className="text-lg font-black tracking-tight text-slate-950 md:text-xl">
                Saraswati Tutorial
              </div>
              <div className="hidden text-xs font-semibold text-slate-500 sm:block">
                Home tutors in Bangalore
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold text-slate-700 md:flex">
            <a href="#home" className="hover:text-slate-950">
              Home
            </a>
            <a href="#tutors" className="hover:text-slate-950">
              Tutors
            </a>
            <a href="#process" className="hover:text-slate-950">
              How it works
            </a>
            <a href="#about" className="hover:text-slate-950">
              About
            </a>
            <a href="#contact" className="hover:text-slate-950">
              Contact
            </a>
            <Link to="/blogs" className="hover:text-slate-950">
              Blog
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/parent-enquiry"
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-black"
            >
              Book Demo
            </Link>

            <Link
              to="/tutor-register"
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
            >
              Become a Tutor
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-800 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 28 }}
            className="fixed inset-0 z-50 bg-white p-6"
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Saraswati Tutorial Logo"
                  className="h-12 w-12 rounded-2xl object-contain"
                />
                <h2 className="text-xl font-black">Menu</h2>
              </div>

              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border border-slate-200 p-3"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-lg font-bold text-slate-800">
              {["home", "tutors", "process", "about", "contact"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item}`}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl bg-slate-50 px-5 py-4 capitalize"
                  >
                    {item === "process" ? "How it works" : item}
                  </a>
                )
              )}

              <Link
                to="/blogs"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl bg-slate-50 px-5 py-4"
              >
                Blog
              </Link>

              <Link
                to="/parent-enquiry"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl bg-slate-950 px-5 py-4 text-center text-white"
              >
                Book Demo
              </Link>

              <Link
                to="/tutor-register"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-center text-white"
              >
                Become a Tutor
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section
        id="home"
        className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#60a5fa33,transparent_32%),radial-gradient(circle_at_top_right,#818cf833,transparent_28%),linear-gradient(135deg,#020617,#0f172a_45%,#172554)]"
      >
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-50 to-transparent" />

        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 md:grid-cols-[1.1fr_0.9fr] md:px-6 md:pb-28 md:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative z-10 flex flex-col justify-center"
          >
            <Badge className="mb-6 w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-blue-100 ring-1 ring-white/15 hover:bg-white/10">
              <Sparkles className="mr-2 h-4 w-4" />
              Personalized home tuition for Bangalore families
            </Badge>

            <h1 className="max-w-3xl text-5xl font-black tracking-tight text-white md:text-7xl">
              Find the right tutor, faster.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
              Hire experienced, background-verified private home tutors in
              Bangalore for Classes 6–12, competitive exams, graduation
              subjects, spoken English, and skills.
            </p>

            <div className="mt-8 rounded-[2rem] bg-white p-3 shadow-2xl shadow-blue-950/20 ring-1 ring-white/30 md:p-4">
              <div className="grid gap-3 lg:grid-cols-[1.25fr_0.8fr_auto]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-200 pl-12 text-base outline-none focus-visible:ring-slate-900"
                    placeholder="Search subject, tutor, or location"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-14 rounded-2xl border border-slate-200 bg-white px-4 font-semibold text-slate-700 outline-none"
                >
                  <option>All</option>
                  {categories.map((category) => (
                    <option key={category.name}>{category.name}</option>
                  ))}
                </select>

                <a
                  href="#tutors"
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-slate-950 px-6 font-black text-white transition hover:bg-black"
                >
                  Search
                </a>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                to="/parent-enquiry"
                className="group inline-flex items-center rounded-2xl bg-white px-6 py-4 font-black text-slate-950 shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5"
              >
                Book Free Demo Class
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </Link>

              <a
                href="#tutors"
                className="inline-flex items-center rounded-2xl border border-white/25 px-6 py-4 font-black text-white transition hover:bg-white/10"
              >
                Browse Tutors
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {trustStats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-3xl bg-white/10 p-4 text-white ring-1 ring-white/15 backdrop-blur"
                  >
                    <Icon className="mb-3 h-5 w-5 text-blue-200" />
                    <p className="text-lg font-black">{stat.value}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-300">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="relative z-10"
          >
            <div className="rounded-[2.5rem] bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-xl">
              <div className="rounded-[2rem] bg-white p-5 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                      Live Matching
                    </p>
                    <h3 className="mt-1 text-2xl font-black text-slate-950">
                      Top tutor categories
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                    Verified
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {categories.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.name}
                        onClick={() => setSelectedCategory(item.name)}
                        className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-1 hover:bg-white hover:shadow-xl"
                      >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm transition group-hover:bg-slate-950">
                          <Icon className="h-5 w-5 text-slate-700 transition group-hover:text-white" />
                        </div>

                        <div className="font-black text-slate-950">
                          {item.name}
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="tutors"
        className="mx-auto max-w-7xl px-5 py-16 md:px-6 md:py-20"
      >
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            eyebrow="Our tutors"
            title="Best home tutors in Bangalore"
            subtitle="Find experienced and verified tutors by subject, location, learning mode, and expertise."
          />

          <div className="flex flex-wrap gap-3 rounded-3xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
            <FilterToggle
              checked={verifiedOnly}
              onChange={setVerifiedOnly}
              label="Verified only"
            />

            <FilterToggle
              checked={onlineOnly}
              onChange={setOnlineOnly}
              label="Online only"
            />
          </div>
        </div>

        {loading ? (
          <LoadingTutors />
        ) : filteredTutors.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-lg font-black text-slate-950">
              No tutors found
            </p>
            <p className="mt-2 text-slate-500">
              Try removing filters or searching another subject/location.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between gap-3 lg:hidden">
              <p className="text-sm font-bold text-slate-500">
                Swipe to explore tutors
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => scrollTutors("left")}
                  className="rounded-full border border-slate-300 bg-white p-3 shadow-sm"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  onClick={() => scrollTutors("right")}
                  className="rounded-full border border-slate-300 bg-white p-3 shadow-sm"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              ref={sliderRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scroll-smooth lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {filteredTutors.map((tutor) => (
                <TutorCard
                  key={tutor._id}
                  tutor={tutor}
                  onViewProfile={setSelectedTutor}
                  onBook={setBookingTutor}
                  swipeMode
                />
              ))}
            </div>

            <div className="hidden gap-6 lg:grid lg:grid-cols-2">
              {filteredTutors.map((tutor) => (
                <TutorCard
                  key={tutor._id}
                  tutor={tutor}
                  onViewProfile={setSelectedTutor}
                  onBook={setBookingTutor}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <section id="process" className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-6">
          <SectionTitle
            center
            eyebrow="How it works"
            title="A simple parent-friendly matching process"
            subtitle="Designed to reduce confusion and help parents reach the right tutor quickly."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {processSteps.map((stepItem, index) => {
              const Icon = stepItem.icon;

              return (
                <motion.div
                  key={stepItem.title}
                  whileHover={{ y: -6 }}
                  className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-2xl hover:shadow-slate-200"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-6 w-6" />
                    </div>

                    <span className="text-4xl font-black text-slate-200">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-950">
                    {stepItem.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {stepItem.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-6 md:py-20">
        <div className="rounded-[2.5rem] bg-slate-950 p-6 text-white shadow-2xl md:p-10">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-blue-300">
                Popular courses
              </p>

              <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                High-demand courses in Bangalore
              </h2>

              <p className="mt-4 max-w-xl text-slate-300">
                Quick links for parents searching for specific tutoring
                requirements.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <CourseLink
                to="/courses/school-tuition/class-9-10/maths"
                text="Class 10 Maths Tuition"
              />
              <CourseLink
                to="/courses/school-tuition/class-9-10/science"
                text="Class 10 Science Tuition"
              />
              <CourseLink
                to="/courses/competitive-exams/jee/physics"
                text="JEE Physics Coaching"
              />
              <CourseLink
                to="/courses/skills/communication/spoken-english"
                text="Spoken English Classes"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-[0.9fr_1.1fr] md:items-start md:px-6">
          <div>
            <SectionTitle
              eyebrow="About us"
              title="Premium home tuition services in Bangalore"
            />

            <p className="mt-5 text-base leading-8 text-slate-600">
              Saraswati Tutorials helps students find patient, experienced,
              background-verified home tutors in Bangalore for Classes 6–12,
              graduation, competitive exams, spoken English, and skill
              development.
            </p>

            <Link
              to="/parent-enquiry"
              className="mt-7 inline-flex items-center rounded-2xl bg-slate-950 px-6 py-4 font-black text-white shadow-xl shadow-slate-200 transition hover:-translate-y-0.5"
            >
              Find the Right Tutor Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              icon={ShieldCheck}
              title="Verified Tutors"
              text="Qualified and committed educators with profile review and approval workflow."
            />

            <FeatureCard
              icon={Home}
              title="Flexible Learning"
              text="Choose online, offline, home tuition, and personal one-to-one options."
            />

            <FeatureCard
              icon={BookOpenCheck}
              title="Multi-Subject Support"
              text="School academics, college, programming, languages, soft skills, and more."
            />

            <FeatureCard
              icon={Trophy}
              title="Result-Oriented"
              text="A parent-friendly process focused on quality matching and demo classes."
            />
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="mx-auto max-w-7xl px-5 py-16 md:px-6 md:py-20"
      >
        <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
          <div className="overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-2xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-blue-300">
              Contact
            </p>

            <h2 className="text-4xl font-black tracking-tight">
              Need help finding the right tutor?
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Looking for a tuition teacher or private tutor near you in
              Bangalore? Contact Saraswati Tutorials and our team will guide
              you.
            </p>

            <div className="mt-8 space-y-4">
              <ContactRow icon={Phone} text="+91 8904457689 / +91 9041157689" />
              <ContactRow icon={Mail} text="support@saraswatitutorial.com" />
              <ContactRow icon={MapPin} text="Bengaluru, Karnataka" />
            </div>

            <div className="mt-8 flex gap-4">
              <a
                href="#"
                className="rounded-full bg-white/10 p-3 transition hover:bg-white/20"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>

              <a
                href="#"
                className="rounded-full bg-white/10 p-3 transition hover:bg-white/20"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
            <h3 className="text-2xl font-black text-slate-950">
              Start with a free demo request
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              Tell us your requirement and our team will help you select the
              right tutor option.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <FeatureMini
                title="Quick response"
                text="Faster lead review and parent support."
              />
              <FeatureMini
                title="Safe process"
                text="Organized enquiry and tutor approval flow."
              />
              <FeatureMini
                title="Local matching"
                text="Area-based tutor shortlisting."
              />
              <FeatureMini
                title="Flexible mode"
                text="Online and home tuition options."
              />
            </div>

            <Link
              to="/parent-enquiry"
              className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 font-black text-white shadow-xl shadow-blue-200 transition hover:-translate-y-0.5 sm:w-auto"
            >
              Open Parent Enquiry Form
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <iframe
              title="Google Map Location"
              src="https://www.google.com/maps?q=Bangalore&output=embed"
              width="100%"
              height="210"
              className="mt-8 rounded-3xl border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <h3 className="text-lg font-black text-slate-950">
              Saraswati Tutorial
            </h3>
            <p className="text-sm text-slate-500">
              Helping learners grow with the right guidance.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-600">
            <a href="#home">Home</a>
            <a href="#tutors">Tutors</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact Us</a>
            <Link to="/testimonials">Testimonials</Link>
            <Link to="/blogs">Blog</Link>
            <Link to="/terms-conditions">Terms</Link>
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/disclaimer">Disclaimer</Link>
          </div>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Saraswati Tutorial.
          </p>
        </div>

        <a
          href="https://wa.me/918904457689"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 font-black text-white shadow-2xl transition hover:scale-105 hover:bg-green-600"
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp
        </a>
      </footer>

      <Modal
        open={!!selectedTutor}
        onClose={() => setSelectedTutor(null)}
        title="Tutor Profile"
      >
        {selectedTutor ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              {selectedTutor.photo ? (
                <img
                  src={getTutorImage(selectedTutor.photo)}
                  alt={selectedTutor.name}
                  loading="lazy"
                  className="h-20 w-20 rounded-3xl object-cover"
                />
              ) : (
                <Avatar className="h-20 w-20 rounded-3xl">
                  <AvatarFallback className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-lg font-black text-slate-800">
                    {getInitials(selectedTutor.name)}
                  </AvatarFallback>
                </Avatar>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-2xl font-black text-slate-950">
                    {selectedTutor.name}
                  </h4>

                  {selectedTutor.verified ? (
                    <Badge className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                      Verified
                    </Badge>
                  ) : null}
                </div>

                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {selectedTutor.subject} •{" "}
                  {selectedTutor.location ||
                    selectedTutor.locations?.[0] ||
                    "Bangalore"}
                </p>
              </div>
            </div>

            <p className="text-sm leading-7 text-slate-600">
              {selectedTutor.about ||
                "Experienced tutor available for personalized learning support."}
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <ProfileStat
                title={selectedTutor.qualification || "Qualified tutor"}
                label="Qualification"
              />
              <ProfileStat
                title={selectedTutor.experience || "Experienced"}
                label="Experience"
              />
              <ProfileStat
                title={`₹${selectedTutor.price || 0}/hr`}
                label="Starting fee"
              />
            </div>

            <Button
              className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white"
              onClick={() => {
                setBookingTutor(selectedTutor);
                setSelectedTutor(null);
              }}
              aria-label={`Book demo with ${selectedTutor?.name || "tutor"}`}
            >
              Book demo
            </Button>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={!!bookingTutor}
        onClose={() => setBookingTutor(null)}
        title="Book Demo Class"
      >
        {bookingTutor ? (
          <div className="space-y-5">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="font-black text-slate-950">{bookingTutor.name}</p>
              <p className="mt-1 text-sm text-slate-600">
                {bookingTutor.subject} • ₹{bookingTutor.price || 0}/hr
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                className="h-12 rounded-2xl border border-slate-200 px-4"
                placeholder="Learner name"
                value={bookingForm.learnerName}
                onChange={(e) =>
                  setBookingForm({
                    ...bookingForm,
                    learnerName: e.target.value,
                  })
                }
              />

              <Input
                className="h-12 rounded-2xl border border-slate-200 px-4"
                placeholder="Phone number"
                value={bookingForm.phone}
                onChange={(e) =>
                  setBookingForm({
                    ...bookingForm,
                    phone: e.target.value,
                  })
                }
              />

              <Input
                type="date"
                className="h-12 rounded-2xl border border-slate-200 px-4"
                value={bookingForm.preferredDate}
                onChange={(e) =>
                  setBookingForm({
                    ...bookingForm,
                    preferredDate: e.target.value,
                  })
                }
              />

              <Input
                className="h-12 rounded-2xl border border-slate-200 px-4"
                placeholder="Preferred slot"
                value={bookingForm.preferredSlot}
                onChange={(e) =>
                  setBookingForm({
                    ...bookingForm,
                    preferredSlot: e.target.value,
                  })
                }
              />
            </div>

            <textarea
              className="min-h-[110px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950"
              placeholder="Message or learning requirement"
              value={bookingForm.message}
              onChange={(e) =>
                setBookingForm({
                  ...bookingForm,
                  message: e.target.value,
                })
              }
            />

            <div className="flex items-center justify-between rounded-3xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Demo request will be shared instantly.
              </div>
              <span>Secure flow</span>
            </div>

            <div className="flex gap-3">
              <Button
                className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white"
                onClick={submitBooking}
                aria-label="Confirm tutor booking"
              >
                Confirm booking
              </Button>

              <Button
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800"
                onClick={() => setBookingTutor(null)}
                aria-label="Cancel booking"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 right-5 z-50 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-2xl"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function FilterToggle({ checked, onChange, label }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition",
        checked
          ? "bg-slate-950 text-white"
          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-blue-600"
      />
      {label}
    </label>
  );
}

function LoadingTutors() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-80 animate-pulse rounded-[2rem] bg-white ring-1 ring-slate-200"
        />
      ))}
    </div>
  );
}

function CourseLink({ to, text }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-2xl bg-white/10 px-4 py-4 font-bold text-white ring-1 ring-white/10 transition hover:bg-white/15"
    >
      {text}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
    </Link>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-xl"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
    </motion.div>
  );
}

function FeatureMini({ title, text }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <h4 className="font-black text-slate-950">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function ContactRow({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm font-semibold text-slate-100 ring-1 ring-white/10">
      <Icon className="h-5 w-5 text-blue-200" />
      <span>{text}</span>
    </div>
  );
}

function ProfileStat({ title, label }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="font-black text-slate-950">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}
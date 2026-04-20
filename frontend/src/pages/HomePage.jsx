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
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";


const categories = [
  { name: "Academic Tutors", icon: GraduationCap },
  { name: "Spoken English", icon: Languages },
  { name: "Music Classes", icon: Music },
  { name: "Programming", icon: Code2 },
  { name: "Fitness Trainers", icon: Dumbbell },
  { name: "Soft Skills", icon: HeartHandshake },
];


function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-600">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-base leading-7 text-slate-600">{subtitle}</p>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-2xl rounded-[28px] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 p-2"
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


function TutorCard({ tutor, onViewProfile, onBook, swipeMode = false }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={swipeMode ? "w-[88vw] max-w-sm flex-shrink-0 snap-start sm:w-[420px]" : ""}
    >
      <Card className="overflow-hidden rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {tutor.photo ? (
                <img
                  src={tutor.photo}
                  alt={tutor.name}
                  loading="lazy"
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <Avatar className="h-16 w-16 rounded-2xl">
                  <AvatarFallback className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
                    {tutor.name?.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              )}


              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-lg font-semibold text-slate-900">
                    {tutor.name}
                  </h3>
                  {tutor.verified ? (
                    <Badge className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                      <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                      Verified
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-slate-600">{tutor.subject}</p>
              </div>
            </div>


            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right">
              <div className="text-sm font-semibold text-slate-900">
                ₹{tutor.price || 0}/hr
              </div>
              <div className="text-xs text-slate-500">Starting fee</div>
            </div>
          </div>


          <p className="mt-4 text-sm leading-6 text-slate-600">
            {tutor.tagline ||
              tutor.about ||
              "Experienced tutor available for personalized learning support."}
          </p>


          <div className="mt-4 flex flex-wrap gap-2">
            {(tutor.languages || []).map((lang) => (
              <Badge
                key={lang}
                className="rounded-full bg-slate-100 px-3 py-1 text-slate-700"
              >
                {lang}
              </Badge>
            ))}
          </div>


          <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              {tutor.rating || 4.5}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {tutor.location}
            </div>
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {tutor.experience}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {tutor.mode}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-white"
              onClick={() => onBook(tutor)}
            >
              Request Demo
            </Button>
            <Button
              className="flex-1 rounded-2xl border border-slate-300 px-4 py-3"
              onClick={() => onViewProfile(tutor)}
            >
              View Profile
            </Button>
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
const [blogForm, setBlogForm] = useState({
  content: "",
});

  // useEffect(() => {
  //   fetch(`${API_BASE}/tutors`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setTutors(data);
  //       setLoading(false);
  //     })
  //     .catch(() => {
  //       setLoading(false);
  //       setToast("Could not load tutors.");
  //     });
  // }, []);
  useEffect(() => {
    fetch(`${API_BASE}/tutors`)
      .then((res) => res.json())
      .then((data) => {
        //  IMPORTANT: sirf approved filter
        const approvedTutors = data.filter(
          (tutor) => tutor.status === "approved"
        );


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
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);


  const filteredTutors = useMemo(() => {
  return [...tutors]
    .filter((tutor) => {
      const q = query.toLowerCase();


      const matchesQuery =
        tutor.name?.toLowerCase().includes(q) ||
        tutor.subject?.toLowerCase().includes(q) ||
        tutor.location?.toLowerCase().includes(q) ||
        tutor.category?.toLowerCase().includes(q);


      const matchesCategory =
        selectedCategory === "All" || tutor.category === selectedCategory;


      const matchesVerified = !verifiedOnly || tutor.verified;
      const matchesOnline =
        !onlineOnly || (tutor.mode || "").toLowerCase().includes("online");


      return (
        matchesQuery && matchesCategory && matchesVerified && matchesOnline
      );
    })
    .sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [tutors, query, selectedCategory, verifiedOnly, onlineOnly]);


  async function submitBooking() {
    if (!bookingTutor) return;


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
    const amount = direction === "left" ? -320 : 320;
    sliderRef.current.scrollBy({ left: amount, behavior: "smooth" });
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="flex items-center gap-2">


              <h1 className="text-xl font-bold text-slate-900">
                Saraswati Tutorial
              </h1>
            </div>
          </div>


          <nav className="hidden items-center gap-8 md:flex">
            <a href="#home">Home</a>
            <a href="#tutors">Tutors</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>


            <Link to="/blogs">Blog</Link>


            <Link
              to="/parent-enquiry"
              className="rounded-xl bg-slate-900 px-4 py-2 text-white"
            >
              Book Demo
            </Link>
            <Link
              to="/tutor-register"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 text-white transition"
            >
              Become a Tutor
            </Link>
          </nav>


          <button onClick={() => setMenuOpen(true)} className="md:hidden">
            ☰
          </button>
        </div>
      </header>


      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-50 bg-white p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setMenuOpen(false)}>✕</button>
            </div>


            <div className="flex flex-col gap-6 text-lg">
              <a href="#home" onClick={() => setMenuOpen(false)}>
                Home
              </a>
              <a href="#tutors" onClick={() => setMenuOpen(false)}>
                Tutors
              </a>
              <a href="#about" onClick={() => setMenuOpen(false)}>
                About
              </a>
              <a href="#contact" onClick={() => setMenuOpen(false)}>
                Contact
              </a>


              <Link to="/blogs" onClick={() => setMenuOpen(false)}>
                Blog
              </Link>


              <Link
                to="/parent-enquiry"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-black px-5 py-3 text-center text-white"
              >
                Book Demo
              </Link>
              <Link
                to="/tutor-register"
                onClick={() => setMenuOpen(false)}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-3 text-center text-white transition"
              >
                Become a Tutor
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center">
            <Badge className="mb-5 w-fit rounded-full bg-white/10 px-4 py-2 text-white">
              Personalized guidance for school, college, and skill development
            </Badge>


            <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-white md:text-6xl">
              Best Home Tutors in Bangalore – Saraswati Tutorial
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-200">
              Discover verified tutors, compare profiles, and book a demo
              session for your child or yourself — all in one professional
              learning platform.
            </p>


            <div className="mt-8 rounded-[28px] bg-white p-4 shadow-xl">
              <div className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 pl-11"
                    placeholder="Search subject, tutor, or location"
                  />
                </div>


                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none"
                >
                  <option>All</option>
                  {categories.map((category) => (
                    <option key={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>


            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to="/parent-enquiry"
                className="rounded-2xl bg-white px-6 py-3 font-medium text-slate-900 shadow"
              >
                Book Free Demo
              </Link>
              <a
                href="#tutors"
                className="rounded-2xl border border-white/30 px-6 py-3 font-medium text-white"
              >
                Browse Tutors
              </a>
            </div>
          </div>


          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.name}
                  className="rounded-3xl border-0 bg-white/95 shadow-sm ring-1 ring-white/20"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                      <Icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div className="font-semibold text-slate-900">
                      {item.name}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      High-quality tutoring support with flexible options.
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>


      <section id="tutors" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            eyebrow="Our tutors"


            title="Best Home Tutors in Bangalore"
            subtitle="Find experienced and verified home tutors in Bangalore by subject, location, and expertise."


          />


          <div className="flex gap-3">
            <label className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
              />
              Verified only
            </label>


            <label className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200">
              <input
                type="checkbox"
                checked={onlineOnly}
                onChange={(e) => setOnlineOnly(e.target.checked)}
              />
              Online only
            </label>
          </div>
        </div>


        {loading ? (
          <div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200">
            Loading tutors...
          </div>
        ) : filteredTutors.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 ring-1 ring-slate-200">
            No tutors found for the selected filters.
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-end gap-2 lg:hidden">
              <button
                onClick={() => scrollTutors("left")}
                className="rounded-full border border-slate-300 bg-white p-3 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollTutors("right")}
                className="rounded-full border border-slate-300 bg-white p-3 shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
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


            <div className="hidden gap-6 xl:grid xl:grid-cols-2">
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


        <div className="mt-10">
          <h2 className="text-2xl font-semibold">Popular Tutors in Bangalore</h2>


          <div className="mt-4 flex flex-col gap-2">


            <Link to="/tutors/science" className="text-blue-600 hover:underline">
              Science Tutors in Bangalore
            </Link>


            <Link to="/tutors/maths" className="text-blue-600 hover:underline">
              Maths Tutors in Bangalore
            </Link>


            <Link to="/tutors/english" className="text-blue-600 hover:underline">
              English Speaking Classes in Bangalore
            </Link>


          </div>
        </div>


      </section>


      <section id="about" className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2">
          <div>


            <SectionTitle
              eyebrow="About us"
              title="Best Home Tuition Services in Bangalore"
              subtitle="Saraswati Tutorial helps students connect with experienced and verified home tutors in Bangalore for all subjects and skill development."
            />
          </div>


          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Verified Tutors
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                We aim to connect learners with genuine, qualified, and
                committed educators.
              </p>
            </div>


            <div className="rounded-3xl bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Flexible Learning
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Online, offline, and home tuition options to suit every
                family’s needs.
              </p>
            </div>


            <div className="rounded-3xl bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Multi-Subject Support
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                From school academics to programming, spoken English, fitness,
                and soft skills.
              </p>
            </div>


            <div className="rounded-3xl bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Parent-Friendly Process
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Easy enquiry flow, demo booking, and direct tutor coordination.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section id="contact" className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-[32px] bg-slate-900 p-8 text-white shadow-xl">
            <h2 className="text-3xl font-bold">Contact Us</h2>
            <p className="mt-3 text-slate-300">
              Reach out for tutor assistance, parent enquiries, demo support,
              or business collaboration.
            </p>


            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5" />
                <span>+91 8904457689</span>
                <span>+91 9041157689</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5" />
                <span>support@saraswatitutorial.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5" />
                <span>Bengaluru, Karnataka</span>
              </div>
            </div>


            <iframe
              src="https://www.google.com/maps?q=Bangalore&output=embed"
              width="100%"
              height="200"
              style={{ border: 0, marginTop: "16px" }}
              loading="lazy"
            ></iframe>


            <div className="mt-8 flex gap-4">
              <a href="#" className="rounded-full bg-white/10 p-3">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-full bg-white/10 p-3">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>


          <div className="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-2xl font-semibold text-slate-900">
              Need help finding the right tutor?
            </h3>
            <p className="mt-3 text-slate-600">
              Tell us your requirement and our team will guide you to the best
              tutor option.
            </p>


            <div className="mt-6">
              <Link
                to="/parent-enquiry"
                className="inline-flex rounded-2xl bg-slate-900 px-6 py-3 font-medium text-white"
              >
                Open Parent Enquiry Form
              </Link>
            </div>


            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <h4 className="font-semibold text-slate-900">
                  Quick Response
                </h4>
                <p className="mt-1 text-sm text-slate-600">
                  We try to respond to enquiries as quickly as possible.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <h4 className="font-semibold text-slate-900">Safe Process</h4>
                <p className="mt-1 text-sm text-slate-600">
                  Secure lead collection and organized parent support workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Saraswati Tutorial
            </h3>
            <p className="text-sm text-slate-500">
              Helping learners grow with the right guidance.
            </p>
          </div>


          <div className="flex flex-wrap gap-6 text-sm text-slate-600">
            <a href="#home">Home</a>
            <a href="#tutors">Tutors</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact Us</a>
            <Link to="/blogs">Blog</Link>
            <Link to="/tutors/science">Science Tutors in Bangalore</Link>
            <Link to="/tutors/maths">Maths Tutors in Bangalore</Link>
            <Link to="/tutors/english">English Speaking Classes in Bangalore</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/disclaimer">Disclaimer</Link>

          </div>


          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Saraswati Tutorial. All rights
            reserved.
          </p>
        </div>
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
                  src={selectedTutor.photo}
                  alt={selectedTutor.name}
                  loading="lazy"
                  width="100"
                  height="100"
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <Avatar className="h-16 w-16 rounded-2xl">
                  <AvatarFallback className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
                    {selectedTutor.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}


              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-2xl font-semibold text-slate-900">
                    {selectedTutor.name}
                  </h4>
                  {selectedTutor.verified ? (
                    <Badge className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                      Verified
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-slate-600">
                  {selectedTutor.subject} • {selectedTutor.location}
                </p>
              </div>
            </div>


            <p className="text-sm leading-7 text-slate-600">
              {selectedTutor.about}
            </p>


            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="font-semibold text-slate-900">
                  {selectedTutor.qualification || "Qualified tutor"}
                </div>
                <div className="text-sm text-slate-500">Qualification</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="font-semibold text-slate-900">
                  {selectedTutor.experience}
                </div>
                <div className="text-sm text-slate-500">Experience</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="font-semibold text-slate-900">
                  ₹{selectedTutor.price || 0}/hr
                </div>
                <div className="text-sm text-slate-500">Starting fee</div>
              </div>
            </div>


            <div className="flex gap-3">
              <Button
                className="rounded-2xl bg-slate-900 px-4 py-3 text-white"
                onClick={() => {
                  setBookingTutor(selectedTutor);
                  setSelectedTutor(null);
                }}
              >
                Book demo
              </Button>


            </div>
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
              <p className="font-medium text-slate-900">{bookingTutor.name}</p>
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
                  setBookingForm({ ...bookingForm, phone: e.target.value })
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
            <ReactQuill
              value={blogForm.content}
              onChange={(value) =>
                setBlogForm({ ...blogForm, content: value })
              }
              theme="snow"
            />
            <div className="flex items-center justify-between rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Demo request will be shared with the tutor instantly.
              </div>
              <span>Secure flow</span>
            </div>


            <div className="flex gap-3">
              <Button
                className="rounded-2xl bg-slate-900 px-4 py-3 text-white"
                onClick={submitBooking}
              >
                Confirm booking
              </Button>
              <Button
                className="rounded-2xl border border-slate-300 px-4 py-3"
                onClick={() => setBookingTutor(null)}
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
            className="fixed bottom-5 right-5 z-50 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}


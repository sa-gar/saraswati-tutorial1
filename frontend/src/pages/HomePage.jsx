import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import ChatBot from "../components/ChatBot";
import PlansSection from "../components/PlansSection";
import { API_BASE } from "../config";
import {
  Search,
  Star,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  CreditCard,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Phone,
  Mail,
  Menu,
  X,
  Award,
  HelpCircle,
  Users,
  Check,
  MessageCircle,
  Clock3,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";



const MotionLink = motion(Link);

const categories = [
  {
    name: "Academic Tutors",
    icon: Users,
    description: "School & college academics",
  },
  {
    name: "Spoken English",
    icon: MessageCircle,
    description: "Fluency and confidence",
  },
  {
    name: "Music Classes",
    icon: Sparkles,
    description: "Creative learning at home",
  },
  {
    name: "Programming",
    icon: BookOpen,
    description: "Coding and technology",
  },
  {
    name: "Fitness Trainers",
    icon: Award,
    description: "Personal training support",
  },
  {
    name: "Soft Skills",
    icon: CheckCircle2,
    description: "Communication and personality",
  },
];

const handleLocationRedirect = (city) => {
  localStorage.setItem("userLocation", city);
  const currentHost = window.location.hostname;

  if (city === "Mumbai") {
    if (currentHost.includes("localhost")) {
      window.location.href = "/mumbai";
    } else {
      window.location.href = "https://mumbai.saraswatitutorial.com/";
    }
  } else {
    if (currentHost.includes("localhost")) {
      window.location.href = "/";
    } else {
      window.location.href = "https://saraswatitutorial.com/";
    }
  }
};

function LocationDropdown({ activeCity }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-50">
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.95, backgroundColor: "rgba(15, 23, 42, 0.15)", borderColor: "rgba(15, 23, 42, 0.3)" }}
        className="flex items-center gap-2 rounded-full border border-white/50 bg-white/40 backdrop-blur-sm px-3.5 py-2 text-xs font-black text-slate-700 hover:bg-white/60 transition ring-1 ring-slate-200/30"
      >
        <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
        <span>{activeCity}</span>
        <span className="text-[9px] opacity-60">▼</span>
      </motion.button>

      {open && (
        <div className="absolute left-0 mt-2 w-32 rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md p-1.5 shadow-xl ring-1 ring-slate-200/50">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95, backgroundColor: "rgba(15, 23, 42, 0.1)" }}
            onClick={() => {
              setOpen(false);
              handleLocationRedirect("Bangalore");
            }}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold transition hover:bg-white/50 ${activeCity === "Bangalore" ? "text-blue-600 bg-blue-50/50" : "text-slate-700"
              }`}
          >
            Bangalore
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95, backgroundColor: "rgba(15, 23, 42, 0.1)" }}
            onClick={() => {
              setOpen(false);
              handleLocationRedirect("Mumbai");
            }}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold transition hover:bg-white/50 ${activeCity === "Mumbai" ? "text-blue-600 bg-blue-50/50" : "text-slate-700"
              }`}
          >
            Mumbai
          </motion.button>
        </div>
      )}
    </div>
  );
}

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

function InfoPill({ icon: Icon, text, highlight }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
      <Icon
        className={cn(
          "h-4 w-4 flex-shrink-0",
          highlight ? "text-amber-500" : "text-slate-500"
        )}
      />
      <span className="truncate font-semibold text-slate-700 text-xs">{text}</span>
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

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button
                className="flex-1 min-w-[100px] rounded-2xl bg-slate-950 px-4 py-3 font-bold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-black text-xs"
                onClick={() => onBook(tutor)}
              >
                Request Demo
              </Button>
              
              <Link
                to="/payment"
                className="flex-1 min-w-[100px] inline-flex items-center justify-center rounded-2xl bg-green-600 px-4 py-3 font-bold text-white shadow-lg shadow-green-200 transition hover:-translate-y-0.5 hover:bg-green-700 text-xs"
              >
                Pay for Demo
              </Link>

              <Button
                className="flex-1 min-w-[100px] rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-800 transition hover:bg-slate-50 text-xs"
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

function ProfileStat({ title, label }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="font-black text-slate-950">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

function FilterToggle({ checked, onChange, label }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 text-xs font-black transition",
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
  const [activeFaq, setActiveFaq] = useState(null);

  const sliderRef = useRef(null);

  const [bookingForm, setBookingForm] = useState({
    learnerName: "",
    phone: "",
    preferredDate: "",
    preferredSlot: "",
    message: "",
  });

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

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

  // 5 exact Bangalore FAQs
  const faqs = [
    {
      q: "Do you provide home tuition across all areas of Bangalore?",
      a: "Yes, Saraswati Tutorials provides home tuition services across major areas of Bangalore including Whitefield, HSR Layout, Indiranagar, Jayanagar, Koramangala, JP Nagar, Electronic City, and nearby locations."
    },
    {
      q: "Which boards do your tutors cover?",
      a: "Our tutors teach students from CBSE, ICSE, IGCSE, IB and Karnataka State Board for Classes 6 to 12."
    },
    {
      q: "Is online tuition also available?",
      a: "Yes, we provide both home tuition and live online tuition classes with personalized one-to-one teaching support."
    },
    {
      q: "Can I book a demo class before hiring a tutor?",
      a: "Yes, parents can request a free demo class to evaluate the teaching style and subject expertise of the tutor."
    },
    {
      q: "Which subjects are available for tuition in Bangalore?",
      a: "We provide tuition for Maths, Science, Physics, Chemistry, Biology, English, Accounts, Economics and other major subjects."
    }
  ];

  // FAQ Schema JSON-LD
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  // Local Business Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Saraswati Tutorials",
    "url": "https://saraswatitutorial.com/",
    "logo": "https://saraswatitutorial.com/logo.png",
    "description": "Looking for home tuition in Bangalore? Saraswati Tutorials provides expert home tutors for CBSE, ICSE, IGCSE, IB & Karnataka State Board students from Class 6 to 12 across Bangalore.",
    "telephone": "+91 8904457689",
    "email": "support@saraswatitutorial.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bangalore",
      "addressRegion": "Karnataka",
      "addressCountry": "IN"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "Bangalore"
    },
    "serviceType": "Home Tuition",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Saraswati Tutorials",
      "url": "https://saraswatitutorial.com/"
    }
  };

  const whyChooseUs = [
    { title: "Verified & Experienced Tutors", desc: "All our tutors undergo strict background checks and academic evaluations.", icon: ShieldCheck },
    { title: "One-to-One Personalized Classes", desc: "Customized attention mapping to your child's learning pace.", icon: Users },
    { title: "Home & Online Tuition Available", desc: "Flexible modes—learn offline at home or online via live interactive classes.", icon: Award },
    { title: "Regular Tests & Progress Tracking", desc: "Periodic examinations and feedback reports provided to parents.", icon: CheckCircle2 },
    { title: "Flexible Timings", desc: "Sessions scheduled around your child's school and daily routine.", icon: Clock },
    { title: "Tutors for All Major Boards", desc: "Expert syllabus mapping for CBSE, ICSE, IGCSE, IB, and State Board.", icon: BookOpen },
    { title: "Affordable Fee Structure", desc: "High-quality academic support customized to fit family budgets.", icon: CreditCard },
    { title: "Free Demo Class Available", desc: "Book a trial class with no commitment to test compatibility.", icon: Sparkles }
  ];

  const schoolSubjects = [
    {
      title: "Mathematics Tuition",
      desc: "Master algebra, calculus, and geometry with step-by-step guidance from expert maths home tutors in Bangalore.",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Science Tuition",
      desc: "Build a strong foundation in physics, chemistry, and biology for classes 6 to 10 with interactive home tutoring.",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Physics Tuition",
      desc: "Simplify complex equations, mechanics, and electricity concepts for board exams and competitive entrance tests.",
      image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Chemistry Tuition",
      desc: "Understand chemical equations, periodic tables, organic chemistry, and reactions with clear personal guidance.",
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Biology Tuition",
      desc: "Excel in life sciences, anatomy, and plant physiology with detailed diagrams, memory aids, and expert tutoring.",
      image: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "English Tuition",
      desc: "Improve grammar, literature understanding, essays, and communication skills with patient native educators.",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Hindi Tuition",
      desc: "Enhance vocabulary, grammar rules, script writing, and comprehension scores with professional Hindi tutors.",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Social Science Tuition",
      desc: "Score high in history, geography, civics, and economics with structured note-taking and concept maps.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600"
    }
  ];

  const commerceSubjects = [
    {
      title: "Accounts Tuition",
      desc: "Demystify ledger entries, balance sheets, and financial statements for class 11, 12, and college levels.",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Economics Tuition",
      desc: "Analyze micro and macroeconomics principles, supply-demand curves, and statistics with expert assistance.",
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Business Studies Tuition",
      desc: "Understand business operations, management theories, case studies, and trade practices with home tuition.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600"
    }
  ];

  const boards = [
    { name: "CBSE Board", desc: "Comprehensive coverage of the NCERT curriculum, focusing on board exam preparation, daily practice papers, and thorough revision for classes 6 to 12." },
    { name: "ICSE Board", desc: "Rigorous focus on the detailed ICSE/ISC syllabus, enhancing conceptual depth in science and mathematics, literature understanding, and mock tests." },
    { name: "IGCSE Board", desc: "International curriculum support focusing on analytical skills, exam patterns, past paper practice, and concept application for Cambridge assessments." },
    { name: "IB Board", desc: "In-depth guidance for IB Diploma and MYP programmes, assisting with Internal Assessments (IAs), Extended Essays (EE), and advanced concept mastery." },
    { name: "Karnataka State Board", desc: "Aligned syllabus support for SSLC and 2nd PUC exams, highlighting textbook exercises, board-pattern tests, and high-yield scoring topics." }
  ];

  const classesList = [
    {
      title: "Class 6 Home Tuition",
      desc: "Strengthening basics in Maths, Science, and English to transition smoothly to secondary levels.",
      image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=400"
    },
    {
      title: "Class 7 Home Tuition",
      desc: "Developing analytical and problem-solving skills for growing academic curriculums.",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=400"
    },
    {
      title: "Class 8 Home Tuition",
      desc: "Focusing on conceptual depth to prepare a solid launchpad for high school boards.",
      image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=400"
    },
    {
      title: "Class 9 Home Tuition",
      desc: "Crucial concept building mapping directly to class 10 boards and foundation exams.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400"
    },
    {
      title: "Class 10 Home Tuition",
      desc: "Rigorous mock tests, revision cycles, and board paper solving to secure top grades.",
      image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400"
    },
    {
      title: "Class 11 Home Tuition",
      desc: "Specialized guidance for Science (PCM/B) and Commerce streams during the board transition.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400"
    },
    {
      title: "Class 12 Home Tuition",
      desc: "Dedicated syllabus completion, revision, and practice to score maximum percentages.",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400"
    }
  ];

  const areas = [
    "Whitefield", "HSR Layout", "Indiranagar", "Jayanagar", "Koramangala",
    "JP Nagar", "Electronic City", "Marathahalli", "Bellandur", "BTM Layout",
    "Hebbal", "Yelahanka", "Malleshwaram", "Bannerghatta Road", "Kanakapura Road"
  ];

  const testimonials = [
    {
      name: "Mrs. Ritu Sharma",
      location: "Whitefield",
      role: "Parent of Class 10 CBSE Student",
      text: "Saraswati Tutorials helped my son improve his Class 10 CBSE Math score from 65% to 92%. The tutor from Whitefield was extremely patient and focused on solving past papers."
    },
    {
      name: "Mr. Anil Mehta",
      location: "HSR Layout",
      role: "Parent of IB Physics Student",
      text: "Finding a quality IB Physics tutor in HSR Layout was a major challenge. The tutor recommended by Saraswati Tutorials has been outstanding. Conceptual clarity has improved drastically."
    },
    {
      name: "Mrs. Deepa Kulkarni",
      location: "Indiranagar",
      role: "Parent of Class 12 PUC Student",
      text: "My daughter was struggling with Karnataka State Board Chemistry for Class 12. The home tutor from Indiranagar cleared her basics and regularly conducted test series. Highly recommended!"
    }
  ];

  const steps = [
    { title: "Submit Requirement", desc: "Share your child's class, board, subjects, location, and budget with us." },
    { title: "Tutor Shortlisting", desc: "Our team selects the most suitable and experienced tutors for your requirements." },
    { title: "Demo Class", desc: "Evaluate the teacher's style and chemistry with a free, no-obligation demo class." },
    { title: "Start Learning", desc: "Begin classes at home or online with scheduled progress reviews." }
  ];

  const updatedFaqSchema = {
    ...faqSchema,
    mainEntity: faqSchema.mainEntity.map((item, idx) => {
      if (idx === 0) {
        return {
          ...item,
          acceptedAnswer: {
            "@type": "Answer",
            "text": "Yes, Saraswati Tutorials provides home tuition services across major areas of Bangalore."
          }
        };
      }
      return item;
    })
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#eff6ff,transparent_50%),radial-gradient(ellipse_at_bottom,#f5f3ff,transparent_50%),linear-gradient(to_bottom,#f8fafc,#f1f5f9)] font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>Private Home Tutors near me in Bangalore | Saraswati Tutorials</title>
        <meta
          name="description"
          content="Hire patient, experienced, background-verified home tutors in Bangalore for Classes 6–12, graduation, competitive exams, and skills."
        />
        <link rel="canonical" href="https://saraswatitutorial.com/" />

        {/* Schemas */}
        <script type="application/ld+json">{JSON.stringify(updatedFaqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      </Helmet>

      {/* Glassmorphism Header */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Saraswati Tutorial Logo"
                className="h-10 w-10 rounded-xl object-contain shadow-sm"
                onError={(e) => {
                  e.target.src = "https://placehold.co/100x100?text=ST";
                }}
              />
              <div>
                <div className="text-lg font-black tracking-tight text-slate-950">
                  Saraswati Tutorial
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  Home Tutor
                </div>
              </div>
            </Link>

            <LocationDropdown activeCity="Bangalore" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-700 lg:flex">
            <a href="#home" className="transition hover:text-blue-600">Home</a>
            <a href="#tutors" className="transition hover:text-blue-600">Tutors</a>
            <a href="#why-choose" className="transition hover:text-blue-600">Why Us</a>
            <a href="#subjects" className="transition hover:text-blue-600">Subjects</a>
            <a href="#boards" className="transition hover:text-blue-600">Boards</a>
            <a href="#areas" className="transition hover:text-blue-600">Areas We Serve</a>
            <a href="#faqs" className="transition hover:text-blue-600">FAQs</a>
            <Link to="/blogs" className="transition hover:text-blue-600">Blog</Link>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <MotionLink
              to="/parent-enquiry"
              whileTap={{ scale: 0.95, backgroundColor: "rgba(15, 23, 42, 0.15)", borderColor: "rgba(15, 23, 42, 0.3)", color: "#0f172a" }}
              className="rounded-xl border border-transparent bg-slate-950 px-5 py-2.5 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-black"
            >
              Book Demo
            </MotionLink>
            <MotionLink
              to="/tutor-register"
              whileTap={{ scale: 0.95, backgroundColor: "rgba(15, 23, 42, 0.15)", borderColor: "rgba(15, 23, 42, 0.3)", color: "#0f172a" }}
              className="rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5"
            >
              Become a Tutor
            </MotionLink>
          </div>

          <motion.button
            onClick={() => setMenuOpen(!menuOpen)}
            whileTap={{ scale: 0.95, backgroundColor: "rgba(15, 23, 42, 0.1)" }}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-800 lg:hidden"
            aria-label="Open Navigation Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/20 bg-white/80 backdrop-blur-lg px-6 py-4 lg:hidden shadow-xl"
            >
              <div className="flex flex-col gap-4 text-base font-bold text-slate-800">
                <div className="flex items-center justify-between py-2 border-b border-white/20">
                  <span className="text-xs font-black uppercase text-slate-400">Select City:</span>
                  <LocationDropdown activeCity="Bangalore" />
                </div>
                <a href="#home" onClick={() => setMenuOpen(false)} className="py-2">Home</a>
                <a href="#tutors" onClick={() => setMenuOpen(false)} className="py-2">Tutors</a>
                <a href="#why-choose" onClick={() => setMenuOpen(false)} className="py-2">Why Us</a>
                <a href="#subjects" onClick={() => setMenuOpen(false)} className="py-2">Subjects</a>
                <a href="#boards" onClick={() => setMenuOpen(false)} className="py-2">Boards</a>
                <a href="#areas" onClick={() => setMenuOpen(false)} className="py-2">Areas We Serve</a>
                <a href="#faqs" onClick={() => setMenuOpen(false)} className="py-2">FAQs</a>
                <Link to="/blogs" onClick={() => setMenuOpen(false)} className="py-2">Blog</Link>
                <MotionLink
                  to="/parent-enquiry"
                  onClick={() => setMenuOpen(false)}
                  whileTap={{ scale: 0.95, backgroundColor: "rgba(15, 23, 42, 0.15)", borderColor: "rgba(15, 23, 42, 0.3)", color: "#0f172a" }}
                  className="rounded-xl border border-transparent bg-slate-950 py-3 text-center text-white font-black"
                >
                  Book Demo
                </MotionLink>
                <MotionLink
                  to="/tutor-register"
                  onClick={() => setMenuOpen(false)}
                  whileTap={{ scale: 0.95, backgroundColor: "rgba(15, 23, 42, 0.15)", borderColor: "rgba(15, 23, 42, 0.3)", color: "#0f172a" }}
                  className="rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-center text-white font-black"
                >
                  Become a Tutor
                </MotionLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#3b82f622,transparent_35%),radial-gradient(circle_at_top_right,#6366f122,transparent_30%),linear-gradient(135deg,#020617,#0f172a_50%,#1e1b4b)] py-20 text-white md:py-32"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl lg:leading-tight">
                Home Tuition in Bangalore for Class 6 to 12
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-300">
                Expert home tutors and online classes for CBSE, ICSE, IGCSE, IB & State Board students across Bangalore. Personalized one-to-one tuition for Maths, Science, English, Commerce, and skills.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <MotionLink
                  to="/parent-enquiry"
                  whileTap={{ scale: 0.95, backgroundColor: "rgba(255, 255, 255, 0.15)", borderColor: "rgba(255, 255, 255, 0.4)", color: "#ffffff" }}
                  className="group inline-flex items-center gap-2 rounded-2xl border border-transparent bg-white px-7 py-4 font-black text-slate-950 shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  Book Demo
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </MotionLink>

                <a
                  href="#tutors"
                  className="rounded-2xl border border-white/20 bg-white/5 px-7 py-4 font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10 text-center"
                >
                  Find a Home Tutor
                </a>
              </div>

              {/* Quick Stats Grid */}
              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black text-blue-400">100+</div>
                  <div className="text-xs font-semibold text-slate-400">Verified Tutors</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black text-blue-400">35+</div>
                  <div className="text-xs font-semibold text-slate-400">Subjects Covered</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black text-blue-400">All Boards</div>
                  <div className="text-xs font-semibold text-slate-400">Comprehensive Syllabus</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black text-blue-400">Free Trial</div>
                  <div className="text-xs font-semibold text-slate-400">Demo Class</div>
                </div>
              </div>
            </motion.div>

            {/* Parent Consultation Feature Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5 w-full mt-10 lg:mt-0"
            >
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/60 p-4 shadow-2xl backdrop-blur-xl">
                <div className="relative h-60 w-full overflow-hidden rounded-[2rem] shadow-inner">
                  <img
                    src="/bangalore_tutor_hero.png"
                    alt="Saraswati Home Tuition in Bangalore"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 rounded-xl bg-blue-600/80 px-3.5 py-1.5 text-[10px] font-black tracking-wide text-white backdrop-blur">
                    Verified Home Tutors
                  </div>
                </div>

                <div className="mt-6 p-4">
                  <h3 className="text-xl font-black text-white">Bangalore Parent Consultation</h3>
                  <p className="mt-2 text-xs text-slate-300">
                    Get in touch with our curriculum coordinator to discuss syllabus tracking, tutor preferences, and timings.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-sm">
                      <Phone className="h-5 w-5 text-blue-400" />
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Call / WhatsApp</div>
                        <div className="text-xs font-black text-white">+91 8904457689 / +91 9041157689</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-sm">
                      <Mail className="h-5 w-5 text-blue-400" />
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</div>
                        <div className="text-xs font-black text-white">support@saraswatitutorial.com</div>
                      </div>
                    </div>
                  </div>

                  <MotionLink
                    to="/parent-enquiry"
                    whileTap={{ scale: 0.95, backgroundColor: "rgba(255, 255, 255, 0.15)", borderColor: "rgba(255, 255, 255, 0.4)", color: "#ffffff" }}
                    className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-transparent bg-white text-sm font-black text-slate-950 transition hover:bg-slate-100 py-3"
                  >
                    Enquire Now
                    <ArrowRight className="h-4 w-4" />
                  </MotionLink>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <PlansSection />

      {/* Dynamic Tutors Directory Section */}
      <section
        id="tutors"
        className="mx-auto max-w-7xl px-6 py-16 md:py-24"
      >
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            eyebrow="Our Tutors"
            title="Best home tutors in Bangalore"
            subtitle="Find experienced and verified tutors by subject, location, learning mode, and expertise."
          />
        </div>

        {/* Dynamic Filters Control Panel */}
        <div className="mb-8 rounded-[2.5rem] border border-white/50 bg-white/30 backdrop-blur-xl p-6 shadow-xl shadow-slate-100/10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-center">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 pl-12 text-sm focus-visible:ring-slate-900 bg-white"
                placeholder="Search subject, tutor, or location..."
              />
            </div>

            {/* Category Select Dropdown */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none"
              >
                <option>All Categories</option>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Filter Toggle Checkboxes */}
            <div className="flex gap-2 sm:col-span-2 justify-start sm:justify-end">
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
        </div>

        {loading ? (
          <LoadingTutors />
        ) : filteredTutors.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/40 backdrop-blur-sm p-10 text-center">
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

      {/* SEO Intro Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2.5rem] border border-white/50 bg-white/30 backdrop-blur-xl p-8 shadow-xl shadow-slate-100/10 md:p-12">
          <div className="max-w-4xl">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Overview</h2>
            <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Home Tuition in Bangalore for Class 6 to 12
            </h3>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
              <p>
                Saraswati Tutorials provides trusted and result-oriented home tuition in Bangalore for students from Class 6 to 12. We offer experienced private tutors for CBSE, ICSE, IGCSE, IB and Karnataka State Board students across major areas of Bangalore including Whitefield, HSR Layout, Indiranagar, Jayanagar, Koramangala, Electronic City, and more. Our personalized one-to-one teaching approach helps students improve conceptual understanding, confidence, and academic performance.
              </p>
              <p>
                Whether your child needs help in Maths, Science, Physics, Chemistry, Biology, English, or Commerce subjects, our expert tutors provide customized learning plans, regular assessments, and dedicated doubt-solving support at home or online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section id="why-choose" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">Core Benefits</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Why Parents Prefer Saraswati Tutorials in Bangalore
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              We stand apart through our student-first philosophy, matching children with vetted subject-matter experts who act as academic mentors.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  key={idx}
                  className="rounded-3xl border border-white/60 bg-white/30 backdrop-blur-md p-6 shadow-sm shadow-slate-100/20 transition hover:bg-white/50 hover:shadow-xl hover:scale-[1.02]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h4 className="mt-5 text-lg font-black text-slate-950">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section id="subjects" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">Tuition Programs</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
            Subjects Available for Home Tuition in Bangalore
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Comprehensive curriculum guidance covering science, mathematics, literature, and accounting.
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {/* School Subjects */}
          <div>
            <h3 className="text-xl font-black text-slate-800 border-l-4 border-blue-600 pl-3 mb-6">
              School Subjects
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {schoolSubjects.map((subj, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden group rounded-3xl border border-white/60 bg-white/30 backdrop-blur-md shadow-sm shadow-slate-100/20 transition hover:bg-white/50 hover:shadow-xl hover:scale-[1.03] duration-300"
                >
                  <div className="h-44 w-full overflow-hidden">
                    <img
                      src={subj.image}
                      alt={subj.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600 transition group-hover:bg-blue-100">
                      {idx + 1}
                    </div>
                    <h4 className="mt-4 text-xl font-black text-slate-950">{subj.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {subj.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commerce Subjects */}
          <div>
            <h3 className="text-xl font-black text-slate-800 border-l-4 border-indigo-600 pl-3 mb-6">
              Commerce Subjects
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {commerceSubjects.map((subj, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden group rounded-3xl border border-white/60 bg-white/30 backdrop-blur-md shadow-sm shadow-slate-100/20 transition hover:bg-white/50 hover:shadow-xl hover:scale-[1.03] duration-300"
                >
                  <div className="h-44 w-full overflow-hidden">
                    <img
                      src={subj.image}
                      alt={subj.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-black text-indigo-600 transition group-hover:bg-indigo-100">
                      {idx + 1}
                    </div>
                    <h4 className="mt-4 text-xl font-black text-slate-950">{subj.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {subj.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Boards Section */}
      <section id="boards" className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-16 text-white md:py-24 border-t border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-400">Board Coverage</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">
              Boards We Cover
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Our teachers are thoroughly familiar with board assessment blueprints, question patterns, and formatting guidelines.
            </p>
          </div>

          <div className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            {boards.map((board, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] duration-300"
              >
                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">Syllabus</div>
                <h4 className="mt-2 text-xl font-black text-white">{board.name}</h4>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">{board.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classes Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">Structured Modules</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
            Tuition Classes Available
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Tailored grade-wise guidance designed to secure high scores and bolster conceptual foundations.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {classesList.map((cls, idx) => (
            <div
              key={idx}
              className="overflow-hidden group rounded-3xl border border-white/60 bg-white/30 backdrop-blur-md shadow-sm shadow-slate-100/20 transition hover:bg-white/50 hover:shadow-xl hover:scale-[1.03] duration-300"
            >
              <div className="h-32 w-full overflow-hidden">
                <img
                  src={cls.image}
                  alt={cls.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h4 className="mt-4 text-lg font-black text-slate-950">{cls.title}</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{cls.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Areas We Serve */}
      <section id="areas" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">Locations</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              Home Tuition Available Across Bangalore
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Our network of verified home tutors reaches all major commercial and residential pockets in Bangalore.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {areas.map((area, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-2xl border border-white/50 bg-white/40 backdrop-blur-sm p-4 transition hover:bg-white/60 hover:scale-[1.02]"
              >
                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-sm font-bold text-slate-800">{area}</span>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-slate-500">
            <p>
              Saraswati Tutorials has a widespread network of home tutors spanning across the entire Bangalore metropolitan region. Whether you live in East Bangalore, South Bangalore, North Bangalore, or neighboring areas, we can match you with an experienced private tutor who can conduct offline classes at your residence. In addition to offline sessions, our tutors are equipped to offer highly engaging and interactive online live classes, providing flexibility for busy student schedules.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">Process Flow</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
            How Our Tutor Matching Process Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Four simple steps to match your child with their perfect private home tutor.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <div key={idx} className="relative rounded-3xl border border-white/60 bg-white/30 backdrop-blur-md p-6 shadow-sm transition hover:bg-white/50 hover:scale-[1.02]">
              <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-black text-white shadow">
                {idx + 1}
              </div>
              <h4 className="mt-4 text-lg font-black text-slate-950">{step.title}</h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Parent Trust / Testimonials */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-16 text-white md:py-24 border-t border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_65%)]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-400">Testimonials</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">
              Trusted by Parents Across Bangalore
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              We focus on conceptual clarity, academic improvement and personalized attention for every student. Our tutors regularly track student performance and help children become more confident in exams and school studies.
            </p>
          </div>

          <div className="mt-12 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div key={idx} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">{t.text}</p>
                <div className="mt-6 border-t border-white/10 pt-4">
                  <div className="font-black text-white">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.role} ({t.location})</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">Questions</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-white/60 bg-white/30 backdrop-blur-md shadow-sm transition hover:bg-white/40"
              >
                <motion.button
                  onClick={() => toggleFaq(idx)}
                  whileTap={{ scale: 0.99, backgroundColor: "rgba(255, 255, 255, 0.4)" }}
                  className="flex w-full items-center justify-between px-6 py-5 text-left font-black text-slate-950 hover:bg-slate-50/50"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-5 w-5 text-blue-600" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </motion.button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="border-t border-white/20 bg-white/20 px-6 py-5 text-sm leading-relaxed text-slate-700">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-20 text-white border-t border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3b82f615,transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">
            Book a Demo Class Today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Get matched with experienced home tutors in Bangalore for your child’s academic needs.
          </p>
          <div className="mt-8">
            <Link
              to="/parent-enquiry"
              className="inline-flex items-center gap-2 rounded-2xl border border-transparent bg-white px-8 py-4 font-black text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Enquire Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/30 backdrop-blur-md py-12 text-slate-600">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Saraswati Tutorial Logo"
                  className="h-10 w-10 rounded-xl object-contain"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/100x100?text=ST";
                  }}
                />
                <span className="text-lg font-black text-slate-950">Saraswati Tutorial</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Expert tutoring services mapping local academic boards across Bangalore and Mumbai.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Direct Services</h5>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/parent-enquiry" className="hover:text-blue-600">Parent Enquiry</Link></li>
                <li><Link to="/tutor-register" className="hover:text-blue-600">Become a Tutor</Link></li>
                <li><a href="https://saraswatitutorial.com/" className="hover:text-blue-600">Home Tuition Services</a></li>
                <li><a href="https://saraswatitutorial.com/#tutors" className="hover:text-blue-600">Online Tuition</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Legal Details</h5>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/terms-conditions" className="hover:text-blue-600">Terms & Conditions</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link to="/disclaimer" className="hover:text-blue-600">Disclaimer</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Support Contact</h5>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>+91 8904457689 / +91 9041157689</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>support@saraswatitutorial.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Saraswati Tutorials. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Chat */}
      <motion.a
        href="https://wa.me/918904457689"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95, backgroundColor: "rgba(37, 211, 102, 0.2)", borderColor: "rgba(37, 211, 102, 0.5)" }}
        transition={{
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          },
          default: { duration: 0.3 }
        }}
        className="group fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-[#25D366] shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition hover:bg-[#128C7E]"
        aria-label="Contact WhatsApp"
      >
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="white"
            d="M12.004 2C6.48 2 2 6.48 2 12c0 2.17.69 4.19 1.86 5.86L2 22l4.27-1.13C7.9 21.58 9.9 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
          />
          <path
            className="fill-[#25D366] transition-colors duration-200 group-hover:fill-[#128C7E]"
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
          />
        </svg>
      </motion.a>

      {/* Tutor Profile Details Modal */}
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

      {/* Booking Form Modal */}
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
                className="h-12 rounded-2xl border border-slate-200 px-4 bg-white"
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
                className="h-12 rounded-2xl border border-slate-200 px-4 bg-white"
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
                className="h-12 rounded-2xl border border-slate-200 px-4 bg-white"
                value={bookingForm.preferredDate}
                onChange={(e) =>
                  setBookingForm({
                    ...bookingForm,
                    preferredDate: e.target.value,
                  })
                }
              />

              <Input
                className="h-12 rounded-2xl border border-slate-200 px-4 bg-white"
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
              className="min-h-[110px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-950 bg-white"
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

      {/* Toast Notification */}
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

      <ChatBot />
    </div>
  );
}
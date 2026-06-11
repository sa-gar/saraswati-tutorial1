import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import ChatBot from "../components/ChatBot";
import {
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
  MessageCircle
} from "lucide-react";

const MotionLink = motion(Link);

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

export default function MumbaiPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // 5 exact FAQs
  const faqs = [
    {
      q: "Do you provide home tuition across all areas of Mumbai?",
      a: "Yes, Saraswati Tutorials provides home tuition services across major areas of Mumbai including Andheri, Bandra, Powai, Borivali, Thane, Navi Mumbai and nearby locations."
    },
    {
      q: "Which boards do your tutors cover?",
      a: "Our tutors teach students from CBSE, ICSE, IGCSE, IB and Maharashtra State Board for Classes 6 to 12."
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
      q: "Which subjects are available for tuition in Mumbai?",
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

  // Local Business / Educational Organization Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Saraswati Tutorials",
    "url": "https://mumbai.saraswatitutorial.com/",
    "logo": "https://mumbai.saraswatitutorial.com/logo.png",
    "description": "Looking for home tuition in Mumbai? Saraswati Tutorials provides expert home tutors for CBSE, ICSE, IGCSE, IB & Maharashtra State Board students from Class 6 to 12 across Mumbai.",
    "telephone": "+91 9041157689",
    "email": "services@saraswatitutorial.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mumbai",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "Mumbai"
    },
    "serviceType": "Home Tuition",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Saraswati Tutorials",
      "url": "https://mumbai.saraswatitutorial.com/"
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
      desc: "Master algebra, calculus, and geometry with step-by-step guidance from expert maths home tutors in Mumbai.",
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
    { name: "Maharashtra State Board", desc: "Aligned syllabus support for SSC and HSC exams, highlighting textbook exercises, board-pattern tests, and high-yield scoring topics." }
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
    "Andheri", "Bandra", "Powai", "Dadar", "Borivali",
    "Kandivali", "Malad", "Goregaon", "Thane", "Navi Mumbai",
    "Chembur", "Vashi", "Ghatkopar", "Mulund", "Colaba"
  ];

  const testimonials = [
    {
      name: "Mrs. Ritu Sharma",
      location: "Andheri",
      role: "Parent of Class 10 CBSE Student",
      text: "Saraswati Tutorials helped my son improve his Class 10 CBSE Math score from 65% to 92%. The tutor from Andheri was extremely patient and focused on solving past papers."
    },
    {
      name: "Mr. Anil Mehta",
      location: "Powai",
      role: "Parent of IB Physics Student",
      text: "Finding a quality IB Physics tutor in Powai was a major challenge. The tutor recommended by Saraswati Tutorials has been outstanding. Conceptual clarity has improved drastically."
    },
    {
      name: "Mrs. Deepa Kulkarni",
      location: "Thane",
      role: "Parent of Class 12 HSC Student",
      text: "My daughter was struggling with Maharashtra State Board Chemistry for Class 12. The home tutor from Thane cleared her basics and regularly conducted test series. Highly recommended!"
    }
  ];

  const steps = [
    { title: "Submit Requirement", desc: "Share your child's class, board, subjects, location, and budget with us." },
    { title: "Tutor Shortlisting", desc: "Our team selects the most suitable and experienced tutors for your requirements." },
    { title: "Demo Class", desc: "Evaluate the teacher's style and chemistry with a free, no-obligation demo class." },
    { title: "Start Learning", desc: "Begin classes at home or online with scheduled progress reviews." }
  ];

  // Update FAQ Schema mainEntity specifically for index 0 to match exactly
  const updatedFaqSchema = {
    ...faqSchema,
    mainEntity: faqSchema.mainEntity.map((item, idx) => {
      if (idx === 0) {
        return {
          ...item,
          acceptedAnswer: {
            "@type": "Answer",
            "text": "Yes, Saraswati Tutorials provides home tuition services across major areas of Mumbai."
          }
        };
      }
      return item;
    })
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#eff6ff,transparent_50%),radial-gradient(ellipse_at_bottom,#f5f3ff,transparent_50%),linear-gradient(to_bottom,#f8fafc,#f1f5f9)] font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>Home Tuition in Mumbai | Best Home Tutors for Class 6-12</title>
        <meta
          name="description"
          content="Looking for home tuition in Mumbai? Saraswati Tutorials provides expert home tutors for CBSE, ICSE, IGCSE, IB & State Board students from Class 6 to 12 across Mumbai."
        />
        <link rel="canonical" href="https://mumbai.saraswatitutorial.com/" />

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

            <LocationDropdown activeCity="Mumbai" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-700 lg:flex">
            <a href="#home" className="transition hover:text-blue-600">Home</a>
            <a href="#why-choose" className="transition hover:text-blue-600">Why Us</a>
            <a href="#subjects" className="transition hover:text-blue-600">Subjects</a>
            <a href="#boards" className="transition hover:text-blue-600">Boards</a>
            <a href="#areas" className="transition hover:text-blue-600">Areas We Serve</a>
            <a href="#faqs" className="transition hover:text-blue-600">FAQs</a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <MotionLink
              to="/parent-enquiry"
              whileTap={{ scale: 0.95, backgroundColor: "rgba(15, 23, 42, 0.15)", borderColor: "rgba(15, 23, 42, 0.3)", color: "#0f172a" }}
              className="rounded-xl border border-transparent bg-slate-950 px-5 py-2.5 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-black"
            >
              Book Free Demo
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
                  <LocationDropdown activeCity="Mumbai" />
                </div>
                <a href="#home" onClick={() => setMenuOpen(false)} className="py-2">Home</a>
                <a href="#why-choose" onClick={() => setMenuOpen(false)} className="py-2">Why Us</a>
                <a href="#subjects" onClick={() => setMenuOpen(false)} className="py-2">Subjects</a>
                <a href="#boards" onClick={() => setMenuOpen(false)} className="py-2">Boards</a>
                <a href="#areas" onClick={() => setMenuOpen(false)} className="py-2">Areas We Serve</a>
                <a href="#faqs" onClick={() => setMenuOpen(false)} className="py-2">FAQs</a>
                <MotionLink
                  to="/parent-enquiry"
                  onClick={() => setMenuOpen(false)}
                  whileTap={{ scale: 0.95, backgroundColor: "rgba(15, 23, 42, 0.15)", borderColor: "rgba(15, 23, 42, 0.3)", color: "#0f172a" }}
                  className="rounded-xl border border-transparent bg-slate-950 py-3 text-center text-white font-black"
                >
                  Book Free Demo
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
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 to-transparent" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >


              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl lg:leading-tight">
                Home Tuition in Mumbai for Class 6 to 12
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-300">
                Expert home tutors and online classes for CBSE, ICSE, IGCSE, IB & State Board students across Mumbai. Personalized one-to-one tuition for Maths, Science, English and Commerce subjects.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <MotionLink
                  to="/parent-enquiry"
                  whileTap={{ scale: 0.95, backgroundColor: "rgba(255, 255, 255, 0.15)", borderColor: "rgba(255, 255, 255, 0.4)", color: "#ffffff" }}
                  className="group inline-flex items-center gap-2 rounded-2xl border border-transparent bg-white px-7 py-4 font-black text-slate-950 shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  Book Free Demo Class
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </MotionLink>

                <MotionLink
                  to="/parent-enquiry"
                  whileTap={{ scale: 0.95, backgroundColor: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.2)" }}
                  className="rounded-2xl border border-white/20 bg-white/5 px-7 py-4 font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Hire a Home Tutor
                </MotionLink>
              </div>

              {/* Quick Stats Grid */}
              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black text-blue-400">50+</div>
                  <div className="text-xs font-semibold text-slate-400">Verified Tutors</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black text-blue-400">25+</div>
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

            {/* Quick Consultation Feature Panel with Realistic Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5 w-full mt-10 lg:mt-0"
            >
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/60 p-4 shadow-2xl backdrop-blur-xl">
                {/* Tuition realistic picture */}
                <div className="relative h-60 w-full overflow-hidden rounded-[2rem] shadow-inner">
                  <img
                    src="/mumbai_tutor_hero.png"
                    alt="Saraswati Home Tuition in Mumbai"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 rounded-xl bg-blue-600/80 px-3.5 py-1.5 text-[10px] font-black tracking-wide text-white backdrop-blur">
                    Verified Home Tutors
                  </div>
                </div>

                <div className="mt-6 p-4">
                  <h3 className="text-xl font-black text-white">Mumbai Parent Consultation</h3>
                  <p className="mt-2 text-xs text-slate-300">
                    Get in touch with our curriculum coordinator to discuss syllabus tracking, tutor preferences, and timings.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-sm">
                      <Phone className="h-5 w-5 text-blue-400" />
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Call / WhatsApp</div>
                        <div className="text-sm font-black text-white">+91 9041157689</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-sm">
                      <Mail className="h-5 w-5 text-blue-400" />
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</div>
                        <div className="text-sm font-black text-white">services@saraswatitutorial.com</div>
                      </div>
                    </div>
                  </div>

                  <MotionLink
                    to="/parent-enquiry"
                    whileTap={{ scale: 0.95, backgroundColor: "rgba(255, 255, 255, 0.15)", borderColor: "rgba(255, 255, 255, 0.4)", color: "#ffffff" }}
                    className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-transparent bg-white text-sm font-black text-slate-950 transition hover:bg-slate-100"
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

      {/* SEO Intro Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2.5rem] border border-white/50 bg-white/30 backdrop-blur-xl p-8 shadow-xl shadow-slate-100/10 md:p-12">
          <div className="max-w-4xl">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Overview</h2>
            <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Home Tuition in Mumbai for Class 6 to 12
            </h3>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
              <p>
                Saraswati Tutorials provides trusted and result-oriented home tuition in Mumbai for students from Class 6 to 12. We offer experienced private tutors for CBSE, ICSE, IGCSE, IB and Maharashtra State Board students across major areas of Mumbai including Andheri, Bandra, Powai, Borivali, Thane, Navi Mumbai and more. Our personalized one-to-one teaching approach helps students improve conceptual understanding, confidence and academic performance.
              </p>
              <p>
                Whether your child needs help in Maths, Science, Physics, Chemistry, Biology, English or Commerce subjects, our expert tutors provide customized learning plans, regular assessments and dedicated doubt-solving support at home or online.
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
              Why Parents Prefer Saraswati Tutorials in Mumbai
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
            Subjects Available for Home Tuition in Mumbai
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
              Home Tuition Available Across Mumbai
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Our network of verified home tutors reaches all major commercial and residential pockets in Mumbai.
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
              Saraswati Tutorials has a widespread network of home tutors spanning across the entire Mumbai metropolitan region. Whether you live in South Mumbai, the Western Suburbs, the Eastern Suburbs, or neighboring areas like Thane and Navi Mumbai, we can match you with an experienced private tutor who can conduct offline classes at your residence. In addition to offline sessions, our tutors are equipped to offer highly engaging and interactive online live classes, providing flexibility for busy student schedules.
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
              Trusted by Parents Across Mumbai
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
                <p className="mt-4 text-sm leading-relaxed text-slate-300">"{t.text}"</p>
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
            Book a Free Demo Class Today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Get matched with experienced home tutors in Mumbai for your child’s academic needs.
          </p>
          <div className="mt-8">
            <MotionLink
              to="/parent-enquiry"
              whileTap={{ scale: 0.95, backgroundColor: "rgba(255, 255, 255, 0.15)", borderColor: "rgba(255, 255, 255, 0.4)", color: "#ffffff" }}
              className="inline-flex items-center gap-2 rounded-2xl border border-transparent bg-white px-8 py-4 font-black text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Enquire Now
              <ArrowRight className="h-5 w-5" />
            </MotionLink>
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
                  <span>+91 9041157689</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>services@saraswatitutorial.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Saraswati Tutorials. All rights reserved.
          </div>
        </div>
      </footer>

      <motion.a
        href="https://wa.me/919041157689"
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
          {/* White speech bubble background */}
          <path
            fill="white"
            d="M12.004 2C6.48 2 2 6.48 2 12c0 2.17.69 4.19 1.86 5.86L2 22l4.27-1.13C7.9 21.58 9.9 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
          />
          {/* Phone handset inside (transitions green color on hover to match background) */}
          <path
            className="fill-[#25D366] transition-colors duration-200 group-hover:fill-[#128C7E]"
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
          />
        </svg>
      </motion.a>

      <ChatBot />
    </div>
  );
}
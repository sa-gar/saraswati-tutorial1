import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, MapPin, Sparkles, Send, Loader2, ArrowLeft, CheckCircle2, ShieldCheck, Heart } from "lucide-react";
import { API_BASE } from "@/config";

export default function ServicesContactPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    parentName: "",
    studentName: "",
    phone: "",
    email: "",
    subjectNeeded: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeField, setActiveField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.parentName.trim() || !form.phone.trim()) {
      setError("Name and Phone Number are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to submit inquiry. Please check your network and try again.");
      }

      setSuccess(true);
      setForm({
        parentName: "",
        studentName: "",
        phone: "",
        email: "",
        subjectNeeded: "",
        message: "",
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const pageContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  const staggerList = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 font-sans antialiased overflow-hidden relative selection:bg-indigo-500 selection:text-white">
      <Helmet>
        <title>Connect with Service Division | Saraswati Tutorials</title>
        <meta
          name="description"
          content="Premium Home Tuition matching in Bangalore and nearby areas. Get in touch with our Service Division for customized educational matching."
        />
        {/* Dynamic Service / LocalBusiness SEO Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Saraswati Tutorial - Service Division",
            "image": "https://saraswatitutorial.com/logo.png",
            "url": "https://services.saraswatitutorial.com",
            "telephone": "+91 9041157689",
            "areaServed": [
              {
                "@type": "AdministrativeArea",
                "name": "Bangalore"
              },
              {
                "@type": "AdministrativeArea",
                "name": "Bangalore Rural"
              }
            ],
            "description": "Premium on-demand private home tutoring matching operating across Bangalore.",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Bangalore",
              "addressCountry": "India"
            }
          })}
        </script>
        {/* Google Fonts integration */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      {/* Styled Outfit / Plus Jakarta Font override inside container */}
      <style>{`
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        h1, h2, h3, h4 {
          font-family: 'Outfit', sans-serif;
        }
        .glass-panel {
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glow-input:focus {
          border-color: rgba(99, 102, 241, 0.6);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.15);
        }
      `}</style>

      {/* Glowing decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />

      <motion.div
        variants={pageContainer}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12 relative z-10"
      >
        {/* Navigation Header */}
        <motion.div
          variants={fadeInUp}
          className="mb-8 flex items-center justify-between"
        >
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition duration-300 backdrop-blur"
          >
            <ArrowLeft className="h-4 w-4 transition duration-300 group-hover:-translate-x-1" />
            Back to Home
          </Link>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">
            Saraswati Tutorials
          </span>
        </motion.div>

        {/* Hero Section Banner */}
        <motion.div
          variants={fadeInUp}
          className="mb-8 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0c122c] to-[#060919] border border-white/10 shadow-2xl relative"
        >
          {/* Animated interior glow rings */}
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 p-8 md:p-12 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-300">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Service Division
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-slate-400 text-base leading-8 md:text-lg">
              Have questions about home tuition or tutor availability? Let us know your requirements. Our expert service division matches you with qualified educators across Bangalore.
            </p>
          </div>
        </motion.div>

        {/* Form and info split content */}
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] items-start">
          {/* Service info column */}
          <motion.div variants={staggerList} className="space-y-6">
            <motion.div
              variants={fadeInUp}
              className="glass-panel rounded-[2rem] p-8 shadow-xl relative overflow-hidden"
            >
              <h3 className="text-2xl font-bold text-white mb-2">Direct Services Contacts</h3>
              <p className="text-sm text-slate-400 mb-6">
                Connect with our dedicated tutor allocation managers.
              </p>

              <div className="space-y-5">
                {/* Phone Card */}
                <motion.div
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.03)" }}
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.01] p-4 transition duration-300"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/10">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Service Phone</p>
                    <p className="text-base font-extrabold text-white mt-0.5">+91 9041157689</p>
                  </div>
                </motion.div>

                {/* Email Card */}
                <motion.div
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.03)" }}
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.01] p-4 transition duration-300"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/10">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Service Support</p>
                    <p className="text-base font-extrabold text-white mt-0.5">services@saraswatitutorial.com</p>
                  </div>
                </motion.div>

                {/* MapPin Card */}
                <motion.div
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.03)" }}
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.01] p-4 transition duration-300"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/10">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Coverage Area</p>
                    <p className="text-base font-extrabold text-white mt-0.5">Bangalore + nearby areas</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Quality Commitment Card */}
            <motion.div
              variants={fadeInUp}
              className="glass-panel rounded-[2rem] p-6 shadow-sm border border-white/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <h4 className="font-bold text-white text-base">In-Person Matching Guarantee</h4>
              </div>
              <p className="text-xs leading-6 text-slate-400">
                To maintain local NAP verification standard, we do not require offline center registrations. Our tutors match based on coordinates for East, South, North, Central, and West Bangalore.
              </p>
            </motion.div>
          </motion.div>

          {/* Inquiry form column */}
          <motion.div
            variants={fadeInUp}
            className="glass-panel rounded-[2.5rem] p-6 shadow-2xl relative md:p-8 overflow-hidden"
          >
            <h3 className="text-2xl font-bold text-white mb-2">Send an Inquiry</h3>
            <p className="text-sm text-slate-400 mb-6">
              Let us know your learning requirements and get matched quickly.
            </p>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-3xl bg-indigo-500/10 border border-indigo-500/20 p-8 text-center"
                >
                  <CheckCircle2 className="mx-auto h-16 w-16 text-indigo-400 mb-4 animate-pulse" />
                  <h4 className="text-2xl font-bold text-white">Enquiry Received!</h4>
                  <p className="mt-2 text-sm text-slate-300 leading-6 max-w-sm mx-auto">
                    Thank you for contacting Saraswati Tutorials' Service Division. Our educational coordinator will reach out to you within 2-4 hours.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3.5 transition duration-300 shadow-lg shadow-indigo-600/30"
                  >
                    Send another inquiry
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm font-semibold text-red-400"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* Form fields Grid */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Parent Name */}
                    <div className="relative">
                      <label className="mb-2 block text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Your Name <span className="text-indigo-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="parentName"
                        required
                        value={form.parentName}
                        onChange={handleChange}
                        onFocus={() => setActiveField("parentName")}
                        onBlur={() => setActiveField(null)}
                        placeholder="John Doe"
                        className={`h-13 w-full rounded-2xl border bg-white/5 hover:bg-white/[0.08] px-4 text-sm text-white outline-none transition duration-300 glow-input ${
                          activeField === "parentName" ? "border-indigo-500/50" : "border-white/10"
                        }`}
                      />
                    </div>

                    {/* Student Name */}
                    <div className="relative">
                      <label className="mb-2 block text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Student Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="studentName"
                        value={form.studentName}
                        onChange={handleChange}
                        onFocus={() => setActiveField("studentName")}
                        onBlur={() => setActiveField(null)}
                        placeholder="Jane Doe"
                        className={`h-13 w-full rounded-2xl border bg-white/5 hover:bg-white/[0.08] px-4 text-sm text-white outline-none transition duration-300 glow-input ${
                          activeField === "studentName" ? "border-indigo-500/50" : "border-white/10"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Phone */}
                    <div className="relative">
                      <label className="mb-2 block text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Phone Number <span className="text-indigo-400">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={form.phone}
                        onChange={handleChange}
                        onFocus={() => setActiveField("phone")}
                        onBlur={() => setActiveField(null)}
                        placeholder="10-digit mobile number"
                        className={`h-13 w-full rounded-2xl border bg-white/5 hover:bg-white/[0.08] px-4 text-sm text-white outline-none transition duration-300 glow-input ${
                          activeField === "phone" ? "border-indigo-500/50" : "border-white/10"
                        }`}
                      />
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <label className="mb-2 block text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        onFocus={() => setActiveField("email")}
                        onBlur={() => setActiveField(null)}
                        placeholder="example@mail.com"
                        className={`h-13 w-full rounded-2xl border bg-white/5 hover:bg-white/[0.08] px-4 text-sm text-white outline-none transition duration-300 glow-input ${
                          activeField === "email" ? "border-indigo-500/50" : "border-white/10"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Subject Needed */}
                  <div className="relative">
                    <label className="mb-2 block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Subject / Class Needed
                    </label>
                    <input
                      type="text"
                      name="subjectNeeded"
                      value={form.subjectNeeded}
                      onChange={handleChange}
                      onFocus={() => setActiveField("subjectNeeded")}
                      onBlur={() => setActiveField(null)}
                      placeholder="e.g. Maths and Physics, CBSE Class 10"
                      className={`h-13 w-full rounded-2xl border bg-white/5 hover:bg-white/[0.08] px-4 text-sm text-white outline-none transition duration-300 glow-input ${
                        activeField === "subjectNeeded" ? "border-indigo-500/50" : "border-white/10"
                      }`}
                    />
                  </div>

                  {/* Message */}
                  <div className="relative">
                    <label className="mb-2 block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Message / Special Requests
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      onFocus={() => setActiveField("message")}
                      onBlur={() => setActiveField(null)}
                      placeholder="Share preferred class timings, locality details, or specific tutor preferences..."
                      className={`min-h-[120px] w-full rounded-2xl border bg-white/5 hover:bg-white/[0.08] px-4 py-3.5 text-sm text-white outline-none transition duration-300 glow-input ${
                        activeField === "message" ? "border-indigo-500/50" : "border-white/10"
                      }`}
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-4 shadow-xl shadow-indigo-600/20 transition duration-300 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Allocating manager...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Enquiry
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

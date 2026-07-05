import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Sparkles, 
  Star, 
  Award, 
  Clock, 
  BookOpen, 
  ChevronDown, 
  X, 
  ShieldCheck, 
  Info,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  GraduationCap,
  Calendar,
  Eye,
  Settings,
  Grid,
  FileText,
  ArrowLeft,
  ArrowRight,
  Laptop,
  Home,
  Video,
  Users
} from "lucide-react";
import { PLANS, calculatePrice, calculateEliteHourlyPrice, calculateEliteMonthlyPrice } from "../data/plansConfig";
import { API_BASE } from "../config";
import { trackEvent } from "../utils/analytics";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  }
};

const wardVariants = {
  hidden: { opacity: 0, height: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    height: "auto",
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  },
  exit: {
    opacity: 0,
    height: 0,
    scale: 0.95,
    transition: { duration: 0.25, ease: "easeInOut" }
  }
};



const initialWard = {
  studentName: "",
  schoolName: "",
  classGrade: "",
  curriculum: "",
  subjectsNeeded: [],
  specialNeeds: "",
};

const initialForm = {
  parentName: "",
  phone: "",
  email: "",
  address: "",
  preferredGender: "",
  preferredMode: "",
  preferredDays: [],
  preferredTime: "",
  startTime: "",
  endTime: "",
  classDuration: "",
  planType: "",
  daysPerWeek: null,
  hoursPerDay: null,
  monthlyFees: null,
  discount: null,
  finalPrice: null,
  costPerClass: null,
  wards: [{ ...initialWard }],
  pricingConsent: false,
};

const dayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const classOptions = [
  "1 to 5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "PUC",
  "Degree Courses",
];

const getCurriculumOptions = (classGrade) => {
  if (!classGrade) return [];
  const cg = String(classGrade).trim();
  if (["1 to 5", "6", "7", "8", "9", "10"].includes(cg)) {
    return ["CBSE", "ICSE", "IGCSE", "IB", "NIOS", "Others"];
  }
  if (["11", "12"].includes(cg)) {
    return ["CBSE", "ISC", "IB", "IGCSE", "State Board", "Other"];
  }
  if (cg === "PUC") {
    return ["State Board", "CBSE", "ISC", "NIOS", "Other"];
  }
  if (cg === "Degree Courses") {
    return [
      "B.Com",
      "BBA",
      "BCA / MCA",
      "B.Sc",
      "B.A",
      "B.E / B.Tech",
      "Diploma",
      "Other"
    ];
  }
  return ["CBSE", "ICSE", "IGCSE", "IB", "NIOS", "ISC", "State Board", "Other"];
};

const subjectOptions = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Kannada",
  "Sanskrit",
  "Social Studies",
  "History",
  "Geography",
  "Economics",
  "Political Science",
  "Accountancy",
  "Business Studies",
  "Computer Science",
  "Informatics Practices",
  "Programming",
  "Statistics",
  "French",
  "German",
  "Spoken English",
];

const bangaloreSchoolOptions = [
  "The International School Bangalore",
  "Inventure Academy",
  "Mallya Aditi International School",
  "Bangalore International School",
  "Greenwood High International School",
  "Vidyashilp Academy",
  "Vidya Niketan School",
  "The Valley School",
  "Ebenezer International School",
  "BGS International School",
  "Sarala Birla Academy",
  "Legacy School",
  "Indus International School Bangalore",
  "National Public School, Indiranagar",
  "National Public School, Koramangala",
  "National Public School, HSR Layout",
  "Delhi Public School Bangalore South",
  "Delhi Public School Bangalore East",
  "New Horizon Gurukul",
  "Sophia High School",
  "Bishop Cotton Girls' School",
  "Bishop Cotton Boys' School",
  "The Frank Anthony Public School",
  "Clarence High School",
  "Bethany High",
  "Ryan International School, Kundalahalli",
  "Canadian International School",
  "TRIO World Academy",
  "Jain International Residential School",
  "Sri Kumaran Children's Home",
];

const mumbaiSchoolOptions = [
  "Dhirubhai Ambani International School",
  "The Cathedral & John Connon School",
  "Aditya Birla World Academy",
  "Jamnabai Narsee School",
  "Bombay Scottish School",
  "Campillion School",
  "Arya Vidya Mandir",
  "Podar International School",
  "Smt. Sulochanadevi Singhania School",
  "Gems Genesis International School",
  "Oberoi International School",
  "Hiranandani Foundation School",
  "Singhania School Thane",
  "Ryan International School, Malad",
  "Vibgyor High School, Goregaon",
  "Billabong High International School",
  "Lilavatibai Podar High School",
];

const preferredModeOptions = [
  "Online / One-to-One Tuition",
  "Home Tuition / In-Person",
];

const calculateDuration = (start, end) => {
  if (!start || !end) return "";
  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = end.split(":").map(Number);
  const diffMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  if (diffMinutes <= 0) return "";
  const hours = diffMinutes / 60;
  if (hours === 1) return "1 Hour";
  return `${hours.toFixed(1).replace(".0", "")} Hours`;
};

const formatTime12Hr = (timeString) => {
  if (!timeString) return "";
  const [hourStr, minuteStr] = timeString.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${hour}:${minute} ${ampm}`;
};

const isClass1to8 = (classGrade) => {
  return ["1 to 5", "6", "7", "8"].includes(String(classGrade || "").trim());
};

const getFilteredPricingOptions = (plan, wards = []) => {
  if (!plan) return [];
  const hasClass1to8 = Array.isArray(wards) && wards.some(w => isClass1to8(w.classGrade));
  if (['foundation', 'advance'].includes(plan.id) && hasClass1to8) {
    return plan.pricingOptions.filter(opt => opt.hours !== 1);
  }
  return plan.pricingOptions;
};

const getDynamicCalculation = (planId, option, classGrade = "6", curriculum = "CBSE") => {
  if (!option) return null;

  const cg = classGrade || "6";
  const curr = curriculum || "CBSE";

  if (planId === 'foundation') {
    const finalPrice = calculatePrice('foundation', cg, curr, option.days, option.hours);
    const originalPrice = calculatePrice('board', cg, curr, option.days, option.hours); // base board price
    const discount = originalPrice - finalPrice;
    return {
      originalPrice,
      finalPrice,
      discount,
      discountPercent: 18 // 18% OFF
    };
  }

  if (planId === 'advance') {
    const finalPrice = calculatePrice('advance', cg, curr, option.days, option.hours);
    const basePrice = calculatePrice('board', cg, curr, option.days, option.hours);
    const extraCost = finalPrice - basePrice;
    return {
      basePrice,
      extraCost,
      finalPrice
    };
  }

  if (planId === 'elite') {
    const finalPrice = calculatePrice('elite', cg, curr, option.days, option.hours);
    const totalClasses = option.days * 4;
    const costPerClass = Math.round(finalPrice / totalClasses);
    return {
      finalPrice,
      totalClasses,
      costPerClass
    };
  }

  return null;
};

// ==========================================
// Premium SVG Icon Components for Core Benefits
// ==========================================
const VerificationSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="shrink-0 drop-shadow-[0_4px_10px_rgba(30,58,138,0.3)]">
    <defs>
      <linearGradient id="shieldGrad" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#0B132B" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="20" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="50%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="borderGrad" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    <path d="M40 10 C48 10 65 14 65 26 C65 50 48 68 40 72 C32 68 15 50 15 26 C15 14 32 10 40 10 Z" fill="url(#shieldGrad)" stroke="url(#borderGrad)" strokeWidth="2.5" />
    <path d="M40 45 C47.732 45 54 51.268 54 59 H26 C26 51.268 32.268 45 40 45 Z" fill="url(#goldGrad)" opacity="0.8" />
    <circle cx="40" cy="32" r="9" fill="url(#goldGrad)" />
    <circle cx="58" cy="56" r="10" fill="#0B132B" stroke="url(#goldGrad)" strokeWidth="2" />
    <circle cx="58" cy="56" r="8" fill="url(#goldGrad)" />
    <path d="M54 56.5 L56.5 59 L62 53.5" stroke="#0B132B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const LocationSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="shrink-0 drop-shadow-[0_4px_10px_rgba(245,158,11,0.25)]">
    <defs>
      <linearGradient id="pinGrad" x1="40" y1="12" x2="40" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFE082" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="mapGrad" x1="15" y1="45" x2="65" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <path d="M15 55 L40 45 L65 55 L40 65 Z" fill="url(#mapGrad)" stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.6" />
    <path d="M27.5 50 L52.5 60" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.4" />
    <path d="M27.5 60 L52.5 50" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.4" />
    <ellipse cx="40" cy="55" rx="16" ry="6" stroke="#3B82F6" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.8" />
    <ellipse cx="40" cy="55" rx="8" ry="3" stroke="#FFE082" strokeWidth="1" strokeOpacity="0.8" />
    <g transform="translate(0, -4)">
      <path d="M40 52 C38 52 26 40 26 28 C26 20.268 32.268 14 40 14 C47.732 14 54 20.268 54 28 C54 40 42 52 40 52 Z" fill="url(#pinGrad)" />
      <circle cx="40" cy="28" r="6" fill="#0B132B" />
    </g>
  </svg>
);

const DoubtSupportSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="shrink-0 drop-shadow-[0_4px_10px_rgba(59,130,246,0.3)]">
    <defs>
      <linearGradient id="clockGrad" x1="15" y1="15" x2="65" y2="65" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#0B132B" />
      </linearGradient>
      <linearGradient id="goldArrow" x1="20" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="26" fill="url(#clockGrad)" stroke="#3B82F6" strokeWidth="2.5" />
    <path d="M40 40 L40 24" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M40 40 L52 40" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="40" cy="40" r="3" fill="#FFFFFF" />
    <path d="M68 40 C68 55.464 55.464 68 40 68 C24.536 68 12 55.464 12 40 C12 24.536 24.536 12 40 12 C48.5 12 56 16 61 22.5" stroke="url(#goldArrow)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" />
    <path d="M57 23 L63 23 L63 17" stroke="url(#goldArrow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="42" y="52" width="28" height="15" rx="7.5" fill="#0B132B" stroke="#3B82F6" strokeWidth="1.5" />
    <text x="56" y="63" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">24/7</text>
  </svg>
);

const ReplacementSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="shrink-0 drop-shadow-[0_4px_10px_rgba(30,58,138,0.3)]">
    <defs>
      <linearGradient id="userBlue" x1="15" y1="40" x2="45" y2="70" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1E3B8B" />
      </linearGradient>
      <linearGradient id="userGold" x1="45" y1="45" x2="65" y2="65" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="arrowGrad" x1="20" y1="20" x2="60" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <path d="M30 46 C37.732 46 44 52.268 44 60 H16 C16 52.268 22.268 46 30 46 Z" fill="url(#userBlue)" stroke="#1E4ED8" strokeWidth="1.5" />
    <circle cx="30" cy="33" r="8" fill="url(#userBlue)" stroke="#1E4ED8" strokeWidth="1.5" />
    <path d="M54 50 C60.627 50 66 55.373 66 62 H42 C42 55.373 47.373 50 54 50 Z" fill="url(#userGold)" stroke="#B45309" strokeWidth="1" />
    <circle cx="54" cy="39" r="6" fill="url(#userGold)" stroke="#B45309" strokeWidth="1" />
    <path d="M22 26 C30 18 50 18 58 26" stroke="url(#arrowGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M58 20 L58 26 L52 26" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M58 60 C50 68 30 68 22 60" stroke="url(#arrowGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M22 66 L22 60 L28 60" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const GuidanceSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="shrink-0 drop-shadow-[0_4px_10px_rgba(59,130,246,0.3)]">
    <defs>
      <linearGradient id="compGrad" x1="15" y1="15" x2="65" y2="65" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#0B132B" />
      </linearGradient>
      <linearGradient id="needleGold" x1="40" y1="25" x2="40" y2="55" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="26" fill="url(#compGrad)" stroke="#3B82F6" strokeWidth="2.5" />
    <path d="M40 18 L46 40 L40 45 L34 40 Z" fill="url(#needleGold)" />
    <path d="M40 62 L34 40 L40 45 L46 40 Z" fill="#60A5FA" opacity="0.8" />
    <circle cx="40" cy="40" r="3" fill="#FFFFFF" />
    <line x1="40" y1="18" x2="40" y2="22" stroke="#FFFFFF" strokeWidth="1.5" />
    <line x1="40" y1="58" x2="40" y2="62" stroke="#FFFFFF" strokeWidth="1.5" />
    <line x1="18" y1="40" x2="22" y2="40" stroke="#FFFFFF" strokeWidth="1.5" />
    <line x1="58" y1="40" x2="62" y2="40" stroke="#FFFFFF" strokeWidth="1.5" />
  </svg>
);

const HomeworkSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="shrink-0 drop-shadow-[0_4px_10px_rgba(245,158,11,0.25)]">
    <defs>
      <linearGradient id="bookGrad" x1="20" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#0B132B" />
      </linearGradient>
      <linearGradient id="pencilGold" x1="45" y1="20" x2="65" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFE082" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <path d="M22 25 C22 22 25 20 38 20 C51 20 58 24 58 24 L58 58 C58 58 51 54 38 54 C25 54 22 56 22 56 Z" fill="url(#bookGrad)" stroke="#3B82F6" strokeWidth="2" />
    <path d="M38 20 C38 20 45 23 58 23" stroke="#3B82F6" strokeWidth="1.5" />
    <path d="M22 56 C22 56 29 53 38 53 L38 20" stroke="#3B82F6" strokeWidth="2" />
    <line x1="28" y1="30" x2="34" y2="30" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.6" />
    <line x1="28" y1="36" x2="34" y2="36" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.6" />
    <line x1="28" y1="42" x2="34" y2="42" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.6" />
    <g transform="translate(6, 2) rotate(15 50 30)">
      <path d="M48 20 L54 20 L54 45 L48 45 Z" fill="url(#pencilGold)" />
      <path d="M48 20 L51 14 L54 20 Z" fill="#FFE57F" />
      <path d="M50.5 14 L51.5 14 L51 17 Z" fill="#0B132B" />
      <rect x="48" y="43" width="6" height="4" rx="1" fill="#EF4444" />
    </g>
  </svg>
);

const PracticeSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="shrink-0 drop-shadow-[0_4px_10px_rgba(59,130,246,0.3)]">
    <defs>
      <linearGradient id="targetGrad" x1="15" y1="15" x2="65" y2="65" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#0B132B" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="26" fill="url(#targetGrad)" stroke="#3B82F6" strokeWidth="2.5" />
    <circle cx="40" cy="40" r="18" stroke="#FFE082" strokeWidth="2" strokeDasharray="4 2" />
    <circle cx="40" cy="40" r="10" stroke="#F59E0B" strokeWidth="2" />
    <circle cx="40" cy="40" r="4" fill="#F59E0B" />
    <path d="M58 22 L42 38" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M42 38 L48 38 L42 44 Z" fill="#FFFFFF" />
    <path d="M55 21 L59 17 M57 23 L61 19" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ExperienceSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="shrink-0 drop-shadow-[0_4px_10px_rgba(245,158,11,0.25)]">
    <defs>
      <linearGradient id="medalGold" x1="20" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFE082" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <path d="M32 40 L24 65 L36 60 L44 40 Z" fill="#3B82F6" opacity="0.8" />
    <path d="M48 40 L56 65 L44 60 L36 40 Z" fill="#1D4ED8" />
    <circle cx="40" cy="34" r="20" fill="url(#medalGold)" stroke="#FFFFFF" strokeWidth="2" />
    <circle cx="40" cy="34" r="16" fill="#0B132B" />
    <path d="M40 23 L43.5 30 L51 31 L45.5 36 L47 43.5 L40 40 L33 43.5 L34.5 36 L29 31 L36.5 30 Z" fill="url(#medalGold)" />
  </svg>
);

const getBenefitIcon = (title) => {
  switch (title) {
    case "Tutor Verification":
    case "Background Verified Tutors":
    case "Accuracy & Result Oriented":
      return <VerificationSVG />;
    case "Tutor Location":
      return <LocationSVG />;
    case "24 Hours Doubt Support":
    case "24-Hour Doubt Support":
      return <DoubtSupportSVG />;
    case "Tutor Replacement Support":
      return <ReplacementSVG />;
    case "Consistent Guidance":
      return <GuidanceSVG />;
    case "Homework Support":
      return <HomeworkSVG />;
    case "Daily Practice":
      return <PracticeSVG />;
    case "Tutor Experience":
    case "Entry Level Tutors":
      return <ExperienceSVG />;
    default:
      return <VerificationSVG />;
  }
};

export default function ParentEnquiryForm() {
  const navigate = useNavigate();

  const host = window.location.hostname;
  let selectedCity = localStorage.getItem("userLocation") || "Bangalore";
  if (host.startsWith("mumbai.")) {
    selectedCity = "Mumbai";
  }

  const isMumbai = selectedCity === "Mumbai";
  const schoolOptions = isMumbai ? mumbaiSchoolOptions : bangaloreSchoolOptions;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [openNotes, setOpenNotes] = useState({});
  const [geoInfo, setGeoInfo] = useState({});
  const [viewingPlanId, setViewingPlanId] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  useEffect(() => {
    setOpenFaqIndex(null);
    setShowAllFeatures(false);
  }, [viewingPlanId]);

  const handleOpenPlanModal = (plan) => {
    setViewingPlanId(plan.id);
    const allowedOptions = getFilteredPricingOptions(plan, form.wards);
    if (form.planType === plan.id) {
      const matched = allowedOptions.find(
        (opt) => opt.days === form.daysPerWeek && opt.hours === form.hoursPerDay
      );
      setSelectedOption(matched || allowedOptions[0]);
    } else {
      setSelectedOption(allowedOptions[0]);
    }
  };

  const handleChoosePlan = (plan) => {
    if (!selectedOption) return;
    const hasClass1to8 = form.wards.some(w => isClass1to8(w.classGrade));
    if (['foundation', 'advance'].includes(plan.id) && hasClass1to8 && selectedOption.hours === 1) {
      setMessage("For classes 1 to 8, 1 Hour session is not allowed on this plan. Please select 1.5 or 2 Hours.");
      return;
    }
    const firstWardClass = form.wards[0]?.classGrade || "6";
    const firstWardBoard = form.wards[0]?.curriculum || "CBSE";
    const calc = getDynamicCalculation(plan.id, selectedOption, firstWardClass, firstWardBoard);
    setForm((prev) => ({
      ...prev,
      planType: plan.id,
      daysPerWeek: selectedOption.days,
      hoursPerDay: selectedOption.hours,
      monthlyFees: calc ? calc.finalPrice : selectedOption.price,
      discount: calc ? (calc.discount || null) : null,
      finalPrice: calc ? calc.finalPrice : selectedOption.price,
      costPerClass: calc ? (calc.costPerClass || null) : null,
      preferredDays: [],
    }));
    setErrors((prev) => ({
      ...prev,
      planType: "",
      preferredDays: "",
    }));
    setViewingPlanId(null);
    setSelectedOption(null);
    trackEvent("choose_plan", plan.id);
  };

  const handleChangePlan = () => {
    setForm((prev) => ({
      ...prev,
      planType: "",
      daysPerWeek: null,
      hoursPerDay: null,
      monthlyFees: null,
      discount: null,
      finalPrice: null,
      costPerClass: null,
      preferredDays: [],
      pricingConsent: false,
    }));
    setErrors((prev) => ({
      ...prev,
      preferredDays: "",
      pricingConsent: "",
    }));
  };

  useEffect(() => {
    const prefilledPlan = localStorage.getItem("prefilledPlan");
    const prefilledClass = localStorage.getItem("prefilledClass");
    const prefilledBoard = localStorage.getItem("prefilledBoard");
    
    if (prefilledPlan || prefilledClass || prefilledBoard) {
      setForm(prev => {
        const updatedWards = [...prev.wards];
        if (updatedWards[0]) {
          // Clean up "Grade " prefix if it comes from the homepage selector
          let cgValue = prefilledClass || "";
          if (cgValue.startsWith("Grade ")) {
            cgValue = cgValue.replace("Grade ", "");
            if (cgValue === "1–5" || cgValue === "1-5") {
              cgValue = "1 to 5";
            }
          }
          
          updatedWards[0] = {
            ...updatedWards[0],
            classGrade: cgValue || updatedWards[0].classGrade,
            curriculum: prefilledBoard || updatedWards[0].curriculum,
          };
        }
        
        let newForm = {
          ...prev,
          wards: updatedWards,
          planType: prefilledPlan || prev.planType,
        };

        if (prefilledPlan) {
          const planData = PLANS.find(p => p.id === prefilledPlan);
          if (planData) {
            const allowedOptions = getFilteredPricingOptions(planData, updatedWards);
            const selectedOpt = allowedOptions[0];
            if (selectedOpt) {
              const calc = getDynamicCalculation(
                prefilledPlan, 
                selectedOpt, 
                updatedWards[0]?.classGrade, 
                updatedWards[0]?.curriculum
              );
              newForm = {
                ...newForm,
                daysPerWeek: selectedOpt.days,
                hoursPerDay: selectedOpt.hours,
                monthlyFees: calc ? calc.finalPrice : selectedOpt.price,
                discount: calc ? (calc.discount || null) : null,
                finalPrice: calc ? calc.finalPrice : selectedOpt.price,
                costPerClass: calc ? (calc.costPerClass || null) : null,
              };
            }
          }
        }
        return newForm;
      });
      
      localStorage.removeItem("prefilledPlan");
      localStorage.removeItem("prefilledClass");
      localStorage.removeItem("prefilledBoard");
    }
  }, []);

  useEffect(() => {
    // Fetch Location details silently in the background
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        setGeoInfo({
          city: data.city,
          region: data.region,
          postal: data.postal,
          country: data.country_name,
          ip: data.ip,
          org: data.org
        });
      })
      .catch((err) => console.log("Geo lookup error:", err));

    // Form start / abandonment tracking
    sessionStorage.setItem("enquiry_form_started", "true");
    sessionStorage.removeItem("enquiry_form_submitted");
    trackEvent("form_started");

    return () => {
      const started = sessionStorage.getItem("enquiry_form_started") === "true";
      const submitted = sessionStorage.getItem("enquiry_form_submitted") === "true";
      if (started && !submitted) {
        trackEvent("form_abandoned");
      }
      sessionStorage.removeItem("enquiry_form_started");
    };
  }, []);

  useEffect(() => {
    if (form.startTime && form.endTime) {
      const duration = calculateDuration(form.startTime, form.endTime);
      setForm((prev) => ({
        ...prev,
        classDuration: duration,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        classDuration: "",
      }));
    }
  }, [form.startTime, form.endTime]);

  const totalSteps = 4;

  const requiredLabel = (label) => (
    <>
      {label} <span className="text-red-500">*</span>
    </>
  );

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(String(email || "").trim());
  };

  const isValidPhone = (phone) => {
    const regex = /^[0-9+\-\s]{8,15}$/;
    return regex.test(String(phone || "").trim());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleDayToggle = (day) => {
    setForm((prev) => {
      const active = prev.preferredDays.includes(day);
      let updated;
      if (active) {
        updated = prev.preferredDays.filter((d) => d !== day);
      } else {
        if (prev.planType && prev.preferredDays.length >= prev.daysPerWeek) {
          updated = [...prev.preferredDays.slice(1), day];
        } else {
          updated = [...prev.preferredDays, day];
        }
      }
      return {
        ...prev,
        preferredDays: updated,
      };
    });
    setErrors((prev) => ({
      ...prev,
      preferredDays: "",
    }));
  };

  const handleWardChange = (index, e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updatedWards = [...prev.wards];

      if (name === "classGrade") {
        updatedWards[index] = {
          ...updatedWards[index],
          classGrade: value,
          curriculum: "", // Reset curriculum when class changes
        };
      } else {
        updatedWards[index] = {
          ...updatedWards[index],
          [name]: value,
        };
      }

      return {
        ...prev,
        wards: updatedWards,
      };
    });

    setErrors((prev) => ({
      ...prev,
      [`wards.${index}.${name}`]: "",
      ...(name === "classGrade" ? { [`wards.${index}.curriculum`]: "" } : {}),
    }));
  };

  const addWard = () => {
    setForm((prev) => ({
      ...prev,
      wards: [...prev.wards, { ...initialWard }],
    }));
  };

  const removeWard = (index) => {
    if (form.wards.length === 1) return;

    setForm((prev) => ({
      ...prev,
      wards: prev.wards.filter((_, i) => i !== index),
    }));

    setOpenNotes((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const toggleNotes = (index) => {
    setOpenNotes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const validateStep = (currentStep = step) => {
    const newErrors = {};

    // Step 1: Parent details validation
    if (currentStep === 1 || currentStep === 4) {
      if (!form.parentName.trim()) {
        newErrors.parentName = "Parent / Guardian Name is required";
      }

      if (!form.phone.trim()) {
        newErrors.phone = "Phone Number is required";
      } else if (!isValidPhone(form.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }

      if (!form.email.trim()) {
        newErrors.email = "Parent Email Address is required";
      } else if (!isValidEmail(form.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!form.address.trim()) {
        newErrors.address = "Address is required";
      }
    }

    // Step 2: Student details validation
    if (currentStep === 2 || currentStep === 4) {
      form.wards.forEach((ward, index) => {
        if (!ward.studentName.trim()) {
          newErrors[`wards.${index}.studentName`] = "Student Name is required";
        }

        if (!ward.classGrade.trim()) {
          newErrors[`wards.${index}.classGrade`] = "Class is required";
        }

        if (ward.classGrade.trim() && !ward.curriculum.trim()) {
          newErrors[`wards.${index}.curriculum`] = "Curriculum is required";
        }

        if (!Array.isArray(ward.subjectsNeeded) || ward.subjectsNeeded.length === 0) {
          newErrors[`wards.${index}.subjectsNeeded`] =
            "Subjects Required is required";
        }

        if (!ward.schoolName.trim()) {
          newErrors[`wards.${index}.schoolName`] = "School Name is required";
        }
      });
    }

    // Step 3: Tutor preferences validation
    if (currentStep === 3 || currentStep === 4) {
      if (!form.preferredMode.trim()) {
        newErrors.preferredMode = "Preferred Mode is required";
      }

      if (!form.preferredGender.trim()) {
        newErrors.preferredGender = "Preferred Gender is required";
      }

      if (!form.planType) {
        newErrors.planType = "Preferred Plan selection is required";
      } else {
        const hasClass1to8 = form.wards.some(w => isClass1to8(w.classGrade));
        if (['foundation', 'advance'].includes(form.planType) && hasClass1to8 && form.hoursPerDay === 1) {
          newErrors.planType = "For classes 1 to 8, 1 Hour session is not allowed on this plan. Please select 1.5 or 2 Hours.";
        }
        if (form.preferredDays.length !== form.daysPerWeek) {
          newErrors.preferredDays = `Please select exactly ${form.daysPerWeek} preferred days.`;
        }
      }
    }

    if (currentStep === 4) {
      if (!form.pricingConsent) {
        newErrors.pricingConsent = "Acknowledgment of the pricing terms is required to submit.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveDraft = async (nextStepNumber, currentForm = form) => {
    const emailOrPhone = currentForm.email || currentForm.phone;
    if (!emailOrPhone) return;

    try {
      await fetch(`${API_BASE}/parent-enquiries/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailOrPhone,
          stepReached: nextStepNumber,
          formData: currentForm,
          geoInfo,
          ipAddress: geoInfo.ip || "",
          visitor_id: localStorage.getItem("visitor_id") || "",
          session_id: sessionStorage.getItem("session_id") || "",
          utm_source: sessionStorage.getItem("utm_source") || "Direct",
          utm_medium: sessionStorage.getItem("utm_medium") || "none",
          utm_campaign: sessionStorage.getItem("utm_campaign") || "none",
          utm_content: sessionStorage.getItem("utm_content") || "none",
          utm_term: sessionStorage.getItem("utm_term") || "none"
        }),
      });
    } catch (err) {
      console.error("Draft save failed:", err);
    }
  };

  const nextStep = () => {
    if (!validateStep()) {
      setMessage("Please fill all required fields before continuing.");
      return;
    }

    setMessage("");
    const nextStepVal = step + 1;
    saveDraft(nextStepVal, form);
    setStep(nextStepVal);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setMessage("");
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = () => {
    const formattedStart = form.startTime ? formatTime12Hr(form.startTime) : "";
    const formattedEnd = form.endTime ? formatTime12Hr(form.endTime) : "";
    const timeRange = formattedStart && formattedEnd ? `${formattedStart} - ${formattedEnd}` : "";

    const prefTime = form.planType
      ? `${form.daysPerWeek} Days • ${form.hoursPerDay} Hr (${form.planType.toUpperCase()})`
      : timeRange;

    const classDur = form.planType
      ? `${form.hoursPerDay} Hr`
      : form.classDuration;

    const prefDays = form.preferredDays;

    const citySuffixes = {
      Bangalore: "Bangalore, Karnataka",
      Mumbai: "Mumbai, Maharashtra",
    };
    const suffix = citySuffixes[selectedCity] || selectedCity;
    const finalAddress = form.address.trim() ? `${form.address.trim()}, ${suffix}` : suffix;

    return {
      ...form,
      preferredTime: prefTime,
      classDuration: classDur,
      preferredDays: prefDays,
      address: finalAddress,
      wards: form.wards.map((ward) => ({
        studentName: ward.studentName,
        schoolName: ward.schoolName,
        classGrade: ward.classGrade,
        curriculum: ward.curriculum,
        subjectsNeeded: ward.subjectsNeeded,
        specialNeeds: ward.specialNeeds,
      })),
      geoInfo,
      ipAddress: geoInfo.ip || "",
      visitor_id: localStorage.getItem("visitor_id") || "",
      session_id: sessionStorage.getItem("session_id") || "",
      utm_source: sessionStorage.getItem("utm_source") || "Direct",
      utm_medium: sessionStorage.getItem("utm_medium") || "none",
      utm_campaign: sessionStorage.getItem("utm_campaign") || "none",
      utm_content: sessionStorage.getItem("utm_content") || "none",
      utm_term: sessionStorage.getItem("utm_term") || "none"
    };
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    if (step !== totalSteps) {
      nextStep();
      return;
    }

    if (!validateStep(4)) {
      setMessage("Please fill all required fields before submitting.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const payload = buildPayload();

      const res = await fetch(`${API_BASE}/parent-enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Submission failed");
      }

      sessionStorage.setItem("enquiry_form_submitted", "true");
      trackEvent("form_submitted", form.planType, true);
      setForm(initialForm);
      setErrors({});
      navigate("/thank-you");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),radial-gradient(circle_at_top_right,#fce7f3,transparent_30%),linear-gradient(135deg,#f8fafc,#eef2ff)] px-4 py-8 md:px-6 md:py-12">
      <style>{`
        .animate-slideFade {
          animation: slideFade 0.28s ease both;
        }

        @keyframes slideFade {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        @keyframes shineEffect {
          0% {
            transform: translateX(-150%) skewX(-15deg);
          }
          100% {
            transform: translateX(150%) skewX(-15deg);
          }
        }
        .shine-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.22),
            transparent
          );
          transform: translateX(-150%) skewX(-15deg);
        }
        .premium-shine-card:hover .shine-overlay {
          animation: shineEffect 1.5s ease-in-out forwards;
        }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50 border border-slate-200/60 shadow-xl shadow-slate-100/70">
          <div className="relative p-6 text-slate-800 md:p-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid gap-8 md:grid-cols-[1.4fr_0.6fr] md:items-center">
              <div>
                <div className="mb-4 inline-flex rounded-full bg-blue-50 border border-blue-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-800 shadow-sm">
                  Premium Parent Enquiry
                </div>

                <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl leading-tight">
                  Find the <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">perfect tutor</span> for your child
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 md:text-lg font-medium">
                  Share student details, tuition preferences, and parent information.
                  Our team will match you with the right tutor.
                </p>
              </div>

              <div className="rounded-[2.2rem] bg-white border border-slate-200/80 p-6 shadow-md flex items-center gap-5">
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="h-16 w-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      className="stroke-slate-100 fill-none"
                      strokeWidth="5.5"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      className="stroke-blue-600 fill-none transition-all duration-500 ease-out"
                      strokeWidth="5.5"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={2 * Math.PI * 28 * (1 - step / totalSteps)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-slate-800">
                    {step}/{totalSteps}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</p>
                  <h4 className="text-base font-black text-slate-855 mt-0.5 leading-snug">
                    {step === 1 && "Parent Details"}
                    {step === 2 && "Student Details"}
                    {step === 3 && "Tutor Preferences"}
                    {step === 4 && "Review Details"}
                  </h4>
                  <p className="text-xs text-slate-450 font-semibold mt-0.5">
                    Step {step} of {totalSteps}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-4 gap-2 md:gap-4">
          <StepBox
            number="01"
            active={step === 1}
            done={step > 1}
            title="Parent"
            subtitle="Contact details"
            icon={User}
          />
          <StepBox
            number="02"
            active={step === 2}
            done={step > 2}
            title="Student"
            subtitle="Academic details"
            icon={GraduationCap}
          />
          <StepBox
            number="03"
            active={step === 3}
            done={step > 3}
            title="Preference"
            subtitle="Mode & timing"
            icon={Settings}
          />
          <StepBox
            number="04"
            active={step === 4}
            done={false}
            title="Review"
            subtitle="Verify details"
            icon={FileText}
          />
        </div>        <form
          onSubmit={(e) => e.preventDefault()}
          className="glass-card rounded-[2.5rem] border border-white/70 p-5 shadow-2xl shadow-slate-200/80 md:p-8"
        >
          <AnimatePresence mode="wait">
            {/* STEP 1: Parent Details */}
            {step === 1 && (
              <motion.section
                key="step1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <SectionTitle
                    eyebrow="Step 01"
                    title="Parent Details"
                    description="Share contact details so our team can reach out with the best tutor match."
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
                  <Input
                    label={requiredLabel("Parent / Guardian Name")}
                    name="parentName"
                    value={form.parentName}
                    onChange={handleChange}
                    error={errors.parentName}
                    placeholder="Enter parent name"
                    icon={User}
                  />

                  <Input
                    label={requiredLabel("Phone Number")}
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="Enter phone number"
                    icon={Phone}
                  />

                  <Input
                    label={requiredLabel("Parent Email Address")}
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="example@email.com"
                    icon={Mail}
                  />

                  <Input
                    label={requiredLabel("Address")}
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    error={errors.address}
                    placeholder="House/Flat No, Street, Area, City, State, Pincode"
                    icon={MapPin}
                  />
                </motion.div>
              </motion.section>
            )}

            {/* STEP 2: Student Details */}
            {step === 2 && (
              <motion.section
                key="step2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <SectionTitle
                    eyebrow="Step 02"
                    title="Student Details"
                    description="Add one or more students and their academic requirements."
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm font-medium text-slate-500">
                    Mandatory fields are marked with{" "}
                    <span className="font-bold text-red-500">*</span>
                  </p>

                  <button
                    type="button"
                    onClick={addWard}
                    className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-black cursor-pointer active:scale-95 flex items-center gap-2"
                  >
                    <User className="h-4.5 w-4.5" /> + Add Another Student
                  </button>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                  <AnimatePresence initial={false}>
                    {form.wards.map((ward, index) => (
                      <motion.div
                        key={index}
                        variants={wardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white/70 backdrop-blur-md p-5 shadow-sm hover:shadow-xl transition-all duration-300 md:p-7 border-l-4 border-l-blue-600"
                      >
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
                              <GraduationCap className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-slate-900">
                                Student Profile {index + 1}
                              </h3>
                              <p className="text-xs text-slate-500 font-medium">
                                Academic & subject specifications for child {index + 1}
                              </p>
                            </div>
                          </div>

                          {form.wards.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeWard(index)}
                              className="rounded-2xl border border-red-150 bg-red-50/70 hover:bg-red-100/80 px-4 py-2 text-xs font-black text-red-650 transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
                            >
                              <X className="h-3.5 w-3.5" /> Remove Profile
                            </button>
                          )}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <Input
                            label={requiredLabel("Student Name")}
                            name="studentName"
                            value={ward.studentName}
                            onChange={(e) => handleWardChange(index, e)}
                            error={errors[`wards.${index}.studentName`]}
                            placeholder="Enter student name"
                            icon={User}
                          />

                          <SelectBox
                            label={requiredLabel("Class")}
                            name="classGrade"
                            value={ward.classGrade}
                            onChange={(e) => handleWardChange(index, e)}
                            options={classOptions}
                            placeholder="Select class"
                            error={errors[`wards.${index}.classGrade`]}
                            icon={GraduationCap}
                          />

                          {ward.classGrade && (
                            <div className="md:col-span-2">
                              <SelectBox
                                label={requiredLabel("Curriculum")}
                                name="curriculum"
                                value={ward.curriculum}
                                onChange={(e) => handleWardChange(index, e)}
                                options={getCurriculumOptions(ward.classGrade)}
                                placeholder="Select curriculum"
                                error={errors[`wards.${index}.curriculum`]}
                                icon={Award}
                              />
                            </div>
                          )}

                          <SearchableInput
                            label={requiredLabel("School Name")}
                            type="text"
                            name="schoolName"
                            value={ward.schoolName}
                            onChange={(e) => handleWardChange(index, e)}
                            options={schoolOptions}
                            listId={`schools-${index}`}
                            placeholder="Enter school name"
                            error={errors[`wards.${index}.schoolName`]}
                            icon={Building2}
                          />

                          <SubjectsMultiSelect
                            label={requiredLabel("Subjects Required")}
                            options={subjectOptions}
                            selectedValues={ward.subjectsNeeded}
                            onChange={(newValues) => {
                              setForm((prev) => {
                                const updated = [...prev.wards];
                                updated[index] = {
                                  ...updated[index],
                                  subjectsNeeded: newValues,
                                };
                                return {
                                  ...prev,
                                  wards: updated,
                                };
                              });
                              setErrors((prev) => ({
                                ...prev,
                                [`wards.${index}.subjectsNeeded`]: "",
                              }));
                            }}
                            placeholder="Select subjects"
                            error={errors[`wards.${index}.subjectsNeeded`]}
                            icon={BookOpen}
                          />

                          <div className="md:col-span-2 overflow-hidden rounded-[1.8rem] border border-slate-200 bg-slate-50/50 backdrop-blur-sm">
                            <button
                              type="button"
                              onClick={() => toggleNotes(index)}
                              className="flex w-full items-center justify-between px-5 py-4.5 text-left transition hover:bg-slate-100/30 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-slate-400" />
                                <div>
                                  <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                                    Special Learning Needs / Notes
                                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-655">
                                      Optional
                                    </span>
                                  </p>
                                  <p className="mt-0.5 text-xs text-slate-455 font-medium">
                                    Add learning goals, concerns, or additional notes.
                                  </p>
                                </div>
                              </div>

                              <ChevronDown
                                className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${openNotes[index] ? "rotate-180" : ""}`}
                              />
                            </button>

                            {openNotes[index] && (
                              <div className="animate-slideFade border-t border-slate-200/80 bg-white/70 p-5">
                                <TextArea
                                  label="Special Learning Needs / Notes"
                                  name="specialNeeds"
                                  value={ward.specialNeeds}
                                  onChange={(e) => handleWardChange(index, e)}
                                  placeholder="Mention learning needs, goals, concerns, or notes for the tutor."
                                  icon={FileText}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.section>
            )}

            {/* STEP 3: Tutor Preferences */}
            {step === 3 && (
              <motion.section
                key="step3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-8"
              >
                <motion.div variants={itemVariants}>
                  <SectionTitle
                    eyebrow="Step 03"
                    title="Tutor Preferences & Plan"
                    description="Choose how the student should study and select a learning plan."
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
                  {/* Preferred Mode Select Cards */}
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-sm font-bold text-slate-700">
                      {requiredLabel("Preferred Mode of Tuition")}
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        {
                          id: "Online / One-to-One Tuition",
                          title: "Online Live Tuition",
                          desc: "One-to-one interactive online classes from home.",
                          icon: Video
                        },
                        {
                          id: "Home Tuition / In-Person",
                          title: "Home / In-Person Tuition",
                          desc: "A verified tutor visits your home for personalized guidance.",
                          icon: Home
                        }
                      ].map((mode) => {
                        const isSelected = form.preferredMode === mode.id;
                        const ModeIcon = mode.icon;
                        return (
                          <motion.div
                            key={mode.id}
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={() => {
                              setForm(prev => ({ ...prev, preferredMode: mode.id }));
                              setErrors(prev => ({ ...prev, preferredMode: "" }));
                            }}
                            className={`relative overflow-hidden rounded-[2rem] border p-6 flex items-start gap-4 cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? "border-blue-600 bg-blue-50/15 shadow-md ring-2 ring-blue-500/10"
                                : "border-slate-200 bg-white/70 hover:border-slate-350 hover:bg-white"
                            }`}
                          >
                            <div className={`p-3 rounded-2xl shrink-0 transition-colors duration-300 ${
                              isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-500/25" : "bg-slate-100 text-slate-500"
                            }`}>
                              <ModeIcon className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-800 text-base">{mode.title}</h4>
                              <p className="mt-1.5 text-xs text-slate-500 font-medium leading-relaxed">{mode.desc}</p>
                            </div>
                            {isSelected && (
                              <div className="absolute right-4 top-4 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                ✓
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                    {errors.preferredMode && (
                      <p className="mt-1.5 text-xs font-bold text-red-650 flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-650" />
                        {errors.preferredMode}
                      </p>
                    )}
                  </div>

                  {/* Preferred Gender Selector Sliding Tabs */}
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-sm font-bold text-slate-700">
                      {requiredLabel("Preferred Gender of Tutor")}
                    </label>
                    <div className="relative flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/50">
                      {[
                        { id: "Male", label: "Male Tutor", icon: User },
                        { id: "Female", label: "Female Tutor", icon: User },
                        { id: "Flexible", label: "Flexible", icon: Users }
                      ].map((gender) => {
                        const isSelected = form.preferredGender === gender.id;
                        const GenderIcon = gender.icon;
                        return (
                          <button
                            type="button"
                            key={gender.id}
                            onClick={() => {
                              setForm(prev => ({ ...prev, preferredGender: gender.id }));
                              setErrors(prev => ({ ...prev, preferredGender: "" }));
                            }}
                            className={`relative flex flex-1 items-center justify-center gap-2 py-3 px-3 text-xs font-extrabold rounded-xl transition-all duration-300 cursor-pointer z-10 ${
                              isSelected ? "text-white" : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="activeGenderBg"
                                className="absolute inset-0 bg-slate-900 rounded-xl -z-10 shadow-sm"
                                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                              />
                            )}
                            <GenderIcon className="h-4 w-4" />
                            <span>{gender.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.preferredGender && (
                      <p className="mt-1.5 text-xs font-bold text-red-650 flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-650" />
                        {errors.preferredGender}
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Plan Selection UI */}
                <motion.div variants={itemVariants} className="mt-8">
                  {form.planType ? (
                    <div className="flex flex-col gap-6">
                      <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-md p-6 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl ${
                              form.planType === 'foundation' ? 'bg-slate-100 text-slate-700' :
                              form.planType === 'advance' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-900 text-white'
                            }`}>
                              {form.planType === 'elite' ? <Award className="h-8 w-8" /> : <Star className="h-8 w-8" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xl font-black text-slate-900">
                                  {PLANS.find(p => p.id === form.planType)?.title || form.planType}
                                </h4>
                                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-black text-emerald-700 border border-emerald-200">
                                  Selected
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-slate-500 font-medium">
                                {form.daysPerWeek} Days/Week • {form.hoursPerDay} Hr/Day
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                            <div className="text-left md:text-right">
                              {form.planType === 'elite' ? (
                                (() => {
                                  const firstWardClass = form.wards[0]?.classGrade || "6";
                                  const firstWardBoard = form.wards[0]?.curriculum || "CBSE";
                                  const hrRate = calculateEliteHourlyPrice(firstWardClass, firstWardBoard);
                                  return (
                                    <div className="flex flex-col">
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hourly Rate</p>
                                      <p className="text-2xl font-black text-slate-900">₹{hrRate.toLocaleString('en-IN')}/hour</p>
                                      <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">
                                        Est: ₹{form.monthlyFees?.toLocaleString('en-IN')}/month
                                      </span>
                                    </div>
                                  );
                                })()
                              ) : (
                                <>
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Tuition Fee</p>
                                  <p className="text-2xl font-black text-slate-900">
                                    {['foundation', 'advance'].includes(form.planType) ? (
                                      (() => {
                                        const firstWardClass = form.wards[0]?.classGrade || "6";
                                        const firstWardBoard = form.wards[0]?.curriculum || "CBSE";
                                        const basePrice = calculatePrice('board', firstWardClass, firstWardBoard, form.daysPerWeek, form.hoursPerDay);
                                        return (
                                          <>
                                            <span className="line-through text-slate-400 text-lg mr-2 font-black">
                                              ₹{basePrice.toLocaleString('en-IN')}
                                            </span>
                                            <span className="text-slate-900">
                                              ₹{form.monthlyFees?.toLocaleString('en-IN')}
                                            </span>
                                          </>
                                        );
                                      })()
                                    ) : (
                                      `₹${form.monthlyFees?.toLocaleString('en-IN')}`
                                    )}
                                  </p>
                                  {form.planType === 'foundation' && form.discount && (
                                    <span className="text-[10px] font-black text-emerald-600 block mt-0.5">
                                      Save ₹{form.discount.toLocaleString('en-IN')} (18% applied)
                                    </span>
                                  )}
                                  {form.planType === 'advance' && (
                                    <span className="text-[10px] font-black text-amber-700 block mt-0.5">
                                      Only +18% more investment
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={handleChangePlan}
                              className="rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 transition cursor-pointer"
                            >
                              Change Plan
                            </button>
                          </div>
                        </div>

                        {/* Professional Pricing Disclaimer */}
                        <div className="mt-5 pt-4 border-t border-slate-150 flex items-start gap-2.5 text-xs text-slate-400">
                          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                          <p className="leading-relaxed font-semibold text-[10px] text-slate-550">
                            {form.planType === 'elite' ? (
                              "Estimated monthly tuition fees are calculated using the selected board, class, session duration and weekly schedule. Final tuition fees may vary after the demo session depending on the student's learning level, syllabus complexity, parents' expectations, tutor availability, travel distance (if applicable) and the overall academic support required."
                            ) : (
                              "Final tuition fees may vary after the demo session depending on the student's learning level, syllabus complexity, parents' expectations, teacher availability, travel distance (if applicable), and the overall academic effort required."
                            )}
                          </p>
                        </div>          </div>

                      {/* Preferred Days Selector */}
                      <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-md p-6 shadow-xl">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="text-lg font-black text-slate-800">
                            Select Preferred Days <span className="text-red-500">*</span>
                          </h4>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-550 border border-slate-200/60">
                            Selected {form.preferredDays.length} of {form.daysPerWeek} days
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs font-medium text-slate-450">
                          Please choose exactly {form.daysPerWeek} days when the child is available for tutoring classes.
                        </p>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          {dayOptions.map((day) => {
                            const active = form.preferredDays.includes(day);
                            return (
                              <button
                                type="button"
                                key={day}
                                onClick={() => handleDayToggle(day)}
                                className={`rounded-full px-5 py-3 text-sm font-extrabold transition-all duration-300 cursor-pointer ${
                                  active
                                    ? "bg-slate-900 text-white shadow-lg scale-[1.03]"
                                    : "bg-slate-50 text-slate-655 border border-slate-150/60 hover:bg-slate-100"
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>

                        {errors.preferredDays && (
                          <p className="mt-3 text-xs font-bold text-red-650">{errors.preferredDays}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-800">
                          Choose Your Preferred Plan <span className="text-red-500">*</span>
                        </h3>
                        {errors.planType && (
                          <span className="text-xs font-bold text-red-500">{errors.planType}</span>
                        )}
                      </div>

                      <div className="flex w-full gap-5 overflow-x-auto pb-4 snap-x md:grid md:grid-cols-3 md:overflow-x-visible md:pb-0 scrollbar-thin">
                        {PLANS.map((plan) => {
                          const isSilver = plan.theme === "silver";
                          const isGold = plan.theme === "gold";

                          let cardBgClass = "";
                          let textClass = "";
                          let hoverShadowClass = "";
                          if (isSilver) {
                            cardBgClass = "bg-gradient-to-br from-[#F8FAFC] to-[#CBD5E1] border-white/40 shadow-sm";
                            textClass = "text-slate-800";
                            hoverShadowClass = "hover:shadow-[0_0_30px_rgba(203,213,225,0.3)]";
                          } else if (isGold) {
                            cardBgClass = "bg-gradient-to-br from-[#FFD700] to-[#F59E0B] border-[#FFD700]/30 shadow-md";
                            textClass = "text-slate-955";
                            hoverShadowClass = "hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]";
                          } else {
                            cardBgClass = "bg-gradient-to-br from-[#111827] to-[#000000] border-white/12 shadow-lg";
                            textClass = "text-white";
                            hoverShadowClass = "hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]";
                          }

                          return (
                            <div
                              key={plan.id}
                              onClick={() => handleOpenPlanModal(plan)}
                              className={`relative overflow-hidden premium-shine-card w-[290px] sm:w-[320px] md:w-full flex-shrink-0 snap-center rounded-[2rem] border p-5 flex flex-col justify-between h-[250px] cursor-pointer transition-all duration-300 group hover:scale-[1.02] ${cardBgClass} ${textClass} ${hoverShadowClass}`}
                            >
                              {/* Subtle shine effect overlay on hover */}
                              <div className="shine-overlay pointer-events-none" />
                              {/* Top Info */}
                              <div>
                                <div className={`inline-block rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider border mb-3 ${
                                  isSilver ? 'bg-slate-900/10 text-slate-855 border-slate-900/20' :
                                  isGold ? 'bg-black/10 text-slate-955 border-black/20' :
                                  'bg-white/10 text-white border-white/10'
                                }`}>
                                  {plan.badge}
                                </div>

                                <h4 className="text-xl font-black tracking-tight">{plan.title}</h4>
                                <p className="mt-1 text-[11px] leading-relaxed font-semibold opacity-90">
                                  {plan.keyBenefit}
                                </p>
                              </div>

                              {/* Description snippet */}
                              <p className="text-[11px] leading-relaxed font-medium opacity-75 line-clamp-2 my-2">
                                {plan.description}
                              </p>

                              {/* Price and Explore Button */}
                              <div className="mt-auto pt-3.5 border-t border-current/10 flex items-center justify-between w-full">
                                <div>
                                  {plan.id === "elite" ? (
                                    (() => {
                                      const firstWardClass = form.wards[0]?.classGrade || "6";
                                      const firstWardBoard = form.wards[0]?.curriculum || "CBSE";
                                      const hrRate = calculateEliteHourlyPrice(firstWardClass, firstWardBoard);
                                      const estMonthly = calculateEliteMonthlyPrice(firstWardClass, firstWardBoard, 3, 1);
                                      return (
                                        <div className="flex flex-col">
                                          <span className="text-[8px] font-black uppercase tracking-wider opacity-60 block">Hourly Rate</span>
                                          <span className="text-lg font-black tracking-tight text-white">
                                            ₹{hrRate.toLocaleString('en-IN')}/hour
                                          </span>
                                          <span className="text-[9px] font-semibold text-slate-350 block mt-0.5">
                                            Est: ₹{estMonthly.toLocaleString('en-IN')}/month
                                          </span>
                                        </div>
                                      );
                                    })()
                                  ) : (
                                    <div>
                                      <span className="text-[8px] font-bold uppercase tracking-wider opacity-60 block">Starting Price</span>
                                      <span className="text-lg font-extrabold tracking-tight">
                                        {(() => {
                                          const firstWardClass = form.wards[0]?.classGrade || "6";
                                          const firstWardBoard = form.wards[0]?.curriculum || "CBSE";
                                          const defaultHours = 1.5;
                                          const cardStartingPrice = calculatePrice(plan.id, firstWardClass, firstWardBoard, 3, defaultHours);
                                          return `₹${cardStartingPrice.toLocaleString('en-IN')}`;
                                        })()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-[9px] font-black uppercase tracking-wider opacity-85 group-hover:opacity-100 transition-opacity flex items-center gap-1 py-1 px-3 rounded-full border border-current/25 bg-current/5">
                                  <span>View Details</span>
                                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* View Details Modal */}
                <AnimatePresence>
                  {viewingPlanId && (
                    (() => {
                      const activePlanData = PLANS.find((p) => p.id === viewingPlanId);
                      if (!activePlanData) return null;
                      return (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.35 }}
                          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 animate-none"
                          onClick={() => setViewingPlanId(null)}
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.35 }}
                            className="relative w-full max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] rounded-[2rem] bg-white shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Modal Header */}
                            <div className={`px-5 py-4 md:px-6 md:py-5 text-white bg-gradient-to-r ${activePlanData.gradient} relative`}>
                              <button
                                type="button"
                                onClick={() => setViewingPlanId(null)}
                                className={`absolute top-4 right-4 p-1.5 rounded-full transition cursor-pointer flex items-center justify-center bg-black/5 hover:bg-black/15 ${
                                  activePlanData.theme === 'black' ? 'text-white' : 'text-slate-700 hover:text-slate-900'
                                }`}
                              >
                                <X className="h-4.5 w-4.5" />
                              </button>
                              
                              <div className="mt-2">
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border mb-2 ${
                                  activePlanData.theme === 'silver' ? 'bg-slate-900/10 text-slate-855 border-slate-900/20' :
                                  activePlanData.theme === 'gold' ? 'bg-black/10 text-slate-955 border-black/20' :
                                  'bg-white/15 text-white border-white/10'
                                }`}>
                                  {activePlanData.badge}
                                </span>
                                <h3 className={`text-2xl font-black ${
                                  activePlanData.theme === 'black' ? 'text-white' : 'text-slate-900'
                                }`}>
                                  {activePlanData.title}
                                </h3>
                                <p className={`mt-1 text-xs leading-relaxed max-w-2xl ${
                                  activePlanData.theme === 'black' ? 'text-slate-300' : 'text-slate-600'
                                }`}>
                                  {activePlanData.description}
                                </p>
                              </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5 md:p-6 grid gap-6 md:grid-cols-[1.4fr_0.6fr] flex-1 overflow-y-auto">
                              <div className="space-y-5">
                                {/* Benefits */}
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Core Benefits</h4>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    {activePlanData.fullDetails.benefits.map((benefit, idx) => {
                                      const isDarkModal = activePlanData.theme === 'black';
                                      return (
                                        <div
                                          key={idx}
                                          className={`flex gap-3.5 items-start rounded-2xl p-4 transition duration-300 ${
                                            isDarkModal
                                              ? 'bg-gradient-to-br from-[#0B1528] to-[#050B15] border border-blue-900/30 text-white hover:border-blue-700/40'
                                              : 'bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] border border-slate-200 text-slate-800 hover:border-slate-300 hover:shadow-sm'
                                          }`}
                                        >
                                          {/* Scale down the SVG for the modal and align it to the top */}
                                          <div className="w-12 h-12 shrink-0 overflow-hidden relative mt-0.5">
                                            <div className="scale-[0.6] origin-top-left absolute top-0 left-0">
                                              {getBenefitIcon(benefit.title)}
                                            </div>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h5 className={`text-xs font-bold leading-tight ${isDarkModal ? 'text-white' : 'text-slate-800'}`}>
                                              {benefit.title}
                                            </h5>
                                            <div className="h-[2px] w-5 bg-amber-500 rounded-full my-1.5" />
                                            <p className={`text-[10px] leading-normal font-semibold ${isDarkModal ? 'text-slate-400' : 'text-slate-500'}`}>
                                              {benefit.desc}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Features */}
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">What's Included</h4>
                                  <ul className="space-y-1.5">
                                    {(() => {
                                      const features = activePlanData.fullDetails.features || [];
                                      const displayedFeatures = showAllFeatures ? features : features.slice(0, 1);
                                      return (
                                        <>
                                          {displayedFeatures.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600 animate-slideFade">
                                              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                              <span>{feature}</span>
                                            </li>
                                          ))}
                                          {features.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => setShowAllFeatures(!showAllFeatures)}
                                              className="mt-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer focus:outline-none"
                                            >
                                              {showAllFeatures ? "See Less" : `See More (+${features.length - 1})`}
                                            </button>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </ul>
                                </div>

                                {/* FAQs */}
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Frequently Asked Questions</h4>
                                  <div className="space-y-1.5">
                                    {activePlanData.fullDetails.faqs.map((faq, idx) => {
                                      const isOpen = openFaqIndex === idx;
                                      return (
                                        <div key={idx} className="border-b border-slate-100 pb-1.5">
                                          <button
                                            type="button"
                                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                            className="w-full flex items-center justify-between text-left py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                                          >
                                            <span>{faq.q}</span>
                                            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                                          </button>
                                          <AnimatePresence initial={false}>
                                            {isOpen && (
                                              <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                              >
                                                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 pb-0.5">{faq.a}</p>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Pricing option matrix selection */}
                              <div className="flex flex-col justify-start rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-inner self-start w-full">
                                <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Select Pricing Option</h4>
                                  <div className="space-y-2">
                                    {getFilteredPricingOptions(activePlanData, form.wards).map((opt, idx) => {
                                      const isSelected = selectedOption && selectedOption.days === opt.days && selectedOption.hours === opt.hours;
                                      
                                      const firstWardClass = form.wards[0]?.classGrade || "6";
                                      const firstWardBoard = form.wards[0]?.curriculum || "CBSE";
                                      const rowPrice = calculatePrice(
                                        activePlanData.id === 'elite' ? 'elite' : 'board',
                                        firstWardClass,
                                        firstWardBoard,
                                        opt.days,
                                        opt.hours
                                      );

                                      return (
                                        <div
                                          key={idx}
                                          onClick={() => setSelectedOption(opt)}
                                          className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                                            isSelected 
                                              ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                                              : 'border-slate-200 bg-white hover:border-slate-350'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                                              isSelected ? 'border-blue-500 text-blue-500' : 'border-slate-300'
                                            }`}>
                                              {isSelected && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                                            </div>
                                            <div>
                                              <p className="text-[11px] font-black text-slate-800">
                                                {opt.days} Days / Week
                                              </p>
                                              <p className="text-[9px] font-bold text-slate-500">
                                                {opt.hours} Hour{opt.hours !== 1 ? 's' : ''} / Day
                                              </p>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-[11px] font-black text-slate-900">
                                              ₹{rowPrice.toLocaleString('en-IN')}
                                            </p>
                                            <p className="text-[8px] font-bold text-slate-400">
                                              / month
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Dynamic Calculation Summary Card */}
                                  {(() => {
                                    const firstWardClass = form.wards[0]?.classGrade || "6";
                                    const firstWardBoard = form.wards[0]?.curriculum || "CBSE";
                                    const calc = getDynamicCalculation(activePlanData.id, selectedOption, firstWardClass, firstWardBoard);
                                    if (!calc) return null;

                                    if (activePlanData.id === 'foundation') {
                                      return (
                                        <div className="mt-4 p-3 rounded-xl bg-emerald-50/50 border border-emerald-150/60 text-xs space-y-1.5 animate-slideFade">
                                          <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-semibold">Original Price:</span>
                                            <span className="text-slate-400 line-through font-extrabold">₹{calc.originalPrice.toLocaleString('en-IN')}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-semibold flex items-center gap-1">
                                              Discount: 
                                              <span className="bg-emerald-150 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                                                -{calc.discountPercent}%
                                              </span>
                                            </span>
                                            <span className="text-emerald-700 font-extrabold">-₹{calc.discount.toLocaleString('en-IN')}</span>
                                          </div>
                                          <div className="pt-1.5 border-t border-emerald-200/50 flex justify-between items-center">
                                            <span className="text-slate-900 font-black text-xs">Final Price:</span>
                                            <span className="text-slate-900 font-black text-base">₹{calc.finalPrice.toLocaleString('en-IN')}</span>
                                          </div>
                                          <div className="text-right">
                                            <span className="text-emerald-700 text-[10px] font-black">
                                              Save ₹{calc.discount.toLocaleString('en-IN')} ({calc.discountPercent}%)
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    }

                                    if (activePlanData.id === 'advance') {
                                      return (
                                        <div className="mt-4 p-3 rounded-xl bg-amber-50/30 border border-amber-200/40 text-xs space-y-1.5 animate-slideFade">
                                          <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-semibold">Base Plan Price:</span>
                                            <span className="text-slate-700 font-extrabold">₹{calc.basePrice.toLocaleString('en-IN')}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-slate-500 font-semibold flex items-center gap-1">
                                              Plan Addition:
                                              <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                                                +18%
                                              </span>
                                            </span>
                                            <span className="text-amber-700 font-extrabold">+₹{calc.extraCost.toLocaleString('en-IN')}</span>
                                          </div>
                                          <div className="pt-1.5 border-t border-amber-200/30 flex justify-between items-center">
                                            <span className="text-slate-900 font-black text-xs">Final Price:</span>
                                            <span className="text-slate-900 font-black text-base">₹{calc.finalPrice.toLocaleString('en-IN')}</span>
                                          </div>
                                          <div className="text-right">
                                            <span className="text-amber-800 text-[10px] font-black">
                                              Base Plan + 18% Extra
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    }

                                    if (activePlanData.id === 'elite') {
                                      const hrRate = calculateEliteHourlyPrice(firstWardClass, firstWardBoard);
                                      return (
                                        <div className="mt-4 p-3 rounded-xl bg-slate-900 text-white text-xs space-y-1.5 animate-slideFade">
                                          <div className="flex justify-between items-center">
                                            <span className="text-slate-300 font-semibold">Hourly Rate:</span>
                                            <span className="font-black text-base text-amber-400">₹{hrRate.toLocaleString('en-IN')}/hour</span>
                                          </div>
                                          <div className="flex justify-between items-center text-slate-350">
                                            <span className="font-semibold">Estimated Monthly Fee:</span>
                                            <span className="font-extrabold text-white">₹{calc.finalPrice.toLocaleString('en-IN')}/month</span>
                                          </div>
                                          <div className="flex justify-between items-center text-slate-355">
                                            <span className="font-semibold">Schedules per Month:</span>
                                            <span className="font-extrabold text-white">{calc.totalClasses} classes</span>
                                          </div>
                                          <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center">
                                            <span className="font-black text-xs">Cost Per Class:</span>
                                            <span className="font-black text-sm text-slate-300">₹{calc.costPerClass} / Class</span>
                                          </div>
                                        </div>
                                      );
                                    }

                                    return null;
                                  })()}
                                </div>

                                <div className="mt-4">
                                  <button
                                    type="button"
                                    onClick={() => handleChoosePlan(activePlanData)}
                                    disabled={!selectedOption}
                                    className="w-full flex h-10 items-center justify-center gap-2 rounded-xl font-black text-xs transition-all duration-300 bg-slate-900 text-white hover:bg-black active:scale-[0.98] shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    Choose This Plan
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      );
                    })()
                  )}
                </AnimatePresence>
              </motion.section>
            )}

            {/* STEP 4: Review Details */}
            {step === 4 && (
              <motion.section
                key="step4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-8"
              >
                <motion.div variants={itemVariants}>
                  <SectionTitle
                    eyebrow="Step 04"
                    title="Review Details"
                    description="Double-check the details below before submitting your enquiry."
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                  {/* 1. Parent Details */}
                  <div className="rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-md p-6 shadow-sm border-l-4 border-l-slate-800">
                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <User className="h-5 w-5 text-slate-600" /> 1. Parent Details
                      </h3>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="rounded-xl bg-slate-150 px-3.5 py-1.5 text-xs font-black text-slate-700 transition hover:bg-slate-250 cursor-pointer active:scale-95 shadow-sm"
                      >
                        Edit Section
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Parent / Guardian Name</span>
                        <span className="font-bold text-slate-800 text-base">{form.parentName}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Phone Number</span>
                        <span className="font-bold text-slate-800 text-base">{form.phone}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 sm:col-span-2">
                        <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Email Address</span>
                        <span className="font-bold text-slate-800 text-base">{form.email}</span>
                      </div>
                      <div className="sm:col-span-2 flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Complete Address</span>
                        <p className="mt-1 text-slate-700 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-150">{form.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Student Details */}
                  <div className="rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-md p-6 shadow-sm border-l-4 border-l-blue-600">
                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <GraduationCap className="h-5.5 w-5.5 text-blue-600" /> 2. Student Details
                      </h3>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="rounded-xl bg-slate-150 px-3.5 py-1.5 text-xs font-black text-slate-700 transition hover:bg-slate-250 cursor-pointer active:scale-95 shadow-sm"
                      >
                        Edit Section
                      </button>
                    </div>

                    <div className="space-y-6">
                      {form.wards.map((ward, idx) => (
                        <div key={idx} className={idx > 0 ? "border-t border-slate-150 pt-5 mt-5" : ""}>
                          <h4 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500" /> Student Profile {idx + 1}
                          </h4>
                          <div className="grid gap-4 sm:grid-cols-2 text-sm bg-slate-50/30 p-4 rounded-2xl border border-slate-150/60">
                            <div>
                              <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block">Student Name</span>
                              <span className="font-bold text-slate-800 text-base">{ward.studentName}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block">Class</span>
                              <span className="font-bold text-slate-800 text-base">{ward.classGrade}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block">Curriculum</span>
                              <span className="font-bold text-slate-800 text-base">{ward.curriculum || "Not selected"}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block">School Name</span>
                              <span className="font-bold text-slate-800 text-base">{ward.schoolName}</span>
                            </div>
                            <div className="sm:col-span-2">
                              <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block mb-1">Subjects Needed</span>
                              <div className="flex flex-wrap gap-1.5">
                                {ward.subjectsNeeded.map((sub) => (
                                  <span key={sub} className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                    {sub}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {ward.specialNeeds && (
                              <div className="sm:col-span-2">
                                <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block">Special Needs / Notes</span>
                                <p className="mt-1 text-slate-700 bg-white p-3 rounded-2xl border border-slate-100">{ward.specialNeeds}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Tutor Preferences & Plan Selection */}
                  <div className="rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-md p-6 shadow-sm border-l-4 border-l-indigo-600">
                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-indigo-650" /> 3. Tutor Preferences & Plan
                      </h3>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="rounded-xl bg-slate-150 px-3.5 py-1.5 text-xs font-black text-slate-700 transition hover:bg-slate-250 cursor-pointer active:scale-95 shadow-sm"
                      >
                        Edit Section
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                      <div>
                        <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block">Preferred Mode</span>
                        <span className="font-bold text-slate-800 text-base">{form.preferredMode}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block">Preferred Gender</span>
                        <span className="font-bold text-slate-800 text-base">{form.preferredGender}</span>
                      </div>
                      {form.planType ? (
                        <>
                          <div>
                            <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block">Selected Plan</span>
                            <span className="font-bold text-slate-800 text-base">
                              {PLANS.find(p => p.id === form.planType)?.title || form.planType}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block">Schedule Format</span>
                            <span className="font-bold text-slate-800 text-base">
                              {form.daysPerWeek} Days/Week • {form.hoursPerDay} Hr/Day
                            </span>
                          </div>
                          <div>
                            {form.planType === 'elite' ? (
                              (() => {
                                  const firstWardClass = form.wards[0]?.classGrade || "6";
                                  const firstWardBoard = form.wards[0]?.curriculum || "CBSE";
                                  const hrRate = calculateEliteHourlyPrice(firstWardClass, firstWardBoard);
                                  return (
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block">Hourly Rate</span>
                                      <span className="font-extrabold text-indigo-700 text-lg">
                                        ₹{hrRate.toLocaleString('en-IN')}/hour
                                      </span>
                                      <span className="text-[11px] font-semibold text-slate-555 block mt-0.5">
                                        Est Monthly: ₹{form.monthlyFees?.toLocaleString('en-IN')}/month
                                      </span>
                                    </div>
                                  );
                              })()
                            ) : (
                              <>
                                <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block">Monthly Tuition Investment</span>
                                <span className="font-extrabold text-emerald-700 text-lg">
                                  {['foundation', 'advance'].includes(form.planType) ? (
                                    (() => {
                                      const firstWardClass = form.wards[0]?.classGrade || "6";
                                      const firstWardBoard = form.wards[0]?.curriculum || "CBSE";
                                      const basePrice = calculatePrice('board', firstWardClass, firstWardBoard, form.daysPerWeek, form.hoursPerDay);
                                      return (
                                        <>
                                          <span className="line-through text-slate-400 text-sm mr-2 font-black">
                                            ₹{basePrice.toLocaleString('en-IN')}
                                          </span>
                                          <span className="text-emerald-700">
                                            ₹{form.monthlyFees?.toLocaleString('en-IN')}
                                          </span>
                                        </>
                                      );
                                    })()
                                  ) : (
                                    `₹${form.monthlyFees?.toLocaleString('en-IN')}`
                                  )}
                                </span>
                                {form.planType === 'foundation' && form.discount && (
                                  <span className="text-[10px] font-black text-emerald-600 block mt-0.5">
                                    Save ₹{form.discount.toLocaleString('en-IN')} (18% applied)
                                  </span>
                                )}
                                {form.planType === 'advance' && (
                                  <span className="text-[10px] font-black text-amber-700 block mt-0.5">
                                    Base Plan + 18% Extra
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                            
                            {/* Professional Pricing Consent Checkbox */}
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-3">
                              <input
                                type="checkbox"
                                id="pricingConsent"
                                checked={form.pricingConsent || false}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    pricingConsent: e.target.checked,
                                  }))
                                }
                                className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                                style={{ accentColor: "#2563eb" }}
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor="pricingConsent"
                                  className="text-xs font-semibold text-slate-500 leading-relaxed cursor-pointer select-none"
                                >
                                  I understand and agree that the displayed tuition fee is an estimated price. The final tuition fee may increase or decrease after the demo session based on the student's academic level, learning requirements, syllabus complexity, parents' expectations, preferred tutor experience, travel distance (if applicable), and the overall teaching effort required. <span className="text-red-500">*</span>
                                </label>
                                {errors.pricingConsent && (
                                  <p className="mt-1.5 text-xs font-bold text-red-600 flex items-center gap-1">
                                    <span className="inline-block h-1 w-1 rounded-full bg-red-650 animate-pulse" />
                                    {errors.pricingConsent}
                                  </p>
                                )}
                              </div>
                            </div>
                          <div>
                            <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block mb-1">Preferred Days</span>
                            <div className="flex flex-wrap gap-1.5">
                              {form.preferredDays.map((day) => (
                                <span key={day} className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block">Timing</span>
                            <span className="font-bold text-slate-800 text-base">
                              {formatTime12Hr(form.startTime)} to {formatTime12Hr(form.endTime)}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block">Class Duration</span>
                            <span className="font-bold text-slate-800 text-base">{form.classDuration}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider block mb-1">Preferred Days</span>
                            <div className="flex flex-wrap gap-1.5">
                              {form.preferredDays.map((day) => (
                                <span key={day} className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.section>
            )}
          </AnimatePresence>

          {message && (
            <div
              className={`mt-8 rounded-2xl px-5 py-4 text-sm font-bold flex items-center gap-2 ${message.toLowerCase().includes("success")
                ? "bg-emerald-50 text-emerald-750 border border-emerald-200"
                : "bg-red-50 text-red-755 border border-red-200"
                }`}
            >
              <Info className="h-5 w-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-black text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/10 hover:bg-black transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-2xl bg-slate-900 px-9 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/10 hover:bg-black transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit Enquiry <Check className="h-4.5 w-4.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function StepBox({ number, active, done, title, subtitle, icon: Icon }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.8rem] border p-3.5 transition-all duration-300 flex items-center gap-3.5 cursor-default ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-[1.02]"
          : done
          ? "border-emerald-200 bg-emerald-50 text-emerald-850"
          : "border-slate-200 bg-white/80 backdrop-blur-md text-slate-550 shadow-sm hover:border-slate-300"
      }`}
    >
      {active && (
        <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-blue-500/15 blur-xl pointer-events-none" />
      )}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
          active
            ? "bg-blue-600 text-white font-extrabold"
            : done
            ? "bg-emerald-100 text-emerald-800"
            : "bg-slate-50 text-slate-450"
        }`}
      >
        {done ? <Check className="h-5 w-5" /> : Icon ? <Icon className="h-5 w-5" /> : <span>{number}</span>}
      </div>
      <div className="hidden sm:block">
        <p className="text-[9px] font-black uppercase tracking-wider opacity-60">
          {done ? "Completed" : active ? "In Progress" : "Pending"}
        </p>
        <p className="text-sm font-black tracking-tight">{title}</p>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-8 flex flex-col items-start">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-650 animate-pulse" />
        <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-650">
          {eyebrow}
        </p>
      </div>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl bg-gradient-to-br from-slate-950 to-slate-800 bg-clip-text text-transparent">
        {title}
      </h2>
      <p className="mt-2.5 max-w-2xl text-sm leading-6 text-slate-500 font-medium">
        {description}
      </p>
    </div>
  );
}

function ErrorText({ message }) {
  if (!message) return null;

  return (
    <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-600" />
      {message}
    </p>
  );
}

function Input({ label, error, icon: Icon, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-705">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10 transition-colors duration-200">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          {...props}
          className={`h-14 w-full rounded-3xl border bg-white/60 backdrop-blur-sm text-sm outline-none transition-all duration-300 hover:border-slate-300 hover:bg-white focus:ring-4 focus:bg-white ${
            Icon ? "pl-12 pr-5" : "px-5"
          } ${
            error
              ? "border-red-400 focus:ring-red-100"
              : "border-slate-200 focus:border-blue-600 focus:ring-blue-100"
          }`}
        />
      </div>
      <ErrorText message={error} />
    </div>
  );
}

function TextArea({ label, error, icon: Icon, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-705">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4.5 top-4.5 text-slate-400 pointer-events-none z-10">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <textarea
          {...props}
          className={`min-h-[120px] w-full rounded-3xl border bg-white/60 backdrop-blur-sm text-sm outline-none transition-all duration-300 hover:border-slate-300 hover:bg-white focus:ring-4 focus:bg-white ${
            Icon ? "pl-12 pr-5 pt-3.5" : "px-5 py-4"
          } ${
            error
              ? "border-red-400 focus:ring-red-100"
              : "border-slate-200 focus:border-blue-600 focus:ring-blue-100"
          }`}
        />
      </div>
      <ErrorText message={error} />
    </div>
  );
}

function SearchableInput({
  label,
  name,
  value,
  onChange,
  options = [],
  listId,
  error,
  icon: Icon,
  ...props
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-705">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          list={listId}
          name={name}
          value={value}
          onChange={onChange}
          className={`h-14 w-full rounded-3xl border bg-white/60 backdrop-blur-sm text-sm outline-none transition-all duration-300 hover:border-slate-300 hover:bg-white focus:ring-4 focus:bg-white ${
            Icon ? "pl-12 pr-5" : "px-5"
          } ${
            error
              ? "border-red-400 focus:ring-red-100"
              : "border-slate-200 focus:border-blue-600 focus:ring-blue-100"
          }`}
          {...props}
        />
        <datalist id={listId}>
          {options.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>
      <ErrorText message={error} />
    </div>
  );
}

function SelectBox({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  error,
  icon: Icon,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-705">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`h-14 w-full rounded-3xl border bg-white/60 backdrop-blur-sm text-sm outline-none transition-all duration-300 hover:border-slate-300 hover:bg-white appearance-none focus:ring-4 focus:bg-white ${
            Icon ? "pl-12 pr-10" : "pl-5 pr-10"
          } ${
            error
              ? "border-red-400 focus:ring-red-100"
              : "border-slate-200 focus:border-blue-600 focus:ring-blue-100"
          }`}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="absolute right-4.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 z-10">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      <ErrorText message={error} />
    </div>
  );
}

function SubjectsMultiSelect({
  label,
  options,
  selectedValues = [],
  onChange,
  placeholder = "Select subjects",
  error,
  icon: Icon,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (value) => {
    const exists = selectedValues.includes(value);
    if (exists) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleRemove = (value, e) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== value));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="mb-2 block text-sm font-bold text-slate-705">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div
          onClick={() => setOpen(!open)}
          className={`min-h-14 w-full rounded-3xl border bg-white/60 backdrop-blur-sm px-4 py-2.5 text-left text-sm font-semibold outline-none transition-all duration-300 flex flex-wrap items-center justify-between gap-1.5 cursor-pointer focus-within:ring-4 focus-within:bg-white focus-within:border-blue-600 ${
            Icon ? "pl-12" : "pl-5"
          } ${
            error
              ? "border-red-400 focus-within:ring-red-100"
              : "border-slate-200 focus-within:ring-blue-100"
          }`}
        >
          <div className="flex flex-wrap gap-1.5 flex-1 mr-2">
            {selectedValues.length === 0 ? (
              <span className="text-slate-400 py-1">{placeholder}</span>
            ) : (
              selectedValues.map((value) => (
                <span
                  key={value}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                >
                  {value}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(value, e)}
                    className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-blue-500 hover:bg-blue-200 hover:text-blue-900 focus:outline-none"
                  >
                    ✕
                  </button>
                </span>
              ))
            )}
          </div>
          <span className="text-xs text-slate-400 self-center">▼</span>
        </div>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-35 mt-1 max-h-60 overflow-y-auto rounded-3xl bg-white p-3 shadow-2xl ring-1 ring-slate-200 animate-slideFade">
          {options.map((option) => {
            const checked = selectedValues.includes(option);
            return (
              <label
                key={option}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggle(option)}
                  className="h-5 w-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  style={{ accentColor: "#2563eb" }}
                />
                <span className={checked ? "text-blue-600 font-extrabold" : ""}>
                  {checked ? "✓ " : ""}
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      )}

      <ErrorText message={error} />
    </div>
  );
}
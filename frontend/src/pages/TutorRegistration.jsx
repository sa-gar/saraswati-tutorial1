import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Car,
  UploadCloud,
  FileCheck2,
  Camera,
  Clock3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  X,
  Search,
  Loader2,
} from "lucide-react";

import { API_BASE } from "../config";

const DRAFT_KEY = "tutorRegistrationDraft";

const initialFormData = {
  name: "",
  experience: "",
  hasOccupation: "",
  occupation: "",
  organization: "",
  phone: "",
  locations: [],
  hasVehicle: "",
  vehicleNumber: "",
  idProof: null,
  expCert: null,
  otherDoc: null,
  photo: null,
  timings: [],
  agreement: false,
  gender: "",
  whatsapp: "",
  city: "",
  fullAddress: "",
  grades: [],
  boards: [],
  subjects: [],
  maxTravelDistance: "",
  qualification: "",
  attendanceAgreement: false,
};

const steps = [
  {
    number: 1,
    title: "Basic Details",
    subtitle: "Profile identity",
    icon: User,
  },
  {
    number: 2,
    title: "Teaching Areas",
    subtitle: "Location & travel",
    icon: MapPin,
  },
  {
    number: 3,
    title: "Documents",
    subtitle: "Verification & Submit",
    icon: ShieldCheck,
  },
];

const experienceOptions = [
  "0 year",
  "1 year",
  "2 year",
  "3 year",
  "4 year",
  "5 year",
  "5+ years",
  "10+ years",
  "15+ years",
  "20+ years",
  "25+ years",
  "30+ years",
];

const occupationOptions = [
  "School Teacher",
  "College Lecturer",
  "Student",
  "Freelancer",
  "Working Professional",
  "Other",
];

const genderOptions = ["Male", "Female", "Other"];
const cityOptions = ["Bangalore", "Mumbai"];
const travelDistanceOptions = ["5 km", "10 km", "15 km", "20+ km"];
const gradeOptions = [
  "Class 1-5 (Primary)",
  "Class 6-8 (Middle)",
  "Class 9-10 (Secondary)",
  "Class 11-12 (Senior Secondary)",
];
const boardOptions = ["CBSE", "ICSE", "IB", "IGCSE", "State Board"];
const subjectOptions = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Kannada",
  "Commerce",
  "Social Studies",
];

const timingGroups = {
  "Morning 5:00 AM – 9:00 AM": ["5:00 AM – 9:00 AM"],
  "Evening 4 PM – 8 PM": ["4-5 PM", "5-6 PM", "6-7 PM", "7-8 PM"],
};

const bangaloreAreaGroups = {
  "East Bangalore": [
    "Whitefield",
    "Marathahalli",
    "Brookefield",
    "Kundalahalli",
    "AECS Layout",
    "ITPL",
    "Hoodi",
    "KR Puram",
    "Mahadevapura",
    "Kadugodi",
    "Varthur",
    "Bellandur",
    "Sarjapur Road",
    "HSR Layout",
  ],
  "South-East": [
    "HSR Layout",
    "Sarjapur",
    "Electronic City",
    "Bommanahalli",
    "BTM Layout",
    "Silk Board",
  ],
  "Central Bangalore": [
    "Indiranagar",
    "Domlur",
    "MG Road",
    "Ulsoor",
    "Richmond Town",
    "Jayanagar",
    "JP Nagar",
    "Banashankari",
    "Basavanagudi",
  ],
  "North Bangalore": [
    "Hebbal",
    "RT Nagar",
    "Nagawara",
    "Hennur",
    "Jakkur",
    "Yelahanka",
  ],
  "West Bangalore": [
    "Rajajinagar",
    "Malleshwaram",
    "Yeshwanthpur",
    "Vijayanagar",
    "Basaveshwar Nagar",
  ],
  "Other Areas": [
    "Kengeri",
    "Bannerghatta Road",
    "Kanakapura Road",
    "Thanisandra",
  ],
};

const mumbaiAreaGroups = {
  "South Mumbai": [
    "Colaba",
    "Cuffe Parade",
    "Nariman Point",
    "Marine Drive",
    "Dadar",
    "Prabhadevi",
    "Worli",
    "Lower Parel",
    "Byculla",
    "Mazagaon",
  ],
  "Western Suburbs": [
    "Bandra",
    "Khar",
    "Santacruz",
    "Vile Parle",
    "Andheri",
    "Jogeshwari",
    "Goregaon",
    "Malad",
    "Kandivali",
    "Borivali",
    "Dahisar",
  ],
  "Eastern Suburbs": [
    "Kurla",
    "Ghatkopar",
    "Vikhroli",
    "Kanjurmarg",
    "Bhandup",
    "Mulund",
    "Chembur",
    "Govandi",
    "Mankhurd",
    "Powai",
  ],
  "Thane Region": [
    "Thane West",
    "Thane East",
    "Ghodbunder Road",
    "Kalwa",
    "Mumbra",
  ],
  "Navi Mumbai": [
    "Vashi",
    "Koparkhairane",
    "Ghansoli",
    "Airoli",
    "Nerul",
    "Belapur",
    "Kharghar",
    "Panvel",
    "Seawoods",
  ],
};

export default function TutorRegistration() {
  const navigate = useNavigate();

  const host = window.location.hostname;
  const defaultIsMumbai =
    host.startsWith("mumbai.") ||
    localStorage.getItem("userLocation") === "Mumbai";

  const [step, setStep] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      return saved?.step || 1;
    } catch { return 1; }
  });
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (saved?.formData) {
        // File fields (File objects) cannot be stored in localStorage
        const { photo, idProof, expCert, otherDoc, ...rest } = saved.formData;
        return {
          ...initialFormData,
          ...rest,
          city: rest.city || (defaultIsMumbai ? "Mumbai" : "Bangalore"),
          photo: null,
          idProof: null,
          expCert: null,
          otherDoc: null,
        };
      }
    } catch {}
    return { ...initialFormData, city: defaultIsMumbai ? "Mumbai" : "Bangalore" };
  });
  const [showDraftBanner, setShowDraftBanner] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      return !!(saved?.formData && saved.step > 1);
    } catch { return false; }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  const isMumbai = formData.city === "Mumbai";
  const areaGroups = isMumbai ? mumbaiAreaGroups : bangaloreAreaGroups;

  const [openGroup, setOpenGroup] = useState(defaultIsMumbai ? "Western Suburbs" : "East Bangalore");
  const [sameAsMobile, setSameAsMobile] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      return saved?.sameAsMobile !== false;
    } catch { return true; }
  });

  // Save form progress to localStorage whenever state changes
  useEffect(() => {
    try {
      const draft = {
        step,
        sameAsMobile,
        formData: {
          ...formData,
          photo: null,
          idProof: null,
          expCert: null,
          otherDoc: null,
        },
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }, [step, formData, sameAsMobile]);

  // Also save when the tab is hidden / minimised
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        try {
          const draft = {
            step,
            sameAsMobile,
            formData: {
              ...formData,
              photo: null, idProof: null, expCert: null, otherDoc: null,
            },
          };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch {}
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [step, formData, sameAsMobile]);


  // Sync WhatsApp with phone when sameAsMobile is checked
  useEffect(() => {
    if (sameAsMobile) {
      setFormData((prev) => ({
        ...prev,
        whatsapp: prev.phone,
      }));
      setErrors((prev) => ({
        ...prev,
        whatsapp: "",
      }));
    }
  }, [formData.phone, sameAsMobile]);

  useEffect(() => {
    if (!formData.photo) {
      setPreviewPhoto(null);
      return;
    }

    const url = URL.createObjectURL(formData.photo);
    setPreviewPhoto(url);

    return () => URL.revokeObjectURL(url);
  }, [formData.photo]);

  const progress = (step / 3) * 100;

  const handleMulti = (field, value) => {
    setFormData((prev) => {
      const arr = prev[field];

      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validateField = (name, value) => {
    if (name === "name") {
      if (!value || value.trim().length < 3) return "Name must be at least 3 characters";
    }

    if (name === "phone") {
      if (!value) return "Phone number is required";
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(value)) return "Enter a valid 10-digit phone number";
    }

    if (name === "experience") {
      if (!value) return "Select experience";
    }

    if (name === "gender") {
      if (!value) return "Select gender";
    }

    if (name === "whatsapp") {
      if (!value) return "WhatsApp number is required";
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(value)) return "Enter a valid 10-digit WhatsApp number";
    }

    if (name === "qualification") {
      if (!value || value.trim().length < 2) return "Enter your qualification";
    }

    if (name === "maxTravelDistance") {
      if (!value) return "Select maximum travel distance";
    }

    if (name === "city") {
      if (!value) return "Select city";
    }

    if (name === "fullAddress") {
      if (!value || value.trim().length < 10) return "Enter full address (min 10 characters)";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "city") {
      setFormData((prev) => ({
        ...prev,
        city: value,
        locations: [], // Reset selected locations when city changes
      }));
      setOpenGroup(value === "Mumbai" ? "Western Suburbs" : "East Bangalore");
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    const error = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateStep1 = () => {
    const nextErrors = {
      name: validateField("name", formData.name),
      phone: validateField("phone", formData.phone),
      gender: validateField("gender", formData.gender),
      whatsapp: sameAsMobile ? "" : validateField("whatsapp", formData.whatsapp),
    };

    const cleaned = Object.fromEntries(
      Object.entries(nextErrors).filter(([, value]) => value)
    );

    setErrors((prev) => ({
      ...prev,
      ...cleaned,
    }));

    setTouched((prev) => ({
      ...prev,
      name: true,
      phone: true,
      gender: true,
      whatsapp: true,
    }));

    if (Object.keys(cleaned).length > 0) {
      return Object.values(cleaned)[0];
    }

    return null;
  };

  const validateStep2 = () => {
    const nextErrors = {
      experience: validateField("experience", formData.experience),
      qualification: validateField("qualification", formData.qualification),
    };

    if (!formData.grades.length) nextErrors.grades = "Select at least one grade";
    if (!formData.boards.length) nextErrors.boards = "Select at least one board";
    if (!formData.subjects.length) nextErrors.subjects = "Select at least one subject";

    if (!formData.hasOccupation) {
      nextErrors.hasOccupation = "Please select if you have school/college experience";
    } else if (formData.hasOccupation === "yes" && !formData.occupation) {
      nextErrors.occupation = "Please select your occupation";
    }

    const cleaned = Object.fromEntries(
      Object.entries(nextErrors).filter(([, value]) => value)
    );

    setErrors((prev) => ({
      ...prev,
      ...cleaned,
    }));

    if (Object.keys(cleaned).length > 0) {
      return Object.values(cleaned)[0];
    }

    return null;
  };

  const validateStep3 = () => {
    const nextErrors = {
      city: validateField("city", formData.city),
      fullAddress: validateField("fullAddress", formData.fullAddress),
      maxTravelDistance: validateField("maxTravelDistance", formData.maxTravelDistance),
    };

    if (formData.hasVehicle === "yes" && !formData.vehicleNumber.trim()) {
      nextErrors.vehicleNumber = "Enter vehicle number";
    }

    if (!formData.locations.length) {
      nextErrors.locations = "Select at least one teaching location";
    }

    if (!formData.photo) return "Profile photo is required";
    if (!formData.idProof) return "ID Proof is required";
    if (!formData.expCert) return "Education Certificate is required";
    if (!formData.timings.length) return "Select at least one available timing";
    if (!formData.agreement) return "You must agree to the placement fee terms";
    if (!formData.attendanceAgreement) return "You must agree to the attendance marking guidelines";

    const cleaned = Object.fromEntries(
      Object.entries(nextErrors).filter(([, value]) => value)
    );

    setErrors((prev) => ({
      ...prev,
      ...cleaned,
    }));

    if (Object.keys(cleaned).length > 0) {
      return Object.values(cleaned)[0];
    }

    return null;
  };

  const validateForm = () => {
    const step1Error = validateStep1();
    if (step1Error) return step1Error;

    const step2Error = validateStep2();
    if (step2Error) return step2Error;

    const step3Error = validateStep3();
    if (step3Error) return step3Error;

    return null;
  };

  const uploadSingleFile = async (fieldName, file) => {
    if (!file) return {};

    const fd = new FormData();
    fd.append(fieldName, file);

    const res = await axios.post(`${API_BASE}/upload`, fd, {
      timeout: 120000,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  };

  const compressImage = async (file) => {
    if (!file) return null;

    const options = {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      initialQuality: 0.7,
    };

    try {
      return await imageCompression(file, options);
    } catch {
      return file;
    }
  };

  const convertToFile = (compressedFile, fallbackName) => {
    if (!compressedFile) return null;

    return new File([compressedFile], fallbackName, {
      type: compressedFile.type || "image/jpeg",
    });
  };

  const processUploadFile = async (file, fallbackPrefix) => {
    if (!file) return null;
    const extension = file.name.split(".").pop();
    if (file.type === "application/pdf" || extension.toLowerCase() === "pdf") {
      return new File([file], `${fallbackPrefix}.pdf`, { type: "application/pdf" });
    }
    const compressed = await compressImage(file);
    return convertToFile(compressed, `${fallbackPrefix}.jpg`);
  };

  const handleSubmit = async () => {
    if (loading) return;

    const error = validateForm();

    if (error) {
      alert(error);
      return;
    }

    try {
      setLoading(true);

      const MAX_SIZE = 8 * 1024 * 1024;

      const filesToCheck = [
        formData.photo,
        formData.idProof,
        formData.expCert,
        formData.otherDoc,
      ];

      for (const file of filesToCheck) {
        if (file && file.size > MAX_SIZE) {
          alert("Each file should be under 8MB");
          setLoading(false);
          return;
        }
      }

      const photoFile = await processUploadFile(formData.photo, "photo");
      const idFile = await processUploadFile(formData.idProof, "idproof");
      const certFile = await processUploadFile(formData.expCert, "certificate");
      const otherFile = await processUploadFile(formData.otherDoc, "otherdoc");

      const photoRes = await uploadSingleFile("photo", photoFile);
      const idRes = await uploadSingleFile("idProof", idFile);
      const certRes = await uploadSingleFile("expCert", certFile);

      let otherRes = {};

      if (otherFile) {
        otherRes = await uploadSingleFile("otherDoc", otherFile);
      }

      await axios.post(`${API_BASE}/tutors`, {
        ...formData,
        locations: formData.locations.map((loc) => `${loc}, ${isMumbai ? "Mumbai" : "Bangalore"}`),
        photo: photoRes.photo || "",
        documents: {
          idProof: idRes.idProof || "",
          expCert: certRes.expCert || "",
          otherDoc: otherRes.otherDoc || "",
        },
        status: "pending",
      });

      localStorage.removeItem(DRAFT_KEY);
      navigate("/thank-you?type=tutor");
    } catch (err) {
      console.error("FULL ERROR:", err);

      alert(
        err?.response?.data?.message ||
          err.message ||
          "Upload failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    if (step === 1) {
      const error = validateStep1();
      if (error) {
        alert(error);
        return;
      }
    }

    if (step === 2) {
      const error = validateStep2();
      if (error) {
        alert(error);
        return;
      }
    }

    if (step === 3) {
      const error = validateStep3();
      if (error) {
        alert(error);
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, 3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isStep1Ready =
    formData.name &&
    formData.phone &&
    formData.gender &&
    (sameAsMobile || formData.whatsapp) &&
    !errors.name &&
    !errors.phone &&
    !errors.gender &&
    (sameAsMobile || !errors.whatsapp);

  const isStep2Ready =
    formData.experience &&
    formData.qualification &&
    formData.grades.length > 0 &&
    formData.boards.length > 0 &&
    formData.subjects.length > 0 &&
    formData.hasOccupation &&
    (formData.hasOccupation === "no" || formData.occupation) &&
    !errors.experience &&
    !errors.qualification;

  const isStep3Ready =
    formData.city &&
    formData.fullAddress &&
    formData.maxTravelDistance &&
    formData.locations.length > 0 &&
    formData.hasVehicle &&
    (formData.hasVehicle === "no" || formData.vehicleNumber.trim()) &&
    formData.photo &&
    formData.idProof &&
    formData.expCert &&
    formData.timings.length > 0 &&
    formData.agreement &&
    formData.attendanceAgreement &&
    !errors.city &&
    !errors.fullAddress &&
    !errors.maxTravelDistance &&
    (formData.hasVehicle === "no" || !errors.vehicleNumber);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
            <p className="text-xl font-black text-slate-900">
              Submitting your profile
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Uploading documents securely. Please do not close this page.
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_30%),radial-gradient(circle_at_top_right,#e0e7ff,transparent_28%),linear-gradient(135deg,#f8fafc,#eef2ff)] px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-950 shadow-2xl">
            <div className="relative p-4 sm:p-6 text-white md:p-10">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/30 blur-3xl" />
              <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />

              <div className="relative z-10 grid gap-8 md:grid-cols-[1.3fr_0.7fr] md:items-center">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-200 ring-1 ring-white/15">
                    <Sparkles className="h-4 w-4" />
                    Tutor Partner Registration
                  </div>

                  <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                    Join Saraswati Tutorial as a verified tutor
                  </h1>

                  <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                    Build your teaching profile, select your preferred areas,
                    upload verification documents, and get reviewed by our admin
                    team.
                  </p>
                </div>

                <div className="rounded-[2rem] bg-white/10 p-5 ring-1 ring-white/15">
                  <p className="text-sm font-semibold text-slate-300">
                    Application Progress
                  </p>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="mt-4 text-4xl font-black">
                    {Math.round(progress)}%
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Step {step} of 3
                  </p>
                </div>
              </div>
            </div>
          </div>

          {showDraftBanner && (
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3.5 text-sm font-bold text-emerald-800 animate-fadeIn">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
                Draft restored — continue from where you left off.
              </span>
              <button
                type="button"
                onClick={() => setShowDraftBanner(false)}
                className="text-emerald-500 hover:text-emerald-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-3">
            {steps.map((item) => {
              const Icon = item.icon;
              const active = step === item.number;
              const done = step > item.number;

              return (
                <div
                  key={item.number}
                  className={`rounded-[1.2rem] sm:rounded-[1.5rem] border p-3 sm:p-4 transition ${
                    active
                      ? "border-slate-950 bg-slate-950 text-white shadow-xl shadow-slate-300"
                      : done
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-white bg-white/80 text-slate-600 shadow-sm"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-black">
                      {done ? "✓" : `0${item.number}`}
                    </span>
                  </div>
                  <p className="text-sm font-black md:text-base">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs opacity-70">{item.subtitle}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-[1.5rem] md:rounded-[2.5rem] border border-white/70 bg-white/85 p-4 sm:p-5 shadow-2xl shadow-slate-200 backdrop-blur-xl md:p-8">
            {step === 1 && (
              <section className="animate-fadeIn">
                <StepHeader
                  eyebrow="Step 01"
                  title="Basic Tutor Details"
                  description="Enter your personal and contact details."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    icon={User}
                    label="Name"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Name as per ID"
                    error={touched.name ? errors.name : ""}
                  />

                  <InputField
                    icon={Phone}
                    label="Phone Number"
                    required
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="10-digit mobile number"
                    error={touched.phone ? errors.phone : ""}
                  />

                  <div>
                    <InputField
                      icon={Phone}
                      label="WhatsApp Number"
                      required={!sameAsMobile}
                      name="whatsapp"
                      type="tel"
                      value={sameAsMobile ? formData.phone : formData.whatsapp}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={sameAsMobile}
                      placeholder="10-digit WhatsApp number"
                      error={touched.whatsapp ? errors.whatsapp : ""}
                      className={sameAsMobile ? "opacity-60" : ""}
                    />
                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-650">
                      <input
                        type="checkbox"
                        checked={sameAsMobile}
                        onChange={(e) => setSameAsMobile(e.target.checked)}
                        className="rounded border-slate-350 accent-slate-900"
                      />
                      Same as phone number
                    </label>
                  </div>

                  <SelectField
                    icon={User}
                    label="Gender"
                    required
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.gender ? errors.gender : ""}
                    options={genderOptions}
                    placeholder="Select Gender"
                  />
                </div>

                <NavigationFooter>
                  <div />
                  <PrimaryButton disabled={!isStep1Ready} onClick={goNext}>
                    Next <ChevronRight className="h-4 w-4" />
                  </PrimaryButton>
                </NavigationFooter>
              </section>
            )}

            {step === 2 && (
              <section className="animate-fadeIn">
                <StepHeader
                  eyebrow="Step 02"
                  title="Professional & Teaching Details"
                  description="Tell us about your qualifications, experience, and what you teach."
                />

                <div className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <SelectField
                      icon={GraduationCap}
                      label="Experience"
                      required
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.experience ? errors.experience : ""}
                      options={experienceOptions}
                      placeholder="Select Experience"
                    />

                    <InputField
                      icon={GraduationCap}
                      label="Qualification"
                      required
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. B.Ed, M.Sc in Physics, B.Tech"
                      error={touched.qualification ? errors.qualification : ""}
                    />
                  </div>

                  <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-black text-slate-700">
                        Grades Can Teach <span className="text-red-550">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {gradeOptions.map((opt) => {
                          const active = formData.grades.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleMulti("grades", opt)}
                              className={`rounded-2xl px-4 py-2.5 text-sm font-bold border transition ${
                                active
                                  ? "border-blue-300 bg-blue-50 text-blue-700"
                                  : "border-slate-200 bg-white text-slate-650 hover:bg-slate-50"
                              }`}
                            >
                              {active ? "✓ " : ""}
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {errors.grades && <p className="text-xs font-bold text-red-600">{errors.grades}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-black text-slate-700">
                        Boards Can Teach <span className="text-red-550">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {boardOptions.map((opt) => {
                          const active = formData.boards.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleMulti("boards", opt)}
                              className={`rounded-2xl px-4 py-2.5 text-sm font-bold border transition ${
                                active
                                  ? "border-blue-300 bg-blue-50 text-blue-700"
                                  : "border-slate-200 bg-white text-slate-655 hover:bg-slate-50"
                              }`}
                            >
                              {active ? "✓ " : ""}
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {errors.boards && <p className="text-xs font-bold text-red-600">{errors.boards}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-black text-slate-700">
                        Subjects <span className="text-red-550">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {subjectOptions.map((opt) => {
                          const active = formData.subjects.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleMulti("subjects", opt)}
                              className={`rounded-2xl px-4 py-2.5 text-sm font-bold border transition ${
                                active
                                  ? "border-blue-300 bg-blue-50 text-blue-700"
                                  : "border-slate-200 bg-white text-slate-655 hover:bg-slate-50"
                              }`}
                            >
                              {active ? "✓ " : ""}
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {errors.subjects && <p className="text-xs font-bold text-red-650">{errors.subjects}</p>}
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
                    <p className="mb-3 text-sm font-black text-slate-800">
                      Have you worked or are you working in any school, college,
                      or institute?
                    </p>

                    <SegmentedButtons
                      value={formData.hasOccupation}
                      options={[
                        { label: "Yes", value: "yes" },
                        { label: "No", value: "no" },
                      ]}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          hasOccupation: value,
                          occupation: value === "no" ? "" : prev.occupation,
                          organization: value === "no" ? "" : prev.organization,
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          hasOccupation: "",
                          occupation: "",
                        }));
                      }}
                    />

                    {errors.hasOccupation && (
                      <p className="mt-2 text-sm font-bold text-red-600">
                        {errors.hasOccupation}
                      </p>
                    )}

                    {formData.hasOccupation === "yes" && (
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <SelectField
                          icon={Briefcase}
                          label="Occupation"
                          required
                          name="occupation"
                          value={formData.occupation}
                          onChange={handleChange}
                          error={errors.occupation}
                          options={occupationOptions}
                          placeholder="Select occupation"
                        />

                        <InputField
                          icon={Briefcase}
                          label="Organization / Company Name"
                          name="organization"
                          value={formData.organization || ""}
                          onChange={handleChange}
                          placeholder="School, college, institute, or company"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <NavigationFooter>
                  <SecondaryButton onClick={goBack}>
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </SecondaryButton>
                  <PrimaryButton disabled={!isStep2Ready} onClick={goNext}>
                    Next <ChevronRight className="h-4 w-4" />
                  </PrimaryButton>
                </NavigationFooter>
              </section>
            )}

            {step === 3 && (
              <section className="animate-fadeIn">
                <StepHeader
                  eyebrow="Step 03"
                  title="Address, Availability & Verification"
                  description="Provide your address, travel preference, select timings, and upload documents."
                />

                <div className="space-y-6">
                  {/* Address Section */}
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                    <h3 className="text-xl font-black text-slate-900">Address Details</h3>
                    <div className="grid gap-5 md:grid-cols-2">
                      <SelectField
                        icon={MapPin}
                        label="City"
                        required
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.city ? errors.city : ""}
                        options={cityOptions}
                        placeholder="Select City"
                      />

                      <SelectField
                        icon={MapPin}
                        label="Maximum Travel Distance"
                        required
                        name="maxTravelDistance"
                        value={formData.maxTravelDistance}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.maxTravelDistance ? errors.maxTravelDistance : ""}
                        options={travelDistanceOptions}
                        placeholder="Select Max Travel Distance"
                      />
                    </div>

                    <InputField
                      icon={MapPin}
                      label="Full Address (with Area & PIN Code)"
                      required
                      name="fullAddress"
                      type="textarea"
                      value={formData.fullAddress}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter complete house/flat number, building name, street, area/locality, and 6-digit PIN code"
                      error={touched.fullAddress ? errors.fullAddress : ""}
                    />
                  </div>

                  {/* Teaching Locations Picker */}
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <h3 className="text-xl font-black text-slate-900">
                          Select Locations Where You Can Teach
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Choose all preferred areas. Parents will see your preferred locations.
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">
                        {formData.locations.length} selected
                      </span>
                    </div>

                    {formData.locations.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {formData.locations.map((loc) => (
                          <span
                            key={loc}
                            className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 ring-1 ring-blue-100"
                          >
                            {loc}
                            <button
                              type="button"
                              onClick={() => handleMulti("locations", loc)}
                              className="rounded-full text-blue-500 hover:text-red-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="relative mb-5">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search location..."
                        className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm outline-none transition focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-100"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>

                    <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
                      {Object.entries(areaGroups).map(([group, locations]) => {
                        const filtered = locations.filter((area) =>
                          area.toLowerCase().includes(search.toLowerCase())
                        );

                        if (filtered.length === 0) return null;

                        return (
                          <div
                            key={group}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenGroup(openGroup === group ? null : group)
                              }
                              className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left"
                            >
                              <span className="font-black text-slate-800">
                                {group}
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-slate-500 shadow-sm">
                                {openGroup === group ? "−" : "+"}
                              </span>
                            </button>

                            {openGroup === group && (
                              <div className="grid gap-2 p-4 sm:grid-cols-2 md:grid-cols-3">
                                {filtered.map((area) => {
                                  const active = formData.locations.includes(area);

                                  return (
                                    <button
                                      type="button"
                                      key={area}
                                      onClick={() => handleMulti("locations", area)}
                                      className={`rounded-2xl border px-3 py-3 text-left text-sm font-bold transition ${
                                        active
                                          ? "border-blue-300 bg-blue-50 text-blue-700"
                                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                      }`}
                                    >
                                      {active ? "✓ " : ""}
                                      {area}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {Object.values(areaGroups)
                        .flat()
                        .filter((area) =>
                          area.toLowerCase().includes(search.toLowerCase())
                        ).length === 0 && (
                        <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm font-semibold text-slate-500">
                          No locations found
                        </p>
                      )}
                    </div>

                    {errors.locations && (
                      <p className="mt-3 text-sm font-bold text-red-600">
                        {errors.locations}
                      </p>
                    )}
                  </div>

                  {/* Vehicle Availability */}
                  <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Car className="h-5 w-5 text-slate-700" />
                      <p className="font-black text-slate-800">
                        Vehicle Available?
                      </p>
                    </div>

                    <SegmentedButtons
                      value={formData.hasVehicle}
                      options={[
                        { label: "Yes", value: "yes" },
                        { label: "No", value: "no" },
                      ]}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          hasVehicle: value,
                          vehicleNumber: value === "no" ? "" : prev.vehicleNumber,
                        }))
                      }
                    />

                    {errors.hasVehicle && (
                      <p className="mt-2 text-sm font-bold text-red-650">
                        {errors.hasVehicle}
                      </p>
                    )}

                    {formData.hasVehicle === "yes" && (
                      <div className="mt-4">
                        <InputField
                          icon={Car}
                          label="Vehicle Number"
                          name="vehicleNumber"
                          value={formData.vehicleNumber}
                          onChange={handleChange}
                          placeholder="Example: KA 01 AB 1234"
                          error={errors.vehicleNumber}
                        />
                      </div>
                    )}
                  </div>

                  {/* Document Upload Section */}
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                    <h3 className="text-xl font-black text-slate-900">Upload Verification Documents</h3>
                    <div className="grid gap-5 md:grid-cols-2">
                      <FileUploadCard
                        icon={Camera}
                        title="Profile Photo"
                        subtitle="Visible to parents"
                        required
                        inputId="photo"
                        file={formData.photo}
                        accept="image/*"
                        preview={previewPhoto}
                        onChange={(file) => setFormData((prev) => ({ ...prev, photo: file }))}
                      />

                      <FileUploadCard
                        icon={FileCheck2}
                        title="ID Proof"
                        subtitle="Aadhaar, PAN, Passport, or other valid ID"
                        required
                        inputId="idProof"
                        file={formData.idProof}
                        accept="image/*,.pdf"
                        onChange={(file) => setFormData((prev) => ({ ...prev, idProof: file }))}
                      />

                      <FileUploadCard
                        icon={GraduationCap}
                        title="Education Certificate"
                        subtitle="Degree, marksheet, or qualification proof"
                        required
                        inputId="expCert"
                        file={formData.expCert}
                        accept="image/*,.pdf"
                        onChange={(file) => setFormData((prev) => ({ ...prev, expCert: file }))}
                      />

                      <FileUploadCard
                        icon={UploadCloud}
                        title="Experience / Appraisal Document"
                        subtitle="Optional supporting document"
                        inputId="otherDoc"
                        file={formData.otherDoc}
                        accept="image/*,.pdf"
                        onChange={(file) => setFormData((prev) => ({ ...prev, otherDoc: file }))}
                      />
                    </div>
                  </div>

                  {/* Available Timings Section */}
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-black text-slate-900">
                          Select Available Timings
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Choose slots where you are generally available for teaching.
                        </p>
                      </div>
                      <Clock3 className="h-6 w-6 text-slate-500" />
                    </div>

                    <div className="space-y-5">
                      {Object.entries(timingGroups).map(([group, timings]) => (
                        <div key={group}>
                          <p className="mb-3 text-sm font-black text-slate-700">
                            {group}
                          </p>

                          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {timings.map((time) => {
                              const active = formData.timings.includes(time);

                              return (
                                <button
                                  type="button"
                                  key={time}
                                  onClick={() => handleMulti("timings", time)}
                                  className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                                    active
                                      ? "border-blue-300 bg-blue-50 text-blue-700"
                                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                                  }`}
                                >
                                  {active ? "✓ " : ""}
                                  {time}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {formData.timings.length > 0 && (
                      <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                        Selected: {formData.timings.join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Fee Agreement */}
                  <div
                    className={`rounded-[2rem] border p-5 transition ${
                      formData.agreement
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.agreement}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            agreement: e.target.checked,
                          }))
                        }
                        className="mt-1 h-5 w-5 accent-emerald-600"
                      />

                      <div className="text-sm leading-7 text-slate-700">
                        I agree to pay a{" "}
                        <span className="font-black text-slate-950">
                          32% Placement, Facilitation & Verification Fee
                        </span>{" "}
                        for the{" "}
                        <span className="font-bold italic">
                          first two months
                        </span>{" "}
                        for each opportunity facilitated by{" "}
                        <span className="font-black">Saraswati Tutorials</span>.
                      </div>
                    </label>

                    {!formData.agreement && (
                      <p className="mt-2 text-xs font-bold text-red-650">
                        You must agree before submitting.
                      </p>
                    )}
                  </div>

                  {/* Attendance Agreement */}
                  <div
                    className={`rounded-[2rem] border p-5 transition mt-4 ${
                      formData.attendanceAgreement
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.attendanceAgreement}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            attendanceAgreement: e.target.checked,
                          }))
                        }
                        className="mt-1 h-5 w-5 accent-emerald-600"
                      />

                      <div className="text-sm leading-7 text-slate-700">
                        I agree to update my attendance after every class using the credentials provided by Saraswati Tutorials. Classes not marked in the portal will not be considered completed and may not be included for payment processing.{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowInstructionsModal(true);
                          }}
                          className="text-xs text-blue-600 font-extrabold underline hover:text-blue-800 ml-1 cursor-pointer bg-slate-100/80 px-2 py-0.5 rounded-md hover:bg-slate-200 transition-all"
                        >
                          Preview
                        </button>
                      </div>
                    </label>

                    {!formData.attendanceAgreement && (
                      <p className="mt-2 text-xs font-bold text-red-650">
                        You must agree before submitting.
                      </p>
                    )}
                  </div>
                </div>

                <NavigationFooter>
                  <SecondaryButton onClick={goBack}>
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </SecondaryButton>
                  <PrimaryButton disabled={!isStep3Ready || loading} onClick={handleSubmit}>
                    {loading ? "Submitting..." : "Confirm & Submit"}
                    <CheckCircle2 className="h-4 w-4" />
                  </PrimaryButton>
                </NavigationFooter>
              </section>
            )}

            {showInstructionsModal && (
              <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] z-55">
                  {/* Modal Header */}
                  <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50 text-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-wider">Attendance Update Guidelines</h3>
                    <button 
                      type="button"
                      onClick={() => setShowInstructionsModal(false)}
                      className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/5 text-slate-500 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto flex flex-col items-center justify-center">
                    <img 
                      src="/attendance_instructions.png" 
                      alt="Attendance Guidelines Infographic" 
                      className="w-full h-auto rounded-2xl shadow-sm border border-slate-200 object-contain max-h-[60vh]"
                    />
                    <p className="text-xs font-semibold text-slate-500 mt-4 text-center">
                      Follow these steps to submit your daily class logs and topics on the portal.
                    </p>
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowInstructionsModal(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black transition cursor-pointer"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.28s ease both;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.99);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}

function StepHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-7">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-blue-600">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function InputField({
  icon: Icon,
  label,
  required,
  error,
  className = "",
  type = "text",
  ...props
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`flex items-start gap-3 rounded-3xl border bg-white px-4 py-3 transition focus-within:ring-4 ${
          type === "textarea" ? "min-h-28" : "h-14 items-center"
        } ${
          error
            ? "border-red-400 focus-within:ring-red-100"
            : "border-slate-200 focus-within:border-slate-950 focus-within:ring-slate-100"
        }`}
      >
        {Icon && <Icon className={`h-5 w-5 text-slate-400 ${type === "textarea" ? "mt-1" : ""}`} />}
        {type === "textarea" ? (
          <textarea
            {...props}
            rows={3}
            className="h-full w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 resize-none"
          />
        ) : (
          <input
            {...props}
            type={type}
            className="h-full w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
          />
        )}
      </div>

      {error && <p className="mt-2 text-xs font-bold text-red-650">{error}</p>}
    </div>
  );
}

function SelectField({
  icon: Icon,
  label,
  required,
  options,
  placeholder,
  error,
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`flex h-14 items-center gap-3 rounded-3xl border bg-white px-4 transition focus-within:ring-4 ${
          error
            ? "border-red-400 focus-within:ring-red-100"
            : "border-slate-200 focus-within:border-slate-950 focus-within:ring-slate-100"
        }`}
      >
        {Icon && <Icon className="h-5 w-5 text-slate-400" />}
        <select
          {...props}
          className="h-full w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
        >
          <option value="">{placeholder || "Select"}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}

function SegmentedButtons({ value, options, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
            value === option.value
              ? "bg-slate-950 text-white shadow-lg shadow-slate-300"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function FileUploadCard({
  icon: Icon,
  title,
  subtitle,
  required,
  inputId,
  file,
  preview,
  accept,
  onChange,
}) {
  const uploaded = Boolean(file);

  return (
    <div
      className={`rounded-[2rem] border p-5 transition ${
        uploaded
          ? "border-emerald-200 bg-emerald-50"
          : required
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <input
        type="file"
        className="hidden"
        id={inputId}
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />

      <label htmlFor={inputId} className="block cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                uploaded ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-600"
              }`}
            >
              <Icon className="h-6 w-6" />
            </div>

            <div>
              <p className="font-black text-slate-900">
                {title} {required && <span className="text-red-500">*</span>}
              </p>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>

          {uploaded ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          ) : (
            <UploadCloud className="h-6 w-6 text-slate-400" />
          )}
        </div>

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-4 h-28 w-28 rounded-2xl object-cover ring-1 ring-slate-200"
          />
        )}

        <div className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold">
          {uploaded ? (
            <span className="text-emerald-700">✓ {file.name}</span>
          ) : required ? (
            <span className="text-red-600">Required - click to upload</span>
          ) : (
            <span className="text-slate-500">Optional - click to upload</span>
          )}
        </div>
      </label>
    </div>
  );
}

function ReviewCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <p className="text-sm leading-6">
      <span className="font-black text-slate-800">{label}: </span>
      <span className="text-slate-600">{value || "Not provided"}</span>
    </p>
  );
}

function NavigationFooter({ children }) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}

function PrimaryButton({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-sm font-black text-white shadow-xl transition ${
        disabled
          ? "cursor-not-allowed bg-slate-400 shadow-none"
          : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700"
      }`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
    >
      {children}
    </button>
  );
}
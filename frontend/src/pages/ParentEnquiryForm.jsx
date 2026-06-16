import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://saraswati-tutorial1-2.onrender.com/api";

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

  wards: [{ ...initialWard }],
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

export default function ParentEnquiryForm() {
  const navigate = useNavigate();

  const host = window.location.hostname;
  const isMumbai =
    host.startsWith("mumbai.") ||
    localStorage.getItem("userLocation") === "Mumbai";

  const schoolOptions = isMumbai ? mumbaiSchoolOptions : bangaloreSchoolOptions;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [openNotes, setOpenNotes] = useState({});

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

    if (currentStep === 1 || currentStep === 4) {
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

    if (currentStep === 2 || currentStep === 4) {
      if (!form.preferredMode.trim()) {
        newErrors.preferredMode = "Preferred Mode is required";
      }

      if (!form.preferredGender.trim()) {
        newErrors.preferredGender = "Preferred Gender is required";
      }

      if (!form.startTime.trim()) {
        newErrors.startTime = "Start Time is required";
      }

      if (!form.endTime.trim()) {
        newErrors.endTime = "End Time is required";
      }

      if (form.startTime && form.endTime) {
        const [startH, startM] = form.startTime.split(":").map(Number);
        const [endH, endM] = form.endTime.split(":").map(Number);
        const diff = (endH * 60 + endM) - (startH * 60 + startM);
        if (diff <= 0) {
          newErrors.endTime = "End Time must be after Start Time";
        }
      }

      if (!form.classDuration.trim()) {
        newErrors.classDuration = "Class Duration is required";
      }

      if (!Array.isArray(form.preferredDays) || form.preferredDays.length === 0) {
        newErrors.preferredDays = "Preferred Days is required";
      }
    }

    if (currentStep === 3 || currentStep === 4) {
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

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) {
      setMessage("Please fill all required fields before continuing.");
      return;
    }

    setMessage("");
    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setMessage("");
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = () => {
    const formattedStart = formatTime12Hr(form.startTime);
    const formattedEnd = formatTime12Hr(form.endTime);
    return {
      ...form,
      preferredTime: `${formattedStart} - ${formattedEnd}`,
      address: `${form.address}, ${isMumbai ? "Mumbai" : "Bangalore"}`,
      wards: form.wards.map((ward) => ({
        studentName: ward.studentName,
        schoolName: ward.schoolName,
        classGrade: ward.classGrade,
        curriculum: ward.curriculum,
        subjectsNeeded: ward.subjectsNeeded,
        specialNeeds: ward.specialNeeds,
      })),
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
      `}</style>

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 overflow-hidden rounded-[2.5rem] bg-slate-950 shadow-2xl shadow-slate-300">
          <div className="relative p-6 text-white md:p-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-500/30 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl" />

            <div className="relative z-10 grid gap-8 md:grid-cols-[1.4fr_0.6fr] md:items-center">
              <div>
                <div className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-200 ring-1 ring-white/15">
                  Premium Parent Enquiry
                </div>

                <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                  Find the perfect tutor for your child
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                  Share student details, tuition preferences, and parent information.
                  Our team will match you with the right tutor.
                </p>
              </div>

              <div className="rounded-[2rem] bg-white/10 p-5 ring-1 ring-white/15">
                <p className="text-sm font-semibold text-slate-300">Progress</p>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>

                <p className="mt-3 text-3xl font-black">
                  Step {step}
                  <span className="text-base font-semibold text-slate-400">
                    {" "}
                    / {totalSteps}
                  </span>
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {step === 1 && "Student details"}
                  {step === 2 && "Tutor preferences"}
                  {step === 3 && "Parent details"}
                  {step === 4 && "Review details"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-4 gap-3">
          <StepBox
            number="01"
            active={step === 1}
            done={step > 1}
            title="Student"
            subtitle="Academic details"
          />
          <StepBox
            number="02"
            active={step === 2}
            done={step > 2}
            title="Preference"
            subtitle="Mode & timing"
          />
          <StepBox
            number="03"
            active={step === 3}
            done={step > 3}
            title="Parent"
            subtitle="Contact details"
          />
          <StepBox
            number="04"
            active={step === 4}
            done={false}
            title="Review"
            subtitle="Verify details"
          />
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="glass-card rounded-[2.5rem] border border-white/70 p-5 shadow-2xl shadow-slate-200 md:p-8"
        >
          {step === 1 && (
            <section className="animate-slideFade">
              <SectionTitle
                eyebrow="Step 01"
                title="Student Details"
                description="Add one or more students and their academic requirements."
              />

              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm font-medium text-slate-500">
                  Mandatory fields are marked with{" "}
                  <span className="font-bold text-red-500">*</span>
                </p>

                <button
                  type="button"
                  onClick={addWard}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-black"
                >
                  + Add Another Student
                </button>
              </div>

              <div className="space-y-6">
                {form.wards.map((ward, index) => (
                  <div
                    key={index}
                    className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-xl md:p-6"
                  >
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black text-slate-900">
                          Student {index + 1}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Fill academic details in the required order.
                        </p>
                      </div>

                      {form.wards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWard(index)}
                          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <Input
                        label={requiredLabel("Student Name")}
                        name="studentName"
                        value={ward.studentName}
                        onChange={(e) => handleWardChange(index, e)}
                        error={errors[`wards.${index}.studentName`]}
                        placeholder="Enter student name"
                      />

                      <SelectBox
                        label={requiredLabel("Class")}
                        name="classGrade"
                        value={ward.classGrade}
                        onChange={(e) => handleWardChange(index, e)}
                        options={classOptions}
                        placeholder="Select class"
                        error={errors[`wards.${index}.classGrade`]}
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
                          />
                        </div>
                      )}

                      <SearchableInput
                        label={requiredLabel("School Name")}
                        name="schoolName"
                        value={ward.schoolName}
                        onChange={(e) => handleWardChange(index, e)}
                        options={schoolOptions}
                        listId={`schools-${index}`}
                        placeholder="Search or select school"
                        error={errors[`wards.${index}.schoolName`]}
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
                      />

                      <div className="md:col-span-2 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => toggleNotes(index)}
                          className="flex w-full items-center justify-between px-5 py-4 text-left"
                        >
                          <div>
                            <p className="text-sm font-black text-slate-800">
                              Special Learning Needs / Notes
                              <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600">
                                Optional
                              </span>
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Add learning goals, concerns, or additional notes.
                            </p>
                          </div>

                          <span
                            className={`rounded-full bg-white px-3 py-2 text-sm shadow-sm transition ${openNotes[index] ? "rotate-180" : ""
                              }`}
                          >
                            ▼
                          </span>
                        </button>

                        {openNotes[index] && (
                          <div className="animate-slideFade border-t border-slate-200 bg-white p-5">
                            <TextArea
                              label="Special Learning Needs / Notes"
                              name="specialNeeds"
                              value={ward.specialNeeds}
                              onChange={(e) => handleWardChange(index, e)}
                              placeholder="Mention learning needs, goals, concerns, or notes for the tutor."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="animate-slideFade">
              <SectionTitle
                eyebrow="Step 02"
                title="Tutor Preferences"
                description="Choose how, when, and for how long the student should study."
              />

              <div className="grid gap-5 md:grid-cols-2">
                <SelectBox
                  label={requiredLabel("Preferred Mode")}
                  name="preferredMode"
                  value={form.preferredMode}
                  onChange={handleChange}
                  options={preferredModeOptions}
                  placeholder="Select mode"
                  error={errors.preferredMode}
                />

                <SelectBox
                  label={requiredLabel("Preferred Gender in Tutor Selection")}
                  name="preferredGender"
                  value={form.preferredGender}
                  onChange={handleChange}
                  options={["Male", "Female", "No Preference"]}
                  placeholder="Select preference"
                  error={errors.preferredGender}
                />

                <Input
                  label={requiredLabel("Start Time")}
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  error={errors.startTime}
                />

                <Input
                  label={requiredLabel("End Time")}
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  error={errors.endTime}
                />

                <Input
                  label="Class Duration"
                  type="text"
                  name="classDuration"
                  value={form.classDuration ? `${form.classDuration}` : "Automatically calculated"}
                  readOnly
                  disabled
                  className="h-14 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 text-sm outline-none cursor-not-allowed text-slate-500 font-bold"
                  error={errors.classDuration}
                />

                <MultiSelectDropdown
                  label={requiredLabel("Preferred Days")}
                  options={dayOptions}
                  selectedValues={form.preferredDays}
                  onChange={(newValues) => {
                    setForm((prev) => ({
                      ...prev,
                      preferredDays: newValues,
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      preferredDays: "",
                    }));
                  }}
                  placeholder="Select days"
                  error={errors.preferredDays}
                />
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="animate-slideFade">
              <SectionTitle
                eyebrow="Step 03"
                title="Parent Details"
                description="Share contact details so our team can reach out with the best tutor match."
              />

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label={requiredLabel("Parent / Guardian Name")}
                  name="parentName"
                  value={form.parentName}
                  onChange={handleChange}
                  error={errors.parentName}
                  placeholder="Enter parent name"
                />

                <Input
                  label={requiredLabel("Phone Number")}
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="Enter phone number"
                />

                <Input
                  label={requiredLabel("Parent Email Address")}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="example@email.com"
                />

                <Input
                  label={requiredLabel("Address")}
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  error={errors.address}
                  placeholder="House/Flat No, Street, Area, City, State, Pincode"
                />
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="animate-slideFade space-y-8">
              <SectionTitle
                eyebrow="Step 04"
                title="Review Details"
                description="Double-check the details below before submitting your enquiry."
              />

              <div className="space-y-6">
                {/* 1. Student Details */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-black text-slate-900">1. Student Details</h3>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 transition hover:bg-slate-200 cursor-pointer"
                    >
                      Edit Section
                    </button>
                  </div>

                  <div className="space-y-6">
                    {form.wards.map((ward, idx) => (
                      <div key={idx} className={idx > 0 ? "border-t border-slate-100 pt-4" : ""}>
                        <h4 className="text-sm font-black text-slate-800 mb-2">Student {idx + 1}</h4>
                        <div className="grid gap-4 sm:grid-cols-2 text-sm">
                          <div>
                            <span className="font-semibold text-slate-500">Student Name:</span>
                            <span className="ml-2 font-bold text-slate-800">{ward.studentName}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500">Class:</span>
                            <span className="ml-2 font-bold text-slate-800">{ward.classGrade}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500">Curriculum:</span>
                            <span className="ml-2 font-bold text-slate-800">{ward.curriculum || "Not selected"}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500">School Name:</span>
                            <span className="ml-2 font-bold text-slate-800">{ward.schoolName}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="font-semibold text-slate-500">Subjects Needed:</span>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {ward.subjectsNeeded.map((sub) => (
                                <span key={sub} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                          {ward.specialNeeds && (
                            <div className="sm:col-span-2">
                              <span className="font-semibold text-slate-500">Special Needs / Notes:</span>
                              <p className="mt-1 text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">{ward.specialNeeds}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Tutor Preferences */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-black text-slate-900">2. Tutor Preferences</h3>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 transition hover:bg-slate-200 cursor-pointer"
                    >
                      Edit Section
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="font-semibold text-slate-500">Preferred Mode:</span>
                      <span className="ml-2 font-bold text-slate-800">{form.preferredMode}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Preferred Gender:</span>
                      <span className="ml-2 font-bold text-slate-800">{form.preferredGender}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Timing:</span>
                      <span className="ml-2 font-bold text-slate-800">
                        {formatTime12Hr(form.startTime)} to {formatTime12Hr(form.endTime)}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Class Duration:</span>
                      <span className="ml-2 font-bold text-slate-800">{form.classDuration}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-semibold text-slate-500">Preferred Days:</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {form.preferredDays.map((day) => (
                          <span key={day} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Parent Details */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-black text-slate-900">3. Parent Details</h3>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 transition hover:bg-slate-200 cursor-pointer"
                    >
                      Edit Section
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="font-semibold text-slate-500">Parent / Guardian Name:</span>
                      <span className="ml-2 font-bold text-slate-800">{form.parentName}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Phone Number:</span>
                      <span className="ml-2 font-bold text-slate-800">{form.phone}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Email Address:</span>
                      <span className="ml-2 font-bold text-slate-800">{form.email}</span>
                    </div>


                    <div className="sm:col-span-2">
                      <span className="font-semibold text-slate-500">Complete Address:</span>
                      <p className="mt-1 text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">{form.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {message && (
            <div
              className={`mt-6 rounded-2xl px-5 py-4 text-sm font-bold ${message.toLowerCase().includes("success")
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
                }`}
            >
              {message}
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                ← Previous
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="rounded-2xl bg-gradient-to-r from-slate-950 to-slate-800 px-8 py-4 text-sm font-black text-white shadow-xl shadow-slate-300 transition hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 px-8 py-4 text-sm font-black text-white shadow-xl shadow-blue-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Enquiry"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function StepBox({ number, active, done, title, subtitle }) {
  return (
    <div
      className={`rounded-[1.5rem] border p-4 transition md:p-5 ${active
        ? "border-slate-950 bg-slate-950 text-white shadow-xl shadow-slate-300"
        : done
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-white bg-white/80 text-slate-600 shadow-sm"
        }`}
    >
      <p className="text-xs font-black opacity-70">{done ? "✓" : number}</p>
      <p className="mt-2 text-sm font-black md:text-base">{title}</p>
      <p className="mt-1 hidden text-xs opacity-70 md:block">{subtitle}</p>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="mb-7">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-blue-600">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function DynamicPanel({ children }) {
  return (
    <div className="md:col-span-2 animate-slideFade grid gap-5 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm md:grid-cols-2">
      {children}
    </div>
  );
}

function ErrorText({ message }) {
  if (!message) return null;

  return <p className="mt-2 text-xs font-bold text-red-600">{message}</p>;
}

function Input({ label, error, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        {...props}
        className={`h-14 w-full rounded-3xl border bg-white px-5 text-sm outline-none transition focus:ring-4 ${error
          ? "border-red-400 focus:ring-red-100"
          : "border-slate-200 focus:border-slate-950 focus:ring-slate-100"
          }`}
      />

      <ErrorText message={error} />
    </div>
  );
}

function TextArea({ label, error, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <textarea
        {...props}
        className={`min-h-[120px] w-full rounded-3xl border bg-white px-5 py-4 text-sm outline-none transition focus:ring-4 ${error
          ? "border-red-400 focus:ring-red-100"
          : "border-slate-200 focus:border-slate-950 focus:ring-slate-100"
          }`}
      />

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
  ...props
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        list={listId}
        name={name}
        value={value}
        onChange={onChange}
        className={`h-14 w-full rounded-3xl border bg-white px-5 text-sm outline-none transition focus:ring-4 ${error
          ? "border-red-400 focus:ring-red-100"
          : "border-slate-200 focus:border-slate-950 focus:ring-slate-100"
          }`}
        {...props}
      />

      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>

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
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`h-14 w-full rounded-3xl border bg-white px-5 text-sm outline-none transition focus:ring-4 ${error
          ? "border-red-400 focus:ring-red-100"
          : "border-slate-200 focus:border-slate-950 focus:ring-slate-100"
          }`}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ErrorText message={error} />
    </div>
  );
}

function MultiSelectDropdown({ label, options, selectedValues = [], onChange, placeholder = "Select days", error }) {
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

  const displayText = selectedValues.length > 0
    ? selectedValues.map((v) => v.slice(0, 3)).join(", ")
    : placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`h-14 w-full rounded-3xl border bg-white px-5 text-left text-sm font-semibold outline-none transition flex items-center justify-between focus:ring-4 ${error
            ? "border-red-400 focus:ring-red-100"
            : "border-slate-200 focus:border-slate-950 focus:ring-slate-100"
          }`}
      >
        <span className={selectedValues.length > 0 ? "text-slate-900" : "text-slate-400"}>
          {displayText}
        </span>
        <span className="text-xs text-slate-400">▼</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-30 mt-1 max-h-60 overflow-y-auto rounded-3xl bg-white p-3 shadow-2xl ring-1 ring-slate-200 animate-slideFade">
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
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      )}

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
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      <div
        onClick={() => setOpen(!open)}
        className={`min-h-14 w-full rounded-3xl border bg-white px-4 py-2.5 text-left text-sm font-semibold outline-none transition flex flex-wrap items-center justify-between gap-1.5 cursor-pointer focus-within:ring-4 ${error
            ? "border-red-400 focus-within:ring-red-100"
            : "border-slate-200 focus-within:border-slate-950 focus-within:ring-slate-100"
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

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-3xl bg-white p-3 shadow-2xl ring-1 ring-slate-200 animate-slideFade">
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
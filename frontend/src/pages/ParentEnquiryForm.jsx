import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";
// const API_BASE = "http://localhost:5000/api";

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

  occupation: "",
  businessName: "",
  businessIndustryType: "",
  businessRoleDesignation: "",

  companyName: "",
  jobTitle: "",
  workingIndustry: "",

  schoolInstituteName: "",
  schoolPosition: "",
  subjectsDepartment: "",

  homemakerNotes: "",

  professionType: "",
  workDomain: "",
  experience: "",

  otherOccupation: "",

  area: "",
  pincode: "",

  preferredGender: "",
  preferredMode: "",
  preferredDays: [],
  preferredTime: "",
  classDuration: "",

  wards: [{ ...initialWard }],
};

const classDurationOptions = ["1 hr", "1.5 hr", "2 hr"];

const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const occupationOptions = [
  "Business Owner",
  "Working Professional",
  "Teacher / School Owner",
  "Homemaker",
  "Freelancer",
  "Government Employee",
  "Doctor",
  "Engineer",
  "Self-Employed",
  "Other",
];

const classOptions = [
  "Pre-Nursery",
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "PUC 1",
  "PUC 2",
  "BBA",
  "B.com",
  "Engineering & Technology (BE/BTech)",
  "Diploma",
  "BCA & MCA",
  "Competitive Exams",
  "Science (BSc)",
  "Arts & Humanities (BA)",
  "B.Pharma",
  "Commerce & Management",
  "BA LLB (Hons)",
  "BArch",
  "Coding / Programming",
  "Spoken Language / Soft Skills",
];

const curriculumOptions = [
  "IB",
  "IGCSE",
  "ICSE",
  "NIOS",
  "CBSE",
  "ISC",
  "Level A1 & A2",
  "PUC",
];

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

  const totalSteps = 3;

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

  const clearOccupationFields = () => ({
    businessName: "",
    businessIndustryType: "",
    businessRoleDesignation: "",
    companyName: "",
    jobTitle: "",
    workingIndustry: "",
    schoolInstituteName: "",
    schoolPosition: "",
    subjectsDepartment: "",
    homemakerNotes: "",
    professionType: "",
    workDomain: "",
    experience: "",
    otherOccupation: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      if (name === "occupation") {
        return {
          ...prev,
          ...clearOccupationFields(),
          occupation: value,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleDayToggle = (day) => {
    setForm((prev) => {
      const exists = prev.preferredDays.includes(day);

      return {
        ...prev,
        preferredDays: exists
          ? prev.preferredDays.filter((d) => d !== day)
          : [...prev.preferredDays, day],
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

      updatedWards[index] = {
        ...updatedWards[index],
        [name]: value,
      };

      return {
        ...prev,
        wards: updatedWards,
      };
    });

    setErrors((prev) => ({
      ...prev,
      [`wards.${index}.${name}`]: "",
    }));
  };

  const handleSubjectsChange = (wardIndex, e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);

    setForm((prev) => {
      const updated = [...prev.wards];

      updated[wardIndex] = {
        ...updated[wardIndex],
        subjectsNeeded: selected,
      };

      return {
        ...prev,
        wards: updated,
      };
    });

    setErrors((prev) => ({
      ...prev,
      [`wards.${wardIndex}.subjectsNeeded`]: "",
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

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      form.wards.forEach((ward, index) => {
        if (!ward.studentName.trim()) {
          newErrors[`wards.${index}.studentName`] = "Student Name is required";
        }

        if (!ward.classGrade.trim()) {
          newErrors[`wards.${index}.classGrade`] = "Class is required";
        }

        if (!ward.curriculum.trim()) {
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

    if (step === 2) {
      if (!form.preferredMode.trim()) {
        newErrors.preferredMode = "Preferred Mode is required";
      }

      if (!form.preferredGender.trim()) {
        newErrors.preferredGender = "Preferred Gender is required";
      }

      if (!form.preferredTime.trim()) {
        newErrors.preferredTime = "Preferred Time is required";
      }

      if (!form.classDuration.trim()) {
        newErrors.classDuration = "Class Duration is required";
      }

      if (!Array.isArray(form.preferredDays) || form.preferredDays.length === 0) {
        newErrors.preferredDays = "Preferred Days is required";
      }
    }

    if (step === 3) {
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

      if (!form.occupation.trim()) {
        newErrors.occupation = "Occupation is required";
      }

      if (form.occupation === "Business Owner" && !form.businessName.trim()) {
        newErrors.businessName = "Business Name is required";
      }

      if (form.occupation === "Working Professional") {
        if (!form.companyName.trim()) {
          newErrors.companyName = "Company Name is required";
        }

        if (!form.jobTitle.trim()) {
          newErrors.jobTitle = "Job Title / Position is required";
        }
      }

      if (form.occupation === "Teacher / School Owner") {
        if (!form.schoolInstituteName.trim()) {
          newErrors.schoolInstituteName = "School / Institute Name is required";
        }

        if (!form.schoolPosition.trim()) {
          newErrors.schoolPosition = "Position is required";
        }
      }

      if (form.occupation === "Freelancer" || form.occupation === "Self-Employed") {
        if (!form.professionType.trim()) {
          newErrors.professionType = "Profession Type is required";
        }
      }

      if (form.occupation === "Other" && !form.otherOccupation.trim()) {
        newErrors.otherOccupation = "Please Specify is required";
      }

      if (!form.area.trim()) {
        newErrors.area = "Area / Locality is required";
      }

      if (!form.pincode.trim()) {
        newErrors.pincode = "Pincode is required";
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
    return {
      ...form,
      area: `${form.area}, ${isMumbai ? "Mumbai" : "Bangalore"}`,
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
    e.preventDefault();

    if (!validateStep()) {
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

  const renderOccupationFields = () => {
    if (form.occupation === "Business Owner") {
      return (
        <DynamicPanel>
          <Input
            label={requiredLabel("Business Name")}
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            error={errors.businessName}
            placeholder="Enter business name"
          />

          <Input
            label="Industry Type"
            name="businessIndustryType"
            value={form.businessIndustryType}
            onChange={handleChange}
            placeholder="Education, Retail, Services"
          />

          <Input
            label="Role / Designation"
            name="businessRoleDesignation"
            value={form.businessRoleDesignation}
            onChange={handleChange}
            placeholder="Founder, Director, Partner"
          />
        </DynamicPanel>
      );
    }

    if (form.occupation === "Working Professional") {
      return (
        <DynamicPanel>
          <Input
            label={requiredLabel("Company Name")}
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            error={errors.companyName}
            placeholder="Enter company name"
          />

          <Input
            label={requiredLabel("Job Title / Position")}
            name="jobTitle"
            value={form.jobTitle}
            onChange={handleChange}
            error={errors.jobTitle}
            placeholder="Manager, Developer, Analyst"
          />

          <Input
            label="Industry"
            name="workingIndustry"
            value={form.workingIndustry}
            onChange={handleChange}
            placeholder="IT, Finance, Healthcare"
          />
        </DynamicPanel>
      );
    }

    if (form.occupation === "Teacher / School Owner") {
      return (
        <DynamicPanel>
          <Input
            label={requiredLabel("School / Institute Name")}
            name="schoolInstituteName"
            value={form.schoolInstituteName}
            onChange={handleChange}
            error={errors.schoolInstituteName}
            placeholder="Enter school or institute name"
          />

          <Input
            label={requiredLabel("Position")}
            name="schoolPosition"
            value={form.schoolPosition}
            onChange={handleChange}
            error={errors.schoolPosition}
            placeholder="Teacher, Principal, Owner"
          />

          <Input
            label="Subjects / Department"
            name="subjectsDepartment"
            value={form.subjectsDepartment}
            onChange={handleChange}
            placeholder="Mathematics, Science, Admin"
          />
        </DynamicPanel>
      );
    }

    if (form.occupation === "Homemaker") {
      return (
        <div className="md:col-span-2 animate-slideFade rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm">
          <TextArea
            label="Additional Notes"
            name="homemakerNotes"
            value={form.homemakerNotes}
            onChange={handleChange}
            placeholder="Optional notes"
          />
        </div>
      );
    }

    if (form.occupation === "Freelancer" || form.occupation === "Self-Employed") {
      return (
        <DynamicPanel>
          <Input
            label={requiredLabel("Profession Type")}
            name="professionType"
            value={form.professionType}
            onChange={handleChange}
            error={errors.professionType}
            placeholder="Designer, Consultant, Developer"
          />

          <Input
            label="Work Domain"
            name="workDomain"
            value={form.workDomain}
            onChange={handleChange}
            placeholder="Design, Consulting, Technology"
          />

          <Input
            label="Experience"
            name="experience"
            value={form.experience}
            onChange={handleChange}
            placeholder="5 years"
          />
        </DynamicPanel>
      );
    }

    if (form.occupation === "Other") {
      return (
        <div className="md:col-span-2 animate-slideFade rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm">
          <Input
            label={requiredLabel("Please Specify")}
            name="otherOccupation"
            value={form.otherOccupation}
            onChange={handleChange}
            error={errors.otherOccupation}
            placeholder="Enter occupation"
          />
        </div>
      );
    }

    return null;
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
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-3">
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
            done={false}
            title="Parent"
            subtitle="Contact details"
          />
        </div>

        <form
          onSubmit={handleSubmit}
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

                      <SearchableInput
                        label={requiredLabel("Class")}
                        name="classGrade"
                        value={ward.classGrade}
                        onChange={(e) => handleWardChange(index, e)}
                        options={classOptions}
                        listId={`classes-${index}`}
                        placeholder="Search or select class"
                        error={errors[`wards.${index}.classGrade`]}
                      />

                      <SelectBox
                        label={requiredLabel("Curriculum")}
                        name="curriculum"
                        value={ward.curriculum}
                        onChange={(e) => handleWardChange(index, e)}
                        options={curriculumOptions}
                        placeholder="Select curriculum"
                        error={errors[`wards.${index}.curriculum`]}
                      />

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                          {requiredLabel("Subjects Required")}
                        </label>

                        <select
                          multiple
                          value={ward.subjectsNeeded}
                          onChange={(e) => handleSubjectsChange(index, e)}
                          className={`min-h-[150px] w-full rounded-3xl border bg-slate-50 px-4 py-4 text-sm outline-none transition focus:bg-white focus:ring-4 ${
                            errors[`wards.${index}.subjectsNeeded`]
                              ? "border-red-400 focus:ring-red-100"
                              : "border-slate-200 focus:border-slate-950 focus:ring-slate-100"
                          }`}
                        >
                          {subjectOptions.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <p className="text-xs text-slate-500">
                            Hold Ctrl on Windows or Cmd on Mac to select multiple.
                          </p>

                          {ward.subjectsNeeded.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {ward.subjectsNeeded.map((subject) => (
                                <span
                                  key={subject}
                                  className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
                                >
                                  {subject}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <ErrorText message={errors[`wards.${index}.subjectsNeeded`]} />
                      </div>

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
                            className={`rounded-full bg-white px-3 py-2 text-sm shadow-sm transition ${
                              openNotes[index] ? "rotate-180" : ""
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
                  label={requiredLabel("Preferred Time")}
                  type="time"
                  name="preferredTime"
                  value={form.preferredTime}
                  onChange={handleChange}
                  error={errors.preferredTime}
                />

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    {requiredLabel("Class Duration")}
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {classDurationOptions.map((duration) => (
                      <button
                        type="button"
                        key={duration}
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            classDuration: duration,
                          }));

                          setErrors((prev) => ({
                            ...prev,
                            classDuration: "",
                          }));
                        }}
                        className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                          form.classDuration === duration
                            ? "bg-slate-950 text-white shadow-lg shadow-slate-300"
                            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {duration}
                      </button>
                    ))}
                  </div>

                  <ErrorText message={errors.classDuration} />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-bold text-slate-700">
                    {requiredLabel("Preferred Days")}
                  </label>

                  <div className="flex flex-wrap gap-3">
                    {dayOptions.map((day) => {
                      const active = form.preferredDays.includes(day);

                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => handleDayToggle(day)}
                          className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
                            active
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  <ErrorText message={errors.preferredDays} />
                </div>
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

                <SelectBox
                  label={requiredLabel("Select Occupation")}
                  name="occupation"
                  value={form.occupation}
                  onChange={handleChange}
                  options={occupationOptions}
                  placeholder="Select occupation"
                  error={errors.occupation}
                />

                {renderOccupationFields()}

                <Input
                  label={requiredLabel("Area / Locality")}
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  error={errors.area}
                  placeholder="Enter area or locality"
                />

                <Input
                  label={requiredLabel("Pincode")}
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  error={errors.pincode}
                  placeholder="Enter pincode"
                />
              </div>
            </section>
          )}

          {message && (
            <div
              className={`mt-6 rounded-2xl px-5 py-4 text-sm font-bold ${
                message.toLowerCase().includes("success")
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
                type="submit"
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
      className={`rounded-[1.5rem] border p-4 transition md:p-5 ${
        active
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
        className={`h-14 w-full rounded-3xl border bg-white px-5 text-sm outline-none transition focus:ring-4 ${
          error
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
        className={`min-h-[120px] w-full rounded-3xl border bg-white px-5 py-4 text-sm outline-none transition focus:ring-4 ${
          error
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
        className={`h-14 w-full rounded-3xl border bg-white px-5 text-sm outline-none transition focus:ring-4 ${
          error
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
        className={`h-14 w-full rounded-3xl border bg-white px-5 text-sm outline-none transition focus:ring-4 ${
          error
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
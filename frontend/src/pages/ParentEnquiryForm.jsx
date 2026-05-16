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

const schoolOptions = [
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

const preferredModeOptions = [
  "Online / One-to-One Tuition",
  "Home Tuition / In-Person",
];

export default function ParentEnquiryForm() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [openNotes, setOpenNotes] = useState({});

  const requiredLabel = (label) => (
    <>
      {label} <span className="text-red-600">*</span>
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

    const updatedWards = form.wards.filter((_, i) => i !== index);

    setForm((prev) => ({
      ...prev,
      wards: updatedWards,
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
          newErrors[`wards.${index}.subjectsNeeded`] = "Subjects Required is required";
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

      if (
        form.occupation === "Freelancer" ||
        form.occupation === "Self-Employed"
      ) {
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

      wards: form.wards.map((ward) => ({
        studentName: ward.studentName,
        classGrade: ward.classGrade,
        curriculum: ward.curriculum,
        subjectsNeeded: ward.subjectsNeeded,
        schoolName: ward.schoolName,
        specialNeeds: ward.specialNeeds,
      })),

      odooMeta: {
        source: "parent_enquiry_form",
        integrationStatus: "ready_for_odoo_sync",
        notes:
          "Ensure backend Odoo endpoint, authentication/session handling, payload mapping, logs, and error handling are working properly.",
      },
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

          /*
            If Odoo/backend authentication token is required,
            add it here.

            Example:
            Authorization: `Bearer ${token}`,
          */
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("Parent enquiry / Odoo sync failed:", {
          status: res.status,
          statusText: res.statusText,
          data,
        });

        throw new Error(data?.message || "Submission failed");
      }

      setForm(initialForm);
      setErrors({});
      navigate("/thank-you");
    } catch (error) {
      console.error("Submission error:", error);
      setMessage(error.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderOccupationFields = () => {
    if (form.occupation === "Business Owner") {
      return (
        <div className="md:col-span-2 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 animate-fadeIn">
          <Input
            label={requiredLabel("Business Name")}
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            error={errors.businessName}
          />

          <Input
            label="Industry Type"
            name="businessIndustryType"
            value={form.businessIndustryType}
            onChange={handleChange}
            placeholder="Example: Education, Retail, Services"
          />

          <Input
            label="Role / Designation"
            name="businessRoleDesignation"
            value={form.businessRoleDesignation}
            onChange={handleChange}
            placeholder="Example: Founder, Director, Partner"
          />
        </div>
      );
    }

    if (form.occupation === "Working Professional") {
      return (
        <div className="md:col-span-2 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 animate-fadeIn">
          <Input
            label={requiredLabel("Company Name")}
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            error={errors.companyName}
          />

          <Input
            label={requiredLabel("Job Title / Position")}
            name="jobTitle"
            value={form.jobTitle}
            onChange={handleChange}
            error={errors.jobTitle}
          />

          <Input
            label="Industry"
            name="workingIndustry"
            value={form.workingIndustry}
            onChange={handleChange}
            placeholder="Example: IT, Finance, Marketing"
          />
        </div>
      );
    }

    if (form.occupation === "Teacher / School Owner") {
      return (
        <div className="md:col-span-2 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 animate-fadeIn">
          <Input
            label={requiredLabel("School / Institute Name")}
            name="schoolInstituteName"
            value={form.schoolInstituteName}
            onChange={handleChange}
            error={errors.schoolInstituteName}
          />

          <Input
            label={requiredLabel("Position")}
            name="schoolPosition"
            value={form.schoolPosition}
            onChange={handleChange}
            error={errors.schoolPosition}
          />

          <Input
            label="Subjects / Department"
            name="subjectsDepartment"
            value={form.subjectsDepartment}
            onChange={handleChange}
            placeholder="Example: Maths, Science, Administration"
          />
        </div>
      );
    }

    if (form.occupation === "Homemaker") {
      return (
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 animate-fadeIn">
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

    if (
      form.occupation === "Freelancer" ||
      form.occupation === "Self-Employed"
    ) {
      return (
        <div className="md:col-span-2 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 animate-fadeIn">
          <Input
            label={requiredLabel("Profession Type")}
            name="professionType"
            value={form.professionType}
            onChange={handleChange}
            error={errors.professionType}
            placeholder="Example: Designer, Consultant, Developer"
          />

          <Input
            label="Work Domain"
            name="workDomain"
            value={form.workDomain}
            onChange={handleChange}
            placeholder="Example: Design, Consulting, Technology"
          />

          <Input
            label="Experience"
            name="experience"
            value={form.experience}
            onChange={handleChange}
            placeholder="Example: 5 years"
          />
        </div>
      );
    }

    if (form.occupation === "Other") {
      return (
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 animate-fadeIn">
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
    <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Parent Enquiry Form
        </h1>
        <p className="mt-2 text-slate-600">
          Complete the enquiry in 3 simple steps.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <StepBox active={step === 1} done={step > 1} title="Student Details" />
        <StepBox active={step === 2} done={step > 2} title="Tutor Preference" />
        <StepBox active={step === 3} done={false} title="Parent Details" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {step === 1 && (
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Student Details
              </h2>

              <button
                type="button"
                onClick={addWard}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
              >
                + Add Another Student
              </button>
            </div>

            <div className="space-y-6">
              {form.wards.map((ward, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Student {index + 1}
                    </h3>

                    {form.wards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWard(index)}
                        className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label={requiredLabel("Student Name")}
                      name="studentName"
                      value={ward.studentName}
                      onChange={(e) => handleWardChange(index, e)}
                      error={errors[`wards.${index}.studentName`]}
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

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {requiredLabel("Curriculum")}
                      </label>

                      <select
                        name="curriculum"
                        value={ward.curriculum}
                        onChange={(e) => handleWardChange(index, e)}
                        className={`h-12 w-full rounded-2xl border px-4 outline-none ${
                          errors[`wards.${index}.curriculum`]
                            ? "border-red-400"
                            : "border-slate-200"
                        }`}
                      >
                        <option value="">Select Curriculum</option>
                        {curriculumOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>

                      <ErrorText message={errors[`wards.${index}.curriculum`]} />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {requiredLabel("Subjects Required")}
                      </label>

                      <select
                        multiple
                        value={ward.subjectsNeeded}
                        onChange={(e) => handleSubjectsChange(index, e)}
                        className={`w-full rounded-2xl border px-4 py-3 outline-none ${
                          errors[`wards.${index}.subjectsNeeded`]
                            ? "border-red-400"
                            : "border-slate-200"
                        }`}
                      >
                        {subjectOptions.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>

                      <p className="mt-2 text-xs text-slate-500">
                        Hold Ctrl on Windows or Cmd on Mac to select multiple.
                      </p>

                      {ward.subjectsNeeded.length > 0 && (
                        <p className="mt-2 text-sm text-slate-600">
                          Selected: {ward.subjectsNeeded.join(", ")}
                        </p>
                      )}

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

                    <div className="md:col-span-2 rounded-2xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => toggleNotes(index)}
                        className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700"
                      >
                        <span>
                          Special Learning Needs / Notes{" "}
                          <span className="text-xs font-medium text-slate-500">
                            Optional
                          </span>
                        </span>

                        <span
                          className={`transition-transform ${
                            openNotes[index] ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </button>

                      {openNotes[index] && (
                        <div className="p-4 animate-fadeIn">
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
          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Tutor Preference
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label={requiredLabel("Preferred Mode")}
                name="preferredMode"
                value={form.preferredMode}
                onChange={handleChange}
                options={preferredModeOptions}
                error={errors.preferredMode}
              />

              <Select
                label={requiredLabel("Preferred Gender in Tutor Selection")}
                name="preferredGender"
                value={form.preferredGender}
                onChange={handleChange}
                options={["Male", "Female", "No Preference"]}
                error={errors.preferredGender}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {requiredLabel("Preferred Time")}
                </label>

                <input
                  type="time"
                  name="preferredTime"
                  value={form.preferredTime}
                  onChange={handleChange}
                  className={`h-12 w-full rounded-2xl border px-4 outline-none ${
                    errors.preferredTime ? "border-red-400" : "border-slate-200"
                  }`}
                />

                <ErrorText message={errors.preferredTime} />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Class Duration
              </label>

              <div className="flex flex-wrap gap-2">
                {classDurationOptions.map((duration) => (
                  <button
                    type="button"
                    key={duration}
                    onClick={() =>
                      setForm({
                        ...form,
                        classDuration: duration,
                      })
                    }
                    className={`rounded-full px-4 py-2 text-sm ${
                      form.classDuration === duration
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {requiredLabel("Preferred Days")}
              </label>

              <div className="flex flex-wrap gap-2">
                {dayOptions.map((day) => {
                  const active = form.preferredDays.includes(day);

                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleDayToggle(day)}
                      className={`rounded-full px-4 py-2 text-sm ${
                        active
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <ErrorText message={errors.preferredDays} />
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Parent Details
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={requiredLabel("Parent / Guardian Name")}
                name="parentName"
                value={form.parentName}
                onChange={handleChange}
                error={errors.parentName}
              />

              <Input
                label={requiredLabel("Phone Number")}
                name="phone"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
              />

              <Input
                label={requiredLabel("Parent Email Address")}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="example@email.com"
              />

              <Select
                label={requiredLabel("Select Occupation")}
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                options={occupationOptions}
                error={errors.occupation}
              />

              {renderOccupationFields()}

              <Input
                label={requiredLabel("Area / Locality")}
                name="area"
                value={form.area}
                onChange={handleChange}
                error={errors.area}
              />

              <Input
                label={requiredLabel("Pincode")}
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                error={errors.pincode}
              />
            </div>
          </section>
        )}

        {message ? (
          <p
            className={`text-sm ${
              message.includes("successfully")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        ) : null}

        <div className="flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="rounded-2xl border border-slate-300 px-6 py-3"
            >
              Previous
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="rounded-2xl bg-slate-900 px-6 py-3 text-white"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-slate-900 px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Enquiry"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function StepBox({ active, done, title }) {
  return (
    <div
      className={`rounded-2xl border p-4 text-center text-sm font-medium ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : done
          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      {title}
    </div>
  );
}

function ErrorText({ message }) {
  if (!message) return null;

  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

function Input({ label, error, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        {...props}
        className={`h-12 w-full rounded-2xl border px-4 outline-none ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      />

      <ErrorText message={error} />
    </div>
  );
}

function TextArea({ label, error, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <textarea
        {...props}
        className={`min-h-[110px] w-full rounded-2xl border px-4 py-3 outline-none ${
          error ? "border-red-400" : "border-slate-200"
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
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        list={listId}
        name={name}
        value={value}
        onChange={onChange}
        className={`h-12 w-full rounded-2xl border px-4 outline-none ${
          error ? "border-red-400" : "border-slate-200"
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

function Select({ label, options = [], error, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        {...props}
        className={`h-12 w-full rounded-2xl border px-4 outline-none ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      >
        <option value="">Select</option>

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
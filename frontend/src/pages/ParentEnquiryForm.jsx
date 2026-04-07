import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

const initialWard = {
  wardName: "",
  schoolName: "",
  classGrade: "",
  subjectsNeeded: [],
  specialNeeds: "",
};

const initialForm = {
  parentName: "",
  phone: "",
  email: "",
  occupation: "",
  occupationType: "",
  area: "",
  pincode: "",
  preferredGender: "",
  preferredMode: "",
  preferredDays: [],
  preferredTime: "",
  wards: [{ ...initialWard }],
};

const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const occupationOptions = [
  "Working Professional",
  "Business",
  "Freelancer",
  "Student",
  "Homemaker",
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
const occupationTypeOptions = [
  "Entrepreneur",
  "Self Employed",
  "Salaried",
  "Student",
  "Homemaker",
  "Other",
];

export default function ParentEnquiryForm() {
  const navigate = useNavigate();
const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
  };

  const handleWardChange = (index, e) => {
    const { name, value } = e.target;
    const updatedWards = [...form.wards];
    updatedWards[index][name] = value;
    setForm((prev) => ({ ...prev, wards: updatedWards }));
  };
const handleSubjectsChange = (wardIndex, e) => {
  const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);

  setForm((prev) => {
    const updated = [...prev.wards];
    updated[wardIndex].subjectsNeeded = selected;
    return { ...prev, wards: updated };
  });
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
    setForm((prev) => ({ ...prev, wards: updatedWards }));
  };

  const validateStep = () => {
    if (step === 1) {
     return form.wards.every(
  (w) =>
    w.wardName &&
    w.classGrade &&
    Array.isArray(w.subjectsNeeded) &&
    w.subjectsNeeded.length > 0
);
    }

    if (step === 2) {
      return form.preferredMode && form.preferredGender && form.preferredTime;
    }

    if (step === 3) {
      return form.parentName && form.phone && form.occupation && form.area && form.pincode;
    }

    return true;
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

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setMessage("");

  try {
    const payload = {
      ...form,
      wards: form.wards.map((ward) => ({
  wardName: ward.wardName,
  schoolName: ward.schoolName,
  classGrade: ward.classGrade,
  subjectsNeeded: ward.subjectsNeeded,
  specialNeeds: ward.specialNeeds,
})),
    };

    const res = await fetch(`${API_BASE}/parent-enquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Submission failed");
    }

    setForm(initialForm);
    navigate("/thank-you");
  } catch (error) {
    setMessage(error.message || "Something went wrong.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Parent Enquiry Form</h1>
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
              <h2 className="text-xl font-semibold text-slate-900">Student Details</h2>
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
    label="Ward Name"
    name="wardName"
    value={ward.wardName}
    onChange={(e) => handleWardChange(index, e)}
    required
  />

  <SearchableInput
    label="School Name"
    name="schoolName"
    value={ward.schoolName}
    onChange={(e) => handleWardChange(index, e)}
    options={schoolOptions}
    listId={`schools-${index}`}
    placeholder="Search or select school"
  />

  <SearchableInput
    label="Class"
    name="classGrade"
    value={ward.classGrade}
    onChange={(e) => handleWardChange(index, e)}
    options={classOptions}
    listId={`classes-${index}`}
    placeholder="Search or select class"
    required
  />

  <div className="md:col-span-2">
  <label className="mb-2 block text-sm font-medium text-slate-700">
    Subjects Required (Select multiple)
  </label>

  <select
    multiple
    value={ward.subjectsNeeded}
    onChange={(e) => handleSubjectsChange(index, e)}
    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
  >
    {subjectOptions.map((subject) => (
      <option key={subject} value={subject}>
        {subject}
      </option>
    ))}
  </select>

  <p className="mt-2 text-xs text-slate-500">
    Hold Ctrl (Windows) or Cmd (Mac) to select multiple
  </p>

  {ward.subjectsNeeded.length > 0 && (
    <p className="mt-2 text-sm text-slate-600">
      Selected: {ward.subjectsNeeded.join(", ")}
    </p>
  )}
</div>

  <div className="md:col-span-2">
    <TextArea
      label="Special Learning Needs / Notes"
      name="specialNeeds"
      value={ward.specialNeeds}
      onChange={(e) => handleWardChange(index, e)}
    />
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
                label="Preferred Mode"
                name="preferredMode"
                value={form.preferredMode}
                onChange={handleChange}
                options={["Online", "Offline", "Home Tuition", "Any"]}
                required
              />

              <Select
                label="Preferred Gender in Tutor Selection"
                name="preferredGender"
                value={form.preferredGender}
                onChange={handleChange}
                options={["Male", "Female", "No Preference"]}
                required
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Preferred Time
                </label>
                <input
                  type="time"
                  name="preferredTime"
                  value={form.preferredTime}
                  onChange={handleChange}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Preferred Days
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
                label="Parent / Guardian Name"
                name="parentName"
                value={form.parentName}
                onChange={handleChange}
                required
              />

              <Input
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />

              <Select
                label="Occupation"
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                options={occupationOptions}
                required
              />

              {form.occupation && (
                <Select
                  label="Occupation Type"
                  name="occupationType"
                  value={form.occupationType}
                  onChange={handleChange}
                  options={occupationTypeOptions}
                />
              )}

              <Input
                label="Area / Locality"
                name="area"
                value={form.area}
                onChange={handleChange}
                required
              />

              <Input
                label="PIN Code"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </section>
        )}

        {message ? (
          <p className={`text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
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
              className="rounded-2xl bg-slate-900 px-6 py-3 text-white"
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

function Input({ label, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        {...props}
        className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
      />
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        {...props}
        className="min-h-[110px] w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
      />
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
        className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
        {...props}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </div>
  );
}

function Select({ label, options = [], ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        {...props}
        className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
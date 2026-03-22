import React, { useState } from "react";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

const initialWard = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  schoolName: "",
  classGrade: "",
  board: "",
  subjectsNeeded: "",
  currentPerformance: "",
  specialNeeds: "",
};

const initialForm = {
  parentName: "",
  relationshipToWard: "",
  phone: "",
  alternatePhone: "",
  email: "",
  occupation: "",
  addressLine1: "",
  addressLine2: "",
  area: "",
  city: "",
  pincode: "",
  preferredMode: "",
  tuitionType: "",
  preferredDays: [],
  preferredTime: "",
  monthlyBudget: "",
  howDidYouHear: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  remarks: "",
  wards: [{ ...initialWard }],
};

const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ParentEnquiryForm() {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const payload = {
        ...form,
        wards: form.wards.map((ward) => ({
          fullName: ward.fullName,
          gender: ward.gender,
          dateOfBirth: ward.dateOfBirth,
          schoolName: ward.schoolName,
          classGrade: ward.classGrade,
          board: ward.board,
          subjectsNeeded: ward.subjectsNeeded,
          currentPerformance: ward.currentPerformance,
          specialNeeds: ward.specialNeeds,
        })),
      };

      console.log("Submitting parent enquiry:", payload);

      const res = await fetch(`${API_BASE}/parent-enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Parent enquiry response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Submission failed");
      }

      setMessage("Parent enquiry submitted successfully.");
      setForm(initialForm);
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
          Please share your details and your ward’s academic requirements.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Parent Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Parent / Guardian Name"
              name="parentName"
              value={form.parentName}
              onChange={handleChange}
              required
            />
            <Input
              label="Relationship to Ward"
              name="relationshipToWard"
              value={form.relationshipToWard}
              onChange={handleChange}
              placeholder="Mother / Father / Guardian"
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
              label="Alternate Phone"
              name="alternatePhone"
              value={form.alternatePhone}
              onChange={handleChange}
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Occupation"
              name="occupation"
              value={form.occupation}
              onChange={handleChange}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Address Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Address Line 1"
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              required
            />
            <Input
              label="Address Line 2"
              name="addressLine2"
              value={form.addressLine2}
              onChange={handleChange}
            />
            <Input
              label="Area / Locality"
              name="area"
              value={form.area}
              onChange={handleChange}
              required
            />
            <Input
              label="City"
              name="city"
              value={form.city}
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

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-900">Ward Details</h2>
            <button
              type="button"
              onClick={addWard}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
            >
              + Add Another Ward
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
                    Ward {index + 1}
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
                    label="Full Name"
                    name="fullName"
                    value={ward.fullName}
                    onChange={(e) => handleWardChange(index, e)}
                    required
                  />
                  <Select
                    label="Gender"
                    name="gender"
                    value={ward.gender}
                    onChange={(e) => handleWardChange(index, e)}
                    options={["Male", "Female", "Other"]}
                  />
                  <Input
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={ward.dateOfBirth}
                    onChange={(e) => handleWardChange(index, e)}
                  />
                  <Input
                    label="School / College Name"
                    name="schoolName"
                    value={ward.schoolName}
                    onChange={(e) => handleWardChange(index, e)}
                  />
                  <Input
                    label="Class / Grade"
                    name="classGrade"
                    value={ward.classGrade}
                    onChange={(e) => handleWardChange(index, e)}
                    required
                  />
                  <Input
                    label="Board / Curriculum"
                    name="board"
                    value={ward.board}
                    onChange={(e) => handleWardChange(index, e)}
                  />
                  <div className="md:col-span-2">
                    <TextArea
                      label="Subjects Required"
                      name="subjectsNeeded"
                      value={ward.subjectsNeeded}
                      onChange={(e) => handleWardChange(index, e)}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <TextArea
                      label="Current Performance / Academic Concerns"
                      name="currentPerformance"
                      value={ward.currentPerformance}
                      onChange={(e) => handleWardChange(index, e)}
                    />
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

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Tuition Preferences</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Preferred Mode"
              name="preferredMode"
              value={form.preferredMode}
              onChange={handleChange}
              options={["Online", "Offline", "Home Tuition", "Any"]}
            />
            <Select
              label="Tuition Type"
              name="tuitionType"
              value={form.tuitionType}
              onChange={handleChange}
              options={["One-to-One", "Group Class", "Either"]}
            />
            <Input
              label="Preferred Time Slot"
              name="preferredTime"
              value={form.preferredTime}
              onChange={handleChange}
              placeholder="5 PM - 7 PM"
            />
            <Input
              label="Monthly Budget"
              name="monthlyBudget"
              value={form.monthlyBudget}
              onChange={handleChange}
              placeholder="₹3000 - ₹5000"
            />
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

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Emergency & Additional Info</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Emergency Contact Name"
              name="emergencyContactName"
              value={form.emergencyContactName}
              onChange={handleChange}
            />
            <Input
              label="Emergency Contact Phone"
              name="emergencyContactPhone"
              value={form.emergencyContactPhone}
              onChange={handleChange}
            />
            <Input
              label="How did you hear about us?"
              name="howDidYouHear"
              value={form.howDidYouHear}
              onChange={handleChange}
            />
          </div>

          <div className="mt-4">
            <TextArea
              label="Additional Remarks"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
            />
          </div>
        </section>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-slate-900 px-6 py-3 text-white"
          >
            {submitting ? "Submitting..." : "Submit Enquiry"}
          </button>

          {message ? <p className="text-sm text-slate-700">{message}</p> : null}
        </div>
      </form>
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
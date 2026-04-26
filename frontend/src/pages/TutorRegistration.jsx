import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

// const API_BASE = "http://localhost:5000/api";

export default function TutorRegistration() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        experience: "",
        hasOccupation: "",
        occupation: "",
        email: "",
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
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
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
    };
    const validateForm = () => {



        if (!formData.agreement) {
            return "You must agree to the terms";
        }

        // Location
        if (!formData.locations || formData.locations.length === 0) {
            return "Select at least one location";
        }
        if (!formData.idProof) {
            return "ID Proof is required";
        }
        if (!formData.expCert) {
            return "Education Certificate is required";
        }
        if (!formData.photo) {
            return "Profile photo is required";
        }

        return null;
    };

    const validateStep1 = () => {
        if (!formData.name || formData.name.trim().length < 3) {
            return "Name must be at least 3 characters";
        }

        if (!formData.email) {
            return "Email is required";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return "Enter valid email";
        }

        if (!formData.experience || formData.experience === "Select Experience") {
            return "Select experience";
        }

        return null;
    };

    const validateStep2 = () => {
        if (!formData.locations.length) {
            return "Select at least one location";
        }

        if (formData.hasVehicle === "yes" && !formData.vehicleNumber) {
            return "Enter vehicle number";
        }

        return null;
    };
    const validateField = (name, value) => {
        if (name === "name") {
            if (!value || value.trim().length < 3) return "Invalid name";
        }
        if (name === "phone") {
            if (!value) return "Phone number required";
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(value)) return "Invalid phone number";
        }
        if (name === "email") {
            if (!value) return "Email required";
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return "Invalid email";
        }

        if (name === "experience") {
            if (!value || value === "Select Experience") return "Select experience";
        }

        return "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({ ...formData, [name]: value });

        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;

        setTouched((prev) => ({ ...prev, [name]: true }));

        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };
    const getInputClass = (field) => {
        if (!touched[field]) return "border-gray-300";

        return errors[field]
            ? "border-red-500 focus:ring-red-500"
            : "border-green-500 focus:ring-green-500";
    };

    const handleSubmit = async () => {
        const error = validateForm();


        if (error) {
            alert(error);
            return;
        }


        try {
            setLoading(true);
            const fd = new FormData();


            //  STEP 1: append files
            if (formData.idProof) fd.append("idProof", formData.idProof);
            if (formData.expCert) fd.append("expCert", formData.expCert);
            if (formData.otherDoc) fd.append("otherDoc", formData.otherDoc);
            if (formData.photo) fd.append("photo", formData.photo);

            //  STEP 1: upload to cloudinary
            const uploadRes = await axios.post(`${API_BASE}/upload`, fd);


            await axios.post(`${API_BASE}/tutors`, {
                ...formData,
                photo: uploadRes.data.photo || "",


                documents: {
                    idProof: uploadRes.data.idProof || "",
                    expCert: uploadRes.data.expCert || "",
                    otherDoc: uploadRes.data.otherDoc || "",
                },


                status: "pending",
            });

            navigate("/thank-you");


        } catch (err) {
            console.error(err);
            alert("Upload failed");
        }
        finally {
            setLoading(false); //
        }
    };

    const areas = [
        "Indiranagar",
        "Whitefield",
        "BTM Layout",
        "Electronic City",
        "Marathahalli",
        "Hebbal",
        "Yelahanka",
        "Jayanagar",
        "JP Nagar",
        "Bannerghatta Road",
        "Koramangala",
        "HSR Layout",
        "Sarjapur Road",
        "Bellandur",
        "KR Puram",
        "Rajajinagar",
        "Malleshwaram",
        "Basavanagudi",
        "Banashankari",
        "Kengeri"
    ];


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <div className="w-full max-w-3xl bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-200">


                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center text-slate-900">
                    Tutor Registration
                </h2>


                <p className="text-center text-slate-500 mb-6">
                    Join our platform and start teaching students
                </p>


                {/*  Step Indicator */}
                <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex-1 flex items-center">
                            <div className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-medium
        ${step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                                {s}
                            </div>
                            {s !== 3 && (
                                <div className={`flex-1 h-1 mx-2 ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />
                            )}
                        </div>
                    ))}
                </div>


                {step === 1 && (
                    <>
                        {/* NAME */}
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Name (as per ID)"
                                className={`w-full border p-3 rounded-lg 
        ${getInputClass("name")} 
        focus:outline-none transition`}
                            />
                            {touched.name && errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="phone"
                                type="tel"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full border p-3 rounded-lg 
        ${getInputClass("phone")} 
        focus:outline-none transition`}
                            />
                            {touched.phone && errors.phone && (
                                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                            )}
                        </div>

                        {/* EMAIL */}
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Email ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="email"
                                type="email"
                                placeholder="Email ID"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full border p-3 rounded-lg 
        ${getInputClass("email")} 
        focus:outline-none transition`}
                            />
                            {touched.email && errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* EXPERIENCE */}
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Experience  <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full border p-3 rounded-lg 
        ${getInputClass("experience")} 
        focus:outline-none transition`}
                            >
                                <option>Select Experience</option>
                                <option>0 year</option>
                                <option>1 year</option>
                                <option>2 year</option>
                                <option>3 year</option>
                                <option>4 year</option>
                                <option>5 year</option>
                                <option>5+ years</option>
                                <option>10+ years</option>
                                <option>15+ years</option>
                                <option>20+ years</option>
                                <option>25+ years</option>
                                <option>30+ years</option>
                            </select>
                            {touched.experience && errors.experience && (
                                <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
                            )}
                        </div>

                        {/* NEXT BUTTON */}
                        <div className="flex justify-end mt-6">
                            <button
                                disabled={
                                    errors.name ||
                                    errors.email ||
                                    errors.experience ||
                                    !formData.name ||
                                    !formData.email ||
                                    !formData.experience ||
                                    formData.experience === "Select Experience"
                                }
                                className={`px-6 py-3 rounded-xl shadow transition text-white
        ${errors.name ||
                                        errors.email ||
                                        errors.experience ||
                                        !formData.name ||
                                        !formData.email ||
                                        !formData.experience ||
                                        formData.experience === "Select Experience"
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    }`}
                                onClick={() => {
                                    const error = validateStep1();
                                    if (error) {
                                        alert(error);
                                        return;
                                    }
                                    setStep(2);
                                }}
                            >
                                Next →
                            </button>
                        </div>
                    </>
                )}


                {step === 2 && (
                    <>
                        {/* OCCUPATION */}
                        <p className="mb-2 text-sm font-medium">
                            Have you worked or are you working in any school, college, or institute?    </p>

                        <div className="flex gap-2 mb-4">
                            {["yes", "no"].map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    className={`px-4 py-2 rounded-lg transition ${formData.hasOccupation === val
                                        ? "bg-blue-600 text-white shadow"
                                        : "bg-gray-200 hover:bg-gray-300"
                                        }`}
                                    onClick={() =>
                                        setFormData({ ...formData, hasOccupation: val })
                                    }
                                >
                                    {val === "yes" ? "Yes" : "No"}
                                </button>
                            ))}
                        </div>

                        {/* OCCUPATION DETAILS */}
                        {formData.hasOccupation === "yes" && (
                            <>
                                <div className="mb-3">
                                    <select
                                        name="occupation"
                                        value={formData.occupation}
                                        onChange={handleChange}
                                        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    >
                                        <option value="">Select occupation</option>
                                        <option>School Teacher</option>
                                        <option>College Lecturer</option>
                                        <option>Student</option>
                                        <option>Freelancer</option>
                                        <option>Working Professional</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                {formData.occupation === "Other" && (
                                    <input
                                        name="occupation"
                                        placeholder="Enter your occupation"
                                        value={formData.occupation}
                                        onChange={handleChange}
                                        className="w-full border p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}

                                <input
                                    name="organization"
                                    placeholder="Organization / Company Name"
                                    value={formData.organization || ""}
                                    onChange={handleChange}
                                    className="w-full border p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </>
                        )}

                        {/* LOCATION */}
                        <p className="mb-2 font-medium">
                            Select Locations Where You Can Teach
                        </p>

                        <input
                            type="text"
                            placeholder="Search location..."
                            className="w-full border p-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-3 rounded-lg">
                            {areas
                                .filter((a) =>
                                    a.toLowerCase().includes(search.toLowerCase())
                                )
                                .map((a) => (
                                    <label
                                        key={a}
                                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.locations.includes(a)}
                                            onChange={() => handleMulti("locations", a)}
                                        />
                                        {a}
                                    </label>
                                ))}
                        </div>

                        {/* ERROR */}
                        {touched.locations && formData.locations.length === 0 && (
                            <p className="text-red-500 text-sm mt-1">
                                Select at least one location
                            </p>
                        )}

                        {/* VEHICLE */}
                        <p className="mt-5 mb-2 font-medium">Vehicle Available?</p>

                        <div className="flex gap-2 mb-3">
                            {["yes", "no"].map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    className={`px-4 py-2 rounded-lg transition ${formData.hasVehicle === val
                                        ? "bg-blue-600 text-white shadow"
                                        : "bg-gray-200 hover:bg-gray-300"
                                        }`}
                                    onClick={() =>
                                        setFormData({ ...formData, hasVehicle: val })
                                    }
                                >
                                    {val === "yes" ? "Yes" : "No"}
                                </button>
                            ))}
                        </div>

                        {formData.hasVehicle === "yes" && (
                            <input
                                name="vehicleNumber"
                                placeholder="Vehicle Number"
                                value={formData.vehicleNumber}
                                onChange={handleChange}
                                className="w-full border p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        )}

                        {/* NAVIGATION */}
                        <div className="flex justify-between mt-6">
                            <button
                                className="bg-gray-300 px-5 py-2 rounded-lg hover:bg-gray-400"
                                onClick={() => setStep(1)}
                            >
                                ← Previous
                            </button>

                            <button
                                disabled={formData.locations.length === 0}
                                className={`px-6 py-3 rounded-xl text-white transition ${formData.locations.length === 0
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    }`}
                                onClick={() => {
                                    const error = validateStep2();
                                    if (error) {
                                        alert(error);
                                        return;
                                    }
                                    setStep(3);
                                }}
                            >
                                Next →
                            </button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <div className={`border rounded-xl p-4 mb-6 transition 
  ${!formData.photo ? "border-red-300" : "border-green-400 bg-green-50"}`}>

                            <input
                                type="file"
                                className="hidden"
                                id="photo"
                                accept="image/*"
                                onChange={(e) =>
                                    setFormData({ ...formData, photo: e.target.files[0] })
                                }
                            />

                            <label htmlFor="photo" className="cursor-pointer block">
                                <p className="text-sm font-medium">Profile Photo (Required)</p>

                                {formData.photo ? (
                                    <p className="text-green-600 text-sm mt-2">
                                        ✔ {formData.photo.name}
                                    </p>
                                ) : (
                                    <p className="text-red-500 text-sm mt-2">
                                        Required
                                    </p>
                                )}
                            </label>
                        </div>
                        {/* DOCUMENT SECTION */}
                        <div className="mb-6">
                            <p className="font-semibold text-lg mb-3">Upload Documents</p>

                            <div className="space-y-4">
                                {/* ID PROOF */}
                                <div className={`border rounded-xl p-4 transition 
          ${!formData.idProof ? "border-red-300" : "border-green-400 bg-green-50"}`}>

                                    <input
                                        type="file"
                                        className="hidden"
                                        id="idProof"
                                        onChange={(e) =>
                                            setFormData({ ...formData, idProof: e.target.files[0] })
                                        }
                                    />

                                    <label htmlFor="idProof" className="cursor-pointer block">
                                        <p className="text-sm font-medium">ID Proof (Required)</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Click to upload (PDF, JPG, PNG)
                                        </p>

                                        {formData.idProof ? (
                                            <p className="text-green-600 text-sm mt-2">
                                                ✔ {formData.idProof.name}
                                            </p>
                                        ) : (
                                            <p className="text-red-500 text-sm mt-2">
                                                Required
                                            </p>
                                        )}
                                    </label>
                                </div>

                                {/* EDUCATION CERT */}
                                <div className={`border rounded-xl p-4 transition 
          ${!formData.expCert ? "border-red-300" : "border-green-400 bg-green-50"}`}>

                                    <input
                                        type="file"
                                        className="hidden"
                                        id="expCert"
                                        onChange={(e) =>
                                            setFormData({ ...formData, expCert: e.target.files[0] })
                                        }
                                    />

                                    <label htmlFor="expCert" className="cursor-pointer block">
                                        <p className="text-sm font-medium">
                                            Education Certificate (Required)
                                        </p>

                                        {formData.expCert ? (
                                            <p className="text-green-600 text-sm mt-2">
                                                ✔ {formData.expCert.name}
                                            </p>
                                        ) : (
                                            <p className="text-red-500 text-sm mt-2">
                                                Required
                                            </p>
                                        )}
                                    </label>
                                </div>

                                {/* OPTIONAL */}
                                <div className="border rounded-xl p-4 bg-white hover:shadow-md transition">
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="otherDoc"
                                        onChange={(e) =>
                                            setFormData({ ...formData, otherDoc: e.target.files[0] })
                                        }
                                    />

                                    <label htmlFor="otherDoc" className="cursor-pointer block">
                                        <p className="text-sm font-medium">
                                            Experience/Appraisal Document (Optional)
                                        </p>

                                        {formData.otherDoc && (
                                            <p className="text-green-600 text-sm mt-2">
                                                ✔ {formData.otherDoc.name}
                                            </p>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* TIMINGS */}
                        <div className="mb-6">
                            <p className="font-semibold text-lg mb-2">
                                Select Available Timings
                            </p>

                            {/* Morning */}
                            <p className="text-sm font-medium mb-2 text-gray-700">
                                Morning (6 AM – 12 PM)
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {["6-7 AM", "7-8 AM", "8-9 AM", "9-10 AM", "10-11 AM", "11-12 PM"].map((t) => (
                                    <label
                                        key={t}
                                        className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition
              ${formData.timings.includes(t)
                                                ? "bg-blue-100 border-blue-400"
                                                : "hover:bg-gray-100"}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.timings.includes(t)}
                                            onChange={() => handleMulti("timings", t)}
                                        />
                                        {t}
                                    </label>
                                ))}
                            </div>

                            {/* Evening */}
                            <p className="text-sm font-medium mt-4 mb-2 text-gray-700">
                                Evening (4 PM – 8 PM)
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {["4-5 PM", "5-6 PM", "6-7 PM", "7-8 PM"].map((t) => (
                                    <label
                                        key={t}
                                        className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition
              ${formData.timings.includes(t)
                                                ? "bg-blue-100 border-blue-400"
                                                : "hover:bg-gray-100"}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.timings.includes(t)}
                                            onChange={() => handleMulti("timings", t)}
                                        />
                                        {t}
                                    </label>
                                ))}
                            </div>

                            {formData.timings.length > 0 && (
                                <p className="text-sm text-green-600 mt-2">
                                    ✔ Selected: {formData.timings.join(", ")}
                                </p>
                            )}
                        </div>

                        {/* AGREEMENT */}
                        <div className={`mb-6 p-4 border rounded-xl transition 
      ${!formData.agreement ? "border-red-300" : "border-green-400 bg-green-50"}`}>

                            <label className="flex items-start gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={formData.agreement}
                                    onChange={(e) =>
                                        setFormData({ ...formData, agreement: e.target.checked })
                                    }
                                />
                                <div className="text-gray-700 text-sm leading-relaxed">
                                    <span>
                                        I agree to pay a{" "}
                                        <span className="font-bold text-black">
                                            32% Placement, Facilitation & Verification Fee
                                        </span>{" "}
                                        for the{" "}
                                        <span className="italic font-medium text-gray-900">
                                            first two months
                                        </span>{" "}
                                        for each opportunity facilitated by{" "}
                                        <span className="font-semibold text-indigo-600 underline">
                                            Saraswati Tutorials
                                        </span>.
                                    </span>
                                </div>
                            </label>

                            {!formData.agreement && (
                                <p className="text-red-500 text-xs mt-1">
                                    You must agree before submitting
                                </p>
                            )}
                        </div>

                        {/* NAVIGATION */}
                        <div className="flex justify-between">
                            <button
                                className="bg-gray-300 px-5 py-2 rounded-lg hover:bg-gray-400"
                                onClick={() => setStep(2)}
                            >
                                ← Previous
                            </button>

                            <button
                                disabled={!formData.idProof || !formData.expCert || !formData.agreement || loading}
                                className={`px-6 py-3 rounded-xl text-white transition flex items-center gap-2
          ${!formData.idProof || !formData.expCert || !formData.agreement
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                    }`}
                                onClick={handleSubmit}
                            >
                                {loading ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </>
                )}


            </div>
        </div>
    );


}


import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://saraswati-tutorial1-2.onrender.com/api";

export default function TutorRegistration() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        experience: "",
        hasOccupation: "",
        occupation: "",

        locations: [],
        hasVehicle: "",
        vehicleNumber: "",

        idProof: null,
        expCert: null,
        otherDoc: null,

        timings: [],
        agreement: false,
    });

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
        // Name
        if (!formData.name || formData.name.trim().length < 3) {
            return "Name must be at least 3 characters";
        }

        // Email
        if (!formData.email) {
            return "Email is required";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return "Enter a valid email address";
        }

        // Experience
        if (!formData.experience || formData.experience === "Select Experience") {
            return "Please select experience";
        }

        // Location
        if (!formData.locations || formData.locations.length === 0) {
            return "Select at least one location";
        }

        return null;
    };

  
    const handleSubmit = async () => {
        const error = validateForm();

        if (error) {
            alert(error);
            return;
        }

        try {
            const fd = new FormData();

            //  STEP 1: append files
            if (formData.idProof) fd.append("idProof", formData.idProof);
            if (formData.expCert) fd.append("expCert", formData.expCert);
            if (formData.otherDoc) fd.append("otherDoc", formData.otherDoc);

            //  STEP 1: upload to cloudinary
            const uploadRes = await axios.post(`${API_BASE}/upload`, fd);

            //  STEP 2: save tutor with document URLs
            await axios.post(`${API_BASE}/tutors`, {
                ...formData,
                idProof: uploadRes.data.idProof,
                expCert: uploadRes.data.expCert,
                otherDoc: uploadRes.data.otherDoc,
                status: "pending",
            });

            alert("Tutor registered successfully");
            navigate("/thank-you");

        } catch (err) {
            console.error(err);
            alert("Upload failed");
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
                        <input
                            placeholder="Name (as per ID)"
                            className="w-full border border-gray-300 p-3 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                        />

                        {/* EMAIL */}
                        <input
                            type="email"
                            placeholder="Email ID"
                            className="w-full border border-gray-300 p-3 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />

                        {/* EXPERIENCE */}
                        <select
                            className="w-full border border-gray-300 p-3 rounded-lg mb-3"
                            onChange={(e) =>
                                setFormData({ ...formData, experience: e.target.value })
                            }
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

                        {/* NEXT BUTTON */}
                        <div className="flex justify-end mt-4">
                            <button

                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow transition"
                                onClick={() => setStep(2)}
                            >
                                Next →
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        {/*  OCCUPATION */}
                        <p className="mb-2 text-sm font-medium">
                            Have you worked or are you working in any school, college, or institute?
                        </p>

                        <div className="flex gap-2 mb-3">
                            <button
                                className={`px-4 py-2 rounded-lg ${formData.hasOccupation === "yes"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200"
                                    }`}
                                onClick={() =>
                                    setFormData({ ...formData, hasOccupation: "yes" })
                                }
                            >
                                Yes
                            </button>

                            <button
                                className={`px-4 py-2 rounded-lg ${formData.hasOccupation === "no"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200"
                                    }`}
                                onClick={() =>
                                    setFormData({ ...formData, hasOccupation: "no" })
                                }
                            >
                                No
                            </button>
                        </div>

                        {/*  DROPDOWN + INPUT */}
                        {formData.hasOccupation === "yes" && (
                            <>
                                {/*  OCCUPATION TYPE */}
                                <select
                                    className="w-full border p-3 rounded-lg mb-2"
                                    value={formData.occupation}
                                    onChange={(e) =>
                                        setFormData({ ...formData, occupation: e.target.value })
                                    }
                                >
                                    <option value="">Select occupation</option>
                                    <option value="School Teacher">School Teacher</option>
                                    <option value="College Lecturer">College Lecturer</option>
                                    <option value="Student">Student</option>
                                    <option value="Freelancer">Freelancer</option>
                                    <option value="Working Professional">Working Professional</option>
                                    <option value="Other">Other</option>
                                </select>

                                {/*  OTHER OCCUPATION */}
                                {formData.occupation === "Other" && (
                                    <input
                                        placeholder="Enter your occupation"
                                        className="w-full border p-3 rounded-lg mb-2"
                                        onChange={(e) =>
                                            setFormData({ ...formData, occupation: e.target.value })
                                        }
                                    />
                                )}



                                {/*  ORGANIZATION (IMPORTANT) */}
                                <input
                                    placeholder="Organization / Company Name"
                                    className="w-full border p-3 rounded-lg"
                                    onChange={(e) =>
                                        setFormData({ ...formData, organization: e.target.value })
                                    }
                                />
                            </>
                        )}

                        {/*  SEARCHABLE LOCATION */}
                        <p className="mb-2 font-medium">Select Locations Where You Can Teach</p>

                        <input
                            type="text"
                            placeholder="Search location..."
                            className="w-full border p-2 rounded-lg mb-3"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-2 rounded-lg">
                            {areas
                                .filter((a) =>
                                    a.toLowerCase().includes(search.toLowerCase())
                                )
                                .map((a) => (
                                    <label
                                        key={a}
                                        className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            onChange={() => handleMulti("locations", a)}
                                        />
                                        {a}
                                    </label>
                                ))}
                        </div>



                        {/*  VEHICLE */}
                        <p className="mt-4 mb-2">Vehicle Available?</p>

                        <div className="flex gap-2">
                            <button
                                className={`px-4 py-2 rounded-lg ${formData.hasVehicle === "yes"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200"
                                    }`}
                                onClick={() =>
                                    setFormData({ ...formData, hasVehicle: "yes" })
                                }
                            >
                                Yes
                            </button>

                            <button
                                className={`px-4 py-2 rounded-lg ${formData.hasVehicle === "no"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200"
                                    }`}
                                onClick={() =>
                                    setFormData({ ...formData, hasVehicle: "no" })
                                }
                            >
                                No
                            </button>
                        </div>

                        {formData.hasVehicle === "yes" && (
                            <input
                                placeholder="Vehicle Number"
                                className="w-full border p-3 rounded-lg mt-2"
                                onChange={(e) =>
                                    setFormData({ ...formData, vehicleNumber: e.target.value })
                                }
                            />
                        )}

                        {/*  NAVIGATION */}
                        <div className="flex justify-between mt-6">
                            <button
                                className="bg-gray-300 px-5 py-2 rounded-lg"
                                onClick={() => setStep(1)}
                            >
                                ← Previous
                            </button>

                            <button
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow transition" onClick={() => setStep(3)}
                            >
                                Next →
                            </button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        {/*  DOCUMENT SECTION */}
                        <div className="mb-6">
                            <p className="font-semibold text-lg mb-3">Upload Documents</p>

                            <div className="space-y-4">
                                {/* ID Proof */}
                                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition">
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="idProof"
                                        onChange={(e) =>
                                            setFormData({ ...formData, idProof: e.target.files[0] })
                                        }
                                    />
                                    <label htmlFor="idProof" className="cursor-pointer">
                                        <p className="text-sm font-medium">ID Proof (Required)</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Click to upload (PDF, JPG, PNG)
                                        </p>

                                        {formData.idProof && (
                                            <p className="text-green-600 text-sm mt-2">
                                                ✔ {formData.idProof.name}
                                            </p>
                                        )}
                                    </label>
                                </div>

                                {/* Experience */}
                                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition">
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="expCert"
                                        onChange={(e) =>
                                            setFormData({ ...formData, expCert: e.target.files[0] })
                                        }
                                    />
                                    <label htmlFor="expCert" className="cursor-pointer">
                                        <p className="text-sm font-medium">Education Certificate (Required)</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Click to upload
                                        </p>

                                        {formData.expCert && (
                                            <p className="text-green-600 text-sm mt-2">
                                                ✔ {formData.expCert.name}
                                            </p>
                                        )}
                                    </label>
                                </div>

                                {/* Other */}
                                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition">
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="otherDoc"
                                        onChange={(e) =>
                                            setFormData({ ...formData, otherDoc: e.target.files[0] })
                                        }
                                    />
                                    <label htmlFor="otherDoc" className="cursor-pointer">
                                        <p className="text-sm font-medium">Experience/Appraisal Document(Optional)</p>

                                        {formData.otherDoc && (
                                            <p className="text-green-600 text-sm mt-2">
                                                ✔ {formData.otherDoc.name}
                                            </p>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/*  TIMING SYSTEM */}
                        <div className="mb-6">
                            <p className="font-semibold text-lg mb-2">Select Available Timings</p>

                            {/* Morning */}
                            <p className="text-sm font-medium mb-2 text-gray-700">
                                Morning (6 AM – 12 PM)
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {["6-7 AM", "7-8 AM", "8-9 AM", "9-10 AM", "10-11 AM", "11-12 PM"].map((t) => (
                                    <label
                                        key={t}
                                        className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-100 cursor-pointer"
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
                                        className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-100 cursor-pointer"
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

                            {/* Selected timings */}
                            {formData.timings.length > 0 && (
                                <p className="text-sm text-gray-600 mt-2">
                                    Selected: {formData.timings.join(", ")}
                                </p>
                            )}
                        </div>

                        {/*  AGREEMENT */}
                        <div className="mb-6 p-4 border rounded-xl bg-gray-50">
                            <label className="flex items-start gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={formData.agreement}
                                    onChange={(e) =>
                                        setFormData({ ...formData, agreement: e.target.checked })
                                    }
                                />
                                <span>
                                    Tutor needs to pay <b>32% commission for the first 2 months</b> to Saraswati Tutorials
                                    for providing opportunities. This is applicable for each opportunity assigned.
                                </span>
                            </label>
                        </div>

                        {/*  NAVIGATION */}
                        <div className="flex justify-between">
                            <button
                                className="bg-gray-300 px-5 py-2 rounded-lg hover:bg-gray-400"
                                onClick={() => setStep(2)}
                            >
                                ← Previous
                            </button>

                            <button
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow transition"
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );

}
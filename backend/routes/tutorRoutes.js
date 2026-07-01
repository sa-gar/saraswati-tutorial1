import express from "express";
import Tutor from "../models/Tutor.js";
import fetch from "node-fetch";
import { createLead } from "../utils/odooService.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import jwt from "jsonwebtoken";

const router = express.Router();


// GET all tutors
router.get("/", async (req, res) => {
  try {
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
        if (decoded.role === "admin") {
          isAdmin = true;
        }
      } catch (e) {}
    }

    let tutors;
    if (isAdmin) {
      tutors = await Tutor.find().sort({ createdAt: -1 });
    } else {
      // Exclude documents, phone, and email for public searches
      tutors = await Tutor.find({}, { documents: 0, phone: 0, email: 0 }).sort({ createdAt: -1 });
    }
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET single tutor
router.get("/:id", async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);


    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }


    res.json(tutor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




router.post("/", async (req, res) => {
  try {
 

    let odooRes = null;

    try {

   odooRes = await createLead({
  name: req.body.name || "",
  email: req.body.email || "",
  phone: req.body.phone || "",
  userType: "tutor",
 vehicleNumber: req.body.vehicleNumber || "",
  experience: req.body.experience || "",
  hasVehicle: req.body.hasVehicle === "yes",
  hasOccupation: req.body.hasOccupation === "yes",
  occupation: req.body.occupation || "",
  photo: req.body.photo || "",
});
// console.log("PHOTO FROM FRONTEND:", req.body.photo);
    

    } catch (err) {
      // console.error("Odoo Error in createLead:", err.message);
    }

    //  Save with Odoo ID
    const hasVehicle = req.body.hasVehicle === "yes" ? "yes" : "no";
    const hasOccupation = req.body.hasOccupation === "yes" ? "yes" : "no";

    const tutor = new Tutor({
      ...req.body,
      hasVehicle,
      hasOccupation,
      odooLeadId: odooRes,
    });

    const savedTutor = await tutor.save();

    res.status(201).json(savedTutor);

  } catch (error) {
    console.error("Server Error in tutor registration:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE tutor
router.put("/:id", verifyToken(["admin"]), async (req, res) => {
  try {
    const updatedTutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );


    if (!updatedTutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }


    res.json(updatedTutor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// DELETE tutor
router.delete("/:id", verifyToken(["admin"]), async (req, res) => {
  try {
    const deletedTutor = await Tutor.findByIdAndDelete(req.params.id);


    if (!deletedTutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }


    res.json({ message: "Tutor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;


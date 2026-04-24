import express from "express";
import Tutor from "../models/Tutor.js";
import fetch from "node-fetch";
import { createLead } from "../utils/odooService.js";
const router = express.Router();


// GET all tutors
router.get("/", async (req, res) => {
  try {
    const tutors = await Tutor.find().sort({ createdAt: -1 });
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
    // console.log("Incoming Request:", req.body);

    // console.log("FULL DATA TO ODOO:", {
    //   ...req.body,
    //   userType: "tutor"
    // });

    let odooRes = null;

    try {

      odooRes = await createLead({
        name: req.body.name || "",
        email: req.body.email || "",
        phone: req.body.phone || "",

        userType: "tutor", // or "parent"

        // address / location
        locations: req.body.locations || [],
      });

      // console.log("Odoo Response:", odooRes);

    } catch (err) {
      // console.error(" Odoo Error:", err.message);
    }

    //  Save with Odoo ID
    const tutor = new Tutor({
      ...req.body,
      odooLeadId: odooRes,
    });

    const savedTutor = await tutor.save();

    res.status(201).json(savedTutor);

  } catch (error) {
    // // console.error(" Server Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE tutor
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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


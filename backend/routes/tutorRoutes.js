import express from "express";
import Tutor from "../models/Tutor.js";
import fetch from "node-fetch";
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
    const tutor = new Tutor(req.body);
    const savedTutor = await tutor.save();


    //  MAKE WEBHOOK CALL
    await fetch("https://hook.us2.make.com/ueqga36bmu9es8i493rsbh42bo00rme6", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "tutor",
        name: savedTutor.name,
        email: savedTutor.email,
        phone: savedTutor.phone,
        experience: savedTutor.experience,
        location: savedTutor.locations,
      }),
    }).catch(console.error);


    res.status(201).json(savedTutor);


  } catch (error) {
    res.status(400).json({ message: error.message });
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


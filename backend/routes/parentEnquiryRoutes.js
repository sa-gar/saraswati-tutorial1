import express from "express";
import fetch from "node-fetch";
import ParentEnquiry from "../models/ParentEnquiry.js";


const router = express.Router();


// GET
router.get("/", async (req, res) => {
  try {
    const data = await ParentEnquiry.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// POST
router.post("/", async (req, res) => {
  try {
    const enquiry = new ParentEnquiry(req.body);
    const saved = await enquiry.save();


    // 🔥 MAKE WEBHOOK CALL
    await fetch("https://hook.us2.make.com/ueqga36bmu9es8i493rsbh42bo00rme6", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "parent",
        name: saved.parentName,
        phone: saved.phone,
        email: saved.email,
        area: saved.area,
        subjects: saved.wards?.map(w => w.subjectsNeeded).flat() || [],
      }),
    }).catch(console.error);


    res.status(201).json(saved);


  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


export default router;


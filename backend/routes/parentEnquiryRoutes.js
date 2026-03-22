import express from "express";
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
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
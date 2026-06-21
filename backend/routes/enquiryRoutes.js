import express from "express";
import Enquiry from "../models/Enquiry.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET
router.get("/", verifyToken(["admin"]), async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST
router.post("/", async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    const saved = await enquiry.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
import express from "express";
import fetch from "node-fetch";
import ParentEnquiry from "../models/ParentEnquiry.js";
import { createLead } from "../utils/odooService.js";

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
    // console.log("Parent Request:", req.body);

    //  STEP 1: Send to Odoo
    let odooRes = null;

    try {
      odooRes = await createLead({
        name: req.body.parentName || "",
        email: req.body.email || "",
        phone: req.body.phone || "",
        userType: "parent",   
        classGrade: req.body.classGrade || "",   
      });

      //  console.log("Odoo Parent Lead:", odooRes);

    } catch (err) {
      // console.error("Odoo Error:", err.message);
    }

    //  STEP 2: Save in DB
    const enquiry = new ParentEnquiry({
      ...req.body,
      odooLeadId: odooRes,
    });

    const saved = await enquiry.save();

    res.status(201).json(saved);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;


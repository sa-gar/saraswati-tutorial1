import express from "express";
import fetch from "node-fetch";
import ParentEnquiry from "../models/ParentEnquiry.js";
import { createLead } from "../utils/odooService.js";
import { updateLead } from "../utils/odooService.js";
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
    let odooRes = null;

    try {
      // odooRes = await createLead({
      //   name: req.body.parentName || "",
      //   studentName : req.body.studentName || "",
      //   email: req.body.email || "",
      //   phone: req.body.phone || "",
      //   userType: "parent",   

      // });

      odooRes = await createLead({
        ...req.body,
        userType: "parent",
      });
      // console.log("Odoo Parent Lead:", odooRes);

    } catch (err) {
      // console.error("Odoo Error:", err.message);
    }

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

router.get("/confirm", async (req, res) => {
  try {
    const leadId = req.query.lead;

    // console.log("Lead confirmed:", leadId);

    await updateLead(leadId, {
      x_studio_response_status: "Yes",
    });

    res.send("Thank you! Your interest is confirmed.");

  } catch (err) {
    // console.error(" Confirm Error:", err.message);
    // console.error(" FULL ODOO ERROR:");
    // console.error(err);
    res.send(" Something went wrong");
  }
});

export default router;


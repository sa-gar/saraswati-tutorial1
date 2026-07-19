import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import ParentEnquiry from "../models/ParentEnquiry.js";
import { syncMatchingTutorsToOdoo } from "../utils/odooService.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Fetch any real lead that has an odooLeadId
    const lead = await ParentEnquiry.findOne({ odooLeadId: { $ne: null } });
    if (!lead) {
      console.log("No lead with odooLeadId found in MongoDB. Cannot run test.");
      return;
    }

    // Set a mock requirement ID to test the deletion logic
    lead.requirementId = "REQ-TEST-9999";

    console.log(`Using Lead: ${lead.requirementId} | Odoo Lead ID: ${lead.odooLeadId}`);

    // Mock recommendations matching the structure
    const mockRecommendations = {
      exact: [
        {
          name: "Test Exact Tutor",
          tutorCode: "TUT9999",
          phone: "9999999999",
          whatsapp: "9999999999",
          email: "test_exact@saraswatitutorial.com",
          city: "Bengaluru",
          area: "Whitefield",
          pincode: "560066",
          qualification: "B.Tech",
          experience: "5 Years",
          grades: ["Class 6-8 (Middle)"],
          subjects: ["Mathematics", "Science"],
          timings: ["Evening"],
          availabilityStatus: "Available",
          matchPercentage: 95,
          distanceKm: 2.5,
          reason: "Matches Grade, Subject, Timing, and Pincode",
          fullAddress: "123 Whitefield Main Rd, Bengaluru",
        }
      ],
      nearby: [],
      city: [],
      backup: [
        {
          name: "Test Backup Tutor",
          tutorCode: "TUT8888",
          phone: "8888888888",
          whatsapp: "8888888888",
          email: "test_backup@saraswatitutorial.com",
          city: "Bengaluru",
          area: "Indiranagar",
          pincode: "560038",
          qualification: "M.Sc",
          experience: "3 Years",
          grades: ["Class 6-8 (Middle)"],
          subjects: ["Mathematics"],
          timings: ["Morning"],
          availabilityStatus: "Available",
          matchPercentage: 60,
          distanceKm: 8.2,
          reason: "Matches Grade and Subject",
          fullAddress: "456 Indiranagar, Bengaluru",
        }
      ]
    };

    console.log("First Sync (should insert 2)...");
    const result1 = await syncMatchingTutorsToOdoo(lead, mockRecommendations);
    console.log("First Sync Result:", result1);

    console.log("\nSecond Sync (should delete 2 and insert 2)...");
    const result2 = await syncMatchingTutorsToOdoo(lead, mockRecommendations);
    console.log("Second Sync Result:", result2);

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

run();

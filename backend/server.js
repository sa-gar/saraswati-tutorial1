import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import tutorRoutes from "./routes/tutorRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import parentEnquiryRoutes from "./routes/parentEnquiryRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js"; 
import blogAuthRoutes from "./routes/blogAuthRoutes.js";
import compression from "compression";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(compression());
// Health check
app.get("/s/:shortId", (req, res) => {
  const { shortId } = req.params;

  // 🔥 Hardcoded mapping (test)
  const links = {
  abc123: "https://saraswati-tutorials.odoo.com/sign/document/mail/2/0d0ea973-17e1-4b9d-ba88-d45a7ad21f3",
};

  const fullUrl = links[shortId];

  if (!fullUrl) {
    return res.status(404).send("Link not found");
  }

  return res.redirect(fullUrl);
});
app.get("/", (req, res) => {
  res.json({ message: "Saraswati Tutorial backend is running" });
});


// API Routes
app.use("/api/tutors", tutorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/parent-enquiries", parentEnquiryRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/blog-auth", blogAuthRoutes);

// MongoDB Connection + Server Start
if (
  process.env.MONGO_URI &&
  process.env.MONGO_URI !== "your_mongodb_connection_string"
) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected");
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error.message);
      app.listen(PORT, () => {
        console.log(`Server running without DB on http://localhost:${PORT}`);
      });
    });
} else {
  app.listen(PORT, () => {
    console.log(`Server running without DB on http://localhost:${PORT}`);
  });
}
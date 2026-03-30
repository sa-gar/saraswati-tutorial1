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

app.use("/api/blogs", blogRoutes);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/parent-enquiries", parentEnquiryRoutes);
app.use("/api/blogs", blogRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Saraswati Tutorial backend is running" });
});

app.use("/api/tutors", tutorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/auth", authRoutes);

if (process.env.MONGO_URI && process.env.MONGO_URI !== "your_mongodb_connection_string") {
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
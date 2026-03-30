import express from "express";
import Blog from "../models/Blog.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all blogs (public)
router.get("/", async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
});

// GET single blog
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.json(blog);
});

// CREATE blog (admin only)
router.post("/", requireAdmin, async (req, res) => {
  const blog = await Blog.create(req.body);
  res.json(blog);
});

// DELETE blog
router.delete("/:id", requireAdmin, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
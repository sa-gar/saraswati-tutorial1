import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const blog = new Blog(req.body);
    const saved = await blog.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
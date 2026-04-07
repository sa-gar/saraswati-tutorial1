import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

router.get("/slug/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
    const { title, content, image, author } = req.body;

    let slug = generateSlug(title);

    const existing = await Blog.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const blog = new Blog({
      title,
      content,
      image,
      author: author || "Admin",
      slug,
    });

    const saved = await blog.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, content, image, author } = req.body;

    const existingBlog = await Blog.findById(req.params.id);

    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    let slug = existingBlog.slug;

    if (title && title !== existingBlog.title) {
      slug = generateSlug(title);

      const duplicate = await Blog.findOne({
        slug,
        _id: { $ne: req.params.id },
      });

      if (duplicate) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        image,
        author,
        slug,
      },
      { new: true }
    );

    res.json(updated);
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
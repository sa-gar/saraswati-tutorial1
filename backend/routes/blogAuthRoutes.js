import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const BLOG_EDITOR_EMAIL = process.env.BLOG_EDITOR_EMAIL;
    const BLOG_EDITOR_PASSWORD = process.env.BLOG_EDITOR_PASSWORD;

    if (email !== BLOG_EDITOR_EMAIL || password !== BLOG_EDITOR_PASSWORD) {
      return res.status(401).json({ message: "Invalid blog editor credentials" });
    }

    const token = jwt.sign(
      { email, role: "blog-editor" },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        email,
        role: "blog-editor",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
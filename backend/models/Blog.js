import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: "" },
    author: { type: String, default: "Admin" },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
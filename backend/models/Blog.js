import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
slug: { type: String, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: "" },
    author: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file, folder) => {
  const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder,
  });

  return result.secure_url;
};

router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },     // blog image
    { name: "idProof", maxCount: 1 },   // tutor doc
    { name: "expCert", maxCount: 1 },   // tutor doc
    { name: "otherDoc", maxCount: 1 },  // tutor doc
    { name: "photo", maxCount: 1 },     // tutor photo
  ]),
  async (req, res) => {
    try {
      const files = req.files || {};
      const uploadedFiles = {};

      // BLOG IMAGE
      if (files.image && files.image[0]) {
        uploadedFiles.imageUrl = await uploadToCloudinary(
          files.image[0],
          "saraswati-blogs"
        );
      }

      // TUTOR DOCS
      if (files.idProof && files.idProof[0]) {
        uploadedFiles.idProof = await uploadToCloudinary(
          files.idProof[0],
          "saraswati-tutors"
        );
      }

      if (files.expCert && files.expCert[0]) {
        uploadedFiles.expCert = await uploadToCloudinary(
          files.expCert[0],
          "saraswati-tutors"
        );
      }

      if (files.otherDoc && files.otherDoc[0]) {
        uploadedFiles.otherDoc = await uploadToCloudinary(
          files.otherDoc[0],
          "saraswati-tutors"
        );
      }
      // PROFILE PHOTO
      if (files.photo && files.photo[0]) {
        uploadedFiles.photo = await uploadToCloudinary(
          files.photo[0],
          "saraswati-tutors/profile"   // 
        );
      }

      if (Object.keys(uploadedFiles).length === 0) {
        return res.status(400).json({ message: "No valid files uploaded" });
      }

      res.json(uploadedFiles);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
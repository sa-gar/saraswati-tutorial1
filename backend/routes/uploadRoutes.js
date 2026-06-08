import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file, folder) => {

  // VALID FILE TYPES
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error("Invalid file type");
  }

  const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder,
    resource_type: "auto",
  });

  return result.secure_url;
};

router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
    { name: "expCert", maxCount: 1 },
    { name: "otherDoc", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),

  async (req, res) => {
    try {

      const files = req.files || {};
      const uploadedFiles = {};

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          message: "No files received",
        });
      }

      // BLOG IMAGE
      if (files.image && files.image[0]) {
        uploadedFiles.imageUrl = await uploadToCloudinary(
          files.image[0],
          "saraswati-blogs"
        );
      }

      // ID PROOF
      if (files.idProof && files.idProof[0]) {
        uploadedFiles.idProof = await uploadToCloudinary(
          files.idProof[0],
          "saraswati-tutors"
        );
      }

      // EDUCATION CERTIFICATE
      if (files.expCert && files.expCert[0]) {
        uploadedFiles.expCert = await uploadToCloudinary(
          files.expCert[0],
          "saraswati-tutors"
        );
      }

      // OTHER DOC
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
          "saraswati-tutors/profile"
        );
      }

      if (Object.keys(uploadedFiles).length === 0) {
        return res.status(400).json({
          message: "No valid files uploaded",
        });
      }

      res.json(uploadedFiles);

    } catch (error) {

      console.error("UPLOAD ERROR FULL:", {
        message: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        message: error.message || "Upload failed",
      });
    }
  }
);

export default router;
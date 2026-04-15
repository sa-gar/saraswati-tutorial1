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

// router.post("/", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

//     const result = await cloudinary.uploader.upload(base64, {
//       folder: "saraswati-blogs",
//     });

//     res.json({ imageUrl: result.secure_url });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.post(
  "/",
  upload.fields([
    { name: "idProof", maxCount: 1 },
    { name: "expCert", maxCount: 1 },
    { name: "otherDoc", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files;

      if (!files || (!files.idProof && !files.expCert)) {
        return res.status(400).json({ message: "Required files missing" });
      }

      const uploadToCloudinary = async (file) => {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(base64, {
          folder: "saraswati-tutors",
        });

        return result.secure_url;
      };

      const uploadedFiles = {};

      if (files.idProof) {
        uploadedFiles.idProof = await uploadToCloudinary(files.idProof[0]);
      }

      if (files.expCert) {
        uploadedFiles.expCert = await uploadToCloudinary(files.expCert[0]);
      }

      if (files.otherDoc) {
        uploadedFiles.otherDoc = await uploadToCloudinary(files.otherDoc[0]);
      }

      res.json(uploadedFiles);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);
export default router;
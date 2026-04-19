import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@gmail.com";
    const newPassword = "adityast1"; // 👈 change here

    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log("Admin not found");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedPassword;
    await admin.save();

    console.log("✅ Admin password updated successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
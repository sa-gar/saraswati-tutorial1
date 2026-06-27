import mongoose from "mongoose";
import dotenv from "dotenv";
import AnalyticsLog from "./models/AnalyticsLog.js";

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB successfully");
    
    const total = await AnalyticsLog.countDocuments({});
    console.log("Total Analytics logs:", total);
    
    const cityCounts = await AnalyticsLog.aggregate([
      {
        $group: {
          _id: "$city",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log("City breakdown in database:", cityCounts);
    
    // Check the latest 10 records to see if ipAddress is populated
    const samples = await AnalyticsLog.find({})
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log("Latest 10 logs in full:");
    console.log(JSON.stringify(samples, null, 2));
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

check();

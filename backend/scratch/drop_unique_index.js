import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/saraswati";

async function run() {
  try {
    console.log("Connecting to database:", MONGO_URI.split("@").pop());
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const collection = db.collection("broadcastlogs");
    
    // Check existing indexes
    const indexes = await collection.indexes();
    console.log("Existing indexes:", indexes.map(i => i.name));
    
    // Find compound index
    const indexName = "requirementId_1_tutorId_1";
    const exists = indexes.some(i => i.name === indexName);
    
    if (exists) {
      console.log(`Dropping unique index: ${indexName}...`);
      await collection.dropIndex(indexName);
      console.log("Unique index dropped successfully!");
    } else {
      console.log(`Index ${indexName} does not exist.`);
    }
  } catch (err) {
    console.error("Error during index migration:", err.message);
  } finally {
    process.exit(0);
  }
}

run();

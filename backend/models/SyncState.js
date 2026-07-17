import mongoose from "mongoose";

/**
 * SyncState — tracks the last Odoo → MongoDB tutor sync timestamp.
 * Used by syncService.js to perform incremental syncs (only fetch records
 * changed since the last successful run).
 */
const syncStateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    lastSyncAt: {
      type: Date,
      default: null,
    },
    lastSyncCount: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["idle", "running", "error"],
      default: "idle",
    },
  },
  { timestamps: true }
);

// Note: unique:true on the key field above already creates this index — no duplicate needed

export default mongoose.model("SyncState", syncStateSchema);

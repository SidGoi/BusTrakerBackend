import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    zone: String,
    busId: Number,
    password: Number,
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive", // Default to inactive
    },
    location: [Number],
    lastLocationUpdateAt: Date, // New field requested
    lastUpdate: Date, // Standard heartbeat timestamp
  },
  {
    collection: "Bus",
    timestamps: true,
  }
);

export default mongoose.models.Bus || mongoose.model("Bus", busSchema);
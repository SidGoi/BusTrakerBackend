import mongoose from "mongoose";

const adminCredentialSchema = new mongoose.Schema(
  {
    zone: {
      type: String,
      required: true,
      unique: true, // Each zone should only have one admin entry
    },
    password: {
      type: String, // Stored as string to handle leading zeros if any
      required: true,
    },
    role: {
      type: String,
      default: "Admin",
    },
  },
  {
    collection: "AdminCredentials",
    timestamps: true,
  }
);

export default mongoose.models.AdminCredentials || 
       mongoose.model("AdminCredentials", adminCredentialSchema);
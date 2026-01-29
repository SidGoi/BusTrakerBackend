import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    zone: String,
    busId: Number,
    password: Number,
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    location: [Number],
  },
  {
    collection: "Bus",
    timestamps: true,
  },
);

export default mongoose.models.Bus || mongoose.model("Bus", busSchema);

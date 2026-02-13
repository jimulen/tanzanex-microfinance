import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  // Primary display name for the borrower
  fullName: { type: String, required: true },

  // Keep legacy "name" field for older records / compatibility
  name: { type: String },

  phone: { type: String },

  // National ID (NIDA)
  nationalId: { type: String },

  address: { type: String },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Client ||
  mongoose.model("Client", ClientSchema);

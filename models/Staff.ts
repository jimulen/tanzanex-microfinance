import mongoose, { Schema, models } from "mongoose";

const StaffSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["staff", "manager", "admin"],
      default: "staff",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true }
);

export default models.Staff || mongoose.model("Staff", StaffSchema);

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
  },
  { timestamps: true }
);

export default models.Staff || mongoose.model("Staff", StaffSchema);

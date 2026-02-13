import mongoose, { Schema, models } from "mongoose";

const MemberSchema = new Schema(
  {
    name: String,
    phone: String,
    nationalId: String,
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default models.Member || mongoose.model("Member", MemberSchema);

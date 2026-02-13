import mongoose, { Schema, models } from "mongoose";

const GroupSchema = new Schema(
  {
    name: { type: String, required: true },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member", // 👈 MUST MATCH model name EXACTLY
      },
    ],
  },
  { timestamps: true }
);

export default models.Group || mongoose.model("Group", GroupSchema);

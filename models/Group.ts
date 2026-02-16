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
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true }
);

export default models.Group || mongoose.model("Group", GroupSchema);

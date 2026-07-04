import mongoose from "mongoose";

const chatClearSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    peerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    clearedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One record per (user, peer)
chatClearSchema.index(
  { userId: 1, peerId: 1 },
  { unique: true }
);

export default mongoose.model("ChatClear", chatClearSchema);
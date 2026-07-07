import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  text: {
    type: String,
    default: "",
  },

media: {
  url: {
    type: String,
    default: "",
  },
  publicId: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "",
  },
  originalName: {
    type: String,
    default: "",
  },
  size: {
    type: Number,
    default: 0,
  },
},

  seen: {
    type: Boolean,
    default: false,
  },

  deletedFor: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;
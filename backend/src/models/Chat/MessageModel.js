import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String },
  file: {
    url: String,
    name: String,
    type: String, // "image" | "pdf" | "other"
  },
  seen: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
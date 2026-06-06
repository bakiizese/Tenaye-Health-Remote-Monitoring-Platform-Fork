import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  isAI: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const groupChatRoomSchema = new mongoose.Schema(
  {
    moodGroup: { type: Number, required: true, unique: true }, // 1, 2, or 3
    name: { type: String, required: true },
    description: { type: String },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("GroupChatRoom", groupChatRoomSchema);

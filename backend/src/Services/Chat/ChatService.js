import Conversation from "../../models/Chat/ConversationModel.js";
import Message from "../../models/Chat/MessageModel.js";
import User from "../../models/users/usersModel.js";
import path from "path";
import fs from "fs";
import { io } from "../../../server.js";
import asyncHandler from "express-async-handler";


// جيب كل المحادثات بتاعت اليوزر
export const getConversations = (asyncHandler (async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id
  })
    .populate("participants", "name role")
    .populate("lastMessage")
    .sort({ lastMessageAt: -1 });

  res.json({ success: true, data: conversations });
}));

// ابدأ أو جيب محادثة مع يوزر معين
export const getOrCreateConversation = (asyncHandler(async (req, res) => {
  const { userId } = req.params;

  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, userId] }
  }).populate("participants", "name role");

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, userId]
    });
    conversation = await conversation.populate("participants", "name role");
  }

  res.json({ success: true, data: conversation });
}))

// جيب رسايل محادثة معينة
export const getMessages = (asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "name role")
    .sort({ createdAt: 1 });

  // خلي الرسايل مقروءة
  await Message.updateMany(
    { conversation: conversationId, sender: { $ne: req.user._id }, seen: false },
    { seen: true }
  );

  res.json({ success: true, data: messages });
}));

// بعت رسالة
export const sendMessage = (asyncHandler(async (req, res) => {
  const { conversationId, text } = req.body;
  let fileData = null;

  if (req.file) {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
    const isPdf = ext === ".pdf";
    fileData = {
      url: `/uploads/chat/${req.file.filename}`,
      name: req.file.originalname,
      type: isImage ? "image" : isPdf ? "pdf" : "other",
    };
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    text,
    file: fileData,
  });

  // حدّث الـ lastMessage في الـ conversation
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    lastMessageAt: new Date(),
  });

  const populated = await message.populate("sender", "name role");

  const conversation = await Conversation.findById(conversationId).populate("participants", "name role");
  const receiver = conversation.participants.find(
    (p) => p._id.toString() !== req.user._id.toString()
  );

  if (receiver) {
    io.to(receiver._id.toString()).emit("new_message_notification", {
      senderId: req.user._id,
      senderName: req.user.name,
      conversationId,
      text: text || "📎 ملف",
    });
  }
  res.json({ success: true, data: populated });
}));

// جيب كل اليوزرز عشان تبدأ محادثة
export const getUsers = (asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select("name role");
  res.json({ success: true, data: users });
}));
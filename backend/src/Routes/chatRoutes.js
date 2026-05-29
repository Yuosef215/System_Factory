import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../Services/users/usersSevices.js";
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getUsers,
} from "../Services/Chat/ChatService.js";

const router = express.Router();

// إعداد multer للملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/chat/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

router.use(protect);

router.get("/users", getUsers);
router.get("/conversations", getConversations);
router.get("/conversations/:userId/open", getOrCreateConversation);
router.get("/messages/:conversationId", getMessages);
router.post("/messages", upload.single("file"), sendMessage);

export default router;
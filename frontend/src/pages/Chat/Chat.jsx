import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Send, Paperclip, X, FileText, Loader2, MessageSquare, Search } from "lucide-react";
import api from "../../api/axios";
import { io } from "socket.io-client";
import { useNotifications } from "../../components/NotificationProvider";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");

const ROLE_LABELS = {
  developer: "مطور", warehouse_manager: "مدير مخزن",
  purchase_manager: "مدير مشتريات", gm: "مدير عام", ceo: "رئيس تنفيذي",
};

export default function Chat() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const typingTimeout = useRef(null);

  let currentUser = {};
  try { currentUser = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}

  // جيب المحادثات واليوزرز
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [convRes, usersRes] = await Promise.all([
        api.get("/chat/conversations"),
        api.get("/chat/users"),
      ]);
      setConversations(convRes.data.data);
      setUsers(usersRes.data.data);
    } finally { setLoading(false); }
  }, []);
  const { clearChatUnread } = useNotifications();
  useEffect(() => { fetchData();clearChatUnread(); }, []);

  // Socket events
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setMessages((p) => [...p, msg]);
      setConversations((p) =>
        p.map((c) => c._id === msg.conversation ? { ...c, lastMessage: msg, lastMessageAt: new Date() } : c)
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    });
    socket.on("typing", (name) => setTyping(`${name} يكتب...`));
    socket.on("stop_typing", () => setTyping(""));
    return () => { socket.off("receive_message"); socket.off("typing"); socket.off("stop_typing"); };
  }, []);
useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user._id) {
    socket.emit("register_user", user._id);
    console.log("📡 register_user emitted:", user._id); // للتأكد
  }
}, []);


useEffect(() => {
  socket.on("new_message_notification", (data) => {
    // لو مش في المحادثة دي حاليًا
        console.log("🔔 notification received:", data); // ← أضف ده

    if (activeConv?._id !== data.conversationId) {
      setNotifications((p) => [...p, data]);
      // شيل الـ notification بعد 4 ثواني
      setTimeout(() => {
        setNotifications((p) => p.filter((n) => n.conversationId !== data.conversationId));
      }, 4000);
    }
  });
  return () => socket.off("new_message_notification");
}, [activeConv]);

  // فتح محادثة
  const openConversation = async (userId) => {
    const res = await api.get(`/chat/conversations/${userId}/open`);
    const conv = res.data.data;
    setActiveConv(conv);
    socket.emit("join_conversation", conv._id);
    const msgRes = await api.get(`/chat/messages/${conv._id}`);
    setMessages(msgRes.data.data);
    setConversations((p) => {
      const exists = p.find((c) => c._id === conv._id);
      return exists ? p : [conv, ...p];
    });
  };

  // Scroll للأسفل
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Typing indicator
  const handleTyping = (e) => {
    setText(e.target.value);
    if (!activeConv) return;
    socket.emit("typing", { conversationId: activeConv._id, userName: currentUser.name });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit("stop_typing", activeConv._id), 1500);
  };

  // إرسال رسالة
  const send = async () => {
    if (!text.trim() && !file) return;
    if (!activeConv) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("conversationId", activeConv._id);
      if (text.trim()) formData.append("text", text);
      if (file) formData.append("file", file);
      const res = await api.post("/chat/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      socket.emit("send_message", res.data.data);
      setMessages((p) => [...p, res.data.data]);
      setText(""); setFile(null);
    } finally { setSending(false); }
  };

  // الشخص الآخر في المحادثة
  const otherUser = (conv) => conv.participants?.find((p) => p._id !== currentUser._id);
  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    
    <div className="h-screen bg-zinc-950 text-white flex flex-col" dir="rtl">
        {/* Notifications */}
<div className="fixed top-5 left-5 z-50 space-y-2">
  {notifications.map((n, i) => (
    <div key={i}
      onClick={() => openConversation(n.senderId)}
      className="flex items-center gap-3 bg-zinc-900 border border-orange-500/30 rounded-2xl px-4 py-3 shadow-xl cursor-pointer hover:border-orange-500/60 transition animate-slide-in w-72">
      <div className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold shrink-0">
        {n.senderName?.[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{n.senderName}</p>
        <p className="text-xs text-zinc-400 truncate">{n.text}</p>
      </div>
      <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
    </div>
  ))}
</div>
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800">
        <button onClick={() => navigate("/home")} className="text-zinc-400 hover:text-white transition">
          <ArrowRight size={18} />
        </button>
        <MessageSquare size={16} className="text-orange-400" />
        <span className="font-semibold">المحادثات</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-l border-zinc-800 flex flex-col bg-zinc-900/40">
          {/* Search */}
          <div className="p-3 border-b border-zinc-800">
            <div className="relative">
              <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن شخص..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 pr-8 text-sm text-white placeholder:text-zinc-600 outline-none" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* محادثات موجودة */}
            {conversations.length > 0 && (
              <div className="px-3 pt-3 pb-1">
                <p className="text-xs text-zinc-600 font-medium mb-2">المحادثات</p>
                {conversations.map((conv) => {
                  const other = otherUser(conv);
                  return (
                    <button key={conv._id} onClick={() => openConversation(other?._id)}
                      className={`w-full text-right flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition
                        ${activeConv?._id === conv._id ? "bg-orange-500/15 border border-orange-500/20" : "hover:bg-zinc-800/60"}`}>
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {other?.name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{other?.name}</p>
                        <p className="text-xs text-zinc-500 truncate">
                          {conv.lastMessage?.text || (conv.lastMessage?.file ? "📎 ملف" : "ابدأ المحادثة")}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* كل اليوزرز */}
            <div className="px-3 pt-2 pb-3">
              <p className="text-xs text-zinc-600 font-medium mb-2">كل الموظفين</p>
              {filteredUsers.map((u) => (
                <button key={u._id} onClick={() => openConversation(u._id)}
                  className="w-full text-right flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 hover:bg-zinc-800/60 transition">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {u.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm text-white">{u.name}</p>
                    <p className="text-xs text-zinc-500">{ROLE_LABELS[u.role] || u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center text-zinc-600 flex-col gap-3">
            <MessageSquare size={48} className="opacity-20" />
            <p>اختر شخص لبدء المحادثة</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-bold">
                {otherUser(activeConv)?.name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-sm">{otherUser(activeConv)?.name}</p>
                <p className="text-xs text-zinc-500">{ROLE_LABELS[otherUser(activeConv)?.role]}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((msg) => {
                const isMine = msg.sender?._id === currentUser._id || msg.sender === currentUser._id;
                return (
                  <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMine ? "bg-orange-500 text-white rounded-tr-sm" : "bg-zinc-800 text-white rounded-tl-sm"}`}>
                      {msg.text && <p className="text-sm">{msg.text}</p>}
                      {msg.file && (
                        msg.file.type === "image" ? (
                          <img src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${msg.file.url}`}
                            className="max-w-full rounded-xl mt-1" alt="img" />
                        ) : (
                          <a href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${msg.file.url}`}
                            target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 text-sm underline mt-1">
                            <FileText size={14} /> {msg.file.name}
                          </a>
                        )
                      )}
                      <p className="text-[10px] opacity-60 mt-1 text-left">
                        {new Date(msg.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {typing && <p className="text-xs text-zinc-500 animate-pulse">{typing}</p>}
              <div ref={bottomRef} />
            </div>

            {/* File Preview */}
            {file && (
              <div className="mx-5 mb-2 flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2">
                <FileText size={14} className="text-orange-400" />
                <span className="text-xs text-zinc-300 flex-1 truncate">{file.name}</span>
                <button onClick={() => setFile(null)} className="text-zinc-500 hover:text-red-400 transition"><X size={14} /></button>
              </div>
            )}

            {/* Input */}
            <div className="px-5 py-4 border-t border-zinc-800 flex items-center gap-3">
              <input ref={fileRef} type="file" className="hidden"
                onChange={(e) => setFile(e.target.files[0])} />
              <button onClick={() => fileRef.current.click()}
                className="p-2 text-zinc-500 hover:text-orange-400 transition">
                <Paperclip size={18} />
              </button>
              <input value={text} onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="اكتب رسالة..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition" />
              <button onClick={send} disabled={sending || (!text.trim() && !file)}
                className="p-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl transition">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
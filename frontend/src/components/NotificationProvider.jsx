import { useEffect, useState, createContext, useContext } from "react";
import { Bell, X, CheckCircle2, XCircle, ShoppingCart, Package, ClipboardCheck, FileText } from "lucide-react";
import socket from "../socket/socket.js";

// ─────────────────────────────────────────────────────────────────
const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

const TYPE_MAP = {
  new_purchase_request: { icon: FileText,       color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  new_price_offer:      { icon: FileText,       color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20" },
  offer_approved:       { icon: CheckCircle2,   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  offer_rejected:       { icon: XCircle,        color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
  new_purchase_order:   { icon: ShoppingCart,   color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20" },
  order_complete:       { icon: Package,        color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  new_inspection:       { icon: ClipboardCheck, color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  inspection_approved:  { icon: CheckCircle2,   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  added_to_inventory:   { icon: Package,        color: "text-teal-400",    bg: "bg-teal-500/10 border-teal-500/20" },
};

// ─────────────────────────────────────────────────────────────────
// Toast Component
// ─────────────────────────────────────────────────────────────────
function Toast({ notification, onRemove }) {
  const t = TYPE_MAP[notification.type] || { icon: Bell, color: "text-zinc-400", bg: "bg-zinc-800 border-zinc-700" };
  const Icon = t.icon;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(notification.id), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex items-start gap-3 border rounded-2xl px-4 py-3 shadow-2xl shadow-black/50 w-80 animate-in slide-in-from-right-5 ${t.bg}`}
      dir="rtl">
      <div className={`mt-0.5 shrink-0 ${t.color}`}><Icon size={16} /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">{notification.title}</p>
        <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{notification.message}</p>
        <p className="text-xs text-zinc-600 mt-1">
          {new Date(notification.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <button onClick={() => onRemove(notification.id)} className="text-zinc-600 hover:text-white transition shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Notification Bell + Dropdown
// ─────────────────────────────────────────────────────────────────
export function NotificationBell() {
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); markAllRead(); }}
        className="relative p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition">
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 w-4 h-4 bg-orange-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-12 w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden" dir="rtl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-white">الإشعارات</h3>
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-xs text-zinc-500 hover:text-red-400 transition">مسح الكل</button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-zinc-600">
                <Bell size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map((n) => {
                const t = TYPE_MAP[n.type] || { icon: Bell, color: "text-zinc-400", bg: "" };
                const Icon = t.icon;
                return (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition ${!n.read ? "bg-zinc-800/30" : ""}`}>
                    <Icon size={14} className={`mt-1 shrink-0 ${t.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{n.title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-zinc-600 mt-1">
                        {new Date(n.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────
export default function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts]               = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  useEffect(() => {
    let user = {};
    try { user = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}
    if (!user.role) return;

    socket.connect();
    socket.emit("join", user.role);

    socket.on("notification", (data) => {
      const id = Date.now().toString();
      const notification = { ...data, id, read: false };

      // أضفه للقائمة
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);

      // أظهره كـ toast
      setToasts((prev) => [...prev, notification]);
    });

    return () => {
      socket.off("notification");
      socket.disconnect();
    };
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const markAllRead = () => { setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))); setUnreadCount(0); };
  const clearAll    = () => { setNotifications([]); setUnreadCount(0); };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, clearAll }}>
      {children}

      {/* Toasts */}
      <div className="fixed top-4 left-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} notification={t} onRemove={removeToast} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
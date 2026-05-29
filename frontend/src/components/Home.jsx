import { useNavigate } from "react-router-dom";
import { Cog, Zap, LogOut, Factory, ChevronLeft, UserPlus, MessageSquare, ShoppingCart, Download } from "lucide-react";
import { NotificationBell } from "../components/NotificationProvider.jsx";
import { useNotifications } from "../components/NotificationProvider";
import { useEffect, useState } from "react";

const SECTIONS = [
  {
    key: "mechanical",
    label: "القسم الميكانيكي",
    labelEn: "Mechanical",
    description: "إدارة البيرينجات، الرولات، وكل قطع الغيار الميكانيكية",
    icon: Cog,
    path: "/mechanical",
    accent: "bg-orange-500",
    iconBg: "bg-orange-500/10 border-orange-500/20",
    iconColor: "text-orange-400",
    hoverBorder: "hover:border-orange-500/40",
    tag: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    items: ["بيرينجات", "رولات"],
  },
  {
    key: "purchases",
    label: "المشتريات",
    labelEn: "Purchases",
    description: "إدارة طلبات الشراء، عروض الأسعار، أوامر الشراء، والفحص والاستلام",
    icon: ShoppingCart,
    path: "/purchases/requests",
    accent: "bg-blue-500",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    iconColor: "text-blue-400",
    hoverBorder: "hover:border-blue-500/40",
    tag: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    items: ["طلبات شراء", "عروض أسعار", "أوامر شراء", "فحص واستلام"],
  },
  {
    key: "electrical",
    label: "القسم الكهربائي",
    labelEn: "Electrical",
    description: "إدارة الكونتاكتورات، الكابلات، التايمرات، والمواد الكهربائية",
    icon: Zap,
    path: "/electrical",
    accent: "bg-yellow-500",
    iconBg: "bg-yellow-500/10 border-yellow-500/20",
    iconColor: "text-yellow-400",
    hoverBorder: "hover:border-yellow-500/40",
    tag: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    items: ["كونتاكتورات", "كابلات", "تايمرات", "مفاتيح", "ميترو ستار", "خراطيم"],
  },
];

const CAN_CREATE = ["developer", "gm", "ceo"];


export default function Home() {
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const { unreadCount, chatUnread, clearChatUnread } = useNotifications(); // ← هنا
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const canCreateUser = CAN_CREATE.includes(user?.role);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    });
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setShowInstall(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">

      {/* Navbar */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
        
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showInstall && (
          <button onClick={handleInstall}
            className="flex items-center gap-2 text-zinc-400 hover:text-orange-400 text-sm transition px-3 py-1.5 rounded-xl hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20">
            <Download size={15} />
            تثبيت التطبيق
          </button>
        )}
            <div className="w-9 h-9 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center">
              <Factory size={18} className="text-orange-500" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">Iron Factory</h1>
              <p className="text-[10px] text-zinc-500 mt-0.5">نظام إدارة المخزون</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.name && (
              <span className="text-xs text-zinc-500 ml-2">
                مرحباً، <span className="text-zinc-300 font-medium">{user.name}</span>
              </span>
            )}
            {user?.role && (
              <span className="text-xs text-zinc-500 ml-2">
                The Role {user.role}
              </span>
            )}

            {canCreateUser && (
              <button
                onClick={() => navigate("/create-user")}
                className="flex items-center gap-2 text-zinc-400 hover:text-orange-400 text-sm transition px-3 py-1.5 rounded-xl hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20"
              >
                <UserPlus size={15} />
                مستخدم جديد
              </button>

            )}
            <button
              onClick={() => { navigate("/chat"); clearChatUnread(); }}
              className="relative flex items-center gap-2 text-zinc-400 hover:text-orange-400 text-sm transition px-3 py-1.5 rounded-xl hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20"
            >
              <MessageSquare size={15} />
              المحادثات
              {chatUnread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {chatUnread > 9 ? "9+" : chatUnread}
                </span>
              )}
            </button>
            <NotificationBell />
<button
  onClick={() => navigate("/users")}
  className="flex items-center gap-2 text-zinc-400 hover:text-orange-400 text-sm transition px-3 py-1.5 rounded-xl hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20">
  إدارة المستخدمين
</button>            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-zinc-400 hover:text-red-400 text-sm transition px-3 py-1.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
            >
              <LogOut size={15} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-16">
        <div className="mb-12">
          <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
            لوحة التحكم الرئيسية
          </span>
          <p className="text-zinc-500 mt-3 text-sm max-w-md leading-relaxed">
            اختر القسم الذي تريد إدارته —
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                onClick={() => navigate(s.path)}
                className={`group relative bg-zinc-900/60 border border-zinc-800 ${s.hoverBorder} rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-black/40`}
              >
                <div className={`absolute top-0 left-0 right-0 h-px ${s.accent} opacity-50`} />
                <div className="p-7">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl border ${s.iconBg} flex items-center justify-center`}>
                      <Icon size={24} className={s.iconColor} />
                    </div>
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-lg ${s.tag}`}>
                      {s.labelEn}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{s.label}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6">{s.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {s.items.map((item) => (
                      <span key={item} className="text-xs text-zinc-500 bg-zinc-800/80 border border-zinc-700/50 px-2.5 py-1 rounded-lg">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition">
                      فتح القسم
                    </span>
                    <div className={`w-8 h-8 rounded-xl border ${s.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <ChevronLeft size={16} className={s.iconColor} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-zinc-700 text-xs mt-16">
          Iron Factory System — نظام إدارة مخازن المصنع
        </p>
      </div>
    </div>
  );
}
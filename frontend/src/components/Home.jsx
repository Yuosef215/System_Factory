import { useNavigate } from "react-router-dom";
import { Cog, Zap, LogOut, ChevronLeft, UserPlus, MessageSquare,Activity, ShoppingCart, Download, Users, Package, TrendingDown, TrendingUp, Clock } from "lucide-react";
import { NotificationBell } from "../components/NotificationProvider.jsx";
import { useNotifications } from "../components/NotificationProvider";
import { useEffect, useState } from "react";
import api from "../api/axios";

// ─────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  {
    key: "warehouse",
    label: "المخازن",
    color: "text-teal-400",
    border: "border-teal-500/20",
    bg: "bg-teal-500/5",
    sections: [
      {
        key: "mechanical",
        label: "مخزن الميكانيكا",
        labelEn: "Mechanical",
        description: "إدارة البلي، الدرافيل، وكل قطع الغيار الميكانيكية",
        icon: Cog,
        path: "/mechanical",
        accent: "bg-orange-500",
        iconBg: "bg-orange-500/10 border-orange-500/20",
        iconColor: "text-orange-400",
        hoverBorder: "hover:border-orange-500/40",
        tag: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        items: ["بلي", "الدرافيل"],
      },
      {
        key: "electrical",
        label: "مخزن الكهرباء",
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
    ],
  },
  {
    key: "resources",
    label: "الموارد البشرية",
    color: "text-pink-400",
    border: "border-pink-500/20",
    bg: "bg-pink-500/5",
    sections: [
      {
        key: "hr",
        label: "الموارد البشرية",
        labelEn: "HR",
        description: "إدارة الموظفين والحضور والمرتبات والإجازات",
        icon: Users,
        path: "/hr",
        accent: "bg-pink-500",
        iconBg: "bg-pink-500/10 border-pink-500/20",
        iconColor: "text-pink-400",
        hoverBorder: "hover:border-pink-500/40",
        tag: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
        items: ["موظفين", "حضور وغياب", "إجازات", "مرتبات"],
      },
    ],
  },
  {
    key: "purchases",
    label: "المشتريات",
    color: "text-blue-400",
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    sections: [
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
    ],
  },

];

const CAN_CREATE = ["developer", "gm", "ceo"];

// ─────────────────────────────────────────────────────────────────
// Section Card
// ─────────────────────────────────────────────────────────────────
function SectionCard({ s, onClick }) {
  const Icon = s.icon;
  return (
    <div
      onClick={onClick}
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
}

// ─────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [recentMovements, setRecentMovements] = useState([]);
  const { chatUnread, clearChatUnread } = useNotifications();

  let user = {};
  try { user = JSON.parse(localStorage.getItem("user") || "{}"); } catch { }

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

    // جيب آخر الحركات
    const fetchMovements = async () => {
      try {
        const [bearingRes, rollRes] = await Promise.all([
          api.get("/ball-bearing/recent-movements"),
          api.get("/rolls/recent-movements"),
        ]);
        const all = [
          ...bearingRes.data.data.map((m) => ({ ...m, category: "بلي" })),
          ...rollRes.data.data.map((m) => ({ ...m, category: "رول" })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
        setRecentMovements(all);
      } catch { }
    };
    fetchMovements();
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
        <div className="max-w-7xl mx-auto px-1 py-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {showInstall && (
              <button onClick={handleInstall}
                className="flex items-center gap-2 text-zinc-400 hover:text-orange-400 text-sm transition px-3 py-1.5 rounded-xl hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20">
                <Download size={15} /> تثبيت التطبيق
              </button>
            )}
            <div className="w-13 h-11 rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">Phoenix Steel Bird</h1>
              <p className="text-[10px] text-zinc-500 mt-0.5">نظام إدارة المخازن والمشتريات والموظفين</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.name && (
              <span className="text-xs text-zinc-500 ml-2">
                مرحباً، <span className="text-zinc-300 font-medium">{user.name}</span>
              </span>
            )}
            {user?.role && (
              <span className="text-xs text-zinc-500 ml-2">The Role {user.role}</span>
            )}
            {["developer","ceo", "gm"].includes(user?.role) && canCreateUser && (
              <button onClick={() => navigate("/create-user")}
                className="flex items-center gap-2 text-zinc-400 hover:text-orange-400 text-sm transition px-3 py-1.5 rounded-xl hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20">
                <UserPlus size={15} /> مستخدم جديد
              </button>
            )}
            <button
              onClick={() => { navigate("/chat"); clearChatUnread(); }}
              className="relative flex items-center gap-2 text-zinc-400 hover:text-orange-400 text-sm transition px-3 py-1.5 rounded-xl hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20">
              <MessageSquare size={15} /> المحادثات
              {chatUnread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {chatUnread > 9 ? "9+" : chatUnread}
                </span>
              )}
            </button>
            <NotificationBell />
            <button onClick={() => navigate("/users")}
              className="flex items-center gap-2 text-zinc-400 hover:text-orange-400 text-sm transition px-3 py-1.5 rounded-xl hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20">
              إدارة المستخدمين
            </button>
            {user?.role === "developer" && (
              <button onClick={() => navigate("/activity-log")}
                className="flex items-center gap-2 text-zinc-400 hover:text-orange-400 text-sm transition px-3 py-1.5 rounded-xl hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20">
                <Activity size={15} /> سجل النشاط
              </button>
            )}
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-zinc-400 hover:text-red-400 text-sm transition px-3 py-1.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20">
              <LogOut size={15} /> تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-16 space-y-10">

        <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
          لوحة التحكم الرئيسية
        </span>

        {/* الأقسام الثلاثة */}
        {DEPARTMENTS.map((dept) => (
          <div key={dept.key}>
            {/* عنوان القسم */}
            <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${dept.border}`}>
              <h2 className={`text-base font-bold ${dept.color}`}>{dept.label}</h2>
              <div className={`flex-1 h-px ${dept.border} border-t`} />
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dept.sections.map((s) => (
                <SectionCard key={s.key} s={s} onClick={() => navigate(s.path)} />
              ))}
            </div>
          </div>
        ))}

        {/* Audit Log */}
        {recentMovements.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
              <Clock size={15} className="text-orange-400" />
              <h2 className="text-sm font-bold text-white">آخر حركات المخزون</h2>
            </div>
            <div className="rounded-2xl border border-zinc-800/80 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-900/80 text-zinc-500 text-xs border-b border-zinc-800">
                    <th className="text-right py-3 px-4 font-medium">الصنف</th>
                    <th className="text-right py-3 px-4 font-medium">النوع</th>
                    <th className="text-right py-3 px-4 font-medium">العملية</th>
                    <th className="text-right py-3 px-4 font-medium">الكمية</th>
                    <th className="text-right py-3 px-4 font-medium">قبل</th>
                    <th className="text-right py-3 px-4 font-medium">بعد</th>
                    <th className="text-right py-3 px-4 font-medium">بواسطة</th>
                    <th className="text-right py-3 px-4 font-medium">الوقت</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map((m) => (
                    <tr key={m._id} className="border-t border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-zinc-300">
                        {m.ballBearing?.code || m.roll?.code || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-lg">
                          {m.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold
                          ${m.process === "صرف" ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                          {m.process === "صرف" ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                          {m.process}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{m.quantity}</td>
                      <td className="py-3 px-4 text-zinc-500">{m.balanceBefore}</td>
                      <td className="py-3 px-4 text-zinc-500">{m.balanceAfter}</td>
                      <td className="py-3 px-4 text-zinc-400 text-xs">{m.createdBy}</td>
                      <td className="py-3 px-4 text-zinc-500 text-xs">
                        {new Date(m.createdAt).toLocaleString("ar-EG", {
                          day: "2-digit", month: "short",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="text-center text-zinc-700 text-xs">
          Phoenix Steel Bird — نظام إدارة المخازن والمشتريات والموظفين
        </p>
      </div>
    </div>
  );
}
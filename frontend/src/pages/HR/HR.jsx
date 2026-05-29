import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Users, Calendar, FileText,
  Wallet, TrendingUp, UserCheck, UserX, RefreshCw, Loader2
} from "lucide-react";
import api from "../../api/axios";

export default function HR() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/hr/employees/stats")
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const SECTIONS = [
    {
      label: "الموظفين", icon: Users, path: "/hr/employees",
      color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20",
      description: "إدارة بيانات الموظفين",
    },
    {
      label: "الحضور والغياب", icon: Calendar, path: "/hr/attendance",
      color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",
      description: "تسجيل ومتابعة الحضور اليومي",
    },
    {
      label: "الإجازات", icon: FileText, path: "/hr/leaves",
      color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20",
      description: "طلبات وإدارة الإجازات",
    },
    {
      label: "المرتبات", icon: Wallet, path: "/hr/salary",
      color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20",
      description: "حساب وصرف المرتبات الشهرية",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/home")}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm font-medium">
              <ArrowRight size={16} /> الرئيسية
            </button>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-orange-400" />
              <span className="text-white font-semibold text-sm">الموارد البشرية</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Stats */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-zinc-500" size={24} />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "إجمالي الموظفين", value: stats?.total || 0,      color: "text-white",         bg: "bg-zinc-800/50" },
              { label: "نشط",             value: stats?.active || 0,     color: "text-emerald-400",   bg: "bg-emerald-500/10 border border-emerald-500/20" },
              { label: "غير نشط",         value: stats?.inactive || 0,   color: "text-amber-400",     bg: "bg-amber-500/10 border border-amber-500/20" },
              { label: "منتهي الخدمة",    value: stats?.terminated || 0, color: "text-red-400",       bg: "bg-red-500/10 border border-red-500/20" },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl px-5 py-4 ${s.bg}`}>
                <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Sections Grid */}
        <div className="grid grid-cols-2 gap-4">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} onClick={() => navigate(s.path)}
                className="group bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-black/30">
                <div className={`w-12 h-12 rounded-xl border ${s.bg} flex items-center justify-center mb-4`}>
                  <Icon size={22} className={s.color} />
                </div>
                <h3 className="text-base font-bold text-white mb-1">{s.label}</h3>
                <p className="text-xs text-zinc-500">{s.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
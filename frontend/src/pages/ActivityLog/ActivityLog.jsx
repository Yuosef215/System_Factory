import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Activity, RefreshCw, Loader2,
  Search, Calendar, X
} from "lucide-react";
import api from "../../api/axios";

const MODULE_COLOR = {
  BallBearing: { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  Roll:        { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  Contactor:   { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  Cable:       { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  Purchase:    { color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
  HR:          { color: "text-pink-400",   bg: "bg-pink-500/10 border-pink-500/20" },
};

export default function ActivityLog() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [logs, setLogs]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [search, setSearch]             = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [dateFilter, setDateFilter]     = useState(today);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await api.get("/activity/get_allActivity_log");
      setLogs(res.data.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchLogs(); }, []);

  const modules = [...new Set(logs.map((l) => l.module).filter(Boolean))];

  const filtered = logs.filter((l) => {
    const matchSearch = l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.user?.toLowerCase().includes(search.toLowerCase());
    const matchModule = moduleFilter === "all" || l.module === moduleFilter;
    const matchDate   = !dateFilter || new Date(l.createdAt).toISOString().split("T")[0] === dateFilter;
    return matchSearch && matchModule && matchDate;
  });

  // جمّع الـ logs حسب اليوم
  const groupedByDate = filtered.reduce((acc, log) => {
    const date = new Date(log.createdAt).toLocaleDateString("ar-EG", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric"
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const clearFilters = () => {
    setSearch("");
    setModuleFilter("all");
    setDateFilter("");
  };

  const hasFilters = search || moduleFilter !== "all" || dateFilter !== today;

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">

      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/home")}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm">
              <ArrowRight size={16} /> الرئيسية
            </button>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-orange-400" />
              <span className="text-white font-semibold text-sm">سجل النشاط</span>
            </div>
          </div>
          <button onClick={() => fetchLogs(true)} disabled={refreshing}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl transition">
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "إجمالي النشاطات", value: logs.length,       color: "text-white",      bg: "bg-zinc-800/50" },
            { label: "اليوم",           value: logs.filter((l) => new Date(l.createdAt).toISOString().split("T")[0] === today).length,
             color: "text-orange-400", bg: "bg-orange-500/10 border border-orange-500/20" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl px-5 py-4 ${s.bg}`}>
              <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* بحث */}
          <div className="relative">
            <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالنشاط أو المستخدم..."
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 pr-9 text-sm text-white placeholder:text-zinc-600 outline-none w-56" />
          </div>

          {/* فلتر القسم */}
          

          {/* فلتر التاريخ */}
          <div className="relative flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
            <Calendar size={14} className="text-zinc-500" />
            <input type="date" value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-sm text-white outline-none"
              style={{ colorScheme: "dark" }} />
            {dateFilter && (
              <button onClick={() => setDateFilter("")}
                className="text-zinc-500 hover:text-red-400 transition">
                <X size={13} />
              </button>
            )}
          </div>

          {/* أزرار سريعة للأيام */}
          <div className="flex items-center gap-1">
            <button onClick={() => setDateFilter(today)}
              className={`text-xs px-3 py-1.5 rounded-lg transition border
                ${dateFilter === today ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"}`}>
              اليوم
            </button>
            <button onClick={() => {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              setDateFilter(yesterday.toISOString().split("T")[0]);
            }}
              className="text-xs px-3 py-1.5 rounded-lg transition border bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white">
              أمس
            </button>
            <button onClick={() => setDateFilter("")}
              className={`text-xs px-3 py-1.5 rounded-lg transition border
                ${!dateFilter ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"}`}>
              الكل
            </button>
          </div>

          {hasFilters && (
            <button onClick={clearFilters}
              className="text-xs text-zinc-500 hover:text-white px-3 py-2 bg-zinc-800 rounded-xl transition">
              مسح الكل
            </button>
          )}
          <span className="text-xs text-zinc-600 mr-auto">{filtered.length} نشاط</span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24 gap-3 text-zinc-500">
            <Loader2 className="animate-spin" size={22} /> جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            <Activity size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا يوجد نشاط</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, dateLogs]) => (
              <div key={date}>
                {/* تاريخ اليوم */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
                    <Calendar size={12} className="text-orange-400" />
                    <span className="text-xs font-semibold text-zinc-300">{date}</span>
                    <span className="text-xs text-zinc-600">({dateLogs.length} نشاط)</span>
                  </div>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                {/* جدول اليوم */}
                <div className="rounded-2xl border border-zinc-800/80 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-zinc-900/80 text-zinc-500 text-xs border-b border-zinc-800">
                        <th className="text-right py-3 px-5 font-medium">النشاط</th>
                        <th className="text-right py-3 px-4 font-medium">المستخدم</th>
                        <th className="text-right py-3 px-4 font-medium">الوقت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dateLogs.map((log) => {
                        const mod = MODULE_COLOR[log.module] || { color: "text-zinc-400", bg: "bg-zinc-800 border-zinc-700" };
                        return (
                          <tr key={log._id} className="border-t border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                  <Activity size={12} className={mod.color} />
                                </div>
                                <div>
                                  <p className="text-zinc-300 text-sm">{log.action}</p>
                                  {log.module && (
                                    <span className={`inline-flex text-[10px] px-1.5 py-0.5 rounded-md font-medium border mt-0.5 ${mod.bg} ${mod.color}`}>
                                      {log.module}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-zinc-400 text-xs">{log.user || "—"}</td>
                            <td className="py-3 px-4 text-zinc-500 text-xs">
                              {new Date(log.createdAt).toLocaleTimeString("ar-EG", {
                                hour: "2-digit", minute: "2-digit"
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
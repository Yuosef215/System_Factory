import { useNavigate } from "react-router-dom";
import { Cog, CircleDot, ArrowRight } from "lucide-react";

const SECTIONS = [
  {
    key: "ballbearings",
    label: "البيرينجات",
    description: "إدارة مخزون البيرينجات، الصرف، الإضافة، وعرض الحركات",
    icon: CircleDot,
    color: "from-orange-500/20 to-orange-600/5",
    border: "border-orange-500/20",
    iconColor: "text-orange-400",
    path: "/ballbearings",
  },
  {
    key: "rolls",
    label: "الرولات",
    description: "إدارة مخزون الرولات وتتبع حركات الصرف والإضافة",
    icon: Cog,
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
    path: "/rolls",
  },
];

export default function Mechanical() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-zinc-800/60 px-8 py-5">
        <div className="flex items-center gap-3 text-sm text-zinc-500 mb-1">
          <button onClick={() => navigate("/home")} className="hover:text-white transition flex items-center gap-1.5">
            <ArrowRight size={14} /> الرئيسية
          </button>
          <span>/</span>
          <span className="text-white">الميكانيكا</span>
        </div>
        <h1 className="text-2xl font-bold text-white">القسم الميكانيكي</h1>
        <p className="text-zinc-500 text-sm mt-1">اختر القسم الفرعي</p>
      </div>

      <div className="px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-3xl">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.key} onClick={() => navigate(s.path)}
                className={`group text-right bg-gradient-to-br ${s.color} border ${s.border} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-200 shadow-lg`}>
                <div className={`w-11 h-11 rounded-xl bg-zinc-900 flex items-center justify-center mb-4 ${s.iconColor}`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{s.label}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{s.description}</p>
                <div className="flex items-center gap-1 mt-4 text-xs text-zinc-500 group-hover:text-white transition">
                  <span>فتح القسم</span>
                  <ArrowRight size={12} className="rotate-180" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

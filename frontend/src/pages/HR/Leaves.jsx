import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Plus, Loader2, X, AlertTriangle,
  FileText, CheckCircle2, XCircle, Clock
} from "lucide-react";
import api from "../../api/axios";

const TYPE_MAP = {
  annual:    { label: "سنوية" },
  sick:      { label: "مرضية" },
  emergency: { label: "طارئة" },
  unpaid:    { label: "بدون راتب" },
};

const STATUS_MAP = {
  pending:  { label: "انتظار",  color: "text-zinc-400",   bg: "bg-zinc-800 border-zinc-700",           icon: Clock },
  approved: { label: "موافق",   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  rejected: { label: "مرفوض",  color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",         icon: XCircle },
};

const inputCls = "w-full bg-zinc-900 border border-zinc-700/80 focus:border-orange-500/70 outline-none rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 transition-all";

function Modal({ title, onClose, children, width = "max-w-lg" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-[#111113] border border-zinc-800 rounded-2xl w-full ${width} shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-800">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function CreateLeaveModal({ employees, onClose, onSuccess }) {
  const [form, setForm] = useState({ employee: "", type: "annual", startDate: "", endDate: "", reason: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!form.employee || !form.startDate || !form.endDate) return setError("جميع الحقول مطلوبة");
    try {
      setLoading(true);
      await api.post("/hr/leaves", form);
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally { setLoading(false); }
  };

  return (
    <Modal title="طلب إجازة جديد" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">الموظف *</label>
          <select value={form.employee} onChange={(e) => setForm((p) => ({ ...p, employee: e.target.value }))} className={inputCls}>
            <option value="">اختر الموظف</option>
            {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">نوع الإجازة *</label>
          <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className={inputCls}>
            {Object.entries(TYPE_MAP).map(([val, t]) => <option key={val} value={val}>{t.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">من *</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              className={inputCls} style={{ colorScheme: "dark" }} />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">إلى *</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
              className={inputCls} style={{ colorScheme: "dark" }} />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">السبب</label>
          <textarea value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            rows={3} className={`${inputCls} resize-none`} />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            <AlertTriangle size={15} /> {error}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إلغاء</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} إرسال الطلب
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function Leaves() {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [leavesRes, empRes] = await Promise.all([
        api.get("/hr/leaves"),
        api.get("/hr/employees"),
      ]);
      setLeaves(leavesRes.data.data);
      setEmployees(empRes.data.data.filter((e) => e.status === "active"));
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/hr/leaves/${id}/status`, { status });
    fetchData();
  };

  const filtered = statusFilter === "all" ? leaves : leaves.filter((l) => l.status === statusFilter);

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/hr")} className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm">
              <ArrowRight size={16} /> الموارد البشرية
            </button>
            <span className="text-zinc-700">/</span>
            <span className="text-white font-semibold text-sm">الإجازات</span>
          </div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white outline-none">
              <option value="all">كل الحالات</option>
              <option value="pending">انتظار</option>
              <option value="approved">موافق</option>
              <option value="rejected">مرفوض</option>
            </select>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
              <Plus size={16} /> طلب إجازة
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "انتظار",  value: leaves.filter((l) => l.status === "pending").length,  color: "text-zinc-400",    bg: "bg-zinc-800/50" },
            { label: "موافق",   value: leaves.filter((l) => l.status === "approved").length, color: "text-emerald-400", bg: "bg-emerald-500/10 border border-emerald-500/20" },
            { label: "مرفوض",  value: leaves.filter((l) => l.status === "rejected").length, color: "text-red-400",     bg: "bg-red-500/10 border border-red-500/20" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl px-5 py-4 ${s.bg}`}>
              <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-zinc-500"><Loader2 className="animate-spin" size={22} /></div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/80 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-500 text-xs border-b border-zinc-800">
                  <th className="text-right py-3.5 px-5 font-medium">الموظف</th>
                  <th className="text-right py-3.5 px-4 font-medium">النوع</th>
                  <th className="text-right py-3.5 px-4 font-medium">من</th>
                  <th className="text-right py-3.5 px-4 font-medium">إلى</th>
                  <th className="text-right py-3.5 px-4 font-medium">الأيام</th>
                  <th className="text-right py-3.5 px-4 font-medium">الحالة</th>
                  <th className="py-3.5 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-zinc-600">
                    <FileText size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">لا توجد إجازات</p>
                  </td></tr>
                ) : filtered.map((l) => {
                  const s = STATUS_MAP[l.status];
                  const Icon = s.icon;
                  return (
                    <tr key={l._id} className="border-t border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-white">{l.employee?.name}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{TYPE_MAP[l.type]?.label}</td>
                      <td className="py-3.5 px-4 text-zinc-300 text-xs">{new Date(l.startDate).toLocaleDateString("ar-EG")}</td>
                      <td className="py-3.5 px-4 text-zinc-300 text-xs">{new Date(l.endDate).toLocaleDateString("ar-EG")}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{l.days} يوم</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${s.bg} ${s.color}`}>
                          <Icon size={11} /> {s.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {l.status === "pending" && (
                          <div className="flex items-center gap-1.5 justify-end">
                            <button onClick={() => updateStatus(l._id, "approved")}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition">
                              <CheckCircle2 size={14} />
                            </button>
                            <button onClick={() => updateStatus(l._id, "rejected")}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">
                              <XCircle size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <CreateLeaveModal employees={employees} onClose={() => setShowModal(false)} onSuccess={fetchData} />}
    </div>
  );
}
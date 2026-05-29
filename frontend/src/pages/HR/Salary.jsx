import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Plus, Loader2, X, AlertTriangle,
  Wallet, CheckCircle2, Calculator
} from "lucide-react";
import api from "../../api/axios";

const inputCls = "w-full bg-zinc-900 border border-zinc-700/80 focus:border-orange-500/70 outline-none rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 transition-all";

function Modal({ title, onClose, children, width = "max-w-md" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-[#111113] border border-zinc-800 rounded-2xl w-full ${width} shadow-2xl`}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-800">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function CalculateModal({ employees, month, year, onClose, onSuccess }) {
  const [form, setForm] = useState({ employeeId: "", bonus: 0, deductions: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!form.employeeId) return setError("اختر الموظف");
    try {
      setLoading(true);
      await api.post("/hr/salary/calculate", { ...form, month, year });
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally { setLoading(false); }
  };

  return (
    <Modal title="حساب مرتب" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">الموظف *</label>
          <select value={form.employeeId} onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))} className={inputCls}>
            <option value="">اختر الموظف</option>
            {employees.map((e) => <option key={e._id} value={e._id}>{e.name} — {e.salary?.toLocaleString()} ج</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">مكافأة</label>
            <input type="number" min={0} value={form.bonus}
              onChange={(e) => setForm((p) => ({ ...p, bonus: Number(e.target.value) }))} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">خصومات</label>
            <input type="number" min={0} value={form.deductions}
              onChange={(e) => setForm((p) => ({ ...p, deductions: Number(e.target.value) }))} className={inputCls} />
          </div>
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
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} />} احسب
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function Salary() {
  const navigate = useNavigate();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [salRes, empRes] = await Promise.all([
        api.get(`/hr/salary/monthly?month=${month}&year=${year}`),
        api.get("/hr/employees"),
      ]);
      setSalaries(salRes.data.data);
      setTotal(salRes.data.total);
      setEmployees(empRes.data.data.filter((e) => e.status === "active"));
    } catch {}
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const paySalary = async (id) => {
    await api.patch(`/hr/salary/${id}/pay`);
    fetchData();
  };

  const MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/hr")} className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm">
              <ArrowRight size={16} /> الموارد البشرية
            </button>
            <span className="text-zinc-700">/</span>
            <span className="text-white font-semibold text-sm">المرتبات</span>
          </div>
          <div className="flex items-center gap-2">
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white outline-none">
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white outline-none w-24" />
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
              <Plus size={16} /> حساب مرتب
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "إجمالي المرتبات", value: `${total?.toLocaleString()} ج`, color: "text-white",       bg: "bg-zinc-800/50" },
            { label: "تم الصرف",        value: salaries.filter((s) => s.status === "paid").length,    color: "text-emerald-400", bg: "bg-emerald-500/10 border border-emerald-500/20" },
            { label: "لم يُصرف",        value: salaries.filter((s) => s.status === "pending").length, color: "text-amber-400",   bg: "bg-amber-500/10 border border-amber-500/20" },
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
                  <th className="text-right py-3.5 px-4 font-medium">الراتب الأساسي</th>
                  <th className="text-right py-3.5 px-4 font-medium">مكافأة</th>
                  <th className="text-right py-3.5 px-4 font-medium">خصم الغياب</th>
                  <th className="text-right py-3.5 px-4 font-medium">خصومات</th>
                  <th className="text-right py-3.5 px-4 font-medium">الصافي</th>
                  <th className="text-right py-3.5 px-4 font-medium">الحالة</th>
                  <th className="py-3.5 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {salaries.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-16 text-zinc-600">
                    <Wallet size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">لا توجد مرتبات لهذا الشهر</p>
                  </td></tr>
                ) : salaries.map((s) => (
                  <tr key={s._id} className="border-t border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-white">{s.employee?.name}</td>
                    <td className="py-3.5 px-4 text-zinc-300 font-mono">{s.baseSalary?.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-mono">{s.bonus > 0 ? `+${s.bonus?.toLocaleString()}` : "—"}</td>
                    <td className="py-3.5 px-4 text-red-400 font-mono">{s.absenceDeduction > 0 ? `-${s.absenceDeduction?.toLocaleString()}` : "—"}</td>
                    <td className="py-3.5 px-4 text-red-400 font-mono">{s.deductions > 0 ? `-${s.deductions?.toLocaleString()}` : "—"}</td>
                    <td className="py-3.5 px-4 font-bold text-orange-400 font-mono">{s.netSalary?.toLocaleString()} ج</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border
                        ${s.status === "paid" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}>
                        {s.status === "paid" ? "تم الصرف" : "لم يُصرف"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.status === "pending" && (
                        <button onClick={() => paySalary(s._id)}
                          className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition">
                          <CheckCircle2 size={12} /> صرف
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <CalculateModal employees={employees} month={month} year={year} onClose={() => setShowModal(false)} onSuccess={fetchData} />}
    </div>
  );
}
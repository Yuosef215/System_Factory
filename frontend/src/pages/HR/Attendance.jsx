import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight, Plus, RefreshCw, Loader2, X,
    AlertTriangle, Calendar, CheckCircle2, XCircle, Clock, Filter
} from "lucide-react";
import api from "../../api/axios";

const STATUS_MAP = {
    present: { label: "حاضر", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    absent: { label: "غائب", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    late: { label: "متأخر", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    half_day: { label: "نصف يوم", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
};

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

function RecordModal({ employees, onClose, onSuccess }) {
    const [form, setForm] = useState({
        employee: "", date: new Date().toISOString().split("T")[0],
        checkIn: "", checkOut: "", status: "present", notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async () => {
        setError("");
        if (!form.employee || !form.date) return setError("الموظف والتاريخ مطلوبان");
        try {
            setLoading(true);
            // ✅ الجديد
            const payload = {
                ...form,
                checkIn: form.checkIn ? new Date(`${form.date}T${form.checkIn}`) : null,
                checkOut: form.checkOut ? new Date(`${form.date}T${form.checkOut}`) : null,
            };
            await api.post("/hr/attendance", payload);
            onSuccess(); onClose();
        } catch (err) {
            setError(err.response?.data?.message || "حدث خطأ");
        } finally { setLoading(false); }
    };

    return (
        <Modal title="تسجيل حضور" onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-zinc-400 mb-1 block">الموظف *</label>
                    <select value={form.employee} onChange={(e) => setForm((p) => ({ ...p, employee: e.target.value }))} className={inputCls}>
                        <option value="">اختر الموظف</option>
                        {employees.map((e) => <option key={e._id} value={e._id}>{e.name} — {e.department}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-zinc-400 mb-1 block">التاريخ *</label>
                    <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                        className={inputCls} style={{ colorScheme: "dark" }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-zinc-400 mb-1 block">وقت الحضور</label>
                        <input type="time" value={form.checkIn} onChange={(e) => setForm((p) => ({ ...p, checkIn: e.target.value }))}
                            className={inputCls} style={{ colorScheme: "dark" }} />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-400 mb-1 block">وقت الانصراف</label>
                        <input type="time" value={form.checkOut} onChange={(e) => setForm((p) => ({ ...p, checkOut: e.target.value }))}
                            className={inputCls} style={{ colorScheme: "dark" }} />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-zinc-400 mb-1 block">الحالة</label>
                    <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className={inputCls}>
                        {Object.entries(STATUS_MAP).map(([val, s]) => <option key={val} value={val}>{s.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-zinc-400 mb-1 block">ملاحظات</label>
                    <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                        rows={2} className={`${inputCls} resize-none`} />
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
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} تسجيل
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default function Attendance() {
    const navigate = useNavigate();
    const today = new Date().toISOString().split("T")[0];
    const [date, setDate] = useState(today);
    const [attendance, setAttendance] = useState([]);
    const [absent, setAbsent] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const [attRes, empRes] = await Promise.all([
                api.get(`/hr/attendance/daily?date=${date}`),
                api.get("/hr/employees"),
            ]);
            setAttendance(attRes.data.data);
            setAbsent(attRes.data.absent);
            setEmployees(empRes.data.data.filter((e) => e.status === "active"));
        } catch { }
        finally { setLoading(false); }
    }, [date]);

    useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

    return (
        <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">
            <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate("/hr")} className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm">
                            <ArrowRight size={16} /> الموارد البشرية
                        </button>
                        <span className="text-zinc-700">/</span>
                        <span className="text-white font-semibold text-sm">الحضور والغياب</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white outline-none"
                            style={{ colorScheme: "dark" }} />
                        <button onClick={fetchAttendance} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl transition">
                            <Filter size={16} />
                        </button>
                        <button onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                            <Plus size={16} /> تسجيل حضور
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: "حاضر", value: attendance.filter((a) => a.status === "present").length, color: "text-emerald-400", bg: "bg-emerald-500/10 border border-emerald-500/20" },
                        { label: "غائب", value: absent.length, color: "text-red-400", bg: "bg-red-500/10 border border-red-500/20" },
                        { label: "متأخر", value: attendance.filter((a) => a.status === "late").length, color: "text-amber-400", bg: "bg-amber-500/10 border border-amber-500/20" },
                        { label: "نصف يوم", value: attendance.filter((a) => a.status === "half_day").length, color: "text-blue-400", bg: "bg-blue-500/10 border border-blue-500/20" },
                    ].map((s) => (
                        <div key={s.label} className={`rounded-2xl px-5 py-4 ${s.bg}`}>
                            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-16 text-zinc-500">
                        <Loader2 className="animate-spin" size={22} />
                    </div>
                ) : (
                    <div className="rounded-2xl border border-zinc-800/80 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-zinc-900/80 text-zinc-500 text-xs border-b border-zinc-800">
                                    <th className="text-right py-3.5 px-5 font-medium">الموظف</th>
                                    <th className="text-right py-3.5 px-4 font-medium">القسم</th>
                                    <th className="text-right py-3.5 px-4 font-medium">وقت الحضور</th>
                                    <th className="text-right py-3.5 px-4 font-medium">وقت الانصراف</th>
                                    <th className="text-right py-3.5 px-4 font-medium">الحالة</th>
                                    <th className="text-right py-3.5 px-4 font-medium">ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((a) => {
                                    const s = STATUS_MAP[a.status];
                                    return (
                                        <tr key={a._id} className="border-t border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                                            <td className="py-3.5 px-5 font-semibold text-white">{a.employee?.name}</td>
                                            <td className="py-3.5 px-4 text-zinc-400">{a.employee?.department}</td>
                                            <td className="py-3.5 px-4 text-zinc-300 font-mono text-xs">
                                                {a.checkIn ? new Date(a.checkIn).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "—"}
                                            </td>
                                            <td className="py-3.5 px-4 text-zinc-300 font-mono text-xs">
                                                {a.checkOut ? new Date(a.checkOut).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "—"}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${s.bg} ${s.color}`}>
                                                    {s.label}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-zinc-500 text-xs">{a.notes || "—"}</td>
                                        </tr>
                                    );
                                })}
                                {absent.map((e) => (
                                    <tr key={e._id} className="border-t border-zinc-800/50 bg-red-500/5">
                                        <td className="py-3.5 px-5 font-semibold text-white">{e.name}</td>
                                        <td className="py-3.5 px-4 text-zinc-400">{e.department}</td>
                                        <td className="py-3.5 px-4 text-zinc-600">—</td>
                                        <td className="py-3.5 px-4 text-zinc-600">—</td>
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border bg-red-500/10 border-red-500/20 text-red-400">
                                                غائب
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-zinc-600">—</td>
                                    </tr>
                                ))}
                                {attendance.length === 0 && absent.length === 0 && (
                                    <tr><td colSpan={6} className="text-center py-16 text-zinc-600">
                                        <Calendar size={36} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">لا توجد سجلات لهذا اليوم</p>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && <RecordModal employees={employees} onClose={() => setShowModal(false)} onSuccess={fetchAttendance} />}
        </div>
    );
}
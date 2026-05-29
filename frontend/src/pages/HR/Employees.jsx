import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Plus, Search, RefreshCw, Loader2,
  X, AlertTriangle, Users, Pencil, Trash2, UserCheck
} from "lucide-react";
import api from "../../api/axios";

const DEPARTMENTS = ["الإنتاج", "الصيانة", "المشتريات", "الكهرباء", "المخازن", "الموارد البشرية", "الإدارة"];
const STATUS_MAP  = {
  active:     { label: "نشط",           color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  inactive:   { label: "غير نشط",       color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  terminated: { label: "منتهي الخدمة",  color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
};

const inputCls = "w-full bg-zinc-900 border border-zinc-700/80 focus:border-orange-500/70 focus:ring-1 focus:ring-orange-500/20 outline-none rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 transition-all";

function Modal({ title, subtitle, onClose, children, width = "max-w-2xl" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-[#111113] border border-zinc-800 rounded-2xl w-full ${width} shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-800 sticky top-0 bg-[#111113] z-10">
          <div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function EmployeeModal({ employee, onClose, onSuccess }) {
  const isEdit = !!employee;
  const [form, setForm] = useState({
    name: employee?.name || "", nationalId: employee?.nationalId || "",
    phone: employee?.phone || "", address: employee?.address || "",
    department: employee?.department || "", jobTitle: employee?.jobTitle || "",
    salary: employee?.salary || "", startDate: employee?.startDate?.split("T")[0] || "",
    status: employee?.status || "active", fingerPrintId: employee?.fingerPrintId || "",
    notes: employee?.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    setError("");
    if (!form.name || !form.nationalId || !form.department || !form.jobTitle || !form.salary || !form.startDate)
      return setError("يرجى ملء جميع الحقول المطلوبة");
    try {
      setLoading(true);
      if (isEdit) await api.put(`/hr/employees/${employee._id}`, form);
      else await api.post("/hr/employees", form);
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally { setLoading(false); }
  };

  return (
    <Modal title={isEdit ? "تعديل موظف" : "إضافة موظف جديد"} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">الاسم *</label>
            <input name="name" value={form.name} onChange={handle} className={inputCls} placeholder="الاسم الكامل" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">الرقم القومي *</label>
            <input name="nationalId" value={form.nationalId} onChange={handle} className={inputCls} placeholder="14 رقم" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">القسم *</label>
            <select name="department" value={form.department} onChange={handle} className={inputCls}>
              <option value="">اختر القسم</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">المسمى الوظيفي *</label>
            <input name="jobTitle" value={form.jobTitle} onChange={handle} className={inputCls} placeholder="مثال: مهندس صيانة" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">الراتب الأساسي *</label>
            <input name="salary" type="number" value={form.salary} onChange={handle} className={inputCls} placeholder="0" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">تاريخ التعيين *</label>
            <input name="startDate" type="date" value={form.startDate} onChange={handle} className={inputCls} style={{ colorScheme: "dark" }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">رقم الهاتف</label>
            <input name="phone" value={form.phone} onChange={handle} className={inputCls} placeholder="01xxxxxxxxx" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">رقم البصمة</label>
            <input name="fingerPrintId" value={form.fingerPrintId} onChange={handle} className={inputCls} placeholder="رقم الموظف في جهاز البصمة" />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">العنوان</label>
          <input name="address" value={form.address} onChange={handle} className={inputCls} />
        </div>
        {isEdit && (
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">الحالة</label>
            <select name="status" value={form.status} onChange={handle} className={inputCls}>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="terminated">منتهي الخدمة</option>
            </select>
          </div>
        )}
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">ملاحظات</label>
          <textarea name="notes" value={form.notes} onChange={handle} rows={2} className={`${inputCls} resize-none`} />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            <AlertTriangle size={15} /> {error}
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إلغاء</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
            {isEdit ? "حفظ التعديلات" : "إضافة الموظف"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(null);

  const fetchEmployees = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await api.get("/hr/employees");
      setEmployees(res.data.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchEmployees(); }, []);

  const deleteEmployee = async (id) => {
    if (!confirm("هل أنت متأكد من حذف الموظف؟")) return;
    await api.delete(`/hr/employees/${id}`);
    fetchEmployees(true);
  };

  const filtered = employees.filter((e) => {
    const matchSearch = e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.jobTitle?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/hr")}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm">
              <ArrowRight size={16} /> الموارد البشرية
            </button>
            <span className="text-zinc-700">/</span>
            <span className="text-white font-semibold text-sm">الموظفين</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchEmployees(true)} disabled={refreshing}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl transition">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setModal({ type: "add" })}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
              <Plus size={16} /> موظف جديد
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو الوظيفة..."
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 pr-9 text-sm text-white placeholder:text-zinc-600 outline-none w-64" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white outline-none">
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
            <option value="terminated">منتهي الخدمة</option>
          </select>
          <span className="text-xs text-zinc-600 mr-auto">{filtered.length} موظف</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-24 gap-3 text-zinc-500">
            <Loader2 className="animate-spin" size={22} /> جاري التحميل...
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/80 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-500 text-xs border-b border-zinc-800">
                  <th className="text-right py-3.5 px-5 font-medium">الاسم</th>
                  <th className="text-right py-3.5 px-4 font-medium">القسم</th>
                  <th className="text-right py-3.5 px-4 font-medium">المسمى الوظيفي</th>
                  <th className="text-right py-3.5 px-4 font-medium">الراتب</th>
                  <th className="text-right py-3.5 px-4 font-medium">تاريخ التعيين</th>
                  <th className="text-right py-3.5 px-4 font-medium">الحالة</th>
                  <th className="py-3.5 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-zinc-600">
                    <Users size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">لا يوجد موظفين</p>
                  </td></tr>
                ) : filtered.map((e) => {
                  const s = STATUS_MAP[e.status];
                  return (
                    <tr key={e._id} className="border-t border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-white">{e.name}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{e.department}</td>
                      <td className="py-3.5 px-4 text-zinc-300">{e.jobTitle}</td>
                      <td className="py-3.5 px-4 text-zinc-300 font-mono">{e.salary?.toLocaleString()} ج</td>
                      <td className="py-3.5 px-4 text-zinc-500 text-xs">
                        {new Date(e.startDate).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${s.bg} ${s.color}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => setModal({ type: "edit", employee: e })}
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteEmployee(e._id)}
                            className="p-1.5 rounded-lg bg-zinc-700/60 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal?.type === "add"  && <EmployeeModal onClose={() => setModal(null)} onSuccess={() => fetchEmployees(true)} />}
      {modal?.type === "edit" && <EmployeeModal employee={modal.employee} onClose={() => setModal(null)} onSuccess={() => fetchEmployees(true)} />}
    </div>
  );
}
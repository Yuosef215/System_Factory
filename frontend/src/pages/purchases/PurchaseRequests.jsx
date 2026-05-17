import { useEffect, useState, useCallback, Fragment, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Plus, Search, RefreshCw, Loader2, X,
  AlertTriangle, FileText, ChevronDown, Trash2, Pencil,
  Clock, CheckCircle2, XCircle, ShoppingCart, Package,
  CircleCheck, Send
} from "lucide-react";
import api from "../../api/axios";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  pending: { label: "انتظار", color: "text-zinc-400", bg: "bg-zinc-800 border-zinc-700", icon: Clock },
  price_offered: { label: "عرض سعر", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: FileText },
  approved: { label: "موافق عليه", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  rejected: { label: "مرفوض", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: XCircle },
  ordered: { label: "تم الطلب", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: ShoppingCart },
  received: { label: "تم الاستلام", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Package },
  completed: { label: "مكتمل", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20", icon: CircleCheck },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, color: "text-zinc-400", bg: "bg-zinc-800 border-zinc-700", icon: Clock };
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${s.bg} ${s.color}`}>
      <Icon size={11} /> {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Modal Wrapper
// ─────────────────────────────────────────────────────────────────
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

const inputCls = "w-full bg-zinc-900 border border-zinc-700/80 focus:border-orange-500/70 focus:ring-1 focus:ring-orange-500/20 outline-none rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 transition-all";
const selectCls = `${inputCls} appearance-none`;

function ServerError({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
      <AlertTriangle size={15} className="shrink-0" /> {msg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Create Request Modal
// ─────────────────────────────────────────────────────────────────
const UNITS = ["قطعة", "متر", "كيلو", "لتر", "علبة", "رول", "طقم"];

function CreateRequestModal({ onClose, onSuccess }) {
  const [reportNumber, setReportNumber] = useState("");
  const [loadingNumber, setLoadingNumber] = useState(true); const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ itemType: "manual", description: "", quantity: 1, unit: "قطعة",Requesting_party: "", specialized_engineer: ""}]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addItem = () => setItems((p) => [...p, { itemType: "manual", description: "", quantity: 1, unit: "قطعة" }]);
  const removeItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => setItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));


  // توليد الرقم أوتوماتيك لما الـ modal يفتح
  useEffect(() => {
    const generateNumber = async () => {
      try {
        const res = await api.get("/purchase-requests/");
        const count = res.data.count || res.data.data?.length || 0;
        const year = new Date().getFullYear();
        const seq = String(count + 1).padStart(4, "0");
        setReportNumber(`PR-${year}-${seq}`);
      } catch {
        // لو فشل — يولد بالوقت
        const now = new Date();
        setReportNumber(`PR-${now.getFullYear()}-${now.getTime().toString().slice(-4)}`);
      } finally {
        setLoadingNumber(false);
      }
    };
    generateNumber();
  }, []);

  const submit = async () => {
    setError("");
    if (!reportNumber.trim()) return setError("رقم المحضر مطلوب");
    if (items.some((i) => !i.description.trim())) return setError("يرجى كتابة وصف لكل البنود");
    if (items.some((i) => i.quantity < 1)) return setError("الكمية يجب أن تكون 1 على الأقل");
    try {
      setLoading(true);
      await api.post("/purchase-requests/create", { reportNumber, items, notes });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="إنشاء طلب شراء جديد" onClose={onClose}>
      <div className="space-y-5">
        {/* رقم المحضر */}
        {/* رقم المحضر */}
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">رقم المحضر</label>
          {loadingNumber ? (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
              <Loader2 size={14} className="animate-spin text-zinc-500" />
              <span className="text-zinc-500 text-sm">جاري التوليد...</span>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5">
              <span className="font-mono font-bold text-orange-400 text-sm">{reportNumber}</span>
              <span className="text-xs text-zinc-600">تلقائي</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <div>
          <label className="text-xs text-zinc-500 mb-1 block">الجهة الطالبه</label>
          <input placeholder="مثال: قسم الميكانيكا" onChange={(e) => updateItem(i, "Requesting_party", e.target.value)} type="text" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">المهندس المختص</label>
          <input placeholder="" onChange={(e) => updateItem(i, "specialized_engineer", e.target.value)} type="text" className={inputCls} />
        </div>
        </div>

        {/* البنود */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium text-zinc-400">البنود المطلوبة</label>
            <button onClick={addItem}
              className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg transition">
              <Plus size={12} /> إضافة بند
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500">بند {i + 1}</span>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="text-zinc-600 hover:text-red-400 transition">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">الوصف</label>
                  <input value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    placeholder="مثال: كابل كهربائي 50mm" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">الكمية</label>
                    <input type="number" min={1} value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">الوحدة</label>
                    <select value={item.unit} onChange={(e) => updateItem(i, "unit", e.target.value)} className={selectCls}>
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ملاحظات */}
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">ملاحظات <span className="text-zinc-600">(اختياري)</span></label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            rows={3} placeholder="أي ملاحظات إضافية..."
            className={`${inputCls} resize-none`} />
        </div>

        <ServerError msg={error} />

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إلغاء</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            إرسال الطلب
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// View Request Modal
// ─────────────────────────────────────────────────────────────────
function ViewRequestModal({ request, onClose }) {
  return (
    <Modal title={`طلب شراء — محضر ${request.reportNumber}`} subtitle={`طالب: ${request.requestedBy}`} onClose={onClose}>
      <div className="space-y-5">
        {/* Status */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <span className="text-sm text-zinc-400">الحالة</span>
          <StatusBadge status={request.status} />
        </div>

        {/* Items */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 mb-3">البنود المطلوبة</p>
          <div className="space-y-2">
            {request.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm text-white font-medium">{item.description}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.itemType === "inventory" ? "من المخزن" : "طلب يدوي"}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{item.quantity}</p>
                  <p className="text-xs text-zinc-500">{item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {request.notes && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3">
            <p className="text-xs text-zinc-500 mb-1">ملاحظات</p>
            <p className="text-sm text-zinc-300">{request.notes}</p>
          </div>
        )}

        {/* Date */}
        <p className="text-xs text-zinc-600 text-center">
          {new Date(request.createdAt).toLocaleDateString("ar-EG", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Delete Modal
// ─────────────────────────────────────────────────────────────────
function DeleteModal({ request, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    try {
      setLoading(true);
      await api.delete(`/purchase-requests/${request._id}`);
      onSuccess(); onClose();
    } catch (err) { setError(err.response?.data?.message || "حدث خطأ"); }
    finally { setLoading(false); }
  };
  return (
    <Modal title="حذف الطلب" onClose={onClose} width="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">
            هل أنت متأكد من حذف طلب المحضر <strong className="text-white">{request.reportNumber}</strong>؟
          </p>
        </div>
        <ServerError msg={error} />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إلغاء</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} حذف
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function PurchaseRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(null);

  let currentUser = {};
  try { currentUser = JSON.parse(localStorage.getItem("user") || "{}"); } catch { }
  const canCreate = ["developer", "purchase_manager"].includes(currentUser.role);
  const canDelete = ["developer", "purchase_manager"].includes(currentUser.role);

  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/purchase-requests/");
      setRequests(res.data.data);
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchRequests(); }, []);

  const filtered = requests.filter((r) => {
    const matchSearch = r.reportNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.requestedBy?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

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
              <FileText size={16} className="text-orange-400" />
              <span className="text-white font-semibold text-sm">طلبات الشراء</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* روابط الأقسام الفرعية */}
            <button onClick={() => navigate("/purchases/offers")}
              className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition">
              عروض الأسعار
            </button>
            <button onClick={() => navigate("/purchases/orders")}
              className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition">
              أوامر الشراء
            </button>
            <button onClick={() => navigate("/purchases/inspection")}
              className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition">
              الفحص والاستلام
            </button>
            <button onClick={() => fetchRequests(true)} disabled={refreshing}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            {canCreate && (
              <button onClick={() => setModal({ type: "create" })}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-orange-500/20">
                <Plus size={16} /> طلب شراء جديد
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "إجمالي الطلبات", value: stats.total, color: "text-white", bg: "bg-zinc-800/50" },
            { label: "انتظار", value: stats.pending, color: "text-zinc-400", bg: "bg-zinc-800/50 border border-zinc-700" },
            { label: "موافق عليها", value: stats.approved, color: "text-emerald-400", bg: "bg-emerald-500/10 border border-emerald-500/20" },
            { label: "مكتملة", value: stats.completed, color: "text-teal-400", bg: "bg-teal-500/10 border border-teal-500/20" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl px-5 py-4 ${s.bg}`}>
              <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث برقم المحضر أو الطالب..."
              className="bg-zinc-900 border border-zinc-800 focus:border-zinc-600 outline-none rounded-xl px-4 py-2 pr-9 text-sm text-white placeholder:text-zinc-600 transition w-64" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 outline-none rounded-xl px-4 py-2 text-sm text-white transition appearance-none">
            <option value="all">كل الحالات</option>
            {Object.entries(STATUS_MAP).map(([val, s]) => (
              <option key={val} value={val}>{s.label}</option>
            ))}
          </select>
          {(search || statusFilter !== "all") && (
            <button onClick={() => { setSearch(""); setStatusFilter("all"); }}
              className="text-xs text-zinc-500 hover:text-white px-3 py-2 bg-zinc-800 rounded-xl transition">
              مسح الفلتر
            </button>
          )}
          <span className="text-xs text-zinc-600 mr-auto">{filtered.length} طلب</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-zinc-500">
            <Loader2 className="animate-spin" size={22} /> جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/80 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-500 text-xs border-b border-zinc-800">
                  <th className="text-right py-3.5 px-5 font-medium">رقم المحضر</th>
                  <th className="text-right py-3.5 px-4 font-medium">الطالب</th>
                  <th className="text-right py-3.5 px-4 font-medium">المهندس المختص</th>
                  <th className="text-right py-3.5 px-4 font-medium">الجهة الطالبه</th>
                  <th className="text-right py-3.5 px-4 font-medium">عدد البنود</th>
                  <th className="text-right py-3.5 px-4 font-medium">الحالة</th>
                  <th className="text-right py-3.5 px-4 font-medium">التاريخ</th>
                  <th className="py-3.5 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id} className="border-t border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-orange-400">{r.reportNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">{r.requestedBy}</td>
                    <td className="py-3.5 px-4 text-zinc-300">{r.specialized_engineer}</td>
                    <td className="py-3.5 px-4 text-zinc-300">{r.Requesting_party}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-1 rounded-lg">
                        {r.items?.length} بند
                      </span>
                    </td>
                    <td className="py-3.5 px-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3.5 px-4 text-zinc-500 text-xs">
                      {new Date(r.createdAt).toLocaleDateString("ar-EG", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => setModal({ type: "view", request: r })}
                          title="عرض التفاصيل"
                          className="p-1.5 rounded-lg bg-zinc-700/60 text-zinc-400 hover:bg-zinc-600 hover:text-white transition">
                          <FileText size={14} />
                        </button>
                        {canDelete && r.status === "pending" && (
                          <button onClick={() => setModal({ type: "delete", request: r })}
                            title="حذف"
                            className="p-1.5 rounded-lg bg-zinc-700/60 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === "create" && <CreateRequestModal onClose={() => setModal(null)} onSuccess={() => fetchRequests(true)} />}
      {modal?.type === "view" && <ViewRequestModal request={modal.request} onClose={() => setModal(null)} />}
      {modal?.type === "delete" && <DeleteModal request={modal.request} onClose={() => setModal(null)} onSuccess={() => fetchRequests(true)} />}
    </div>
  );
}
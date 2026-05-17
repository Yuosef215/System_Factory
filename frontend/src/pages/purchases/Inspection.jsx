import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Plus, Search, RefreshCw, Loader2, X,
  AlertTriangle, ClipboardCheck, Eye, CheckCircle2,
  Clock, PackageCheck, ThumbsUp, TriangleAlert, CircleCheck
} from "lucide-react";
import api from "../../api/axios";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
const ITEM_STATUS_MAP = {
  ok:      { label: "سليم",   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  damaged: { label: "تالف",   color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
  missing: { label: "ناقص",   color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
};

function ItemStatusBadge({ status }) {
  const s = ITEM_STATUS_MAP[status] || ITEM_STATUS_MAP.ok;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold border ${s.bg} ${s.color}`}>
      {s.label}
    </span>
  );
}

function Modal({ title, subtitle, onClose, children, width = "max-w-2xl" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-[#111113] border border-zinc-800 rounded-2xl w-full ${width} shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-[#111113] z-10 flex items-start justify-between px-6 py-5 border-b border-zinc-800">
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

function ServerError({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
      <AlertTriangle size={15} className="shrink-0" /> {msg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Create Inspection Modal
// ─────────────────────────────────────────────────────────────────
function CreateInspectionModal({ onClose, onSuccess }) {
  const [orders, setOrders]         = useState([]);
  const [selected, setSelected]     = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [items, setItems]           = useState([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [loading, setLoading]       = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    api.get("/purchase-orders/?status=complete")
      .then((r) => setOrders(r.data.data))
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, []);

  const handleSelect = async (id) => {
    setSelected(id);
    setError("");
    if (!id) { setOrderDetails(null); setItems([]); return; }
    try {
      const res = await api.get(`/purchase-orders/${id}`);
      const order = res.data.data;
      setOrderDetails(order);
      setItems(order.items.map((item) => ({
        description: item.description,
        quantityOrdered: item.quantity,
        quantityReceived: item.receivedQuantity ?? 0,
        status: "ok",
        notes: "",
      })));
    } catch { setError("حدث خطأ في جلب تفاصيل الأمر"); }
  };

  const updateItem = (i, field, value) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const submit = async () => {
    setError("");
    if (!selected) return setError("يرجى اختيار أمر الشراء");
    try {
      setLoading(true);
      await api.post("/inspection/create", { purchaseOrder: selected, items, generalNotes });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="إنشاء تقرير فحص واستلام" onClose={onClose} width="max-w-3xl">
      <div className="space-y-5">
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">أمر الشراء</label>
          {loadingOrders ? (
            <div className="flex items-center gap-2 text-zinc-500 text-sm"><Loader2 size={14} className="animate-spin" /> جاري التحميل...</div>
          ) : orders.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-500">
              لا توجد أوامر شراء مكتملة الاستلام
            </div>
          ) : (
            <select value={selected} onChange={(e) => handleSelect(e.target.value)}
              className={`${inputCls} appearance-none`}>
              <option value="">اختر أمر الشراء...</option>
              {orders.map((o) => (
                <option key={o._id} value={o._id}>محضر {o.reportNumber}</option>
              ))}
            </select>
          )}
        </div>

        {/* البنود مع حالة الفحص */}
        {orderDetails && items.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 mb-3">نتيجة الفحص لكل بند</p>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{item.description}</p>
                    <span className="text-xs text-zinc-500">
                      مطلوب: {item.quantityOrdered} | مستلم: {item.quantityReceived}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">حالة البند</label>
                      <select value={item.status} onChange={(e) => updateItem(i, "status", e.target.value)}
                        className={`${inputCls} appearance-none`}>
                        <option value="ok">سليم ✅</option>
                        <option value="damaged">تالف ⚠️</option>
                        <option value="missing">ناقص ❌</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">ملاحظة <span className="text-zinc-600">(اختياري)</span></label>
                      <input value={item.notes} onChange={(e) => updateItem(i, "notes", e.target.value)}
                        placeholder="أي ملاحظة على هذا البند" className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {orderDetails && (
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">ملاحظات عامة <span className="text-zinc-600">(اختياري)</span></label>
            <textarea value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)}
              rows={3} placeholder="ملاحظات على الشحنة بشكل عام..."
              className={`${inputCls} resize-none`} />
          </div>
        )}

        <ServerError msg={error} />

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إلغاء</button>
          <button onClick={submit} disabled={loading || !selected}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ClipboardCheck size={16} />}
            إنشاء تقرير الفحص
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// View + Approve Modal
// ─────────────────────────────────────────────────────────────────
function ViewReportModal({ report, onClose, onSuccess, canApprove, canAddToInventory }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleApprove = async () => {
    setError("");
    try {
      setLoading(true);
      await api.patch(`/inspection/${report._id}/approve`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToInventory = async () => {
    setError("");
    try {
      setLoading(true);
      await api.patch(`/inspection/${report._id}/add-to-inventory`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`تقرير فحص — محضر ${report.reportNumber}`} subtitle={`فاحص: ${report.inspectedBy}`} onClose={onClose} width="max-w-2xl">
      <div className="space-y-4">
        {/* الحالة */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <span className="text-sm text-zinc-400">حالة التقرير</span>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
              report.status === "approved"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}>
              {report.status === "approved" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
              {report.status === "approved" ? "معتمد" : "انتظار اعتماد"}
            </span>
            {report.addedToInventory && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-teal-500/10 border-teal-500/20 text-teal-400">
                <PackageCheck size={11} /> أضيف للمخزن
              </span>
            )}
          </div>
        </div>

        {/* البنود */}
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-500">
                <th className="text-right py-2.5 px-4 font-medium">الصنف</th>
                <th className="text-right py-2.5 px-4 font-medium">مطلوب</th>
                <th className="text-right py-2.5 px-4 font-medium">مستلم</th>
                <th className="text-right py-2.5 px-4 font-medium">حالة الفحص</th>
                <th className="text-right py-2.5 px-4 font-medium">ملاحظة</th>
              </tr>
            </thead>
            <tbody>
              {report.items?.map((item, i) => (
                <tr key={i} className="border-b border-zinc-800/40">
                  <td className="py-2.5 px-4 text-zinc-300">{item.description}</td>
                  <td className="py-2.5 px-4 text-white font-bold">{item.quantityOrdered}</td>
                  <td className="py-2.5 px-4 text-white font-bold">{item.quantityReceived}</td>
                  <td className="py-2.5 px-4"><ItemStatusBadge status={item.status} /></td>
                  <td className="py-2.5 px-4 text-zinc-400">{item.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* الملاحظات العامة */}
        {report.generalNotes && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3">
            <p className="text-xs text-zinc-500 mb-1">ملاحظات عامة</p>
            <p className="text-sm text-zinc-300">{report.generalNotes}</p>
          </div>
        )}

        <ServerError msg={error} />

        {/* أزرار الإجراءات */}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-5 rounded-xl text-sm transition">إغلاق</button>
          {report.status === "pending" && canApprove && (
            <button onClick={handleApprove} disabled={loading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ThumbsUp size={16} />}
              اعتماد التقرير
            </button>
          )}
          {report.status === "approved" && !report.addedToInventory && canAddToInventory && (
            <button onClick={handleAddToInventory} disabled={loading}
              className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
              تأكيد الإضافة للمخزن
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function Inspection() {
  const navigate = useNavigate();
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState(null);

  let currentUser = {};
  try { currentUser = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}
  const canCreate        = ["developer", "warehouse_manager", "warehouse_worker"].includes(currentUser.role);
  const canApprove       = ["developer", "warehouse_manager", "gm", "ceo"].includes(currentUser.role);
  const canAddToInventory = ["developer", "warehouse_manager", "warehouse_worker"].includes(currentUser.role);

  const fetchReports = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/inspection/");
      setReports(res.data.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchReports(); }, []);

  const filtered = reports.filter((r) =>
    r.reportNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.inspectedBy?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:          reports.length,
    pending:        reports.filter((r) => r.status === "pending").length,
    approved:       reports.filter((r) => r.status === "approved").length,
    addedToInventory: reports.filter((r) => r.addedToInventory).length,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">

      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/purchases/requests")}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm font-medium">
              <ArrowRight size={16} /> المشتريات
            </button>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2">
              <ClipboardCheck size={16} className="text-orange-400" />
              <span className="text-white font-semibold text-sm">الفحص والاستلام</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchReports(true)} disabled={refreshing}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            {canCreate && (
              <button onClick={() => setModal({ type: "create" })}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-orange-500/20">
                <Plus size={16} /> تقرير فحص جديد
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "إجمالي التقارير",   value: stats.total,           color: "text-white",      bg: "bg-zinc-800/50" },
            { label: "انتظار اعتماد",     value: stats.pending,         color: "text-amber-400",  bg: "bg-amber-500/10 border border-amber-500/20" },
            { label: "معتمدة",             value: stats.approved,        color: "text-emerald-400",bg: "bg-emerald-500/10 border border-emerald-500/20" },
            { label: "أضيفت للمخزن",      value: stats.addedToInventory,color: "text-teal-400",   bg: "bg-teal-500/10 border border-teal-500/20" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl px-5 py-4 ${s.bg}`}>
              <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم المحضر أو الفاحص..."
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 focus:border-zinc-600 outline-none rounded-xl px-4 py-2.5 pr-9 text-sm text-white placeholder:text-zinc-600 transition" />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-zinc-500">
            <Loader2 className="animate-spin" size={22} /> جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            <ClipboardCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد تقارير فحص</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/80 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-500 text-xs border-b border-zinc-800">
                  <th className="text-right py-3.5 px-5 font-medium">رقم المحضر</th>
                  <th className="text-right py-3.5 px-4 font-medium">الفاحص</th>
                  <th className="text-right py-3.5 px-4 font-medium">عدد البنود</th>
                  <th className="text-right py-3.5 px-4 font-medium">حالة التقرير</th>
                  <th className="text-right py-3.5 px-4 font-medium">المخزن</th>
                  <th className="py-3.5 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id} className="border-t border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-orange-400">{r.reportNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">{r.inspectedBy}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-1 rounded-lg">
                        {r.items?.length} بند
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        r.status === "approved"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      }`}>
                        {r.status === "approved" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {r.status === "approved" ? "معتمد" : "انتظار"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {r.addedToInventory
                        ? <span className="inline-flex items-center gap-1 text-xs text-teal-400"><PackageCheck size={12} /> أضيف</span>
                        : <span className="text-xs text-zinc-600">لم يضف بعد</span>
                      }
                    </td>
                    <td className="py-3.5 px-4">
                      <button onClick={() => setModal({ type: "view", report: r })}
                        className={`p-1.5 rounded-lg transition ${
                          (r.status === "pending" && canApprove) || (r.status === "approved" && !r.addedToInventory && canAddToInventory)
                            ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                            : "bg-zinc-700/60 text-zinc-400 hover:bg-zinc-600"
                        }`}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === "create" && <CreateInspectionModal onClose={() => setModal(null)} onSuccess={() => fetchReports(true)} />}
      {modal?.type === "view"   && (
        <ViewReportModal
          report={modal.report}
          canApprove={canApprove}
          canAddToInventory={canAddToInventory}
          onClose={() => setModal(null)}
          onSuccess={() => fetchReports(true)}
        />
      )}
    </div>
  );
}
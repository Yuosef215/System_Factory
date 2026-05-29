import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Plus, Search, RefreshCw, Loader2, X,
  AlertTriangle, FileText, Trash2, CheckCircle2,
  XCircle, Clock, Send, DollarSign, Eye, ThumbsUp, ThumbsDown
} from "lucide-react";
import api from "../../api/axios";
import {printPurchaseOrder} from '../../utils/printPDF.js'

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  pending:  { label: "انتظار موافقة", color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",   icon: Clock },
  approved: { label: "موافق عليه",    color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",icon: CheckCircle2 },
  rejected: { label: "مرفوض",         color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",        icon: XCircle },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${s.bg} ${s.color}`}>
      <Icon size={11} /> {s.label}
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
// Create Price Offer Modal
// ─────────────────────────────────────────────────────────────────
function CreateOfferModal({ onClose, onSuccess }) {
  const [requests, setRequests]         = useState([]);
  const [selectedRequest, setSelectedRequest] = useState("");
  const [requestDetails, setRequestDetails]   = useState(null);
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError]               = useState("");

  // جلب طلبات الشراء في حالة pending أو price_offered
  useEffect(() => {
    api.get("/purchase-requests/")
      .then((r) => setRequests(r.data.data.filter((req) => ["pending", "price_offered"].includes(req.status))))
      .catch(() => {})
      .finally(() => setLoadingRequests(false));
  }, []);

  // لما يختار طلب — يحمل تفاصيله ويبني الـ items
  const handleSelectRequest = async (id) => {
    setSelectedRequest(id);
    setError("");
    if (!id) { setRequestDetails(null); setItems([]); return; }
    try {
      const res = await api.get(`/purchase-requests/${id}`);
      const req = res.data.data;
      setRequestDetails(req);
      setItems(req.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: "",
        totalPrice: 0,
        supplier: "",
      })));
    } catch { setError("حدث خطأ في جلب تفاصيل الطلب"); }
  };

  const updateItem = (i, field, value) => {
    setItems((prev) => prev.map((item, idx) => {
      if (idx !== i) return item;
      const updated = { ...item, [field]: value };
      if (field === "unitPrice" || field === "quantity") {
        updated.totalPrice = Number(updated.quantity) * Number(updated.unitPrice || 0);
      }
      return updated;
    }));
  };

  const totalAmount = items.reduce((sum, i) => sum + (Number(i.unitPrice || 0) * Number(i.quantity)), 0);

  const submit = async () => {
    setError("");
    if (!selectedRequest) return setError("يرجى اختيار طلب الشراء");
    if (items.some((i) => !i.unitPrice || Number(i.unitPrice) <= 0)) return setError("يرجى إدخال السعر لكل البنود");
    if (items.some((i) => !i.supplier.trim())) return setError("يرجى إدخال المورد لكل البنود");
    try {
      setLoading(true);
      await api.post("/price-offers/create", {
        purchaseRequest: selectedRequest,
        items: items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          totalPrice: Number(i.quantity) * Number(i.unitPrice),
          supplier: i.supplier,
        })),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="إنشاء عرض أسعار" onClose={onClose} width="max-w-3xl">
      <div className="space-y-5">
        {/* اختيار الطلب */}
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">طلب الشراء</label>
          {loadingRequests ? (
            <div className="flex items-center gap-2 text-zinc-500 text-sm"><Loader2 size={14} className="animate-spin" /> جاري التحميل...</div>
          ) : (
            <select value={selectedRequest} onChange={(e) => handleSelectRequest(e.target.value)}
              className={`${inputCls} appearance-none`}>
              <option value="">اختر طلب الشراء...</option>
              {requests.map((r) => (
                <option key={r._id} value={r._id}>محضر {r.reportNumber} — {r.requestedBy}</option>
              ))}
            </select>
          )}
        </div>

        {/* البنود مع الأسعار */}
        {requestDetails && items.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 mb-3">تفاصيل الأسعار</p>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{item.description}</p>
                    <span className="text-xs text-zinc-500">{item.quantity} {item.unit}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">سعر الوحدة (جنيه)</label>
                      <input type="number" min={0} value={item.unitPrice}
                        onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                        placeholder="0.00" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">المورد</label>
                      <input value={item.supplier}
                        onChange={(e) => updateItem(i, "supplier", e.target.value)}
                        placeholder="اسم الشركة أو المورد" className={inputCls} />
                    </div>
                  </div>
                  {item.unitPrice > 0 && (
                    <div className="flex items-center justify-between text-xs text-zinc-500 bg-zinc-900 rounded-lg px-3 py-2">
                      <span>الإجمالي</span>
                      <span className="text-orange-400 font-bold">
                        {(Number(item.quantity) * Number(item.unitPrice)).toLocaleString()} جنيه
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* الإجمالي الكلي */}
            <div className="mt-4 flex items-center justify-between bg-orange-500/10 border border-orange-500/20 rounded-xl px-5 py-3">
              <span className="text-sm font-semibold text-zinc-300">إجمالي عرض الأسعار</span>
              <span className="text-xl font-bold text-orange-400">{totalAmount.toLocaleString()} جنيه</span>
            </div>
          </div>
        )}

        <ServerError msg={error} />

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إلغاء</button>
          <button onClick={submit} disabled={loading || !selectedRequest}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            إرسال عرض الأسعار
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// View + Approve/Reject Modal (للمدير العام)
// ─────────────────────────────────────────────────────────────────
function ReviewOfferModal({ offer, onClose, onSuccess, canReview }) {
  const [gmNotes, setGmNotes]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [request, setRequest]   = useState(null);

  // جلب تفاصيل الطلب الأصلي
  useEffect(() => {
    if (offer.purchaseRequest) {
      api.get(`/purchase-requests/${offer.purchaseRequest}`)
        .then((r) => setRequest(r.data.data))
        .catch(() => {});
    }
  }, [offer]);

  const handleDecision = async (decision) => {
    setError("");
    try {
      setLoading(true);
      const endpoint = decision === "approve"
        ? `/price-offers/${offer._id}/approve`
        : `/price-offers/${offer._id}/reject`;
      await api.patch(endpoint, { gmNotes });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`عرض أسعار — محضر ${offer.reportNumber}`} subtitle={`مقدم من: ${offer.offeredBy}`} onClose={onClose} width="max-w-3xl">
      <div className="space-y-5">

        {/* الطلب الأصلي */}
        {request && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 mb-3 flex items-center gap-2">
              <FileText size={12} /> البنود المطلوبة (من طلب الشراء)
            </p>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="text-right py-2.5 px-4 font-medium">الوصف</th>
                    <th className="text-right py-2.5 px-4 font-medium">الكمية</th>
                    <th className="text-right py-2.5 px-4 font-medium">الوحدة</th>
                  </tr>
                </thead>
                <tbody>
                  {request.items?.map((item, i) => (
                    <tr key={i} className="border-b border-zinc-800/40">
                      <td className="py-2.5 px-4 text-zinc-300">{item.description}</td>
                      <td className="py-2.5 px-4 text-white font-bold">{item.quantity}</td>
                      <td className="py-2.5 px-4 text-zinc-400">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* عرض الأسعار */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 mb-3 flex items-center gap-2">
            <DollarSign size={12} /> عرض الأسعار
          </p>
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-right py-2.5 px-4 font-medium">الصنف</th>
                  <th className="text-right py-2.5 px-4 font-medium">الكمية</th>
                  <th className="text-right py-2.5 px-4 font-medium">سعر الوحدة</th>
                  <th className="text-right py-2.5 px-4 font-medium">الإجمالي</th>
                  <th className="text-right py-2.5 px-4 font-medium">المورد</th>
                </tr>
              </thead>
              <tbody>
                {offer.items?.map((item, i) => (
                  <tr key={i} className="border-b border-zinc-800/40">
                    <td className="py-2.5 px-4 text-zinc-300">{item.description}</td>
                    <td className="py-2.5 px-4 text-white font-bold">{item.quantity}</td>
                    <td className="py-2.5 px-4 text-zinc-400">{Number(item.unitPrice).toLocaleString()} ج</td>
                    <td className="py-2.5 px-4 text-orange-400 font-bold">{Number(item.totalPrice).toLocaleString()} ج</td>
                    <td className="py-2.5 px-4 text-zinc-400">{item.supplier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* الإجمالي */}
          <div className="flex items-center justify-between mt-3 bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3">
            <span className="text-sm text-zinc-400">الإجمالي الكلي</span>
            <span className="text-xl font-bold text-orange-400">{Number(offer.totalAmount).toLocaleString()} جنيه</span>
          </div>
        </div>

        {/* ملاحظات المدير لو الحالة pending */}
        {offer.status === "pending" && canReview && (
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
              ملاحظات المدير العام <span className="text-zinc-600">(اختياري)</span>
            </label>
            <textarea value={gmNotes} onChange={(e) => setGmNotes(e.target.value)}
              rows={3} placeholder="أي ملاحظات على عرض الأسعار..."
              className={`${inputCls} resize-none`} />
          </div>
        )}

        {/* ملاحظات المدير لو اتقالت رأي */}
        {offer.gmNotes && offer.status !== "pending" && (
          <div className={`border rounded-xl px-4 py-3 ${offer.status === "approved" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
            <p className="text-xs text-zinc-500 mb-1">ملاحظات المدير العام</p>
            <p className="text-sm text-zinc-300">{offer.gmNotes}</p>
            <p className="text-xs text-zinc-600 mt-2">بواسطة: {offer.reviewedBy}</p>
          </div>
        )}

        <ServerError msg={error} />

        {/* أزرار الموافقة والرفض */}
        {offer.status === "pending" && canReview ? (
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-5 rounded-xl text-sm transition">إغلاق</button>
            <button onClick={() => handleDecision("reject")} disabled={loading}
              className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ThumbsDown size={16} />} رفض
            </button>
            <button onClick={() => handleDecision("approve")} disabled={loading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ThumbsUp size={16} />} موافقة
            </button>
          </div>
        ) : (
          <button onClick={onClose} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إغلاق</button>
        )}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function PriceOffers() {
  const navigate = useNavigate();
  const [offers, setOffers]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal]           = useState(null);

  let currentUser = {};
  try { currentUser = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}
  const canCreate = ["developer", "purchase_manager"].includes(currentUser.role);
  const canReview = ["developer", "gm", "ceo"].includes(currentUser.role);

  const fetchOffers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/price-offers/");
      setOffers(res.data.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchOffers(); }, []);

  const filtered = offers.filter((o) => {
    const matchSearch = o.reportNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.offeredBy?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:    offers.length,
    pending:  offers.filter((o) => o.status === "pending").length,
    approved: offers.filter((o) => o.status === "approved").length,
    rejected: offers.filter((o) => o.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">

      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/purchases/requests")}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm font-medium">
              <ArrowRight size={16} /> طلبات الشراء
            </button>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-orange-400" />
              <span className="text-white font-semibold text-sm">عروض الأسعار</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchOffers(true)} disabled={refreshing}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            {canCreate && (
              <button onClick={() => setModal({ type: "create" })}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-orange-500/20">
                <Plus size={16} /> عرض أسعار جديد
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "إجمالي العروض",      value: stats.total,    color: "text-white",       bg: "bg-zinc-800/50" },
            { label: "انتظار موافقة",       value: stats.pending,  color: "text-amber-400",   bg: "bg-amber-500/10 border border-amber-500/20" },
            { label: "موافق عليها",         value: stats.approved, color: "text-emerald-400", bg: "bg-emerald-500/10 border border-emerald-500/20" },
            { label: "مرفوضة",              value: stats.rejected, color: "text-red-400",     bg: "bg-red-500/10 border border-red-500/20" },
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
              placeholder="بحث برقم المحضر أو المقدم..."
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
          <span className="text-xs text-zinc-600 mr-auto">{filtered.length} عرض</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-zinc-500">
            <Loader2 className="animate-spin" size={22} /> جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            <DollarSign size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد عروض أسعار</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/80 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-500 text-xs border-b border-zinc-800">
                  <th className="text-right py-3.5 px-5 font-medium">رقم المحضر</th>
                  <th className="text-right py-3.5 px-4 font-medium">مقدم من</th>
                  <th className="text-right py-3.5 px-4 font-medium">عدد البنود</th>
                  <th className="text-right py-3.5 px-4 font-medium">الإجمالي</th>
                  <th className="text-right py-3.5 px-4 font-medium">الحالة</th>
                  <th className="text-right py-3.5 px-4 font-medium">التاريخ</th>
                  <th className="py-3.5 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o._id} className="border-t border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-orange-400">{o.reportNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">{o.offeredBy}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-1 rounded-lg">
                        {o.items?.length} بند
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-orange-400">
                      {Number(o.totalAmount).toLocaleString()} ج
                    </td>
                    <td className="py-3.5 px-4"><StatusBadge status={o.status} /></td>
                    <td className="py-3.5 px-4 text-zinc-500 text-xs">
                      {new Date(o.createdAt).toLocaleDateString("ar-EG", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                          onClick={() => printPurchaseOrder(o)}
                          title="طباعة"
                          className="p-1.5 rounded-lg bg-zinc-700/60 text-zinc-400 hover:bg-orange-500/20 hover:text-orange-400 transition">
                          <Printer size={14} />
                        </button>
                      <button
                        onClick={() => setModal({ type: "review", offer: o })}
                        title={o.status === "pending" && canReview ? "مراجعة والبت" : "عرض التفاصيل"}
                        className={`p-1.5 rounded-lg transition ${
                          o.status === "pending" && canReview
                            ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                            : "bg-zinc-700/60 text-zinc-400 hover:bg-zinc-600"
                        }`}>
                        {o.status === "pending" && canReview ? <ThumbsUp size={14} /> : <Eye size={14} />}
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
      {modal?.type === "create" && <CreateOfferModal onClose={() => setModal(null)} onSuccess={() => fetchOffers(true)} />}
      {modal?.type === "review" && (
        <ReviewOfferModal
          offer={modal.offer}
          canReview={canReview}
          onClose={() => setModal(null)}
          onSuccess={() => fetchOffers(true)}
        />
      )}
    </div>
  );
}
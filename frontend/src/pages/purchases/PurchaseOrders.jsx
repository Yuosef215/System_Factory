import { useEffect, useState, useCallback, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Plus, Search, RefreshCw, Loader2, X,
  AlertTriangle, ShoppingCart, Eye, CheckCircle2,
  Clock, Package, ChevronUp, Send, Printer
} from "lucide-react";
import api from "../../api/axios";
import { printPurchaseOrder } from '../../utils/printPDF'

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  pending: { label: "انتظار", color: "text-zinc-400", bg: "bg-zinc-800 border-zinc-700", icon: Clock },
  partial: { label: "جزئي", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Package },
  complete: { label: "مكتمل", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
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
// Create Order Modal
// ─────────────────────────────────────────────────────────────────
function CreateOrderModal({ onClose, onSuccess }) {
  const [offers, setOffers] = useState([]);
  const [selected, setSelected] = useState("");
  const [offerDetails, setOfferDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/price-offers/?status=approved")
      .then((r) => setOffers(r.data.data))
      .catch(() => { })
      .finally(() => setLoadingOffers(false));
  }, []);

  const handleSelect = async (id) => {
    setSelected(id);
    setError("");
    if (!id) { setOfferDetails(null); return; }
    try {
      const res = await api.get(`/price-offers/${id}`);
      setOfferDetails(res.data.data);
    } catch { setError("حدث خطأ في جلب تفاصيل العرض"); }
  };

  const submit = async () => {
    setError("");
    if (!selected) return setError("يرجى اختيار عرض الأسعار");
    try {
      setLoading(true);
      await api.post("/purchase-orders/create", { priceOffer: selected });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="إنشاء أمر شراء" subtitle="بناءً على عرض أسعار معتمد" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">عرض الأسعار المعتمد</label>
          {loadingOffers ? (
            <div className="flex items-center gap-2 text-zinc-500 text-sm"><Loader2 size={14} className="animate-spin" /> جاري التحميل...</div>
          ) : offers.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-500">
              لا توجد عروض أسعار معتمدة بعد
            </div>
          ) : (
            <select value={selected} onChange={(e) => handleSelect(e.target.value)}
              className={`${inputCls} appearance-none`}>
              <option value="">اختر عرض الأسعار...</option>
              {offers.map((o) => (
                <option key={o._id} value={o._id}>
                  محضر {o.reportNumber} — إجمالي {Number(o.totalAmount).toLocaleString()} ج
                </option>
              ))}
            </select>
          )}
        </div>

        {offerDetails && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <p className="text-xs font-semibold text-zinc-400">البنود</p>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-right py-2.5 px-4 font-medium">الصنف</th>
                  <th className="text-right py-2.5 px-4 font-medium">الكمية</th>
                  <th className="text-right py-2.5 px-4 font-medium">السعر</th>
                  <th className="text-right py-2.5 px-4 font-medium">الإجمالي</th>
                  <th className="text-right py-2.5 px-4 font-medium">المورد</th>
                </tr>
              </thead>
              <tbody>
                {offerDetails.items?.map((item, i) => (
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
            <div className="flex items-center justify-between px-5 py-3 bg-zinc-900/80">
              <span className="text-xs text-zinc-500">الإجمالي</span>
              <span className="text-base font-bold text-orange-400">{Number(offerDetails.totalAmount).toLocaleString()} جنيه</span>
            </div>
          </div>
        )}

        <ServerError msg={error} />

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إلغاء</button>
          <button onClick={submit} disabled={loading || !selected}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
            إنشاء أمر الشراء
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Confirm Items Modal
// ─────────────────────────────────────────────────────────────────
function ConfirmItemsModal({ order, onClose, onSuccess }) {
  const [items, setItems] = useState(
    order.items.map((item) => ({
      ...item,
      receivedQty: item.receivedQuantity ?? 0,
    }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateQty = (i, val) => {
    setItems((prev) => prev.map((item, idx) =>
      idx === i ? { ...item, receivedQty: Math.min(Number(val), item.quantity) } : item
    ));
  };

  const submit = async () => {
    setError("");
    try {
      setLoading(true);
      await api.patch(`/purchase-orders/${order._id}/confirm-items`, {
        items: items.map((item) => ({
          itemId: item._id,
          receivedQuantity: item.receivedQty,
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
    <Modal title="تأكيد استلام البنود" subtitle={`محضر ${order.reportNumber}`} onClose={onClose} width="max-w-2xl">
      <div className="space-y-4">
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.description}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">المورد: {item.supplier}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
                  <p className="text-xs text-zinc-500 mb-0.5">الكمية المطلوبة</p>
                  <p className="text-lg font-bold text-white">{item.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1.5">الكمية المستلمة</p>
                  <input type="number" min={0} max={item.quantity} value={item.receivedQty}
                    onChange={(e) => updateQty(i, e.target.value)}
                    className={inputCls} />
                </div>
              </div>
              {item.receivedQty > 0 && item.receivedQty < item.quantity && (
                <p className="text-xs text-amber-400 mt-2">
                  ⚠️ استلام جزئي — متبقي {item.quantity - item.receivedQty}
                </p>
              )}
            </div>
          ))}
        </div>

        <ServerError msg={error} />

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إلغاء</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            تأكيد الاستلام
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// View Order Modal
// ─────────────────────────────────────────────────────────────────
function ViewOrderModal({ order, onClose }) {
  return (
    <Modal title={`أمر شراء — محضر ${order.reportNumber}`} subtitle={`مؤكد بواسطة: ${order.confirmedBy}`} onClose={onClose} width="max-w-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <span className="text-sm text-zinc-400">حالة الأمر</span>
          <StatusBadge status={order.status} />
        </div>
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-500">
                <th className="text-right py-2.5 px-4 font-medium">الصنف</th>
                <th className="text-right py-2.5 px-4 font-medium">مطلوب</th>
                <th className="text-right py-2.5 px-4 font-medium">مستلم</th>
                <th className="text-right py-2.5 px-4 font-medium">الحالة</th>
                <th className="text-right py-2.5 px-4 font-medium">المورد</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, i) => (
                <tr key={i} className="border-b border-zinc-800/40">
                  <td className="py-2.5 px-4 text-zinc-300">{item.description}</td>
                  <td className="py-2.5 px-4 text-white font-bold">{item.quantity}</td>
                  <td className="py-2.5 px-4">
                    <span className={item.receivedQuantity >= item.quantity ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                      {item.receivedQuantity ?? 0}
                    </span>
                  </td>
                  <td className="py-2.5 px-4"><StatusBadge status={item.status} /></td>
                  <td className="py-2.5 px-4 text-zinc-400">{item.supplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3">
          <span className="text-sm text-zinc-400">الإجمالي</span>
          <span className="text-lg font-bold text-orange-400">{Number(order.totalAmount).toLocaleString()} جنيه</span>
        </div>
        <button onClick={onClose} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إغلاق</button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(null);

  let currentUser = {};
  try { currentUser = JSON.parse(localStorage.getItem("user") || "{}"); } catch { }
  const canCreate = ["developer", "purchase_manager"].includes(currentUser.role);
  const canConfirm = ["developer", "purchase_manager", "warehouse_manager"].includes(currentUser.role);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/purchase-orders/");
      setOrders(res.data.data);
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = o.reportNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.confirmedBy?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    partial: orders.filter((o) => o.status === "partial").length,
    complete: orders.filter((o) => o.status === "complete").length,
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
              <ShoppingCart size={16} className="text-orange-400" />
              <span className="text-white font-semibold text-sm">أوامر الشراء</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchOrders(true)} disabled={refreshing}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            {canCreate && (
              <button onClick={() => setModal({ type: "create" })}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-orange-500/20">
                <Plus size={16} /> أمر شراء جديد
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "إجمالي الأوامر", value: stats.total, color: "text-white", bg: "bg-zinc-800/50" },
            { label: "انتظار", value: stats.pending, color: "text-zinc-400", bg: "bg-zinc-800/50 border border-zinc-700" },
            { label: "استلام جزئي", value: stats.partial, color: "text-amber-400", bg: "bg-amber-500/10 border border-amber-500/20" },
            { label: "مكتملة", value: stats.complete, color: "text-emerald-400", bg: "bg-emerald-500/10 border border-emerald-500/20" },
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
              placeholder="بحث برقم المحضر..."
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
          <span className="text-xs text-zinc-600 mr-auto">{filtered.length} أمر</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-zinc-500">
            <Loader2 className="animate-spin" size={22} /> جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد أوامر شراء</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/80 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-500 text-xs border-b border-zinc-800">
                  <th className="text-right py-3.5 px-5 font-medium">رقم المحضر</th>
                  <th className="text-right py-3.5 px-4 font-medium">عدد البنود</th>
                  <th className="text-right py-3.5 px-4 font-medium">الإجمالي</th>
                  <th className="text-right py-3.5 px-4 font-medium">الحالة</th>
                  <th className="text-right py-3.5 px-4 font-medium">بواسطة</th>
                  <th className="py-3.5 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o._id} className="border-t border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-orange-400">{o.reportNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-1 rounded-lg">
                        {o.items?.length} بند
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-orange-400">
                      {Number(o.totalAmount).toLocaleString()} ج
                    </td>
                    <td className="py-3.5 px-4"><StatusBadge status={o.status} /></td>
                    <td className="py-3.5 px-4 text-zinc-400 text-xs">{o.confirmedBy}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => printPurchaseOrder(o)}
                          title="طباعة"
                          className="p-1.5 rounded-lg bg-zinc-700/60 text-zinc-400 hover:bg-orange-500/20 hover:text-orange-400 transition">
                          <Printer size={14} />
                        </button>
                        <button onClick={() => setModal({ type: "view", order: o })}
                          title="عرض التفاصيل"
                          className="p-1.5 rounded-lg bg-zinc-700/60 text-zinc-400 hover:bg-zinc-600 transition">
                          <Eye size={14} />
                        </button>
                        {canConfirm && o.status !== "complete" && (
                          <button onClick={() => setModal({ type: "confirm", order: o })}
                            title="تأكيد الاستلام"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition">
                            <CheckCircle2 size={14} />
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
      {modal?.type === "create" && <CreateOrderModal onClose={() => setModal(null)} onSuccess={() => fetchOrders(true)} />}
      {modal?.type === "view" && <ViewOrderModal order={modal.order} onClose={() => setModal(null)} />}
      {modal?.type === "confirm" && <ConfirmItemsModal order={modal.order} onClose={() => setModal(null)} onSuccess={() => fetchOrders(true)} />}
    </div>
  );
}
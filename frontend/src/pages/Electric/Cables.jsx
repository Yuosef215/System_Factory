import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Plus, Search, RefreshCw, Loader2, X,
  AlertTriangle, Zap, Pencil, Trash2, TrendingDown,
  TrendingUp, History, ChevronUp, Calendar, Filter, Package
} from "lucide-react";
import api from "../../api/axios";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
const REASON_LABELS = {
  production:  "إنتاج",
  maintenance: "صيانة",
  purchase:    "شراء",
};

function StockBadge({ stock }) {
  if (stock === 0)
    return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/25">نفد</span>;
  if (stock < 5)
    return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">منخفض</span>;
  return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">متاح</span>;
}

function Modal({ title, subtitle, onClose, children, width = "max-w-md" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-[#111113] border border-zinc-800 rounded-2xl w-full ${width} shadow-2xl`}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-800">
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

const inputCls = "w-full bg-zinc-900 border border-zinc-700/80 focus:border-yellow-500/70 focus:ring-1 focus:ring-yellow-500/20 outline-none rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 transition-all";

function ServerError({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
      <AlertTriangle size={15} className="shrink-0" /> {msg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Add Cable Modal
// ─────────────────────────────────────────────────────────────────
function AddCableModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ details: "", lengths: "", stock: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    setError("");
    if (!form.details || !form.lengths || !form.stock) return setError("جميع الحقول مطلوبة");
    try {
      setLoading(true);
      await api.post("/cables/createCable", {
        details: Number(form.details),
        lengths: Number(form.lengths),
        stock:   Number(form.stock),
      });
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally { setLoading(false); }
  };

  return (
    <Modal title="إضافة كابل جديد" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">المقطع (mm²) *</label>
          <input name="details" type="number" value={form.details} onChange={handle}
            placeholder="مثال: 50" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">الطول (متر) *</label>
          <input name="lengths" type="number" value={form.lengths} onChange={handle}
            placeholder="مثال: 100" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">الكمية الأولية *</label>
          <input name="stock" type="number" min="0" value={form.stock} onChange={handle}
            placeholder="0" className={inputCls} />
        </div>
        <ServerError msg={error} />
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إلغاء</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} حفظ
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Edit Cable Modal
// ─────────────────────────────────────────────────────────────────
function EditCableModal({ cable, onClose, onSuccess }) {
  const [form, setForm] = useState({
    details: cable.details,
    lengths: cable.lengths,
    stock:   cable.stock,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    setError("");
    try {
      setLoading(true);
      await api.put(`/cables/${cable._id}`, {
        details: Number(form.details),
        lengths: Number(form.lengths),
        stock:   Number(form.stock),
      });
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally { setLoading(false); }
  };

  return (
    <Modal title="تعديل الكابل" subtitle={`مقطع: ${cable.details}mm²`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">المقطع (mm²)</label>
          <input name="details" type="number" value={form.details} onChange={handle} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">الطول (متر)</label>
          <input name="lengths" type="number" value={form.lengths} onChange={handle} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">الكمية</label>
          <input name="stock" type="number" value={form.stock} onChange={handle} className={inputCls} />
        </div>
        <ServerError msg={error} />
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إلغاء</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Pencil size={16} />} حفظ التعديلات
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Dispense Modal
// ─────────────────────────────────────────────────────────────────
function DispenseModal({ cable, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason]     = useState("maintenance");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const submit = async () => {
    setError("");
    if (Number(quantity) < 1) return setError("الكمية يجب أن تكون 1 على الأقل");
    if (Number(quantity) > cable.stock) return setError(`الكمية أكبر من المتاح (${cable.stock})`);
    try {
      setLoading(true);
      await api.patch(`/cables/dispense/${cable._id}`, { quantity: Number(quantity), reason });
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally { setLoading(false); }
  };

  return (
    <Modal title="صرف من المخزون" subtitle={`كابل ${cable.details}mm² — ${cable.lengths}م`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <span className="text-sm text-zinc-400">المخزون الحالي</span>
          <span className="text-lg font-bold text-white">{cable.stock}</span>
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">الكمية</label>
          <input type="number" min={1} max={cable.stock} value={quantity}
            onChange={(e) => setQuantity(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">سبب الصرف</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls}>
            <option value="maintenance">صيانة</option>
            <option value="production">إنتاج</option>
          </select>
        </div>
        {Number(quantity) > 0 && Number(quantity) <= cable.stock && (
          <div className="text-xs text-zinc-500 bg-zinc-900 rounded-xl px-4 py-2.5 flex justify-between">
            <span>الرصيد بعد الصرف</span>
            <span className="text-amber-400 font-semibold">{cable.stock - Number(quantity)}</span>
          </div>
        )}
        <ServerError msg={error} />
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إلغاء</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <TrendingDown size={16} />} تأكيد الصرف
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Add Stock Modal
// ─────────────────────────────────────────────────────────────────
function AddStockModal({ cable, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const submit = async () => {
    setError("");
    if (Number(quantity) < 1) return setError("الكمية يجب أن تكون 1 على الأقل");
    try {
      setLoading(true);
      await api.patch(`/cables/addStock/${cable._id}`, { quantity: Number(quantity), reason: "purchase" });
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally { setLoading(false); }
  };

  return (
    <Modal title="إضافة للمخزون" subtitle={`كابل ${cable.details}mm² — ${cable.lengths}م`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <span className="text-sm text-zinc-400">المخزون الحالي</span>
          <span className="text-lg font-bold text-white">{cable.stock}</span>
        </div>
        <div>
          <label className="text-xs text-zinc-400 mb-1 block">الكمية المضافة</label>
          <input type="number" min={1} value={quantity}
            onChange={(e) => setQuantity(e.target.value)} className={inputCls} />
        </div>
        {Number(quantity) > 0 && (
          <div className="text-xs text-zinc-500 bg-zinc-900 rounded-xl px-4 py-2.5 flex justify-between">
            <span>الرصيد بعد الإضافة</span>
            <span className="text-emerald-400 font-semibold">{cable.stock + Number(quantity)}</span>
          </div>
        )}
        <ServerError msg={error} />
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إلغاء</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />} تأكيد الإضافة
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Movements Panel
// ─────────────────────────────────────────────────────────────────
function MovementsPanel({ cableId }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get(`/cables/movements/${cableId}`)
      .then((r) => setMovements(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cableId]);

  if (loading) return <div className="py-8 flex justify-center text-zinc-600"><Loader2 className="animate-spin" size={20} /></div>;
  if (!movements.length) return <p className="text-center text-zinc-600 text-sm py-6">لا توجد حركات مسجلة</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-500">
            <th className="text-right py-2 px-3 font-medium">التاريخ</th>
            <th className="text-right py-2 px-3 font-medium">العملية</th>
            <th className="text-right py-2 px-3 font-medium">الكمية</th>
            <th className="text-right py-2 px-3 font-medium">قبل</th>
            <th className="text-right py-2 px-3 font-medium">بعد</th>
            <th className="text-right py-2 px-3 font-medium">السبب</th>
            <th className="text-right py-2 px-3 font-medium">بواسطة</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m._id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
              <td className="py-2 px-3 text-zinc-400">
                {new Date(m.createdAt).toLocaleDateString("ar-EG", { day: "2-digit", month: "short", year: "numeric" })}
              </td>
              <td className="py-2 px-3">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold
                  ${m.process === "صرف" ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                  {m.process === "صرف" ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                  {m.process}
                </span>
              </td>
              <td className="py-2 px-3 font-bold text-white">{m.quantity}</td>
              <td className="py-2 px-3 text-zinc-400">{m.balanceBefore}</td>
              <td className="py-2 px-3 text-zinc-400">{m.balanceAfter}</td>
              <td className="py-2 px-3 text-zinc-400">{REASON_LABELS[m.reason] || m.reason}</td>
              <td className="py-2 px-3 text-zinc-500">{m.createdBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// All Movements Modal
// ─────────────────────────────────────────────────────────────────
function AllMovementsModal({ onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate]           = useState(today);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [fetched, setFetched]     = useState(false);

  const fetchMovements = async () => {
    setLoading(true); setFetched(false);
    try {
      const res = await api.get(`/cables/allMovements?date=${date}`);
      setMovements(res.data.data);
    } catch {}
    finally { setLoading(false); setFetched(true); }
  };

  useEffect(() => { fetchMovements(); }, []);

  return (
    <Modal title="سجل الحركات اليومي" subtitle="كل حركات الكابلات" onClose={onClose} width="max-w-3xl">
      <div className="space-y-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">اختر التاريخ</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className={inputCls} style={{ colorScheme: "dark" }} />
          </div>
          <button onClick={fetchMovements}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
            <Filter size={15} /> عرض
          </button>
        </div>

        {loading && <div className="py-12 flex justify-center text-zinc-600"><Loader2 className="animate-spin" size={22} /></div>}

        {!loading && fetched && movements.length === 0 && (
          <div className="text-center py-12 text-zinc-600">
            <Package size={36} className="mx-auto mb-3 opacity-40" />
            <p>لا توجد حركات في هذا اليوم</p>
          </div>
        )}

        {!loading && movements.length > 0 && (
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 bg-zinc-900/50">
                  <th className="text-right py-2.5 px-4 font-medium">الكابل</th>
                  <th className="text-right py-2.5 px-4 font-medium">العملية</th>
                  <th className="text-right py-2.5 px-4 font-medium">الكمية</th>
                  <th className="text-right py-2.5 px-4 font-medium">قبل → بعد</th>
                  <th className="text-right py-2.5 px-4 font-medium">السبب</th>
                  <th className="text-right py-2.5 px-4 font-medium">بواسطة</th>
                  <th className="text-right py-2.5 px-4 font-medium">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m._id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-2.5 px-4">
                      <span className="text-white font-semibold">{m.cables?.details}mm²</span>
                      <span className="text-zinc-500 mr-1">— {m.cables?.lengths}م</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold
                        ${m.process === "صرف" ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                        {m.process === "صرف" ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                        {m.process}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-white">{m.quantity}</td>
                    <td className="py-2.5 px-4 text-zinc-400">{m.balanceBefore} → {m.balanceAfter}</td>
                    <td className="py-2.5 px-4 text-zinc-400">{REASON_LABELS[m.reason] || m.reason}</td>
                    <td className="py-2.5 px-4 text-zinc-400">{m.createdBy}</td>
                    <td className="py-2.5 px-4 text-zinc-500">
                      {new Date(m.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function Cables() {
  const navigate = useNavigate();
  const [cables, setCables]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [expanded, setExpanded]     = useState(null);
  const [modal, setModal]           = useState(null);

  const fetchCables = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await api.get("/cables/");
      setCables(res.data.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchCables(); }, []);

  const filtered = cables.filter((c) =>
    String(c.details).includes(search) ||
    String(c.lengths).includes(search)
  );

  const stats = {
    total:      cables.length,
    outOfStock: cables.filter((c) => c.stock === 0).length,
    low:        cables.filter((c) => c.stock > 0 && c.stock < 5).length,
    totalStock: cables.reduce((s, c) => s + c.stock, 0),
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">

      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/electrical")}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm font-medium">
              <ArrowRight size={16} /> الكهرباء
            </button>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-white font-semibold text-sm">الكابلات</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setModal({ type: "allMovements" })}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium px-4 py-2 rounded-xl transition">
              <Calendar size={15} /> سجل الحركات
            </button>
            <button onClick={() => fetchCables(true)} disabled={refreshing}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl transition">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setModal({ type: "add" })}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-yellow-500/20">
              <Plus size={16} /> إضافة كابل
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "إجمالي الأصناف",  value: stats.total,      color: "text-white",       bg: "bg-zinc-800/50" },
            { label: "إجمالي الكميات",  value: stats.totalStock, color: "text-blue-400",    bg: "bg-blue-500/10 border border-blue-500/20" },
            { label: "مخزون منخفض",     value: stats.low,        color: "text-amber-400",   bg: "bg-amber-500/10 border border-amber-500/20" },
            { label: "نفد المخزون",     value: stats.outOfStock, color: "text-red-400",     bg: "bg-red-500/10 border border-red-500/20" },
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
            placeholder="بحث بالمقطع أو الطول..."
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 focus:border-zinc-600 outline-none rounded-xl px-4 py-2.5 pr-9 text-sm text-white placeholder:text-zinc-600 transition" />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-zinc-500">
            <Loader2 className="animate-spin" size={22} /> جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            <Zap size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد كابلات</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/80 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-500 text-xs border-b border-zinc-800">
                  <th className="text-right py-3.5 px-5 font-medium">المقطع (mm²)</th>
                  <th className="text-right py-3.5 px-4 font-medium">الطول (م)</th>
                  <th className="text-right py-3.5 px-4 font-medium">المخزون</th>
                  <th className="text-right py-3.5 px-4 font-medium">الحالة</th>
                  <th className="py-3.5 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <>
                    <tr key={c._id} className={`border-t border-zinc-800/50 transition-colors ${expanded === c._id ? "bg-zinc-900/60" : "hover:bg-zinc-900/30"}`}>
                      <td className="py-3.5 px-5 font-bold text-white font-mono">{c.details} mm²</td>
                      <td className="py-3.5 px-4 text-zinc-300">{c.lengths} م</td>
                      <td className="py-3.5 px-4 font-bold text-white tabular-nums">{c.stock}</td>
                      <td className="py-3.5 px-4"><StockBadge stock={c.stock} /></td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => setModal({ type: "dispense", cable: c })} title="صرف"
                            disabled={c.stock === 0}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-40">
                            <TrendingDown size={14} />
                          </button>
                          <button onClick={() => setModal({ type: "addStock", cable: c })} title="إضافة"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition">
                            <TrendingUp size={14} />
                          </button>
                          <button onClick={() => setModal({ type: "edit", cable: c })} title="تعديل"
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setExpanded(expanded === c._id ? null : c._id)} title="الحركات"
                            className={`p-1.5 rounded-lg transition ${expanded === c._id ? "bg-yellow-500/20 text-yellow-400" : "bg-zinc-700/60 text-zinc-400 hover:bg-zinc-700"}`}>
                            {expanded === c._id ? <ChevronUp size={14} /> : <History size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expanded === c._id && (
                      <tr key={`${c._id}-movements`} className="border-t border-zinc-800/30">
                        <td colSpan={5} className="bg-zinc-900/40 px-5 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <History size={13} className="text-yellow-400" />
                            <span className="text-xs font-semibold text-zinc-400">سجل حركات كابل {c.details}mm²</span>
                          </div>
                          <MovementsPanel cableId={c._id} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === "add"          && <AddCableModal onClose={() => setModal(null)} onSuccess={() => fetchCables(true)} />}
      {modal?.type === "edit"         && <EditCableModal cable={modal.cable} onClose={() => setModal(null)} onSuccess={() => fetchCables(true)} />}
      {modal?.type === "dispense"     && <DispenseModal cable={modal.cable} onClose={() => setModal(null)} onSuccess={() => fetchCables(true)} />}
      {modal?.type === "addStock"     && <AddStockModal cable={modal.cable} onClose={() => setModal(null)} onSuccess={() => fetchCables(true)} />}
      {modal?.type === "allMovements" && <AllMovementsModal onClose={() => setModal(null)} />}
    </div>
  );
}
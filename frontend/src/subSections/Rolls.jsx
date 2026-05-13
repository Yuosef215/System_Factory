import { useEffect, useState, useCallback, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Plus, TrendingDown, TrendingUp,
  History, Search, X, Loader2, ChevronUp,
  Pencil, Trash2, AlertTriangle, Calendar,
  Package, RefreshCw, Cog, Filter
} from "lucide-react";
import api from "../api/axios";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function StockBadge({ stock }) {
  if (stock === 0)
    return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/25">نفد</span>;
  if (stock < 5)
    return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">منخفض</span>;
  return <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">متاح</span>;
}

const REASON_LABELS = { production: "إنتاج", maintenance: "صيانة", purchase: "شراء" };

// ─────────────────────────────────────────────────────────────────
// Modal Wrapper
// ─────────────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children, width = "max-w-md" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-[#111113] border border-zinc-800 rounded-2xl w-full ${width} shadow-2xl shadow-black/60`}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition mt-0.5"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-400 mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

const inputCls = "w-full bg-zinc-900 border border-zinc-700/80 focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/20 outline-none rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 transition-all duration-200";

function ServerError({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
      <AlertTriangle size={15} className="shrink-0" /> {msg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Add Roll Modal
// ─────────────────────────────────────────────────────────────────
function AddRollModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ companyName: "", rollCode: "", widthRoll: "", diameterRoll: "", stock: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handle = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.companyName.trim()) e.companyName = "مطلوب";
    if (!form.rollCode.trim()) e.rollCode = "مطلوب";
    if (!form.widthRoll || isNaN(form.widthRoll)) e.widthRoll = "رقم مطلوب";
    if (!form.diameterRoll || isNaN(form.diameterRoll)) e.diameterRoll = "رقم مطلوب";
    if (form.stock === "" || isNaN(form.stock)) e.stock = "رقم مطلوب";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setServerError("");
    try {
      setLoading(true);
      await api.post("/rolls/createRoll", {
        companyName: form.companyName,
        rollCode: form.rollCode,
        widthRoll: Number(form.widthRoll),
        diameterRoll: Number(form.diameterRoll),
        stock: Number(form.stock),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="إضافة رول جديد" subtitle="أدخل بيانات الرول" onClose={onClose}>
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="الشركة المصنعة" error={errors.companyName}>
            <input name="companyName" value={form.companyName} onChange={handle} placeholder="SKF, FAG..." className={inputCls} />
          </Field>
          <Field label="كود الرول" error={errors.rollCode}>
            <input name="rollCode" value={form.rollCode} onChange={handle} placeholder="R-001" className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="العرض (mm)" error={errors.widthRoll}>
            <input name="widthRoll" type="number" value={form.widthRoll} onChange={handle} placeholder="50" className={inputCls} />
          </Field>
          <Field label="القطر (mm)" error={errors.diameterRoll}>
            <input name="diameterRoll" type="number" value={form.diameterRoll} onChange={handle} placeholder="100" className={inputCls} />
          </Field>
        </div>
        <Field label="الكمية الأولية" error={errors.stock}>
          <input name="stock" type="number" min="0" value={form.stock} onChange={handle} placeholder="0" className={inputCls} />
        </Field>
        <ServerError msg={serverError} />
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">إلغاء</button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} حفظ
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Dispense Modal
// ─────────────────────────────────────────────────────────────────
function DispenseModal({ roll, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("production");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (Number(quantity) < 1) return setError("الكمية يجب أن تكون 1 على الأقل");
    if (Number(quantity) > roll.stock) return setError(`الكمية أكبر من المتاح (${roll.stock})`);
    try {
      setLoading(true);
      await api.patch(`/rolls/dispenseRoll/${roll._id}`, { quantity: Number(quantity), reason });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="صرف من المخزون" subtitle={`${roll.companyName} — ${roll.rollCode}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <span className="text-sm text-zinc-400">المخزون الحالي</span>
          <span className="text-lg font-bold text-white">{roll.stock}</span>
        </div>
        <Field label="الكمية">
          <input type="number" min={1} max={roll.stock} value={quantity}
            onChange={(e) => setQuantity(e.target.value)} className={inputCls} />
        </Field>
        <Field label="سبب الصرف">
          <div className="relative">
            <select value={reason} onChange={(e) => setReason(e.target.value)} className={`${inputCls} appearance-none`}>
              <option value="production">إنتاج</option>
              <option value="maintenance">صيانة</option>
            </select>
            <ChevronUp size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none rotate-180" />
          </div>
        </Field>
        {Number(quantity) > 0 && Number(quantity) <= roll.stock && (
          <div className="text-xs text-zinc-500 bg-zinc-900 rounded-xl px-4 py-2.5 flex justify-between">
            <span>الرصيد بعد الصرف</span>
            <span className="text-amber-400 font-semibold">{roll.stock - Number(quantity)}</span>
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
function AddStockModal({ roll, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (Number(quantity) < 1) return setError("الكمية يجب أن تكون 1 على الأقل");
    try {
      setLoading(true);
      await api.patch(`/rolls/addStockRoll/${roll._id}`, { quantity: Number(quantity), reason: "purchase" });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="إضافة للمخزون" subtitle={`${roll.companyName} — ${roll.rollCode}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <span className="text-sm text-zinc-400">المخزون الحالي</span>
          <span className="text-lg font-bold text-white">{roll.stock}</span>
        </div>
        <Field label="الكمية المضافة">
          <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputCls} />
        </Field>
        {Number(quantity) > 0 && (
          <div className="text-xs text-zinc-500 bg-zinc-900 rounded-xl px-4 py-2.5 flex justify-between">
            <span>الرصيد بعد الإضافة</span>
            <span className="text-emerald-400 font-semibold">{roll.stock + Number(quantity)}</span>
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
function MovementsPanel({ rollId }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/rolls/getRollMovements/${rollId}`)
      .then((r) => setMovements(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rollId]);

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
              <td className="py-2 px-3 text-zinc-500">{m.createdBy || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// All Movements Modal (by date)
// ─────────────────────────────────────────────────────────────────
function AllMovementsModal({ onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchMovements = async () => {
    if (!date) return;
    setLoading(true);
    setFetched(false);
    try {
      const res = await api.get(`/rolls/getMovementsByDate?date=${date}`);
      setMovements(res.data.data);
    } catch {}
    finally { setLoading(false); setFetched(true); }
  };

  useEffect(() => { fetchMovements(); }, []);

  return (
    <Modal title="سجل الحركات اليومي" subtitle="كل حركات الرولات" onClose={onClose} width="max-w-3xl">
      <div className="space-y-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">اختر التاريخ</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className={inputCls} style={{ colorScheme: "dark" }} />
          </div>
          <button onClick={fetchMovements}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
            <Filter size={15} /> عرض
          </button>
        </div>

        {loading && <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-zinc-600" size={22} /></div>}

        {!loading && fetched && movements.length === 0 && (
          <div className="text-center py-12 text-zinc-600">
            <Package size={36} className="mx-auto mb-3 opacity-40" />
            <p>لا توجد حركات في هذا اليوم</p>
          </div>
        )}

        {!loading && movements.length > 0 && (
          <div className="rounded-xl border border-zinc-800 overflow-hidden max-h-[60vh] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800">
                <tr className="text-zinc-500">
                  <th className="text-right py-2.5 px-4 font-medium">الرول</th>
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
                      <div className="font-semibold text-white">{m.codeRoll || m.roll?.rollCode || "—"}</div>
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
                    <td className="py-2.5 px-4 text-zinc-400">{m.createdBy || "—"}</td>
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
export default function Rolls() {
  const navigate = useNavigate();
  const [rolls, setRolls]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [expanded, setExpanded]     = useState(null);
  const [modal, setModal]           = useState(null);

  const fetchRolls = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/rolls/getRolls");
      setRolls(res.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchRolls(); }, []);

  const filtered = rolls.filter(
    (r) =>
      r.rollCode?.toLowerCase().includes(search.toLowerCase()) ||
      r.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:      rolls.length,
    outOfStock: rolls.filter((r) => r.stock === 0).length,
    low:        rolls.filter((r) => r.stock > 0 && r.stock < 1).length,
    totalStock: rolls.reduce((s, r) => s + r.stock, 0),
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/mechanical")}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm font-medium">
              <ArrowRight size={16} /> الميكانيكا
            </button>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2">
              <Cog size={16} className="text-blue-400" />
              <span className="text-white font-semibold text-sm">الرولات</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setModal({ type: "allMovements" })}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition">
              <Calendar size={15} /> سجل الحركات
            </button>
            <button onClick={() => fetchRolls(true)} disabled={refreshing}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setModal({ type: "add" })}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-blue-500/20">
              <Plus size={16} /> إضافة رول
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "إجمالي الأصناف", value: stats.total,      color: "text-white",       bg: "bg-zinc-800/50" },
            { label: "إجمالي القطع",   value: stats.totalStock, color: "text-blue-400",    bg: "bg-blue-500/10 border border-blue-500/20" },
            { label: "مخزون منخفض",   value: stats.low,        color: "text-amber-400",   bg: "bg-amber-500/10 border border-amber-500/20" },
            { label: "نفد المخزون",   value: stats.outOfStock, color: "text-red-400",     bg: "bg-red-500/10 border border-red-500/20" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl px-5 py-4 ${s.bg}`}>
              <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالكود أو الشركة..."
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 focus:border-zinc-600 outline-none rounded-xl px-4 py-2.5 pr-9 text-sm text-white placeholder:text-zinc-600 transition" />
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-zinc-500">
            <Loader2 className="animate-spin" size={22} /> جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/80 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-500 text-xs border-b border-zinc-800">
                  <th className="text-right py-3.5 px-5 font-medium">الشركة</th>
                  <th className="text-right py-3.5 px-4 font-medium">الكود</th>
                  <th className="text-right py-3.5 px-4 font-medium">العرض (mm)</th>
                  <th className="text-right py-3.5 px-4 font-medium">القطر (mm)</th>
                  <th className="text-right py-3.5 px-4 font-medium">المخزون</th>
                  <th className="text-right py-3.5 px-4 font-medium">الحالة</th>
                  <th className="py-3.5 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <Fragment key={r._id}>
                    <tr className={`border-t border-zinc-800/50 transition-colors ${expanded === r._id ? "bg-zinc-900/60" : "hover:bg-zinc-900/30"}`}>
                      <td className="py-3.5 px-5 font-semibold text-white">{r.companyName}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-1 rounded-lg">{r.rollCode}</span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300">{r.widthRoll}</td>
                      <td className="py-3.5 px-4 text-zinc-300">{r.diameterRoll}</td>
                      <td className="py-3.5 px-4 font-bold text-white tabular-nums">{r.stock}</td>
                      <td className="py-3.5 px-4"><StockBadge stock={r.stock} /></td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => setModal({ type: "dispense", roll: r })}
                            title="صرف" disabled={r.stock === 0}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition">
                            <TrendingDown size={14} />
                          </button>
                          <button onClick={() => setModal({ type: "addStock", roll: r })}
                            title="إضافة مخزون"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition">
                            <TrendingUp size={14} />
                          </button>
                          <button onClick={() => setExpanded(expanded === r._id ? null : r._id)}
                            title="الحركات"
                            className={`p-1.5 rounded-lg transition ${expanded === r._id ? "bg-blue-500/20 text-blue-400" : "bg-zinc-700/60 text-zinc-400 hover:bg-zinc-700"}`}>
                            {expanded === r._id ? <ChevronUp size={14} /> : <History size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expanded === r._id && (
                      <tr className="border-t border-zinc-800/30">
                        <td colSpan={7} className="bg-zinc-900/40 px-5 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <History size={13} className="text-blue-400" />
                            <span className="text-xs font-semibold text-zinc-400">سجل حركات {r.rollCode}</span>
                          </div>
                          <MovementsPanel rollId={r._id} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal?.type === "add"          && <AddRollModal onClose={() => setModal(null)} onSuccess={() => fetchRolls(true)} />}
      {modal?.type === "dispense"     && <DispenseModal roll={modal.roll} onClose={() => setModal(null)} onSuccess={() => fetchRolls(true)} />}
      {modal?.type === "addStock"     && <AddStockModal roll={modal.roll} onClose={() => setModal(null)} onSuccess={() => fetchRolls(true)} />}
      {modal?.type === "allMovements" && <AllMovementsModal onClose={() => setModal(null)} />}
    </div>
  );
}
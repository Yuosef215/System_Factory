import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Plus, Minus, PackagePlus, History,
  Search, X, Loader2, ChevronDown, ChevronUp,
  Pencil, Trash2, AlertTriangle, Calendar, Filter,
  TrendingDown, TrendingUp, Package, RefreshCw, Printer,
} from "lucide-react";
import api from "../api/axios";
import {printItemMovements, printDailyMovements} from "../utils/printPDF";

// ─────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────
const REASON_LABELS = {
  production: "إنتاج",
  maintenance: "صيانة",
  purchase: "شراء",
};

function StockBadge({ stock }) {
  if (stock === 0)
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/25">نفد</span>;
  if (stock < 5)
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">منخفض</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">متاح</span>;
}

// ─────────────────────────────────────────────────────────────────
// Modal wrapper
// ─────────────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children, width = "max-w-md" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-[#111113] border border-zinc-800 rounded-2xl w-full ${width} shadow-2xl shadow-black/60`}>
        <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition mt-0.5">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Input component
// ─────────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-400 mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full bg-zinc-900 border border-zinc-700/80 focus:border-orange-500/70 focus:ring-1 focus:ring-orange-500/20 outline-none rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 transition-all duration-200";

const selectClass =
  "w-full bg-zinc-900 border border-zinc-700/80 focus:border-orange-500/70 focus:ring-1 focus:ring-orange-500/20 outline-none rounded-xl px-4 py-2.5 text-white text-sm transition-all duration-200 appearance-none";

// ─────────────────────────────────────────────────────────────────
// Add Bearing Modal
// ─────────────────────────────────────────────────────────────────
function AddBearingModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    brandtype: "", code: "", innerdiameter: "", outerdiameter: "", width: "", stock: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handle = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.brandtype.trim()) e.brandtype = "مطلوب";
    if (!form.code.trim()) e.code = "مطلوب";
    if (!form.innerdiameter.trim()) e.innerdiameter = "مطلوب";
    if (!form.outerdiameter.trim()) e.outerdiameter = "مطلوب";
    if (!form.width.trim()) e.width = "مطلوب";
    if (!form.stock || Number(form.stock) < 0) e.stock = "يجب أن تكون الكمية 0 أو أكبر";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setServerError("");
    try {
      setLoading(true);
      await api.post("/ball-bearing/create", { ...form, stock: Number(form.stock) });
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || "حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return 
    (
      <Modal title="إضافة بيرينج جديد" subtitle="أدخل بيانات البيرينج" onClose={onClose}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="الماركة" error={errors.brandtype}>
              <input name="brandtype" value={form.brandtype} onChange={handle} placeholder="SKF, FAG, ..." className={inputClass} />
            </Field>
          <Field label="الكود" error={errors.code}>
            <input name="code" value={form.code} onChange={handle} placeholder="6205-2RS" className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="القطر الداخلي" error={errors.innerdiameter}>
            <input name="innerdiameter" value={form.innerdiameter} onChange={handle} placeholder="25mm" className={inputClass} />
          </Field>
          <Field label="القطر الخارجي" error={errors.outerdiameter}>
            <input name="outerdiameter" value={form.outerdiameter} onChange={handle} placeholder="52mm" className={inputClass} />
          </Field>
          <Field label="العرض" error={errors.width}>
            <input name="width" value={form.width} onChange={handle} placeholder="15mm" className={inputClass} />
          </Field>
        </div>
        <Field label="الكمية الأولية" error={errors.stock}>
          <input name="stock" type="number" min="0" value={form.stock} onChange={handle} placeholder="0" className={inputClass} />
        </Field>
        {serverError && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            <AlertTriangle size={15} className="shrink-0" /> {serverError}
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">
            إلغاء
          </button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} حفظ
          </button>
        </div>
      </div>
    </Modal>
    )}
  


// ─────────────────────────────────────────────────────────────────
// Edit Bearing Modal
// ─────────────────────────────────────────────────────────────────
function EditBearingModal({ bearing, onClose, onSuccess }) {
  const [form, setForm] = useState({
    brandtype: bearing.brandtype,
    code: bearing.code,
    innerdiameter: bearing.innerdiameter,
    outerdiameter: bearing.outerdiameter,
    width: bearing.width,
  });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    setServerError("");
    try {
      setLoading(true);
      // PUT /:id — update fields (stock لا يُعدَّل من هنا)
      await api.put(`/ball-bearing/${bearing._id}`, form);
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="تعديل البيرينج" subtitle={`كود: ${bearing.code}`} onClose={onClose}>
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="الماركة">
            <input name="brandtype" value={form.brandtype} onChange={handle} className={inputClass} />
          </Field>
          <Field label="الكود">
            <input name="code" value={form.code} onChange={handle} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="القطر الداخلي">
            <input name="innerdiameter" value={form.innerdiameter} onChange={handle} className={inputClass} />
          </Field>
          <Field label="القطر الخارجي">
            <input name="outerdiameter" value={form.outerdiameter} onChange={handle} className={inputClass} />
          </Field>
          <Field label="العرض">
            <input name="width" value={form.width} onChange={handle} className={inputClass} />
          </Field>
        </div>
        {serverError && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            <AlertTriangle size={15} /> {serverError}
          </div>
        )}
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
function DispenseModal({ bearing, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("production");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (Number(quantity) < 1) return setError("الكمية يجب أن تكون 1 على الأقل");
    if (Number(quantity) > bearing.stock) return setError(`الكمية أكبر من المتاح (${bearing.stock})`);
    try {
      setLoading(true);
      await api.patch(`/ball-bearing/dispense/${bearing._id}`, { quantity: Number(quantity), reason });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="صرف من المخزون" subtitle={`${bearing.brandtype} — ${bearing.code}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <span className="text-sm text-zinc-400">المخزون الحالي</span>
          <span className="text-lg font-bold text-white">{bearing.stock}</span>
        </div>
        <Field label="الكمية المطلوب صرفها">
          <input type="number" min={1} max={bearing.stock} value={quantity}
            onChange={(e) => setQuantity(e.target.value)} className={inputClass} />
        </Field>
        <Field label="سبب الصرف">
          <div className="relative">
            <select value={reason} onChange={(e) => setReason(e.target.value)} className={selectClass}>
              <option value="production">إنتاج</option>
              <option value="maintenance">صيانة</option>
            </select>
            <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </Field>
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            <AlertTriangle size={15} /> {error}
          </div>
        )}
        {Number(quantity) > 0 && Number(quantity) <= bearing.stock && (
          <div className="text-xs text-zinc-500 bg-zinc-900 rounded-xl px-4 py-2.5 flex justify-between">
            <span>الرصيد بعد الصرف</span>
            <span className="text-amber-400 font-semibold">{bearing.stock - Number(quantity)}</span>
          </div>
        )}
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
function AddStockModal({ bearing, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (Number(quantity) < 1) return setError("الكمية يجب أن تكون 1 على الأقل");
    try {
      setLoading(true);
      await api.patch(`/ball-bearing/add-stock/${bearing._id}`, { quantity: Number(quantity), reason: "purchase" });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="إضافة للمخزون" subtitle={`${bearing.brandtype} — ${bearing.code}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <span className="text-sm text-zinc-400">المخزون الحالي</span>
          <span className="text-lg font-bold text-white">{bearing.stock}</span>
        </div>
        <Field label="الكمية المضافة">
          <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} />
        </Field>
        {Number(quantity) > 0 && (
          <div className="text-xs text-zinc-500 bg-zinc-900 rounded-xl px-4 py-2.5 flex justify-between">
            <span>الرصيد بعد الإضافة</span>
            <span className="text-emerald-400 font-semibold">{bearing.stock + Number(quantity)}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            <AlertTriangle size={15} /> {error}
          </div>
        )}
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
// Delete Confirm Modal
// ─────────────────────────────────────────────────────────────────
function DeleteModal({ bearing, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setLoading(true);
      await api.delete(`/ball-bearing/${bearing._id}`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="حذف البيرينج" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-300 font-semibold">تحذير: لا يمكن التراجع عن هذا الإجراء</p>
            <p className="text-xs text-red-400/80 mt-1">
              هل أنت متأكد من حذف <strong className="text-white">{bearing.code}</strong>؟
              <br />لن يتم الحذف إذا كانت هناك حركات مسجلة عليه.
            </p>
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
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
// Movements Panel (per bearing)
// ─────────────────────────────────────────────────────────────────
function MovementsPanel({ bearingId }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/ball-bearing/movements/${bearingId}`)
      .then((r) => setMovements(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bearingId]);

  if (loading)
    return <div className="py-8 flex justify-center text-zinc-600"><Loader2 className="animate-spin" size={20} /></div>;

  if (!movements.length)
    return <p className="text-center text-zinc-600 text-sm py-6">لا توجد حركات مسجلة</p>;

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
// All Movements Modal (by date)
// ─────────────────────────────────────────────────────────────────
function AllMovementsModal({ onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetch = async () => {
    if (!date) return;
    setLoading(true);
    setFetched(false);
    try {
      const res = await api.get(`/ball-bearing/movements?date=${date}`);
      setMovements(res.data.data);
    } catch {}
    finally { setLoading(false); setFetched(true); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <Modal title="سجل الحركات اليومي" subtitle="عرض كل حركات الصرف والإضافة" onClose={onClose} width="max-w-3xl">
      <div className="space-y-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">اختر التاريخ</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className={inputClass} style={{ colorScheme: "dark" }} />
          </div>
          <button onClick={fetch}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
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
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
              <button
    onClick={() => printDailyMovements(movements, date)}
    title="طباعة"
    className="p-1.5 rounded-lg bg-zinc-700/60 text-zinc-400 hover:bg-orange-500/20 hover:text-orange-400 transition">
    <Printer size={20} />
  </button>
              <span className="text-xs text-zinc-400">{movements.length} حركة</span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 bg-zinc-900/50">
                  <th className="text-right py-2.5 px-4 font-medium">البيرينج</th>
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
                      <div className="font-semibold text-white">{m.ballBearing?.code || "—"}</div>
                      <div className="text-zinc-500">{m.ballBearing?.brandtype}</div>
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
export default function BallBearings() {
  const navigate = useNavigate();
  const [bearings, setBearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBearings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/ball-bearing/all_bearings");
      setBearings(res.data.data);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchBearings(); }, []);

  const filtered = bearings.filter(
    (b) =>
      b.code?.toLowerCase().includes(search.toLowerCase()) ||
      b.brandtype?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: bearings.length,
    outOfStock: bearings.filter((b) => b.stock === 0).length,
    low: bearings.filter((b) => b.stock > 0 && b.stock < 5).length,
    totalStock: bearings.reduce((s, b) => s + b.stock, 0),
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">
      

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/mechanical")}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm font-medium">
              <ArrowRight size={16} /> الميكانيكا
            </button>
            <span className="text-zinc-700">/</span>
            <span className="text-white font-semibold text-sm">البيرينجات</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setModal({ type: "allMovements" })}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition">
              <Calendar size={15} /> سجل الحركات
            </button>
            <button onClick={() => fetchBearings(true)} disabled={refreshing}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setModal({ type: "add" })}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-orange-500/20">
              <Plus size={16} /> إضافة بيرينج
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "إجمالي الأصناف", value: stats.total, color: "text-white", bg: "bg-zinc-800/50" },
            { label: "إجمالي القطع", value: stats.totalStock, color: "text-blue-400", bg: "bg-blue-500/10 border border-blue-500/20" },
            { label: "مخزون منخفض", value: stats.low, color: "text-amber-400", bg: "bg-amber-500/10 border border-amber-500/20" },
            { label: "نفد المخزون", value: stats.outOfStock, color: "text-red-400", bg: "bg-red-500/10 border border-red-500/20" },
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
            placeholder="بحث بالكود أو الماركة..."
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
                  <th className="text-right py-3.5 px-5 font-medium">الماركة</th>
                  <th className="text-right py-3.5 px-4 font-medium">الكود</th>
                  <th className="text-right py-3.5 px-4 font-medium">القطر الداخلي</th>
                  <th className="text-right py-3.5 px-4 font-medium">القطر الخارجي</th>
                  <th className="text-right py-3.5 px-4 font-medium">العرض</th>
                  <th className="text-right py-3.5 px-4 font-medium">المخزون</th>
                  <th className="text-right py-3.5 px-4 font-medium">الحالة</th>
                  <th className="py-3.5 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <>
                    {/* Main row */}
                    <tr key={b._id} className={`border-t border-zinc-800/50 transition-colors ${expanded === b._id ? "bg-zinc-900/60" : "hover:bg-zinc-900/30"}`}>
                      <td className="py-3.5 px-5 font-semibold text-white">{b.brandtype}</td>
                      <td className="py-3.5 px-4 font-mono text-zinc-300 text-xs bg-zinc-800/30 rounded">{b.code}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{b.innerdiameter}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{b.outerdiameter}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{b.width}</td>
                      <td className="py-3.5 px-4 font-bold text-white tabular-nums">{b.stock}</td>
                      <td className="py-3.5 px-4"><StockBadge stock={b.stock} /></td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          {/* Dispense */}
                          <button onClick={() => setModal({ type: "dispense", bearing: b })} title="صرف"
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition" disabled={b.stock === 0}>
                            <TrendingDown size={14} />
                          </button>
                          {/* Add stock */}
                          <button onClick={() => setModal({ type: "addStock", bearing: b })} title="إضافة للمخزون"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition">
                            <TrendingUp size={14} />
                          </button>
                          {/* Edit */}
                          <button onClick={() => setModal({ type: "edit", bearing: b })} title="تعديل"
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition">
                            <Pencil size={14} />
                          </button>
                          {/* Delete */}
                          <button onClick={() => setModal({ type: "delete", bearing: b })} title="حذف"
                            className="p-1.5 rounded-lg bg-zinc-700/60 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition">
                            <Trash2 size={14} />
                          </button>
                          {/* History */}
                          <button onClick={() => setExpanded(expanded === b._id ? null : b._id)} title="الحركات"
                            className={`p-1.5 rounded-lg transition ${expanded === b._id ? "bg-orange-500/20 text-orange-400" : "bg-zinc-700/60 text-zinc-400 hover:bg-zinc-700"}`}>
                            {expanded === b._id ? <ChevronUp size={14} /> : <History size={14} />}
                          </button>
                          {/* Print */}
                          <button onClick={() => printDailyMovements(movements, date)} title="طباعة"
                            className="p-1.5 rounded-lg bg-zinc-700/60 text-zinc-400 hover:bg-orange-500/20 hover:text-orange-400 transition">
                            <Printer size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded movements */}
                    {expanded === b._id && (
                      <tr key={`${b._id}-movements`} className="border-t border-zinc-800/30">
                        <td colSpan={8} className="bg-zinc-900/40 px-5 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <History size={13} className="text-orange-400" />
                            <span className="text-xs font-semibold text-zinc-400">سجل حركات {b.code}</span>
                          </div>
                          <MovementsPanel bearingId={b._id} />
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

      {/* ── Modals ── */}
      {modal?.type === "add"          && <AddBearingModal onClose={() => setModal(null)} onSuccess={() => fetchBearings(true)} />}
      {modal?.type === "edit"         && <EditBearingModal bearing={modal.bearing} onClose={() => setModal(null)} onSuccess={() => fetchBearings(true)} />}
      {modal?.type === "dispense"     && <DispenseModal bearing={modal.bearing} onClose={() => setModal(null)} onSuccess={() => fetchBearings(true)} />}
      {modal?.type === "addStock"     && <AddStockModal bearing={modal.bearing} onClose={() => setModal(null)} onSuccess={() => fetchBearings(true)} />}
      {modal?.type === "delete"       && <DeleteModal bearing={modal.bearing} onClose={() => setModal(null)} onSuccess={() => fetchBearings(true)} />}
      {modal?.type === "allMovements" && <AllMovementsModal onClose={() => setModal(null)} />}
    </div>
  );
}

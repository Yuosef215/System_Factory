import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Plus, TrendingDown, TrendingUp,
  History, Search, X, Loader2, ChevronUp,
  Pencil, Trash2, AlertTriangle, Calendar,
  Filter, Package, RefreshCw, Zap
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
// Field + Input styles
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

const inputCls =
  "w-full bg-zinc-900 border border-zinc-700/80 focus:border-yellow-500/70 focus:ring-1 focus:ring-yellow-500/20 outline-none rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 transition-all duration-200";

function ServerError({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
      <AlertTriangle size={15} className="shrink-0" /> {msg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Add Contactor Modal
// ─────────────────────────────────────────────────────────────────
function AddContactorModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    companyName: "", mass_kg: "", volt: "", not_asstant: "", stock: "",
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
    if (!form.companyName.trim()) e.companyName = "مطلوب";
    if (!form.mass_kg || isNaN(form.mass_kg)) e.mass_kg = "رقم مطلوب";
    if (!form.volt || isNaN(form.volt)) e.volt = "رقم مطلوب";
    if (!form.not_asstant.trim()) e.not_asstant = "مطلوب";
    if (form.stock === "" || isNaN(form.stock)) e.stock = "رقم مطلوب";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setServerError("");
    try {
      setLoading(true);
      await api.post("/contactors/createContactor", {
        companyName: form.companyName,
        mass_kg: Number(form.mass_kg),
        volt: Number(form.volt),
        not_asstant: form.not_asstant,
        stock: Number(form.stock),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || "حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="إضافة كونتاكتور جديد" subtitle="أدخل بيانات الكونتاكتور" onClose={onClose}>
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="الشركة المصنعة" error={errors.companyName}>
            <input name="companyName" value={form.companyName} onChange={handle}
              placeholder="Siemens, Schneider..." className={inputCls} />
          </Field>
          <Field label="not_asstant" error={errors.not_asstant}>
            <input name="not_asstant" value={form.not_asstant} onChange={handle}
              placeholder="NO / NC" className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="الوزن (kg)" error={errors.mass_kg}>
            <input name="mass_kg" type="number" value={form.mass_kg} onChange={handle}
              placeholder="0.5" className={inputCls} />
          </Field>
          <Field label="الفولت" error={errors.volt}>
            <input name="volt" type="number" value={form.volt} onChange={handle}
              placeholder="220" className={inputCls} />
          </Field>
        </div>
        <Field label="الكمية الأولية" error={errors.stock}>
          <input name="stock" type="number" min="0" value={form.stock} onChange={handle}
            placeholder="0" className={inputCls} />
        </Field>
        <ServerError msg={serverError} />
        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">
            إلغاء
          </button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-black font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} حفظ
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Edit Contactor Modal
// ─────────────────────────────────────────────────────────────────
function EditContactorModal({ contactor, onClose, onSuccess }) {
  const [form, setForm] = useState({
    companyName: contactor.companyName,
    mass_kg: contactor.mass_kg,
    volt: contactor.volt,
    not_asstant: contactor.not_asstant,
  });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    setServerError("");
    try {
      setLoading(true);
      await api.put(`/contactors/${contactor._id}`, {
        companyName: form.companyName,
        mass_kg: Number(form.mass_kg),
        volt: Number(form.volt),
        not_asstant: form.not_asstant,
        stock: contactor.stock,
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
    <Modal title="تعديل الكونتاكتور" subtitle={`${contactor.companyName} — ${contactor.volt}V`} onClose={onClose}>
      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="الشركة المصنعة">
            <input name="companyName" value={form.companyName} onChange={handle} className={inputCls} />
          </Field>
          <Field label="not_asstant">
            <input name="not_asstant" value={form.not_asstant} onChange={handle} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="الوزن (kg)">
            <input name="mass_kg" type="number" value={form.mass_kg} onChange={handle} className={inputCls} />
          </Field>
          <Field label="الفولت">
            <input name="volt" type="number" value={form.volt} onChange={handle} className={inputCls} />
          </Field>
        </div>
        <ServerError msg={serverError} />
        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">
            إلغاء
          </button>
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
function DispenseModal({ contactor, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!reason.trim()) return setError("يرجى كتابة السبب");
    if (Number(quantity) < 1) return setError("الكمية يجب أن تكون 1 على الأقل");
    if (Number(quantity) > contactor.stock) return setError(`الكمية أكبر من المتاح (${contactor.stock})`);
    try {
      setLoading(true);
      await api.patch(`/contactors/dispense/${contactor._id}`, {
        quantity: Number(quantity),
        reason,
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
    <Modal title="صرف من المخزون" subtitle={`${contactor.companyName} — ${contactor.volt}V`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <span className="text-sm text-zinc-400">المخزون الحالي</span>
          <span className="text-lg font-bold text-white">{contactor.stock}</span>
        </div>
        <Field label="الكمية المطلوب صرفها">
          <input type="number" min={1} max={contactor.stock} value={quantity}
            onChange={(e) => setQuantity(e.target.value)} className={inputCls} />
        </Field>
        <Field label="سبب الصرف">
          <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="مثال: صيانة لوحة كهربائية" className={inputCls} />
        </Field>
        {Number(quantity) > 0 && Number(quantity) <= contactor.stock && (
          <div className="text-xs text-zinc-500 bg-zinc-900 rounded-xl px-4 py-2.5 flex justify-between">
            <span>الرصيد بعد الصرف</span>
            <span className="text-amber-400 font-semibold">{contactor.stock - Number(quantity)}</span>
          </div>
        )}
        <ServerError msg={error} />
        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">
            إلغاء
          </button>
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
function AddStockModal({ contactor, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (Number(quantity) < 1) return setError("الكمية يجب أن تكون 1 على الأقل");
    try {
      setLoading(true);
      await api.patch(`/contactors/addStock/${contactor._id}`, { quantity: Number(quantity) });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="إضافة للمخزون" subtitle={`${contactor.companyName} — ${contactor.volt}V`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <span className="text-sm text-zinc-400">المخزون الحالي</span>
          <span className="text-lg font-bold text-white">{contactor.stock}</span>
        </div>
        <Field label="الكمية المضافة">
          <input type="number" min={1} value={quantity}
            onChange={(e) => setQuantity(e.target.value)} className={inputCls} />
        </Field>
        {Number(quantity) > 0 && (
          <div className="text-xs text-zinc-500 bg-zinc-900 rounded-xl px-4 py-2.5 flex justify-between">
            <span>الرصيد بعد الإضافة</span>
            <span className="text-emerald-400 font-semibold">{contactor.stock + Number(quantity)}</span>
          </div>
        )}
        <ServerError msg={error} />
        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">
            إلغاء
          </button>
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
// Delete Modal
// ─────────────────────────────────────────────────────────────────
function DeleteModal({ contactor, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setLoading(true);
      await api.delete(`/contactors/${contactor._id}`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="حذف الكونتاكتور" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-300 font-semibold">لا يمكن التراجع عن هذا الإجراء</p>
            <p className="text-xs text-red-400/80 mt-1">
              هل أنت متأكد من حذف{" "}
              <strong className="text-white">{contactor.companyName} — {contactor.volt}V</strong>؟
            </p>
          </div>
        </div>
        <ServerError msg={error} />
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">
            إلغاء
          </button>
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
// Movements Panel (per contactor)
// ─────────────────────────────────────────────────────────────────
function MovementsPanel({ contactorId }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/contactors/movements/${contactorId}`)
      .then((r) => setMovements(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [contactorId]);

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
              <td className="py-2 px-3 text-zinc-400">{m.reason || "—"}</td>
              <td className="py-2 px-3 text-zinc-500">{m.createdBy || "—"}</td>
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
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/contactors/allMovements")
      .then((r) => setMovements(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Modal title="كل حركات الكونتاكتورات" subtitle={`${movements.length} حركة إجمالي`} onClose={onClose} width="max-w-3xl">
      <div className="space-y-4">
        {loading && (
          <div className="py-12 flex justify-center text-zinc-600">
            <Loader2 className="animate-spin" size={22} />
          </div>
        )}
        {!loading && movements.length === 0 && (
          <div className="text-center py-12 text-zinc-600">
            <Package size={36} className="mx-auto mb-3 opacity-40" />
            <p>لا توجد حركات مسجلة</p>
          </div>
        )}
        {!loading && movements.length > 0 && (
          <div className="rounded-xl border border-zinc-800 overflow-hidden max-h-[60vh] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800">
                <tr className="text-zinc-500">
                  <th className="text-right py-2.5 px-4 font-medium">الكونتاكتور</th>
                  <th className="text-right py-2.5 px-4 font-medium">العملية</th>
                  <th className="text-right py-2.5 px-4 font-medium">الكمية</th>
                  <th className="text-right py-2.5 px-4 font-medium">قبل → بعد</th>
                  <th className="text-right py-2.5 px-4 font-medium">السبب</th>
                  <th className="text-right py-2.5 px-4 font-medium">بواسطة</th>
                  <th className="text-right py-2.5 px-4 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m._id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-2.5 px-4 text-zinc-300 font-medium">{m.contactor?.companyName || "—"}</td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold
                        ${m.process === "صرف" ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                        {m.process === "صرف" ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                        {m.process}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-white">{m.quantity}</td>
                    <td className="py-2.5 px-4 text-zinc-400">{m.balanceBefore} → {m.balanceAfter}</td>
                    <td className="py-2.5 px-4 text-zinc-400">{m.reason || "—"}</td>
                    <td className="py-2.5 px-4 text-zinc-400">{m.createdBy || "—"}</td>
                    <td className="py-2.5 px-4 text-zinc-500">
                      {new Date(m.createdAt).toLocaleDateString("ar-EG", { day: "2-digit", month: "short" })}
                      {" — "}
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
export default function Contactors() {
  const navigate = useNavigate();
  const [contactors, setContactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContactors = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/contactors/");
      setContactors(res.data.data);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchContactors(); }, []);

  const filtered = contactors.filter(
    (c) =>
      c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      String(c.volt).includes(search) ||
      String(c.mass_kg).includes(search)
  );

  const stats = {
    total: contactors.length,
    outOfStock: contactors.filter((c) => c.stock === 0).length,
    low: contactors.filter((c) => c.stock > 0 && c.stock < 5).length,
    totalStock: contactors.reduce((s, c) => s + c.stock, 0),
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/electrical")}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm font-medium">
              <ArrowRight size={16} /> الكهرباء
            </button>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-white font-semibold text-sm">الكونتاكتورات</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setModal({ type: "allMovements" })}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition">
              <Calendar size={15} /> كل الحركات
            </button>
            <button onClick={() => fetchContactors(true)} disabled={refreshing}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setModal({ type: "add" })}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-yellow-500/20">
              <Plus size={16} /> إضافة كونتاكتور
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "إجمالي الأصناف", value: stats.total, color: "text-white", bg: "bg-zinc-800/50" },
            { label: "إجمالي القطع", value: stats.totalStock, color: "text-yellow-400", bg: "bg-yellow-500/10 border border-yellow-500/20" },
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
            placeholder="بحث بالشركة أو الفولت أو الوزن..."
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
                  <th className="text-right py-3.5 px-4 font-medium">الوزن (kg)</th>
                  <th className="text-right py-3.5 px-4 font-medium">الفولت</th>
                  <th className="text-right py-3.5 px-4 font-medium">not_asstant</th>
                  <th className="text-right py-3.5 px-4 font-medium">المخزون</th>
                  <th className="text-right py-3.5 px-4 font-medium">الحالة</th>
                  <th className="py-3.5 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <>
                    <tr key={c._id}
                      className={`border-t border-zinc-800/50 transition-colors ${expanded === c._id ? "bg-zinc-900/60" : "hover:bg-zinc-900/30"}`}>
                      <td className="py-3.5 px-5 font-semibold text-white">{c.companyName}</td>
                      <td className="py-3.5 px-4 text-zinc-300">{c.mass_kg}</td>
                      <td className="py-3.5 px-4 text-zinc-300">{c.volt}V</td>
                      <td className="py-3.5 px-4 text-zinc-400 font-mono text-xs">{c.not_asstant}</td>
                      <td className="py-3.5 px-4 font-bold text-white tabular-nums">{c.stock}</td>
                      <td className="py-3.5 px-4"><StockBadge stock={c.stock} /></td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => setModal({ type: "dispense", contactor: c })}
                            title="صرف" disabled={c.stock === 0}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition">
                            <TrendingDown size={14} />
                          </button>
                          <button onClick={() => setModal({ type: "addStock", contactor: c })}
                            title="إضافة مخزون"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition">
                            <TrendingUp size={14} />
                          </button>
                          <button onClick={() => setModal({ type: "edit", contactor: c })}
                            title="تعديل"
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setModal({ type: "delete", contactor: c })}
                            title="حذف"
                            className="p-1.5 rounded-lg bg-zinc-700/60 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition">
                            <Trash2 size={14} />
                          </button>
                          <button onClick={() => setExpanded(expanded === c._id ? null : c._id)}
                            title="الحركات"
                            className={`p-1.5 rounded-lg transition ${expanded === c._id ? "bg-yellow-500/20 text-yellow-400" : "bg-zinc-700/60 text-zinc-400 hover:bg-zinc-700"}`}>
                            {expanded === c._id ? <ChevronUp size={14} /> : <History size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded movements */}
                    {expanded === c._id && (
                      <tr key={`${c._id}-mv`} className="border-t border-zinc-800/30">
                        <td colSpan={7} className="bg-zinc-900/40 px-5 py-4">
                          <div className="flex items-center gap-2 mb-3">
                            <History size={13} className="text-yellow-400" />
                            <span className="text-xs font-semibold text-zinc-400">
                              سجل حركات {c.companyName} — {c.volt}V
                            </span>
                          </div>
                          <MovementsPanel contactorId={c._id} />
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
      {modal?.type === "add"          && <AddContactorModal onClose={() => setModal(null)} onSuccess={() => fetchContactors(true)} />}
      {modal?.type === "edit"         && <EditContactorModal contactor={modal.contactor} onClose={() => setModal(null)} onSuccess={() => fetchContactors(true)} />}
      {modal?.type === "dispense"     && <DispenseModal contactor={modal.contactor} onClose={() => setModal(null)} onSuccess={() => fetchContactors(true)} />}
      {modal?.type === "addStock"     && <AddStockModal contactor={modal.contactor} onClose={() => setModal(null)} onSuccess={() => fetchContactors(true)} />}
      {modal?.type === "delete"       && <DeleteModal contactor={modal.contactor} onClose={() => setModal(null)} onSuccess={() => fetchContactors(true)} />}
      {modal?.type === "allMovements" && <AllMovementsModal onClose={() => setModal(null)} />}
    </div>
  );
}
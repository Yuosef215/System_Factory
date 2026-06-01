import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Search, RefreshCw, Users as UsersIcon,
  Shield, CircleCheck, CircleX, Wifi, WifiOff, Loader2,
  Crown, Wrench, Eye, Package, Zap, ShoppingCart, Settings,
  Pencil, Trash2, UserX, X, AlertTriangle
} from "lucide-react";
import api from "../api/axios";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
const ROLE_MAP = {
  developer:           { label: "مطور",         color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20",   icon: Settings },
  gm:                  { label: "مدير عام",      color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/20",   icon: Crown },
  ceo:                 { label: "رئيس تنفيذي",  color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20",   icon: Crown },
  warehouse_manager:   { label: "مدير مخازن",   color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20",       icon: Package },
  warehouse_worker:    { label: "أمين مخزن",    color: "text-blue-300",    bg: "bg-blue-500/10 border-blue-500/20",       icon: Package },
  production_manager:  { label: "مدير إنتاج",   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: Wrench },
  maintenance_manager: { label: "مدير صيانة",   color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",         icon: Wrench },
  purchase_manager:    { label: "مدير مشتريات", color: "text-pink-400",    bg: "bg-pink-500/10 border-pink-500/20",       icon: ShoppingCart },
  electricity_manager: { label: "مدير كهرباء",  color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",     icon: Zap },
  viewer:              { label: "مشاهد",         color: "text-zinc-400",    bg: "bg-zinc-500/10 border-zinc-500/20",       icon: Eye },
  hr_manager:              { label: "مدير الموارد البشريه",         color: "text-zinc-400",    bg: "bg-zinc-500/10 border-zinc-500/20",       icon: Crown },
};

function RoleBadge({ role }) {
  const r = ROLE_MAP[role] || { label: role, color: "text-zinc-400", bg: "bg-zinc-800 border-zinc-700", icon: Shield };
  const Icon = r.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${r.bg} ${r.color}`}>
      <Icon size={11} /> {r.label}
    </span>
  );
}

function StatusBadge({ isActive }) {
  return isActive
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CircleCheck size={11} /> نشط</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20"><CircleX size={11} /> موقوف</span>;
}

function OnlineBadge({ isOnline }) {
  return isOnline
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"><Wifi size={11} /> متصل</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-500 border border-zinc-700"><WifiOff size={11} /> غير متصل</span>;
}

// ─────────────────────────────────────────────────────────────────
// Modal Wrapper
// ─────────────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#111113] border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl">
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

const inputCls = "w-full bg-zinc-900 border border-zinc-700/80 focus:border-orange-500/70 focus:ring-1 focus:ring-orange-500/20 outline-none rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 transition-all";

// ─────────────────────────────────────────────────────────────────
// Edit User Modal
// ─────────────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: user.name,
    code: user.code,
    role: user.role,
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    setError("");
    try {
      setLoading(true);
      const body = { name: form.name, code: form.code, role: form.role };
      if (form.password.trim()) body.password = form.password;
      await api.put(`/users/updateUser/${user._id}`, body);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="تعديل المستخدم" subtitle={user.name} onClose={onClose}>
      <div className="space-y-3.5">
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">الاسم</label>
          <input name="name" value={form.name} onChange={handle} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">الكود</label>
          <input name="code" value={form.code} onChange={handle} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">الدور</label>
          <select name="role" value={form.role} onChange={handle}
            className={`${inputCls} appearance-none`}>
            {Object.entries(ROLE_MAP).map(([val, r]) => (
              <option key={val} value={val}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
            كلمة مرور جديدة <span className="text-zinc-600">(اتركها فارغة إذا لم تريد تغييرها)</span>
          </label>
          <input name="password" type="password" value={form.password} onChange={handle}
            placeholder="••••••••" className={inputCls} />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            <AlertTriangle size={15} /> {error}
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">
            إلغاء
          </button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Pencil size={16} />}
            حفظ التعديلات
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Deactivate Modal
// ─────────────────────────────────────────────────────────────────
function DeactivateModal({ user, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setLoading(true);
      await api.patch(`/users/notActiveUser/${user._id}`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="إيقاف المستخدم" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">
            هل أنت متأكد من إيقاف حساب <strong className="text-white">{user.name}</strong>؟
            <br />
            <span className="text-amber-400/70 text-xs mt-1 block">لن يتمكن من تسجيل الدخول بعد ذلك</span>
          </p>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">
            إلغاء
          </button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserX size={16} />}
            تأكيد الإيقاف
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Delete Modal
// ─────────────────────────────────────────────────────────────────
function DeleteModal({ user, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setLoading(true);
      await api.delete(`/users/deleteUser/${user._id}`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="حذف المستخدم" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-300 font-semibold">لا يمكن التراجع عن هذا الإجراء</p>
            <p className="text-xs text-red-400/80 mt-1">
              هل أنت متأكد من حذف <strong className="text-white">{user.name}</strong> نهائياً؟
            </p>
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">
            إلغاء
          </button>
          <button onClick={submit} disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            حذف نهائي
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modal, setModal]           = useState(null);

  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/users/getAllUsers");
      setUsers(res.data.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.code?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total:    users.length,
    active:   users.filter((u) => u.isActive).length,
    online:   users.filter((u) => u.isOnline).length,
    inactive: users.filter((u) => !u.isActive).length,
  };

  // اليوزر الحالي عشان نمنع حذف أو إيقاف نفسه
  let currentUser = {};
  try { currentUser = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/home")}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm font-medium">
              <ArrowRight size={16} /> الرئيسية
            </button>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2">
              <UsersIcon size={16} className="text-orange-400" />
              <span className="text-white font-semibold text-sm">إدارة المستخدمين</span>
            </div>
          </div>
          <button onClick={() => fetchUsers(true)} disabled={refreshing}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition">
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "إجمالي المستخدمين", value: stats.total,    color: "text-white",       bg: "bg-zinc-800/50" },
            { label: "نشطين",             value: stats.active,   color: "text-emerald-400", bg: "bg-emerald-500/10 border border-emerald-500/20" },
            { label: "متصلين الآن",       value: stats.online,   color: "text-blue-400",    bg: "bg-blue-500/10 border border-blue-500/20" },
            { label: "موقوفين",           value: stats.inactive, color: "text-red-400",     bg: "bg-red-500/10 border border-red-500/20" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl px-5 py-4 ${s.bg}`}>
              <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو الكود..."
              className="bg-zinc-900 border border-zinc-800 focus:border-zinc-600 outline-none rounded-xl px-4 py-2 pr-9 text-sm text-white placeholder:text-zinc-600 transition w-64" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 outline-none rounded-xl px-4 py-2 text-sm text-white transition appearance-none">
            <option value="all">كل الأدوار</option>
            {Object.entries(ROLE_MAP).map(([val, r]) => (
              <option key={val} value={val}>{r.label}</option>
            ))}
          </select>
          {(search || roleFilter !== "all") && (
            <button onClick={() => { setSearch(""); setRoleFilter("all"); }}
              className="text-xs text-zinc-500 hover:text-white transition px-3 py-2 bg-zinc-800 rounded-xl">
              مسح الفلتر
            </button>
          )}
          <span className="text-xs text-zinc-600 mr-auto">{filtered.length} مستخدم</span>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-zinc-500">
            <Loader2 className="animate-spin" size={22} /> جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            <UsersIcon size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/80 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-500 text-xs border-b border-zinc-800">
                  <th className="text-right py-3.5 px-5 font-medium">الاسم</th>
                  <th className="text-right py-3.5 px-4 font-medium">الكود</th>
                  <th className="text-right py-3.5 px-4 font-medium">الدور</th>
                  <th className="text-right py-3.5 px-4 font-medium">الحالة</th>
                  <th className="text-right py-3.5 px-4 font-medium">الاتصال</th>
                  <th className="text-right py-3.5 px-4 font-medium">تاريخ الإنشاء</th>
                  <th className="py-3.5 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isMe = u._id === currentUser._id;
                  return (
                    <tr key={u._id} className="border-t border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-white">{u.name}</span>
                            {isMe && <span className="mr-2 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-md">أنت</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-1 rounded-lg">{u.code}</span>
                      </td>
                      <td className="py-3.5 px-4"><RoleBadge role={u.role} /></td>
                      <td className="py-3.5 px-4"><StatusBadge isActive={u.isActive} /></td>
                      <td className="py-3.5 px-4"><OnlineBadge isOnline={u.isOnline} /></td>
                      <td className="py-3.5 px-4 text-zinc-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString("ar-EG", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          {/* تعديل */}
                          <button onClick={() => setModal({ type: "edit", user: u })}
                            title="تعديل"
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition">
                            <Pencil size={14} />
                          </button>
                          {/* إيقاف — مش بيظهر لو هو نفسه أو موقوف */}
                          {!isMe && u.isActive && (
                            <button onClick={() => setModal({ type: "deactivate", user: u })}
                              title="إيقاف"
                              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition">
                              <UserX size={14} />
                            </button>
                          )}
                          {/* حذف — مش بيظهر لو هو نفسه */}
                          {!isMe && (
                            <button onClick={() => setModal({ type: "delete", user: u })}
                              title="حذف"
                              className="p-1.5 rounded-lg bg-zinc-700/60 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition">
                              <Trash2 size={14} />
                            </button>
                          )}
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

      {/* ── Modals ── */}
      {modal?.type === "edit"       && <EditUserModal user={modal.user} onClose={() => setModal(null)} onSuccess={() => fetchUsers(true)} />}
      {modal?.type === "deactivate" && <DeactivateModal user={modal.user} onClose={() => setModal(null)} onSuccess={() => fetchUsers(true)} />}
      {modal?.type === "delete"     && <DeleteModal user={modal.user} onClose={() => setModal(null)} onSuccess={() => fetchUsers(true)} />}
    </div>
  );
}
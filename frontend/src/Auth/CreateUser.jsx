import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import api from "../api/axios";

const ROLES = [
  { value: "developer",           label: "مطور" },
  { value: "gm",                  label: "مدير عام" },
  { value: "ceo",                 label: "رئيس تنفيذي" },
  { value: "warehouse_manager",   label: "مدير مخازن" },
  { value: "warehouse_worker",    label: "أمين مخزن" },
  { value: "production_manager",  label: "مدير إنتاج" },
  { value: "maintenance_manager", label: "مدير صيانة" },
  { value: "purchase_manager",    label: "مدير مشتريات" },
  { value: "electricity_manager", label: "مدير كهرباء" },
  { value: "viewer",              label: "مشاهد فقط" },
  { value: "hr_manager",              label: "مدير الموارد البشريه" },
];

const inputCls = (hasError) =>
  `w-full bg-zinc-950 border ${hasError ? "border-red-500/60" : "border-zinc-800"} focus:border-orange-500/70 focus:ring-1 focus:ring-orange-500/20 outline-none rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 transition-all`;

export default function CreateUser() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setServerError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post("/users/createUser", data);
      setSuccess(`تم إنشاء حساب "${data.name}" بنجاح`);
      reset();
    } catch (err) {
      setServerError(err.response?.data?.message || "حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white" dir="rtl">

      {/* Top Bar */}
      <div className="border-b border-zinc-800/60 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/home")}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm">
          <ArrowRight size={16} /> الرئيسية
        </button>
        <span className="text-zinc-700">/</span>
        <span className="text-white font-semibold text-sm">إنشاء مستخدم جديد</span>
      </div>

      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-4">
            <UserPlus size={22} className="text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">إنشاء مستخدم جديد</h1>
          <p className="text-zinc-500 text-sm mt-1">متاح فقط للمديرين والمطورين</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">الاسم الكامل</label>
              <input
                placeholder="مثال: أحمد محمد"
                className={inputCls(errors.name)}
                {...register("name", { required: "الاسم مطلوب" })}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Code */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">كود الموظف</label>
              <input
                placeholder="مثال: EMP-001"
                className={inputCls(errors.code)}
                {...register("code", { required: "الكود مطلوب" })}
              />
              {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>}
              <p className="text-zinc-600 text-xs mt-1">الكود لازم يكون فريد — هيُستخدم للدخول</p>
            </div>

            {/* Role */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">الدور الوظيفي</label>
              <div className="relative">
                <select
                  className={`${inputCls(errors.role)} appearance-none`}
                  {...register("role", { required: "الدور مطلوب" })}
                >
                  <option value="">اختر الدور...</option>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none text-xs">▾</span>
              </div>
              {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة مرور قوية"
                  className={`${inputCls(errors.password)} pl-10`}
                  {...register("password", {
                    required: "كلمة المرور مطلوبة",
                    minLength: { value: 6, message: "6 أحرف على الأقل" },
                  })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-orange-400 transition">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Feedback */}
            {serverError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm">
                <AlertCircle size={15} className="shrink-0" /> {serverError}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-emerald-400 text-sm">
                <CheckCircle2 size={15} className="shrink-0" /> {success}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => navigate("/home")}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition">
                إلغاء
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                إنشاء الحساب
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
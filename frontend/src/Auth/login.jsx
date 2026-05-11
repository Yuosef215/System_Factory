import { useState } from "react";
import { Eye, EyeOff, Factory, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await api.post("/users/login", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data));
      navigate("/home");
    } catch (err) {
      setServerError(err.response?.data?.message || "كود أو كلمة مرور غلط");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[500px] h-[500px] bg-orange-500/10 blur-3xl rounded-full top-[-200px] left-[-150px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-orange-500/5 blur-3xl rounded-full bottom-[-150px] right-[-100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm" dir="rtl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Factory size={30} className="text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Iron Factory</h1>
          <p className="text-zinc-500 text-sm mt-1">نظام إدارة المخزون</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-7 shadow-2xl shadow-black/50">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">تسجيل الدخول</h2>
            <p className="text-zinc-500 text-xs mt-1">أدخل الكود وكلمة المرور للدخول</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Code */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">كود الموظف</label>
              <input
                type="text"
                placeholder="أدخل الكود"
                className={`w-full bg-zinc-950 border ${errors.code ? "border-red-500/60" : "border-zinc-800"} focus:border-orange-500/70 focus:ring-1 focus:ring-orange-500/20 outline-none rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-zinc-600 transition-all`}
                {...register("code", { required: "الكود مطلوب" })}
              />
              {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  className={`w-full bg-zinc-950 border ${errors.password ? "border-red-500/60" : "border-zinc-800"} focus:border-orange-500/70 focus:ring-1 focus:ring-orange-500/20 outline-none rounded-xl px-4 py-2.5 pl-10 text-white text-sm placeholder:text-zinc-600 transition-all`}
                  {...register("password", { required: "كلمة المرور مطلوبة" })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-orange-400 transition">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm">
                <AlertCircle size={15} className="shrink-0" /> {serverError}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 mt-2">
              {loading ? <Loader2 size={17} className="animate-spin" /> : <ShieldCheck size={17} />}
              دخول
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function IronFactoryLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const  {register, handleSubmit} = useForm();
  const navigate = useNavigate();

  const onSubmit=async(data)=>{
    console.log(data)
    try {
      const response = await axios.post('http://localhost:5000/api/v1/users/login', data);
      
          console.log(response.data);

      localStorage.setItem('token', response.data.token);
      navigate('/home');
    } catch (error) {
      console.log(error);
      
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-orange-500/20 blur-3xl rounded-full top-[-150px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-red-500/20 blur-3xl rounded-full bottom-[-150px] right-[-100px]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-orange-500" size={38} />
            </div>

            <h1 className="text-3xl font-bold text-white">
              Iron Factory System
            </h1>

            <p className="text-zinc-400 mt-2">
              Secure Login For Factory Management
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Factory Code */}
            <div>
              <label className="text-sm text-zinc-300 mb-2 block">
                Factory Code
              </label>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter factory code"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500"
                  {...register("code")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-zinc-300 mb-2 block">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-zinc-500"
                  {...register("password")}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-orange-500 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 transition-all duration-300 py-3 rounded-xl font-semibold text-white shadow-lg shadow-orange-500/20">
              Login To System
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import React from "react";

export default function Login({ setIsAuth }) {

  const navigate = useNavigate();
  const [lockTimer, setLockTimer] = useState(null);

  
  useEffect(() => {
    if (!lockTimer) return;
    
    const interval = setInterval(() => {
      setLockTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lockTimer]);
  
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  
  useEffect(() => {
  setLockTimer(null);
}, [form.email]);
  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", form);

      // 2FA required
      if (res.data.twoFactorRequired) {
        navigate("/verify-2fa", {
          state: { email: form.email }
        });
        return;
      }

      // Normal login
      setIsAuth(true);
      navigate("/dashboard");

    } catch (err) {
        const data = err.response?.data;

        if (err.response?.data?.isDeactivated) {
          navigate("/restore-account", {
            state: { email: form.email }
          });
        } else {
          alert(err.response?.data?.message || "Login failed");
        }
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">

      <form
        onSubmit={handleLogin}
        className="bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl w-full max-w-md space-y-6"
      >

        <h2 className="text-lg font-semibold text-center">
          Login to VERDEX
        </h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
        />

        {lockTimer && (
          <div className="text-red-400 text-sm text-center">
            Account locked. Try again in {lockTimer}s
          </div>
        )}

        <button
          disabled={lockTimer}
          type="submit"
          className="w-full py-3 rounded-xl bg-zinc-200 text-zinc-900 hover:scale-[1.02] transition"
        >
          Login
        </button>
        

        <div className="text-center text-sm text-zinc-500">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-white after:transition-all"
          >
            Create one
          </span>
        </div>


        <div className="relative group mt-6">

          {/* Depth background plate */}
          <div className="
              absolute inset-0
              rounded-2xl
              bg-gradient-to-b from-zinc-800/40 to-zinc-900/60
              backdrop-blur-xl
              border border-zinc-700/50
              shadow-[0_10px_40px_rgba(0,0,0,0.6)]
              transition-all duration-500
              group-hover:scale-[1.02]
              group-hover:shadow-[0_15px_60px_rgba(0,0,0,0.8)]
          " />

          {/* Interactive layer */}
          <a
            href="/api/auth/google"
            className="
              relative z-10
              flex items-center justify-center gap-4
              py-4 rounded-2xl
              text-zinc-200 font-medium tracking-wide
              transition-all duration-300
              group-hover:text-white
            "
          >
            <img
              src="/google-icon.svg"
              alt="Google"
              className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6"
            />
            <span>Authenticate via Google</span>
          </a>

        </div>
      </form>

    

    </div>
  );
}
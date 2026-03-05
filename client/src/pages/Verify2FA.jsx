import { useState, useRef, useEffect } from "react";
import React from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function Verify2FA({setIsAuth}) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [timer, setTimer] = useState(60);

  const email = location.state?.email;

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleSubmit = async () => {
    const otp = digits.join("");
    if (otp.length !== 6) return;

    setLoading(true);

    try {
      await api.post("/auth/verify-2fa", { otp });
      setIsAuth(true);
      navigate("/dashboard");
    } catch {
      alert("Invalid or expired code");
    }

    setLoading(false);
  };

  useEffect(() => {
    document.body.classList.add("auth-mode");
    return () => {
      document.body.classList.remove("auth-mode");
    };
  }, []);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-otp");
      setTimer(60);
    } catch {
      alert("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative z-10">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          bg-zinc-900/70 backdrop-blur-2xl
          border border-zinc-800
          rounded-3xl
          p-10
          w-full max-w-md
          shadow-[0_0_80px_rgba(255,255,255,0.05)]
        "
      >

        <div className="text-center mb-8 space-y-2">
          <div className="text-lg font-semibold">
            Identity Verification Required
          </div>
          <div className="text-sm text-zinc-400">
            Enter the 6-digit code sent to your email
          </div>
        </div>

        <div className="flex justify-between gap-3 mb-8">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              maxLength="1"
              className={`
                w-14 h-16 text-center text-xl font-semibold
                bg-zinc-900/70 border border-zinc-700
                rounded-2xl
                focus:border-white
                focus:shadow-[0_0_30px_rgba(255,255,255,0.12)]
                transition-all duration-300
                hover:border-zinc-500
                ${digit ? "otp-active" : ""}
              `}
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="
            w-full py-3 rounded-xl
            bg-zinc-200 text-zinc-900
            hover:scale-[1.02] transition
          "
        >
          {loading ? "Verifying..." : "Unlock Access"}
        </button>

        <div className="text-xs text-zinc-500 text-center mt-4">
          {timer > 0 ? (
            <>Resend available in {timer}s</>
          ) : (
            <button
              onClick={handleResend}
              className="text-zinc-300 hover:text-white transition"
            >
              Resend Code
            </button>
          )}
        </div>

      </motion.div>

    </div>
  );
}
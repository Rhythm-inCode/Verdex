import { motion } from "framer-motion";
import React from "react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">

      <motion.div
        initial={{ opacity: 0, rotateX: 8, y: 60 }}
        animate={{ opacity: 1, rotateX: 0, y: 0 }}
        transition={{ duration: 0.8 }}
        className="
          relative
          w-full max-w-md
          bg-zinc-900/40
          backdrop-blur-2xl
          border border-zinc-800
          rounded-2xl p-10
          shadow-[0_0_80px_rgba(255,255,255,0.08)]
        "
        style={{
          transformPerspective: 1000
        }}
      >
        {/* Radial glow adapting to rings */}
        <div className="
          absolute -inset-1 rounded-2xl
          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]
          pointer-events-none
        " />

        {children}
      </motion.div>

    </div>
  );
}
import React from "react";

export default function GlassCard({ children }) {
  return (
    <div className="
        bg-bgElevated 
        border border-gray-800 
        rounded-2xl 
        p-8
        shadow-[0_20px_80px_rgba(0,0,0,0.6)]
        transition-all duration-300
        hover:-translate-y-2
        hover:shadow-[0_30px_100px_rgba(79,124,255,0.2)]
    ">

      {children}
    </div>
  );
}

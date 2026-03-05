import { motion } from "framer-motion";
import React from "react";

export default function EngineCore({ localConfig, setLocalConfig, total }) {

  const updateWeight = (key, value) => {
    setLocalConfig(prev => ({
      ...prev,
      [key]: Number(value)
    }));
  };

  const percent = (val) => Math.round(val * 100);

  const stable = Math.abs(total - 1) < 0.001;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        relative
        bg-zinc-900/70 backdrop-blur-xl
        border border-zinc-800
        rounded-2xl p-8
        space-y-8
        overflow-hidden shadow-[0_0_60px_rgba(255,255,255,0.04)]
            "
    >

        {/* Top energy strip */}
        <div className="
        absolute top-0 left-0 w-full h-[2px]
        bg-gradient-to-r from-transparent via-zinc-500/40 to-transparent
        animate-pulse
        " />

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            Product Intelligence Core
          </h2>
          <p className="text-sm text-zinc-400">
            Calibrate fundamental product evaluation weights
          </p>
        </div>

        <div className={`text-sm font-medium ${
          stable ? "text-emerald-400" : "text-amber-400"
        }`}>
            <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
                stable ? "bg-emerald-400" : "bg-amber-400"
            } animate-pulse`} />
            <div className={`text-sm font-medium ${
                stable ? "text-emerald-400" : "text-amber-400"
            }`}>
                Calibration: {Math.round(total * 100)}%
            </div>
            </div>
        </div>
        </div>

        {/* Central Energy Core */}
        <div className="flex justify-center my-12">

        <div className="relative w-40 h-40">

            {/* Outer Arc */}
            <div
            className="absolute inset-0 rounded-full"
            style={{
                background: `conic-gradient(
                rgba(255,255,255,0.2) 0deg,
                rgba(255,255,255,0.2) ${localConfig.demandWeight * 360}deg,
                transparent ${localConfig.demandWeight * 360}deg
                )`,
                borderRadius: "50%",
                transition: "all 0.4s ease"
            }}
            />

            {/* Middle Arc */}
            <div
            className="absolute inset-6 rounded-full"
            style={{
                background: `conic-gradient(
                rgba(200,200,200,0.2) 0deg,
                rgba(200,200,200,0.2) ${localConfig.competitionWeight * 360}deg,
                transparent ${localConfig.competitionWeight * 360}deg
                )`,
                borderRadius: "50%",
                transition: "all 0.4s ease"
            }}
            />

            {/* Inner Arc */}
            <div
            className="absolute inset-12 rounded-full"
            style={{
                background: `conic-gradient(
                rgba(160,160,160,0.25) 0deg,
                rgba(160,160,160,0.25) ${localConfig.marginWeight * 360}deg,
                transparent ${localConfig.marginWeight * 360}deg
                )`,
                borderRadius: "50%",
                transition: "all 0.4s ease"
            }}
            />

            {/* Core Center */}
            <div className="
            absolute inset-16 rounded-full
            bg-zinc-900 border border-zinc-700
            " />

        </div>

        </div>

      {/* WEIGHT MODULES */}
      <div className="
        grid grid-cols-1 sm:grid-cols-3 gap-12
        bg-zinc-950/50
        border border-zinc-800
        rounded-2xl p-10
        shadow-[0_0_80px_rgba(255,255,255,0.03)]
        ">

        <WeightBar
          label="Demand Engine"
          value={localConfig.demandWeight}
          onChange={(v) => updateWeight("demandWeight", v)}
          percent={percent}
        />

        <WeightBar
          label="Competition Engine"
          value={localConfig.competitionWeight}
          onChange={(v) => updateWeight("competitionWeight", v)}
          percent={percent}
        />

        <WeightBar
          label="Margin Engine"
          value={localConfig.marginWeight}
          onChange={(v) => updateWeight("marginWeight", v)}
          percent={percent}
        />

      </div>

    </motion.div>
  );
}

function WeightBar({ label, value, onChange, percent }) {
  return (
    <div className="space-y-4 group transition-all duration-300">

      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-200 font-semibold">
          {percent(value)}%
        </span>
    </div>

    <div className="flex flex-col items-center gap-6">

    {/* Vertical Reactor Rod */}
    <div className="relative w-10 h-40 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">

        <div
        className="
            absolute bottom-0 w-full
            bg-gradient-to-t from-zinc-500 via-zinc-400 to-zinc-500
            transition-all duration-300
            group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]
        "
        style={{ height: `${percent(value)}%` }}
        />

    </div>

    {/* Percentage Display */}
    <div className="text-lg font-semibold text-zinc-200">
        {percent(value)}%
    </div>

    {/* Slider */}
    <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-32 accent-zinc-400 cursor-pointer"
    />

    </div>

    </div>
  );
}
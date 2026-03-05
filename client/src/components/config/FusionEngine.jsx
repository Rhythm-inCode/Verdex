import { motion } from "framer-motion";
import React from "react";

export default function FusionEngine({ localConfig, setLocalConfig, total }) {

  const updateWeight = (key, value) => {
    setLocalConfig(prev => ({
      ...prev,
      [key]: Number(value)
    }));
  };

  const percent = (val) => Math.round(val * 100);
  const stable = Math.abs(total - 1) < 0.001;

  const balanceShift =
    (localConfig.productWeight - localConfig.executionWeight) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        relative
        bg-zinc-900/70 backdrop-blur-xl
        border border-zinc-800
        rounded-2xl p-8
        space-y-10
        shadow-[0_0_70px_rgba(255,255,255,0.05)]
        overflow-hidden
      "
    >

      {/* Energy Strip */}
      <div className="
        absolute top-0 left-0 w-full h-[2px]
        bg-gradient-to-r from-transparent via-zinc-400/40 to-transparent
        animate-pulse
      " />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            Decision Fusion Engine
          </h2>
          <p className="text-sm text-zinc-400">
            Control final score bias between product & execution
          </p>
        </div>

        <div className={`flex items-center gap-3 ${
          stable ? "text-emerald-400" : "text-amber-400"
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            stable ? "bg-emerald-400" : "bg-amber-400"
          } animate-pulse`} />
          <span className="text-sm font-medium">
            Fusion: {Math.round(total * 100)}%
          </span>
        </div>
      </div>

      {/* Balance Meter */}
      <div className="relative h-4 bg-zinc-800 rounded-full overflow-hidden">

        <div
          className="
            absolute h-full bg-gradient-to-r
            from-zinc-500 via-zinc-400 to-zinc-500
            transition-all duration-500
          "
          style={{
            width: `${percent(localConfig.productWeight)}%`
          }}
        />

        {/* Center Marker */}
        <div className="
          absolute top-0 bottom-0 left-1/2 w-px
          bg-zinc-600
        " />

      </div>

      {/* Labels */}
      <div className="flex justify-between text-sm text-zinc-400">
        <span>Product Dominance</span>
        <span>Execution Dominance</span>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

        <FusionSlider
          label="Product Weight"
          value={localConfig.productWeight}
          onChange={(v) => updateWeight("productWeight", v)}
          percent={percent}
        />

        <FusionSlider
          label="Execution Weight"
          value={localConfig.executionWeight}
          onChange={(v) => updateWeight("executionWeight", v)}
          percent={percent}
        />

      </div>

      {/* Bias Indicator */}
      <div className="text-sm text-zinc-400 text-center">
        System Bias:{" "}
        <span className="text-zinc-200 font-medium">
          {balanceShift > 10
            ? "Product Driven"
            : balanceShift < -10
            ? "Execution Heavy"
            : "Balanced"}
        </span>
      </div>

    </motion.div>
  );
}

function FusionSlider({ label, value, onChange, percent }) {
  return (
    <div className="space-y-4 group">

      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-200 font-semibold">
          {percent(value)}%
        </span>
      </div>

      <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="
            absolute h-full
            bg-gradient-to-r from-zinc-500 via-zinc-400 to-zinc-500
            transition-all duration-300
            group-hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]
          "
          style={{ width: `${percent(value)}%` }}
        />
      </div>

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full accent-zinc-400
          cursor-pointer
          transition
        "
      />

    </div>
  );
}
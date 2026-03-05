import { motion } from "framer-motion";
import React from "react";

export default function ThresholdMatrix({ localConfig, setLocalConfig }) {

  const update = (key, value) => {
    setLocalConfig(prev => ({
      ...prev,
      [key]: Number(value)
    }));
  };

  const { goThreshold, noGoThreshold } = localConfig;

  const testZone = goThreshold - noGoThreshold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        relative
        bg-zinc-900/70 backdrop-blur-xl
        border border-zinc-800
        rounded-2xl p-8
        space-y-8
        shadow-[0_0_70px_rgba(255,255,255,0.05)]
        overflow-hidden
      "
    >

      {/* Top Energy Line */}
      <div className="
        absolute top-0 left-0 w-full h-[2px]
        bg-gradient-to-r from-transparent via-zinc-400/40 to-transparent
        animate-pulse
      " />

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">
          Decision Boundary Matrix
        </h2>
        <p className="text-sm text-zinc-400">
          Define operational verdict thresholds
        </p>
      </div>

      {/* Visual Threshold Bar */}
      <div className="space-y-4">

        <div className="relative h-6 bg-zinc-800 rounded-full overflow-hidden">

          {/* NO_GO Zone */}
          <div
            className="absolute h-full bg-zinc-700 transition-all duration-300"
            style={{ width: `${noGoThreshold}%` }}
          />

          {/* TEST Zone */}
          <div
            className="absolute h-full bg-zinc-600 transition-all duration-300"
            style={{
              left: `${noGoThreshold}%`,
              width: `${testZone}%`
            }}
          />

          {/* GO Zone */}
          <div
            className="absolute h-full bg-zinc-500 transition-all duration-300"
            style={{
              left: `${goThreshold}%`,
              width: `${100 - goThreshold}%`
            }}
          />

        </div>

        <div className="flex justify-between text-xs text-zinc-400">
          <span>NO_GO</span>
          <span>TEST</span>
          <span>GO</span>
        </div>

      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

<ThresholdSlider
  label="NO_GO Threshold"
  value={noGoThreshold}
  min={0}
  max={100}
  onChange={(v) => {
    const value = Number(v);

    if (value >= goThreshold) {
      update("noGoThreshold", goThreshold - 1);
    } else {
      update("noGoThreshold", value);
    }
  }}
/>

<ThresholdSlider
  label="GO Threshold"
  value={goThreshold}
  min={0}
  max={100}
  onChange={(v) => {
    const value = Number(v);

    if (value <= noGoThreshold) {
      update("goThreshold", noGoThreshold + 1);
    } else {
      update("goThreshold", value);
    }
  }}
/>

      </div>

    </motion.div>
  );
}

function ThresholdSlider({ label, value, min, max, onChange }) {
  return (
    <div className="space-y-4 group">

      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-200 font-semibold">
          {value}
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
          style={{
            width: `${((value - min) / (max - min)) * 100}%`
          }}
        />
      </div>

      <input
        type="range"
        min={min}
        max={max}
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
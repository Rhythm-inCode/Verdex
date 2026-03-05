import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import React from "react";

export default function SimulationPanel({ config }) {

  const [mouseX, setMouseX] = useState(0);

  useEffect(() => {
    const handleMove = (e) => {
      const percent = e.clientX / window.innerWidth;
      setMouseX((percent - 0.5) * 20);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const productScore = 65;
  const executionScore = 55;

  const finalScore = useMemo(() => {
    return Math.round(
      productScore * config.productWeight +
      executionScore * config.executionWeight
    );
  }, [config]);

  const bias = config.productWeight - config.executionWeight;

  return (
    <div className="relative bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">

      {/* Moving Light Sweep */}
      <motion.div
        animate={{ x: bias * 80 }}
        transition={{ type: "spring", stiffness: 40 }}
        className="
          absolute inset-y-0 w-40
          bg-gradient-to-r from-transparent via-zinc-400/10 to-transparent
          blur-2xl
          pointer-events-none
        "
      />

      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-xl font-semibold">
          Intelligence Core
        </h2>
        <p className="text-sm text-zinc-400">
          Live System Bias & Output
        </p>
      </div>

      {/* Core Area */}
<div className="relative p-6 space-y-8">

  {/* Subtle animated grid background */}
  <div className="absolute inset-0 opacity-10 pointer-events-none">
    <div className="w-full h-full bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:40px_40px]" />
  </div>

  {/* Engine Metrics Grid */}
  <div className="grid grid-cols-2 gap-6 relative">

    <MetricCard label="Demand Weight" value={`${Math.round(config.demandWeight * 100)}%`} />
    <MetricCard label="Competition Weight" value={`${Math.round(config.competitionWeight * 100)}%`} />
    <MetricCard label="Margin Weight" value={`${Math.round(config.marginWeight * 100)}%`} />
    <MetricCard label="Product Bias" value={`${Math.round(config.productWeight * 100)}%`} />

  </div>

  {/* Dynamic Output Block */}
  <div className="relative bg-zinc-800/60 border border-zinc-700 rounded-xl p-6 space-y-4">

    <div className="flex justify-between text-sm text-zinc-400">
      <span>Product Score</span>
      <span>65</span>
    </div>

    <div className="flex justify-between text-sm text-zinc-400">
      <span>Execution Score</span>
      <span>55</span>
    </div>

    <div className="flex justify-between text-lg font-semibold text-zinc-200 pt-2 border-t border-zinc-700">
      <span>Final Output</span>
      <span>
        {Math.round(
          65 * config.productWeight +
          55 * config.executionWeight
        )}
      </span>
    </div>

  </div>

  {/* Activity Pulse Bars */}
  <div className="space-y-3">

    <PulseBar width={config.demandWeight * 100} />
    <PulseBar width={config.competitionWeight * 100} />
    <PulseBar width={config.marginWeight * 100} />

  </div>

</div>

    </div>
  );
}



  function MetricCard({ label, value }) {
  return (
    <div className="
      bg-zinc-800/60
      border border-zinc-700
      rounded-xl
      p-4
      backdrop-blur-md
    ">
      <div className="text-xs text-zinc-400 mb-1">
        {label}
      </div>
      <div className="text-xl font-semibold text-zinc-200">
        {value}
      </div>
    </div>
  );
}

function PulseBar({ width }) {
  return (
    <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className="absolute h-full bg-gradient-to-r from-zinc-500 to-zinc-400 animate-pulse"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

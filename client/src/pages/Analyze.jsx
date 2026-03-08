import { useState, useEffect } from "react";
import React from "react";
import api from "../api/axios";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { calculateValidation } from "../utils/decisionEngine";
import PageContainer from "../components/ui/PageContainer";


export default function Analyze() {

  const [config, setConfig] = useState(null);
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
  const newErrors = {};

  const cost = Number(form.costPrice);
  const price = Number(form.sellingPrice);
  const ads = Number(adCost);

  if (!cost || cost <= 0) {
    newErrors.costPrice = "Cost price must be greater than 0.";
  }

  if (!price || price <= cost) {
    newErrors.sellingPrice =
      "Selling price must be greater than cost price.";
  }

  if (ads > price) {
    newErrors.adCost =
      "Ad cost cannot exceed selling price.";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [baseScores, setBaseScores] = useState(null);

  const [livePrice, setLivePrice] = useState(0);
  const [adCost, setAdCost] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
    targetMarket: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);

    try {
      const res = await api.post("/validate", {
        ...form,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        adCost: Number(adCost || 0)
      });


      const validation = res.data.validation;

      setResult(validation);


      setBaseScores({
        demandScore: validation.demandScore,
        competitionScore: validation.competitionScore
      });

      setLivePrice(Number(form.sellingPrice));
      setAdCost("");

    } catch (err) {
      console.error(err);
      alert("Validation failed");
    }

    setLoading(false);
  };

  const liveMetrics = (() => {
    if (!result || !baseScores || !config) return null;

    const cost = Number(form.costPrice);
    const price = Number(livePrice);

    if (!cost || !price) return null;

    const calculated = calculateValidation({
      demandScore: baseScores.demandScore,
      competitionScore: baseScores.competitionScore,
      costPrice: cost,
      sellingPrice: price,
      adCost: Number(adCost || 0),
      config
    });

    const breakEvenROAS = price / (cost + Number(adCost || 0));
    const ads = Number(adCost || 0);


    return {
      ...calculated,
      breakEvenROAS: breakEvenROAS.toFixed(2)
    };
  })();

  const score = result?.validationScore || 0;


  let scoreLevel = "low";
  if (score >= 70) scoreLevel = "high";
  else if (score >= 40) scoreLevel = "medium";

  useEffect(() => {
    validateInputs();
  }, [form.costPrice, form.sellingPrice, adCost]);

  useEffect(() => {
    api.get("/config/active")
      .then(res => setConfig(res.data))
      .catch(err => console.error("Config fetch failed", err));
  }, []);

  return (
    <PageContainer>
    
      <div className="space-y-10">

        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            New Product Analysis
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 p-6 rounded-2xl"
        >

          <Input label="Product Name" name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
          <Input label="Category" name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
          <div className="space-y-1">
            <input
              name="costPrice"
              placeholder="Cost Price"
              type="number"
              value={form.costPrice}
              onChange={(e) =>
                setForm({ ...form, costPrice: e.target.value })
              }
              className={`
                w-full px-4 py-3 bg-zinc-800 rounded-xl outline-none transition
                ${
                  errors.costPrice
                    ? "border border-red-500"
                    : "border border-zinc-700 focus:border-zinc-400"
                }
              `}
            />
            {errors.costPrice && (
              <div className="text-xs text-red-400">
                {errors.costPrice}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <input
              name="sellingPrice"
              placeholder="Selling Price"
              type="number"
              value={form.sellingPrice}
              onChange={(e) =>
                setForm({ ...form, sellingPrice: e.target.value })
              }
              className={`
                w-full px-4 py-3 bg-zinc-800 rounded-xl outline-none transition
                ${
                  errors.sellingPrice
                    ? "border border-red-500"
                    : "border border-zinc-700 focus:border-zinc-400"
                }
              `}
            />
            {errors.sellingPrice && (
              <div className="text-xs text-red-400">
                {errors.sellingPrice}
              </div>
            )}
          </div>
          <Input label="Target Market" name="targetMarket" placeholder="Target Market" value={form.targetMarket} onChange={handleChange} required />

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0}
              className="w-full bg-blue-600 hover:bg-blue-500 transition py-3 rounded-xl font-medium"
            >
              {loading ? "Analyzing..." : "Run Intelligence"}
            </button>
          </div>
        </form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6
              backdrop-blur-xl
              border rounded-2xl p-6
              transition-all duration-500
              ${
                scoreLevel === "high"
                  ? "bg-emerald-900/10 border-emerald-500/25 shadow-[0_0_18px_rgba(16,185,129,0.08)]"
                  : scoreLevel === "medium"
                  ? "bg-yellow-900/10 border-yellow-500/20 shadow-[0_0_18px_rgba(234,179,8,0.06)]"
                  : "bg-red-900/10 border-red-500/20 shadow-[0_0_18px_rgba(239,68,68,0.06)]"
              }

            `}

          >

          <ResultCard label="Demand Score" value={result.demandScore} />

          <RiskDial value={result.competitionScore} />

          <ResultCard label="Net Margin %" value={result.netMarginPercent} />

          <ResultCard label="Break-even ROAS" value={result.breakEvenROAS} />

          <ResultCard label="Final Score" value={result.validationScore} />

            <div className="sm:col-span-2 xl:col-span-4 mt-4">
              <VerdictBadge verdict={result.recommendation} />
            </div>


            <div className="sm:col-span-2 xl:col-span-4 mt-6 bg-zinc-800/50 p-6 rounded-2xl space-y-6">

              <h3 className="text-lg font-semibold">What-If Simulation</h3>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">
                  Selling Price: ₹{livePrice}
                </label>
                <input
                  type="range"
                  min={Number(form.costPrice) + 1}
                  max={Number(form.sellingPrice) * 7}
                  step="1"
                  value={livePrice}
                  onChange={(e) => setLivePrice(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">
                  Ad Cost per Sale
                </label>

                <input
                  type="number"
                  value={adCost}
                  onChange={(e) => setAdCost(e.target.value)}
                  className={`
                    bg-zinc-800
                    border rounded-xl
                    px-4 py-3 w-full outline-none transition
                    ${
                      errors.adCost
                        ? "border-red-500"
                        : "border-zinc-700 focus:border-zinc-400"
                    }
                  `}
                />

                {errors.adCost && (
                  <div className="text-xs text-red-400">
                    {errors.adCost}
                  </div>
                )}
              </div>

              {liveMetrics && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
                  <ResultCard label="Live Margin %" value={liveMetrics.marginPercent} />
                  <ResultCard label="Live Score" value={liveMetrics.finalScore} />
                  <ResultCard label="Live Break-even ROAS" value={liveMetrics.breakEvenROAS} />
                </div>
              )}
              <VerdictBadge verdict={liveMetrics?.recommendation || result.recommendation} />

              {/* Score Breakdown */}
              <div className="mt-10 bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-6">

                <h3 className="text-lg font-semibold">
                  Score Breakdown
                </h3>

                <BreakdownBar
                  label="Demand Strength"
                  value={result.demandScore}
                />

                <BreakdownBar
                  label="Competition Risk"
                  value={result.competitionScore}
                />

                <BreakdownBar
                  label="Margin Quality"
                  value={result.netMarginPercent}
                />

                <div className="pt-4 border-t border-zinc-800 text-sm text-zinc-400">
                  Final Weighted Score: 
                  <span className="ml-2 text-zinc-100 font-medium">
                    {result.validationScore}
                  </span>
                </div>

              </div>


            </div>

          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}

function Input({ error, ...props }) {
  return (
    <div className="space-y-1">
      <input
        {...props}
        className={`
          w-full px-4 py-3
          bg-zinc-800
          border rounded-xl outline-none transition
          ${
            error
              ? "border-red-500"
              : "border-zinc-700 focus:border-zinc-400"
          }
        `}
      />
      {error && (
        <div className="text-xs text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

function ResultCard({ label, value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, Number(value),  {
      duration: 0.4,
      ease: "easeOut"
    });
    return controls.stop;
  }, [value]);

  return (
    <div className="relative bg-zinc-800/70 p-5 rounded-xl border border-zinc-700">
      <p className="text-sm text-zinc-400">{label}</p>
      <motion.p className="text-2xl font-semibold mt-2 text-zinc-100">
        {rounded}
      </motion.p>
    </div>
  );
}

function VerdictBadge({ verdict }) {
  const color =
    verdict === "GO"
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
      : verdict === "NO_GO"
      ? "bg-red-500/20 text-red-400 border-red-500/40"
      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 150 }}
      className={`text-center py-4 rounded-xl border font-semibold text-lg transition-all duration-500 ${color}`}
    >
      Final Verdict: {verdict}
    </motion.div>

  );
}

function RiskDial({ value }) {
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference - (value / 100) * circumference;

  const color =
    value < 40
      ? "#10b981"
      : value < 70
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="bg-zinc-800/70 backdrop-blur-xl border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center">

      <p className="text-sm text-zinc-400 mb-4">
        Risk Level
      </p>

    <div className="relative w-[140px] h-[140px] sm:w-[150px] sm:h-[150px] flex items-center justify-center">

        <svg
          height={radius * 2}
          width={radius * 2}
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        >
          <circle
            stroke="#27272a"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{
              transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease"
            }}
          />
        </svg>

        <div className="absolute text-2xl font-semibold text-zinc-100">
          {value}
        </div>

      </div>

    </div>
  );
}

function BreakdownBar({ label, value, invert = false }) {

  const percentage = Math.min(Number(value), 100);

  const explanation = getExplanation(label, value);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-100">{value}</span>
      </div>

      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${invert ? 100 - percentage : percentage}%` }}
          transition={{ duration: 0.8 }}
          className="h-full bg-zinc-500"
        />
      </div>

      <p className="text-xs text-zinc-500 leading-relaxed">
        {explanation}
      </p>
    </div>
  );
}

function getExplanation(label, value) {
  const v = Number(value);

  if (label.includes("Demand")) {
    if (v > 70) return "Strong market interest detected. Demand momentum supports scaling.";
    if (v > 40) return "Moderate demand. Requires targeted positioning.";
    return "Weak demand. High acquisition effort likely required.";
  }

  if (label.includes("Competition")) {
    if (v > 70) return "High competition pressure. Differentiation required.";
    if (v > 40) return "Manageable competitive landscape.";
    return "Low competitive resistance. Entry barrier favorable.";
  }

  if (label.includes("Margin")) {
    if (v > 50) return "Healthy margin buffer supports paid acquisition.";
    if (v > 25) return "Moderate margin. ROAS must be optimized.";
    return "Thin margin. High operational risk.";
  }

  return "";
}


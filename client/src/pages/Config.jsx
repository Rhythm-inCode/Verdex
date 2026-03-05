import { useEffect, useState, useMemo } from "react";
import React from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import EngineCore from "../components/config/EngineCore";
import FusionEngine from "../components/config/FusionEngine";
import ThresholdMatrix from "../components/config/ThresholdMatrix";
import SimulationPanel from "../components/config/SimulationPanel";
import PageContainer from "../components/ui/PageContainer";

export default function Config() {
  const [config, setConfig] = useState(null);
  const [localConfig, setLocalConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/config/active")
      .then(res => {
        setConfig(res.data);
        setLocalConfig(res.data);
      });
  }, []);

  const productTotal = useMemo(() => {
    if (!localConfig) return 0;
    return (
      localConfig.demandWeight +
      localConfig.competitionWeight +
      localConfig.marginWeight
    );
  }, [localConfig]);

  const fusionTotal = useMemo(() => {
    if (!localConfig) return 0;
    return (
      localConfig.productWeight +
      localConfig.executionWeight
    );
  }, [localConfig]);

  const handleSave = async () => {
    setLoading(true);
    await api.put("/config", localConfig);
    setLoading(false);
  };

  useEffect(() => {
  if (!localConfig) return;

  const productPower =
    localConfig.demandWeight +
    localConfig.marginWeight;

  window.bgIntensity = 1 + productPower * 0.5;

}, [localConfig]);

  if (!localConfig) return null;

  return (

    <div className="px-6 lg:px-16 py-12 space-y-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">

        {/* Header */}
        <div className="max-w-3xl left-4">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Configuration Panel
          </h1>
          <p className="text-zinc-400 text-sm mt-3">
            Tune your system as per your need
          </p>
        </div>

      {/* SYSTEM STATUS BAR */}
      <SystemStatus
        productTotal={productTotal}
        fusionTotal={fusionTotal}
        config={localConfig}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">

        <div className="xl:col-span-2 space-y-12">
          <EngineCore
            localConfig={localConfig}
            setLocalConfig={setLocalConfig}
            total={productTotal}
          />

          <FusionEngine
            localConfig={localConfig}
            setLocalConfig={setLocalConfig}
            total={fusionTotal}
          />

          <ThresholdMatrix
            localConfig={localConfig}
            setLocalConfig={setLocalConfig}
          />
        </div>

        <SimulationPanel config={localConfig} />
      </div>

      <div className="flex justify-end">
        <button
          disabled={
            Math.abs(productTotal - 1) > 0.001 ||
            Math.abs(fusionTotal - 1) > 0.001
          }
          onClick={handleSave}
          className="
            px-8 py-3 rounded-xl
            bg-zinc-200 text-zinc-900
            font-medium
            disabled:opacity-40
            transition
          "
        >
          {loading ? "Calibrating..." : "Apply Calibration"}
        </button>
      </div>

    </div>
  );
}

function SystemStatus({ productTotal, fusionTotal, config }) {
  const stable =
    Math.abs(productTotal - 1) < 0.001 &&
    Math.abs(fusionTotal - 1) < 0.001;

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          bg-zinc-900/60 backdrop-blur-xl
          border border-zinc-800
          rounded-2xl p-6
          flex flex-col sm:flex-row justify-between gap-6
        "
      >
        <div>
          <div className="text-sm text-zinc-400">
            Active Engine
          </div>
          <div className="text-xl font-semibold">
            Calibration Layer
          </div>
        </div>

        <div className="text-sm">
          Engine Stability:
          <span
            className={`ml-2 font-medium ${
              stable ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {stable ? "Stable" : "Unbalanced"}
          </span>
        </div>

        <div className="text-sm text-zinc-400">
          GO ≥ {config.goThreshold} | NO_GO &lt; {config.noGoThreshold}
        </div>
      </motion.div>
    </PageContainer>
  );
}
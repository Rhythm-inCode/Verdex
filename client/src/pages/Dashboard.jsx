import { useEffect, useState } from "react";
import React from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import DashboardCharts from "../components/DashboardCharts";
import PageContainer from "../components/ui/PageContainer";

export default function Dashboard() {
const [validations, setValidations] = useState([]);

useEffect(() => {
  api.get("/validate/validations")
    .then(res => {
      console.log("VALIDATIONS:", res.data); // debug

      setValidations(
        Array.isArray(res.data.validations)
          ? res.data.validations
          : []
      );
    })
    .catch(err => console.error(err));
}, []);

const total = validations.length;

const avgScore =
  total === 0
    ? 0
    : Math.round(
        (validations || []).reduce(
          (sum, v) => sum + (v.validationScore || 0),
          0
        ) / total
      );

const goCount =
  (validations || []).filter(v => v.recommendation === "GO").length;

const goRatio =
  total === 0 ? 0 : Math.round((goCount / total) * 100);

const health =
  avgScore > 70 ? "Strong" : avgScore > 40 ? "Moderate" : "Weak";

  return (
    <PageContainer>

        {/* Header */}
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Intelligence Overview
          </h1>
          <p className="text-zinc-400 text-sm mt-3">
            Real-time decision metrics across your validated products.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          {[
            { label: "Total Validations", value: total },
            { label: "Avg Score", value: avgScore },
            { label: "GO Ratio", value: `${goRatio}%` },
            { label: "Portfolio Health", value: health }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="
                group
                relative
                bg-zinc-900/65
                backdrop-blur-xl
                border border-zinc-800
                rounded-2xl
                p-6
                transition-all duration-500
                hover:border-zinc-700
                hover:shadow-[0_0_50px_rgba(255,255,255,0.05)]
              "
            >
              <p className="text-zinc-400 text-sm">
                {item.label}
              </p>

              <p className="text-3xl font-semibold mt-3 text-zinc-100">
                {item.value}
              </p>
            </motion.div>
          ))}

        </div>

        {/* Charts */}
        <div className="pt-4">
          <DashboardCharts data={validations} />
        </div>
    </PageContainer>
  );
}

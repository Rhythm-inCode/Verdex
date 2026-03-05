import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import React from "react";

export default function ProductCharts({ product, history }) {

  const profitData = [
    { type: "Gross", value: product.grossProfit },
    { type: "Net", value: product.netProfit },
  ];

  const trendData = history.map(item => ({
  date: new Date(item.createdAt).toLocaleDateString(),
  score: item.validationScore,
    }));

return (
  <div className="space-y-10">

    {/* 🔹 Score Evolution */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        bg-zinc-900/60 backdrop-blur-xl
        border border-zinc-800
        rounded-2xl p-6
      "
    >
      <h3 className="text-lg font-semibold mb-6">
        Score Evolution
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <XAxis dataKey="date" stroke="#444" />
          <YAxis stroke="#444" />
          <Tooltip
            contentStyle={{
              background: "#111318",
              border: "1px solid #27272A",
              color: "#E5E7EB"
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#A1A1AA"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>

    {/* 🔹 Profit Comparison */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        bg-zinc-900/60 backdrop-blur-xl
        border border-zinc-800
        rounded-2xl p-6
      "
    >
      <h3 className="text-lg font-semibold mb-6">
        Profit Comparison
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={profitData}>
          <XAxis dataKey="type" stroke="#444" />
          <YAxis stroke="#444" />
          <Tooltip
            contentStyle={{
              background: "#111318",
              border: "1px solid #27272A",
              color: "#E5E7EB"
            }}
          />
          <Bar dataKey="value" fill="#A1A1AA" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>

  </div>
);
}
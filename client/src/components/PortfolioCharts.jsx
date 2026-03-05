import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import React from "react";

export default function PortfolioCharts({ data = [] }) {

  // 🔹 Score Buckets
  const buckets = [
    { range: "0-30", count: 0 },
    { range: "30-60", count: 0 },
    { range: "60-80", count: 0 },
    { range: "80+", count: 0 },
  ];

  data.forEach((item) => {
    const score = item.validationScore || 0;
    if (score < 30) buckets[0].count++;
    else if (score < 60) buckets[1].count++;
    else if (score < 80) buckets[2].count++;
    else buckets[3].count++;
  });

  // 🔹 Profit Buckets
  const profitBuckets = [
    { range: "0-30", profits: [] },
    { range: "30-60", profits: [] },
    { range: "60-80", profits: [] },
    { range: "80+", profits: [] },
  ];

  data.forEach((item) => {
    const score = item.validationScore || 0;
    if (score < 30) profitBuckets[0].profits.push(item.netProfit || 0);
    else if (score < 60) profitBuckets[1].profits.push(item.netProfit || 0);
    else if (score < 80) profitBuckets[2].profits.push(item.netProfit || 0);
    else profitBuckets[3].profits.push(item.netProfit || 0);
  });

  const profitBucketData = profitBuckets.map(bucket => ({
    range: bucket.range,
    avgProfit:
      bucket.profits.length === 0
        ? 0
        : bucket.profits.reduce((a, b) => a + b, 0) /
          bucket.profits.length,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

      {/* Score Distribution */}
      <ChartCard title="Score Distribution">
        <div className="h-[240px] sm:h-[280px] lg:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets}>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
              <XAxis
                dataKey="range"
                stroke="#666"
                tick={{ fontSize: 11 }}
              />
              <YAxis stroke="#444" />
              <Tooltip
                wrapperStyle={{ zIndex: 50 }}
                contentStyle={{
                  backgroundColor: "#111318",
                  border: "1px solid #27272A",
                  borderRadius: "10px",
                  color: "#E5E7EB",
                  fontSize: "12px"
                }}
              />
              <Bar
                dataKey="count"
                fill="#6B7280"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Profit by Score Range */}
      <ChartCard title="Average Profit by Score Range">
        <div className="h-[240px] sm:h-[280px] lg:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profitBucketData}>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
              <XAxis
                dataKey="range"
                stroke="#666"
                tick={{ fontSize: 11 }}
              />
              <YAxis stroke="#444" />
              <Tooltip
                wrapperStyle={{ zIndex: 50 }}
                contentStyle={{
                  backgroundColor: "#111318",
                  border: "1px solid #27272A",
                  borderRadius: "10px",
                  color: "#E5E7EB",
                  fontSize: "12px"
                }}
              />
              <Bar
                dataKey="avgProfit"
                fill="#A1A1AA"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        bg-zinc-900/55
        backdrop-blur-2xl
        border border-zinc-800/70
        rounded-2xl
        p-6 sm:p-8
        transition-all duration-500
        hover:shadow-[0_0_60px_rgba(255,255,255,0.05)]
      "
    >
      <h3 className="text-base sm:text-lg font-semibold mb-6">
        {title}
      </h3>

      {children}
    </motion.div>
  );
}
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import React from "react";



export default function DashboardCharts({ data }) {

    function CustomTooltip({ active, label }) {
        if (!active) return null;

        const pointData = trendData.find(
            (item) => item.id === label
        );

        if (!pointData) return null;

        return (
            <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-sm space-y-1">
            <div className="text-zinc-400 text-xs">{pointData.date}</div>
            <div className="text-zinc-100 font-medium">
                Score: {pointData.score}
            </div>
            <div className="text-zinc-400">
                Category: {pointData.category}
            </div>
            <div className="text-zinc-400">
                Verdict: {pointData.verdict}
            </div>
            </div>
        );
    }

  /* ------------------- SCORE TREND ------------------- */

    const trendData = [...data]
    .filter(v => v.createdAt && v.validationScore !== undefined)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((v, index) => ({
        id: index,  // unique key
        date: new Date(v.createdAt).toLocaleDateString(),
        score: v.validationScore,
        category: v.category || "Uncategorized",
        verdict: v.recommendation
    }));

    const [range, setRange] = useState(50);
    const MAX_POINTS = 50;

    const filteredTrendData =
    range === "ALL"
        ? trendData
        : trendData.slice(-range);



    console.log("Trend Data:", trendData);


  /* ------------------- CATEGORY PERFORMANCE ------------------- */

  const categoryMap = {};

  data.forEach((v) => {
    const category = v.category || "Uncategorized";

    if (!categoryMap[category]) {
      categoryMap[category] = [];
    }

    categoryMap[category].push(v.validationScore);
  });

  const categoryData = Object.keys(categoryMap).map((cat) => ({
    category: cat,
    avg:
      categoryMap[cat].reduce((a, b) => a + b, 0) /
      categoryMap[cat].length,
  }));


  /* ------------------- PIE DATA ------------------- */

    const verdictMap = {};

    data.forEach((v) => {
    const verdict = v.recommendation || "UNKNOWN";

    if (!verdictMap[verdict]) {
        verdictMap[verdict] = 0;
    }

    verdictMap[verdict]++;
    });

    const pieData = Object.keys(verdictMap).map((key) => ({
    name: key,
    value: verdictMap[key]
    }));



  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-12">

      {/* Score Trend */}
        <ChartCard title="Score Trend">
        <div className="overflow-x-auto no-scrollbar group-hover:shadow-inner transition-all duration-500">

            <div className="relative z-50 pointer-events-auto flex gap-4 mb-4 text-sm text-zinc-400">
            <button onClick={() => setRange(30)}>30</button>
            <button onClick={() => setRange(100)}>100</button>
            <button onClick={() => setRange("ALL")}>All</button>
            </div>



            <LineChart
            width={Math.max(filteredTrendData.length * 120, 800)}
            height={300}
            data={filteredTrendData}
            >
            <XAxis dataKey="id" stroke="#52525B" />
            <YAxis stroke="#52525B" />
            <Tooltip content={<CustomTooltip />} />
            <Line
                type="monotone"
                dataKey="score"
                stroke="#9CA3AF"
                strokeWidth={2}
                dot
                isAnimationActive={false}
            />
            </LineChart>
        </div>
        </ChartCard>



      {/* Category Performance */}
      <ChartCard title="Category Performance">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={categoryData}>
            <XAxis dataKey="category" stroke="#52525B" />
            <YAxis stroke="#52525B" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#A1A1AA"
              strokeWidth={2}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>


      {/* Pie Chart */}
        <ChartCard title="Decision Distribution" className="xl:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                data={pieData}
                dataKey="value"
                innerRadius={70}
                outerRadius={100}
                >
                {pieData.map((entry, index) => (
                    <Cell
                    key={`cell-${index}`}
                    fill={
                        index === 0
                        ? "#A1A1AA"
                        : index === 1
                        ? "#52525B"
                        : "#3F3F46"
                    }
                    />
                ))}
                </Pie>
                <Tooltip />
            </PieChart>
            </ResponsiveContainer>

            <div className="space-y-4">
            {pieData.map((item) => (
                <div
                key={item.name}
                className="flex justify-between border-b border-zinc-800 pb-2"
                >
                <span className="text-zinc-400">{item.name}</span>
                <span className="text-zinc-100 font-medium">
                    {item.value}
                </span>
                </div>
            ))}

            <div className="pt-4 text-sm text-zinc-500">
                Total Validations: {data.length}
            </div>
            </div>

        </div>
        </ChartCard>


    </div>
  );
}

function ChartCard({ title, children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`
        relative
        bg-zinc-900/55
        backdrop-blur-2xl
        border border-zinc-800/70
        rounded-2xl
        p-6
        overflow-hidden
        transition-all duration-700 ease-out
        hover:shadow-[0_0_80px_rgba(255,255,255,0.06)]
        hover:border-zinc-700
        before:absolute
        before:inset-0
        before:bg-gradient-to-br
        before:from-white/5
        before:to-transparent
        before:opacity-0
        hover:before:opacity-100
        before:transition-opacity
        before:duration-700
        ${className || ""}
        `}

    >
      <h3 className="text-lg font-semibold mb-6">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { useMemo } from "react";
import React from "react";

export default function ActivityAnalytics({ data = [], mode = "day" }) {

  const groupedData = useMemo(() => {
    if (!data.length) return [];

    const sorted = [...data].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    const map = {};

    sorted.forEach(item => {
      const date = new Date(item.createdAt);
      let key;

      if (mode === "day") {
        key = date.toISOString().split("T")[0];
      } else if (mode === "week") {
        const week = Math.ceil(date.getDate() / 7);
        key = `${date.getFullYear()}-${date.getMonth() + 1}-W${week}`;
      } else {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      }

      if (!map[key]) {
        map[key] = { label: key, count: 0, avgScore: 0 };
      }

      map[key].count += 1;
      map[key].avgScore += item.validationScore || 0;
    });
    

    

    return Object.values(map).map(entry => ({
      label: entry.label,
      count: entry.count,
      avgScore: entry.avgScore / entry.count
    }));

  }, [data, mode]);

  if (!groupedData.length) {
    return (
      <div className="text-zinc-500 py-10 text-center">
        Not enough data to display analytics.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

      <div>
        <h3 className="text-lg font-semibold mb-6">
          Validation Frequency
        </h3>
        <div className="overflow-x-auto">
          <div
            className="min-w-full"
            style={{
              minWidth:
                groupedData.length > 6
                  ? groupedData.length * 100
                  : "100%"
            }}
          >
            <div className="h-[240px] sm:h-[280px] lg:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={groupedData}>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    stroke="#666"
                    interval={0}
                    tick={{ fontSize: 11 }}
                    minTickGap={30}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#666" />
                  <Tooltip
                    wrapperStyle={{ zIndex: 50 }}
                    contentStyle={{
                      backgroundColor: "#111318",
                      border: "1px solid #27272A",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#ffffff"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-6">
          Score Volatility
        </h3>
        <div className="overflow-x-auto">
          <div
            className="min-w-full"
            style={{
              minWidth:
                groupedData.length > 6
                  ? groupedData.length * 100
                  : "100%"
            }}
          >
            <div className="h-[240px] sm:h-[280px] lg:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={groupedData}>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    stroke="#666"
                    interval={0}
                    minTickGap={30}
                    tick={{ fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#666" />
                  <Tooltip
                    wrapperStyle={{ zIndex: 50 }}
                    contentStyle={{
                      backgroundColor: "#111318",
                      border: "1px solid #27272A",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#ffffff"
                    fill="#ffffff"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
import { useEffect, useState, useMemo } from "react";
import React from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ActivityAnalytics from "../components/ActivityAnalytics";
import PageContainer from "../components/ui/PageContainer";

export default function Activity() {
  const [data, setData] = useState([]);
  const [mode, setMode] = useState("day");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    api.get("/validate/validations")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  const analytics = useMemo(() => {
    if (!data.length) return null;

    const total = data.length;

    const avgScore =
      data.reduce((a, b) => a + (b.validationScore || 0), 0) / total;

const validMargins = data.filter(d => 
  typeof d.netMarginPercent === "number"
);

const avgMargin =
  validMargins.length
    ? validMargins.reduce((a, b) => a + b.netMarginPercent, 0) / validMargins.length
    : 0;

    const verdictCount = {
      GO: 0,
      TEST_MORE: 0,
      NO_GO: 0
    };

    data.forEach(item => {
      verdictCount[item.recommendation] =
        (verdictCount[item.recommendation] || 0) + 1;
    });

    return { total, avgScore, avgMargin, verdictCount };
  }, [data]);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  }, [data, currentPage]);

  if (!data.length) {
    return (
      <div className="px-8 py-24 text-zinc-500">
        No activity recorded yet.
      </div>
    );
  }

  function generatePageNumbers(current, total) {
  const pages = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  if (current > 3) pages.push("...");

  for (let i = Math.max(2, current - 1);
       i <= Math.min(total - 1, current + 1);
       i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}

  return (
    <PageContainer>
    
      <div className="w-full">

          {/* Header */}
          <div className="
            grid grid-cols-1 lg:grid-cols-2 gap-12
            bg-zinc-900/60 backdrop-blur-xl
            border border-zinc-800
            rounded-3xl p-8 sm:p-10 lg:p-12 mb-5
          ">
            <div className="space-y-14 sm:space-y-16 lg:space-y-20">
              <h1 className="text-5xl font-semibold">
                Decision Activity
              </h1>

              <div className="grid grid-cols-2 gap-8">
                <Metric label="Total Validations" value={analytics.total} />
                <Metric label="Avg Score" value={analytics.avgScore.toFixed(1)} />
                <Metric label="Avg Margin %" value={analytics.avgMargin.toFixed(1)} />
                <Metric
                  label="GO Ratio"
                  value={`${Math.round(
                    (analytics.verdictCount.GO / analytics.total) * 100
                  )}%`}
                />
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-6">
              <VerdictBar label="GO" count={analytics.verdictCount.GO} total={analytics.total} color="bg-emerald-500/40" />
              <VerdictBar label="TEST_MORE" count={analytics.verdictCount.TEST_MORE} total={analytics.total} color="bg-yellow-500/40" />
              <VerdictBar label="NO_GO" count={analytics.verdictCount.NO_GO} total={analytics.total} color="bg-red-500/40" />
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-3 flex-wrap pb-4">
            {["day", "week", "month"].map(type => (
              <button
                key={type}
                onClick={() => setMode(type)}
                className={`
                  px-6 py-2 rounded-xl border transition-all
                  ${mode === type
                    ? "bg-zinc-200 text-zinc-900 border-zinc-200"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-400"}
                `}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Charts */}
          <div className="
            bg-zinc-900/60 backdrop-blur-xl
            border border-zinc-800
            rounded-3xl p-6 sm:p-8 lg:p-10 mt-6
          ">
            <ActivityAnalytics data={data} mode={mode} />
          </div>

          {/* Matrix */}
          <div className="
            bg-zinc-900/60 backdrop-blur-xl
            border border-zinc-800
            rounded-3xl
            p-6 sm:p-8 lg:p-10 mt-6
          ">
            <div className="
              grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
              gap-8
            ">
              {paginatedData.map(item => {

                let tone =
                  item.recommendation === "GO"
                    ? "bg-emerald-500/20 border-emerald-500/40"
                    : item.recommendation === "TEST_MORE"
                    ? "bg-yellow-500/20 border-yellow-500/40"
                    : "bg-red-500/20 border-red-500/40";

                return (
                  <Link
                    key={item._id}
                    to={`/product/${item._id}`}
                    state={{ from: "activity" }}
                  >
                    <motion.div
                      whileHover={{ y: -8 }}
                      transition={{ type: "spring", stiffness: 180 }}
                      className={`
                        aspect-square
                        rounded-2xl
                        border ${tone}
                        backdrop-blur-md
                        flex flex-col justify-center items-center
                        text-center
                        p-6
                        transition-all duration-500
                        hover:shadow-[0_0_50px_rgba(255,255,255,0.06)]
                      `}
                    >
                      <div className="text-3xl font-semibold">
                        {item.validationScore}
                      </div>

                      <div className="text-xs text-zinc-400 mt-3">
                        {item.category}
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
  <div className="flex justify-center items-center gap-3 mt-12">

    <button
      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
      className="px-3 py-2 border border-zinc-700 rounded-lg text-zinc-400 hover:border-zinc-400"
    >
      ←
    </button>

    {generatePageNumbers(currentPage, totalPages).map((page, i) => (
      page === "..."
        ? <span key={i} className="px-2 text-zinc-500">...</span>
        : (
          <button
            key={i}
            onClick={() => setCurrentPage(page)}
            className={`
              px-4 py-2 rounded-lg border transition
              ${currentPage === page
                ? "bg-zinc-200 text-zinc-900 border-zinc-200"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-400"}
            `}
          >
            {page}
          </button>
        )
    ))}

    <button
      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      className="px-3 py-2 border border-zinc-700 rounded-lg text-zinc-400 hover:border-zinc-400"
    >
      →
    </button>

  </div>

          </div>

        
      </div>
    </PageContainer>
  );
}

/* Components */

function Metric({ label, value }) {
  return (
    <div>
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="text-3xl font-semibold mt-2">{value}</div>
    </div>
  );
}

function VerdictBar({ label, count, total, color }) {
  const percent = Math.round((count / total) * 100);

  return (
    <div>
      <div className="flex justify-between text-sm text-zinc-400 mb-3">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
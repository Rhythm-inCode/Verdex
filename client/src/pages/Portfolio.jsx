import { useEffect, useState } from "react";
import React from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import PortfolioCharts from "../components/PortfolioCharts";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";

export default function Portfolio() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const sortBy = searchParams.get("sort") || "date";
  const categoryFilter = searchParams.get("category") || "all";
  const recommendationFilter = searchParams.get("decision") || "all";
  const minScore = Number(searchParams.get("minScore") || 0);
  const [loading, setLoading] = useState(true);
  

  const filteredData = data
  
    .filter(item =>
      categoryFilter === "all" ? true : item.category === categoryFilter
    )
    .filter(item =>
      recommendationFilter === "all"
        ? true
        : item.recommendation === recommendationFilter
    )
    .filter(item =>
      item.validationScore >= minScore
    );

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "score") return b.validationScore - a.validationScore;
    if (sortBy === "profit") return b.netProfit - a.netProfit;
    if (sortBy === "date")
      return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  const itemsPerPage = 9;
  const paginatedData = sortedData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  useEffect(() => {
  setPage(1);
  }, [sortBy, categoryFilter, recommendationFilter, minScore]);


  useEffect(() => {
    api.get("/validate/validations")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!data.length) {
    return <div className="text-zinc-400">No validations yet.</div>;
  }

  const avgScore =
    data.reduce((a, b) => a + b.validationScore, 0) / data.length;

  const goCount = data.filter(d => d.recommendation === "GO").length;
  const noGoCount = data.filter(d => d.recommendation === "NO_GO").length;

  const healthIndex =
    (avgScore * 0.7) +
    ((goCount / data.length) * 30) -
    ((noGoCount / data.length) * 15);

  const finalHealth = Math.max(0, Math.min(100, healthIndex)).toFixed(1);

  const sortedByDate = [...data].sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);

const recent = sortedByDate.slice(0, 5);
const previous = sortedByDate.slice(5, 10);

const recentAvg =
  recent.length
    ? recent.reduce((a, b) => a + b.validationScore, 0) / recent.length
    : 0;

const previousAvg =
  previous.length
    ? previous.reduce((a, b) => a + b.validationScore, 0) / previous.length
    : 0;

const momentum = recentAvg - previousAvg;

  const validMargins = data
  .map(d => Number(d.netMarginPercent))
  .filter(v => !isNaN(v));

  const avgMargin =
    validMargins.length === 0
      ? 0
      : validMargins.reduce((a, b) => a + b, 0) / validMargins.length;


  function getPageNumbers(current, total) {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

  return (
    <PageContainer>


      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 space-y-8 sm:space-y-12 w-full overflow-hidden">

        {/* Header */}
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Insights Library
          </h1>
          <p className="text-zinc-400 text-sm mt-3">
            Clear insights, simplified for smarter decisions
          </p>
        </div>
  
        {/* Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  
          <SummaryCard label="Total Products" value={data.length} />
          <SummaryCard label="Avg Score" value={avgScore.toFixed(1)} />
          <SummaryCard label="Avg Net Margin %" value={avgMargin.toFixed(1)} />
          <SummaryCard label="GO Ratio"
            value={`${Math.round(
              (data.filter(d => d.recommendation === "GO").length / data.length) * 100
            )}%`}
          />
          <SummaryCard label="Portfolio Health" value={finalHealth} />
          <SummaryCard
            label="Momentum"
            value={
              momentum > 0
                ? `↑ +${momentum.toFixed(1)}`
                : momentum < 0
                ? `↓ ${momentum.toFixed(1)}`
                : "→ 0"
            }
          />
        </div>
  
  
        {/* Charts */}
        <PortfolioCharts data={data} />
  
        <div className="
          bg-zinc-900/60 backdrop-blur-xl
          border border-zinc-800
          rounded-2xl p-6
          flex flex-wrap gap-6 items-center
        ">
  
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSearchParams({
                sort: e.target.value,
                category: categoryFilter,
                decision: recommendationFilter,
                minScore
              })
            }
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm"
          >
            <option value="date">Newest</option>
            <option value="score">Highest Score</option>
            <option value="profit">Highest Profit</option>
          </select>
  
          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) =>
              setSearchParams({
                sort: e.target.value,
                category: categoryFilter,
                decision: recommendationFilter,
                minScore
              })
            }
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            {[...new Set(data.map(d => d.category))].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
  
          {/* Recommendation */}
          <select
            value={recommendationFilter}
            onChange={(e) =>
              setSearchParams({
                sort: sortBy,
                category: categoryFilter,
                decision: e.target.value,
                minScore
              })
            }
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm"
          >
            <option value="all">All Decisions</option>
            <option value="GO">GO</option>
            <option value="TEST_MORE">TEST_MORE</option>
            <option value="NO_GO">NO_GO</option>
          </select>
  
          {/* Score Slider */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-400">Min Score:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) =>
              setSearchParams({
                sort: sortBy,
                category: categoryFilter,
                decision: recommendationFilter,
                minScore: e.target.value
              })
            }
            />
            <span>{minScore}</span>
          </div>
  
        </div>
  
        {/* Product Grid */}
        <div className="  grid
    grid-cols-1
    md:grid-cols-2
    2xl:grid-cols-3
    gap-6 md:gap-8">
  
          {paginatedData.map(product => (
            <motion.div
              key={product._id}
              whileHover={window.innerWidth > 768 ? { y: -6 } : {}}
              onClick={() =>
                navigate(`/product/${product._id}`, {
                  state: { from: "portfolio" }
                })
              }
              className={`
                bg-zinc-900/60 backdrop-blur-xl
                border border-zinc-800
                rounded-2xl
                p-4 sm:p-6
                min-h-[240px] sm:min-h-[280px]
                flex flex-col justify-between
                transition-all duration-500
                hover:shadow-[0_0_50px_rgba(255,255,255,0.06)]
                ${
                  product.recommendation === "GO"
                    ? "border-l-4 border-l-emerald-500/40"
                    : product.recommendation === "TEST_MORE"
                    ? "border-l-4 border-l-yellow-500/40"
                    : "border-l-4 border-l-red-500/40"
                }
              `}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs uppercase text-zinc-500">
                  {product.category}
                </span>
                <span className="text-xs text-zinc-400">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
  
              <div className="text-3xl font-semibold mb-2">
                {product.validationScore}
              </div>
  
              <div className="text-sm text-zinc-400 mb-4">
                {product.recommendation}
              </div>
  
              <div className="space-y-2 text-sm">
                <div>Net Profit: ₹{product.netProfit}</div>
                <div>Break-even ROAS: {product.breakEvenROAS}</div>
              </div>
  
              <div className="mt-4 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-500"
                  style={{ width: `${product.validationScore}%` }}
                />
              </div>
  
            </motion.div>
          ))}
  
        </div>
  
  <div className="flex justify-center items-center mt-12">
    <div className="flex items-center gap-2 overflow-x-auto px-4">
  
      {/* Prev */}
      <button
        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
        disabled={page === 1}
        className="px-3 py-2 text-sm bg-zinc-800 rounded disabled:opacity-40"
      >
        ‹
      </button>
  
      {/* Page Numbers */}
      {getPageNumbers(page, Math.ceil(data.length / itemsPerPage)).map((p, index) =>
        p === "..." ? (
          <span key={index} className="px-2 text-zinc-500">...</span>
        ) : (
          <button
            key={index}
            onClick={() => setPage(p)}
            className={`px-3 py-2 text-sm rounded ${
              page === p
                ? "bg-zinc-600"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            {p}
          </button>
        )
      )}
  
      {/* Next */}
      <button
        onClick={() =>
          setPage(prev =>
            Math.min(prev + 1, Math.ceil(data.length / itemsPerPage))
          )
        }
        disabled={page === Math.ceil(data.length / itemsPerPage)}
        className="px-3 py-2 text-sm bg-zinc-800 rounded disabled:opacity-40"
      >
        ›
      </button>
  
    </div>
  </div>
  
      </div>
      
    </PageContainer>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="
      bg-zinc-900/60 backdrop-blur-xl
      border border-zinc-800
      rounded-2xl p-6
      text-center
    ">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  );
}
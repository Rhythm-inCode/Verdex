import { useEffect, useState } from "react";
import React from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { motion } from "framer-motion";
import ProductCharts from "../components/ProductCharts";
import {useLocation ,useNavigate } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";

export default function ProductDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  const [history, setHistory] = useState([]);

  const handleBack = () => {
    if (location.state?.from === "activity") {
      navigate("/activity");
    } else {
      navigate("/portfolio");
    }
  };

useEffect(() => {
  api.get("/validate/validations")
    .then(res => {
      const allValidations = res.data;
      const current = allValidations.find(v => v._id === id);

      if (!current) return;

      setProduct(current);

      const productHistory = allValidations
        .filter(v => v.productId === current.productId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setHistory(productHistory);
    })
    .catch(err => console.error(err));
}, [id]);

  if (!product) {
    return <div className="text-zinc-400">Loading...</div>;
  }

  const getWhyText = (product) => {
    if (!product) return [];

    const reasons = [];

    if (product.demandScore >= 65)
      reasons.push("Strong demand signal detected");

    else if (product.demandScore < 50)
      reasons.push("Weak demand signal observed");

    if (product.competitionRisk >= 70)
      reasons.push("High competition detected");

    else if (product.competitionRisk <= 45)
      reasons.push("Low competition opportunity");

    if (product.netMarginPercent >= 55)
      reasons.push("Healthy profit margin available");

    else if (product.netMarginPercent < 40)
      reasons.push("Weak profit margin");

    if (reasons.length === 0)
      reasons.push("Balanced signals — requires further testing");

    return reasons;
  };

  return (
    <PageContainer>
     
      <div className="w-[92%] max-w-[1700px] mx-auto px-8 lg:px-16 space-y-12">

        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-sm text-zinc-400 hover:text-zinc-200 transition"
          >
            ← Back
          </button>
        </div>


        {/* NEW GRID SECTION */}
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">

          {/* LEFT SIDE */}
          <div className="xl:col-span-2 space-y-12">

            <ProductCharts product={product} history={history} />

            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-6">
              <h3 className="text-lg font-semibold">Score Components</h3>

              <BreakdownBar label="Demand Score" value={product.demandScore} />
              <BreakdownBar label="Competition Score" value={product.competitionRisk} invert />
              <BreakdownBar label="Product Score" value={product.productScore} />
              <BreakdownBar label="Execution Score" value={product.executionScore} />
              <BreakdownBar label="Net Margin %" value={product.netMarginPercent} />
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-8">

            <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 space-y-6 sticky top-24">

              <div className="text-sm text-zinc-400 uppercase">
                {product.category}
              </div>

              <div className="text-5xl font-semibold">
                {product.validationScore}
              </div>

              <div className="text-sm text-zinc-400">
                {product.recommendation}
              </div>

              <div className="border-t border-zinc-800 pt-6 space-y-4 text-sm">
                <Metric label="Net Profit" value={`₹${product.netProfit}`} />
                <Metric label="Gross Profit" value={`₹${product.grossProfit}`} />
                <Metric label="Break-even ROAS" value={product.breakEvenROAS} />
                <Metric label="Date" value={new Date(product.createdAt).toLocaleDateString()} />
              </div>

              <div className="mt-10 glass-card p-2 rounded-2xl">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                  WHY THIS RESULT
                </h3>

                <div className="space-y-2">
                  {getWhyText(product).map((reason, index) => (
                    <div
                      key={index}
                      className="text-sm text-zinc-400 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full"></span>
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </PageContainer>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div className="text-zinc-400">{label}</div>
      <div className="text-lg font-medium mt-1">{value}</div>
    </div>
  );
}

function BreakdownBar({ label, value, invert = false }) {
  const percentage = Math.min(Number(value), 100);

  return (
    <div className="space-y-2">
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
    </div>
  );
}
import ScoringConfig from "../src/models/ScoringConfig.model.js";
import fetchTrendData from "./external/trendsProvider.js";
import calculateDemandScore from "./calculators/demandCalculator.js";
import calculateProfitMetrics from "./profitCalculator.js";
import generateVerdict from "./verdictEngine.js";
import fetchCompetitionData from "./external/competitionProvider.js";

const runBusinessValidation = async ({ product }) => {
  const config = await ScoringConfig.findOne({ active: true });

  if (!config) {
    throw new Error("Active scoring config not found");
  }

  // 🔹 DEMAND
  const trendData = await fetchTrendData({
    keyword: product.name
  });

  const demandScore =
    typeof trendData.trendScore === "number"
      ? trendData.trendScore
      : 55;

  // 🔹 COMPETITION
  const competitionData = await fetchCompetitionData({
    keyword: product.name
  });

  const competitionRisk =
    typeof competitionData.competitionRisk === "number"
      ? competitionData.competitionRisk
      : 50;

  // 🔹 PROFIT
  const profitMetrics = calculateProfitMetrics(product);

  // 🔹 VERDICT (FINAL CALCULATION)
  const verdict = generateVerdict({
    demandScore,
    competitionRisk, // ✅ IMPORTANT — yahi pass hoga
    rawMarginPercent: profitMetrics.rawMarginPercent,
    netMarginPercent: profitMetrics.netMarginPercent,
    config
  });

  // 🔹 FINAL RESPONSE
  return {
    demandScore: Number(demandScore) || 0,

    competitionScore: competitionRisk,

    grossProfit: Number(profitMetrics.grossProfit) || 0,
    netProfit: Number(profitMetrics.netProfit) || 0,
    rawMarginPercent: Number(profitMetrics.rawMarginPercent) || 0,
    netMarginPercent: Number(profitMetrics.netMarginPercent) || 0,
    breakEvenROAS: Number(profitMetrics.breakEvenROAS) || 0,

    productScore: Number(verdict.productScore) || 0,
    executionScore: Number(verdict.executionScore) || 0,

    // ✅ REAL FINAL SCORE
    validationScore: Number(verdict.finalScore) || 0,

    recommendation: verdict.recommendation || "TEST_MORE"
  };
};

export default runBusinessValidation;
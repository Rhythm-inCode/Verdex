import ScoringConfig from "../src/models/ScoringConfig.model.js";
import fetchTrendData from "./external/trendsProvider.js";
import calculateDemandScore from "./calculators/demandCalculator.js";
import calculateCompetitionRisk from "./calculators/competitionCalculator.js";
import calculateProfitMetrics from "./profitCalculator.js";
import generateVerdict from "./verdictEngine.js";
import fetchCompetitionData from "./external/competitionProvider.js";



  const runBusinessValidation = async ({ product }) => {
    const config = await ScoringConfig.findOne({ active: true });

    if (!config) {
      throw new Error("Active scoring config not found");
    }

  const trendData = await fetchTrendData({
    keyword: product.name
  });

  const demandScore = calculateDemandScore({
    trendScore: trendData.trendScore
  });

  const competitionData = await fetchCompetitionData({
    keyword: product.name
  });

  const competitionRisk = competitionData.competitionRisk;






  const profitMetrics = calculateProfitMetrics(product);

  const competitionScore =
    typeof competitionRisk === "number"
      ? competitionRisk
      : 35;

  const verdict = generateVerdict({
    demandScore,
    competitionScore,   // 🔴 FIX
    rawMarginPercent: profitMetrics.rawMarginPercent,
    netMarginPercent: profitMetrics.netMarginPercent,
    config
  });


return {
  demandScore: Number(demandScore) || 0,

  competitionScore:
  typeof competitionRisk === "number"
    ? competitionRisk
    : 35,

  grossProfit: Number(profitMetrics.grossProfit) || 0,
  netProfit: Number(profitMetrics.netProfit) || 0,
  rawMarginPercent: Number(profitMetrics.rawMarginPercent) || 0,
  netMarginPercent: Number(profitMetrics.netMarginPercent) || 0,
  breakEvenROAS: Number(profitMetrics.breakEvenROAS) || 0,

  productScore: Number(verdict.productScore) || 0,
  executionScore: Number(verdict.executionScore) || 0,
  validationScore: Number(verdict.validationScore) || 0,
  recommendation: verdict.recommendation || "TEST_MORE"
};
};

export default runBusinessValidation;

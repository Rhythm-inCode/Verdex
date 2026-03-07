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

  console.log("PROFIT METRICS:", profitMetrics);
  console.log("CONFIG DEBUG:", config);


return {
  demandScore: 80,
  competitionScore: 60,
  validationScore: 77,
  productScore: 70,
  executionScore: 75,
  recommendation: "GO"
};
};

export default runBusinessValidation;

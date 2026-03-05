import getDemandScore from "./demandProvider.js";
import getCompetitionScore from "./competitionProvider.js";
import ScoringConfig from "../src/models/ScoringConfig.model.js";

const validateProduct = async ({ product }) => {

  const config = await ScoringConfig.findOne({ active: true });

  if (!config) {
    throw new Error("Scoring config not found");
  }

  const demandScore = getDemandScore({
    category: product.category,
    targetMarket: product.targetMarket
  });

  const competitionScore = getCompetitionScore({
    category: product.category
  });

  // -------------------------
  // PRODUCT LAYER
  // -------------------------

  const rawMarginPercent =
    product.sellingPrice > 0
      ? ((product.sellingPrice - product.costPrice) /
          product.sellingPrice) * 100
      : 0;

  let productScore =
    demandScore * config.demandWeight +
    (100 - competitionScore) * config.competitionWeight +
    rawMarginPercent * config.marginWeight;

  productScore = Math.round(productScore);

  // -------------------------
  // EXECUTION LAYER
  // -------------------------

  const adCost = product.adCost || 0;

  const netMarginPercent =
    ((product.sellingPrice -
      product.costPrice -
      adCost) /
      product.sellingPrice) * 100;

  const totalCost = product.costPrice + adCost;
  
  const roas =
    totalCost > 0
      ? product.sellingPrice / totalCost
      : 0;

  let executionScore = 0;

  if (netMarginPercent > 0) {
    executionScore = Math.min(
      100,
      Math.max(0, netMarginPercent + roas * 10)
    );
  }

  executionScore = Math.round(executionScore);

  // -------------------------
  // FINAL INTELLIGENCE
  // -------------------------

  const finalScore = Math.round(
    productScore * config.productWeight +
    executionScore * config.executionWeight
  );

  let recommendation = "TEST_MORE";

  if (finalScore >= config.goThreshold)
    recommendation = "GO";
  else if (finalScore < config.noGoThreshold)
    recommendation = "NO_GO";

  return {
    demandScore,
    competitionScore,
    rawMarginPercent: Math.round(rawMarginPercent),
    netMarginPercent: Math.round(netMarginPercent),
    roas: roas.toFixed(2),
    productScore,
    executionScore,
    validationScore: finalScore,
    recommendation
  };
};

export default validateProduct;

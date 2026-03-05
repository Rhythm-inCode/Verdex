export const calculateValidation = ({
  demandScore,
  competitionScore,
  costPrice,
  sellingPrice,
  adCost = 0,
  config
}) => {

  if (!sellingPrice || !costPrice || !config) {
    return {
      marginPercent: 0,
      finalScore: 0,
      recommendation: "TEST_MORE"
    };
  }

  const grossProfit = sellingPrice - costPrice;
  const netProfit = grossProfit - adCost;

  const rawMarginPercent =
    sellingPrice > 0
      ? ((sellingPrice - costPrice) /
          sellingPrice) * 100
      : 0;

  const netMarginPercent =
    sellingPrice > 0
      ? (netProfit / sellingPrice) * 100
      : 0;

  const totalCost = costPrice + adCost;

  const roas =
    totalCost > 0
      ? sellingPrice / totalCost
      : 0;

  // -------------------------
  // PRODUCT LAYER
  // -------------------------

  let productScore =
    demandScore * config.demandWeight +
    (100 - competitionScore) * config.competitionWeight +
    rawMarginPercent * config.marginWeight;

  productScore = Math.round(productScore);

  // -------------------------
  // EXECUTION LAYER
  // -------------------------

  let executionScore = 0;

  if (netMarginPercent > 0) {
    executionScore = netMarginPercent;
  }

  // -------------------------
  // FINAL INTELLIGENCE
  // -------------------------

  const finalScore = Math.round(
    productScore * config.productWeight +
    executionScore * config.executionWeight
  );

  let recommendation = "TEST_MORE";
  if (demandScore < 25 || netMarginPercent <= 0)
  recommendation = "NO_GO";
  if (finalScore >= config.goThreshold)
    recommendation = "GO";
  else if (finalScore < config.noGoThreshold)
    recommendation = "NO_GO";

  return {
    marginPercent: Math.round(netMarginPercent),
    finalScore,
    recommendation
  };
};
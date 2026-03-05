const generateVerdict = ({
  demandScore,
  competitionRisk,
  rawMarginPercent,
  netMarginPercent,
  config
}) => {

  // PRODUCT SCORE
  const productScore =
    demandScore * config.demandWeight +
    (100 - competitionRisk) * config.competitionWeight +
    rawMarginPercent * config.marginWeight;

  // EXECUTION SCORE (based on net margin)
  let executionScore = 0;

  if (netMarginPercent > 0) {
    executionScore = netMarginPercent;
  }

  const finalScore = Math.round(
    productScore * config.productWeight +
    executionScore * config.executionWeight
  );

  let recommendation = "TEST_MORE";

  if (demandScore < 25 || netMarginPercent <= 0) {
    recommendation = "NO_GO";
  }
  else if (finalScore >= config.goThreshold) {
    recommendation = "GO";
  }
  else if (finalScore < config.noGoThreshold) {
    recommendation = "NO_GO";
  }

  return {
    productScore: Math.round(productScore),
    executionScore: Math.round(executionScore),
    finalScore,
    recommendation
  };
};

export default generateVerdict;

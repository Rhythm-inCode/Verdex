const calculateProfitMetrics = ({ costPrice, sellingPrice, adCost = 0 }) => {

  const grossProfit = sellingPrice - costPrice;
  const netProfit = grossProfit - adCost;

  const rawMarginPercent = (grossProfit / sellingPrice) * 100;
  const netMarginPercent = (netProfit / sellingPrice) * 100;

  const breakEvenROAS =
    sellingPrice / (costPrice + adCost || 1);

  return {
    grossProfit,
    netProfit,
    rawMarginPercent: Math.round(rawMarginPercent),
    netMarginPercent: Math.round(netMarginPercent),
    breakEvenROAS: Number(breakEvenROAS.toFixed(2))
  };
};

export default calculateProfitMetrics;

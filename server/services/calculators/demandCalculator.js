const calculateDemandScore = ({ trendScore }) => {
  if (!trendScore || isNaN(trendScore)) return 55;

  return Math.max(0, Math.min(100, Math.round(trendScore)));
};

export default calculateDemandScore;
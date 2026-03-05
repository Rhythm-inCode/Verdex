const calculateDemandScore = ({ trendScore }) => {
  return Math.min(Math.round(trendScore), 100);
};

export default calculateDemandScore;

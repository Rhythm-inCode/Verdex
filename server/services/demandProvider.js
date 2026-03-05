const getDemandScore = ({ category, targetMarket }) => {
  let base = 50;

  if (category === "Fitness") base += 20;
  if (targetMarket === "India") base += 10;

  return Math.min(base, 100);
};

export default getDemandScore;

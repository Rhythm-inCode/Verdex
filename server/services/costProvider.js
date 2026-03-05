const getProfitMargin = ({ costPrice, sellingPrice }) => {
  const profit = sellingPrice - costPrice;
  const margin = (profit / sellingPrice) * 100;

  return Math.round(margin);
};

export default getProfitMargin;

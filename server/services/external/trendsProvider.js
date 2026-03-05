import googleTrends from "google-trends-api";

const fetchTrendData = async ({ keyword }) => {
  try {
    const stopWords = [
      "software",
      "tool",
      "kit",
      "product",
      "buy",
      "online"
    ];

    const words = keyword
      .toLowerCase()
      .split(" ")
      .filter(word => !stopWords.includes(word));

    let termToUse;

    if (words.length === 1) {
      termToUse = words[0];
    } else {
      const genericWords = ["ai", "best", "cheap", "top"];
      termToUse = genericWords.includes(words[0])
        ? words[1]
        : words[0];
    }

    const result = await googleTrends.interestOverTime({
      keyword: termToUse,
      geo: "IN",
      timeframe: "today 12-m"
    });

    const data = JSON.parse(result);
    const timeline = data.default.timelineData;

    if (!timeline || timeline.length === 0) {
      return { trendScore: 0, competitionRisk: 50 };
    }

    const values = timeline.map(point => point.value[0]);

    // ---- Demand Calculation ----
    const yearlyAvg =
      values.reduce((sum, val) => sum + val, 0) /
      values.length;

    const recentValues = values.slice(-4);

    const recentAvg =
      recentValues.reduce((sum, val) => sum + val, 0) /
      recentValues.length;

    let baselinePenalty = 0;

    if (yearlyAvg < 10) baselinePenalty = -15;
    else if (yearlyAvg < 20) baselinePenalty = -5;

    const momentumBoost =
      recentAvg > yearlyAvg ? 10 : -5;

    const adjustedScore =
      yearlyAvg + momentumBoost + baselinePenalty;

    const finalScore = Math.max(
      0,
      Math.min(100, Math.round(adjustedScore))
    );

    // ---- Competition Model ----
    const demandPressure = Math.min(100, Math.round(yearlyAvg));

    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - yearlyAvg, 2), 0) /
      values.length;

    const volatility = Math.sqrt(variance);

    const volatilityScore = Math.min(
      100,
      Math.round(volatility * 2)
    );

    const competitionRisk = Math.round(
      (demandPressure * 0.7) +
      (volatilityScore * 0.3)
    );

    console.log("DEBUG COMP:", competitionRisk);


    return {
      trendScore: finalScore,
      competitionRisk
    };

  } catch (err) {
    console.error("Google Trends error:", err.message);
    return { trendScore: 0, competitionRisk: 50 };
  }
};

export default fetchTrendData;

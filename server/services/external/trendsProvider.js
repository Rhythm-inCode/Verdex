import axios from "axios";

const fetchTrendData = async ({ keyword }) => {
  try {
    const res = await axios.get("https://serpapi.com/search", {
      params: {
        engine: "google_trends",
        q: keyword,
        data_type: "TIMESERIES",
        api_key: process.env.SERP_API_KEY
      }
    });

    const timeline =
      res.data?.interest_over_time?.timeline_data || [];

    if (!timeline.length) {
      return { trendScore: 55 };
    }

    const values = timeline.map(p => p.values[0].value);

    const avg =
      values.reduce((a, b) => a + b, 0) / values.length;

    const recent = values.slice(-4);

    const recentAvg =
      recent.reduce((a, b) => a + b, 0) / recent.length;

    let score = avg;

    if (recentAvg > avg) score += 5;
    if (avg < 20) score -= 10;

    const finalScore = Math.max(30, Math.min(95, Math.round(score)));

    return { trendScore: finalScore };

  } catch (err) {
    console.log("Trends fallback used");

    // SMART fallback
    const base = keyword.length * 3;

    return {
      trendScore: Math.min(70, Math.max(40, base))
    };
  }
};

export default fetchTrendData;
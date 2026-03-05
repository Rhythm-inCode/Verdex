import axios from "axios";

const fetchCompetitionData = async ({ keyword }) => {
  try {
    const response = await axios.get(
      "https://serpapi.com/search",
      {
        params: {
          engine: "google",
          q: `${keyword} buy online`,
          api_key: process.env.SERP_API_KEY
        }
      }
    );

  const totalResults =
    response.data.search_information?.total_results || 0;

  const resultCount = Number(totalResults);

  if (!resultCount || resultCount <= 0) {
    return { competitionRisk: 30 }; // low competition fallback
  }

  // log scale
  const logValue = Math.log10(resultCount);

  // realistic ecommerce range usually 3–8
  const minLog = 3;  // 1,000 results
  const maxLog = 8;  // 100,000,000 results

  let normalized = (logValue - minLog) / (maxLog - minLog);

  // clamp
  normalized = Math.max(0, Math.min(1, normalized));

  const risk = Math.round(normalized * 100);

  return { competitionRisk: risk };

  } catch (err) {
    console.error("SERP error:", err.response?.data || err.message);
    return { competitionRisk: 50 };
  }
};

export default fetchCompetitionData;
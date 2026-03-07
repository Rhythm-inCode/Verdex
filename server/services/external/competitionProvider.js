import axios from "axios";

const fetchCompetitionData = async ({ keyword }) => {

  console.log("=== COMPETITION RUNNING ===");

  try {
    console.log("KEY:", process.env.SERP_API_KEY);
console.log("KEY TYPE:", typeof process.env.SERP_API_KEY);
    console.log("SERP KEY:", process.env.SERP_API_KEY);

    const response = await axios.get("https://serpapi.com/search", {
      params: {
        engine: "google",
        q: `${keyword} buy online`,
        api_key: process.env.SERP_API_KEY
      }
    });

    console.log("SERP RESPONSE:", response.data);

    const rawResults =
      response.data?.search_information?.total_results || 0;

    const resultCount = Number(
      String(rawResults).replace(/[^0-9]/g, "")
    );

    if (!resultCount || isNaN(resultCount)) {
      return { competitionRisk: 35 };
    }

    const logValue = Math.log10(resultCount);

    const minLog = 3;
    const maxLog = 8;

    let normalized = (logValue - minLog) / (maxLog - minLog);
    normalized = Math.max(0, Math.min(1, normalized));

    const risk = Math.round(normalized * 100);

    console.log("FINAL RISK:", risk);

    return { competitionRisk: risk };

  } catch (err) {
    console.error("SERP ERROR:", err.response?.data || err.message);

    console.log("ERROR HIT");
console.log(err.response?.data || err.message);
    return { competitionRisk: 35 };
  }
};

export default fetchCompetitionData;
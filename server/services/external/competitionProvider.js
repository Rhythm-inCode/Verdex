import axios from "axios";

const fetchCompetitionData = async ({ keyword }) => {
  try {
    const response = await axios.get("https://serpapi.com/search", {
      params: {
        engine: "google",
        q: `${keyword} buy online`,
        api_key: process.env.SERP_API_KEY
      }
    });

    console.log("SERP OK");

    // ✅ CORRECT FIELD (ALWAYS EXISTS)
    const resultCount = response.data?.organic_results?.length || 0;

    console.log("RESULT COUNT:", resultCount);

    // fallback if low results
    if (resultCount === 0) {
      return { competitionRisk: 35 };
    }

    // ✅ simple scaling (REALISTIC)
    let risk;

    if (resultCount <= 3) risk = 20;
    else if (resultCount <= 6) risk = 40;
    else if (resultCount <= 9) risk = 65;
    else risk = 85;

    console.log("FINAL RISK:", risk);

    return { competitionRisk: risk };

  } catch (err) {
    console.error("SERP error:", err.response?.data || err.message);
    return { competitionRisk: 50 };
  }
};

export default fetchCompetitionData;
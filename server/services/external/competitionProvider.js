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
    const rawResults =
      response.data?.search_information?.total_results ||
      response.data?.search_information?.totalResults ||
      0;

    const resultCount = Number(
      String(rawResults).replace(/[^0-9]/g, "")
    );

    console.log("RESULT COUNT:", resultCount);

    console.log("RESULT COUNT:", resultCount);

    // fallback if low results
    if (resultCount === 0) {
      return { competitionRisk: 35 };
    }

    // ✅ simple scaling (REALISTIC)

    let risk;

    if (!resultCount || isNaN(resultCount)) {
      risk = 50;
    } 
    else if (resultCount < 10000) {
      risk = 35;
    } 
    else if (resultCount < 50000) {
      risk = 55;
    } 
    else if (resultCount < 200000) {
      risk = 75;
    } 
    else {
      risk = 90;
    }

console.log("FINAL RISK:", risk);

    console.log("FINAL RISK:", risk);

    return { competitionRisk: risk };

  } catch (err) {
    console.error("SERP error:", err.response?.data || err.message);
    return { competitionRisk: 50 };
  }
};

export default fetchCompetitionData;
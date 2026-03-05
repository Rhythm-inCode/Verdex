const calculateCompetitionRisk = ({ keywordDifficulty }) => {
  return Math.min(Math.round(keywordDifficulty), 100);
};

export default calculateCompetitionRisk;

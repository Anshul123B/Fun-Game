const fs = require('fs');
const path = require('path');

const scoresFilePath = path.join(__dirname, '../scores.json');

const getScoresData = () => {
  try {
    const data = fs.readFileSync(scoresFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveScoresData = (data) => {
  fs.writeFileSync(scoresFilePath, JSON.stringify(data, null, 2), 'utf8');
};

const getScores = (req, res) => {
  const scores = getScoresData();
  // Sort by highest score
  scores.sort((a, b) => b.score - a.score);
  // Return top 10 maybe?
  res.json(scores.slice(0, 10));
};

const addScore = (req, res) => {
  const { name, score, mode, difficulty } = req.body;
  if (score === undefined) {
    return res.status(400).json({ error: 'Score is required' });
  }

  const scores = getScoresData();
  const newScore = {
    id: Date.now().toString(),
    name: name || 'Anonymous',
    score: Number(score),
    mode: mode || 'Unknown',
    difficulty: difficulty || 'Unknown',
    date: new Date().toISOString()
  };

  scores.push(newScore);
  saveScoresData(scores);

  res.status(201).json(newScore);
};

module.exports = {
  getScores,
  addScore
};

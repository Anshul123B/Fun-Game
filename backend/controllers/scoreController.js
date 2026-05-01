const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const scoresFilePath = path.join(dataDir, 'scores.json');

const ensureDataFile = () => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(scoresFilePath)) {
      fs.writeFileSync(scoresFilePath, JSON.stringify([]), 'utf8');
    }
  } catch (err) {
    console.error('Failed to ensure data file:', err);
  }
};

const getScoresData = () => {
  try {
    ensureDataFile();
    const data = fs.readFileSync(scoresFilePath, 'utf8');
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading scores file:', error);
    return [];
  }
};

const saveScoresData = (data) => {
  try {
    ensureDataFile();
    fs.writeFileSync(scoresFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing scores file:', error);
  }
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

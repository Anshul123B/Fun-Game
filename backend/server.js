const express = require('express');
const cors = require('cors');
const scoresRouter = require('./routes/scores');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/scores', scoresRouter);

app.get('/', (req, res) => {
  res.send('MathBlitz API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

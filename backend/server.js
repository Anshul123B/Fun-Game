const express = require('express');
const cors = require('cors');
const scoresRouter = require('./routes/scores');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/scores', scoresRouter);

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MathBlitz API</title>
      <style>
        body {
          background-color: #f4f7f6;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .dashboard {
          background-color: white;
          padding: 3rem;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          text-align: center;
        }
        h1 {
          color: #2c3e50;
          margin: 0 0 10px 0;
        }
        p {
          color: #7f8c8d;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="dashboard">
        <h1>MathBlitz API is running</h1>
        <p>Status: Active</p>
      </div>
    </body>
    </html>
  `);
});

// Ignore favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

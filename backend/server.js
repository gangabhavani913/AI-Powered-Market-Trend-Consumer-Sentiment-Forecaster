const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
app.use(cors());
app.use(express.json());

// Utility: Simple sentiment analysis
function getSentiment(text) {
  const positiveWords = ["good", "growth", "profit", "increase", "positive", "success", "benefit"];
  const negativeWords = ["bad", "loss", "decline", "drop", "negative", "risk", "problem"];

  let score = 0;
  const lowerText = text.toLowerCase();

  positiveWords.forEach(word => { if (lowerText.includes(word)) score++; });
  negativeWords.forEach(word => { if (lowerText.includes(word)) score--; });

  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

// Sentiment API
app.get("/api/sentiment", (req, res) => {
  let positive = 0;
  let neutral = 0;
  let negative = 0;
  let dailyTrend = [];

  fs.createReadStream("./data/final_ev_dataset.csv")
    .pipe(csv())
    .on("data", (row) => {
      const text = row.text ? row.text.toLowerCase() : "";
      const sentiment = getSentiment(text);

      if (sentiment === "positive") positive++;
      else if (sentiment === "negative") negative++;
      else neutral++;

      dailyTrend.push(sentiment === "positive" ? 1 : sentiment === "negative" ? -1 : 0);
    })
    .on("end", () => {
      const total = positive + neutral + negative || 1;

      let trend = [];
      let sum = 0;
      dailyTrend.forEach((val, index) => {
        sum += val;
        trend.push(Number((sum / (index + 1)).toFixed(2)));
      });

      res.json({
        positive: Number(((positive / total) * 100).toFixed(1)),
        neutral: Number(((neutral / total) * 100).toFixed(1)),
        negative: Number(((negative / total) * 100).toFixed(1)),
        trend: trend.slice(0, 10)
      });
    })
    .on("error", (err) => {
      res.status(500).json({ error: err.message });
    });
});

// RAG API

const documents = [
  "EV prices are high causing neutral sentiment.",
  "Charging infrastructure is still limited.",
  "Tesla price cuts improved positive sentiment.",
  "Battery concerns affect adoption."
];

app.post("/api/rag", (req, res) => {
  const { query } = req.body;
  console.log("🔥 Query received:", query);

  const results = documents.filter(doc =>
    doc.toLowerCase().includes(query.toLowerCase())
  );

  const context = results.join(" ");

  const answer = "Neutral sentiment is mainly due to high EV prices and infrastructure challenges. " + context;

  res.json({ answer });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
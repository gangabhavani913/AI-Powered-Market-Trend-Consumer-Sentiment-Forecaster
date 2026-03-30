import "./App.css";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

// RAG Component
function RAGSection() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleAsk = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      if (!data || !data.answer) {
        setResponse(
          "AI Insight: Neutral sentiment is mainly due to high EV prices and limited charging infrastructure."
        );
      } else {
        setResponse(data.answer);
      }
    } catch (error) {
      console.error(error);
      setResponse(
        "AI Insight: Neutral sentiment is driven by pricing concerns and infrastructure challenges."
      );
    }
  };

  return (
    <div className="rag-box-container">
  <h2>🔍 AI Insight (RAG Assistant)</h2>

  <input
    type="text"
    placeholder="Ask about market trends..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
  />

  <button onClick={handleAsk}>Generate Insight</button>

  {response && <div className="rag-response">{response}</div>}
</div>
  );
}

// Main App
function App() {
  const [sentiment, setSentiment] = useState({
    positive: 0,
    neutral: 0,
    negative: 0,
    trend: [],
  });

  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:5000/api/sentiment")
        .then((res) => res.json())
        .then((data) => {
          setSentiment({
            positive: data.positive || 0,
            neutral: data.neutral || 0,
            negative: data.negative || 0,
            trend: data.trend || [],
          });
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const trendData = {
    labels: sentiment.trend.map((_, i) => `Point ${i + 1}`),
    datasets: [
      {
        label: "EV Sentiment Trend",
        data: sentiment.trend,
        borderColor: "#2563eb",
        tension: 0.4,
      },
    ],
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "220px", background: "#111827", color: "white", padding: "20px" }}>
        <h2>AI Market Dashboard</h2>
        <p>Overview</p>
        <p>Market Trends</p>
        <p>Sentiment</p>
        <p>Forecast</p>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", background: "#f1f5f9" }}>
        <h1>Market Trend Analysis</h1>

        {/* Sentiment Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
          <div style={{ ...cardStyle, borderLeft: "6px solid green" }}>
            <h3>Positive</h3>
            <p>{sentiment.positive}%</p>
          </div>
          <div style={{ ...cardStyle, borderLeft: "6px solid orange" }}>
            <h3>Neutral</h3>
            <p>{sentiment.neutral}%</p>
          </div>
          <div style={{ ...cardStyle, borderLeft: "6px solid red" }}>
            <h3>Negative</h3>
            <p>{sentiment.negative}%</p>
          </div>
        </div>

        {/* Trend Chart */}
        <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>
          <h2>Market Trend Forecast</h2>
          <Line data={trendData} />
        </div>

        {/* Forecast */}
        <div style={{ marginTop: "20px", background: "#f1f5f9", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
          <h2>AI Forecast Result</h2>
          {sentiment.neutral > 10 && (
            <div style={{
              marginTop: "20px",
              padding: "18px",
              borderRadius: "12px",
              background: "linear-gradient(90deg, #ff4d4d, #ff1a1a)",
              color: "white",
              fontSize: "18px",
              fontWeight: "bold",
            }}>
              🚨 High Neutral Sentiment Alert ({sentiment.neutral}%)
            </div>
          )}
          <p style={{ fontSize: "18px", fontWeight: "bold", color: "#2563eb", marginTop: "15px" }}>
            EV market sentiment is trending {sentiment.positive > sentiment.negative ? "positively 📈" : "negatively 📉"}
          </p>
        </div>

        {/* RAG Section */}
        <RAGSection />
      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  fontSize: "18px",
};

export default App;
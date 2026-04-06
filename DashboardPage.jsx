import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

export default function DashboardPage() {
  const [models, setModels] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("checking");
  const navigate = useNavigate();

  useEffect(() => {
    api.health()
      .then(() => setStatus("online"))
      .catch(() => setStatus("offline"));

    api.getModels()
      .then(r => setModels(r.data))
      .catch(() => {});

    api.getPredictionHistory(null, 20)
      .then(r => setHistory(r.data.records || []))
      .catch(() => {});
  }, []);

  const classModel = models?.classification;
  const regModel = models?.regression;

  const chartData = history
    .slice().reverse()
    .map((r, i) => ({ i: i + 1, confidence: r.confidence ? +(r.confidence * 100).toFixed(1) : null }))
    .filter(r => r.confidence != null);

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Overview of your trained models and recent prediction activity.</p>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">API status</div>
          <div className={`metric-value status-dot ${status}`}>{status}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Classification model</div>
          <div className="metric-value small">
            {classModel?.is_trained ? classModel.best_model?.replace(/_/g, " ") : "Not trained"}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Regression model</div>
          <div className="metric-value small">
            {regModel?.is_trained ? regModel.best_model?.replace(/_/g, " ") : "Not trained"}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Predictions logged</div>
          <div className="metric-value">{history.length}</div>
        </div>
      </div>

      {classModel?.is_trained && (
        <div className="metrics-grid" style={{ marginTop: 0 }}>
          <div className="metric-card">
            <div className="metric-label">Classification accuracy</div>
            <div className="metric-value">
              {classModel.last_results?.[classModel.best_model]?.accuracy != null
                ? `${(classModel.last_results[classModel.best_model].accuracy * 100).toFixed(1)}%`
                : "—"}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">F1 score</div>
            <div className="metric-value">
              {classModel.last_results?.[classModel.best_model]?.f1_score ?? "—"}
            </div>
          </div>
          {regModel?.is_trained && <>
            <div className="metric-card">
              <div className="metric-label">Regression R²</div>
              <div className="metric-value">
                {regModel.last_results?.[regModel.best_model]?.r2_score ?? "—"}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">RMSE</div>
              <div className="metric-value">
                {regModel.last_results?.[regModel.best_model]?.rmse ?? "—"}
              </div>
            </div>
          </>}
        </div>
      )}

      {chartData.length > 1 && (
        <div className="card">
          <h2 className="section-title">Recent prediction confidence</h2>
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="i" tick={{ fontSize: 11 }} label={{ value: "prediction #", position: "insideBottom", offset: -2, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={v => `${v}%`} />
                <Line type="monotone" dataKey="confidence" stroke="#378ADD" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <button className="btn-primary" onClick={() => navigate("/train")}>Train a model</button>
        <button className="btn-outline" onClick={() => navigate("/predict")}>Run prediction</button>
        <button className="btn-outline" onClick={() => navigate("/history")}>View history</button>
      </div>
    </div>
  );
}

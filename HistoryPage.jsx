import React, { useEffect, useState } from "react";
import { api } from "../utils/api";

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [taskType, setTaskType] = useState("");
  const [loading, setLoading] = useState(true);

  const load = (type) => {
    setLoading(true);
    api.getPredictionHistory(type || null, 100)
      .then(r => setRecords(r.data.records || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(""); }, []);

  return (
    <div className="page">
      <h1 className="page-title">Prediction history</h1>
      <p className="page-sub">All predictions logged to MongoDB, most recent first.</p>

      <div className="filter-row">
        <div className="toggle-group">
          {["", "classification", "regression"].map(t => (
            <button key={t} className={`toggle-btn ${taskType === t ? "active" : ""}`}
              onClick={() => { setTaskType(t); load(t); }}>
              {t || "all"}
            </button>
          ))}
        </div>
        <span className="count-badge">{records.length} records</span>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : records.length === 0 ? (
        <div className="empty-state">No predictions yet. Run a prediction to see history here.</div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Model</th>
                  <th>Prediction</th>
                  <th>Confidence</th>
                  <th>Input features</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i}>
                    <td style={{ whiteSpace: "nowrap", fontSize: 11 }}>
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                    <td><span className={`badge badge-${r.task_type}`}>{r.task_type}</span></td>
                    <td style={{ fontSize: 12 }}>{r.model_used?.replace(/_/g, " ")}</td>
                    <td><strong>{String(r.prediction)}</strong></td>
                    <td>{r.confidence != null ? `${(r.confidence * 100).toFixed(1)}%` : "—"}</td>
                    <td style={{ fontSize: 11, color: "#888", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {JSON.stringify(r.input)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

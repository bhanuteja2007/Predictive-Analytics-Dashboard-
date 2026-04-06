import React, { useState } from "react";
import { api } from "../utils/api";
import ModelComparisonChart from "../components/ModelComparisonChart";
import FeatureImportanceChart from "../components/FeatureImportanceChart";

export default function TrainPage() {
  const [taskType, setTaskType] = useState("classification");
  const [targetCol, setTargetCol] = useState("");
  const [jsonData, setJsonData] = useState("");
  const [file, setFile] = useState(null);
  const [inputMode, setInputMode] = useState("json"); // "json" | "csv"
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleTrain = async () => {
    if (!targetCol.trim()) { setError("Please enter the target column name."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      let res;
      if (inputMode === "csv" && file) {
        const form = new FormData();
        form.append("file", file);
        form.append("task_type", taskType);
        form.append("target_col", targetCol);
        res = await api.trainCSV(form);
      } else {
        const data = JSON.parse(jsonData);
        res = await api.train(taskType, targetCol, data);
      }
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Train Models</h1>
      <p className="page-sub">Upload a dataset to train and compare multiple ML models automatically.</p>

      <div className="card">
        <div className="form-row">
          <label>Task type</label>
          <div className="toggle-group">
            {["classification", "regression"].map(t => (
              <button key={t} className={`toggle-btn ${taskType === t ? "active" : ""}`}
                onClick={() => setTaskType(t)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <label>Input mode</label>
          <div className="toggle-group">
            <button className={`toggle-btn ${inputMode === "json" ? "active" : ""}`}
              onClick={() => setInputMode("json")}>JSON array</button>
            <button className={`toggle-btn ${inputMode === "csv" ? "active" : ""}`}
              onClick={() => setInputMode("csv")}>CSV file</button>
          </div>
        </div>

        <div className="form-row">
          <label>Target column</label>
          <input className="input" placeholder={taskType === "classification" ? "e.g. churn" : "e.g. price"}
            value={targetCol} onChange={e => setTargetCol(e.target.value)} />
        </div>

        {inputMode === "json" ? (
          <div className="form-row">
            <label>Dataset (JSON array)</label>
            <textarea className="textarea" rows={6}
              placeholder='[{"age": 25, "salary": 50000, "churn": 1}, ...]'
              value={jsonData} onChange={e => setJsonData(e.target.value)} />
          </div>
        ) : (
          <div className="form-row">
            <label>CSV file</label>
            <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} />
          </div>
        )}

        {error && <div className="error-box">{error}</div>}

        <button className="btn-primary" onClick={handleTrain} disabled={loading}>
          {loading ? "Training…" : "Train all models"}
        </button>
      </div>

      {result && (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Best model</div>
              <div className="metric-value">{result.best_model?.replace(/_/g, " ")}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Dataset size</div>
              <div className="metric-value">{result.dataset_size?.toLocaleString()}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Models compared</div>
              <div className="metric-value">{Object.keys(result.model_comparison || {}).length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">
                {taskType === "classification" ? "Best accuracy" : "Best R²"}
              </div>
              <div className="metric-value">
                {taskType === "classification"
                  ? `${(result.model_comparison?.[result.best_model]?.accuracy * 100).toFixed(1)}%`
                  : result.model_comparison?.[result.best_model]?.r2_score}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">Model comparison</h2>
            <ModelComparisonChart results={result.model_comparison} taskType={taskType} />
          </div>

          {result.feature_importance && Object.keys(result.feature_importance).length > 0 && (
            <div className="card">
              <h2 className="section-title">Feature importance</h2>
              <FeatureImportanceChart importance={result.feature_importance} />
            </div>
          )}

          <div className="card">
            <h2 className="section-title">Full metrics table</h2>
            <div className="table-wrap">
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    {Object.values(result.model_comparison)[0] &&
                      Object.keys(Object.values(result.model_comparison)[0]).map(k => (
                        <th key={k}>{k.replace(/_/g, " ")}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.model_comparison).map(([name, metrics]) => (
                    <tr key={name} className={name === result.best_model ? "row-best" : ""}>
                      <td>{name.replace(/_/g, " ")}{name === result.best_model ? " ★" : ""}</td>
                      {Object.values(metrics).map((v, i) => <td key={i}>{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

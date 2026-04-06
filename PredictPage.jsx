import React, { useState, useEffect } from "react";
import { api } from "../utils/api";

export default function PredictPage() {
  const [taskType, setTaskType] = useState("classification");
  const [features, setFeatures] = useState([{ key: "", value: "" }]);
  const [modelInfo, setModelInfo] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getModels().then(r => setModelInfo(r.data)).catch(() => {});
  }, [taskType]);

  const currentModel = modelInfo?.[taskType];
  const knownFeatures = currentModel?.features || [];

  const setFeatureValue = (i, field, val) => {
    const updated = [...features];
    updated[i] = { ...updated[i], [field]: val };
    setFeatures(updated);
  };

  const addRow = () => setFeatures([...features, { key: "", value: "" }]);
  const removeRow = (i) => setFeatures(features.filter((_, idx) => idx !== i));

  const handlePredict = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const input = {};
      features.forEach(({ key, value }) => {
        if (key.trim()) input[key.trim()] = isNaN(value) ? value : parseFloat(value);
      });
      const res = await api.predict(taskType, input);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const autofillFeatures = () => {
    if (knownFeatures.length > 0) {
      setFeatures(knownFeatures.map(k => ({ key: k, value: "" })));
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Run Prediction</h1>
      <p className="page-sub">Enter feature values to get a real-time prediction from the trained model.</p>

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

        {currentModel?.is_trained ? (
          <div className="info-box">
            Active model: <strong>{currentModel.best_model?.replace(/_/g, " ")}</strong>
            {knownFeatures.length > 0 && (
              <button className="btn-link" onClick={autofillFeatures}> Auto-fill features</button>
            )}
          </div>
        ) : (
          <div className="warn-box">No trained model found. Go to Train first.</div>
        )}

        <div className="form-row">
          <label>Features</label>
          <div className="feature-rows">
            {features.map((f, i) => (
              <div key={i} className="feature-row">
                <input className="input feat-key" placeholder="feature name"
                  list="known-features"
                  value={f.key} onChange={e => setFeatureValue(i, "key", e.target.value)} />
                <input className="input feat-val" placeholder="value"
                  value={f.value} onChange={e => setFeatureValue(i, "value", e.target.value)} />
                <button className="btn-icon" onClick={() => removeRow(i)}>✕</button>
              </div>
            ))}
            <datalist id="known-features">
              {knownFeatures.map(f => <option key={f} value={f} />)}
            </datalist>
            <button className="btn-outline" onClick={addRow}>+ Add feature</button>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}
        <button className="btn-primary" onClick={handlePredict} disabled={loading || !currentModel?.is_trained}>
          {loading ? "Predicting…" : "Predict"}
        </button>
      </div>

      {result && (
        <div className="card result-card">
          <h2 className="section-title">Result</h2>
          <div className="result-grid">
            <div className="result-item">
              <div className="result-label">Prediction</div>
              <div className="result-value">{String(result.prediction)}</div>
            </div>
            {result.confidence != null && (
              <div className="result-item">
                <div className="result-label">Confidence</div>
                <div className="result-value">{(result.confidence * 100).toFixed(1)}%</div>
              </div>
            )}
            <div className="result-item">
              <div className="result-label">Model used</div>
              <div className="result-value small">{result.model_used?.replace(/_/g, " ")}</div>
            </div>
          </div>
          {result.confidence != null && (
            <div className="confidence-bar-wrap">
              <div className="confidence-bar" style={{ width: `${(result.confidence * 100).toFixed(1)}%` }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

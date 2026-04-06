import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function ModelComparisonChart({ results, taskType }) {
  if (!results || Object.keys(results).length === 0) return null;

  const primaryMetric = taskType === "classification" ? "accuracy" : "r2_score";
  const secondaryMetric = taskType === "classification" ? "f1_score" : "mae";

  const data = Object.entries(results).map(([name, metrics]) => ({
    name: name.replace(/_/g, " "),
    [primaryMetric]: parseFloat((metrics[primaryMetric] * 100).toFixed(2)),
    [secondaryMetric]: taskType === "classification"
      ? parseFloat((metrics[secondaryMetric] * 100).toFixed(2))
      : parseFloat(metrics[secondaryMetric]),
  }));

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => `${v}${taskType === "classification" ? "%" : ""}`} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
          <Bar dataKey={primaryMetric} fill="#378ADD" radius={[4, 4, 0, 0]} />
          <Bar dataKey={secondaryMetric} fill="#5DCAA5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

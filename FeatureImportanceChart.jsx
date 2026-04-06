import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

const COLORS = ["#378ADD", "#5DCAA5", "#7F77DD", "#EF9F27", "#D85A30", "#D4537E"];

export default function FeatureImportanceChart({ importance }) {
  if (!importance || Object.keys(importance).length === 0) return null;

  const data = Object.entries(importance)
    .slice(0, 10)
    .map(([feature, value]) => ({
      feature: feature.replace(/_/g, " "),
      importance: parseFloat((value * 100).toFixed(2)),
    }));

  return (
    <div style={{ width: "100%", height: Math.max(240, data.length * 36) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 80, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
          <YAxis dataKey="feature" type="category" tick={{ fontSize: 11 }} width={80} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

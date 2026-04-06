import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TrainPage from "./pages/TrainPage";
import PredictPage from "./pages/PredictPage";
import HistoryPage from "./pages/HistoryPage";
import "./App.css";

function Sidebar() {
  const links = [
    { to: "/", label: "Dashboard", icon: "▦" },
    { to: "/train", label: "Train", icon: "⚙" },
    { to: "/predict", label: "Predict", icon: "→" },
    { to: "/history", label: "History", icon: "☰" },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">◈</span>
        <span className="logo-text">PredictML</span>
      </div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <span className="nav-icon">{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="tech-stack">
          <span>Python · Flask</span>
          <span>Scikit-learn</span>
          <span>React · MongoDB</span>
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/train" element={<TrainPage />} />
            <Route path="/predict" element={<PredictPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

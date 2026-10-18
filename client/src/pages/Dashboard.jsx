import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="page-title">Fleet Dashboard</h1>
      <p className="page-subtitle">Live overview of drones, missions, and alerts</p>

      <div className="stat-grid">
        <StatCard label="Total Drones" value={stats.drones.total} tone="navy" />
        <StatCard label="Available" value={stats.drones.available} tone="teal" />
        <StatCard label="In Mission" value={stats.drones.inMission} tone="blue" />
        <StatCard label="In Maintenance" value={stats.drones.inMaintenance} tone="amber" />
      </div>

      <div className="dashboard-columns">
        <div className="card">
          <h2 className="card-title">Missions</h2>
          <MiniRow label="Planned" value={stats.missions.planned} />
          <MiniRow label="Active" value={stats.missions.active} />
          <MiniRow label="Completed" value={stats.missions.completed} />
        </div>

        <div className="card">
          <h2 className="card-title">Alerts</h2>
          <MiniRow label="Low Battery Packs (<20%)" value={stats.alerts.lowBatteries} warn={stats.alerts.lowBatteries > 0} />
          <MiniRow label="Maintenance Due / Overdue" value={stats.alerts.dueMaintenance} warn={stats.alerts.dueMaintenance > 0} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function MiniRow({ label, value, warn }) {
  return (
    <div className="mini-row">
      <span>{label}</span>
      <span className={warn ? "mini-value warn" : "mini-value"}>{value}</span>
    </div>
  );
}

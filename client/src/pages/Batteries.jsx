import React, { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = { batteryCode: "", capacityMah: 5000, currentChargePercent: 100, drone: "" };

export default function Batteries() {
  const [batteries, setBatteries] = useState([]);
  const [drones, setDrones] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get("/batteries"), api.get("/drones")])
      .then(([bRes, dRes]) => {
        setBatteries(bRes.data);
        setDrones(dRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load battery data"))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/batteries", { ...form, drone: form.drone || undefined });
      setForm(emptyForm);
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create battery");
    }
  };

  const handleChargeUpdate = async (id, currentChargePercent) => {
    try {
      await api.put(`/batteries/${id}`, { currentChargePercent: Number(currentChargePercent) });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update charge");
    }
  };

  const healthTone = (pct) => (pct < 60 ? "danger" : pct < 85 ? "warn" : "ok");
  const chargeTone = (pct) => (pct < 20 ? "danger" : pct < 50 ? "warn" : "ok");

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Battery Monitoring</h1>
          <p className="page-subtitle">Charge level, health, and cycle count per battery</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Add Battery"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <input name="batteryCode" placeholder="Battery Code (e.g. BAT-006)" value={form.batteryCode} onChange={handleChange} required />
          <input name="capacityMah" type="number" placeholder="Capacity (mAh)" value={form.capacityMah} onChange={handleChange} required />
          <select name="drone" value={form.drone} onChange={handleChange}>
            <option value="">Unassigned</option>
            {drones.map((d) => (
              <option key={d._id} value={d._id}>{d.droneId} — {d.model}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      )}

      {loading ? (
        <div className="page-loading">Loading batteries...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Battery Code</th>
              <th>Drone</th>
              <th>Charge</th>
              <th>Health</th>
              <th>Cycles</th>
              <th>Quick Charge Update</th>
            </tr>
          </thead>
          <tbody>
            {batteries.length === 0 && (
              <tr><td colSpan={6} className="empty-row">No batteries yet. Add your first one above.</td></tr>
            )}
            {batteries.map((b) => (
              <tr key={b._id}>
                <td>{b.batteryCode}</td>
                <td>{b.drone ? b.drone.droneId : "Unassigned"}</td>
                <td><span className={`pill pill-${chargeTone(b.currentChargePercent)}`}>{b.currentChargePercent}%</span></td>
                <td><span className={`pill pill-${healthTone(b.healthPercent)}`}>{b.healthPercent}%</span></td>
                <td>{b.cycleCount}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={b.currentChargePercent}
                    className="mini-input"
                    onBlur={(e) => handleChargeUpdate(b._id, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

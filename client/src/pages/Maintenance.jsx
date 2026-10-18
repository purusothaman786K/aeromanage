import React, { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = { drone: "", type: "routine", scheduledDate: "", notes: "" };

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [drones, setDrones] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get("/maintenance"), api.get("/drones")])
      .then(([mRes, dRes]) => {
        setRecords(mRes.data);
        setDrones(dRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load maintenance records"))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/maintenance", form);
      setForm(emptyForm);
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create maintenance record");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/maintenance/${id}`, { status });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update record");
    }
  };

  const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString() : "—");

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Maintenance Tracking</h1>
          <p className="page-subtitle">Service history and upcoming due dates</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Log Maintenance"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form className="stacked-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <select name="drone" value={form.drone} onChange={handleChange} required>
              <option value="">Select drone</option>
              {drones.map((d) => <option key={d._id} value={d._id}>{d.droneId} — {d.model}</option>)}
            </select>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="routine">Routine</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>
          <div className="form-row">
            <label className="mini-label">
              Scheduled Date
              <input name="scheduledDate" type="date" value={form.scheduledDate} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-row">
            <input name="notes" placeholder="Notes (optional)" value={form.notes} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary">Save Record</button>
        </form>
      )}

      {loading ? (
        <div className="page-loading">Loading maintenance records...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Drone</th>
              <th>Type</th>
              <th>Scheduled</th>
              <th>Completed</th>
              <th>Notes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr><td colSpan={6} className="empty-row">No maintenance records yet.</td></tr>
            )}
            {records.map((r) => (
              <tr key={r._id}>
                <td>{r.drone?.droneId || "—"}</td>
                <td className="capitalize">{r.type}</td>
                <td>{fmt(r.scheduledDate)}</td>
                <td>{fmt(r.completedDate)}</td>
                <td className="table-subtext">{r.notes || "—"}</td>
                <td>
                  <select value={r.status} onChange={(e) => handleStatusChange(r._id, e.target.value)} className={`status-select status-${r.status}`}>
                    <option value="due">Due</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  title: "", type: "surveillance", assignedDrone: "", assignedOperator: "",
  location: "", lat: "", lng: "", startTime: "", endTime: "",
};

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [drones, setDrones] = useState([]);
  const [operators, setOperators] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    Promise.all([api.get("/missions"), api.get("/drones"), api.get("/users?role=operator")])
      .then(([mRes, dRes, oRes]) => {
        setMissions(mRes.data);
        setDrones(dRes.data);
        setOperators(oRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load missions"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { lat, lng, ...rest } = form;
      const payload = { ...rest };
      if (lat && lng) {
        payload.coordinates = { lat: Number(lat), lng: Number(lng) };
      }
      await api.post("/missions", payload);
      setForm(emptyForm);
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create mission");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/missions/${id}`, { status });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update mission status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this mission?")) return;
    try {
      await api.delete(`/missions/${id}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete mission");
    }
  };

  const fmt = (iso) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Mission Planning & Scheduling</h1>
          <p className="page-subtitle">Drone/operator double-booking is blocked automatically</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ New Mission"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form className="stacked-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input name="title" placeholder="Mission title" value={form.title} onChange={handleChange} required />
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="surveillance">Surveillance</option>
              <option value="agriculture">Agriculture</option>
              <option value="logistics">Logistics</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>
          <div className="form-row">
            <select name="assignedDrone" value={form.assignedDrone} onChange={handleChange} required>
              <option value="">Select drone</option>
              {drones.map((d) => <option key={d._id} value={d._id}>{d.droneId} — {d.model}</option>)}
            </select>
            <select name="assignedOperator" value={form.assignedOperator} onChange={handleChange} required>
              <option value="">Select operator</option>
              {operators.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <input name="location" placeholder="Location name (e.g. North Warehouse)" value={form.location} onChange={handleChange} />
          </div>
          <div className="form-row">
            <input name="lat" type="number" step="any" placeholder="Latitude (optional, e.g. 12.97)" value={form.lat} onChange={handleChange} />
            <input name="lng" type="number" step="any" placeholder="Longitude (optional, e.g. 80.24)" value={form.lng} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label className="mini-label">
              Start
              <input name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} required />
            </label>
            <label className="mini-label">
              End
              <input name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} required />
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Create Mission</button>
        </form>
      )}

      {loading ? (
        <div className="page-loading">Loading missions...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Mission</th>
              <th>Drone</th>
              <th>Operator</th>
              <th>Window</th>
              <th>Progress</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {missions.length === 0 && (
              <tr><td colSpan={7} className="empty-row">No missions yet. Create your first one above.</td></tr>
            )}
            {missions.map((m) => (
              <tr key={m._id}>
                <td>{m.title}<div className="table-subtext capitalize">{m.type}{m.location ? ` · ${m.location}` : ""}</div></td>
                <td>{m.assignedDrone?.droneId || "—"}</td>
                <td>{m.assignedOperator?.name || "—"}</td>
                <td className="table-subtext">{fmt(m.startTime)} → {fmt(m.endTime)}</td>
                <td>
                  {m.status === "active" ? (
                    <div className="progress-cell">
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${Math.round(m.progress || 0)}%` }} />
                      </div>
                      <span className="progress-label">{Math.round(m.progress || 0)}%</span>
                    </div>
                  ) : (
                    <span className="table-subtext">
                      {m.status === "completed" ? "100%" : "—"}
                    </span>
                  )}
                </td>
                <td>
                  <select value={m.status} onChange={(e) => handleStatusChange(m._id, e.target.value)} className={`status-select status-${m.status}`}>
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="aborted">Aborted</option>
                  </select>
                </td>
                <td>
                  <button className="btn btn-danger-outline" onClick={() => handleDelete(m._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

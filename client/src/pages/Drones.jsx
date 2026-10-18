import React, { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = { droneId: "", model: "", type: "surveillance", status: "available", lat: "", lng: "" };

export default function Drones() {
  const [drones, setDrones] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDrones = () => {
    setLoading(true);
    api
      .get("/drones")
      .then(({ data }) => setDrones(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load drones"))
      .finally(() => setLoading(false));
  };

  useEffect(loadDrones, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (drone) => {
    setEditingId(drone._id);
    setForm({
      droneId: drone.droneId,
      model: drone.model,
      type: drone.type,
      status: drone.status,
      lat: drone.currentLocation?.lat ?? "",
      lng: drone.currentLocation?.lng ?? "",
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { lat, lng, ...rest } = form;
      const payload = { ...rest };
      if (lat && lng) {
        payload.currentLocation = { lat: Number(lat), lng: Number(lng) };
      }
      if (editingId) {
        await api.put(`/drones/${editingId}`, payload);
      } else {
        await api.post("/drones", payload);
      }
      cancelForm();
      loadDrones();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editingId ? "update" : "create"} drone`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this drone? This cannot be undone.")) return;
    try {
      await api.delete(`/drones/${id}`);
      loadDrones();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete drone");
    }
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Drones</h1>
          <p className="page-subtitle">Fleet inventory and status</p>
        </div>
        <button className="btn btn-primary" onClick={() => (showForm ? cancelForm() : startAdd())}>
          {showForm ? "Cancel" : "+ Add Drone"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <form className="inline-form" onSubmit={handleSubmit}>
          <input name="droneId" placeholder="Drone ID (e.g. DRN-006)" value={form.droneId} onChange={handleChange} required />
          <input name="model" placeholder="Model (e.g. DJI Mavic 3E)" value={form.model} onChange={handleChange} required />
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="surveillance">Surveillance</option>
            <option value="agriculture">Agriculture</option>
            <option value="logistics">Logistics</option>
            <option value="inspection">Inspection</option>
          </select>
          {editingId && (
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="available">Available</option>
              <option value="in-mission">In Mission</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
          <input name="lat" type="number" step="any" placeholder="Latitude (optional, e.g. 12.97)" value={form.lat} onChange={handleChange} />
          <input name="lng" type="number" step="any" placeholder="Longitude (optional, e.g. 80.24)" value={form.lng} onChange={handleChange} />
          <button type="submit" className="btn btn-primary">{editingId ? "Update" : "Save"}</button>
        </form>
      )}

      {loading ? (
        <div className="page-loading">Loading drones...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Drone ID</th>
              <th>Model</th>
              <th>Type</th>
              <th>Status</th>
              <th>Battery</th>
              <th>Flight Hours</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {drones.length === 0 && (
              <tr><td colSpan={7} className="empty-row">No drones yet. Add your first one above.</td></tr>
            )}
            {drones.map((d) => (
              <tr key={d._id}>
                <td>{d.droneId}</td>
                <td>{d.model}</td>
                <td className="capitalize">{d.type}</td>
                <td><StatusBadge status={d.status} /></td>
                <td>{d.battery ? `${Math.round(d.battery.currentChargePercent)}%` : "—"}</td>
                <td>{d.totalFlightHours ?? 0} hrs</td>
                <td className="table-actions">
                  <button className="btn btn-edit-outline" onClick={() => startEdit(d)}>Edit</button>
                  <button className="btn btn-danger-outline" onClick={() => handleDelete(d._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

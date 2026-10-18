import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Operators() {
  const [operators, setOperators] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOperators = () => {
    setLoading(true);
    api
      .get("/users")
      .then(({ data }) => setOperators(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load operators"))
      .finally(() => setLoading(false));
  };

  useEffect(loadOperators, []);

  const handleAvailability = async (id, status) => {
    try {
      await api.put(`/users/${id}`, { status });
      loadOperators();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update availability");
    }
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Operator Management</h1>
          <p className="page-subtitle">Certifications, roles, and availability</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="page-loading">Loading operators...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Certifications</th>
              <th>Availability</th>
            </tr>
          </thead>
          <tbody>
            {operators.length === 0 && (
              <tr><td colSpan={5} className="empty-row">No operators yet. New sign-ups appear here.</td></tr>
            )}
            {operators.map((o) => (
              <tr key={o._id}>
                <td>{o.name}</td>
                <td>{o.email}</td>
                <td className="capitalize">{o.role}</td>
                <td className="table-subtext">{o.certifications?.length ? o.certifications.join(", ") : "—"}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => handleAvailability(o._id, e.target.value)}
                    className={`status-select status-${o.status}`}
                  >
                    <option value="available">Available</option>
                    <option value="on-mission">On Mission</option>
                    <option value="unavailable">Unavailable</option>
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

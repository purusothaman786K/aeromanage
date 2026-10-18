import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import api from "../services/api";

const makeDroneIcon = (color) =>
  L.divIcon({
    className: "",
    html: `
      <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <line x1="6" y1="6" x2="24" y2="24" stroke="${color}" stroke-width="2.5" />
        <line x1="24" y1="6" x2="6" y2="24" stroke="${color}" stroke-width="2.5" />
        <circle cx="6" cy="6" r="3.2" fill="${color}" opacity="0.85" />
        <circle cx="24" cy="6" r="3.2" fill="${color}" opacity="0.85" />
        <circle cx="6" cy="24" r="3.2" fill="${color}" opacity="0.85" />
        <circle cx="24" cy="24" r="3.2" fill="${color}" opacity="0.85" />
        <circle cx="15" cy="15" r="4.5" fill="${color}" stroke="white" stroke-width="1.5" />
      </svg>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

const makeSiteIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<div style="
      background:${color};
      width:14px;height:14px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:2px solid white;
      box-shadow:0 0 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 14],
  });

const droneIcons = {
  available: makeDroneIcon("#1c7293"),
  "in-mission": makeDroneIcon("#2f3c7e"),
  maintenance: makeDroneIcon("#b8860b"),
  inactive: makeDroneIcon("#888888"),
};

const missionIcon = makeSiteIcon("#c0392b");

const DEFAULT_CENTER = [12.95, 80.2];
const POLL_INTERVAL_MS = 4000;

export default function MapView() {
  const [drones, setDrones] = useState([]);
  const [missions, setMissions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDrones, setShowDrones] = useState(true);
  const [showMissions, setShowMissions] = useState(true);

  const loadData = () => {
    Promise.all([api.get("/drones"), api.get("/missions")])
      .then(([dRes, mRes]) => {
        setDrones(dRes.data);
        setMissions(mRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load map data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const dronesWithLocation = drones.filter((d) => d.currentLocation?.lat && d.currentLocation?.lng);
  const missionsWithLocation = missions.filter((m) => m.coordinates?.lat && m.coordinates?.lng);
  const activeFlightPaths = missions.filter(
    (m) => m.status === "active" && m.startLocation?.lat && m.coordinates?.lat
  );

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Fleet Map</h1>
          <p className="page-subtitle">Live drone locations and mission sites — updates automatically</p>
        </div>
        <div className="map-toggles">
          <label className="map-toggle">
            <input type="checkbox" checked={showDrones} onChange={(e) => setShowDrones(e.target.checked)} />
            Drones ({dronesWithLocation.length})
          </label>
          <label className="map-toggle">
            <input type="checkbox" checked={showMissions} onChange={(e) => setShowMissions(e.target.checked)} />
            Missions ({missionsWithLocation.length})
          </label>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="page-loading">Loading map...</div>
      ) : (
        <>
          <div className="map-wrapper">
            <MapContainer center={DEFAULT_CENTER} zoom={11} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {activeFlightPaths.map((m) => (
                <Polyline
                  key={`path-${m._id}`}
                  positions={[
                    [m.startLocation.lat, m.startLocation.lng],
                    [m.coordinates.lat, m.coordinates.lng],
                  ]}
                  pathOptions={{ color: "#2f3c7e", weight: 2, dashArray: "6 8", opacity: 0.7 }}
                />
              ))}

              {showDrones && dronesWithLocation.map((d) => (
                <Marker
                  key={d._id}
                  position={[d.currentLocation.lat, d.currentLocation.lng]}
                  icon={droneIcons[d.status] || droneIcons.available}
                >
                  <Popup>
                    <strong>{d.droneId}</strong> — {d.model}<br />
                    Type: {d.type}<br />
                    Status: {d.status}<br />
                    Battery: {d.battery ? `${Math.round(d.battery.currentChargePercent)}%` : "—"}
                  </Popup>
                </Marker>
              ))}

              {showMissions && missionsWithLocation.map((m) => (
                <Marker key={m._id} position={[m.coordinates.lat, m.coordinates.lng]} icon={missionIcon}>
                  <Popup>
                    <strong>{m.title}</strong><br />
                    Type: {m.type}<br />
                    Status: {m.status}<br />
                    {m.status === "active" && <>Progress: {Math.round(m.progress || 0)}%<br /></>}
                    Drone: {m.assignedDrone?.droneId || "—"}<br />
                    Operator: {m.assignedOperator?.name || "—"}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="map-legend">
            <span><i className="dot" style={{ background: "#1c7293" }}></i> Available</span>
            <span><i className="dot" style={{ background: "#2f3c7e" }}></i> In Mission</span>
            <span><i className="dot" style={{ background: "#b8860b" }}></i> Maintenance</span>
            <span><i className="dot" style={{ background: "#888888" }}></i> Inactive</span>
            <span><i className="dot" style={{ background: "#c0392b" }}></i> Mission Site</span>
          </div>

          {(drones.length > dronesWithLocation.length || missions.length > missionsWithLocation.length) && (
            <p className="map-hint">
              Some drones/missions don't have coordinates set yet, so they won't appear on the map.
              Add a location when creating or editing them to see them here.
            </p>
          )}
        </>
      )}
    </div>
  );
}

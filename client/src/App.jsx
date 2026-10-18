import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MapView from "./pages/MapView.jsx";
import Drones from "./pages/Drones.jsx";
import Batteries from "./pages/Batteries.jsx";
import Missions from "./pages/Missions.jsx";
import Maintenance from "./pages/Maintenance.jsx";
import Operators from "./pages/Operators.jsx";

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><AppLayout><MapView /></AppLayout></ProtectedRoute>} />
      <Route path="/drones" element={<ProtectedRoute><AppLayout><Drones /></AppLayout></ProtectedRoute>} />
      <Route path="/batteries" element={<ProtectedRoute><AppLayout><Batteries /></AppLayout></ProtectedRoute>} />
      <Route path="/missions" element={<ProtectedRoute><AppLayout><Missions /></AppLayout></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute><AppLayout><Maintenance /></AppLayout></ProtectedRoute>} />
      <Route path="/operators" element={<ProtectedRoute><AppLayout><Operators /></AppLayout></ProtectedRoute>} />
    </Routes>
  );
}

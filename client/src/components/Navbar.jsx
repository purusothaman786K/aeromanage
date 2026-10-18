import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/map", label: "Map" },
  { to: "/drones", label: "Drones" },
  { to: "/batteries", label: "Batteries" },
  { to: "/missions", label: "Missions" },
  { to: "/maintenance", label: "Maintenance" },
  { to: "/operators", label: "Operators" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">AeroManage</div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="sidebar-user-name">{user?.name}</div>
        <div className="sidebar-user-role">{user?.role}</div>
        <button className="btn btn-logout" onClick={handleLogout}>Log out</button>
      </div>
    </aside>
  );
}

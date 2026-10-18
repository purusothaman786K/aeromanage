require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const droneRoutes = require("./routes/droneRoutes");
const batteryRoutes = require("./routes/batteryRoutes");
const missionRoutes = require("./routes/missionRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { startSimulation } = require("./simulation");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "AeroManage API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/drones", droneRoutes);
app.use("/api/batteries", batteryRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`AeroManage server running on port ${PORT}`);
  });
  startSimulation();
};

start();

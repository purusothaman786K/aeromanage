// Populates the database with sample data so your demo isn't empty.
// Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const User = require("./models/User");
const Drone = require("./models/Drone");
const Battery = require("./models/Battery");
const Mission = require("./models/Mission");
const Maintenance = require("./models/Maintenance");

const seed = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Drone.deleteMany({}),
    Battery.deleteMany({}),
    Mission.deleteMany({}),
    Maintenance.deleteMany({}),
  ]);

  console.log("Creating users...");
  const admin = await User.create({
    name: "Admin User", email: "admin@aeromanage.com", password: "password123", role: "admin",
  });
  const operator1 = await User.create({
    name: "Ravi Kumar", email: "ravi@aeromanage.com", password: "password123", role: "operator",
    certifications: ["Part 107", "VTOL Certified"],
  });
  const operator2 = await User.create({
    name: "Priya Singh", email: "priya@aeromanage.com", password: "password123", role: "operator",
    certifications: ["Part 107"],
  });
  const technician = await User.create({
    name: "Arjun Nair", email: "arjun@aeromanage.com", password: "password123", role: "technician",
  });

  console.log("Creating drones and batteries...");
  const droneDefs = [
    { droneId: "DRN-001", model: "DJI Matrice 300", type: "surveillance", chargePercent: 85, health: 96 },
    { droneId: "DRN-002", model: "DJI Agras T40", type: "agriculture", chargePercent: 40, health: 88 },
    { droneId: "DRN-003", model: "Skydio X2", type: "inspection", chargePercent: 15, health: 74 },
    { droneId: "DRN-004", model: "Zipline P2", type: "logistics", chargePercent: 100, health: 99 },
    { droneId: "DRN-005", model: "DJI Mavic 3E", type: "surveillance", chargePercent: 60, health: 91 },
  ];

  const drones = [];
  for (const def of droneDefs) {
    const drone = await Drone.create({
      droneId: def.droneId,
      model: def.model,
      type: def.type,
      totalFlightHours: Math.floor(Math.random() * 200),
      purchaseDate: new Date("2024-01-15"),
    });
    const battery = await Battery.create({
      batteryCode: `BAT-${def.droneId}`,
      capacityMah: 5000,
      currentChargePercent: def.chargePercent,
      healthPercent: def.health,
      cycleCount: Math.floor(Math.random() * 150),
      drone: drone._id,
    });
    drone.battery = battery._id;
    await drone.save();
    drones.push(drone);
  }

  console.log("Creating missions...");
  const now = new Date();
  const inHours = (h) => new Date(now.getTime() + h * 60 * 60 * 1000);

  await Mission.create([
    {
      title: "Perimeter Surveillance - Sector A",
      type: "surveillance",
      assignedDrone: drones[0]._id,
      assignedOperator: operator1._id,
      location: "North Warehouse",
      startTime: inHours(2),
      endTime: inHours(4),
      status: "planned",
    },
    {
      title: "Crop Health Spray - Field 12",
      type: "agriculture",
      assignedDrone: drones[1]._id,
      assignedOperator: operator2._id,
      location: "Farm Block C",
      startTime: inHours(-3),
      endTime: inHours(-1),
      status: "completed",
    },
    {
      title: "Tower Inspection - Line 7",
      type: "inspection",
      assignedDrone: drones[2]._id,
      assignedOperator: operator1._id,
      location: "Transmission Tower 7",
      startTime: inHours(24),
      endTime: inHours(26),
      status: "planned",
    },
  ]);

  console.log("Creating maintenance records...");
  await Maintenance.create([
    {
      drone: drones[2]._id,
      type: "routine",
      scheduledDate: inHours(20),
      status: "due",
      technician: technician._id,
      notes: "Battery health below 80% - inspect connectors",
    },
    {
      drone: drones[3]._id,
      type: "inspection",
      scheduledDate: inHours(-48),
      status: "overdue",
      technician: technician._id,
      notes: "Quarterly inspection overdue",
    },
  ]);

  console.log("\nSeed complete! Sample login credentials:");
  console.log("  Admin:     admin@aeromanage.com / password123");
  console.log("  Operator:  ravi@aeromanage.com / password123");
  console.log("  Technician: arjun@aeromanage.com / password123");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

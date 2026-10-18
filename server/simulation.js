// Simulates live drone telemetry since we don't have real hardware.
// Every tick: active missions' drones step closer to their destination
// and their battery drains a little. This is what makes the Map page
// and Missions progress bars feel "live".

const Mission = require("./models/Mission");
const Drone = require("./models/Drone");
const Battery = require("./models/Battery");

const TICK_MS = 4000; // how often the simulator updates positions/battery
const PROGRESS_PER_TICK_MIN = 3;
const PROGRESS_PER_TICK_MAX = 7;
const BATTERY_DRAIN_MIN = 0.4;
const BATTERY_DRAIN_MAX = 1.2;

const lerp = (start, end, t) => start + (end - start) * t;

const runTick = async () => {
  try {
    const activeMissions = await Mission.find({ status: "active" });

    for (const mission of activeMissions) {
      const increment = PROGRESS_PER_TICK_MIN + Math.random() * (PROGRESS_PER_TICK_MAX - PROGRESS_PER_TICK_MIN);
      const newProgress = Math.min(100, (mission.progress || 0) + increment);
      mission.progress = newProgress;
      await mission.save();

      const hasPath = mission.startLocation?.lat && mission.startLocation?.lng && mission.coordinates?.lat && mission.coordinates?.lng;
      if (hasPath) {
        const t = newProgress / 100;
        const newLat = lerp(mission.startLocation.lat, mission.coordinates.lat, t);
        const newLng = lerp(mission.startLocation.lng, mission.coordinates.lng, t);
        await Drone.findByIdAndUpdate(mission.assignedDrone, {
          currentLocation: { lat: newLat, lng: newLng },
        });
      }

      const drone = await Drone.findById(mission.assignedDrone);
      if (drone?.battery) {
        const drain = BATTERY_DRAIN_MIN + Math.random() * (BATTERY_DRAIN_MAX - BATTERY_DRAIN_MIN);
        const battery = await Battery.findById(drone.battery);
        if (battery) {
          battery.currentChargePercent = Math.max(0, battery.currentChargePercent - drain);
          await battery.save();
        }
      }
    }
  } catch (err) {
    console.error("Simulation tick failed:", err.message);
  }
};

const startSimulation = () => {
  console.log(`Flight simulator started (tick every ${TICK_MS / 1000}s)`);
  setInterval(runTick, TICK_MS);
};

module.exports = { startSimulation };

# AeroManage — Centralized Drone Fleet Management System

A full-stack MERN application for managing drone missions, flight scheduling,
battery monitoring, maintenance tracking, and operator management.

## Tech Stack
- **Frontend:** React 18 + Vite, React Router, Axios
- **Backend:** Node.js + Express
- **Database:** MongoDB (Atlas or local) + Mongoose
- **Auth:** JWT + bcrypt, role-based access (admin / operator / technician)

## Project Structure
```
aeromanage/
├── server/     # Express API
└── client/     # React app (Vite)
```

---

## 1. Get a MongoDB connection string (5 min)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a free ("M0") cluster.
3. Under **Database Access**, create a user with a username/password.
4. Under **Network Access**, add IP `0.0.0.0/0` (allow from anywhere — fine for a student project).
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`

---

## 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and fill in:
```
MONGO_URI=mongodb+srv://<your-username>:<your-password>@cluster0.xxxxx.mongodb.net/aeromanage?retryWrites=true&w=majority
JWT_SECRET=any_long_random_string_here
```

Load sample demo data (drones, batteries, missions, operators):
```bash
npm run seed
```

Start the API server:
```bash
npm run dev
```
You should see: `AeroManage server running on port 5000`

Test it's alive: open `http://localhost:5000` in a browser — you should see
`{"message":"AeroManage API is running"}`.

---

## 3. Frontend Setup

Open a **second terminal**:

```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173`.

### Demo login (after running `npm run seed`)
| Role       | Email                  | Password    |
|------------|-------------------------|-------------|
| Admin      | admin@aeromanage.com    | password123 |
| Operator   | ravi@aeromanage.com     | password123 |
| Technician | arjun@aeromanage.com    | password123 |

---

## 4. What's implemented

- **Auth** — JWT login/register, role-based route protection
- **Drones** — CRUD, status tracking (available / in-mission / maintenance / inactive)
- **Batteries** — charge %, health %, cycle count, quick-update charge level
- **Missions** — create/assign/track, **automatic conflict detection** (a drone or
  operator cannot be double-booked for overlapping time windows — returns HTTP 409)
- **Maintenance** — log service records, due/in-progress/completed/overdue status
- **Operators** — profile list, certifications, availability toggle
- **Dashboard** — live fleet stats, mission counts, low-battery and overdue-maintenance alerts

## 5. Suggested next steps (good "future work" slide items)
- Real-time updates via Socket.io (push alerts instead of polling)
- node-cron job to auto-flag overdue maintenance daily
- File uploads for drone images / maintenance photos
- Calendar view (e.g. FullCalendar) for the Missions page
- Deploy: backend → Render/Railway, frontend → Vercel/Netlify, DB → MongoDB Atlas

## 6. Deployment quick notes
- Backend: set the same `.env` vars on your host; update `CLIENT_ORIGIN` to your deployed frontend URL.
- Frontend: set `VITE_API_URL` to your deployed backend's `/api` URL, then `npm run build` and deploy the `dist/` folder.

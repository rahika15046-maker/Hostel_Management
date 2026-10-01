# HostelX – Hostel Room Management System

College hostel room allocation portal. React + Express + MongoDB Atlas (Mongoose), JWT auth, two roles (`student`, `warden`).

## Features
- Warden: register/login, create rooms, dashboard stats (rooms, beds, occupied, available, full), occupancy ring, room table with residents, room detail modal, residents table.
- Student: register/login, browse/search/filter rooms, see bed-by-bed occupancy, book one bed, view assigned room and bed.
- Premium dark glass UI with CSS 3D (building scene on auth pages, tilted room cards, bed visualisation), skeleton loaders, toasts, empty/error states, responsive drawer nav, `prefers-reduced-motion` support.

## Structure
```
client/  React (Vite): src/{pages,Layout.jsx,ui.jsx,context.jsx,api.js,index.css}
server/  Express: models, controllers, routes, middleware, utils (concurrency test)
```

## MongoDB Atlas setup
1. Create a free cluster at cloud.mongodb.com, add a database user.
2. Network Access: allow your IP (and `0.0.0.0/0` for Render).
3. Connect → Drivers → copy the URI, put a database name in it (e.g. `.../hostelx?retryWrites=true`).

## Environment
`server/.env` (see `.env.example`): `PORT`, `MONGODB_URI`, `JWT_SECRET` (long random string), `CLIENT_URL` (comma-separated allowed origins).
`client/.env`: `VITE_API_URL` (e.g. `http://localhost:5000/api`).

## Run
```
cd server && npm install && cp .env.example .env   # fill in values
npm run dev
cd ../client && npm install && npm run dev        # http://localhost:5173
```

## API
| Method | Path | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/auth/me | any user |
| POST | /api/rooms | warden |
| GET | /api/rooms/stats | warden |
| GET | /api/rooms, /api/rooms/available, /api/rooms/:id | any user (residents included for warden only) |
| POST | /api/allocations/book `{roomId}` | student |
| GET | /api/allocations/me | student |
| GET | /api/allocations, /api/allocations/room/:roomId | warden |

Responses: `{ success, message, data }`. Status codes: 200/201/400/401/403/404/409/500.

## Booking logic and concurrency
1. Student identity comes from the JWT only.
2. Reject if the student already has an allocation (400); room missing (404).
3. **Atomic reservation**: one `findOneAndUpdate` with filter `$expr: occupiedBeds < totalBeds` and a pipeline update that increments `occupiedBeds` and recomputes `availableBeds`/`status`. MongoDB applies it atomically per document, so only one request can take the last bed (the other gets 409).
4. Lowest free bed number is chosen and inserted. Unique indexes `{room, bedNumber}` and `{student}` are the backstop: on a bed collision it retries the next free bed; on any failure the reservation is released.
5. Run `npm run test:concurrency` (in `server/`, API running) to race 8 students for 1 bed; it must print `PASS`.

## Deployment
- Backend on Render: root `server`, build `npm install`, start `npm start`; set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL).
- Frontend on Vercel: root `client`, build `npm run build`, output `dist`; set `VITE_API_URL` to `https://<render-app>/api`. Add a rewrite of all paths to `/index.html` for client-side routing.

## Screenshots
_Add screenshots here._

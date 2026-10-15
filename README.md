# GraphQL + React + TypeScript (full-stack)

Apollo Server v5 backend + Vite React frontend, MongoDB via Docker Compose (local) or Atlas.

## Prereqs

- Node.js >= 20.19, npm >= 10
- Docker Desktop with WSL integration enabled (for local MongoDB)

## Quick start

```sh
# 1. install all workspaces
npm install

# 2. configure backend env
cp backend/.env.example backend/.env

# 3. start everything (mongo + backend :4000 + frontend :5173)
npm run dev
```

- Optional demo account: `npm run seed --workspace=backend` (demo@example.com / password123)
- GraphQL: http://localhost:4000/graphql (health: `/health`)
- UI: http://localhost:5173 (login/register, then Events CRUD — per-user, JWT)
- Atlas instead of local: set `MONGODB_URI=mongodb+srv://...` in `backend/.env`
- For production, replace the example `JWT_SECRET` with a unique secret of at least 32 bytes.

## Layout

- `backend/src` — Express + Apollo Server v5, Mongoose `Event`/`User`, JWT auth, zod validation
- `frontend/src` — React 18 + TS + Apollo Client (`Auth`, `Events`)
- `docker-compose.yml` — local `mongo:8` with persisted volume

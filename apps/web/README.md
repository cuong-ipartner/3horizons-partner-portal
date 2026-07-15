# 3HORIZONS Partner Network — Web UI

Premium B2B partner ecosystem UI (problem-first, not marketplace).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router
- Lucide icons

## Run

```bash
cd apps/web
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Routes

### Workspace (login + dashboard shell)

| Page | Path |
|------|------|
| Login | `/login` |
| Dashboard | `/portal` |
| Tài liệu | `/portal/documents` |
| Huấn luyện | `/portal/training` |
| Dự án hợp tác | `/portal/projects` |
| Partner Network hub | `/portal/network` |
| Account | `/portal/account` (+ security, billing, activity, help) |

### Public Partner Network

| Page | Path |
|------|------|
| Overview | `/` |
| Find by Problem | `/problems`, `/problems/:slug` |
| Ecosystem Layers | `/layers`, `/layers/:slug` |
| Service Lines | `/services`, `/services/:slug` |
| Partner Directory | `/partners` |
| Partner Profile | `/partners/:slug` |
| Match Request | `/match` |
| Confirmation | `/match/confirmation` |
| My Requests | `/me/requests` |
| My Collaborations | `/me/collaborations` |
| Insights | `/insights` |
| Join as Partner | `/join` |

## Design notes

- Cream / espresso / terracotta palette aligned with 3HORIZONS premium B2B tone
- Problem-first CTAs; directory is secondary
- Match requests are governed (no direct hire)
- Seed content in `src/data/seed.ts`

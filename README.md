# PhoneNotify Dashboard

Next.js 15 admin dashboard for PhoneNotify (MaterialM template). Manages Android devices that forward notifications to the Laravel API.

## Features

- Admin auth (Sanctum email/password)
- Overview stats & charts
- Users CRUD
- Devices list + detail (permissions, battery, network, history)
- Map (Leaflet / OpenStreetMap) with latest locations & history
- Notifications & Errors tables with filters
- App versions manager (APK upload, activate, downloads)
- Public download pages at `/` and `/download`

## Config

```bash
NEXT_PUBLIC_API_BASE_URL=https://phonenotify.hi-team.ir/api/v1
```

## Local

```bash
npm install
npm run dev
# or
npm run build && npm start
```

## Docker (VPS)

Built via `/opt/apps/phonenotify/docker/dash.Dockerfile` and `phonenotify-dash` in docker-compose, exposed on `127.0.0.1:3212`.

---
# StockFlow — Neural Inventory System

> Sistem web për menaxhim inventari me multi-tenancy, 
> role-based access dhe përditësim automatik stoku.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://stockflow-ltnv.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/Artiola0406/StockFlow)

---

## Problemi që zgjidh
Bizneset e vogla menaxhojnë stokun me Excel — StockFlow e 
centralizon në një platformë me izolim të plotë të të dhënave 
për çdo biznes (multi-tenancy).

---

## Features
- Regjistrim biznesi me krijim automatik të ekipit (pronar + menaxher + staf)
- Multi-tenancy — çdo biznes sheh vetëm të dhënat e veta
- Role-based access — Super Admin, Menaxher, Staf
- Produkte me SKU auto-gjenerim
- Porosi me kontroll stoku + ulje automatike sasisë
- Lëvizje stoku IN/OUT
- Dashboard me statistika live
- Kërkim global (produkte, klientë, furnitorë, depo)
- Menaxhim ekipit

---

## Tech Stack

| Shtresa | Teknologji |
|---------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT (7 ditë), bcrypt |
| Deployment | Render (Web Service + PostgreSQL) |

---

## Architecture
StockFlow/
├── Backend/
│   └── src/
│       ├── routes/        # API endpoints (products, orders, auth...)
│       ├── middlewares/   # authenticate, tenantFilter, requirePermission
│       ├── config/        # database.js, auth.js (ROLE_PERMISSIONS)
│       ├── services/      # business logic
│       └── repositories/  # data access layer
├── web/
│   └── src/
│       ├── pages/         # React pages
│       ├── components/    # Layout, Sidebar, ProtectedRoute
│       ├── context/       # AuthContext, ThemeContext
│       └── lib/           # api.ts, hooks
└── docs/
└── demo-plan.md

---

## How Multi-tenancy Works
Every user has a `tenant_id` in their JWT token.
Every SQL query filters: `WHERE tenant_id = $1`
`tenantMiddleware.js` sets `req.tenantId` automatically on every request.

---

## Local Setup

### 1. Clone
```bash
git clone https://github.com/Artiola0406/StockFlow
cd StockFlow
```

### 2. Install
```bash
cd Backend && npm install
cd ../web && npm install
```

### 3. Environment — create Backend/.env
```env
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=your_strong_secret_key
PORT=5000
NODE_ENV=development
```

### 4. Run
```bash
# Terminal 1
cd Backend && npm start

# Terminal 2
cd web && npm run dev
```

Frontend: http://localhost:5173
Backend API: http://localhost:5000

---

## Deployment (Render)
- **Web Service:** Root dir `Backend`, build `npm install && cd ../web && npm install && npm run build`, start `npm start`
- **PostgreSQL:** Render managed database
- **Environment vars:** `DATABASE_URL`, `JWT_SECRET`, `PORT=5000`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Regjistro biznes + ekip |
| POST | /api/auth/login | Login + JWT |
| GET | /api/products | Produktet e tenant-it |
| POST | /api/orders | Krijo porosi + zbrit stok |
| GET | /api/dashboard/stats | Statistika tenant |
| GET | /api/search?q= | Kërkim global |

---

## Known Limitations
- Lejet janë hardcoded në frontend (AuthContext.tsx)
- Porosia dhe update stoku nuk janë në transaksion atomik
- Lidhja porosi-produkt bëhet me emër, jo me ID

---

*Studente: Artiola Qollaku*
*Universiteti "Isa Boletini" — Mitrovicë*
*Lënda: Software Engineering*

---

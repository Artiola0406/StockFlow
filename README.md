<div align="center">

![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![Project Type](https://img.shields.io/badge/Projekt-Akademik-blue?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React_%7C_Node_%7C_PostgreSQL-orange?style=flat-square)

</div>

# StockFlow — Sistem i menaxhimit të inventarit

**Aplikacion web shumë-klientësh (multi-tenant)** për produkte, depo, lëvizje stoku, furnitorë, klientë dhe porosi, me panel statistikash, kërkim dhe akses të kontrolluar sipas roleve.

---

## Përshkrimi i projektit

StockFlow centralizon inventarin dhe operacionet ditore të një biznesi: shtim dhe përditësim produktesh, gjurmim në depo, regjistrim lëvizjesh stoku, menaxhim furnitorësh dhe klientësh, si dhe **porosi që kontrollojnë stokun** dhe **përditësojnë automatikisht sasinë** e produktit pas shitjes (kur emri i produktit në porosi përputhet me produktin në databazë). Të dhënat janë **të ndara sipas biznesit** (`tenant_id`); çdo regjistrim i ri krijon një tenant dhe përdorues me role të ndryshme (pronar, menaxher, staf).

---

## Funksionalitetet kryesore

| Funksioni | Përshkrim |
|-----------|-----------|
| **Autentifikim** | Regjistrim biznesi, hyrje me JWT, sesion me `/api/auth/me` |
| **Produktet** | CRUD, SKU automatike nëse mungon, statistika stoku të ulët |
| **Depo & lëvizje stoku** | Depo dhe regjistrim lëvizjesh (hyrje/dalje) për tenant |
| **Furnitorë & klientë** | Menaxhim kontaktesh dhe të dhënash bazë |
| **Porosi** | Krijim porosish; refuzim nëse stoku nuk mjafton; ulje sasi pas porosisë |
| **Dashboard & raporte** | Statistika agregate; faqe raportesh me grafikë (nga të dhënat e produkteve) |
| **Kërkim** | Kërkim në produkte, klientë, furnitorë dhe depo brenda tenant-it |
| **Ekipi** | Pamje e përdoruesve të tenant-it; faqe opsionale “Përdoruesit” për operator platforme (e kufizuar në kod) |

Funksione **të planifikuara** (jo të implementuara plotësisht si produkt komercial): parashikim AI, faturim i plotë, njoftime automatike për stok minimal, audit i detajuar.

---

## Stivi teknologjik

| Shtresa | Teknologji |
|---------|------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, React Router, Chart.js (`web/`) |
| **Backend** | Node.js, Express (`Backend/src/`) |
| **Databaza** | PostgreSQL (`pg`) |
| **Siguria** | JWT, bcrypt për fjalëkalime |

Arkitektura: API REST nën `/api/*`; shumë rrugë përdorin `authenticate`, `tenantFilter` dhe query SQL me `tenant_id`. Frontend-i përdor `fetch` përmes `web/src/lib/api.ts`. Pas `npm run build` në `web/`, serveri Express mund të shërbejë statikisht SPA-në nga `web/dist` (`Backend/src/app.js`).

---

## Kërkesat

- Node.js 18+ (për Render rekomandohet Node 20, shih `render.yaml`)
- PostgreSQL (rekomanduar për të gjitha veçoritë)
- npm

---

## Si ta nisësh lokalisht

### 1. Instalimi

```bash
git clone https://github.com/Artiola0406/StockFlow.git
cd StockFlow
cd Backend && npm install
cd ../web && npm install
```

### 2. Databaza

Apliko skemat e projektit (p.sh. `Backend/src/database/schema.sql` dhe skriptet përkatëse sipas mjedisit tënd).

### 3. Variablat e mjedisit — Backend

Krijo `Backend/.env` (shih `Backend/.env.example`):

| Variabla | Përshkrim |
|----------|-----------|
| `DATABASE_URL` | Connection string për PostgreSQL |
| `JWT_SECRET` | Sekret i fortë për nënshkrimin e JWT (i detyrueshëm për login/regjistrim në rrugët që përdorin `getJwtSecret`) |
| `PORT` | Opsionale; nëse mungon, përdoret **5000** (`Backend/src/app.js`) |

### 4. Nisja e backend-it

```bash
cd Backend
npm start
```

API: `http://localhost:5000`

### 5. Nisja e frontend-it (zhvillim)

```bash
cd web
npm run dev
```

Vite përdor **proxy** për `/api` drejt `http://localhost:5000` (`web/vite.config.ts`). Hap URL-në që shfaq Vite (zakonisht `http://localhost:5173`).

### 6. Një server për prodhim lokal

```bash
cd web && npm run build
cd ../Backend && npm start
```

Express shërben `web/dist` nëse ekziston.

---

## Variablat e mjedisit (përmbledhje)

**Backend (`Backend/.env`):**

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
JWT_SECRET=ndrysho-me-nje-sekret-te-forte
PORT=5000
```

**Frontend:** zakonisht nuk nevojitet `.env` për API — përdoret rruga relative `/api` me proxy në dev dhe i njëjti origjinë kur SPA shërbehet nga Express.

---

## Deploy në Render

Projekti përfshin `render.yaml`:

- **Root Directory:** `Backend`
- **Build Command:** `npm install && cd ../web && npm install --include=dev && npm run build`
- **Start Command:** `npm start`

Në panelin e Render shto: `DATABASE_URL`, `JWT_SECRET`, dhe `NODE_VERSION` (p.sh. `20`).

---

## Struktura e shkurtër e projektit

```
StockFlow/
├── Backend/src/       # Express, routes, middlewares, services, repositories
├── web/src/           # Aplikacioni kryesor React (UI)
├── Database/          # Skripta SQL ndihmëse
├── Docs/              # Dokumentim shtesë (përfshi `demo-plan.md` për prezantimin)
├── Frontend/          # Prototip statik (jo SPA kryesore)
└── render.yaml        # Blueprint për Render
```

---

## Shënime për zhvilluesit

- Aplikacioni kryesor i përdoruesit është në **`web/`**; dosja **`Frontend/`** përmban një prototip më të vjetër HTML/Bootstrap.
- Lejet në API përcaktohen në `Backend/src/config/auth.js`; UI përdor gjithashtu rregulla lokale në `web/src/context/AuthContext.tsx` — duhet mbajtur konsistenca kur ndryshohen rolet.

---

## Autori

| | |
|---|--|
| **Emri** | Artiola Qollaku |
| **Universiteti** | Universiteti "Isa Boletini" — Mitrovicë |
| **Fakulteti** | Fakulteti i Inxhinierisë Kompjuterike |
| **Lënda** | Inxhinieri Softuerike |
| **GitHub** | [Artiola0406](https://github.com/Artiola0406) |

---

## Licenca / përdorim akademik

© 2026 Artiola Qollaku. Projekti është krijuar për qëllime akademike.

---

## Pamje nga aplikacioni

_Shto këtu screenshot-e: hyrja, paneli, produktet, porositë, ekipi._

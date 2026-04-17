
<div align="center">

![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![Project Type](https://img.shields.io/badge/Project-Academic-blue?style=flat-square)
![Architecture](https://img.shields.io/badge/Architecture-Clean_Architecture-orange?style=flat-square)
![Pattern](https://img.shields.io/badge/Pattern-Repository-purple?style=flat-square)

</div>

#  StockFlow - Sistem i Menaxhimit të Inventarit

<p align="center">
  <strong>Një sistem web për menaxhimin e inventarit me React, Node.js dhe PostgreSQL.</strong>
</p>

<br>

  Përshkrimi i Projektit

StockFlow është një sistem i menaxhimit të inventarit i ndërtuar si aplikacion web me React.js, Node.js dhe PostgreSQL. Sistemi ofron menaxhim të produkteve, depove, lëvizjeve të stokut, furnitorëve, porosive dhe klientëve me kontroll bazuar në role.

Sistemi ndjek Clean Architecture me Repository Pattern, duke ofruar ndarje të qartë midis shtresave të biznesit, aksesit të të dhënave dhe prezantimit. Përfshin autentifikim JWT me tre role (Administrator, Menaxher, Staf) dhe kontroll të detajuar të aksesit.

<br>

  Teknologjitë e Përdorura

| Sektori            | Teknologjitë               |
| ------------------ | -------------------------- |
|   Frontend        |  React · TypeScript · Tailwind CSS |
|   Backend         |  Node.js · Express.js  |
|  Database       |  PostgreSQL (me CSV fallback)              |
|  Version Control |  Git                     |

<br>

  Funksionalitetet Kryesore

*  Autentifikim i Sigurt: JWT dhe 3 role të ndryshme (Administrator, Menaxher, Staf)
*  Menaxhim Produktesh: Menaxhim i detajuar me kategori dhe çmime
*  Multi-Warehouse: Kontroll i stokut në shumë depo
*  Lëvizjet e Stokut: Regjistrim i hyrjeve, daljeve dhe transfereve
*  Menaxhim Furnitorësh dhe Klientësh
*  Menaxhim Porosish: Porosi blerje dhe shitje
*  Dashboard me statistika bazë
*  Kontroll i aksesit bazuar në role

<br>

  Planifikuar për të Ardhmen (Jo i implementuar)

*  Smart Restock Prediction (AI-powered)
*  Sistem i plotë faturash dhe pagesash
*  Audit logging i detajuar
*  Njoftime automatike për stok minimal
*  Raporte të avancuara

<br>

##  Getting Started (Nisja e Shpejtë)

### Kërkesat e Sistemit
- Node.js 16+
- PostgreSQL 12+ (opsionale, përdoret CSV si fallback)
- npm ose yarn

### Instalimi dhe Konfigurimi

1. **Klononi projektin**
```bash
git clone https://github.com/Artiola0406/StockFlow.git
cd StockFlow
```

2. **Instaloni varësitë e backend**
```bash
cd Backend
npm install
```

3. **Konfiguroni databazën**
```bash
# Opsioni 1: PostgreSQL (rekomanduar)
# Vendosni DATABASE_URL në .env
DATABASE_URL=postgresql://username:password@localhost:5432/stockflow

# Opsioni 2: CSV fallback (përdoret automatikisht pa DATABASE_URL)
```

4. **Krijoni tabelat (nëse përdorni PostgreSQL)**
```bash
# Ekzekutoni skriptet në Database/ folder
psql -d stockflow -f Database/schema.sql
```

5. **Nisni backend**
```bash
cd Backend
npm start
# Ose për development:
npm run dev
```

6. **Instaloni dhe nisni frontend**
```bash
cd web
npm install
npm run dev
```

7. **Hapni aplikacionin**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Variablat e Mjedisit (Environment Variables)

**Backend (.env)**
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/stockflow
JWT_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=development
```

**Frontend (.env)**
```bash
VITE_API_URL=http://localhost:3000
```

### Struktura e Projektit

```bash
StockFlow/
  Backend/                    - Node.js API server
    src/
      config/                - Konfigurimi (auth, database)
      routes/                - API endpoints
      services/              - Biznes logic
      repositories/          - Data access layer
      middlewares/           - Express middleware
  web/                       - React frontend (zyrtare)
    src/
      components/            - React components
      context/              - Auth context
      lib/                  - API client
      pages/                - Faqet e aplikacionit
  Database/                  - SQL schema files
  Docs/                      - Dokumentimi
```

<br>

  Autori

|              |                                                                  |
| :----------- | :--------------------------------------------------------------- |
| Emri         | Artiola Qollaku                                                  |
| Universiteti | Universiteti "Isa Boletini" - Mitrovicë                          |
| Fakulteti    | Fakulteti i Inxhinierisë Kompjuterike                            |
| Lënda        | Inxhinieri Softuerike                                            |
| GitHub       | [https://github.com/Artiola0406](https://github.com/Artiola0406) |
| Email        | [artiola.qollaku@umib.net](mailto:artiola.qollaku@umib.net)      |

<br>

 2026 Artiola Qollaku. Ky projekt është krijuar për qëllime akademike si pjesë e lëndës Inxhinieri Softuerike.

---
# Plani i Demonstrimit — StockFlow

## 1. Titulli i projektit
**StockFlow** — Sistem web për menaxhim inventari dhe operacionesh
me multi-tenancy, role-based access, dhe përditësim automatik stoku.

**Live URL:** https://stockflow-ltnv.onrender.com
**GitHub:** https://github.com/Artiola0406/StockFlow

---

## 2. Problemi që zgjidh
Bizneset e vogla menaxhojnë stokun me Excel ose metoda të 
shpërndara — kjo shkakton:
- Gabime në sasi produktesh
- Porosi pa kontroll disponueshmërie
- Mungesë pamjeje të përgjithshme për biznesin

**StockFlow e zgjidh duke:**
- Centralizuar produktet dhe sasinë në një platformë
- Kontrolluar stokun para çdo porosie (nëse nuk mjafton → gabim 400)
- Zbritur automatikisht sasinë pas shitjes
- Izoluar të dhënat për çdo biznes (multi-tenancy)

---

## 3. Përdoruesit kryesorë

| Roli | Përshkrimi | Aksesi |
|------|------------|--------|
| **Pronari (Super Admin)** | Regjistron biznesin, menaxhon gjithçka | Full access |
| **Menaxheri** | Menaxhon produktet, porositë, klientët | Pa fshirje |
| **Stafi** | Regjistron lëvizje, shikon produkte | Akses i kufizuar |

Kur një biznes regjistrohet, sistemi krijon automatikisht 
të tre llogaritë — pronari, menaxheri dhe stafi.

---

## 4. Flow-i që do ta demonstrojmë

**Flow i zgjedhur:** Regjistrim → Login → Produkt → Porosi → Stoku

**Pse ky flow:**
Tregon të gjithë ciklin kryesor të aplikacionit në 4 minuta:
nga krijimi i biznesit, deri tek efekti automatik i një shitjeje
në inventar. Përfshin autentifikim, CRUD, dhe logjikë biznesi.

**Hapat e saktë:**

| # | Veprimi | URL | Backend |
|---|---------|-----|---------|
| 1 | Regjistro biznes të ri | /register | POST /api/auth/register |
| 2 | Shiko kredencialet e ekipit | /register (success screen) | — |
| 3 | Kyçu si pronar | /login | POST /api/auth/login |
| 4 | Shiko Dashboard — statistikat | /dashboard | GET /api/dashboard/stats |
| 5 | Shto produkt (SKU auto) | /products | POST /api/products |
| 6 | Shto klient | /customers | POST /api/customers |
| 7 | Krijo porosi | /orders | POST /api/orders |
| 8 | Verifiko stokun e ri | /products | GET /api/products |

---

## 5. Një problem real që e kemi zgjidhur

### Problemi: Të gjithë përdoruesit shihnin të dhënat e njëri-tjetrit

**Ku ishte problemi:**
- Backend-i nuk filtronte të dhënat sipas biznesit
- Frontend-i ruante të dhënat në localStorage pa izolim
- Regjistrimi vendoste të gjithë përdoruesit në tenant_id = 1

**Si u zgjidh:**

**Hapi 1 — Çdo regjistrim krijon tenant unik:**
```javascript
// Backend/src/routes/authRoutes.js
const tenantId = 'tenant-' + Date.now()
await pool.query(
  'INSERT INTO tenants (id, name, slug, ...) VALUES ($1, $2, $3, ...)',
  [tenantId, businessName, slug, ...]
)
```

**Hapi 2 — tenant_id përfshihet në JWT:**
```javascript
const token = jwt.sign(
  { id, email, role, user_role, tenant_id: tenantId },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)
```

**Hapi 3 — Çdo query SQL filtron sipas tenant:**
```javascript
// Backend/src/routes/productRoutes.js
const tenantId = req.user.tenant_id || 'tenant-default'
SELECT * FROM products WHERE tenant_id = $1
```

**Hapi 4 — tenantMiddleware vendos tenant automatikisht:**
```javascript
// Backend/src/middlewares/tenantMiddleware.js
req.tenantId = req.user.tenant_id
```

**Rezultati:** Çdo biznes sheh vetëm të dhënat e veta.
E verifikueshme live: regjistro dy biznese → secili sheh vetëm produktet e veta.

---

## 6. Çka mbetet ende e dobët

**1. Lejet janë hardcoded në frontend**
- Problemi: `ROLE_PERMISSIONS` në `AuthContext.tsx` është kopje lokale
- Idealisht: GET /api/auth/me do të kthente listën e lejeve nga serveri

**2. Transaksioni SQL nuk është atomik**
- Problemi: INSERT porosia dhe UPDATE stoku janë dy hapa të veçantë
- Rreziku: nëse dështon UPDATE, porosia ekziston pa zbritje stoku
- Zgjidhja ideale: BEGIN/COMMIT transaction

**3. Lidhja porosi-produkt me emër**
- Bëhet me `product_name` (tekst), jo me `product_id`
- Emra të njëjtë ose gabime shtypi mund të shkaktojnë probleme

---

## 7. Struktura e prezantimit (5–6 minuta)

| Koha | Seksioni | Përmbajtja |
|------|----------|------------|
| 0:00–0:45 | **Hyrja** | Çfarë është StockFlow, problemi real i biznesit |
| 0:45–1:30 | **Stack teknik** | React, Node.js, PostgreSQL, JWT, Render, multi-tenancy |
| 1:30–3:30 | **DEMO LIVE** | Regjistrim → Login → Produkt → Porosi → Stoku |
| 3:30–4:30 | **Problemi teknik** | Multi-tenancy izolimi — si u zgjidh |
| 4:30–5:15 | **Kufizimet** | 3 gjëra që do të përmirësohen |
| 5:15–5:45 | **Mbyllja** | Vlera e projektit + pyetje |

---

## 8. PLAN B — Nëse diçka nuk funksionon live

### Skenari 1: Render është i ngadalshëm (cold start)
**Veprimi:** Hap aplikacionin 10 minuta para prezantimit.
**Fjalia:** *"Render free tier ka cold start — e kam hapur 
paraprakisht për ta ngrohur serverin."*

### Skenari 2: Login nuk funksionon
**Veprimi:** Shfaq screenshot-in e dashboard-it.
**Fjalia:** *"Po kaloj te screenshot-et e ruajtura — 
flow-i është dokumentuar hap pas hapi."*
**Backup:** Screenshot i dashboard-it me të dhëna reale.

### Skenari 3: Produkti nuk ruhet
**Veprimi:** Shfaq screenshot-in e listës me produkte.
**Fjalia:** *"Logjika ekziston në productRoutes.js — 
e kemi testuar dhe dokumentuar në README."*

### Skenari 4: Porosi nuk krijohet
**Veprimi:** Shfaq screenshot-in e porosisë së krijuar.
**Fjalia:** *"Kontrolli i stokut dhe zbritja automatike 
janë në orderRoutes.js rreshtat 58-105 — mund ta 
tregoj direkt në kod."*

### Skenari 5: Interneti nuk funksionon
**Veprimi:** Hap video backup 30 sekondash.
**Backup:** Video e shkurtër e flow-it kryesor e 
regjistruar paraprakisht.

### Screenshot-et e ruajtura (Plan B materials):
- [ ] Dashboard me statistika
- [ ] Lista e produkteve me SKU
- [ ] Formulari i porosisë me dropdown
- [ ] Produkti para porosisë (sasia=100)
- [ ] Produkti pas porosisë (sasia=70)
- [ ] Ekrani i regjistrimit me kredencialet e ekipit
- [ ] Faqja "Ekipi im" me të tre rolet

---

## 9. Checklist para prezantimit

- [ ] Hap Render 10 minuta para (cold start)
- [ ] Kyçu me llogarinë demo paraprakisht
- [ ] Ke hapur tab-et: /login, /products, /orders, /customers
- [ ] Ke kredencialet demo të gatshme
- [ ] Screenshot-et janë në desktop
- [ ] Video backup është e gatshme
- [ ] Ke praktikuar flow-in një herë me kohëmatës

---

*Projekti: StockFlow | Studente: Artiola Qollaku*
*Universiteti "Isa Boletini" — Mitrovicë*
*Lënda: Software Engineering*

---

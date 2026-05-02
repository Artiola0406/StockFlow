# Plani i demonstrimit — StockFlow

Dokument për prezantimin e projektit (kurs / provim), në përputhje me kërkesat e profesorit.

---

## Titulli i projektit

**StockFlow** — sistem web për menaxhim inventari dhe operacionesh (produkte, depo, lëvizje stoku, furnitorë, klientë, porosi) me **ndarje të të dhënave sipas biznesit (multi-tenant)** dhe **kontroll aksesi me role** (JWT + leje për çdo modul API).

---

## Problemi që zgjidh

Bizneset e vogla dhe të mesme shpesh mbajnë stokun në Excel ose në disa burime të ndara, çka shkakton gabime në sasi, vështirësi në gjurmimin e shitjeve dhe mungesë të një pamjeje të përbashkët. StockFlow:

- **Centralizon** produktet dhe sasinë në një vend (`web/src/pages/ProductsPage.tsx` → `GET/POST /api/products`, `Backend/src/routes/productRoutes.js`).
- Lejon **porosi** me **kontroll disponueshmërie** para se të ruhet porosia (`Backend/src/routes/orderRoutes.js`, rreshtat ~58–70): nëse stoku nuk mjafton, kthehet gabim `400` me mesazh të qartë.
- Pas krijimit të porosisë, **përditësohet automatikisht** fusha `quantity` e produktit kur emri i produktit në porosi përputhet me një produkt të tenant-it (i njëjti file, rreshtat ~88–105).
- Ofron **panel statistikash** për tenant (`Backend/src/routes/dashboardRoutes.js`, `web/src/pages/DashboardPage.tsx`) dhe **kërkim** brenda të dhënave të biznesit (`Backend/src/routes/searchRoutes.js`).

---

## Përdoruesit kryesorë

1. **Pronari / administratori i biznesit** — regjistron biznesin në `web/src/pages/RegisterPage.tsx`; backend-i krijon tenant dhe përdorues në `Backend/src/routes/authRoutes.js` (`POST /register`). Hyn si `super_admin` në kuptimin e tenant-it (jo domosdoshmërisht operator i gjithë platformës).
2. **Menaxheri dhe stafi** — llogari të krijuara gjatë regjistrimit (email sintetik `menaxher<slug>@stockflow.com` dhe `staf<slug>@stockflow.com` në kod). Lejet ndahen sipas `ROLE_PERMISSIONS` në `Backend/src/config/auth.js` dhe në UI përmes `hasPermission` në `web/src/context/AuthContext.tsx` dhe filtrit të navigimit në `web/src/components/layout/Sidebar.tsx`.
3. **Operatori i platformës (opsional në demo)** — faqja “Përdoruesit” (`web/src/pages/PerdoruesitPage.tsx`) thërret `GET /api/users/all` (`Backend/src/routes/userRoutes.js`), e cila në kod lejon akses vetëm për përdorues me `tenant_id === 'tenant-artiola'` dhe rol të përshtatshëm (`web/src/lib/platformAdmin.ts`).

---

## Flow-i që do ta demonstrojmë (live)

| Hapi | Veprimi | Ku në kod |
|------|---------|-----------|
| 1 | Regjistrim biznesi: emër, email, fjalëkalim, emër biznesi | `RegisterPage.tsx` → `POST /api/auth/register` |
| 2 | Ruajtja e kredencialeve të ekipit (sipas përgjigjes së serverit) dhe hyrje | `LoginPage.tsx` → `POST /api/auth/login` |
| 3 | Shtim produkti me sasi dhe çmim | `ProductsPage.tsx` → `POST /api/products` |
| 4 | Verifikim në listë dhe në dashboard | `GET /api/products`, `GET /api/dashboard/stats` |
| 5 | Krijim porosie: zgjedhje klienti dhe produkti, sasi | `OrdersPage.tsx` → `POST /api/orders` |
| 6 | Verifikim që **sasia e produktit** është ulur dhe që porosia shfaqet në listë | `ProductsPage` / `OrdersPage`, `orderRoutes.js` |

Nëse kohë: **kërkim** në shiritin e kërkimit (përdor `GET /api/search?q=...`) dhe faqja **Ekipi im** (`GET /api/tenants/users`).

---

## Një problem real që e kemi zgjidhur

**Trajtimi i gabimeve në klientin HTTP** në `web/src/lib/api.ts`:

- **Problemi:** Përgjigjet jo-JSON (p.sh. faqe gabimi HTML nga proxy) ose përgjigje gabimi pa strukturë të pritshme mund të shkaktonin sjellje të keqe ose mesazhe të paqarta për përdoruesin.
- **Zgjidhja:** Funksioni `handleResponse` kontrollon `res.ok`, përpiqet të lexojë `message` ose `error` nga JSON, përndryshe një pjesë të tekstit të përgjigjes; për statusin `401` pastron sesionin dhe ridrejton te faqja e hyrjes. Kjo është përshkruar edhe në `Docs/improvement-report.md` (seksioni për API client).

**Alternativë për t’u përmendur në gojë:** kontrolli i stokut para insert-it të porosisë dhe zbritja e sasisë pas saj në `Backend/src/routes/orderRoutes.js`.

---

## Çka mbetet ende e dobët

- **Lejet në UI** janë ende të përkthyera nga `ROLE_PERMISSIONS` lokale në `AuthContext.tsx`, ndërsa `GET /api/auth/me` kthen `permissions: []` — idealisht burimi i vetëm i lejeve do të ishte serveri, për të shmangur desinkronizimin me backend.
- **Transaksioni SQL:** insert i porosisë dhe `UPDATE` i `products.quantity` nuk janë në një `BEGIN/COMMIT` të vetëm — në skenarë të rrallë dështimi midis dy hapave mund të lërë të dhëna të papërshtatshme.
- **Lidhja porosi–produkt** bëhet me **emër produkti** (`product_name`), jo me ID — emra të dyfishtë ose gabime shtypi e bëjnë më të brishtë.
- **Regjistrimi:** fjalëkalimet e menaxherit/stafit janë të parashikueshme sipas modelit në kod (`...2024!`) — e pranueshme për akademi, jo për prodhim.
- **“Përdoruesit” globalë** varen nga një `tenant_id` i ngurtë në kod (`userRoutes.js` / `platformAdmin.ts`).
- Ekziston një **prototip i vjetër** në `Frontend/index.html` — nuk është aplikacioni kryesor; demo duhet bërë me projektin në `web/`.

---

## Struktura e prezantimit (5–7 minuta)

| Kohë | Përmbajtje |
|------|------------|
| **0:00 – 0:45** | Çfarë është StockFlow; problemi i biznesit (inventar i shpërndarë vs sistem i centralizuar). |
| **0:45 – 1:30** | Stivi: React + Vite, Node/Express, PostgreSQL, JWT; shkurt multi-tenancy (`tenant_id`, `tenantMiddleware.js`). |
| **1:30 – 3:30** | **Demo live:** regjistrim ose login → shtim produkti → krijim porosi → trego që stoku ka rënë dhe porosia është në listë. |
| **3:30 – 4:45** | Një problem teknik i zgjidhur: `handleResponse` në `api.ts` (ose kontrolli i stokut në `orderRoutes.js`). |
| **4:45 – 5:45** | Kufizimet: lejet në frontend, transaksioni, lidhja me emër produkti. |
| **5:45 – 7:00** | Pyetje nga auditori / profesori. |

---

*Dokumenti u përditësua për përputhje me kodin në repo (routes, faqet React, middleware).*

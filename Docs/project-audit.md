# Project Audit

## 1. Përshkrimi i shkurtër i projektit

**Çka bën sistemi?**  
StockFlow është një aplikacion web për menaxhim inventari: produkte me SKU, çmim dhe sasi, depo (warehouses), furnitorë, klientë, porosi dhe lëvizje stoku (hyrje/dalje/transfer). Ka një dashboard dhe një faqe raportesh që kryesisht përdor të dhënat e produkteve për statistika/grafikë. Backend-i është Node.js me Express, dhe të dhënat ruhen në PostgreSQL kur ekziston `DATABASE_URL`, përndryshe disa module mund të bien mbrapsht te ruajtja me CSV (p.sh. produktet).

**Kush janë përdoruesit kryesorë?**  
Përdoruesit janë stafi i brendshëm i një organizate që punon me stok: administrator, menaxher dhe staf, me leje të ndryshme (faqet që shohin në UI dhe endpoint-et `/api/...` kontrollohen me JWT dhe lista e lejeve në `Backend/src/config/auth.js`).

**Cili është funksionaliteti kryesor?**  
Kyçja me email/fjalëkalim, menaxhimi CRUD i entiteteve kryesore përmes API-së dhe React UI (`web/`), plus kontrolli i aksesit sipas rolit (p.sh. faqja e përdoruesve duket e kufizuar për administrator).

---

## 2. Çka funksionon mirë?

1. **Ndarja e përgjegjësive në backend** — Rrugët (`routes/`) janë të holla dhe delegojnë te `services/`, ndërsa aksesi i të dhënave kalon te `repositories/` (dhe ka edhe `IRepository` si ide për kontratë). Kjo e bën më të lehtë kuptimin e “ku ndodh logjika” vs “si lexohen të dhënat”.

2. **Autentifikimi dhe autorizimi janë të lidhura me rolin** — Middleware `authenticate` + `requirePermission('products' | 'orders' | ...)` në `app.js` e mbroj API-n në nivel endpoint-esh, dhe në frontend `ProtectedRoute` + `hasPermission` e përputhin këtë logjikë me faqet.

3. **Ka teste të synuara për një shërbim kritik** — `Backend/tests/ProductService.test.js` përdor një repository mock dhe teston raste si input i pavlefshëm (emër bosh, çmim 0, etj.). Kjo është fillim i mirë, por ndërgjegjësohem që mbulimi është shumë i kufizuar.

---

## 3. Dobësitë e projektit

1. **Dokumentimi nuk përputhet me kodin real** — Në `Docs/architecture.md` përmenden një shtresë `controllers/` dhe përdorimi i Axios në frontend, por në repo nuk ka folder `controllers` dhe `web/src/lib/api.ts` përdor `fetch`. Kjo e ngatërron dikë që lexon dokumentin për të kuptuar strukturën aktuale.

2. **README është shumë “marketing” krahasuar me implementimin** — README përmend module si AI prediction, fatura/pagesa, auditim i plotë, etj. Në kodin që kam parë, aplikacioni React mbulon kryesisht CRUD + raporte të bazuara te produktet; kjo krijon pritje që nuk përputhen me repo-n.

3. **Testet janë pothuajse vetëm për `ProductService`** — Për `OrderService`, `WarehouseService`, auth, routes, etj. nuk ka të njëjtin nivel testesh, prandaj regresionet në pjesë të tjera janë më të lehta të kalojnë pa u vënë re.

4. **Trajtimi i gabimeve në `api.ts` është i dobët për përgjigje jo-JSON** — `handleJson` thërret `res.json()` pa kontrolluar `res.ok` dhe pa `try/catch`; nëse serveri kthen HTML (p.sh. 502 nga proxy) ose trup bosh, klienti mund të thyhet ose të sillet në mënyrë të çuditshme.

5. **Konfigurimi i sigurisë ka një fallback të diskutueshëm** — Në `Backend/src/config/auth.js`, nëse mungon `JWT_SECRET` në environment, përdoret një string default në kod. Në prod kjo është rrezik sepse token-at mund të falsifikohen nëse dikush e di default-in ose nëse repo ekspozohet.

6. **Lejet e roleve janë të duplikuara** — `ROLE_PERMISSIONS` ekziston edhe në backend (`config/auth.js`) edhe në frontend (`AuthContext.tsx`). Nëse ndryshon njëra dhe harron tjetrën, UI dhe API nuk përputhen më (p.sh. një faqe duket e lejuar por API kthen 403, ose e kundërta).

7. **Dy rrugë UI në të njëjtin server** — `Backend/src/app.js` ose shërben `web/dist` (React build) ose statikisht `Frontend/src/pages` me HTML të vjetër. Kjo e bën projektin më të vështirë për t’u kuptuar: “cili është frontend-i ‘zyrtar’?” dhe rrit rrezikun e konfuzionit gjatë zhvillimit.

---

## 4. 3 përmirësime që do t’i implementoj

### Improvement 1
- **Problemi:** Dokumentimi (`Docs/architecture.md`) dhe README përshkruajnë një arkitekturë dhe funksionalitet që nuk përputhen plotësisht me strukturën reale (pa controllers, fetch jo axios, etj.).
- **Zgjidhja:** Përditësoj `architecture.md` dhe një seksion të shkurtër në README që pasqyrojë saktësisht shtresat aktuale (Express routes → services → repositories), si lidhet `web/` me API, dhe çka është realisht në scope (pa pretendime për module që nuk janë në kod).
- **Pse ka rëndësi:** Dokumenti i saktë është “kontrata” mes ekipit dhe vetes suaj pas 2 javësh; ndryshe humbet koha duke kërkuar file që nuk ekzistojnë ose duke pritur feature që nuk janë implementuar.

### Improvement 2
- **Problemi:** `web/src/lib/api.ts` nuk trajton mirë përgjigjet e gabuara (status jo-sukses, trup jo-JSON), dhe përdoruesi shpesh sheh mesazhe të përgjithshme si “Serveri nuk është aktiv” edhe kur problemi është 403/500 me JSON.
- **Zgjidhja:** Shtoj kontroll `if (!res.ok)` lexoj `text()`/`json()` në mënyrë të sigurt, dhe propozoj një format të qëndrueshëm gabimesh (`success`, `message`) që UI ta shfaqë më qartë.
- **Pse ka rëndësi:** Reliability në frontend nuk është vetëm “UI i bukur”; është që aplikacioni të mos thyhet papritur dhe që gabimet të jenë të lexueshme për debug dhe për përdoruesin.

### Improvement 3
- **Problemi:** `ROLE_PERMISSIONS` është i duplikuar mes backend dhe frontend, që rrit rrezikun e desinkronizimit.
- **Zgjidhja:** Ose e nxjerr listën e lejeve nga `/api/auth/me` (nëse backend e kthen eksplicite), ose minimumi krijoj një burim të vetëm të vërtetë në backend dhe një skedar të gjeneruar/kopjuar në build — por në praktikë për projektin tim, hapi më realist është të ketë një endpoint “permissions” ose të zgjerohet `me` që frontend të mos hardcodojë të njëjtën mapë.
- **Pse ka rëndësi:** Autorizimi është pjesë sigurie dhe UX; nëse UI dhe server nuk bien dakord, ke bug që duket “i rastit” por është struktural.

---

## 5. Një pjesë që ende nuk e kuptoj plotësisht

Kur fillova të shikoj si funksionon sistemi pa `DATABASE_URL`, u ngatërrova menjëherë. Pashë që produktet mund të punojnë me CSV, por përdoruesit dhe login duket se kanë nevojë për PostgreSQL. Nëse dikush nis projektin pa database, nuk jam i sigurt se cili funksionon dhe cili thyet menjëherë. Do të provoja ta nisja projektin pa DATABASE_URL dhe të shikoja çfarë ndodh për të kuptuar më mirë "happy path" e setup lokal.

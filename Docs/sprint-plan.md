# Sprint 2 Report — Artiola Qollaku
Data: 8 Prill 2026

**Lënda:** Inxhinieri Softuerike
**Universiteti:** Universiteti "Isa Boletini" — Mitrovicë
**GitHub:** https://github.com/Artiola0406/StockFlow
**Live:** https://stockflow-ltnv.onrender.com

---

## Çka Përfundova

### 1. Error Handling i Plotë 

**FileRepository.js** — u shtuan try-catch në çdo operacion:

- `_load()` — nëse CSV file mungon, krijohet automatikisht file i ri me mesazh:
  `"File nuk u gjet, po krijoj file të ri..."`
- `_createEmptyFile()` — metodë e re që krijon file dhe folder nëse nuk ekzistojnë
- `getById()` — trajton gabime dhe kthen `null` pa crash
- `add()` — trajton gabime gjatë shtimit dhe ruajtjes
- `update()` — trajton gabimin nëse ID nuk ekziston
- `delete()` — trajton gabimin nëse ID nuk ekziston
- `save()` — trajton gabimin nëse file nuk mund të shkruhet

**ProductService.js** — u shtua validim i plotë:

- Input i gabuar për çmim (p.sh. "abc") → mesazh:
  `"Ju lutem shkruani numër valid për çmimin"`
- Input i gabuar për sasi → mesazh:
  `"Ju lutem shkruani numër valid për sasinë"`
- ID që nuk ekziston → mesazh:
  `"Produkti me ID X nuk u gjet"`
- Programi **kurrë nuk crash-on** — çdo gabim trajtohet dhe kthehet mesazh i qartë

**productRoutes.js** — u shtuan HTTP status codes të sakta:
- `400 Bad Request` — input i gabuar
- `404 Not Found` — ID nuk ekziston
- `500 Internal Server Error` — gabim i serverit

---

### 2. Feature e Re — Statistika të Avancuara dhe Sortim 

**Metodat e reja në ProductService.js:**

| Metoda | Përshkrimi |
|---|---|
| `calculateStatistics()` | Kthen objekt me të gjitha statistikat |
| `calculateAveragePrice()` | Llogarit çmimin mesatar të produkteve |
| `getMaxPriceProduct()` | Kthen produktin me çmimin më të lartë |
| `getMinPriceProduct()` | Kthen produktin me çmimin më të ulët |
| `_sort(products, sortBy, sortOrder)` | Sorton listën sipas kriterit |

**Sortimi i produkteve** — implementuar në Service layer:
- Sipas emrit: A-Z dhe Z-A
- Sipas çmimit: rritës dhe zbritës
- Sipas sasisë: rritës dhe zbritës

**Kërkim case-insensitive** — u rregullua bug-u ekzistues:
- Para: `"laptop"` nuk gjente `"Laptop"`
- Pas: `"laptop"`, `"LAPTOP"`, `"Laptop"` — të gjitha gjejnë rezultate

**Endpoint i ri:**
```
GET /api/products/stats
```
Kthen:
```json
{
  "totalProducts": 6,
  "totalValue": 24339.36,
  "averagePrice": 373.99,
  "maxPriceProduct": { "name": "iPhone 17", "price": "8999.99" },
  "minPriceProduct": { "name": "Tastiere Logitech", "price": "79.99" },
  "byCategory": { "Elektronike": 4, "Aksesore": 1, "Mobilje": 1 }
}
```

**Parametra të rinj në API:**
```
GET /api/products?filter=laptop&sortBy=price&sortOrder=asc
GET /api/products?sortBy=name&sortOrder=desc
```

---

### 3. Unit Tests me Jest — 10 teste ✅

**Framework:** Jest (Node.js)
**Strategjia:** Mock Repository — testet nuk varen nga CSV file real

**Output i testeve:**
```
PASS  tests/ProductService.test.js
  ✓ addProduct me të dhëna valide duhet të kthejë produktin
  ✓ addProduct me emër bosh duhet të hedhë error
  ✓ addProduct me çmim 0 duhet të hedhë error
  ✓ getAllProducts me filter Laptop duhet të gjejë produkt
  ✓ getAllProducts me filter që nuk ekziston duhet të kthejë array bosh
  ✓ calculateAveragePrice duhet të kthejë mesataren e saktë
  ✓ getMaxPriceProduct duhet të kthejë produktin me çmimin më të lartë
  ✓ getMinPriceProduct duhet të kthejë produktin me çmimin më të ulët
  ✓ deleteProduct me ID valid duhet të fshijë produktin
  ✓ getProductById me ID që nuk ekziston duhet të hedhë error

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Time:        1.176s
```

**Testet e shkruara:**

| # | Testi | Lloji | Rezultati |
|---|---|---|---|
| 1 | addProduct — produkt valid | Rast normal | ✅ |
| 2 | addProduct — emër bosh | Rast kufitar | ✅ |
| 3 | addProduct — çmim 0 | Rast kufitar | ✅ |
| 4 | getAllProducts — filter ekziston | Rast normal | ✅ |
| 5 | getAllProducts — filter nuk ekziston | Rast kufitar | ✅ |
| 6 | calculateAveragePrice — mesatare e saktë | Feature e re | ✅ |
| 7 | getMaxPriceProduct — produkti korrekt | Feature e re | ✅ |
| 8 | getMinPriceProduct — produkti korrekt | Feature e re | ✅ |
| 9 | deleteProduct — ID ekziston | Rast normal | ✅ |
| 10 | getProductById — ID nuk ekziston | Rast kufitar | ✅ |

---

### 4. Ndryshime të tjera

**Deployment i azhurnuar:**
- Kodi i ri u push-ua automatikisht në Render.com
- Website live: https://stockflow-ltnv.onrender.com
- Funksionon edhe lokalisht: http://localhost:5000

**Struktura e fajllëve të ndryshuar:**
```
Backend/
├── src/
│   ├── repositories/
│   │   └── FileRepository.js    ← error handling i plotë
│   ├── services/
│   │   └── ProductService.js    ← statistika + sortim + validim
│   └── routes/
│       └── productRoutes.js     ← endpoint i ri /stats
├── tests/
│   └── ProductService.test.js   ← 10 unit teste ✅
└── package.json                 ← jest i shtuar
```

---

## Çka Mbeti

- Integrimi i faqeve Warehouses, Orders, Customers me backend API (ende localStorage)
- Autentifikim JWT me role (Admin, Menaxher, Staf)
- Lidhja me PostgreSQL për persistencë të plotë

---

## Çka Mësova

1. **Unit testing me mock objects** — Si të izoloj testet nga file system duke përdorur mock repository, kështu testet janë të shpejta dhe të besueshme
2. **Error handling në shtresa** — Çdo shtresë (Repository, Service, Route) duhet të trajtojë gabimet e veta dhe t'i kthejë mesazhe të qarta
3. **Case-insensitive search** — Rëndësia e `.toLowerCase()` për UX të mirë


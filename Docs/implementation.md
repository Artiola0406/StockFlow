# StockFlow — Dokumentimi i Detyrës Praktike 2

**Lënda:** Inxhinieri Softuerike  
**Studenti:** Artiola Qollaku  
**Universiteti:** Universiteti "Isa Boletini" — Mitrovicë  
**GitHub:** https://github.com/Artiola0406/StockFlow

---

## Ushtrimi 1 — Model + Repository 

Modeli `Product` implementohet në `Backend/src/models/Product.js` me 7 atribute: `id`, `name`, `sku`, `category`, `quantity`, `minStock`, `price`.

`FileRepository` në `Backend/src/repositories/FileRepository.js` implementon ndërfaqen `IRepository` me metodat e plota CRUD: `getAll()`, `getById(id)`, `add(entity)`, `save()`. Të dhënat ruhen dhe lexohen nga `Backend/data/products.csv`.

Skedari CSV përmban 5 rekorde fillestare: Laptop Dell XPS, Monitor Samsung 27, Tastierë Logitech, Karrige Zyreje, Printer HP LaserJet.

---

## Ushtrimi 2 — Service me Logjikë 

`ProductService` në `Backend/src/services/ProductService.js` merr `repository` si parameter — Dependency Injection.

3 metodat e implementuara:
- `getAllProducts(filter)` — liston produktet me filtrim sipas emrit ose kategorisë
- `addProduct(data)` — shton produkt me validim: emri jo bosh, çmimi > 0, sasia ≥ 0
- `getProductById(id)` — kthen produktin ose hedh Error nëse nuk ekziston

---

## Ushtrimi 3 — UI Funksionale 

Faqja `Frontend/src/pages/Products.html` lidhet me backend-in përmes API Express.

Rrjedha: **UI → productRoutes.js → ProductService → FileRepository → products.csv**

Funksionalitetet e dukshme:
- 3 karta statistikash (Gjithsej produkte, Vlera totale, Stok i ulët)
- Formë shtimi me SKU auto-increment
- Listë me kërkim/filtrim në kohë reale
- Butona ✏️ dhe 🗑️ për çdo produkt

### Screenshotet e Implementimit

**Pamja e Dashboard-it dhe Formës:**
![Dashboard dhe Forma](screenshots/screenshot591.png)

**Lista e Produkteve me CRUD:**
![Lista e Produkteve](screenshots/screenshot592.png)

---

## Ushtrimi 4 — Dokumentim 

Struktura e projektit është e organizuar sipas shtresave:
```
Backend/src/models/       → Product.js  
Backend/src/repositories/ → IRepository.js, FileRepository.js, ProductRepository.js  
Backend/src/services/     → ProductService.js  
Backend/src/routes/       → productRoutes.js  
Backend/data/             → products.csv  
Frontend/src/pages/       → Products.html  
Docs/                     → implementation.md, architecture.md, class-diagram.md
```

Serveri starton me `node src/app.js` nga folderi `Backend` dhe shërben frontend-in statikisht në `http://localhost:5000/Products.html`.

Kodi i plotë, historia e commit-eve dhe të gjitha skedarët janë të disponueshëm në:  
**https://github.com/Artiola0406/StockFlow**

---

## Bonus — Update + Delete 

`update(id, data)` dhe `delete(id)` janë implementuar në `FileRepository`, `ProductService`, dhe UI.

- **Update:** butoni ✏️ hap modal me fushat e parapopulluara → ruajtja dërgon `PUT /api/products/:id` → CSV përditësohet
- **Delete:** butoni 🗑️ kërkon konfirmim → dërgon `DELETE /api/products/:id` → rekordi hiqet nga CSV

Të dyja veprimet reflektohen menjëherë në UI pa reload.

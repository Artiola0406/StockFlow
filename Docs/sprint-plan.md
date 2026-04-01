Sprint 2 Plan — Artiola Qollaku

Data: 1 Prill 2026

Gjendja Aktuale
Çka funksionon tani:
CRUD i plotë për produkte (Create, Read, Update, Delete) përmes API
FileRepository me CSV — lexon dhe ruan të dhëna
ProductService me validim (emri jo bosh, çmimi > 0, sasia >= 0)
8 faqe frontend: Dashboard, Products, Warehouses, StockMovements, Suppliers, Orders, Customers, Reports
Kërkim dhe filtrim i produkteve sipas emrit dhe kategorisë
Website live në: https://stockflow-ltnv.onrender.com
Aksesueshëm edhe lokalisht: http://localhost:5000
Çka nuk funksionon / probleme konkrete:
Nuk ka unit teste — funksionaliteti nuk verifikohet automatikisht
Error handling është i kufizuar — disa API kthejnë gabime pa mesazh të qartë
Kërkimi nuk është case-insensitive (p.sh. “laptop” ≠ “Laptop”)
Pas delete/update, lista në UI nuk rifreskohet gjithmonë automatikisht
Nuk ka sortim të produkteve
Nuk ka statistika (mesatare, max, min, total)
Faqet e tjera përdorin localStorage dhe nuk janë të integruara me backend
A kompajlohet dhe ekzekutohet programi?

Po — ekzekutohet me node src/app.js dhe hapet në port 5000

Plani i Sprintit
Feature e Re — Statistika të Avancuara dhe Sortim
Përshkrimi:

Do të implementohen funksionalitete të reja për analizë dhe organizim të produkteve.

1. Statistika në ProductService

Service do të përmbajë logjikën e biznesit për llogaritje:

Çmimi mesatar i produkteve
Produkti me çmimin maksimal
Produkti me çmimin minimal
Numri i produkteve sipas kategorisë
Vlera totale e inventarit (price × quantity)

👉 Rëndësi arkitekturore:

ProductService përmban gjithë logjikën
ProductRepository merret vetëm me lexim/shkrim nga CSV (pa logjikë)
2. Sortim i produkteve

Useri mund të zgjedhë:

Emri: A-Z / Z-A
Çmimi: rritës / zbritës
Sasia: rritës / zbritës

Sortimi implementohet në Service layer, jo në UI.

Si e përdor useri:
Në faqen Products shfaqet dropdown për sortim
Shfaqen kartela me statistika (average, max, min, total)
Lista rifreskohet automatikisht pa reload
Rrjedha e sistemit:

UI → ProductService → ProductRepository → CSV

Error Handling — 3 raste specifike
1. File mungon (Repository)
Problem: products.csv nuk ekziston → crash
Zgjidhje:
try {
  // read file
} catch (err) {
  // krijo file të ri
}
Mesazh:

"File nuk u gjet, po krijoj file të ri..."

2. Input i gabuar (Service + API)
Problem: user dërgon "abc" për çmim
Zgjidhje:
Validim me if (jo vetëm try-catch)
Kthim i error me HTTP status

Shembull:

400 Bad Request → input invalid
Mesazh:

"Ju lutem shkruani numër valid për çmimin"

3. ID nuk ekziston
Problem: kërkohet produkt që nuk ekziston
Zgjidhje:
Service kthen null / error
API kthen:
404 Not Found

"Produkti me këtë ID nuk u gjet"

Qëllimi:

Programi nuk crash-on kurrë, dhe gjithmonë jep mesazh të qartë për userin

Unit Tests — minimum 3 teste (20 pikë)
Teknologjia:

Jest (Node.js)

Metodat që do të testohen:
CRUD:
addProduct() — produkt valid → sukses
addProduct() — emër bosh → error
Kërkimi:
getAllProducts(filter) — produkt ekziston → gjendet
getAllProducts(filter) — nuk ekziston → array bosh
Feature e re (shumë e rëndësishme):
calculateAveragePrice() → kthen vlerë të saktë
getMaxPriceProduct() → kthen produktin korrekt
Izolim i testit:
Do përdoret mock për Repository (jo CSV real)
Testet nuk varen nga file system
Shembull:
test('addProduct me emër bosh duhet të hedhë error', () => {
  const service = new ProductService(mockRepo);
  expect(() => service.addProduct({ name: '', price: 10, quantity: 5 }))
    .toThrow();
});

test('calculateAveragePrice kthen mesataren e saktë', () => {
  const service = new ProductService(mockRepoWithData);
  const avg = service.calculateAveragePrice();
  expect(avg).toBeGreaterThan(0);
});


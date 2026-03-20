# StockFlow — Dokumentimi i Arkitekturës

## 1. Shtresat e Projektit
```
StockFlow/
├── Frontend/          → Shtresa e Prezantimit (UI)
├── Backend/
│   └── src/
│       ├── models/    → Shtresa e të Dhënave (Entitetet)
│       ├── repositories/ → Shtresa e Aksesit të të Dhënave
│       ├── services/  → Shtresa e Logjikës së Biznesit
│       ├── controllers/ → Shtresa e Kontrollit (HTTP)
│       ├── routes/    → Shtresa e Rutimit (API)
│       └── middlewares/ → Kryqëzues (Auth, Errors)
├── Database/          → Skema SQL (PostgreSQL)
└── Docs/              → Dokumentimi
```

## 2. Përgjegjësitë e Çdo Shtrese

### Frontend (React.js + Tailwind CSS)
- Shfaq të dhënat për përdoruesin
- Dërgon kërkesa HTTP te Backend përmes Axios
- Nuk përmban logjikë biznesi

### Models (src/models/)
- Definon strukturën e entiteteve: Product, User, Warehouse
- Klasa të pastra pa logjikë — vetëm të dhëna

### Repositories (src/repositories/)
- Menaxhon aksesin e të dhënave (lexim/shkrim)
- `IRepository` — kontrata abstrakte
- `FileRepository` — implementim me CSV
- `ProductRepository` — specifik për Product

### Services (src/services/)
- Përmban logjikën e biznesit
- Ndërmjetëson mes Controller dhe Repository
- Shembull: llogarit stokun minimal, gjeneron njoftime

### Controllers (src/controllers/)
- Pranon kërkesat HTTP nga Frontend
- Thërret Services dhe kthen përgjigje JSON
- Nuk komunikon direkt me databazën

### Routes (src/routes/)
- Definon endpoint-et e API: GET /products, POST /orders
- Lidh URL-të me Controllers

### Middlewares (src/middlewares/)
- Auth: verifikon JWT token
- ErrorHandler: trajton gabimet globalisht

## 3. Arsyet e Vendimeve Arkitekturale

### Pse Node.js + Express?
JavaScript në të dy anët (Frontend + Backend) — më e lehtë për mirëmbajtje dhe zhvillim të shpejtë.

### Pse Repository Pattern?
Ndan logjikën e biznesit nga aksesi i të dhënave. Nëse ndryshojmë nga CSV në PostgreSQL, ndryshojmë vetëm Repository — jo Services apo Controllers.

### Pse Clean Architecture (shtresa)?
Çdo shtresë ka një përgjegjësi të vetme. Kodi është i testuar, i shkallëzueshëm dhe i mirëmbajtshëm.

## 4. Bonus — Parimet SOLID

### S — Single Responsibility Principle (SRP)
Çdo klasë ka **një përgjegjësi të vetme**:
- `Product.js` — vetëm strukturën e produktit
- `FileRepository.js` — vetëm lexim/shkrim CSV
- `ProductService.js` — vetëm logjikën e biznesit

### D — Dependency Inversion Principle (DIP)
`ProductService` varet nga **abstrakti** `IRepository`, jo nga implementimi konkret `FileRepository`. Kjo do të thotë që mund të zëvendësohet me `DatabaseRepository` pa ndryshuar `ProductService`.
```javascript
// E GABUAR — varësi direkte
class ProductService {
  constructor() {
    this.repo = new FileRepository(); // i lidhur fort
  }
}

// E SAKTË — varësi nga abstrakti
class ProductService {
  constructor(repository) {
    this.repo = repository; // mund të jetë çdo IRepository
  }
}
```

### O — Open/Closed Principle (OCP)
`FileRepository` mund të **zgjerohet** (extends) pa u modifikuar.
`ProductRepository extends FileRepository` shton metoda të reja pa ndryshuar klasën bazë.
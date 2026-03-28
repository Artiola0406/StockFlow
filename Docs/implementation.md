# StockFlow — Dokumentimi i Implementimit

## Çfarë u implementua

### 1. Model — Product.js
Klasa `Product` me 7 atribute: `id`, `name`, `sku`, `price`, `quantity`, `category`, `createdAt`.

### 2. Repository — CRUD i plotë
- `IRepository.js` — interface abstrakt me 6 metoda
- `FileRepository.js` — implementim me CSV, të gjitha operacionet CRUD
- `ProductRepository.js` — specifik për produkte me `getByCategory()` dhe `getLowStock()`
- `Backend/data/products.csv` — 5 rekorde fillestare

### 3. Service — ProductService.js
3 metoda kryesore me validim:
- `getAllProducts(filter)` — liston me filtrim opsional
- `addProduct(data)` — shton me validim (emri, SKU, çmimi > 0, sasia >= 0)
- `getProductById(id)` — gjen sipas ID
- `updateProduct(id, data)` — përditëson me validim
- `deleteProduct(id)` — fshin pas verifikimit

Service merr Repository si parameter (Dependency Injection).

### 4. UI — Products.html
Forma e plotë me:
- ➕ Shtim produkti me validim
- 📋 Listim me kërkim/filtrim
- ✏️ Përditësim në modal
- 🗑️ Fshirje me konfirmim

### 5. Rrjedha e plotë
```
UI (Products.html)
  → fetch() HTTP Request
  → productRoutes.js (Express)
  → ProductService.js (validim + logjikë)
  → ProductRepository.js
  → FileRepository.js
  → products.csv (ruajtja e të dhënave)
```

### 6. Update + Delete
Implementuar në të tre shtresat:
- **Repository**: `update()` dhe `delete()` në `FileRepository.js`
- **Service**: `updateProduct()` dhe `deleteProduct()` me validim
- **UI**: Modal për update, buton fshirje me konfirmim
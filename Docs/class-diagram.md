# StockFlow — Diagrami i Klasave (UML)

## Klasat Kryesore
```mermaid
classDiagram
    class IRepository {
        <<interface>>
        +getAll()
        +getById(id)
        +add(entity)
        +save()
    }

    class FileRepository {
        -filepath string
        -data array
        +constructor(filename)
        +_load()
        +getAll()
        +getById(id)
        +add(entity)
        +save()
    }

    class ProductRepository {
        +constructor()
        +getByCategory(category)
        +getLowStock(minLevel)
    }

    class Product {
        -id string
        -name string
        -sku string
        -category string
        -quantity number
        -minStock number
        -price number
        +constructor(id, name, sku, category, quantity, minStock, price)
    }

    class ProductService {
        -repository ProductRepository
        +constructor()
        +getAllProducts()
        +addProduct(data)
        +getLowStockProducts()
    }

    IRepository <|-- FileRepository : extends
    FileRepository <|-- ProductRepository : extends
    ProductRepository --> Product : manages
    ProductService --> ProductRepository : uses
```

## Përshkrimi i Klasave

### IRepository
Klasa bazë abstrakte që definon kontratën e Repository Pattern.
Çdo repository duhet të implementojë: `getAll()`, `getById()`, `add()`, `save()`.

### FileRepository
Implementon `IRepository`. Ruan dhe lexon të dhëna nga **CSV files**.
Metoda `_load()` lexon CSV-në automatikisht gjatë inicializimit.

### ProductRepository
Extends `FileRepository` për entitetin **Product**.
Shton metoda specifike: `getByCategory()` dhe `getLowStock()`.

### Product
Model që përfaqëson një produkt në inventar me atributet e tij.

### ProductService
Shtresa e **logjikës së biznesit** — ndërmjetëson mes Controller dhe Repository.
graph TD
    %% 1. Deklarimi i Node-ave me ID të shkurtra (Zgjidhja për Error-in)
    M1[Moduli 1: Siguria dhe Perdoruesit]
    M2[Moduli 2: Produktet dhe Inventari]
    M3[Moduli 3: Levizjet e Stokut]
    M4[Moduli 4: Furnitoret Shitjet dhe Financat]
    M5[Moduli 5: Repository Pattern dhe AI]

    %% 2. Lidhjet mes tyre
    M1 --> M2
    M2 --> M3
    M3 --> M4
    M4 --> M5

    %% 3. Klasat e tua (Definimi)
    classDef klasaJote1 fill:#f96,stroke:#333,stroke-width:2px
    classDef klasaJote2 fill:#32CD32,stroke:#000,stroke-width:3px
    classDef klasaGabim fill:#ff0000,stroke:#fff,stroke-width:1px

    %% 4. Zbatimi i klasave 
    class M1,M2,M3,M4 klasaJote1
    class M5 klasaJote2

    classDiagram
  class User {
    -id string
    -name string
    -email string
    -passwordHash string
    -isActive boolean
    -createdAt date
    +constructor(id, name, email, passwordHash, roleId)
  }
  class Role {
    -id string
    -name string
    -permissions json
    +constructor(id, name, permissions)
  }
  class AuthToken {
    -id string
    -userId string
    -token string
    -expiresAt date
    +constructor(userId, token, expiresAt)
  }
  class AuditLog {
    -id string
    -userId string
    -action string
    -entityType string
    -entityId string
    -oldValues json
    -newValues json
    -createdAt date
    +constructor(userId, action, entityType, entityId)
  }
  class Notification {
    -id string
    -userId string
    -type string
    -message string
    -isRead boolean
    -createdAt date
    +constructor(userId, type, message)
  }
  User "many" o--|| Role : hasRole
  User ||--o AuthToken : generates
  User ||--o AuditLog : creates
  User ||--o Notification : receives

  classDiagram
  class Product {
    -id string
    -name string
    -sku string
    -categoryId string
    -unitId string
    -minStockLevel number
    -isActive boolean
    +constructor(id, name, sku, categoryId, unitId, minStockLevel)
  }
  class Category {
    -id string
    -name string
    -parentId string
    +constructor(id, name, parentId)
  }
  class UnitOfMeasure {
    -id string
    -name string
    -abbreviation string
    +constructor(id, name, abbreviation)
  }
  class ProductPrice {
    -id string
    -productId string
    -price number
    -priceType string
    -validFrom date
    +constructor(productId, price, priceType, validFrom)
  }
  class CostHistory {
    -id string
    -productId string
    -cost number
    -recordedAt date
    +constructor(productId, cost, recordedAt)
  }
  class Warehouse {
    -id string
    -name string
    -location string
    -isActive boolean
    +constructor(id, name, location)
  }
  class WarehouseStock {
    -id string
    -productId string
    -warehouseId string
    -quantity number
    -reservedQty number
    -updatedAt date
    +constructor(productId, warehouseId, quantity)
  }
  Product "many" o--|| Category : belongsTo
  Product "many" o--|| UnitOfMeasure : measuredBy
  Product ||--o ProductPrice : hasPrices
  Product ||--o CostHistory : hasCosts
  Product ||--o WarehouseStock : storedIn
  Warehouse ||--o WarehouseStock : stores

  classDiagram
  class Product {
    -id string
    -name string
    -sku string
    +constructor(id, name, sku)
  }
  class Warehouse {
    -id string
    -name string
    -location string
    +constructor(id, name, location)
  }
  class StockMovement {
    -id string
    -productId string
    -warehouseId string
    -type string
    -quantity number
    -referenceType string
    -referenceId string
    -createdBy string
    -createdAt date
    +constructor(productId, warehouseId, type, quantity)
  }
  class StockTransfer {
    -id string
    -fromWarehouseId string
    -toWarehouseId string
    -status string
    -createdBy string
    -createdAt date
    +constructor(fromWarehouseId, toWarehouseId)
  }
  class TransferItem {
    -id string
    -transferId string
    -productId string
    -quantity number
    +constructor(transferId, productId, quantity)
  }
  class StockAdjustment {
    -id string
    -productId string
    -warehouseId string
    -quantityChange number
    -reason string
    -createdBy string
    -createdAt date
    +constructor(productId, warehouseId, quantityChange, reason)
  }
  Product ||--o StockMovement : moves
  Product ||--o TransferItem : transferred
  Product ||--o StockAdjustment : adjusted
  Warehouse ||--o StockMovement : location
  Warehouse ||--o StockTransfer : sendsFrom
  StockTransfer ||--o TransferItem : contains

  classDiagram
  class Supplier {
    -id string
    -name string
    -contactEmail string
    -phone string
    -isActive boolean
    +constructor(id, name, contactEmail, phone)
  }
  class PurchaseOrder {
    -id string
    -supplierId string
    -status string
    -totalAmount number
    -orderDate date
    +constructor(supplierId, status, totalAmount)
  }
  class PurchaseOrderItem {
    -id string
    -orderId string
    -productId string
    -quantity number
    -unitCost number
    +constructor(orderId, productId, quantity, unitCost)
  }
  class Customer {
    -id string
    -name string
    -email string
    -phone string
    -address string
    +constructor(id, name, email, phone, address)
  }
  class SalesOrder {
    -id string
    -customerId string
    -warehouseId string
    -status string
    -totalAmount number
    -orderDate date
    +constructor(customerId, warehouseId, status)
  }
  class SalesOrderItem {
    -id string
    -orderId string
    -productId string
    -quantity number
    -unitPrice number
    +constructor(orderId, productId, quantity, unitPrice)
  }
  class Invoice {
    -id string
    -salesOrderId string
    -invoiceNumber string
    -amount number
    -status string
    -dueDate date
    +constructor(salesOrderId, invoiceNumber, amount)
  }
  class Payment {
    -id string
    -invoiceId string
    -paymentMethodId string
    -amount number
    -paidAt date
    +constructor(invoiceId, paymentMethodId, amount)
  }
  class PaymentMethod {
    -id string
    -name string
    -type string
    -isActive boolean
    +constructor(id, name, type)
  }
  Supplier ||--o PurchaseOrder : supplies
  PurchaseOrder ||--o PurchaseOrderItem : contains
  Customer ||--o SalesOrder : places
  SalesOrder ||--o SalesOrderItem : contains
  SalesOrder ||--|| Invoice : generates
  Invoice ||--o Payment : paidWith
  PaymentMethod ||--o Payment : usedIn

  classDiagram
  class IRepository {
    <>
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
  class RestockPrediction {
    -id string
    -productId string
    -warehouseId string
    -avgDailySales float
    -safetyStock number
    -reorderPoint number
    -suggestedQty number
    -daysUntilStockout number
    -generatedAt date
    +constructor(productId, warehouseId)
    +calculate()
  }
  class SalesAnalytics {
    -id string
    -productId string
    -warehouseId string
    -period string
    -totalSold number
    -totalRevenue number
    -calculatedAt date
    +constructor(productId, warehouseId, period)
    +analyze()
  }
  IRepository  RestockPrediction : feeds
  ProductRepository ..> SalesAnalytics : feeds

  
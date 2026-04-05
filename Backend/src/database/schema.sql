-- Products
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  category VARCHAR(100) DEFAULT 'E pacaktuar',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  capacity INTEGER DEFAULT 0 CHECK (capacity >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
  status VARCHAR(50) DEFAULT 'Ne pritje',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id VARCHAR(50) PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  warehouse_name VARCHAR(255),
  type VARCHAR(3) NOT NULL CHECK (type IN ('IN', 'OUT')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial data for products
INSERT INTO products (id, name, sku, price, quantity, category) VALUES
('1', 'Laptop Dell XPS', 'SKU-001', 999.99, 15, 'Elektronike'),
('2', 'Monitor Samsung 27', 'SKU-002', 349.99, 8, 'Elektronike'),
('3', 'Tastiere Logitech', 'SKU-003', 79.99, 25, 'Aksesore'),
('4', 'Karrige Zyreje', 'SKU-004', 249.99, 10, 'Mobilje'),
('5', 'Printer HP LaserJet', 'SKU-005', 189.99, 6, 'Elektronike')
ON CONFLICT (id) DO NOTHING;

-- Initial data for warehouses
INSERT INTO warehouses (id, name, location, capacity, is_active) VALUES
('1', 'Depo Qendrore', 'Prishtine', 5000, true),
('2', 'Depo Veriore', 'Mitrovice', 3000, true),
('3', 'Depo Jugore', 'Prizren', 2500, true),
('4', 'Depo Lindore', 'Gjilan', 1800, true),
('5', 'Depo Perendimore', 'Peje', 2000, false)
ON CONFLICT (id) DO NOTHING;
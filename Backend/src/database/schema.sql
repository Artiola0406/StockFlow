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
  type VARCHAR(3) NOT NULL CHECK (type IN ('IN','OUT')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial data: products
INSERT INTO products (id, name, sku, price, quantity, category) VALUES
('1', 'Laptop Dell XPS', 'SKU-001', 999.99, 15, 'Elektronike'),
('2', 'Monitor Samsung 27', 'SKU-002', 349.99, 8, 'Elektronike'),
('3', 'Tastiere Logitech', 'SKU-003', 79.99, 25, 'Aksesore'),
('4', 'Karrige Zyreje', 'SKU-004', 249.99, 10, 'Mobilje'),
('5', 'Printer HP LaserJet', 'SKU-005', 189.99, 6, 'Elektronike')
ON CONFLICT (id) DO NOTHING;

-- Initial data: warehouses
INSERT INTO warehouses (id, name, location, capacity, is_active) VALUES
('w1','Depo Qendrore','Prishtine',5000,true),
('w2','Depo Veriore','Mitrovice',3000,true),
('w3','Depo Jugore','Prizren',2500,true),
('w4','Depo Lindore','Gjilan',1800,true),
('w5','Depo Perendimore','Peje',2000,false)
ON CONFLICT (id) DO NOTHING;

-- Initial data: suppliers
INSERT INTO suppliers (id, name, contact_email, phone, is_active) VALUES
('s1','TechSupply sh.p.k','info@techsupply.com','+383 44 111 111',true),
('s2','ElektroKos','sales@elektrokos.com','+383 44 222 222',true),
('s3','MobiljeKosova','contact@mobilje.com','+383 44 333 333',true),
('s4','OfficePro','office@officepro.com','+383 44 444 444',true),
('s5','DigiTech','info@digitech.com','+383 44 555 555',false)
ON CONFLICT (id) DO NOTHING;

-- Initial data: customers
INSERT INTO customers (id, name, email, phone, address) VALUES
('c1','Gent Hoxha','gent@email.com','+383 44 100 001','Prishtine'),
('c2','Arta Krasniqi','arta@email.com','+383 44 100 002','Prizren'),
('c3','Besim Osmani','besim@email.com','+383 44 100 003','Mitrovice'),
('c4','Drita Berisha','drita@email.com','+383 44 100 004','Peje'),
('c5','Fatos Gashi','fatos@email.com','+383 44 100 005','Gjilan')
ON CONFLICT (id) DO NOTHING;

-- Initial data: orders
INSERT INTO orders (id, customer_name, product_name, quantity, total_amount, status) VALUES
('o1','Gent Hoxha','Laptop Dell XPS',1,999.99,'Konfirmuar'),
('o2','Arta Krasniqi','Monitor Samsung 27',2,699.98,'Ne pritje'),
('o3','Besim Osmani','Tastiere Logitech',3,239.97,'Derguar'),
('o4','Drita Berisha','Karrige Zyreje',1,249.99,'Ne pritje'),
('o5','Fatos Gashi','Printer HP LaserJet',1,189.99,'Anuluar')
ON CONFLICT (id) DO NOTHING;

-- Initial data: stock movements
INSERT INTO stock_movements (id, product_name, warehouse_name, type, quantity, reason) VALUES
('m1','Laptop Dell XPS','Depo Qendrore','IN',10,'Blerje nga furnitori'),
('m2','Monitor Samsung 27','Depo Qendrore','IN',5,'Blerje nga furnitori'),
('m3','Laptop Dell XPS','Depo Qendrore','OUT',2,'Shitje'),
('m4','Tastiere Logitech','Depo Veriore','IN',20,'Restok'),
('m5','Printer HP LaserJet','Depo Jugore','OUT',1,'Shitje')
ON CONFLICT (id) DO NOTHING;

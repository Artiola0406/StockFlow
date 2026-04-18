-- Multi-tenant Database Schema Changes for StockFlow
-- Copy-paste these statements in pgAdmin or your PostgreSQL client

-- 1. Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  owner_email VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add tenant_id to all main tables
ALTER TABLE products ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50);
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50);
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50);

-- 3. Add tenant_id and user_role to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_role VARCHAR(50) DEFAULT 'manager';

-- 4. Create demo tenant for existing data
INSERT INTO tenants (id, name, slug, owner_email) VALUES
('tenant-demo', 'StockFlow Demo', 'demo', 'admin@stockflow.com')
ON CONFLICT (id) DO NOTHING;

-- 5. Link existing data to demo tenant
UPDATE products SET tenant_id = 'tenant-demo' WHERE tenant_id IS NULL;
UPDATE warehouses SET tenant_id = 'tenant-demo' WHERE tenant_id IS NULL;
UPDATE suppliers SET tenant_id = 'tenant-demo' WHERE tenant_id IS NULL;
UPDATE customers SET tenant_id = 'tenant-demo' WHERE tenant_id IS NULL;
UPDATE orders SET tenant_id = 'tenant-demo' WHERE tenant_id IS NULL;
UPDATE stock_movements SET tenant_id = 'tenant-demo' WHERE tenant_id IS NULL;
UPDATE users SET tenant_id = 'tenant-demo' WHERE tenant_id IS NULL;

-- 6. Update user roles for existing users
UPDATE users SET user_role = 'super_admin' WHERE email = 'admin@stockflow.com';
UPDATE users SET user_role = 'manager' WHERE email = 'menaxher@stockflow.com';
UPDATE users SET user_role = 'staff' WHERE email = 'staf@stockflow.com';

-- 7. Add foreign key constraints for data integrity
ALTER TABLE products ADD CONSTRAINT fk_products_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE warehouses ADD CONSTRAINT fk_warehouses_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE suppliers ADD CONSTRAINT fk_suppliers_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE customers ADD CONSTRAINT fk_customers_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT fk_orders_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE stock_movements ADD CONSTRAINT fk_stock_movements_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE users ADD CONSTRAINT fk_users_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_tenant ON warehouses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant ON suppliers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant ON stock_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- 9. Verify the changes
SELECT 
  'tenants' as table_name, COUNT(*) as record_count FROM tenants
UNION ALL
SELECT 
  'products', COUNT(*) FROM products WHERE tenant_id = 'tenant-demo'
UNION ALL
SELECT 
  'users', COUNT(*) FROM users WHERE tenant_id = 'tenant-demo';

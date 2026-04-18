-- =====================================================
-- StockFlow Multi-Tenant SaaS Database Setup
-- =====================================================
-- Run this script in PostgreSQL to enable multi-tenancy
-- =====================================================

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

-- 3. Add tenant_id and role to users
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

-- 6. Update user roles
UPDATE users SET user_role = 'super_admin' WHERE email = 'admin@stockflow.com';
UPDATE users SET user_role = 'manager' WHERE email = 'menaxher@stockflow.com';
UPDATE users SET user_role = 'staff' WHERE email = 'staf@stockflow.com';

-- 7. Add foreign key constraints for data integrity
ALTER TABLE products ADD CONSTRAINT fk_products_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE warehouses ADD CONSTRAINT fk_warehouses_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE suppliers ADD CONSTRAINT fk_suppliers_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE customers ADD CONSTRAINT fk_customers_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE orders ADD CONSTRAINT fk_orders_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE stock_movements ADD CONSTRAINT fk_stock_movements_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_tenant ON warehouses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant ON suppliers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant ON stock_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check tenants table
SELECT * FROM tenants;

-- Check tenant_id distribution
SELECT 
  'products' as table_name, COUNT(*) as total, 
  COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as with_tenant
FROM products
UNION ALL
SELECT 
  'warehouses' as table_name, COUNT(*) as total, 
  COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as with_tenant
FROM warehouses
UNION ALL
SELECT 
  'users' as table_name, COUNT(*) as total, 
  COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as with_tenant,
  COUNT(CASE WHEN user_role IS NOT NULL THEN 1 END) as with_role
FROM users;

-- Check user roles
SELECT email, role, user_role, tenant_id FROM users ORDER BY email;

-- =====================================================
-- Setup Complete!
-- =====================================================

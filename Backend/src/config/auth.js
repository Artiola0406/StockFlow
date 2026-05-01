/**
 * Used by requirePermission(page) in app.js (exact string match per mounted API).
 * super_admin: all routes below.
 * manager: same mounts; DELETE on entity routers is blocked via authorize() in route files.
 * staff: products read-only (GET); orders + stock movements read + create (PUT/DELETE blocked in routers).
 */
const ROLE_PERMISSIONS = {
  super_admin: ['products', 'warehouses', 'suppliers', 'customers', 'orders', 'stockmovements'],
  manager: ['products', 'warehouses', 'suppliers', 'customers', 'orders', 'stockmovements'],
  staff: ['products', 'orders', 'stockmovements'],
};

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_dev_secret_change_in_prod',
  JWT_EXPIRES_IN: '7d',
  SALT_ROUNDS: 10,
  ROLE_PERMISSIONS,
};

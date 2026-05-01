const ROLE_PERMISSIONS = {
  super_admin: ['*'],
  manager: [
    'dashboard',
    'products',
    'warehouses',
    'suppliers',
    'orders',
    'customers',
    'reports',
    'stockmovements',
    'users',
    'tenants',
  ],
  staff: ['dashboard', 'products', 'warehouses', 'suppliers', 'customers', 'orders', 'stockmovements'],
};

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_dev_secret_change_in_prod',
  JWT_EXPIRES_IN: '7d',
  SALT_ROUNDS: 10,
  ROLE_PERMISSIONS,
};

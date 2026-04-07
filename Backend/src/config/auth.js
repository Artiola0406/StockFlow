module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'stockflow-secret-key-2026',
  JWT_EXPIRES_IN: '24h',
  ROLES: {
    ADMIN: 'administrator',
    MANAGER: 'menaxher',
    STAFF: 'staf',
  },
  ROLE_PERMISSIONS: {
    administrator: [
      'dashboard',
      'products',
      'warehouses',
      'stockmovements',
      'suppliers',
      'orders',
      'customers',
      'reports',
      'users',
    ],
    menaxher: [
      'dashboard',
      'products',
      'warehouses',
      'orders',
      'suppliers',
      'reports',
      'customers',
    ],
    staf: ['dashboard', 'stockmovements', 'products'],
  },
};

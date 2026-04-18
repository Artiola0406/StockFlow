module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'stockflow-secret-2026',
  JWT_EXPIRES_IN: '24h',
  ROLES: {
    SUPER_ADMIN: 'super_admin',
    MANAGER: 'manager',
    STAFF: 'staff',
  },
  ROLE_PERMISSIONS: {
    super_admin: ['*'], // access to everything across all tenants
    manager: [
      'dashboard', 'products', 'warehouses', 'suppliers',
      'orders', 'customers', 'reports', 'stockmovements'
    ],
    staff: [
      'dashboard', 'products', 'stockmovements'
    ]
  },
};

const { authenticate } = require('./authMiddleware');

const tenantFilter = (req, res, next) => {
  const fallbackTenantId = 'tenant-default';
  const userTenantId = req.user?.tenant_id || fallbackTenantId;

  // Only super_admin can impersonate another tenant via header.
  if (req.user?.user_role === 'super_admin') {
    req.tenantId = req.headers['x-tenant-id'] || userTenantId;
    return next();
  }

  req.tenantId = userTenantId;
  next();
};

module.exports = { tenantFilter };

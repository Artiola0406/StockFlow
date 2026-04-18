const { authenticate } = require('./authMiddleware');

const tenantFilter = (req, res, next) => {
  // Super admin can see all data (pass special header)
  if (req.user?.user_role === 'super_admin') {
    req.tenantId = req.headers['x-tenant-id'] || null;
    return next();
  }

  // All other users only see their tenant data
  if (!req.user?.tenant_id) {
    return res.status(403).json({
      success: false,
      message: 'Tenant ID mungon.'
    });
  }

  req.tenantId = req.user.tenant_id;
  next();
};

module.exports = { tenantFilter };

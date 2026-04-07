const jwt = require('jsonwebtoken');
const { JWT_SECRET, ROLE_PERMISSIONS } = require('../config/auth');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Nuk jeni të autentifikuar. Ju lutem kyçuni.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesioni juaj ka skaduar. Ju lutem kyçuni përsëri.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token i pavlefshëm. Ju lutem kyçuni.',
    });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Nuk jeni të autentifikuar.',
      });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Nuk keni leje për këtë veprim.',
      });
    }
    next();
  };
};

const requirePermission = (page) => [
  authenticate,
  (req, res, next) => {
    const allowed = ROLE_PERMISSIONS[req.user.role] || [];
    if (!allowed.includes(page)) {
      return res.status(403).json({
        success: false,
        message: 'Nuk keni leje për këtë veprim.',
      });
    }
    next();
  },
];

module.exports = { authenticate, authorize, requirePermission };

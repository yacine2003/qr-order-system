const rateLimit = require('express-rate-limit');
const config = require('../config');

// Rate limiter pour les commandes
const orderLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.windowMs,
  max: config.RATE_LIMIT.max,
  message: { error: config.RATE_LIMIT.message },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter plus strict pour éviter le spam
const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // max 10 requêtes par minute
  message: { error: 'Trop de requêtes, veuillez patienter.' }
});

module.exports = {
  orderLimiter,
  strictLimiter
};

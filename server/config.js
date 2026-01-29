module.exports = {
  // Port du serveur
  PORT: process.env.PORT || 3000,

  // Configuration CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Rate limiting (anti-spam)
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requêtes par IP
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  },

  // Configuration commandes
  ORDER_SETTINGS: {
    maxItemsPerOrder: 50,
    maxCommentLength: 200,
    requireTable: true
  },

  // Notifications
  NOTIFICATIONS: {
    sound: true,
    desktop: false
  }
};

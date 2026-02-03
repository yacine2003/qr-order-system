// Charger les variables d'environnement depuis .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { orderLimiter } = require('./middleware/rateLimiter');
const { requireAuth, requireSuperAdmin } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (client public)
app.use(express.static(path.join(__dirname, '../client')));

// 🔒 PROTECTION SUPERADMIN : Route de personnalisation (développeurs uniquement)
app.get('/admin/branding.html', requireSuperAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/branding.html'));
});

// 🔒 PROTECTION ADMIN : Toutes les autres routes /admin nécessitent une authentification
app.use('/admin', requireAuth, express.static(path.join(__dirname, '../admin')));

// Route spécifique pour /admin (redirection vers dashboard.html)
app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

// Routes API publiques
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', orderLimiter, require('./routes/orders'));

// 🔒 Routes API protégées (admin uniquement)
app.use('/api/menu-admin', requireAuth, require('./routes/menuAdmin'));
app.use('/api/admin', requireAuth, require('./routes/adminSettings'));

// 🔒 Route API protégée SUPERADMIN (personnalisation)
app.use('/api/branding', requireSuperAdmin, require('./routes/branding'));

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée.' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
});

// Démarrage du serveur
const PORT = config.PORT;
app.listen(PORT, () => {
  const authStatus = config.ADMIN_AUTH.enabled 
    ? '🔒 Authentification ACTIVÉE' 
    : '⚠️  Authentification DÉSACTIVÉE';
  
  const authInfo = config.ADMIN_AUTH.enabled
    ? `║   👤 Login: ${config.ADMIN_AUTH.username.padEnd(28)} ║`
    : '║   ⚠️  ATTENTION: Admin non protégé !   ║';

  console.log(`
╔════════════════════════════════════════╗
║   🍽️  QR Order System                 ║
║                                        ║
║   Serveur démarré avec succès !       ║
║                                        ║
║   🌐 Client: http://localhost:${PORT}     ║
║   👨‍💼 Admin:  http://localhost:${PORT}/admin ║
║   🔌 API:    http://localhost:${PORT}/api   ║
║                                        ║
╠════════════════════════════════════════╣
║   ${authStatus.padEnd(38)} ║
${authInfo}
╠════════════════════════════════════════╣
║   🔐 Superadmin: ${config.SUPERADMIN_AUTH.username.padEnd(21)} ║
║   🎨 Branding: /admin/branding.html    ║
╚════════════════════════════════════════╝
  `);
  
  if (!config.ADMIN_AUTH.enabled) {
    console.warn('\n⚠️  AVERTISSEMENT SÉCURITÉ : Authentification admin désactivée !');
    console.warn('   Activez-la avec ADMIN_AUTH_ENABLED=true dans .env\n');
  }
});

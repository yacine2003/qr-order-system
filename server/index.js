const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { orderLimiter } = require('./middleware/rateLimiter');

const app = express();

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '../client')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// Route spécifique pour /admin (redirection vers dashboard.html)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

// Routes API
app.use('/api/menu', require('./routes/menu'));
app.use('/api/menu-admin', require('./routes/menuAdmin')); // Gestion du menu
app.use('/api/orders', orderLimiter, require('./routes/orders'));

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
╚════════════════════════════════════════╝
  `);
});

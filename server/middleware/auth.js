const config = require('../config');

/**
 * Middleware d'authentification HTTP Basic Auth
 * Protège les routes admin avec un login/password simple
 */
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;

  // Si pas d'authentification requise (mode développement sans identifiants)
  if (!config.ADMIN_AUTH.enabled) {
    console.warn('⚠️  AVERTISSEMENT : Authentification admin DÉSACTIVÉE');
    return next();
  }

  // Vérifier si header Authorization existe
  if (!auth || !auth.startsWith('Basic ')) {
    return sendAuthRequired(res);
  }

  try {
    // Décoder les identifiants (format: "Basic base64(username:password)")
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString();
    const [username, password] = credentials.split(':');

    // Vérifier les identifiants
    if (username === config.ADMIN_AUTH.username && 
        password === config.ADMIN_AUTH.password) {
      return next(); // ✅ Authentification réussie
    }

    // ❌ Identifiants invalides
    return sendAuthRequired(res, 'Identifiants incorrects');

  } catch (error) {
    console.error('Erreur authentification:', error);
    return sendAuthRequired(res);
  }
}

/**
 * Envoie une réponse 401 avec demande d'authentification
 */
function sendAuthRequired(res, message = 'Authentification requise') {
  res.setHeader('WWW-Authenticate', 'Basic realm="Admin QR Order System"');
  res.status(401).json({ 
    error: message,
    hint: 'Utilisez les identifiants admin configurés dans .env'
  });
}

module.exports = { requireAuth };

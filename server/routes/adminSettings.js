const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Chemin vers le fichier .env
const envPath = path.join(__dirname, '../../.env');

/**
 * GET - Récupérer le nom d'utilisateur actuel
 */
router.get('/current-username', (req, res) => {
  try {
    res.json({ 
      username: config.ADMIN_AUTH.username 
    });
  } catch (error) {
    console.error('Erreur récupération username:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PUT - Modifier les identifiants admin
 */
router.put('/credentials', async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;

    // Validation des champs
    if (!currentPassword || !newUsername || !newPassword) {
      return res.status(400).json({ 
        error: 'Tous les champs sont requis' 
      });
    }

    // Vérifier que le mot de passe actuel est correct
    if (currentPassword !== config.ADMIN_AUTH.password) {
      return res.status(401).json({ 
        error: 'Mot de passe actuel incorrect' 
      });
    }

    // Valider le nouveau username
    if (newUsername.length < 3) {
      return res.status(400).json({ 
        error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' 
      });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
      return res.status(400).json({ 
        error: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, - et _' 
      });
    }


    // Lire le fichier .env actuel
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    } else {
      // Si .env n'existe pas, créer un contenu de base
      envContent = `# Configuration d'environnement
# ⚠️ NE PAS COMMITTER CE FICHIER DANS GIT !

PORT=3000
CORS_ORIGIN=*
NODE_ENV=development
BASE_URL=http://localhost:3000

# ============================================
# AUTHENTIFICATION ADMIN
# ============================================
ADMIN_AUTH_ENABLED=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
`;
    }

    // Mettre à jour les valeurs
    envContent = updateEnvValue(envContent, 'ADMIN_USERNAME', newUsername);
    envContent = updateEnvValue(envContent, 'ADMIN_PASSWORD', newPassword);

    // Écrire le nouveau contenu dans .env
    fs.writeFileSync(envPath, envContent, 'utf8');

    // Mettre à jour les variables d'environnement en mémoire
    process.env.ADMIN_USERNAME = newUsername;
    process.env.ADMIN_PASSWORD = newPassword;

    // Recharger la configuration du serveur
    delete require.cache[require.resolve('../config')];
    const newConfig = require('../config');
    
    // Mettre à jour la référence de config dans l'application
    Object.assign(config, newConfig);

    console.log('✅ Identifiants admin modifiés avec succès (rechargement à chaud)');
    console.log(`   Nouveau username: ${newUsername}`);
    console.log('   ℹ️  Les nouveaux identifiants sont actifs immédiatement');

    // Répondre avec succès
    res.json({ 
      success: true,
      message: 'Identifiants modifiés avec succès ! Les nouveaux identifiants sont actifs immédiatement.',
      note: 'Vous devrez vous reconnecter avec vos nouveaux identifiants lors de votre prochaine visite.'
    });

  } catch (error) {
    console.error('Erreur modification identifiants:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la modification des identifiants',
      details: error.message 
    });
  }
});

/**
 * Fonction utilitaire pour mettre à jour une valeur dans le contenu .env
 */
function updateEnvValue(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  
  if (regex.test(content)) {
    // La clé existe, la remplacer
    return content.replace(regex, `${key}=${value}`);
  } else {
    // La clé n'existe pas, l'ajouter
    return content + `\n${key}=${value}`;
  }
}

module.exports = router;

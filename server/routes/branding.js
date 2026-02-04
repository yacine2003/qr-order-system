const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const brandingFile = path.join(__dirname, '../data/branding.json');

// GET - Récupérer la configuration actuelle (Public)
router.get('/', (req, res) => {
  try {
    if (fs.existsSync(brandingFile)) {
      const data = fs.readFileSync(brandingFile, 'utf8');
      const branding = JSON.parse(data);
      res.json(branding);
    } else {
      // Configuration par défaut
      const defaultBranding = {
        restaurant: {
          name: 'Menu',
          tagline: 'Commandez depuis votre table',
          logo: '🍽️'
        },
        colors: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#ec4899',
          text: '#1f2937'
        },
        background: {
          type: 'gradient',
          gradient1: '#f5f7fa',
          gradient2: '#c3cfe2',
          solid: '#f9fafb',
          imageUrl: ''
        },
        typography: {
          fontFamily: 'Inter'
        },
        cards: {
          effect: 'glassmorphism',
          borderRadius: 12,
          shadowIntensity: 5
        }
      };
      res.json(defaultBranding);
    }
  } catch (error) {
    console.error('Erreur lecture branding:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Import middleware auth (nécessaire ici car on l'a retiré de index.js pour cette route)
const { requireSuperAdmin } = require('../middleware/auth');

// POST - Sauvegarder la configuration (Protégé SuperAdmin)
router.post('/', requireSuperAdmin, (req, res) => {
  try {
    const branding = req.body;

    // Validation basique
    if (!branding.restaurant || !branding.colors) {
      return res.status(400).json({ error: 'Configuration invalide' });
    }

    // Créer le dossier data s'il n'existe pas
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Sauvegarder
    fs.writeFileSync(brandingFile, JSON.stringify(branding, null, 2));

    console.log('✅ Configuration branding mise à jour');

    res.json({
      success: true,
      message: 'Configuration enregistrée avec succès'
    });
  } catch (error) {
    console.error('Erreur sauvegarde branding:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

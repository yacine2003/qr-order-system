const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const menuFile = path.join(__dirname, '../data/menu.json');

// GET - Récupérer le menu complet
router.get('/', (req, res) => {
  try {
    const data = fs.readFileSync(menuFile, 'utf8');
    const menu = JSON.parse(data);
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du menu.' });
  }
});

// GET - Récupérer une catégorie spécifique
router.get('/category/:categoryId', (req, res) => {
  try {
    const data = fs.readFileSync(menuFile, 'utf8');
    const menu = JSON.parse(data);
    const category = menu.categories.find(cat => cat.id === req.params.categoryId);
    
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée.' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la catégorie.' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const menuFile = path.join(__dirname, '../data/menu.json');

let cachedMenu = null;
let lastReadTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

function getMenuData() {
  const now = Date.now();
  if (cachedMenu && (now - lastReadTime < CACHE_DURATION)) {
    return cachedMenu;
  }

  try {
    const data = fs.readFileSync(menuFile, 'utf8');
    cachedMenu = JSON.parse(data);
    lastReadTime = now;
    return cachedMenu;
  } catch (error) {
    console.error('Error reading menu file:', error);
    throw error;
  }
}

// GET - Récupérer le menu complet
router.get('/', (req, res) => {
  try {
    const menu = getMenuData();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du menu.' });
  }
});

// GET - Récupérer une catégorie spécifique
router.get('/category/:categoryId', (req, res) => {
  try {
    const menu = getMenuData();
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

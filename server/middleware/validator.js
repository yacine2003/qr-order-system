const config = require('../config');

// Validation des données de commande
function validateOrder(req, res, next) {
  const { table, items, total } = req.body;

  // Validation table
  if (config.ORDER_SETTINGS.requireTable && !table) {
    return res.status(400).json({ error: 'Le numéro de table est requis.' });
  }

  if (table && (typeof table !== 'string' || table.trim().length === 0)) {
    return res.status(400).json({ error: 'Numéro de table invalide.' });
  }

  // Validation items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'La commande doit contenir au moins un produit.' });
  }

  if (items.length > config.ORDER_SETTINGS.maxItemsPerOrder) {
    return res.status(400).json({ 
      error: `Maximum ${config.ORDER_SETTINGS.maxItemsPerOrder} produits par commande.` 
    });
  }

  // Validation chaque item
  for (const item of items) {
    if (!item.id || !item.name || !item.price || !item.quantity) {
      return res.status(400).json({ error: 'Données de produit invalides.' });
    }

    if (typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 99) {
      return res.status(400).json({ error: 'Quantité invalide.' });
    }

    if (typeof item.price !== 'number' || item.price < 0) {
      return res.status(400).json({ error: 'Prix invalide.' });
    }
  }

  // Validation total
  if (typeof total !== 'number' || total < 0) {
    return res.status(400).json({ error: 'Total invalide.' });
  }

  // Vérification du total (recalcul côté serveur)
  const calculatedTotal = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // Tolérance de 0.01€ pour les arrondis
  if (Math.abs(calculatedTotal - total) > 0.01) {
    return res.status(400).json({ error: 'Le total ne correspond pas aux produits.' });
  }

  // Validation commentaire (optionnel)
  if (req.body.comment) {
    if (typeof req.body.comment !== 'string' || 
        req.body.comment.length > config.ORDER_SETTINGS.maxCommentLength) {
      return res.status(400).json({ 
        error: `Commentaire trop long (max ${config.ORDER_SETTINGS.maxCommentLength} caractères).` 
      });
    }
  }

  // Validation nom (optionnel)
  if (req.body.name && typeof req.body.name !== 'string') {
    return res.status(400).json({ error: 'Nom invalide.' });
  }

  next();
}

module.exports = { validateOrder };

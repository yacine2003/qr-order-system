const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { validateOrder } = require('../middleware/validator');
const { strictLimiter } = require('../middleware/rateLimiter');

const ordersFile = path.join(__dirname, '../data/orders.json');

// Clients SSE connectés (pour temps réel admin)
let sseClients = [];

// Fonction pour lire les commandes
function getOrders() {
  try {
    const data = fs.readFileSync(ordersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Fonction pour sauvegarder les commandes
function saveOrders(orders) {
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

// Fonction pour notifier les clients SSE
function notifyClients(order) {
  sseClients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(order)}\n\n`);
  });
}

// GET - Récupérer toutes les commandes
router.get('/', (req, res) => {
  const orders = getOrders();
  res.json(orders);
});

// GET - Récupérer une commande par ID
router.get('/:id', (req, res) => {
  const orders = getOrders();
  const order = orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ error: 'Commande non trouvée.' });
  }
  
  res.json(order);
});

// POST - Créer une nouvelle commande
router.post('/', strictLimiter, validateOrder, (req, res) => {
  const { table, name, items, total, comment } = req.body;

  const newOrder = {
    id: `ORD-${Date.now()}`,
    table: table.trim(),
    name: name ? name.trim() : 'Client',
    items,
    total: parseFloat(total.toFixed(2)),
    comment: comment ? comment.trim() : '',
    status: 'nouvelle',
    timestamp: new Date().toISOString(),
    createdAt: new Date().toLocaleString('fr-FR')
  };

  const orders = getOrders();
  orders.push(newOrder);
  saveOrders(orders);

  // Notifier les clients admin en temps réel
  notifyClients(newOrder);

  res.status(201).json({ 
    success: true, 
    orderId: newOrder.id,
    message: 'Commande enregistrée avec succès !' 
  });
});

// PATCH - Mettre à jour le statut d'une commande
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['nouvelle', 'en_preparation', 'prete', 'servie', 'annulee'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide.' });
  }

  const orders = getOrders();
  const orderIndex = orders.findIndex(o => o.id === req.params.id);

  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Commande non trouvée.' });
  }

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toLocaleString('fr-FR');
  saveOrders(orders);

  res.json({ success: true, order: orders[orderIndex] });
});

// DELETE - Supprimer une commande
router.delete('/:id', (req, res) => {
  const orders = getOrders();
  const filteredOrders = orders.filter(o => o.id !== req.params.id);

  if (orders.length === filteredOrders.length) {
    return res.status(404).json({ error: 'Commande non trouvée.' });
  }

  saveOrders(filteredOrders);
  res.json({ success: true, message: 'Commande supprimée.' });
});

// SSE - Stream temps réel pour l'admin
router.get('/stream/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Envoyer les commandes existantes au nouveau client
  const orders = getOrders();
  res.write(`data: ${JSON.stringify({ type: 'init', orders })}\n\n`);

  // Ajouter le client à la liste
  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Nettoyer quand le client se déconnecte
  req.on('close', () => {
    sseClients = sseClients.filter(client => client.id !== clientId);
  });
});

module.exports = router;

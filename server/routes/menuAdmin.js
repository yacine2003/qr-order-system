const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configuration Multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../client/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Garder l'extension originale et ajouter un timestamp pour l'unicité
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont acceptées.'));
    }
  }
});

const menuFile = path.join(__dirname, '../data/menu.json');

// Fonction pour lire le menu
function getMenu() {
  try {
    const data = fs.readFileSync(menuFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { categories: [] };
  }
}

// Fonction pour sauvegarder le menu
function saveMenu(menu) {
  fs.writeFileSync(menuFile, JSON.stringify(menu, null, 2));
}

// Fonction pour générer un ID à partir d'un nom
function generateId(name) {
  return name
    .toLowerCase()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques
    .replace(/[^a-z0-9]+/g, '-') // Remplace non-alphanumériques par tirets
    .replace(/^-+|-+$/g, ''); // Trim tirets
}

// POST - Upload d'image
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier téléchargé.' });
  }

  // Retourner le chemin relatif pour le client
  const imagePath = 'images/' + req.file.filename;
  res.json({ success: true, path: imagePath });
});

// POST - Ajouter une catégorie
router.post('/category', (req, res) => {
  const { name, icon } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Le nom est requis.' });
  }

  const menu = getMenu();

  // Générer automatiquement l'ID
  let id = generateId(name);

  // Si l'ID existe déjà, ajouter un suffixe numérique
  let counter = 1;
  let originalId = id;
  while (menu.categories.find(cat => cat.id === id)) {
    id = `${originalId}-${counter}`;
    counter++;
  }

  menu.categories.push({
    id,
    name,
    icon: icon || '📦',
    products: []
  });

  saveMenu(menu);
  res.status(201).json({ success: true, category: menu.categories[menu.categories.length - 1] });
});

// PUT - Modifier une catégorie
router.put('/category/:id', (req, res) => {
  const { id } = req.params;
  const { name, icon } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nom requis.' });
  }

  const menu = getMenu();
  const categoryIndex = menu.categories.findIndex(cat => cat.id === id);

  if (categoryIndex === -1) {
    return res.status(404).json({ error: 'Catégorie non trouvée.' });
  }

  menu.categories[categoryIndex].name = name;
  if (icon) menu.categories[categoryIndex].icon = icon;

  saveMenu(menu);
  res.json({ success: true, category: menu.categories[categoryIndex] });
});

// DELETE - Supprimer une catégorie
router.delete('/category/:id', (req, res) => {
  const { id } = req.params;
  const menu = getMenu();

  const filteredCategories = menu.categories.filter(cat => cat.id !== id);

  if (filteredCategories.length === menu.categories.length) {
    return res.status(404).json({ error: 'Catégorie non trouvée.' });
  }

  menu.categories = filteredCategories;
  saveMenu(menu);
  res.json({ success: true, message: 'Catégorie supprimée.' });
});

// POST - Ajouter un produit à une catégorie
router.post('/category/:categoryId/product', (req, res) => {
  const { categoryId } = req.params;
  const { name, price, description, image } = req.body;

  if (!name || typeof price !== 'number') {
    return res.status(400).json({ error: 'Le nom et le prix sont requis.' });
  }

  const menu = getMenu();
  const category = menu.categories.find(cat => cat.id === categoryId);

  if (!category) {
    return res.status(404).json({ error: 'Catégorie non trouvée.' });
  }

  // Générer automatiquement l'ID
  let id = generateId(name);

  // Si l'ID existe déjà dans cette catégorie, ajouter un suffixe numérique
  let counter = 1;
  let originalId = id;
  while (category.products.find(prod => prod.id === id)) {
    id = `${originalId}-${counter}`;
    counter++;
  }

  const newProduct = {
    id,
    name,
    price: parseFloat(price.toFixed(2)),
    description: description || '',
    image: image || ''
  };

  category.products.push(newProduct);
  saveMenu(menu);
  res.status(201).json({ success: true, product: newProduct });
});

// PUT - Modifier un produit
router.put('/product/:productId', (req, res) => {
  const { productId } = req.params;
  const { name, price, description, categoryId, image } = req.body;

  const menu = getMenu();
  let foundProduct = null;
  let foundCategory = null;

  // Trouver le produit dans toutes les catégories
  for (const category of menu.categories) {
    const product = category.products.find(prod => prod.id === productId);
    if (product) {
      foundProduct = product;
      foundCategory = category;
      break;
    }
  }

  if (!foundProduct) {
    return res.status(404).json({ error: 'Produit non trouvé.' });
  }

  // Mettre à jour les champs
  if (name) foundProduct.name = name;
  if (typeof price === 'number') foundProduct.price = parseFloat(price.toFixed(2));
  if (description !== undefined) foundProduct.description = description;
  if (image !== undefined) foundProduct.image = image;

  // Si changement de catégorie
  if (categoryId && categoryId !== foundCategory.id) {
    const newCategory = menu.categories.find(cat => cat.id === categoryId);
    if (!newCategory) {
      return res.status(404).json({ error: 'Nouvelle catégorie non trouvée.' });
    }

    // Retirer de l'ancienne catégorie
    foundCategory.products = foundCategory.products.filter(p => p.id !== productId);
    // Ajouter à la nouvelle
    newCategory.products.push(foundProduct);
  }

  saveMenu(menu);
  res.json({ success: true, product: foundProduct });
});

// DELETE - Supprimer un produit
router.delete('/product/:productId', (req, res) => {
  const { productId } = req.params;
  const menu = getMenu();

  let found = false;

  for (const category of menu.categories) {
    const initialLength = category.products.length;
    category.products = category.products.filter(prod => prod.id !== productId);

    if (category.products.length < initialLength) {
      found = true;
      break;
    }
  }

  if (!found) {
    return res.status(404).json({ error: 'Produit non trouvé.' });
  }

  saveMenu(menu);
  res.json({ success: true, message: 'Produit supprimé.' });
});

module.exports = router;

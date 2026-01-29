# 📱 Guide d'utilisation - Système de commande QR Code

## 🎯 Ce qui a été créé

Votre système de commande est maintenant **100% fonctionnel** ! Voici ce qui a été développé :

### ✅ Frontend Client (Page de commande)
- ✨ Design moderne avec **Tailwind CSS**
- 📱 **Responsive parfait** : mobile, tablette, desktop
- 🎨 Interface élégante et intuitive
- 🛒 Panier intelligent avec +/- sur chaque produit
- ✔️ Formulaire de commande (table, nom, commentaire)
- 🔔 Confirmations visuelles

### ✅ Backend API (Node.js/Express)
- ⚡ API REST complète
- 🔒 Protection anti-spam (rate limiting)
- ✅ Validation des données côté serveur
- 💾 Stockage JSON simple et fiable
- 🔄 Temps réel via Server-Sent Events

### ✅ Interface Admin (Dashboard)
- 📊 Statistiques en temps réel
- 🔔 **Notifications instantanées** quand une commande arrive
- 🎵 Son de notification
- 📋 Gestion des statuts (nouvelle → préparation → prête → servie)
- 🗑️ Suppression et nettoyage des commandes
- 🎨 Interface moderne et pratique

### ✅ Fonctionnalités incluses
- Menu avec 4 catégories (boissons, snacks, planches, sandwichs)
- Produits modifiables facilement
- Calcul automatique du total
- Sauvegarde du panier (localStorage)
- Animations fluides
- Gestion d'erreurs complète

---

## 🚀 Comment utiliser

### 1️⃣ Démarrer le serveur

```bash
cd /Users/yacine/qr-order-system
npm start
```

Le serveur démarre sur **http://localhost:3000**

### 2️⃣ Accéder aux interfaces

| Interface | URL | Utilisation |
|-----------|-----|-------------|
| **Menu client** | http://localhost:3000 | Page que vos clients verront |
| **Admin** | http://localhost:3000/admin | Tableau de bord pour recevoir les commandes |
| **API** | http://localhost:3000/api | Endpoints API |

### 3️⃣ Tester le système

**Sur votre ordinateur :**

1. Ouvrez **http://localhost:3000** dans un navigateur (pour le client)
2. Ouvrez **http://localhost:3000/admin** dans un autre onglet (pour l'admin)
3. Sur la page client :
   - Ajoutez des produits au panier
   - Cliquez sur "Commander"
   - Remplissez le formulaire (table, nom)
   - Validez
4. Sur la page admin :
   - Vous verrez la commande arriver **instantanément**
   - Un son se joue
   - Vous pouvez changer le statut
   - Gérer les commandes

**Sur mobile :**

1. Trouvez votre IP locale :
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   # Cherchez votre IP locale (ex: 192.168.1.X)
   ```

2. Sur votre téléphone, accédez à : `http://VOTRE_IP:3000`
   - Exemple : `http://192.168.1.45:3000`

---

## 📝 Personnaliser le menu

Éditez le fichier : `server/data/menu.json`

```json
{
  "categories": [
    {
      "id": "boissons",
      "name": "Boissons",
      "icon": "☕",
      "products": [
        {
          "id": "cafe",
          "name": "Café",
          "price": 2.50,
          "description": "Espresso italien"
        }
      ]
    }
  ]
}
```

**Après modification :**
- Pas besoin de redémarrer le serveur
- Les changements sont pris en compte immédiatement

---

## 🎨 Personnaliser l'apparence

### Couleurs principales

Éditez `client/index.html` (ligne 14-20) :

```javascript
colors: {
  primary: '#6366f1',    // Couleur principale (bleu indigo)
  secondary: '#8b5cf6',  // Couleur secondaire (violet)
  success: '#10b981',    // Vert (confirmations)
  danger: '#ef4444',     // Rouge (alertes)
  warning: '#f59e0b'     // Orange (avertissements)
}
```

### Logo et nom

Dans `client/index.html` (ligne 37-41), changez :
- L'emoji 🍽️ par votre logo
- "Menu" par le nom de votre établissement

---

## 🔧 Configuration avancée

### Modifier le port

`server/config.js` :
```javascript
PORT: process.env.PORT || 3000
```

### Rate limiting (anti-spam)

`server/config.js` :
```javascript
RATE_LIMIT: {
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // max 100 requêtes
}
```

### Paramètres de commande

`server/config.js` :
```javascript
ORDER_SETTINGS: {
  maxItemsPerOrder: 50,      // Max produits par commande
  maxCommentLength: 200,     // Max caractères commentaire
  requireTable: true         // Table obligatoire
}
```

---

## 🌐 Mettre en production (déploiement)

### Option 1 : Render.com (gratuit, recommandé)

1. Créez un compte sur https://render.com
2. Connectez votre GitHub
3. Créez un nouveau "Web Service"
4. Configurez :
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Port** : 3000
5. Déployez !

Votre URL sera : `https://votre-app.onrender.com`

### Option 2 : Railway.app (gratuit aussi)

1. Compte sur https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Sélectionnez votre repo
4. Railway détecte automatiquement Node.js
5. Déployez !

### Option 3 : VPS (contrôle total)

Si vous avez un serveur :

```bash
# Sur le serveur
git clone votre-repo
cd qr-order-system
npm install
npm install -g pm2
pm2 start server/index.js --name qr-order
pm2 save
```

---

## 📱 Générer les QR Codes

### Méthode simple (en ligne)

1. Allez sur https://www.qr-code-generator.com/
2. Entrez votre URL de production : `https://votre-domaine.com`
3. Téléchargez en haute résolution
4. Imprimez (minimum 5x5 cm)
5. Plastifiez et placez sur les tables

### Méthode avancée (par table)

Pour avoir un QR code par table qui pré-remplit le numéro :

**1. Modifiez `client/app.js`** pour gérer le paramètre URL :

Ajoutez dans la méthode `init()` (ligne 8) :
```javascript
// Récupérer le numéro de table depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const tableNumber = urlParams.get('table');
if (tableNumber) {
  document.getElementById('table-number').value = tableNumber;
}
```

**2. Générez les QR codes :**

```bash
# Installer l'outil
npm install -g qrcode-terminal qrcode

# Générer (remplacez par votre vraie URL)
qrcode -o qr-codes/table-1.png "https://votre-domaine.com?table=1"
qrcode -o qr-codes/table-2.png "https://votre-domaine.com?table=2"
# etc...
```

---

## 🔍 Structure des fichiers

```
qr-order-system/
│
├── client/                    # 🎨 Frontend client
│   ├── index.html            # Page principale
│   ├── styles.css            # Styles personnalisés
│   ├── app.js                # Logique application
│   └── config.js             # Configuration API
│
├── server/                    # ⚙️ Backend
│   ├── index.js              # Serveur Express
│   ├── config.js             # Configuration serveur
│   ├── data/
│   │   ├── menu.json         # 📋 MENU (à modifier)
│   │   └── orders.json       # 📦 Commandes stockées
│   ├── routes/
│   │   ├── orders.js         # API commandes
│   │   └── menu.js           # API menu
│   └── middleware/
│       ├── rateLimiter.js    # Anti-spam
│       └── validator.js      # Validation
│
├── admin/                     # 👨‍💼 Interface admin
│   ├── dashboard.html        # Tableau de bord
│   └── admin.js              # Logique admin
│
├── qr-codes/                  # 📱 QR codes
│   └── README.md             # Guide génération
│
├── package.json              # Dépendances npm
├── README.md                 # Documentation technique
└── GUIDE_UTILISATEUR.md      # Ce fichier
```

---

## 🎯 Prochaines étapes

### Immédiatement
1. ✅ Tester le système localement
2. ✅ Personnaliser le menu avec vos produits
3. ✅ Adapter les couleurs à votre charte
4. ✅ Tester sur mobile

### Avant le lancement
1. 📝 Choisir un hébergement (Render/Railway)
2. 🌐 Déployer l'application
3. 📱 Générer les QR codes
4. 🖨️ Imprimer et plastifier les QR codes
5. 🧪 Tests avec votre équipe

### Améliorations futures possibles
- 🔔 Notifications par email
- 📊 Statistiques avancées
- 🖼️ Images des produits
- 🌙 Mode sombre
- 🇬🇧 Multilingue
- 💾 Export des commandes (CSV/Excel)
- 🔐 Authentification admin

---

## ❓ FAQ

### Le serveur ne démarre pas ?
```bash
# Vérifier que le port 3000 est libre
lsof -i :3000

# Tuer le processus si nécessaire
kill -9 PID
```

### Les commandes n'arrivent pas en temps réel ?
- Vérifiez le statut de connexion dans l'admin (point vert = OK)
- Rafraîchissez la page admin
- Vérifiez la console navigateur (F12) pour les erreurs

### Modifier le menu ne fonctionne pas ?
- Vérifiez la syntaxe JSON sur https://jsonlint.com/
- Assurez-vous de sauvegarder le fichier
- Le menu est rechargé à chaque requête (pas besoin de redémarrer)

### Erreur 404 ?
- Vérifiez que le serveur est bien démarré
- L'URL doit être exactement : `http://localhost:3000`
- Pour l'admin : `http://localhost:3000/admin`

---

## 💡 Conseils d'utilisation

### Pour l'équipe
- Gardez la page admin ouverte en permanence
- Le son de notification peut être désactivé (modifier `server/config.js`)
- Utilisez les filtres pour voir uniquement les commandes pertinentes
- Nettoyez régulièrement les anciennes commandes

### Pour les clients
- QR codes bien visibles sur les tables
- Affiche explicative : "Scannez pour commander"
- Rappel : "Paiement au comptoir"

### Sécurité
- Le rate limiting protège contre le spam
- Pas de données sensibles stockées
- Validation complète côté serveur
- Pour une vraie production, ajoutez HTTPS

---

## 📞 Support

Si vous rencontrez un problème :

1. Consultez la console du navigateur (F12)
2. Vérifiez les logs du serveur
3. Consultez ce guide
4. Relisez le README.md

---

## 🎉 Félicitations !

Votre système de commande QR Code est **prêt à l'emploi** !

**Avantages de cette solution :**
- ✅ 100% gratuite (hors hébergement optionnel)
- ✅ Aucune commission
- ✅ Contrôle total
- ✅ Facile à maintenir
- ✅ Évolutive selon vos besoins
- ✅ Code propre et moderne
- ✅ Responsive sur tous les appareils

**Bon service ! 🍽️**

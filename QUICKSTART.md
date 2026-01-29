# ⚡ Quick Start - Démarrage rapide

Guide ultra-rapide pour tester le système en 2 minutes !

---

## 🚀 En 3 étapes

### 1️⃣ Démarrer le serveur

```bash
cd /Users/yacine/qr-order-system
npm start
```

Vous devriez voir :
```
╔════════════════════════════════════════╗
║   🍽️  QR Order System                 ║
║   Serveur démarré avec succès !       ║
║   🌐 Client: http://localhost:3000     ║
║   👨‍💼 Admin:  http://localhost:3000/admin ║
╚════════════════════════════════════════╝
```

✅ **Le serveur est prêt !**

### 2️⃣ Tester l'interface client

1. Ouvrez votre navigateur
2. Allez sur : **http://localhost:3000**
3. Vous voyez le menu avec 4 catégories
4. Cliquez sur **"Ajouter"** sur quelques produits
5. Le panier se remplit (badge rouge en haut à droite)
6. Cliquez sur le panier (icône en haut à droite sur mobile)
7. Cliquez sur **"Commander"**
8. Remplissez :
   - **Table** : 12 (par exemple)
   - **Nom** : Marie (optionnel)
   - **Commentaire** : Sans glace (optionnel)
9. Cliquez sur **"Valider"**
10. ✅ Message de confirmation !

### 3️⃣ Voir la commande dans l'admin

1. Ouvrez un **nouvel onglet**
2. Allez sur : **http://localhost:3000/admin**
3. 🎵 Vous entendez un son !
4. Vous voyez la commande apparaître instantanément
5. Testez les boutons :
   - **"Préparer"** → statut change en "En préparation"
   - **"Prête"** → statut change en "Prête"
   - **"Servir"** → statut change en "Servie"

✅ **Le système fonctionne parfaitement !**

---

## 📱 Tester sur mobile (même WiFi)

### Trouver votre IP

```bash
# Mac
ipconfig getifaddr en0
# Vous obtenez quelque chose comme : 192.168.1.45
```

### Accéder depuis votre téléphone

1. Sur votre téléphone, ouvrez le navigateur
2. Tapez : `http://VOTRE_IP:3000`
3. Exemple : `http://192.168.1.45:3000`
4. Le menu s'affiche en version mobile
5. Testez le panier et la commande

✅ **Responsive parfait !**

---

## 🎨 Personnalisation rapide

### Modifier le menu

```bash
# Ouvrir le fichier menu
nano server/data/menu.json

# Ou avec VS Code
code server/data/menu.json
```

Modifiez les produits, prix, catégories...

**Pas besoin de redémarrer !** Rechargez juste la page client.

### Changer les couleurs

Éditez `client/index.html` (ligne 16) :

```javascript
colors: {
  primary: '#6366f1',    // Couleur principale → changez-la !
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b'
}
```

Exemples :
- Rouge : `#ef4444`
- Vert : `#10b981`
- Bleu : `#3b82f6`
- Orange : `#f97316`
- Rose : `#ec4899`

Rechargez la page pour voir les changements.

---

## 🧪 Tests rapides

### Tester l'API

```bash
# Santé du serveur
curl http://localhost:3000/api/health

# Voir le menu
curl http://localhost:3000/api/menu

# Voir les commandes
curl http://localhost:3000/api/orders
```

### Valider le menu

```bash
npm run test-menu
```

Vous verrez :
```
📋 4 catégories trouvées
📂 Catégorie 1: Boissons ☕
   6 produits
   - Café : 2.50 €
   ...
✅ Menu valide ! Aucune erreur détectée.
```

---

## 🎯 Scénario de test complet

### Simuler une vraie utilisation

1. **Client commande** (http://localhost:3000)
   - Ajouter : 1 Café, 2 Bières, 1 Planche mixte
   - Table : 5
   - Nom : Jean
   - Valider

2. **Admin reçoit** (http://localhost:3000/admin)
   - 🔔 Notification sonore
   - Commande apparaît avec badge rouge "Nouvelle"
   - Clic "Préparer" → badge devient orange

3. **Client recommande** (même page)
   - Nouveau panier : 1 Sandwich poulet, 1 Eau
   - Table : 5
   - Valider

4. **Admin gère** (même page admin)
   - 2 commandes pour la table 5
   - Première commande → "Prête" puis "Servir"
   - Deuxième commande → "Préparer"

5. **Nettoyage** (terminal)
   ```bash
   npm run clear-orders
   # Choisir option 2 : supprimer servies/annulées
   ```

✅ **Cycle complet testé !**

---

## 📊 Vérifier les données

### Voir les commandes stockées

```bash
cat server/data/orders.json
```

### Voir le menu

```bash
cat server/data/menu.json
```

### Sauvegarder

```bash
npm run backup
```

Les sauvegardes sont dans : `backups/`

---

## 🐛 Dépannage rapide

### Le serveur ne démarre pas

```bash
# Tuer le processus sur le port 3000
lsof -ti:3000 | xargs kill -9

# Redémarrer
npm start
```

### La page ne se charge pas

1. Vérifiez que le serveur est démarré
2. Vérifiez l'URL : `http://localhost:3000` (pas de "s")
3. Essayez `http://127.0.0.1:3000`

### Les commandes n'arrivent pas

1. Ouvrez la console navigateur (F12)
2. Vérifiez les erreurs
3. Rechargez la page admin
4. Vérifiez le statut de connexion (point vert)

---

## 📱 Demo vidéo (simulation)

### Scénario parfait pour montrer le système

**Préparation :**
1. Ordinateur avec admin ouvert
2. Téléphone avec page client
3. Son activé pour la notification

**Démo :**
1. 📱 Sur mobile : "Je scanne le QR code"
2. 📱 "Je vois le menu"
3. 📱 "J'ajoute des produits au panier"
4. 📱 "Je valide ma commande, table 3"
5. 💻 Sur PC : 🎵 Son ! Commande apparaît
6. 💻 "Je clique 'Préparer'"
7. 💻 "Quelques instants plus tard : 'Prête'"
8. 💻 "Le client vient chercher : 'Servir'"

**Temps total : 30 secondes !**

---

## 🎓 Exercices pratiques

### Niveau 1 : Débutant

- [ ] Démarrer le serveur
- [ ] Passer une commande
- [ ] Voir la commande dans l'admin
- [ ] Changer le statut
- [ ] Nettoyer les commandes

### Niveau 2 : Intermédiaire

- [ ] Modifier le menu (ajouter un produit)
- [ ] Changer la couleur principale
- [ ] Tester sur mobile (réseau local)
- [ ] Faire une sauvegarde
- [ ] Valider le menu avec le script

### Niveau 3 : Avancé

- [ ] Créer une nouvelle catégorie
- [ ] Ajouter 5 produits
- [ ] Personnaliser le design
- [ ] Tester l'API avec curl
- [ ] Simuler 10 commandes

---

## 💡 Astuces

### Raccourcis clavier

**Dans la page client :**
- `Ctrl + R` : Recharger
- `F12` : Console développeur
- `Ctrl + Shift + M` : Mode mobile (Chrome/Edge)

**Dans l'admin :**
- `Ctrl + R` : Recharger (reconnexion SSE)
- `F12` : Voir les logs

### Workflow rapide

```bash
# Terminal 1 : Serveur
npm start

# Terminal 2 : Tests
npm run test-menu
npm run backup

# Navigateur
# Onglet 1 : http://localhost:3000 (client)
# Onglet 2 : http://localhost:3000/admin (admin)
```

---

## 📚 Aller plus loin

Après avoir testé :

1. **Personnaliser** → `GUIDE_UTILISATEUR.md`
2. **Déployer** → `DEPLOYMENT.md`
3. **Maintenance** → `COMMANDES.md`
4. **Vue d'ensemble** → `OVERVIEW.md`

---

## ✅ Checklist finale

Avant de considérer le système prêt :

- [ ] Le serveur démarre sans erreur
- [ ] La page client s'affiche correctement
- [ ] Le menu se charge
- [ ] Je peux ajouter au panier
- [ ] Je peux passer une commande
- [ ] La commande arrive dans l'admin
- [ ] Le son de notification fonctionne
- [ ] Je peux changer les statuts
- [ ] Ça fonctionne sur mobile
- [ ] Le menu est personnalisé
- [ ] Les couleurs me plaisent

**Toutes les cases cochées ? Vous êtes prêt ! 🚀**

---

## 🎉 Félicitations !

Vous maîtrisez maintenant votre système de commande QR code !

**Prochaine étape : déploiement en production !**

*Consultez `DEPLOYMENT.md` pour mettre votre système en ligne.*

---

**Questions ? Consultez d'abord `GUIDE_UTILISATEUR.md` !**

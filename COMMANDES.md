# 📝 Aide-mémoire - Commandes utiles

Guide rapide des commandes pour utiliser et gérer votre système.

---

## 🚀 Démarrage

```bash
# Démarrer le serveur
npm start

# Démarrer en mode développement (redémarre automatiquement)
npm run dev
```

**Accès après démarrage :**
- Client : http://localhost:3000
- Admin : http://localhost:3000/admin
- API : http://localhost:3000/api

---

## 🧪 Tests et validation

```bash
# Valider le menu (structure JSON)
npm run test-menu

# Tester l'API (santé du serveur)
curl http://localhost:3000/api/health

# Voir le menu via API
curl http://localhost:3000/api/menu

# Voir les commandes via API
curl http://localhost:3000/api/orders
```

---

## 🗑️ Nettoyage

```bash
# Nettoyer les commandes (interactif)
npm run clear-orders

# Options disponibles :
# 1. Supprimer TOUTES les commandes
# 2. Supprimer uniquement les servies et annulées
# 3. Annuler
```

---

## 💾 Sauvegarde

```bash
# Créer une sauvegarde complète
npm run backup

# Les sauvegardes sont stockées dans : backups/
# Format : backup-YYYY-MM-DD-HH-mm.json
```

---

## 📝 Modification du menu

```bash
# Éditer le menu
nano server/data/menu.json
# ou
code server/data/menu.json  # Si VS Code

# Valider après modification
npm run test-menu

# Pas besoin de redémarrer le serveur !
```

---

## 🔧 Maintenance

```bash
# Voir les commandes du jour
cat server/data/orders.json | grep "$(date +%Y-%m-%d)"

# Compter les commandes
cat server/data/orders.json | jq 'length'
# (nécessite jq : brew install jq)

# Sauvegarder manuellement
cp server/data/orders.json server/data/orders-backup-$(date +%Y%m%d).json
cp server/data/menu.json server/data/menu-backup.json
```

---

## 🌐 Réseau local (tests sur mobile)

```bash
# Trouver votre IP locale
ifconfig | grep "inet " | grep -v 127.0.0.1
# ou
ipconfig getifaddr en0  # Mac WiFi
ipconfig getifaddr en1  # Mac Ethernet

# Accès depuis mobile (même réseau WiFi)
# http://VOTRE_IP:3000
# Exemple : http://192.168.1.45:3000
```

---

## 📱 QR Codes

```bash
# Installer l'outil de génération
npm install -g qrcode

# Générer un QR code
qrcode -o qr-codes/table-1.png "http://votre-url.com?table=1"

# Générer plusieurs QR codes (bash)
for i in {1..10}; do
  qrcode -o qr-codes/table-$i.png "http://votre-url.com?table=$i"
done
```

---

## 🐛 Debugging

```bash
# Voir les logs du serveur (si lancé avec pm2)
pm2 logs qr-order

# Arrêter le serveur (si lancé avec pm2)
pm2 stop qr-order

# Redémarrer le serveur (si lancé avec pm2)
pm2 restart qr-order

# Voir le statut (si lancé avec pm2)
pm2 status

# Tuer un processus qui bloque le port 3000
lsof -ti:3000 | xargs kill -9
```

---

## 📦 Git (versioning)

```bash
# Initialiser Git
git init
git add .
git commit -m "Initial commit"

# Ajouter des modifications
git add .
git commit -m "Mise à jour du menu"

# Pousser vers GitHub
git remote add origin https://github.com/USERNAME/qr-order-system.git
git branch -M main
git push -u origin main

# Mises à jour ultérieures
git add .
git commit -m "Description des changements"
git push
```

---

## 🚀 Déploiement

```bash
# Vérifier que tout fonctionne en local
npm start
npm run test-menu

# Pousser vers GitHub (déclenche auto-deploy sur Render/Railway)
git add .
git commit -m "Ready for production"
git push

# Le site se met à jour automatiquement en 2-3 minutes
```

---

## 🔄 Mises à jour

```bash
# Mettre à jour les dépendances npm
npm update

# Vérifier les vulnérabilités
npm audit

# Corriger les vulnérabilités automatiquement
npm audit fix
```

---

## 📊 Statistiques

```bash
# Nombre total de commandes
cat server/data/orders.json | jq 'length'

# Commandes par statut
cat server/data/orders.json | jq 'group_by(.status) | map({status: .[0].status, count: length})'

# Total des ventes du jour
cat server/data/orders.json | jq '[.[] | select(.timestamp | startswith("2024-01-29")) | .total] | add'
# (remplacer la date)

# Table la plus commandée
cat server/data/orders.json | jq 'group_by(.table) | map({table: .[0].table, orders: length}) | sort_by(-.orders)'
```

---

## 🎨 Personnalisation rapide

```bash
# Changer la couleur principale (primary)
# Éditer client/index.html ligne 16
# primary: '#6366f1' → votre couleur

# Changer le titre
# Éditer client/index.html ligne 38
# <h1>Menu</h1> → <h1>Votre nom</h1>

# Ajouter un logo
# Remplacer l'emoji 🍽️ (ligne 37) par :
# <img src="logo.png" alt="Logo" class="w-8 h-8">
# Puis placer logo.png dans client/
```

---

## 🔐 Sécurité

```bash
# Changer le rate limit
# Éditer server/config.js
# max: 100 → votre valeur

# Désactiver le son de notification admin
# Éditer server/config.js
# NOTIFICATIONS: { sound: false }

# Limiter CORS à votre domaine
# Éditer server/config.js
# CORS_ORIGIN: 'https://votre-domaine.com'
```

---

## 📱 Raccourcis production

```bash
# SSH vers votre serveur
ssh user@votre-serveur.com

# Une fois connecté :
cd qr-order-system

# Voir les logs
pm2 logs qr-order

# Redémarrer
pm2 restart qr-order

# Sauvegarder
npm run backup

# Télécharger les sauvegardes
scp user@serveur:~/qr-order-system/backups/*.json ./local-backups/
```

---

## ⚡ Commandes d'urgence

```bash
# Le serveur ne répond plus
pm2 restart qr-order

# Réinitialiser toutes les commandes
echo "[]" > server/data/orders.json

# Restaurer le menu par défaut
git checkout server/data/menu.json

# Port 3000 occupé
lsof -ti:3000 | xargs kill -9
npm start
```

---

## 📞 Diagnostics

```bash
# Tester si le serveur répond
curl http://localhost:3000/api/health

# Tester une commande (simulation)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "table": "Test",
    "name": "Test",
    "items": [{"id":"cafe","name":"Café","price":2.5,"quantity":1}],
    "total": 2.5
  }'

# Voir les en-têtes de réponse
curl -I http://localhost:3000

# Tester le temps de réponse
time curl http://localhost:3000/api/menu
```

---

## 🎯 Workflow quotidien

```bash
# Matin
npm start                    # Démarrer le serveur
npm run backup              # Sauvegarder les données
# Ouvrir admin dans navigateur

# Fin de journée
npm run backup              # Sauvegarder
npm run clear-orders        # Nettoyer (option 2)
# Garder le serveur actif ou :
pm2 stop qr-order           # Si vous l'arrêtez
```

---

## 💡 Astuces

### Ouvrir automatiquement l'admin au démarrage

Ajoutez à `package.json` :
```json
"scripts": {
  "start": "node server/index.js",
  "start:open": "npm start & sleep 2 && open http://localhost:3000/admin"
}
```

Puis : `npm run start:open`

### Raccourci pour voir les nouvelles commandes

```bash
# Ajouter à .bashrc ou .zshrc
alias orders="cat ~/qr-order-system/server/data/orders.json | jq '.[] | select(.status==\"nouvelle\")'"
```

Puis : `orders` affiche les nouvelles commandes

### Notification email des nouvelles commandes

Nécessite configuration supplémentaire (disponible sur demande)

---

## 📚 Fichiers importants

| Fichier | Description |
|---------|-------------|
| `server/data/menu.json` | 📋 Menu (produits et prix) |
| `server/data/orders.json` | 📦 Toutes les commandes |
| `server/config.js` | ⚙️ Configuration serveur |
| `client/index.html` | 🎨 Interface client |
| `admin/dashboard.html` | 👨‍💼 Interface admin |

---

## 🆘 En cas de problème

1. Vérifier les logs : terminal où `npm start` est lancé
2. Vérifier la console navigateur : F12
3. Tester l'API : `curl http://localhost:3000/api/health`
4. Redémarrer : Ctrl+C puis `npm start`
5. Vérifier le menu : `npm run test-menu`

---

## 📖 Documentation complète

- Guide utilisateur : `GUIDE_UTILISATEUR.md`
- Guide déploiement : `DEPLOYMENT.md`
- README technique : `README.md`

---

**Besoin d'aide ? Consultez d'abord ces fichiers ! 📚**

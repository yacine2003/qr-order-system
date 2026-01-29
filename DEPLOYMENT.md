# 🚀 Guide de déploiement en production

Ce guide vous explique comment mettre votre système en ligne pour qu'il soit accessible depuis Internet.

---

## 📋 Avant de commencer

### ✅ Checklist pré-déploiement

- [ ] Le système fonctionne en local
- [ ] Le menu est configuré avec vos produits
- [ ] Les couleurs/design sont personnalisés
- [ ] Vous avez testé sur mobile
- [ ] Vous avez un compte GitHub (pour faciliter le déploiement)

---

## 🎯 Option 1 : Render.com (Recommandé - Gratuit)

### Pourquoi Render ?
- ✅ **Gratuit** (750h/mois)
- ✅ Déploiement automatique depuis GitHub
- ✅ HTTPS gratuit
- ✅ Très simple à configurer
- ✅ Logs et monitoring inclus

### Étapes

#### 1. Préparer le code pour Render

Vérifiez que `server/config.js` utilise bien `process.env.PORT` :
```javascript
PORT: process.env.PORT || 3000
```
✅ C'est déjà fait !

#### 2. Créer un compte GitHub et pousser le code

```bash
# Si pas encore fait
cd /Users/yacine/qr-order-system
git init
git add .
git commit -m "Initial commit - QR Order System"

# Créer un repo sur github.com puis :
git remote add origin https://github.com/VOTRE-USERNAME/qr-order-system.git
git branch -M main
git push -u origin main
```

#### 3. Déployer sur Render

1. Allez sur https://render.com
2. Inscrivez-vous (gratuit)
3. Cliquez sur **"New +"** → **"Web Service"**
4. Connectez votre compte GitHub
5. Sélectionnez le repository `qr-order-system`
6. Configurez :
   
   **Configuration :**
   - **Name** : `qr-order-system` (ou votre choix)
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Instance Type** : `Free`

7. Cliquez sur **"Create Web Service"**
8. Attendez 2-3 minutes ⏳

✅ **Terminé !** Votre URL sera : `https://qr-order-system.onrender.com`

#### 4. Configurer les variables d'environnement (optionnel)

Dans Render Dashboard → Environment :
```
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
```

#### 5. Déploiement automatique

✨ À chaque push sur GitHub, Render redéploie automatiquement !

```bash
# Après modifications
git add .
git commit -m "Mise à jour menu"
git push

# Render redéploie automatiquement en 2 minutes
```

---

## 🎯 Option 2 : Railway.app (Alternative gratuite)

### Pourquoi Railway ?
- ✅ **Gratuit** (500h/mois)
- ✅ Plus rapide que Render
- ✅ Interface moderne
- ✅ Base de données incluse si besoin plus tard

### Étapes

1. Allez sur https://railway.app
2. Inscrivez-vous avec GitHub
3. **"New Project"** → **"Deploy from GitHub repo"**
4. Sélectionnez `qr-order-system`
5. Railway détecte automatiquement Node.js
6. **"Deploy"**

✅ URL fournie : `https://qr-order-system.up.railway.app`

**Variables d'environnement :**
Settings → Variables → Add :
```
PORT=$PORT
NODE_ENV=production
```

---

## 🎯 Option 3 : Vercel (Frontend uniquement)

**⚠️ Attention :** Vercel est optimisé pour les sites statiques. Pour un backend Node.js, préférez Render ou Railway.

Si vous voulez quand même :
1. Installer Vercel CLI : `npm i -g vercel`
2. `vercel` dans le dossier projet
3. Suivre les instructions

---

## 🎯 Option 4 : VPS (OVH, DigitalOcean, etc.)

### Pour qui ?
- Vous voulez un contrôle total
- Vous avez déjà un serveur
- Budget : ~5€/mois

### Étapes

#### 1. Sur votre serveur (Ubuntu/Debian)

```bash
# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2 (process manager)
sudo npm install -g pm2

# Cloner le projet
git clone https://github.com/VOTRE-USERNAME/qr-order-system.git
cd qr-order-system

# Installer les dépendances
npm install

# Lancer avec PM2
pm2 start server/index.js --name qr-order
pm2 save
pm2 startup
```

#### 2. Configurer Nginx (reverse proxy)

```bash
sudo apt install nginx

# Créer la configuration
sudo nano /etc/nginx/sites-available/qr-order
```

Contenu :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activer :
```bash
sudo ln -s /etc/nginx/sites-available/qr-order /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 3. HTTPS avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

✅ Votre site est maintenant en HTTPS !

---

## 🌐 Nom de domaine

### Option 1 : Sous-domaine gratuit

Render et Railway fournissent des URLs gratuites :
- `https://mon-resto.onrender.com`
- `https://mon-resto.up.railway.app`

### Option 2 : Domaine personnalisé

**Acheter un domaine (8-15€/an) :**
- OVH : https://www.ovh.com
- Namecheap : https://www.namecheap.com
- Gandi : https://www.gandi.net

**Configurer le DNS :**

Pour Render/Railway :
1. Dans votre registrar, ajoutez un enregistrement CNAME :
   ```
   Type: CNAME
   Name: commande (ou www)
   Value: votre-app.onrender.com
   ```

2. Dans Render/Railway :
   - Settings → Custom Domain
   - Ajouter : `commande.votre-domaine.com`

✅ Votre site sera accessible sur : `https://commande.votre-domaine.com`

---

## 📱 Après le déploiement

### 1. Tester l'application

Vérifiez :
- ✅ La page client s'affiche correctement
- ✅ Le menu se charge
- ✅ On peut ajouter au panier
- ✅ Les commandes s'envoient
- ✅ L'admin reçoit les commandes en temps réel
- ✅ Sur mobile (responsive)

### 2. Générer les QR Codes

Maintenant que vous avez votre URL de production :

**Méthode simple :**
1. https://www.qr-code-generator.com/
2. URL : `https://votre-app.onrender.com`
3. Télécharger en haute résolution
4. Imprimer (min 5x5 cm)

**QR codes par table :**
```bash
# URL format : https://votre-app.onrender.com?table=1
qrcode -o qr-codes/table-1.png "https://votre-app.onrender.com?table=1"
qrcode -o qr-codes/table-2.png "https://votre-app.onrender.com?table=2"
# etc.
```

### 3. Imprimer et installer

1. Imprimez les QR codes (min 5x5 cm)
2. Plastifiez-les (protection)
3. Placez-les sur les tables
4. Testez le scan avec votre téléphone

---

## 🔧 Maintenance

### Mettre à jour le menu

**Méthode 1 : Via GitHub (si déployé sur Render/Railway)**
```bash
# Modifier server/data/menu.json
git add server/data/menu.json
git commit -m "Mise à jour menu"
git push

# Le site se met à jour automatiquement en 2 minutes
```

**Méthode 2 : SSH (si VPS)**
```bash
ssh votre-serveur
cd qr-order-system
nano server/data/menu.json
# Modifier et sauvegarder
pm2 restart qr-order
```

### Sauvegarder les commandes

```bash
# En local
npm run backup

# Sur VPS
ssh votre-serveur
cd qr-order-system
npm run backup
scp votre-serveur:~/qr-order-system/backups/*.json ./local-backups/
```

### Surveiller les logs

**Render :**
- Dashboard → Logs

**Railway :**
- Deployment → View Logs

**VPS :**
```bash
pm2 logs qr-order
```

---

## 🛡️ Sécurité

### Production checklist

- [ ] HTTPS activé (automatique sur Render/Railway)
- [ ] Rate limiting configuré (✅ déjà fait)
- [ ] Validation des données (✅ déjà fait)
- [ ] CORS configuré correctement
- [ ] Pas de données sensibles dans le code
- [ ] .gitignore configuré (✅ déjà fait)

### Recommandations

1. **Protéger l'interface admin** (future amélioration)
   - Ajouter une authentification simple
   - Limiter l'accès par IP si possible

2. **Monitoring**
   - Render/Railway ont des alertes intégrées
   - Configurez les notifications par email

3. **Sauvegardes**
   - Automatisez `npm run backup` avec un cron
   - Stockez les backups ailleurs (Dropbox, Google Drive)

---

## ⚡ Optimisations (optionnel)

### CDN pour les assets

Si vous avez beaucoup de trafic :
- Cloudflare (gratuit) devant votre app
- Cache des assets statiques

### Compression

Déjà inclus dans Express, mais vous pouvez ajouter :
```bash
npm install compression
```

Dans `server/index.js` :
```javascript
const compression = require('compression');
app.use(compression());
```

---

## 🚨 Troubleshooting

### L'app ne démarre pas sur Render

- Vérifiez les logs
- Assurez-vous que `npm start` fonctionne en local
- Vérifiez `package.json` → `"start": "node server/index.js"`

### Erreur CORS

Dans `server/config.js` :
```javascript
CORS_ORIGIN: '*'  // Pour autoriser tous les domaines
// Ou
CORS_ORIGIN: 'https://votre-domaine.com'  // Pour un domaine spécifique
```

### Les commandes n'arrivent pas en temps réel

- Server-Sent Events peut avoir des problèmes sur certains hébergeurs
- Solution : polling (requête toutes les 5 secondes) - implémentation disponible sur demande

### Cold start (Render gratuit)

- L'app s'endort après 15min d'inactivité
- Premier accès : 30 secondes de chargement
- Solutions :
  - Payer 7$/mois pour garder l'app active
  - Utiliser un service de ping (UptimeRobot)

---

## 💰 Coûts estimés

| Solution | Coût/mois | Avantages |
|----------|-----------|-----------|
| **Render Free** | 0€ | Simple, HTTPS, auto-deploy |
| **Railway Free** | 0€ | Plus rapide, moderne |
| **Render Paid** | 7€ | Pas de cold start |
| **VPS OVH** | 3-5€ | Contrôle total |
| **Domaine** | 1€ | Professionnel |

**Recommandation startup : Render Free + domaine = ~1€/mois**

---

## 🎯 Récapitulatif : Quick Start Production

```bash
# 1. Pousser sur GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/qr-order-system.git
git push -u origin main

# 2. Déployer sur Render
# → render.com → New Web Service → Connecter GitHub → Deploy

# 3. Récupérer l'URL
# https://qr-order-system.onrender.com

# 4. Générer QR codes
qrcode -o table-1.png "https://qr-order-system.onrender.com?table=1"

# 5. Tester et utiliser !
```

---

## 📞 Support déploiement

Si vous rencontrez un problème :

1. Consultez les logs de votre plateforme
2. Vérifiez que `npm start` fonctionne en local
3. Relisez ce guide
4. Cherchez l'erreur sur Google
5. Documentation officielle :
   - Render : https://render.com/docs
   - Railway : https://docs.railway.app

---

## ✅ Une fois déployé

**Félicitations ! 🎉**

Votre système est maintenant accessible mondialement !

**Prochaines étapes :**
1. ✅ Imprimez les QR codes
2. ✅ Testez avec votre équipe
3. ✅ Lancez le service
4. 📊 Surveillez les commandes
5. 💡 Récoltez les feedbacks pour améliorer

**Bon service ! 🍽️**

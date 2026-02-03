# ⚙️ Gestion des Paramètres Admin

## 🎯 Nouvelle fonctionnalité

Vous pouvez maintenant **modifier vos identifiants admin directement depuis l'interface web**, sans avoir à toucher au code ou aux fichiers du serveur !

---

## 🚀 Comment y accéder

### Depuis le Dashboard Admin

1. Connectez-vous à l'admin : `http://localhost:3000/admin`
2. Cliquez sur le bouton **"⚙️ Paramètres"** dans le header
3. Vous arrivez sur la page de paramètres

### Depuis la Gestion du Menu

1. Dans la page de gestion du menu
2. Cliquez sur **"⚙️ Paramètres"** dans le header

### URL directe

```
http://localhost:3000/admin/settings.html
```

---

## 📝 Comment modifier les identifiants

### Étapes :

1. **Connectez-vous** à l'admin avec vos identifiants actuels

2. **Accédez aux paramètres** (bouton "⚙️ Paramètres")

3. **Remplissez le formulaire** :
   - **Mot de passe actuel** : Entrez votre mot de passe actuel (sécurité)
   - **Nouveau nom d'utilisateur** : Choisissez un nouveau username (min. 3 caractères)
   - **Nouveau mot de passe** : Choisissez un nouveau mot de passe (min. 8 caractères)
   - **Confirmer le mot de passe** : Retapez le nouveau mot de passe

4. **Cliquez sur "💾 Enregistrer les modifications"**

5. **Attendez la confirmation** :
   - Message de succès s'affiche
   - Les identifiants sont mis à jour instantanément (rechargement à chaud)
   - **Pas de déconnexion !** Vous pouvez continuer à utiliser l'admin

6. **Lors de votre prochaine connexion**, utilisez vos **nouveaux identifiants**

---

## 🔒 Sécurité

### Validations en place

| Validation | Détails |
|-----------|---------|
| Mot de passe actuel | Obligatoire pour confirmer votre identité |
| Username minimum | 3 caractères minimum |
| Username format | Lettres, chiffres, - et _ uniquement |
| Mot de passe minimum | 8 caractères minimum |
| Confirmation | Les deux mots de passe doivent correspondre |
| Indicateur de force | Affiche la force du mot de passe en temps réel |

### Recommandations

✅ **Utilisez un mot de passe FORT :**
- Au moins 12 caractères (recommandé)
- Mélange de majuscules et minuscules
- Chiffres et symboles
- Pas d'informations personnelles

✅ **Notez vos identifiants dans un endroit sûr**
- Ils ne peuvent pas être récupérés si vous les oubliez

✅ **Changez régulièrement votre mot de passe**
- Tous les 3-6 mois en production

---

## 🎨 Interface

### Indicateur de force du mot de passe

L'interface affiche en temps réel la force de votre mot de passe :

| Force | Couleur | Critères |
|-------|---------|----------|
| **Faible** | 🔴 Rouge | < 8 caractères ou critères insuffisants |
| **Moyen** | 🟠 Orange | 8+ caractères, quelques critères |
| **Bon** | 🟢 Vert | 12+ caractères, plusieurs critères |
| **Excellent** | 🟢 Vert foncé | 12+ caractères, tous les critères |

**Critères évalués :**
- Longueur (8, 12+ caractères)
- Minuscules (a-z)
- Majuscules (A-Z)
- Chiffres (0-9)
- Symboles (!@#$%^&*, etc.)

---

## 🔄 Que se passe-t-il après la modification ?

### 1. Écriture dans `.env`

Le fichier `.env` est automatiquement mis à jour :

```env
ADMIN_USERNAME=nouveau_username
ADMIN_PASSWORD=nouveau_password
```

### 2. Redémarrage du serveur

Le serveur redémarre automatiquement pour appliquer les changements (grâce à nodemon).

**Durée : 2-3 secondes**

### 3. Déconnexion automatique

Vous êtes automatiquement déconnecté après la modification.

### 4. Reconnexion

Utilisez vos **nouveaux identifiants** pour vous reconnecter.

---

## 🛡️ Protection de la route

La page de paramètres est protégée par authentification :

```javascript
app.use('/api/admin', requireAuth, require('./routes/adminSettings'));
```

**→ Seuls les utilisateurs déjà connectés peuvent modifier les identifiants**

---

## 🧪 Test de la fonctionnalité

### Scénario de test complet

1. **Connectez-vous** avec `admin` / `admin123`
2. **Allez dans Paramètres**
3. **Modifiez les identifiants** :
   - Mot de passe actuel : `admin123`
   - Nouveau username : `monAdmin`
   - Nouveau mot de passe : `MotDePasseSecurise123!`
   - Confirmer : `MotDePasseSecurise123!`
4. **Cliquez sur Enregistrer**
5. **Attendez la confirmation** et la redirection
6. **Reconnectez-vous** avec `monAdmin` / `MotDePasseSecurise123!`

✅ **Si ça fonctionne : La fonctionnalité est opérationnelle !**

---

## ⚠️ Problèmes possibles

### "Mot de passe actuel incorrect"

**Cause :** Vous avez mal tapé votre mot de passe actuel

**Solution :**
- Vérifiez que le Caps Lock n'est pas activé
- Retapez votre mot de passe actuel
- Si oublié, modifiez manuellement le fichier `.env`

---

### "Les mots de passe ne correspondent pas"

**Cause :** Les deux mots de passe ne sont pas identiques

**Solution :**
- Vérifiez que vous avez bien retapé le même mot de passe
- Utilisez Copier/Coller pour être sûr

---

### Le serveur ne redémarre pas

**Cause :** Nodemon n'est pas configuré ou a planté

**Solution :**
```bash
# Redémarrer manuellement
npm run dev
```

---

### J'ai oublié mes nouveaux identifiants

**Solution :**

1. Ouvrez le fichier `.env` :
   ```bash
   nano .env
   ```

2. Modifiez les valeurs :
   ```env
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

3. Redémarrez le serveur :
   ```bash
   npm run dev
   ```

4. Reconnectez-vous avec les identifiants par défaut

---

## 📊 Architecture technique

### Fichiers créés

| Fichier | Description |
|---------|-------------|
| `admin/settings.html` | Interface web de paramètres |
| `admin/settings.js` | Logique côté client |
| `server/routes/adminSettings.js` | API de gestion des identifiants |

### API Endpoints

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/api/admin/current-username` | Récupérer le username actuel | ✅ Oui |
| `PUT` | `/api/admin/credentials` | Modifier les identifiants | ✅ Oui |

### Flux de données

```
┌─────────────────┐
│  Interface Web  │
│ (settings.html) │
└────────┬────────┘
         │
         │ PUT /api/admin/credentials
         │ { currentPassword, newUsername, newPassword }
         ▼
┌─────────────────────┐
│   API Server        │
│ (adminSettings.js)  │
└────────┬────────────┘
         │
         │ 1. Vérifier mot de passe actuel
         │ 2. Valider les nouvelles valeurs
         │ 3. Écrire dans .env
         │ 4. Redémarrer le serveur
         ▼
┌─────────────────┐
│  Fichier .env   │
│  (mis à jour)   │
└─────────────────┘
```

---

## ✅ Avantages de cette fonctionnalité

| Avantage | Description |
|----------|-------------|
| 🎯 **Simplicité** | Pas besoin d'accès SSH ou FTP |
| 🔒 **Sécurité** | Validation du mot de passe actuel |
| 💻 **UX** | Interface intuitive et guidée |
| ⚡ **Rapidité** | Modification en quelques secondes |
| 🛡️ **Protection** | Route protégée par authentification |
| 📊 **Visuel** | Indicateur de force du mot de passe |

---

## 📚 Documentation associée

- [`AUTHENTICATION.md`](AUTHENTICATION.md) - Guide d'authentification
- [`SECURITE_IMPLEMENTEE.md`](SECURITE_IMPLEMENTEE.md) - Récapitulatif sécurité
- [`README.md`](README.md) - Documentation principale

---

## 🎉 Conclusion

Cette fonctionnalité vous permet de **gérer votre sécurité de manière autonome**, sans avoir besoin de compétences techniques ou d'accès au serveur.

**Plus besoin de modifier le code pour changer vos identifiants !** 🚀

---

Date : 30 janvier 2026  
Version : 1.2.0  
Statut : ✅ **OPÉRATIONNEL**

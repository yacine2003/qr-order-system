# 🚀 Guide de Configuration Marque Blanche

Ce document explique comment configurer l'application pour un nouveau client (restaurant, bar, etc.) en quelques minutes.

## 1. Personnalisation Visuelle (`client/branding.js`)

Le fichier `client/branding.js` est le SEUL fichier à modifier pour adapter l'identité visuelle.

### Exemple de configuration :

```javascript
const BRANDING = {
  // 1. Identité
  name: "Sushi Zen",
  tagline: "Le meilleur du Japon à Paris",
  
  // 2. Logo
  logo: {
    type: "image", // ou "emoji"
    value: "https://mon-site.com/logo.png", // URL absolue recommandée
    alt: "Logo Sushi Zen"
  },
  
  // 3. Couleurs (Codes HEX)
  colors: {
    primary: '#e11d48',    // Rouge (Actions principales)
    secondary: '#f43f5e',  // Rouge clair (Accents)
    success: '#10b981',    // Vert (Validation)
    danger: '#ef4444',     // Erreur
    warning: '#f59e0b',    // Alerte
    background: '#fff1f2', // Fond de page personnalisé
    text: '#881337'        // Couleur texte
  }
};
```

## 2. Personnalisation du Menu (`server/data/menu.json`)

Le fichier menu contient les catégories et produits. Pour un nouveau client :
1. Copier le fichier `server/data/menu.json.example` (ou le menu actuel).
2. Modifier le contenu.
3. Valider la structure avec :
   ```bash
   npm run test-menu
   ```

## 3. Compatibilité Matériel

L'application a été optimisée pour les terminaux suivants :

| Type | Modèles testés | Configuration requise |
|------|----------------|------------------------|
| **Tablettes POS** | Elo Touch, Lenovo Tab | Navigateur Chrome/Kiosk Mode |
| **Kiosques** | Allwin, Bornes tactiles | Écran 10" minimum |
| **Mobiles** | Tous smartphones | iOS 14+, Android 8+ |
| **Terminaux** | Sunyard i80 | Résolution min 800px |

### Astuce pour Kiosques (Mode Plein Écran)
Pour lancer l'application en mode "Kiosque" (sans barre d'adresse) sur Chrome :
```bash
chrome.exe --kiosk http://votre-site.com
```

## 4. Checklist de Lancement Client

- [ ] Configurer `branding.js` (Nom, Logo, Couleurs).
- [ ] Mettre à jour `menu.json` avec les produits du client.
- [ ] Déployer sur Render.com (Variables d'env manuelles sur le dashboard Render).
- [ ] Générer les QR Codes pour les tables.
- [ ] Tester sur une tablette/téléphone du client.

## 5. Support

Pour tout problème d'affichage sur un terminal spécifique :
1. Vérifier la résolution de l'écran.
2. Si les boutons sont trop petits, ajuster `min-height` dans `styles.css` (section media queries).

# QR Codes

Ce dossier contient les QR codes à imprimer pour vos tables.

## Générer un QR code

### Option 1 : En ligne (rapide)

1. Allez sur https://www.qr-code-generator.com/
2. Entrez l'URL : `http://votre-domaine.com` ou `http://localhost:3000`
3. Personnalisez le design si souhaité
4. Téléchargez et imprimez

### Option 2 : QR codes par table

Pour générer automatiquement des QR codes par table :

1. Utilisez un service comme https://www.qrstuff.com/
2. URL format : `http://votre-domaine.com?table=1` (auto-remplira le numéro de table)
3. Créez un QR code pour chaque table

### Option 3 : Script de génération (avancé)

```bash
# Installer qrcode
npm install -g qrcode

# Générer un QR code
qrcode -o qr-codes/table-1.png "http://localhost:3000?table=1"
```

## Format recommandé

- **Taille** : Au moins 5x5 cm pour être facilement scannable
- **Format** : PNG ou SVG
- **Qualité** : Haute résolution pour l'impression
- **Protection** : Plastifiez les QR codes pour les protéger

## Exemple d'utilisation

1. Imprimez chaque QR code
2. Placez-les sur les tables (sous plastique ou dans un support)
3. Les clients scannent avec leur téléphone
4. Ils sont redirigés directement vers le menu

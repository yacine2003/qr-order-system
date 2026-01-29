// Script de sauvegarde
const fs = require('fs');
const path = require('path');

const backupDir = path.join(__dirname, '../backups');
const menuFile = path.join(__dirname, '../server/data/menu.json');
const ordersFile = path.join(__dirname, '../server/data/orders.json');

console.log('💾 Sauvegarde des données...\n');

try {
  // Créer le dossier backups s'il n'existe pas
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  // Timestamp pour le nom du fichier
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  // Sauvegarder le menu
  const menuData = fs.readFileSync(menuFile, 'utf8');
  const menuBackup = path.join(backupDir, `menu-${timestamp}.json`);
  fs.writeFileSync(menuBackup, menuData);
  console.log(`✅ Menu sauvegardé : ${menuBackup}`);

  // Sauvegarder les commandes
  const ordersData = fs.readFileSync(ordersFile, 'utf8');
  const ordersBackup = path.join(backupDir, `orders-${timestamp}.json`);
  fs.writeFileSync(ordersBackup, ordersData);
  console.log(`✅ Commandes sauvegardées : ${ordersBackup}`);

  // Créer une archive complète
  const archive = {
    timestamp: new Date().toISOString(),
    menu: JSON.parse(menuData),
    orders: JSON.parse(ordersData)
  };
  
  const archivePath = path.join(backupDir, `backup-${timestamp}.json`);
  fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2));
  console.log(`✅ Archive complète : ${archivePath}`);

  console.log('\n✅ Sauvegarde terminée avec succès !\n');

  // Nettoyer les anciennes sauvegardes (garder les 10 dernières)
  const files = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('backup-'))
    .sort()
    .reverse();

  if (files.length > 10) {
    console.log('🧹 Nettoyage des anciennes sauvegardes...');
    files.slice(10).forEach(file => {
      fs.unlinkSync(path.join(backupDir, file));
      console.log(`   Supprimé : ${file}`);
    });
    console.log('');
  }

} catch (error) {
  console.error('❌ Erreur lors de la sauvegarde:', error.message);
  process.exit(1);
}

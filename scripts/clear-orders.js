// Script pour nettoyer les commandes
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ordersFile = path.join(__dirname, '../server/data/orders.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🗑️  Nettoyage des commandes\n');

try {
  const data = fs.readFileSync(ordersFile, 'utf8');
  const orders = JSON.parse(data);

  console.log(`📊 ${orders.length} commandes actuellement dans le système\n`);

  if (orders.length === 0) {
    console.log('✅ Aucune commande à nettoyer.\n');
    rl.close();
    return;
  }

  // Statistiques
  const stats = {
    nouvelle: orders.filter(o => o.status === 'nouvelle').length,
    en_preparation: orders.filter(o => o.status === 'en_preparation').length,
    prete: orders.filter(o => o.status === 'prete').length,
    servie: orders.filter(o => o.status === 'servie').length,
    annulee: orders.filter(o => o.status === 'annulee').length
  };

  console.log('Statuts :');
  console.log(`  🔔 Nouvelles : ${stats.nouvelle}`);
  console.log(`  👨‍🍳 En préparation : ${stats.en_preparation}`);
  console.log(`  ✅ Prêtes : ${stats.prete}`);
  console.log(`  ✔️  Servies : ${stats.servie}`);
  console.log(`  ❌ Annulées : ${stats.annulee}\n`);

  rl.question('Que voulez-vous faire ?\n1. Supprimer TOUTES les commandes\n2. Supprimer uniquement les servies et annulées\n3. Annuler\n\nVotre choix (1-3) : ', (answer) => {
    
    let newOrders = orders;
    let message = '';

    switch(answer.trim()) {
      case '1':
        newOrders = [];
        message = 'Toutes les commandes ont été supprimées.';
        break;
      case '2':
        newOrders = orders.filter(o => o.status !== 'servie' && o.status !== 'annulee');
        message = `${orders.length - newOrders.length} commandes (servies/annulées) ont été supprimées.`;
        break;
      case '3':
        console.log('\n❌ Opération annulée.\n');
        rl.close();
        return;
      default:
        console.log('\n❌ Choix invalide. Opération annulée.\n');
        rl.close();
        return;
    }

    // Sauvegarder
    fs.writeFileSync(ordersFile, JSON.stringify(newOrders, null, 2));
    console.log(`\n✅ ${message}`);
    console.log(`📊 ${newOrders.length} commandes restantes.\n`);
    
    rl.close();
  });

} catch (error) {
  console.error('❌ Erreur:', error.message);
  rl.close();
  process.exit(1);
}

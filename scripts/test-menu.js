// Script pour valider le menu
const fs = require('fs');
const path = require('path');

const menuFile = path.join(__dirname, '../server/data/menu.json');

console.log('🧪 Validation du menu...\n');

try {
  const data = fs.readFileSync(menuFile, 'utf8');
  const menu = JSON.parse(data);

  // Vérifications
  let totalProducts = 0;
  let errors = [];

  if (!menu.categories || !Array.isArray(menu.categories)) {
    errors.push('❌ Structure invalide : "categories" doit être un tableau');
  } else {
    console.log(`📋 ${menu.categories.length} catégories trouvées\n`);

    menu.categories.forEach((category, catIndex) => {
      console.log(`\n📂 Catégorie ${catIndex + 1}: ${category.name} ${category.icon}`);
      
      if (!category.id || !category.name) {
        errors.push(`❌ Catégorie ${catIndex + 1} : manque id ou name`);
      }

      if (!category.products || !Array.isArray(category.products)) {
        errors.push(`❌ Catégorie ${category.name} : products invalide`);
      } else {
        console.log(`   ${category.products.length} produits`);
        
        category.products.forEach((product, prodIndex) => {
          if (!product.id || !product.name || typeof product.price !== 'number') {
            errors.push(`❌ Produit ${prodIndex + 1} dans ${category.name} : données invalides`);
          } else {
            console.log(`   - ${product.name} : ${product.price.toFixed(2)} €`);
            totalProducts++;
          }
        });
      }
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Résumé :`);
  console.log(`   • ${menu.categories.length} catégories`);
  console.log(`   • ${totalProducts} produits`);
  
  if (errors.length === 0) {
    console.log('\n✅ Menu valide ! Aucune erreur détectée.\n');
  } else {
    console.log('\n⚠️  Erreurs détectées :\n');
    errors.forEach(error => console.log(`   ${error}`));
    console.log('');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Erreur lors de la lecture du menu:', error.message);
  process.exit(1);
}

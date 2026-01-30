// Gestionnaire du menu
class MenuManager {
  constructor() {
    this.menu = null;
    this.init();
  }

  async init() {
    await this.loadMenu();
    this.setupEventListeners();
  }

  // Charger le menu
  async loadMenu() {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) throw new Error('Erreur de chargement');
      this.menu = await response.json();
      this.renderMenu();
    } catch (error) {
      console.error('Erreur:', error);
      this.showToast('Erreur de chargement du menu', 'error');
    }
  }

  // Afficher le menu
  renderMenu() {
    const container = document.getElementById('menu-container');
    
    if (!this.menu || !this.menu.categories || this.menu.categories.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-gray-400">
          <p class="text-lg">Aucune catégorie. Créez-en une pour commencer !</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.menu.categories.map(category => `
      <div class="bg-white rounded-lg shadow-md p-6">
        <!-- En-tête catégorie -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <span class="text-3xl">${category.icon || '📦'}</span>
            <div>
              <h2 class="text-2xl font-bold text-gray-800">${category.name}</h2>
              <p class="text-sm text-gray-500">${category.products.length} produit(s)</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              onclick="menuManager.openEditCategoryModal('${category.id}')" 
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              ✏️ Modifier
            </button>
            <button 
              onclick="menuManager.deleteCategory('${category.id}')" 
              class="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-all"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>

        <!-- Bouton ajouter produit -->
        <button 
          onclick="menuManager.openAddProductModal('${category.id}')" 
          class="mb-4 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-all text-sm"
        >
          + Ajouter un produit
        </button>

        <!-- Liste des produits -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${category.products.map(product => `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-800">${product.name}</h3>
                  <p class="text-sm text-gray-500 mt-1">${product.description || ''}</p>
                </div>
                <span class="text-lg font-bold text-primary ml-2">${product.price.toFixed(2)} €</span>
              </div>
              <div class="flex gap-2 mt-3">
                <button 
                  onclick="menuManager.openEditProductModal('${product.id}')" 
                  class="flex-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all text-sm"
                >
                  ✏️ Modifier
                </button>
                <button 
                  onclick="menuManager.deleteProduct('${product.id}')" 
                  class="flex-1 px-3 py-1.5 bg-red-100 text-danger rounded hover:bg-red-200 transition-all text-sm"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // Modal Catégorie - Ouvrir en mode ajout
  openAddCategoryModal() {
    document.getElementById('category-modal-title').textContent = 'Ajouter une catégorie';
    document.getElementById('category-id-original').value = '';
    document.getElementById('category-name').value = '';
    document.getElementById('category-icon').value = '';
    document.getElementById('category-modal').classList.remove('hidden');
  }

  // Modal Catégorie - Ouvrir en mode édition
  openEditCategoryModal(categoryId) {
    const category = this.menu.categories.find(cat => cat.id === categoryId);
    if (!category) return;

    document.getElementById('category-modal-title').textContent = 'Modifier la catégorie';
    document.getElementById('category-id-original').value = categoryId;
    document.getElementById('category-name').value = category.name;
    document.getElementById('category-icon').value = category.icon || '';
    document.getElementById('category-modal').classList.remove('hidden');
  }

  // Fermer modal catégorie
  closeCategoryModal() {
    document.getElementById('category-modal').classList.add('hidden');
    document.getElementById('category-form').reset();
  }

  // Modal Produit - Ouvrir en mode ajout
  openAddProductModal(categoryId) {
    document.getElementById('product-modal-title').textContent = 'Ajouter un produit';
    document.getElementById('product-id-original').value = '';
    document.getElementById('product-category-id').value = categoryId;
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-description').value = '';
    
    this.fillCategorySelect(categoryId);
    document.getElementById('product-modal').classList.remove('hidden');
  }

  // Modal Produit - Ouvrir en mode édition
  openEditProductModal(productId) {
    let product = null;
    let categoryId = null;

    for (const cat of this.menu.categories) {
      const found = cat.products.find(p => p.id === productId);
      if (found) {
        product = found;
        categoryId = cat.id;
        break;
      }
    }

    if (!product) return;

    document.getElementById('product-modal-title').textContent = 'Modifier le produit';
    document.getElementById('product-id-original').value = productId;
    document.getElementById('product-category-id').value = categoryId;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-description').value = product.description || '';
    
    this.fillCategorySelect(categoryId);
    document.getElementById('product-modal').classList.remove('hidden');
  }

  // Remplir le select des catégories
  fillCategorySelect(selectedCategoryId) {
    const select = document.getElementById('product-new-category');
    select.innerHTML = this.menu.categories.map(cat => 
      `<option value="${cat.id}" ${cat.id === selectedCategoryId ? 'selected' : ''}>
        ${cat.icon || '📦'} ${cat.name}
      </option>`
    ).join('');
  }

  // Fermer modal produit
  closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.getElementById('product-form').reset();
  }

  // Sauvegarder catégorie
  async saveCategory(e) {
    e.preventDefault();
    
    const originalId = document.getElementById('category-id-original').value;
    const name = document.getElementById('category-name').value.trim();
    const icon = document.getElementById('category-icon').value.trim();

    const isEdit = originalId !== '';
    const url = isEdit 
      ? `/api/menu-admin/category/${originalId}`
      : '/api/menu-admin/category';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, icon })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur');
      }

      this.showToast(isEdit ? 'Catégorie modifiée !' : 'Catégorie ajoutée !', 'success');
      this.closeCategoryModal();
      await this.loadMenu();

    } catch (error) {
      console.error('Erreur:', error);
      this.showToast(error.message, 'error');
    }
  }

  // Sauvegarder produit
  async saveProduct(e) {
    e.preventDefault();
    
    const originalId = document.getElementById('product-id-original').value;
    const categoryId = document.getElementById('product-category-id').value;
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value.trim();
    const newCategoryId = document.getElementById('product-new-category').value;

    const isEdit = originalId !== '';
    const url = isEdit 
      ? `/api/menu-admin/product/${originalId}`
      : `/api/menu-admin/category/${categoryId}/product`;
    const method = isEdit ? 'PUT' : 'POST';

    const body = isEdit
      ? { name, price, description, categoryId: newCategoryId }
      : { name, price, description };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur');
      }

      this.showToast(isEdit ? 'Produit modifié !' : 'Produit ajouté !', 'success');
      this.closeProductModal();
      await this.loadMenu();

    } catch (error) {
      console.error('Erreur:', error);
      this.showToast(error.message, 'error');
    }
  }

  // Supprimer catégorie
  async deleteCategory(categoryId) {
    const category = this.menu.categories.find(cat => cat.id === categoryId);
    if (!category) return;

    if (!confirm(`Supprimer la catégorie "${category.name}" et tous ses produits ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/menu-admin/category/${categoryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erreur');
      }

      this.showToast('Catégorie supprimée !', 'success');
      await this.loadMenu();

    } catch (error) {
      console.error('Erreur:', error);
      this.showToast(error.message, 'error');
    }
  }

  // Supprimer produit
  async deleteProduct(productId) {
    let productName = '';
    for (const cat of this.menu.categories) {
      const product = cat.products.find(p => p.id === productId);
      if (product) {
        productName = product.name;
        break;
      }
    }

    if (!confirm(`Supprimer le produit "${productName}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/menu-admin/product/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erreur');
      }

      this.showToast('Produit supprimé !', 'success');
      await this.loadMenu();

    } catch (error) {
      console.error('Erreur:', error);
      this.showToast(error.message, 'error');
    }
  }

  // Afficher un toast
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = `fixed bottom-4 right-4 shadow-xl rounded-lg p-4 z-50 max-w-sm ${
      type === 'success' ? 'bg-success text-white' :
      type === 'error' ? 'bg-danger text-white' :
      'bg-white text-gray-800'
    }`;
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  // Setup event listeners
  setupEventListeners() {
    document.getElementById('category-form').addEventListener('submit', (e) => this.saveCategory(e));
    document.getElementById('product-form').addEventListener('submit', (e) => this.saveProduct(e));

    // Fermer modals en cliquant à l'extérieur
    document.getElementById('category-modal').addEventListener('click', (e) => {
      if (e.target.id === 'category-modal') {
        this.closeCategoryModal();
      }
    });

    document.getElementById('product-modal').addEventListener('click', (e) => {
      if (e.target.id === 'product-modal') {
        this.closeProductModal();
      }
    });
  }
}

// Initialiser
const menuManager = new MenuManager();

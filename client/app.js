// Application principale
class OrderApp {
  constructor() {
    this.menu = null;
    this.cart = [];
    this.selectedCategory = 'all';
    this.currentProduct = null;
    this.currentIngredients = [];
    this.currentSupplements = [];
    this.init();
  }

  async init() {
    this.handleWelcomeScreen();
    this.applyBranding();
    this.checkAdminMode();
    this.showLoader(true);
    await this.loadMenu();
    this.loadCartFromStorage();
    this.renderCategories();
    this.renderProducts();
    this.setupEventListeners();
    this.showLoader(false);
  }

  // ... (handleWelcomeScreen, applyBranding, checkAdminMode, loadMenu, showLoader, renderCategories, createCategoryButton, filterByCategory, renderProducts - unchanged until createProductCard)

  // Gérer l'écran d'accueil (inchangé)
  handleWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const enterBtn = document.getElementById('enter-menu');

    if (!welcomeScreen) return;

    if (sessionStorage.getItem('welcome-seen') === 'true') {
      welcomeScreen.classList.add('hidden');
    }

    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        sessionStorage.setItem('welcome-seen', 'true');
      });
    }
  }

  applyBranding() {
    if (!window.BRANDING) return;
    document.title = `${window.BRANDING.name} - Menu`;
    document.querySelector('meta[name="description"]').content = window.BRANDING.tagline;
    const logoContainer = document.getElementById('brand-logo');
    if (window.BRANDING.logo.type === 'emoji') {
      logoContainer.textContent = window.BRANDING.logo.value;
    } else {
      logoContainer.innerHTML = `<img src="${window.BRANDING.logo.value}" alt="${window.BRANDING.logo.alt}" class="h-10 w-auto">`;
    }
    document.getElementById('brand-name').textContent = window.BRANDING.name;
    document.getElementById('brand-tagline').textContent = window.BRANDING.tagline;
    if (window.BRANDING.backgroundImage) {
      document.body.style.backgroundImage = `url('${window.BRANDING.backgroundImage}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    }
  }

  checkAdminMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'admin') {
      const adminBanner = document.getElementById('admin-banner');
      if (adminBanner) {
        adminBanner.classList.remove('hidden');
        document.body.classList.add('admin-mode');
      }
    }
  }

  async loadMenu() {
    try {
      const response = await fetch(`${CONFIG.API_URL}/menu`);
      if (!response.ok) throw new Error('Erreur de chargement du menu');
      this.menu = await response.json();
    } catch (error) {
      console.error('Erreur:', error);
      this.showToast('Erreur de chargement du menu', 'error');
    }
  }

  showLoader(show) {
    const loader = document.getElementById('loader');
    if (show) {
      loader.classList.remove('hidden');
    } else {
      loader.classList.add('hidden');
    }
  }

  renderCategories() {
    const container = document.getElementById('categories-filter');
    container.innerHTML = '';
    const allBtn = this.createCategoryButton('all', 'Tout', '🍽️');
    container.appendChild(allBtn);
    this.menu.categories.forEach(category => {
      const btn = this.createCategoryButton(category.id, category.name, category.icon);
      container.appendChild(btn);
    });
  }

  createCategoryButton(id, name, icon) {
    const btn = document.createElement('button');
    btn.className = `px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${this.selectedCategory === id
      ? 'category-badge-active'
      : 'category-badge-inactive'
      }`;
    btn.innerHTML = `<span class="inline-flex items-center gap-1.5">${icon} <span>${name}</span></span>`;
    btn.addEventListener('click', () => this.filterByCategory(id));
    return btn;
  }

  filterByCategory(categoryId) {
    this.selectedCategory = categoryId;
    this.renderCategories();
    this.renderProducts();
    document.getElementById('products-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    const categories = this.selectedCategory === 'all'
      ? this.menu.categories
      : this.menu.categories.filter(cat => cat.id === this.selectedCategory);

    categories.forEach(category => {
      const categoryTitle = document.createElement('div');
      categoryTitle.className = 'mb-4';
      categoryTitle.innerHTML = `
        <h2 class="text-2xl font-bold text-gray-800 flex items-center">
          <span class="text-3xl mr-2">${category.icon}</span>
          ${category.name}
        </h2>
      `;
      container.appendChild(categoryTitle);

      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8';

      category.products.forEach(product => {
        const card = this.createProductCard(product);
        grid.appendChild(card);
      });

      container.appendChild(grid);
    });
  }

  // Créer une carte produit (NOUVEAU DESIGN)
  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card bg-white rounded-xl shadow-md overflow-hidden flex flex-col fade-in h-full transform transition-all hover:shadow-lg hover:-translate-y-1';

    // Image en haut (Pleine largeur)
    const imageContainer = document.createElement('div');
    imageContainer.className = 'w-full h-48 bg-gray-100 overflow-hidden relative';
    if (product.image) {
      imageContainer.innerHTML = `<img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">`;
    } else {
      imageContainer.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🍽️</div>`;
    }
    card.appendChild(imageContainer);

    // Contenu
    const content = document.createElement('div');
    content.className = 'p-5 flex flex-col flex-1';

    content.innerHTML = `
      <div class="mb-2">
        <h3 class="font-bold text-gray-800 text-xl leading-tight">${product.name}</h3>
        <p class="text-sm text-gray-500 mt-2 line-clamp-2">${product.description || ''}</p>
      </div>
      
      <div class="mt-auto pt-4 flex items-center justify-between">
        <span class="text-xl font-bold text-gray-900">${product.price.toFixed(2)} €</span>
        <button class="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                onclick="app.openProductModal('${product.id}')">
          <span>Ajouter</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        </button>
      </div>
    `;

    card.appendChild(content);
    return card;
  }

  // Ouvrir le modal de produit
  openProductModal(productId) {
    const product = this.findProduct(productId);
    if (!product) return;

    this.currentProduct = product;
    // Initialiser les ingrédients (tous présents par défaut : true)
    this.currentIngredients = (product.ingredients || []).map(ing => ({ name: ing, active: true }));

    // Initialiser les suppléments (tous absents par défaut : 0)
    this.currentSupplements = (product.supplements || []).map(sup => ({ ...sup, quantity: 0 }));

    // Remplir le modal
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-product-description').textContent = product.description || '';

    const imgEl = document.getElementById('modal-product-image');
    if (product.image) {
      imgEl.src = product.image;
      imgEl.classList.remove('hidden');
    } else {
      imgEl.classList.add('hidden');
    }

    this.renderModalIngredients();
    this.renderModalSupplements();
    this.updateModalTotalPrice();

    document.getElementById('product-modal').classList.remove('hidden');
  }

  renderModalIngredients() {
    const list = document.getElementById('ingredients-list');
    const msg = document.getElementById('no-ingredients-msg');

    if (this.currentIngredients.length === 0) {
      list.innerHTML = '';
      msg.classList.remove('hidden');
      return;
    }

    msg.classList.add('hidden');
    list.innerHTML = this.currentIngredients.map((ing, index) => `
      <div class="flex items-center justify-between p-3 rounded-lg border ${ing.active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-75'}">
        <span class="font-medium ${ing.active ? 'text-gray-800' : 'text-gray-400 line-through'}">${ing.name}</span>
        <div class="flex items-center gap-3">
            <button class="w-8 h-8 flex items-center justify-center rounded-full transition-colors ${ing.active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}"
                    ${!ing.active ? 'disabled' : ''}
                    onclick="app.toggleIngredient(${index}, false)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
            </button>
            <span class="font-bold w-4 text-center ${ing.active ? 'text-gray-800' : 'text-gray-400'}">1</span>
            <button class="w-8 h-8 flex items-center justify-center rounded-full transition-colors ${!ing.active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}"
                    ${ing.active ? 'disabled' : ''}
                    onclick="app.toggleIngredient(${index}, true)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </button>
        </div>
      </div>
    `).join('');
  }

  // ... existing code ...
  toggleIngredient(index, activate) {
    if (this.currentIngredients[index]) {
      this.currentIngredients[index].active = activate;
      this.renderModalIngredients();
    }
  }

  renderModalSupplements() {
    // Créer ou récupérer le conteneur des suppléments
    let container = document.getElementById('supplements-section');
    if (!container) {
      const parent = document.querySelector('#product-modal .p-6');
      const ingredientsSection = document.querySelector('#product-modal .mb-6'); // Section Ingrédients

      container = document.createElement('div');
      container.id = 'supplements-section';
      container.className = 'mb-6 border-t pt-4';
      container.innerHTML = `
        <h3 class="font-semibold text-gray-800 mb-3">Suppléments (Optionnel)</h3>
        <div id="supplements-list" class="space-y-3"></div>
      `;

      // Insérer après la section ingrédients
      ingredientsSection.insertAdjacentElement('afterend', container);
    }

    const list = document.getElementById('supplements-list');

    if (this.currentSupplements.length === 0) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    list.innerHTML = this.currentSupplements.map((sup, index) => `
      <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white">
        <div class="flex flex-col">
          <span class="font-medium text-gray-800">${sup.name}</span>
          <span class="text-xs text-primary font-bold">+${sup.price.toFixed(2)} €</span>
        </div>
        <div class="flex items-center gap-3">
            <button class="w-8 h-8 flex items-center justify-center rounded-full transition-colors ${sup.quantity > 0 ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}"
                    ${sup.quantity === 0 ? 'disabled' : ''}
                    onclick="app.toggleSupplement(${index}, -1)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
            </button>
            <span class="font-bold w-4 text-center text-gray-800">${sup.quantity}</span>
            <button class="w-8 h-8 flex items-center justify-center rounded-full transition-colors bg-primary hover:bg-primary/90 text-white"
                    onclick="app.toggleSupplement(${index}, 1)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </button>
        </div>
      </div>
    `).join('');
  }

  toggleSupplement(index, delta) {
    if (this.currentSupplements[index]) {
      const newQuantity = this.currentSupplements[index].quantity + delta;
      if (newQuantity >= 0) {
        this.currentSupplements[index].quantity = newQuantity;
        this.renderModalSupplements();
        this.updateModalTotalPrice();
      }
    }
  }

  updateModalTotalPrice() {
    let total = this.currentProduct.price;

    // Ajouter le prix des suppléments
    this.currentSupplements.forEach(sup => {
      total += sup.price * sup.quantity;
    });

    document.getElementById('modal-product-price').textContent = `${total.toFixed(2)} €`;
  }

  confirmAddToCart() {
    if (!this.currentProduct) return;

    // Générer la liste des modifications
    const modifications = this.currentIngredients
      .filter(ing => !ing.active)
      .map(ing => `Sans ${ing.name}`);

    // Créer un ID unique basé sur les modifications pour regrouper les articles identiques
    const uniqueId = `${this.currentProduct.id}-${modifications.join('-')}`;

    const existingItem = this.cart.find(item => item.uniqueId === uniqueId);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({
        uniqueId: uniqueId,
        id: this.currentProduct.id,
        name: this.currentProduct.name,
        price: this.currentProduct.price,
        quantity: 1,
        modifications: modifications
      });
    }

    this.updateCart();
    this.saveCartToStorage();

    // Fermer le modal
    document.getElementById('product-modal').classList.add('hidden');
    this.showToast('Produit ajouté au panier !', 'success');
  }

  // Ancienne méthode addToCart (gardée pour compatibilité si besoin, mais plus utilisée directement par les boutons)
  addToCart(productId) {
    this.openProductModal(productId);
  }

  // Mettre à jour la quantité (modifiée pour utiliser uniqueId)
  updateQuantity(uniqueId, newQuantity) {
    if (newQuantity <= 0) {
      this.cart = this.cart.filter(item => item.uniqueId !== uniqueId);
    } else {
      const item = this.cart.find(item => item.uniqueId === uniqueId);
      if (item) {
        item.quantity = newQuantity;
      }
    }

    this.updateCart();
    this.saveCartToStorage();
  }

  findProduct(productId) {
    for (const category of this.menu.categories) {
      const product = category.products.find(p => p.id === productId);
      if (product) return product;
    }
    return null;
  }

  updateCart() {
    this.updateCartBadge();
    this.renderCartItems('desktop');
    this.renderCartItems('mobile');
  }

  updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);

    if (totalItems > 0) {
      badge.textContent = totalItems;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  renderCartItems(device) {
    const container = document.getElementById(`cart-items-${device}`);
    const summary = document.getElementById(`cart-summary-${device}`);
    const totalEl = document.getElementById(`cart-total-${device}`);

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <p>Votre panier est vide</p>
        </div>
      `;
      summary.classList.add('hidden');
      return;
    }

    summary.classList.remove('hidden');

    container.innerHTML = this.cart.map(item => `
      <div class="cart-item py-3 border-b">
        <div class="flex justify-between items-start mb-2">
          <div class="flex-1">
            <p class="font-medium text-gray-800">${item.name}</p>
            ${item.modifications && item.modifications.length > 0
        ? `<div class="text-xs text-red-500 mt-1 space-y-0.5">${item.modifications.map(m => `<span>• ${m}</span>`).join('<br>')}</div>`
        : ''}
          </div>
          <p class="text-sm font-bold text-gray-700 ml-2">${(item.price * item.quantity).toFixed(2)} €</p>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-xs text-gray-400">PU: ${item.price.toFixed(2)} €</div>
          <div class="flex items-center space-x-2">
            <button class="quantity-btn bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-7 h-7 flex items-center justify-center text-sm transition-colors" 
                    onclick="app.updateQuantity('${item.uniqueId}', ${item.quantity - 1})">
              -
            </button>
            <span class="font-semibold text-gray-800 w-6 text-center text-sm">${item.quantity}</span>
            <button class="quantity-btn bg-primary hover:bg-primary/90 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-sm transition-colors" 
                    onclick="app.updateQuantity('${item.uniqueId}', ${item.quantity + 1})">
              +
            </button>
          </div>
        </div>
      </div>
    `).join('');

    const total = this.calculateTotal();
    totalEl.textContent = `${total.toFixed(2)} €`;
  }

  calculateTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  saveCartToStorage() {
    if (CONFIG.SETTINGS.autoSaveCart) {
      localStorage.setItem('qr-order-cart', JSON.stringify(this.cart));
    }
  }

  loadCartFromStorage() {
    if (CONFIG.SETTINGS.autoSaveCart) {
      const saved = localStorage.getItem('qr-order-cart');
      if (saved) {
        try {
          const parsedCart = JSON.parse(saved);
          // Vérification de compatibilité : si un item n'a pas d'uniqueId, on reset le panier
          const hasInvalidItems = parsedCart.some(item => !item.uniqueId);

          if (hasInvalidItems) {
            console.warn('Ancien format de panier détecté. Réinitialisation.');
            this.clearCart();
          } else {
            this.cart = parsedCart;
            this.updateCart();
          }
        } catch (e) {
          console.error('Erreur lecture panier', e);
          this.clearCart();
        }
      }
    }
  }

  clearCart() {
    this.cart = [];
    this.updateCart();
    this.saveCartToStorage();
    // Plus besoin de renderProducts car on n'affiche plus les quantités sur les cartes
  }

  openCheckoutModal() {
    if (this.cart.length === 0) {
      this.showToast('Votre panier est vide', 'warning');
      return;
    }

    const modal = document.getElementById('checkout-modal');
    const summary = document.getElementById('order-summary');
    const total = document.getElementById('order-total');

    summary.innerHTML = this.cart.map(item => `
      <div class="flex justify-between items-start py-1">
        <div class="flex-1">
          <span class="block text-gray-800">${item.name} <span class="text-gray-500 text-xs">× ${item.quantity}</span></span>
          ${item.modifications && item.modifications.length > 0
        ? `<span class="text-xs text-red-500 block italic">${item.modifications.join(', ')}</span>`
        : ''}
        </div>
        <span class="font-medium">${(item.price * item.quantity).toFixed(2)} €</span>
      </div>
    `).join('');

    total.textContent = `${this.calculateTotal().toFixed(2)} €`;
    modal.classList.remove('hidden');
  }

  closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.add('hidden');
    document.getElementById('order-form').reset();
  }

  async submitOrder(formData) {
    this.showLoader(true);

    const orderData = {
      table: formData.get('table'),
      name: formData.get('name'),
      comment: formData.get('comment'),
      items: this.cart,
      total: this.calculateTotal()
    };

    try {
      const response = await fetch(`${CONFIG.API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
      }

      this.closeCheckoutModal();
      this.showSuccessModal();
      this.clearCart();

    } catch (error) {
      console.error('Erreur:', error);
      this.showToast(error.message || 'Erreur lors de l\'envoi de la commande', 'error');
    } finally {
      this.showLoader(false);
    }
  }

  showSuccessModal() {
    document.getElementById('success-modal').classList.remove('hidden');
  }

  closeSuccessModal() {
    document.getElementById('success-modal').classList.add('hidden');
  }

  showToast(message, type = 'info') {
    // Implémentation simple d'un toast
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg text-white font-medium z-50 fade-in ${type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-gray-800'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  setupEventListeners() {
    // Panier mobile
    document.getElementById('cart-toggle').addEventListener('click', () => {
      this.toggleCartModal();
    });

    document.getElementById('close-cart').addEventListener('click', () => {
      this.toggleCartModal();
    });

    document.getElementById('cart-modal').addEventListener('click', (e) => {
      if (e.target.id === 'cart-modal') {
        this.toggleCartModal();
      }
    });

    // Boutons commander
    document.getElementById('checkout-btn-desktop').addEventListener('click', () => {
      this.openCheckoutModal();
    });

    document.getElementById('checkout-btn-mobile').addEventListener('click', () => {
      this.toggleCartModal();
      this.openCheckoutModal();
    });

    // Modal de commande
    document.getElementById('cancel-order').addEventListener('click', () => {
      this.closeCheckoutModal();
    });

    document.getElementById('checkout-modal').addEventListener('click', (e) => {
      if (e.target.id === 'checkout-modal') {
        this.closeCheckoutModal();
      }
    });

    document.getElementById('order-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      this.submitOrder(formData);
    });

    // Modal de succès
    document.getElementById('close-success').addEventListener('click', () => {
      this.closeSuccessModal();
    });

    // Modal Produit
    document.getElementById('close-product-modal').addEventListener('click', () => {
      document.getElementById('product-modal').classList.add('hidden');
    });

    document.getElementById('product-modal').addEventListener('click', (e) => {
      if (e.target.id === 'product-modal') {
        document.getElementById('product-modal').classList.add('hidden');
      }
    });

    document.getElementById('confirm-add-to-cart').addEventListener('click', () => {
      this.confirmAddToCart();
    });
  }

  toggleCartModal() {
    const modal = document.getElementById('cart-modal');
    const content = document.getElementById('cart-modal-content');

    if (modal.classList.contains('hidden')) {
      modal.classList.remove('hidden');
      setTimeout(() => {
        content.style.transform = 'translateY(0)';
      }, 10);
    } else {
      content.style.transform = 'translateY(100%)';
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }
  }
}

// Initialiser l'application
window.app = new OrderApp();

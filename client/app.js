// Application principale
class OrderApp {
  constructor() {
    this.menu = null;
    this.cart = [];
    this.selectedCategory = 'all';
    this.init();
  }

  async init() {
    this.applyBranding();
    this.checkAdminMode(); // Vérifier si on vient de l'admin
    this.showLoader(true);
    await this.loadMenu();
    this.loadCartFromStorage();
    this.renderCategories();
    this.renderProducts();
    this.setupEventListeners();
    this.showLoader(false);
  }

  // Appliquer la configuration de marque
  applyBranding() {
    if (!window.BRANDING) return;

    // Titre de la page
    document.title = `${window.BRANDING.name} - Menu`;
    document.querySelector('meta[name="description"]').content = window.BRANDING.tagline;

    // Logo
    const logoContainer = document.getElementById('brand-logo');
    if (window.BRANDING.logo.type === 'emoji') {
      logoContainer.textContent = window.BRANDING.logo.value;
    } else {
      logoContainer.innerHTML = `<img src="${window.BRANDING.logo.value}" alt="${window.BRANDING.logo.alt}" class="h-10 w-auto">`;
    }

    // Nom et Tagline
    document.getElementById('brand-name').textContent = window.BRANDING.name;
    document.getElementById('brand-tagline').textContent = window.BRANDING.tagline;

    // Background Image (si configurée)
    if (window.BRANDING.backgroundImage) {
      document.body.style.backgroundImage = `url('${window.BRANDING.backgroundImage}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    }
  }

  // Vérifier si on vient de l'interface admin
  checkAdminMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'admin') {
      const adminBanner = document.getElementById('admin-banner');
      if (adminBanner) {
        adminBanner.classList.remove('hidden');
        // Ajouter une classe au body pour ajuster les positions sticky
        document.body.classList.add('admin-mode');
      }
    }
  }

  // Charger le menu depuis l'API
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

  // Afficher/masquer le loader
  showLoader(show) {
    const loader = document.getElementById('loader');
    if (show) {
      loader.classList.remove('hidden');
    } else {
      loader.classList.add('hidden');
    }
  }

  // Afficher les catégories
  renderCategories() {
    const container = document.getElementById('categories-filter');

    // Vider le conteneur avant d'ajouter les boutons
    container.innerHTML = '';

    // Bouton "Tout"
    const allBtn = this.createCategoryButton('all', 'Tout', '🍽️');
    container.appendChild(allBtn);

    // Boutons catégories
    this.menu.categories.forEach(category => {
      const btn = this.createCategoryButton(category.id, category.name, category.icon);
      container.appendChild(btn);
    });
  }

  // Créer un bouton catégorie
  createCategoryButton(id, name, icon) {
    const btn = document.createElement('button');
    btn.className = `px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${this.selectedCategory === id
      ? 'category-badge-active'
      : 'bg-white text-gray-700 hover:bg-gray-100'
      }`;
    btn.innerHTML = `<span class="inline-flex items-center gap-1.5">${icon} <span>${name}</span></span>`;
    btn.addEventListener('click', () => this.filterByCategory(id));
    return btn;
  }

  // Filtrer par catégorie
  filterByCategory(categoryId) {
    this.selectedCategory = categoryId;
    this.renderCategories();
    this.renderProducts();

    // Scroll vers le haut des produits
    document.getElementById('products-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Afficher les produits
  renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    const categories = this.selectedCategory === 'all'
      ? this.menu.categories
      : this.menu.categories.filter(cat => cat.id === this.selectedCategory);

    categories.forEach(category => {
      // Titre de catégorie
      const categoryTitle = document.createElement('div');
      categoryTitle.className = 'mb-4';
      categoryTitle.innerHTML = `
        <h2 class="text-2xl font-bold text-gray-800 flex items-center">
          <span class="text-3xl mr-2">${category.icon}</span>
          ${category.name}
        </h2>
      `;
      container.appendChild(categoryTitle);

      // Grille de produits
      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8';

      category.products.forEach(product => {
        const card = this.createProductCard(product);
        grid.appendChild(card);
      });

      container.appendChild(grid);
    });
  }

  // Créer une carte produit
  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card bg-white rounded-lg shadow-md p-4 fade-in';

    const inCart = this.cart.find(item => item.id === product.id);
    const quantity = inCart ? inCart.quantity : 0;

    card.innerHTML = `
      <div class="flex justify-between items-start gap-3 mb-3">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-800 text-lg">${product.name}</h3>
          <p class="text-sm text-gray-500 mt-1">${product.description || ''}</p>
          <div class="mt-2">
            <span class="text-lg font-bold text-primary">${product.price.toFixed(2)} €</span>
          </div>
        </div>
        ${product.image ? `
          <div class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-50">
            <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
          </div>
        ` : ''}
      </div>
      
      <div class="flex items-center justify-between mt-4">
        ${quantity > 0 ? `
          <div class="flex items-center space-x-2">
            <button class="quantity-btn bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center font-bold" 
                    onclick="app.updateQuantity('${product.id}', ${quantity - 1})">
              -
            </button>
            <span class="font-semibold text-gray-800 w-8 text-center">${quantity}</span>
            <button class="quantity-btn bg-primary hover:bg-primary/90 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold" 
                    onclick="app.updateQuantity('${product.id}', ${quantity + 1})">
              +
            </button>
          </div>
        ` : `
          <button class="btn-ripple bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-all"
                  onclick="app.addToCart('${product.id}')">
            Ajouter
          </button>
        `}
      </div>
    `;

    return card;
  }

  // Ajouter au panier
  addToCart(productId) {
    const product = this.findProduct(productId);
    if (!product) return;

    const existingItem = this.cart.find(item => item.id === productId);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }

    this.updateCart();
    this.saveCartToStorage();
  }

  // Mettre à jour la quantité
  updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      this.cart = this.cart.filter(item => item.id !== productId);
    } else {
      const item = this.cart.find(item => item.id === productId);
      if (item) {
        item.quantity = newQuantity;
      }
    }

    this.updateCart();
    this.saveCartToStorage();
    this.renderProducts(); // Re-render pour mettre à jour les boutons
  }

  // Trouver un produit
  findProduct(productId) {
    for (const category of this.menu.categories) {
      const product = category.products.find(p => p.id === productId);
      if (product) return product;
    }
    return null;
  }

  // Mettre à jour l'affichage du panier
  updateCart() {
    this.updateCartBadge();
    this.renderCartItems('desktop');
    this.renderCartItems('mobile');
  }

  // Mettre à jour le badge du panier
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

  // Afficher les articles du panier
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
      <div class="cart-item flex justify-between items-center py-3 border-b">
        <div class="flex-1">
          <p class="font-medium text-gray-800">${item.name}</p>
          <p class="text-sm text-gray-500">${item.price.toFixed(2)} € × ${item.quantity}</p>
        </div>
        <div class="flex items-center space-x-2">
          <button class="quantity-btn bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full w-7 h-7 flex items-center justify-center text-sm" 
                  onclick="app.updateQuantity('${item.id}', ${item.quantity - 1})">
            -
          </button>
          <span class="font-semibold text-gray-800 w-6 text-center">${item.quantity}</span>
          <button class="quantity-btn bg-primary hover:bg-primary/90 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm" 
                  onclick="app.updateQuantity('${item.id}', ${item.quantity + 1})">
            +
          </button>
        </div>
      </div>
    `).join('');

    const total = this.calculateTotal();
    totalEl.textContent = `${total.toFixed(2)} €`;
  }

  // Calculer le total
  calculateTotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // Sauvegarder le panier
  saveCartToStorage() {
    if (CONFIG.SETTINGS.autoSaveCart) {
      localStorage.setItem('qr-order-cart', JSON.stringify(this.cart));
    }
  }

  // Charger le panier
  loadCartFromStorage() {
    if (CONFIG.SETTINGS.autoSaveCart) {
      const saved = localStorage.getItem('qr-order-cart');
      if (saved) {
        this.cart = JSON.parse(saved);
        this.updateCart();
      }
    }
  }

  // Vider le panier
  clearCart() {
    this.cart = [];
    this.updateCart();
    this.saveCartToStorage();
    this.renderProducts();
  }

  // Ouvrir le modal de commande
  openCheckoutModal() {
    if (this.cart.length === 0) {
      this.showToast('Votre panier est vide', 'warning');
      return;
    }

    const modal = document.getElementById('checkout-modal');
    const summary = document.getElementById('order-summary');
    const total = document.getElementById('order-total');

    // Remplir le récapitulatif
    summary.innerHTML = this.cart.map(item => `
      <div class="flex justify-between">
        <span>${item.name} × ${item.quantity}</span>
        <span>${(item.price * item.quantity).toFixed(2)} €</span>
      </div>
    `).join('');

    total.textContent = `${this.calculateTotal().toFixed(2)} €`;

    modal.classList.remove('hidden');
  }

  // Fermer le modal de commande
  closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.add('hidden');
    document.getElementById('order-form').reset();
  }

  // Envoyer la commande
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

  // Afficher le modal de succès
  showSuccessModal() {
    document.getElementById('success-modal').classList.remove('hidden');
  }

  // Fermer le modal de succès
  closeSuccessModal() {
    document.getElementById('success-modal').classList.add('hidden');
  }

  // Afficher un toast
  showToast(message, type = 'info') {
    // TODO: Implémenter un système de toast si besoin
    alert(message);
  }

  // Configuration des événements
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
  }

  // Toggle panier mobile
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
const app = new OrderApp();

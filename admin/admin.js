// Application Admin
class AdminApp {
  constructor() {
    this.orders = [];
    this.currentFilter = 'all';
    this.eventSource = null;
    this.init();
  }

  async init() {
    await this.loadOrders();
    this.connectSSE();
    this.updateStats();
    this.renderOrders();
  }

  // Charger les commandes existantes
  async loadOrders() {
    try {
      const response = await fetch('/api/orders', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur de chargement');
      this.orders = await response.json();
    } catch (error) {
      console.error('Erreur:', error);
    }
  }

  // Connexion SSE pour temps réel
  connectSSE() {
    this.eventSource = new EventSource('/api/orders/stream/events');

    this.eventSource.onopen = () => {
      this.updateConnectionStatus(true);
    };

    this.eventSource.onerror = () => {
      this.updateConnectionStatus(false);
      // Reconnexion automatique
      setTimeout(() => this.connectSSE(), 5000);
    };

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'init') {
        this.orders = data.orders;
      } else {
        // Nouvelle commande
        this.orders.unshift(data);
        this.playNotification();
      }

      this.updateStats();
      this.renderOrders();
    };
  }

  // Mettre à jour le statut de connexion
  updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connection-status');
    const dot = statusEl.querySelector('div');
    const text = statusEl.querySelector('span');

    if (connected) {
      dot.className = 'w-2 h-2 bg-success rounded-full';
      text.textContent = 'Connecté';
      text.className = 'text-sm text-success';
    } else {
      dot.className = 'w-2 h-2 bg-danger rounded-full';
      text.textContent = 'Déconnecté';
      text.className = 'text-sm text-danger';
    }
  }

  // Jouer le son de notification
  playNotification() {
    try {
      const audio = document.getElementById('notification-sound');
      audio.play().catch(e => console.log('Autoplay bloqué:', e));
    } catch (error) {
      console.log('Notification sonore non disponible');
    }
  }

  // Mettre à jour les statistiques
  updateStats() {
    const today = new Date().toLocaleDateString('fr-FR');
    const todayOrders = this.orders.filter(order => {
      const orderDate = new Date(order.timestamp).toLocaleDateString('fr-FR');
      return orderDate === today;
    });

    const newCount = todayOrders.filter(o => o.status === 'nouvelle').length;
    const preparingCount = todayOrders.filter(o => o.status === 'en_preparation').length;
    const readyCount = todayOrders.filter(o => o.status === 'prete').length;
    const totalAmount = todayOrders.reduce((sum, o) => sum + o.total, 0);

    document.getElementById('stat-new').textContent = newCount;
    document.getElementById('stat-preparing').textContent = preparingCount;
    document.getElementById('stat-ready').textContent = readyCount;
    document.getElementById('stat-total').textContent = `${totalAmount.toFixed(2)} €`;
  }

  // Filtrer les commandes
  filterOrders(status) {
    this.currentFilter = status;
    
    // Mettre à jour les boutons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      if (btn.dataset.filter === status) {
        btn.className = 'filter-btn px-4 py-2 rounded-lg font-medium bg-primary text-white';
      } else {
        btn.className = 'filter-btn px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300';
      }
    });

    this.renderOrders();
  }

  // Afficher les commandes
  renderOrders() {
    const container = document.getElementById('orders-container');
    
    const filteredOrders = this.currentFilter === 'all' 
      ? this.orders 
      : this.orders.filter(o => o.status === this.currentFilter);

    if (filteredOrders.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-gray-400">
          <p class="text-lg">Aucune commande ${this.currentFilter !== 'all' ? 'avec ce statut' : 'pour le moment'}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredOrders.map(order => this.createOrderCard(order)).join('');
  }

  // Créer une carte de commande
  createOrderCard(order) {
    const statusConfig = {
      nouvelle: { color: 'danger', label: '🔔 Nouvelle', bg: 'bg-red-50' },
      en_preparation: { color: 'warning', label: '👨‍🍳 En préparation', bg: 'bg-yellow-50' },
      prete: { color: 'success', label: '✅ Prête', bg: 'bg-green-50' },
      servie: { color: 'gray-400', label: '✔️ Servie', bg: 'bg-gray-50' },
      annulee: { color: 'gray-400', label: '❌ Annulée', bg: 'bg-gray-50' }
    };

    const status = statusConfig[order.status] || statusConfig.nouvelle;
    const isNew = order.status === 'nouvelle';

    return `
      <div class="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 ${isNew ? 'new-order border-2 border-danger' : ''} ${status.bg}">
        <div class="flex flex-col gap-3 sm:gap-4">
          
          <!-- Infos commande -->
          <div class="flex-1">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
              <div class="flex-1">
                <div class="flex items-center flex-wrap gap-2 mb-2">
                  <h3 class="text-lg sm:text-xl font-bold text-gray-800">Table ${order.table}</h3>
                  <span class="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-${status.color}/10 text-${status.color}">
                    ${status.label}
                  </span>
                </div>
                <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <span>👤 ${order.name}</span>
                  <span>🕐 ${order.createdAt}</span>
                  <span class="font-mono text-xs hidden sm:inline">#${order.id}</span>
                </div>
              </div>
            </div>

            <!-- Articles -->
            <div class="space-y-2 mb-3">
              ${order.items.map(item => `
                <div class="flex justify-between text-xs sm:text-sm">
                  <span><span class="font-semibold">${item.quantity}x</span> ${item.name}</span>
                  <span class="font-medium whitespace-nowrap ml-2">${(item.price * item.quantity).toFixed(2)} €</span>
                </div>
              `).join('')}
            </div>

            ${order.comment ? `
              <div class="bg-blue-50 border-l-4 border-blue-400 p-2 sm:p-3 mb-3">
                <p class="text-xs sm:text-sm text-gray-700"><strong>💬 Commentaire:</strong> ${order.comment}</p>
              </div>
            ` : ''}

            <div class="flex justify-between items-center pt-3 border-t">
              <span class="text-base sm:text-lg font-bold text-gray-800">Total</span>
              <span class="text-xl sm:text-2xl font-bold text-primary">${order.total.toFixed(2)} €</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-2 sm:flex sm:flex-row md:flex-col gap-2 pt-3 border-t sm:border-t-0 sm:pt-0">
            ${order.status !== 'servie' && order.status !== 'annulee' ? `
              ${order.status === 'nouvelle' ? `
                <button onclick="admin.updateStatus('${order.id}', 'en_preparation')" 
                        class="px-3 py-2 text-sm bg-warning text-white rounded-lg font-medium hover:bg-warning/90 whitespace-nowrap">
                  👨‍🍳 Préparer
                </button>
              ` : ''}
              ${order.status === 'en_preparation' ? `
                <button onclick="admin.updateStatus('${order.id}', 'prete')" 
                        class="px-3 py-2 text-sm bg-success text-white rounded-lg font-medium hover:bg-success/90 whitespace-nowrap">
                  ✅ Prête
                </button>
              ` : ''}
              ${order.status === 'prete' ? `
                <button onclick="admin.updateStatus('${order.id}', 'servie')" 
                        class="px-3 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primary/90 whitespace-nowrap">
                  ✔️ Servir
                </button>
              ` : ''}
              <button onclick="admin.updateStatus('${order.id}', 'annulee')" 
                      class="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 whitespace-nowrap">
                ❌ Annuler
              </button>
            ` : ''}
            <button onclick="admin.deleteOrder('${order.id}')" 
                    class="px-3 py-2 text-sm bg-danger/10 text-danger rounded-lg font-medium hover:bg-danger/20 whitespace-nowrap">
              🗑️ Supprimer
            </button>
          </div>

        </div>
      </div>
    `;
  }

  // Mettre à jour le statut d'une commande
  async updateStatus(orderId, newStatus) {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Erreur de mise à jour');

      const result = await response.json();
      
      // Mettre à jour localement
      const orderIndex = this.orders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        this.orders[orderIndex] = result.order;
      }

      this.updateStats();
      this.renderOrders();

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  }

  // Supprimer une commande
  async deleteOrder(orderId) {
    if (!confirm('Supprimer cette commande ?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Erreur de suppression');

      // Retirer localement
      this.orders = this.orders.filter(o => o.id !== orderId);
      
      this.updateStats();
      this.renderOrders();

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  }

  // Nettoyer les anciennes commandes
  async clearOldOrders() {
    if (!confirm('Supprimer toutes les commandes servies et annulées ?')) return;

    const toDelete = this.orders.filter(o => o.status === 'servie' || o.status === 'annulee');

    for (const order of toDelete) {
      await this.deleteOrder(order.id);
    }
  }
}

// Initialiser l'application admin
const admin = new AdminApp();

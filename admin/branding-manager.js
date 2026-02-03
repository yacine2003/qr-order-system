// Gestionnaire de personnalisation visuelle
const brandingManager = {
  currentConfig: {
    restaurant: {
      name: 'Menu',
      tagline: 'Commandez depuis votre table',
      logo: '🍽️'
    },
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      text: '#1f2937'
    },
    background: {
      type: 'gradient',
      gradient1: '#f5f7fa',
      gradient2: '#c3cfe2',
      solid: '#f9fafb',
      imageUrl: ''
    },
    typography: {
      fontFamily: 'Inter'
    },
    cards: {
      effect: 'glassmorphism',
      borderRadius: 12,
      shadowIntensity: 5
    }
  },

  init() {
    this.loadCurrentConfig();
    this.setupEventListeners();
    this.updatePreview();
  },

  // Charger la configuration actuelle
  async loadCurrentConfig() {
    try {
      const response = await fetch('/api/branding', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          this.currentConfig = { ...this.currentConfig, ...data };
          this.populateForm();
        }
      }
    } catch (error) {
      console.error('Erreur chargement config:', error);
    }
  },

  // Remplir le formulaire avec les valeurs actuelles
  populateForm() {
    const cfg = this.currentConfig;
    
    // Identité
    document.getElementById('restaurant-name').value = cfg.restaurant.name;
    document.getElementById('restaurant-tagline').value = cfg.restaurant.tagline;
    document.getElementById('restaurant-logo').value = cfg.restaurant.logo;
    
    // Couleurs
    document.getElementById('color-primary').value = cfg.colors.primary;
    document.getElementById('color-primary-text').value = cfg.colors.primary;
    document.getElementById('color-secondary').value = cfg.colors.secondary;
    document.getElementById('color-secondary-text').value = cfg.colors.secondary;
    document.getElementById('color-accent').value = cfg.colors.accent;
    document.getElementById('color-accent-text').value = cfg.colors.accent;
    document.getElementById('color-text').value = cfg.colors.text;
    document.getElementById('color-text-text').value = cfg.colors.text;
    
    // Background
    document.getElementById('bg-type').value = cfg.background.type;
    document.getElementById('bg-gradient-1').value = cfg.background.gradient1;
    document.getElementById('bg-gradient-2').value = cfg.background.gradient2;
    document.getElementById('bg-solid-color').value = cfg.background.solid;
    document.getElementById('bg-image-url').value = cfg.background.imageUrl;
    
    // Typo
    document.getElementById('font-family').value = cfg.typography.fontFamily;
    
    // Cartes
    document.getElementById('card-effect').value = cfg.cards.effect;
    document.getElementById('card-radius').value = cfg.cards.borderRadius;
    document.getElementById('card-shadow').value = cfg.cards.shadowIntensity;
    
    this.updateBackgroundOptions();
    this.updatePreview();
  },

  // Configuration des écouteurs d'événements
  setupEventListeners() {
    // Sync color pickers avec inputs texte
    ['primary', 'secondary', 'accent', 'text'].forEach(color => {
      const picker = document.getElementById(`color-${color}`);
      const textInput = document.getElementById(`color-${color}-text`);
      
      picker.addEventListener('input', (e) => {
        textInput.value = e.target.value;
        this.updateConfig();
        this.updatePreview();
      });
      
      textInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(value)) {
          picker.value = value;
          this.updateConfig();
          this.updatePreview();
        }
      });
    });
    
    // Type de background
    document.getElementById('bg-type').addEventListener('change', () => {
      this.updateBackgroundOptions();
      this.updateConfig();
      this.updatePreview();
    });
    
    // Tous les autres inputs
    const inputs = [
      'restaurant-name', 'restaurant-tagline', 'restaurant-logo',
      'bg-gradient-1', 'bg-gradient-2', 'bg-solid-color', 'bg-image-url',
      'font-family', 'card-effect', 'card-radius', 'card-shadow'
    ];
    
    inputs.forEach(id => {
      const el = document.getElementById(id);
      el.addEventListener('input', () => {
        // Mettre à jour les valeurs affichées
        if (id === 'card-radius') {
          document.getElementById('card-radius-value').textContent = el.value;
        } else if (id === 'card-shadow') {
          document.getElementById('card-shadow-value').textContent = el.value;
        }
        
        this.updateConfig();
        this.updatePreview();
      });
    });
  },

  // Mettre à jour les options de background selon le type
  updateBackgroundOptions() {
    const type = document.getElementById('bg-type').value;
    
    document.getElementById('bg-gradient-options').classList.add('hidden');
    document.getElementById('bg-solid-options').classList.add('hidden');
    document.getElementById('bg-image-options').classList.add('hidden');
    
    if (type === 'gradient') {
      document.getElementById('bg-gradient-options').classList.remove('hidden');
    } else if (type === 'solid') {
      document.getElementById('bg-solid-options').classList.remove('hidden');
    } else if (type === 'image') {
      document.getElementById('bg-image-options').classList.remove('hidden');
    }
  },

  // Mettre à jour la config depuis le formulaire
  updateConfig() {
    this.currentConfig = {
      restaurant: {
        name: document.getElementById('restaurant-name').value || 'Menu',
        tagline: document.getElementById('restaurant-tagline').value || 'Commandez depuis votre table',
        logo: document.getElementById('restaurant-logo').value || '🍽️'
      },
      colors: {
        primary: document.getElementById('color-primary').value,
        secondary: document.getElementById('color-secondary').value,
        accent: document.getElementById('color-accent').value,
        text: document.getElementById('color-text').value
      },
      background: {
        type: document.getElementById('bg-type').value,
        gradient1: document.getElementById('bg-gradient-1').value,
        gradient2: document.getElementById('bg-gradient-2').value,
        solid: document.getElementById('bg-solid-color').value,
        imageUrl: document.getElementById('bg-image-url').value
      },
      typography: {
        fontFamily: document.getElementById('font-family').value
      },
      cards: {
        effect: document.getElementById('card-effect').value,
        borderRadius: parseInt(document.getElementById('card-radius').value),
        shadowIntensity: parseInt(document.getElementById('card-shadow').value)
      }
    };
  },

  // Mettre à jour la prévisualisation
  updatePreview() {
    const cfg = this.currentConfig;
    const container = document.getElementById('preview-container').firstElementChild;
    
    // Background
    let bgStyle = '';
    if (cfg.background.type === 'gradient') {
      bgStyle = `linear-gradient(135deg, ${cfg.background.gradient1} 0%, ${cfg.background.gradient2} 100%)`;
    } else if (cfg.background.type === 'solid') {
      bgStyle = cfg.background.solid;
    } else if (cfg.background.type === 'image' && cfg.background.imageUrl) {
      bgStyle = `url(${cfg.background.imageUrl})`;
      container.style.backgroundSize = 'cover';
      container.style.backgroundPosition = 'center';
    }
    container.style.background = bgStyle;
    
    // Police
    container.style.fontFamily = `'${cfg.typography.fontFamily}', sans-serif`;
    
    // Identité
    document.getElementById('preview-logo').textContent = cfg.restaurant.logo;
    document.getElementById('preview-name').textContent = cfg.restaurant.name;
    document.getElementById('preview-tagline').textContent = cfg.restaurant.tagline;
    
    // Couleurs des boutons
    const gradient = `linear-gradient(135deg, ${cfg.colors.primary}, ${cfg.colors.secondary}, ${cfg.colors.accent})`;
    document.getElementById('preview-cat-1').style.background = gradient;
    document.getElementById('preview-btn').style.background = `linear-gradient(135deg, ${cfg.colors.primary}, ${cfg.colors.secondary})`;
    document.getElementById('preview-price').style.color = cfg.colors.primary;
    
    // Style de la carte
    const card = document.getElementById('preview-card');
    card.style.borderRadius = `${cfg.cards.borderRadius}px`;
    
    if (cfg.cards.effect === 'glassmorphism') {
      card.style.background = 'rgba(255, 255, 255, 0.95)';
      card.style.backdropFilter = 'blur(10px)';
      card.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    } else if (cfg.cards.effect === 'solid') {
      card.style.background = 'white';
      card.style.backdropFilter = 'none';
      card.style.border = '1px solid #e5e7eb';
    } else if (cfg.cards.effect === 'gradient') {
      card.style.background = `linear-gradient(135deg, rgba(255,255,255,0.95), rgba(${this.hexToRgb(cfg.colors.primary)}, 0.05))`;
      card.style.backdropFilter = 'blur(10px)';
      card.style.border = `1px solid ${cfg.colors.primary}20`;
    }
    
    // Ombre de la carte
    const shadowIntensity = cfg.cards.shadowIntensity / 10;
    card.style.boxShadow = `0 ${4 * shadowIntensity}px ${15 * shadowIntensity}px rgba(0, 0, 0, ${0.1 * shadowIntensity})`;
  },

  // Appliquer un preset de couleurs
  applyColorPreset(preset) {
    const presets = {
      default: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        text: '#1f2937'
      },
      ocean: {
        primary: '#0ea5e9',
        secondary: '#06b6d4',
        accent: '#6366f1',
        text: '#1f2937'
      },
      forest: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#047857',
        text: '#1f2937'
      },
      sunset: {
        primary: '#f59e0b',
        secondary: '#ef4444',
        accent: '#dc2626',
        text: '#1f2937'
      }
    };
    
    const colors = presets[preset];
    if (colors) {
      document.getElementById('color-primary').value = colors.primary;
      document.getElementById('color-primary-text').value = colors.primary;
      document.getElementById('color-secondary').value = colors.secondary;
      document.getElementById('color-secondary-text').value = colors.secondary;
      document.getElementById('color-accent').value = colors.accent;
      document.getElementById('color-accent-text').value = colors.accent;
      document.getElementById('color-text').value = colors.text;
      document.getElementById('color-text-text').value = colors.text;
      
      this.updateConfig();
      this.updatePreview();
      this.showToast('✅', 'Palette appliquée', `Palette "${preset}" appliquée avec succès`, 'success');
    }
  },

  // Réinitialiser aux valeurs par défaut
  resetToDefault() {
    if (!confirm('Voulez-vous vraiment réinitialiser tous les paramètres ?')) return;
    
    this.currentConfig = {
      restaurant: {
        name: 'Menu',
        tagline: 'Commandez depuis votre table',
        logo: '🍽️'
      },
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        text: '#1f2937'
      },
      background: {
        type: 'gradient',
        gradient1: '#f5f7fa',
        gradient2: '#c3cfe2',
        solid: '#f9fafb',
        imageUrl: ''
      },
      typography: {
        fontFamily: 'Inter'
      },
      cards: {
        effect: 'glassmorphism',
        borderRadius: 12,
        shadowIntensity: 5
      }
    };
    
    this.populateForm();
    this.showToast('✅', 'Réinitialisation', 'Paramètres par défaut restaurés', 'success');
  },

  // Prévisualiser les changements
  previewChanges() {
    window.open('/?preview=true', '_blank');
    this.showToast('👁️', 'Prévisualisation', 'Prévisualisation ouverte dans un nouvel onglet', 'info');
  },

  // Enregistrer les changements
  async saveChanges() {
    const btn = document.getElementById('save-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Enregistrement...';
    
    try {
      const response = await fetch('/api/branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(this.currentConfig)
      });
      
      if (response.ok) {
        this.showToast('✅', 'Succès', 'Personnalisation enregistrée ! Actualisez le menu client pour voir les changements.', 'success');
      } else {
        throw new Error('Erreur serveur');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      this.showToast('❌', 'Erreur', 'Impossible d\'enregistrer les changements', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '💾 Enregistrer';
    }
  },

  // Utilitaire: hex vers rgb
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  },

  // Afficher un toast
  showToast(icon, title, message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    
    toastIcon.textContent = icon;
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    const colors = {
      success: 'border-green-500',
      error: 'border-red-500',
      info: 'border-blue-500'
    };
    
    toast.className = `fixed bottom-4 right-4 bg-white shadow-xl rounded-lg p-4 z-50 max-w-sm border-l-4 ${colors[type]}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 4000);
  }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
  brandingManager.init();
});

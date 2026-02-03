// Configuration de branding - Chargée et appliquée automatiquement
(function() {
  // Configuration par défaut
  window.BRANDING = {
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
    },
    ui: {
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    loaded: false
  };

  // Charger la configuration depuis le serveur
  async function loadBranding() {
    try {
      const response = await fetch('/api/branding');
      if (response.ok) {
        const branding = await response.json();
        // Merge avec la config par défaut
        window.BRANDING = {
          ...window.BRANDING,
          ...branding,
          ui: {
            fontFamily: branding.typography?.fontFamily 
              ? `${branding.typography.fontFamily}, system-ui, sans-serif`
              : window.BRANDING.ui.fontFamily
          },
          loaded: true
        };
        applyBranding();
      } else {
        window.BRANDING.loaded = true;
        applyBranding();
      }
    } catch (error) {
      console.log('Configuration par défaut utilisée');
      window.BRANDING.loaded = true;
      applyBranding();
    }
  }

  // Appliquer la configuration de branding
  function applyBranding() {
    const cfg = window.BRANDING;
    
    // Mettre à jour les variables CSS globales
    const root = document.documentElement;
    root.style.setProperty('--color-primary', cfg.colors.primary);
    root.style.setProperty('--color-secondary', cfg.colors.secondary);
    root.style.setProperty('--color-accent', cfg.colors.accent);
    root.style.setProperty('--color-text', cfg.colors.text);
    root.style.setProperty('--font-family', cfg.typography.fontFamily);
    root.style.setProperty('--card-radius', `${cfg.cards.borderRadius}px`);
    
    // Appliquer le background
    if (cfg.background.type === 'gradient') {
      document.body.style.background = `linear-gradient(135deg, ${cfg.background.gradient1} 0%, ${cfg.background.gradient2} 100%)`;
      document.body.style.backgroundAttachment = 'fixed';
    } else if (cfg.background.type === 'solid') {
      document.body.style.background = cfg.background.solid;
    } else if (cfg.background.type === 'image' && cfg.background.imageUrl) {
      document.body.style.background = `url('${cfg.background.imageUrl}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    }
    
    // Appliquer la police
    document.body.style.fontFamily = `'${cfg.typography.fontFamily}', sans-serif`;
    
    // Mettre à jour UI après chargement DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateUI);
    } else {
      updateUI();
    }
  }

  // Mettre à jour les éléments UI
  function updateUI() {
    const cfg = window.BRANDING;
    
    // Logo et nom
    const brandLogo = document.getElementById('brand-logo');
    const brandName = document.getElementById('brand-name');
    const brandTagline = document.getElementById('brand-tagline');
    
    if (brandLogo) brandLogo.textContent = cfg.restaurant.logo;
    if (brandName) brandName.textContent = cfg.restaurant.name;
    if (brandTagline) brandTagline.textContent = cfg.restaurant.tagline;
    
    // Titre de la page
    document.title = `${cfg.restaurant.name} - Commande en ligne`;
    
    // Appliquer les couleurs aux boutons primaires
    applyColorsToDynamicElements();
  }

  // Appliquer les couleurs aux éléments dynamiques
  function applyColorsToDynamicElements() {
    const cfg = window.BRANDING;
    
    // Injecter des styles CSS dynamiques
    let styleElement = document.getElementById('branding-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'branding-styles';
      document.head.appendChild(styleElement);
    }
    
    const shadowIntensity = cfg.cards.shadowIntensity / 10;
    
    styleElement.textContent = `
      /* Couleurs personnalisées */
      .bg-primary { background-color: ${cfg.colors.primary} !important; }
      .text-primary { color: ${cfg.colors.primary} !important; }
      .border-primary { border-color: ${cfg.colors.primary} !important; }
      
      /* Dégradés personnalisés */
      .category-badge-active {
        background: linear-gradient(135deg, ${cfg.colors.primary} 0%, ${cfg.colors.secondary} 50%, ${cfg.colors.accent} 100%) !important;
      }
      
      .btn-ripple {
        background: linear-gradient(135deg, ${cfg.colors.primary} 0%, ${cfg.colors.secondary} 100%) !important;
      }
      
      #cart-toggle {
        background: linear-gradient(135deg, ${cfg.colors.primary} 0%, ${cfg.colors.secondary} 100%) !important;
      }
      
      /* Style des cartes selon la configuration */
      ${cfg.cards.effect === 'glassmorphism' ? `
        .product-card {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
        }
      ` : cfg.cards.effect === 'solid' ? `
        .product-card {
          background: white !important;
          backdrop-filter: none !important;
          border: 1px solid #e5e7eb !important;
        }
      ` : `
        .product-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.95), ${hexToRgba(cfg.colors.primary, 0.05)}) !important;
          backdrop-filter: blur(10px) !important;
          border: 1px solid ${cfg.colors.primary}33 !important;
        }
      `}
      
      .product-card {
        border-radius: ${cfg.cards.borderRadius}px !important;
        box-shadow: 0 ${4 * shadowIntensity}px ${15 * shadowIntensity}px rgba(0, 0, 0, ${0.1 * shadowIntensity}) !important;
      }
      
      /* Police personnalisée */
      body, input, textarea, select, button {
        font-family: '${cfg.typography.fontFamily}', sans-serif !important;
      }
    `;
  }

  // Utilitaire: hex vers rgba
  function hexToRgba(hex, alpha) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgba(0, 0, 0, ${alpha})`;
  }

  // Charger automatiquement au chargement de la page
  loadBranding();
  
  // Exposer des fonctions utiles
  window.reloadBranding = loadBranding;
})();

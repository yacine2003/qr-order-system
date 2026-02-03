// Configuration de la marque (White Label)
const BRANDING = {
  // Identité du restaurant
  name: "HousnyFamily",
  tagline: "Cuisine authentique & savoureuse",

  // Logo et Icônes
  // Utilisez une URL absolue ou relative, ou un emoji
  logo: {
    type: "emoji", // "emoji" ou "image"
    value: "🍽️",   // Emoji ou chemin vers l'image (ex: "./img/logo.png")
    alt: "Logo Restaurant"
  },

  // Couleurs (Thème)
  // Ces couleurs seront appliquées via Tailwind
  colors: {
    primary: '#6366f1',    // Couleur principale (boutons, liens, prix)
    secondary: '#8b5cf6',  // Couleur secondaire (accents)
    success: '#10b981',    // Validation (vert)
    danger: '#ef4444',     // Erreur/Suppression (rouge)
    warning: '#f59e0b',    // Attention (orange)
    background: '#f9fafb', // Fond de page
    text: '#1f2937'        // Couleur de texte principale
  },

  // Images de fond (Optionnel)
  // Laissez vide pour utiliser la couleur de fond
  backgroundImage: "",

  // Configuration UI
  ui: {
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0.5rem", // rounded-lg
    useCards: true, // Utiliser des cartes pour les produits
  },

  // Réseaux sociaux (Optionnel)
  socials: {
    instagram: "",
    facebook: "",
    website: ""
  }
};

// Export pour utilisation dans l'app
window.BRANDING = BRANDING;

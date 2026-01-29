// Configuration frontend
const CONFIG = {
  // URL de l'API (à modifier en production)
  API_URL: window.location.origin + '/api',
  
  // Paramètres
  SETTINGS: {
    autoSaveCart: true, // Sauvegarder le panier dans localStorage
    animationDuration: 300, // ms
    toastDuration: 3000, // ms
  },

  // Messages
  MESSAGES: {
    cartEmpty: 'Votre panier est vide',
    orderSuccess: 'Commande envoyée avec succès !',
    orderError: 'Erreur lors de l\'envoi de la commande',
    loading: 'Chargement...',
    required: 'Ce champ est requis',
  }
};

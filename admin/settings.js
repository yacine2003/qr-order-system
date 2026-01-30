// Configuration
const API_URL = window.location.origin;

// Éléments DOM
const form = document.getElementById('credentials-form');
const currentPasswordInput = document.getElementById('current-password');
const newUsernameInput = document.getElementById('new-username');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const saveBtn = document.getElementById('save-btn');
const currentUsernameDisplay = document.getElementById('current-username');
const strengthBar = document.getElementById('strength-fill');
const strengthText = document.getElementById('strength-text');

// Au chargement
document.addEventListener('DOMContentLoaded', () => {
  loadCurrentUsername();
  setupEventListeners();
});

// Charger le nom d'utilisateur actuel
async function loadCurrentUsername() {
  try {
    const response = await fetch(`${API_URL}/api/admin/current-username`, {
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      currentUsernameDisplay.textContent = data.username;
      newUsernameInput.value = data.username; // Pré-remplir avec le username actuel
    } else {
      currentUsernameDisplay.textContent = 'Erreur';
    }
  } catch (error) {
    console.error('Erreur chargement username:', error);
    currentUsernameDisplay.textContent = 'Erreur';
  }
}

// Événements
function setupEventListeners() {
  // Vérifier la force du mot de passe
  newPasswordInput.addEventListener('input', checkPasswordStrength);
  
  // Soumettre le formulaire
  form.addEventListener('submit', handleSubmit);
  
  // Réinitialiser le formulaire
  form.addEventListener('reset', () => {
    strengthBar.style.width = '0%';
    strengthText.textContent = 'Force du mot de passe : -';
  });
}

// Vérifier la force du mot de passe
function checkPasswordStrength() {
  const password = newPasswordInput.value;
  let strength = 0;
  let color = '';
  let text = '';

  if (password.length === 0) {
    strengthBar.style.width = '0%';
    strengthText.textContent = 'Force du mot de passe : -';
    return;
  }

  // Critères de force
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 20;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

  // Déterminer couleur et texte
  if (strength < 40) {
    color = '#EF4444'; // Rouge
    text = 'Faible';
  } else if (strength < 60) {
    color = '#F59E0B'; // Orange
    text = 'Moyen';
  } else if (strength < 80) {
    color = '#10B981'; // Vert
    text = 'Bon';
  } else {
    color = '#059669'; // Vert foncé
    text = 'Excellent';
  }

  strengthBar.style.width = `${strength}%`;
  strengthBar.style.backgroundColor = color;
  strengthText.textContent = `Force du mot de passe : ${text}`;
  strengthText.style.color = color;
}

// Soumettre le formulaire
async function handleSubmit(e) {
  e.preventDefault();

  // Validation côté client
  const currentPassword = currentPasswordInput.value;
  const newUsername = newUsernameInput.value.trim();
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Vérifier que les mots de passe correspondent
  if (newPassword !== confirmPassword) {
    showToast('❌', 'Erreur', 'Les mots de passe ne correspondent pas', 'error');
    return;
  }

  // Vérifier la longueur du username
  if (newUsername.length < 3) {
    showToast('❌', 'Erreur', 'Le nom d\'utilisateur doit contenir au moins 3 caractères', 'error');
    return;
  }

  // Vérifier le format du username
  if (!/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
    showToast('❌', 'Erreur', 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, - et _', 'error');
    return;
  }


  // Désactiver le bouton
  saveBtn.disabled = true;
  saveBtn.innerHTML = '⏳ Enregistrement...';

  try {
    // Envoyer la requête
    const response = await fetch(`${API_URL}/api/admin/credentials`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        currentPassword,
        newUsername,
        newPassword
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Succès
      showToast('✅', 'Succès', data.message || 'Identifiants modifiés avec succès', 'success');
      
      // Mettre à jour l'affichage du username actuel sans requête API
      const newUsername = newUsernameInput.value.trim();
      currentUsernameDisplay.textContent = newUsername;
      
      // Réinitialiser le formulaire
      form.reset();
      strengthBar.style.width = '0%';
      strengthText.textContent = 'Force du mot de passe : -';
      
      // Pré-remplir avec le nouveau username
      newUsernameInput.value = newUsername;
      
      // Réactiver le bouton
      saveBtn.disabled = false;
      saveBtn.innerHTML = '💾 Enregistrer les modifications';
      
      // Afficher un message informatif
      setTimeout(() => {
        showToast('ℹ️', 'Information', 'Les nouveaux identifiants seront requis lors de votre prochaine connexion.', 'info');
      }, 3000);

    } else {
      // Erreur
      showToast('❌', 'Erreur', data.error || 'Erreur lors de la modification', 'error');
      saveBtn.disabled = false;
      saveBtn.innerHTML = '💾 Enregistrer les modifications';
    }

  } catch (error) {
    console.error('Erreur:', error);
    showToast('❌', 'Erreur', 'Impossible de contacter le serveur', 'error');
    saveBtn.disabled = false;
    saveBtn.innerHTML = '💾 Enregistrer les modifications';
  }
}

// Toggle password visibility
function togglePasswordVisibility(fieldId) {
  const input = document.getElementById(fieldId);
  const iconHide = document.getElementById(`${fieldId}-icon-hide`);
  const iconShow = document.getElementById(`${fieldId}-icon-show`);
  
  if (input.type === 'password') {
    input.type = 'text';
    iconHide.classList.add('hidden');
    iconShow.classList.remove('hidden');
  } else {
    input.type = 'password';
    iconHide.classList.remove('hidden');
    iconShow.classList.add('hidden');
  }
}

// Afficher un toast
function showToast(icon, title, message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toast-icon');
  const toastTitle = document.getElementById('toast-title');
  const toastMessage = document.getElementById('toast-message');

  toastIcon.textContent = icon;
  toastTitle.textContent = title;
  toastMessage.textContent = message;

  // Couleurs selon le type
  if (type === 'success') {
    toast.className = 'fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 max-w-md';
  } else if (type === 'error') {
    toast.className = 'fixed bottom-8 right-8 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 max-w-md';
  } else if (type === 'warning') {
    toast.className = 'fixed bottom-8 right-8 bg-orange-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 max-w-md';
  } else {
    toast.className = 'fixed bottom-8 right-8 bg-gray-800 text-white px-6 py-4 rounded-lg shadow-2xl z-50 max-w-md';
  }

  toast.classList.remove('hidden');

  // Masquer après 5 secondes
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 5000);
}

(function() {
  'use strict';

  const STORAGE_KEY = 'preference-profile-v1';
  const THEME_KEY = 'theme-preference';
  const FONT_SIZE_KEY = 'font-size-preference';

  function init() {
    loadTheme();
    loadFontSize();
    setupEventListeners();
    renderProfile();
  }

  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    }
  }

  function loadFontSize() {
    const saved = localStorage.getItem(FONT_SIZE_KEY);
    if (saved) {
      document.body.style.setProperty('--font-size-base', saved + 'px');
    }
  }

  function setupEventListeners() {
    const themeToggle = document.getElementById('theme-toggle');
    const fontSizeInput = document.getElementById('fontSize-input');
    const profileForm = document.getElementById('profile-form');

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(THEME_KEY, next);
      });
    }

    if (fontSizeInput) {
      fontSizeInput.addEventListener('input', () => {
        const size = fontSizeInput.value;
        document.body.style.setProperty('--font-size-base', size + 'px');
        localStorage.setItem(FONT_SIZE_KEY, size);
      });
    }

    if (profileForm) {
      profileForm.addEventListener('submit', handleProfileSubmit);
    }
  }

  function handleProfileSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const profile = {
      name: form.name.value,
      email: form.email.value,
      interests: Array.from(form.interests.checked).map(cb => cb.value),
      notifications: form.notifications.checked
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    renderProfile();
    alert('Profile saved successfully!');
  }

  function renderProfile() {
    const profile = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const container = document.getElementById('profile-container');

    if (!container) return;

    if (Object.keys(profile).length === 0) {
      container.innerHTML = '<p class="empty-state">No profile saved yet. Fill out the form above to create one.</p>';
      return;
    }

    const interestsHtml = profile.interests.map(i => `<span class="interest-tag">${i}</span>`).join('');
    const notificationsHtml = profile.notifications ? '<span class="status-icon">✓</span>' : '';

    container.innerHTML = `
      <div class="profile-card">
        <h2>${profile.name || 'Unnamed User'}</h2>
        <p class="email">${profile.email || 'No email provided'}</p>
        <div class="interests-section">
          <strong>Interests:</strong>
          <div class="interests-list">${interestsHtml || '<span class="empty-state">None selected</span>'}</div>
        </div>
        <div class="notifications-section">
          <strong>Notifications:</strong> ${notificationsHtml}
        </div>
      </div>
    `;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
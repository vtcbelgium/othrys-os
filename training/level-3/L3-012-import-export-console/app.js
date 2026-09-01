(function() {
  'use strict';

  const STORAGE_KEY = 'l3-012-state';
  let state = {};
  let isImporting = false;
  let isExporting = false;

  function init() {
    loadState();
    render();
    setupEventListeners();
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load state:', e);
      state = {};
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }

  function setupEventListeners() {
    const importBtn = document.getElementById('import-btn');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const statusEl = document.getElementById('status');

    if (importBtn) {
      importBtn.addEventListener('click', () => {
        isImporting = true;
        statusEl.textContent = 'Import mode active. Paste JSON data below.';
        render();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        isExporting = true;
        statusEl.textContent = 'Export mode active. Click to download state.';
        render();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear all stored state?')) {
          localStorage.removeItem(STORAGE_KEY);
          state = {};
          saveState();
          render();
          statusEl.textContent = 'State cleared.';
        }
      });
    }

    const textarea = document.getElementById('import-data');
    if (textarea) {
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && isImporting) {
          e.preventDefault();
          importFromTextarea(textarea.value);
          textarea.value = '';
        }
      });
    }

    const downloadLink = document.getElementById('download-link');
    if (downloadLink) {
      downloadLink.addEventListener('click', () => {
        if (!isExporting) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
        const anchor = document.createElement('a');
        anchor.setAttribute('href', dataStr);
        anchor.setAttribute('download', 'l3-012-state.json');
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        statusEl.textContent = 'State exported.';
      });
    }
  }

  function importFromTextarea(json) {
    try {
      const parsed = JSON.parse(json);
      if (typeof parsed === 'object' && parsed !== null) {
        state = parsed;
        saveState();
        render();
        statusEl.textContent = 'Import successful.';
      } else {
        throw new Error('Invalid structure');
      }
    } catch (e) {
      statusEl.textContent = 'Import failed: Invalid JSON.';
    }
  }

  function exportState() {
    return JSON.stringify(state, null, 2);
  }

  function render() {
    const container = document.getElementById('app');
    if (!container) return;

    const itemsEl = document.getElementById('items-list');
    const countEl = document.getElementById('item-count');
    const importBtn = document.getElementById('import-btn');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    const statusEl = document.getElementById('status');
    const textarea = document.getElementById('import-data');
    const downloadLink = document.getElementById('download-link');

    if (itemsEl) {
      itemsEl.innerHTML = '';
      Object.keys(state).forEach(key => {
        const item = state[key];
        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `
          <span class="key">${escapeHtml(key)}</span>:
          <span class="value">${escapeHtml(String(item))}</span>
        `;
        itemsEl.appendChild(li);
      });
    }

    if (countEl) {
      countEl.textContent = Object.keys(state).length;
    }

    if (importBtn) {
      importBtn.disabled = !isImporting;
      importBtn.title = isImporting ? 'Click to toggle off' : 'Click to enable import mode';
    }

    if (exportBtn) {
      exportBtn.disabled = !isExporting;
      exportBtn.title = isExporting ? 'Click to toggle off' : 'Click to enable export mode';
    }

    if (clearBtn) {
      clearBtn.disabled = Object.keys(state).length === 0;
    }

    if (statusEl) {
      statusEl.textContent = '';
    }

    if (textarea) {
      textarea.disabled = !isImporting;
    }

    if (downloadLink) {
      downloadLink.style.display = isExporting ? 'inline-block' : 'none';
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

(function() {
  'use strict';

  const STORAGE_KEY = 'L3-020_STATE';
  let state = {};

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load state:', e);
      state = {};
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }

  function init() {
    loadState();
    render();
    setupEventListeners();
  }

  function setupEventListeners() {
    const form = document.getElementById('taskForm');
    if (form) {
      form.addEventListener('submit', handleTaskSubmit);
    }

    const clearBtn = document.getElementById('clearState');
    if (clearBtn) {
      clearBtn.addEventListener('click', handleClearState);
    }

    const toggleThemeBtn = document.getElementById('toggleTheme');
    if (toggleThemeBtn) {
      toggleThemeBtn.addEventListener('click', handleToggleTheme);
    }
  }

  function handleTaskSubmit(e) {
    e.preventDefault();
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();

    if (!taskText) return;

    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString()
    };

    state.tasks = state.tasks || [];
    state.tasks.push(newTask);
    saveState();
    render();
    taskInput.value = '';
  }

  function handleClearState() {
    if (confirm('Are you sure you want to clear all tasks?')) {
      state.tasks = [];
      saveState();
      render();
    }
  }

  function handleToggleTheme() {
    const body = document.body;
    const currentClass = body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';
    body.classList.remove(currentClass);
    if (state.theme !== currentClass) {
      state.theme = body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';
      saveState();
    }
  }

  function render() {
    const container = document.getElementById('taskList');
    if (!container) return;

    container.innerHTML = '';

    if (!state.tasks || state.tasks.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-state';
      emptyMsg.textContent = 'No tasks yet. Add one above!';
      container.appendChild(emptyMsg);
      return;
    }

    const fragment = document.createDocumentFragment();

    state.tasks.forEach(task => {
      const item = document.createElement('div');
      item.className = `task-item ${task.completed ? 'completed' : ''}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', (e) => {
        task.completed = e.target.checked;
        saveState();
        render();
      });

      const label = document.createElement('label');
      label.htmlFor = `task-${task.id}`;
      label.textContent = task.text;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        state.tasks = state.tasks.filter(t => t.id !== task.id);
        saveState();
        render();
      });

      item.appendChild(checkbox);
      item.appendChild(label);
      item.appendChild(deleteBtn);
      fragment.appendChild(item);
    });

    container.appendChild(fragment);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
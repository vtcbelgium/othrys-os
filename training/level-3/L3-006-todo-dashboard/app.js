(function() {
  'use strict';

  const STORAGE_KEY = 'todo-dashboard-v1';
  let todos = [];

  function loadTodos() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        todos = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load todos:', e);
      todos = [];
    }
  }

  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.error('Failed to save todos:', e);
    }
  }

  function renderTodos() {
    const list = document.getElementById('todo-list');
    if (!list) return;

    list.innerHTML = '';

    if (todos.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-state';
      emptyMsg.textContent = 'No tasks yet. Add one above!';
      list.appendChild(emptyMsg);
      return;
    }

    todos.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', () => {
        todo.completed = checkbox.checked;
        saveTodos();
        renderTodos();
      });

      const span = document.createElement('span');
      span.textContent = todo.text;
      span.className = 'todo-text';

      if (todo.completed) {
        span.classList.add('completed-text');
      }

      li.appendChild(checkbox);
      li.appendChild(span);
      list.appendChild(li);
    });
  }

  function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();

    if (!text) return;

    todos.unshift({
      text: text,
      completed: false
    });

    saveTodos();
    renderTodos();
    input.value = '';
  }

  function deleteTodo(event) {
    event.preventDefault();
    event.stopPropagation();

    const li = event.currentTarget;
    const todoIndex = Array.from(li.parentElement.children).indexOf(li);

    if (todoIndex > -1) {
      todos.splice(todoIndex, 1);
      saveTodos();
      renderTodos();
    }
  }

  function init() {
    loadTodos();
    renderTodos();

    const form = document.getElementById('todo-form');
    if (form) {
      form.addEventListener('submit', addTodo);
    }

    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', deleteTodo);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();

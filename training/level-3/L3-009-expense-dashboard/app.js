(function() {
  'use strict';

  const STORAGE_KEY = 'expense_dashboard_v1';
  let expenses = [];

  function init() {
    loadExpenses();
    renderExpenses();
    renderSummary();
    setupEventListeners();
  }

  function loadExpenses() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        expenses = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load expenses:', e);
      expenses = [];
    }
  }

  function saveExpenses() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses:', e);
    }
  }

  function addExpense(e) {
    e.preventDefault();
    const form = document.getElementById('expense-form');
    const amountInput = form.querySelector('[name="amount"]');
    const categoryInput = form.querySelector('[name="category"]');
    const dateInput = form.querySelector('[name="date"]');

    if (!amountInput.value || !categoryInput.value || !dateInput.value) {
      alert('Please fill in all fields.');
      return;
    }

    const newExpense = {
      id: Date.now(),
      amount: parseFloat(amountInput.value),
      category: categoryInput.value,
      date: dateInput.value
    };

    expenses.push(newExpense);
    saveExpenses();
    renderExpenses();
    renderSummary();

    form.reset();
  }

  function deleteExpense(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    saveExpenses();
    renderExpenses();
    renderSummary();
  }

  function renderExpenses() {
    const container = document.getElementById('expenses-list');
    if (!container) return;

    if (expenses.length === 0) {
      container.innerHTML = '<p class="empty-state">No expenses recorded yet.</p>';
      return;
    }

    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    let html = '';

    sortedExpenses.forEach(exp => {
      const formattedDate = new Date(exp.date).toLocaleDateString();
      html += `
        <div class="expense-item" data-id="${exp.id}">
          <span class="expense-date">${formattedDate}</span>
          <span class="expense-category">${escapeHtml(exp.category)}</span>
          <span class="expense-amount ${exp.amount >= 0 ? 'positive' : 'negative'}">
            ${exp.amount >= 0 ? '+' : ''}${formatCurrency(exp.amount)}
          </span>
          <button class="delete-btn" data-id="${exp.id}" aria-label="Delete expense">
            &times;
          </button>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function renderSummary() {
    const summaryContainer = document.getElementById('summary');
    if (!summaryContainer) return;

    const totalIncome = expenses.filter(e => e.amount > 0).reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = expenses.filter(e => e.amount < 0).reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const balance = totalIncome - totalExpense;

    summaryContainer.innerHTML = `
      <div class="summary-card">
        <h3>Summary</h3>
        <p>Total Income: <span class="positive">${formatCurrency(totalIncome)}</span></p>
        <p>Total Expenses: <span class="negative">${formatCurrency(totalExpense)}</span></p>
        <p class="balance">Balance: <span class="${balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(balance)}</span></p>
      </div>
    `;
  }

  function setupEventListeners() {
    const form = document.getElementById('expense-form');
    if (form) {
      form.addEventListener('submit', addExpense);
    }

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const id = parseInt(this.getAttribute('data-id'));
        deleteExpense(id);
      });
    });
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
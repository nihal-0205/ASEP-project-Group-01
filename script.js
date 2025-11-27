// Application State
const appState = {
    currentUser: null,
    isLoggedIn: false,
    userData: {
        balance: 15000.00,
        monthlyBudget: 5000.00,
        expenses: [
            { id: 1, description: 'Groceries', amount: 1250, category: 'homefood', date: '2023-06-15', timestamp: new Date('2023-06-15T10:00:00') },
            { id: 2, description: 'Movie Tickets', amount: 600, category: 'entertainment', date: '2023-06-14', timestamp: new Date('2023-06-14T18:30:00') },
            { id: 3, description: 'Uber Rides', amount: 850, category: 'transport', date: '2023-06-13', timestamp: new Date('2023-06-13T09:15:00') },
            { id: 4, description: 'Restaurant Dinner', amount: 1200, category: 'food', date: '2023-06-12', timestamp: new Date('2023-06-12T20:00:00') },
            { id: 5, description: 'Online Shopping', amount: 2500, category: 'shopping', date: '2023-06-10', timestamp: new Date('2023-06-10T14:45:00') }
        ],
        monthlySpending: 0.00
    },
    categoryChart: null,
    budgetChart: null
};

// DOM Elements
const homePage = document.getElementById('homePage');
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeMessage = document.getElementById('welcomeMessage');
const expenseForm = document.getElementById('expenseForm');
const expensesList = document.getElementById('expensesList');
const monthlyBudgetInput = document.getElementById('monthlyBudget');
const setBudgetBtn = document.getElementById('setBudgetBtn');

// Financial Display Elements
const currentBalanceEl = document.getElementById('currentBalance');
const monthlySpendingEl = document.getElementById('monthlySpending');
const remainingBudgetEl = document.getElementById('remainingBudget');
const budgetProgress = document.getElementById('budgetProgress');
const budgetText = document.getElementById('budgetText');

// Valid Credentials
const VALID_CREDENTIALS = {
    username: 'User0001',
    password: 'Passuser0001'
};

// Category Labels and Colors
const CATEGORY_CONFIG = {
    food: { label: 'Daily Food', color: '#4361ee' },
    junkfood: { label: 'Junk Food', color: '#f72585' },
    homefood: { label: 'Food for Home', color: '#4cc9f0' },
    luxury: { label: 'Luxury Items', color: '#7209b7' },
    shopping: { label: 'Online Shopping', color: '#3a0ca3' },
    transport: { label: 'Transportation', color: '#4895ef' },
    entertainment: { label: 'Entertainment', color: '#560bad' },
    utilities: { label: 'Utilities', color: '#b5179e' },
    healthcare: { label: 'Healthcare', color: '#f8961e' },
    other: { label: 'Other', color: '#adb5bd' }
};

// Initialize Application
function initApp() {
    loadUserData();
    setupEventListeners();
    calculateMonthlySpending(); // Recalculate based on loaded data
    checkLoginStatus(); // Decides which page to show initially
}

// Event Listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    expenseForm.addEventListener('submit', handleAddExpense);
    setBudgetBtn.addEventListener('click', handleSetBudget);
    
    // Category search functionality
    const expenseDescription = document.getElementById('expenseDescription');
    expenseDescription.addEventListener('input', suggestCategory);
}

// Page Navigation
function showHomePage() {
    hideAllPages();
    homePage.classList.add('active');
}

function showLoginPage() {
    hideAllPages();
    loginPage.classList.add('active');
}

function showDashboardPage() {
    hideAllPages();
    dashboardPage.classList.add('active');
    updateDashboard();
}

function hideAllPages() {
    homePage.classList.remove('active');
    loginPage.classList.remove('active');
    dashboardPage.classList.remove('active');
}

// Category Suggestion Function
function suggestCategory() {
    const input = document.getElementById('expenseDescription').value;
    const categorySelect = document.getElementById('expenseCategory');
    const inputLower = input.toLowerCase();
    
    // Clear existing options except the default 'Select a category'
    const defaultOption = categorySelect.querySelector('option[value=""]');
    categorySelect.innerHTML = '';
    categorySelect.appendChild(defaultOption);
    
    // Add all categories, highlighting matches (optional: can also just filter)
    let matchedCategory = null;
    
    Object.entries(CATEGORY_CONFIG).forEach(([value, config]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = config.label;

        // Simple match logic
        if (config.label.toLowerCase().includes(inputLower) || inputLower.includes(value)) {
            // Set as the likely suggestion, but don't auto-select yet
            if (!matchedCategory) {
                matchedCategory = value;
            }
        }
        categorySelect.appendChild(option);
    });

    // Auto-select the best match if one is found
    if (matchedCategory) {
        categorySelect.value = matchedCategory;
    }
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        loginSuccess(username);
    } else {
        showLoginMessage('Invalid User ID or password entered. Please try again.', 'error');
    }
}

// Successful Login
function loginSuccess(username) {
    appState.currentUser = username;
    appState.isLoggedIn = true;
    saveUserData(); // Save login state
    
    showLoginMessage('Login successful! Redirecting...', 'success');
    
    setTimeout(() => {
        showDashboardPage();
        updateDashboard();
    }, 1000);
}

// Login Message Display
function showLoginMessage(message, type) {
    loginMessage.textContent = message;
    loginMessage.className = `message ${type}`;
    
    setTimeout(() => {
        loginMessage.textContent = '';
        loginMessage.className = 'message';
    }, 3000);
}

// Logout Handler
function handleLogout() {
    appState.currentUser = null;
    appState.isLoggedIn = false;
    saveUserData();
    showLoginPage();
    clearLoginForm();
}

// Clear Login Form
function clearLoginForm() {
    loginForm.reset();
}

// Check Login Status
function checkLoginStatus() {
    if (appState.isLoggedIn) {
        showDashboardPage();
    } else {
        showHomePage();
    }
}

// Add Expense Handler
function handleAddExpense(e) {
    e.preventDefault();
    
    const description = document.getElementById('expenseDescription').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    
    if (!description || !amount || !category) {
        alert('Please fill in all fields');
        return;
    }
    
    if (amount <= 0) {
        alert('Please enter a valid amount greater than zero.');
        return;
    }

    if (amount > appState.userData.balance) {
        alert('Insufficient balance! You cannot spend more than your current balance.');
        return;
    }
    
    const now = new Date();
    const newExpense = {
        id: Date.now(),
        description,
        amount,
        category,
        date: now.toLocaleDateString('en-IN'), // Formatted date string
        timestamp: now // Actual date object for sorting
    };
    
    // Update user data
    appState.userData.expenses.unshift(newExpense); // Add to the beginning
    appState.userData.balance -= amount;
    calculateMonthlySpending(); // Recalculate spending
    
    // Save and update UI
    saveUserData();
    updateDashboard();
    expenseForm.reset();
    
    // Show success feedback
    showExpenseAddedFeedback();
}

// Show expense added feedback
function showExpenseAddedFeedback() {
    const button = expenseForm.querySelector('button');
    const originalText = button.textContent;
    const originalBackground = button.style.background;
    
    button.textContent = '✓ Added!';
    button.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = originalBackground;
    }, 2000);
}

// Set Budget Handler
function handleSetBudget() {
    const budget = parseFloat(monthlyBudgetInput.value);
    
    if (!budget || budget <= 0) {
        alert('Please enter a valid budget amount');
        return;
    }
    
    appState.userData.monthlyBudget = budget;
    saveUserData();
    updateDashboard();
    
    monthlyBudgetInput.value = '';
    alert('Monthly budget updated successfully!');
}

// Calculate Monthly Spending
function calculateMonthlySpending() {
    // For a simple demo, we'll calculate from all expenses
    // In a real app, you would filter by expenses in the current month/period.
    appState.userData.monthlySpending = appState.userData.expenses.reduce((total, expense) => {
        return total + expense.amount;
    }, 0);
}

// Update Dashboard UI elements
function updateDashboard() {
    // Update financial overview
    currentBalanceEl.textContent = `₹${appState.userData.balance.toFixed(2)}`;
    monthlySpendingEl.textContent = `₹${appState.userData.monthlySpending.toFixed(2)}`;
    
    const remainingBudget = appState.userData.monthlyBudget - appState.userData.monthlySpending;
    remainingBudgetEl.textContent = `₹${Math.max(0, remainingBudget).toFixed(2)}`;
    
    // Update budget progress
    const spendingPercentage = (appState.userData.monthlySpending / appState.userData.monthlyBudget) * 100;
    const progressFill = document.getElementById('budgetProgress');
    
    if (appState.userData.monthlyBudget > 0) {
        progressFill.style.width = `${Math.min(100, spendingPercentage)}%`;
        
        // Update budget text
        budgetText.textContent = `You have ₹${Math.max(0, remainingBudget).toFixed(2)} left from your ₹${appState.userData.monthlyBudget.toFixed(2)} budget`;
        
        // Change color based on spending
        if (spendingPercentage >= 90) {
            progressFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            budgetText.style.color = '#e74c3c';
        } else if (spendingPercentage >= 75) {
            progressFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
            budgetText.style.color = '#f39c12';
        } else {
            progressFill.style.background = 'var(--gradient)';
            budgetText.style.color = 'var(--primary)';
        }
    } else {
        progressFill.style.width = '0%';
        budgetText.textContent = 'Set a monthly budget to track your spending';
        budgetText.style.color = 'var(--gray)';
    }
    
    // Update expenses list
    updateExpensesList();
    
    // Update charts
    updateCharts();
    
    // Update welcome message
    welcomeMessage.textContent = `Welcome, ${appState.currentUser}!`;
}

// Update Expenses List
function updateExpensesList() {
    expensesList.innerHTML = '';
    
    if (appState.userData.expenses.length === 0) {
        expensesList.innerHTML = '<div class="expense-item" style="text-align: center; color: #666; border-left: 4px solid #adb5bd;">No expenses recorded yet</div>';
        return;
    }
    
    // Sort by most recent (timestamp is already an object in the mock data, so we can sort)
    // Note: unshift in handleAddExpense keeps the most recent at the start, so a fresh sort might not be strictly needed for display, but it's good practice.
    const sortedExpenses = appState.userData.expenses.sort((a, b) => b.timestamp - a.timestamp); 
    
    // Show last 10 expenses
    const recentExpenses = sortedExpenses.slice(0, 10);
    
    recentExpenses.forEach(expense => {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        
        const categoryConfig = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG['other'];
        
        expenseItem.style.borderLeftColor = categoryConfig.color;
        
        expenseItem.innerHTML = `
            <div class="expense-info">
                <div class="expense-desc">${expense.description}</div>
                <div class="expense-meta">
                    <span class="expense-date">${expense.date}</span>
                    <span class="expense-category">${categoryConfig.label}</span>
                </div>
            </div>
            <div class="expense-amount">-₹${expense.amount.toFixed(2)}</div>
        `;
        expensesList.appendChild(expenseItem);
    });
}

// Update Charts
function updateCharts() {
    updateCategoryChart();
    updateBudgetChart();
}

// Update Category Chart
function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    // Calculate category totals
    const categoryTotals = {};
    appState.userData.expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });
    
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    Object.entries(categoryTotals).forEach(([category, total]) => {
        labels.push(CATEGORY_CONFIG[category].label);
        data.push(total);
        backgroundColors.push(CATEGORY_CONFIG[category].color);
    });
    
    // Destroy existing chart if it exists
    if (appState.categoryChart) {
        appState.categoryChart.destroy();
    }
    
    // Create new chart
    appState.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += `₹${context.parsed.toFixed(2)}`;
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Update Budget Chart
function updateBudgetChart() {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    
    // Calculate data for budget chart
    const spent = appState.userData.monthlySpending;
    const monthlyBudget = appState.userData.monthlyBudget;

    // Data points will be dependent on whether a budget is set and if it's overspent
    const labels = [];
    const data = [];
    const backgroundColors = [];
    
    if (monthlyBudget > 0) {
        labels.push('Spent');
        data.push(Math.min(spent, monthlyBudget));
        backgroundColors.push('#f72585'); // Danger for spent

        if (spent < monthlyBudget) {
            labels.push('Remaining');
            data.push(monthlyBudget - spent);
            backgroundColors.push('#4cc9f0'); // Success/Info for remaining
        }

        if (spent > monthlyBudget) {
            labels.push('Over Budget');
            data.push(spent - monthlyBudget);
            backgroundColors.push('#e74c3c'); // Red for over budget
        }
    } else {
         // Show a placeholder if no budget is set
        labels.push('No Budget Set');
        data.push(1);
        backgroundColors.push('#adb5bd'); // Gray placeholder
    }
    
    // Destroy existing chart if it exists
    if (appState.budgetChart) {
        appState.budgetChart.destroy();
    }
    
    // Create new chart
    appState.budgetChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label === 'No Budget Set') return label;
                            
                            if (label) {
                                label += ': ';
                            }
                            label += `₹${context.parsed.toFixed(2)}`;
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Save User Data to Local Storage
function saveUserData() {
    const dataToSave = {
        currentUser: appState.currentUser,
        isLoggedIn: appState.isLoggedIn,
        userData: appState.userData
    };
    localStorage.setItem('finlitUserData', JSON.stringify(dataToSave));
}

// Load User Data from Local Storage
function loadUserData() {
    const savedData = localStorage.getItem('finlitUserData');
    if (savedData) {
        const data = JSON.parse(savedData);
        appState.currentUser = data.currentUser;
        appState.isLoggedIn = data.isLoggedIn;
        
        // Merge stored data with default structure to prevent errors
        appState.userData = { ...appState.userData, ...data.userData };
        
        // Convert date strings back to Date objects for sorting
        if (appState.userData.expenses) {
             appState.userData.expenses.forEach(expense => {
                // Check if it's a string, convert if so (handle initial mock data vs new expenses)
                if (typeof expense.timestamp === 'string') {
                    expense.timestamp = new Date(expense.timestamp);
                }
            });
        }
    }
}

// Expose navigation functions globally for HTML onClick attributes
window.showHomePage = showHomePage;
window.showLoginPage = showLoginPage;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});
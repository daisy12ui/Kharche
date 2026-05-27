/**
 * Kharche - LocalStorage Database Wrapper & State Seeder
 */

const DB_KEYS = {
    TRANSACTIONS: 'kharche_transactions',
    BUDGETS: 'kharche_budgets',
    DEBTS: 'kharche_debts',
    SETTINGS: 'kharche_settings'
};

// Default Categories with Icons and HSL Color variables
const CATEGORIES = {
    Food: { name: 'Food', icon: 'utensils', color: '--color-food' },
    Travel: { name: 'Travel', icon: 'car', color: '--color-travel' },
    Shopping: { name: 'Shopping', icon: 'shopping-bag', color: '--color-shopping' },
    Bills: { name: 'Bills & Utilities', icon: 'credit-card', color: '--color-bills' },
    Entertainment: { name: 'Entertainment', icon: 'film', color: '--color-entertainment' },
    Salary: { name: 'Salary', icon: 'dollar-sign', color: '--color-salary' },
    Investment: { name: 'Investment', icon: 'trending-up', color: '--color-investment' },
    Others: { name: 'Others', icon: 'box', color: '--color-others' }
};

// Seed Data helper to make the dashboard look stunning instantly
function getSeedData() {
    const now = new Date();
    const formatDate = (daysAgo) => {
        const d = new Date(now);
        d.setDate(now.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
    };

    const transactions = [
        { id: 't1', date: formatDate(0), time: '13:45', amount: 450, purpose: 'Lunch with team', type: 'out', category: 'Food' },
        { id: 't2', date: formatDate(0), time: '09:00', amount: 50000, purpose: 'Monthly Salary', type: 'in', category: 'Salary' },
        { id: 't3', date: formatDate(1), time: '18:30', amount: 1200, purpose: 'Weekly Grocery Shopping', type: 'out', category: 'Shopping' },
        { id: 't4', date: formatDate(2), time: '20:15', amount: 800, purpose: 'Movie Tickets & Popcorn', type: 'out', category: 'Entertainment' },
        { id: 't5', date: formatDate(3), time: '08:15', amount: 150, purpose: 'Cab ride to office', type: 'out', category: 'Travel' },
        { id: 't6', date: formatDate(4), time: '11:00', amount: 3200, purpose: 'Electricity Bill', type: 'out', category: 'Bills' },
        { id: 't7', date: formatDate(5), time: '16:40', amount: 350, purpose: 'Coffee and snacks', type: 'out', category: 'Food' },
        { id: 't8', date: formatDate(6), time: '14:20', amount: 2500, purpose: 'Freelance Design Project', type: 'in', category: 'Investment' },
        { id: 't9', date: formatDate(8), time: '10:00', amount: 950, purpose: 'Petrol refill', type: 'out', category: 'Travel' },
        { id: 't10', date: formatDate(12), time: '19:00', amount: 4500, purpose: 'New Running Shoes', type: 'out', category: 'Shopping' },
        { id: 't11', date: formatDate(15), time: '21:30', amount: 1800, purpose: 'Dinner at Fine Dine', type: 'out', category: 'Food' },
        { id: 't12', date: formatDate(20), time: '12:00', amount: 1500, purpose: 'Broadband Internet bill', type: 'out', category: 'Bills' }
    ];

    const budgets = {
        'Food': 8000,
        'Shopping': 12000,
        'Bills': 10000,
        'Travel': 4000,
        'Entertainment': 5000
    };

    // Calculate dates relative to today for lending/borrowing
    const dueOverdue = new Date(now);
    dueOverdue.setDate(now.getDate() - 3); // Overdue by 3 days
    
    const dueFuture = new Date(now);
    dueFuture.setDate(now.getDate() + 7); // Due in a week

    const debts = [
        {
            id: 'd1',
            person: 'Neha Sharma',
            amount: 5000,
            type: 'borrow', // borrowed from Neha
            purpose: 'Emergency medical expense',
            date: formatDate(15),
            dueDate: dueOverdue.toISOString().split('T')[0],
            status: 'pending'
        },
        {
            id: 'd2',
            person: 'Rahul Varma',
            amount: 2500,
            type: 'lend', // lent to Rahul
            purpose: 'Concert ticket booking assistance',
            date: formatDate(5),
            dueDate: dueFuture.toISOString().split('T')[0],
            status: 'pending'
        },
        {
            id: 'd3',
            person: 'Amit Patel',
            amount: 1000,
            type: 'lend', // lent to Amit (settled)
            purpose: 'Cab fare share',
            date: formatDate(12),
            dueDate: formatDate(6),
            status: 'settled'
        }
    ];

    const settings = {
        theme: 'dark',
        currency: '₹'
    };

    return { transactions, budgets, debts, settings };
}

const Database = {
    init() {
        if (!localStorage.getItem(DB_KEYS.TRANSACTIONS)) {
            localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify([]));
            localStorage.setItem(DB_KEYS.BUDGETS, JSON.stringify({}));
            localStorage.setItem(DB_KEYS.DEBTS, JSON.stringify([]));
            localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify({ theme: 'dark', currency: '₹', username: 'My Account' }));
        }
    },

    loadDemoData() {
        const seed = getSeedData();
        localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(seed.transactions));
        localStorage.setItem(DB_KEYS.BUDGETS, JSON.stringify(seed.budgets));
        localStorage.setItem(DB_KEYS.DEBTS, JSON.stringify(seed.debts));
        localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify({ theme: 'dark', currency: '₹', username: 'Demo User' }));
    },

    // --- TRANSACTIONS ---
    getTransactions() {
        this.init();
        return JSON.parse(localStorage.getItem(DB_KEYS.TRANSACTIONS)) || [];
    },

    saveTransactions(transactions) {
        localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    },

    addTransaction(transaction) {
        const list = this.getTransactions();
        transaction.id = 't_' + Date.now();
        list.unshift(transaction); // Add to the top
        this.saveTransactions(list);
        return transaction;
    },

    updateTransaction(updated) {
        let list = this.getTransactions();
        list = list.map(item => item.id === updated.id ? updated : item);
        this.saveTransactions(list);
        return updated;
    },

    deleteTransaction(id) {
        let list = this.getTransactions();
        list = list.filter(item => item.id !== id);
        this.saveTransactions(list);
    },

    // --- BUDGETS ---
    getBudgets() {
        this.init();
        return JSON.parse(localStorage.getItem(DB_KEYS.BUDGETS)) || {};
    },

    saveBudgets(budgets) {
        localStorage.setItem(DB_KEYS.BUDGETS, JSON.stringify(budgets));
    },

    setBudget(category, limit) {
        const budgets = this.getBudgets();
        budgets[category] = parseFloat(limit) || 0;
        this.saveBudgets(budgets);
    },

    // --- DEBTS (LENDING & BORROWING) ---
    getDebts() {
        this.init();
        return JSON.parse(localStorage.getItem(DB_KEYS.DEBTS)) || [];
    },

    saveDebts(debts) {
        localStorage.setItem(DB_KEYS.DEBTS, JSON.stringify(debts));
    },

    addDebt(debt) {
        const list = this.getDebts();
        debt.id = 'd_' + Date.now();
        debt.status = 'pending';
        list.unshift(debt);
        this.saveDebts(list);
        return debt;
    },

    updateDebt(updated) {
        let list = this.getDebts();
        list = list.map(item => item.id === updated.id ? updated : item);
        this.saveDebts(list);
        return updated;
    },

    deleteDebt(id) {
        let list = this.getDebts();
        list = list.filter(item => item.id !== id);
        this.saveDebts(list);
    },

    // --- SETTINGS ---
    getSettings() {
        this.init();
        return JSON.parse(localStorage.getItem(DB_KEYS.SETTINGS)) || { theme: 'dark', currency: '₹' };
    },

    saveSettings(settings) {
        localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
    },

    // --- UTILITIES ---
    exportData() {
        const data = {
            transactions: this.getTransactions(),
            budgets: this.getBudgets(),
            debts: this.getDebts(),
            settings: this.getSettings()
        };
        return JSON.stringify(data, null, 2);
    },

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.transactions && data.budgets && data.debts && data.settings) {
                localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
                localStorage.setItem(DB_KEYS.BUDGETS, JSON.stringify(data.budgets));
                localStorage.setItem(DB_KEYS.DEBTS, JSON.stringify(data.debts));
                localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(data.settings));
                return true;
            }
        } catch (e) {
            console.error("Invalid JSON format for import", e);
        }
        return false;
    },

    clearAllData() {
        localStorage.removeItem(DB_KEYS.TRANSACTIONS);
        localStorage.removeItem(DB_KEYS.BUDGETS);
        localStorage.removeItem(DB_KEYS.DEBTS);
        localStorage.removeItem(DB_KEYS.SETTINGS);
        this.init();
    }
};

// Export to window object for ease of vanilla integration
window.Database = Database;
window.CATEGORIES = CATEGORIES;

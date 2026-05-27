/**
 * Kharche - Core Reactive Application Controller
 * Handles SPA Tab routing, Modals, Forms validation, Database mapping, and active visual notifications
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    let currentTab = 'dashboard';
    let currentSettings = Database.getSettings();

    // --- DOM Elements ---
    const sidebar = document.getElementById('sidebar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const themeToggle = document.getElementById('themeToggle');
    const darkThemeBtn = document.getElementById('darkThemeBtn');
    const lightThemeBtn = document.getElementById('lightThemeBtn');
    const greetingEl = document.getElementById('greeting');
    const todayDateEl = document.getElementById('todayDate');
    const debtAlertDot = document.getElementById('debtAlertDot');
    
    // Summary Metric Stats
    const totalBalanceEl = document.getElementById('db-total-balance');
    const totalIncomeEl = document.getElementById('db-total-income');
    const totalExpenseEl = document.getElementById('db-total-expense');
    const balanceIndicator = document.getElementById('balance-indicator');

    // Tab view sections
    const navItems = document.querySelectorAll('.nav-item');
    const tabViews = document.querySelectorAll('.tab-view');

    // Modals & Triggers
    const btnQuickAdd = document.getElementById('btnQuickAdd');
    const btnAddNewTrans = document.getElementById('btnAddNewTrans');
    const transactionModal = document.getElementById('transactionModal');
    const transactionForm = document.getElementById('transactionForm');
    const transCategorySelect = document.getElementById('transCategory');
    const transDateInput = document.getElementById('transDate');
    const transTimeInput = document.getElementById('transTime');
    const btnCancelTransaction = document.getElementById('btnCancelTransaction');
    const btnDismissTransaction = document.getElementById('btnDismissTransaction');

    const btnConfigureBudget = document.getElementById('btnConfigureBudget');
    const budgetModal = document.getElementById('budgetModal');
    const budgetForm = document.getElementById('budgetForm');
    const budgetCategorySelect = document.getElementById('budgetCategory');
    const budgetLimitInput = document.getElementById('budgetLimit');
    const btnCancelBudget = document.getElementById('btnCancelBudget');
    const btnDismissBudget = document.getElementById('btnDismissBudget');

    const btnNewBorrow = document.getElementById('btnNewBorrow');
    const btnNewLend = document.getElementById('btnNewLend');
    const debtModal = document.getElementById('debtModal');
    const debtForm = document.getElementById('debtForm');
    const debtDateInput = document.getElementById('debtDate');
    const debtDueDateInput = document.getElementById('debtDueDate');
    const btnCancelDebt = document.getElementById('btnCancelDebt');
    const btnDismissDebt = document.getElementById('btnDismissDebt');

    // Ledger filtering elements
    const txSearchInput = document.getElementById('txSearchInput');
    const txTypeFilter = document.getElementById('txTypeFilter');
    const txCategoryFilter = document.getElementById('txCategoryFilter');
    const transactionTableBody = document.getElementById('transactionTableBody');
    const txEmptyState = document.getElementById('txEmptyState');

    // Budgets Grid
    const budgetLimitsGrid = document.getElementById('budgetLimitsGrid');

    // Debt lists
    const borrowListContainer = document.getElementById('borrowListContainer');
    const lendListContainer = document.getElementById('lendListContainer');
    const activeBorrowVal = document.getElementById('activeBorrowVal');
    const overdueBorrowCount = document.getElementById('overdueBorrowCount');
    const activeLentVal = document.getElementById('activeLentVal');
    const dueSoonLentCount = document.getElementById('dueSoonLentCount');

    // Settings elements
    const settingsUsername = document.getElementById('settingsUsername');
    const settingsCurrency = document.getElementById('settingsCurrency');
    const btnLoadDemo = document.getElementById('btnLoadDemo');
    const btnExportJSON = document.getElementById('btnExportJSON');
    const importFile = document.getElementById('importFile');
    const btnResetData = document.getElementById('btnResetData');

    // --- Init Methods ---
    function init() {
        Database.init();
        loadTheme(currentSettings.theme);
        updateGreeting();
        populateCategoriesDropdowns();
        renderDashboardData();
        setupEventListeners();
        lucide.createIcons();
    }

    // --- Dynamic Greeting ---
    function updateGreeting() {
        const hr = new Date().getHours();
        let greetingText = "Good Evening";
        if (hr < 12) greetingText = "Good Morning";
        else if (hr < 17) greetingText = "Good Afternoon";

        const username = currentSettings.username || "Guest User";
        greetingEl.textContent = `${greetingText}, ${username}!`;
        
        // Update user footer card
        document.querySelector('.username').textContent = username;

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        todayDateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // --- Populate Categories Select inputs ---
    function populateCategoriesDropdowns() {
        // Build transaction form categories
        transCategorySelect.innerHTML = '';
        Object.keys(window.CATEGORIES).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = window.CATEGORIES[key].name;
            transCategorySelect.appendChild(opt);
        });

        // Build budget form categories (expenses only)
        budgetCategorySelect.innerHTML = '';
        Object.keys(window.CATEGORIES).forEach(key => {
            if (key !== 'Salary' && key !== 'Investment') {
                const opt = document.createElement('option');
                opt.value = key;
                opt.textContent = window.CATEGORIES[key].name;
                budgetCategorySelect.appendChild(opt);
            }
        });

        // Build main ledger filter categories
        txCategoryFilter.innerHTML = '<option value="all">All Categories</option>';
        Object.keys(window.CATEGORIES).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = window.CATEGORIES[key].name;
            txCategoryFilter.appendChild(opt);
        });
    }

    // --- Theme Controller ---
    function loadTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        currentSettings.theme = theme;
        Database.saveSettings(currentSettings);

        if (theme === 'light') {
            darkThemeBtn.classList.remove('active');
            lightThemeBtn.classList.add('active');
        } else {
            lightThemeBtn.classList.remove('active');
            darkThemeBtn.classList.add('active');
        }
        
        // Dynamic re-render charts so colors adapt
        const txs = Database.getTransactions();
        Charts.updateAll(txs);
    }

    // --- SPA Tab Management ---
    function switchTab(tabName) {
        currentTab = tabName;
        
        // Update Nav Menu UI
        navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Toggle Content Views
        tabViews.forEach(view => {
            if (view.id === `tab-${tabName}`) {
                view.style.display = 'block';
                view.classList.add('active');
            } else {
                view.style.display = 'none';
                view.classList.remove('active');
            }
        });

        // Trigger Tab specific rendering
        if (tabName === 'dashboard') {
            renderDashboardData();
        } else if (tabName === 'transactions') {
            renderLedgerTable();
        } else if (tabName === 'analytics') {
            renderAnalyticsInsights();
        } else if (tabName === 'budgets') {
            renderBudgetModule();
        } else if (tabName === 'debts') {
            renderDebtsModule();
        } else if (tabName === 'settings') {
            loadSettingsPage();
        }

        // Close mobile menu if open
        sidebar.classList.remove('mobile-open');
    }

    // --- Toast Alert Notification System ---
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'info';
        if (type === 'success') icon = 'check-circle';
        if (type === 'danger') icon = 'x-circle';
        if (type === 'warning') icon = 'alert-triangle';

        toast.innerHTML = `
            <i data-lucide="${icon}"></i>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        lucide.createIcons();

        // Animate in
        setTimeout(() => toast.classList.add('show'), 50);

        // Slide out and destroy
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    // --- Format Currency Helpers ---
    function formatCurrency(amount) {
        const symbol = currentSettings.currency || '₹';
        const formatted = parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return `${symbol}${formatted}`;
    }

    // --- Render Core Dashboard & Metrics ---
    function renderDashboardData() {
        const txs = Database.getTransactions();
        const currencySymbol = currentSettings.currency || '₹';
        document.querySelectorAll('.currency-symbol').forEach(el => el.textContent = currencySymbol);

        let totalIn = 0;
        let totalOut = 0;

        txs.forEach(t => {
            const amt = parseFloat(t.amount);
            if (t.type === 'in') totalIn += amt;
            else totalOut += amt;
        });

        const netBalance = totalIn - totalOut;

        totalBalanceEl.textContent = formatCurrency(netBalance);
        totalIncomeEl.textContent = formatCurrency(totalIn);
        totalExpenseEl.textContent = formatCurrency(totalOut);

        // Balance Indicator configuration
        if (netBalance >= 0) {
            balanceIndicator.className = 'stats-indicator up';
            balanceIndicator.innerHTML = `<i data-lucide="arrow-up-right"></i><span>Net Positive Balance</span>`;
        } else {
            balanceIndicator.className = 'stats-indicator down';
            balanceIndicator.innerHTML = `<i data-lucide="arrow-down-left" style="color: var(--danger)"></i><span>Net Negative Overdraft</span>`;
        }

        // Render mini-recent items
        const recentList = document.getElementById('dashboardRecentList');
        recentList.innerHTML = '';
        
        const recentCount = Math.min(txs.length, 4);
        if (recentCount === 0) {
            recentList.innerHTML = `<div style="text-align:center; color: var(--text-muted); font-size: 0.9rem; padding: 2rem 0;">No logs added yet. Use "Record Expense" to begin.</div>`;
        } else {
            for (let i = 0; i < recentCount; i++) {
                const t = txs[i];
                const catConfig = window.CATEGORIES[t.category] || window.CATEGORIES.Others;
                
                const item = document.createElement('div');
                item.className = 'mini-list-item';
                
                item.innerHTML = `
                    <div class="item-left">
                        <div class="item-icon" style="background: hsla(var(${catConfig.color}), 0.15); color: var(${catConfig.color})">
                            <i data-lucide="${catConfig.icon}"></i>
                        </div>
                        <div class="item-info">
                            <h4>${t.purpose}</h4>
                            <span>${catConfig.name} • ${new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                        </div>
                    </div>
                    <div class="item-right">
                        <span class="item-amount ${t.type === 'in' ? 'in' : 'out'}">
                            ${t.type === 'in' ? '+' : '-'}${formatCurrency(t.amount)}
                        </span>
                    </div>
                `;
                recentList.appendChild(item);
            }
        }

        // Run budget alerts on Dashboard
        renderDashboardBudgetAlerts(txs);

        // Refresh Chart panels
        Charts.updateAll(txs);
        
        // Scan active debts for layout badges
        checkDebtsAlertCenter();
        
        lucide.createIcons();
    }

    // --- Budget Warning Engine ---
    function renderDashboardBudgetAlerts(txs) {
        const budgets = Database.getBudgets();
        const alertList = document.getElementById('dashboardBudgetAlerts');
        alertList.innerHTML = '';

        const activeAlerts = [];
        
        Object.keys(budgets).forEach(cat => {
            const limit = budgets[cat];
            if (limit <= 0) return;

            // Sum this month's expense for category
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const sum = txs
                .filter(t => {
                    if (t.type !== 'out' || t.category !== cat) return false;
                    const d = new Date(t.date);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                })
                .reduce((total, t) => total + parseFloat(t.amount), 0);

            const ratio = sum / limit;
            
            if (ratio >= 0.8) {
                activeAlerts.push({
                    category: cat,
                    sum,
                    limit,
                    percent: Math.round(ratio * 100)
                });
            }
        });

        if (activeAlerts.length === 0) {
            alertList.innerHTML = `
                <div style="text-align: center; color: var(--success); font-size: 0.9rem; padding: 2rem 0; display:flex; flex-direction:column; align-items:center; gap: 0.5rem;">
                    <i data-lucide="shield-check" style="width: 32px; height: 32px;"></i>
                    <p>All category limits are securely within budgets.</p>
                </div>`;
        } else {
            activeAlerts.forEach(alert => {
                const catConfig = window.CATEGORIES[alert.category] || window.CATEGORIES.Others;
                const isOver = alert.percent >= 100;
                
                const item = document.createElement('div');
                item.className = 'mini-list-item';
                item.style.borderColor = isOver ? 'var(--danger)' : 'var(--warning)';
                item.style.background = isOver ? 'linear-gradient(90deg, hsla(346, 80%, 55%, 0.05), transparent)' : 'linear-gradient(90deg, hsla(38, 92%, 50%, 0.05), transparent)';

                item.innerHTML = `
                    <div class="item-left">
                        <div class="item-icon" style="color: ${isOver ? 'var(--danger)' : 'var(--warning)'}">
                            <i data-lucide="${isOver ? 'octagon-alert' : 'alert-circle'}"></i>
                        </div>
                        <div class="item-info">
                            <h4 style="color: ${isOver ? 'var(--danger)' : 'var(--warning)'}">${alert.category} Threshold Exceeded</h4>
                            <span>Used ${alert.percent}% of monthly ${formatCurrency(alert.limit)}</span>
                        </div>
                    </div>
                    <div class="item-right">
                        <span class="item-amount" style="color: ${isOver ? 'var(--danger)' : 'var(--warning)'}">
                            ${formatCurrency(alert.sum)}
                        </span>
                    </div>
                `;
                alertList.appendChild(item);
            });
        }
        lucide.createIcons();
    }

    // --- Render Ledger Table View ---
    function renderLedgerTable() {
        const txs = Database.getTransactions();
        const searchQuery = txSearchInput.value.toLowerCase();
        const filterType = txTypeFilter.value;
        const filterCategory = txCategoryFilter.value;

        transactionTableBody.innerHTML = '';
        
        const filtered = txs.filter(t => {
            const matchesSearch = t.purpose.toLowerCase().includes(searchQuery) || t.category.toLowerCase().includes(searchQuery);
            const matchesType = filterType === 'all' || t.type === filterType;
            const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
            return matchesSearch && matchesType && matchesCategory;
        });

        if (filtered.length === 0) {
            txEmptyState.style.display = 'block';
        } else {
            txEmptyState.style.display = 'none';
            filtered.forEach(t => {
                const tr = document.createElement('tr');
                const catConfig = window.CATEGORIES[t.category] || window.CATEGORIES.Others;
                
                // Formatted display date/time
                const fDate = new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                
                tr.innerHTML = `
                    <td>
                        <div style="font-weight: 500;">${fDate}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${t.time || '00:00'}</div>
                    </td>
                    <td><div style="font-weight:600;">${t.purpose}</div></td>
                    <td>
                        <span class="badge badge-category">
                            <i data-lucide="${catConfig.icon}" style="width: 12px; height: 12px; color: var(${catConfig.color})"></i>
                            <span style="margin-left: 2px;">${catConfig.name}</span>
                        </span>
                    </td>
                    <td>
                        <span class="badge ${t.type === 'in' ? 'badge-in' : 'badge-out'}">
                            ${t.type === 'in' ? 'Inflow' : 'Outflow'}
                        </span>
                    </td>
                    <td>
                        <strong class="item-amount ${t.type === 'in' ? 'in' : ''}">${formatCurrency(t.amount)}</strong>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-secondary btn-icon edit-tx" data-id="${t.id}" title="Edit transaction">
                                <i data-lucide="pencil" style="width: 14px; height: 14px;"></i>
                            </button>
                            <button class="btn btn-secondary btn-icon delete-tx" data-id="${t.id}" title="Delete transaction" style="color: var(--danger);">
                                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                // Add event hooks to actions
                tr.querySelector('.edit-tx').addEventListener('click', () => openTransactionModal(t));
                tr.querySelector('.delete-tx').addEventListener('click', () => handleDeleteTransaction(t.id));

                transactionTableBody.appendChild(tr);
            });
        }
        lucide.createIcons();
    }

    // --- Render Budget Limits and Controls ---
    function renderBudgetModule() {
        const budgets = Database.getBudgets();
        const txs = Database.getTransactions();
        
        budgetLimitsGrid.innerHTML = '';
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        Object.keys(window.CATEGORIES).forEach(cat => {
            if (cat === 'Salary' || cat === 'Investment') return; // Income excluded

            const limit = budgets[cat] || 0;
            const catConfig = window.CATEGORIES[cat];

            // Sum current month expense
            const sum = txs
                .filter(t => {
                    if (t.type !== 'out' || t.category !== cat) return false;
                    const d = new Date(t.date);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                })
                .reduce((total, t) => total + parseFloat(t.amount), 0);

            const card = document.createElement('div');
            card.className = 'glass-card budget-card';

            const percent = limit > 0 ? Math.min(Math.round((sum / limit) * 100), 100) : 0;
            
            // Progress color mappings
            let progColor = 'safe';
            let msg = `<i data-lucide="check" style="width: 12px; height:12px;"></i> Safe Zone`;
            let msgClass = '';

            if (limit > 0) {
                if (sum >= limit) {
                    progColor = 'danger';
                    msg = `<i data-lucide="octagon-alert" style="width: 12px; height:12px;"></i> Exceeded Limit!`;
                    msgClass = 'overlimit';
                } else if (percent >= 80) {
                    progColor = 'warning';
                    msg = `<i data-lucide="alert-triangle" style="width: 12px; height:12px;"></i> Caution: Near Threshold`;
                    msgClass = 'overlimit';
                }
            } else {
                msg = `Limit not established`;
            }

            card.innerHTML = `
                <div class="budget-meta">
                    <div class="budget-category-title">
                        <div class="cat-icon" style="background: hsla(var(${catConfig.color}), 0.15); color: var(${catConfig.color})">
                            <i data-lucide="${catConfig.icon}"></i>
                        </div>
                        <span class="budget-category-name">${catConfig.name}</span>
                    </div>
                    <div class="budget-ratio">
                        <div class="budget-used">${formatCurrency(sum)}</div>
                        <div class="budget-total">of ${limit > 0 ? formatCurrency(limit) : 'Unlimited'}</div>
                    </div>
                </div>

                <div class="progress-bar-wrapper">
                    <div class="progress-bar-fill ${progColor}" style="width: ${limit > 0 ? percent : 0}%"></div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="budget-message ${msgClass}">${msg}</span>
                    ${limit > 0 ? `<span style="font-size:0.8rem; font-weight:600;">${percent}%</span>` : ''}
                </div>
            `;
            
            // Add click event directly to card to edit it easily
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                budgetCategorySelect.value = cat;
                budgetLimitInput.value = limit;
                budgetModal.classList.add('active');
            });

            budgetLimitsGrid.appendChild(card);
        });

        lucide.createIcons();
    }

    // --- Render Debt (Borrow/Lend) Center ---
    function renderDebtsModule() {
        const debts = Database.getDebts();
        
        borrowListContainer.innerHTML = '';
        lendListContainer.innerHTML = '';

        let totalBorrowed = 0;
        let totalLent = 0;
        let overdueBCount = 0;
        let dueLCount = 0;

        const now = new Date();
        now.setHours(0,0,0,0);

        debts.forEach(d => {
            const isPending = d.status === 'pending';
            const isBorrow = d.type === 'borrow';
            const amt = parseFloat(d.amount);

            if (isPending) {
                if (isBorrow) totalBorrowed += amt;
                else totalLent += amt;
            }

            const dueDate = new Date(d.dueDate);
            dueDate.setHours(0,0,0,0);
            
            const isOverdue = isPending && dueDate < now;
            
            // Lent due in next 7 days
            const inSevenDays = new Date(now);
            inSevenDays.setDate(now.getDate() + 7);
            const isDueSoon = isPending && !isBorrow && dueDate >= now && dueDate <= inSevenDays;

            if (isOverdue && isBorrow) overdueBCount++;
            if (isDueSoon) dueLCount++;

            // Create Debt UI Element
            const el = document.createElement('div');
            el.className = 'debt-card-item';
            
            // If overdue or pending, add visual cues
            if (isOverdue) el.style.borderLeft = '3px solid var(--danger)';
            else if (isPending) el.style.borderLeft = isBorrow ? '3px solid var(--danger-glow)' : '3px solid var(--success-glow)';
            else el.style.opacity = '0.6';

            const fDueDate = new Date(d.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            
            el.innerHTML = `
                <div class="debt-row-1">
                    <span class="debt-person">
                        <i data-lucide="${isBorrow ? 'arrow-down-left' : 'arrow-up-right'}" style="color: ${isBorrow ? 'var(--danger)' : 'var(--success)'}; width:16px; height:16px;"></i>
                        <span>${d.person}</span>
                    </span>
                    <span class="debt-amount-due ${isBorrow ? 'borrow' : 'lend'}">${formatCurrency(d.amount)}</span>
                </div>
                
                <div class="debt-row-2">
                    <strong>Purpose:</strong> ${d.purpose}
                </div>

                <div class="debt-row-3">
                    <span class="debt-due-date ${isOverdue ? 'overdue' : ''}">
                        <i data-lucide="clock" style="width: 12px; height: 12px;"></i>
                        <span>Due: ${fDueDate} ${isOverdue ? '(OVERDUE ALARM)' : ''}</span>
                    </span>
                    
                    <div class="debt-actions">
                        ${isPending ? `
                            <button class="btn btn-success resolve-debt" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                                <i data-lucide="check" style="width:12px; height:12px;"></i> Settle
                            </button>
                            <button class="btn btn-secondary edit-debt" style="padding: 0.25rem; width: 26px; height: 26px; border-radius:4px;">
                                <i data-lucide="pencil" style="width:12px; height:12px;"></i>
                            </button>
                        ` : `
                            <span class="badge badge-in" style="background: var(--success-glow); border-color: transparent;"><i data-lucide="check-circle-2" style="width:12px; height:12px;"></i> Settled</span>
                        `}
                        <button class="btn btn-danger delete-debt" style="padding: 0.25rem; width: 26px; height: 26px; border-radius:4px;">
                            <i data-lucide="trash-2" style="width:12px; height:12px;"></i>
                        </button>
                    </div>
                </div>
            `;

            // Bind Actions
            if (isPending) {
                el.querySelector('.resolve-debt').addEventListener('click', () => handleSettleDebt(d));
                el.querySelector('.edit-debt').addEventListener('click', () => openDebtModal(d));
            }
            el.querySelector('.delete-debt').addEventListener('click', () => handleDeleteDebt(d.id));

            // Append to appropriate list
            if (isBorrow) {
                borrowListContainer.appendChild(el);
            } else {
                lendListContainer.appendChild(el);
            }
        });

        // Set Metric Panels
        activeBorrowVal.textContent = formatCurrency(totalBorrowed);
        overdueBorrowCount.textContent = overdueBCount;
        activeLentVal.textContent = formatCurrency(totalLent);
        dueSoonLentCount.textContent = dueLCount;

        // Render Empty States if lists are empty
        if (borrowListContainer.children.length === 0) {
            borrowListContainer.innerHTML = `<div style="text-align:center; color: var(--text-muted); font-size:0.9rem; padding: 2rem 0;">No active borrowing lists.</div>`;
        }
        if (lendListContainer.children.length === 0) {
            lendListContainer.innerHTML = `<div style="text-align:center; color: var(--text-muted); font-size:0.9rem; padding: 2rem 0;">No active lending lists.</div>`;
        }

        checkDebtsAlertCenter();
        lucide.createIcons();
    }

    // Debt Active Alarms Scan
    function checkDebtsAlertCenter() {
        const debts = Database.getDebts();
        const now = new Date();
        now.setHours(0,0,0,0);

        let activeAlert = false;
        let alarmCount = 0;

        debts.forEach(d => {
            const isPending = d.status === 'pending';
            const dueDate = new Date(d.dueDate);
            dueDate.setHours(0,0,0,0);
            
            if (isPending && dueDate < now) {
                activeAlert = true;
                alarmCount++;
            }
        });

        // Toggle dot in Nav Menu
        if (activeAlert) {
            debtAlertDot.style.display = 'block';
            debtAlertDot.title = `${alarmCount} Active Overdue Debt Reminders!`;
        } else {
            debtAlertDot.style.display = 'none';
        }
    }

    // --- Dynamic Analytics Insights Summary ---
    function renderAnalyticsInsights() {
        const txs = Database.getTransactions();
        const grid = document.getElementById('analyticsStatsGrid');
        grid.innerHTML = '';

        if (txs.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:var(--text-secondary); padding: 3rem 0;">Log transactions first to generate statistics.</div>`;
            return;
        }

        // Calculate some indicators
        // A. Average Transaction size
        const expenses = txs.filter(t => t.type === 'out');
        const avgExpense = expenses.length > 0 ? expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0) / expenses.length : 0;
        
        // B. Biggest Spending Sector
        const catSums = {};
        expenses.forEach(t => {
            catSums[t.category] = (catSums[t.category] || 0) + parseFloat(t.amount);
        });
        let topCat = 'None';
        let topCatSum = 0;
        Object.keys(catSums).forEach(cat => {
            if (catSums[cat] > topCatSum) {
                topCat = cat;
                topCatSum = catSums[cat];
            }
        });

        // C. Net savings rate (percentage of income remaining)
        let totalIn = txs.filter(t => t.type === 'in').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        let totalOut = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        let savingsRate = totalIn > 0 ? Math.max(0, Math.round(((totalIn - totalOut) / totalIn) * 100)) : 0;

        // Render card elements
        const cards = [
            { title: 'Average Outflow Size', value: formatCurrency(avgExpense), desc: 'Average cost per transaction', icon: 'calculator', color: '--primary' },
            { title: 'Peak Expense Sector', value: topCat, desc: `Spent total of ${formatCurrency(topCatSum)}`, icon: 'award', color: 'var(--color-shopping)' },
            { title: 'Savings Retention Rate', value: `${savingsRate}%`, desc: 'Share of total deposits retained', icon: 'percent', color: 'var(--success)' }
        ];

        cards.forEach(c => {
            const card = document.createElement('div');
            card.className = 'glass-card stats-card';
            card.style.background = 'var(--bg-surface-opaque)';
            card.innerHTML = `
                <div class="card-title">
                    <span>${c.title}</span>
                    <i data-lucide="${c.icon}" style="color: ${c.color}"></i>
                </div>
                <div class="stats-amount" style="font-size: 1.75rem; margin: 0.25rem 0;">${c.value}</div>
                <div class="stats-indicator">${c.desc}</div>
            `;
            grid.appendChild(card);
        });

        Charts.renderCashFlowTrend(txs);
        lucide.createIcons();
    }

    // --- Settings Operations ---
    function loadSettingsPage() {
        settingsUsername.value = currentSettings.username || "Guest User";
        settingsCurrency.value = currentSettings.currency || "₹";
    }

    // --- EVENT CONTROLLERS ---

    // Modals CRUD Controllers
    function openTransactionModal(tx = null) {
        // Pre-populate date & times
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

        if (tx) {
            // Edit mode
            document.getElementById('transactionModalTitle').textContent = "Modify Transaction Ledger";
            document.getElementById('transId').value = tx.id;
            document.getElementById('transAmount').value = tx.amount;
            document.getElementById('transPurpose').value = tx.purpose;
            document.getElementById('transCategory').value = tx.category;
            document.getElementById('transDate').value = tx.date;
            document.getElementById('transTime').value = tx.time;
            
            if (tx.type === 'in') {
                document.getElementById('typeIncome').checked = true;
            } else {
                document.getElementById('typeExpense').checked = true;
            }
        } else {
            // New mode
            document.getElementById('transactionModalTitle').textContent = "Record Transaction Ledger";
            document.getElementById('transId').value = '';
            document.getElementById('transAmount').value = '';
            document.getElementById('transPurpose').value = '';
            document.getElementById('transCategory').value = 'Food';
            document.getElementById('transDate').value = dateStr;
            document.getElementById('transTime').value = timeStr;
            document.getElementById('typeExpense').checked = true;
        }

        transactionModal.classList.add('active');
    }

    function openDebtModal(debt = null) {
        const today = new Date().toISOString().split('T')[0];
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        const nextWeek = futureDate.toISOString().split('T')[0];

        if (debt) {
            // Edit mode
            document.getElementById('debtModalTitle').textContent = "Modify Loan Record";
            document.getElementById('debtId').value = debt.id;
            document.getElementById('debtPerson').value = debt.person;
            document.getElementById('debtAmount').value = debt.amount;
            document.getElementById('debtPurpose').value = debt.purpose;
            document.getElementById('debtDate').value = debt.date;
            document.getElementById('debtDueDate').value = debt.dueDate;

            if (debt.type === 'borrow') {
                document.getElementById('debtBorrow').checked = true;
            } else {
                document.getElementById('debtLend').checked = true;
            }
        } else {
            // Add mode
            document.getElementById('debtModalTitle').textContent = "Log New Loan";
            document.getElementById('debtId').value = '';
            document.getElementById('debtPerson').value = '';
            document.getElementById('debtAmount').value = '';
            document.getElementById('debtPurpose').value = '';
            document.getElementById('debtDate').value = today;
            document.getElementById('debtDueDate').value = nextWeek;
            document.getElementById('debtBorrow').checked = true;
        }

        debtModal.classList.add('active');
    }

    // --- Save Handlers ---
    function handleSaveTransaction(e) {
        e.preventDefault();
        
        const id = document.getElementById('transId').value;
        const amount = parseFloat(document.getElementById('transAmount').value);
        const purpose = document.getElementById('transPurpose').value;
        const category = document.getElementById('transCategory').value;
        const date = document.getElementById('transDate').value;
        const time = document.getElementById('transTime').value;
        const type = document.querySelector('input[name="transType"]:checked').value;

        const txData = { id, amount, purpose, category, date, time, type };

        // Exceeded budget threshold warning scan
        if (type === 'out') {
            const budgets = Database.getBudgets();
            const limit = budgets[category] || 0;
            
            if (limit > 0) {
                // Sum this month's expenses for category plus new amount
                const currentMonth = new Date(date).getMonth();
                const currentYear = new Date(date).getFullYear();
                const txs = Database.getTransactions();

                let currentSum = txs
                    .filter(t => {
                        if (t.id === id) return false; // exclude current edit
                        if (t.type !== 'out' || t.category !== category) return false;
                        const d = new Date(t.date);
                        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                    })
                    .reduce((tot, t) => tot + parseFloat(t.amount), 0);

                const finalSum = currentSum + amount;
                
                if (finalSum >= limit) {
                    showToast(`Alert: Budget Exceeded for ${category}!`, 'warning');
                } else if (finalSum >= (limit * 0.8)) {
                    showToast(`Warning: Spent 80%+ of ${category} limit.`, 'warning');
                }
            }
        }

        if (id) {
            Database.updateTransaction(txData);
            showToast("Ledger entry modified successfully!");
        } else {
            Database.addTransaction(txData);
            showToast("New ledger entry added!");
        }

        transactionModal.classList.remove('active');
        
        // Refresh appropriate view
        if (currentTab === 'dashboard') renderDashboardData();
        else if (currentTab === 'transactions') renderLedgerTable();
    }

    function handleDeleteTransaction(id) {
        if (confirm("Are you sure you want to delete this transaction record?")) {
            Database.deleteTransaction(id);
            showToast("Ledger record deleted.", 'danger');
            
            if (currentTab === 'dashboard') renderDashboardData();
            else if (currentTab === 'transactions') renderLedgerTable();
        }
    }

    function handleSaveBudget(e) {
        e.preventDefault();
        const category = budgetCategorySelect.value;
        const limit = parseFloat(budgetLimitInput.value);

        Database.setBudget(category, limit);
        showToast(`Budget limit updated for ${category}!`);
        
        budgetModal.classList.remove('active');
        renderBudgetModule();
    }

    function handleSaveDebt(e) {
        e.preventDefault();
        const id = document.getElementById('debtId').value;
        const person = document.getElementById('debtPerson').value;
        const amount = parseFloat(document.getElementById('debtAmount').value);
        const purpose = document.getElementById('debtPurpose').value;
        const date = document.getElementById('debtDate').value;
        const dueDate = document.getElementById('debtDueDate').value;
        const type = document.querySelector('input[name="debtType"]:checked').value;

        const debtData = { id, person, amount, purpose, date, dueDate, type };

        if (id) {
            // Retain status during editing
            const existing = Database.getDebts().find(d => d.id === id);
            debtData.status = existing ? existing.status : 'pending';
            
            Database.updateDebt(debtData);
            showToast("Loan details modified successfully!");
        } else {
            Database.addDebt(debtData);
            showToast("New loan entry registered!");
        }

        debtModal.classList.remove('active');
        renderDebtsModule();
    }

    function handleSettleDebt(debt) {
        if (confirm(`Mark loan of ${formatCurrency(debt.amount)} to/from ${debt.person} as completely settled?`)) {
            debt.status = 'settled';
            Database.updateDebt(debt);
            showToast("Debt settled successfully!");
            renderDebtsModule();
        }
    }

    function handleDeleteDebt(id) {
        if (confirm("Are you sure you want to remove this loan record permanently?")) {
            Database.deleteDebt(id);
            showToast("Loan details deleted.", 'danger');
            renderDebtsModule();
        }
    }

    // --- Setup Listeners ---
    function setupEventListeners() {
        // SPA Sidebar Routing Click
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.getAttribute('data-tab');
                switchTab(tab);
            });
        });

        // Mobile Sidebar Drawer Toggle
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });

        // Theme Toggle Buttons
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
            loadTheme(nextTheme);
        });

        // Modal Action Toggles
        btnQuickAdd.addEventListener('click', () => openTransactionModal());
        btnAddNewTrans.addEventListener('click', () => openTransactionModal());
        btnCancelTransaction.addEventListener('click', () => transactionModal.classList.remove('active'));
        btnDismissTransaction.addEventListener('click', () => transactionModal.classList.remove('active'));

        btnConfigureBudget.addEventListener('click', () => {
            budgetCategorySelect.value = 'Food';
            budgetLimitInput.value = '';
            budgetModal.classList.add('active');
        });
        btnCancelBudget.addEventListener('click', () => budgetModal.classList.remove('active'));
        btnDismissBudget.addEventListener('click', () => budgetModal.classList.remove('active'));

        btnNewBorrow.addEventListener('click', () => {
            openDebtModal();
            document.getElementById('debtBorrow').checked = true;
        });
        btnNewLend.addEventListener('click', () => {
            openDebtModal();
            document.getElementById('debtLend').checked = true;
        });
        btnCancelDebt.addEventListener('click', () => debtModal.classList.remove('active'));
        btnDismissDebt.addEventListener('click', () => debtModal.classList.remove('active'));

        // Forms Submissions
        transactionForm.addEventListener('submit', handleSaveTransaction);
        budgetForm.addEventListener('submit', handleSaveBudget);
        debtForm.addEventListener('submit', handleSaveDebt);

        // Filters in Ledger Table
        txSearchInput.addEventListener('input', renderLedgerTable);
        txTypeFilter.addEventListener('change', renderLedgerTable);
        txCategoryFilter.addEventListener('change', renderLedgerTable);

        // Settings events
        settingsUsername.addEventListener('change', (e) => {
            currentSettings.username = e.target.value;
            Database.saveSettings(currentSettings);
            updateGreeting();
            showToast("Username preferences updated.");
        });

        settingsCurrency.addEventListener('change', (e) => {
            currentSettings.currency = e.target.value;
            Database.saveSettings(currentSettings);
            showToast("Currency display preferences updated.");
            
            // Re-render everything with new currency symbol
            if (currentTab === 'dashboard') renderDashboardData();
            else if (currentTab === 'transactions') renderLedgerTable();
            else if (currentTab === 'analytics') renderAnalyticsInsights();
            else if (currentTab === 'budgets') renderBudgetModule();
            else if (currentTab === 'debts') renderDebtsModule();
        });

        btnLoadDemo.addEventListener('click', () => {
            if (confirm("This will replace all your active personal records with sample demo data. Proceed?")) {
                Database.loadDemoData();
                showToast("Demo workspace loaded successfully!");
                location.reload();
            }
        });

        btnExportJSON.addEventListener('click', () => {
            const dataStr = Database.exportData();
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `Kharche_Backup_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            showToast("Data backup file generated!");
        });

        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(evt) {
                const imported = Database.importData(evt.target.result);
                if (imported) {
                    showToast("Database successfully restored!");
                    renderDashboardData();
                    // update credentials
                    currentSettings = Database.getSettings();
                    updateGreeting();
                } else {
                    showToast("Error: Invalid backup schema format.", 'danger');
                }
            };
            reader.readAsText(file);
        });

        btnResetData.addEventListener('click', () => {
            if (confirm("WARNING: Are you absolutely sure you want to factory reset? This will erase all transaction histories, budgets, and lending logs permanently.")) {
                Database.clearAllData();
                showToast("Database fully re-seeded and reset.", 'danger');
                
                currentSettings = Database.getSettings();
                init();
                
                if (currentTab !== 'dashboard') switchTab('dashboard');
            }
        });
    }

    // Run core bootsrap
    init();
});

/**
 * Kharche - Interactive Charts & Analytics Engine
 * Handles rendering and dynamic updates of Chart.js elements
 */

let weeklyChartInstance = null;
let categoryChartInstance = null;
let trendChartInstance = null;

const Charts = {
    // Helper to get theme-specific colors
    getThemeColors() {
        const isDark = document.body.getAttribute('data-theme') !== 'light';
        return {
            grid: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
            text: isDark ? 'hsl(215, 20%, 65%)' : 'hsl(224, 15%, 35%)',
            tooltipBg: isDark ? 'hsl(224, 25%, 14%)' : 'hsl(220, 20%, 92%)',
            tooltipBorder: isDark ? 'hsla(224, 25%, 22%, 0.5)' : 'hsla(220, 20%, 82%, 0.6)',
            tooltipText: isDark ? 'hsl(210, 40%, 98%)' : 'hsl(224, 25%, 12%)'
        };
    },

    // 1. Weekly Expense Bar Chart
    renderWeeklyExpenses(transactions) {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;

        if (weeklyChartInstance) {
            weeklyChartInstance.destroy();
        }

        const colors = this.getThemeColors();
        
        // Calculate last 7 days daily expense sums
        const dailyExpenses = Array(7).fill(0);
        const dayLabels = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            // Format label e.g., 'Mon', 'Tue'
            dayLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            
            // Sum expenses
            const daySum = transactions
                .filter(t => t.date === dateStr && t.type === 'out')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            dailyExpenses[6 - i] = daySum;
        }

        weeklyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dayLabels,
                datasets: [{
                    label: 'Expenses',
                    data: dailyExpenses,
                    backgroundColor: 'hsl(250, 85%, 65%)',
                    borderRadius: 6,
                    borderSkipped: false,
                    hoverBackgroundColor: 'hsl(250, 85%, 58%)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: colors.tooltipBg,
                        borderColor: colors.tooltipBorder,
                        borderWidth: 1,
                        titleColor: colors.tooltipText,
                        bodyColor: colors.tooltipText,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.parsed.y.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: colors.text }
                    },
                    y: {
                        grid: { color: colors.grid },
                        ticks: { color: colors.text }
                    }
                }
            }
        });
    },

    // 2. Category Doughnut Chart
    renderCategoryBreakdown(transactions) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        if (categoryChartInstance) {
            categoryChartInstance.destroy();
        }

        const colors = this.getThemeColors();
        
        // Sum expenses by category
        const catSums = {};
        const categoriesConfig = window.CATEGORIES || {};
        
        transactions.forEach(t => {
            if (t.type === 'out') {
                const cat = t.category || 'Others';
                catSums[cat] = (catSums[cat] || 0) + parseFloat(t.amount);
            }
        });

        const labels = Object.keys(catSums);
        const data = Object.values(catSums);
        
        // Match category HSL colors dynamically from document styling
        const backgroundColors = labels.map(label => {
            const config = categoriesConfig[label];
            if (config && config.color) {
                // Read from Computed CSS or use backup values
                const varName = config.color;
                return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || 'hsl(215, 20%, 50%)';
            }
            return 'hsl(215, 20%, 50%)';
        });

        if (labels.length === 0) {
            // Seed a "No Data" doughnut
            labels.push('No Expenses');
            data.push(1);
            backgroundColors.push('rgba(255,255,255,0.08)');
        }

        categoryChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: colors.text,
                            font: { family: 'Inter', size: 12 },
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        enabled: labels[0] !== 'No Expenses',
                        backgroundColor: colors.tooltipBg,
                        borderColor: colors.tooltipBorder,
                        borderWidth: 1,
                        titleColor: colors.tooltipText,
                        bodyColor: colors.tooltipText,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${context.parsed.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}`;
                            }
                        }
                    }
                }
            }
        });
    },

    // 3. Cash Flow Trend Line Chart
    renderCashFlowTrend(transactions) {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        if (trendChartInstance) {
            trendChartInstance.destroy();
        }

        const colors = this.getThemeColors();
        
        // Sum incomes & expenses by date for last 15 days
        const last15Days = [];
        const incomes = [];
        const expenses = [];
        const now = new Date();

        for (let i = 14; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            last15Days.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
            
            const dayIn = transactions
                .filter(t => t.date === dateStr && t.type === 'in')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            const dayOut = transactions
                .filter(t => t.date === dateStr && t.type === 'out')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            incomes.push(dayIn);
            expenses.push(dayOut);
        }

        trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last15Days,
                datasets: [
                    {
                        label: 'Cash In',
                        data: incomes,
                        borderColor: 'hsl(142, 72%, 45%)',
                        backgroundColor: 'hsla(142, 72%, 45%, 0.05)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 2,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'Cash Out',
                        data: expenses,
                        borderColor: 'hsl(346, 80%, 55%)',
                        backgroundColor: 'hsla(346, 80%, 55%, 0.05)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 2,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: colors.text,
                            font: { family: 'Inter', size: 11 },
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: colors.tooltipBg,
                        borderColor: colors.tooltipBorder,
                        borderWidth: 1,
                        titleColor: colors.tooltipText,
                        bodyColor: colors.tooltipText
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: colors.text }
                    },
                    y: {
                        grid: { color: colors.grid },
                        ticks: { color: colors.text }
                    }
                }
            }
        });
    },

    // Refresh all charts synchronously
    updateAll(transactions) {
        // Run after DOM settles
        setTimeout(() => {
            this.renderWeeklyExpenses(transactions);
            this.renderCategoryBreakdown(transactions);
            this.renderCashFlowTrend(transactions);
        }, 50);
    }
};

window.Charts = Charts;

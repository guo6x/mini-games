/**
 * 游戏数据统计面板
 * 提供数据可视化和分析报告展示
 */

class AnalyticsDashboard {
    constructor() {
        this.isVisible = false;
        this.dashboard = null;
        this.charts = {};
        this.refreshInterval = null;
        
        this.createDashboard();
        this.addStyles();
    }

    // 创建面板DOM结构
    createDashboard() {
        this.dashboard = document.createElement('div');
        this.dashboard.id = 'analytics-dashboard';
        this.dashboard.className = 'analytics-dashboard hidden';
        
        this.dashboard.innerHTML = `
            <div class="analytics-header">
                <h3><i class="fas fa-chart-bar"></i> 游戏数据分析</h3>
                <div class="analytics-controls">
                    <button class="analytics-btn" id="refresh-analytics">
                        <i class="fas fa-sync-alt"></i> 刷新
                    </button>
                    <button class="analytics-btn" id="export-analytics">
                        <i class="fas fa-download"></i> 导出
                    </button>
                    <button class="analytics-btn" id="clear-analytics">
                        <i class="fas fa-trash"></i> 清除
                    </button>
                    <button class="analytics-btn close-btn" id="close-analytics">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="analytics-content">
                <div class="analytics-tabs">
                    <button class="tab-btn active" data-tab="overview">概览</button>
                    <button class="tab-btn" data-tab="games">游戏统计</button>
                    <button class="tab-btn" data-tab="activity">用户活动</button>
                    <button class="tab-btn" data-tab="performance">性能分析</button>
                    <button class="tab-btn" data-tab="errors">错误日志</button>
                </div>
                
                <div class="analytics-panels">
                    <div class="analytics-panel active" id="overview-panel">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon"><i class="fas fa-gamepad"></i></div>
                                <div class="stat-info">
                                    <div class="stat-value" id="total-games">0</div>
                                    <div class="stat-label">总游戏数</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><i class="fas fa-play"></i></div>
                                <div class="stat-info">
                                    <div class="stat-value" id="total-plays">0</div>
                                    <div class="stat-label">总游戏次数</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><i class="fas fa-clock"></i></div>
                                <div class="stat-info">
                                    <div class="stat-value" id="total-time">0分钟</div>
                                    <div class="stat-label">总游戏时间</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                                <div class="stat-info">
                                    <div class="stat-value" id="error-count">0</div>
                                    <div class="stat-label">错误次数</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="charts-container">
                            <div class="chart-card">
                                <h4>游戏时间分布</h4>
                                <canvas id="time-distribution-chart" width="400" height="200"></canvas>
                            </div>
                            <div class="chart-card">
                                <h4>用户活动趋势</h4>
                                <canvas id="activity-trend-chart" width="400" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analytics-panel" id="games-panel">
                        <div class="games-stats-container">
                            <div class="games-list" id="games-stats-list">
                                <!-- 游戏统计列表将在这里动态生成 -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="analytics-panel" id="activity-panel">
                        <div class="activity-stats">
                            <div class="activity-summary" id="activity-summary">
                                <!-- 活动摘要将在这里显示 -->
                            </div>
                            <div class="activity-chart">
                                <canvas id="activity-chart" width="600" height="300"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analytics-panel" id="performance-panel">
                        <div class="performance-metrics">
                            <div class="performance-summary" id="performance-summary">
                                <!-- 性能摘要将在这里显示 -->
                            </div>
                            <div class="performance-charts">
                                <canvas id="performance-chart" width="600" height="300"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analytics-panel" id="errors-panel">
                        <div class="errors-container">
                            <div class="errors-list" id="errors-list">
                                <!-- 错误列表将在这里显示 -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.dashboard);
        this.bindEvents();
    }

    // 添加样式
    addStyles() {
        if (document.getElementById('analytics-dashboard-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'analytics-dashboard-styles';
        styles.textContent = `
            .analytics-dashboard {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                font-family: 'Roboto', sans-serif;
                color: #fff;
                transition: opacity 0.3s ease;
            }
            
            .analytics-dashboard.hidden {
                opacity: 0;
                pointer-events: none;
            }
            
            .analytics-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-bottom: 2px solid #555;
            }
            
            .analytics-header h3 {
                margin: 0;
                font-size: 1.5em;
                font-weight: 700;
            }
            
            .analytics-controls {
                display: flex;
                gap: 10px;
            }
            
            .analytics-btn {
                padding: 8px 16px;
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 6px;
                color: #fff;
                cursor: pointer;
                font-size: 0.9em;
                transition: all 0.3s ease;
            }
            
            .analytics-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }
            
            .analytics-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .analytics-tabs {
                display: flex;
                background: #2a2a2a;
                border-bottom: 2px solid #555;
            }
            
            .tab-btn {
                padding: 15px 25px;
                background: transparent;
                border: none;
                color: #ccc;
                cursor: pointer;
                font-size: 1em;
                transition: all 0.3s ease;
                border-bottom: 3px solid transparent;
            }
            
            .tab-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }
            
            .tab-btn.active {
                color: #fff;
                border-bottom-color: #667eea;
                background: rgba(102, 126, 234, 0.2);
            }
            
            .analytics-panels {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }
            
            .analytics-panel {
                display: none;
            }
            
            .analytics-panel.active {
                display: block;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                transition: transform 0.3s ease;
            }
            
            .stat-card:hover {
                transform: translateY(-5px);
            }
            
            .stat-icon {
                font-size: 2em;
                opacity: 0.8;
            }
            
            .stat-value {
                font-size: 2em;
                font-weight: 700;
                margin-bottom: 5px;
            }
            
            .stat-label {
                font-size: 0.9em;
                opacity: 0.8;
            }
            
            .charts-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 20px;
            }
            
            .chart-card {
                background: #2a2a2a;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            }
            
            .chart-card h4 {
                margin: 0 0 15px 0;
                color: #fff;
                font-size: 1.2em;
            }
            
            .games-stats-container,
            .activity-stats,
            .performance-metrics,
            .errors-container {
                background: #2a2a2a;
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            }
            
            .game-stat-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                margin-bottom: 10px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                transition: background 0.3s ease;
            }
            
            .game-stat-item:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .game-stat-info h4 {
                margin: 0 0 5px 0;
                color: #fff;
            }
            
            .game-stat-info p {
                margin: 0;
                color: #ccc;
                font-size: 0.9em;
            }
            
            .game-stat-values {
                text-align: right;
            }
            
            .game-stat-values .value {
                display: block;
                color: #667eea;
                font-weight: 700;
                margin-bottom: 5px;
            }
            
            .error-item {
                background: rgba(220, 53, 69, 0.2);
                border: 1px solid rgba(220, 53, 69, 0.5);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
            }
            
            .error-item .error-message {
                color: #ff6b6b;
                font-weight: 600;
                margin-bottom: 5px;
            }
            
            .error-item .error-time {
                color: #ccc;
                font-size: 0.8em;
            }
            
            .error-item .error-stack {
                background: rgba(0, 0, 0, 0.3);
                padding: 10px;
                border-radius: 4px;
                margin-top: 10px;
                font-family: 'Courier New', monospace;
                font-size: 0.8em;
                color: #ddd;
                max-height: 100px;
                overflow-y: auto;
            }
            
            @media (max-width: 768px) {
                .analytics-header {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .analytics-controls {
                    flex-wrap: wrap;
                }
                
                .stats-grid {
                    grid-template-columns: 1fr;
                }
                
                .charts-container {
                    grid-template-columns: 1fr;
                }
                
                .analytics-tabs {
                    flex-wrap: wrap;
                }
                
                .tab-btn {
                    flex: 1;
                    min-width: 120px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // 绑定事件
    bindEvents() {
        // 关闭按钮
        const closeBtn = this.dashboard.querySelector('#close-analytics');
        closeBtn.addEventListener('click', () => this.hide());
        
        // 刷新按钮
        const refreshBtn = this.dashboard.querySelector('#refresh-analytics');
        refreshBtn.addEventListener('click', () => this.refresh());
        
        // 导出按钮
        const exportBtn = this.dashboard.querySelector('#export-analytics');
        exportBtn.addEventListener('click', () => this.exportData());
        
        // 清除按钮
        const clearBtn = this.dashboard.querySelector('#clear-analytics');
        clearBtn.addEventListener('click', () => this.clearData());
        
        // 标签页切换
        const tabBtns = this.dashboard.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // 点击背景关闭
        this.dashboard.addEventListener('click', (e) => {
            if (e.target === this.dashboard) {
                this.hide();
            }
        });
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    // 显示面板
    show() {
        this.isVisible = true;
        this.dashboard.classList.remove('hidden');
        this.refresh();
        
        // 开始自动刷新
        this.refreshInterval = setInterval(() => {
            this.refresh();
        }, 5000);
    }

    // 隐藏面板
    hide() {
        this.isVisible = false;
        this.dashboard.classList.add('hidden');
        
        // 停止自动刷新
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // 切换显示/隐藏
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    // 切换标签页
    switchTab(tabName) {
        // 更新标签按钮状态
        const tabBtns = this.dashboard.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // 更新面板显示
        const panels = this.dashboard.querySelectorAll('.analytics-panel');
        panels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });
        
        // 刷新当前标签页数据
        this.refreshTab(tabName);
    }

    // 刷新数据
    refresh() {
        if (!window.gameAnalytics) return;
        
        const report = window.gameAnalytics.generateAnalyticsReport();
        this.updateOverview(report);
        this.updateGamesStats(report);
        this.updateActivityStats(report);
        this.updatePerformanceStats(report);
        this.updateErrorsList(report);
    }

    // 刷新特定标签页
    refreshTab(tabName) {
        if (!window.gameAnalytics) return;
        
        const report = window.gameAnalytics.generateAnalyticsReport();
        
        switch (tabName) {
            case 'overview':
                this.updateOverview(report);
                break;
            case 'games':
                this.updateGamesStats(report);
                break;
            case 'activity':
                this.updateActivityStats(report);
                break;
            case 'performance':
                this.updatePerformanceStats(report);
                break;
            case 'errors':
                this.updateErrorsList(report);
                break;
        }
    }

    // 更新概览数据
    updateOverview(report) {
        const summary = report.summary;
        
        document.getElementById('total-games').textContent = summary.totalGames;
        document.getElementById('total-plays').textContent = summary.totalPlays;
        document.getElementById('total-time').textContent = this.formatTime(summary.totalPlayTime);
        document.getElementById('error-count').textContent = summary.errorCount;
        
        // 更新图表
        this.updateTimeDistributionChart(report);
        this.updateActivityTrendChart(report);
    }

    // 更新游戏统计
    updateGamesStats(report) {
        const gamesList = document.getElementById('games-stats-list');
        const gameStats = window.gameAnalytics.getGameStats();
        
        gamesList.innerHTML = '';
        
        Object.entries(gameStats).forEach(([gameId, stats]) => {
            const gameItem = document.createElement('div');
            gameItem.className = 'game-stat-item';
            gameItem.innerHTML = `
                <div class="game-stat-info">
                    <h4>${stats.name}</h4>
                    <p>最后游戏: ${stats.lastPlayed ? new Date(stats.lastPlayed).toLocaleString() : '从未'}</p>
                </div>
                <div class="game-stat-values">
                    <span class="value">游戏次数: ${stats.totalPlays}</span>
                    <span class="value">最高分: ${stats.bestScore}</span>
                    <span class="value">平均分: ${Math.round(stats.averageScore)}</span>
                    <span class="value">完成率: ${Math.round(stats.completionRate)}%</span>
                </div>
            `;
            gamesList.appendChild(gameItem);
        });
    }

    // 更新活动统计
    updateActivityStats(report) {
        const activitySummary = document.getElementById('activity-summary');
        const activity = report.activity;
        
        activitySummary.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-mouse-pointer"></i></div>
                    <div class="stat-info">
                        <div class="stat-value">${activity.totalActions}</div>
                        <div class="stat-label">总操作数</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-hand-pointer"></i></div>
                    <div class="stat-info">
                        <div class="stat-value">${activity.clickCount}</div>
                        <div class="stat-label">点击次数</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-tachometer-alt"></i></div>
                    <div class="stat-info">
                        <div class="stat-value">${Math.round(activity.averageActionsPerMinute)}</div>
                        <div class="stat-label">每分钟操作数</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    <div class="stat-info">
                        <div class="stat-value">${activity.mostActiveHour || 'N/A'}</div>
                        <div class="stat-label">最活跃时段</div>
                    </div>
                </div>
            </div>
        `;
    }

    // 更新性能统计
    updatePerformanceStats(report) {
        const performanceSummary = document.getElementById('performance-summary');
        const performance = report.performance;
        
        performanceSummary.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-tachometer-alt"></i></div>
                    <div class="stat-info">
                        <div class="stat-value">${Math.round(performance.averageFPS)}</div>
                        <div class="stat-label">平均FPS</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-memory"></i></div>
                    <div class="stat-info">
                        <div class="stat-value">${this.formatBytes(performance.memoryUsage)}</div>
                        <div class="stat-label">内存使用</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-stopwatch"></i></div>
                    <div class="stat-info">
                        <div class="stat-value">${Math.round(performance.renderTime)}ms</div>
                        <div class="stat-label">渲染时间</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="stat-info">
                        <div class="stat-value">${Math.round(performance.errorRate)}%</div>
                        <div class="stat-label">错误率</div>
                    </div>
                </div>
            </div>
        `;
    }

    // 更新错误列表
    updateErrorsList(report) {
        const errorsList = document.getElementById('errors-list');
        const errors = report.errors;
        
        errorsList.innerHTML = '';
        
        if (errors.length === 0) {
            errorsList.innerHTML = '<p style="text-align: center; color: #28a745; font-size: 1.2em;"><i class="fas fa-check-circle"></i> 暂无错误记录</p>';
            return;
        }
        
        errors.slice(-20).reverse().forEach(error => {
            const errorItem = document.createElement('div');
            errorItem.className = 'error-item';
            errorItem.innerHTML = `
                <div class="error-message">${error.message}</div>
                <div class="error-time">${new Date(error.timestamp).toLocaleString()}</div>
                ${error.stack ? `<div class="error-stack">${error.stack}</div>` : ''}
            `;
            errorsList.appendChild(errorItem);
        });
    }

    // 更新时间分布图表
    updateTimeDistributionChart(report) {
        // 简单的文本图表实现
        const canvas = document.getElementById('time-distribution-chart');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#667eea';
        ctx.font = '16px Roboto';
        ctx.textAlign = 'center';
        ctx.fillText('时间分布图表', canvas.width / 2, canvas.height / 2);
        ctx.fillText('(图表功能开发中)', canvas.width / 2, canvas.height / 2 + 30);
    }

    // 更新活动趋势图表
    updateActivityTrendChart(report) {
        // 简单的文本图表实现
        const canvas = document.getElementById('activity-trend-chart');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#764ba2';
        ctx.font = '16px Roboto';
        ctx.textAlign = 'center';
        ctx.fillText('活动趋势图表', canvas.width / 2, canvas.height / 2);
        ctx.fillText('(图表功能开发中)', canvas.width / 2, canvas.height / 2 + 30);
    }

    // 导出数据
    exportData() {
        if (!window.gameAnalytics) return;
        
        const data = window.gameAnalytics.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `game-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    // 清除数据
    clearData() {
        if (!window.gameAnalytics) return;
        
        if (confirm('确定要清除所有分析数据吗？此操作不可撤销。')) {
            window.gameAnalytics.clearAllData();
            this.refresh();
        }
    }

    // 格式化时间
    formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}小时${minutes % 60}分钟`;
        }
        return `${minutes}分钟`;
    }

    // 格式化字节
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsDashboard;
}
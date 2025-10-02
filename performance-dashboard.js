/**
 * 性能监控面板 - 提供实时性能数据展示和分析
 * 支持多游戏性能监控、图表展示、数据导出等功能
 */

class PerformanceDashboard {
    constructor() {
        this.isVisible = false;
        this.updateInterval = null;
        this.charts = new Map();
        this.dataHistory = new Map();
        this.maxHistoryLength = 100;
        
        // 延迟DOM相关的初始化，确保DOM已准备好
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.createDashboard();
                this.bindEvents();
            });
        } else {
            this.createDashboard();
            this.bindEvents();
        }
    }
    
    /**
     * 创建性能监控面板UI
     */
    createDashboard() {
        // 确保 document.body 存在
        if (!document.body) {
            console.warn('Document body not ready, delaying dashboard creation');
            setTimeout(() => this.createDashboard(), 100);
            return;
        }
        
        // 创建主容器
        this.container = document.createElement('div');
        this.container.id = 'performance-dashboard';
        this.container.className = 'performance-dashboard hidden';
        
        this.container.innerHTML = `
            <div class="dashboard-header">
                <h3>🎮 性能监控面板</h3>
                <div class="dashboard-controls">
                    <button class="btn" id="dashboard-refresh">刷新</button>
                    <button class="btn" id="dashboard-export">导出</button>
                    <button class="btn" id="dashboard-clear">清空</button>
                    <button class="btn" id="dashboard-close">×</button>
                </div>
            </div>
            
            <div class="dashboard-content">
                <div class="dashboard-summary">
                    <div class="summary-card">
                        <h4>📊 系统概览</h4>
                        <div id="system-summary"></div>
                    </div>
                </div>
                
                <div class="dashboard-games">
                    <div class="games-header">
                        <h4>🎯 游戏性能</h4>
                        <select id="game-selector">
                            <option value="all">所有游戏</option>
                        </select>
                    </div>
                    <div id="games-list"></div>
                </div>
                
                <div class="dashboard-charts">
                    <div class="chart-container">
                        <h4>📈 FPS 趋势</h4>
                        <canvas id="fps-chart" width="560" height="150"></canvas>
                    </div>
                    <div class="chart-container">
                        <h4>💾 内存使用</h4>
                        <canvas id="memory-chart" width="560" height="150"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        // 添加样式
        this.addStyles();
        
        // 添加到页面
        document.body.appendChild(this.container);
    }
    
    /**
     * 添加样式
     */
    addStyles() {
        if (document.getElementById('dashboard-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'dashboard-styles';
        style.textContent = `
            .performance-dashboard {
                position: fixed;
                top: 50px;
                right: 20px;
                width: 600px;
                max-height: 80vh;
                background: rgba(0, 0, 0, 0.95);
                color: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                z-index: 10000;
                overflow: hidden;
                font-family: 'Courier New', monospace;
                font-size: 12px;
            }
            
            .performance-dashboard.hidden {
                display: none;
            }
            
            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background: rgba(255, 255, 255, 0.1);
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .dashboard-header h3 {
                margin: 0;
                font-size: 16px;
                color: #00ff00;
            }
            
            .dashboard-controls {
                display: flex;
                gap: 5px;
            }
            
            .dashboard-controls .btn {
                padding: 4px 8px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            }
            
            .dashboard-controls .btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .dashboard-content {
                max-height: 60vh;
                overflow-y: auto;
                padding: 15px;
            }
            
            .dashboard-summary {
                margin-bottom: 20px;
            }
            
            .summary-card {
                background: rgba(255, 255, 255, 0.05);
                padding: 10px;
                border-radius: 4px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .summary-card h4 {
                margin: 0 0 10px 0;
                color: #00ff00;
                font-size: 14px;
            }
            
            .games-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .games-header h4 {
                margin: 0;
                color: #00ff00;
                font-size: 14px;
            }
            
            #game-selector {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 11px;
            }
            
            .game-card {
                background: rgba(255, 255, 255, 0.05);
                padding: 10px;
                margin-bottom: 10px;
                border-radius: 4px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .game-card h5 {
                margin: 0 0 8px 0;
                color: #ffff00;
                font-size: 13px;
            }
            
            .game-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 8px;
            }
            
            .stat-item {
                display: flex;
                justify-content: space-between;
                padding: 2px 0;
            }
            
            .stat-label {
                color: #ccc;
            }
            
            .stat-value {
                color: #00ff00;
                font-weight: bold;
            }
            
            .stat-value.warning {
                color: #ffff00;
            }
            
            .stat-value.error {
                color: #ff0000;
            }
            
            .dashboard-charts {
                margin-top: 20px;
            }
            
            .chart-container {
                background: rgba(255, 255, 255, 0.05);
                padding: 10px;
                margin-bottom: 15px;
                border-radius: 4px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .chart-container h4 {
                margin: 0 0 10px 0;
                color: #00ff00;
                font-size: 14px;
            }
            
            .chart-container canvas {
                width: 100%;
                height: 150px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 4px;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮
        this.container.addEventListener('click', (e) => {
            if (e.target.id === 'dashboard-close') {
                this.hide();
            } else if (e.target.id === 'dashboard-refresh') {
                this.refresh();
            } else if (e.target.id === 'dashboard-export') {
                this.exportData();
            } else if (e.target.id === 'dashboard-clear') {
                this.clearHistory();
            }
        });
        
        // 游戏选择器
        const gameSelector = this.container.querySelector('#game-selector');
        gameSelector.addEventListener('change', (e) => {
            this.updateGameDisplay(e.target.value);
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
    
    /**
     * 显示面板
     */
    show() {
        this.isVisible = true;
        this.container.classList.remove('hidden');
        this.startUpdating();
        this.refresh();
    }
    
    /**
     * 隐藏面板
     */
    hide() {
        this.isVisible = false;
        this.container.classList.add('hidden');
        this.stopUpdating();
    }
    
    /**
     * 切换面板显示状态
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    /**
     * 开始定时更新
     */
    startUpdating() {
        if (this.updateInterval) return;
        
        this.updateInterval = setInterval(() => {
            this.updateData();
        }, 1000); // 每秒更新一次
    }
    
    /**
     * 停止定时更新
     */
    stopUpdating() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    /**
     * 刷新数据
     */
    refresh() {
        this.updateGameSelector();
        this.updateData();
    }
    
    /**
     * 更新游戏选择器
     */
    updateGameSelector() {
        const selector = this.container.querySelector('#game-selector');
        const currentValue = selector.value;
        
        // 清空现有选项（保留"所有游戏"）
        selector.innerHTML = '<option value="all">所有游戏</option>';
        
        // 添加已注册的游戏
        if (window.globalPerformanceMonitor) {
            const monitors = window.globalPerformanceMonitor.monitors;
            for (const [gameId] of monitors) {
                const option = document.createElement('option');
                option.value = gameId;
                option.textContent = this.getGameDisplayName(gameId);
                selector.appendChild(option);
            }
        }
        
        // 恢复之前的选择
        if (selector.querySelector(`option[value="${currentValue}"]`)) {
            selector.value = currentValue;
        }
    }
    
    /**
     * 获取游戏显示名称
     */
    getGameDisplayName(gameId) {
        const names = {
            'snake': '贪吃蛇',
            'tetris': '俄罗斯方块',
            'memory-game': '记忆翻牌',
            'sliding-puzzle': '滑动拼图',
            'minesweeper': '扫雷'
        };
        return names[gameId] || gameId;
    }
    
    /**
     * 更新数据显示
     */
    updateData() {
        this.updateGlobalStats();
        this.updateGameDisplay();
        this.updateCharts();
    }
    
    /**
     * 更新全局统计
     */
    updateGlobalStats() {
        const globalStats = this.container.querySelector('#system-summary');
        
        if (!window.globalPerformanceMonitor) {
            globalStats.innerHTML = '<div class="stat-item"><span class="stat-label">状态:</span><span class="stat-value error">未初始化</span></div>';
            return;
        }
        
        const summary = window.globalPerformanceMonitor.getGlobalSummary();
        
        globalStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">活跃游戏:</span>
                <span class="stat-value">${summary.activeGames}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">平均FPS:</span>
                <span class="stat-value ${this.getFPSClass(summary.averageFPS)}">${summary.averageFPS.toFixed(1)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">总内存:</span>
                <span class="stat-value">${this.formatMemory(summary.totalMemoryUsage)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">总错误:</span>
                <span class="stat-value ${summary.totalErrors > 0 ? 'error' : ''}">${summary.totalErrors}</span>
            </div>
        `;
    }
    
    /**
     * 更新游戏显示
     */
    updateGameDisplay(selectedGame = null) {
        const gamesContent = this.container.querySelector('#games-list');
        const gameSelector = this.container.querySelector('#game-selector');
        const selected = selectedGame || gameSelector.value;
        
        if (!window.globalPerformanceMonitor) {
            gamesContent.innerHTML = '<div class="game-card"><h5>性能监控器未初始化</h5></div>';
            return;
        }
        
        const monitors = window.globalPerformanceMonitor.monitors;
        let html = '';
        
        for (const [gameId, monitor] of monitors) {
            if (selected !== 'all' && selected !== gameId) continue;
            
            const report = monitor.generateReport();
            const summary = monitor.getSummary();
            
            // 记录历史数据
            this.recordHistoryData(gameId, summary);
            
            html += `
                <div class="game-card">
                    <h5>${this.getGameDisplayName(gameId)}</h5>
                    <div class="game-stats">
                        <div class="stat-item">
                            <span class="stat-label">状态:</span>
                            <span class="stat-value ${monitor.isRunning ? '' : 'warning'}">${monitor.isRunning ? '运行中' : '已停止'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">FPS:</span>
                            <span class="stat-value ${this.getFPSClass(summary.averageFPS)}">${summary.averageFPS.toFixed(1)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">内存:</span>
                            <span class="stat-value">${this.formatMemory(summary.memoryUsage)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">渲染时间:</span>
                            <span class="stat-value">${summary.averageRenderTime.toFixed(2)}ms</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">游戏循环:</span>
                            <span class="stat-value">${summary.gameLoopCount}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">错误数:</span>
                            <span class="stat-value ${summary.errorCount > 0 ? 'error' : ''}">${summary.errorCount}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">警告数:</span>
                            <span class="stat-value ${summary.warningCount > 0 ? 'warning' : ''}">${summary.warningCount}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">运行时间:</span>
                            <span class="stat-value">${this.formatDuration(summary.uptime)}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (html === '') {
            html = '<div class="game-card"><h5>没有找到性能监控数据</h5></div>';
        }
        
        gamesContent.innerHTML = html;
    }
    
    /**
     * 记录历史数据
     */
    recordHistoryData(gameId, summary) {
        if (!this.dataHistory.has(gameId)) {
            this.dataHistory.set(gameId, {
                fps: [],
                memory: [],
                renderTime: [],
                timestamps: []
            });
        }
        
        const history = this.dataHistory.get(gameId);
        const now = Date.now();
        
        history.fps.push(summary.averageFPS);
        history.memory.push(summary.memoryUsage);
        history.renderTime.push(summary.averageRenderTime);
        history.timestamps.push(now);
        
        // 限制历史数据长度
        if (history.fps.length > this.maxHistoryLength) {
            history.fps.shift();
            history.memory.shift();
            history.renderTime.shift();
            history.timestamps.shift();
        }
    }
    
    /**
     * 更新图表
     */
    updateCharts() {
        this.updateFPSChart();
        this.updateMemoryChart();
    }
    
    /**
     * 更新FPS图表
     */
    updateFPSChart() {
        const canvas = this.container.querySelector('#fps-chart');
        const ctx = canvas.getContext('2d');
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制网格
        this.drawGrid(ctx, canvas.width, canvas.height);
        
        // 绘制FPS数据
        const colors = ['#00ff00', '#ff0000', '#0000ff', '#ffff00', '#ff00ff'];
        let colorIndex = 0;
        
        for (const [gameId, history] of this.dataHistory) {
            if (history.fps.length < 2) continue;
            
            ctx.strokeStyle = colors[colorIndex % colors.length];
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            const maxFPS = 60;
            const stepX = canvas.width / (this.maxHistoryLength - 1);
            
            for (let i = 0; i < history.fps.length; i++) {
                const x = i * stepX;
                const y = canvas.height - (history.fps[i] / maxFPS) * canvas.height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            colorIndex++;
        }
        
        // 绘制图例
        this.drawLegend(ctx, canvas.width, canvas.height, 'FPS');
    }
    
    /**
     * 更新内存图表
     */
    updateMemoryChart() {
        const canvas = this.container.querySelector('#memory-chart');
        const ctx = canvas.getContext('2d');
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制网格
        this.drawGrid(ctx, canvas.width, canvas.height);
        
        // 计算最大内存值
        let maxMemory = 0;
        for (const [, history] of this.dataHistory) {
            maxMemory = Math.max(maxMemory, ...history.memory);
        }
        
        if (maxMemory === 0) maxMemory = 100; // 默认值
        
        // 绘制内存数据
        const colors = ['#00ff00', '#ff0000', '#0000ff', '#ffff00', '#ff00ff'];
        let colorIndex = 0;
        
        for (const [gameId, history] of this.dataHistory) {
            if (history.memory.length < 2) continue;
            
            ctx.strokeStyle = colors[colorIndex % colors.length];
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            const stepX = canvas.width / (this.maxHistoryLength - 1);
            
            for (let i = 0; i < history.memory.length; i++) {
                const x = i * stepX;
                const y = canvas.height - (history.memory[i] / maxMemory) * canvas.height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            colorIndex++;
        }
        
        // 绘制图例
        this.drawLegend(ctx, canvas.width, canvas.height, 'Memory');
    }
    
    /**
     * 绘制网格
     */
    drawGrid(ctx, width, height) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // 垂直线
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // 水平线
        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
    
    /**
     * 绘制图例
     */
    drawLegend(ctx, width, height, type) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(width - 120, 10, 110, this.dataHistory.size * 20 + 10);
        
        ctx.font = '12px Courier New';
        const colors = ['#00ff00', '#ff0000', '#0000ff', '#ffff00', '#ff00ff'];
        let colorIndex = 0;
        let y = 25;
        
        for (const [gameId] of this.dataHistory) {
            ctx.fillStyle = colors[colorIndex % colors.length];
            ctx.fillRect(width - 115, y - 8, 15, 2);
            
            ctx.fillStyle = 'white';
            ctx.fillText(this.getGameDisplayName(gameId), width - 95, y);
            
            y += 20;
            colorIndex++;
        }
    }
    
    /**
     * 获取FPS颜色类
     */
    getFPSClass(fps) {
        if (fps >= 50) return '';
        if (fps >= 30) return 'warning';
        return 'error';
    }
    
    /**
     * 格式化内存大小
     */
    formatMemory(bytes) {
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
    }
    
    /**
     * 格式化持续时间
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    /**
     * 导出数据
     */
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            globalSummary: window.globalPerformanceMonitor ? window.globalPerformanceMonitor.getGlobalSummary() : null,
            gameData: {},
            history: Object.fromEntries(this.dataHistory)
        };
        
        // 收集每个游戏的详细数据
        if (window.globalPerformanceMonitor) {
            for (const [gameId, monitor] of window.globalPerformanceMonitor.monitors) {
                data.gameData[gameId] = {
                    report: monitor.generateReport(),
                    summary: monitor.getSummary()
                };
            }
        }
        
        // 创建下载链接
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-data-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('性能数据已导出');
    }
    
    /**
     * 清除历史数据
     */
    clearHistory() {
        this.dataHistory.clear();
        console.log('性能历史数据已清除');
    }
}

// 全局实例
if (typeof window !== 'undefined') {
    // 延迟初始化，确保所有脚本都加载完成
    window.initPerformanceDashboard = function() {
        if (!window.performanceDashboard) {
            window.performanceDashboard = new PerformanceDashboard();
            console.log('Performance Dashboard initialized');
        }
        return window.performanceDashboard;
    };
}
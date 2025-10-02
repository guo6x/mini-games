/**
 * 游戏性能监控器
 * 负责收集、分析和展示游戏性能数据
 */
class GamePerformanceMonitor {
    constructor(gameName) {
        this.gameName = gameName;
        this.isMonitoring = false;
        this.startTime = null;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fpsHistory = [];
        this.memoryHistory = [];
        this.performanceMetrics = {
            fps: {
                current: 0,
                average: 0,
                min: Infinity,
                max: 0,
                history: []
            },
            memory: {
                used: 0,
                total: 0,
                percentage: 0,
                history: []
            },
            renderTime: {
                current: 0,
                average: 0,
                min: Infinity,
                max: 0,
                history: []
            },
            gameMetrics: {
                totalPlayTime: 0,
                gameLoops: 0,
                errors: 0,
                warnings: 0
            }
        };
        
        this.observers = [];
        this.updateInterval = null;
        this.historyLimit = 100; // 保留最近100个数据点
        
        // 绑定方法
        this.updateMetrics = this.updateMetrics.bind(this);
        this.measureFrame = this.measureFrame.bind(this);
        
        console.log(`性能监控器已初始化: ${gameName}`);
    }
    
    /**
     * 开始监控
     */
    start() {
        if (this.isMonitoring) {
            console.warn('性能监控已在运行中');
            return;
        }
        
        this.isMonitoring = true;
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
        this.frameCount = 0;
        
        // 每秒更新一次性能指标
        this.updateInterval = setInterval(this.updateMetrics, 1000);
        
        // 监听错误事件
        this.setupErrorMonitoring();
        
        console.log(`开始监控游戏性能: ${this.gameName}`);
        this.notifyObservers('started');
    }
    
    /**
     * 停止监控
     */
    stop() {
        if (!this.isMonitoring) {
            return;
        }
        
        this.isMonitoring = false;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log(`停止监控游戏性能: ${this.gameName}`);
        this.notifyObservers('stopped');
    }
    
    /**
     * 测量帧性能
     */
    measureFrame() {
        if (!this.isMonitoring) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        // 计算FPS
        const fps = deltaTime > 0 ? 1000 / deltaTime : 0;
        this.updateFPS(fps);
        
        // 计算渲染时间
        this.updateRenderTime(deltaTime);
        
        this.lastFrameTime = currentTime;
        this.frameCount++;
        this.performanceMetrics.gameMetrics.gameLoops++;
    }
    
    /**
     * 更新FPS指标
     */
    updateFPS(fps) {
        const fpsMetrics = this.performanceMetrics.fps;
        
        fpsMetrics.current = Math.round(fps);
        fpsMetrics.min = Math.min(fpsMetrics.min, fps);
        fpsMetrics.max = Math.max(fpsMetrics.max, fps);
        
        // 添加到历史记录
        fpsMetrics.history.push({
            value: fps,
            timestamp: Date.now()
        });
        
        // 限制历史记录长度
        if (fpsMetrics.history.length > this.historyLimit) {
            fpsMetrics.history.shift();
        }
        
        // 计算平均值
        const sum = fpsMetrics.history.reduce((acc, item) => acc + item.value, 0);
        fpsMetrics.average = Math.round(sum / fpsMetrics.history.length);
    }
    
    /**
     * 更新渲染时间指标
     */
    updateRenderTime(renderTime) {
        const renderMetrics = this.performanceMetrics.renderTime;
        
        renderMetrics.current = Math.round(renderTime * 100) / 100;
        renderMetrics.min = Math.min(renderMetrics.min, renderTime);
        renderMetrics.max = Math.max(renderMetrics.max, renderTime);
        
        // 添加到历史记录
        renderMetrics.history.push({
            value: renderTime,
            timestamp: Date.now()
        });
        
        // 限制历史记录长度
        if (renderMetrics.history.length > this.historyLimit) {
            renderMetrics.history.shift();
        }
        
        // 计算平均值
        const sum = renderMetrics.history.reduce((acc, item) => acc + item.value, 0);
        renderMetrics.average = Math.round((sum / renderMetrics.history.length) * 100) / 100;
    }
    
    /**
     * 更新内存使用指标
     */
    updateMemoryMetrics() {
        if (!performance.memory) {
            return; // 某些浏览器不支持
        }
        
        const memoryMetrics = this.performanceMetrics.memory;
        const memory = performance.memory;
        
        memoryMetrics.used = Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100; // MB
        memoryMetrics.total = Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100; // MB
        memoryMetrics.percentage = Math.round((memoryMetrics.used / memoryMetrics.total) * 100);
        
        // 添加到历史记录
        memoryMetrics.history.push({
            used: memoryMetrics.used,
            total: memoryMetrics.total,
            percentage: memoryMetrics.percentage,
            timestamp: Date.now()
        });
        
        // 限制历史记录长度
        if (memoryMetrics.history.length > this.historyLimit) {
            memoryMetrics.history.shift();
        }
    }
    
    /**
     * 更新性能指标
     */
    updateMetrics() {
        if (!this.isMonitoring) return;
        
        // 更新总游戏时间
        if (this.startTime) {
            this.performanceMetrics.gameMetrics.totalPlayTime = 
                Math.round((performance.now() - this.startTime) / 1000);
        }
        
        // 更新内存指标
        this.updateMemoryMetrics();
        
        // 通知观察者
        this.notifyObservers('updated', this.performanceMetrics);
    }
    
    /**
     * 设置错误监控
     */
    setupErrorMonitoring() {
        // 监听全局错误
        window.addEventListener('error', (event) => {
            this.recordError('JavaScript Error', event.error);
        });
        
        // 监听未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.recordError('Unhandled Promise Rejection', event.reason);
        });
        
        // 监听控制台警告（如果可能）
        const originalWarn = console.warn;
        console.warn = (...args) => {
            this.recordWarning(args.join(' '));
            originalWarn.apply(console, args);
        };
    }
    
    /**
     * 记录错误
     */
    recordError(type, error) {
        this.performanceMetrics.gameMetrics.errors++;
        console.error(`[${this.gameName}] ${type}:`, error);
        this.notifyObservers('error', { type, error, timestamp: Date.now() });
    }
    
    /**
     * 记录警告
     */
    recordWarning(message) {
        this.performanceMetrics.gameMetrics.warnings++;
        this.notifyObservers('warning', { message, timestamp: Date.now() });
    }
    
    /**
     * 获取性能报告
     */
    getPerformanceReport() {
        const report = {
            gameName: this.gameName,
            timestamp: Date.now(),
            isMonitoring: this.isMonitoring,
            metrics: JSON.parse(JSON.stringify(this.performanceMetrics)),
            summary: this.generateSummary()
        };
        
        return report;
    }
    
    /**
     * 生成性能摘要
     */
    generateSummary() {
        const metrics = this.performanceMetrics;
        const summary = {
            overallHealth: 'good', // good, warning, critical
            issues: [],
            recommendations: []
        };
        
        // 检查FPS
        if (metrics.fps.average < 30) {
            summary.overallHealth = 'critical';
            summary.issues.push('FPS过低，影响游戏体验');
            summary.recommendations.push('优化渲染逻辑，减少不必要的重绘');
        } else if (metrics.fps.average < 45) {
            summary.overallHealth = 'warning';
            summary.issues.push('FPS偏低');
            summary.recommendations.push('检查游戏循环效率');
        }
        
        // 检查内存使用
        if (metrics.memory.percentage > 80) {
            summary.overallHealth = 'critical';
            summary.issues.push('内存使用率过高');
            summary.recommendations.push('检查内存泄漏，优化数据结构');
        } else if (metrics.memory.percentage > 60) {
            if (summary.overallHealth === 'good') {
                summary.overallHealth = 'warning';
            }
            summary.issues.push('内存使用率较高');
            summary.recommendations.push('监控内存使用趋势');
        }
        
        // 检查渲染时间
        if (metrics.renderTime.average > 16.67) { // 60FPS对应的帧时间
            if (summary.overallHealth === 'good') {
                summary.overallHealth = 'warning';
            }
            summary.issues.push('渲染时间过长');
            summary.recommendations.push('优化渲染算法');
        }
        
        // 检查错误数量
        if (metrics.gameMetrics.errors > 0) {
            summary.overallHealth = 'critical';
            summary.issues.push(`发现${metrics.gameMetrics.errors}个错误`);
            summary.recommendations.push('修复游戏错误');
        }
        
        return summary;
    }
    
    /**
     * 添加观察者
     */
    addObserver(callback) {
        this.observers.push(callback);
    }
    
    /**
     * 移除观察者
     */
    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }
    
    /**
     * 通知观察者
     */
    notifyObservers(event, data = null) {
        this.observers.forEach(callback => {
            try {
                callback(event, data, this.gameName);
            } catch (error) {
                console.error('观察者回调错误:', error);
            }
        });
    }
    
    /**
     * 重置指标
     */
    reset() {
        this.frameCount = 0;
        this.performanceMetrics = {
            fps: {
                current: 0,
                average: 0,
                min: Infinity,
                max: 0,
                history: []
            },
            memory: {
                used: 0,
                total: 0,
                percentage: 0,
                history: []
            },
            renderTime: {
                current: 0,
                average: 0,
                min: Infinity,
                max: 0,
                history: []
            },
            gameMetrics: {
                totalPlayTime: 0,
                gameLoops: 0,
                errors: 0,
                warnings: 0
            }
        };
        
        console.log(`性能指标已重置: ${this.gameName}`);
    }
    
    /**
     * 导出性能数据
     */
    exportData() {
        const data = {
            gameName: this.gameName,
            exportTime: new Date().toISOString(),
            metrics: this.performanceMetrics,
            report: this.getPerformanceReport()
        };
        
        return JSON.stringify(data, null, 2);
    }
}

/**
 * 全局性能监控管理器
 */
class GlobalPerformanceMonitor {
    constructor() {
        this.monitors = new Map();
        this.isGlobalMonitoring = false;
        this.globalMetrics = {
            totalGames: 0,
            activeGames: 0,
            totalErrors: 0,
            totalWarnings: 0,
            averageFPS: 0,
            totalMemoryUsage: 0
        };
        
        console.log('全局性能监控管理器已初始化');
    }
    
    /**
     * 注册游戏监控器
     */
    registerMonitor(gameName, monitor) {
        if (this.monitors.has(gameName)) {
            console.warn(`游戏监控器已存在: ${gameName}`);
            return;
        }
        
        this.monitors.set(gameName, monitor);
        this.globalMetrics.totalGames++;
        
        // 添加观察者来收集全局数据
        monitor.addObserver((event, data, name) => {
            this.handleMonitorEvent(event, data, name);
        });
        
        console.log(`已注册游戏监控器: ${gameName}`);
    }
    
    /**
     * 注销游戏监控器
     */
    unregisterMonitor(gameName) {
        if (this.monitors.has(gameName)) {
            const monitor = this.monitors.get(gameName);
            monitor.stop();
            this.monitors.delete(gameName);
            this.globalMetrics.totalGames--;
            console.log(`已注销游戏监控器: ${gameName}`);
        }
    }
    
    /**
     * 获取游戏监控器
     */
    getMonitor(gameName) {
        return this.monitors.get(gameName);
    }
    
    /**
     * 处理监控器事件
     */
    handleMonitorEvent(event, data, gameName) {
        switch (event) {
            case 'started':
                this.globalMetrics.activeGames++;
                break;
            case 'stopped':
                this.globalMetrics.activeGames--;
                break;
            case 'error':
                this.globalMetrics.totalErrors++;
                break;
            case 'warning':
                this.globalMetrics.totalWarnings++;
                break;
            case 'updated':
                this.updateGlobalMetrics();
                break;
        }
    }
    
    /**
     * 更新全局指标
     */
    updateGlobalMetrics() {
        let totalFPS = 0;
        let totalMemory = 0;
        let activeCount = 0;
        
        this.monitors.forEach((monitor, gameName) => {
            if (monitor.isMonitoring) {
                totalFPS += monitor.performanceMetrics.fps.current;
                totalMemory += monitor.performanceMetrics.memory.used;
                activeCount++;
            }
        });
        
        this.globalMetrics.averageFPS = activeCount > 0 ? Math.round(totalFPS / activeCount) : 0;
        this.globalMetrics.totalMemoryUsage = Math.round(totalMemory * 100) / 100;
    }
    
    /**
     * 获取全局性能报告
     */
    getGlobalReport() {
        const reports = {};
        
        this.monitors.forEach((monitor, gameName) => {
            reports[gameName] = monitor.getPerformanceReport();
        });
        
        return {
            timestamp: Date.now(),
            globalMetrics: this.globalMetrics,
            gameReports: reports,
            summary: this.generateGlobalSummary()
        };
    }
    
    /**
     * 生成全局摘要
     */
    generateGlobalSummary() {
        const summary = {
            overallHealth: 'good',
            issues: [],
            recommendations: []
        };
        
        // 检查全局错误
        if (this.globalMetrics.totalErrors > 0) {
            summary.overallHealth = 'critical';
            summary.issues.push(`全局发现${this.globalMetrics.totalErrors}个错误`);
            summary.recommendations.push('检查并修复所有游戏错误');
        }
        
        // 检查平均FPS
        if (this.globalMetrics.averageFPS < 30) {
            summary.overallHealth = 'critical';
            summary.issues.push('全局平均FPS过低');
            summary.recommendations.push('优化所有游戏的性能');
        }
        
        // 检查内存使用
        if (this.globalMetrics.totalMemoryUsage > 100) {
            if (summary.overallHealth === 'good') {
                summary.overallHealth = 'warning';
            }
            summary.issues.push('总内存使用量较高');
            summary.recommendations.push('优化内存使用');
        }
        
        return summary;
    }
    
    /**
     * 启动所有监控器
     */
    startAll() {
        this.monitors.forEach((monitor, gameName) => {
            if (!monitor.isMonitoring) {
                monitor.start();
            }
        });
        
        this.isGlobalMonitoring = true;
        console.log('已启动所有性能监控器');
    }
    
    /**
     * 停止所有监控器
     */
    stopAll() {
        this.monitors.forEach((monitor, gameName) => {
            monitor.stop();
        });
        
        this.isGlobalMonitoring = false;
        console.log('已停止所有性能监控器');
    }
    
    /**
     * 导出所有性能数据
     */
    exportAllData() {
        const data = {
            exportTime: new Date().toISOString(),
            globalMetrics: this.globalMetrics,
            gameData: {}
        };
        
        this.monitors.forEach((monitor, gameName) => {
            data.gameData[gameName] = JSON.parse(monitor.exportData());
        });
        
        return JSON.stringify(data, null, 2);
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.GlobalPerformanceMonitor = GlobalPerformanceMonitor;
    window.GamePerformanceMonitor = GamePerformanceMonitor;
    
    // 创建全局监控管理器实例
    if (!window.globalPerformanceMonitor) {
        window.globalPerformanceMonitor = new GlobalPerformanceMonitor();
    }
    
    console.log('游戏性能监控系统已加载');
}

// 导出类（用于模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GamePerformanceMonitor,
        GlobalPerformanceMonitor
    };
}
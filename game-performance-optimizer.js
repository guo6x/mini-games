/**
 * 游戏性能优化器
 * 提供统一的渲染循环管理、帧率控制和性能监控
 */
class GamePerformanceOptimizer {
    constructor(gameId, options = {}) {
        this.gameId = gameId;
        this.options = {
            targetFPS: options.targetFPS || 60,
            enableVSync: options.enableVSync !== false,
            enablePerformanceMonitoring: options.enablePerformanceMonitoring !== false,
            maxFrameSkip: options.maxFrameSkip || 5,
            adaptiveQuality: options.adaptiveQuality !== false,
            ...options
        };
        
        // 性能指标
        this.performanceMetrics = {
            fps: 0,
            averageFPS: 0,
            frameTime: 0,
            averageFrameTime: 0,
            droppedFrames: 0,
            totalFrames: 0,
            lastFrameTime: 0,
            frameHistory: [],
            cpuUsage: 0,
            memoryUsage: 0
        };
        
        // 渲染状态
        this.renderState = {
            isRunning: false,
            isPaused: false,
            animationFrameId: null,
            lastUpdateTime: 0,
            accumulator: 0,
            currentTime: 0,
            frameSkipCount: 0
        };
        
        // 回调函数
        this.callbacks = {
            update: null,
            render: null,
            onPerformanceUpdate: null,
            onQualityAdjust: null
        };
        
        // 质量设置
        this.qualitySettings = {
            level: 'high', // low, medium, high, ultra
            renderScale: 1.0,
            particleCount: 1.0,
            shadowQuality: 'high',
            textureQuality: 'high'
        };
        
        // 存储事件监听器引用，用于正确清理
        this._pageEventHandlers = null;
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化性能优化器
     */
    init() {
        // 检测设备性能
        this.detectDeviceCapabilities();
        
        // 设置初始质量
        this.adjustQualityBasedOnDevice();
        
        // 绑定页面可见性变化事件
        this.bindVisibilityEvents();
        
        console.log(`[${this.gameId}] 性能优化器初始化完成`);
    }
    
    /**
     * 检测设备性能能力
     */
    detectDeviceCapabilities() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        this.deviceCapabilities = {
            webgl: !!gl,
            hardwareConcurrency: navigator.hardwareConcurrency || 4,
            deviceMemory: navigator.deviceMemory || 4,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : null,
            pixelRatio: window.devicePixelRatio || 1,
            maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 2048
        };
        
        // 性能评分 (0-100)
        this.performanceScore = this.calculatePerformanceScore();
        
        console.log(`[${this.gameId}] 设备性能评分: ${this.performanceScore}`);
    }
    
    /**
     * 计算设备性能评分
     */
    calculatePerformanceScore() {
        let score = 50; // 基础分数
        
        // CPU核心数加分
        score += Math.min(this.deviceCapabilities.hardwareConcurrency * 5, 20);
        
        // 内存加分
        score += Math.min(this.deviceCapabilities.deviceMemory * 3, 15);
        
        // WebGL支持加分
        if (this.deviceCapabilities.webgl) score += 10;
        
        // 高分辨率屏幕减分
        if (this.deviceCapabilities.pixelRatio > 2) score -= 5;
        
        // 网络状况影响
        if (this.deviceCapabilities.connection) {
            const effectiveType = this.deviceCapabilities.connection.effectiveType;
            if (effectiveType === '4g') score += 5;
            else if (effectiveType === '3g') score -= 5;
            else if (effectiveType === '2g') score -= 15;
        }
        
        return Math.max(0, Math.min(100, score));
    }
    
    /**
     * 根据设备性能调整质量设置
     */
    adjustQualityBasedOnDevice() {
        if (this.performanceScore >= 80) {
            this.setQuality('ultra');
        } else if (this.performanceScore >= 60) {
            this.setQuality('high');
        } else if (this.performanceScore >= 40) {
            this.setQuality('medium');
        } else {
            this.setQuality('low');
        }
    }
    
    /**
     * 设置质量等级
     */
    setQuality(level) {
        const qualityConfigs = {
            low: {
                level: 'low',
                renderScale: 0.7,
                particleCount: 0.3,
                shadowQuality: 'off',
                textureQuality: 'low'
            },
            medium: {
                level: 'medium',
                renderScale: 0.85,
                particleCount: 0.6,
                shadowQuality: 'low',
                textureQuality: 'medium'
            },
            high: {
                level: 'high',
                renderScale: 1.0,
                particleCount: 0.8,
                shadowQuality: 'medium',
                textureQuality: 'high'
            },
            ultra: {
                level: 'ultra',
                renderScale: 1.0,
                particleCount: 1.0,
                shadowQuality: 'high',
                textureQuality: 'ultra'
            }
        };
        
        this.qualitySettings = { ...qualityConfigs[level] };
        
        // 通知质量调整
        if (this.callbacks.onQualityAdjust) {
            this.callbacks.onQualityAdjust(this.qualitySettings);
        }
        
        console.log(`[${this.gameId}] 质量设置调整为: ${level}`);
    }
    
    /**
     * 绑定页面可见性事件
     */
    bindVisibilityEvents() {
        // 存储事件监听器引用
        this._pageEventHandlers = {
            visibilityChange: () => {
                if (document.hidden) {
                    this.handlePageHidden();
                } else {
                    this.handlePageVisible();
                }
            },
            blur: () => this.handlePageHidden(),
            focus: () => this.handlePageVisible()
        };
        
        document.addEventListener('visibilitychange', this._pageEventHandlers.visibilityChange);
        window.addEventListener('blur', this._pageEventHandlers.blur);
        window.addEventListener('focus', this._pageEventHandlers.focus);
    }
    
    /**
     * 处理页面隐藏
     */
    handlePageHidden() {
        if (this.renderState.isRunning && !this.renderState.isPaused) {
            this.pause();
            this.wasRunningBeforeHidden = true;
        }
    }
    
    /**
     * 处理页面显示
     */
    handlePageVisible() {
        if (this.wasRunningBeforeHidden) {
            this.resume();
            this.wasRunningBeforeHidden = false;
        }
    }
    
    /**
     * 设置更新回调
     */
    setUpdateCallback(callback) {
        this.callbacks.update = callback;
    }
    
    /**
     * 设置渲染回调
     */
    setRenderCallback(callback) {
        this.callbacks.render = callback;
    }
    
    /**
     * 设置性能监控回调
     */
    setPerformanceCallback(callback) {
        this.callbacks.onPerformanceUpdate = callback;
    }
    
    /**
     * 设置质量调整回调
     */
    setQualityCallback(callback) {
        this.callbacks.onQualityAdjust = callback;
    }
    
    /**
     * 开始渲染循环
     */
    start() {
        if (this.renderState.isRunning) return;
        
        this.renderState.isRunning = true;
        this.renderState.isPaused = false;
        this.renderState.lastUpdateTime = performance.now();
        this.performanceMetrics.lastFrameTime = this.renderState.lastUpdateTime;
        
        this.gameLoop();
        
        console.log(`[${this.gameId}] 性能优化渲染循环已启动`);
    }
    
    /**
     * 暂停渲染循环
     */
    pause() {
        if (!this.renderState.isRunning || this.renderState.isPaused) return;
        
        this.renderState.isPaused = true;
        
        if (this.renderState.animationFrameId) {
            cancelAnimationFrame(this.renderState.animationFrameId);
            this.renderState.animationFrameId = null;
        }
        
        console.log(`[${this.gameId}] 渲染循环已暂停`);
    }
    
    /**
     * 恢复渲染循环
     */
    resume() {
        if (!this.renderState.isRunning || !this.renderState.isPaused) return;
        
        this.renderState.isPaused = false;
        this.renderState.lastUpdateTime = performance.now();
        this.gameLoop();
        
        console.log(`[${this.gameId}] 渲染循环已恢复`);
    }
    
    /**
     * 停止渲染循环
     */
    stop() {
        this.renderState.isRunning = false;
        this.renderState.isPaused = false;
        
        if (this.renderState.animationFrameId) {
            cancelAnimationFrame(this.renderState.animationFrameId);
            this.renderState.animationFrameId = null;
        }
        
        console.log(`[${this.gameId}] 渲染循环已停止`);
    }
    
    /**
     * 主游戏循环
     */
    gameLoop() {
        if (!this.renderState.isRunning || this.renderState.isPaused) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.renderState.lastUpdateTime;
        
        // 更新性能指标
        this.updatePerformanceMetrics(currentTime, deltaTime);
        
        // 固定时间步长更新
        if (this.options.enableVSync) {
            this.fixedTimeStepUpdate(deltaTime);
        } else {
            this.variableTimeStepUpdate(deltaTime);
        }
        
        // 渲染
        if (this.callbacks.render) {
            this.callbacks.render(this.renderState.currentTime);
        }
        
        // 自适应质量调整
        if (this.options.adaptiveQuality) {
            this.adaptiveQualityAdjustment();
        }
        
        this.renderState.lastUpdateTime = currentTime;
        this.renderState.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * 固定时间步长更新
     */
    fixedTimeStepUpdate(deltaTime) {
        const targetFrameTime = 1000 / this.options.targetFPS;
        this.renderState.accumulator += deltaTime;
        
        let updateCount = 0;
        while (this.renderState.accumulator >= targetFrameTime && updateCount < this.options.maxFrameSkip) {
            if (this.callbacks.update) {
                this.callbacks.update(targetFrameTime);
            }
            this.renderState.accumulator -= targetFrameTime;
            this.renderState.currentTime += targetFrameTime;
            updateCount++;
        }
        
        // 如果跳帧过多，重置累加器
        if (updateCount >= this.options.maxFrameSkip) {
            this.renderState.accumulator = 0;
            this.performanceMetrics.droppedFrames++;
        }
    }
    
    /**
     * 可变时间步长更新
     */
    variableTimeStepUpdate(deltaTime) {
        // 限制最大帧时间，防止螺旋死亡
        const clampedDeltaTime = Math.min(deltaTime, 50);
        
        if (this.callbacks.update) {
            this.callbacks.update(clampedDeltaTime);
        }
        
        this.renderState.currentTime += clampedDeltaTime;
    }
    
    /**
     * 更新性能指标
     */
    updatePerformanceMetrics(currentTime, deltaTime) {
        this.performanceMetrics.totalFrames++;
        this.performanceMetrics.frameTime = deltaTime;
        
        // 计算FPS
        if (deltaTime > 0) {
            this.performanceMetrics.fps = 1000 / deltaTime;
        }
        
        // 维护帧时间历史
        this.performanceMetrics.frameHistory.push(deltaTime);
        if (this.performanceMetrics.frameHistory.length > 60) {
            this.performanceMetrics.frameHistory.shift();
        }
        
        // 计算平均值
        if (this.performanceMetrics.frameHistory.length > 0) {
            const sum = this.performanceMetrics.frameHistory.reduce((a, b) => a + b, 0);
            this.performanceMetrics.averageFrameTime = sum / this.performanceMetrics.frameHistory.length;
            this.performanceMetrics.averageFPS = 1000 / this.performanceMetrics.averageFrameTime;
        }
        
        // 每秒更新一次性能回调
        if (currentTime - this.performanceMetrics.lastFrameTime >= 1000) {
            this.updateMemoryUsage();
            
            if (this.callbacks.onPerformanceUpdate) {
                this.callbacks.onPerformanceUpdate(this.performanceMetrics);
            }
            
            this.performanceMetrics.lastFrameTime = currentTime;
        }
    }
    
    /**
     * 更新内存使用情况
     */
    updateMemoryUsage() {
        if (performance.memory) {
            this.performanceMetrics.memoryUsage = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
    }
    
    /**
     * 自适应质量调整
     */
    adaptiveQualityAdjustment() {
        const targetFPS = this.options.targetFPS;
        const currentFPS = this.performanceMetrics.averageFPS;
        const fpsRatio = currentFPS / targetFPS;
        
        // 如果FPS持续低于目标的80%，降低质量
        if (fpsRatio < 0.8 && this.qualitySettings.level !== 'low') {
            this.adjustQualityDown();
        }
        // 如果FPS持续高于目标的95%，可以提高质量
        else if (fpsRatio > 0.95 && this.qualitySettings.level !== 'ultra') {
            this.adjustQualityUp();
        }
    }
    
    /**
     * 降低质量等级
     */
    adjustQualityDown() {
        const levels = ['ultra', 'high', 'medium', 'low'];
        const currentIndex = levels.indexOf(this.qualitySettings.level);
        if (currentIndex < levels.length - 1) {
            this.setQuality(levels[currentIndex + 1]);
        }
    }
    
    /**
     * 提高质量等级
     */
    adjustQualityUp() {
        const levels = ['low', 'medium', 'high', 'ultra'];
        const currentIndex = levels.indexOf(this.qualitySettings.level);
        if (currentIndex < levels.length - 1) {
            this.setQuality(levels[currentIndex + 1]);
        }
    }
    
    /**
     * 获取性能指标
     */
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }
    
    /**
     * 获取质量设置
     */
    getQualitySettings() {
        return { ...this.qualitySettings };
    }
    
    /**
     * 获取设备能力信息
     */
    getDeviceCapabilities() {
        return { ...this.deviceCapabilities };
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.stop();
        
        // 正确移除事件监听器
        if (this._pageEventHandlers) {
            document.removeEventListener('visibilitychange', this._pageEventHandlers.visibilityChange);
            window.removeEventListener('blur', this._pageEventHandlers.blur);
            window.removeEventListener('focus', this._pageEventHandlers.focus);
            this._pageEventHandlers = null;
        }
        
        // 清理回调
        this.callbacks = {};
        
        console.log(`[${this.gameId}] 性能优化器已销毁`);
    }
}

// 注意：GlobalPerformanceMonitor 类已在 game-performance-monitor.js 中定义
// 这里只需要确保全局实例存在
if (typeof window !== 'undefined' && !window.GlobalPerformanceMonitor) {
    console.warn('GlobalPerformanceMonitor 未找到，请确保已加载 game-performance-monitor.js');
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GamePerformanceOptimizer };
}
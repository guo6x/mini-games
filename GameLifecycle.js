/**
 * 游戏生命周期管理系统
 * 提供统一的游戏状态管理、资源清理和内存泄漏防护
 */

class GameLifecycle {
    constructor(gameId, gameInstance) {
        this.gameId = gameId;
        this.gameInstance = gameInstance;
        this.state = 'initialized';
        this.timers = new Set();
        this.intervals = new Set();
        this.eventListeners = new Map();
        this.animationFrames = new Set();
        this.resources = new Map();
        this.stateHistory = [];
        this.maxHistorySize = 50;
        
        // 绑定页面生命周期事件
        this.bindPageLifecycleEvents();
        
        // 性能监控
        this.performanceMetrics = {
            startTime: Date.now(),
            frameCount: 0,
            lastFrameTime: Date.now(),
            averageFPS: 0,
            memoryUsage: 0
        };
        
        // 状态变更回调
        this.stateCallbacks = new Map();
        
        this.recordStateChange('initialized');
    }
    
    /**
     * 绑定页面生命周期事件
     */
    bindPageLifecycleEvents() {
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHidden();
            } else {
                this.handlePageVisible();
            }
        });
        
        // 页面卸载前清理
        window.addEventListener('beforeunload', () => {
            this.destroy();
        });
        
        // 页面失去焦点
        window.addEventListener('blur', () => {
            this.handlePageBlur();
        });
        
        // 页面获得焦点
        window.addEventListener('focus', () => {
            this.handlePageFocus();
        });
        
        // 内存压力检测
        if ('memory' in performance) {
            this.startMemoryMonitoring();
        }
    }
    
    /**
     * 启动游戏
     * @param {Object} options - 启动选项
     */
    start(options = {}) {
        if (this.state === 'running') {
            console.warn(`游戏 ${this.gameId} 已经在运行中`);
            return;
        }
        
        try {
            this.setState('starting');
            
            // 清理之前的资源
            this.cleanup();
            
            // 初始化性能监控
            this.initPerformanceMonitoring();
            
            // 调用游戏实例的启动方法
            if (this.gameInstance && typeof this.gameInstance.start === 'function') {
                this.gameInstance.start(options);
            }
            
            this.setState('running');
            
            // 触发启动回调
            this.triggerStateCallback('start', options);
            
            console.log(`🎮 游戏 ${this.gameId} 启动成功`);
        } catch (error) {
            this.setState('error');
            this.handleError('启动游戏时发生错误', error);
        }
    }
    
    /**
     * 暂停游戏
     */
    pause() {
        if (this.state !== 'running') {
            console.warn(`游戏 ${this.gameId} 当前状态不允许暂停: ${this.state}`);
            return;
        }
        
        try {
            this.setState('pausing');
            
            // 暂停所有定时器
            this.pauseTimers();
            
            // 暂停动画帧
            this.pauseAnimationFrames();
            
            // 调用游戏实例的暂停方法
            if (this.gameInstance && typeof this.gameInstance.pause === 'function') {
                this.gameInstance.pause();
            }
            
            this.setState('paused');
            
            // 触发暂停回调
            this.triggerStateCallback('pause');
            
            console.log(`⏸️ 游戏 ${this.gameId} 已暂停`);
        } catch (error) {
            this.handleError('暂停游戏时发生错误', error);
        }
    }
    
    /**
     * 恢复游戏
     */
    resume() {
        if (this.state !== 'paused') {
            console.warn(`游戏 ${this.gameId} 当前状态不允许恢复: ${this.state}`);
            return;
        }
        
        try {
            this.setState('resuming');
            
            // 恢复定时器
            this.resumeTimers();
            
            // 恢复动画帧
            this.resumeAnimationFrames();
            
            // 调用游戏实例的恢复方法
            if (this.gameInstance && typeof this.gameInstance.resume === 'function') {
                this.gameInstance.resume();
            }
            
            this.setState('running');
            
            // 触发恢复回调
            this.triggerStateCallback('resume');
            
            console.log(`▶️ 游戏 ${this.gameId} 已恢复`);
        } catch (error) {
            this.handleError('恢复游戏时发生错误', error);
        }
    }
    
    /**
     * 停止游戏
     */
    stop() {
        if (this.state === 'stopped') {
            return;
        }
        
        try {
            this.setState('stopping');
            
            // 清理所有资源
            this.cleanup();
            
            // 调用游戏实例的停止方法
            if (this.gameInstance && typeof this.gameInstance.stop === 'function') {
                this.gameInstance.stop();
            }
            
            this.setState('stopped');
            
            // 触发停止回调
            this.triggerStateCallback('stop');
            
            console.log(`⏹️ 游戏 ${this.gameId} 已停止`);
        } catch (error) {
            this.handleError('停止游戏时发生错误', error);
        }
    }
    
    /**
     * 重启游戏
     */
    restart() {
        try {
            this.setState('restarting');
            
            this.stop();
            
            // 等待一帧后重新启动
            setTimeout(() => {
                this.start();
            }, 16);
            
            // 触发重启回调
            this.triggerStateCallback('restart');
            
            console.log(`🔄 游戏 ${this.gameId} 正在重启`);
        } catch (error) {
            this.handleError('重启游戏时发生错误', error);
        }
    }
    
    /**
     * 销毁游戏
     */
    destroy() {
        try {
            this.setState('destroying');
            
            // 清理所有资源
            this.cleanup();
            
            // 移除页面事件监听器
            this.removePageEventListeners();
            
            // 调用游戏实例的销毁方法
            if (this.gameInstance && typeof this.gameInstance.destroy === 'function') {
                this.gameInstance.destroy();
            }
            
            // 清理状态回调
            this.stateCallbacks.clear();
            
            this.setState('destroyed');
            
            console.log(`💥 游戏 ${this.gameId} 已销毁`);
        } catch (error) {
            this.handleError('销毁游戏时发生错误', error);
        }
    }
    
    /**
     * 注册定时器
     * @param {Function} callback - 回调函数
     * @param {number} delay - 延迟时间
     * @returns {number} 定时器ID
     */
    setTimeout(callback, delay) {
        const timerId = setTimeout(() => {
            this.timers.delete(timerId);
            callback();
        }, delay);
        
        this.timers.add(timerId);
        return timerId;
    }
    
    /**
     * 注册间隔定时器
     * @param {Function} callback - 回调函数
     * @param {number} interval - 间隔时间
     * @returns {number} 定时器ID
     */
    setInterval(callback, interval) {
        const intervalId = setInterval(callback, interval);
        this.intervals.add(intervalId);
        return intervalId;
    }
    
    /**
     * 注册动画帧
     * @param {Function} callback - 回调函数
     * @returns {number} 动画帧ID
     */
    requestAnimationFrame(callback) {
        const frameId = requestAnimationFrame((timestamp) => {
            this.animationFrames.delete(frameId);
            
            // 更新性能指标
            this.updatePerformanceMetrics(timestamp);
            
            callback(timestamp);
        });
        
        this.animationFrames.add(frameId);
        return frameId;
    }
    
    /**
     * 添加事件监听器
     * @param {Element} element - DOM元素
     * @param {string} event - 事件类型
     * @param {Function} handler - 事件处理器
     * @param {Object} options - 选项
     */
    addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        const key = `${element.constructor.name}_${event}`;
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }
        
        this.eventListeners.get(key).push({
            element,
            event,
            handler,
            options
        });
    }
    
    /**
     * 注册资源
     * @param {string} name - 资源名称
     * @param {*} resource - 资源对象
     * @param {Function} cleanup - 清理函数
     */
    registerResource(name, resource, cleanup) {
        this.resources.set(name, {
            resource,
            cleanup: cleanup || (() => {}),
            createdAt: Date.now()
        });
    }
    
    /**
     * 获取资源
     * @param {string} name - 资源名称
     * @returns {*} 资源对象
     */
    getResource(name) {
        const resourceInfo = this.resources.get(name);
        return resourceInfo ? resourceInfo.resource : null;
    }
    
    /**
     * 清理所有资源
     */
    cleanup() {
        // 清理定时器
        this.timers.forEach(timerId => clearTimeout(timerId));
        this.timers.clear();
        
        this.intervals.forEach(intervalId => clearInterval(intervalId));
        this.intervals.clear();
        
        // 清理动画帧
        this.animationFrames.forEach(frameId => cancelAnimationFrame(frameId));
        this.animationFrames.clear();
        
        // 清理事件监听器
        this.eventListeners.forEach(listeners => {
            listeners.forEach(({ element, event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
        });
        this.eventListeners.clear();
        
        // 清理注册的资源
        this.resources.forEach(({ resource, cleanup }) => {
            try {
                cleanup(resource);
            } catch (error) {
                console.error('清理资源时发生错误:', error);
            }
        });
        this.resources.clear();
    }
    
    /**
     * 暂停定时器
     */
    pauseTimers() {
        // 注意：JavaScript的setTimeout和setInterval无法直接暂停
        // 这里记录暂停时间，在恢复时重新计算
        this.pauseTime = Date.now();
    }
    
    /**
     * 恢复定时器
     */
    resumeTimers() {
        // 实际应用中需要重新实现定时器逻辑以支持暂停/恢复
        this.pauseTime = null;
    }
    
    /**
     * 暂停动画帧
     */
    pauseAnimationFrames() {
        this.animationFrames.forEach(frameId => cancelAnimationFrame(frameId));
        this.pausedFrames = new Set(this.animationFrames);
        this.animationFrames.clear();
    }
    
    /**
     * 恢复动画帧
     */
    resumeAnimationFrames() {
        // 动画帧需要重新请求
        if (this.pausedFrames) {
            this.pausedFrames.clear();
        }
    }
    
    /**
     * 设置游戏状态
     * @param {string} newState - 新状态
     */
    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        this.recordStateChange(newState, oldState);
        
        console.log(`🎮 游戏 ${this.gameId} 状态变更: ${oldState} → ${newState}`);
    }
    
    /**
     * 记录状态变更
     * @param {string} newState - 新状态
     * @param {string} oldState - 旧状态
     */
    recordStateChange(newState, oldState = null) {
        this.stateHistory.push({
            state: newState,
            previousState: oldState,
            timestamp: Date.now(),
            memoryUsage: this.getCurrentMemoryUsage()
        });
        
        // 限制历史记录大小
        if (this.stateHistory.length > this.maxHistorySize) {
            this.stateHistory.shift();
        }
    }
    
    /**
     * 注册状态变更回调
     * @param {string} state - 状态名称
     * @param {Function} callback - 回调函数
     */
    onStateChange(state, callback) {
        if (!this.stateCallbacks.has(state)) {
            this.stateCallbacks.set(state, []);
        }
        this.stateCallbacks.get(state).push(callback);
    }
    
    /**
     * 触发状态回调
     * @param {string} state - 状态名称
     * @param {*} data - 传递的数据
     */
    triggerStateCallback(state, data = null) {
        const callbacks = this.stateCallbacks.get(state) || [];
        callbacks.forEach(callback => {
            try {
                callback(data, this.state);
            } catch (error) {
                console.error(`状态回调执行失败 [${state}]:`, error);
            }
        });
    }
    
    /**
     * 处理页面隐藏
     */
    handlePageHidden() {
        if (this.state === 'running') {
            this.pause();
            this.wasRunningBeforeHidden = true;
        }
    }
    
    /**
     * 处理页面显示
     */
    handlePageVisible() {
        if (this.wasRunningBeforeHidden && this.state === 'paused') {
            this.resume();
            this.wasRunningBeforeHidden = false;
        }
    }
    
    /**
     * 处理页面失去焦点
     */
    handlePageBlur() {
        // 可以选择暂停游戏或降低帧率
        this.triggerStateCallback('blur');
    }
    
    /**
     * 处理页面获得焦点
     */
    handlePageFocus() {
        this.triggerStateCallback('focus');
    }
    
    /**
     * 初始化性能监控
     */
    initPerformanceMonitoring() {
        this.performanceMetrics.startTime = Date.now();
        this.performanceMetrics.frameCount = 0;
        this.performanceMetrics.lastFrameTime = Date.now();
    }
    
    /**
     * 更新性能指标
     * @param {number} timestamp - 时间戳
     */
    updatePerformanceMetrics(timestamp) {
        this.performanceMetrics.frameCount++;
        
        const now = Date.now();
        const deltaTime = now - this.performanceMetrics.lastFrameTime;
        
        if (deltaTime > 0) {
            const fps = 1000 / deltaTime;
            this.performanceMetrics.averageFPS = 
                (this.performanceMetrics.averageFPS * 0.9) + (fps * 0.1);
        }
        
        this.performanceMetrics.lastFrameTime = now;
        this.performanceMetrics.memoryUsage = this.getCurrentMemoryUsage();
    }
    
    /**
     * 获取当前内存使用量
     * @returns {number} 内存使用量（字节）
     */
    getCurrentMemoryUsage() {
        if ('memory' in performance) {
            return performance.memory.usedJSHeapSize;
        }
        return 0;
    }
    
    /**
     * 开始内存监控
     */
    startMemoryMonitoring() {
        this.memoryMonitorInterval = this.setInterval(() => {
            const memoryUsage = this.getCurrentMemoryUsage();
            const memoryLimit = performance.memory.jsHeapSizeLimit;
            
            // 内存使用率超过80%时发出警告
            if (memoryUsage / memoryLimit > 0.8) {
                console.warn(`⚠️ 游戏 ${this.gameId} 内存使用率过高: ${Math.round(memoryUsage / memoryLimit * 100)}%`);
                this.triggerStateCallback('memory_warning', { usage: memoryUsage, limit: memoryLimit });
            }
        }, 5000);
    }
    
    /**
     * 移除页面事件监听器
     */
    removePageEventListeners() {
        // 这里应该移除在bindPageLifecycleEvents中添加的监听器
        // 实际实现中需要保存监听器引用
    }
    
    /**
     * 处理错误
     * @param {string} message - 错误消息
     * @param {Error} error - 错误对象
     */
    handleError(message, error) {
        console.error(`❌ 游戏生命周期错误 [${this.gameId}]: ${message}`, error);
        
        // 如果有错误处理器，调用它
        if (window.gameErrorHandler) {
            window.gameErrorHandler.handleError({
                type: 'lifecycle',
                message: `${message}: ${error.message}`,
                error: error,
                context: {
                    gameId: this.gameId,
                    state: this.state,
                    stateHistory: this.stateHistory.slice(-5)
                }
            });
        }
    }
    
    /**
     * 获取游戏状态信息
     * @returns {Object} 状态信息
     */
    getStatus() {
        return {
            gameId: this.gameId,
            state: this.state,
            stateHistory: [...this.stateHistory],
            performanceMetrics: { ...this.performanceMetrics },
            resourceCount: this.resources.size,
            timerCount: this.timers.size + this.intervals.size,
            eventListenerCount: Array.from(this.eventListeners.values())
                .reduce((total, listeners) => total + listeners.length, 0),
            animationFrameCount: this.animationFrames.size
        };
    }
}

// 导出游戏生命周期管理类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameLifecycle;
} else {
    window.GameLifecycle = GameLifecycle;
}
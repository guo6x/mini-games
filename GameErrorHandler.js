/**
 * 游戏库统一错误处理机制
 * 提供错误捕获、日志记录、用户友好提示和错误恢复功能
 */

class GameErrorHandler {
    constructor(gameId) {
        this.gameId = gameId;
        this.errorLog = [];
        this.maxLogSize = 100;
        this.isEnabled = true;
        this.errorCallbacks = new Map();
        this.criticalErrors = new Set(['ReferenceError', 'TypeError', 'SyntaxError']);
        
        // 存储绑定的事件监听器引用，用于移除
        this._boundErrorHandler = null;
        this._boundRejectionHandler = null;
        this._boundResourceHandler = null;
        
        // 绑定全局错误处理
        this.bindGlobalHandlers();
    }
    
    /**
     * 注册错误回调函数
     * @param {string} type - 错误类型
     * @param {Function} callback - 回调函数
     */
    registerCallback(type, callback) {
        if (!this.errorCallbacks.has(type)) {
            this.errorCallbacks.set(type, []);
        }
        this.errorCallbacks.get(type).push(callback);
    }
    
    /**
     * 绑定全局错误处理器
     */
    bindGlobalHandlers() {
        // JavaScript错误处理
        this._boundErrorHandler = (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                stack: event.error?.stack
            });
        };
        window.addEventListener('error', this._boundErrorHandler);
        
        // Promise未捕获错误处理
        this._boundRejectionHandler = (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || '未处理的Promise拒绝',
                error: event.reason,
                stack: event.reason?.stack
            });
        };
        window.addEventListener('unhandledrejection', this._boundRejectionHandler);
        
        // 资源加载错误处理
        this._boundResourceHandler = (event) => {
            if (event.target !== window) {
                this.handleError({
                    type: 'resource',
                    message: `资源加载失败: ${event.target.src || event.target.href}`,
                    element: event.target.tagName,
                    source: event.target.src || event.target.href
                });
            }
        };
        window.addEventListener('error', this._boundResourceHandler, true);
    }
    
    /**
     * 处理错误
     * @param {Object} errorInfo - 错误信息对象
     */
    handleError(errorInfo) {
        if (!this.isEnabled) return;
        
        // 创建标准化错误对象
        const standardError = this.standardizeError(errorInfo);
        
        // 记录错误日志
        this.logError(standardError);
        
        // 判断错误严重程度
        const severity = this.assessSeverity(standardError);
        
        // 执行错误处理策略
        this.executeErrorStrategy(standardError, severity);
        
        // 触发错误回调
        this.triggerErrorCallbacks(standardError, severity);
        
        // 尝试错误恢复
        if (severity === 'critical') {
            this.attemptRecovery(standardError);
        }
    }
    
    /**
     * 标准化错误对象
     * @param {Object} errorInfo - 原始错误信息
     * @returns {Object} 标准化错误对象
     */
    standardizeError(errorInfo) {
        return {
            id: this.generateErrorId(),
            gameId: this.gameId,
            timestamp: new Date().toISOString(),
            type: errorInfo.type || 'unknown',
            message: errorInfo.message || '未知错误',
            stack: errorInfo.stack || '',
            filename: errorInfo.filename || '',
            lineno: errorInfo.lineno || 0,
            colno: errorInfo.colno || 0,
            userAgent: navigator.userAgent,
            url: window.location.href,
            gameState: this.captureGameState(),
            context: errorInfo.context || {}
        };
    }
    
    /**
     * 生成错误ID
     * @returns {string} 唯一错误ID
     */
    generateErrorId() {
        return `${this.gameId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 捕获游戏状态
     * @returns {Object} 游戏状态快照
     */
    captureGameState() {
        try {
            return {
                url: window.location.href,
                timestamp: Date.now(),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                memory: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                } : null
            };
        } catch (e) {
            return { error: '无法捕获游戏状态' };
        }
    }
    
    /**
     * 记录错误日志
     * @param {Object} error - 标准化错误对象
     */
    logError(error) {
        // 添加到内存日志
        this.errorLog.push(error);
        
        // 限制日志大小
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }
        
        // 保存到本地存储
        this.saveErrorToStorage(error);
        
        // 控制台输出（开发模式）
        if (this.isDevelopmentMode()) {
            console.group(`🚨 游戏错误 [${error.gameId}]`);
            console.error('错误信息:', error.message);
            console.error('错误类型:', error.type);
            console.error('错误堆栈:', error.stack);
            console.error('完整错误对象:', error);
            console.groupEnd();
        }
    }
    
    /**
     * 评估错误严重程度
     * @param {Object} error - 错误对象
     * @returns {string} 严重程度 (low|medium|high|critical)
     */
    assessSeverity(error) {
        // 关键错误类型
        if (this.criticalErrors.has(error.type)) {
            return 'critical';
        }
        
        // 资源加载错误
        if (error.type === 'resource') {
            return 'medium';
        }
        
        // Promise错误
        if (error.type === 'promise') {
            return 'high';
        }
        
        // 根据错误消息判断
        const criticalKeywords = ['cannot read', 'is not defined', 'is not a function'];
        if (criticalKeywords.some(keyword => error.message.toLowerCase().includes(keyword))) {
            return 'high';
        }
        
        return 'low';
    }
    
    /**
     * 执行错误处理策略
     * @param {Object} error - 错误对象
     * @param {string} severity - 严重程度
     */
    executeErrorStrategy(error, severity) {
        switch (severity) {
            case 'critical':
                this.showCriticalErrorDialog(error);
                this.pauseGame();
                break;
            case 'high':
                this.showErrorNotification(error, 'error');
                break;
            case 'medium':
                this.showErrorNotification(error, 'warning');
                break;
            case 'low':
                // 静默记录，不打扰用户
                break;
        }
    }
    
    /**
     * 显示关键错误对话框
     * @param {Object} error - 错误对象
     */
    showCriticalErrorDialog(error) {
        const dialog = document.createElement('div');
        dialog.className = 'error-dialog critical';
        dialog.innerHTML = `
            <div class="error-dialog-content">
                <h3>🚨 游戏遇到严重错误</h3>
                <p>游戏运行时遇到了严重错误，已自动暂停。</p>
                <details>
                    <summary>错误详情</summary>
                    <pre>${error.message}</pre>
                </details>
                <div class="error-dialog-actions">
                    <button onclick="this.closest('.error-dialog').remove(); window.gameErrorHandler?.restartGame();">重新开始</button>
                    <button onclick="this.closest('.error-dialog').remove();">关闭</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 5秒后自动关闭
        setTimeout(() => {
            if (dialog.parentNode) {
                dialog.remove();
            }
        }, 5000);
    }
    
    /**
     * 显示错误通知
     * @param {Object} error - 错误对象
     * @param {string} type - 通知类型
     */
    showErrorNotification(error, type = 'error') {
        const notification = document.createElement('div');
        notification.className = `error-notification ${type}`;
        notification.innerHTML = `
            <div class="error-notification-content">
                <span class="error-icon">${type === 'error' ? '❌' : '⚠️'}</span>
                <span class="error-message">${this.getUserFriendlyMessage(error)}</span>
                <button class="error-close" onclick="this.parentNode.parentNode.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 3秒后自动关闭
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    /**
     * 获取用户友好的错误消息
     * @param {Object} error - 错误对象
     * @returns {string} 用户友好消息
     */
    getUserFriendlyMessage(error) {
        const friendlyMessages = {
            'resource': '资源加载失败，请检查网络连接',
            'javascript': '游戏运行出现问题，正在尝试恢复',
            'promise': '操作执行失败，请重试',
            'network': '网络连接异常，请检查网络设置'
        };
        
        return friendlyMessages[error.type] || '游戏运行出现异常';
    }
    
    /**
     * 注册错误回调
     * @param {string} errorType - 错误类型
     * @param {Function} callback - 回调函数
     */
    onError(errorType, callback) {
        if (!this.errorCallbacks.has(errorType)) {
            this.errorCallbacks.set(errorType, []);
        }
        this.errorCallbacks.get(errorType).push(callback);
    }
    
    /**
     * 触发错误回调
     * @param {Object} error - 错误对象
     * @param {string} severity - 严重程度
     */
    triggerErrorCallbacks(error, severity) {
        const callbacks = this.errorCallbacks.get(error.type) || [];
        callbacks.forEach(callback => {
            try {
                callback(error, severity);
            } catch (e) {
                console.error('错误回调执行失败:', e);
            }
        });
    }
    
    /**
     * 尝试错误恢复
     * @param {Object} error - 错误对象
     */
    attemptRecovery(error) {
        try {
            // 清理可能的内存泄漏
            this.cleanupResources();
            
            // 重置游戏状态
            if (window.gameInstance && typeof window.gameInstance.reset === 'function') {
                window.gameInstance.reset();
            }
        } catch (e) {
            console.error('错误恢复失败:', e);
        }
    }
    
    /**
     * 清理资源
     */
    cleanupResources() {
        // 清理定时器 - 注意：JavaScript没有直接获取所有定时器的API
        // 此方法保留是为了向后兼容，主要通过MemoryLeakFix等工具管理
        console.warn('GameErrorHandler.cleanupResources 被调用，但不建议使用此方法清理定时器');
    }
    
    /**
     * 销毁错误处理器，清理所有资源
     */
    destroy() {
        this.disable();
        
        // 移除事件监听器
        if (this._boundErrorHandler) {
            window.removeEventListener('error', this._boundErrorHandler);
            this._boundErrorHandler = null;
        }
        
        if (this._boundRejectionHandler) {
            window.removeEventListener('unhandledrejection', this._boundRejectionHandler);
            this._boundRejectionHandler = null;
        }
        
        if (this._boundResourceHandler) {
            window.removeEventListener('error', this._boundResourceHandler, true);
            this._boundResourceHandler = null;
        }
        
        // 清空回调和日志
        this.errorCallbacks.clear();
        this.errorLog = [];
        
        console.log(`GameErrorHandler for ${this.gameId} has been destroyed`);
    }
    
    /**
     * 暂停游戏
     */
    pauseGame() {
        if (window.gameInstance && typeof window.gameInstance.pause === 'function') {
            window.gameInstance.pause();
        }
    }
    
    /**
     * 重启游戏
     */
    restartGame() {
        if (window.gameInstance && typeof window.gameInstance.restart === 'function') {
            window.gameInstance.restart();
        } else if (window.location) {
            window.location.reload();
        }
    }
    
    /**
     * 保存错误到本地存储
     * @param {Object} error - 错误对象
     */
    saveErrorToStorage(error) {
        try {
            const storageKey = `game_errors_${this.gameId}`;
            const existingErrors = JSON.parse(localStorage.getItem(storageKey) || '[]');
            
            existingErrors.push(error);
            
            // 只保留最近50个错误
            if (existingErrors.length > 50) {
                existingErrors.splice(0, existingErrors.length - 50);
            }
            
            localStorage.setItem(storageKey, JSON.stringify(existingErrors));
        } catch (e) {
            console.error('保存错误日志失败:', e);
        }
    }
    
    /**
     * 获取错误日志
     * @returns {Array} 错误日志数组
     */
    getErrorLog() {
        return [...this.errorLog];
    }
    
    /**
     * 清除错误日志
     */
    clearErrorLog() {
        this.errorLog = [];
        localStorage.removeItem(`game_errors_${this.gameId}`);
    }
    
    /**
     * 检查是否为开发模式
     * @returns {boolean} 是否为开发模式
     */
    isDevelopmentMode() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.protocol === 'file:';
    }
    
    /**
     * 启用错误处理
     */
    enable() {
        this.isEnabled = true;
    }
    
    /**
     * 禁用错误处理
     */
    disable() {
        this.isEnabled = false;
    }
    
    // 静态方法 - 兼容两种API风格
    /**
     * 静态方法：处理错误
     * @param {Object} errorInfo - 错误信息
     * @param {string} gameId - 游戏ID
     */
    static handleError(errorInfo, gameId) {
        if (!window.gameErrorHandler) {
            window.gameErrorHandler = new GameErrorHandler(gameId || 'global');
        }
        
        window.gameErrorHandler.handleError(errorInfo);
    }
    
    /**
     * 静态方法：注册错误回调
     * @param {string} gameId - 游戏ID
     * @param {Function} callback - 回调函数
     */
    static registerCallback(typeOrId, callback) {
        if (!window.gameErrorHandler) {
            window.gameErrorHandler = new GameErrorHandler('global');
        }
        
        // 如果第一个参数是游戏ID，第二个参数是回调，说明是game-error-handler风格
        if (typeof callback === 'function') {
            window.gameErrorHandler.registerErrorCallback(typeOrId, callback);
        } else {
            // 否则是我们的标准风格
            window.gameErrorHandler.registerCallback(typeOrId, callback);
        }
    }
    
    /**
     * 注册错误回调，兼容game-error-handler风格
     */
    registerErrorCallback(gameId, callback) {
        if (!this.errorCallbacks.has(gameId)) {
            this.errorCallbacks.set(gameId, []);
        }
        this.errorCallbacks.get(gameId).push(callback);
    }
}

// 导出错误处理器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameErrorHandler;
} else {
    window.GameErrorHandler = GameErrorHandler;
}
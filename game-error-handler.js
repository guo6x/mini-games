/**
 * 游戏统一错误处理机制
 * 提供全局错误捕获、错误分类、错误恢复和用户友好的错误提示
 */
class GameErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.errorCallbacks = new Map();
        this.isInitialized = false;
        
        // 错误类型定义
        this.ERROR_TYPES = {
            MEMORY_LEAK: 'memory_leak',
            RENDER_ERROR: 'render_error',
            GAME_LOGIC: 'game_logic',
            NETWORK_ERROR: 'network_error',
            STORAGE_ERROR: 'storage_error',
            UNKNOWN: 'unknown'
        };
        
        // 错误严重程度
        this.ERROR_SEVERITY = {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
            CRITICAL: 'critical'
        };
        
        this.init();
    }
    
    /**
     * 初始化错误处理器
     */
    init() {
        if (this.isInitialized) return;
        
        // 捕获全局JavaScript错误
        window.addEventListener('error', (event) => {
            this.handleError({
                type: this.ERROR_TYPES.UNKNOWN,
                severity: this.ERROR_SEVERITY.HIGH,
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                timestamp: Date.now()
            });
        });
        
        // 捕获Promise未处理的rejection
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: this.ERROR_TYPES.UNKNOWN,
                severity: this.ERROR_SEVERITY.MEDIUM,
                message: 'Unhandled Promise Rejection: ' + event.reason,
                error: event.reason,
                timestamp: Date.now()
            });
        });
        
        this.isInitialized = true;
        console.log('游戏错误处理器已初始化');
    }
    
    /**
     * 处理错误
     * @param {Object} errorInfo - 错误信息对象
     */
    handleError(errorInfo) {
        // 标准化错误信息
        const standardError = this.standardizeError(errorInfo);
        
        // 记录错误
        this.logError(standardError);
        
        // 根据错误类型和严重程度决定处理策略
        this.processError(standardError);
        
        // 触发错误回调
        this.triggerErrorCallbacks(standardError);
        
        // 尝试错误恢复
        this.attemptRecovery(standardError);
    }
    
    /**
     * 标准化错误信息
     * @param {Object} errorInfo - 原始错误信息
     * @returns {Object} 标准化后的错误信息
     */
    standardizeError(errorInfo) {
        const error = {
            id: this.generateErrorId(),
            type: errorInfo.type || this.ERROR_TYPES.UNKNOWN,
            severity: errorInfo.severity || this.ERROR_SEVERITY.MEDIUM,
            message: errorInfo.message || '未知错误',
            gameId: errorInfo.gameId || 'unknown',
            timestamp: errorInfo.timestamp || Date.now(),
            stack: errorInfo.error?.stack || errorInfo.stack || null,
            context: errorInfo.context || {},
            recovered: false
        };
        
        // 根据错误信息自动分类
        if (!errorInfo.type) {
            error.type = this.classifyError(error);
        }
        
        return error;
    }
    
    /**
     * 自动分类错误
     * @param {Object} error - 错误对象
     * @returns {string} 错误类型
     */
    classifyError(error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('memory') || message.includes('leak')) {
            return this.ERROR_TYPES.MEMORY_LEAK;
        }
        
        if (message.includes('render') || message.includes('canvas') || message.includes('draw')) {
            return this.ERROR_TYPES.RENDER_ERROR;
        }
        
        if (message.includes('network') || message.includes('fetch') || message.includes('xhr')) {
            return this.ERROR_TYPES.NETWORK_ERROR;
        }
        
        if (message.includes('storage') || message.includes('localstorage') || message.includes('sessionstorage')) {
            return this.ERROR_TYPES.STORAGE_ERROR;
        }
        
        return this.ERROR_TYPES.UNKNOWN;
    }
    
    /**
     * 记录错误
     * @param {Object} error - 错误对象
     */
    logError(error) {
        // 添加到错误日志
        this.errorLog.push(error);
        
        // 限制日志大小
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }
        
        // 控制台输出
        const logMethod = this.getLogMethod(error.severity);
        logMethod(`[${error.gameId}] ${error.type}: ${error.message}`, error);
        
        // 持久化存储（可选）
        this.persistError(error);
    }
    
    /**
     * 根据严重程度获取日志方法
     * @param {string} severity - 错误严重程度
     * @returns {Function} 日志方法
     */
    getLogMethod(severity) {
        switch (severity) {
            case this.ERROR_SEVERITY.LOW:
                return console.info;
            case this.ERROR_SEVERITY.MEDIUM:
                return console.warn;
            case this.ERROR_SEVERITY.HIGH:
            case this.ERROR_SEVERITY.CRITICAL:
                return console.error;
            default:
                return console.log;
        }
    }
    
    /**
     * 处理错误
     * @param {Object} error - 错误对象
     */
    processError(error) {
        switch (error.severity) {
            case this.ERROR_SEVERITY.CRITICAL:
                this.handleCriticalError(error);
                break;
            case this.ERROR_SEVERITY.HIGH:
                this.handleHighSeverityError(error);
                break;
            case this.ERROR_SEVERITY.MEDIUM:
                this.handleMediumSeverityError(error);
                break;
            case this.ERROR_SEVERITY.LOW:
                this.handleLowSeverityError(error);
                break;
        }
    }
    
    /**
     * 处理严重错误
     * @param {Object} error - 错误对象
     */
    handleCriticalError(error) {
        // 显示错误提示
        this.showErrorNotification({
            title: '严重错误',
            message: '游戏遇到严重错误，建议刷新页面',
            type: 'error',
            persistent: true
        });
        
        // 尝试保存游戏状态
        this.saveGameState(error.gameId);
    }
    
    /**
     * 处理高严重程度错误
     * @param {Object} error - 错误对象
     */
    handleHighSeverityError(error) {
        this.showErrorNotification({
            title: '游戏错误',
            message: '游戏出现错误，正在尝试恢复',
            type: 'warning',
            duration: 5000
        });
    }
    
    /**
     * 处理中等严重程度错误
     * @param {Object} error - 错误对象
     */
    handleMediumSeverityError(error) {
        // 静默处理，仅记录日志
    }
    
    /**
     * 处理低严重程度错误
     * @param {Object} error - 错误对象
     */
    handleLowSeverityError(error) {
        // 静默处理
    }
    
    /**
     * 显示错误通知
     * @param {Object} options - 通知选项
     */
    showErrorNotification(options) {
        const notification = document.createElement('div');
        notification.className = `error-notification ${options.type}`;
        notification.innerHTML = `
            <div class="error-notification-content">
                <h4>${options.title}</h4>
                <p>${options.message}</p>
                <button class="error-notification-close">×</button>
            </div>
        `;
        
        // 添加样式
        if (!document.getElementById('error-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'error-notification-styles';
            styles.textContent = `
                .error-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    max-width: 400px;
                    padding: 15px;
                    border-radius: 5px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    font-family: Arial, sans-serif;
                }
                .error-notification.error {
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                }
                .error-notification.warning {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                }
                .error-notification-content h4 {
                    margin: 0 0 8px 0;
                    font-size: 16px;
                }
                .error-notification-content p {
                    margin: 0;
                    font-size: 14px;
                }
                .error-notification-close {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: inherit;
                }
            `;
            document.head.appendChild(styles);
        }
        
        // 确保DOM加载完成后再添加通知
        if (document.body) {
            document.body.appendChild(notification);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(notification);
            });
        }
        
        // 绑定关闭事件
        const closeBtn = notification.querySelector('.error-notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // 自动关闭
        if (!options.persistent && options.duration) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, options.duration);
        }
    }
    
    /**
     * 尝试错误恢复
     * @param {Object} error - 错误对象
     */
    attemptRecovery(error) {
        switch (error.type) {
            case this.ERROR_TYPES.MEMORY_LEAK:
                this.recoverFromMemoryLeak(error);
                break;
            case this.ERROR_TYPES.RENDER_ERROR:
                this.recoverFromRenderError(error);
                break;
            case this.ERROR_TYPES.STORAGE_ERROR:
                this.recoverFromStorageError(error);
                break;
        }
    }
    
    /**
     * 从内存泄漏中恢复
     * @param {Object} error - 错误对象
     */
    recoverFromMemoryLeak(error) {
        // 尝试清理内存
        if (window.gc && typeof window.gc === 'function') {
            try {
                window.gc();
                error.recovered = true;
            } catch (e) {
                console.warn('无法执行垃圾回收');
            }
        }
    }
    
    /**
     * 从渲染错误中恢复
     * @param {Object} error - 错误对象
     */
    recoverFromRenderError(error) {
        // 尝试重新初始化渲染上下文
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            try {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    error.recovered = true;
                }
            } catch (e) {
                console.warn('无法重置canvas上下文');
            }
        });
    }
    
    /**
     * 从存储错误中恢复
     * @param {Object} error - 错误对象
     */
    recoverFromStorageError(error) {
        // 尝试清理损坏的存储数据
        try {
            localStorage.removeItem('corrupted_data');
            error.recovered = true;
        } catch (e) {
            console.warn('无法清理存储数据');
        }
    }
    
    /**
     * 注册错误回调
     * @param {string} gameId - 游戏ID
     * @param {Function} callback - 回调函数
     */
    registerErrorCallback(gameId, callback) {
        if (!this.errorCallbacks.has(gameId)) {
            this.errorCallbacks.set(gameId, []);
        }
        this.errorCallbacks.get(gameId).push(callback);
    }
    
    /**
     * 触发错误回调
     * @param {Object} error - 错误对象
     */
    triggerErrorCallbacks(error) {
        const callbacks = this.errorCallbacks.get(error.gameId) || [];
        callbacks.forEach(callback => {
            try {
                callback(error);
            } catch (e) {
                console.error('错误回调执行失败:', e);
            }
        });
    }
    
    /**
     * 持久化错误
     * @param {Object} error - 错误对象
     */
    persistError(error) {
        try {
            const errorHistory = JSON.parse(localStorage.getItem('game_error_history') || '[]');
            errorHistory.push({
                id: error.id,
                type: error.type,
                severity: error.severity,
                message: error.message,
                gameId: error.gameId,
                timestamp: error.timestamp
            });
            
            // 限制历史记录大小
            if (errorHistory.length > 50) {
                errorHistory.splice(0, errorHistory.length - 50);
            }
            
            localStorage.setItem('game_error_history', JSON.stringify(errorHistory));
        } catch (e) {
            console.warn('无法保存错误历史:', e);
        }
    }
    
    /**
     * 保存游戏状态
     * @param {string} gameId - 游戏ID
     */
    saveGameState(gameId) {
        try {
            // 触发游戏状态保存事件
            window.dispatchEvent(new CustomEvent('saveGameState', {
                detail: { gameId, reason: 'error_recovery' }
            }));
        } catch (e) {
            console.warn('无法保存游戏状态:', e);
        }
    }
    
    /**
     * 生成错误ID
     * @returns {string} 错误ID
     */
    generateErrorId() {
        return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 获取错误统计
     * @returns {Object} 错误统计信息
     */
    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            byType: {},
            bySeverity: {},
            byGame: {},
            recentErrors: this.errorLog.slice(-10)
        };
        
        this.errorLog.forEach(error => {
            // 按类型统计
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            
            // 按严重程度统计
            stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
            
            // 按游戏统计
            stats.byGame[error.gameId] = (stats.byGame[error.gameId] || 0) + 1;
        });
        
        return stats;
    }
    
    /**
     * 清理错误日志
     */
    clearErrorLog() {
        this.errorLog = [];
        localStorage.removeItem('game_error_history');
    }
    
    /**
     * 静态方法：处理错误
     * @param {Object} errorInfo - 错误信息
     * @param {string} gameId - 游戏ID
     */
    static handleError(errorInfo, gameId) {
        if (!window.gameErrorHandler) {
            window.gameErrorHandler = new GameErrorHandler();
        }
        
        window.gameErrorHandler.handleError({
            ...errorInfo,
            gameId: gameId
        });
    }
    
    /**
     * 静态方法：注册错误回调
     * @param {string} gameId - 游戏ID
     * @param {Function} callback - 回调函数
     */
    static registerCallback(gameId, callback) {
        if (!window.gameErrorHandler) {
            window.gameErrorHandler = new GameErrorHandler();
        }
        
        window.gameErrorHandler.registerErrorCallback(gameId, callback);
    }
}

// 全局实例
if (typeof window !== 'undefined') {
    // 延迟初始化，确保所有脚本都加载完成
    window.initGameErrorHandler = function() {
        if (!window.gameErrorHandler) {
            window.gameErrorHandler = new GameErrorHandler();
            console.log('Game Error Handler initialized');
        }
        return window.gameErrorHandler;
    };
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameErrorHandler;
}

console.log('游戏错误处理器已加载');
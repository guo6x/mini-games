/**
 * 内存泄漏修复工具
 * 用于修复游戏中的定时器和事件监听器泄漏问题
 */

class MemoryLeakFix {
    constructor() {
        this.timers = new Set();
        this.intervals = new Set();
        this.eventListeners = new Map();
        this.animationFrames = new Set();
        this.observers = new Set();
        this.isDestroyed = false;
    }
    
    /**
     * 安全的setTimeout包装
     * @param {Function} callback - 回调函数
     * @param {number} delay - 延迟时间
     * @returns {number} 定时器ID
     */
    setTimeout(callback, delay) {
        if (this.isDestroyed) return null;
        
        const timerId = setTimeout(() => {
            this.timers.delete(timerId);
            if (!this.isDestroyed) {
                callback();
            }
        }, delay);
        
        this.timers.add(timerId);
        return timerId;
    }
    
    /**
     * 安全的setInterval包装
     * @param {Function} callback - 回调函数
     * @param {number} delay - 间隔时间
     * @returns {number} 定时器ID
     */
    setInterval(callback, delay) {
        if (this.isDestroyed) return null;
        
        const intervalId = setInterval(() => {
            if (!this.isDestroyed) {
                callback();
            } else {
                this.clearInterval(intervalId);
            }
        }, delay);
        
        this.intervals.add(intervalId);
        return intervalId;
    }
    
    /**
     * 安全的requestAnimationFrame包装
     * @param {Function} callback - 回调函数
     * @returns {number} 动画帧ID
     */
    requestAnimationFrame(callback) {
        if (this.isDestroyed) return null;
        
        const frameId = requestAnimationFrame(() => {
            this.animationFrames.delete(frameId);
            if (!this.isDestroyed) {
                callback();
            }
        });
        
        this.animationFrames.add(frameId);
        return frameId;
    }
    
    /**
     * 清除setTimeout
     * @param {number} timerId - 定时器ID
     */
    clearTimeout(timerId) {
        if (timerId) {
            clearTimeout(timerId);
            this.timers.delete(timerId);
        }
    }
    
    /**
     * 清除setInterval
     * @param {number} intervalId - 定时器ID
     */
    clearInterval(intervalId) {
        if (intervalId) {
            clearInterval(intervalId);
            this.intervals.delete(intervalId);
        }
    }
    
    /**
     * 清除requestAnimationFrame
     * @param {number} frameId - 动画帧ID
     */
    cancelAnimationFrame(frameId) {
        if (frameId) {
            cancelAnimationFrame(frameId);
            this.animationFrames.delete(frameId);
        }
    }
    
    /**
     * 添加事件监听器
     * @param {Element} element - DOM元素
     * @param {string} event - 事件类型
     * @param {Function} handler - 事件处理函数
     * @param {Object} options - 选项
     */
    addEventListener(element, event, handler, options = false) {
        if (this.isDestroyed) return;
        
        element.addEventListener(event, handler, options);
        
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, []);
        }
        
        this.eventListeners.get(element).push({
            event,
            handler,
            options
        });
    }
    
    /**
     * 移除事件监听器
     * @param {Element} element - DOM元素
     * @param {string} event - 事件类型
     * @param {Function} handler - 事件处理函数
     * @param {Object} options - 选项
     */
    removeEventListener(element, event, handler, options = false) {
        element.removeEventListener(event, handler, options);
        
        if (this.eventListeners.has(element)) {
            const listeners = this.eventListeners.get(element);
            const index = listeners.findIndex(listener => 
                listener.event === event && 
                listener.handler === handler &&
                listener.options === options
            );
            
            if (index !== -1) {
                listeners.splice(index, 1);
            }
            
            if (listeners.length === 0) {
                this.eventListeners.delete(element);
            }
        }
    }
    
    /**
     * 添加观察者（如IntersectionObserver、MutationObserver等）
     * @param {Object} observer - 观察者对象
     */
    addObserver(observer) {
        if (this.isDestroyed) return;
        this.observers.add(observer);
    }
    
    /**
     * 移除观察者
     * @param {Object} observer - 观察者对象
     */
    removeObserver(observer) {
        if (observer && typeof observer.disconnect === 'function') {
            observer.disconnect();
        }
        this.observers.delete(observer);
    }
    
    /**
     * 清理所有资源
     */
    cleanup() {
        if (this.isDestroyed) return;
        
        // 清理定时器
        this.timers.forEach(timerId => clearTimeout(timerId));
        this.timers.clear();
        
        // 清理间隔器
        this.intervals.forEach(intervalId => clearInterval(intervalId));
        this.intervals.clear();
        
        // 清理动画帧
        this.animationFrames.forEach(frameId => cancelAnimationFrame(frameId));
        this.animationFrames.clear();
        
        // 清理事件监听器
        this.eventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
        });
        this.eventListeners.clear();
        
        // 清理观察者
        this.observers.forEach(observer => {
            if (observer && typeof observer.disconnect === 'function') {
                observer.disconnect();
            }
        });
        this.observers.clear();
        
        this.isDestroyed = true;
    }
    
    /**
     * 获取当前资源使用情况
     * @returns {Object} 资源统计
     */
    getResourceStats() {
        return {
            timers: this.timers.size,
            intervals: this.intervals.size,
            animationFrames: this.animationFrames.size,
            eventListeners: Array.from(this.eventListeners.values())
                .reduce((total, listeners) => total + listeners.length, 0),
            observers: this.observers.size,
            isDestroyed: this.isDestroyed
        };
    }
    
    /**
     * 检查是否有潜在的内存泄漏
     * @returns {Object} 检查结果
     */
    checkMemoryLeaks() {
        const stats = this.getResourceStats();
        const warnings = [];
        
        if (stats.timers > 10) {
            warnings.push(`定时器数量过多: ${stats.timers}`);
        }
        
        if (stats.intervals > 5) {
            warnings.push(`间隔器数量过多: ${stats.intervals}`);
        }
        
        if (stats.eventListeners > 50) {
            warnings.push(`事件监听器数量过多: ${stats.eventListeners}`);
        }
        
        if (stats.animationFrames > 20) {
            warnings.push(`动画帧数量过多: ${stats.animationFrames}`);
        }
        
        return {
            hasLeaks: warnings.length > 0,
            warnings,
            stats
        };
    }
}

/**
 * 游戏内存管理器
 * 为每个游戏实例提供内存管理功能
 */
class GameMemoryManager {
    constructor(gameId) {
        this.gameId = gameId;
        this.memoryFix = new MemoryLeakFix();
        this.isActive = true;
        this.onError = null; // 错误处理回调函数

        // 监听页面卸载事件
        this.memoryFix.addEventListener(window, 'beforeunload', () => {
            this.cleanup();
        });

        // 监听页面隐藏事件
        this.memoryFix.addEventListener(document, 'visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }
    
    /**
     * 暂停游戏（清理定时器但保留事件监听器）
     */
    pause() {
        if (!this.isActive) return;
        
        // 清理定时器和动画帧，但保留事件监听器
        this.memoryFix.timers.forEach(timerId => clearTimeout(timerId));
        this.memoryFix.timers.clear();
        
        this.memoryFix.intervals.forEach(intervalId => clearInterval(intervalId));
        this.memoryFix.intervals.clear();
        
        this.memoryFix.animationFrames.forEach(frameId => cancelAnimationFrame(frameId));
        this.memoryFix.animationFrames.clear();
    }
    
    /**
     * 恢复游戏
     */
    resume() {
        this.isActive = true;
    }
    
    /**
     * 完全清理游戏资源
     */
    cleanup() {
        this.isActive = false;
        this.memoryFix.cleanup();
    }
    
    /**
     * 获取内存管理器实例
     * @returns {MemoryLeakFix} 内存泄漏修复实例
     */
    getMemoryFix() {
        return this.memoryFix;
    }
    
    /**
     * 检查内存使用情况
     * @returns {Object} 内存检查结果
     */
    checkMemory() {
        return this.memoryFix.checkMemoryLeaks();
    }

    /**
     * 添加事件监听器（代理到内部memoryFix实例）
     * @param {Element} element - DOM元素
     * @param {string} event - 事件类型
     * @param {Function} handler - 事件处理函数
     * @param {Object|boolean} options - 事件选项
     */
    addEventListener(element, event, handler, options = false) {
        return this.memoryFix.addEventListener(element, event, handler, options);
    }

    /**
     * 移除事件监听器（代理到内部memoryFix实例）
     * @param {Element} element - DOM元素
     * @param {string} event - 事件类型
     * @param {Function} handler - 事件处理函数
     * @param {Object|boolean} options - 事件选项
     */
    removeEventListener(element, event, handler, options = false) {
        return this.memoryFix.removeEventListener(element, event, handler, options);
    }

    /**
     * 注册错误处理回调函数
     * @param {Function} callback - 错误处理回调函数
     */
    onError(callback) {
        this.errorCallback = callback;
        // 如果内部memoryFix有onError方法，也设置它
        if (this.memoryFix && typeof this.memoryFix.onError === 'function') {
            this.memoryFix.onError(callback);
        }
    }
}

/**
 * 全局内存管理器
 */
class GlobalMemoryManager {
    constructor() {
        this.gameManagers = new Map();
        this.monitoringInterval = null;
        this.startMonitoring();
    }
    
    /**
     * 为游戏创建内存管理器
     * @param {string} gameId - 游戏ID
     * @returns {GameMemoryManager} 游戏内存管理器
     */
    createGameManager(gameId) {
        if (this.gameManagers.has(gameId)) {
            this.gameManagers.get(gameId).cleanup();
        }
        
        const manager = new GameMemoryManager(gameId);
        this.gameManagers.set(gameId, manager);
        return manager;
    }
    
    /**
     * 获取游戏内存管理器
     * @param {string} gameId - 游戏ID
     * @returns {GameMemoryManager|null} 游戏内存管理器
     */
    getGameManager(gameId) {
        return this.gameManagers.get(gameId) || null;
    }
    
    /**
     * 清理游戏内存管理器
     * @param {string} gameId - 游戏ID
     */
    cleanupGame(gameId) {
        const manager = this.gameManagers.get(gameId);
        if (manager) {
            manager.cleanup();
            this.gameManagers.delete(gameId);
        }
    }
    
    /**
     * 清理所有游戏
     */
    cleanupAll() {
        this.gameManagers.forEach((manager, gameId) => {
            manager.cleanup();
        });
        this.gameManagers.clear();
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
    
    /**
     * 开始内存监控
     */
    startMonitoring() {
        if (this.monitoringInterval) return;
        
        this.monitoringInterval = setInterval(() => {
            this.gameManagers.forEach((manager, gameId) => {
                const check = manager.checkMemory();
                if (check.hasLeaks) {
                    console.warn(`游戏 ${gameId} 检测到潜在内存泄漏:`, check.warnings);
                    
                    // 如果有错误处理器，通知它
                    if (window.GameErrorHandler) {
                        window.GameErrorHandler.handleError(
                            new Error(`内存泄漏警告: ${check.warnings.join(', ')}`),
                            'warning',
                            { gameId, stats: check.stats }
                        );
                    }
                }
            });
        }, 30000); // 每30秒检查一次
    }
    
    /**
     * 停止内存监控
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
    
    /**
     * 获取全局内存统计
     * @returns {Object} 全局内存统计
     */
    getGlobalStats() {
        const stats = {
            totalGames: this.gameManagers.size,
            totalTimers: 0,
            totalIntervals: 0,
            totalEventListeners: 0,
            totalAnimationFrames: 0,
            totalObservers: 0,
            gameStats: {}
        };
        
        this.gameManagers.forEach((manager, gameId) => {
            const gameStats = manager.checkMemory().stats;
            stats.gameStats[gameId] = gameStats;
            stats.totalTimers += gameStats.timers;
            stats.totalIntervals += gameStats.intervals;
            stats.totalEventListeners += gameStats.eventListeners;
            stats.totalAnimationFrames += gameStats.animationFrames;
            stats.totalObservers += gameStats.observers;
        });
        
        return stats;
    }
}

// 创建全局实例
const globalMemoryManager = new GlobalMemoryManager();

// 页面卸载时清理所有资源
window.addEventListener('beforeunload', () => {
    globalMemoryManager.cleanupAll();
});

// 导出类和实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MemoryLeakFix,
        GameMemoryManager,
        GlobalMemoryManager,
        globalMemoryManager
    };
} else {
    window.MemoryLeakFix = MemoryLeakFix;
    window.GameMemoryManager = GameMemoryManager;
    window.GlobalMemoryManager = GlobalMemoryManager;
    window.globalMemoryManager = globalMemoryManager;
}
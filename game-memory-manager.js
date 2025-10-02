/**
 * 游戏内存管理器
 * 提供统一的内存监控、垃圾回收和资源管理功能
 */
class GameMemoryManager {
    constructor(gameId, options = {}) {
        this.gameId = gameId;
        this.options = {
            monitorInterval: options.monitorInterval || 5000, // 5秒监控间隔
            memoryThreshold: options.memoryThreshold || 50, // 内存使用阈值(MB)
            autoCleanup: options.autoCleanup !== false,
            enableGC: options.enableGC !== false,
            maxCacheSize: options.maxCacheSize || 100, // 最大缓存项数
            ...options
        };
        
        // 内存监控数据
        this.memoryStats = {
            current: 0,
            peak: 0,
            average: 0,
            history: [],
            gcCount: 0,
            lastGC: null
        };
        
        // 资源缓存
        this.resourceCache = new Map();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            size: 0
        };
        
        // 监控状态
        this.isMonitoring = false;
        this.monitorTimer = null;
        
        // 绑定方法
        this.checkMemory = this.checkMemory.bind(this);
        this.handleLowMemory = this.handleLowMemory.bind(this);
        
        this.init();
    }
    
    /**
     * 初始化内存管理器
     */
    init() {
        try {
            // 检查浏览器支持
            this.checkBrowserSupport();
            
            // 设置内存监控
            if (this.options.autoCleanup) {
                this.startMonitoring();
            }
            
            // 监听页面可见性变化
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.handlePageHidden();
                } else {
                    this.handlePageVisible();
                }
            });
            
            console.log(`内存管理器已初始化: ${this.gameId}`);
        } catch (error) {
            console.error('内存管理器初始化失败:', error);
            if (window.GameErrorHandler) {
                window.GameErrorHandler.handleError('initialization', 'medium', error.message, {
                    component: 'GameMemoryManager',
                    gameId: this.gameId
                });
            }
        }
    }
    
    /**
     * 检查浏览器支持
     */
    checkBrowserSupport() {
        this.browserSupport = {
            performanceMemory: !!performance.memory,
            weakMap: typeof WeakMap !== 'undefined',
            weakSet: typeof WeakSet !== 'undefined',
            gc: typeof window.gc === 'function'
        };
        
        if (!this.browserSupport.performanceMemory) {
            console.warn('浏览器不支持 performance.memory API，内存监控功能受限');
        }
    }
    
    /**
     * 开始内存监控
     */
    startMonitoring() {
        if (this.isMonitoring) {
            return;
        }
        
        this.isMonitoring = true;
        this.monitorTimer = setInterval(this.checkMemory, this.options.monitorInterval);
        
        console.log(`开始内存监控: ${this.gameId}`);
    }
    
    /**
     * 停止内存监控
     */
    stopMonitoring() {
        if (!this.isMonitoring) {
            return;
        }
        
        this.isMonitoring = false;
        
        if (this.monitorTimer) {
            clearInterval(this.monitorTimer);
            this.monitorTimer = null;
        }
        
        console.log(`停止内存监控: ${this.gameId}`);
    }
    
    /**
     * 检查内存使用情况
     */
    checkMemory() {
        if (!this.browserSupport.performanceMemory) {
            return;
        }
        
        try {
            const memory = performance.memory;
            const currentUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
            
            // 更新统计数据
            this.memoryStats.current = currentUsage;
            this.memoryStats.peak = Math.max(this.memoryStats.peak, currentUsage);
            
            // 添加到历史记录
            this.memoryStats.history.push({
                usage: currentUsage,
                timestamp: Date.now()
            });
            
            // 限制历史记录长度
            if (this.memoryStats.history.length > 100) {
                this.memoryStats.history.shift();
            }
            
            // 计算平均值
            const sum = this.memoryStats.history.reduce((acc, item) => acc + item.usage, 0);
            this.memoryStats.average = Math.round(sum / this.memoryStats.history.length);
            
            // 检查是否需要清理
            if (currentUsage > this.options.memoryThreshold) {
                this.handleLowMemory();
            }
            
            // 触发内存更新事件
            this.dispatchEvent('memoryUpdate', {
                current: currentUsage,
                peak: this.memoryStats.peak,
                average: this.memoryStats.average
            });
            
        } catch (error) {
            console.error('检查内存失败:', error);
        }
    }
    
    /**
     * 处理内存不足情况
     */
    handleLowMemory() {
        console.warn(`内存使用过高: ${this.memoryStats.current}MB，开始清理`);
        
        // 清理缓存
        this.clearCache();
        
        // 强制垃圾回收
        if (this.options.enableGC) {
            this.forceGarbageCollection();
        }
        
        // 触发低内存事件
        this.dispatchEvent('lowMemory', {
            usage: this.memoryStats.current,
            threshold: this.options.memoryThreshold
        });
    }
    
    /**
     * 强制垃圾回收
     */
    forceGarbageCollection() {
        try {
            if (this.browserSupport.gc) {
                window.gc();
                this.memoryStats.gcCount++;
                this.memoryStats.lastGC = Date.now();
                console.log('已执行垃圾回收');
            } else {
                // 模拟垃圾回收触发
                this.simulateGarbageCollection();
            }
        } catch (error) {
            console.error('垃圾回收失败:', error);
        }
    }
    
    /**
     * 模拟垃圾回收
     */
    simulateGarbageCollection() {
        // 创建大量临时对象来触发垃圾回收
        const temp = [];
        for (let i = 0; i < 1000; i++) {
            temp.push(new Array(1000).fill(0));
        }
        temp.length = 0;
        
        this.memoryStats.gcCount++;
        this.memoryStats.lastGC = Date.now();
        console.log('已模拟垃圾回收触发');
    }
    
    /**
     * 缓存资源
     */
    cacheResource(key, resource, size = 0) {
        try {
            // 检查缓存大小限制
            if (this.resourceCache.size >= this.options.maxCacheSize) {
                this.evictOldestCache();
            }
            
            this.resourceCache.set(key, {
                resource,
                size,
                timestamp: Date.now(),
                accessCount: 0
            });
            
            this.cacheStats.size++;
            
            console.log(`资源已缓存: ${key}`);
        } catch (error) {
            console.error('缓存资源失败:', error);
        }
    }
    
    /**
     * 获取缓存资源
     */
    getCachedResource(key) {
        const cached = this.resourceCache.get(key);
        
        if (cached) {
            cached.accessCount++;
            cached.lastAccess = Date.now();
            this.cacheStats.hits++;
            return cached.resource;
        }
        
        this.cacheStats.misses++;
        return null;
    }
    
    /**
     * 移除缓存资源
     */
    removeCachedResource(key) {
        if (this.resourceCache.has(key)) {
            this.resourceCache.delete(key);
            this.cacheStats.size--;
            console.log(`缓存资源已移除: ${key}`);
        }
    }
    
    /**
     * 清理缓存
     */
    clearCache() {
        const oldSize = this.resourceCache.size;
        this.resourceCache.clear();
        this.cacheStats.size = 0;
        
        console.log(`缓存已清理，释放了 ${oldSize} 个资源`);
        
        // 触发缓存清理事件
        this.dispatchEvent('cacheCleared', {
            clearedCount: oldSize
        });
    }
    
    /**
     * 驱逐最旧的缓存
     */
    evictOldestCache() {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, cached] of this.resourceCache) {
            if (cached.timestamp < oldestTime) {
                oldestTime = cached.timestamp;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.removeCachedResource(oldestKey);
        }
    }
    
    /**
     * 处理页面隐藏
     */
    handlePageHidden() {
        // 页面隐藏时进行内存清理
        this.clearCache();
        
        if (this.options.enableGC) {
            this.forceGarbageCollection();
        }
        
        console.log('页面隐藏，已执行内存清理');
    }
    
    /**
     * 处理页面显示
     */
    handlePageVisible() {
        // 页面显示时恢复监控
        if (!this.isMonitoring && this.options.autoCleanup) {
            this.startMonitoring();
        }
        
        console.log('页面显示，已恢复内存监控');
    }
    
    /**
     * 获取内存统计信息
     */
    getMemoryStats() {
        return {
            ...this.memoryStats,
            cacheStats: { ...this.cacheStats },
            browserSupport: { ...this.browserSupport }
        };
    }
    
    /**
     * 获取缓存命中率
     */
    getCacheHitRate() {
        const total = this.cacheStats.hits + this.cacheStats.misses;
        return total > 0 ? (this.cacheStats.hits / total * 100).toFixed(2) : 0;
    }
    
    /**
     * 分发事件
     */
    dispatchEvent(eventType, detail) {
        const event = new CustomEvent(`gameMemory:${eventType}`, {
            detail: {
                gameId: this.gameId,
                ...detail
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 销毁内存管理器
     */
    destroy() {
        try {
            // 停止监控
            this.stopMonitoring();
            
            // 清理缓存
            this.clearCache();
            
            // 最后一次垃圾回收
            if (this.options.enableGC) {
                this.forceGarbageCollection();
            }
            
            console.log(`内存管理器已销毁: ${this.gameId}`);
        } catch (error) {
            console.error('销毁内存管理器失败:', error);
        }
    }
}

// 全局内存管理器注册表
class GlobalMemoryManager {
    constructor() {
        this.managers = new Map();
        this.globalStats = {
            totalManagers: 0,
            totalMemoryUsage: 0,
            totalCacheSize: 0
        };
    }
    
    /**
     * 注册内存管理器
     */
    register(gameId, manager) {
        this.managers.set(gameId, manager);
        this.globalStats.totalManagers++;
        console.log(`已注册内存管理器: ${gameId}`);
    }
    
    /**
     * 注销内存管理器
     */
    unregister(gameId) {
        const manager = this.managers.get(gameId);
        if (manager) {
            manager.destroy();
            this.managers.delete(gameId);
            this.globalStats.totalManagers--;
            console.log(`已注销内存管理器: ${gameId}`);
        }
    }
    
    /**
     * 获取内存管理器
     */
    get(gameId) {
        return this.managers.get(gameId);
    }
    
    /**
     * 获取全局内存统计
     */
    getGlobalStats() {
        let totalMemory = 0;
        let totalCache = 0;
        
        this.managers.forEach(manager => {
            const stats = manager.getMemoryStats();
            totalMemory += stats.current;
            totalCache += stats.cacheStats.size;
        });
        
        this.globalStats.totalMemoryUsage = totalMemory;
        this.globalStats.totalCacheSize = totalCache;
        
        return { ...this.globalStats };
    }
    
    /**
     * 全局内存清理
     */
    globalCleanup() {
        console.log('开始全局内存清理');
        
        this.managers.forEach(manager => {
            manager.clearCache();
            if (manager.options.enableGC) {
                manager.forceGarbageCollection();
            }
        });
        
        console.log('全局内存清理完成');
    }
    
    /**
     * 销毁所有管理器
     */
    destroyAll() {
        for (const manager of this.managers.values()) {
            manager.destroy();
        }
        this.managers.clear();
        this.globalStats.totalManagers = 0;
        console.log('所有内存管理器已销毁');
    }
}

// 创建全局实例
if (!window.GlobalMemoryManager) {
    window.GlobalMemoryManager = new GlobalMemoryManager();
}

// 页面卸载时清理所有管理器
window.addEventListener('beforeunload', () => {
    if (window.GlobalMemoryManager) {
        window.GlobalMemoryManager.destroyAll();
    }
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameMemoryManager, GlobalMemoryManager };
} else {
    window.GameMemoryManager = GameMemoryManager;
    window.GlobalMemoryManager = window.GlobalMemoryManager;
}

console.log('游戏内存管理系统已加载');
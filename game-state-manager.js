/**
 * 游戏状态管理器
 * 提供统一的游戏状态持久化和自动保存功能
 */
class GameStateManager {
    constructor(gameId, options = {}) {
        this.gameId = gameId;
        this.options = {
            autoSaveInterval: options.autoSaveInterval || 30000, // 30秒自动保存
            maxSaveSlots: options.maxSaveSlots || 5, // 最大保存槽位数
            enableCompression: options.enableCompression || false,
            enableEncryption: options.enableEncryption || false,
            storageType: options.storageType || 'localStorage', // localStorage 或 indexedDB
            ...options
        };
        
        this.currentState = null;
        this.autoSaveTimer = null;
        this.saveHistory = [];
        this.isInitialized = false;
        
        // 绑定方法
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
        
        this.init();
    }
    
    /**
     * 初始化状态管理器
     */
    init() {
        try {
            // 加载保存历史
            this.loadSaveHistory();
            
            // 设置页面可见性变化监听
            document.addEventListener('visibilitychange', this.handleVisibilityChange);
            
            // 设置页面卸载监听
            window.addEventListener('beforeunload', this.handleBeforeUnload);
            
            // 启动自动保存
            this.startAutoSave();
            
            this.isInitialized = true;
            
            console.log(`游戏状态管理器已初始化: ${this.gameId}`);
        } catch (error) {
            console.error('游戏状态管理器初始化失败:', error);
            if (window.GameErrorHandler) {
                window.GameErrorHandler.handleError('initialization', 'high', error.message, {
                    component: 'GameStateManager',
                    gameId: this.gameId
                });
            }
        }
    }
    
    /**
     * 保存游戏状态
     * @param {Object} state - 游戏状态对象
     * @param {string} slotName - 保存槽位名称（可选）
     * @param {Object} metadata - 元数据（可选）
     * @returns {Promise<boolean>} 保存是否成功
     */
    async saveState(state, slotName = 'auto', metadata = {}) {
        try {
            if (!state || typeof state !== 'object') {
                throw new Error('无效的游戏状态对象');
            }
            
            const saveData = {
                gameId: this.gameId,
                slotName,
                state: this.processStateForSave(state),
                metadata: {
                    timestamp: Date.now(),
                    version: '1.0.0',
                    gameVersion: metadata.gameVersion || '1.0.0',
                    playerLevel: metadata.playerLevel || 1,
                    playTime: metadata.playTime || 0,
                    ...metadata
                },
                checksum: this.calculateChecksum(state)
            };
            
            // 压缩数据（如果启用）
            if (this.options.enableCompression) {
                saveData.compressed = true;
                saveData.state = this.compressData(saveData.state);
            }
            
            // 加密数据（如果启用）
            if (this.options.enableEncryption) {
                saveData.encrypted = true;
                saveData.state = this.encryptData(saveData.state);
            }
            
            // 保存到存储
            const success = await this.writeToStorage(slotName, saveData);
            
            if (success) {
                this.currentState = state;
                this.updateSaveHistory(slotName, saveData.metadata);
                
                console.log(`游戏状态已保存: ${this.gameId} - ${slotName}`);
                
                // 触发保存成功事件
                this.dispatchEvent('stateSaved', { slotName, metadata: saveData.metadata });
            }
            
            return success;
        } catch (error) {
            console.error('保存游戏状态失败:', error);
            if (window.GameErrorHandler) {
                window.GameErrorHandler.handleError('save', 'high', error.message, {
                    component: 'GameStateManager',
                    gameId: this.gameId,
                    slotName
                });
            }
            return false;
        }
    }
    
    /**
     * 加载游戏状态
     * @param {string} slotName - 保存槽位名称
     * @returns {Promise<Object|null>} 游戏状态对象或null
     */
    async loadState(slotName = 'auto') {
        try {
            const saveData = await this.readFromStorage(slotName);
            
            if (!saveData) {
                console.log(`未找到保存的游戏状态: ${this.gameId} - ${slotName}`);
                return null;
            }
            
            // 验证数据完整性
            if (!this.validateSaveData(saveData)) {
                throw new Error('保存数据验证失败');
            }
            
            let state = saveData.state;
            
            // 解密数据（如果需要）
            if (saveData.encrypted) {
                state = this.decryptData(state);
            }
            
            // 解压数据（如果需要）
            if (saveData.compressed) {
                state = this.decompressData(state);
            }
            
            // 处理加载后的状态
            state = this.processStateAfterLoad(state);
            
            // 验证校验和
            if (saveData.checksum && !this.verifyChecksum(state, saveData.checksum)) {
                console.warn('游戏状态校验和不匹配，数据可能已损坏');
            }
            
            this.currentState = state;
            
            console.log(`游戏状态已加载: ${this.gameId} - ${slotName}`);
            
            // 触发加载成功事件
            this.dispatchEvent('stateLoaded', { slotName, metadata: saveData.metadata });
            
            return state;
        } catch (error) {
            console.error('加载游戏状态失败:', error);
            if (window.GameErrorHandler) {
                window.GameErrorHandler.handleError('load', 'high', error.message, {
                    component: 'GameStateManager',
                    gameId: this.gameId,
                    slotName
                });
            }
            return null;
        }
    }
    
    /**
     * 删除保存的游戏状态
     * @param {string} slotName - 保存槽位名称
     * @returns {Promise<boolean>} 删除是否成功
     */
    async deleteState(slotName) {
        try {
            const success = await this.removeFromStorage(slotName);
            
            if (success) {
                this.removeSaveFromHistory(slotName);
                console.log(`游戏状态已删除: ${this.gameId} - ${slotName}`);
                
                // 触发删除成功事件
                this.dispatchEvent('stateDeleted', { slotName });
            }
            
            return success;
        } catch (error) {
            console.error('删除游戏状态失败:', error);
            if (window.GameErrorHandler) {
                window.GameErrorHandler.handleError('delete', 'medium', error.message, {
                    component: 'GameStateManager',
                    gameId: this.gameId,
                    slotName
                });
            }
            return false;
        }
    }
    
    /**
     * 获取所有保存槽位信息
     * @returns {Array} 保存槽位信息数组
     */
    getSaveSlots() {
        return this.saveHistory.map(save => ({
            slotName: save.slotName,
            timestamp: save.timestamp,
            metadata: save.metadata
        }));
    }
    
    /**
     * 启动自动保存
     */
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        if (this.options.autoSaveInterval > 0) {
            this.autoSaveTimer = setInterval(() => {
                if (this.currentState) {
                    this.saveState(this.currentState, 'auto', {
                        autoSave: true
                    });
                }
            }, this.options.autoSaveInterval);
        }
    }
    
    /**
     * 停止自动保存
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
    
    /**
     * 处理页面可见性变化
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // 页面隐藏时保存状态
            if (this.currentState) {
                this.saveState(this.currentState, 'auto', {
                    reason: 'visibility_hidden'
                });
            }
        }
    }
    
    /**
     * 处理页面卸载前事件
     */
    handleBeforeUnload() {
        // 页面卸载前保存状态
        if (this.currentState) {
            // 使用同步方式保存（因为异步可能被中断）
            this.saveStateSync(this.currentState, 'auto', {
                reason: 'before_unload'
            });
        }
    }
    
    /**
     * 同步保存游戏状态（用于页面卸载时）
     */
    saveStateSync(state, slotName = 'auto', metadata = {}) {
        try {
            const saveData = {
                gameId: this.gameId,
                slotName,
                state: this.processStateForSave(state),
                metadata: {
                    timestamp: Date.now(),
                    version: '1.0.0',
                    ...metadata
                },
                checksum: this.calculateChecksum(state)
            };
            
            const key = this.getStorageKey(slotName);
            localStorage.setItem(key, JSON.stringify(saveData));
            
            return true;
        } catch (error) {
            console.error('同步保存游戏状态失败:', error);
            return false;
        }
    }
    
    /**
     * 处理保存前的状态数据
     */
    processStateForSave(state) {
        // 移除不需要保存的临时数据
        const processedState = { ...state };
        
        // 移除函数、DOM元素等不可序列化的数据
        return JSON.parse(JSON.stringify(processedState));
    }
    
    /**
     * 处理加载后的状态数据
     */
    processStateAfterLoad(state) {
        // 可以在这里重建一些运行时数据
        return state;
    }
    
    /**
     * 计算状态数据的校验和
     */
    calculateChecksum(state) {
        const stateStr = JSON.stringify(state);
        let hash = 0;
        for (let i = 0; i < stateStr.length; i++) {
            const char = stateStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return hash.toString(16);
    }
    
    /**
     * 验证校验和
     */
    verifyChecksum(state, expectedChecksum) {
        const actualChecksum = this.calculateChecksum(state);
        return actualChecksum === expectedChecksum;
    }
    
    /**
     * 验证保存数据
     */
    validateSaveData(saveData) {
        return saveData &&
               saveData.gameId === this.gameId &&
               saveData.state &&
               saveData.metadata &&
               typeof saveData.metadata.timestamp === 'number';
    }
    
    /**
     * 获取存储键名
     */
    getStorageKey(slotName) {
        return `gameState_${this.gameId}_${slotName}`;
    }
    
    /**
     * 写入存储
     */
    async writeToStorage(slotName, saveData) {
        try {
            const key = this.getStorageKey(slotName);
            
            if (this.options.storageType === 'indexedDB') {
                // 使用 IndexedDB（暂时使用 localStorage 作为后备）
                localStorage.setItem(key, JSON.stringify(saveData));
            } else {
                // 使用 localStorage
                localStorage.setItem(key, JSON.stringify(saveData));
            }
            
            return true;
        } catch (error) {
            console.error('写入存储失败:', error);
            return false;
        }
    }
    
    /**
     * 从存储读取
     */
    async readFromStorage(slotName) {
        try {
            const key = this.getStorageKey(slotName);
            
            let dataStr;
            if (this.options.storageType === 'indexedDB') {
                // 使用 IndexedDB（暂时使用 localStorage 作为后备）
                dataStr = localStorage.getItem(key);
            } else {
                // 使用 localStorage
                dataStr = localStorage.getItem(key);
            }
            
            return dataStr ? JSON.parse(dataStr) : null;
        } catch (error) {
            console.error('从存储读取失败:', error);
            return null;
        }
    }
    
    /**
     * 从存储删除
     */
    async removeFromStorage(slotName) {
        try {
            const key = this.getStorageKey(slotName);
            
            if (this.options.storageType === 'indexedDB') {
                // 使用 IndexedDB（暂时使用 localStorage 作为后备）
                localStorage.removeItem(key);
            } else {
                // 使用 localStorage
                localStorage.removeItem(key);
            }
            
            return true;
        } catch (error) {
            console.error('从存储删除失败:', error);
            return false;
        }
    }
    
    /**
     * 加载保存历史
     */
    loadSaveHistory() {
        try {
            const historyKey = `gameStateHistory_${this.gameId}`;
            const historyStr = localStorage.getItem(historyKey);
            this.saveHistory = historyStr ? JSON.parse(historyStr) : [];
        } catch (error) {
            console.error('加载保存历史失败:', error);
            this.saveHistory = [];
        }
    }
    
    /**
     * 更新保存历史
     */
    updateSaveHistory(slotName, metadata) {
        try {
            // 移除旧的记录
            this.saveHistory = this.saveHistory.filter(save => save.slotName !== slotName);
            
            // 添加新记录
            this.saveHistory.unshift({
                slotName,
                timestamp: metadata.timestamp,
                metadata
            });
            
            // 限制历史记录数量
            if (this.saveHistory.length > this.options.maxSaveSlots) {
                this.saveHistory = this.saveHistory.slice(0, this.options.maxSaveSlots);
            }
            
            // 保存历史记录
            const historyKey = `gameStateHistory_${this.gameId}`;
            localStorage.setItem(historyKey, JSON.stringify(this.saveHistory));
        } catch (error) {
            console.error('更新保存历史失败:', error);
        }
    }
    
    /**
     * 从历史记录中移除保存
     */
    removeSaveFromHistory(slotName) {
        try {
            this.saveHistory = this.saveHistory.filter(save => save.slotName !== slotName);
            
            const historyKey = `gameStateHistory_${this.gameId}`;
            localStorage.setItem(historyKey, JSON.stringify(this.saveHistory));
        } catch (error) {
            console.error('从历史记录移除保存失败:', error);
        }
    }
    
    /**
     * 压缩数据（简单实现）
     */
    compressData(data) {
        // 这里可以实现更复杂的压缩算法
        return JSON.stringify(data);
    }
    
    /**
     * 解压数据
     */
    decompressData(data) {
        return JSON.parse(data);
    }
    
    /**
     * 加密数据（简单实现）
     */
    encryptData(data) {
        // 这里可以实现更安全的加密算法
        return btoa(JSON.stringify(data));
    }
    
    /**
     * 解密数据
     */
    decryptData(data) {
        return JSON.parse(atob(data));
    }
    
    /**
     * 分发事件
     */
    dispatchEvent(eventType, detail) {
        const event = new CustomEvent(`gameState:${eventType}`, {
            detail: {
                gameId: this.gameId,
                ...detail
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * 销毁状态管理器
     */
    destroy() {
        try {
            // 停止自动保存
            this.stopAutoSave();
            
            // 移除事件监听器
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
            window.removeEventListener('beforeunload', this.handleBeforeUnload);
            
            // 最后保存一次状态
            if (this.currentState) {
                this.saveStateSync(this.currentState, 'auto', {
                    reason: 'destroy'
                });
            }
            
            console.log(`游戏状态管理器已销毁: ${this.gameId}`);
        } catch (error) {
            console.error('销毁游戏状态管理器失败:', error);
        }
    }
}

// 全局状态管理器注册表
class GlobalStateManager {
    constructor() {
        this.managers = new Map();
    }
    
    /**
     * 注册游戏状态管理器
     */
    register(gameId, manager) {
        this.managers.set(gameId, manager);
        console.log(`已注册游戏状态管理器: ${gameId}`);
    }
    
    /**
     * 注销游戏状态管理器
     */
    unregister(gameId) {
        const manager = this.managers.get(gameId);
        if (manager) {
            manager.destroy();
            this.managers.delete(gameId);
            console.log(`已注销游戏状态管理器: ${gameId}`);
        }
    }
    
    /**
     * 获取游戏状态管理器
     */
    get(gameId) {
        return this.managers.get(gameId);
    }
    
    /**
     * 获取所有管理器
     */
    getAll() {
        return Array.from(this.managers.values());
    }
    
    /**
     * 销毁所有管理器
     */
    destroyAll() {
        for (const manager of this.managers.values()) {
            manager.destroy();
        }
        this.managers.clear();
        console.log('所有游戏状态管理器已销毁');
    }
}

// 创建全局实例
if (!window.GlobalStateManager) {
    window.GlobalStateManager = new GlobalStateManager();
}

// 页面卸载时清理所有管理器
window.addEventListener('beforeunload', () => {
    if (window.GlobalStateManager) {
        window.GlobalStateManager.destroyAll();
    }
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameStateManager, GlobalStateManager };
} else {
    window.GameStateManager = GameStateManager;
    window.GlobalStateManager = window.GlobalStateManager;
}
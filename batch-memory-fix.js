// 批量内存泄漏修复脚本
// 用于为剩余游戏添加内存管理功能

class BatchMemoryFix {
    constructor() {
        this.gameFiles = [
            'gomoku.js',
            'tetris.js', 
            'snake.js',
            'hangman.js',
            'sliding-puzzle.js',
            'pong.js',
            'space-shooter.js',
            'sudoku.js',
            'tic-tac-toe.js',
            'brick-breaker.js',
            'flappy-bird.js',
            'plane-combat.js',
            'puzzle.js'
        ];
    }
    
    // 生成内存管理初始化代码
    generateMemoryManagerInit() {
        return `
    // 初始化内存管理器和生命周期管理器
    const gameMemoryManager = new GameMemoryManager('{gameName}');
    const gameLifecycle = new GameLifecycle('{gameName}');
    
    // 注册错误处理回调
    gameLifecycle.onError((error) => {
        console.error('{gameName}游戏错误:', error);
        GameErrorHandler.handleError(error, '{gameName}');
    });
        `;
    }
    
    // 生成清理代码
    generateCleanupCode() {
        return `
    // 页面卸载时清理资源
    gameMemoryManager.addEventListener(window, 'beforeunload', () => {
        gameLifecycle.cleanup();
        gameMemoryManager.cleanup();
    });
        `;
    }
    
    // 生成替换规则
    generateReplaceRules() {
        return {
            // 定时器相关
            'setInterval(': 'gameMemoryManager.setInterval(',
            'setTimeout(': 'gameMemoryManager.setTimeout(',
            'clearInterval(': 'gameMemoryManager.clearInterval(',
            'clearTimeout(': 'gameMemoryManager.clearTimeout(',
            
            // 事件监听器相关
            '.addEventListener(': '.addEventListener(',  // 需要手动处理
            'document.addEventListener(': 'gameMemoryManager.addEventListener(document,',
            'window.addEventListener(': 'gameMemoryManager.addEventListener(window,',
            
            // 生命周期相关
            '// 游戏开始': '// 游戏开始\n        gameLifecycle.start();',
            '// 游戏结束': '// 游戏结束\n        gameLifecycle.stop();',
            '// 重新开始': '// 重新开始\n        gameLifecycle.restart();'
        };
    }
    
    // 为特定游戏生成修复代码
    generateFixForGame(gameName) {
        const initCode = this.generateMemoryManagerInit().replace(/{gameName}/g, gameName);
        const cleanupCode = this.generateCleanupCode();
        
        return {
            initCode,
            cleanupCode,
            replaceRules: this.generateReplaceRules()
        };
    }
    
    // 输出修复指南
    generateFixGuide() {
        return `
内存泄漏修复指南：

1. 在DOMContentLoaded事件监听器开始处添加初始化代码
2. 替换所有定时器函数调用
3. 替换所有事件监听器添加调用
4. 在游戏生命周期关键点调用相应方法
5. 在文件末尾添加清理代码

需要手动处理的元素事件监听器：
- element.addEventListener -> gameMemoryManager.addEventListener(element, ...)

生命周期调用时机：
- gameLifecycle.start(): 游戏开始时
- gameLifecycle.stop(): 游戏结束时  
- gameLifecycle.restart(): 重新开始游戏时
- gameLifecycle.pause(): 游戏暂停时
- gameLifecycle.resume(): 游戏恢复时
        `;
    }
}

// 导出修复工具
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BatchMemoryFix;
} else {
    window.BatchMemoryFix = BatchMemoryFix;
}

// 使用示例
const batchFix = new BatchMemoryFix();
console.log('批量内存泄漏修复工具已加载');
console.log(batchFix.generateFixGuide());
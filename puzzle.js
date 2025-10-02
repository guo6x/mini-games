// 数字拼图游戏完整逻辑
class PuzzleGame {
    constructor(gameMemoryManager, gameLifecycle) {
        this.gameMemoryManager = gameMemoryManager;
        this.gameLifecycle = gameLifecycle;
        
        this.boardElement = document.getElementById('puzzleBoard');
        this.moveCountElement = document.getElementById('moveCount');
        this.shuffleButton = document.getElementById('shuffle');
        
        this.size = 4; // 4x4 拼图
        this.tiles = [];
        this.emptyIndex = 15; // 空白位置索引
        this.moveCount = 0;
        this.isGameActive = false;
        this.winMessageTimeout = null;
        
        this.initGame();
        this.bindEvents();
    }
    
    initGame() {
        // 初始化拼图数组 (1-15 和一个空位)
        this.tiles = [];
        for (let i = 1; i < this.size * this.size; i++) {
            this.tiles.push(i);
        }
        this.tiles.push(0); // 0 代表空位
        
        this.emptyIndex = 15;
        this.moveCount = 0;
        this.isGameActive = false;
        
        this.renderBoard();
        this.updateMoveCount();
    }
    
    bindEvents() {
        this.gameMemoryManager.addEventListener(this.shuffleButton, 'click', () => {
            this.shuffleBoard();
        });
    }
    
    renderBoard() {
        this.boardElement.innerHTML = '';
        
        for (let i = 0; i < this.tiles.length; i++) {
            const tile = document.createElement('div');
            tile.className = 'puzzle-tile';
            tile.dataset.index = i;
            
            if (this.tiles[i] === 0) {
                tile.classList.add('empty');
                tile.textContent = '';
            } else {
                tile.textContent = this.tiles[i];
                this.gameMemoryManager.addEventListener(tile, 'click', () => this.moveTile(i));
            }
            
            this.boardElement.appendChild(tile);
        }
    }
    
    shuffleBoard() {
        // 重置到解决状态
        this.initGame();
        
        // 执行随机移动来打乱拼图
        const shuffleMoves = 1000;
        for (let i = 0; i < shuffleMoves; i++) {
            const validMoves = this.getValidMoves();
            if (validMoves.length > 0) {
                const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                this.swapTiles(this.emptyIndex, randomMove);
                this.emptyIndex = randomMove;
            }
        }
        
        this.moveCount = 0;
        this.isGameActive = true;
        this.shuffleButton.textContent = '重新开始';
        
        // 启动游戏生命周期
        this.gameLifecycle.start();
        
        this.renderBoard();
        this.updateMoveCount();
    }
    
    getValidMoves() {
        const validMoves = [];
        const row = Math.floor(this.emptyIndex / this.size);
        const col = this.emptyIndex % this.size;
        
        // 上
        if (row > 0) {
            validMoves.push(this.emptyIndex - this.size);
        }
        // 下
        if (row < this.size - 1) {
            validMoves.push(this.emptyIndex + this.size);
        }
        // 左
        if (col > 0) {
            validMoves.push(this.emptyIndex - 1);
        }
        // 右
        if (col < this.size - 1) {
            validMoves.push(this.emptyIndex + 1);
        }
        
        return validMoves;
    }
    
    moveTile(tileIndex) {
        if (!this.isGameActive) return;
        
        const validMoves = this.getValidMoves();
        
        if (validMoves.includes(tileIndex)) {
            this.swapTiles(this.emptyIndex, tileIndex);
            this.emptyIndex = tileIndex;
            this.moveCount++;
            
            this.renderBoard();
            this.updateMoveCount();
            
            if (this.checkWin()) {
                this.handleWin();
            }
        }
    }
    
    swapTiles(index1, index2) {
        const temp = this.tiles[index1];
        this.tiles[index1] = this.tiles[index2];
        this.tiles[index2] = temp;
    }
    
    checkWin() {
        // 检查是否按顺序排列 (1, 2, 3, ..., 15, 0)
        for (let i = 0; i < this.tiles.length - 1; i++) {
            if (this.tiles[i] !== i + 1) {
                return false;
            }
        }
        return this.tiles[this.tiles.length - 1] === 0;
    }
    
    handleWin() {
        this.isGameActive = false;
        
        // 停止游戏生命周期
        this.gameLifecycle.stop();
        
        // 显示胜利消息
        const winMessage = document.createElement('div');
        winMessage.className = 'win-message';
        winMessage.innerHTML = `
            <h2>🎉 恭喜你！</h2>
            <p>你用 ${this.moveCount} 步完成了拼图！</p>
            <button id="play-again-btn" 
                    style="padding: 10px 20px; margin-top: 15px; background: white; color: #2ecc71; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                再玩一次
            </button>
        `;
        
        document.body.appendChild(winMessage);
        
        // 绑定再玩一次按钮事件
        const playAgainBtn = winMessage.querySelector('#play-again-btn');
        this.gameMemoryManager.addEventListener(playAgainBtn, 'click', () => {
            this.closeWinMessage();
            this.shuffleBoard();
        });
        
        // 3秒后自动关闭消息
        this.winMessageTimeout = this.gameMemoryManager.setTimeout(() => {
            this.closeWinMessage();
        }, 3000);
    }
    
    closeWinMessage() {
        const winMessage = document.querySelector('.win-message');
        if (winMessage) {
            winMessage.remove();
        }
        
        // 清除定时器
        if (this.winMessageTimeout) {
            this.gameMemoryManager.clearTimeout(this.winMessageTimeout);
            this.winMessageTimeout = null;
        }
    }
    
    updateMoveCount() {
        this.moveCountElement.textContent = this.moveCount;
    }
    
    // 获取拼图的逆序数，用于判断是否可解
    getInversions() {
        let inversions = 0;
        const flatTiles = this.tiles.filter(tile => tile !== 0);
        
        for (let i = 0; i < flatTiles.length - 1; i++) {
            for (let j = i + 1; j < flatTiles.length; j++) {
                if (flatTiles[i] > flatTiles[j]) {
                    inversions++;
                }
            }
        }
        
        return inversions;
    }
    
    // 检查拼图是否可解
    isSolvable() {
        const inversions = this.getInversions();
        const emptyRow = Math.floor(this.emptyIndex / this.size);
        
        if (this.size % 2 === 1) {
            // 奇数大小：逆序数必须是偶数
            return inversions % 2 === 0;
        } else {
            // 偶数大小：如果空位在偶数行（从底部算），逆序数必须是奇数
            if ((this.size - emptyRow) % 2 === 0) {
                return inversions % 2 === 1;
            } else {
                return inversions % 2 === 0;
            }
        }
    }
}

// 初始化游戏
let game;

document.addEventListener('DOMContentLoaded', () => {
    // 初始化内存管理器和生命周期管理器
    const gameId = 'puzzle-game';
    const gameMemoryManager = new GameMemoryManager(gameId);
    const gameLifecycle = new GameLifecycle(gameId);
    
    // 注册错误处理回调
    GameErrorHandler.registerCallback((errorInfo) => {
      console.error('游戏错误:', errorInfo);
      // 可以在这里添加更多的错误处理逻辑
    });
    
    gameMemoryManager.onError((error) => {
      GameErrorHandler.handleError({
        type: 'memory_leak',
        severity: 'medium',
        message: '内存管理器错误: ' + error.message,
        error: error,
        context: { component: 'gameMemoryManager' }
      }, 'puzzle');
    });
    
    gameLifecycle.onError = (error) => {
      GameErrorHandler.handleError({
        type: 'lifecycle_error',
        severity: 'medium',
        message: '生命周期管理器错误: ' + error.message,
        error: error,
        context: { component: 'gameLifecycle' }
      }, 'puzzle');
    };
    
    game = new PuzzleGame(gameMemoryManager, gameLifecycle);
    
    // 初始化键盘控制
    initKeyboardControl(gameMemoryManager);
    
    // 页面卸载时清理资源
    gameMemoryManager.addEventListener(window, 'beforeunload', () => {
        gameLifecycle.destroy();
        gameMemoryManager.cleanup();
    });
});

// 键盘控制将在DOMContentLoaded中初始化
let keyboardHandler = null;

function initKeyboardControl(gameMemoryManager) {
    keyboardHandler = (e) => {
        if (!game || !game.isGameActive) return;
        
        const validMoves = game.getValidMoves();
        let targetIndex = -1;
        
        switch (e.key) {
            case 'ArrowUp':
                // 空位向上移动，实际是下方的数字向上移动
                targetIndex = validMoves.find(index => index === game.emptyIndex + game.size);
                break;
            case 'ArrowDown':
                // 空位向下移动，实际是上方的数字向下移动
                targetIndex = validMoves.find(index => index === game.emptyIndex - game.size);
                break;
            case 'ArrowLeft':
                // 空位向左移动，实际是右方的数字向左移动
                targetIndex = validMoves.find(index => index === game.emptyIndex + 1);
                break;
            case 'ArrowRight':
                // 空位向右移动，实际是左方的数字向右移动
                targetIndex = validMoves.find(index => index === game.emptyIndex - 1);
                break;
        }
        
        if (targetIndex !== -1 && targetIndex !== undefined) {
            e.preventDefault();
            game.moveTile(targetIndex);
        }
    };
    
    gameMemoryManager.addEventListener(document, 'keydown', keyboardHandler);
}

console.log('数字拼图游戏已加载');
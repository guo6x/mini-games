// 井字棋核心逻辑
document.addEventListener('DOMContentLoaded', () => {
    // 初始化内存管理器和生命周期管理器
    const gameMemoryManager = new GameMemoryManager('tic-tac-toe');
    const gameLifecycle = new GameLifecycle('tic-tac-toe');
    
    // 注册错误处理回调
    if (window.GameErrorHandler) {
        GameErrorHandler.registerCallback((errorInfo) => {
            console.error('井字棋游戏错误:', errorInfo);
        });
    }
    
    const boardElement = document.getElementById('ttt-board');
    const statusElement = document.getElementById('ttt-status');
    const restartButton = document.getElementById('ttt-restart');

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;

function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((cell, idx) => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'ttt-cell';
        cellDiv.textContent = cell ? cell : '';
        cellDiv.addEventListener('click', () => handleCellClick(idx));
        boardElement.appendChild(cellDiv);
    });
}

function handleCellClick(idx) {
    if (!gameActive || board[idx]) return;
    
    // 如果是第一步，开始游戏
    if (board.every(cell => cell === null)) {
        gameLifecycle.start();
    }
    
    board[idx] = currentPlayer;
    renderBoard();
    if (checkWinner()) {
        statusElement.textContent = `玩家 ${currentPlayer} 获胜！`;
        gameActive = false;
        gameLifecycle.stop();
    } else if (board.every(cell => cell)) {
        statusElement.textContent = '平局！';
        gameActive = false;
        gameLifecycle.stop();
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusElement.textContent = `当前玩家: ${currentPlayer}`;
    }
}

function checkWinner() {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8], // 行
        [0,3,6],[1,4,7],[2,5,8], // 列
        [0,4,8],[2,4,6]          // 对角线
    ];
    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        return board[a] && board[a] === board[b] && board[a] === board[c];
    });
}

function restartGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    statusElement.textContent = '当前玩家: X';
    renderBoard();
    gameLifecycle.restart();
}

    restartButton.addEventListener('click', restartGame);
    
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
        if (gameLifecycle.cleanup) {
            gameLifecycle.cleanup();
        }
        if (gameMemoryManager.cleanup) {
            gameMemoryManager.cleanup();
        }
    });
    
    // 初始化
    renderBoard();
});
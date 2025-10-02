document.addEventListener('DOMContentLoaded', () => {
    // 初始化内存管理器和生命周期管理器
    const gameId = 'gomoku-game';
    const gameMemoryManager = new GameMemoryManager(gameId);
    const gameLifecycle = new GameLifecycle(gameId);
    
    // 注册错误处理回调
    gameMemoryManager.onError((error) => {
        console.error('五子棋游戏内存管理错误:', error);
    });
    
    gameLifecycle.onError((error) => {
        console.error('五子棋游戏生命周期错误:', error);
    });
    
    // DOM 元素
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const currentPlayerElement = document.getElementById('current-player');
    const gameTimerElement = document.getElementById('game-timer');
    const finalTimeElement = document.getElementById('final-time');
    const winnerElement = document.getElementById('winner');
    const resultMessageElement = document.getElementById('result-message');
    const moveListElement = document.getElementById('move-list');
    const gameModeSelect = document.getElementById('game-mode');
    const difficultySelect = document.getElementById('difficulty');
    const firstMoveSelect = document.getElementById('first-move');
    const aiDifficultyContainer = document.getElementById('ai-difficulty');
    
    // 按钮
    const newGameBtn = document.getElementById('new-game-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const undoBtn = document.getElementById('undo-btn');
    const hintBtn = document.getElementById('hint-btn');
    const resignBtn = document.getElementById('resign-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    
    // 游戏常量
    const BOARD_SIZE = 15; // 15x15 棋盘
    const CELL_SIZE = 30; // 每个格子的大小
    const STONE_RADIUS = 13; // 棋子半径
    
    // 游戏变量
    let board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));
    let currentPlayer = 'black'; // 'black' 或 'white'
    let gameOver = false;
    let gameStartTime = null;
    let gameTimer = null;
    let moveHistory = [];
    let hintMarker = null;
    
    // 初始化游戏
    function initGame() {
        // 清空棋盘
        board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));
        
        // 设置当前玩家
        currentPlayer = firstMoveSelect.value;
        currentPlayerElement.textContent = currentPlayer === 'black' ? '黑子' : '白子';
        
        // 重置游戏状态
        gameOver = false;
        moveHistory = [];
        moveListElement.innerHTML = '';
        
        // 移除提示标记
        if (hintMarker) {
            hintMarker.remove();
            hintMarker = null;
        }
        
        // 隐藏游戏结束模态框
        gameOverModal.classList.remove('show');
        
        // 绘制棋盘
        drawBoard();
        
        // 开始计时
        startTimer();
        
        // 启动游戏生命周期
        gameLifecycle.start();
        
        // 如果是人机对战且AI先手，让AI下棋
        if (gameModeSelect.value === 'pve' && currentPlayer === 'white') {
            gameMemoryManager.setTimeout(() => {
                makeAIMove();
            }, 500);
        }
    }
    
    // 开始计时器
    function startTimer() {
        // 清除之前的计时器
        if (gameTimer) {
            gameMemoryManager.clearInterval(gameTimer);
        }
        
        gameStartTime = Date.now();
        
        gameTimer = gameMemoryManager.setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
            const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
            const seconds = (elapsedTime % 60).toString().padStart(2, '0');
            gameTimerElement.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }
    
    // 停止计时器
    function stopTimer() {
        if (gameTimer) {
            gameMemoryManager.clearInterval(gameTimer);
            gameTimer = null;
        }
    }
    
    // 绘制棋盘
    function drawBoard() {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 设置棋盘背景
        ctx.fillStyle = '#deb887';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制网格线
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 1;
        
        // 绘制横线
        for (let i = 0; i < BOARD_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(CELL_SIZE / 2, CELL_SIZE / 2 + i * CELL_SIZE);
            ctx.lineTo(canvas.width - CELL_SIZE / 2, CELL_SIZE / 2 + i * CELL_SIZE);
            ctx.stroke();
        }
        
        // 绘制竖线
        for (let i = 0; i < BOARD_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(CELL_SIZE / 2 + i * CELL_SIZE, CELL_SIZE / 2);
            ctx.lineTo(CELL_SIZE / 2 + i * CELL_SIZE, canvas.height - CELL_SIZE / 2);
            ctx.stroke();
        }
        
        // 绘制天元和星位
        const starPoints = [3, 7, 11];
        ctx.fillStyle = '#8b4513';
        
        for (let i = 0; i < starPoints.length; i++) {
            for (let j = 0; j < starPoints.length; j++) {
                ctx.beginPath();
                ctx.arc(
                    CELL_SIZE / 2 + starPoints[i] * CELL_SIZE,
                    CELL_SIZE / 2 + starPoints[j] * CELL_SIZE,
                    3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
        
        // 绘制棋子
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (board[y][x]) {
                    drawStone(x, y, board[y][x]);
                }
            }
        }
    }
    
    // 绘制棋子
    function drawStone(x, y, color) {
        const centerX = CELL_SIZE / 2 + x * CELL_SIZE;
        const centerY = CELL_SIZE / 2 + y * CELL_SIZE;
        
        // 绘制阴影
        ctx.beginPath();
        ctx.arc(centerX + 2, centerY + 2, STONE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
        
        // 绘制棋子
        ctx.beginPath();
        ctx.arc(centerX, centerY, STONE_RADIUS, 0, Math.PI * 2);
        
        // 创建径向渐变
        const gradient = ctx.createRadialGradient(
            centerX - 3, centerY - 3, 0,
            centerX, centerY, STONE_RADIUS
        );
        
        if (color === 'black') {
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
        } else {
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ccc');
        }
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 绘制边缘
        ctx.strokeStyle = color === 'black' ? '#000' : '#ccc';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // 显示提示标记
    function showHint(x, y) {
        // 移除之前的提示标记
        if (hintMarker) {
            hintMarker.remove();
        }
        
        // 创建新的提示标记
        hintMarker = document.createElement('div');
        hintMarker.className = 'hint-marker';
        
        // 计算位置
        const centerX = CELL_SIZE / 2 + x * CELL_SIZE;
        const centerY = CELL_SIZE / 2 + y * CELL_SIZE;
        
        hintMarker.style.left = `${canvas.offsetLeft + centerX - 10}px`;
        hintMarker.style.top = `${canvas.offsetTop + centerY - 10}px`;
        
        // 添加到棋盘容器
        canvas.parentElement.appendChild(hintMarker);
        
        // 3秒后自动移除
        gameMemoryManager.setTimeout(() => {
            if (hintMarker) {
                hintMarker.remove();
                hintMarker = null;
            }
        }, 3000);
    }
    
    // 处理玩家点击
    function handleClick(event) {
        if (gameOver) return;
        
        // 如果是人机对战且当前是AI回合，不处理点击
        if (gameModeSelect.value === 'pve' && currentPlayer === 'white') {
            return;
        }
        
        // 获取点击位置
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / CELL_SIZE);
        const y = Math.floor((event.clientY - rect.top) / CELL_SIZE);
        
        // 检查是否有效点击
        if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE || board[y][x]) {
            return;
        }
        
        // 放置棋子
        placeStone(x, y);
        
        // 如果是人机对战且游戏未结束，让AI下棋
        if (gameModeSelect.value === 'pve' && !gameOver) {
            gameMemoryManager.setTimeout(makeAIMove, 500);
        }
    }
    
    // 放置棋子
    function placeStone(x, y) {
        // 放置棋子
        board[y][x] = currentPlayer;
        
        // 记录走棋
        moveHistory.push({ x, y, player: currentPlayer });
        
        // 更新走棋记录
        updateMoveList();
        
        // 重绘棋盘
        drawBoard();
        
        // 检查是否获胜
        if (checkWin(x, y)) {
            endGame(`${currentPlayer === 'black' ? '黑子' : '白子'}获胜！`);
            return;
        }
        
        // 检查是否平局
        if (checkDraw()) {
            endGame('平局！');
            return;
        }
        
        // 切换玩家
        currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
        currentPlayerElement.textContent = currentPlayer === 'black' ? '黑子' : '白子';
    }
    
    // AI下棋
    function makeAIMove() {
        if (gameOver) return;
        
        // 获取AI移动
        const move = getAIMove();
        
        // 放置棋子
        placeStone(move.x, move.y);
    }
    
    // 获取AI移动
    function getAIMove() {
        const difficulty = difficultySelect.value;
        
        // 简单模式：随机选择空位置
        if (difficulty === 'easy') {
            return getRandomMove();
        }
        
        // 中等模式：有一定概率使用最佳移动，否则随机
        if (difficulty === 'medium') {
            if (Math.random() < 0.7) {
                return getBestMove();
            } else {
                return getRandomMove();
            }
        }
        
        // 困难模式：始终使用最佳移动
        return getBestMove();
    }
    
    // 获取随机移动
    function getRandomMove() {
        const emptyPositions = [];
        
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (!board[y][x]) {
                    emptyPositions.push({ x, y });
                }
            }
        }
        
        return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    }
    
    // 获取最佳移动
    function getBestMove() {
        // 评分矩阵
        const scores = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
        
        // 对每个空位置进行评分
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (!board[y][x]) {
                    // 进攻评分：如果AI在此处下棋可能获胜
                    board[y][x] = 'white';
                    if (checkWin(x, y)) {
                        scores[y][x] = 100000; // 非常高的分数，立即获胜
                    } else {
                        scores[y][x] += evaluatePosition(x, y, 'white');
                    }
                    
                    // 防守评分：如果玩家在此处下棋可能获胜
                    board[y][x] = 'black';
                    if (checkWin(x, y)) {
                        scores[y][x] = 10000; // 高分，阻止玩家获胜
                    } else {
                        scores[y][x] += evaluatePosition(x, y, 'black');
                    }
                    
                    // 恢复空位
                    board[y][x] = null;
                }
            }
        }
        
        // 找出最高分的位置
        let maxScore = -1;
        let bestMoves = [];
        
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (!board[y][x]) {
                    if (scores[y][x] > maxScore) {
                        maxScore = scores[y][x];
                        bestMoves = [{ x, y }];
                    } else if (scores[y][x] === maxScore) {
                        bestMoves.push({ x, y });
                    }
                }
            }
        }
        
        // 从最佳移动中随机选择一个
        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
    
    // 评估位置的价值
    function evaluatePosition(x, y, player) {
        let score = 0;
        const directions = [
            { dx: 1, dy: 0 },  // 水平
            { dx: 0, dy: 1 },  // 垂直
            { dx: 1, dy: 1 },  // 对角线
            { dx: 1, dy: -1 }  // 反对角线
        ];
        
        // 检查每个方向
        for (const dir of directions) {
            score += evaluateDirection(x, y, dir.dx, dir.dy, player);
        }
        
        // 中心位置加分
        const centerDistance = Math.sqrt(Math.pow(x - BOARD_SIZE / 2, 2) + Math.pow(y - BOARD_SIZE / 2, 2));
        score += (BOARD_SIZE / 2 - centerDistance) * 2;
        
        return score;
    }
    
    // 评估特定方向的价值
    function evaluateDirection(x, y, dx, dy, player) {
        let score = 0;
        let consecutive = 0;
        let blocked = 0;
        let space = 0;
        
        // 向一个方向检查
        for (let i = 1; i <= 5; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            
            if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
                if (board[ny][nx] === player) {
                    consecutive++;
                } else if (board[ny][nx] === null) {
                    space++;
                    break;
                } else {
                    blocked++;
                    break;
                }
            } else {
                blocked++;
                break;
            }
        }
        
        // 向相反方向检查
        for (let i = 1; i <= 5; i++) {
            const nx = x - dx * i;
            const ny = y - dy * i;
            
            if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
                if (board[ny][nx] === player) {
                    consecutive++;
                } else if (board[ny][nx] === null) {
                    space++;
                    break;
                } else {
                    blocked++;
                    break;
                }
            } else {
                blocked++;
                break;
            }
        }
        
        // 根据连续棋子数量和阻塞情况评分
        if (consecutive >= 4) {
            score += 10000;
        } else if (consecutive === 3) {
            if (blocked === 0) {
                score += 1000;
            } else if (blocked === 1) {
                score += 100;
            }
        } else if (consecutive === 2) {
            if (blocked === 0) {
                score += 100;
            } else if (blocked === 1) {
                score += 10;
            }
        } else if (consecutive === 1) {
            score += 1;
        }
        
        return score;
    }
    
    // 检查是否获胜
    function checkWin(x, y) {
        const player = board[y][x];
        const directions = [
            { dx: 1, dy: 0 },  // 水平
            { dx: 0, dy: 1 },  // 垂直
            { dx: 1, dy: 1 },  // 对角线
            { dx: 1, dy: -1 }  // 反对角线
        ];
        
        for (const dir of directions) {
            let count = 1;
            
            // 向一个方向检查
            for (let i = 1; i <= 4; i++) {
                const nx = x + dir.dx * i;
                const ny = y + dir.dy * i;
                
                if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 向相反方向检查
            for (let i = 1; i <= 4; i++) {
                const nx = x - dir.dx * i;
                const ny = y - dir.dy * i;
                
                if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 如果连续五子，获胜
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }
    
    // 检查是否平局
    function checkDraw() {
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (!board[y][x]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // 更新走棋记录
    function updateMoveList() {
        const move = moveHistory[moveHistory.length - 1];
        const moveItem = document.createElement('div');
        moveItem.className = 'move-item';
        
        const moveNumber = document.createElement('span');
        moveNumber.textContent = moveHistory.length;
        
        const movePosition = document.createElement('span');
        movePosition.className = move.player === 'black' ? 'move-black' : 'move-white';
        movePosition.textContent = `${String.fromCharCode(65 + move.x)}${move.y + 1}`;
        
        moveItem.appendChild(moveNumber);
        moveItem.appendChild(movePosition);
        moveListElement.appendChild(moveItem);
        
        // 滚动到底部
        moveListElement.scrollTop = moveListElement.scrollHeight;
    }
    
    // 悔棋
    function undoMove() {
        if (moveHistory.length === 0 || gameOver) return;
        
        // 移除最后一步棋
        const lastMove = moveHistory.pop();
        board[lastMove.y][lastMove.x] = null;
        
        // 如果是人机对战，需要移除AI的最后一步
        if (gameModeSelect.value === 'pve' && moveHistory.length > 0) {
            const aiMove = moveHistory.pop();
            board[aiMove.y][aiMove.x] = null;
        }
        
        // 更新当前玩家
        currentPlayer = firstMoveSelect.value;
        if (moveHistory.length % 2 !== 0) {
            currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
        }
        currentPlayerElement.textContent = currentPlayer === 'black' ? '黑子' : '白子';
        
        // 更新走棋记录
        moveListElement.innerHTML = '';
        for (let i = 0; i < moveHistory.length; i++) {
            const move = moveHistory[i];
            const moveItem = document.createElement('div');
            moveItem.className = 'move-item';
            
            const moveNumber = document.createElement('span');
            moveNumber.textContent = i + 1;
            
            const movePosition = document.createElement('span');
            movePosition.className = move.player === 'black' ? 'move-black' : 'move-white';
            movePosition.textContent = `${String.fromCharCode(65 + move.x)}${move.y + 1}`;
            
            moveItem.appendChild(moveNumber);
            moveItem.appendChild(movePosition);
            moveListElement.appendChild(moveItem);
        }
        
        // 重绘棋盘
        drawBoard();
    }
    
    // 获取提示
    function getHint() {
        if (gameOver || (gameModeSelect.value === 'pve' && currentPlayer === 'white')) return;
        
        // 获取推荐移动
        const move = getBestMove();
        
        // 显示提示标记
        showHint(move.x, move.y);
    }
    
    // 认输
    function resign() {
        if (gameOver) return;
        
        const winner = currentPlayer === 'black' ? 'white' : 'black';
        endGame(`${winner === 'black' ? '黑子' : '白子'}获胜！`);
    }
    
    // 结束游戏
    function endGame(message) {
        gameOver = true;
        stopTimer();
        
        // 停止游戏生命周期
        gameLifecycle.stop();
        
        // 更新结果信息
        resultMessageElement.textContent = message;
        winnerElement.textContent = message.includes('黑子') ? '黑子' : (message.includes('白子') ? '白子' : '平局');
        
        // 更新用时
        const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');
        finalTimeElement.textContent = `${minutes}:${seconds}`;
        
        // 显示游戏结束模态框
        gameOverModal.classList.add('show');
    }
    
    // 事件监听
    gameMemoryManager.addEventListener(canvas, 'click', handleClick);
    
    gameMemoryManager.addEventListener(newGameBtn, 'click', initGame);
    gameMemoryManager.addEventListener(playAgainBtn, 'click', initGame);
    gameMemoryManager.addEventListener(undoBtn, 'click', undoMove);
    gameMemoryManager.addEventListener(hintBtn, 'click', getHint);
    gameMemoryManager.addEventListener(resignBtn, 'click', resign);
    
    gameMemoryManager.addEventListener(gameModeSelect, 'change', () => {
        aiDifficultyContainer.style.display = gameModeSelect.value === 'pve' ? 'flex' : 'none';
    });
    
    // 页面卸载时清理资源
    gameMemoryManager.addEventListener(window, 'beforeunload', () => {
        gameLifecycle.destroy();
        gameMemoryManager.cleanup();
    });
    
    // 初始化游戏
    initGame();
});
document.addEventListener('DOMContentLoaded', () => {
    // 初始化内存管理器和生命周期管理器
    const gameId = 'minesweeper';
    const gameMemoryManager = new GameMemoryManager(gameId);
    const gameLifecycle = new GameLifecycle(gameId);
    
    // 注册错误处理回调
    gameMemoryManager.onError((error) => {
        GameErrorHandler.handleError('memory', 'high', error.message, {
            game: 'minesweeper',
            component: 'gameMemoryManager'
        });
    });
    
    gameLifecycle.onError((error) => {
        GameErrorHandler.handleError('lifecycle', 'high', error.message, {
            game: 'minesweeper',
            component: 'gameLifecycle'
        });
    });
    
    // DOM 元素
    const mineGrid = document.getElementById('mine-grid');
    const mineCounter = document.getElementById('mine-counter');
    const timer = document.getElementById('timer');
    const difficultySelect = document.getElementById('difficulty');
    const newGameBtn = document.getElementById('new-game');
    const playAgainBtn = document.getElementById('play-again');
    const gameOverModal = document.getElementById('game-over-modal');
    const resultMessage = document.getElementById('result-message');
    const finalTime = document.getElementById('final-time');
    
    // 游戏配置
    const DIFFICULTY = {
        beginner: { rows: 9, cols: 9, mines: 10 },
        intermediate: { rows: 16, cols: 16, mines: 40 },
        expert: { rows: 16, cols: 30, mines: 99 }
    };
    
    // 游戏状态
    let board = [];
    let minesLocation = [];
    let gameStarted = false;
    let gameOver = false;
    let flagsPlaced = 0;
    let cellsRevealed = 0;
    let startTime;
    let timerInterval;
    let currentDifficulty = 'beginner';
    
    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        resetGameState();
        
        // 重启游戏生命周期
        gameLifecycle.restart();
        
        // 获取当前难度
        currentDifficulty = difficultySelect.value;
        const { rows, cols, mines } = DIFFICULTY[currentDifficulty];
        
        // 更新雷数计数器
        mineCounter.textContent = mines;
        
        // 创建游戏板
        createBoard(rows, cols);
        
        // 设置地雷
        setMines(mines, rows, cols);
        
        // 计算每个单元格周围的地雷数量
        calculateNumbers();
    }
    
    // 重置游戏状态
    function resetGameState() {
        // 清空游戏板
        mineGrid.innerHTML = '';
        
        // 重置变量
        board = [];
        minesLocation = [];
        gameStarted = false;
        gameOver = false;
        flagsPlaced = 0;
        cellsRevealed = 0;
        
        // 重置计时器
        gameMemoryManager.clearInterval(timerInterval);
        timer.textContent = '000';
        
        // 隐藏游戏结束模态框
        gameOverModal.classList.remove('show');
    }
    
    // 创建游戏板
    function createBoard(rows, cols) {
        // 设置网格大小
        mineGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        mineGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        
        // 创建单元格
        for (let row = 0; row < rows; row++) {
            board[row] = [];
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // 添加事件监听器
                gameMemoryManager.addEventListener(cell, 'click', () => handleCellClick(row, col));
                gameMemoryManager.addEventListener(cell, 'contextmenu', (e) => {
                    e.preventDefault();
                    handleRightClick(row, col);
                });
                gameMemoryManager.addEventListener(cell, 'dblclick', () => handleDoubleClick(row, col));
                
                // 添加到游戏板
                mineGrid.appendChild(cell);
                
                // 初始化单元格数据
                board[row][col] = {
                    element: cell,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    isQuestion: false,
                    adjacentMines: 0
                };
            }
        }
    }
    
    // 设置地雷
    function setMines(mineCount, rows, cols) {
        let minesPlaced = 0;
        
        while (minesPlaced < mineCount) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            
            // 确保不重复放置地雷
            if (!board[row][col].isMine) {
                board[row][col].isMine = true;
                minesLocation.push({ row, col });
                minesPlaced++;
            }
        }
    }
    
    // 计算每个单元格周围的地雷数量
    function calculateNumbers() {
        const { rows, cols } = DIFFICULTY[currentDifficulty];
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // 跳过地雷单元格
                if (board[row][col].isMine) continue;
                
                // 计算周围的地雷数量
                let count = 0;
                
                // 检查周围8个方向
                for (let r = Math.max(0, row - 1); r <= Math.min(row + 1, rows - 1); r++) {
                    for (let c = Math.max(0, col - 1); c <= Math.min(col + 1, cols - 1); c++) {
                        if (board[r][c].isMine) count++;
                    }
                }
                
                board[row][col].adjacentMines = count;
            }
        }
    }
    
    // 处理单元格点击
    function handleCellClick(row, col) {
        // 如果游戏已结束或单元格已标记，不做任何操作
        if (gameOver || board[row][col].isFlagged || board[row][col].isQuestion || board[row][col].isRevealed) {
            return;
        }
        
        // 如果是第一次点击，开始游戏
        if (!gameStarted) {
            startGame();
            
            // 确保第一次点击不是地雷
            if (board[row][col].isMine) {
                moveMine(row, col);
            }
        }
        
        // 如果点击到地雷，游戏结束
        if (board[row][col].isMine) {
            revealMines();
            endGame(false);
            return;
        }
        
        // 揭示单元格
        revealCell(row, col);
        
        // 检查是否获胜
        checkWin();
    }
    
    // 处理右键点击（标记地雷）
    function handleRightClick(row, col) {
        // 如果游戏已结束或单元格已揭示，不做任何操作
        if (gameOver || board[row][col].isRevealed) {
            return;
        }
        
        // 如果游戏尚未开始，开始游戏
        if (!gameStarted) {
            startGame();
        }
        
        const cell = board[row][col];
        
        if (!cell.isFlagged && !cell.isQuestion) {
            // 标记为地雷
            cell.isFlagged = true;
            cell.element.classList.add('flagged');
            flagsPlaced++;
        } else if (cell.isFlagged) {
            // 标记为问号（如果启用）
            cell.isFlagged = false;
            cell.isQuestion = true;
            cell.element.classList.remove('flagged');
            cell.element.classList.add('question');
            flagsPlaced--;
        } else {
            // 移除标记
            cell.isQuestion = false;
            cell.element.classList.remove('question');
        }
        
        // 更新雷数计数器
        updateMineCounter();
    }
    
    // 处理双击（快速揭示周围单元格）
    function handleDoubleClick(row, col) {
        // 如果游戏已结束或单元格未揭示，不做任何操作
        if (gameOver || !board[row][col].isRevealed) {
            return;
        }
        
        const { rows, cols } = DIFFICULTY[currentDifficulty];
        const cell = board[row][col];
        
        // 计算周围标记的地雷数量
        let flaggedCount = 0;
        for (let r = Math.max(0, row - 1); r <= Math.min(row + 1, rows - 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(col + 1, cols - 1); c++) {
                if (board[r][c].isFlagged) flaggedCount++;
            }
        }
        
        // 如果标记的地雷数量等于周围地雷数量，揭示周围未标记的单元格
        if (flaggedCount === cell.adjacentMines) {
            for (let r = Math.max(0, row - 1); r <= Math.min(row + 1, rows - 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(col + 1, cols - 1); c++) {
                    if (!board[r][c].isRevealed && !board[r][c].isFlagged) {
                        handleCellClick(r, c);
                    }
                }
            }
        }
    }
    
    // 揭示单元格
    function revealCell(row, col) {
        const { rows, cols } = DIFFICULTY[currentDifficulty];
        const cell = board[row][col];
        
        // 如果单元格已揭示或已标记，不做任何操作
        if (cell.isRevealed || cell.isFlagged) {
            return;
        }
        
        // 揭示单元格
        cell.isRevealed = true;
        cell.element.classList.add('revealed');
        cellsRevealed++;
        
        // 如果单元格周围有地雷，显示数字
        if (cell.adjacentMines > 0) {
            cell.element.textContent = cell.adjacentMines;
            cell.element.dataset.number = cell.adjacentMines;
        } else {
            // 如果单元格周围没有地雷，递归揭示周围的单元格
            for (let r = Math.max(0, row - 1); r <= Math.min(row + 1, rows - 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(col + 1, cols - 1); c++) {
                    if (!(r === row && c === col)) {
                        revealCell(r, c);
                    }
                }
            }
        }
    }
    
    // 揭示所有地雷
    function revealMines() {
        minesLocation.forEach(({ row, col }) => {
            const cell = board[row][col];
            cell.element.classList.add('revealed');
            cell.element.classList.add('mine');
            cell.element.textContent = '💣';
        });
    }
    
    // 移动地雷（确保第一次点击不是地雷）
    function moveMine(row, col) {
        const { rows, cols } = DIFFICULTY[currentDifficulty];
        
        // 移除当前位置的地雷
        board[row][col].isMine = false;
        
        // 在其他位置放置地雷
        let placed = false;
        while (!placed) {
            const newRow = Math.floor(Math.random() * rows);
            const newCol = Math.floor(Math.random() * cols);
            
            if (!board[newRow][newCol].isMine && !(newRow === row && newCol === col)) {
                board[newRow][newCol].isMine = true;
                
                // 更新地雷位置
                const index = minesLocation.findIndex(mine => mine.row === row && mine.col === col);
                if (index !== -1) {
                    minesLocation[index] = { row: newRow, col: newCol };
                }
                
                placed = true;
            }
        }
        
        // 重新计算数字
        calculateNumbers();
    }
    
    // 更新雷数计数器
    function updateMineCounter() {
        const { mines } = DIFFICULTY[currentDifficulty];
        mineCounter.textContent = mines - flagsPlaced;
    }
    
    // 开始游戏
    function startGame() {
        gameStarted = true;
        startTime = Date.now();
        
        // 启动游戏生命周期
        gameLifecycle.start();
        
        // 初始化性能优化器
        if (!window.minesweeperOptimizer) {
            window.minesweeperOptimizer = new GamePerformanceOptimizer('minesweeper', {
                targetFPS: 1, // 1 FPS for timer updates
                enableVSync: false,
                enablePerformanceMonitoring: true,
                adaptiveQuality: false
            });
            
            // 设置更新回调
            window.minesweeperOptimizer.setUpdateCallback((deltaTime) => {
                try {
                    updateTimer(deltaTime);
                } catch (error) {
                    GameErrorHandler.handleError('runtime', 'high', error.message, {
                        function: 'updateTimer',
                        game: 'minesweeper',
                        deltaTime
                    });
                }
            });
            
            // 注册到全局性能监控器
            if (window.GlobalPerformanceMonitor) {
                window.GlobalPerformanceMonitor.register('minesweeper', window.minesweeperOptimizer);
            }
        }
        
        // 初始化性能监控器
        if (!window.minesweeperPerformanceMonitor) {
            window.minesweeperPerformanceMonitor = new GamePerformanceMonitor('minesweeper');
            
            // 注册到全局性能监控管理器
            if (window.globalPerformanceMonitor) {
                window.globalPerformanceMonitor.registerMonitor('minesweeper', window.minesweeperPerformanceMonitor);
            }
        }
        
        // 启动性能优化器
        window.minesweeperOptimizer.start();
        
        // 启动性能监控
        if (window.minesweeperPerformanceMonitor) {
            window.minesweeperPerformanceMonitor.start();
        }
    }
    
    // 检查是否获胜
    function checkWin() {
        const { rows, cols, mines } = DIFFICULTY[currentDifficulty];
        const totalCells = rows * cols;
        
        if (cellsRevealed === totalCells - mines) {
            // 自动标记所有未揭示的单元格为地雷
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const cell = board[row][col];
                    if (!cell.isRevealed && !cell.isFlagged) {
                        cell.isFlagged = true;
                        cell.element.classList.add('flagged');
                        flagsPlaced++;
                    }
                }
            }
            
            updateMineCounter();
            endGame(true);
        }
    }
    
    // 更新计时器
    function updateTimer(deltaTime = 1000) {
        if (!gameStarted || gameOver) return;
        
        // 累积时间用于控制更新频率
        updateTimer.timerAccumulator = (updateTimer.timerAccumulator || 0) + deltaTime;
        
        // 每秒更新一次计时器
        if (updateTimer.timerAccumulator >= 1000) {
            updateTimer.timerAccumulator = 0;
            
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            timer.textContent = elapsedSeconds.toString().padStart(3, '0');
            
            // 测量帧性能
            if (window.minesweeperPerformanceMonitor) {
                window.minesweeperPerformanceMonitor.measureFrame();
            }
        }
    }
    
    // 结束游戏
    function endGame(isWin) {
        gameOver = true;
        
        // 停止性能优化器
        if (window.minesweeperOptimizer) {
            window.minesweeperOptimizer.stop();
        }
        
        // 停止性能监控
        if (window.minesweeperPerformanceMonitor) {
            window.minesweeperPerformanceMonitor.stop();
        }
        
        // 停止游戏生命周期
        gameLifecycle.stop();
        
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        finalTime.textContent = elapsedSeconds;
        
        if (isWin) {
            resultMessage.textContent = '恭喜你赢了！';
        } else {
            resultMessage.textContent = '游戏结束！';
        }
        
        gameOverModal.classList.add('show');
    }
    
    // 事件监听
    gameMemoryManager.addEventListener(newGameBtn, 'click', initGame);
    gameMemoryManager.addEventListener(playAgainBtn, 'click', initGame);
    gameMemoryManager.addEventListener(difficultySelect, 'change', initGame);
    
    // 阻止右键菜单
    gameMemoryManager.addEventListener(mineGrid, 'contextmenu', (e) => {
        e.preventDefault();
    });
    
    // 页面卸载时清理资源
    gameMemoryManager.addEventListener(window, 'beforeunload', () => {
        // 停止性能优化器
        if (window.minesweeperOptimizer) {
            window.minesweeperOptimizer.stop();
            
            // 从全局监控器注销
            if (window.GlobalPerformanceMonitor) {
                window.GlobalPerformanceMonitor.unregister('minesweeper');
            }
        }
        
        gameLifecycle.destroy();
        gameMemoryManager.cleanup();
    });
    
    // 初始化游戏
    initGame();
    
    /**
     * 获取当前游戏状态
     */
    function getCurrentState() {
        return {
            board: board.map(row => row.map(cell => ({...cell}))),
            minesLocation: [...minesLocation],
            gameStarted: gameStarted,
            gameOver: gameOver,
            flagsPlaced: flagsPlaced,
            cellsRevealed: cellsRevealed,
            startTime: startTime,
            currentDifficulty: currentDifficulty,
            timestamp: Date.now()
        };
    }
    
    /**
     * 更新状态管理器的当前状态
     */
    function updateCurrentState() {
        if (window.gameStateManager && gameStarted && !gameOver) {
            window.gameStateManager.currentState = getCurrentState();
        }
    }
    
    /**
     * 加载自动保存的游戏状态
     */
    async function loadAutoSave() {
        try {
            if (!window.gameStateManager) return;
            
            const savedState = await window.gameStateManager.loadState('auto');
            if (savedState && savedState.gameStarted && !savedState.gameOver) {
                // 恢复游戏状态
                board = savedState.board || [];
                minesLocation = savedState.minesLocation || [];
                gameStarted = savedState.gameStarted || false;
                gameOver = savedState.gameOver || false;
                flagsPlaced = savedState.flagsPlaced || 0;
                cellsRevealed = savedState.cellsRevealed || 0;
                startTime = savedState.startTime || Date.now();
                currentDifficulty = savedState.currentDifficulty || 'beginner';
                
                // 重新渲染游戏界面
                difficultySelect.value = currentDifficulty;
                const { rows, cols, mines } = DIFFICULTY[currentDifficulty];
                mineCounter.textContent = mines - flagsPlaced;
                
                // 重新创建游戏板
                createBoardFromState(rows, cols);
                
                console.log('已加载自动保存的游戏状态');
            }
        } catch (error) {
            console.error('加载自动保存失败:', error);
        }
    }
    
    /**
     * 从保存的状态创建游戏板
     */
    function createBoardFromState(rows, cols) {
        // 清空现有游戏板
        mineGrid.innerHTML = '';
        
        // 设置网格大小
        mineGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        mineGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        
        // 重新创建单元格并恢复状态
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // 添加事件监听器
                gameMemoryManager.addEventListener(cell, 'click', () => handleCellClick(row, col));
                gameMemoryManager.addEventListener(cell, 'contextmenu', (e) => {
                    e.preventDefault();
                    handleRightClick(row, col);
                });
                gameMemoryManager.addEventListener(cell, 'dblclick', () => handleDoubleClick(row, col));
                
                // 添加到游戏板
                mineGrid.appendChild(cell);
                
                // 恢复单元格状态
                if (board[row] && board[row][col]) {
                    board[row][col].element = cell;
                    
                    // 恢复视觉状态
                    if (board[row][col].isRevealed) {
                        cell.classList.add('revealed');
                        if (board[row][col].adjacentMines > 0) {
                            cell.textContent = board[row][col].adjacentMines;
                            cell.dataset.number = board[row][col].adjacentMines;
                        }
                    }
                    
                    if (board[row][col].isFlagged) {
                        cell.classList.add('flagged');
                    }
                    
                    if (board[row][col].isQuestion) {
                        cell.classList.add('question');
                    }
                }
            }
        }
    }
    
    /**
     * 手动保存游戏状态
     */
    async function saveGame(slotName = 'manual') {
        try {
            if (!window.gameStateManager) {
                alert('状态管理器未初始化');
                return;
            }
            
            const success = await window.gameStateManager.saveState(getCurrentState(), slotName, {
                difficulty: currentDifficulty,
                minesRemaining: DIFFICULTY[currentDifficulty].mines - flagsPlaced
            });
            
            if (success) {
                alert('游戏已保存！');
            } else {
                alert('保存失败，请重试。');
            }
        } catch (error) {
            console.error('手动保存失败:', error);
            alert('保存失败，请重试。');
        }
    }
    
    /**
     * 手动加载游戏状态
     */
    async function loadGame(slotName = 'manual') {
        try {
            if (!window.gameStateManager) {
                alert('状态管理器未初始化');
                return;
            }
            
            const savedState = await window.gameStateManager.loadState(slotName);
            if (savedState) {
                // 停止当前游戏
                if (window.minesweeperOptimizer) {
                    window.minesweeperOptimizer.stop();
                }
                
                // 恢复游戏状态
                board = savedState.board || [];
                minesLocation = savedState.minesLocation || [];
                gameStarted = savedState.gameStarted || false;
                gameOver = savedState.gameOver || false;
                flagsPlaced = savedState.flagsPlaced || 0;
                cellsRevealed = savedState.cellsRevealed || 0;
                startTime = savedState.startTime || Date.now();
                currentDifficulty = savedState.currentDifficulty || 'beginner';
                
                // 重新渲染游戏界面
                difficultySelect.value = currentDifficulty;
                const { rows, cols, mines } = DIFFICULTY[currentDifficulty];
                mineCounter.textContent = mines - flagsPlaced;
                
                // 重新创建游戏板
                createBoardFromState(rows, cols);
                
                // 如果游戏正在进行，重新启动游戏循环
                if (gameStarted && !gameOver) {
                    if (window.minesweeperOptimizer) {
                        window.minesweeperOptimizer.start();
                    }
                }
                
                alert('游戏已加载！');
            } else {
                alert('未找到保存的游戏。');
            }
        } catch (error) {
            console.error('手动加载失败:', error);
            alert('加载失败，请重试。');
        }
    }
    
    /**
     * 清除自动保存
     */
    async function clearAutoSave() {
        try {
            if (window.gameStateManager) {
                await window.gameStateManager.deleteState('auto');
            }
        } catch (error) {
            console.error('清除自动保存失败:', error);
        }
    }
    
    // 暴露保存/加载函数到全局作用域
    window.minesweeperSaveGame = saveGame;
    window.minesweeperLoadGame = loadGame;
    window.minesweeperClearAutoSave = clearAutoSave;
});
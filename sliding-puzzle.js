document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const puzzleBoard = document.getElementById('puzzle-board');
    const movesCount = document.getElementById('moves-count');
    const timeElement = document.getElementById('time');
    const gridSizeSelect = document.getElementById('grid-size');
    const startButton = document.getElementById('start-button');
    const shuffleButton = document.getElementById('shuffle-button');
    const gameOverModal = document.getElementById('game-over-modal');
    const finalMoves = document.getElementById('final-moves');
    const finalTime = document.getElementById('final-time');
    const playAgainButton = document.getElementById('play-again-button');
    
    // 游戏变量
    let gridSize = parseInt(gridSizeSelect.value);
    let tiles = [];
    let emptyTilePos = { row: gridSize - 1, col: gridSize - 1 };
    let moves = 0;
    let gameStarted = false;
    let timerInterval;
    let seconds = 0;
    let performanceOptimizer = null;
    let performanceMonitor = null;
    
    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        stopTimer();
        resetStats();
        
        // 设置网格大小
        gridSize = parseInt(gridSizeSelect.value);
        puzzleBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        // 创建有序的拼图
        createOrderedPuzzle();
        
        // 设置空白块位置
        emptyTilePos = { row: gridSize - 1, col: gridSize - 1 };
        
        // 游戏未开始状态
        gameStarted = false;
        shuffleButton.disabled = false;
    }
    
    // 创建有序的拼图
    function createOrderedPuzzle() {
        // 清空拼图板
        puzzleBoard.innerHTML = '';
        tiles = [];
        
        // 创建拼图块
        for (let row = 0; row < gridSize; row++) {
            tiles[row] = [];
            for (let col = 0; col < gridSize; col++) {
                const tileNumber = row * gridSize + col + 1;
                const isLastTile = row === gridSize - 1 && col === gridSize - 1;
                
                const tile = document.createElement('div');
                tile.className = `puzzle-tile ${isLastTile ? 'empty' : ''}`;
                if (!isLastTile) {
                    tile.textContent = tileNumber;
                    tile.classList.add('correct');
                }
                
                tile.dataset.row = row;
                tile.dataset.col = col;
                
                tile.addEventListener('click', () => handleTileClick(row, col));
                
                puzzleBoard.appendChild(tile);
                tiles[row][col] = {
                    element: tile,
                    value: isLastTile ? 0 : tileNumber
                };
            }
        }
    }
    
    // 打乱拼图
    function shufflePuzzle() {
        // 确保拼图有解
        // 先创建有序拼图
        createOrderedPuzzle();
        
        // 随机移动空白块多次来打乱
        const minMoves = gridSize * gridSize * 20; // 足够多的随机移动
        let moveCount = 0;
        
        while (moveCount < minMoves) {
            const possibleMoves = getValidMoves();
            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                swapTiles(randomMove.row, randomMove.col);
                moveCount++;
            }
        }
        
        // 重置游戏状态
        resetStats();
        gameStarted = true;
        startTimer();
        
        // 移除所有正确位置的标记
        document.querySelectorAll('.puzzle-tile').forEach(tile => {
            tile.classList.remove('correct');
        });
        
        // 禁用洗牌按钮，直到游戏结束
        shuffleButton.disabled = true;
    }
    
    // 获取空白块可以移动的有效位置
    function getValidMoves() {
        const { row, col } = emptyTilePos;
        const moves = [];
        
        // 上
        if (row > 0) moves.push({ row: row - 1, col });
        // 右
        if (col < gridSize - 1) moves.push({ row, col: col + 1 });
        // 下
        if (row < gridSize - 1) moves.push({ row: row + 1, col });
        // 左
        if (col > 0) moves.push({ row, col: col - 1 });
        
        return moves;
    }
    
    // 处理点击拼图块
    function handleTileClick(row, col) {
        if (!gameStarted) return;
        
        // 检查是否可以移动
        if (isAdjacent(row, col, emptyTilePos.row, emptyTilePos.col)) {
            // 交换拼图块
            swapTiles(row, col);
            
            // 增加移动次数
            moves++;
            movesCount.textContent = moves;
            
            // 检查是否完成
            if (checkWin()) {
                endGame();
            }
        }
    }
    
    // 检查两个拼图块是否相邻
    function isAdjacent(row1, col1, row2, col2) {
        return (
            (Math.abs(row1 - row2) === 1 && col1 === col2) || 
            (Math.abs(col1 - col2) === 1 && row1 === row2)
        );
    }
    
    // 交换拼图块
    function swapTiles(row, col) {
        const emptyRow = emptyTilePos.row;
        const emptyCol = emptyTilePos.col;
        
        // 交换DOM元素的内容和类
        const clickedTile = tiles[row][col].element;
        const emptyTile = tiles[emptyRow][emptyCol].element;
        
        // 交换内容
        emptyTile.textContent = clickedTile.textContent;
        clickedTile.textContent = '';
        
        // 交换类
        clickedTile.classList.add('empty');
        emptyTile.classList.remove('empty');
        
        // 检查是否在正确位置
        const clickedTileValue = parseInt(emptyTile.textContent);
        const correctPosition = (emptyRow * gridSize + emptyCol + 1) === clickedTileValue;
        if (correctPosition) {
            emptyTile.classList.add('correct');
        } else {
            emptyTile.classList.remove('correct');
        }
        
        // 更新数据
        const tempValue = tiles[row][col].value;
        tiles[row][col].value = tiles[emptyRow][emptyCol].value;
        tiles[emptyRow][emptyCol].value = tempValue;
        
        // 更新空白块位置
        emptyTilePos = { row, col };
    }
    
    // 检查是否完成拼图
    function checkWin() {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const expectedValue = row * gridSize + col + 1;
                const isLastCell = row === gridSize - 1 && col === gridSize - 1;
                const expectedLastValue = 0; // 空白块
                
                if (isLastCell) {
                    if (tiles[row][col].value !== expectedLastValue) {
                        return false;
                    }
                } else if (tiles[row][col].value !== expectedValue) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // 结束游戏
    function endGame() {
        gameStarted = false;
        stopTimer();
        
        // 显示游戏结束模态框
        finalMoves.textContent = moves;
        finalTime.textContent = formatTime(seconds);
        gameOverModal.classList.add('show');
    }
    
    // 重置游戏统计
    function resetStats() {
        moves = 0;
        seconds = 0;
        movesCount.textContent = '0';
        timeElement.textContent = '00:00';
    }
    
    // 开始计时器
    function startTimer() {
        stopTimer(); // 确保没有多个计时器运行
        seconds = 0;
        
        // 初始化性能优化器
        performanceOptimizer = new GamePerformanceOptimizer('sliding-puzzle', {
            targetFPS: 1, // 1 FPS for timer updates
            enableVSync: false,
            enablePerformanceMonitoring: true,
            adaptiveQuality: false
        });
        
        // 设置更新回调
        performanceOptimizer.setUpdateCallback((deltaTime) => {
            try {
                updateTimer(deltaTime);
            } catch (error) {
                GameErrorHandler.handleError('runtime', 'high', error.message, {
                    function: 'updateTimer',
                    game: 'sliding-puzzle',
                    deltaTime
                });
            }
        });
        
        // 注册到全局性能监控器
        if (window.GlobalPerformanceMonitor) {
            window.GlobalPerformanceMonitor.register('sliding-puzzle', performanceOptimizer);
        }
        
        // 初始化性能监控器
        performanceMonitor = new GamePerformanceMonitor('sliding-puzzle');
        
        // 注册到全局性能监控管理器
        if (window.globalPerformanceMonitor) {
            window.globalPerformanceMonitor.registerMonitor('sliding-puzzle', performanceMonitor);
        }
        
        performanceOptimizer.start();
        
        // 启动性能监控
        performanceMonitor.start();
    }
    
    // 停止计时器
    function stopTimer() {
        clearInterval(timerInterval);
        
        // 停止性能优化器
        if (performanceOptimizer) {
            performanceOptimizer.stop();
            
            // 从全局监控器注销
            if (window.GlobalPerformanceMonitor) {
                window.GlobalPerformanceMonitor.unregister('sliding-puzzle');
            }
        }
        
        // 停止性能监控
        if (performanceMonitor) {
            performanceMonitor.stop();
        }
    }
    
    // 更新计时器
    function updateTimer(deltaTime = 1000) {
        if (!gameStarted) return;
        
        // 累积时间用于控制更新频率
        timerAccumulator = (timerAccumulator || 0) + deltaTime;
        
        // 每秒更新一次计时器
        if (timerAccumulator >= 1000) {
            timerAccumulator = 0;
            seconds++;
            timeElement.textContent = formatTime(seconds);
            updateCurrentState();
            
            // 测量帧性能
            if (performanceMonitor) {
                performanceMonitor.measureFrame();
            }
        }
    }
    
    // 格式化时间
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // 事件监听
    startButton.addEventListener('click', () => {
        shufflePuzzle();
    });
    
    shuffleButton.addEventListener('click', () => {
        if (gameStarted) {
            if (confirm('确定要重新打乱拼图吗？当前进度将会丢失。')) {
                shufflePuzzle();
            }
        } else {
            shufflePuzzle();
        }
    });
    
    gridSizeSelect.addEventListener('change', initGame);
    
    playAgainButton.addEventListener('click', () => {
        gameOverModal.classList.remove('show');
        shufflePuzzle();
    });
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (!gameStarted) return;
        
        const { row, col } = emptyTilePos;
        let newRow = row;
        let newCol = col;
        
        switch (e.key) {
            case 'ArrowUp':
                newRow = row + 1;
                break;
            case 'ArrowDown':
                newRow = row - 1;
                break;
            case 'ArrowLeft':
                newCol = col + 1;
                break;
            case 'ArrowRight':
                newCol = col - 1;
                break;
            default:
                return; // 其他按键不处理
        }
        
        // 检查是否在边界内
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            handleTileClick(newRow, newCol);
        }
    });
    
    // 初始化游戏
    initGame();
    
    /**
     * 获取当前游戏状态
     */
    function getCurrentState() {
        return {
            tiles: tiles.map(row => row.map(tile => ({...tile}))),
            emptyTilePos: {...emptyTilePos},
            moves: moves,
            seconds: seconds,
            gameStarted: gameStarted,
            gridSize: gridSize,
            timestamp: Date.now()
        };
    }
    
    /**
     * 更新状态管理器的当前状态
     */
    function updateCurrentState() {
        if (window.stateManager && gameStarted) {
            window.stateManager.currentState = getCurrentState();
        }
    }
    
    /**
     * 加载自动保存的游戏状态
     */
    async function loadAutoSave() {
        try {
            if (!window.stateManager) return;
            
            const savedState = await window.stateManager.loadState('auto');
            if (savedState && savedState.gameStarted) {
                // 恢复游戏状态
                gridSize = savedState.gridSize || parseInt(gridSizeSelect.value);
                gridSizeSelect.value = gridSize;
                tiles = savedState.tiles || [];
                emptyTilePos = savedState.emptyTilePos || { row: gridSize - 1, col: gridSize - 1 };
                moves = savedState.moves || 0;
                seconds = savedState.seconds || 0;
                gameStarted = savedState.gameStarted || false;
                
                // 重新渲染游戏界面
                puzzleBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
                puzzleBoard.innerHTML = '';
                
                for (let row = 0; row < gridSize; row++) {
                    for (let col = 0; col < gridSize; col++) {
                        const tile = tiles[row][col];
                        puzzleBoard.appendChild(tile.element);
                    }
                }
                
                movesCount.textContent = moves;
                timeElement.textContent = formatTime(seconds);
                
                if (gameStarted) {
                    startTimer();
                }
                
                console.log('已加载自动保存的游戏状态');
            }
        } catch (error) {
            console.error('加载自动保存失败:', error);
        }
    }
    
    /**
     * 手动保存游戏状态
     */
    async function saveGame(slotName = 'manual') {
        try {
            if (!window.stateManager) {
                alert('状态管理器未初始化');
                return;
            }
            
            const success = await window.stateManager.saveState(getCurrentState(), slotName, {
                puzzleSize: gridSize,
                progress: Math.round((moves > 0 ? Math.max(0, 100 - moves) : 0))
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
            if (!window.stateManager) {
                alert('状态管理器未初始化');
                return;
            }
            
            const savedState = await window.stateManager.loadState(slotName);
            if (savedState) {
                // 停止当前游戏
                stopTimer();
                
                // 恢复游戏状态
                gridSize = savedState.gridSize || parseInt(gridSizeSelect.value);
                gridSizeSelect.value = gridSize;
                tiles = savedState.tiles || [];
                emptyTilePos = savedState.emptyTilePos || { row: gridSize - 1, col: gridSize - 1 };
                moves = savedState.moves || 0;
                seconds = savedState.seconds || 0;
                gameStarted = savedState.gameStarted || false;
                
                // 重新渲染游戏界面
                puzzleBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
                puzzleBoard.innerHTML = '';
                
                for (let row = 0; row < gridSize; row++) {
                    for (let col = 0; col < gridSize; col++) {
                        const tile = tiles[row][col];
                        puzzleBoard.appendChild(tile.element);
                    }
                }
                
                movesCount.textContent = moves;
                timeElement.textContent = formatTime(seconds);
                
                // 如果游戏正在进行，重新启动游戏循环
                if (gameStarted) {
                    startTimer();
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
            if (window.stateManager) {
                await window.stateManager.deleteState('auto');
            }
        } catch (error) {
            console.error('清除自动保存失败:', error);
        }
    }
    
    // 暴露函数到全局作用域以便外部调用
    window.slidingPuzzleGame = {
        saveGame,
        loadGame,
        clearAutoSave,
        getCurrentState
    };
});
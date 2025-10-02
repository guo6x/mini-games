document.addEventListener('DOMContentLoaded', () => {
    // 初始化内存管理器和生命周期管理器
    const gameId = 'sudoku-game';
    const gameMemoryManager = new GameMemoryManager(gameId);
    const gameLifecycle = new GameLifecycle(gameId);
    
    // 注册错误处理回调
    GameErrorHandler.registerCallback('sudoku', (error) => {
        console.error('数独游戏错误:', error);
        if (error.severity === 'critical') {
            // 重置游戏状态
            if (typeof initGame === 'function') {
                initGame();
            }
        }
    });
    
    // 注册内存错误处理回调
    if (window.GameErrorHandler) {
        window.GameErrorHandler.registerCallback('sudoku-memory', (error) => {
            console.warn('数独游戏内存警告:', error);
        });
    }
    
    // 监听内存管理器事件
    document.addEventListener('gameMemory:lowMemory', (event) => {
        GameErrorHandler.handleError({
            type: 'memory_leak',
            message: event.detail.message,
            source: 'sudoku-game',
            severity: 'warning'
        });
    });
    
    document.addEventListener('gameMemory:error', (event) => {
        GameErrorHandler.handleError({
            type: 'memory_error',
            message: event.detail.message,
            source: 'sudoku-game',
            severity: 'error'
        });
    });
    // DOM 元素
    const sudokuGrid = document.getElementById('sudokuGrid');
    const difficultySelect = document.getElementById('difficulty');
    const newGameBtn = document.getElementById('newGame');
    const checkSolutionBtn = document.getElementById('checkSolution');
    const solveSudokuBtn = document.getElementById('solveSudoku');
    const notesToggleBtn = document.getElementById('notesToggle');
    const hintBtn = document.getElementById('hintBtn');
    const gameTimeElement = document.getElementById('gameTime');
    const mistakesElement = document.getElementById('mistakes');
    const gameOverModal = document.getElementById('gameOverModal');
    const gameOverTitle = document.getElementById('gameOverTitle');
    const gameOverMessage = document.getElementById('gameOverMessage');
    const finalTimeElement = document.getElementById('finalTime');
    const playAgainBtn = document.getElementById('playAgainBtn');
    
    // 游戏变量
    let board = []; // 当前游戏面板
    let solution = []; // 完整解决方案
    let selectedCell = null; // 当前选中的单元格
    let notesMode = false; // 笔记模式
    let gameTime = 0; // 游戏时间（秒）
    let timerInterval; // 计时器
    let mistakes = 0; // 错误次数
    let gameOver = false; // 游戏是否结束
    
    // 初始化游戏
    function initGame() {
        // 生成新的数独游戏
        generateSudoku();
        
        // 创建数独网格
        createGrid();
        
        // 重置游戏状态
        resetGameState();
        
        // 开始计时
        startTimer();
    }
    
    // 生成数独游戏
    function generateSudoku() {
        // 获取难度
        const difficulty = difficultySelect.value;
        
        // 生成完整的解决方案
        solution = generateSolution();
        
        // 根据难度移除部分数字
        board = [...solution.map(row => [...row])];
        removeNumbers(difficulty);
    }
    
    // 生成完整的数独解决方案
    function generateSolution() {
        // 创建空白数独板
        const grid = Array(9).fill().map(() => Array(9).fill(0));
        
        // 填充数独
        if (solveSudoku(grid)) {
            return grid;
        }
        
        // 如果无法生成有效的数独，返回默认数独
        return getDefaultSudoku();
    }
    
    // 解决数独（回溯算法）
    function solveSudoku(grid) {
        const emptyCell = findEmptyCell(grid);
        if (!emptyCell) {
            return true; // 数独已解决
        }
        
        const [row, col] = emptyCell;
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (let num of numbers) {
            if (isValidPlacement(grid, row, col, num)) {
                grid[row][col] = num;
                
                if (solveSudoku(grid)) {
                    return true;
                }
                
                grid[row][col] = 0; // 回溯
            }
        }
        
        return false;
    }
    
    // 查找空单元格
    function findEmptyCell(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }
    
    // 检查数字放置是否有效
    function isValidPlacement(grid, row, col, num) {
        // 检查行
        for (let c = 0; c < 9; c++) {
            if (grid[row][c] === num) {
                return false;
            }
        }
        
        // 检查列
        for (let r = 0; r < 9; r++) {
            if (grid[r][col] === num) {
                return false;
            }
        }
        
        // 检查3x3方格
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (grid[r][c] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // 随机打乱数组
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    // 根据难度移除数字
    function removeNumbers(difficulty) {
        let cellsToRemove;
        
        switch (difficulty) {
            case 'easy':
                cellsToRemove = 40; // 留下41个数字
                break;
            case 'medium':
                cellsToRemove = 50; // 留下31个数字
                break;
            case 'hard':
                cellsToRemove = 60; // 留下21个数字
                break;
            default:
                cellsToRemove = 50;
        }
        
        const positions = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                positions.push([i, j]);
            }
        }
        
        shuffleArray(positions);
        
        for (let i = 0; i < cellsToRemove; i++) {
            const [row, col] = positions[i];
            board[row][col] = 0;
        }
    }
    
    // 创建数独网格
    function createGrid() {
        // 清空网格
        sudokuGrid.innerHTML = '';
        
        // 创建单元格
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (board[row][col] !== 0) {
                    cell.textContent = board[row][col];
                    cell.classList.add('fixed');
                } else {
                    cell.addEventListener('click', () => selectCell(cell, row, col));
                }
                
                sudokuGrid.appendChild(cell);
            }
        }
    }
    
    // 选择单元格
    function selectCell(cell, row, col) {
        if (gameOver) return;
        
        // 移除之前选中的单元格
        if (selectedCell) {
            selectedCell.classList.remove('selected');
            
            // 移除相同数字的高亮
            const selectedValue = parseInt(selectedCell.textContent);
            if (selectedValue) {
                highlightSameNumbers(selectedValue, false);
            }
        }
        
        // 设置新的选中单元格
        selectedCell = cell;
        selectedCell.classList.add('selected');
        
        // 高亮相同数字
        const value = parseInt(selectedCell.textContent);
        if (value) {
            highlightSameNumbers(value, true);
        }
    }
    
    // 高亮相同数字
    function highlightSameNumbers(number, highlight) {
        const cells = document.querySelectorAll('.sudoku-cell');
        cells.forEach(cell => {
            if (parseInt(cell.textContent) === number) {
                if (highlight) {
                    cell.classList.add('same-number');
                } else {
                    cell.classList.remove('same-number');
                }
            }
        });
    }
    
    // 填入数字
    function fillNumber(number) {
        if (!selectedCell || selectedCell.classList.contains('fixed') || gameOver) return;
        
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        
        if (notesMode) {
            // 笔记模式
            toggleNote(selectedCell, number);
        } else {
            // 移除笔记
            selectedCell.innerHTML = '';
            
            // 填入数字
            if (number === 0) {
                selectedCell.textContent = '';
                selectedCell.classList.remove('error');
            } else {
                // 检查是否正确
                if (number === solution[row][col]) {
                    selectedCell.textContent = number;
                    selectedCell.classList.remove('error');
                    
                    // 高亮相同数字
                    highlightSameNumbers(number, true);
                    
                    // 检查是否完成
                    if (checkCompletion()) {
                        endGame(true);
                    }
                } else {
                    selectedCell.textContent = number;
                    selectedCell.classList.add('error');
                    
                    // 增加错误计数
                    mistakes++;
                    mistakesElement.textContent = mistakes;
                    
                    // 检查游戏结束
                    if (mistakes >= 3) {
                        endGame(false);
                    }
                }
            }
        }
    }
    
    // 切换笔记
    function toggleNote(cell, number) {
        // 如果单元格已有数字，不添加笔记
        if (cell.textContent && !cell.querySelector('.notes-container')) {
            return;
        }
        
        // 创建或获取笔记容器
        let notesContainer = cell.querySelector('.notes-container');
        if (!notesContainer) {
            cell.textContent = '';
            notesContainer = document.createElement('div');
            notesContainer.className = 'notes-container';
            cell.appendChild(notesContainer);
            
            // 创建9个笔记位置
            for (let i = 1; i <= 9; i++) {
                const note = document.createElement('div');
                note.className = 'note';
                note.dataset.number = i;
                notesContainer.appendChild(note);
            }
        }
        
        // 切换笔记
        const noteElement = notesContainer.querySelector(`.note[data-number="${number}"]`);
        if (noteElement) {
            if (noteElement.textContent === number.toString()) {
                noteElement.textContent = '';
            } else {
                noteElement.textContent = number;
            }
        }
    }
    
    // 提供提示
    function provideHint() {
        if (!selectedCell || selectedCell.classList.contains('fixed') || gameOver) return;
        
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        
        // 显示正确答案
        selectedCell.innerHTML = '';
        selectedCell.textContent = solution[row][col];
        selectedCell.classList.add('hint');
        selectedCell.classList.add('fixed');
        
        // 延迟移除提示高亮
        setTimeout(() => {
            selectedCell.classList.remove('hint');
        }, 2000);
        
        // 检查是否完成
        if (checkCompletion()) {
            endGame(true);
        }
    }
    
    // 检查完成情况
    function checkCompletion() {
        const cells = document.querySelectorAll('.sudoku-cell');
        for (let cell of cells) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            // 如果单元格为空或有错误，游戏未完成
            if (!cell.textContent || cell.classList.contains('error') || cell.querySelector('.notes-container')) {
                return false;
            }
            
            // 如果数字不正确，游戏未完成
            if (parseInt(cell.textContent) !== solution[row][col]) {
                return false;
            }
        }
        
        return true;
    }
    
    // 检查当前解答
    function checkCurrentSolution() {
        const cells = document.querySelectorAll('.sudoku-cell:not(.fixed)');
        let allCorrect = true;
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = parseInt(cell.textContent);
            
            if (!value || cell.querySelector('.notes-container')) {
                allCorrect = false;
            } else if (value !== solution[row][col]) {
                cell.classList.add('error');
                allCorrect = false;
            }
        });
        
        if (allCorrect && checkCompletion()) {
            endGame(true);
        }
    }
    
    // 显示完整解答
    function showSolution() {
        if (confirm('确定要查看答案吗？这将结束当前游戏。')) {
            const cells = document.querySelectorAll('.sudoku-cell');
            cells.forEach(cell => {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                
                cell.innerHTML = '';
                cell.textContent = solution[row][col];
                cell.classList.add('fixed');
            });
            
            endGame(false, true);
        }
    }
    
    // 结束游戏
    function endGame(isWin, isSolution = false) {
        gameOver = true;
        stopTimer();
        
        // 设置游戏结束信息
        if (isWin) {
            gameOverTitle.textContent = '恭喜！';
            gameOverMessage.textContent = '你成功完成了数独！';
        } else if (isSolution) {
            gameOverTitle.textContent = '游戏结束';
            gameOverMessage.textContent = '这是数独的解答。';
        } else {
            gameOverTitle.textContent = '游戏结束';
            gameOverMessage.textContent = '达到最大错误次数。';
        }
        
        finalTimeElement.textContent = formatTime(gameTime);
        gameOverModal.classList.add('show');
    }
    
    // 重置游戏状态
    function resetGameState() {
        selectedCell = null;
        notesMode = false;
        notesToggleBtn.classList.remove('active');
        gameTime = 0;
        mistakes = 0;
        gameOver = false;
        
        // 更新UI
        gameTimeElement.textContent = '00:00';
        mistakesElement.textContent = '0';
        
        // 隐藏游戏结束模态框
        gameOverModal.classList.remove('show');
    }
    
    // 开始计时器
    function startTimer() {
        stopTimer();
        gameTime = 0;
        timerInterval = setInterval(() => {
            gameTime++;
            gameTimeElement.textContent = formatTime(gameTime);
        }, 1000);
    }
    
    // 停止计时器
    function stopTimer() {
        clearInterval(timerInterval);
    }
    
    // 格式化时间
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // 获取默认数独（如果生成失败）
    function getDefaultSudoku() {
        return [
            [5, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 5, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ];
    }
    
    // 事件监听
    newGameBtn.addEventListener('click', initGame);
    checkSolutionBtn.addEventListener('click', checkCurrentSolution);
    solveSudokuBtn.addEventListener('click', showSolution);
    playAgainBtn.addEventListener('click', initGame);
    
    // 笔记模式切换
    notesToggleBtn.addEventListener('click', () => {
        notesMode = !notesMode;
        notesToggleBtn.classList.toggle('active', notesMode);
    });
    
    // 提示按钮
    hintBtn.addEventListener('click', provideHint);
    
    // 数字键盘
    document.querySelectorAll('.number-btn').forEach(btn => {
        const number = parseInt(btn.dataset.number);
        btn.addEventListener('click', () => fillNumber(number));
    });
    
    // 键盘输入
    document.addEventListener('keydown', (e) => {
        if (!selectedCell) return;
        
        if (e.key >= '1' && e.key <= '9') {
            fillNumber(parseInt(e.key));
        } else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') {
            fillNumber(0);
        } else if (e.key === 'n') {
            notesMode = !notesMode;
            notesToggleBtn.classList.toggle('active', notesMode);
        } else if (e.key === 'h') {
            provideHint();
        }
    });
    
    // 难度变化时重新开始游戏
    difficultySelect.addEventListener('change', initGame);
    
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
        if (gameLifecycle && typeof gameLifecycle.destroy === 'function') {
            gameLifecycle.destroy();
        }
        if (gameMemoryManager && typeof gameMemoryManager.cleanup === 'function') {
            gameMemoryManager.cleanup();
        }
    });
    
    // 启动游戏生命周期管理
    gameLifecycle.start();
    
    // 初始化游戏
    initGame();
});
document.addEventListener('DOMContentLoaded', () => {
    // 游戏ID - 用于存储和统计
    const GAME_ID = 'snake';
    
    // 初始化内存管理器和生命周期管理器
    const gameMemoryManager = new GameMemoryManager(GAME_ID);
    const gameLifecycle = new GameLifecycle(GAME_ID);
    
    // 注册统一错误处理
    GameErrorHandler.registerCallback('snake', (error) => {
        console.error('贪吃蛇游戏错误:', error);
        if (error.severity === 'critical') {
            // 重置游戏状态
            resetGame();
        }
    });
    
    // 注册错误处理回调
    gameMemoryManager.onError = (error) => {
        GameErrorHandler.handleError({
            type: 'memory_leak',
            severity: 'high',
            message: '内存管理器错误: ' + error.message,
            error: error,
            context: { component: 'GameMemoryManager' }
        }, 'snake');
    };
    
    // 注册生命周期状态变更回调
    gameLifecycle.onStateChange('error', (error) => {
        GameErrorHandler.handleError({
            type: 'game_logic',
            severity: 'medium',
            message: '生命周期管理器错误: ' + (error ? error.message : '未知错误'),
            error: error,
            context: { component: 'GameLifecycle' }
        }, 'snake');
    });
    
    // 游戏初始化配置
    const config = {
        canvasSize: 400,
        gridSize: 20,
        initialSpeed: 150,
        speedIncrement: 5,
        levelUpScore: 100,
        foodTypes: {
            normal: { color: '#ff0000', points: 10 },
            bonus: { color: '#ffcc00', points: 30 },
            special: { color: '#ff00ff', points: 50 }
        }
    };
    
    // 游戏状态对象
    const gameState = {
        snake: [{x: 10, y: 10}],
        food: {x: 15, y: 15, type: 'normal'},
        direction: 'right',
        nextDirection: 'right',
        score: 0,
        level: 1,
        speed: config.initialSpeed,
        gameLoop: null,
        isRunning: false,
        isPaused: false,
        bonusFoodTimer: null,
        bonusFoodActive: false
    };
    
    // 获取DOM元素
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const levelElement = document.getElementById('level');
    const snakeLengthElement = document.getElementById('snake-length');
    const finalScoreElement = document.getElementById('final-score');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const difficultySelect = document.getElementById('difficulty');
    const foodTypeSelect = document.getElementById('food-type');
    const gridSizeSelect = document.getElementById('grid-size');
    const gameOverScreen = document.getElementById('game-over-screen');
    const gamePausedScreen = document.getElementById('game-paused-screen');
    const gameStartScreen = document.getElementById('game-start-screen');
    
    // 初始化游戏设置
    const settings = GameConfig.getSettings();
    GameConfig.applyTheme(settings.theme);
    
    // 加载高分榜
    loadHighScores();
    
    // 游戏控制函数
    function startGame() {
        if (gameState.isRunning && !gameState.isPaused) return;
        
        if (!gameState.isRunning) {
            resetGame();
            gameState.isRunning = true;
            gameState.isPaused = false;
            
            // 获取游戏设置
            gameState.speed = parseInt(difficultySelect.value);
            config.gridSize = parseInt(gridSizeSelect.value);
            
            // 调整网格大小
            adjustGridSize();
            
            // 隐藏开始屏幕
            gameStartScreen.classList.remove('active');
            gamePausedScreen.classList.remove('active');
            
            // 播放开始音效
            GameAudio.playSound('click');
            
            // 启动优化的游戏循环
            performanceOptimizer.start();
            gameLifecycle.start();
            
            // 启动性能监控
            performanceMonitor.start();
            
            // 记录游戏开始
            if (window.gameAnalytics) {
                window.gameAnalytics.trackGameStart('snake', '贪吃蛇', {
                    difficulty: difficultySelect.value,
                    gridSize: config.gridSize
                });
            }
        } else if (gameState.isPaused) {
            resumeGame();
        }
    }
    
    function pauseGame() {
        if (!gameState.isRunning || gameState.isPaused) return;
        
        performanceOptimizer.pause();
        gameState.isPaused = true;
        gamePausedScreen.classList.add('active');
        
        // 播放暂停音效
        GameAudio.playSound('click');
    }
    
    function resumeGame() {
        if (!gameState.isRunning || !gameState.isPaused) return;
        
        gameState.isPaused = false;
        gamePausedScreen.classList.remove('active');
        performanceOptimizer.resume();
        
        // 播放继续音效
        GameAudio.playSound('click');
    }
    
    function endGame() {
        if (!gameState.isRunning) return;
        
        performanceOptimizer.stop();
        
        // 从全局监控器注销
        if (window.GlobalPerformanceMonitor) {
            window.GlobalPerformanceMonitor.unregister('snake');
        }
        
        // 停止性能监控
        performanceMonitor.stop();
        
        clearTimeout(gameState.bonusFoodTimer);
        gameState.isRunning = false;
        gameState.isPaused = false;
        gameLifecycle.stop();
        
        // 保存分数
        GameStorage.saveScore(GAME_ID, gameState.score);
        
        // 更新最高分
        const stats = GameStorage.getGameStats(GAME_ID);
        highScoreElement.textContent = stats.highestScore;
        
        // 记录游戏结束
        if (window.gameAnalytics) {
            window.gameAnalytics.trackGameEnd('snake', {
                score: gameState.score,
                level: gameState.level,
                snakeLength: gameState.snake.length,
                isNewHighScore: gameState.score === stats.highestScore
            });
        }
        
        // 显示游戏结束屏幕
        finalScoreElement.textContent = gameState.score;
        gameOverScreen.classList.add('active');
        
        // 播放结束音效
        GameAudio.playSound('failure');
        
        // 更新高分榜
        loadHighScores();
    }
    
    function resetGame() {
        // 重置游戏状态
        const centerPos = Math.floor(config.gridSize / 2);
        gameState.snake = [{x: centerPos, y: centerPos}];
        gameState.direction = 'right';
        gameState.nextDirection = 'right';
        gameState.score = 0;
        gameState.level = 1;
        gameState.speed = parseInt(difficultySelect.value);
        gameState.bonusFoodActive = false;
        
        // 停止性能优化器
        performanceOptimizer.stop();
        clearTimeout(gameState.bonusFoodTimer);
        gameLifecycle.restart();
        
        // 测量帧性能
        performanceMonitor.measureFrame();
        
        // 更新UI
        scoreElement.textContent = '0';
        levelElement.textContent = '1';
        snakeLengthElement.textContent = '1';
        
        // 隐藏游戏结束屏幕
        gameOverScreen.classList.remove('active');
        
        // 生成食物
        generateFood();
        
        // 绘制初始状态
        draw();
    }
    
    function adjustGridSize() {
        // 重新计算网格尺寸
        const cellSize = config.canvasSize / config.gridSize;
        
        // 重置蛇的位置
        const centerPos = Math.floor(config.gridSize / 2);
        gameState.snake = [{x: centerPos, y: centerPos}];
        
        // 重新生成食物
        generateFood();
    }
    
    // 初始化性能优化器
    const performanceOptimizer = new GamePerformanceOptimizer('snake', {
        targetFPS: 10,
        enableVSync: false,
        enablePerformanceMonitoring: true,
        adaptiveQuality: false
    });
    
    // 设置更新和渲染回调
    performanceOptimizer.setUpdateCallback((deltaTime) => {
        try {
            update(deltaTime);
        } catch (error) {
            GameErrorHandler.handleError({
                type: 'game_logic',
                severity: 'high',
                message: '更新错误: ' + error.message,
                error: error,
                context: { function: 'update', deltaTime }
            }, 'snake');
            endGame();
        }
    });
    
    performanceOptimizer.setRenderCallback(() => {
        try {
            draw();
        } catch (error) {
            GameErrorHandler.handleError({
                type: 'render_error',
                severity: 'high',
                message: '渲染错误: ' + error.message,
                error: error,
                context: { function: 'draw' }
            }, 'snake');
        }
    });
    
    // 初始化性能监控器
    const performanceMonitor = new GamePerformanceMonitor('snake');
    
    // 注册到全局性能监控管理器
    if (window.globalPerformanceMonitor) {
        window.globalPerformanceMonitor.registerMonitor('snake', performanceMonitor);
    }
    
    // 游戏更新逻辑
    function update(deltaTime = 100) {
        if (!gameState.isRunning || gameState.isPaused) return;
        
        moveSnake();
        checkCollision();
    }
    
    // 游戏主循环（保持向后兼容）
    function gameLoop() {
        try {
            moveSnake();
            checkCollision();
            draw();
        } catch (error) {
            GameErrorHandler.handleError({
                type: 'game_logic',
                severity: 'high',
                message: '游戏循环错误: ' + error.message,
                error: error,
                context: { function: 'gameLoop' }
            }, 'snake');
            endGame();
        }
    }
    
    // 蛇移动逻辑
    function moveSnake() {
        const head = {...gameState.snake[0]};
        gameState.direction = gameState.nextDirection;
        
        switch(gameState.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        gameState.snake.unshift(head);
        
        // 吃食物检测
        if (head.x === gameState.food.x && head.y === gameState.food.y) {
            eatFood();
        } else {
            gameState.snake.pop();
        }
        
        // 更新蛇长度显示
        snakeLengthElement.textContent = gameState.snake.length;
    }
    
    function eatFood() {
        // 根据食物类型增加分数
        const foodType = gameState.food.type;
        const points = config.foodTypes[foodType].points;
        
        // 增加分数
        gameState.score += points;
        scoreElement.textContent = gameState.score;
        
        // 播放得分音效
        GameAudio.playSound('success');
        
        // 记录游戏动作
        if (window.gameAnalytics) {
            window.gameAnalytics.trackGameAction('snake', 'eat_food', {
                foodType: foodType,
                points: points,
                currentScore: gameState.score,
                snakeLength: gameState.snake.length + 1
            });
        }
        
        // 检查是否升级
        checkLevelUp();
        
        // 如果是奖励食物，清除计时器
        if (gameState.bonusFoodActive) {
            clearTimeout(gameState.bonusFoodTimer);
            gameState.bonusFoodActive = false;
        }
        
        // 生成新食物
        generateFood();
    }
    
    function checkLevelUp() {
        const newLevel = Math.floor(gameState.score / config.levelUpScore) + 1;
        if (newLevel > gameState.level) {
            gameState.level = newLevel;
            levelElement.textContent = gameState.level;
            
            // 增加速度
            gameState.speed = Math.max(50, config.initialSpeed - (newLevel - 1) * config.speedIncrement);
            
            // 更新性能优化器的目标FPS
            const targetFPS = Math.max(5, Math.min(20, Math.floor(1000 / gameState.speed)));
            performanceOptimizer.setTargetFPS(targetFPS);
        }
    }
    
    // 碰撞检测
    function checkCollision() {
        const head = gameState.snake[0];
        
        // 检查是否撞墙
        if (head.x < 0 || head.x >= config.gridSize || head.y < 0 || head.y >= config.gridSize) {
            endGame();
            return;
        }
        
        // 检查是否撞到自己
        for (let i = 1; i < gameState.snake.length; i++) {
            if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
                endGame();
                return;
            }
        }
    }
    
    // 食物生成逻辑
    function generateFood() {
        // 确定食物类型
        let foodType = 'normal';
        const selectedFoodType = foodTypeSelect.value;
        
        if (selectedFoodType === 'bonus') {
            // 奖励模式，有30%概率生成奖励食物
            foodType = Math.random() < 0.3 ? 'bonus' : 'normal';
        } else if (selectedFoodType === 'random') {
            // 随机模式，有可能生成所有类型的食物
            const rand = Math.random();
            if (rand < 0.7) foodType = 'normal';
            else if (rand < 0.9) foodType = 'bonus';
            else foodType = 'special';
        }
        
        // 生成食物位置
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * config.gridSize),
                y: Math.floor(Math.random() * config.gridSize),
                type: foodType
            };
        } while (isSnakePosition(newFood.x, newFood.y));
        
        gameState.food = newFood;
        
        // 如果是奖励食物或特殊食物，设置计时器使其消失
        if (foodType === 'bonus' || foodType === 'special') {
            gameState.bonusFoodActive = true;
            gameState.bonusFoodTimer = gameMemoryManager.setTimeout(() => {
                if (gameState.isRunning && !gameState.isPaused) {
                    generateFood();
                }
                gameState.bonusFoodActive = false;
            }, foodType === 'bonus' ? 5000 : 3000); // 奖励食物5秒，特殊食物3秒
        }
    }
    
    function isSnakePosition(x, y) {
        return gameState.snake.some(segment => segment.x === x && segment.y === y);
    }
    
    // 绘制函数
    function draw() {
        try {
            // 计算单元格大小
            const cellSize = config.canvasSize / config.gridSize;
            
            // 清空画布
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background-color');
            ctx.fillRect(0, 0, config.canvasSize, config.canvasSize);
        
        // 绘制网格
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color') + '33'; // 33是透明度
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= config.gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(config.canvasSize, i * cellSize);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, config.canvasSize);
            ctx.stroke();
        }
        
        // 绘制食物
        const foodColor = config.foodTypes[gameState.food.type].color;
        ctx.fillStyle = foodColor;
        
        // 如果是奖励食物，添加脉动效果
        if (gameState.food.type !== 'normal') {
            const pulseSize = Math.sin(Date.now() / 200) * 0.1 + 0.9; // 0.8 到 1.0 之间脉动
            const centerX = gameState.food.x * cellSize + cellSize / 2;
            const centerY = gameState.food.y * cellSize + cellSize / 2;
            const size = cellSize * pulseSize;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, size / 2 - 1, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // 普通食物绘制为方块
            ctx.fillRect(
                gameState.food.x * cellSize + 1,
                gameState.food.y * cellSize + 1,
                cellSize - 2,
                cellSize - 2
            );
        }
        
        // 绘制蛇
        gameState.snake.forEach((segment, index) => {
            // 蛇头使用主题色，身体使用较深的颜色
            if (index === 0) {
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
            } else {
                // 根据段的位置渐变颜色
                const colorPos = index / gameState.snake.length;
                const r = 50 + Math.floor(colorPos * 50);
                const g = 150 - Math.floor(colorPos * 50);
                const b = 50;
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            }
            
            // 绘制圆角矩形
            const x = segment.x * cellSize + 1;
            const y = segment.y * cellSize + 1;
            const size = cellSize - 2;
            const radius = size / 4;
            
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + size - radius, y);
            ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
            ctx.lineTo(x + size, y + size - radius);
            ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
            ctx.lineTo(x + radius, y + size);
            ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
            
            // 为蛇头添加眼睛
            if (index === 0) {
                ctx.fillStyle = '#fff';
                
                // 根据方向确定眼睛位置
                let eyeX1, eyeY1, eyeX2, eyeY2;
                const eyeSize = cellSize / 5;
                const eyeOffset = cellSize / 4;
                
                switch(gameState.direction) {
                    case 'up':
                        eyeX1 = x + eyeOffset;
                        eyeY1 = y + eyeOffset;
                        eyeX2 = x + size - eyeOffset - eyeSize;
                        eyeY2 = y + eyeOffset;
                        break;
                    case 'down':
                        eyeX1 = x + eyeOffset;
                        eyeY1 = y + size - eyeOffset - eyeSize;
                        eyeX2 = x + size - eyeOffset - eyeSize;
                        eyeY2 = y + size - eyeOffset - eyeSize;
                        break;
                    case 'left':
                        eyeX1 = x + eyeOffset;
                        eyeY1 = y + eyeOffset;
                        eyeX2 = x + eyeOffset;
                        eyeY2 = y + size - eyeOffset - eyeSize;
                        break;
                    case 'right':
                        eyeX1 = x + size - eyeOffset - eyeSize;
                        eyeY1 = y + eyeOffset;
                        eyeX2 = x + size - eyeOffset - eyeSize;
                        eyeY2 = y + size - eyeOffset - eyeSize;
                        break;
                }
                
                // 绘制眼睛
                ctx.beginPath();
                ctx.arc(eyeX1 + eyeSize/2, eyeY1 + eyeSize/2, eyeSize/2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(eyeX2 + eyeSize/2, eyeY2 + eyeSize/2, eyeSize/2, 0, Math.PI * 2);
                ctx.fill();
                
                // 绘制瞳孔
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(eyeX1 + eyeSize/2, eyeY1 + eyeSize/2, eyeSize/4, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(eyeX2 + eyeSize/2, eyeY2 + eyeSize/2, eyeSize/4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        } catch (error) {
            GameErrorHandler.handleError({
                type: 'render_error',
                severity: 'high',
                message: '渲染错误: ' + error.message,
                error: error,
                context: { function: 'draw' }
            }, 'snake');
        }
    }
    
    // 加载高分榜
    function loadHighScores() {
        const highScores = GameStorage.getHighScores(GAME_ID);
        const highScoresBody = document.getElementById('highscores-body');
        
        // 清空现有内容
        highScoresBody.innerHTML = '';
        
        // 获取最高分
        const stats = GameStorage.getGameStats(GAME_ID);
        highScoreElement.textContent = stats.highestScore || '0';
        
        if (highScores.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4" style="text-align: center;">暂无记录</td>';
            highScoresBody.appendChild(row);
            return;
        }
        
        // 添加高分记录
        highScores.forEach((score, index) => {
            const row = document.createElement('tr');
            const date = new Date(score.date);
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${score.name}</td>
                <td>${score.score}</td>
                <td>${formattedDate}</td>
            `;
            
            highScoresBody.appendChild(row);
        });
    }
    
    // 事件监听
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (!gameState.isRunning || gameState.isPaused) return;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (gameState.direction !== 'down') gameState.nextDirection = 'up';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (gameState.direction !== 'up') gameState.nextDirection = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (gameState.direction !== 'right') gameState.nextDirection = 'left';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (gameState.direction !== 'left') gameState.nextDirection = 'right';
                break;
            case 'p':
            case 'P':
                if (gameState.isPaused) resumeGame();
                else pauseGame();
                break;
        }
    });
    
    // 按钮控制
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    resumeBtn.addEventListener('click', resumeGame);
    pauseBtn.addEventListener('click', () => {
        if (gameState.isPaused) resumeGame();
        else pauseGame();
    });
    
    // 方向按钮控制
    upBtn.addEventListener('click', () => {
        if (gameState.direction !== 'down') gameState.nextDirection = 'up';
    });
    
    downBtn.addEventListener('click', () => {
        if (gameState.direction !== 'up') gameState.nextDirection = 'down';
    });
    
    leftBtn.addEventListener('click', () => {
        if (gameState.direction !== 'right') gameState.nextDirection = 'left';
    });
    
    rightBtn.addEventListener('click', () => {
        if (gameState.direction !== 'left') gameState.nextDirection = 'right';
    });
    
    // 游戏设置变更
    difficultySelect.addEventListener('change', () => {
        if (gameState.isRunning) {
            gameState.speed = parseInt(difficultySelect.value);
            const targetFPS = Math.max(5, Math.min(20, Math.floor(1000 / gameState.speed)));
            performanceOptimizer.setTargetFPS(targetFPS);
        }
    });
    
    gridSizeSelect.addEventListener('change', () => {
        if (!gameState.isRunning) {
            config.gridSize = parseInt(gridSizeSelect.value);
            adjustGridSize();
            draw();
        }
    });
    
    // 窗口大小改变时重新绘制
    window.addEventListener('resize', () => {
        if (gameState.isRunning || gameState.snake.length > 1) {
            draw();
        }
    });
    
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
        gameLifecycle.destroy();
        gameMemoryManager.destroy();
    });
    
    // 初始化游戏
    resetGame();
    
    /**
     * 获取当前游戏状态
     */
    function getCurrentState() {
        return {
            snake: [...gameState.snake],
            direction: gameState.direction,
            nextDirection: gameState.nextDirection,
            food: { ...gameState.food },
            score: gameState.score,
            level: gameState.level,
            speed: gameState.speed,
            isRunning: gameState.isRunning,
            isPaused: gameState.isPaused,
            timestamp: Date.now()
        };
    }
    
    /**
     * 更新状态管理器的当前状态
     */
    function updateCurrentState() {
        if (window.GameStateManager && gameState.isRunning) {
            window.GameStateManager.currentState = getCurrentState();
        }
    }
    
    /**
     * 加载自动保存的游戏状态
     */
    async function loadAutoSave() {
        try {
            if (!window.GameStateManager) return;
            
            const savedState = await window.GameStateManager.loadState('auto');
            if (savedState && savedState.isRunning) {
                // 恢复游戏状态
                gameState.snake = savedState.snake || [{x: 10, y: 10}];
                gameState.direction = savedState.direction || 'right';
                gameState.nextDirection = savedState.nextDirection || 'right';
                gameState.food = savedState.food || {x: 15, y: 15, type: 'normal'};
                gameState.score = savedState.score || 0;
                gameState.level = savedState.level || 1;
                gameState.speed = savedState.speed || config.initialSpeed;
                gameState.isRunning = savedState.isRunning || false;
                gameState.isPaused = savedState.isPaused || false;
                
                // 更新显示
                scoreElement.textContent = gameState.score;
                levelElement.textContent = gameState.level;
                snakeLengthElement.textContent = gameState.snake.length;
                draw();
                
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
            if (!window.GameStateManager) {
                alert('状态管理器未初始化');
                return;
            }
            
            const success = await window.GameStateManager.saveState(getCurrentState(), slotName, {
                playerLevel: gameState.level,
                playTime: Date.now() - (gameState.gameStartTime || Date.now())
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
            if (!window.GameStateManager) {
                alert('状态管理器未初始化');
                return;
            }
            
            const savedState = await window.GameStateManager.loadState(slotName);
            if (savedState) {
                // 停止当前游戏
                performanceOptimizer.stop();
                
                // 恢复游戏状态
                gameState.snake = savedState.snake || [{x: 10, y: 10}];
                gameState.direction = savedState.direction || 'right';
                gameState.nextDirection = savedState.nextDirection || 'right';
                gameState.food = savedState.food || {x: 15, y: 15, type: 'normal'};
                gameState.score = savedState.score || 0;
                gameState.level = savedState.level || 1;
                gameState.speed = savedState.speed || config.initialSpeed;
                gameState.isRunning = savedState.isRunning || false;
                gameState.isPaused = savedState.isPaused || false;
                
                // 更新显示
                scoreElement.textContent = gameState.score;
                levelElement.textContent = gameState.level;
                snakeLengthElement.textContent = gameState.snake.length;
                draw();
                
                // 如果游戏正在运行，重新启动游戏循环
                if (gameState.isRunning) {
                    performanceOptimizer.start();
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
            if (window.GameStateManager) {
                await window.GameStateManager.deleteState('auto');
            }
        } catch (error) {
            console.error('清除自动保存失败:', error);
        }
    }
    
    // 暴露保存/加载函数到全局作用域
    window.snakeGameSave = saveGame;
    window.snakeGameLoad = loadGame;
    window.snakeGameClearAutoSave = clearAutoSave;
});
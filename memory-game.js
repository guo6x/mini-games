document.addEventListener('DOMContentLoaded', () => {
    // 初始化内存管理器和生命周期管理器
    const gameId = 'memory-game';
    const gameMemoryManager = new GameMemoryManager(gameId);
    const gameLifecycle = new GameLifecycle(gameId);
    
    // 注册错误处理回调
    GameErrorHandler.registerCallback((errorInfo) => {
      console.error('游戏错误:', errorInfo);
      // 可以在这里添加更多的错误处理逻辑
    });
    
    // 注册内存管理器错误处理
    if (window.GameErrorHandler) {
        // 内存管理器错误处理已通过GameErrorHandler统一管理
    }
    
    // 生命周期错误处理
    if (gameLifecycle.handleError) {
        // 生命周期错误处理已内置
    }
    
    const memoryGame = document.getElementById('memory-game');
    const movesCount = document.getElementById('moves-count');
    const timeValue = document.getElementById('time');
    const difficultySelect = document.getElementById('difficulty');
    const restartButton = document.getElementById('restart');
    const gameOverScreen = document.getElementById('game-over');
    const finalMoves = document.getElementById('final-moves');
    const finalTime = document.getElementById('final-time');
    const playAgainButton = document.getElementById('play-again');
    
    let cards = [];
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let moves = 0;
    let gameStarted = false;
    let matchedPairs = 0;
    let totalPairs = 0;
    let timer;
    let seconds = 0;
    
    // 表情符号作为卡片内容
    const emojis = [
        '🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
        '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
        '🐧', '🐦', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗'
    ];
    
    // 根据难度设置游戏布局
    function setupGameLayout() {
        clearInterval(timer);
        seconds = 0;
        timeValue.textContent = '0';
        moves = 0;
        movesCount.textContent = '0';
        matchedPairs = 0;
        
        // 重启游戏生命周期
        gameLifecycle.restart();
        
        let rows, cols;
        const difficulty = difficultySelect.value;
        
        if (difficulty === 'easy') {
            rows = 3;
            cols = 4;
        } else if (difficulty === 'medium') {
            rows = 4;
            cols = 4;
        } else if (difficulty === 'hard') {
            rows = 4;
            cols = 6;
        }
        
        totalPairs = (rows * cols) / 2;
        
        // 设置网格布局
        memoryGame.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        memoryGame.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        // 准备卡片数据
        createCards(rows * cols);
    }
    
    // 创建卡片
    function createCards(cardCount) {
        memoryGame.innerHTML = '';
        cards = [];
        
        // 选择需要的表情符号数量
        const selectedEmojis = emojis.slice(0, cardCount / 2);
        
        // 创建成对的卡片
        const cardValues = [...selectedEmojis, ...selectedEmojis];
        
        // 随机排序卡片
        shuffleArray(cardValues);
        
        // 创建卡片元素
        cardValues.forEach((value, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.value = value;
            card.dataset.index = index;
            
            const cardFront = document.createElement('div');
            cardFront.classList.add('card-front');
            cardFront.textContent = value;
            
            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');
            cardBack.textContent = '?';
            
            card.appendChild(cardFront);
            card.appendChild(cardBack);
            
            card.addEventListener('click', flipCard);
            
            memoryGame.appendChild(card);
            cards.push(card);
        });
    }
    
    // 洗牌算法
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // 翻牌
    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        
        this.classList.add('flip');
        
        if (!gameStarted) {
            startTimer();
            gameStarted = true;
        }
        
        if (!firstCard) {
            firstCard = this;
            return;
        }
        
        secondCard = this;
        incrementMoves();
        
        checkForMatch();
    }
    
    // 检查是否匹配
    function checkForMatch() {
        const isMatch = firstCard.dataset.value === secondCard.dataset.value;
        
        if (isMatch) {
            disableCards();
            matchedPairs++;
            
            if (matchedPairs === totalPairs) {
                endGame();
            }
        } else {
            unflipCards();
        }
    }
    
    // 禁用匹配的卡片
    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        resetBoard();
    }
    
    // 翻回不匹配的卡片
    function unflipCards() {
        lockBoard = true;
        
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            
            resetBoard();
        }, 1000);
    }
    
    // 重置翻牌状态
    function resetBoard() {
        [firstCard, secondCard] = [null, null];
        lockBoard = false;
    }
    
    // 开始计时器
    function startTimer() {
        // 初始化性能优化器
        const performanceOptimizer = new GamePerformanceOptimizer('memory-game', {
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
                    game: 'memory-game',
                    deltaTime
                });
            }
        });
        
        // 注册到全局性能监控器
        if (window.GlobalPerformanceMonitor) {
            window.GlobalPerformanceMonitor.register('memory-game', performanceOptimizer);
        }
        
        // 初始化性能监控器
        if (!window.memoryGameMonitor) {
            window.memoryGameMonitor = new GamePerformanceMonitor('memory-game');
            
            // 注册到全局性能监控管理器
            if (window.globalPerformanceMonitor) {
                window.globalPerformanceMonitor.registerMonitor('memory-game', window.memoryGameMonitor);
            }
        }
        
        clearInterval(timer);
        performanceOptimizer.start();
        
        // 启动性能监控
        if (window.memoryGameMonitor) {
            window.memoryGameMonitor.start();
        }
        
        // 启动游戏生命周期
        if (!gameStarted) {
            gameLifecycle.start();
        }
    }
    
    // 更新计时器
    function updateTimer(deltaTime = 1000) {
        // 累积时间用于控制更新频率
        let timerAccumulator = (updateTimer.timerAccumulator || 0) + deltaTime;
        updateTimer.timerAccumulator = timerAccumulator;
        
        // 每秒更新一次计时器
        if (timerAccumulator >= 1000) {
            updateTimer.timerAccumulator = 0;
            seconds++;
            timeValue.textContent = seconds;
        }
    }
    
    // 增加步数
    function incrementMoves() {
        moves++;
        movesCount.textContent = moves;
    }
    
    // 游戏结束
    function endGame() {
        clearInterval(timer);
        gameStarted = false;
        
        // 停止性能优化器
        if (window.GlobalPerformanceMonitor) {
            window.GlobalPerformanceMonitor.unregister('memory-game');
        }
        
        // 停止性能监控
        if (window.memoryGameMonitor) {
            window.memoryGameMonitor.stop();
        }
        
        // 停止游戏生命周期
        gameLifecycle.stop();
        
        finalMoves.textContent = moves;
        finalTime.textContent = seconds;
        
        setTimeout(() => {
            gameOverScreen.classList.add('visible');
        }, 500);
    }
    
    /**
     * 获取当前游戏状态
     */
    function getCurrentState() {
        return {
            cards: cards.map(card => ({
                value: card.dataset.value,
                index: card.dataset.index,
                isFlipped: card.classList.contains('flip')
            })),
            firstCard: firstCard ? firstCard.dataset.index : null,
            secondCard: secondCard ? secondCard.dataset.index : null,
            lockBoard: lockBoard,
            moves: moves,
            gameStarted: gameStarted,
            matchedPairs: matchedPairs,
            totalPairs: totalPairs,
            seconds: seconds,
            difficulty: difficultySelect.value,
            timestamp: Date.now()
        };
    }
    
    /**
     * 手动保存游戏状态
     */
    async function saveGame(slotName = 'manual') {
        try {
            const gameState = getCurrentState();
            localStorage.setItem(`memoryGame_${slotName}`, JSON.stringify(gameState));
            alert('游戏已保存！');
        } catch (error) {
            console.error('保存游戏失败:', error);
            alert('保存失败，请重试。');
        }
    }
    
    /**
     * 手动加载游戏状态
     */
    async function loadGame(slotName = 'manual') {
        try {
            const savedData = localStorage.getItem(`memoryGame_${slotName}`);
            if (savedData) {
                const gameState = JSON.parse(savedData);
                
                // 恢复游戏状态
                difficultySelect.value = gameState.difficulty;
                setupGameLayout();
                
                moves = gameState.moves;
                gameStarted = gameState.gameStarted;
                matchedPairs = gameState.matchedPairs;
                seconds = gameState.seconds;
                
                movesCount.textContent = moves;
                timeValue.textContent = seconds;
                
                // 恢复卡片状态
                gameState.cards.forEach((cardState, index) => {
                    if (cardState.isFlipped && cards[index]) {
                        cards[index].classList.add('flip');
                    }
                });
                
                alert('游戏已加载！');
            } else {
                alert('未找到保存的游戏。');
            }
        } catch (error) {
            console.error('加载游戏失败:', error);
            alert('加载失败，请重试。');
        }
    }
    
    // 重新开始游戏
    function restartGame() {
        gameOverScreen.classList.remove('visible');
        resetBoard();
        setupGameLayout();
        gameStarted = false;
    }
    
    // 事件监听
    difficultySelect.addEventListener('change', setupGameLayout);
    restartButton.addEventListener('click', restartGame);
    playAgainButton.addEventListener('click', restartGame);
    
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
        if (gameLifecycle.destroy) {
            gameLifecycle.destroy();
        }
        if (gameMemoryManager.cleanup) {
            gameMemoryManager.cleanup();
        }
    });
    
    // 初始化游戏
    setupGameLayout();
    
    // 暴露保存和加载函数到全局作用域
    window.saveMemoryGame = saveGame;
    window.loadMemoryGame = loadGame;
});
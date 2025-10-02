document.addEventListener('DOMContentLoaded', () => {
    // 初始化内存管理器和生命周期管理器
    const gameId = 'hangman-game';
    const gameMemoryManager = new GameMemoryManager(gameId);
    const gameLifecycle = new GameLifecycle(gameId);
    
    // 注册错误处理回调
    GameErrorHandler.registerCallback('hangman', (error) => {
        console.error('猜词游戏错误:', error);
        if (error.severity === 'critical') {
            // 重置游戏状态
            if (typeof initGame === 'function') {
                initGame();
            }
        }
    });
    
    // 注册内存错误处理
    if (window.GameErrorHandler) {
        window.GameErrorHandler.registerCallback('hangman-memory', (error) => {
            console.warn('猜词游戏内存警告:', error);
        });
    }
    // DOM 元素
    const wordDisplay = document.getElementById('word-display');
    const keyboard = document.getElementById('keyboard');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const remainingTriesElement = document.getElementById('remaining-tries');
    const difficultySelect = document.getElementById('difficulty');
    const categorySelect = document.getElementById('category');
    const newGameBtn = document.getElementById('new-game-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const resultMessage = document.getElementById('result-message');
    const correctWordElement = document.getElementById('correct-word');
    const finalScoreElement = document.getElementById('final-score');
    
    // 游戏变量
    let currentWord = '';
    let guessedLetters = [];
    let wrongGuesses = 0;
    let score = 0;
    let highScore = localStorage.getItem('hangmanHighScore') || 0;
    const maxWrongGuesses = 6;
    let gameOver = false;
    
    // 单词库
    const wordDatabase = {
        animals: {
            easy: ['猫', '狗', '牛', '猪', '鸡', '鸭', '鱼', '羊', '鼠', '虎'],
            medium: ['大象', '长颈鹿', '狮子', '老虎', '熊猫', '猴子', '兔子', '狐狸', '浣熊', '刺猬'],
            hard: ['海豚', '鲸鱼', '章鱼', '袋鼠', '考拉', '犀牛', '河马', '斑马', '鳄鱼', '蜥蜴']
        },
        fruits: {
            easy: ['苹果', '香蕉', '橙子', '梨', '桃', '葡萄', '西瓜', '柠檬', '草莓', '樱桃'],
            medium: ['菠萝', '芒果', '猕猴桃', '蓝莓', '柚子', '石榴', '李子', '杏', '无花果', '椰子'],
            hard: ['火龙果', '山竹', '榴莲', '番荔枝', '百香果', '杨桃', '莲雾', '蛇皮果', '红毛丹', '罗汉果']
        },
        countries: {
            easy: ['中国', '美国', '英国', '法国', '德国', '日本', '韩国', '俄罗斯', '加拿大', '澳大利亚'],
            medium: ['巴西', '墨西哥', '印度', '南非', '埃及', '泰国', '新加坡', '瑞士', '瑞典', '挪威'],
            hard: ['阿根廷', '哥伦比亚', '委内瑞拉', '印度尼西亚', '马来西亚', '葡萄牙', '希腊', '土耳其', '芬兰', '丹麦']
        },
        sports: {
            easy: ['足球', '篮球', '排球', '网球', '棒球', '乒乓球', '羽毛球', '游泳', '跑步', '跳高'],
            medium: ['高尔夫', '橄榄球', '曲棍球', '拳击', '摔跤', '举重', '射箭', '马拉松', '跳水', '体操'],
            hard: ['铁人三项', '帆船', '冰球', '滑雪', '攀岩', '击剑', '柔道', '空手道', '跆拳道', '武术']
        }
    };
    
    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        guessedLetters = [];
        wrongGuesses = 0;
        gameOver = false;
        
        // 更新剩余尝试次数
        remainingTriesElement.textContent = maxWrongGuesses;
        
        // 隐藏所有人物部分
        document.querySelectorAll('.hangman-part').forEach(part => {
            part.style.opacity = '0';
        });
        
        // 选择单词
        selectRandomWord();
        
        // 显示单词占位符
        displayWord();
        
        // 生成键盘
        generateKeyboard();
        
        // 隐藏游戏结束模态框
        gameOverModal.classList.remove('show');
    }
    
    // 选择随机单词
    function selectRandomWord() {
        const category = categorySelect.value;
        const difficulty = difficultySelect.value;
        
        const words = wordDatabase[category][difficulty];
        currentWord = words[Math.floor(Math.random() * words.length)];
    }
    
    // 显示单词
    function displayWord() {
        wordDisplay.innerHTML = '';
        
        // 创建字母框
        for (let i = 0; i < currentWord.length; i++) {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            
            // 如果字母已经被猜到，显示字母
            if (guessedLetters.includes(currentWord[i])) {
                letterBox.textContent = currentWord[i];
            }
            
            wordDisplay.appendChild(letterBox);
        }
    }
    
    // 生成键盘
    function generateKeyboard() {
        keyboard.innerHTML = '';
        
        // 创建中文拼音键盘
        const keys = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
        ];
        
        keys.forEach(key => {
            const keyButton = document.createElement('div');
            keyButton.className = 'key';
            keyButton.textContent = key;
            
            // 如果字母已经被猜过，添加相应的类
            if (guessedLetters.includes(key)) {
                if (currentWord.includes(key)) {
                    keyButton.classList.add('correct');
                } else {
                    keyButton.classList.add('wrong');
                }
            }
            
            // 添加点击事件
            keyButton.addEventListener('click', () => {
                handleGuess(key);
            });
            
            keyboard.appendChild(keyButton);
        });
    }
    
    // 处理猜测
    function handleGuess(letter) {
        // 如果游戏已结束或字母已经被猜过，不做任何操作
        if (gameOver || guessedLetters.includes(letter)) {
            return;
        }
        
        // 添加到已猜字母列表
        guessedLetters.push(letter);
        
        // 更新键盘
        const keyElement = document.querySelector(`.key:nth-child(${guessedLetters.length})`);
        
        // 检查猜测是否正确
        if (currentWord.includes(letter)) {
            // 正确猜测
            keyElement.classList.add('correct');
            
            // 更新分数
            score += 10;
            scoreElement.textContent = score;
            
            // 更新最高分
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('hangmanHighScore', highScore);
            }
        } else {
            // 错误猜测
            keyElement.classList.add('wrong');
            wrongGuesses++;
            
            // 更新剩余尝试次数
            remainingTriesElement.textContent = maxWrongGuesses - wrongGuesses;
            
            // 显示对应的人物部分
            document.getElementById(`part-${wrongGuesses + 4}`).style.opacity = '1';
            
            // 检查游戏是否结束
            if (wrongGuesses >= maxWrongGuesses) {
                endGame(false);
                return;
            }
        }
        
        // 更新单词显示
        displayWord();
        
        // 检查是否获胜
        checkWin();
    }
    
    // 检查是否获胜
    function checkWin() {
        // 如果所有字母都被猜到，游戏胜利
        const isWin = [...currentWord].every(letter => guessedLetters.includes(letter));
        
        if (isWin) {
            // 额外奖励分数
            const bonusScore = (maxWrongGuesses - wrongGuesses) * 20;
            score += bonusScore;
            scoreElement.textContent = score;
            
            // 更新最高分
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('hangmanHighScore', highScore);
            }
            
            endGame(true);
        }
    }
    
    // 结束游戏
    function endGame(isWin) {
        gameOver = true;
        
        // 更新结果信息
        if (isWin) {
            resultMessage.textContent = '恭喜你赢了！';
        } else {
            resultMessage.textContent = '游戏结束！';
        }
        
        correctWordElement.textContent = currentWord;
        finalScoreElement.textContent = score;
        
        // 显示游戏结束模态框
        gameOverModal.classList.add('show');
    }
    
    // 事件监听
    newGameBtn.addEventListener('click', () => {
        initGame();
    });
    
    playAgainBtn.addEventListener('click', () => {
        initGame();
    });
    
    // 键盘事件
    document.addEventListener('keydown', (e) => {
        if (gameOver) return;
        
        const key = e.key.toLowerCase();
        if (/^[a-z]$/.test(key)) {
            handleGuess(key);
        }
    });
    
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
    
    // 初始化
    highScoreElement.textContent = highScore;
    initGame();
});
/**
 * 小游戏集合 - 统一游戏配置和存档系统
 * 提供游戏配置、主题切换、数据存储和统计功能
 */

// 游戏配置管理
const GameConfig = {
    // 主题设置
    themes: {
        light: {
            background: '#f4f4f4',
            cardBackground: '#ffffff',
            textColor: '#333333',
            primaryColor: '#3498db',
            secondaryColor: '#2c3e50',
            accentColor: '#e74c3c'
        },
        dark: {
            background: '#2c3e50',
            cardBackground: '#34495e',
            textColor: '#ecf0f1',
            primaryColor: '#3498db',
            secondaryColor: '#1a2530',
            accentColor: '#e74c3c'
        },
        colorful: {
            background: '#f9f9f9',
            cardBackground: '#ffffff',
            textColor: '#333333',
            primaryColor: '#9b59b6',
            secondaryColor: '#16a085',
            accentColor: '#f1c40f'
        }
    },
    
    // 默认设置
    defaultSettings: {
        theme: 'light',
        soundEnabled: true,
        musicEnabled: true,
        difficulty: 'normal',
        language: 'zh-CN'
    },
    
    // 获取当前设置
    getSettings() {
        const savedSettings = localStorage.getItem('gameSettings');
        return savedSettings ? JSON.parse(savedSettings) : this.defaultSettings;
    },
    
    // 保存设置
    saveSettings(settings) {
        localStorage.setItem('gameSettings', JSON.stringify(settings));
    },
    
    // 应用主题
    applyTheme(themeName) {
        const theme = this.themes[themeName] || this.themes.light;
        const root = document.documentElement;
        
        root.style.setProperty('--background-color', theme.background);
        root.style.setProperty('--card-background', theme.cardBackground);
        root.style.setProperty('--text-color', theme.textColor);
        root.style.setProperty('--primary-color', theme.primaryColor);
        root.style.setProperty('--secondary-color', theme.secondaryColor);
        root.style.setProperty('--accent-color', theme.accentColor);
        
        // 保存当前主题设置
        const settings = this.getSettings();
        settings.theme = themeName;
        this.saveSettings(settings);
    }
};

// 游戏数据存储系统
const GameStorage = {
    // 保存游戏数据
    saveGameData(gameId, data) {
        localStorage.setItem(`game_${gameId}`, JSON.stringify(data));
    },
    
    // 获取游戏数据
    getGameData(gameId) {
        const savedData = localStorage.getItem(`game_${gameId}`);
        return savedData ? JSON.parse(savedData) : null;
    },
    
    // 清除游戏数据
    clearGameData(gameId) {
        localStorage.removeItem(`game_${gameId}`);
    },
    
    // 保存游戏分数
    saveScore(gameId, score, playerName = '玩家') {
        const highScores = this.getHighScores(gameId);
        highScores.push({ name: playerName, score, date: new Date().toISOString() });
        
        // 按分数降序排序
        highScores.sort((a, b) => b.score - a.score);
        
        // 只保留前10名
        const topScores = highScores.slice(0, 10);
        localStorage.setItem(`highscores_${gameId}`, JSON.stringify(topScores));
        
        // 更新总统计
        this.updateGameStats(gameId, score);
    },
    
    // 获取高分榜
    getHighScores(gameId) {
        const scores = localStorage.getItem(`highscores_${gameId}`);
        return scores ? JSON.parse(scores) : [];
    },
    
    // 更新游戏统计
    updateGameStats(gameId, score) {
        const statsKey = `stats_${gameId}`;
        const stats = this.getGameStats(gameId);
        
        stats.totalPlays += 1;
        stats.totalScore += score;
        stats.highestScore = Math.max(stats.highestScore, score);
        stats.lastPlayed = new Date().toISOString();
        
        localStorage.setItem(statsKey, JSON.stringify(stats));
    },
    
    // 获取游戏统计
    getGameStats(gameId) {
        const statsKey = `stats_${gameId}`;
        const savedStats = localStorage.getItem(statsKey);
        
        if (savedStats) {
            return JSON.parse(savedStats);
        }
        
        // 默认统计数据
        return {
            totalPlays: 0,
            totalScore: 0,
            highestScore: 0,
            lastPlayed: null
        };
    },
    
    // 获取所有游戏统计
    getAllGameStats() {
        const stats = {};
        const games = [
            'memory-game', 'tic-tac-toe', 'tetris', 'minesweeper', 'snake',
            'brick-breaker', 'sudoku', 'flappy-bird', '2048', 'hangman',
            'sliding-puzzle', 'plane-combat', 'space-shooter', 'gomoku'
        ];
        
        games.forEach(gameId => {
            stats[gameId] = this.getGameStats(gameId);
        });
        
        return stats;
    }
};

// 统一音效系统
const GameAudio = {
    sounds: {},
    music: null,
    
    // 初始化音效
    init() {
        // 预加载常用音效
        this.loadSound('click', 'sounds/click.mp3');
        this.loadSound('success', 'sounds/success.mp3');
        this.loadSound('failure', 'sounds/failure.mp3');
    },
    
    // 加载音效
    loadSound(id, url) {
        const sound = new Audio(url);
        this.sounds[id] = sound;
        return sound;
    },
    
    // 播放音效
    playSound(id) {
        const settings = GameConfig.getSettings();
        if (!settings.soundEnabled) return;
        
        if (this.sounds[id]) {
            this.sounds[id].currentTime = 0;
            this.sounds[id].play().catch(e => console.log('音效播放失败:', e));
        }
    },
    
    // 播放背景音乐
    playMusic(url) {
        const settings = GameConfig.getSettings();
        if (!settings.musicEnabled) return;
        
        if (this.music) {
            this.music.pause();
        }
        
        this.music = new Audio(url);
        this.music.loop = true;
        this.music.volume = 0.5;
        this.music.play().catch(e => console.log('音乐播放失败:', e));
    },
    
    // 停止背景音乐
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music = null;
        }
    }
};

// 创建设置面板
function createSettingsPanel() {
    // 如果已存在则返回
    if (document.getElementById('settings-panel')) return;
    
    const settings = GameConfig.getSettings();
    
    // 创建设置面板
    const panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.className = 'settings-panel';
    
    // 面板标题
    const title = document.createElement('h2');
    title.textContent = '游戏设置';
    panel.appendChild(title);
    
    // 主题选择
    const themeContainer = document.createElement('div');
    themeContainer.className = 'settings-group';
    
    const themeLabel = document.createElement('label');
    themeLabel.textContent = '主题:';
    themeContainer.appendChild(themeLabel);
    
    const themeSelect = document.createElement('select');
    themeSelect.id = 'theme-select';
    
    const themes = [
        { value: 'light', text: '亮色主题' },
        { value: 'dark', text: '暗色主题' },
        { value: 'colorful', text: '彩色主题' }
    ];
    
    themes.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme.value;
        option.textContent = theme.text;
        if (settings.theme === theme.value) {
            option.selected = true;
        }
        themeSelect.appendChild(option);
    });
    
    themeSelect.addEventListener('change', () => {
        GameConfig.applyTheme(themeSelect.value);
    });
    
    themeContainer.appendChild(themeSelect);
    panel.appendChild(themeContainer);
    
    // 音效设置
    const soundContainer = document.createElement('div');
    soundContainer.className = 'settings-group';
    
    const soundCheck = document.createElement('input');
    soundCheck.type = 'checkbox';
    soundCheck.id = 'sound-toggle';
    soundCheck.checked = settings.soundEnabled;
    
    const soundLabel = document.createElement('label');
    soundLabel.htmlFor = 'sound-toggle';
    soundLabel.textContent = '音效';
    
    soundCheck.addEventListener('change', () => {
        const currentSettings = GameConfig.getSettings();
        currentSettings.soundEnabled = soundCheck.checked;
        GameConfig.saveSettings(currentSettings);
    });
    
    soundContainer.appendChild(soundCheck);
    soundContainer.appendChild(soundLabel);
    panel.appendChild(soundContainer);
    
    // 音乐设置
    const musicContainer = document.createElement('div');
    musicContainer.className = 'settings-group';
    
    const musicCheck = document.createElement('input');
    musicCheck.type = 'checkbox';
    musicCheck.id = 'music-toggle';
    musicCheck.checked = settings.musicEnabled;
    
    const musicLabel = document.createElement('label');
    musicLabel.htmlFor = 'music-toggle';
    musicLabel.textContent = '背景音乐';
    
    musicCheck.addEventListener('change', () => {
        const currentSettings = GameConfig.getSettings();
        currentSettings.musicEnabled = musicCheck.checked;
        GameConfig.saveSettings(currentSettings);
        
        if (!musicCheck.checked) {
            GameAudio.stopMusic();
        }
    });
    
    musicContainer.appendChild(musicCheck);
    musicContainer.appendChild(musicLabel);
    panel.appendChild(musicContainer);
    
    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.className = 'close-settings';
    closeBtn.addEventListener('click', () => {
        panel.classList.remove('show');
    });
    
    panel.appendChild(closeBtn);
    document.body.appendChild(panel);
    
    return panel;
}

// 创建设置按钮
function createSettingsButton() {
    const btn = document.createElement('button');
    btn.id = 'settings-button';
    btn.className = 'settings-button';
    btn.innerHTML = '⚙️';
    btn.title = '设置';
    
    btn.addEventListener('click', () => {
        const panel = document.getElementById('settings-panel') || createSettingsPanel();
        panel.classList.toggle('show');
    });
    
    document.body.appendChild(btn);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 给当前页面导航项添加active类
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.game-nav a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
    
    // 简单的动画效果
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('show');
        }, 100 * index);
    });
    
    // 应用保存的主题
    const settings = GameConfig.getSettings();
    GameConfig.applyTheme(settings.theme);
    
    // 创建设置按钮和面板
    createSettingsButton();
    
    // 尝试创建声音文件夹（如果不存在）
    try {
        GameAudio.init();
    } catch (e) {
        console.log('音效系统初始化失败，可能需要创建声音文件夹');
    }
});

let moves = 0;
let timeValue = 0;
let cards = [];
let interval;
let firstCard = false;
let secondCard = false;

// 获取DOM元素（添加null检查）
const movesCount = document.getElementById("moves-count");
const timeValue_span = document.getElementById("time");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const gameContainer = document.getElementById("game-container");
const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");

// 如果不是记忆游戏页面，则不执行记忆游戏相关代码
if (!movesCount || !timeValue_span || !startButton || !stopButton || !gameContainer || !result || !controls) {
    // 不是记忆游戏页面，跳过记忆游戏初始化
} else {

// 卡片图案（使用emoji表情）
const items = [
    "🐶", "🐱", "🐭", "🐹",
    "🐰", "🦊", "🐻", "🐼"
];

// 计时器
const timeGenerator = () => {
    timeValue += 1;
    timeValue_span.textContent = timeValue;
};

// 计算移动次数
const movesCounter = () => {
    moves += 1;
    movesCount.textContent = moves;
};

// 生成随机卡片
const generateRandom = (size = 4) => {
    let tempArray = [...items, ...items];
    let cardValues = [];
    size = (size * size) / 2;
    for (let i = 0; i < size; i++) {
        const randomIndex = Math.floor(Math.random() * tempArray.length);
        cardValues.push(tempArray[randomIndex]);
        tempArray.splice(randomIndex, 1);
    }
    return cardValues;
};

const matrixGenerator = (cardValues, size = 4) => {
    gameContainer.innerHTML = "";
    cardValues = [...cardValues, ...cardValues];
    cardValues.sort(() => Math.random() - 0.5);
    for (let i = 0; i < size * size; i++) {
        gameContainer.innerHTML += `
            <div class="card" data-card-value="${cardValues[i]}">
                <div class="card-front">?</div>
                <div class="card-back">${cardValues[i]}</div>
            </div>
        `;
    }
    gameContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
        card.addEventListener("click", () => {
            if (!card.classList.contains("matched") && !card.classList.contains("flipped")) {
                card.classList.add("flipped");
                if (!firstCard) {
                    firstCard = card;
                } else {
                    movesCounter();
                    secondCard = card;
                    let firstCardValue = firstCard.getAttribute("data-card-value");
                    let secondCardValue = secondCard.getAttribute("data-card-value");
                    if (firstCardValue === secondCardValue) {
                        firstCard.classList.add("matched");
                        secondCard.classList.add("matched");
                        firstCard = false;
                        secondCard = false;
                        if (document.querySelectorAll(".matched").length === cards.length) {
                            result.textContent = `你赢了！\n步数: ${moves}\n用时: ${timeValue}秒`;
                            stopGame();
                        }
                    } else {
                        let [tempFirst, tempSecond] = [firstCard, secondCard];
                        firstCard = false;
                        secondCard = false;
                        setTimeout(() => {
                            tempFirst.classList.remove("flipped");
                            tempSecond.classList.remove("flipped");
                        }, 900);
                    }
                }
            }
        });
    });
};

    startButton.addEventListener("click", () => {
        moves = 0;
        timeValue = 0;
        controls.classList.add("hide");
        stopButton.classList.remove("hide");
        startButton.classList.add("hide");
        interval = setInterval(timeGenerator, 1000);
        movesCount.textContent = moves;
        timeValue_span.textContent = timeValue;
        result.textContent = "";
        let cardValues = generateRandom();
        matrixGenerator(cardValues);
    });

    stopButton.addEventListener("click", stopGame);

    function stopGame() {
        controls.classList.remove("hide");
        stopButton.classList.add("hide");
        startButton.classList.remove("hide");
        clearInterval(interval);
        
        // 保存游戏数据
        if (moves > 0) {
            GameStorage.saveScore('memory-game', Math.max(0, 1000 - moves * 10 - timeValue));
        }
    }

    // 初始化游戏
    let cardValues = generateRandom();
    matrixGenerator(cardValues);
}
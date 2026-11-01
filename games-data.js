// 游戏数据配置文件
const GAMES_DATA = [
    // 现有游戏 (16个)
    {
        id: 'memory-game',
        name: '记忆翻牌',
        icon: '🧠',
        category: 'puzzle',
        difficulty: 'easy',
        tags: ['记忆力', '配对'],
        description: '考验记忆力的配对游戏，翻开卡片并找到所有匹配的对子。',
        file: 'memory-game.html',
        featured: true
    },
    {
        id: 'tic-tac-toe',
        name: '井字棋',
        icon: '⭕',
        category: 'strategy',
        difficulty: 'easy',
        tags: ['策略', '双人'],
        description: '经典的两人对战游戏，先连成一线者获胜。',
        file: 'tic-tac-toe.html',
        featured: true
    },
    {
        id: 'tetris',
        name: '俄罗斯方块',
        icon: '🧱',
        category: 'classic',
        difficulty: 'medium',
        tags: ['经典', '消除'],
        description: '控制下落的方块，尽可能多地消除行数。',
        file: 'tetris.html',
        featured: true
    },
    {
        id: 'minesweeper',
        name: '扫雷',
        icon: '💣',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['逻辑', '推理'],
        description: '小心地清除雷区，不要触碰到地雷。',
        file: 'minesweeper.html',
        featured: true
    },
    {
        id: 'snake',
        name: '贪吃蛇',
        icon: '🐍',
        category: 'classic',
        difficulty: 'easy',
        tags: ['经典', '成长'],
        description: '控制蛇吃掉食物并不断成长，但不要撞到墙壁或自己的身体。',
        file: 'snake.html',
        featured: true
    },
    {
        id: 'brick-breaker',
        name: '打砖块',
        icon: '🏓',
        category: 'action',
        difficulty: 'medium',
        tags: ['反应', '技巧'],
        description: '使用挡板反弹小球，打碎所有的砖块。',
        file: 'brick-breaker.html',
        featured: false
    },
    {
        id: 'sudoku',
        name: '数独',
        icon: '🔢',
        category: 'puzzle',
        difficulty: 'hard',
        tags: ['数字', '逻辑'],
        description: '填充九宫格，使每行、每列和每个3x3方格内的数字都不重复。',
        file: 'sudoku.html',
        featured: false
    },
    {
        id: 'flappy-bird',
        name: 'Flappy Bird',
        icon: '🐦',
        category: 'action',
        difficulty: 'hard',
        tags: ['反应', '挑战'],
        description: '控制小鸟飞行，避开障碍物，获取高分。',
        file: 'flappy-bird.html',
        featured: true
    },
    {
        id: 'time-guardian',
        name: '时空守护者',
        icon: '⏰',
        category: 'action',
        difficulty: 'hard',
        tags: ['射击', '时空', '守护'],
        description: '你是时空的守护者，需要保护时空裂缝不被邪恶势力入侵。使用时空弹和特殊能力击败敌人。',
        file: 'time-guardian.html',
        featured: true
    },
    {
        id: '2048',
        name: '2048',
        icon: '🎯',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['数字', '合并'],
        description: '滑动并合并相同数字的方块，尝试得到2048或更高的数字。',
        file: '2048.html',
        featured: true
    },
    {
        id: 'hangman',
        name: '猜单词',
        icon: '🔤',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['单词', '猜谜'],
        description: '经典的猜词游戏，猜出隐藏的单词，避免小人被完全画出。',
        file: 'hangman.html',
        featured: false
    },
    {
        id: 'sliding-puzzle',
        name: '数字华容道',
        icon: '🧩',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['滑动', '排序'],
        description: '移动数字方块，将它们排列成正确的顺序。',
        file: 'sliding-puzzle.html',
        featured: false
    },
    {
        id: 'plane-combat',
        name: '飞机大战',
        icon: '✈️',
        category: 'action',
        difficulty: 'hard',
        tags: ['射击', '躲避'],
        description: '控制飞机射击敌人，躲避子弹，尽可能地生存并获得高分。',
        file: 'plane-combat.html',
        featured: true
    },
    {
        id: 'space-shooter',
        name: '太空射击',
        icon: '🚀',
        category: 'action',
        difficulty: 'hard',
        tags: ['太空', '射击'],
        description: '在太空中驾驶飞船，消灭敌人，收集道具，获得高分。',
        file: 'space-shooter.html',
        featured: false
    },
    {
        id: 'gomoku',
        name: '五子棋',
        icon: '⚫',
        category: 'strategy',
        difficulty: 'medium',
        tags: ['策略', '棋类'],
        description: '经典的策略棋盘游戏，先连成五子一线者获胜。',
        file: 'gomoku.html',
        featured: false
    },
    {
        id: 'pong',
        name: '乒乓球',
        icon: '🏓',
        category: 'classic',
        difficulty: 'easy',
        tags: ['经典', '反应'],
        description: '经典的双人对战游戏，控制挡板击打小球，防止球从自己这边出界。',
        file: 'pong.html',
        featured: false
    },
    
    // 新增游戏 (34个)
    {
        id: 'connect-four',
        name: '四子连珠',
        icon: '🔴',
        category: 'strategy',
        difficulty: 'medium',
        tags: ['策略', '连线'],
        description: '轮流投放棋子，先连成四个的玩家获胜。',
        file: 'connect-four.html',
        featured: false
    },
    {
        id: 'checkers',
        name: '跳棋',
        icon: '⚪',
        category: 'strategy',
        difficulty: 'medium',
        tags: ['棋类', '跳跃'],
        description: '经典的跳棋游戏，通过跳跃吃掉对方的棋子。',
        file: 'checkers.html',
        featured: false
    },
    {
        id: 'chess',
        name: '国际象棋',
        icon: '♛',
        category: 'strategy',
        difficulty: 'hard',
        tags: ['象棋', '策略'],
        description: '世界上最受欢迎的棋类游戏，考验策略和计算能力。',
        file: 'chess.html',
        featured: true
    },
    {
        id: 'chinese-chess',
        name: '中国象棋',
        icon: '🐎',
        category: 'strategy',
        difficulty: 'hard',
        tags: ['象棋', '中国'],
        description: '中国传统的策略棋类游戏，楚河汉界，智慧对决。',
        file: 'chinese-chess.html',
        featured: true
    },
    {
        id: 'reversi',
        name: '黑白棋',
        icon: '⚫',
        category: 'strategy',
        difficulty: 'medium',
        tags: ['翻转', '策略'],
        description: '通过夹击翻转对方棋子，最终占据更多格子的玩家获胜。',
        file: 'reversi.html',
        featured: false
    },
    {
        id: 'mahjong',
        name: '麻将连连看',
        icon: '🀄',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['麻将', '配对'],
        description: '消除相同的麻将牌，清空所有牌面即可获胜。',
        file: 'mahjong.html',
        featured: true
    },
    {
        id: 'solitaire',
        name: '纸牌接龙',
        icon: '🃏',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['纸牌', '排序'],
        description: '经典的单人纸牌游戏，将所有牌按花色和顺序整理。',
        file: 'solitaire.html',
        featured: true
    },
    {
        id: 'freecell',
        name: '空当接龙',
        icon: '🂡',
        category: 'puzzle',
        difficulty: 'hard',
        tags: ['纸牌', '策略'],
        description: '利用空当位置，将所有牌移动到目标位置。',
        file: 'freecell.html',
        featured: false
    },
    {
        id: 'spider-solitaire',
        name: '蜘蛛纸牌',
        icon: '🕷️',
        category: 'puzzle',
        difficulty: 'hard',
        tags: ['纸牌', '挑战'],
        description: '更具挑战性的纸牌游戏，需要更多的策略和耐心。',
        file: 'spider-solitaire.html',
        featured: false
    },
    {
        id: 'blackjack',
        name: '21点',
        icon: '🃏',
        category: 'strategy',
        difficulty: 'medium',
        tags: ['纸牌', '21点'],
        description: '经典的赌场纸牌游戏，尽量接近21点但不要超过。',
        file: 'blackjack.html',
        featured: false
    },
    {
        id: 'poker',
        name: '德州扑克',
        icon: '🎰',
        category: 'strategy',
        difficulty: 'hard',
        tags: ['扑克', '策略'],
        description: '世界上最受欢迎的扑克游戏，考验心理和策略。',
        file: 'poker.html',
        featured: true
    },
    {
        id: 'bubble-shooter',
        name: '泡泡射击',
        icon: '🫧',
        category: 'action',
        difficulty: 'easy',
        tags: ['射击', '消除'],
        description: '射击相同颜色的泡泡，消除所有泡泡获得胜利。',
        file: 'bubble-shooter.html',
        featured: true
    },
    {
        id: 'match-three',
        name: '三消游戏',
        icon: '💎',
        category: 'puzzle',
        difficulty: 'easy',
        tags: ['消除', '宝石'],
        description: '交换宝石位置，连成三个或更多相同宝石来消除。',
        file: 'match-three.html',
        featured: true
    },
    {
        id: 'candy-crush',
        name: '糖果粉碎',
        icon: '🍭',
        category: 'puzzle',
        difficulty: 'easy',
        tags: ['糖果', '消除'],
        description: '交换糖果位置，创造特殊糖果，完成关卡目标。',
        file: 'candy-crush.html',
        featured: true
    },
    {
        id: 'jewel-quest',
        name: '宝石迷阵',
        icon: '💍',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['宝石', '匹配'],
        description: '匹配三个或更多相同的宝石，解锁神秘的宝藏。',
        file: 'jewel-quest.html',
        featured: false
    },
    {
        id: 'zuma',
        name: '祖玛',
        icon: '🐸',
        category: 'action',
        difficulty: 'medium',
        tags: ['射击', '连珠'],
        description: '射击彩球，形成三个或更多相同颜色的连珠来消除。',
        file: 'zuma.html',
        featured: false
    },
    {
        id: 'pacman',
        name: '吃豆人',
        icon: '👻',
        category: 'classic',
        difficulty: 'medium',
        tags: ['经典', '迷宫'],
        description: '控制吃豆人在迷宫中吃掉所有豆子，避开幽灵。',
        file: 'pacman.html',
        featured: true
    },
    {
        id: 'frogger',
        name: '青蛙过河',
        icon: '🐸',
        category: 'action',
        difficulty: 'medium',
        tags: ['青蛙', '躲避'],
        description: '帮助青蛙安全穿越繁忙的道路和河流。',
        file: 'frogger.html',
        featured: false
    },
    {
        id: 'centipede',
        name: '蜈蚣',
        icon: '🐛',
        category: 'action',
        difficulty: 'medium',
        tags: ['射击', '经典'],
        description: '射击下降的蜈蚣和其他昆虫，保护自己的基地。',
        file: 'centipede.html',
        featured: false
    },
    {
        id: 'asteroids',
        name: '小行星',
        icon: '☄️',
        category: 'action',
        difficulty: 'hard',
        tags: ['太空', '射击'],
        description: '在太空中驾驶飞船，射击小行星并避免碰撞。',
        file: 'asteroids.html',
        featured: false
    },
    {
        id: 'missile-command',
        name: '导弹指挥',
        icon: '🚀',
        category: 'action',
        difficulty: 'hard',
        tags: ['导弹', '防御'],
        description: '发射反导弹来保护城市免受敌方导弹攻击。',
        file: 'missile-command.html',
        featured: false
    },
    {
        id: 'defender',
        name: '防卫者',
        icon: '🛸',
        category: 'action',
        difficulty: 'hard',
        tags: ['射击', '防卫'],
        description: '驾驶飞船保护地面上的人类免受外星人攻击。',
        file: 'defender.html',
        featured: false
    },
    {
        id: 'tower-defense',
        name: '塔防游戏',
        icon: '🏰',
        category: 'strategy',
        difficulty: 'medium',
        tags: ['塔防', '策略'],
        description: '建造防御塔，阻止敌人通过你的防线。',
        file: 'tower-defense.html',
        featured: true
    },
    {
        id: 'plants-vs-zombies',
        name: '植物大战僵尸',
        icon: '🌻',
        category: 'strategy',
        difficulty: 'medium',
        tags: ['植物', '僵尸'],
        description: '种植各种植物来抵御僵尸的入侵。',
        file: 'plants-vs-zombies.html',
        featured: true
    },
    {
        id: 'angry-birds',
        name: '愤怒的小鸟',
        icon: '🐦',
        category: 'action',
        difficulty: 'medium',
        tags: ['弹射', '物理'],
        description: '用弹弓发射小鸟，摧毁绿猪的堡垒。',
        file: 'angry-birds.html',
        featured: true
    },
    {
        id: 'cut-the-rope',
        name: '割绳子',
        icon: '🍭',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['物理', '糖果'],
        description: '割断绳子，让糖果掉到小怪物的嘴里。',
        file: 'cut-the-rope.html',
        featured: false
    },
    {
        id: 'fruit-ninja',
        name: '水果忍者',
        icon: '🥷',
        category: 'action',
        difficulty: 'easy',
        tags: ['切割', '水果'],
        description: '用手指切割飞行的水果，避开炸弹。',
        file: 'fruit-ninja.html',
        featured: true
    },
    {
        id: 'temple-run',
        name: '神庙逃亡',
        icon: '🏃',
        category: 'action',
        difficulty: 'medium',
        tags: ['跑酷', '躲避'],
        description: '在神庙中奔跑，躲避障碍物，收集金币。',
        file: 'temple-run.html',
        featured: false
    },
    {
        id: 'subway-surfers',
        name: '地铁跑酷',
        icon: '🚇',
        category: 'action',
        difficulty: 'medium',
        tags: ['跑酷', '地铁'],
        description: '在地铁轨道上奔跑，躲避火车和障碍物。',
        file: 'subway-surfers.html',
        featured: false
    },
    {
        id: 'crossy-road',
        name: '天天过马路',
        icon: '🐔',
        category: 'action',
        difficulty: 'easy',
        tags: ['过马路', '躲避'],
        description: '帮助小动物安全穿越繁忙的道路、河流和铁轨。',
        file: 'crossy-road.html',
        featured: false
    },
    {
        id: 'doodle-jump',
        name: '涂鸦跳跃',
        icon: '🦘',
        category: 'action',
        difficulty: 'easy',
        tags: ['跳跃', '涂鸦'],
        description: '控制涂鸦小人不断向上跳跃，获得更高的分数。',
        file: 'doodle-jump.html',
        featured: false
    },
    {
        id: 'geometry-dash',
        name: '几何冲刺',
        icon: '🔺',
        category: 'action',
        difficulty: 'hard',
        tags: ['几何', '节奏'],
        description: '控制几何图形跳跃，避开障碍物，跟随音乐节拍。',
        file: 'geometry-dash.html',
        featured: false
    },
    {
        id: 'piano-tiles',
        name: '钢琴块',
        icon: '🎹',
        category: 'action',
        difficulty: 'medium',
        tags: ['音乐', '节奏'],
        description: '点击黑色钢琴键，跟随音乐节拍，不要点击白键。',
        file: 'piano-tiles.html',
        featured: false
    },
    {
        id: 'guitar-hero',
        name: '吉他英雄',
        icon: '🎸',
        category: 'action',
        difficulty: 'hard',
        tags: ['音乐', '吉他'],
        description: '跟随音乐节拍，按下正确的按键演奏吉他。',
        file: 'guitar-hero.html',
        featured: false
    },
    {
        id: 'dance-revolution',
        name: '劲舞革命',
        icon: '💃',
        category: 'action',
        difficulty: 'hard',
        tags: ['舞蹈', '节奏'],
        description: '跟随屏幕上的箭头指示，踩准节拍进行舞蹈。',
        file: 'dance-revolution.html',
        featured: false
    },
    {
        id: 'rhythm-game',
        name: '节奏大师',
        icon: '🎵',
        category: 'action',
        difficulty: 'medium',
        tags: ['节奏', '音乐'],
        description: '跟随音乐节拍，在正确的时机点击屏幕。',
        file: 'rhythm-game.html',
        featured: false
    },
    {
        id: 'word-search',
        name: '单词搜索',
        icon: '🔍',
        category: 'puzzle',
        difficulty: 'easy',
        tags: ['单词', '搜索'],
        description: '在字母网格中找到隐藏的单词。',
        file: 'word-search.html',
        featured: false
    },
    {
        id: 'crossword',
        name: '填字游戏',
        icon: '📝',
        category: 'puzzle',
        difficulty: 'hard',
        tags: ['填字', '词汇'],
        description: '根据提示填写交叉的单词网格。',
        file: 'crossword.html',
        featured: false
    },
    {
        id: 'word-chain',
        name: '单词接龙',
        icon: '🔗',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['单词', '接龙'],
        description: '用前一个单词的最后一个字母开始新单词。',
        file: 'word-chain.html',
        featured: false
    },
    {
        id: 'anagram',
        name: '字母重组',
        icon: '🔤',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['字母', '重组'],
        description: '重新排列字母，组成有意义的单词。',
        file: 'anagram.html',
        featured: false
    },
    {
        id: 'typing-game',
        name: '打字游戏',
        icon: '⌨️',
        category: 'action',
        difficulty: 'easy',
        tags: ['打字', '速度'],
        description: '快速准确地输入屏幕上显示的文字。',
        file: 'typing-game.html',
        featured: false
    },
    {
        id: 'quiz-game',
        name: '知识问答',
        icon: '❓',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['问答', '知识'],
        description: '回答各种领域的问题，测试你的知识水平。',
        file: 'quiz-game.html',
        featured: false
    },
    {
        id: 'trivia',
        name: '趣味问答',
        icon: '🧠',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['趣味', '问答'],
        description: '回答有趣的冷知识问题，挑战你的博学程度。',
        file: 'trivia.html',
        featured: false
    },
    {
        id: 'math-game',
        name: '数学游戏',
        icon: '🔢',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['数学', '计算'],
        description: '快速解决数学问题，提高计算能力。',
        file: 'math-game.html',
        featured: false
    },
    {
        id: 'brain-training',
        name: '大脑训练',
        icon: '🧠',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['大脑', '训练'],
        description: '通过各种小游戏训练大脑的不同能力。',
        file: 'brain-training.html',
        featured: false
    },
    {
        id: 'color-match',
        name: '颜色匹配',
        icon: '🎨',
        category: 'puzzle',
        difficulty: 'easy',
        tags: ['颜色', '匹配'],
        description: '快速识别并匹配相同的颜色。',
        file: 'color-match.html',
        featured: false
    },
    {
        id: 'simon-says',
        name: '西蒙说',
        icon: '🔴',
        category: 'puzzle',
        difficulty: 'medium',
        tags: ['记忆', '序列'],
        description: '记住并重复越来越长的颜色和声音序列。',
        file: 'simon-says.html',
        featured: false
    }
];

// 游戏分类配置
const CATEGORIES = {
    all: { name: '全部游戏', icon: '🎯', color: '#4CAF50' },
    puzzle: { name: '益智解谜', icon: '🧩', color: '#2196F3' },
    action: { name: '动作游戏', icon: '⚡', color: '#FF5722' },
    strategy: { name: '策略棋牌', icon: '🎲', color: '#9C27B0' },
    classic: { name: '经典复古', icon: '👾', color: '#FF9800' }
};

// 难度配置
const DIFFICULTIES = {
    easy: { name: '简单', color: '#4CAF50' },
    medium: { name: '中等', color: '#FF9800' },
    hard: { name: '困难', color: '#F44336' }
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GAMES_DATA, CATEGORIES, DIFFICULTIES };
}
/* Canonical catalog. Entries are derived from existing HTML game pages. */
const GAMES_DATA = [
  {
    "id": "2048",
    "name": "2048",
    "icon": "🎯",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "滑动并合并相同数字的方块，尝试得到2048或更高的数字。",
    "tags": [
      "数字",
      "合并"
    ],
    "file": "2048.html",
    "featured": true,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "brick-breaker",
    "name": "打砖块",
    "icon": "🏓",
    "category": "action",
    "difficulty": "medium",
    "description": "使用挡板反弹小球，打碎所有的砖块。",
    "tags": [
      "反应",
      "技巧"
    ],
    "file": "brick-breaker.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "bubble-shooter",
    "name": "泡泡射击",
    "icon": "🫧",
    "category": "action",
    "difficulty": "easy",
    "description": "射击相同颜色的泡泡，消除所有泡泡获得胜利。",
    "tags": [
      "射击",
      "消除"
    ],
    "file": "bubble-shooter.html",
    "featured": true,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "card-memory",
    "name": "记忆配对",
    "icon": "🎮",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "card-memory.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "checkers",
    "name": "跳棋",
    "icon": "⚪",
    "category": "strategy",
    "difficulty": "medium",
    "description": "经典的跳棋游戏，通过跳跃吃掉对方的棋子。",
    "tags": [
      "棋类",
      "跳跃"
    ],
    "file": "checkers.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "chess",
    "name": "国际象棋",
    "icon": "♟️",
    "category": "strategy",
    "difficulty": "hard",
    "description": "世界上最受欢迎的棋类游戏，考验策略和计算能力。",
    "tags": [
      "象棋",
      "策略"
    ],
    "file": "chess.html",
    "featured": true,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "city-builder",
    "name": "城市工坊",
    "icon": "🏙️",
    "category": "strategy",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "city-builder.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "color-match",
    "name": "颜色匹配",
    "icon": "🎨",
    "category": "puzzle",
    "difficulty": "easy",
    "description": "快速识别并匹配相同的颜色。",
    "tags": [
      "颜色",
      "匹配"
    ],
    "file": "color-match.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "connect-dots",
    "name": "连点成线",
    "icon": "🎮",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "connect-dots.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "cooking",
    "name": "极速料理",
    "icon": "🎮",
    "category": "casual",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "cooking.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "crossword",
    "name": "填字游戏",
    "icon": "📝",
    "category": "puzzle",
    "difficulty": "hard",
    "description": "根据提示填写交叉的单词网格。",
    "tags": [
      "填字",
      "词汇"
    ],
    "file": "crossword.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "dress-up",
    "name": "百变换装",
    "icon": "🎮",
    "category": "casual",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "dress-up.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "farm",
    "name": "像素农场",
    "icon": "🌱",
    "category": "casual",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "farm.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "fishing",
    "name": "钓鱼挑战",
    "icon": "🎣",
    "category": "casual",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "fishing.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "flappy-bird",
    "name": "Flappy Bird",
    "icon": "🐦",
    "category": "action",
    "difficulty": "hard",
    "description": "控制小鸟飞行，避开障碍物，获取高分。",
    "tags": [
      "反应",
      "挑战"
    ],
    "file": "flappy-bird.html",
    "featured": true,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "geography",
    "name": "世界地理",
    "icon": "🎮",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "geography.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "gomoku",
    "name": "五子棋",
    "icon": "⚫",
    "category": "strategy",
    "difficulty": "medium",
    "description": "经典的策略棋盘游戏，先连成五子一线者获胜。",
    "tags": [
      "策略",
      "棋类"
    ],
    "file": "gomoku.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "hangman",
    "name": "猜单词",
    "icon": "🔤",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "经典的猜词游戏，猜出隐藏的单词，避免小人被完全画出。",
    "tags": [
      "单词",
      "猜谜"
    ],
    "file": "hangman.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "jigsaw-puzzle",
    "name": "拼图挑战",
    "icon": "🧩",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "jigsaw-puzzle.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "mahjong",
    "name": "麻将连连看",
    "icon": "🀄",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "消除相同的麻将牌，清空所有牌面即可获胜。",
    "tags": [
      "麻将",
      "配对"
    ],
    "file": "mahjong.html",
    "featured": true,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "match3",
    "name": "宝石三消",
    "icon": "💎",
    "category": "action",
    "difficulty": "medium",
    "description": "交换宝石，寻找连锁消除。",
    "tags": [],
    "file": "match3.html",
    "featured": true,
    "status": "playable",
    "revamped": true
  },
  {
    "id": "math-game",
    "name": "数学游戏",
    "icon": "🔢",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "快速解决数学问题，提高计算能力。",
    "tags": [
      "数学",
      "计算"
    ],
    "file": "math-game.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "maze-runner",
    "name": "迷宫突围",
    "icon": "🌀",
    "category": "action",
    "difficulty": "medium",
    "description": "穿越随机迷宫，在时间归零前找到出口。",
    "tags": [],
    "file": "maze-runner.html",
    "featured": true,
    "status": "playable",
    "revamped": true
  },
  {
    "id": "memory-game",
    "name": "记忆翻牌",
    "icon": "🧠",
    "category": "puzzle",
    "difficulty": "easy",
    "description": "考验记忆力的配对游戏，翻开卡片并找到所有匹配的对子。",
    "tags": [
      "记忆力",
      "配对"
    ],
    "file": "memory-game.html",
    "featured": true,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "minesweeper",
    "name": "扫雷",
    "icon": "💣",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "小心地清除雷区，不要触碰到地雷。",
    "tags": [
      "逻辑",
      "推理"
    ],
    "file": "minesweeper.html",
    "featured": true,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "music-rhythm",
    "name": "节奏点击",
    "icon": "🎵",
    "category": "action",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "music-rhythm.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "nonogram",
    "name": "数织谜题",
    "icon": "▦",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "nonogram.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "number-memory",
    "name": "数字记忆",
    "icon": "🎮",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "number-memory.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "pac-man",
    "name": "吃豆人",
    "icon": "🎮",
    "category": "action",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "pac-man.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "pet-care",
    "name": "宠物养成",
    "icon": "🐾",
    "category": "casual",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "pet-care.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "pinball",
    "name": "弹珠台",
    "icon": "🎮",
    "category": "action",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "pinball.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "plane-combat",
    "name": "飞机大战",
    "icon": "✈️",
    "category": "action",
    "difficulty": "hard",
    "description": "控制飞机射击敌人，躲避子弹，尽可能地生存并获得高分。",
    "tags": [
      "射击",
      "躲避"
    ],
    "file": "plane-combat.html",
    "featured": true,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "platformer",
    "name": "跃动星球",
    "icon": "🪐",
    "category": "action",
    "difficulty": "medium",
    "description": "奔跑、跳跃、收集能量，抵达终点。",
    "tags": [],
    "file": "platformer.html",
    "featured": true,
    "status": "playable",
    "revamped": true
  },
  {
    "id": "pong",
    "name": "乒乓球",
    "icon": "🏓",
    "category": "classic",
    "difficulty": "easy",
    "description": "经典的双人对战游戏，控制挡板击打小球，防止球从自己这边出界。",
    "tags": [
      "经典",
      "反应"
    ],
    "file": "pong.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "puzzle",
    "name": "逻辑谜题",
    "icon": "🎮",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "puzzle.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "quiz",
    "name": "知识挑战",
    "icon": "🧠",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "quiz.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "racing",
    "name": "霓虹赛车",
    "icon": "🏎️",
    "category": "action",
    "difficulty": "medium",
    "description": "闪避车流，拿下更高里程。",
    "tags": [],
    "file": "racing.html",
    "featured": true,
    "status": "playable",
    "revamped": true
  },
  {
    "id": "reaction-test",
    "name": "极限反应",
    "icon": "🎮",
    "category": "action",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "reaction-test.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "reversi",
    "name": "黑白棋",
    "icon": "⚫",
    "category": "strategy",
    "difficulty": "medium",
    "description": "通过夹击翻转对方棋子，最终占据更多格子的玩家获胜。",
    "tags": [
      "翻转",
      "策略"
    ],
    "file": "reversi.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "sliding-puzzle",
    "name": "数字华容道",
    "icon": "🧩",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "移动数字方块，将它们排列成正确的顺序。",
    "tags": [
      "滑动",
      "排序"
    ],
    "file": "sliding-puzzle.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "snake-ladder",
    "name": "蛇梯棋",
    "icon": "🎮",
    "category": "strategy",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "snake-ladder.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "snake",
    "name": "贪吃蛇",
    "icon": "🐍",
    "category": "classic",
    "difficulty": "easy",
    "description": "控制蛇吃掉食物并不断成长，但不要撞到墙壁或自己的身体。",
    "tags": [
      "经典",
      "成长"
    ],
    "file": "snake.html",
    "featured": true,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "sokoban",
    "name": "推箱子",
    "icon": "📦",
    "category": "action",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "sokoban.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "solitaire",
    "name": "纸牌接龙",
    "icon": "🃏",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "经典的单人纸牌游戏，将所有牌按花色和顺序整理。",
    "tags": [
      "纸牌",
      "排序"
    ],
    "file": "solitaire.html",
    "featured": true,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "space-invaders",
    "name": "太空入侵",
    "icon": "🎮",
    "category": "action",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "space-invaders.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "space-shooter",
    "name": "太空射击",
    "icon": "🚀",
    "category": "action",
    "difficulty": "hard",
    "description": "在太空中驾驶飞船，消灭敌人，收集道具，获得高分。",
    "tags": [
      "太空",
      "射击"
    ],
    "file": "space-shooter.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "spot-difference",
    "name": "找不同",
    "icon": "🎮",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "spot-difference.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "sudoku-killer",
    "name": "杀手数独",
    "icon": "🎮",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "sudoku-killer.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "sudoku",
    "name": "数独",
    "icon": "🔢",
    "category": "puzzle",
    "difficulty": "hard",
    "description": "填充九宫格，使每行、每列和每个3x3方格内的数字都不重复。",
    "tags": [
      "数字",
      "逻辑"
    ],
    "file": "sudoku.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "tangram",
    "name": "七巧板",
    "icon": "🎮",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "浏览器里的轻量小游戏挑战。",
    "tags": [],
    "file": "tangram.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  },
  {
    "id": "tetris",
    "name": "俄罗斯方块",
    "icon": "🧱",
    "category": "classic",
    "difficulty": "medium",
    "description": "控制下落的方块，尽可能多地消除行数。",
    "tags": [
      "经典",
      "消除"
    ],
    "file": "tetris.html",
    "featured": true,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "tic-tac-toe",
    "name": "井字棋",
    "icon": "⭕",
    "category": "strategy",
    "difficulty": "easy",
    "description": "经典的两人对战游戏，先连成一线者获胜。",
    "tags": [
      "策略",
      "双人"
    ],
    "file": "tic-tac-toe.html",
    "featured": true,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "time-guardian",
    "name": "时空守护者",
    "icon": "⏰",
    "category": "action",
    "difficulty": "hard",
    "description": "你是时空的守护者，需要保护时空裂缝不被邪恶势力入侵。使用时空弹和特殊能力击败敌人。",
    "tags": [
      "射击",
      "时空",
      "守护"
    ],
    "file": "time-guardian.html",
    "featured": true,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "tower-defense",
    "name": "星际防线",
    "icon": "🛡️",
    "category": "strategy",
    "difficulty": "medium",
    "description": "建造防御塔，阻止敌人通过你的防线。",
    "tags": [
      "塔防",
      "策略"
    ],
    "file": "tower-defense.html",
    "featured": true,
    "status": "playable",
    "revamped": true
  },
  {
    "id": "typing-game",
    "name": "打字游戏",
    "icon": "⌨️",
    "category": "action",
    "difficulty": "easy",
    "description": "快速准确地输入屏幕上显示的文字。",
    "tags": [
      "打字",
      "速度"
    ],
    "file": "typing-game.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "word-chain",
    "name": "单词接龙",
    "icon": "🔗",
    "category": "puzzle",
    "difficulty": "medium",
    "description": "用前一个单词的最后一个字母开始新单词。",
    "tags": [
      "单词",
      "接龙"
    ],
    "file": "word-chain.html",
    "featured": false,
    "status": "playable",
    "revamped": false
  },
  {
    "id": "word-search",
    "name": "单词寻踪",
    "icon": "🔎",
    "category": "puzzle",
    "difficulty": "easy",
    "description": "在字母网格中找到隐藏的单词。",
    "tags": [
      "单词",
      "搜索"
    ],
    "file": "word-search.html",
    "featured": false,
    "status": "prototype",
    "revamped": false
  }
];

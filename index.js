// 全局变量
let currentCategory = 'all';
let currentSearchTerm = '';
let filteredGames = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    // 显示加载动画
    const pageLoader = document.getElementById('pageLoader');
    
    // 延迟初始化确保所有元素都已加载
    setTimeout(() => {
        initializeHomepage();
        setupEventListeners();
        
        // 隐藏加载动画
        setTimeout(() => {
            if (pageLoader) {
                pageLoader.classList.add('hidden');
                // 完全移除加载器
                setTimeout(() => {
                    pageLoader.style.display = 'none';
                }, 800);
            }
        }, 500);
    }, 300);
});

// 初始化首页
function initializeHomepage() {
    console.log('Initializing homepage...');
    
    if (typeof GAMES_DATA === 'undefined') {
        console.error('GAMES_DATA not loaded');
        return;
    }
    
    filteredGames = GAMES_DATA;
    renderGames(GAMES_DATA);
    renderFeaturedGames();
    updateStats();
}

// 渲染游戏卡片
function renderGames(games) {
    const gamesGrid = document.getElementById('games-grid');
    const noResults = document.getElementById('no-results');
    
    if (!gamesGrid) {
        console.error('games-grid element not found');
        return;
    }
    
    if (!games || games.length === 0) {
        gamesGrid.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    
    gamesGrid.innerHTML = games.map((game, index) => `
        <div class="game-card" data-category="${game.category}" style="animation-delay: ${index * 0.1}s">
            <div class="difficulty ${game.difficulty}">${DIFFICULTIES[game.difficulty]?.name || game.difficulty}</div>
            <span class="game-icon">${game.icon}</span>
            <h2>${game.name}</h2>
            <div class="game-tags">
                ${game.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <p>${game.description}</p>
            <a href="${game.file}" class="play-button">开始游戏</a>
        </div>
    `).join('');
    
    // 添加卡片动画 - 逐个显示
    setTimeout(() => {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('show');
            }, index * 100); // 每个卡片延迟100ms显示
        });
    }, 200);
}

// 渲染特色推荐游戏
function renderFeaturedGames() {
    const featuredContainer = document.getElementById('featured-games');
    
    if (!featuredContainer) {
        console.error('featured-games element not found');
        return;
    }
    
    const featuredGames = GAMES_DATA.filter(game => 
        ['tetris.html', 'snake.html', '2048.html', 'minesweeper.html'].includes(game.file)
    );
    
    featuredContainer.innerHTML = featuredGames.map(game => `
        <div class="featured-game">
            <span class="featured-icon">${game.icon}</span>
            <div class="featured-info">
                <h4>${game.name}</h4>
                <p>${game.description.substring(0, 50)}...</p>
            </div>
            <a href="${game.file}" class="featured-play">玩</a>
        </div>
    `).join('');
}

// 设置事件监听器
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // 搜索功能
    const searchInput = document.getElementById('game-search');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        console.log('Search input listener added');
    } else {
        console.warn('Search input not found');
    }
    
    // 分类过滤
    const categoryButtons = document.querySelectorAll('.filter-btn');
    console.log('Found category buttons:', categoryButtons.length);
    
    categoryButtons.forEach((button, index) => {
        if (button) {
            button.addEventListener('click', function() {
                handleCategoryFilter(this);
            });
            console.log(`Category button ${index} listener added`);
        }
    });
}

// 处理搜索
function handleSearch(e) {
    currentSearchTerm = e.target.value.toLowerCase().trim();
    filterAndRenderGames();
}

// 处理分类过滤
function handleCategoryFilter(button) {
    const category = button.dataset.category;
    currentCategory = category;
    
    // 更新按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    filterAndRenderGames();
}

// 过滤并渲染游戏
function filterAndRenderGames() {
    let filtered = GAMES_DATA;
    
    // 分类过滤
    if (currentCategory !== 'all') {
        filtered = filtered.filter(game => game.category === currentCategory);
    }
    
    // 搜索过滤
    if (currentSearchTerm) {
        filtered = filtered.filter(game => 
            game.name.toLowerCase().includes(currentSearchTerm) ||
            game.description.toLowerCase().includes(currentSearchTerm) ||
            game.tags.some(tag => tag.toLowerCase().includes(currentSearchTerm))
        );
    }
    
    filteredGames = filtered;
    renderGames(filteredGames);
    updateStats();
}

// 更新统计信息
function updateStats() {
    const totalCount = GAMES_DATA ? GAMES_DATA.length : 0;
    const visibleCount = filteredGames ? filteredGames.length : 0;
    
    const totalCountEl = document.getElementById('total-count');
    const visibleCountEl = document.getElementById('visible-count');
    const totalGamesEl = document.getElementById('total-games');
    
    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (visibleCountEl) visibleCountEl.textContent = visibleCount;
    if (totalGamesEl) totalGamesEl.textContent = totalCount;
}

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
    .game-card {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    }
    
    .game-card.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .game-card:hover {
        transform: translateY(-5px) scale(1.02);
    }
    
    .featured-game {
        transition: all 0.3s ease;
    }
    
    .featured-game:hover {
        transform: translateX(5px);
        background: rgba(255, 255, 255, 0.1);
    }
`;
document.head.appendChild(style);

console.log('JavaScript loaded successfully');
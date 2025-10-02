document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const levelElement = document.getElementById('level');
    const finalScoreElement = document.getElementById('final-score');
    
    // 游戏覆盖层
    const gameStartOverlay = document.getElementById('game-start');
    const gamePausedOverlay = document.getElementById('game-paused');
    const gameOverOverlay = document.getElementById('game-over');
    
    // 按钮
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const fireBtn = document.getElementById('fire-btn');
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    
    // 游戏常量
    const PLAYER_WIDTH = 50;
    const PLAYER_HEIGHT = 50;
    const ENEMY_WIDTH = 40;
    const ENEMY_HEIGHT = 40;
    const BULLET_WIDTH = 4;
    const BULLET_HEIGHT = 10;
    const POWERUP_SIZE = 30;
    
    // 游戏变量
    let gameRunning = false;
    let gamePaused = false;
    let score = 0;
    let lives = 3;
    let level = 1;
    let animationId;
    let lastTime = 0;
    let enemySpawnInterval = 1500; // 敌人生成间隔（毫秒）
    let lastEnemySpawn = 0;
    let powerupSpawnInterval = 10000; // 道具生成间隔（毫秒）
    let lastPowerupSpawn = 0;
    
    // 玩家对象
    const player = {
        x: canvas.width / 2 - PLAYER_WIDTH / 2,
        y: canvas.height - PLAYER_HEIGHT - 20,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        speed: 5,
        color: '#3498db',
        bullets: [],
        bulletSpeed: 7,
        bulletCooldown: 300, // 子弹冷却时间（毫秒）
        lastBulletTime: 0,
        powerupActive: false,
        powerupType: null,
        powerupEndTime: 0,
        dx: 0, // 水平移动方向
        dy: 0  // 垂直移动方向
    };
    
    // 敌人数组
    let enemies = [];
    
    // 道具数组
    let powerups = [];
    
    // 粒子效果数组
    let particles = [];
    
    // 控制状态
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        w: false,
        a: false,
        s: false,
        d: false,
        ' ': false, // 空格键
        p: false   // 暂停键
    };
    
    // 加载图像
    const images = {};
    const imagesToLoad = [
        { name: 'player', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path fill="%233498db" d="M25 0 L50 50 L25 35 L0 50 Z"/></svg>' },
        { name: 'enemy', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path fill="%23e74c3c" d="M20 0 L40 20 L30 40 L10 40 L0 20 Z"/></svg>' },
        { name: 'powerupSpeed', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><circle cx="15" cy="15" r="15" fill="%232ecc71"/><path fill="%23fff" d="M8 15 L22 7 L22 23 Z"/></svg>' },
        { name: 'powerupBullet', src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><circle cx="15" cy="15" r="15" fill="%23f39c12"/><rect x="10" y="10" width="4" height="10" fill="%23fff"/><rect x="18" y="10" width="4" height="10" fill="%23fff"/></svg>' }
    ];
    
    let imagesLoaded = 0;
    imagesToLoad.forEach(img => {
        const image = new Image();
        image.src = img.src;
        image.onload = () => {
            imagesLoaded++;
            images[img.name] = image;
            
            // 所有图像加载完成后初始化游戏
            if (imagesLoaded === imagesToLoad.length) {
                initGame();
            }
        };
    });
    
    // 初始化游戏
    function initGame() {
        // 设置事件监听器
        setupEventListeners();
        
        // 显示开始界面
        showOverlay(gameStartOverlay);
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 键盘控制
        window.addEventListener('keydown', (e) => {
            if (keys.hasOwnProperty(e.key)) {
                keys[e.key] = true;
                
                // 空格键射击
                if (e.key === ' ' && gameRunning && !gamePaused) {
                    fireBullet();
                }
                
                // P键暂停
                if (e.key === 'p' && gameRunning) {
                    togglePause();
                }
                
                // 防止页面滚动
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                    e.preventDefault();
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (keys.hasOwnProperty(e.key)) {
                keys[e.key] = false;
            }
        });
        
        // 触摸控制
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', restartGame);
        resumeBtn.addEventListener('click', resumeGame);
        pauseBtn.addEventListener('click', togglePause);
        fireBtn.addEventListener('click', fireBullet);
        
        // 方向按钮控制
        upBtn.addEventListener('mousedown', () => { player.dy = -1; });
        upBtn.addEventListener('mouseup', () => { player.dy = 0; });
        upBtn.addEventListener('touchstart', (e) => { player.dy = -1; e.preventDefault(); });
        upBtn.addEventListener('touchend', () => { player.dy = 0; });
        
        downBtn.addEventListener('mousedown', () => { player.dy = 1; });
        downBtn.addEventListener('mouseup', () => { player.dy = 0; });
        downBtn.addEventListener('touchstart', (e) => { player.dy = 1; e.preventDefault(); });
        downBtn.addEventListener('touchend', () => { player.dy = 0; });
        
        leftBtn.addEventListener('mousedown', () => { player.dx = -1; });
        leftBtn.addEventListener('mouseup', () => { player.dx = 0; });
        leftBtn.addEventListener('touchstart', (e) => { player.dx = -1; e.preventDefault(); });
        leftBtn.addEventListener('touchend', () => { player.dx = 0; });
        
        rightBtn.addEventListener('mousedown', () => { player.dx = 1; });
        rightBtn.addEventListener('mouseup', () => { player.dx = 0; });
        rightBtn.addEventListener('touchstart', (e) => { player.dx = 1; e.preventDefault(); });
        rightBtn.addEventListener('touchend', () => { player.dx = 0; });
        
        // 防止触摸滚动
        document.querySelectorAll('.direction-btn, .action-btn').forEach(btn => {
            btn.addEventListener('touchmove', (e) => {
                e.preventDefault();
            });
        });
    }
    
    // 开始游戏
    function startGame() {
        resetGame();
        gameRunning = true;
        hideAllOverlays();
        gameLoop(0);
    }
    
    // 重新开始游戏
    function restartGame() {
        resetGame();
        gameRunning = true;
        hideAllOverlays();
        gameLoop(0);
    }
    
    // 暂停/继续游戏
    function togglePause() {
        if (!gameRunning) return;
        
        gamePaused = !gamePaused;
        
        if (gamePaused) {
            cancelAnimationFrame(animationId);
            showOverlay(gamePausedOverlay);
        } else {
            hideAllOverlays();
            gameLoop(0);
        }
    }
    
    // 继续游戏
    function resumeGame() {
        if (gameRunning && gamePaused) {
            gamePaused = false;
            hideAllOverlays();
            gameLoop(0);
        }
    }
    
    // 重置游戏状态
    function resetGame() {
        score = 0;
        lives = 3;
        level = 1;
        player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
        player.y = canvas.height - PLAYER_HEIGHT - 20;
        player.bullets = [];
        player.powerupActive = false;
        player.powerupType = null;
        player.speed = 5;
        enemies = [];
        powerups = [];
        particles = [];
        enemySpawnInterval = 1500;
        
        updateUI();
    }
    
    // 显示覆盖层
    function showOverlay(overlay) {
        hideAllOverlays();
        overlay.classList.add('active');
    }
    
    // 隐藏所有覆盖层
    function hideAllOverlays() {
        gameStartOverlay.classList.remove('active');
        gamePausedOverlay.classList.remove('active');
        gameOverOverlay.classList.remove('active');
    }
    
    // 更新UI
    function updateUI() {
        scoreElement.textContent = score;
        livesElement.textContent = lives;
        levelElement.textContent = level;
        finalScoreElement.textContent = score;
    }
    
    // 发射子弹
    function fireBullet() {
        if (!gameRunning || gamePaused) return;
        
        const currentTime = Date.now();
        if (currentTime - player.lastBulletTime < player.bulletCooldown) return;
        
        player.lastBulletTime = currentTime;
        
        if (player.powerupActive && player.powerupType === 'doubleBullet') {
            // 双发子弹
            player.bullets.push({
                x: player.x + player.width / 2 - BULLET_WIDTH / 2 - 10,
                y: player.y,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT,
                color: '#f1c40f'
            });
            
            player.bullets.push({
                x: player.x + player.width / 2 - BULLET_WIDTH / 2 + 10,
                y: player.y,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT,
                color: '#f1c40f'
            });
        } else {
            // 单发子弹
            player.bullets.push({
                x: player.x + player.width / 2 - BULLET_WIDTH / 2,
                y: player.y,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT,
                color: '#f1c40f'
            });
        }
    }
    
    // 生成敌人
    function spawnEnemy(timestamp) {
        if (timestamp - lastEnemySpawn < enemySpawnInterval) return;
        
        lastEnemySpawn = timestamp;
        
        // 随机敌人位置
        const x = Math.random() * (canvas.width - ENEMY_WIDTH);
        
        // 随机敌人速度（随等级增加）
        const speed = 2 + Math.random() * 2 + (level * 0.5);
        
        enemies.push({
            x: x,
            y: -ENEMY_HEIGHT,
            width: ENEMY_WIDTH,
            height: ENEMY_HEIGHT,
            speed: speed,
            color: '#e74c3c'
        });
        
        // 随着等级提高，减少敌人生成间隔
        enemySpawnInterval = Math.max(300, 1500 - level * 100);
    }
    
    // 生成道具
    function spawnPowerup(timestamp) {
        if (timestamp - lastPowerupSpawn < powerupSpawnInterval) return;
        
        lastPowerupSpawn = timestamp;
        
        // 随机道具位置
        const x = Math.random() * (canvas.width - POWERUP_SIZE);
        
        // 随机道具类型
        const types = ['speed', 'doubleBullet'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        powerups.push({
            x: x,
            y: -POWERUP_SIZE,
            width: POWERUP_SIZE,
            height: POWERUP_SIZE,
            speed: 2,
            type: type
        });
    }
    
    // 创建爆炸效果
    function createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            
            particles.push({
                x: x,
                y: y,
                radius: 2 + Math.random() * 3,
                color: color,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                alpha: 1,
                life: 30 + Math.random() * 30
            });
        }
    }
    
    // 检测碰撞
    function checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // 游戏主循环
    function gameLoop(timestamp) {
        // 计算帧间隔
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 更新玩家位置
        updatePlayerPosition();
        
        // 生成敌人和道具
        spawnEnemy(timestamp);
        spawnPowerup(timestamp);
        
        // 更新和绘制子弹
        updateBullets();
        
        // 更新和绘制敌人
        updateEnemies();
        
        // 更新和绘制道具
        updatePowerups();
        
        // 更新和绘制粒子
        updateParticles();
        
        // 绘制玩家
        drawPlayer();
        
        // 检查道具状态
        checkPowerupStatus(timestamp);
        
        // 继续游戏循环
        if (gameRunning && !gamePaused) {
            animationId = requestAnimationFrame(gameLoop);
        }
    }
    
    // 更新玩家位置
    function updatePlayerPosition() {
        // 键盘控制
        if (keys.ArrowLeft || keys.a) {
            player.dx = -1;
        } else if (keys.ArrowRight || keys.d) {
            player.dx = 1;
        } else if (!player.dx) {
            player.dx = 0;
        }
        
        if (keys.ArrowUp || keys.w) {
            player.dy = -1;
        } else if (keys.ArrowDown || keys.s) {
            player.dy = 1;
        } else if (!player.dy) {
            player.dy = 0;
        }
        
        // 计算新位置
        const speed = player.powerupActive && player.powerupType === 'speed' ? player.speed * 1.5 : player.speed;
        
        player.x += player.dx * speed;
        player.y += player.dy * speed;
        
        // 边界检查
        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    }
    
    // 更新子弹
    function updateBullets() {
        for (let i = player.bullets.length - 1; i >= 0; i--) {
            const bullet = player.bullets[i];
            
            // 移动子弹
            bullet.y -= player.bulletSpeed;
            
            // 移除超出屏幕的子弹
            if (bullet.y + bullet.height < 0) {
                player.bullets.splice(i, 1);
                continue;
            }
            
            // 绘制子弹
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // 检查子弹与敌人的碰撞
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                
                if (checkCollision(bullet, enemy)) {
                    // 击中敌人
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                    enemies.splice(j, 1);
                    player.bullets.splice(i, 1);
                    
                    // 增加分数
                    score += 10 * level;
                    updateUI();
                    
                    // 检查升级
                    if (score >= level * 500) {
                        level++;
                        updateUI();
                    }
                    
                    break;
                }
            }
        }
    }
    
    // 更新敌人
    function updateEnemies() {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            
            // 移动敌人
            enemy.y += enemy.speed;
            
            // 移除超出屏幕的敌人
            if (enemy.y > canvas.height) {
                enemies.splice(i, 1);
                continue;
            }
            
            // 绘制敌人
            if (images.enemy) {
                ctx.drawImage(images.enemy, enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                ctx.fillStyle = enemy.color;
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
            
            // 检查敌人与玩家的碰撞
            if (checkCollision(enemy, player)) {
                // 玩家被击中
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                enemies.splice(i, 1);
                
                // 减少生命值
                lives--;
                updateUI();
                
                // 游戏结束检查
                if (lives <= 0) {
                    gameOver();
                }
            }
        }
    }
    
    // 更新道具
    function updatePowerups() {
        for (let i = powerups.length - 1; i >= 0; i--) {
            const powerup = powerups[i];
            
            // 移动道具
            powerup.y += powerup.speed;
            
            // 移除超出屏幕的道具
            if (powerup.y > canvas.height) {
                powerups.splice(i, 1);
                continue;
            }
            
            // 绘制道具
            const powerupImage = powerup.type === 'speed' ? images.powerupSpeed : images.powerupBullet;
            if (powerupImage) {
                ctx.drawImage(powerupImage, powerup.x, powerup.y, powerup.width, powerup.height);
            } else {
                ctx.fillStyle = powerup.type === 'speed' ? '#2ecc71' : '#f39c12';
                ctx.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);
            }
            
            // 检查道具与玩家的碰撞
            if (checkCollision(powerup, player)) {
                // 玩家获得道具
                activatePowerup(powerup.type);
                powerups.splice(i, 1);
            }
        }
    }
    
    // 更新粒子
    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // 移动粒子
            particle.x += particle.dx;
            particle.y += particle.dy;
            
            // 更新粒子生命周期
            particle.life--;
            particle.alpha = particle.life / 60;
            
            // 移除死亡粒子
            if (particle.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            
            // 绘制粒子
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    
    // 绘制玩家
    function drawPlayer() {
        // 绘制玩家飞机
        if (images.player) {
            ctx.drawImage(images.player, player.x, player.y, player.width, player.height);
        } else {
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }
        
        // 如果有道具激活，绘制光环效果
        if (player.powerupActive) {
            ctx.strokeStyle = player.powerupType === 'speed' ? '#2ecc71' : '#f39c12';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 
                    player.width / 2 + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // 激活道具
    function activatePowerup(type) {
        player.powerupActive = true;
        player.powerupType = type;
        player.powerupEndTime = Date.now() + 10000; // 道具持续10秒
        
        // 根据道具类型应用效果
        if (type === 'speed') {
            // 速度提升效果已在updatePlayerPosition中处理
        } else if (type === 'doubleBullet') {
            // 双发子弹效果已在fireBullet中处理
        }
    }
    
    // 检查道具状态
    function checkPowerupStatus(timestamp) {
        if (player.powerupActive && Date.now() > player.powerupEndTime) {
            player.powerupActive = false;
            player.powerupType = null;
        }
    }
    
    // 游戏结束
    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        showOverlay(gameOverOverlay);
    }
}); 
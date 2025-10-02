document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const levelElement = document.getElementById('level');
    const livesElement = document.getElementById('lives');
    const finalScoreElement = document.getElementById('final-score');
    const difficultySelect = document.getElementById('difficulty');
    const shipTypeSelect = document.getElementById('ship-type');
    
    // 游戏覆盖层
    const gameStartScreen = document.getElementById('game-start-screen');
    const gamePausedScreen = document.getElementById('game-paused-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    
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
    const PLAYER_SIZE = 40;
    const ENEMY_SIZE = 30;
    const BULLET_SIZE = 5;
    const POWERUP_SIZE = 20;
    
    // 游戏变量
    let player = {
        x: canvas.width / 2 - PLAYER_SIZE / 2,
        y: canvas.height - PLAYER_SIZE * 2,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        speed: 5,
        color: '#00ff7f',
        lives: 3,
        invincible: false,
        invincibleTime: 0,
        powerLevel: 1
    };
    
    let bullets = [];
    let enemies = [];
    let enemyBullets = [];
    let powerUps = [];
    let particles = [];
    let stars = [];
    
    let score = 0;
    let highScore = localStorage.getItem('spaceShooterHighScore') || 0;
    let level = 1;
    let gameRunning = false;
    let gamePaused = false;
    let gameLoop;
    let enemySpawnRate = 2000; // 毫秒
    let enemySpawnTimer = 0;
    let lastTime = 0;
    let powerUpSpawnRate = 10000; // 毫秒
    let powerUpSpawnTimer = 0;
    
    // 键盘控制状态
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        w: false,
        a: false,
        s: false,
        d: false,
        ' ': false
    };
    
    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        resetGameState();
        
        // 设置难度
        setDifficulty();
        
        // 设置飞船类型
        setShipType();
        
        // 创建星空背景
        createStars();
        
        // 显示开始屏幕
        showOverlay(gameStartScreen);
    }
    
    // 重置游戏状态
    function resetGameState() {
        player.x = canvas.width / 2 - PLAYER_SIZE / 2;
        player.y = canvas.height - PLAYER_SIZE * 2;
        player.lives = 3;
        player.invincible = false;
        player.invincibleTime = 0;
        player.powerLevel = 1;
        
        bullets = [];
        enemies = [];
        enemyBullets = [];
        powerUps = [];
        particles = [];
        
        score = 0;
        level = 1;
        
        scoreElement.textContent = '0';
        levelElement.textContent = '1';
        livesElement.textContent = '3';
        
        enemySpawnRate = 2000;
        enemySpawnTimer = 0;
        powerUpSpawnTimer = 0;
        
        gameRunning = false;
        gamePaused = false;
    }
    
    // 设置难度
    function setDifficulty() {
        const difficulty = difficultySelect.value;
        
        switch (difficulty) {
            case 'easy':
                player.speed = 5;
                enemySpawnRate = 2500;
                break;
            case 'medium':
                player.speed = 5;
                enemySpawnRate = 2000;
                break;
            case 'hard':
                player.speed = 4;
                enemySpawnRate = 1500;
                break;
        }
    }
    
    // 设置飞船类型
    function setShipType() {
        const shipType = shipTypeSelect.value;
        
        switch (shipType) {
            case 'fighter':
                player.width = PLAYER_SIZE * 0.8;
                player.height = PLAYER_SIZE;
                player.speed += 1;
                player.color = '#00ffff';
                break;
            case 'cruiser':
                player.width = PLAYER_SIZE;
                player.height = PLAYER_SIZE;
                player.color = '#00ff7f';
                break;
            case 'destroyer':
                player.width = PLAYER_SIZE * 1.2;
                player.height = PLAYER_SIZE;
                player.speed -= 1;
                player.color = '#ff7f00';
                break;
        }
    }
    
    // 创建星空背景
    function createStars() {
        stars = [];
        for (let i = 0; i < 100; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.1
            });
        }
    }
    
    // 开始游戏
    function startGame() {
        if (gameRunning && !gamePaused) return;
        
        if (!gameRunning) {
            resetGameState();
            gameRunning = true;
        }
        
        gamePaused = false;
        hideAllOverlays();
        
        // 清除之前的游戏循环
        cancelAnimationFrame(gameLoop);
        
        // 开始新的游戏循环
        lastTime = performance.now();
        gameLoop = requestAnimationFrame(update);
    }
    
    // 暂停游戏
    function pauseGame() {
        if (!gameRunning || gamePaused) return;
        
        gamePaused = true;
        cancelAnimationFrame(gameLoop);
        showOverlay(gamePausedScreen);
    }
    
    // 游戏结束
    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(gameLoop);
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('spaceShooterHighScore', highScore);
            highScoreElement.textContent = highScore;
        }
        
        finalScoreElement.textContent = score;
        showOverlay(gameOverScreen);
    }
    
    // 显示覆盖层
    function showOverlay(overlay) {
        hideAllOverlays();
        overlay.classList.add('active');
    }
    
    // 隐藏所有覆盖层
    function hideAllOverlays() {
        gameStartScreen.classList.remove('active');
        gamePausedScreen.classList.remove('active');
        gameOverScreen.classList.remove('active');
    }
    
    // 游戏更新循环
    function update(currentTime) {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        
        // 清除画布
        ctx.fillStyle = '#0f0f1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 更新和绘制星空背景
        updateStars(deltaTime);
        drawStars();
        
        // 更新玩家
        updatePlayer(deltaTime);
        
        // 更新子弹
        updateBullets(deltaTime);
        
        // 更新敌人
        updateEnemies(deltaTime);
        
        // 更新敌人子弹
        updateEnemyBullets(deltaTime);
        
        // 更新道具
        updatePowerUps(deltaTime);
        
        // 更新粒子效果
        updateParticles(deltaTime);
        
        // 检查碰撞
        checkCollisions();
        
        // 生成敌人
        spawnEnemies(deltaTime);
        
        // 生成道具
        spawnPowerUps(deltaTime);
        
        // 检查关卡升级
        checkLevelUp();
        
        // 绘制游戏对象
        drawGameObjects();
        
        // 如果游戏仍在运行，继续游戏循环
        if (gameRunning && !gamePaused) {
            gameLoop = requestAnimationFrame(update);
        }
    }
    
    // 更新星空背景
    function updateStars(deltaTime) {
        for (const star of stars) {
            star.y += star.speed;
            
            // 如果星星移出屏幕，重新放置在顶部
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        }
    }
    
    // 绘制星空背景
    function drawStars() {
        ctx.fillStyle = '#ffffff';
        for (const star of stars) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 更新玩家
    function updatePlayer(deltaTime) {
        // 处理键盘输入
        if ((keys.ArrowUp || keys.w) && player.y > 0) {
            player.y -= player.speed;
        }
        if ((keys.ArrowDown || keys.s) && player.y < canvas.height - player.height) {
            player.y += player.speed;
        }
        if ((keys.ArrowLeft || keys.a) && player.x > 0) {
            player.x -= player.speed;
        }
        if ((keys.ArrowRight || keys.d) && player.x < canvas.width - player.width) {
            player.x += player.speed;
        }
        
        // 处理射击
        if (keys[' ']) {
            fireBullet();
        }
        
        // 处理无敌时间
        if (player.invincible) {
            player.invincibleTime -= deltaTime;
            if (player.invincibleTime <= 0) {
                player.invincible = false;
            }
        }
    }
    
    // 发射子弹
    function fireBullet() {
        // 限制射击频率
        const now = performance.now();
        if (!player.lastFireTime || now - player.lastFireTime > 300) {
            player.lastFireTime = now;
            
            // 根据能量等级发射不同数量的子弹
            switch (player.powerLevel) {
                case 1:
                    // 单发子弹
                    bullets.push({
                        x: player.x + player.width / 2 - BULLET_SIZE / 2,
                        y: player.y,
                        width: BULLET_SIZE,
                        height: BULLET_SIZE * 2,
                        speed: 10,
                        color: '#00ffff'
                    });
                    break;
                case 2:
                    // 双发子弹
                    bullets.push({
                        x: player.x + player.width / 4 - BULLET_SIZE / 2,
                        y: player.y,
                        width: BULLET_SIZE,
                        height: BULLET_SIZE * 2,
                        speed: 10,
                        color: '#00ffff'
                    });
                    bullets.push({
                        x: player.x + player.width * 3/4 - BULLET_SIZE / 2,
                        y: player.y,
                        width: BULLET_SIZE,
                        height: BULLET_SIZE * 2,
                        speed: 10,
                        color: '#00ffff'
                    });
                    break;
                case 3:
                    // 三发子弹
                    bullets.push({
                        x: player.x + player.width / 2 - BULLET_SIZE / 2,
                        y: player.y,
                        width: BULLET_SIZE,
                        height: BULLET_SIZE * 2,
                        speed: 10,
                        color: '#00ffff'
                    });
                    bullets.push({
                        x: player.x + player.width / 4 - BULLET_SIZE / 2,
                        y: player.y + 10,
                        width: BULLET_SIZE,
                        height: BULLET_SIZE * 2,
                        speed: 10,
                        color: '#00ffff'
                    });
                    bullets.push({
                        x: player.x + player.width * 3/4 - BULLET_SIZE / 2,
                        y: player.y + 10,
                        width: BULLET_SIZE,
                        height: BULLET_SIZE * 2,
                        speed: 10,
                        color: '#00ffff'
                    });
                    break;
            }
        }
    }
    
    // 更新子弹
    function updateBullets(deltaTime) {
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= bullets[i].speed;
            
            // 如果子弹移出屏幕，移除它
            if (bullets[i].y + bullets[i].height < 0) {
                bullets.splice(i, 1);
            }
        }
    }
    
    // 更新敌人
    function updateEnemies(deltaTime) {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            
            // 移动敌人
            enemy.y += enemy.speed;
            
            // 敌人水平移动
            if (enemy.movePattern === 'zigzag') {
                enemy.x += Math.sin(enemy.y / 30) * 2;
            }
            
            // 敌人射击
            if (Math.random() < enemy.fireRate * deltaTime) {
                enemyBullets.push({
                    x: enemy.x + enemy.width / 2 - BULLET_SIZE / 2,
                    y: enemy.y + enemy.height,
                    width: BULLET_SIZE,
                    height: BULLET_SIZE * 2,
                    speed: 5,
                    color: '#ff0000'
                });
            }
            
            // 如果敌人移出屏幕，移除它
            if (enemy.y > canvas.height) {
                enemies.splice(i, 1);
            }
        }
    }
    
    // 更新敌人子弹
    function updateEnemyBullets(deltaTime) {
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            enemyBullets[i].y += enemyBullets[i].speed;
            
            // 如果子弹移出屏幕，移除它
            if (enemyBullets[i].y > canvas.height) {
                enemyBullets.splice(i, 1);
            }
        }
    }
    
    // 更新道具
    function updatePowerUps(deltaTime) {
        for (let i = powerUps.length - 1; i >= 0; i--) {
            powerUps[i].y += powerUps[i].speed;
            
            // 如果道具移出屏幕，移除它
            if (powerUps[i].y > canvas.height) {
                powerUps.splice(i, 1);
            }
        }
    }
    
    // 更新粒子效果
    function updateParticles(deltaTime) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 更新生命周期
            particle.life -= deltaTime;
            
            // 如果粒子生命周期结束，移除它
            if (particle.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }
    
    // 检查碰撞
    function checkCollisions() {
        // 玩家子弹与敌人碰撞
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                
                if (isColliding(bullet, enemy)) {
                    // 创建爆炸粒子
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                    
                    // 增加分数
                    score += enemy.score;
                    scoreElement.textContent = score;
                    
                    // 有几率掉落道具
                    if (Math.random() < 0.1) {
                        spawnPowerUp(enemy.x, enemy.y);
                    }
                    
                    // 移除敌人和子弹
                    enemies.splice(j, 1);
                    bullets.splice(i, 1);
                    break;
                }
            }
        }
        
        // 敌人子弹与玩家碰撞
        if (!player.invincible) {
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const bullet = enemyBullets[i];
                
                if (isColliding(bullet, player)) {
                    // 玩家受伤
                    playerHit();
                    
                    // 移除子弹
                    enemyBullets.splice(i, 1);
                    break;
                }
            }
        }
        
        // 敌人与玩家碰撞
        if (!player.invincible) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                
                if (isColliding(enemy, player)) {
                    // 玩家受伤
                    playerHit();
                    
                    // 创建爆炸粒子
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                    
                    // 移除敌人
                    enemies.splice(i, 1);
                    break;
                }
            }
        }
        
        // 道具与玩家碰撞
        for (let i = powerUps.length - 1; i >= 0; i--) {
            const powerUp = powerUps[i];
            
            if (isColliding(powerUp, player)) {
                // 应用道具效果
                applyPowerUp(powerUp.type);
                
                // 移除道具
                powerUps.splice(i, 1);
            }
        }
    }
    
    // 玩家受伤
    function playerHit() {
        player.lives--;
        livesElement.textContent = player.lives;
        
        // 创建爆炸效果
        createExplosion(player.x + player.width / 2, player.y + player.height / 2, player.color);
        
        // 设置无敌状态
        player.invincible = true;
        player.invincibleTime = 2; // 2秒无敌时间
        
        // 如果生命值为0，游戏结束
        if (player.lives <= 0) {
            gameOver();
        }
    }
    
    // 应用道具效果
    function applyPowerUp(type) {
        switch (type) {
            case 'weapon':
                // 武器升级
                if (player.powerLevel < 3) {
                    player.powerLevel++;
                }
                break;
            case 'life':
                // 生命恢复
                player.lives++;
                livesElement.textContent = player.lives;
                break;
            case 'shield':
                // 护盾
                player.invincible = true;
                player.invincibleTime = 5; // 5秒无敌时间
                break;
        }
    }
    
    // 生成敌人
    function spawnEnemies(deltaTime) {
        enemySpawnTimer += deltaTime * 1000;
        
        if (enemySpawnTimer >= enemySpawnRate) {
            enemySpawnTimer = 0;
            
            // 随机敌人类型
            const enemyTypes = ['basic', 'fast', 'tank'];
            const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            
            let enemy = {
                x: Math.random() * (canvas.width - ENEMY_SIZE),
                y: -ENEMY_SIZE,
                width: ENEMY_SIZE,
                height: ENEMY_SIZE,
                movePattern: Math.random() > 0.7 ? 'zigzag' : 'straight',
                fireRate: 0.5, // 每秒发射子弹的概率
            };
            
            // 根据敌人类型设置属性
            switch (enemyType) {
                case 'basic':
                    enemy.speed = 2 + level * 0.1;
                    enemy.color = '#ff0000';
                    enemy.score = 10;
                    break;
                case 'fast':
                    enemy.speed = 3 + level * 0.2;
                    enemy.width = ENEMY_SIZE * 0.8;
                    enemy.height = ENEMY_SIZE * 0.8;
                    enemy.color = '#ffff00';
                    enemy.score = 20;
                    break;
                case 'tank':
                    enemy.speed = 1 + level * 0.05;
                    enemy.width = ENEMY_SIZE * 1.2;
                    enemy.height = ENEMY_SIZE * 1.2;
                    enemy.color = '#ff7f00';
                    enemy.fireRate = 1;
                    enemy.score = 30;
                    break;
            }
            
            enemies.push(enemy);
        }
    }
    
    // 生成道具
    function spawnPowerUps(deltaTime) {
        powerUpSpawnTimer += deltaTime * 1000;
        
        if (powerUpSpawnTimer >= powerUpSpawnRate) {
            powerUpSpawnTimer = 0;
            spawnPowerUp(Math.random() * (canvas.width - POWERUP_SIZE), -POWERUP_SIZE);
        }
    }
    
    // 在指定位置生成道具
    function spawnPowerUp(x, y) {
        const types = ['weapon', 'life', 'shield'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let color;
        switch (type) {
            case 'weapon':
                color = '#00ffff';
                break;
            case 'life':
                color = '#ff00ff';
                break;
            case 'shield':
                color = '#ffff00';
                break;
        }
        
        powerUps.push({
            x,
            y,
            width: POWERUP_SIZE,
            height: POWERUP_SIZE,
            speed: 2,
            type,
            color
        });
    }
    
    // 创建爆炸效果
    function createExplosion(x, y, color) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color,
                life: Math.random() * 0.5 + 0.5 // 0.5-1秒生命周期
            });
        }
    }
    
    // 检查两个对象是否碰撞
    function isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    // 检查关卡升级
    function checkLevelUp() {
        const newLevel = Math.floor(score / 500) + 1;
        
        if (newLevel > level) {
            level = newLevel;
            levelElement.textContent = level;
            
            // 提高难度
            enemySpawnRate = Math.max(500, enemySpawnRate - 100);
        }
    }
    
    // 绘制游戏对象
    function drawGameObjects() {
        // 绘制玩家
        ctx.fillStyle = player.color;
        
        // 如果玩家处于无敌状态，闪烁效果
        if (player.invincible && Math.floor(performance.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // 绘制玩家飞船
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.lineTo(player.x, player.y + player.height);
        ctx.closePath();
        ctx.fill();
        
        // 恢复透明度
        ctx.globalAlpha = 1;
        
        // 绘制子弹
        for (const bullet of bullets) {
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // 绘制敌人
        for (const enemy of enemies) {
            ctx.fillStyle = enemy.color;
            
            // 绘制敌人飞船
            ctx.beginPath();
            ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
            ctx.lineTo(enemy.x + enemy.width, enemy.y);
            ctx.lineTo(enemy.x, enemy.y);
            ctx.closePath();
            ctx.fill();
        }
        
        // 绘制敌人子弹
        for (const bullet of enemyBullets) {
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // 绘制道具
        for (const powerUp of powerUps) {
            ctx.fillStyle = powerUp.color;
            ctx.beginPath();
            ctx.arc(
                powerUp.x + powerUp.width / 2,
                powerUp.y + powerUp.height / 2,
                powerUp.width / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // 绘制闪烁效果
            if (Math.floor(performance.now() / 100) % 2 === 0) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
        
        // 绘制粒子
        for (const particle of particles) {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life; // 根据生命周期设置透明度
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 恢复透明度
        ctx.globalAlpha = 1;
    }
    
    // 事件监听
    
    // 键盘按下
    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;
            
            // 空格键开始游戏
            if (e.key === ' ' && !gameRunning) {
                startGame();
            }
        }
        
        // P键暂停/继续游戏
        if (e.key === 'p' || e.key === 'P') {
            if (gameRunning) {
                if (gamePaused) {
                    startGame();
                } else {
                    pauseGame();
                }
            }
        }
    });
    
    // 键盘松开
    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    });
    
    // 按钮点击事件
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    resumeBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    
    // 移动控制按钮
    upBtn.addEventListener('mousedown', () => keys.ArrowUp = true);
    upBtn.addEventListener('mouseup', () => keys.ArrowUp = false);
    upBtn.addEventListener('touchstart', () => keys.ArrowUp = true);
    upBtn.addEventListener('touchend', () => keys.ArrowUp = false);
    
    downBtn.addEventListener('mousedown', () => keys.ArrowDown = true);
    downBtn.addEventListener('mouseup', () => keys.ArrowDown = false);
    downBtn.addEventListener('touchstart', () => keys.ArrowDown = true);
    downBtn.addEventListener('touchend', () => keys.ArrowDown = false);
    
    leftBtn.addEventListener('mousedown', () => keys.ArrowLeft = true);
    leftBtn.addEventListener('mouseup', () => keys.ArrowLeft = false);
    leftBtn.addEventListener('touchstart', () => keys.ArrowLeft = true);
    leftBtn.addEventListener('touchend', () => keys.ArrowLeft = false);
    
    rightBtn.addEventListener('mousedown', () => keys.ArrowRight = true);
    rightBtn.addEventListener('mouseup', () => keys.ArrowRight = false);
    rightBtn.addEventListener('touchstart', () => keys.ArrowRight = true);
    rightBtn.addEventListener('touchend', () => keys.ArrowRight = false);
    
    // 发射按钮
    fireBtn.addEventListener('mousedown', () => keys[' '] = true);
    fireBtn.addEventListener('mouseup', () => keys[' '] = false);
    fireBtn.addEventListener('touchstart', () => keys[' '] = true);
    fireBtn.addEventListener('touchend', () => keys[' '] = false);
    
    // 阻止触摸事件的默认行为
    document.querySelectorAll('.direction-btn, .action-btn').forEach(btn => {
        btn.addEventListener('touchstart', (e) => e.preventDefault());
        btn.addEventListener('touchend', (e) => e.preventDefault());
    });
    
    // 窗口大小改变时调整画布大小
    window.addEventListener('resize', () => {
        if (window.innerWidth < 650) {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.width;
        } else {
            canvas.width = 600;
            canvas.height = 600;
        }
        
        // 重新设置玩家位置
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - player.height * 2;
        
        // 重新创建星空背景
        createStars();
    });
    
    // 初始化
    highScoreElement.textContent = highScore;
    initGame();
}); 
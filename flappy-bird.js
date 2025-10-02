// Flappy Bird 完整游戏逻辑
class FlappyBirdGame {
    constructor(gameMemoryManager) {
        this.gameMemoryManager = gameMemoryManager;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.startBtn = document.getElementById('startGame');
        
        // 游戏状态
        this.gameRunning = false;
        this.gameOver = false;
        this.score = 0;
        this.animationId = null;
        
        // 小鸟属性
        this.bird = {
            x: 80,
            y: this.canvas.height / 2,
            width: 30,
            height: 30,
            velocity: 0,
            gravity: 0.6,
            jumpPower: -12,
            color: '#FFD700'
        };
        
        // 管道属性
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeSpeed = 3;
        this.pipeSpawnRate = 90; // 每90帧生成一个管道
        this.frameCount = 0;
        
        // 背景
        this.backgroundX = 0;
        this.backgroundSpeed = 1;
        
        this.initEvents();
        this.resetGame();
    }
    
    initEvents() {
        // 开始按钮事件
        this.startBtn.addEventListener('click', () => {
            if (!this.gameRunning) {
                this.startGame();
            }
        });
        
        // 点击画布跳跃
        this.canvas.addEventListener('click', () => {
            if (this.gameRunning && !this.gameOver) {
                this.jump();
            }
        });
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if ((e.code === 'Space' || e.code === 'ArrowUp') && this.gameRunning && !this.gameOver) {
                e.preventDefault();
                this.jump();
            }
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameOver = false;
        this.startBtn.textContent = '游戏中...';
        this.startBtn.disabled = true;
        this.gameLoop();
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gameOver = false;
        this.score = 0;
        this.frameCount = 0;
        this.backgroundX = 0;
        
        // 重置小鸟
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        
        // 清空管道
        this.pipes = [];
        
        // 重置UI
        this.scoreElement.textContent = '0';
        this.startBtn.textContent = '开始游戏';
        this.startBtn.disabled = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.draw();
    }
    
    jump() {
        this.bird.velocity = this.bird.jumpPower;
    }
    
    update() {
        if (this.gameOver) return;
        
        this.frameCount++;
        
        // 更新小鸟
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // 检查小鸟是否撞到地面或天花板
        if (this.bird.y + this.bird.height >= this.canvas.height || this.bird.y <= 0) {
            this.endGame();
            return;
        }
        
        // 生成管道
        if (this.frameCount % this.pipeSpawnRate === 0) {
            this.createPipe();
        }
        
        // 更新管道
        this.updatePipes();
        
        // 检查碰撞
        this.checkCollisions();
        
        // 更新背景
        this.backgroundX -= this.backgroundSpeed;
        if (this.backgroundX <= -this.canvas.width) {
            this.backgroundX = 0;
        }
    }
    
    createPipe() {
        const minHeight = 50;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            bottomHeight: this.canvas.height - (topHeight + this.pipeGap),
            passed: false
        });
    }
    
    updatePipes() {
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // 检查是否通过管道（得分）
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.scoreElement.textContent = this.score;
            }
            
            // 移除屏幕外的管道
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        for (const pipe of this.pipes) {
            // 检查是否在管道的x范围内
            if (this.bird.x + this.bird.width > pipe.x && this.bird.x < pipe.x + this.pipeWidth) {
                // 检查是否撞到上管道或下管道
                if (this.bird.y < pipe.topHeight || this.bird.y + this.bird.height > pipe.bottomY) {
                    this.endGame();
                    return;
                }
            }
        }
    }
    
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.drawBackground();
        
        // 绘制管道
        this.drawPipes();
        
        // 绘制小鸟
        this.drawBird();
        
        // 绘制游戏结束界面
        if (this.gameOver) {
            this.drawGameOver();
        }
    }
    
    drawBackground() {
        // 绘制渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#E0F6FF');
        gradient.addColorStop(1, '#98FB98');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制云朵
        this.drawClouds();
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // 简单的云朵效果
        const cloudPositions = [
            { x: (this.backgroundX * 0.5) % (this.canvas.width + 100), y: 80 },
            { x: (this.backgroundX * 0.3 + 200) % (this.canvas.width + 100), y: 150 },
            { x: (this.backgroundX * 0.4 + 350) % (this.canvas.width + 100), y: 100 }
        ];
        
        cloudPositions.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, 25, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + 25, cloud.y, 35, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + 50, cloud.y, 25, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawBird() {
        this.ctx.save();
        
        // 根据速度旋转小鸟
        const rotation = Math.min(Math.max(this.bird.velocity * 0.1, -0.5), 0.5);
        this.ctx.translate(this.bird.x + this.bird.width/2, this.bird.y + this.bird.height/2);
        this.ctx.rotate(rotation);
        
        // 绘制小鸟身体
        this.ctx.fillStyle = this.bird.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.bird.width/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制小鸟眼睛
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(5, -5, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(7, -3, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制小鸟嘴巴
        this.ctx.fillStyle = '#FF6347';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.width/2, 0);
        this.ctx.lineTo(this.bird.width/2 + 10, -2);
        this.ctx.lineTo(this.bird.width/2 + 10, 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawPipes() {
        this.ctx.fillStyle = '#228B22';
        
        this.pipes.forEach(pipe => {
            // 绘制上管道
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // 绘制下管道
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);
            
            // 绘制管道边框
            this.ctx.strokeStyle = '#006400';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            this.ctx.strokeRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);
        });
    }
    
    drawGameOver() {
        // 半透明遮罩
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 游戏结束文字
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束', this.canvas.width/2, this.canvas.height/2 - 50);
        
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`最终得分: ${this.score}`, this.canvas.width/2, this.canvas.height/2);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText('点击"开始游戏"重新开始', this.canvas.width/2, this.canvas.height/2 + 40);
    }
    
    endGame() {
        this.gameOver = true;
        this.gameRunning = false;
        this.startBtn.textContent = '重新开始';
        this.startBtn.disabled = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    gameLoop() {
        if (this.gameRunning && !this.gameOver) {
            this.update();
        }
        
        this.draw();
        
        if (this.gameRunning) {
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// 初始化游戏
let game;

document.addEventListener('DOMContentLoaded', () => {
    // 初始化内存管理器和生命周期管理器
    const gameId = 'flappy-bird-game';
    const gameMemoryManager = new GameMemoryManager(gameId);
    const gameLifecycle = new GameLifecycle(gameId);
    
    // 注册错误处理回调
    GameErrorHandler.registerCallback('flappy-bird', (error) => {
        console.error('飞扬的小鸟游戏错误:', error);
        if (error.severity === 'critical') {
            // 重置游戏状态
            if (game) {
                game.resetGame();
            }
        }
    });
    
    // 设置内存管理器错误处理
    if (window.GameErrorHandler && typeof window.GameErrorHandler.registerCallback === 'function') {
        window.GameErrorHandler.registerCallback('memory-manager', (error) => {
            console.error('内存管理器错误:', error);
        });
    }
    
    game = new FlappyBirdGame(gameMemoryManager);
    
    // 启动游戏生命周期管理
    gameLifecycle.start();
    
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
        if (gameLifecycle && typeof gameLifecycle.destroy === 'function') {
            gameLifecycle.destroy();
        }
        if (gameMemoryManager && typeof gameMemoryManager.cleanup === 'function') {
            gameMemoryManager.cleanup();
        }
    });
});

// 重新开始游戏的全局函数
function restartGame() {
    if (game) {
        game.resetGame();
    }
}
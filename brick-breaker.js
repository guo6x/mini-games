// 打砖块游戏逻辑
class BrickBreakerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.startButton = document.getElementById('startGame');
        
        // 游戏状态
        this.gameRunning = false;
        this.score = 0;
        this.lives = 3;
        
        // 球的属性
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 30,
            dx: 3,
            dy: -3,
            radius: 8
        };
        
        // 挡板属性
        this.paddle = {
            x: (this.canvas.width - 75) / 2,
            y: this.canvas.height - 20,
            width: 75,
            height: 10
        };
        
        // 砖块属性
        this.bricks = [];
        this.brickRowCount = 5;
        this.brickColumnCount = 8;
        this.brickWidth = 75;
        this.brickHeight = 20;
        this.brickPadding = 10;
        this.brickOffsetTop = 60;
        this.brickOffsetLeft = 30;
        
        this.initBricks();
        this.bindEvents();
        this.draw();
    }
    
    initBricks() {
        this.bricks = [];
        for (let c = 0; c < this.brickColumnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.brickRowCount; r++) {
                this.bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }
    }
    
    bindEvents() {
        this.startButton.addEventListener('click', () => this.startGame());
        
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                this.paddle.x = Math.min(this.paddle.x + 20, this.canvas.width - this.paddle.width);
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                this.paddle.x = Math.max(this.paddle.x - 20, 0);
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.gameRunning) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            if (relativeX > 0 && relativeX < this.canvas.width) {
                this.paddle.x = relativeX - this.paddle.width / 2;
                this.paddle.x = Math.max(0, Math.min(this.paddle.x, this.canvas.width - this.paddle.width));
            }
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.lives = 3;
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height - 30;
        this.ball.dx = 3;
        this.ball.dy = -3;
        this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
        this.initBricks();
        this.updateScore();
        this.startButton.textContent = '游戏中...';
        this.startButton.disabled = true;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // 更新球的位置
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // 球与墙壁碰撞检测
        if (this.ball.x + this.ball.dx > this.canvas.width - this.ball.radius || this.ball.x + this.ball.dx < this.ball.radius) {
            this.ball.dx = -this.ball.dx;
        }
        if (this.ball.y + this.ball.dy < this.ball.radius) {
            this.ball.dy = -this.ball.dy;
        } else if (this.ball.y + this.ball.dy > this.canvas.height - this.ball.radius) {
            // 球掉到底部
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver();
                return;
            } else {
                // 重置球的位置
                this.ball.x = this.canvas.width / 2;
                this.ball.y = this.canvas.height - 30;
                this.ball.dx = 3;
                this.ball.dy = -3;
                this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
            }
        }
        
        // 球与挡板碰撞检测
        if (this.ball.y + this.ball.radius > this.paddle.y && 
            this.ball.x > this.paddle.x && 
            this.ball.x < this.paddle.x + this.paddle.width) {
            this.ball.dy = -this.ball.dy;
        }
        
        // 球与砖块碰撞检测
        this.collisionDetection();
    }
    
    collisionDetection() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                const brick = this.bricks[c][r];
                if (brick.status === 1) {
                    if (this.ball.x > brick.x && 
                        this.ball.x < brick.x + this.brickWidth && 
                        this.ball.y > brick.y && 
                        this.ball.y < brick.y + this.brickHeight) {
                        this.ball.dy = -this.ball.dy;
                        brick.status = 0;
                        this.score += 10;
                        this.updateScore();
                        
                        // 检查是否所有砖块都被消除
                        if (this.score === this.brickRowCount * this.brickColumnCount * 10) {
                            this.gameWin();
                        }
                    }
                }
            }
        }
    }
    
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制砖块
        this.drawBricks();
        
        // 绘制球
        this.drawBall();
        
        // 绘制挡板
        this.drawPaddle();
        
        // 绘制生命值
        this.drawLives();
    }
    
    drawBricks() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                if (this.bricks[c][r].status === 1) {
                    const brickX = (c * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
                    const brickY = (r * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
                    this.bricks[c][r].x = brickX;
                    this.bricks[c][r].y = brickY;
                    
                    this.ctx.beginPath();
                    this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
                    this.ctx.fillStyle = this.getBrickColor(r);
                    this.ctx.fill();
                    this.ctx.closePath();
                }
            }
        }
    }
    
    getBrickColor(row) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        return colors[row % colors.length];
    }
    
    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fill();
        this.ctx.closePath();
    }
    
    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.rect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.fill();
        this.ctx.closePath();
    }
    
    drawLives() {
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#333';
        this.ctx.fillText('生命: ' + this.lives, this.canvas.width - 80, 20);
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    gameOver() {
        this.gameRunning = false;
        this.startButton.textContent = '重新开始';
        this.startButton.disabled = false;
        
        this.ctx.font = '30px Arial';
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束!', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('最终得分: ' + this.score, this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    gameWin() {
        this.gameRunning = false;
        this.startButton.textContent = '重新开始';
        this.startButton.disabled = false;
        
        this.ctx.font = '30px Arial';
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('恭喜通关!', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('最终得分: ' + this.score, this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
}

// 初始化游戏
window.addEventListener('load', () => {
    new BrickBreakerGame();
});
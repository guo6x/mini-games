document.addEventListener('DOMContentLoaded', () => {
    // 初始化内存管理器和生命周期管理器
    const gameId = 'pong-game';
    const gameMemoryManager = new GameMemoryManager(gameId);
    const gameLifecycle = new GameLifecycle(gameId);
    
    // 注册错误处理回调
    GameErrorHandler.registerCallback('pong', (error) => {
        console.error('乒乓球游戏错误:', error);
        if (error.severity === 'critical') {
            // 暂停游戏
            if (typeof pauseGame === 'function') {
                pauseGame();
            }
        }
    });
    
    // 错误处理 - 监听内存管理器事件（使用正确的事件监听方式）
    document.addEventListener('gameMemory:lowMemory', (event) => {
        if (event.detail.gameId === gameId) {
            GameErrorHandler.handleError({
                type: 'memory_leak',
                message: `内存使用过高: ${event.detail.usage}MB`,
                source: 'pong-game',
                severity: 'warning'
            });
        }
    });
    
    document.addEventListener('gameMemory:error', (event) => {
        GameErrorHandler.handleError(event.detail.error, 'Pong Game');
    });
    const canvas = document.getElementById('game-canvas');
    const context = canvas.getContext('2d');
    const startGameButton = document.getElementById('start-btn');

    // 设置画布尺寸
    function setCanvasSize() {
        const containerWidth = canvas.parentElement.clientWidth;
        const maxWidth = 600;
        const width = Math.min(containerWidth - 40, maxWidth);
        const height = width * 2/3; // 保持3:2的宽高比
        
        canvas.width = width;
        canvas.height = height;
    }
    
    // 初始设置和窗口大小变化时重设画布大小
    setCanvasSize();
    window.addEventListener('resize', () => {
        setCanvasSize();
        resetGame(); // 重设游戏状态
        draw(); // 重新绘制
    });

    // 球拍和球的属性
    const paddleWidth = 10;
    let paddleHeight;
    let ballRadius;
    let player1Y, player2Y, ballX, ballY, ballSpeedX, ballSpeedY;

    // 初始化游戏参数
    function initGameParameters() {
        paddleHeight = canvas.height / 4;
        ballRadius = canvas.width / 60;
        
        player1Y = (canvas.height - paddleHeight) / 2;
        player2Y = (canvas.height - paddleHeight) / 2;
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = canvas.width / 120;
        ballSpeedY = canvas.height / 120;
    }

    initGameParameters();

    let player1Score = 0;
    let player2Score = 0;
    const winningScore = 5;

    let gameStarted = false;

    // 绘制球拍
    function drawPaddle(x, y, width, height) {
        context.fillStyle = '#fff';
        context.fillRect(x, y, width, height);
    }

    // 绘制球
    function drawBall(x, y, radius) {
        context.fillStyle = '#fff';
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        context.closePath();
    }

    // 绘制分数
    function drawScores() {
        context.font = `${canvas.height/8}px Arial`;
        context.fillStyle = '#fff';
        context.fillText(player1Score, canvas.width / 4, 50);
        context.fillText(player2Score, (canvas.width / 4) * 3, 50);
    }

    // 更新游戏状态
    function update() {
        if (!gameStarted) return;

        // 移动球
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // 球碰到上下边界
        if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
            ballSpeedY = -ballSpeedY;
        }

        // 球碰到球拍
        // 玩家1 (左边)
        if (ballX - ballRadius < paddleWidth && ballY > player1Y && ballY < player1Y + paddleHeight) {
            ballSpeedX = -ballSpeedX;
            // 根据击球位置调整Y方向速度
            const deltaY = ballY - (player1Y + paddleHeight/2);
            ballSpeedY = deltaY * 0.35;
        }
        // 玩家2 (右边)
        if (ballX + ballRadius > canvas.width - paddleWidth && ballY > player2Y && ballY < player2Y + paddleHeight) {
            ballSpeedX = -ballSpeedX;
            // 根据击球位置调整Y方向速度
            const deltaY = ballY - (player2Y + paddleHeight/2);
            ballSpeedY = deltaY * 0.35;
        }

        // 球出界
        if (ballX - ballRadius < 0) {
            player2Score++;
            resetBall();
            checkWin();
        } else if (ballX + ballRadius > canvas.width) {
            player1Score++;
            resetBall();
            checkWin();
        }
    }

    // 重置球的位置
    function resetBall() {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = -ballSpeedX; // 反向发球
        ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * (canvas.height / 120); // 随机Y方向
    }

    // 检查胜利条件
    function checkWin() {
        if (player1Score >= winningScore) {
            alert('玩家1获胜!');
            gameStarted = false;
            resetGame();
        } else if (player2Score >= winningScore) {
            alert('玩家2获胜!');
            gameStarted = false;
            resetGame();
        }
    }

    function resetGame() {
        player1Score = 0;
        player2Score = 0;
        initGameParameters();
        startGameButton.disabled = false;
        draw(); // 重新绘制初始状态
    }

    // 绘制所有内容
    function draw() {
        // 清除画布
        context.fillStyle = '#333';
        context.fillRect(0, 0, canvas.width, canvas.height);

        drawPaddle(0, player1Y, paddleWidth, paddleHeight); // 玩家1球拍
        drawPaddle(canvas.width - paddleWidth, player2Y, paddleWidth, paddleHeight); // 玩家2球拍
        drawBall(ballX, ballY, ballRadius);
        drawScores();
    }

    // 游戏循环
    function gameLoop() {
        update();
        draw();
        if (gameStarted) {
            requestAnimationFrame(gameLoop);
        }
    }

    // 控制球拍
    document.addEventListener('keydown', (event) => {
        if (!gameStarted) return;
        const moveDistance = canvas.height / 13;
        
        // 玩家1 (W, S)
        if (event.key === 'w' || event.key === 'W') {
            player1Y -= moveDistance;
            if (player1Y < 0) player1Y = 0;
        }
        if (event.key === 's' || event.key === 'S') {
            player1Y += moveDistance;
            if (player1Y + paddleHeight > canvas.height) player1Y = canvas.height - paddleHeight;
        }

        // 玩家2 (ArrowUp, ArrowDown)
        if (event.key === 'ArrowUp') {
            player2Y -= moveDistance;
            if (player2Y < 0) player2Y = 0;
        }
        if (event.key === 'ArrowDown') {
            player2Y += moveDistance;
            if (player2Y + paddleHeight > canvas.height) player2Y = canvas.height - paddleHeight;
        }
    });

    startGameButton.addEventListener('click', () => {
        if (!gameStarted) {
            gameStarted = true;
            startGameButton.disabled = true;
            resetGame(); // 确保游戏从初始状态开始
            ballSpeedX = canvas.width / 120; // 初始发球方向
            gameLoop();
        }
    });

    // 初始绘制
    draw();
    
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
        if (gameLifecycle.destroy) {
            gameLifecycle.destroy();
        }
        if (gameMemoryManager.cleanup) {
            gameMemoryManager.cleanup();
        }
    });
    
    // 启动游戏生命周期管理
    gameLifecycle.start();
});
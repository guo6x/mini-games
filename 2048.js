document.addEventListener('DOMContentLoaded', () => {
    // 游戏ID - 用于存储和统计
    const GAME_ID = '2048';
    
    // 初始化内存管理器和生命周期管理器
    const gameMemoryManager = new GameMemoryManager('2048');
    const gameLifecycle = new GameLifecycle('2048');
    
    // 注册错误处理回调
    gameLifecycle.onStateChange('error', (error) => {
        console.error('2048游戏错误:', error);
        if (window.GameErrorHandler) {
            GameErrorHandler.handleError(error, '2048');
        }
    });
    
    // 游戏类定义
    class Game2048 {
      constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.keepPlaying = false;
        this.isRunning = false;
        this.canMove = true;
        
        // DOM元素
        this.gridTiles = document.getElementById('grid-tiles');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.newGameButton = document.getElementById('new-game-button');
        this.retryButton = document.getElementById('retry-button');
        this.keepPlayingButton = document.getElementById('keep-playing-button');
        this.gameMessage = document.getElementById('game-message');
        
        this.init();
      }
      
      init() {
        // 加载最高分
        const savedBestScore = localStorage.getItem('2048-best-score');
        if (savedBestScore) {
          this.bestScore = parseInt(savedBestScore);
        }
        
        // 加载高分榜
        this.loadHighScores();
        
        // 绑定事件
        this.bindEvents();
        
        // 开始新游戏
        this.newGame();
      }
      
      bindEvents() {
        // 按钮事件
        this.newGameButton.addEventListener('click', () => this.newGame());
        this.retryButton.addEventListener('click', () => this.newGame());
        this.keepPlayingButton.addEventListener('click', () => this.keepPlayingGame());
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 触摸事件（移动端支持）
        this.bindTouchEvents();
      }
    
      newGame() {
        // 清空网格和分数
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.keepPlaying = false;
        this.isRunning = true;
        this.canMove = true;
        
        // 加载最高分
        const savedBestScore = localStorage.getItem('2048-best-score');
        if (savedBestScore) {
          this.bestScore = parseInt(savedBestScore);
        }
        
        this.updateScore();
        this.updateBestScore();
        
        // 添加初始方块
        this.addRandomTile();
        this.addRandomTile();
        
        this.renderGrid();
        
        // 隐藏游戏信息
        this.gameMessage.classList.remove('show', 'game-won', 'game-over');
        
        // 可以添加音效支持
      }
      
      keepPlayingGame() {
        this.keepPlaying = true;
        this.gameMessage.classList.remove('show');
        // 可以添加音效支持
      }
    
      // 创建空网格
      createEmptyGrid() {
        const newGrid = [];
        for (let i = 0; i < this.gridSize; i++) {
          newGrid[i] = [];
          for (let j = 0; j < this.gridSize; j++) {
            newGrid[i][j] = 0;
          }
        }
        return newGrid;
      }
      
      // 添加随机方块
      addRandomTile() {
        if (!this.hasEmptyCell()) return;
        
        let row, col;
        do {
          row = Math.floor(Math.random() * this.gridSize);
          col = Math.floor(Math.random() * this.gridSize);
        } while (this.grid[row][col] !== 0);
        
        // 90%的概率是2，10%的概率是4
        this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
        
        // 可以添加音效支持
      }
      
      // 检查是否有空格
      hasEmptyCell() {
        for (let i = 0; i < this.gridSize; i++) {
          for (let j = 0; j < this.gridSize; j++) {
            if (this.grid[i][j] === 0) return true;
          }
        }
        return false;
      }
    
      // 渲染网格
      renderGrid() {
        // 清空网格
        this.gridTiles.innerHTML = '';
        
        // 渲染每个方块
        for (let i = 0; i < this.gridSize; i++) {
          for (let j = 0; j < this.gridSize; j++) {
            if (this.grid[i][j] !== 0) {
              const tile = document.createElement('div');
              tile.className = `tile tile-${this.grid[i][j]}`;
              tile.textContent = this.grid[i][j];
              
              // 计算位置
              const position = this.calculatePosition(i, j);
              tile.style.top = position.top + 'px';
              tile.style.left = position.left + 'px';
              
              this.gridTiles.appendChild(tile);
            }
          }
        }
      }
      
      // 计算方块的位置
      calculatePosition(row, col) {
        // 获取网格容器的尺寸
        const gridRect = this.gridTiles.getBoundingClientRect();
        const cellSize = (gridRect.width - 45) / this.gridSize; // 45 = 15px gap * 3
        
        return {
          top: row * (cellSize + 15),
          left: col * (cellSize + 15)
        };
      }
      
      // 更新分数
      updateScore() {
        this.scoreDisplay.textContent = this.score;
      }
      
      // 更新最高分
      updateBestScore() {
        this.bestScoreDisplay.textContent = this.bestScore;
      }
      
      // 保存最高分
      saveBestScore() {
        if (this.score > this.bestScore) {
          this.bestScore = this.score;
          localStorage.setItem('2048-best-score', this.bestScore.toString());
          this.updateBestScore();
          this.loadHighScores(); // 更新高分榜
        }
      }
    
      // 移动方块
      moveTiles(direction) {
        if ((this.gameOver && !this.keepPlaying) || !this.canMove) return false;
        
        this.canMove = false;
        let moved = false;
        
        // 保存网格的副本用于检测是否移动
        const previousGrid = JSON.parse(JSON.stringify(this.grid));
        
        // 根据方向移动方块
        switch (direction) {
          case 'up':
            moved = this.moveUp();
            break;
          case 'right':
            moved = this.moveRight();
            break;
          case 'down':
            moved = this.moveDown();
            break;
          case 'left':
            moved = this.moveLeft();
            break;
        }
        
        // 如果方块移动了，添加新方块并检查游戏状态
        if (moved) {
          this.addRandomTile();
          this.renderGrid();
          this.checkGameStatus();
          
          // 可以添加音效支持
        }
        
        // 延迟恢复移动能力，防止过快操作
        setTimeout(() => {
          this.canMove = true;
        }, 100);
        
        return moved;
      }
    
      // 向上移动
      moveUp() {
        let moved = false;
        
        for (let col = 0; col < this.gridSize; col++) {
          for (let row = 1; row < this.gridSize; row++) {
            if (this.grid[row][col] !== 0) {
              let currentRow = row;
              
              // 向上移动直到碰到其他方块或边界
              while (currentRow > 0 && this.grid[currentRow - 1][col] === 0) {
                this.grid[currentRow - 1][col] = this.grid[currentRow][col];
                this.grid[currentRow][col] = 0;
                currentRow--;
                moved = true;
              }
              
              // 检查是否可以合并
              if (currentRow > 0 && this.grid[currentRow - 1][col] === this.grid[currentRow][col]) {
                this.grid[currentRow - 1][col] *= 2;
                this.grid[currentRow][col] = 0;
                this.score += this.grid[currentRow - 1][col];
                this.updateScore();
                this.saveBestScore();
                
                // 检查是否达到2048
                if (this.grid[currentRow - 1][col] === 2048 && !this.gameWon) {
                  this.gameWon = true;
                  // 可以添加音效支持
                }
                
                moved = true;
              }
            }
          }
        }
        
        return moved;
      }
      
      // 向右移动
      moveRight() {
        let moved = false;
        
        for (let row = 0; row < this.gridSize; row++) {
          for (let col = this.gridSize - 2; col >= 0; col--) {
            if (this.grid[row][col] !== 0) {
              let currentCol = col;
              
              // 向右移动直到碰到其他方块或边界
              while (currentCol < this.gridSize - 1 && this.grid[row][currentCol + 1] === 0) {
                this.grid[row][currentCol + 1] = this.grid[row][currentCol];
                this.grid[row][currentCol] = 0;
                currentCol++;
                moved = true;
              }
              
              // 检查是否可以合并
              if (currentCol < this.gridSize - 1 && this.grid[row][currentCol + 1] === this.grid[row][currentCol]) {
                this.grid[row][currentCol + 1] *= 2;
                this.grid[row][currentCol] = 0;
                this.score += this.grid[row][currentCol + 1];
                this.updateScore();
                this.saveBestScore();
                
                // 检查是否达到2048
                if (this.grid[row][currentCol + 1] === 2048 && !this.gameWon) {
                  this.gameWon = true;
                  // 可以添加音效支持
                }
                
                moved = true;
              }
            }
          }
        }
        
        return moved;
      }
      
      // 向下移动
      moveDown() {
        let moved = false;
        
        for (let col = 0; col < this.gridSize; col++) {
          for (let row = this.gridSize - 2; row >= 0; row--) {
            if (this.grid[row][col] !== 0) {
              let currentRow = row;
              
              // 向下移动直到碰到其他方块或边界
              while (currentRow < this.gridSize - 1 && this.grid[currentRow + 1][col] === 0) {
                this.grid[currentRow + 1][col] = this.grid[currentRow][col];
                this.grid[currentRow][col] = 0;
                currentRow++;
                moved = true;
              }
              
              // 检查是否可以合并
              if (currentRow < this.gridSize - 1 && this.grid[currentRow + 1][col] === this.grid[currentRow][col]) {
                this.grid[currentRow + 1][col] *= 2;
                this.grid[currentRow][col] = 0;
                this.score += this.grid[currentRow + 1][col];
                this.updateScore();
                this.saveBestScore();
                
                // 检查是否达到2048
                if (this.grid[currentRow + 1][col] === 2048 && !this.gameWon) {
                  this.gameWon = true;
                  // 可以添加音效支持
                }
                
                moved = true;
              }
            }
          }
        }
        
        return moved;
      }
    
      // 向左移动
      moveLeft() {
        let moved = false;
        
        for (let row = 0; row < this.gridSize; row++) {
          for (let col = 1; col < this.gridSize; col++) {
            if (this.grid[row][col] !== 0) {
              let currentCol = col;
              
              // 向左移动直到碰到其他方块或边界
              while (currentCol > 0 && this.grid[row][currentCol - 1] === 0) {
                this.grid[row][currentCol - 1] = this.grid[row][currentCol];
                this.grid[row][currentCol] = 0;
                currentCol--;
                moved = true;
              }
              
              // 检查是否可以合并
              if (currentCol > 0 && this.grid[row][currentCol - 1] === this.grid[row][currentCol]) {
                this.grid[row][currentCol - 1] *= 2;
                this.grid[row][currentCol] = 0;
                this.score += this.grid[row][currentCol - 1];
                this.updateScore();
                this.saveBestScore();
                
                // 检查是否达到2048
                if (this.grid[row][currentCol - 1] === 2048 && !this.gameWon) {
                  this.gameWon = true;
                  // 可以添加音效支持
                }
                
                moved = true;
              }
            }
          }
        }
        
        return moved;
      }
      
      // 检查游戏状态
      checkGameStatus() {
        // 检查是否达到2048
        for (let i = 0; i < this.gridSize; i++) {
          for (let j = 0; j < this.gridSize; j++) {
            if (this.grid[i][j] === 2048 && !this.gameWon && !this.keepPlaying) {
              this.gameWon = true;
              this.showGameMessage('你赢了!', 'game-won');
              // 可以添加音效支持
              return;
            }
          }
        }
        
        // 检查是否还能移动
        if (!this.hasEmptyCell() && !this.canMove()) {
          this.gameOver = true;
          this.isRunning = false;
          this.showGameMessage('游戏结束!', 'game-over');
          // 可以添加音效支持
          
          // 保存游戏记录
          this.saveScore();
          this.loadHighScores();
        }
      }
      
      // 检查是否还能移动
      canMove() {
        for (let i = 0; i < this.gridSize; i++) {
          for (let j = 0; j < this.gridSize; j++) {
            if (i < this.gridSize - 1 && this.grid[i][j] === this.grid[i + 1][j]) return true;
            if (j < this.gridSize - 1 && this.grid[i][j] === this.grid[i][j + 1]) return true;
          }
        }
        return false;
      }
    
      // 显示游戏信息
      showGameMessage(message, className) {
        const messageElement = this.gameMessage.querySelector('p');
        messageElement.textContent = message;
        
        this.gameMessage.classList.add('show', className);
      }
      
      // 保存分数
      saveScore() {
        const scores = this.getHighScores();
        const newScore = {
          score: this.score,
          name: '玩家',
          date: new Date().toISOString()
        };
        
        scores.push(newScore);
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10); // 只保留前10名
        
        localStorage.setItem('2048-high-scores', JSON.stringify(scores));
      }
      
      // 获取高分榜
      getHighScores() {
        const saved = localStorage.getItem('2048-high-scores');
        return saved ? JSON.parse(saved) : [];
      }
      
      // 加载高分榜
      loadHighScores() {
        const highScores = this.getHighScores();
        const highScoresBody = document.getElementById('highscores-body');
        
        if (!highScoresBody) return;
        
        // 清空现有内容
        highScoresBody.innerHTML = '';
        
        if (highScores.length === 0) {
          const row = document.createElement('tr');
          row.innerHTML = '<td colspan="4" style="text-align: center;">暂无记录</td>';
          highScoresBody.appendChild(row);
          return;
        }
        
        // 添加高分记录
        highScores.forEach((score, index) => {
          const row = document.createElement('tr');
          const date = new Date(score.date);
          const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
          
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.name}</td>
            <td>${score.score}</td>
            <td>${formattedDate}</td>
          `;
          
          highScoresBody.appendChild(row);
        });
      }
      
      // 处理键盘按键
      handleKeyPress(e) {
        if ((this.gameOver && !this.keepPlaying) || !this.canMove) return;
        
        let moved = false;
        
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            e.preventDefault();
            moved = this.moveTiles('up');
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            e.preventDefault();
            moved = this.moveTiles('right');
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            e.preventDefault();
            moved = this.moveTiles('down');
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            e.preventDefault();
            moved = this.moveTiles('left');
            break;
        }
      }
      
      // 绑定触摸事件
      bindTouchEvents() {
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
          if ((this.gameOver && !this.keepPlaying) || !this.canMove) return;
          
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          
          const xDiff = touchEndX - touchStartX;
          const yDiff = touchEndY - touchStartY;
          
          // 最小滑动距离
          const minSwipeDistance = 30;
          
          if (Math.abs(xDiff) > minSwipeDistance || Math.abs(yDiff) > minSwipeDistance) {
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
              // 水平滑动
              if (xDiff > 0) {
                this.moveTiles('right');
              } else {
                this.moveTiles('left');
              }
            } else {
              // 垂直滑动
              if (yDiff > 0) {
                this.moveTiles('down');
              } else {
                this.moveTiles('up');
              }
            }
          }
        }, { passive: true });
      }
    }
    
    // 创建游戏实例
    const game2048 = new Game2048();
    
    // 窗口大小改变时重新渲染
    window.addEventListener('resize', () => {
        game2048.renderGrid();
    });
});
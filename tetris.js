// 俄罗斯方块核心逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 初始化内存管理器和生命周期管理器
    const gameMemoryManager = new GameMemoryManager();
    const gameLifecycle = new GameLifecycle();
    
    // 注册统一错误处理
    GameErrorHandler.registerCallback('tetris', (error) => {
        console.error('俄罗斯方块游戏错误:', error);
        if (error.severity === 'critical') {
            // 重置游戏状态
            resetGame();
        }
    });
    
    // 注册错误处理回调
    gameMemoryManager.onError = (error) => {
        GameErrorHandler.handleError({
            type: 'memory_leak',
            severity: 'high',
            message: '内存管理器错误: ' + error.message,
            error: error,
            context: { component: 'GameMemoryManager' }
        }, 'tetris');
    };
    
    gameLifecycle.onError = (error) => {
        GameErrorHandler.handleError({
            type: 'game_logic',
            severity: 'medium',
            message: '生命周期管理器错误: ' + error.message,
            error: error,
            context: { component: 'GameLifecycle' }
        }, 'tetris');
    };
    
    const SHAPES = [
      [[1,1,1,1]], // I型
      [[1,1,1],[0,1,0]], // T型
      [[1,1,1],[1,0,0]], // L型
      [[1,1],[1,1]], // O型
      [[1,1,0],[0,1,1]] // Z型
    ];

    const COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6'];

    class Tetris {
      constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-block');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        
        this.BLOCK_SIZE = 30;
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameLoop = null;
        this.isRunning = false;
        this.isPaused = false;
        this.dropTime = 1000;
        
        // 加载最高分
        this.highScore = parseInt(localStorage.getItem('tetris_highScore') || '0');
      }

      init() {
        // 按钮事件监听器
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        // 键盘事件监听器
        document.addEventListener('keydown', (e) => this.handleInput(e));
        
        // 页面卸载时清理资源
        window.addEventListener('beforeunload', () => {
            gameLifecycle.destroy();
            gameMemoryManager.destroy();
        });
      }

      startGame() {
        if (this.isRunning && !this.isPaused) return;
        
        this.resetGame();
        this.isRunning = true;
        this.isPaused = false;
        this.gameStartTime = Date.now(); // 记录游戏开始时间
        this.totalPieces = 0; // 记录总方块数
        this.generateNewPiece();
        
        // 初始化性能优化器
        this.performanceOptimizer = new GamePerformanceOptimizer('tetris', {
            targetFPS: Math.floor(1000 / this.dropTime),
            enableVSync: false,
            enablePerformanceMonitoring: true,
            adaptiveQuality: false
        });
        
        // 初始化性能监控器
        this.performanceMonitor = new GamePerformanceMonitor('tetris');
        
        // 注册到全局性能监控管理器
        if (window.globalPerformanceMonitor) {
            window.globalPerformanceMonitor.registerMonitor('tetris', this.performanceMonitor);
        }
        
        // 设置更新和渲染回调
        this.performanceOptimizer.setUpdateCallback((deltaTime) => {
            try {
                this.update(deltaTime);
            } catch (error) {
                GameErrorHandler.handleError({
                    type: 'runtime',
                    severity: 'high',
                    message: error.message,
                    error: error,
                    context: {
                        function: 'update',
                        game: 'tetris',
                        deltaTime
                    }
                }, 'tetris');
            }
        });
        
        this.performanceOptimizer.setRenderCallback(() => {
            try {
                this.draw();
            } catch (error) {
                GameErrorHandler.handleError({
                    type: 'runtime',
                    severity: 'high',
                    message: error.message,
                    error: error,
                    context: {
                        function: 'draw',
                        game: 'tetris'
                    }
                }, 'tetris');
            }
        });
        
        // 注册到全局性能监控器
        if (window.globalPerformanceMonitor) {
            window.globalPerformanceMonitor.registerMonitor('tetris', this.performanceOptimizer);
        }
        
        // 初始化状态管理器
        this.stateManager = new GameStateManager('tetris', {
            autoSaveInterval: 30000, // 30秒自动保存
            maxSaveSlots: 5
        });
        
        // 注册到全局状态管理器
        if (window.GlobalStateManager) {
            window.GlobalStateManager.register('tetris', this.stateManager);
        }
        
        // 游戏开始
        gameLifecycle.start();
        
        // 启动优化的游戏循环
        this.performanceOptimizer.start();
        
        // 启动性能监控
        this.performanceMonitor.start();
        
        // 记录游戏开始
        if (window.gameAnalytics) {
            window.gameAnalytics.trackGameStart('tetris', '俄罗斯方块', {
                level: this.level,
                dropTime: this.dropTime
            });
        }
        
        // 尝试加载自动保存的游戏状态
        this.loadAutoSave();
      }

      pauseGame() {
        if (!this.isRunning || this.isPaused) return;
        
        clearInterval(this.gameLoop);
        this.isPaused = true;
        gameLifecycle.pause();
      }

      resumeGame() {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        gameLifecycle.resume();
        this.gameLoop = setInterval(() => this.update(), this.dropTime);
      }

      resetGame() {
        if (this.gameLoop) {
          clearInterval(this.gameLoop);
        }
        this.board.forEach(row => row.fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 1000;
        this.isRunning = false;
        this.isPaused = false;
        this.updateScore();
        gameLifecycle.restart();
      }

      generateNewPiece() {
        this.currentPiece = this.nextPiece || {
          shape: SHAPES[Math.floor(Math.random()*SHAPES.length)],
          color: COLORS[Math.floor(Math.random()*COLORS.length)],
          x: 4,
          y: 0
        };
        
        this.nextPiece = {
          shape: SHAPES[Math.floor(Math.random()*SHAPES.length)],
          color: COLORS[Math.floor(Math.random()*COLORS.length)],
          x: 0,
          y: 0
        };
        
        this.drawNextPiece();
      }

      drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        this.nextPiece.shape.forEach((row, y) => {
          row.forEach((value, x) => {
            if(value) {
              this.nextCtx.fillStyle = this.nextPiece.color;
              this.nextCtx.fillRect(x*20, y*20, 18, 18);
            }
          });
        });
      }

      update(deltaTime = 500) {
        try {
          // 累积时间用于控制下降速度
          this.dropTimer = (this.dropTimer || 0) + deltaTime;
          
          // 当累积时间达到下降间隔时，移动方块
          if (this.dropTimer >= this.dropTime) {
            this.dropTimer = 0;
            
            if(!this.checkCollision(0, 1)) {
              this.currentPiece.y++;
            } else {
              this.mergePiece();
              const clearedLines = this.clearLines();
              if (clearedLines > 0) {
                this.lines += clearedLines;
                this.updateLevel();
              }
              this.generateNewPiece();
              if(this.checkCollision(0, 0)) {
                this.endGame();
                return;
              }
            }
          }
        } catch (error) {
          GameErrorHandler.handleError({
            type: 'game_logic',
            severity: 'high',
            message: '游戏更新错误: ' + error.message,
            error: error,
            context: { function: 'update', deltaTime }
          }, 'tetris');
          this.endGame();
        }
      }

      endGame() {
        // 停止性能优化器
        if (this.performanceOptimizer) {
          this.performanceOptimizer.stop();
          
          // 从全局监控器注销
          if (window.globalPerformanceMonitor) {
            window.globalPerformanceMonitor.unregisterMonitor('tetris');
          }
        }
        
        // 停止性能监控
        if (this.performanceMonitor) {
          this.performanceMonitor.stop();
        }
        this.isRunning = false;
        gameLifecycle.stop();
        
        // 添加游戏数据统计
        if (window.gameAnalytics) {
            window.gameAnalytics.trackGameEnd('俄罗斯方块', {
                score: this.score,
                level: this.level,
                lines: this.lines,
                pieces: this.totalPieces || 0,
                duration: Date.now() - (this.gameStartTime || Date.now())
            });
        }
        
        // 保存分数
        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem('tetris_highScore', this.highScore.toString());
        }
        
        // 清除自动保存的游戏状态
        this.clearAutoSave();
        
        alert('游戏结束！得分：' + this.score);
      }

      updateScore() {
        this.scoreElement.textContent = this.score;
      }

      updateLevel() {
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
          this.level = newLevel;
          this.dropTime = Math.max(100, 1000 - (this.level - 1) * 100);
          
          // 更新性能优化器的目标FPS
          if (this.performanceOptimizer) {
            const targetFPS = Math.floor(1000 / this.dropTime);
            this.performanceOptimizer.options.targetFPS = targetFPS;
          }
        }
      }

      checkCollision(offsetX, offsetY) {
        return this.currentPiece.shape.some((row, y) => 
          row.some((value, x) => {
            if(!value) return false;
            const newX = this.currentPiece.x + x + offsetX;
            const newY = this.currentPiece.y + y + offsetY;
            return newX < 0 || newX >= 10 || newY >= 20 || this.board[newY]?.[newX];
          })
        );
        
        // 更新状态管理器的当前状态
        this.updateCurrentState();
        
        // 测量帧性能
        if (this.performanceMonitor) {
          this.performanceMonitor.measureFrame();
        }
      }

      mergePiece() {
        this.currentPiece.shape.forEach((row, y) => {
          row.forEach((value, x) => {
            if(value) {
              const boardY = this.currentPiece.y + y;
              const boardX = this.currentPiece.x + x;
              if(boardY >= 0) this.board[boardY][boardX] = this.currentPiece.color;
            }
          });
        });
      }

      clearLines() {
        let linesCleared = 0;
        for(let y = this.board.length - 1; y >= 0; y--) {
          if(this.board[y].every(cell => cell !== 0)) {
            this.board.splice(y, 1);
            this.board.unshift(new Array(10).fill(0));
            linesCleared++;
            y++; // 重新检查当前行
          }
        }
        
        // 根据清除的行数计算分数
        if (linesCleared > 0) {
          const lineScores = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4行的分数
          this.score += lineScores[linesCleared] * this.level;
          this.updateScore();
        }
        
        return linesCleared;
      }

      draw() {
        try {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          
          // 绘制当前方块
          if (this.currentPiece) {
            this.currentPiece.shape.forEach((row, y) => {
              row.forEach((value, x) => {
                if(value) {
                  this.ctx.fillStyle = this.currentPiece.color;
                  this.ctx.fillRect(
                    (this.currentPiece.x + x) * this.BLOCK_SIZE,
                    (this.currentPiece.y + y) * this.BLOCK_SIZE,
                    this.BLOCK_SIZE - 1,
                    this.BLOCK_SIZE - 1
                  );
                }
              });
            });
          }

          // 绘制已落下的方块
          this.board.forEach((row, y) => {
            row.forEach((color, x) => {
              if(color) {
                this.ctx.fillStyle = color;
                this.ctx.fillRect(
                  x * this.BLOCK_SIZE,
                  y * this.BLOCK_SIZE,
                  this.BLOCK_SIZE - 1,
                  this.BLOCK_SIZE - 1
                );
              }
            });
          });
        } catch (error) {
          GameErrorHandler.handleError({
            type: 'render_error',
            severity: 'high',
            message: '渲染错误: ' + error.message,
            error: error,
            context: { function: 'draw' }
          }, 'tetris');
        }
      }

      handleInput(e) {
        if (!this.isRunning || this.isPaused) return;
        
        switch(e.key) {
          case 'ArrowLeft':
            if(!this.checkCollision(-1, 0)) {
              this.currentPiece.x--;
              this.draw();
            }
            break;
          case 'ArrowRight':
            if(!this.checkCollision(1, 0)) {
              this.currentPiece.x++;
              this.draw();
            }
            break;
          case 'ArrowDown':
            if(!this.checkCollision(0, 1)) {
              this.currentPiece.y++;
              this.score += 1; // 快速下降奖励分数
              this.updateScore();
              this.draw();
            }
            break;
          case 'ArrowUp':
            this.rotatePiece();
            break;
          case ' ': // 空格键暂停/恢复
          case 'Escape':
            e.preventDefault();
            if (this.isPaused) {
              this.resumeGame();
            } else {
              this.pauseGame();
            }
            break;
        }
      }

      rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
          this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        if(this.checkCollision(0, 0)) {
          this.currentPiece.shape = originalShape;
        }
        this.draw();
      }
      
      updateHighScore() {
        document.getElementById('highScore').textContent = this.highScore;
      }
      
      /**
       * 获取当前游戏状态
       */
      getCurrentState() {
        return {
          board: this.board.map(row => [...row]),
          currentPiece: this.currentPiece ? {
            shape: this.currentPiece.shape.map(row => [...row]),
            x: this.currentPiece.x,
            y: this.currentPiece.y,
            color: this.currentPiece.color
          } : null,
          nextPiece: this.nextPiece ? {
            shape: this.nextPiece.shape.map(row => [...row]),
            color: this.nextPiece.color
          } : null,
          score: this.score,
          lines: this.lines,
          level: this.level,
          dropTimer: this.dropTimer,
          dropInterval: this.dropInterval,
          gameRunning: this.gameRunning,
          gamePaused: this.gamePaused,
          timestamp: Date.now()
        };
      }
      
      /**
       * 更新状态管理器的当前状态
       */
      updateCurrentState() {
        if (this.stateManager && this.gameRunning) {
          this.stateManager.currentState = this.getCurrentState();
        }
      }
      
      /**
       * 加载自动保存的游戏状态
       */
      async loadAutoSave() {
        try {
          const savedState = await this.stateManager.loadState('auto');
          if (savedState && savedState.gameRunning) {
            // 恢复游戏状态
            this.board = savedState.board || this.createBoard();
            this.currentPiece = savedState.currentPiece || this.createPiece();
            this.nextPiece = savedState.nextPiece || this.createPiece();
            this.score = savedState.score || 0;
            this.lines = savedState.lines || 0;
            this.level = savedState.level || 1;
            this.dropTimer = savedState.dropTimer || 0;
            this.dropInterval = savedState.dropInterval || 1000;
            this.gameRunning = savedState.gameRunning || false;
            this.gamePaused = savedState.gamePaused || false;
            
            // 更新显示
            this.updateScore();
            this.updateLevel();
            this.updateLines();
            this.drawNextPiece();
            this.draw();
            
            console.log('已加载自动保存的游戏状态');
          }
        } catch (error) {
          console.error('加载自动保存失败:', error);
        }
      }
      
      /**
       * 手动保存游戏状态
       */
      async saveGame(slotName = 'manual') {
        try {
          const success = await this.stateManager.saveState(this.getCurrentState(), slotName, {
            playerLevel: this.level,
            playTime: Date.now() - (this.gameStartTime || Date.now())
          });
          
          if (success) {
            alert('游戏已保存！');
          } else {
            alert('保存失败，请重试。');
          }
        } catch (error) {
          console.error('手动保存失败:', error);
          alert('保存失败，请重试。');
        }
      }
      
      /**
       * 手动加载游戏状态
       */
      async loadGame(slotName = 'manual') {
        try {
          const savedState = await this.stateManager.loadState(slotName);
          if (savedState) {
            // 停止当前游戏
            this.performanceOptimizer.stop();
            
            // 恢复游戏状态
            this.board = savedState.board || this.createBoard();
            this.currentPiece = savedState.currentPiece || this.createPiece();
            this.nextPiece = savedState.nextPiece || this.createPiece();
            this.score = savedState.score || 0;
            this.lines = savedState.lines || 0;
            this.level = savedState.level || 1;
            this.dropTimer = savedState.dropTimer || 0;
            this.dropInterval = savedState.dropInterval || 1000;
            this.gameRunning = savedState.gameRunning || false;
            this.gamePaused = savedState.gamePaused || false;
            
            // 更新显示
            this.updateScore();
            this.updateLevel();
            this.updateLines();
            this.drawNextPiece();
            this.draw();
            
            // 如果游戏正在运行，重新启动游戏循环
            if (this.gameRunning) {
              this.performanceOptimizer.start();
            }
            
            alert('游戏已加载！');
          } else {
            alert('未找到保存的游戏。');
          }
        } catch (error) {
          console.error('手动加载失败:', error);
          alert('加载失败，请重试。');
        }
      }
      
      /**
       * 清除自动保存
       */
      async clearAutoSave() {
        try {
          await this.stateManager.deleteState('auto');
        } catch (error) {
          console.error('清除自动保存失败:', error);
        }
      }
    }

    // 初始化游戏
    const tetris = new Tetris();
    tetris.init();
    
    // 暴露保存和加载函数到全局作用域
    window.saveTetrisGame = function() {
        if (tetris) {
            tetris.saveGame();
        }
    };

    window.loadTetrisGame = function() {
        if (tetris) {
            tetris.loadGame();
        }
    };

    window.clearTetrisAutoSave = function() {
        if (tetris) {
            tetris.clearAutoSave();
        }
    };
});
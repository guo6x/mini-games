/**
 * 游戏数据统计和分析系统
 * 提供游戏数据收集、分析和可视化功能
 */

class GameAnalytics {
    constructor() {
        this.sessionData = {
            startTime: Date.now(),
            endTime: null,
            totalPlayTime: 0,
            gamesPlayed: [],
            userActions: [],
            performanceMetrics: {},
            errors: []
        };
        
        this.gameStats = this.loadGameStats();
        this.userPreferences = this.loadUserPreferences();
        
        this.initializeTracking();
    }

    // 初始化数据追踪
    initializeTracking() {
        // 追踪页面可见性变化
        document.addEventListener('visibilitychange', () => {
            this.trackUserAction('page_visibility_change', {
                hidden: document.hidden,
                timestamp: Date.now()
            });
        });

        // 追踪用户交互
        document.addEventListener('click', (event) => {
            this.trackUserAction('click', {
                element: event.target.tagName,
                className: event.target.className,
                id: event.target.id,
                timestamp: Date.now()
            });
        });

        // 追踪键盘事件
        document.addEventListener('keydown', (event) => {
            this.trackUserAction('keydown', {
                key: event.key,
                code: event.code,
                timestamp: Date.now()
            });
        });

        // 定期保存数据
        setInterval(() => {
            this.saveAnalyticsData();
        }, 30000); // 每30秒保存一次

        // 页面卸载时保存数据
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
    }

    // 开始游戏追踪
    startGameTracking(gameId, gameName) {
        const gameSession = {
            gameId,
            gameName,
            startTime: Date.now(),
            endTime: null,
            duration: 0,
            score: 0,
            level: 1,
            actions: [],
            completed: false,
            errors: []
        };

        this.currentGameSession = gameSession;
        this.sessionData.gamesPlayed.push(gameSession);
        
        // 更新游戏统计
        if (!this.gameStats[gameId]) {
            this.gameStats[gameId] = {
                name: gameName,
                totalPlays: 0,
                totalTime: 0,
                bestScore: 0,
                averageScore: 0,
                completionRate: 0,
                lastPlayed: null,
                difficulty: 'normal',
                preferences: {}
            };
        }
        
        this.gameStats[gameId].totalPlays++;
        this.gameStats[gameId].lastPlayed = Date.now();
        
        this.trackUserAction('game_start', {
            gameId,
            gameName,
            timestamp: Date.now()
        });
    }

    // 结束游戏追踪
    endGameTracking(score = 0, level = 1, completed = false) {
        if (!this.currentGameSession) return;

        const endTime = Date.now();
        const duration = endTime - this.currentGameSession.startTime;
        
        this.currentGameSession.endTime = endTime;
        this.currentGameSession.duration = duration;
        this.currentGameSession.score = score;
        this.currentGameSession.level = level;
        this.currentGameSession.completed = completed;

        const gameId = this.currentGameSession.gameId;
        const gameStats = this.gameStats[gameId];
        
        // 更新游戏统计
        gameStats.totalTime += duration;
        if (score > gameStats.bestScore) {
            gameStats.bestScore = score;
        }
        
        // 计算平均分数
        const completedGames = this.sessionData.gamesPlayed.filter(
            game => game.gameId === gameId && game.completed
        );
        if (completedGames.length > 0) {
            gameStats.averageScore = completedGames.reduce((sum, game) => sum + game.score, 0) / completedGames.length;
            gameStats.completionRate = (completedGames.length / gameStats.totalPlays) * 100;
        }

        this.trackUserAction('game_end', {
            gameId,
            score,
            level,
            duration,
            completed,
            timestamp: endTime
        });

        this.currentGameSession = null;
        this.saveAnalyticsData();
    }

    // 追踪游戏内动作
    trackGameAction(action, data = {}) {
        if (!this.currentGameSession) return;

        const actionData = {
            action,
            data,
            timestamp: Date.now()
        };

        this.currentGameSession.actions.push(actionData);
        this.trackUserAction('game_action', {
            gameId: this.currentGameSession.gameId,
            action,
            data,
            timestamp: Date.now()
        });
    }

    // 追踪用户动作
    trackUserAction(action, data = {}) {
        this.sessionData.userActions.push({
            action,
            data,
            timestamp: Date.now()
        });
    }

    // 追踪错误
    trackError(error, context = {}) {
        const errorData = {
            message: error.message || error,
            stack: error.stack,
            context,
            timestamp: Date.now()
        };

        this.sessionData.errors.push(errorData);
        
        if (this.currentGameSession) {
            this.currentGameSession.errors.push(errorData);
        }
    }

    // 更新性能指标
    updatePerformanceMetrics(metrics) {
        Object.assign(this.sessionData.performanceMetrics, metrics);
    }

    // 获取游戏统计数据
    getGameStats(gameId = null) {
        if (gameId) {
            return this.gameStats[gameId] || null;
        }
        return this.gameStats;
    }

    // 获取用户偏好
    getUserPreferences() {
        return this.userPreferences;
    }

    // 更新用户偏好
    updateUserPreferences(preferences) {
        Object.assign(this.userPreferences, preferences);
        this.saveUserPreferences();
    }

    // 获取会话数据
    getSessionData() {
        return {
            ...this.sessionData,
            totalPlayTime: Date.now() - this.sessionData.startTime
        };
    }

    // 生成分析报告
    generateAnalyticsReport() {
        const sessionData = this.getSessionData();
        const totalGames = Object.keys(this.gameStats).length;
        const totalPlays = Object.values(this.gameStats).reduce((sum, stats) => sum + stats.totalPlays, 0);
        const totalPlayTime = Object.values(this.gameStats).reduce((sum, stats) => sum + stats.totalTime, 0);
        
        // 最受欢迎的游戏
        const mostPlayedGame = Object.entries(this.gameStats)
            .sort(([,a], [,b]) => b.totalPlays - a.totalPlays)[0];
        
        // 最高分游戏
        const highestScoreGame = Object.entries(this.gameStats)
            .sort(([,a], [,b]) => b.bestScore - a.bestScore)[0];
        
        // 用户活跃度分析
        const activityAnalysis = this.analyzeUserActivity();
        
        // 性能分析
        const performanceAnalysis = this.analyzePerformance();
        
        return {
            summary: {
                totalGames,
                totalPlays,
                totalPlayTime,
                sessionDuration: sessionData.totalPlayTime,
                errorCount: sessionData.errors.length
            },
            games: {
                mostPlayed: mostPlayedGame ? {
                    id: mostPlayedGame[0],
                    name: mostPlayedGame[1].name,
                    plays: mostPlayedGame[1].totalPlays
                } : null,
                highestScore: highestScoreGame ? {
                    id: highestScoreGame[0],
                    name: highestScoreGame[1].name,
                    score: highestScoreGame[1].bestScore
                } : null
            },
            activity: activityAnalysis,
            performance: performanceAnalysis,
            errors: sessionData.errors,
            timestamp: Date.now()
        };
    }

    // 分析用户活跃度
    analyzeUserActivity() {
        const actions = this.sessionData.userActions;
        const clickActions = actions.filter(action => action.action === 'click');
        const gameActions = actions.filter(action => action.action === 'game_action');
        
        return {
            totalActions: actions.length,
            clickCount: clickActions.length,
            gameActionCount: gameActions.length,
            averageActionsPerMinute: actions.length / ((Date.now() - this.sessionData.startTime) / 60000),
            mostActiveHour: this.getMostActiveHour(actions)
        };
    }

    // 分析性能数据
    analyzePerformance() {
        const metrics = this.sessionData.performanceMetrics;
        
        return {
            averageFPS: metrics.averageFPS || 0,
            memoryUsage: metrics.memoryUsage || 0,
            renderTime: metrics.renderTime || 0,
            loadTime: metrics.loadTime || 0,
            errorRate: (this.sessionData.errors.length / this.sessionData.userActions.length) * 100 || 0
        };
    }

    // 获取最活跃的小时
    getMostActiveHour(actions) {
        const hourCounts = {};
        
        actions.forEach(action => {
            const hour = new Date(action.timestamp).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        
        return Object.entries(hourCounts)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
    }

    // 结束会话
    endSession() {
        this.sessionData.endTime = Date.now();
        this.sessionData.totalPlayTime = this.sessionData.endTime - this.sessionData.startTime;
        
        if (this.currentGameSession) {
            this.endGameTracking();
        }
        
        this.saveAnalyticsData();
    }

    // 保存分析数据
    saveAnalyticsData() {
        try {
            localStorage.setItem('gameAnalytics_gameStats', JSON.stringify(this.gameStats));
            localStorage.setItem('gameAnalytics_sessionData', JSON.stringify(this.sessionData));
        } catch (error) {
            console.warn('无法保存分析数据:', error);
        }
    }

    // 加载游戏统计数据
    loadGameStats() {
        try {
            const saved = localStorage.getItem('gameAnalytics_gameStats');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('无法加载游戏统计数据:', error);
            return {};
        }
    }

    // 保存用户偏好
    saveUserPreferences() {
        try {
            localStorage.setItem('gameAnalytics_userPreferences', JSON.stringify(this.userPreferences));
        } catch (error) {
            console.warn('无法保存用户偏好:', error);
        }
    }

    // 加载用户偏好
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('gameAnalytics_userPreferences');
            return saved ? JSON.parse(saved) : {
                theme: 'light',
                difficulty: 'normal',
                soundEnabled: true,
                animationsEnabled: true,
                autoSave: true
            };
        } catch (error) {
            console.warn('无法加载用户偏好:', error);
            return {
                theme: 'light',
                difficulty: 'normal',
                soundEnabled: true,
                animationsEnabled: true,
                autoSave: true
            };
        }
    }

    // 清除所有数据
    clearAllData() {
        this.sessionData = {
            startTime: Date.now(),
            endTime: null,
            totalPlayTime: 0,
            gamesPlayed: [],
            userActions: [],
            performanceMetrics: {},
            errors: []
        };
        
        this.gameStats = {};
        this.userPreferences = {
            theme: 'light',
            difficulty: 'normal',
            soundEnabled: true,
            animationsEnabled: true,
            autoSave: true
        };
        
        localStorage.removeItem('gameAnalytics_gameStats');
        localStorage.removeItem('gameAnalytics_sessionData');
        localStorage.removeItem('gameAnalytics_userPreferences');
    }

    // 导出数据
    exportData() {
        const data = {
            gameStats: this.gameStats,
            sessionData: this.getSessionData(),
            userPreferences: this.userPreferences,
            analyticsReport: this.generateAnalyticsReport(),
            exportTime: Date.now()
        };
        
        return JSON.stringify(data, null, 2);
    }
}

// 全局分析实例
window.gameAnalytics = new GameAnalytics();

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameAnalytics;
}
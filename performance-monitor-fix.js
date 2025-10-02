/**
 * 性能监控器修复补丁
 * 为 GlobalPerformanceMonitor 添加缺失的 getGlobalSummary 方法
 */

// 等待 GlobalPerformanceMonitor 加载完成后添加缺失的方法
if (typeof window !== 'undefined') {
    // 延迟执行以确保 GlobalPerformanceMonitor 已加载
    setTimeout(() => {
        if (window.globalPerformanceMonitor && !window.globalPerformanceMonitor.getGlobalSummary) {
            // 添加缺失的 getGlobalSummary 方法
            window.globalPerformanceMonitor.getGlobalSummary = function() {
                // 更新全局指标
                this.updateGlobalMetrics();
                
                return {
                    activeGames: this.globalMetrics.activeGames,
                    totalGames: this.globalMetrics.totalGames,
                    averageFPS: this.globalMetrics.averageFPS,
                    totalMemoryUsage: this.globalMetrics.totalMemoryUsage,
                    totalErrors: this.globalMetrics.totalErrors,
                    totalWarnings: this.globalMetrics.totalWarnings,
                    uptime: Date.now() - (this.startTime || Date.now()),
                    overallHealth: this.generateGlobalSummary().overallHealth
                };
            };
            
            console.log('已修复 GlobalPerformanceMonitor.getGlobalSummary 方法');
        }
    }, 100);
}
/**
 * 游戏库公共工具模块
 * 提供碰撞检测、渲染优化、数学计算和通用工具函数
 */

/**
 * 通用游戏工具类
 */
class GameUtils {
    /**
     * 生成随机数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机数
     */
    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * 生成随机浮点数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机浮点数
     */
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    /**
     * 限制数值在指定范围内
     * @param {number} value - 数值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 限制后的数值
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    /**
     * 线性插值
     * @param {number} start - 起始值
     * @param {number} end - 结束值
     * @param {number} t - 插值参数 (0-1)
     * @returns {number} 插值结果
     */
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    /**
     * 计算两点间距离
     * @param {number} x1 - 点1的x坐标
     * @param {number} y1 - 点1的y坐标
     * @param {number} x2 - 点2的x坐标
     * @param {number} y2 - 点2的y坐标
     * @returns {number} 距离
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * 角度转弧度
     * @param {number} degrees - 角度
     * @returns {number} 弧度
     */
    static toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    
    /**
     * 弧度转角度
     * @param {number} radians - 弧度
     * @returns {number} 角度
     */
    static toDegrees(radians) {
        return radians * 180 / Math.PI;
    }
    
    /**
     * 深拷贝对象
     * @param {*} obj - 要拷贝的对象
     * @returns {*} 拷贝后的对象
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => GameUtils.deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = GameUtils.deepClone(obj[key]);
                }
            }
            return cloned;
        }
        
        return obj;
    }
    
    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} delay - 延迟时间
     * @returns {Function} 防抖后的函数
     */
    static debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} delay - 延迟时间
     * @returns {Function} 节流后的函数
     */
    static throttle(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    }
    
    /**
     * 格式化数字
     * @param {number} num - 数字
     * @param {number} decimals - 小数位数
     * @returns {string} 格式化后的字符串
     */
    static formatNumber(num, decimals = 0) {
        return num.toLocaleString('zh-CN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    
    /**
     * 格式化时间
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时间字符串
     */
    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * 检查是否为移动设备
     * @returns {boolean} 是否为移动设备
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    /**
     * 检查是否支持触摸
     * @returns {boolean} 是否支持触摸
     */
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    /**
     * 获取随机颜色
     * @returns {string} 十六进制颜色值
     */
    static getRandomColor() {
        // 更安全的实现，确保总是6位十六进制
        return '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
    }
    
    /**
     * HSL转RGB
     * @param {number} h - 色相 (0-360)
     * @param {number} s - 饱和度 (0-100)
     * @param {number} l - 亮度 (0-100)
     * @returns {Object} RGB值对象
     */
    static hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
}

/**
 * 碰撞检测工具类
 */
class CollisionUtils {
    /**
     * 矩形与矩形碰撞检测
     * @param {Object} rect1 - 矩形1 {x, y, width, height}
     * @param {Object} rect2 - 矩形2 {x, y, width, height}
     * @returns {boolean} 是否碰撞
     */
    static rectToRect(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    /**
     * 圆与圆碰撞检测
     * @param {Object} circle1 - 圆1 {x, y, radius}
     * @param {Object} circle2 - 圆2 {x, y, radius}
     * @returns {boolean} 是否碰撞
     */
    static circleToCircle(circle1, circle2) {
        const distance = GameUtils.distance(circle1.x, circle1.y, circle2.x, circle2.y);
        return distance < circle1.radius + circle2.radius;
    }
    
    /**
     * 点与矩形碰撞检测
     * @param {Object} point - 点 {x, y}
     * @param {Object} rect - 矩形 {x, y, width, height}
     * @returns {boolean} 是否碰撞
     */
    static pointToRect(point, rect) {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.width &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.height;
    }
    
    /**
     * 点与圆碰撞检测
     * @param {Object} point - 点 {x, y}
     * @param {Object} circle - 圆 {x, y, radius}
     * @returns {boolean} 是否碰撞
     */
    static pointToCircle(point, circle) {
        const distance = GameUtils.distance(point.x, point.y, circle.x, circle.y);
        return distance <= circle.radius;
    }
    
    /**
     * 矩形与圆碰撞检测
     * @param {Object} rect - 矩形 {x, y, width, height}
     * @param {Object} circle - 圆 {x, y, radius}
     * @returns {boolean} 是否碰撞
     */
    static rectToCircle(rect, circle) {
        const closestX = GameUtils.clamp(circle.x, rect.x, rect.x + rect.width);
        const closestY = GameUtils.clamp(circle.y, rect.y, rect.y + rect.height);
        
        const distance = GameUtils.distance(circle.x, circle.y, closestX, closestY);
        return distance <= circle.radius;
    }
    
    /**
     * 线段与线段碰撞检测
     * @param {Object} line1 - 线段1 {x1, y1, x2, y2}
     * @param {Object} line2 - 线段2 {x1, y1, x2, y2}
     * @returns {boolean} 是否碰撞
     */
    static lineToLine(line1, line2) {
        const denominator = (line2.y2 - line2.y1) * (line1.x2 - line1.x1) - 
                           (line2.x2 - line2.x1) * (line1.y2 - line1.y1);
        
        if (denominator === 0) {
            return false; // 平行线
        }
        
        const ua = ((line2.x2 - line2.x1) * (line1.y1 - line2.y1) - 
                    (line2.y2 - line2.y1) * (line1.x1 - line2.x1)) / denominator;
        const ub = ((line1.x2 - line1.x1) * (line1.y1 - line2.y1) - 
                    (line1.y2 - line1.y1) * (line1.x1 - line2.x1)) / denominator;
        
        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    }
    
    /**
     * 获取碰撞信息
     * @param {Object} obj1 - 对象1
     * @param {Object} obj2 - 对象2
     * @returns {Object|null} 碰撞信息或null
     */
    static getCollisionInfo(obj1, obj2) {
        if (!this.rectToRect(obj1, obj2)) {
            return null;
        }
        
        const overlapX = Math.min(obj1.x + obj1.width, obj2.x + obj2.width) - 
                        Math.max(obj1.x, obj2.x);
        const overlapY = Math.min(obj1.y + obj1.height, obj2.y + obj2.height) - 
                        Math.max(obj1.y, obj2.y);
        
        return {
            overlapX,
            overlapY,
            direction: overlapX < overlapY ? 'horizontal' : 'vertical'
        };
    }
}

/**
 * 渲染优化工具类
 */
class RenderUtils {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.offscreenCanvas = null;
        this.offscreenCtx = null;
        this.imageCache = new Map();
        this.pathCache = new Map();
    }
    
    /**
     * 初始化渲染器
     * @param {HTMLCanvasElement} canvas - 画布元素
     */
    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 创建离屏画布用于缓存
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = canvas.width;
        this.offscreenCanvas.height = canvas.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        
        // 优化渲染设置
        this.optimizeContext(this.ctx);
        this.optimizeContext(this.offscreenCtx);
    }
    
    /**
     * 优化画布上下文
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    optimizeContext(ctx) {
        // 启用图像平滑
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 设置文本渲染优化
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
    }
    
    /**
     * 清空画布
     * @param {number} x - x坐标
     * @param {number} y - y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    clear(x = 0, y = 0, width = this.canvas.width, height = this.canvas.height) {
        this.ctx.clearRect(x, y, width, height);
    }
    
    /**
     * 绘制圆角矩形
     * @param {number} x - x坐标
     * @param {number} y - y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} radius - 圆角半径
     * @param {string} fillColor - 填充颜色
     * @param {string} strokeColor - 边框颜色
     */
    drawRoundedRect(x, y, width, height, radius, fillColor = null, strokeColor = null) {
        const cacheKey = `roundedRect_${x}_${y}_${width}_${height}_${radius}`;
        
        if (!this.pathCache.has(cacheKey)) {
            const path = new Path2D();
            path.moveTo(x + radius, y);
            path.lineTo(x + width - radius, y);
            path.quadraticCurveTo(x + width, y, x + width, y + radius);
            path.lineTo(x + width, y + height - radius);
            path.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            path.lineTo(x + radius, y + height);
            path.quadraticCurveTo(x, y + height, x, y + height - radius);
            path.lineTo(x, y + radius);
            path.quadraticCurveTo(x, y, x + radius, y);
            path.closePath();
            
            this.pathCache.set(cacheKey, path);
        }
        
        const path = this.pathCache.get(cacheKey);
        
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fill(path);
        }
        
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.stroke(path);
        }
    }
    
    /**
     * 绘制渐变矩形
     * @param {number} x - x坐标
     * @param {number} y - y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {Array} colors - 颜色数组
     * @param {string} direction - 渐变方向 ('horizontal'|'vertical'|'diagonal')
     */
    drawGradientRect(x, y, width, height, colors, direction = 'vertical') {
        let gradient;
        
        switch (direction) {
            case 'horizontal':
                gradient = this.ctx.createLinearGradient(x, y, x + width, y);
                break;
            case 'diagonal':
                gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
                break;
            default: // vertical
                gradient = this.ctx.createLinearGradient(x, y, x, y + height);
        }
        
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
        });
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width, height);
    }
    
    /**
     * 绘制文本（带缓存）
     * @param {string} text - 文本内容
     * @param {number} x - x坐标
     * @param {number} y - y坐标
     * @param {Object} options - 选项
     */
    drawText(text, x, y, options = {}) {
        const {
            font = '16px Arial',
            fillColor = '#000000',
            strokeColor = null,
            strokeWidth = 1,
            align = 'left',
            baseline = 'top',
            maxWidth = null,
            shadow = null
        } = options;
        
        this.ctx.save();
        
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        
        // 阴影效果
        if (shadow) {
            this.ctx.shadowColor = shadow.color || '#000000';
            this.ctx.shadowBlur = shadow.blur || 2;
            this.ctx.shadowOffsetX = shadow.offsetX || 1;
            this.ctx.shadowOffsetY = shadow.offsetY || 1;
        }
        
        // 描边
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = strokeWidth;
            if (maxWidth) {
                this.ctx.strokeText(text, x, y, maxWidth);
            } else {
                this.ctx.strokeText(text, x, y);
            }
        }
        
        // 填充
        this.ctx.fillStyle = fillColor;
        if (maxWidth) {
            this.ctx.fillText(text, x, y, maxWidth);
        } else {
            this.ctx.fillText(text, x, y);
        }
        
        this.ctx.restore();
    }
    
    /**
     * 绘制图像（带缓存）
     * @param {string} src - 图像源
     * @param {number} x - x坐标
     * @param {number} y - y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @returns {Promise} 绘制完成的Promise
     */
    async drawImage(src, x, y, width = null, height = null) {
        if (!this.imageCache.has(src)) {
            const img = new Image();
            const promise = new Promise((resolve, reject) => {
                img.onload = () => resolve(img);
                img.onerror = reject;
            });
            img.src = src;
            this.imageCache.set(src, promise);
        }
        
        try {
            const img = await this.imageCache.get(src);
            
            if (width && height) {
                this.ctx.drawImage(img, x, y, width, height);
            } else {
                this.ctx.drawImage(img, x, y);
            }
        } catch (error) {
            console.error('绘制图像失败:', error);
        }
    }
    
    /**
     * 创建粒子效果
     * @param {number} x - x坐标
     * @param {number} y - y坐标
     * @param {Object} options - 粒子选项
     */
    createParticles(x, y, options = {}) {
        const {
            count = 10,
            colors = ['#ff0000', '#00ff00', '#0000ff'],
            size = 3,
            speed = 2,
            life = 60
        } = options;
        
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * speed * 2,
                vy: (Math.random() - 0.5) * speed * 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: size + Math.random() * size,
                life: life,
                maxLife: life
            });
        }
        
        return particles;
    }
    
    /**
     * 更新和绘制粒子
     * @param {Array} particles - 粒子数组
     */
    updateParticles(particles) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 更新生命值
            particle.life--;
            
            // 计算透明度
            const alpha = particle.life / particle.maxLife;
            
            // 绘制粒子
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
            
            // 移除死亡的粒子
            if (particle.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }
    
    /**
     * 清理缓存
     */
    clearCache() {
        this.imageCache.clear();
        this.pathCache.clear();
    }
    
    /**
     * 获取画布数据URL
     * @param {string} type - 图像类型
     * @param {number} quality - 图像质量
     * @returns {string} 数据URL
     */
    toDataURL(type = 'image/png', quality = 0.92) {
        return this.canvas.toDataURL(type, quality);
    }
}

// 创建全局实例
const renderUtils = new RenderUtils();

// 导出工具类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameUtils, CollisionUtils, RenderUtils, renderUtils };
} else {
    window.GameUtils = GameUtils;
    window.CollisionUtils = CollisionUtils;
    window.RenderUtils = RenderUtils;
    window.renderUtils = renderUtils;
}
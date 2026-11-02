# ORBIT ARCADE · 57 款网页小游戏

57 个独立游戏入口，全部使用统一的 ORBIT ARCADE 浏览器游戏壳和实际可交互游戏规则。无需第三方模型/付费 API。

## 2026-11-02 v3 · 统一质量改版

- 原有 **26 款**重制作品继续保留其各自玩法、目标与规则；
- 对另外 **31 款**早期作品引入三套新的、统一视觉和交互的玩法引擎：`arcade-cortex.js`（12 款）、`arcade-kinetic.js`（13 款）、`arcade-strategy.js`（6 款）；
- 新引擎包括可求解的 3×3/4×4 数字滑块、真实 9×9 扫雷与唯一解数独、带真实棋规的星盘跳棋、五子棋电脑落子、经典俄罗斯方块、反应测试、节奏判定、动作/弹幕与经营系统；
- 全部 57 个游戏可在大厅搜索、分类、收藏与最近游玩；游戏页面支持暂停、重新开始、最佳分记录和跨设备操作提示；
- 共用静态页面，无服务端、登录或在线数据收集。最佳成绩仅保存于当前浏览器。

### 使用

```bash
python3 -m http.server 8000
# 进入 http://localhost:8000/
```

所有资源由同一个静态 HTTP 服务提供。下载整个仓库后也可通过本地 HTTP 服务离线使用。

### 验证

```bash
node --check arcade-play.js
node --check arcade-cortex.js
node --check arcade-kinetic.js
node --check arcade-strategy.js
node --test tests/arcade-health.test.cjs

# 安装 Playwright/Chromium 后运行
python3 -m http.server 4173
node tests/browser-smoke.cjs
node tests/legacy-audit.cjs
```

CI 对 57 款逐个执行桌面和移动端启动与基本操作回归；有界的规则交互测试检验部分具体机制。**自动测试可以证明基础运行与规则动作，不等于经过长期真人游戏体验测试、所有关卡验证或商业发行质量。**

### 已知边界

- 部分作品选择精简规则、有限关卡和非联网 AI；不是商业游戏的完整替代品。
- 无账号联机、在线排行榜、音效资源许可问题或外部云存档。
- 成绩存储在本机 localStorage；不同设备不会自动同步。
- 问题反馈： https://github.com/guo6x/mini-games/issues

### 自研原创卡片视觉

首页 57 张游戏封面由 `arcade-home.js` 中的 Canvas 原生矢量图形实时生成，按品类生成不同的画面，不请求图片 CDN、素材站或外部字体。

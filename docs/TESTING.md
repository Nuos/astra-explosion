# v1.0.0 验证记录

执行日期：2026-09-12。结果以本文件和 `browser-report.json` 明确记录的路径为准。

| 检查 | 结果 |
|---|---|
| `npm run check` | JavaScript 语法检查通过 |
| `npm test` | 10 项 Node 单元测试通过 |
| `npm run build` | 静态站点与离线单文件构建通过 |
| Playwright 浏览器交互 | 18 个检查组通过，实际路径为 Canvas 2D 软件回退 |
| 视口 | 1440×960、390×844、320×568、844×390 |
| 自动化中的外部 HTTP 请求、页面异常 | 均未发现 |
| WebGL 2 GPU 路径 | 本地环境无法创建上下文，**未在本地实测** |
| 实体手机、多指触摸硬件、性能基准 | **未测试** |
| 原生 `file://` 打开与浏览器 localhost 导航 | **未由该测试环境验证**；浏览器测试使用 `page.set_content` 加载离线版本 |
| 实际线上部署 | 未执行；提供静态产物与 CI，不自动开通 Pages |

## Node 单元测试

核对 21+3 数量、唯一 ID、完整来源、分类及变换；中英文与组合检索；三角形缓冲、法线和边界；名义外壳包络；基础几何与展台；矩阵及缩放逆变换；射线命中/未命中；多种宽高比和空集的非重叠网格；点击、拖动、双指与取消事件区分。

手机几何为 80 个合并材质批次、53,664 个三角形，不含展台。数量是软件模型统计，不是设备物料数量。

## 浏览器测试

核验完整模型启动、爆炸动画、50% 滑杆、中英文搜索、来源说明、隔离与退出、逐件显隐、系统分类、24 个可见网格编号、实际画布射线拾取、电池选择、拖动不误选、配色、转台、PNG 文件签名、来源弹窗、快捷键及输入框防误触。移动端核验抽屉、隔离、关闭、无横向溢出及全部编号。

这里的 Canvas 2D 回退不是静态截图，而是同模型的 CPU 深度缓冲绘制。它可以证明交互与软件绘制正常，但不能替代 WebGL 着色器、驱动、GPU 材质及设备性能验收。

## 复现

```bash
npm run check
npm test
npm run build
python -m pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py
```

指定已有浏览器：

```bash
ASTRA_BROWSER=/usr/bin/chromium python tests/browser_smoke.py
```

强制校验 WebGL 2 而不接受软件回退：

```bash
ASTRA_REQUIRE_WEBGL=1 python tests/browser_smoke.py
```

仓库 CI 配置要求 WebGL 2，预期在 CI 浏览器的软件 GL 环境中测试该路径。**配置存在不等于 CI 已通过**；请查看相应提交的 Actions 结果。实际发布前，应增加用户目标浏览器与显卡的验证。

## 已核验的 GitHub Actions 结果

应用提交 `b9f58b20250bd5b1e3fe786068a352aefb684262` 的 [CI 运行 #1](https://github.com/Nuos/astra-explosion/actions/runs/34705149615) 已于 2026-09-12 16:26:07 UTC 成功完成。语法检查、10 项 Node 测试、静态构建、强制 WebGL 2 的 18 组浏览器检查及产物上传全部通过。

下载的 CI 报告明确记录 `renderers: ["webgl2"]`，另存为 `ci-browser-report.json`。CI 的单文件 HTML 与本地构建逐字节一致。CI 使用 Chromium 的 SwiftShader 软件 GL，不代表真实显卡或手机硬件性能测试。前表的 Canvas 2D 结果仍专指本地环境；两条渲染路径分别有通过记录。

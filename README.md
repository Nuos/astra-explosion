# ASTRA / EXPLOSION

**iPhone 17 Pro 交互式三维爆炸展台 · v1.0.1**

参考 [ashemag/human-atlas](https://github.com/ashemag/human-atlas) 的整体、拆解、检索、选择与隔离交互。包含可旋转展台、连续爆炸动画、24 个可选组、部件来源面板和离线 HTML。

**公开文档驱动的程序化示意模型，不是 Apple 官方 CAD 或维修模型；没有 iPhone 18 Pro 模型。**

## 一、打开与启动

**下载交付包后，打开 `dist/astra-explosion-standalone.html`。** v1.0.1 的 `dist/index.html` 与其逐字节相同，两个构建入口均为自包含 HTML，支持单独复制和改名；不再依赖 Import Map 或 data-URL 模块。不要只下载仓库根目录的源码 `index.html` 并双击。

聊天附件链接是下载入口，不是已部署的网站；GitHub blob 页也不是 HTML 运行页面。遇到附件预览不执行脚本，应保存完整文件后在浏览器打开。详细说明见 [docs/OPENING.md](docs/OPENING.md)，复核结果见 [打开故障审计](docs/OPENING-AUDIT-20260912.md)。

源码运行需要 Node.js 22 或更新版本，没有第三方运行依赖，不需要 npm install、API Key 或下载模型：

```bash
git clone https://github.com/Nuos/astra-explosion.git
cd astra-explosion
npm run dev
```

浏览器访问 `http://127.0.0.1:3017`。默认仅监听本机；可用 `PORT` 和 `HOST` 修改。已有项目使用 `git pull --ff-only` 更新。

```bash
npm run check
npm test
npm run build
npm run preview
```

`npm run preview` 服务 `dist/`，不要与开发服务器同时占用同一端口。当前没有开通 GitHub Pages，构建和测试不会自动部署网站。

## 二、交互

Explode / Assemble 切换完整与拆解状态；Separation 连续调节 0–100% 分离程度。Layers / Inventory 切换分层爆炸与部件网格。拖动旋转、滚轮或双指缩放；画布或目录点选部件，Isolate part 独立查看。支持中英文搜索、分类、逐件显隐、正背面、三种配色、标签、自动转台与 PNG 导出。

移动端通过 Parts 抽屉打开目录。聚焦画布时 Space 拆解/组装，R 重置，/ 搜索，Escape 退出检查或关闭面板；输入文字时不误触发。顶部 ASTRA 链接重置当前展台，不跳离离线文件。

搜索只过滤目录；分类和逐件显隐改变场景。Inventory 会单独放大小件，不能按网格中的大小比较真实尺寸。

## 三、模型与来源边界

[Apple 公开爆炸图](https://support.apple.com/en-us/124248)的 21 个编号装配项逐项对应，加上 A1 均热板、A2 MagSafe、A3 代表性紧固件，共 24 个可选组。完整对应见 [docs/SOURCES.md](docs/SOURCES.md)。

名义外壳包络参考 71.9 × 150 × 8.75 mm。摄像头凸起、内部部件、排线、芯片封装与紧固件位置为简化估计。均热板在真实设备中焊接于机身；12 枚示意紧固件并非整机螺钉总数。模型为 eSIM 启发结构，不是经过核验的某一地区完整物料清单；没有物理 SIM、全部射频器件或微型元件。**21 个文档装配项不等于手机全部物理零件，爆炸动画不是维修拆卸顺序。**

## 四、结构与验证

`src/catalog.js` 定义目录和来源；`geometry.js` 生成模型；`math.js` 提供变换、拾取和布局；`renderer.js` 实现 WebGL 2 与深度缓冲 Canvas 2D 回退；`main.js` 处理界面交互；`style.css` 处理响应式布局。`index.html` 另有启动诊断与无脚本说明，`scripts/build.mjs` 打包两个经典脚本自包含入口。

模型与纹理由代码本地生成，无远程字体、运行时图片下载或遥测。回退渲染使用 CPU，不能等同于 GPU 性能；静止时停止重复绘制。架构说明见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

```bash
python -m pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py
ASTRA_REQUIRE_WEBGL=1 python tests/browser_navigation.py
```

`ASTRA_BROWSER` 可指定 Chromium 路径。旧 smoke 测试以内容注入验证交互；新 navigation 测试实际访问 file:// 与 HTTP，并测试重命名独立文件、子目录、移动视口、无脚本提示与图形故障提示。CI 记录与产物才是执行证据，不能只凭配置声称通过。

本次云端验证使用 Chromium / SwiftShader，不代表真实显卡、Safari、实体手机或多点触摸硬件验收。旧版历史结果保留在 [docs/TESTING.md](docs/TESTING.md)，新版实际打开结果见 [审计记录](docs/OPENING-AUDIT-20260912.md)。

## 五、许可证

原创代码和程序化几何使用 [MIT License](LICENSE)。PointerTap 改编自 Human Atlas，保留版权声明于 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)，未包含 BodyParts3D 数据。Apple 文档与商标不因本项目许可证而被重新授权。本项目与 Apple 无隶属或背书关系，不应作为维修、电池处理、制造或电气设计依据。

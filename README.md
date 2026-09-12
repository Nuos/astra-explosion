# ASTRA / EXPLOSION

**iPhone 17 Pro 交互式三维爆炸展台 · v1.0.0**

参考 [ashemag/human-atlas](https://github.com/ashemag/human-atlas) 的「整体—拆解—检索—选择—独立查看」交互，重新实现手机结构展览。包含可旋转展台、连续爆炸动画、部件目录、来源面板和离线单文件版本。

**这是一套依据公开文档制作的程序化示意模型，不是 Apple 官方 CAD，也不是经过尺寸校准的维修模型。** 首版仅实现 **iPhone 17 Pro**，没有用推测数据冒充 iPhone 18 Pro。

## 一、启动

使用 Node.js 22 或更新版本。应用没有第三方运行依赖，不需要 `npm install`、API Key、模型下载或账户登录。

```bash
git clone https://github.com/Nuos/astra-explosion.git
cd astra-explosion
npm run dev
```

浏览器打开 **http://127.0.0.1:3017**。端口和监听地址可通过 `PORT`、`HOST` 修改；默认只监听本机。

```bash
npm run check
npm test
npm run build
npm run preview
```

构建生成：

| 文件 | 用途 |
|---|---|
| `dist/index.html` 与 `dist/src/` | 可部署到静态网站服务的版本 |
| `dist/astra-explosion-standalone.html` | CSS、代码及程序化模型均在单文件内的离线版本 |

普通浏览器可尝试直接打开单文件。若浏览器策略限制 `file://`、Import Map 或数据模块，请使用上面的本地服务器。`npm run preview` 服务 `dist/`；不要与开发服务器同时占用同一端口。构建不会自动开通 GitHub Pages。

## 二、操作

| 控件 | 功能 |
|---|---|
| **Explode / Assemble** | 在完整手机与分层爆炸视图之间切换 |
| **Separation** | 连续调节 0–100% 分离程度 |
| **Layers / Inventory** | 分层爆炸与全部可见部件的独立网格展示 |
| 鼠标拖动 / 滚轮；触摸拖动 / 双指缩放 | 旋转与缩放视角 |
| 画布点选 / 右侧目录 | 选择部件并读取说明、公开来源 |
| **Isolate part** | 居中独立查看所选部件，再退出恢复 |
| 检索、分类、眼睛按钮 | 中英文检索、按系统筛选、逐件显隐 |
| **3D / Front / Rear** | 重设观察方向 |
| 三个配色按钮 | 银色、宇宙橙、深蓝色示意材质 |
| 标签、转台、相机、重置图标 | 标签显隐、自动旋转、PNG 导出、恢复初始状态 |

搜索仅过滤目录，分类与逐件显隐会改变场景。Inventory 中的小件会单独放大，不能用网格间大小比较真实尺寸。移动端通过 **Parts** 抽屉打开目录。英文界面保留部件中文名称与中文检索。

键盘：聚焦画布时按 **Space** 拆解/组装；**R** 重置；**/** 搜索；**Escape** 退出检查或关闭面板。输入文本时不会误触发这些快捷键。

## 三、模型范围与证据边界

Apple 的 [iPhone 17 Pro 爆炸图](https://support.apple.com/en-us/124248) 列出 21 个编号装配项。本项目逐项建立了可选择模型，包括显示屏、胶条、连接器盖板、电池、扬声器、相机、Taptic Engine、主麦克风、逻辑板、USB-C 总成、机壳和背板玻璃。另有 **A1 均热板、A2 MagSafe、A3 代表性紧固件** 三组说明性细分，共 **24 个可选组**。完整对照见 [docs/SOURCES.md](docs/SOURCES.md)。

外壳名义尺寸参考 Apple 公布的 **71.9 × 150 × 8.75 mm**；摄像头凸起、内部部件尺寸、螺钉位置、连接排线路径和芯片封装布局均为简化估计。软件没有抓取或打包官方 CAD，也没有从二维维修图恢复制造精度。

均热板在真实设备中焊接于机身，不能把本项目中的分离动画理解为可拆卸步骤。MagSafe 细分用于说明，12 枚示意紧固件也不等于整机螺钉总数。模型采用 eSIM 形态启发的结构，不对应经过核实的某一地区完整物料清单；未覆盖物理 SIM、全部射频器件、所有微型元件和完整接地弹片。**21 个文档装配项 ≠ 手机的全部物理零件。**

## 四、代码结构

```text
astra-explosion/
├── index.html                  # 页面入口
├── src/
│   ├── catalog.js              # 21+3 项目录、来源、初始位置与爆炸位移
│   ├── geometry.js             # 原创程序化几何、材质分组和展台
│   ├── math.js                 # 矩阵、射线拾取、网格布局、点击/拖动区分
│   ├── renderer.js             # WebGL 2 与深度缓冲软件回退渲染
│   ├── main.js                 # UI、交互状态、动画、相机、部件详情
│   └── style.css               # 桌面、手机、横屏与减少动画适配
├── scripts/                    # 无依赖开发服务器和静态/单文件构建
├── tests/                      # Node 单元测试、可选 Playwright 浏览器测试
├── docs/                       # 来源、架构、测试与版本记录
└── .github/workflows/           # 自动校验与打包，不自动部署网站
```

几何数据在本地运行时确定性生成；纹理也由代码绘制，无外链图片、远程字体、分析服务或遥测。引用链接只在用户主动打开时访问。

WebGL 2 是首选渲染路径。无法获取 WebGL 2 上下文时，自动使用同一套几何和拾取逻辑的深度缓冲 Canvas 2D 回退；回退不等同于 GPU 加速，可能明显更慢。静止时停止重复渲染；动画和旋转期间按需更新。

## 五、验证与继续开发

```bash
npm run check
npm test
npm run build
# 以下仅用于可选浏览器测试，不是运行应用所需依赖：
python -m pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py
```

`ASTRA_BROWSER` 可以指定现有 Chromium；`ASTRA_REQUIRE_WEBGL=1` 要求测试必须走 WebGL 2；`ASTRA_TEST_OUT` 可改变截图与 JSON 报告目录。浏览器测试使用构建后的单文件内容，覆盖选择、拖动、检索、隔离、显隐、来源、导出及多种视口。

实际执行结果和未覆盖项见 [docs/TESTING.md](docs/TESTING.md)。不要把软件回退测试或 CI 的软件 WebGL 测试解释为真实手机、真实显卡或多点触控硬件的性能验证。

新增机型前，先补齐可核验来源与部件映射，再添加独立数据/几何实现，不应只替换页面标题。当前代码没有可用的 iPhone 18 Pro 模型开关。

## 六、许可证与致谢

原创代码与程序化几何使用 [MIT License](LICENSE)。`PointerTap` 改编自 Human Atlas 的 MIT 实现，保留完整原始版权声明于 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。未包含 BodyParts3D 数据。

Apple 文档与商标不因本项目许可证而被重新授权。本项目与 Apple 无隶属或背书关系，不应作为维修、电池处理、制造或电气设计依据。

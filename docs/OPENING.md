# v1.0.1 打开方式与审计

## 一、先区分三种地址

聊天回复中的 sandbox 附件链接用于取得文件，不是已经上线的网站。GitHub 仓库的 blob 文件页用于查看源码，也不是运行中的 HTML。只有实际部署的 HTTPS 网站或启动后的本地 HTTP 服务才是网页访问地址。

2026-09-12 复核时，仓库 `has_pages=false`，没有开通 GitHub Pages。本次修复不自动部署网站，也不修改仓库发布权限。

## 二、打开修复版

下载并解压交付包，用完整浏览器打开 `dist/astra-explosion-standalone.html`。从 v1.0.1 开始，`dist/index.html` 是完全相同的自包含文件，也可单独复制、改名后打开；运行不需要 npm、Python、API Key 或联网下载模型。

源码目录根部的 `index.html` 仍是开发入口，必须使用以下本地服务，而非单独下载它：

```bash
npm run dev
# 浏览器访问 http://127.0.0.1:3017
```

构建与预览：

```bash
npm run build
npm run preview
# 浏览器访问 http://127.0.0.1:3017
```

预览器禁止 JavaScript、附件下载链接失效、组织级浏览器策略阻止本地文件等，不可能由 HTML 内部代码解除。应使用允许的浏览器打开有效的完整下载文件。

## 三、修复内容

两个构建入口均改为内嵌经典 JavaScript，取消 Import Map 与 data-URL 模块依赖。源码模块仍保持独立；构建器仅支持本仓库使用的命名导出形式，遇到不支持的模块语法直接报错，不静默打包。

增加不依赖 JavaScript 的初始说明、脚本异常及图形初始化失败提示，避免启动失败只剩空白。顶部 ASTRA 链接改为当前展台重置，不再使离线用户跳到上级文件夹。

## 四、验证方法与边界

旧 `tests/browser_smoke.py` 使用 `page.set_content` 注入 HTML；它能够验证内部交互，但不能证明下载链接、文件双击或真实 HTTP 导航可用。

新 `tests/browser_navigation.py` 使用真实 `page.goto`，覆盖两个文件入口、中文及空格改名且独立放置的 HTML、本地构建服务、源码服务、网站子目录、三种移动视口、JavaScript 禁用和人为图形故障。测试不使用允许跨文件访问或禁用同源安全检查的浏览器标志。

GitHub CI 还从 `c915a5f` 重建旧版，观察旧 `dist/index.html` 与旧 standalone 文件的实际启动结果。旧版失败仅作为对照记录，不计入新版通过项。运行完成与否必须以对应 Actions 记录及 `test-results/navigation/navigation-report.json` 为准；新增测试文件本身不等于验证通过。

本地会话沙箱对 file:// 与 localhost 导航返回 `ERR_BLOCKED_BY_ADMINISTRATOR`，因此没有把本地导航算作通过，也没有尝试解除该策略。本地只验证了新构建语法、自包含性、确定性与内容注入后的交互。真实导航由 GitHub CI 执行。

软件图形环境不代表真实显卡、Safari、实体手机或真实多点触摸性能验收。用户原始故障若发生在附件链接取得阶段，仍不能仅由浏览器测试确定其原因。

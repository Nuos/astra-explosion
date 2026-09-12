# v1.0.1 实际打开故障审计 — 2026-09-12

## 一、结论

旧版确有一个可复现的入口故障：直接以 file:// 打开 v1.0.0 的 `dist/index.html`，浏览器阻止加载 `dist/src/main.js`，出现 CORS 错误与空白 body。旧版 standalone 在同一 Chromium 中能够启动；因此不能声称所有旧文件都损坏，也不能据此认定用户遇到的附件链接问题已经定位。

旧测试只使用 `page.set_content` 注入 HTML；先前“全部通过”仅覆盖内部测试用例，不覆盖下载或真实打开路径。

## 二、证据

修复提交：`f95eaadbc5328f9580425dda35d9a1461e996735`。

[GitHub Actions 运行 34708688121](https://github.com/Nuos/astra-explosion/actions/runs/34708688121) 的 validate 作业成功结束。已读取作业日志并下载 artifact `10302343778`，不是只检查工作流配置。

| 检查 | 实际结果 |
|---|---|
| JavaScript 与构建器语法 | 通过 |
| Node 单元及构建测试 | 14/14 通过，0 失败、0 跳过 |
| 原有浏览器交互测试 | 18/18 检查组通过，WebGL 2 |
| 新增真实导航与错误处理 | 11/11 场景通过，合计 65 个已记录检查 |
| 正常场景渲染器 | 9 个正常场景均为 webgl2 |
| 本地与 CI 离线 HTML | 逐字节相同，86,061 bytes |

导航测试时间：2026-09-12 17:36:35—17:37:24 UTC；Chromium 151.0.7922.34，GitHub Ubuntu / SwiftShader 软件图形环境。

11 场景分别为：file-index、file-standalone、中文/空格改名且独立放置的文件、HTTP 构建站点、HTTP 源码站点、HTTP 子目录、390×844、320×568、844×390 三种文件视口，以及 JavaScript 禁用、强制图形故障。后两项验证错误提示，不代表禁用脚本后还能交互。

正常场景验证实际导航、启动提示消失、爆炸/滑杆、检索/隔离、24 部件标签、无横向溢出、顶部品牌点击不离开文件、PNG 导出及浏览器刷新。正常场景未出现页面异常、失败请求或外部运行时请求。

## 三、旧版对照

`v100-file-modular` 失败，原始错误包含：

```text
Access to script at 'file:///.../dist/src/main.js' from origin 'null'
has been blocked by CORS policy
Failed to load resource: net::ERR_FAILED
```

body 文本为空，等待 ready 状态超时。`v100-file-standalone` 启动通过，24 个组且渲染器 webgl2；其顶部品牌链接解析到上级 dist/ 目录，而不是当前文件。

## 四、修复与交付

v1.0.1 的两个构建入口均内嵌经典 JavaScript，不再依赖外部 JS 模块、Import Map 或 data-URL 模块。增加不依赖脚本的打开说明、启动错误和图形错误提示；顶部品牌点击重置展台而非跳转目录。

CI ZIP SHA-256：`4ebb0e11920d5ff0ebcefdc9b7ae63ba11d17ef3aae0b2c0ef4e8e4b4243068a`。

HTML SHA-256：`1c9c7821cc03d1f8dadceaeba77a86f98240ec413f3088f4accb49ef7713b3b3`。

完整逐项报告及截图位于 CI 产物 `test-results/navigation/`；交互报告为 `test-results/browser-report.json`。聊天交付包中的 OPEN-ME.html 是同一 HTML 的改名副本，不是源码入口。

## 五、未覆盖项

仓库复核时 has_pages=false，未部署公开网站。GitHub 文件页、聊天附件预览和下载链接不是运行中的站点。本次测试不能测量聊天下载链接的有效期或用户端预览权限。

当前会话沙箱对 file:// 和 localhost 导航返回 ERR_BLOCKED_BY_ADMINISTRATOR；没有解除该策略，没有把这些被拦截测试计为通过。真实导航成功来自 GitHub CI。

未验证用户的具体浏览器、Safari、真实手机、真实显卡或多点触摸硬件。若用户原问题发生于附件下载之前，而不是打开已保存的 HTML，则仍需原始报错信息才能确认该问题的具体原因。

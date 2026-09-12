# 公开来源与部件对照

核验日期：2026-09-12。机型：iPhone 17 Pro。所有几何为原创程序化重建，不含官方 CAD 或转载维修图片。

## 原始来源

- **manual** — [Apple · Repair manual](https://support.apple.com/en-us/124262)
- **exploded** — [Apple · Internal / exploded view](https://support.apple.com/en-us/124248)
- **specs** — [Apple · Technical specifications](https://support.apple.com/en-us/125090)
- **thermal** — [Apple · Design and vapor chamber](https://www.apple.com/newsroom/2025/09/apple-unveils-iphone-17-pro-and-iphone-17-pro-max/)
- **screws** — [Apple · Screw diagrams](https://support.apple.com/en-us/124249)
- **back** — [Apple · Back glass](https://support.apple.com/en-us/123366)
- **reference** — [ashemag · Human Atlas (MIT)](https://github.com/ashemag/human-atlas)

Apple 的内部视图与爆炸图编号体系不同。下面 **01–21 仅对应其 Exploded view 的编号**，不是内部视图序号。配件表中还有未进入这 21 项图例的区域差异和小件，因此本表不等于全量物料清单。

## 模型目录

| 图例编号 | 稳定 ID | 英文名称 | 中文名称 | 说明来源 |
|---|---|---|---|---|
| 01 | `display` | Display | 显示屏 | [exploded](https://support.apple.com/en-us/124248) |
| 02 | `display-seal` | Display adhesive | 显示屏胶条 | [exploded](https://support.apple.com/en-us/124248) |
| 03 | `display-cowling` | Display connector cowling | 显示屏连接器盖板 | [exploded](https://support.apple.com/en-us/124248) |
| 04 | `battery-cowling` | Battery connector cowling | 电池连接器盖板 | [exploded](https://support.apple.com/en-us/124248) |
| 05 | `battery` | Battery | 电池 | [exploded](https://support.apple.com/en-us/124248) |
| 06 | `top-speaker` | Top speaker | 顶部扬声器 | [exploded](https://support.apple.com/en-us/124248) |
| 07 | `speaker-grille` | Top speaker grille | 顶部扬声器网罩 | [exploded](https://support.apple.com/en-us/124248) |
| 08 | `bottom-speaker` | Bottom speaker | 底部扬声器 | [exploded](https://support.apple.com/en-us/124248) |
| 09 | `camera-cowling` | Camera connector cowling | 后置相机连接器盖板 | [exploded](https://support.apple.com/en-us/124248) |
| 10 | `taptic` | Taptic Engine | 触感引擎 | [exploded](https://support.apple.com/en-us/124248) |
| 11 | `camera` | Camera | 后置相机模组 | [specs](https://support.apple.com/en-us/125090) |
| 12 | `front-cowling` | Front camera connector cowling | 前置相机连接器盖板 | [exploded](https://support.apple.com/en-us/124248) |
| 13 | `microphone` | Main microphone | 主麦克风 | [exploded](https://support.apple.com/en-us/124248) |
| 14 | `front-camera` | Front camera | 前置相机 | [specs](https://support.apple.com/en-us/125090) |
| 15 | `logic-cowling` | Logic board connector cowling | 逻辑板连接器盖板 | [exploded](https://support.apple.com/en-us/124248) |
| 16 | `logic-board` | Logic board | 逻辑板 | [specs](https://support.apple.com/en-us/125090) |
| 17 | `usb-c` | USB-C connector | USB-C 接口总成 | [exploded](https://support.apple.com/en-us/124248) |
| 18 | `enclosure` | Enclosure | 机壳 | [specs](https://support.apple.com/en-us/125090) |
| 19 | `back-seal` | Back glass adhesive | 背板玻璃胶条 | [exploded](https://support.apple.com/en-us/124248) |
| 20 | `back-cowling` | Back glass connector cowling | 背板玻璃连接器盖板 | [exploded](https://support.apple.com/en-us/124248) |
| 21 | `back-glass` | Back glass | 背板玻璃 | [back](https://support.apple.com/en-us/123366) |
| A1 | `vapor` | Vapor chamber · illustrative | 均热板 · 示意 | [thermal](https://www.apple.com/newsroom/2025/09/apple-unveils-iphone-17-pro-and-iphone-17-pro-max/) |
| A2 | `magsafe` | MagSafe assembly · illustrative | MagSafe 总成 · 示意 | [specs](https://support.apple.com/en-us/125090) |
| A3 | `fasteners` | Fasteners · representative | 紧固件 · 代表性示意 | [screws](https://support.apple.com/en-us/124249) |

## 从文档到模型的证据强度

**可直接核验**：21 个装配项的名称和编号；公布的名义机身尺寸；机身材料、配色、A19 Pro、相机及 MagSafe 等产品特征。

**依据图像作示意重建**：部件的大致相邻关系、主轮廓、相机平台与后玻璃区域。二维图没有提供的深度、厚度和内部表面结构并不因本项目可旋转显示就成为已知事实。

**纯说明性细节**：电路板焊盘、芯片位置、镜头内部层数、磁铁与绕组数量、螺钉布局、金属高光、屏幕图案和展开位移。电池贴图明确写明为示意重建，不标注未经核验的容量。

A1 为均热板说明性切开视图：Apple 明确描述其焊接于铝制机壳，项目为了看见它而分离，不表示真实可直接取下。A2 将后部无线充电细节作为独立说明组。A3 只显示 12 枚代表性紧固件，不代表总数或正确位置。没有按维修图实现工具、扭矩、断电与胶条操作。

每个选件详情重复提示 Estimated geometry。页面 About & sources 同时披露 eSIM 参考形态、未覆盖项、尺度约定与 iPhone 18 Pro 未实现的边界。

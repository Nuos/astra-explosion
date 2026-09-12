/** Public assembly identities; every internal dimension and route is an estimate. */
export const SOURCES = {
  manual: ['Apple · Repair manual', 'https://support.apple.com/en-us/124262'],
  exploded: ['Apple · Internal / exploded view', 'https://support.apple.com/en-us/124248'],
  specs: ['Apple · Technical specifications', 'https://support.apple.com/en-us/125090'],
  thermal: ['Apple · Design and vapor chamber', 'https://www.apple.com/newsroom/2025/09/apple-unveils-iphone-17-pro-and-iphone-17-pro-max/'],
  screws: ['Apple · Screw diagrams', 'https://support.apple.com/en-us/124249'],
  back: ['Apple · Back glass', 'https://support.apple.com/en-us/123366'],
  reference: ['ashemag · Human Atlas (MIT)', 'https://github.com/ashemag/human-atlas']
};
export const DEVICE = {name:'iPhone 17 Pro', width:71.9, height:150, depth:8.75, unitMM:20, variant:'eSIM-inspired reference', checked:'2026-09-12'};
export const CATEGORIES = {shell:['Exterior','外部结构'], core:['Power & logic','供电与逻辑'], optics:['Cameras','相机'], audio:['Audio & haptics','声音与触觉'], hardware:['Mounts & seals','固定与密封']};
// id, Apple callout, name, Chinese name, system, center, exploded displacement, explanation, source.
const rows = [
 ['display','01','Display','显示屏','shell',[0,0,.25],[-.65,.18,4.8],'The complete display is one service assembly. Cover glass, OLED and touch layers remain grouped; layer thicknesses are illustrative.','exploded'],
 ['display-seal','02','Display adhesive','显示屏胶条','hardware',[0,0,.19],[-.35,.08,3.8],'A perimeter seal underneath the display. The model shows a continuous ring rather than a production adhesive die-cut.','exploded'],
 ['display-cowling','03','Display connector cowling','显示屏连接器盖板','hardware',[-1.13,1.13,.14],[-3.6,.7,2.1],'A small retaining cover over the display connection. Holes and folds are simplified.','exploded'],
 ['battery-cowling','04','Battery connector cowling','电池连接器盖板','hardware',[-.65,.83,.14],[-3.6,-.5,2.4],'Retaining cover associated with the battery connector. This is not a connector pinout.','exploded'],
 ['battery','05','Battery','电池','core',[0,-.82,.035],[-.1,-.1,2.6],'A simplified battery-and-support assembly. Cell capacity, chemistry layers and exact screw positions are not reconstructed.','exploded'],
 ['top-speaker','06','Top speaker','顶部扬声器','audio',[-1.02,3.03,.01],[-2.1,1.7,1.25],'Upper acoustic module. The grille is a separate numbered item in Apple’s exploded view.','exploded'],
 ['speaker-grille','07','Top speaker grille','顶部扬声器网罩','audio',[0,3.6,.19],[0,1.6,2.5],'The narrow speaker grille at the upper edge. Perforation count is illustrative.','exploded'],
 ['bottom-speaker','08','Bottom speaker','底部扬声器','audio',[-.94,-3.1,.015],[-2.1,-.05,1.65],'Lower acoustic module. Apple lists different replacement variants for physical-SIM and eSIM models.','exploded'],
 ['camera-cowling','09','Camera connector cowling','后置相机连接器盖板','hardware',[1.08,1.04,.14],[3.05,.8,1.1],'A simplified cover over the camera connection, kept distinct from the camera assembly.','exploded'],
 ['taptic','10','Taptic Engine','触感引擎','audio',[.92,-3.1,.015],[2.1,.08,1.65],'The haptic actuator is represented as a metal module; internal moving masses are not modeled.','exploded'],
 ['camera','11','Camera','后置相机模组','optics',[.53,2.5,-.04],[2.75,1.15,-.8],'Three rear camera modules remain one selectable service assembly. Lens elements and sensor sizes are illustrative.','specs'],
 ['front-cowling','12','Front camera connector cowling','前置相机连接器盖板','hardware',[-1.15,2.13,.13],[-3.55,1.3,1.3],'A small retaining cover associated with the front-camera connection.','exploded'],
 ['microphone','13','Main microphone','主麦克风','audio',[.49,-3.54,.015],[1.8,-.12,3.1],'The main microphone module, distinct from the speaker and USB-C assembly.','exploded'],
 ['front-camera','14','Front camera','前置相机','optics',[.02,3.27,.1],[.2,1.9,1.1],'An illustrative front-camera / TrueDepth assembly. Apple specifies an 18MP Center Stage camera; individual sensor geometry is not CAD.','specs'],
 ['logic-cowling','15','Logic board connector cowling','逻辑板连接器盖板','hardware',[-1.32,.58,.13],[-3.15,-1.4,1.3],'A retaining cover associated with logic-board interconnects.','exploded'],
 ['logic-board','16','Logic board','逻辑板','core',[-.26,1.26,-.06],[-1.6,1.1,.9],'Schematic board silhouette with illustrative packages and traces. The A19 Pro is a documented device feature; package placement is not a verified PCB layout.','specs'],
 ['usb-c','17','USB-C connector','USB-C 接口总成','core',[0,-3.56,-.015],[-.3,.15,3.3],'A port and simplified flex assembly. Contacts and routing are visual approximations, not an electrical schematic.','exploded'],
 ['enclosure','18','Enclosure','机壳','shell',[0,0,0],[0,0,-.3],'The aluminum unibody is reconstructed from public views. The outer envelope uses Apple’s published 71.9 × 150 × 8.75 mm dimensions; camera protrusions are estimated.','specs'],
 ['back-seal','19','Back glass adhesive','背板玻璃胶条','hardware',[0,-.9,-.205],[.2,0,-2.4],'A schematic perimeter seal for the smaller rear glass panel below the camera plateau.','exploded'],
 ['back-cowling','20','Back glass connector cowling','背板玻璃连接器盖板','hardware',[1.12,-2.1,-.14],[3.6,.4,-1.9],'A small retaining cover associated with the back-glass connection.','exploded'],
 ['back-glass','21','Back glass','背板玻璃','shell',[0,-.9,-.235],[.6,.06,-3.5],'The rear panel below the camera plateau. Wireless-charging details are separated as an illustrative subassembly for this exhibit, not as an extra Apple service step.','back'],
 ['vapor','A1','Vapor chamber · illustrative','均热板 · 示意','core',[0,.85,-.105],[-1.6,.5,-1.3],'Illustrative cutaway only. Apple describes a vapor chamber laser-welded into the aluminum unibody; it is not a freely removable part as this animation might suggest.','thermal'],
 ['magsafe','A2','MagSafe assembly · illustrative','MagSafe 总成 · 示意','core',[0,-.87,-.165],[.4,-.05,-1.5],'A stylized charging-coil and magnet array associated with the rear panel. Magnet count, winding count and placement are illustrative.','specs'],
 ['fasteners','A3','Fasteners · representative','紧固件 · 代表性示意','hardware',[0,0,.17],[4.5,.1,.3],'A representative set, not a complete screw inventory. Exact types, quantities, torque and locations must come from the relevant Apple repair procedure.','screws']
];
export const PARTS = rows.map(([id,number,name,zh,category,position,explode,description,source]) => ({id,number,name,zh,category,position,explode,description,source,official:!number.startsWith('A')}));
export function searchParts(query='', category='all') {
  const tokens=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return PARTS.filter(p => (category==='all'||p.category===category) && tokens.every(t => `${p.name} ${p.zh} ${p.id} ${p.number} ${p.description} ${CATEGORIES[p.category].join(' ')}`.toLowerCase().includes(t)));
}

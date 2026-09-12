import test from 'node:test';
import assert from 'node:assert/strict';
import { PARTS, DEVICE, SOURCES, CATEGORIES, searchParts } from '../src/catalog.js';
import { buildModel, buildStage, rounded, cylinder } from '../src/geometry.js';
import { modelMatrix, transform, inverseRigid, multiply, identity, rayTriangle, rayBox, inventoryLayout, PointerTap } from '../src/math.js';
const close=(a,b,tolerance=1e-5)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
const models=buildModel();
test('21 Apple callouts and 3 explicitly illustrative groups',()=>{
 assert.equal(PARTS.length,24);assert.equal(new Set(PARTS.map(p=>p.id)).size,24);
 assert.deepEqual(PARTS.filter(p=>p.official).map(p=>p.number),Array.from({length:21},(_,i)=>String(i+1).padStart(2,'0')));
 assert.deepEqual(PARTS.filter(p=>!p.official).map(p=>p.number),['A1','A2','A3']);
});
test('every assembly has a source, category, explanation and finite transforms',()=>{
 for(const p of PARTS){assert.ok(SOURCES[p.source]);assert.ok(CATEGORIES[p.category]);assert.ok(p.description.length>40);assert.ok(p.zh);assert.match(SOURCES[p.source][1],/^https:\/\//);assert.equal(p.position.length,3);assert.equal(p.explode.length,3);assert.ok([...p.position,...p.explode].every(Number.isFinite));}
});
test('English, Chinese, multi-token and empty search',()=>{
 assert.ok(searchParts('A19').some(p=>p.id==='logic-board'));assert.deepEqual(searchParts('电池').map(p=>p.id),['battery-cowling','battery']);assert.ok(searchParts('connector cowling').length>=6);assert.equal(searchParts('no-such-component-xyz').length,0);assert.equal(searchParts('  ').length,24);assert.ok(searchParts('', 'optics').every(p=>p.category==='optics'));
});
test('all modeled triangle buffers have finite attributes, unit normals and valid bounds',()=>{
 let count=0;for(const p of models){assert.ok(p.meshes.length);for(const m of p.meshes){assert.equal(m.vertices.length%24,0);assert.ok(m.vertices.length>0);assert.ok(m.vertices.every(Number.isFinite));for(let i=0;i<m.vertices.length;i+=8){close(Math.hypot(...m.vertices.slice(i+3,i+6)),1,2e-5);for(let k=0;k<3;k++)assert.ok(m.vertices[i+k]>=p.bounds.min[k]-1e-5&&m.vertices[i+k]<=p.bounds.max[k]+1e-5);}count+=m.vertices.length/24;}}
 assert.ok(count>45000&&count<60000);
});
test('enclosure nominal envelope follows published dimensions, not protrusion bounds',()=>{
 const v=rounded(DEVICE.width/DEVICE.unitMM,DEVICE.height/DEVICE.unitMM,DEVICE.depth/DEVICE.unitMM,.43,.075);
 for(const [axis,dimension] of [[0,DEVICE.width],[1,DEVICE.height],[2,DEVICE.depth]]){const values=v.filter((_,i)=>i%8===axis);close((Math.max(...values)-Math.min(...values))*DEVICE.unitMM,dimension);}
});
test('solid primitives and stage contain valid, nondegenerate geometry',()=>{
 for(const v of [rounded(2,3,.2),cylinder(1,.2),...buildStage().map(m=>m.vertices)]){assert.equal(v.length%24,0);assert.ok(Array.from(v).every(Number.isFinite));}
});
test('model matrices and inverse support translated/rotated/scaled picking',()=>{
 for(let i=0;i<15;i++){const m=modelMatrix([i*.23,-i*.4,.4],[.15*i,-.1*i,.2*i],.1+i*.31),inv=inverseRigid(m),r=multiply(m,inv);r.forEach((v,j)=>close(v,identity()[j]));const point=[.3,2,-.8],world=transform(m,point),local=transform(inv,world);local.slice(0,3).forEach((v,j)=>close(v,point[j]));}
});
test('ray/triangle and ray/box tests reject misses and backward hits',()=>{
 close(rayTriangle([0,0,2],[0,0,-1],[-1,-1,0],[1,-1,0],[0,1,0]),2);assert.equal(rayTriangle([3,0,2],[0,0,-1],[-1,-1,0],[1,-1,0],[0,1,0]),Infinity);assert.equal(rayTriangle([0,0,2],[0,0,1],[-1,-1,0],[1,-1,0],[0,1,0]),Infinity);assert.equal(rayBox([0,0,2],[0,0,-1],[-1,-1,-1],[1,1,1]),true);assert.equal(rayBox([3,0,2],[0,0,-1],[-1,-1,-1],[1,1,1]),false);
});
test('inventory cells do not overlap at desktop, portrait or landscape aspect ratios',()=>{
 for(const aspect of [.38,.6,1,1.7,2.4,5])for(const parts of [PARTS,PARTS.slice(0,2),PARTS.slice(0,1),[]]){const {cells}=inventoryLayout(parts,aspect);assert.equal(cells.length,parts.length);for(let i=0;i<cells.length;i++)for(let j=0;j<i;j++){const a=cells[i],b=cells[j];assert.ok(Math.abs(a.x-b.x)>=(a.width+b.width)/2-1e-5||Math.abs(a.y-b.y)>=(a.height+b.height)/2-1e-5);}}
});
test('tap selects; orbit, pinch and canceled sequences do not',()=>{
 const p=new PointerTap();p.down(1,10,10);assert.equal(p.up(1,12,11),true);p.down(1,10,10);p.move(1,40,10);assert.equal(p.up(1,10,10),false);p.down(1,10,10);p.down(2,20,20);assert.equal(p.up(2,20,20),false);assert.equal(p.up(1,10,10),false);p.down(3,0,0);p.cancel(3);assert.equal(p.up(3,0,0),false);p.down(4,0,0);assert.equal(p.up(4,0,0),true);
});

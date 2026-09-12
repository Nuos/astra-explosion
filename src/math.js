/** Column-major matrices, shared by the renderer, layout and tests. */
export const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
export const mix=(a,b,t)=>a+(b-a)*t;
export const add=(a,b)=>a.map((x,i)=>x+b[i]);
export const sub=(a,b)=>a.map((x,i)=>x-b[i]);
export const scale=(a,s)=>a.map(x=>x*s);
export const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const normalize=a=>scale(a,1/(Math.hypot(...a)||1));
export const identity=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
export function multiply(a,b){const r=Array(16).fill(0);for(let c=0;c<4;c++)for(let y=0;y<4;y++)for(let k=0;k<4;k++)r[c*4+y]+=a[k*4+y]*b[c*4+k];return r;}
export function transform(m,p,w=1){return [0,1,2,3].map(i=>m[i]*p[0]+m[i+4]*p[1]+m[i+8]*p[2]+m[i+12]*w);}
export function modelMatrix(p=[0,0,0],r=[0,0,0],s=1){
 const [x,y,z]=r,[cx,cy,cz]=r.map(Math.cos),[sx,sy,sz]=r.map(Math.sin);
 // Rz * Ry * Rx; uniform scaling keeps the normal transform simple.
 void x;void y;void z;
 return [cz*cy*s,sz*cy*s,-sy*s,0,(cz*sy*sx-sz*cx)*s,(sz*sy*sx+cz*cx)*s,cy*sx*s,0,(cz*sy*cx+sz*sx)*s,(sz*sy*cx-cz*sx)*s,cy*cx*s,0,...p,1];
}
export function perspective(fov,aspect,near=.1,far=200){const f=1/Math.tan(fov/2),d=1/(near-far);return [f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*d,-1,0,0,2*far*near*d,0];}
export function lookAt(eye,target){const z=normalize(sub(eye,target)),x=normalize(cross([0,1,0],z)),y=cross(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];}
export function project(point,vp,width,height){const v=transform(vp,point);return {x:(v[0]/v[3]*.5+.5)*width,y:(.5-v[1]/v[3]*.5)*height,visible:v[3]>0&&Math.abs(v[2]/v[3])<=1};}
export function inverseRigid(m){const s2=m[0]**2+m[1]**2+m[2]**2;const a=[m[0]/s2,m[4]/s2,m[8]/s2,0,m[1]/s2,m[5]/s2,m[9]/s2,0,m[2]/s2,m[6]/s2,m[10]/s2,0,0,0,0,1];const t=transform(a,[-m[12],-m[13],-m[14]],0);a[12]=t[0];a[13]=t[1];a[14]=t[2];return a;}
export function rayTriangle(o,d,a,b,c){const e1=sub(b,a),e2=sub(c,a),h=cross(d,e2),det=dot(e1,h);if(Math.abs(det)<1e-9)return Infinity;const f=1/det,s=sub(o,a),u=f*dot(s,h);if(u<0||u>1)return Infinity;const q=cross(s,e1),v=f*dot(d,q);if(v<0||u+v>1)return Infinity;const t=f*dot(e2,q);return t>1e-5?t:Infinity;}
export function rayBox(o,d,min,max){let near=0,far=Infinity;for(let i=0;i<3;i++){if(Math.abs(d[i])<1e-9){if(o[i]<min[i]||o[i]>max[i])return false;continue;}let a=(min[i]-o[i])/d[i],b=(max[i]-o[i])/d[i];if(a>b)[a,b]=[b,a];near=Math.max(near,a);far=Math.min(far,b);if(near>far)return false;}return true;}
/** Each inventory cell is independent; small hardware is enlarged for inspection. */
export function inventoryLayout(parts,aspect=1.4){
 const cellW=3.8,cellH=4;let cols=1,best=Infinity;aspect=Math.max(.2,aspect);
 for(let c=1;c<=Math.min(12,Math.max(1,parts.length));c++){const rows=Math.ceil(parts.length/c),cost=Math.max(rows*cellH,c*cellW/aspect);if(cost<best){best=cost;cols=c;}}
 const rows=Math.ceil(parts.length/cols);return {width:cols*cellW,height:rows*cellH,cells:parts.map((p,i)=>({id:p.id,x:(i%cols-(cols-1)/2)*cellW,y:((rows-1)/2-Math.floor(i/cols))*cellH,width:cellW,height:cellH}))};
}
/** Adapted from Human Atlas, copyright (c) 2026 ashemag, MIT. */
export class PointerTap {
 active=new Map();blocked=false;
 down(id,x,y,threshold=6){if(!this.active.size)this.blocked=false;this.active.set(id,{x,y,threshold});if(this.active.size>1)this.blocked=true;}
 move(id,x,y){const p=this.active.get(id);if(p&&Math.hypot(x-p.x,y-p.y)>p.threshold)this.blocked=true;}
 up(id,x,y){this.move(id,x,y);const tap=this.active.has(id)&&this.active.size===1&&!this.blocked;this.active.delete(id);return tap;}
 cancel(id){this.active.delete(id);this.blocked=true;}
}

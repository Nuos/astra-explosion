import { clamp, mix, add, sub, scale, normalize, cross, modelMatrix, multiply, lookAt, perspective, project, inverseRigid, transform, rayBox, rayTriangle, PointerTap, dot } from './math.js';

const VS=`#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec2 aUV;
uniform mat4 uModel; uniform mat4 uVP;
out vec3 vPosition; out vec3 vNormal; out vec2 vUV;
void main(){vec4 p=uModel*vec4(aPosition,1.);vPosition=p.xyz;vNormal=mat3(uModel)*aNormal;vUV=aUV;gl_Position=uVP*p;}`;
const FS=`#version 300 es
precision highp float;
in vec3 vPosition; in vec3 vNormal; in vec2 vUV;
uniform vec3 uColor,uEye;uniform float uMetal,uRough,uSelected;uniform bool uTextured;uniform sampler2D uTexture;
out vec4 fragColor;
void main(){
 vec4 tex=uTextured?texture(uTexture,vUV):vec4(1.);if(tex.a<.02)discard;
 vec3 N=normalize(vNormal);if(!gl_FrontFacing)N=-N;vec3 V=normalize(uEye-vPosition);
 vec3 L=normalize(vec3(-.65,1.,.8)),L2=normalize(vec3(.9,.5,-.75));
 vec3 base=uColor*tex.rgb;float nv=max(dot(N,V),0.);
 float diffuse=.37+.52*max(dot(N,L),0.)+.27*max(dot(N,L2),0.);
 vec3 reflected=reflect(-V,N);float studio=pow(max(dot(reflected,normalize(vec3(-.8,1.,1.))),0.),14.);
 float spec=pow(max(dot(N,normalize(L+V)),0.),mix(12.,180.,1.-uRough));
 float spec2=pow(max(dot(N,normalize(L2+V)),0.),mix(8.,85.,1.-uRough));
 vec3 c=base*diffuse+mix(vec3(.08),base*.66,uMetal)*(spec*1.3+spec2*.55+studio*.8);
 c+=pow(1.-nv,4.)*.12*(.3+uMetal);
 c=mix(c,c*.82+vec3(.25,.085,.01),uSelected*.45);
 c+=uSelected*pow(1.-nv,2.)*vec3(.28,.09,.01);
 fragColor=vec4(clamp(c,0.,1.),tex.a);
}`;
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);}
function textureCanvas(kind){
 const canvas=document.createElement('canvas');canvas.width=kind==='screen'?512:512;canvas.height=kind==='screen'?1024:kind==='battery'?768:512;const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 c.clearRect(0,0,w,h);
 if(kind==='screen'){
  let g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#e7dccf');g.addColorStop(.4,'#bd683f');g.addColorStop(1,'#272c36');c.fillStyle=g;c.fillRect(0,0,w,h);
  for(let i=0;i<6;i++){c.save();c.translate(w*.6,h*.85);c.rotate(-.28);c.beginPath();c.ellipse(0,0,w*(.47+i*.21),h*(.42+i*.12),0,0,Math.PI*2);c.lineWidth=43;c.strokeStyle=['#f3c4a2','#d39870','#c2734c','#9e5136','#e0af89','#f0c8a6'][i];c.stroke();c.restore();}
  c.fillStyle='#fbf4e9';c.textAlign='center';c.font='500 24px sans-serif';c.fillText('Tuesday, September 9',w/2,169);c.font='600 105px sans-serif';c.fillText('9:41',w/2,281);
 }else if(kind==='battery'){
  c.fillStyle='#292e33';c.fillRect(0,0,w,h);c.fillStyle='#8e969e';c.textAlign='left';c.font='500 29px sans-serif';c.fillText('Li-ion',43,113);c.font='500 21px sans-serif';c.fillText('RECHARGEABLE',43,149);c.fillText('BATTERY ASSEMBLY',43,181);
  c.strokeStyle='#707982';c.lineWidth=2;c.strokeRect(44,233,137,193);c.fillStyle='#707982';c.fillRect(93,221,39,12);c.beginPath();c.moveTo(124,260);c.lineTo(90,333);c.lineTo(118,333);c.lineTo(100,389);c.lineTo(145,313);c.lineTo(116,313);c.closePath();c.fill();
  c.font='16px monospace';['ILLUSTRATIVE RECONSTRUCTION','NOT A SERVICE PART','Do not use this exhibit','as a repair procedure.'].forEach((s,i)=>c.fillText(s,43,535+i*29));
 }else if(kind==='chip'||kind==='taptic'){
  c.fillStyle=kind==='chip'?'#4a535b':'#252b31';c.fillRect(0,0,w,h);c.fillStyle='#c9cdd1';c.textAlign='center';c.font=`500 ${kind==='chip'?100:67}px sans-serif`;c.fillText(kind==='chip'?'A19':'TAPTIC',w/2,h*.46);c.font='36px sans-serif';c.fillText(kind==='chip'?'PRO':'ENGINE',w/2,h*.63);
 }else if(kind==='apple'){
  c.fillStyle='#a8afb5';c.beginPath();c.moveTo(268,144);c.bezierCurveTo(222,123,183,126,152,159);c.bezierCurveTo(115,199,133,296,183,353);c.bezierCurveTo(206,383,229,355,255,357);c.bezierCurveTo(280,354,303,379,325,348);c.bezierCurveTo(342,327,355,303,363,280);c.bezierCurveTo(311,256,305,200,353,169);c.bezierCurveTo(327,134,299,125,268,144);c.fill();c.beginPath();c.moveTo(254,132);c.bezierCurveTo(251,97,280,69,316,61);c.bezierCurveTo(317,100,290,127,254,132);c.fill();
 }else if(kind==='shadow'){
  let g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w*.5);g.addColorStop(0,'rgba(55,49,39,.17)');g.addColorStop(.45,'rgba(55,49,39,.12)');g.addColorStop(1,'rgba(55,49,39,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
 }return canvas;
}
export class Renderer {
 constructor(canvas,parts,stage){
  this.canvas=canvas;this.parts=parts;this.stage=stage;this.selected=null;this.autoRotate=false;this.pending=false;this.disposed=false;this.pointers=new Map();this.tap=new PointerTap();this.finish='silver';
  this.camera={yaw:2.62,pitch:.18,distance:16.7,target:[0,3.95,0]};this.desired={...this.camera,target:[...this.camera.target]};this.width=1;this.height=1;
  const gl=canvas.getContext('webgl2',{antialias:true,alpha:true,preserveDrawingBuffer:false,powerPreference:'high-performance'});this.gl=gl;
  if(!gl){
   this.software=true;this.context=canvas.getContext('2d');if(!this.context)throw new Error('Neither WebGL 2 nor Canvas 2D is available.');
   this.textures=new Map();this.allMeshes=[...parts.flatMap(p=>p.meshes),...stage];for(const mesh of this.allMeshes)if(mesh.material.texture&&!this.textures.has(mesh.material.texture))this.textures.set(mesh.material.texture,textureCanvas(mesh.material.texture));
   this.abort=new AbortController();this.bindEvents();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas.parentElement);this.resize();return;
  }
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
  const p=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,VS),fs=shader(gl.FRAGMENT_SHADER,FS);gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));this.program=p;
  this.uniforms=Object.fromEntries(['Model','VP','Color','Eye','Metal','Rough','Selected','Textured','Texture'].map(n=>[n,gl.getUniformLocation(p,'u'+n)]));this.textures=new Map();
  this.allMeshes=[...parts.flatMap(p=>p.meshes),...stage];for(const mesh of this.allMeshes){
   mesh.vao=gl.createVertexArray();gl.bindVertexArray(mesh.vao);mesh.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);gl.bufferData(gl.ARRAY_BUFFER,mesh.vertices,gl.STATIC_DRAW);
   for(const [i,n,offset] of [[0,3,0],[1,3,12],[2,2,24]]){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,n,gl.FLOAT,false,32,offset);}
   if(mesh.material.texture&&!this.textures.has(mesh.material.texture))this.createTexture(mesh.material.texture);
  }gl.bindVertexArray(null);gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  this.abort=new AbortController();this.bindEvents();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas.parentElement);this.resize();
 }
 createTexture(kind){const gl=this.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,textureCanvas(kind));gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);this.textures.set(kind,t);}
 bindEvents(){const canvas=this.canvas,opts={signal:this.abort.signal};
  canvas.addEventListener('pointerdown',e=>{this.autoRotate=false;this.onInteract?.();this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.tap.down(e.pointerId,e.clientX,e.clientY,e.pointerType==='touch'?10:6);canvas.setPointerCapture(e.pointerId);},opts);
  canvas.addEventListener('pointermove',e=>{
   const old=this.pointers.get(e.pointerId);if(!old)return;this.tap.move(e.pointerId,e.clientX,e.clientY);const dx=e.clientX-old.x,dy=e.clientY-old.y;
   if(this.pointers.size===1){this.desired.yaw-=dx*.008;this.desired.pitch=clamp(this.desired.pitch+dy*.006,-1.15,1.15);}else if(this.pointers.size===2){const other=[...this.pointers.entries()].find(([id])=>id!==e.pointerId)[1],a=Math.hypot(old.x-other.x,old.y-other.y),b=Math.hypot(e.clientX-other.x,e.clientY-other.y);if(b>2)this.desired.distance=clamp(this.desired.distance*a/b,2.3,120);}
   this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.request();
  },opts);
  canvas.addEventListener('pointerup',e=>{const tap=this.tap.up(e.pointerId,e.clientX,e.clientY);this.pointers.delete(e.pointerId);if(tap){const r=canvas.getBoundingClientRect();this.onSelect?.(this.pick(e.clientX-r.left,e.clientY-r.top));}},opts);
  for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{this.pointers.delete(e.pointerId);this.tap.cancel(e.pointerId);},opts);
  canvas.addEventListener('wheel',e=>{e.preventDefault();this.desired.distance=clamp(this.desired.distance*Math.exp(clamp(e.deltaY,-120,120)*.0015),2.3,120);this.request();},{...opts,passive:false});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.disposed=true;this.onError?.('The graphics context was lost. Reload the page to restore the exhibit.');},opts);
 }
 resize(){const r=this.canvas.parentElement.getBoundingClientRect();this.width=Math.max(1,r.width);this.height=Math.max(1,r.height);const dpr=this.software?Math.min(1,1000/this.width,720/this.height):Math.min(window.devicePixelRatio||1,1.75);this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);this.onResize?.();this.request();}
 setView(yaw,pitch,distance,target=[0,3.95,0],instant=false){const diff=Math.atan2(Math.sin(yaw-this.camera.yaw),Math.cos(yaw-this.camera.yaw));this.desired={yaw:this.camera.yaw+diff,pitch,distance,target:[...target]};if(instant)this.camera={...this.desired,target:[...target]};this.request();}
 fit(bounds,yaw=this.desired.yaw,pitch=this.desired.pitch){const min=bounds.min,max=bounds.max,center=min.map((v,i)=>(v+max[i])/2),r=Math.hypot(...sub(max,min))/2;const halfV=.32,halfH=Math.atan(Math.tan(halfV)*this.width/this.height),d=r/Math.sin(Math.min(halfV,halfH)) *1.1;this.setView(yaw,pitch,Math.max(3,d),center);}
 request(){if(this.pending||this.disposed)return;this.pending=true;this.frameID=requestAnimationFrame(now=>{this.pending=false;const dt=Math.min(.045,(now-(this.lastTime||now-16))/1000);this.lastTime=now;const moving=this.onUpdate?.(dt)||false;const alpha=1-Math.exp(-dt*10);let camMoving=false;
  if(this.autoRotate)this.desired.yaw+=dt*.2;
  for(const k of ['yaw','pitch','distance']){if(Math.abs(this.camera[k]-this.desired[k])>.0001)camMoving=true;this.camera[k]=mix(this.camera[k],this.desired[k],alpha);}
  this.camera.target=this.camera.target.map((v,i)=>{if(Math.abs(v-this.desired.target[i])>.0001)camMoving=true;return mix(v,this.desired.target[i],alpha);});
  this.render();this.onRender?.();if(moving||camMoving||this.autoRotate)this.request();
 });}
 matrices(){const {yaw,pitch,distance,target}=this.camera;this.eye=add(target,[Math.sin(yaw)*Math.cos(pitch)*distance,Math.sin(pitch)*distance,Math.cos(yaw)*Math.cos(pitch)*distance]);this.vp=multiply(perspective(.64,this.width/this.height),lookAt(this.eye,target));}
 draw(mesh,matrix,selected=false){const gl=this.gl,u=this.uniforms,mat=mesh.material;let color=mat.color;if(mat.finish){color=({silver:{metal:'#c4c8cc',glass:'#e2e5e7'},orange:{metal:'#bc764e',glass:'#d9a17b'},blue:{metal:'#425671',glass:'#627991'}})[this.finish][mat.finish];}
  gl.uniformMatrix4fv(u.Model,false,matrix);gl.uniform3fv(u.Color,rgb(color));gl.uniform1f(u.Metal,mat.metal);gl.uniform1f(u.Rough,mat.rough);gl.uniform1f(u.Selected,selected?1:0);gl.uniform1i(u.Textured,mat.texture?1:0);if(mat.texture){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.textures.get(mat.texture));gl.uniform1i(u.Texture,0);}gl.bindVertexArray(mesh.vao);gl.drawArrays(gl.TRIANGLES,0,mesh.vertices.length/8);
 }
 render(){this.matrices();if(this.software){this.renderSoftware();return;}const gl=this.gl;gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);gl.uniformMatrix4fv(this.uniforms.VP,false,this.vp);gl.uniform3fv(this.uniforms.Eye,this.eye);
  if(this.showStage!==false)for(const m of this.stage)this.draw(m,modelMatrix());
  for(const p of this.parts)if(p.visible)for(const m of p.meshes)this.draw(m,p.matrix,this.selected===p.id);gl.bindVertexArray(null);
 }
 screen(point){return project(point,this.vp,this.width,this.height);}
 pick(x,y){this.matrices();const f=normalize(sub(this.camera.target,this.eye)),right=normalize(cross(f,[0,1,0])),up=cross(right,f),tan=Math.tan(.32),d=normalize(add(add(f,scale(right,(2*x/this.width-1)*tan*this.width/this.height)),scale(up,(1-2*y/this.height)*tan)));
  let best=Infinity,result=null;for(const p of this.parts){if(!p.visible)continue;const inv=inverseRigid(p.matrix),o=transform(inv,this.eye).slice(0,3),dir=normalize(transform(inv,d,0).slice(0,3));if(!rayBox(o,dir,p.bounds.min,p.bounds.max))continue;
   for(const mesh of p.meshes){const v=mesh.vertices;for(let i=0;i<v.length;i+=24){const t=rayTriangle(o,dir,[v[i],v[i+1],v[i+2]],[v[i+8],v[i+9],v[i+10]],[v[i+16],v[i+17],v[i+18]])*p.currentScale;if(t<best){best=t;result=p.id;}}}
  }return result;
 }
 async snapshot(){this.render();const c=document.createElement('canvas');c.width=this.canvas.width;c.height=this.canvas.height;const ctx=c.getContext('2d');ctx.fillStyle='#f4f1eb';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(this.canvas,0,0);ctx.fillStyle='#62615c';ctx.font=`${Math.max(12,c.width/90)}px sans-serif`;ctx.fillText('ASTRA / iPhone 17 Pro — illustrative reconstruction, not Apple CAD',24,c.height-24);return new Promise(resolve=>c.toBlob(resolve,'image/png'));}
 renderSoftware(){
  // A depth-buffered CPU renderer for browsers without WebGL 2. Same model,
  // camera and picking; perspective-correct texture coordinates, no fake image.
  const ctx=this.context,w=this.canvas.width,h=this.canvas.height;
  if(!this.cpuFrame||this.cpuFrame.width!==w||this.cpuFrame.height!==h){this.cpuFrame=ctx.createImageData(w,h);this.cpuDepth=new Float32Array(w*h);}
  const pixels=this.cpuFrame.data,depth=this.cpuDepth;pixels.fill(0);depth.fill(Infinity);
  const light=normalize([-.65,1,.8]),light2=normalize([.9,.5,-.75]);
  this.cpuTextures??=new Map();for(const [name,image] of this.textures)if(!this.cpuTextures.has(name))this.cpuTextures.set(name,{width:image.width,height:image.height,data:image.getContext('2d').getImageData(0,0,image.width,image.height).data});
  const collect=(meshes,matrix,selected)=>{const mvp=multiply(this.vp,matrix);for(const mesh of meshes){const mat=mesh.material;let col=mat.color;if(mat.finish)col=({silver:{metal:'#c4c8cc',glass:'#e2e5e7'},orange:{metal:'#bc764e',glass:'#d9a17b'},blue:{metal:'#425671',glass:'#627991'}})[this.finish][mat.finish];const color=rgb(col),v=mesh.vertices,texture=this.cpuTextures.get(mat.texture);
   for(let i=0;i<v.length;i+=24){const pts=[];let valid=true;for(let j=0;j<3;j++){const k=i+j*8,p=transform(mvp,[v[k],v[k+1],v[k+2]]);if(p[3]<.1){valid=false;break;}const q=1/p[3];pts.push([(p[0]*q*.5+.5)*w,(.5-p[1]*q*.5)*h,p[2]*q,q,v[k+6]*q,v[k+7]*q]);}if(!valid)continue;
    const [a,b,c]=pts,area=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(Math.abs(area)<.02)continue;
    const x0=Math.max(0,Math.ceil(Math.min(a[0],b[0],c[0])-.5)),x1=Math.min(w-1,Math.floor(Math.max(a[0],b[0],c[0])-.5)),y0=Math.max(0,Math.ceil(Math.min(a[1],b[1],c[1])-.5)),y1=Math.min(h-1,Math.floor(Math.max(a[1],b[1],c[1])-.5));if(x1<x0||y1<y0)continue;
    let n=normalize(transform(matrix,[v[i+3],v[i+4],v[i+5]],0).slice(0,3));if(area>0)n=scale(n,-1);
    const pos=transform(matrix,[v[i],v[i+1],v[i+2]]).slice(0,3),view=normalize(sub(this.eye,pos)),half=normalize(add(light,view)),half2=normalize(add(light2,view));
    const diffuse=.43+.5*Math.max(dot(n,light),0)+.28*Math.max(dot(n,light2),0),spec=Math.pow(Math.max(dot(n,half),0),mix(12,100,1-mat.rough))*.28+Math.pow(Math.max(dot(n,half2),0),mix(8,55,1-mat.rough))*.18,rim=Math.pow(1-Math.max(dot(n,view),0),4)*.055;
    const base=color.map((z,k)=>clamp(z*diffuse+spec+rim+(selected?[.14,.04,0][k]:0),0,1)*255);
    const inv=1/area,ax=(b[1]-c[1])*inv,ay=(c[0]-b[0])*inv,bx=(c[1]-a[1])*inv,by=(a[0]-c[0])*inv;
    for(let y=y0;y<=y1;y++){let wa=((b[0]-(x0+.5))*(c[1]-(y+.5))-(c[0]-(x0+.5))*(b[1]-(y+.5)))*inv,wb=((c[0]-(x0+.5))*(a[1]-(y+.5))-(a[0]-(x0+.5))*(c[1]-(y+.5)))*inv;for(let x=x0;x<=x1;x++,wa+=ax,wb+=bx){const wc=1-wa-wb;if(wa<-.00001||wb<-.00001||wc<-.00001)continue;
      const z=wa*a[2]+wb*b[2]+wc*c[2],pi=y*w+x;if(z>depth[pi]+1e-7||z<-1||z>1)continue;let red=base[0],green=base[1],blue=base[2],alpha=1;
      if(texture){const q=wa*a[3]+wb*b[3]+wc*c[3],u=(wa*a[4]+wb*b[4]+wc*c[4])/q,vv=(wa*a[5]+wb*b[5]+wc*c[5])/q,tx=clamp(Math.floor(u*texture.width),0,texture.width-1),ty=clamp(Math.floor((1-vv)*texture.height),0,texture.height-1),ti=(ty*texture.width+tx)*4,data=texture.data;alpha=data[ti+3]/255;if(alpha<.02)continue;red*=data[ti]/255;green*=data[ti+1]/255;blue*=data[ti+2]/255;}
      const k=pi*4,previous=pixels[k+3]/255,total=alpha+previous*(1-alpha);pixels[k]=(red*alpha+pixels[k]*previous*(1-alpha))/total;pixels[k+1]=(green*alpha+pixels[k+1]*previous*(1-alpha))/total;pixels[k+2]=(blue*alpha+pixels[k+2]*previous*(1-alpha))/total;pixels[k+3]=total*255;depth[pi]=z;
    }}
   }
  }};
  if(this.showStage!==false)collect(this.stage,modelMatrix(),false);for(const p of this.parts)if(p.visible)collect(p.meshes,p.matrix,this.selected===p.id);
  ctx.putImageData(this.cpuFrame,0,0);
 }
 dispose(){this.disposed=true;cancelAnimationFrame(this.frameID);this.observer.disconnect();this.abort.abort();if(this.software)return;const gl=this.gl;for(const m of this.allMeshes){gl.deleteBuffer(m.buffer);gl.deleteVertexArray(m.vao);}for(const t of this.textures.values())gl.deleteTexture(t);gl.deleteProgram(this.program);}
}

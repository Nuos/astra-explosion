import { PARTS } from './catalog.js';
import { modelMatrix, transform, normalize, sub, cross } from './math.js';

const palette={silver:'#c4c8cb',dark:'#242a30',black:'#10151b',board:'#284745',gold:'#b69b56',copper:'#be7950',glass:'#12263c',seal:'#444c52'};
const material=(color,metal=.35,rough=.4,texture='')=>({color:palette[color]||color,metal,rough,texture});
const aluminum=()=>({...material('silver',.8,.3),finish:'metal'});
const glassBack=()=>({...material('#e3e6e8',.23,.24),finish:'glass'});
function vertex(p,n,uv=[0,0]){return [...p,...n,...uv];}
function triangle(out,a,b,c,n,uvs){if(Math.hypot(...cross(sub(b,a),sub(c,a)))<1e-12)return;out.push(...vertex(a,n,uvs?.[0]),...vertex(b,n,uvs?.[1]),...vertex(c,n,uvs?.[2]));}
function quad(out,a,b,c,d,n,uvs){triangle(out,a,b,c,n,uvs&&[uvs[0],uvs[1],uvs[2]]);triangle(out,a,c,d,n,uvs&&[uvs[0],uvs[2],uvs[3]]);}
function outline(w,h,r,segments=9){r=Math.min(r,w/2,h/2);const points=[];for(let k=0;k<4;k++){const cx=(k===0||k===3?1:-1)*(w/2-r),cy=(k<2?1:-1)*(h/2-r);for(let j=0;j<=segments;j++){const a=(k*90+j*90/segments)*Math.PI/180;points.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}}return points;}
export function rounded(w,h,d,r=.1,wall=0){const a=outline(w,h,r),b=wall?outline(w-2*wall,h-2*wall,Math.max(.01,r-wall)):null,out=[];for(let i=0;i<a.length;i++){const j=(i+1)%a.length,A=a[i],B=a[j],n=normalize([B[1]-A[1],A[0]-B[0],0]),af=[...A,d/2],bf=[...B,d/2],ab=[...A,-d/2],bb=[...B,-d/2];quad(out,af,ab,bb,bf,n);if(b){const C=b[i],D=b[j],cf=[...C,d/2],df=[...D,d/2],cb=[...C,-d/2],db=[...D,-d/2];quad(out,cf,df,db,cb,n.map(v=>-v));quad(out,af,bf,df,cf,[0,0,1]);quad(out,ab,cb,db,bb,[0,0,-1]);}else{triangle(out,[0,0,d/2],af,bf,[0,0,1],[[.5,.5],[A[0]/w+.5,A[1]/h+.5],[B[0]/w+.5,B[1]/h+.5]]);triangle(out,[0,0,-d/2],bb,ab,[0,0,-1]);}}return out;}
export function cylinder(radius,depth,segments=40){const out=[];for(let i=0;i<segments;i++){const a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments,A=[Math.cos(a)*radius,Math.sin(a)*radius],B=[Math.cos(b)*radius,Math.sin(b)*radius];quad(out,[...A,depth/2],[...A,-depth/2],[...B,-depth/2],[...B,depth/2],normalize([...A,0]));triangle(out,[0,0,depth/2],[...A,depth/2],[...B,depth/2],[0,0,1]);triangle(out,[0,0,-depth/2],[...B,-depth/2],[...A,-depth/2],[0,0,-1]);}return out;}
function torus(radius,tube,segments=56,sides=7){const out=[];function point(a,b){return [(radius+tube*Math.cos(b))*Math.cos(a),(radius+tube*Math.cos(b))*Math.sin(a),tube*Math.sin(b)];}for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=i*2*Math.PI/segments,b=j*2*Math.PI/sides,c=(i+1)*2*Math.PI/segments,d=(j+1)*2*Math.PI/sides,A=point(a,b),B=point(c,b),C=point(c,d),D=point(a,d);quad(out,A,B,C,D,normalize(cross(sub(B,A),sub(D,A))));}return out;}
function plane(w,h){const out=[];quad(out,[-w/2,-h/2,0],[w/2,-h/2,0],[w/2,h/2,0],[-w/2,h/2,0],[0,0,1],[[0,0],[1,0],[1,1],[0,1]]);return out;}
function builder(){const meshes=[];function put(v,mat,p=[0,0,0],r=[0,0,0]){const m=modelMatrix(p,r);for(let i=0;i<v.length;i+=8){const a=transform(m,v.slice(i,i+3)),n=normalize(transform(m,v.slice(i+3,i+6),0).slice(0,3));v.splice(i,6,...a.slice(0,3),...n);}meshes.push({vertices:v,material:mat});}
 const box=(w,h,d,p,mat=material('dark'),r=.08)=>put(rounded(w,h,d,r),mat,p);
 const ring=(w,h,d,wall,p,mat=material('seal'),r=.35)=>put(rounded(w,h,d,r,wall),mat,p);
 const disk=(rad,d,p,mat=material('black'))=>put(cylinder(rad,d),mat,p);
 const loop=(rad,t,p,mat=material('silver',.8,.22))=>put(torus(rad,t),mat,p);
 const label=(w,h,p,texture,rotation=[0,0,0])=>put(plane(w,h),material('#ffffff',0,.5,texture),p,rotation);
 return {meshes,put,box,ring,disk,loop,label};}
function assemble(id){const b=builder(),{box,ring,disk,loop,label,put}=b;
 switch(id){
 case 'enclosure':{
  ring(3.595,7.5,.4375,.075,[0,0,0],aluminum(),.43);
  box(3.45,2.16,.18,[0,2.59,-.22],aluminum(),.37);
  ring(3.44,5.03,.085,.15,[0,-.96,-.171],aluminum(),.38);
  for(const [x,y,h] of [[-1.814,2.5,.32],[-1.814,1.72,.6],[-1.814,.94,.6],[1.814,1.58,.79],[1.814,-1.02,.92]])box(.05,h,.13,[x,y,0],aluminum(),.024);
  for(const x of [-1.804,1.804])for(const y of [-2.75,2.9])box(.012,.065,.35,[x,y,0],material('#ede9e2',0,.7),.004);
  disk(.17,.045,[-1.08,3.09,-.343],material('#f5f0ce',.12,.22));
  disk(.195,.04,[-1.08,2.04,-.343],material('black',.3,.14));disk(.11,.043,[-1.08,2.04,-.354],material('#263643',.4,.13));
  for(let i=0;i<5;i++)for(const sign of [-1,1]){put(cylinder(.032,.014,12),material('black'),[sign*(.51+i*.14),-3.753,.015],[Math.PI/2,0,0]);}
  break;}
 case 'display':
  box(3.48,7.39,.09,[0,0,0],material('black',.3,.19),.405);
  // The OLED is an independent front-facing cap, avoiding texture repetition on edges.
  put(rounded(3.32,7.2,.005,.35),material('#ffffff',0,.6,'screen'),[0,0,.048]);
  box(.92,.225,.009,[0,3.21,.057],material('black',.1,.12),.11);
  disk(.055,.012,[.32,3.21,.065],material('#0a1726',.7,.08));
  box(.68,.033,.008,[0,-3.37,.058],material('#ede7df',0,.8),.016);break;
 case 'display-seal':ring(3.45,7.32,.018,.045,[0,0,0],material('seal'),.38);break;
 case 'back-seal':ring(3.22,4.87,.013,.045,[0,0,0],material('seal'),.29);break;
 case 'back-glass':
  box(3.25,4.91,.045,[0,0,0],glassBack(),.32);
  label(.61,.73,[0,.35,-.026],'apple',[0,Math.PI,0]);break;
 case 'battery':
  box(3.03,4.04,.16,[0,0,0],material('silver',.65,.48),.23);
  box(2.9,3.9,.12,[0,0,.035],material('#292e33',.22,.6),.19);
  label(2.6,3.58,[0,0,.101],'battery');
  box(.31,.38,.015,[-.72,2.04,.05],material('black'));box(.25,.09,.035,[-.72,2.18,.08],material('gold'));
  for(const y of [-1.8,-.8,.8,1.8])for(const x of [-1.48,1.48])disk(.04,.018,[x,y,.095],material('silver',.9,.25));break;
 case 'camera':
  box(1.94,1.93,.16,[0,0,.08],material('#6e7478',.8,.38),.12);
  for(const [x,y] of [[.51,.51],[.51,-.51],[-.51,0]]){
   box(.92,.93,.25,[x,y,.11],material('dark',.55,.34),.12);
   disk(.446,.16,[x,y,-.255],aluminum());disk(.4,.065,[x,y,-.353],material('#151b25',.65,.2));
   loop(.372,.018,[x,y,-.393],material('#758598',.85,.18));disk(.334,.029,[x,y,-.39],material('#0e1f30',.75,.08));
   loop(.249,.013,[x,y,-.41],material('#42616e',.65,.11));disk(.232,.015,[x,y,-.411],material('#16223e',.7,.09));
   disk(.124,.012,[x,y,-.423],material('#080f1c',.3,.1));disk(.053,.004,[x-.09,y+.15,-.431],material('#afc4d2',.45,.12));
  }break;
 case 'front-camera':
  box(1.18,.39,.19,[0,0,0],material('dark'),.09);
  for(const [x,r] of [[-.4,.125],[.05,.089],[.42,.13]]){disk(r,.05,[x,0,.115],material('silver',.8,.3));disk(r*.73,.027,[x,0,.15],material('glass',.75,.08));}break;
 case 'logic-board':
  box(2.58,.94,.083,[0,0,0],material('board',.4,.45),.1);box(.36,.48,.083,[-1.1,-.61,0],material('board'),.09);
  box(.76,.71,.1,[-.34,0,.078],material('#4b535c',.8,.26),.025);label(.72,.68,[-.34,0,.131],'chip');
  box(.78,.46,.075,[.65,.1,.075],material('#aeb4ba',.86,.25),.025);box(.37,.5,.065,[-.97,.02,.075],material('black'),.02);
  for(let i=0;i<20;i++){const x=-1.17+i*.121;box(.06,.06,.045,[x,-.39,.054],material(i%3?'gold':'black'),.009);}
  for(let i=0;i<9;i++){box(.085,.08,.033,[.36+i*.1,-.22,.06],material('black'),.009);box(.068,.04,.025,[-1.06+i*.115,.41,.056],material('gold'),.006);}
  for(const x of [-1.2,1.2])disk(.045,.015,[x,.32,.055],material('silver',.8,.25));break;
 case 'taptic':box(1.08,.44,.2,[0,0,0],material('silver',.8,.25),.07);box(.94,.31,.021,[0,0,.112],material('dark'),.04);label(.85,.25,[0,0,.126],'taptic');break;
 case 'top-speaker':box(.73,.83,.23,[0,0,0],material('black'),.18);box(.43,.34,.028,[0,-.09,.129],material('silver',.7,.28),.11);break;
 case 'speaker-grille':box(1.1,.08,.024,[0,0,0],material('silver',.8,.24),.025);for(let i=0;i<20;i++)disk(.014,.01,[-.49+i*.051,0,.018],material('black'));break;
 case 'bottom-speaker':box(1.15,.59,.19,[0,0,0],material('black'),.14);box(.46,.55,.17,[-.38,.15,0],material('black'),.12);box(.4,.29,.018,[-.35,.11,.104],material('silver',.7,.3),.07);break;
 case 'microphone':box(.56,.18,.062,[0,0,0],material('board'),.04);disk(.078,.07,[.08,0,.041],material('silver',.8,.24));disk(.025,.015,[.08,0,.083],material('black'));break;
 case 'usb-c':
  box(.49,.20,.27,[0,0,0],material('silver',.86,.19),.074);box(.385,.124,.02,[0,0,.146],material('black'),.05);
  box(1.96,.14,.018,[0,.19,-.015],material('#5b483b'),.04);box(.13,2.26,.018,[-1.05,1.23,-.015],material('#6d4e32'),.03);
  box(.25,.17,.04,[-1.05,2.4,.01],material('gold'),.025);for(let i=0;i<10;i++)box(.021,.042,.008,[-.148+i*.033,0,.161],material('gold'),.003);break;
 case 'vapor':
  box(2.52,2.54,.03,[0,0,0],material('copper',.8,.34),.23);box(.9,1.25,.028,[.55,-1.36,0],material('copper',.8,.34),.13);
  for(let i=0;i<7;i++)box(1.85,.018,.006,[0,-.95+i*.31,.018],material('#d69b65',.65,.45),.008);break;
 case 'magsafe':
  disk(1.23,.018,[0,0,0],material('#282f34',.4,.55));
  for(let i=0;i<10;i++)loop(.61+i*.041,.013,[0,0,-.02],material('#b78654',.85,.25));
  for(let i=0;i<18;i++){const a=i*Math.PI*2/18;put(rounded(.23,.17,.043,.025),material('silver',.75,.31),[1.16*Math.cos(a),1.16*Math.sin(a),-.022],[0,0,a+Math.PI/2]);}
  box(.16,.46,.031,[0,-1.47,0],material('silver',.75,.3),.025);break;
 case 'fasteners':
  for(const x of [-1.57,1.57])for(const y of [-3.18,-1.93,-.55,.71,2.1,3.19]){disk(.042,.075,[x,y,0],material('silver',.85,.25));disk(.062,.018,[x,y,.047],material('silver',.8,.22));box(.062,.013,.005,[x,y,.06],material('black'),.002);box(.013,.062,.005,[x,y,.061],material('black'),.002);}break;
 default:{
  const size={'display-cowling':[.47,.16],'battery-cowling':[.34,.23],'camera-cowling':[.63,.24],'front-cowling':[.5,.16],'logic-cowling':[.22,.47],'back-cowling':[.31,.18]}[id];
  if(!size)throw new Error(`Unmodeled assembly: ${id}`);
  box(size[0],size[1],.03,[0,0,0],material('silver',.82,.3),.035);
  for(const x of [-size[0]*.35,size[0]*.35]){disk(.025,.006,[x,0,.019],material('black'));}break;
 }}return b.meshes;}
/** Merge same-material submeshes per assembly to reduce draw calls. */
function mergeMeshes(meshes){const map=new Map();for(const m of meshes){const key=JSON.stringify(m.material);if(!map.has(key))map.set(key,{vertices:[],material:m.material});const out=map.get(key).vertices;for(const x of m.vertices)out.push(x);}return [...map.values()].map(m=>({...m,vertices:new Float32Array(m.vertices)}));}
export function buildModel(){return PARTS.map(p=>{const meshes=mergeMeshes(assemble(p.id));const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const m of meshes)for(let i=0;i<m.vertices.length;i+=8)for(let a=0;a<3;a++){min[a]=Math.min(min[a],m.vertices[i+a]);max[a]=Math.max(max[a],m.vertices[i+a]);}return {...p,meshes,bounds:{min,max},center:min.map((v,i)=>(v+max[i])/2)};});}
export function buildStage(){const b=builder();b.put(cylinder(5.5,.17,120),material('#e7e3dd',.23,.6),[0,-.08,0],[Math.PI/2,0,0]);b.put(cylinder(5.43,.025,120),material('#f0ede7',.12,.72),[0,.016,0],[Math.PI/2,0,0]);for(const r of [4.9,5.32])b.put(torus(r,.009,120,4),material('#cbc5bb',.35,.5),[0,.035,0],[Math.PI/2,0,0]);b.put(plane(22,22),material('#ffffff',0,1,'shadow'),[0,-.19,0],[-Math.PI/2,0,0]);return mergeMeshes(b.meshes);}

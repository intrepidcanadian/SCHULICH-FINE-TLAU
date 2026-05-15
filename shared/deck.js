/* =============== WebGL 双背景 ===============
   深色页：Holographic Dispersion（全息色散 · 钛金暗流）—— 彩虹微扰、鼠标径向涟漪
   浅色页：Spiral Vortex（旋转涡流 · 银色珍珠）—— domain-warp 流动、无中心
   修改风格请参考 references/webgl-backgrounds.md
*/
const VS = `attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}`;

const FS_DARK = `precision highp float;
uniform vec2 u_resolution;uniform float u_time;uniform vec2 u_mouse;
vec3 palette(float t,vec3 a,vec3 b,vec3 c,vec3 d){return a+b*cos(6.28318*(c*t+d));}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution.xy;
  vec2 p=uv*2.0-1.0;p.x*=u_resolution.x/u_resolution.y;
  vec2 m=u_mouse*2.0-1.0;m.x*=u_resolution.x/u_resolution.y;
  float md=length(p-m);
  float mr=sin(md*15.0-u_time*4.0)*exp(-md*3.0);p+=mr*0.08;
  vec2 p0=p;
  for(float i=1.0;i<4.0;i++){
    p.x+=0.1/i*sin(i*3.0*p.y+u_time*0.4)+0.05;
    p.y+=0.1/i*cos(i*2.0*p.x+u_time*0.3)-0.05;
  }
  float r=length(p);float ang=atan(p.y,p.x);
  vec3 a=vec3(0.12,0.12,0.13);
  vec3 b=vec3(0.03,0.04,0.05);
  vec3 c=vec3(1.0,1.0,1.0);
  vec3 d=vec3(0.1,0.2,0.4);
  vec3 col=palette(r*1.5+p0.x*0.5+u_time*0.1,a,b,c,d);
  float disp=sin(r*25.0-u_time*1.5+ang*2.0)*0.5+0.5;
  col+=vec3(disp*0.015,disp*0.01,disp*0.02);
  float hi=pow(sin(p.x*4.0+p.y*3.0+u_time)*0.5+0.5,8.0);
  col+=hi*0.08;
  vec3 base=vec3(0.05,0.05,0.06);
  col=mix(base,col,0.85);
  gl_FragColor=vec4(col,1.0);
}`;

const FS_LIGHT = `precision highp float;
uniform vec2 u_resolution;uniform float u_time;uniform vec2 u_mouse;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  float a=hash(i),b=hash(i+vec2(1,0));
  float c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v=0.0,a=0.5;
  mat2 m=mat2(0.80,0.60,-0.60,0.80);
  for(int i=0;i<5;i++){v+=a*noise(p);p=m*p*2.02;a*=0.5;}
  return v;
}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution.xy;
  vec2 p=uv;p.x*=u_resolution.x/u_resolution.y;
  vec2 m=u_mouse;m.x*=u_resolution.x/u_resolution.y;
  vec2 md=p-m;float dl=length(md);
  p+=normalize(md+vec2(0.0001))*exp(-dl*5.0)*0.03;
  vec2 q=vec2(fbm(p*1.8+u_time*0.07),fbm(p*1.8+vec2(5.2,1.3)+u_time*0.06));
  vec2 r=vec2(fbm(p*2.0+q*1.3+vec2(1.7,9.2)+u_time*0.05),
              fbm(p*2.0+q*1.3+vec2(8.3,2.8)+u_time*0.04));
  float f=fbm(p*2.2+r*1.5);
  vec3 silverDark=vec3(0.86,0.85,0.84);
  vec3 paper=vec3(0.955,0.945,0.925);
  vec3 col=mix(silverDark,paper,f);
  float ph=r.x*2.2+u_time*0.35;
  col+=vec3(0.78,0.62,0.92)*sin(ph)*0.055;
  col+=vec3(0.55,0.72,0.95)*sin(ph*0.8+2.0)*0.05;
  float hl=smoothstep(0.48,0.92,f);
  col+=hl*0.06;
  gl_FragColor=vec4(col,1.0);
}`;

const mouse={x:0.5,y:0.5};
addEventListener('mousemove',e=>{mouse.x=e.clientX/innerWidth;mouse.y=e.clientY/innerHeight});

function bootGL(canvasId, fsSrc){
  const canvas=document.getElementById(canvasId);
  const gl=canvas.getContext('webgl',{alpha:false,antialias:true});
  if(!gl) return ()=>false;
  const mk=(t,s)=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh};
  const prog=gl.createProgram();
  gl.attachShader(prog,mk(gl.VERTEX_SHADER,VS));
  gl.attachShader(prog,mk(gl.FRAGMENT_SHADER,fsSrc));
  gl.linkProgram(prog);gl.useProgram(prog);
  const buf=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(prog,'position');
  gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const lRes=gl.getUniformLocation(prog,'u_resolution');
  const lT=gl.getUniformLocation(prog,'u_time');
  const lM=gl.getUniformLocation(prog,'u_mouse');
  const resize=()=>{
    const d=Math.min(window.devicePixelRatio||1,2);
    canvas.width=innerWidth*d;canvas.height=innerHeight*d;
    gl.viewport(0,0,canvas.width,canvas.height);
  };
  addEventListener('resize',resize);resize();
  return (tSec)=>{
    gl.uniform2f(lRes,canvas.width,canvas.height);
    gl.uniform1f(lT,tSec);
    gl.uniform2f(lM,mouse.x,1-mouse.y);
    gl.drawArrays(gl.TRIANGLES,0,6);
    return true;
  };
}
const drawDark=bootGL('bg-dark',FS_DARK);
const drawLight=bootGL('bg-light',FS_LIGHT);
const t0=Date.now();
(function loop(){
  const t=(Date.now()-t0)/1000;
  drawDark(t);drawLight(t);
  requestAnimationFrame(loop);
})();

// =============== 导航（翻页 / 圆点 / 键盘 / 滚轮 / 触屏） ===============
const deck=document.getElementById('deck');
const slides=deck.querySelectorAll('.slide');
const nav=document.getElementById('nav');
let idx=0,total=slides.length,lock=false;

// =============== Back-to-landing link ===============
// Sits fixed in the top-left. Relative href so it works both at
// /chN/ (one level deep) and /chN/appendix/ (two levels deep).
(function injectBackLink(){
  // Count path depth: '/ch1/' -> 1, '/ch1/appendix/' -> 2, etc.
  const segs=location.pathname.replace(/\/[^/]*$/,'/').split('/').filter(Boolean);
  const href=('../'.repeat(segs.length))||'./';
  const a=document.createElement('a');
  a.id='back-home';a.href=href;a.setAttribute('aria-label','Back to course landing');
  a.innerHTML='← Home';
  a.style.cssText='position:fixed;top:1.6vh;left:1.6vw;z-index:30;'+
    'font-family:var(--mono,"IBM Plex Mono",monospace);font-size:max(10px,.72vw);'+
    'letter-spacing:.18em;text-transform:uppercase;color:currentColor;opacity:.7;'+
    'text-decoration:none;padding:.55vh .95vw;border:1px solid currentColor;'+
    'border-radius:3px;background:rgba(127,127,127,.12);'+
    'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);'+
    'transition:opacity .25s ease, background .25s ease';
  a.onmouseenter=()=>{a.style.opacity='1';a.style.background='rgba(127,127,127,.22)';};
  a.onmouseleave=()=>{a.style.opacity='.7';a.style.background='rgba(127,127,127,.12)';};
  document.body.appendChild(a);
})();

// 关键：矫正 deck 宽度为 total * 100vw，否则翻页会错位
deck.style.width=(total*100)+'vw';

slides.forEach((s,i)=>{
  const b=document.createElement('button');
  b.className='dot';b.dataset.i=i;b.setAttribute('aria-label','Page '+(i+1));
  b.onclick=()=>go(i);
  nav.appendChild(b);
});

function go(n){
  if(lock)return;
  /* Hide the keyboard-hint chip after the first navigation. */
  document.body.classList.add('deck-touched');
  idx=Math.max(0,Math.min(total-1,n));
  deck.style.transform=`translateX(${-idx*100}vw)`;
  /* load-bearing: .slide.active is read by Open Design's host bridge
     (src/runtime/srcdoc.ts findActiveByClass) to drive the slide counter.
     No CSS targets it — do not remove. */
  slides.forEach((s,i)=>s.classList.toggle('active',i===idx));
  nav.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
  /* 主题切换：优先读 data-theme，其次从 class（light/dark）推断 */
  const el=slides[idx];
  const th=el.dataset.theme || (el.classList.contains('light')?'light':(el.classList.contains('dark')?'dark':'dark'));
  document.body.classList.toggle('light-bg',th==='light');
  /* HyperFrames embed: play the active slide's intro video, reset others.
     A slide opts in by including <video class="hf-bg" data-hf …>; the MP4
     is authored as a paused-GSAP HyperFrames composition under hf/<id>/
     and rendered via `npx hyperframes render`. Missing MP4 fails silently. */
  slides.forEach((s,i)=>{
    const v=s.querySelector('video[data-hf]');
    if(!v)return;
    if(i===idx){try{v.currentTime=0;v.play().catch(()=>{});}catch(e){}}
    else{try{v.pause();v.currentTime=0;}catch(e){}}
  });
  lock=true;setTimeout(()=>lock=false,700);
}

/* =============== ESC 索引视图 =============== */
let overviewOn=false;
const ov=document.createElement('div');
ov.id='overview';
ov.style.cssText='position:fixed;inset:0;z-index:100;background:rgba(var(--ink-rgb),.92);backdrop-filter:blur(12px);display:none;overflow-y:auto;padding:4vh 4vw';
document.body.appendChild(ov);

function buildOverview(){
  ov.innerHTML='';
  const grid=document.createElement('div');
  grid.style.cssText='display:grid;grid-template-columns:repeat(4,1fr);gap:2vh 1.6vw;max-width:90vw;margin:0 auto';
  slides.forEach((s,i)=>{
    const card=document.createElement('div');
    card.style.cssText='cursor:pointer;border-radius:6px;overflow:hidden;border:2px solid '+(i===idx?'rgba(var(--paper-rgb),.8)':'rgba(var(--paper-rgb),.15)')+';transition:border-color .2s';
    card.onmouseenter=()=>card.style.borderColor='rgba(var(--paper-rgb),.6)';
    card.onmouseleave=()=>card.style.borderColor=i===idx?'rgba(var(--paper-rgb),.8)':'rgba(var(--paper-rgb),.15)';
    const wrap=document.createElement('div');
    wrap.style.cssText='width:100%;aspect-ratio:16/9;overflow:hidden;position:relative;pointer-events:none;background:'+(s.classList.contains('light')?'var(--paper)':'var(--ink)');
    const clone=s.cloneNode(true);
    clone.style.cssText='width:100vw;height:100vh;transform:scale('+(1/4.5)+');transform-origin:top left;position:absolute;top:0;left:0;pointer-events:none';
    wrap.appendChild(clone);
    const label=document.createElement('div');
    label.style.cssText='padding:6px 10px;font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--paper);opacity:.7';
    label.textContent=(i+1)+' / '+total;
    card.appendChild(wrap);
    card.appendChild(label);
    card.onclick=()=>{toggleOverview();go(i)};
    grid.appendChild(card);
  });
  ov.appendChild(grid);
}

function toggleOverview(){
  overviewOn=!overviewOn;
  if(overviewOn){buildOverview();ov.style.display='block';}
  else{ov.style.display='none';}
}

addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();toggleOverview();return;}
  if(overviewOn)return;
  if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '||e.key==='ArrowDown')go(idx+1);
  if(e.key==='ArrowLeft'||e.key==='PageUp'||e.key==='ArrowUp')go(idx-1);
  if(e.key==='Home')go(0);
  if(e.key==='End')go(total-1);
});

let wheelTO=null,wheelAcc=0;
addEventListener('wheel',e=>{
  wheelAcc+=e.deltaY+e.deltaX;
  if(Math.abs(wheelAcc)>50){go(idx+(wheelAcc>0?1:-1));wheelAcc=0;}
  clearTimeout(wheelTO);wheelTO=setTimeout(()=>wheelAcc=0,150);
},{passive:true});

let tx=0,ty=0;
addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
addEventListener('touchend',e=>{
  const dx=(e.changedTouches[0].clientX-tx);
  const dy=(e.changedTouches[0].clientY-ty);
  if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))go(idx+(dx<0?1:-1));
},{passive:true});

go(0);

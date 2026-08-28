/* ============================================================
   TT RIVALS 1.0.1 — MOTION ENGINE P6
   Un único canvas / un único scheduler para todos los fondos animados.
   - Inicio / Jugar / Torneos: pelotas + estelas
   - Ranking: ondas de Elo + constelación competitiva
   - Admin: lluvia de código bidireccional
   - Calidad adaptativa, pausa por visibilidad y reduced-motion
   ============================================================ */

const MODES={home:'pong',play:'pong',tournaments:'pong',ranking:'ranking',admin:'matrix'};
const QUALITY_ORDER=['low','medium','high'];
const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
const saveData=connection?.saveData===true;
const weakCpu=Number(navigator.hardwareConcurrency||8)<=4;
const weakMemory=Number(navigator.deviceMemory||8)<=4;

function initialQuality(){
  if(reduceMotion||saveData)return 'low';
  if(weakCpu||weakMemory)return 'medium';
  return 'high';
}

let preference='auto';
let quality=initialQuality();
let qualityIndex=QUALITY_ORDER.indexOf(quality);
document.documentElement.dataset.ttFxPreference=preference;
document.documentElement.dataset.ttFxQuality=quality;
const canvas=document.createElement('canvas');
canvas.className='tt-motion-backdrop-p6';
canvas.id='ttMotionBackdropP6';
canvas.setAttribute('aria-hidden','true');
document.body.prepend(canvas);
const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});

let dpr=1,w=1,h=1,mode=null,visible=false,raf=0,lastTick=performance.now(),lastPaint=0;
let pongBalls=[],ripples=[],nodes=[],edges=[],matrixStreams=[],nextRippleAt=0,nextEdgeAt=0;
let perfWindowStart=performance.now(),perfFrames=0,perfLate=0,fps=0,lastDowngrade=0,lastUpgrade=0;

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rand=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const qValue=(low,medium,high)=>quality==='low'?low:quality==='medium'?medium:high;

function targetFps(){
  if(mode==='matrix')return qValue(15,20,24);
  if(mode==='ranking')return qValue(22,30,40);
  if(mode==='pong')return qValue(28,40,50);
  return 30;
}
function paintInterval(){return 1000/targetFps()}

function expose(){
  window.__TT_PERF_V101=window.__TT_PERF_V101||{};
  Object.assign(window.__TT_PERF_V101,{motion:{mode,quality,preference,fps:Math.round(fps),targetFps:targetFps(),canvasActive:visible?1:0,dpr:Number(dpr.toFixed(2)),reducedMotion:reduceMotion,saveData}});
}
function setQuality(next,reason='manual'){
  if(!QUALITY_ORDER.includes(next))return;
  const changed=next!==quality;
  quality=next;qualityIndex=QUALITY_ORDER.indexOf(next);
  document.documentElement.dataset.ttFxQuality=quality;
  if(changed)resetMode(mode,false);
  window.dispatchEvent(new CustomEvent('tt:motion-quality',{detail:{quality,preference,reason}}));
  expose();
}
function setPreference(next='auto'){
  if(!['auto','high','medium','low','off'].includes(next))next='auto';
  preference=next;
  document.documentElement.dataset.ttFxPreference=preference;
  if(preference==='auto')setQuality(initialQuality(),'preference-auto');
  else if(preference!=='off')setQuality(preference,'preference-manual');
  syncMode(true);
  expose();
}
function downgrade(reason='performance'){
  if(preference!=='auto')return;
  if(qualityIndex>0){qualityIndex--;setQuality(QUALITY_ORDER[qualityIndex],reason);lastDowngrade=performance.now()}
}
function upgrade(reason='performance'){
  if(preference!=='auto'||saveData||reduceMotion)return;
  if(qualityIndex<QUALITY_ORDER.length-1){qualityIndex++;setQuality(QUALITY_ORDER[qualityIndex],reason);lastUpgrade=performance.now()}
}
window.__TT_MOTION_V101={getDiagnostics:()=>window.__TT_PERF_V101?.motion||{},setQuality,setPreference,getPreference:()=>preference};

function resize(){
  dpr=Math.min(window.devicePixelRatio||1,qValue(1,1.2,1.45));
  w=Math.max(1,window.innerWidth);h=Math.max(1,window.innerHeight);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;
  ctx.setTransform(dpr,0,0,dpr,0,0);resetMode(mode,true);expose();
}
function currentMode(){
  const main=document.querySelector('#mainApp');
  if(!main||main.classList.contains('hidden'))return null;
  return MODES[document.body.dataset.activeTabV101||'profile']||null;
}
function syncMode(force=false){
  const next=preference==='off'?null:currentMode();
  const nextVisible=!!next;
  if(!force&&next===mode&&visible===nextVisible)return;
  mode=next;visible=nextVisible;
  document.body.classList.toggle('tt-motion-visible-p6',visible);
  canvas.style.display=visible?'block':'none';
  if(!visible&&raf){cancelAnimationFrame(raf);raf=0}
  resetMode(mode,false);lastTick=performance.now();lastPaint=0;expose();
  if(visible&&!document.hidden&&!raf)raf=requestAnimationFrame(loop);
}
function resetMode(next,fromResize=false){
  ctx.clearRect(0,0,w,h);
  if(next==='pong'&&(!fromResize||pongBalls.length===0))initPong();
  if(next==='ranking')initRanking();
  if(next==='matrix')initMatrix();
}

/* ---------------- INICIO / JUGAR / TORNEOS ---------------- */
const pongHues=[190,205,155,270,310,34];
function newBall(){
  const angle=rand(0,Math.PI*2),speed=rand(56,120);
  return {x:rand(20,Math.max(21,w-20)),y:rand(20,Math.max(21,h-20)),r:rand(3.5,6),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,hue:pick(pongHues)+rand(-7,7),kind:pick(['straight','curve','curve','drift']),turn:rand(-.34,.34),phase:rand(0,Math.PI*2),freq:rand(.7,1.55),nextNudge:rand(1.8,4.6),trail:[],maxTrail:qValue(14,24,34)};
}
function initPong(){
  const base=w<700?qValue(2,3,4):w<1200?qValue(3,4,5):qValue(4,5,7);
  pongBalls=Array.from({length:base},newBall);
}
function updatePong(dt,t){
  const margin=12;
  for(const b of pongBalls){
    if(b.kind==='curve'){
      const a=b.turn*dt,c=Math.cos(a),s=Math.sin(a),vx=b.vx*c-b.vy*s,vy=b.vx*s+b.vy*c;b.vx=vx;b.vy=vy;
    }else if(b.kind==='drift'){
      const speed=Math.hypot(b.vx,b.vy)||80,heading=Math.atan2(b.vy,b.vx)+Math.sin(t*.001*b.freq+b.phase)*.0014;b.vx=Math.cos(heading)*speed;b.vy=Math.sin(heading)*speed;
    }
    b.nextNudge-=dt;
    if(b.nextNudge<=0){
      const a=rand(-.5,.5),c=Math.cos(a),s=Math.sin(a),vx=b.vx*c-b.vy*s,vy=b.vx*s+b.vy*c;b.vx=vx;b.vy=vy;b.nextNudge=rand(2,5.5);if(Math.random()<.36)b.kind=pick(['straight','curve','drift']);
    }
    b.x+=b.vx*dt;b.y+=b.vy*dt;let bounced=false;
    if(b.x<margin){b.x=margin;b.vx=Math.abs(b.vx);bounced=true}if(b.x>w-margin){b.x=w-margin;b.vx=-Math.abs(b.vx);bounced=true}
    if(b.y<margin){b.y=margin;b.vy=Math.abs(b.vy);bounced=true}if(b.y>h-margin){b.y=h-margin;b.vy=-Math.abs(b.vy);bounced=true}
    if(bounced&&Math.random()<.68){const a=rand(-.28,.28),c=Math.cos(a),s=Math.sin(a),vx=b.vx*c-b.vy*s,vy=b.vx*s+b.vy*c;b.vx=vx;b.vy=vy}
    b.trail.push({x:b.x,y:b.y});if(b.trail.length>b.maxTrail)b.trail.shift();
  }
}
function drawPong(){
  ctx.clearRect(0,0,w,h);ctx.save();
  for(const b of pongBalls){
    const n=b.trail.length;
    if(n>1)for(let i=1;i<n;i++){const q=i/n;ctx.beginPath();ctx.moveTo(b.trail[i-1].x,b.trail[i-1].y);ctx.lineTo(b.trail[i].x,b.trail[i].y);ctx.strokeStyle=`hsla(${b.hue},96%,70%,${q*.32})`;ctx.lineWidth=.65+q*1.6;ctx.stroke()}
    ctx.fillStyle=`hsla(${b.hue},100%,72%,.13)`;ctx.beginPath();ctx.arc(b.x,b.y,b.r*3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(252,253,255,.94)';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`hsla(${b.hue},100%,70%,.85)`;ctx.lineWidth=1;ctx.stroke();
  }ctx.restore();
}

/* ---------------- RANKING / ONDAS + CONSTELACIÓN ---------------- */
function newNode(){return {x:rand(w*.03,w*.97),y:rand(h*.04,h*.96),vx:rand(-5,5),vy:rand(-4,4),r:rand(1.1,2.4),hue:rand(175,300),pulse:rand(0,Math.PI*2)}}
function initRanking(){
  const count=w<700?qValue(12,18,24):qValue(18,28,38);nodes=Array.from({length:count},newNode);ripples=[];edges=[];nextRippleAt=performance.now()+180;nextEdgeAt=performance.now()+120;
  if(reduceMotion){for(let i=0;i<3;i++)spawnRipple(true);rebuildEdges()}
}
function rebuildEdges(){
  edges=[];const max=qValue(8,14,22),maxDist=Math.min(260,w*.28);
  for(let attempts=0;attempts<nodes.length*4&&edges.length<max;attempts++){
    const a=Math.floor(Math.random()*nodes.length),b=Math.floor(Math.random()*nodes.length);if(a===b)continue;
    const A=nodes[a],B=nodes[b],d=Math.hypot(A.x-B.x,A.y-B.y);if(d<maxDist)edges.push({a,b,age:0,life:rand(1.2,2.7),hue:rand(175,310)})
  }
}
function spawnRipple(staticOnly=false,node=null){
  const origin=node||pick(nodes)||{x:rand(w*.05,w*.95),y:rand(h*.06,h*.94)};
  ripples.push({x:origin.x,y:origin.y,age:staticOnly?rand(.2,1.5):0,life:rand(3,4.8),speed:rand(62,110),hue:rand(0,360),rings:Math.floor(rand(2,4)),gap:rand(22,38),width:rand(.9,1.7)});
  const limit=qValue(4,7,10);if(ripples.length>limit)ripples.shift();
}
function updateRanking(dt,t){
  for(const n of nodes){n.x+=n.vx*dt;n.y+=n.vy*dt;n.pulse+=dt*1.3;if(n.x<0||n.x>w)n.vx*=-1;if(n.y<0||n.y>h)n.vy*=-1;n.x=clamp(n.x,0,w);n.y=clamp(n.y,0,h)}
  if(!reduceMotion&&t>=nextRippleAt){spawnRipple(false,pick(nodes));nextRippleAt=t+rand(qValue(1050,760,520),qValue(1650,1150,850))}
  if(!reduceMotion&&t>=nextEdgeAt){rebuildEdges();nextEdgeAt=t+rand(900,1600)}
  for(const r of ripples)r.age+=dt;ripples=ripples.filter(r=>r.age<r.life);
  for(const e of edges)e.age+=dt;edges=edges.filter(e=>e.age<e.life);
}
function drawRanking(){
  ctx.clearRect(0,0,w,h);ctx.save();
  for(const e of edges){const A=nodes[e.a],B=nodes[e.b];if(!A||!B)continue;const p=e.age/e.life,a=Math.sin(Math.PI*clamp(p,0,1))*.13;ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.strokeStyle=`hsla(${e.hue},95%,70%,${a})`;ctx.lineWidth=.7;ctx.stroke()}
  for(const n of nodes){const glow=.035+(Math.sin(n.pulse)+1)*.02;ctx.fillStyle=`hsla(${n.hue},100%,70%,${glow})`;ctx.beginPath();ctx.arc(n.x,n.y,n.r*4,0,Math.PI*2);ctx.fill();ctx.fillStyle=`hsla(${n.hue},100%,78%,.44)`;ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fill()}
  for(const r of ripples){const p=clamp(r.age/r.life,0,1),baseAlpha=Math.sin(Math.PI*p)*.34;for(let i=0;i<r.rings;i++){const radius=r.age*r.speed-i*r.gap;if(radius<=1)continue;const hue=(r.hue+r.age*46+i*28)%360;ctx.beginPath();ctx.arc(r.x,r.y,radius,0,Math.PI*2);ctx.strokeStyle=`hsla(${hue},98%,70%,${baseAlpha*(1-i*.17)})`;ctx.lineWidth=r.width+(1-p)*.7;ctx.stroke()}if(p<.15){const a=(1-p/.15)*.24;ctx.fillStyle=`hsla(${r.hue},100%,76%,${a})`;ctx.beginPath();ctx.arc(r.x,r.y,5+p*25,0,Math.PI*2);ctx.fill()}}
  ctx.restore();
}

/* ---------------- ADMIN / CÓDIGO ---------------- */
const matrixChars='01010101<>[]{}+-=/*TT';
function randomMatrixChar(){return matrixChars[Math.floor(Math.random()*matrixChars.length)]}
function initMatrix(){
  const target=w<800?qValue(8,11,14):qValue(10,16,22),gap=w/Math.max(1,target);
  matrixStreams=Array.from({length:target},(_,i)=>{const size=Math.floor(rand(10,14)),len=Math.floor(rand(6,11));return{x:(i+.5)*gap+rand(-gap*.28,gap*.28),y:rand(-h,h),dir:Math.random()<.48?-1:1,speed:rand(30,68),len,size,nextChar:rand(.14,.3),chars:Array.from({length:len},randomMatrixChar)}});
}
function updateMatrix(dt){
  for(const s of matrixStreams){s.y+=s.speed*s.dir*dt;s.nextChar-=dt;if(s.nextChar<=0){s.nextChar=rand(.14,.3);s.chars[Math.floor(Math.random()*s.len)]=randomMatrixChar()}const span=s.len*(s.size+4);if(s.dir>0&&s.y-span>h)s.y=-rand(30,h*.55);if(s.dir<0&&s.y+span<0)s.y=h+rand(30,h*.55)}
}
function drawMatrix(){
  ctx.clearRect(0,0,w,h);ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
  for(const s of matrixStreams){ctx.font=`700 ${s.size}px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;for(let i=0;i<s.len;i++){const y=s.y-i*(s.size+4)*s.dir;if(y<-25||y>h+25)continue;const q=1-i/s.len;ctx.fillStyle=i===0?'rgba(195,255,211,.66)':`rgba(11,255,84,${.035+q*.22})`;ctx.fillText(s.chars[i],s.x,y)}}ctx.restore();
}

function drawReduced(){if(mode==='pong')drawPong();else if(mode==='ranking')drawRanking();else if(mode==='matrix')drawMatrix()}
function adaptiveSample(t,late){
  perfFrames++;if(late)perfLate++;
  const elapsed=t-perfWindowStart;if(elapsed<4000)return;
  fps=perfFrames/(elapsed/1000);const lateRatio=perfLate/Math.max(1,perfFrames);
  if(lateRatio>.34&&performance.now()-lastDowngrade>9000)downgrade('frame-pressure');
  else if(lateRatio<.07&&quality!=='high'&&!saveData&&!reduceMotion&&performance.now()-Math.max(lastDowngrade,lastUpgrade)>18000)upgrade('stable-performance');
  perfWindowStart=t;perfFrames=0;perfLate=0;expose();
}
function loop(t){
  raf=0;syncMode();if(!visible||!mode||document.hidden)return;
  if(reduceMotion){drawReduced();expose();return}
  const interval=paintInterval();const elapsed=t-lastPaint;if(elapsed<interval){raf=requestAnimationFrame(loop);return}
  const dt=Math.min(.06,Math.max(.001,(t-lastTick)/1000));lastTick=t;lastPaint=t;
  if(mode==='pong'){updatePong(dt,t);drawPong()}else if(mode==='ranking'){updateRanking(dt,t);drawRanking()}else if(mode==='matrix'){updateMatrix(dt);drawMatrix()}
  adaptiveSample(t,elapsed>interval*1.65);raf=requestAnimationFrame(loop);
}

const observer=new MutationObserver(syncMode);observer.observe(document.body,{attributes:true,attributeFilter:['data-active-tab-v101']});
const main=document.querySelector('#mainApp');if(main)observer.observe(main,{attributes:true,attributeFilter:['class']});
let resizeTimer=0;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,120)},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0}else if(!document.hidden){lastTick=performance.now();syncMode();if(visible&&!raf)raf=requestAnimationFrame(loop)}});
connection?.addEventListener?.('change',()=>{if(connection.saveData)downgrade('save-data')});

document.documentElement.dataset.ttFxQuality=quality;resize();syncMode();expose();

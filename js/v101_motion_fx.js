/* ============================================================
   TT RIVALS 1.0.1 — UI MOTION FX 2
   Fondos animados optimizados por sección.
   - Inicio / Jugar / Torneos: pelotas + estelas
   - Ranking: ondas expansivas multicolor
   - Admin: lluvia de código verde, limitada a 24 FPS
   ============================================================ */

const MODES={
  home:'pong',
  play:'pong',
  tournaments:'pong',
  ranking:'ripples',
  admin:'matrix'
};

const canvas=document.createElement('canvas');
canvas.className='tt-motion-backdrop-p6';
canvas.id='ttMotionBackdropP6';
canvas.setAttribute('aria-hidden','true');
document.body.prepend(canvas);

const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
const lowPower=(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4)||
  (navigator.deviceMemory&&navigator.deviceMemory<=4);

let dpr=1,w=1,h=1,mode=null,visible=false,raf=0;
let lastTick=performance.now(),lastPaint=0;
let pongBalls=[];
let ripples=[];
let nextRippleAt=0;
let matrixStreams=[];

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rand=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];

function paintInterval(){
  if(mode==='matrix')return lowPower?58:42; // ~17 / 24 FPS
  if(mode==='pong')return lowPower?42:30;   // ~24 / 33 FPS
  return lowPower?48:34;                    // ~21 / 29 FPS
}

function resize(){
  dpr=Math.min(window.devicePixelRatio||1,lowPower?1.15:1.4);
  w=Math.max(1,window.innerWidth);
  h=Math.max(1,window.innerHeight);
  canvas.width=Math.round(w*dpr);
  canvas.height=Math.round(h*dpr);
  canvas.style.width=`${w}px`;
  canvas.style.height=`${h}px`;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  resetMode(mode,true);
}

function currentMode(){
  const main=document.querySelector('#mainApp');
  if(!main||main.classList.contains('hidden'))return null;
  return MODES[document.body.dataset.activeTabV101||'home']||null;
}

function syncMode(){
  const next=currentMode();
  if(next===mode&&visible===!!next)return;
  mode=next;
  visible=!!mode;
  document.body.classList.toggle('tt-motion-visible-p6',visible);
  canvas.style.display=visible?'block':'none';
  resetMode(mode,false);
  lastTick=performance.now();
  lastPaint=0;
  if(visible&&!raf)raf=requestAnimationFrame(loop);
}

function resetMode(next,fromResize=false){
  ctx.clearRect(0,0,w,h);
  if(next==='pong'&&(!fromResize||pongBalls.length===0))initPong();
  if(next==='ripples'){
    ripples=[];
    nextRippleAt=performance.now()+120;
    if(reduceMotion)for(let i=0;i<4;i++)spawnRipple(true);
  }
  if(next==='matrix')initMatrix();
}

/* ---------------- INICIO / JUGAR / TORNEOS ---------------- */
const pongHues=[190,205,155,270,310,34];
function newBall(){
  const angle=rand(0,Math.PI*2);
  const speed=rand(58,122);
  return {
    x:rand(20,Math.max(21,w-20)),y:rand(20,Math.max(21,h-20)),r:rand(3.8,6.4),
    vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
    hue:pick(pongHues)+rand(-7,7),
    kind:pick(['straight','curve','curve','drift']),
    turn:rand(-.32,.32),phase:rand(0,Math.PI*2),freq:rand(.7,1.55),
    nextNudge:rand(1.8,4.6),trail:[],maxTrail:lowPower?22:34
  };
}
function initPong(){
  const count=w<700?(lowPower?3:4):w<1200?(lowPower?4:5):(lowPower?5:6);
  pongBalls=Array.from({length:count},newBall);
}
function updatePong(dt,t){
  const margin=12;
  for(const b of pongBalls){
    if(b.kind==='curve'){
      const a=b.turn*dt,c=Math.cos(a),s=Math.sin(a);
      const vx=b.vx*c-b.vy*s,vy=b.vx*s+b.vy*c;b.vx=vx;b.vy=vy;
    }else if(b.kind==='drift'){
      const speed=Math.hypot(b.vx,b.vy)||80;
      const heading=Math.atan2(b.vy,b.vx)+Math.sin(t*.001*b.freq+b.phase)*.0014;
      b.vx=Math.cos(heading)*speed;b.vy=Math.sin(heading)*speed;
    }
    b.nextNudge-=dt;
    if(b.nextNudge<=0){
      const a=rand(-.45,.45),c=Math.cos(a),s=Math.sin(a);
      const vx=b.vx*c-b.vy*s,vy=b.vx*s+b.vy*c;b.vx=vx;b.vy=vy;
      b.nextNudge=rand(2.0,5.5);
      if(Math.random()<.34)b.kind=pick(['straight','curve','drift']);
    }
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    let bounced=false;
    if(b.x<margin){b.x=margin;b.vx=Math.abs(b.vx);bounced=true}
    if(b.x>w-margin){b.x=w-margin;b.vx=-Math.abs(b.vx);bounced=true}
    if(b.y<margin){b.y=margin;b.vy=Math.abs(b.vy);bounced=true}
    if(b.y>h-margin){b.y=h-margin;b.vy=-Math.abs(b.vy);bounced=true}
    if(bounced&&Math.random()<.65){
      const a=rand(-.26,.26),c=Math.cos(a),s=Math.sin(a);
      const vx=b.vx*c-b.vy*s,vy=b.vx*s+b.vy*c;b.vx=vx;b.vy=vy;
    }
    b.trail.push({x:b.x,y:b.y});
    if(b.trail.length>b.maxTrail)b.trail.shift();
  }
}
function drawPong(){
  ctx.clearRect(0,0,w,h);
  ctx.save();
  for(const b of pongBalls){
    const n=b.trail.length;
    if(n>1){
      for(let i=1;i<n;i++){
        const q=i/n;
        ctx.beginPath();
        ctx.moveTo(b.trail[i-1].x,b.trail[i-1].y);
        ctx.lineTo(b.trail[i].x,b.trail[i].y);
        ctx.strokeStyle=`hsla(${b.hue},96%,70%,${q*.28})`;
        ctx.lineWidth=.7+q*1.65;
        ctx.stroke();
      }
    }
    ctx.fillStyle=`hsla(${b.hue},100%,72%,.16)`;
    ctx.beginPath();ctx.arc(b.x,b.y,b.r*3.1,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(250,252,255,.93)';
    ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=`hsla(${b.hue},100%,70%,.82)`;ctx.lineWidth=1.1;ctx.stroke();
  }
  ctx.restore();
}

/* ---------------- RANKING / ONDAS ---------------- */
function spawnRipple(staticOnly=false){
  ripples.push({
    x:rand(w*.05,w*.95),y:rand(h*.06,h*.94),
    age:staticOnly?rand(.25,2.0):0,
    life:rand(3.0,4.8),speed:rand(60,108),
    hue:rand(0,360),rings:Math.floor(rand(2,4)),gap:rand(22,38),
    width:rand(1.0,1.8)
  });
  if(ripples.length>lowPower?7:10)ripples.shift();
}
function updateRipples(dt,t){
  if(!reduceMotion&&t>=nextRippleAt){
    spawnRipple(false);
    nextRippleAt=t+rand(lowPower?650:430,lowPower?1050:760);
  }
  for(const r of ripples)r.age+=dt;
  ripples=ripples.filter(r=>r.age<r.life);
}
function drawRipples(){
  ctx.clearRect(0,0,w,h);
  ctx.save();
  for(const r of ripples){
    const p=clamp(r.age/r.life,0,1);
    const baseAlpha=Math.sin(Math.PI*p)*.34;
    for(let i=0;i<r.rings;i++){
      const radius=r.age*r.speed-i*r.gap;
      if(radius<=1)continue;
      const hue=(r.hue+r.age*48+i*24)%360;
      ctx.beginPath();ctx.arc(r.x,r.y,radius,0,Math.PI*2);
      ctx.strokeStyle=`hsla(${hue},96%,69%,${baseAlpha*(1-i*.18)})`;
      ctx.lineWidth=r.width+(1-p)*.8;ctx.stroke();
    }
    if(p<.18){
      const a=(1-p/.18)*.18;
      ctx.fillStyle=`hsla(${r.hue},100%,72%,${a})`;
      ctx.beginPath();ctx.arc(r.x,r.y,7+(p*22),0,Math.PI*2);ctx.fill();
    }
  }
  ctx.restore();
}

/* ---------------- ADMIN / CÓDIGO ---------------- */
const matrixChars='01010101<>[]{}+-=/*TT';
function randomMatrixChar(){return matrixChars[Math.floor(Math.random()*matrixChars.length)]}
function initMatrix(){
  const target=lowPower?(w<800?12:18):(w<800?16:28);
  const gap=w/Math.max(1,target);
  matrixStreams=Array.from({length:target},(_,i)=>{
    const size=Math.floor(rand(11,15));
    const len=Math.floor(rand(7,13));
    return {
      x:(i+.5)*gap+rand(-gap*.28,gap*.28),
      y:rand(-h,h),dir:Math.random()<.42?-1:1,
      speed:rand(38,86),len,size,
      nextChar:rand(.10,.24),chars:Array.from({length:len},randomMatrixChar)
    };
  });
}
function updateMatrix(dt){
  for(const s of matrixStreams){
    s.y+=s.speed*s.dir*dt;
    s.nextChar-=dt;
    if(s.nextChar<=0){
      s.nextChar=rand(.10,.24);
      s.chars[Math.floor(Math.random()*s.len)]=randomMatrixChar();
    }
    const span=s.len*(s.size+4);
    if(s.dir>0&&s.y-span>h)s.y=-rand(30,h*.55);
    if(s.dir<0&&s.y+span<0)s.y=h+rand(30,h*.55);
  }
}
function drawMatrix(){
  ctx.clearRect(0,0,w,h);
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
  for(const s of matrixStreams){
    ctx.font=`700 ${s.size}px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;
    for(let i=0;i<s.len;i++){
      const y=s.y-i*(s.size+4)*s.dir;
      if(y<-25||y>h+25)continue;
      const q=1-i/s.len;
      ctx.fillStyle=i===0?'rgba(205,255,214,.78)':`rgba(12,255,86,${.055+q*.29})`;
      ctx.fillText(s.chars[i],s.x,y);
    }
  }
  ctx.restore();
}

function drawReduced(){
  if(mode==='pong')drawPong();
  else if(mode==='ripples')drawRipples();
  else if(mode==='matrix')drawMatrix();
}

function loop(t){
  raf=0;
  syncMode();
  if(!visible||!mode)return;

  if(reduceMotion){drawReduced();return}

  const interval=paintInterval();
  if(t-lastPaint<interval){raf=requestAnimationFrame(loop);return}

  const dt=Math.min(.065,Math.max(.001,(t-lastTick)/1000));
  lastTick=t;lastPaint=t;

  if(mode==='pong'){updatePong(dt,t);drawPong()}
  else if(mode==='ripples'){updateRipples(dt,t);drawRipples()}
  else if(mode==='matrix'){updateMatrix(dt);drawMatrix()}

  raf=requestAnimationFrame(loop);
}

const observer=new MutationObserver(syncMode);
observer.observe(document.body,{attributes:true,attributeFilter:['data-active-tab-v101']});
const main=document.querySelector('#mainApp');
if(main)observer.observe(main,{attributes:true,attributeFilter:['class']});
window.addEventListener('resize',resize,{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0}
  else if(!document.hidden){lastTick=performance.now();syncMode();if(visible&&!raf)raf=requestAnimationFrame(loop)}
});

resize();
syncMode();

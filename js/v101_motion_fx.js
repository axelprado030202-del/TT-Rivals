/* ============================================================
   TT RIVALS 1.0.1 — UI MOTION FX 1
   Canvas único, sin dependencias y sin interacción.
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
let dpr=1,w=0,h=0,mode=null,last=performance.now(),raf=0,visible=false;
let pongBalls=[];
let ripples=[];
let nextRippleAt=0;
let matrixStreams=[];
let matrixStep=23;

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rand=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];

function resize(){
  dpr=Math.min(window.devicePixelRatio||1,1.75);
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
  if(visible&&!raf){last=performance.now();raf=requestAnimationFrame(loop)}
}

function resetMode(next,fromResize=false){
  ctx?.clearRect(0,0,w,h);
  if(next==='pong'&&(!fromResize||pongBalls.length===0))initPong();
  if(next==='ripples'){
    ripples=[];
    nextRippleAt=performance.now()+150;
    if(reduceMotion)for(let i=0;i<7;i++)spawnRipple(true);
  }
  if(next==='matrix')initMatrix();
}

/* ---------------- PING PONG ---------------- */
const pongHues=[187,204,145,280,320,36];
function newBall(){
  const angle=rand(0,Math.PI*2);
  const speed=rand(52,128);
  return {
    x:rand(0,w),y:rand(0,h),r:rand(3.2,5.8),
    vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
    hue:pick(pongHues)+rand(-8,8),
    kind:pick(['straight','curve','curve','drift']),
    turn:rand(-.34,.34),phase:rand(0,Math.PI*2),freq:rand(.6,1.7),
    nextNudge:rand(1.7,4.8),trail:[],maxTrail:Math.round(rand(34,64))
  };
}
function initPong(){
  const count=w<700?5:w<1200?7:9;
  pongBalls=Array.from({length:count},newBall);
}
function updatePong(dt,t){
  const margin=10;
  for(const b of pongBalls){
    if(b.kind==='curve'){
      const a=b.turn*dt;
      const c=Math.cos(a),s=Math.sin(a);
      const vx=b.vx*c-b.vy*s,vy=b.vx*s+b.vy*c;
      b.vx=vx;b.vy=vy;
    }else if(b.kind==='drift'){
      const speed=Math.hypot(b.vx,b.vy)||80;
      const heading=Math.atan2(b.vy,b.vx)+Math.sin(t*.001*b.freq+b.phase)*.0009;
      b.vx=Math.cos(heading)*speed;b.vy=Math.sin(heading)*speed;
    }
    b.nextNudge-=dt;
    if(b.nextNudge<=0){
      const a=rand(-.42,.42),c=Math.cos(a),s=Math.sin(a);
      const vx=b.vx*c-b.vy*s,vy=b.vx*s+b.vy*c;
      b.vx=vx;b.vy=vy;b.nextNudge=rand(2.1,5.8);
      if(Math.random()<.28)b.kind=pick(['straight','curve','drift']);
    }
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    let bounced=false;
    if(b.x<margin){b.x=margin;b.vx=Math.abs(b.vx);bounced=true}
    if(b.x>w-margin){b.x=w-margin;b.vx=-Math.abs(b.vx);bounced=true}
    if(b.y<margin){b.y=margin;b.vy=Math.abs(b.vy);bounced=true}
    if(b.y>h-margin){b.y=h-margin;b.vy=-Math.abs(b.vy);bounced=true}
    if(bounced&&Math.random()<.7){
      const a=rand(-.24,.24),c=Math.cos(a),s=Math.sin(a);
      const vx=b.vx*c-b.vy*s,vy=b.vx*s+b.vy*c;
      b.vx=vx;b.vy=vy;
    }
    b.trail.push({x:b.x,y:b.y});
    if(b.trail.length>b.maxTrail)b.trail.splice(0,b.trail.length-b.maxTrail);
  }
}
function drawPong(){
  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  for(const b of pongBalls){
    const n=b.trail.length;
    if(n>1){
      for(let i=1;i<n;i++){
        const a=(i/n)*.15;
        ctx.beginPath();
        ctx.moveTo(b.trail[i-1].x,b.trail[i-1].y);
        ctx.lineTo(b.trail[i].x,b.trail[i].y);
        ctx.strokeStyle=`hsla(${b.hue},92%,67%,${a})`;
        ctx.lineWidth=.55+(i/n)*1.65;
        ctx.stroke();
      }
    }
    const glow=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*4.3);
    glow.addColorStop(0,'rgba(255,255,255,.72)');
    glow.addColorStop(.18,`hsla(${b.hue},100%,78%,.34)`);
    glow.addColorStop(1,`hsla(${b.hue},100%,65%,0)`);
    ctx.fillStyle=glow;
    ctx.beginPath();ctx.arc(b.x,b.y,b.r*4.3,0,Math.PI*2);ctx.fill();
    ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='rgba(248,250,252,.78)';
    ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=`hsla(${b.hue},95%,67%,.52)`;
    ctx.lineWidth=1;ctx.stroke();
    ctx.globalCompositeOperation='lighter';
  }
  ctx.restore();
}

/* ---------------- RANKING / ONDAS ---------------- */
function spawnRipple(staticOnly=false){
  ripples.push({
    x:rand(w*.05,w*.95),y:rand(h*.08,h*.95),
    age:staticOnly?rand(.2,2.3):0,
    life:rand(3.4,5.8),speed:rand(46,92),
    hue:rand(175,325),rings:Math.floor(rand(2,5)),gap:rand(20,44),
    width:rand(.8,2.0)
  });
}
function updateRipples(dt,t){
  if(!reduceMotion&&t>=nextRippleAt){
    spawnRipple(false);
    nextRippleAt=t+rand(360,820);
  }
  for(const r of ripples)r.age+=dt;
  ripples=ripples.filter(r=>r.age<r.life);
}
function drawRipples(t){
  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  for(const r of ripples){
    const p=clamp(r.age/r.life,0,1);
    const fade=Math.sin(Math.PI*p)*.18;
    for(let i=0;i<r.rings;i++){
      const radius=Math.max(2,r.age*r.speed-i*r.gap);
      if(radius<=0)continue;
      const ringFade=fade*(1-i/(r.rings+2));
      const hue=(r.hue+r.age*34+i*18)%360;
      ctx.beginPath();
      ctx.arc(r.x,r.y,radius,0,Math.PI*2);
      ctx.strokeStyle=`hsla(${hue},92%,68%,${ringFade})`;
      ctx.lineWidth=r.width+(1-p)*.75;
      ctx.shadowBlur=8;
      ctx.shadowColor=`hsla(${hue},90%,60%,.18)`;
      ctx.stroke();
    }
    if(p<.22){
      const a=(1-p/.22)*.12;
      const g=ctx.createRadialGradient(r.x,r.y,0,r.x,r.y,42);
      g.addColorStop(0,`hsla(${r.hue},100%,74%,${a})`);
      g.addColorStop(1,`hsla(${r.hue},100%,60%,0)`);
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(r.x,r.y,42,0,Math.PI*2);ctx.fill();
    }
  }
  ctx.restore();
}

/* ---------------- ADMIN / MATRIX ---------------- */
const matrixChars='01<>[]{}()/*+-=$#%&!?;:TT';
function randomMatrixChar(){return matrixChars[Math.floor(Math.random()*matrixChars.length)]}
function initMatrix(){
  matrixStep=w<700?20:24;
  const count=Math.ceil(w/matrixStep)+2;
  matrixStreams=Array.from({length:count},(_,i)=>({
    x:i*matrixStep+rand(-5,5),
    y:rand(-h,h),dir:Math.random()<.48?-1:1,
    speed:rand(38,118),len:Math.floor(rand(8,22)),
    size:Math.floor(rand(11,17)),phase:rand(0,1),
    nextChar:rand(.04,.16),chars:[]
  }));
  matrixStreams.forEach(s=>s.chars=Array.from({length:s.len},randomMatrixChar));
}
function updateMatrix(dt){
  for(const s of matrixStreams){
    s.y+=s.speed*s.dir*dt;
    s.nextChar-=dt;
    if(s.nextChar<=0){
      s.nextChar=rand(.04,.14);
      const changes=Math.max(1,Math.floor(s.len*.16));
      for(let i=0;i<changes;i++)s.chars[Math.floor(Math.random()*s.len)]=randomMatrixChar();
    }
    const span=s.len*(s.size+3);
    if(s.dir>0&&s.y-span>h)s.y=-rand(20,h*.75);
    if(s.dir<0&&s.y+span<0)s.y=h+rand(20,h*.75);
  }
}
function drawMatrix(){
  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.globalCompositeOperation='lighter';
  for(const s of matrixStreams){
    ctx.font=`700 ${s.size}px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;
    for(let i=0;i<s.len;i++){
      const y=s.y-i*(s.size+3)*s.dir;
      if(y<-30||y>h+30)continue;
      const trail=1-i/s.len;
      const alpha=.025+trail*.18;
      const head=i===0;
      ctx.fillStyle=head?'rgba(187,255,203,.46)':`rgba(0,255,92,${alpha})`;
      ctx.shadowBlur=head?11:4;
      ctx.shadowColor=head?'rgba(77,255,123,.38)':'rgba(0,255,76,.12)';
      ctx.fillText(s.chars[i],s.x,y);
    }
  }
  ctx.restore();
}

function drawStaticReduced(){
  if(mode==='pong')drawPong();
  else if(mode==='ripples')drawRipples(performance.now());
  else if(mode==='matrix')drawMatrix();
}

function loop(t){
  raf=0;
  syncMode();
  if(!visible||!mode)return;
  const dt=Math.min(.035,Math.max(.001,(t-last)/1000));
  last=t;

  if(reduceMotion){
    drawStaticReduced();
    return;
  }

  if(mode==='pong'){updatePong(dt,t);drawPong()}
  else if(mode==='ripples'){updateRipples(dt,t);drawRipples(t)}
  else if(mode==='matrix'){updateMatrix(dt);drawMatrix()}

  raf=requestAnimationFrame(loop);
}

const bodyObserver=new MutationObserver(syncMode);
bodyObserver.observe(document.body,{attributes:true,attributeFilter:['data-active-tab-v101']});
const main=document.querySelector('#mainApp');
if(main)bodyObserver.observe(main,{attributes:true,attributeFilter:['class']});

window.addEventListener('resize',resize,{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0}
  else if(!document.hidden){last=performance.now();syncMode();if(visible&&!raf)raf=requestAnimationFrame(loop)}
});

resize();
syncMode();

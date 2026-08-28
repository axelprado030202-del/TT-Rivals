import {supabase} from './supabase.js';

const ROOT_ID='postMatchCinematicV748';
const PALETTE=[
  '#2df7e8','#00d7ff','#49a8ff','#3977ff','#654cff','#8f49ff','#b23eff','#e43fff',
  '#ff4db8','#ff5f82','#ff7f4c','#ffd447','#7bffb2','#43e6bd','#8dd8ff','#e0b1ff'
];
const playedCinematics=new Set();
const inFlightCinematics=new Map();
let stopCurrentCinematic=null;

const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const easeIn=value=>value*value*value;
const easeOut=value=>1-Math.pow(1-value,3);
const reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
const playerName=player=>{
  const full=[player?.first_name,player?.last_name].filter(Boolean).join(' ').trim();
  return full||player?.username||'Jugador';
};

function fallbackSets(match){
  const rows=[];
  const p1=Math.max(0,Number(match?.player1_sets||0));
  const p2=Math.max(0,Number(match?.player2_sets||0));
  for(let index=0;index<p1;index++)rows.push({set_number:rows.length+1,player1_points:11,player2_points:7});
  for(let index=0;index<p2;index++)rows.push({set_number:rows.length+1,player1_points:7,player2_points:11});
  return rows;
}

async function loadSets(match){
  if(Array.isArray(match?.sets)&&match.sets.length){
    return [...match.sets].sort((a,b)=>Number(a.set_number||0)-Number(b.set_number||0));
  }
  try{
    const {data,error}=await supabase
      .from('match_sets')
      .select('match_id,set_number,player1_points,player2_points')
      .eq('match_id',match.id)
      .order('set_number',{ascending:true});
    if(error)throw error;
    if(Array.isArray(data)&&data.length)return data;
  }catch(error){
    console.warn('P7.4R.4.8: no se pudo cargar el orden de sets; se usa el resultado agregado.',error);
  }
  return fallbackSets(match);
}

function configureCanvas(canvas){
  const dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));
  const width=Math.max(1,window.innerWidth);
  const height=Math.max(1,window.innerHeight);
  canvas.width=Math.round(width*dpr);
  canvas.height=Math.round(height*dpr);
  canvas.style.width=`${width}px`;
  canvas.style.height=`${height}px`;
  const context=canvas.getContext('2d');
  context.setTransform(dpr,0,0,dpr,0,0);
  return {context,width,height,dpr};
}

function buildParticles(width,height){
  const mobile=width<680;
  const total=mobile?118:174;
  return Array.from({length:total},(_,index)=>{
    const edge=index%4;
    const margin=36+Math.random()*Math.min(width,height)*.2;
    let x=0;
    let y=0;
    if(edge===0){x=-margin;y=Math.random()*height}
    if(edge===1){x=width+margin;y=Math.random()*height}
    if(edge===2){x=Math.random()*width;y=-margin}
    if(edge===3){x=Math.random()*width;y=height+margin}
    return {
      x,y,
      color:PALETTE[index%PALETTE.length],
      radius:1.15+Math.random()*3.2,
      alpha:.42+Math.random()*.56,
      lag:Math.random()*.42,
      curve:(Math.random()-.5)*Math.min(width,height)*.34,
      angle:Math.random()*Math.PI*2,
      spin:(Math.random()>.5?1:-1)*(.6+Math.random()*1.45),
      burst:.58+Math.random()*.75
    };
  });
}

function paintParticle(context,x,y,particle,scale=1){
  const radius=Math.max(.7,particle.radius*scale);
  context.globalAlpha=particle.alpha;
  context.fillStyle=particle.color;
  context.shadowColor=particle.color;
  context.shadowBlur=radius*4.2;
  context.beginPath();
  context.arc(x,y,radius,0,Math.PI*2);
  context.fill();
}

function drawGather(context,particles,width,height,elapsed){
  const cx=width/2;
  const cy=height/2;
  const raw=clamp(elapsed/3000);
  for(const particle of particles){
    const local=clamp((raw-particle.lag*.25)/(1-particle.lag*.25));
    const progress=easeIn(local);
    const startAngle=Math.atan2(particle.y-cy,particle.x-cx);
    const tangentX=-Math.sin(startAngle)*particle.curve*Math.sin(progress*Math.PI);
    const tangentY=Math.cos(startAngle)*particle.curve*Math.sin(progress*Math.PI);
    const x=particle.x+(cx-particle.x)*progress+tangentX;
    const y=particle.y+(cy-particle.y)*progress+tangentY;
    paintParticle(context,x,y,particle,.7+progress*.5);
  }
}

function drawCharge(context,particles,width,height,elapsed){
  const cx=width/2;
  const cy=height/2;
  const progress=clamp((elapsed-3000)/1000);
  const compact=1-easeOut(progress)*.82;
  for(const particle of particles){
    const orbit=(13+particle.radius*7+particle.lag*66)*compact;
    const angle=particle.angle+progress*Math.PI*5*particle.spin;
    paintParticle(context,cx+Math.cos(angle)*orbit,cy+Math.sin(angle)*orbit,particle,1.15);
  }
  const glow=context.createRadialGradient(cx,cy,0,cx,cy,35+progress*62);
  glow.addColorStop(0,`rgba(255,255,255,${.25+progress*.7})`);
  glow.addColorStop(.22,`rgba(83,238,255,${.22+progress*.55})`);
  glow.addColorStop(.55,`rgba(128,65,255,${.16+progress*.4})`);
  glow.addColorStop(1,'rgba(233,53,255,0)');
  context.globalAlpha=1;
  context.shadowBlur=0;
  context.fillStyle=glow;
  context.beginPath();
  context.arc(cx,cy,38+progress*70,0,Math.PI*2);
  context.fill();
}

function drawBurst(context,particles,width,height,elapsed){
  const cx=width/2;
  const cy=height/2;
  const progress=clamp((elapsed-4000)/1000);
  const distance=easeOut(progress)*Math.hypot(width,height)*.74;
  for(const particle of particles){
    const angle=particle.angle+(particle.lag-.5)*.32;
    const wobble=Math.sin(progress*Math.PI*3+particle.lag*8)*24*(1-progress);
    const x=cx+Math.cos(angle)*distance*particle.burst-Math.sin(angle)*wobble;
    const y=cy+Math.sin(angle)*distance*particle.burst+Math.cos(angle)*wobble;
    particle.alpha=(1-progress)*.92;
    paintParticle(context,x,y,particle,1.6-progress*.85);
  }
  const flashAlpha=Math.sin(progress*Math.PI)*.92;
  const flash=context.createRadialGradient(cx,cy,0,cx,cy,Math.max(width,height)*.62*progress+.01);
  flash.addColorStop(0,`rgba(255,255,255,${flashAlpha})`);
  flash.addColorStop(.12,`rgba(103,232,255,${flashAlpha*.74})`);
  flash.addColorStop(.38,`rgba(134,74,255,${flashAlpha*.34})`);
  flash.addColorStop(1,'rgba(232,55,255,0)');
  context.globalAlpha=1;
  context.shadowBlur=0;
  context.fillStyle=flash;
  context.fillRect(0,0,width,height);
}

function setPlayer(root,side,name,isWinner){
  const card=root.querySelector(`#postMatchPlayer${side}V748`);
  const nameNode=root.querySelector(`#postMatchPlayer${side}NameV748`);
  const countNode=root.querySelector(`#postMatchPlayer${side}CountV748`);
  const ballsNode=root.querySelector(`#postMatchPlayer${side}BallsV748`);
  if(nameNode)nameNode.textContent=name;
  if(countNode)countNode.textContent='0';
  if(ballsNode)ballsNode.replaceChildren();
  card?.classList.toggle('is-winner',isWinner);
}

function addBall(root,side,isGold){
  const balls=root.querySelector(`#postMatchPlayer${side}BallsV748`);
  const count=root.querySelector(`#postMatchPlayer${side}CountV748`);
  if(!balls||!count)return;
  const ball=document.createElement('span');
  ball.className=`postmatch-ball-v748${isGold?' is-gold':''}`;
  ball.setAttribute('aria-label',isGold?'Set ganado sin ceder sets':'Set ganado');
  ball.innerHTML='<b>TTR</b>';
  balls.append(ball);
  count.textContent=String(balls.children.length);
}

function runSequence(match,sets){
  const root=document.getElementById(ROOT_ID);
  const canvas=document.getElementById('postMatchCanvasV748');
  if(!root||!canvas||!sets.length)return Promise.resolve({played:false,reason:'missing-ui-or-sets'});

  const p1Sets=Math.max(0,Number(match.player1_sets||0));
  const p2Sets=Math.max(0,Number(match.player2_sets||0));
  const winnerSide=p1Sets===p2Sets?0:(p1Sets>p2Sets?1:2);
  const cleanSweep=Math.min(p1Sets,p2Sets)===0&&Math.max(p1Sets,p2Sets)>=2;
  setPlayer(root,1,playerName(match.player1),winnerSide===1);
  setPlayer(root,2,playerName(match.player2),winnerSide===2);

  let frame=configureCanvas(canvas);
  let particles=buildParticles(frame.width,frame.height);
  let raf=0;
  let timer=0;
  let settled=false;
  let startedAt=performance.now();
  const previousFocus=document.activeElement;

  root.dataset.phase='gather';
  root.classList.remove('hidden');
  root.setAttribute('aria-hidden','false');
  document.body.classList.add('postmatch-cinematic-open-v748');
  root.focus({preventScroll:true});

  return new Promise(resolve=>{
    const onResize=()=>{
      frame=configureCanvas(canvas);
      particles=buildParticles(frame.width,frame.height);
    };
    const cleanup=skipped=>{
      if(settled)return;
      settled=true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener('resize',onResize);
      root.removeEventListener('pointerdown',skip);
      root.removeEventListener('keydown',onKeydown);
      root.classList.add('hidden');
      root.setAttribute('aria-hidden','true');
      delete root.dataset.phase;
      document.body.classList.remove('postmatch-cinematic-open-v748');
      stopCurrentCinematic=null;
      if(previousFocus instanceof HTMLElement&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});
      resolve({played:true,skipped});
    };
    const skip=()=>cleanup(true);
    const onKeydown=event=>{
      if(['Escape','Enter',' '].includes(event.key)){
        event.preventDefault();
        skip();
      }
    };
    stopCurrentCinematic=skip;
    root.addEventListener('pointerdown',skip);
    root.addEventListener('keydown',onKeydown);
    window.addEventListener('resize',onResize,{passive:true});

    const revealBall=index=>{
      if(settled)return;
      if(index>=sets.length){
        cleanup(false);
        return;
      }
      const set=sets[index];
      const side=Number(set.player1_points)>Number(set.player2_points)?1:2;
      addBall(root,side,cleanSweep&&side===winnerSide);
      timer=window.setTimeout(()=>revealBall(index+1),1000);
    };

    const render=now=>{
      if(settled)return;
      const elapsed=now-startedAt;
      const {context,width,height}=frame;
      context.clearRect(0,0,width,height);
      context.globalAlpha=1;
      context.shadowBlur=0;
      if(elapsed<3000){
        root.dataset.phase='gather';
        drawGather(context,particles,width,height,elapsed);
      }else if(elapsed<4000){
        root.dataset.phase='charge';
        drawCharge(context,particles,width,height,elapsed);
      }else if(elapsed<5000){
        root.dataset.phase='burst';
        drawBurst(context,particles,width,height,elapsed);
      }else{
        root.dataset.phase='score';
        context.clearRect(0,0,width,height);
        revealBall(0);
        return;
      }
      raf=requestAnimationFrame(render);
    };
    raf=requestAnimationFrame(render);
  });
}

export function stopPostMatchCinematicV748(){
  stopCurrentCinematic?.();
}

export function resetPostMatchCinematicV748ForTests(){
  playedCinematics.clear();
}

export async function playPostMatchCinematicV748(match){
  const id=Number(match?.id||0);
  if(!id)return {played:false,reason:'invalid-match'};
  if(match?.completion_type==='abandonment')return {played:false,reason:'abandonment'};
  if(reducedMotion())return {played:false,reason:'reduced-motion'};
  if(playedCinematics.has(id))return {played:false,reason:'already-played'};
  if(inFlightCinematics.has(id))return inFlightCinematics.get(id);

  const task=(async()=>{
    const sets=await loadSets(match);
    const outcome=await runSequence(match,sets);
    playedCinematics.add(id);
    return outcome;
  })().finally(()=>inFlightCinematics.delete(id));
  inFlightCinematics.set(id,task);
  return task;
}

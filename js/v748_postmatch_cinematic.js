import {supabase} from './supabase.js';

const ROOT_ID='postMatchCinematicV748';
const PALETTE=[
  '#2df7e8','#00d7ff','#49a8ff','#3977ff','#654cff','#8f49ff','#b23eff','#e43fff',
  '#ff4db8','#ff5f82','#ff7f4c','#ffd447','#7bffb2','#43e6bd','#8dd8ff','#e0b1ff'
];
const startedMatches=new Set();
let active=null;

const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const easeIn=value=>value*value*value;
const easeOut=value=>1-Math.pow(1-value,3);
const reduceMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const playerName=player=>{
  const full=[player?.first_name,player?.last_name].filter(Boolean).join(' ').trim();
  return full||player?.username||'Jugador';
};

async function loadPlayers(match){
  const ids=[match?.player1_id,match?.player2_id].filter(Boolean);
  if(!ids.length||(playerName(match?.player1)!=='Jugador'&&playerName(match?.player2)!=='Jugador'))return match;
  try{
    const {data,error}=await supabase
      .from('visible_profiles_v76')
      .select('id,username,first_name,last_name,profile_photo_url')
      .in('id',ids);
    if(error)throw error;
    const profiles=new Map((data||[]).map(profile=>[String(profile.id),profile]));
    return {
      ...match,
      player1:{...(profiles.get(String(match.player1_id))||{}),...(match.player1||{})},
      player2:{...(profiles.get(String(match.player2_id))||{}),...(match.player2||{})}
    };
  }catch(error){
    console.warn('P7.4R.4.10: no se pudieron completar los nombres de los jugadores.',error);
    return match;
  }
}

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
  if(!match?.id)return fallbackSets(match);
  try{
    const {data,error}=await supabase
      .from('match_sets')
      .select('match_id,set_number,player1_points,player2_points')
      .eq('match_id',match.id)
      .order('set_number',{ascending:true});
    if(error)throw error;
    if(Array.isArray(data)&&data.length)return data;
  }catch(error){
    console.warn('P7.4R.4.10: no se pudo cargar el detalle por sets.',error);
  }
  return fallbackSets(match);
}

async function hydrate(match){
  const named=await loadPlayers(match);
  const sets=await loadSets(named);
  return {match:named,sets};
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
  return {context,width,height};
}

function buildParticles(width,height){
  const total=width<680?108:174;
  return Array.from({length:total},(_,index)=>{
    const edge=index%4;
    const margin=36+Math.random()*Math.min(width,height)*.2;
    let x=0,y=0;
    if(edge===0){x=-margin;y=Math.random()*height}
    if(edge===1){x=width+margin;y=Math.random()*height}
    if(edge===2){x=Math.random()*width;y=-margin}
    if(edge===3){x=Math.random()*width;y=height+margin}
    return {
      x,y,color:PALETTE[index%PALETTE.length],radius:1.15+Math.random()*3.2,
      alpha:.42+Math.random()*.56,lag:Math.random()*.42,
      curve:(Math.random()-.5)*Math.min(width,height)*.34,
      angle:Math.random()*Math.PI*2,spin:(Math.random()>.5?1:-1)*(.6+Math.random()*1.45),
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
  context.beginPath();context.arc(x,y,radius,0,Math.PI*2);context.fill();
}

function drawGather(context,particles,width,height,elapsed){
  const cx=width/2,cy=height/2,raw=clamp(elapsed/3000);
  for(const particle of particles){
    const local=clamp((raw-particle.lag*.25)/(1-particle.lag*.25));
    const progress=easeIn(local);
    const startAngle=Math.atan2(particle.y-cy,particle.x-cx);
    const tangentX=-Math.sin(startAngle)*particle.curve*Math.sin(progress*Math.PI);
    const tangentY=Math.cos(startAngle)*particle.curve*Math.sin(progress*Math.PI);
    paintParticle(context,particle.x+(cx-particle.x)*progress+tangentX,particle.y+(cy-particle.y)*progress+tangentY,particle,.7+progress*.5);
  }
}

function drawCharge(context,particles,width,height,elapsed){
  const cx=width/2,cy=height/2,progress=clamp((elapsed-3000)/1000),compact=1-easeOut(progress)*.82;
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
  context.globalAlpha=1;context.shadowBlur=0;context.fillStyle=glow;
  context.beginPath();context.arc(cx,cy,38+progress*70,0,Math.PI*2);context.fill();
}

function drawBurst(context,particles,width,height,elapsed){
  const cx=width/2,cy=height/2,progress=clamp((elapsed-4000)/1000);
  const distance=easeOut(progress)*Math.hypot(width,height)*.74;
  for(const particle of particles){
    const angle=particle.angle+(particle.lag-.5)*.32;
    const wobble=Math.sin(progress*Math.PI*3+particle.lag*8)*24*(1-progress);
    particle.alpha=(1-progress)*.92;
    paintParticle(context,cx+Math.cos(angle)*distance*particle.burst-Math.sin(angle)*wobble,cy+Math.sin(angle)*distance*particle.burst+Math.cos(angle)*wobble,particle,1.6-progress*.85);
  }
  const flashAlpha=Math.sin(progress*Math.PI)*.92;
  const flash=context.createRadialGradient(cx,cy,0,cx,cy,Math.max(width,height)*.62*progress+.01);
  flash.addColorStop(0,`rgba(255,255,255,${flashAlpha})`);
  flash.addColorStop(.12,`rgba(103,232,255,${flashAlpha*.74})`);
  flash.addColorStop(.38,`rgba(134,74,255,${flashAlpha*.34})`);
  flash.addColorStop(1,'rgba(232,55,255,0)');
  context.globalAlpha=1;context.shadowBlur=0;context.fillStyle=flash;context.fillRect(0,0,width,height);
}

function clearTimers(session){
  cancelAnimationFrame(session.particleRaf||0);
  cancelAnimationFrame(session.rpRaf||0);
  session.timers.splice(0).forEach(clearTimeout);
}

function schedule(session,callback,delay){
  const id=setTimeout(()=>{
    session.timers=session.timers.filter(item=>item!==id);
    if(active===session&&!session.closed)callback();
  },delay);
  session.timers.push(id);
  return id;
}

function matchOutcome(match){
  const p1=Math.max(0,Number(match?.player1_sets||0));
  const p2=Math.max(0,Number(match?.player2_sets||0));
  return {p1,p2,winnerSide:p1===p2?0:(p1>p2?1:2),cleanSweep:Math.min(p1,p2)===0&&Math.max(p1,p2)>=1};
}

function setPlayer(root,side,name,isWinner){
  const card=root.querySelector(`#postMatchPlayer${side}V748`);
  const result=root.querySelector(`#postMatchPlayer${side}ResultV748`);
  const nameNode=root.querySelector(`#postMatchPlayer${side}NameV748`);
  const count=root.querySelector(`#postMatchPlayer${side}CountV748`);
  const balls=root.querySelector(`#postMatchPlayer${side}BallsV748`);
  if(result)result.textContent=isWinner?'VICTORIA':'DERROTA';
  if(nameNode)nameNode.textContent=name;
  if(count)count.textContent='0';
  balls?.replaceChildren();
  card?.classList.toggle('is-winner',isWinner);
  card?.classList.toggle('is-loser',!isWinner);
  card?.setAttribute('aria-label',`${name}: ${isWinner?'victoria':'derrota'}`);
}

function addBall(root,side,isGold,{instant=false}={}){
  const balls=root.querySelector(`#postMatchPlayer${side}BallsV748`);
  const count=root.querySelector(`#postMatchPlayer${side}CountV748`);
  if(!balls||!count)return;
  const ball=document.createElement('span');
  ball.className=`postmatch-ball-v748${isGold?' is-gold':''}${instant?' is-instant':''}`;
  ball.setAttribute('aria-label',isGold?'Set de una victoria sin ceder sets':'Set ganado');
  const fireId=`v752-fire-${side}-${balls.children.length}`;
  ball.innerHTML=isGold?`<i class="postmatch-fire-v750" aria-hidden="true">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
      <defs>
        <radialGradient id="${fireId}-outer" cx="50%" cy="52%" r="58%"><stop offset="0" stop-color="#ffe98a"/><stop offset=".46" stop-color="#ffbd18"/><stop offset=".73" stop-color="#ff7200"/><stop offset="1" stop-color="#ff3100"/></radialGradient>
        <radialGradient id="${fireId}-inner" cx="48%" cy="46%" r="60%"><stop offset="0" stop-color="#fffbd0"/><stop offset=".43" stop-color="#ffe05c"/><stop offset=".76" stop-color="#ff9d00"/><stop offset="1" stop-color="#ff5a00"/></radialGradient>
      </defs>
      <path class="postmatch-flame-outer-v752" fill="url(#${fireId}-outer)" d="M49 2C57 17 39 23 47 36C57 33 65 20 63 10C80 27 65 35 75 42C81 40 85 31 83 27C96 40 85 48 91 59C101 63 92 73 87 77C89 82 98 81 97 83C85 93 79 85 75 87C67 93 75 98 67 97C57 96 55 90 48 91C36 96 32 99 25 94C33 89 27 85 19 84C10 85 2 78 4 74C16 73 14 67 10 62C1 52 12 44 13 36C22 42 20 48 26 51C34 37 19 31 31 20C34 29 41 31 39 23C37 14 45 10 49 2Z"/>
      <path class="postmatch-flame-inner-v752" fill="url(#${fireId}-inner)" d="M50 18C56 28 57 35 55 40C63 33 68 27 70 21C74 34 73 42 70 48C77 44 84 47 86 52C80 58 76 61 74 65C80 67 83 72 82 77C73 78 67 75 62 73C63 81 59 86 55 89C51 82 47 78 43 76C39 83 34 86 30 83C31 76 27 72 23 69C27 61 32 57 35 55C30 50 31 44 34 39C39 43 42 48 44 50C43 38 45 27 50 18Z"/>
    </svg>
  </i><b>TTR</b>`:'<b>TTR</b>';
  balls.append(ball);
  count.textContent=String(balls.children.length);
}

function currentData(session){
  const match=session.data?.match||session.match||{};
  const sets=session.data?.sets?.length?session.data.sets:fallbackSets(match);
  return {match,sets};
}

function renderPlayers(session,{allBalls=false,instant=false}={}){
  const {match,sets}=currentData(session);
  const outcome=matchOutcome(match);
  setPlayer(session.root,1,playerName(match.player1),outcome.winnerSide===1);
  setPlayer(session.root,2,playerName(match.player2),outcome.winnerSide===2);
  if(allBalls){
    for(const set of sets){
      const side=Number(set.player1_points)>Number(set.player2_points)?1:2;
      addBall(session.root,side,outcome.cleanSweep&&side===outcome.winnerSide,{instant});
    }
  }
  renderDetails(session);
  return {match,sets,outcome};
}

function renderDetails(session){
  const panel=session.root.querySelector('#postMatchDetailsPanelV750');
  if(!panel)return;
  const {match,sets}=currentData(session);
  const p1=playerName(match.player1),p2=playerName(match.player2);
  panel.innerHTML=sets.length?sets.map((set,index)=>`
    <div class="postmatch-detail-row-v750">
      <span>Set ${Number(set.set_number||index+1)}</span>
      <strong>${Number(set.player1_points||0)} <i>–</i> ${Number(set.player2_points||0)}</strong>
      <small>${p1} · ${p2}</small>
    </div>`).join(''):'<p>El detalle de puntos todavía se está cargando.</p>';
}

function normalizedTiers(payload){
  const tiers=(payload?.tiers||[]).map(item=>({name:item.name||'Rango',min:Number(item.min_rating||0)})).sort((a,b)=>a.min-b.min);
  return tiers.length?tiers:[
    {name:'Bronce',min:0},{name:'Plata',min:1100},{name:'Oro',min:1250},{name:'Platino',min:1400},{name:'Diamante',min:1600}
  ];
}

function tierState(rating,tiers){
  let index=0;
  for(let i=0;i<tiers.length;i++)if(rating>=tiers[i].min)index=i;
  const tier=tiers[index],next=tiers[index+1]||null;
  const progress=next&&next.min>tier.min?clamp((rating-tier.min)/(next.min-tier.min))*100:100;
  return {tier,next,progress};
}

function paintRpFrame(session,rating,final=false){
  const payload=session.payload;
  if(!payload)return;
  const root=session.root;
  const isCasual=!!payload.isCasual;
  const card=root.querySelector('#postMatchRpV750');
  const delta=root.querySelector('#postMatchRpDeltaV750');
  const journey=root.querySelector('#postMatchRpJourneyV750');
  const rank=root.querySelector('#postMatchRpRankV750');
  const next=root.querySelector('#postMatchRpNextV750');
  const bar=root.querySelector('#postMatchRpBarV750');
  card?.classList.toggle('is-casual',isCasual);
  if(isCasual){
    if(delta)delta.textContent='SIN CAMBIO DE RP';
    if(journey)journey.textContent='Este partido queda registrado sin modificar tu Rivals Points.';
    if(rank)rank.textContent='PARTIDO CASUAL';
    if(next)next.textContent='RP sin cambios';
    if(bar)bar.style.width='100%';
    return;
  }
  const change=Number(payload.delta||0);
  const current=Number(payload.current||0);
  const previous=Number(payload.previous??current);
  const tiers=normalizedTiers(payload);
  const state=tierState(rating,tiers);
  if(delta){
    delta.textContent=`${change>=0?'+':''}${change} RP`;
    delta.classList.toggle('is-positive',change>0);
    delta.classList.toggle('is-negative',change<0);
  }
  if(journey)journey.innerHTML=`<span><small>ANTES</small><b>${previous}</b></span><i>→</i><span><small>AHORA</small><b>${final?current:Math.round(rating)}</b></span>`;
  if(rank)rank.textContent=state.tier.name;
  if(next)next.textContent=state.next?`${Math.max(0,state.next.min-Math.round(rating))} RP para ${state.next.name}`:'Rango máximo alcanzado';
  if(bar)bar.style.width=`${state.progress}%`;
}

function revealActions(session,{instant=false}={}){
  const actions=session.root.querySelector('#postMatchActionsV750');
  const rematch=session.root.querySelector('#postMatchRematchV750');
  const status=session.root.querySelector('#postMatchRematchStatusV750');
  if(rematch){
    rematch.dataset.rematch=String(session.id);
    rematch.textContent=`↻ ${session.payload?.won?'OFRECER':'PEDIR'} REVANCHA`;
  }
  if(status)status.dataset.rematchStatusV73=String(session.id);
  actions?.classList.toggle('is-instant',instant);
  actions?.classList.add('is-visible');
  session.root.dataset.scoreState='actions';
  const finish=()=>{
    if(active!==session||session.closed)return;
    session.root.dataset.scoreState='final';
    const skip=session.root.querySelector('#postMatchSkipV748');
    if(skip)skip.textContent='RESULTADO CONFIRMADO';
  };
  instant?finish():schedule(session,finish,1500);
}

function animateRp(session){
  if(!session.payload){session.waitingForPayload=true;return}
  session.waitingForPayload=false;
  session.root.dataset.scoreState='rp';
  const section=session.root.querySelector('#postMatchRpV750');
  section?.classList.add('is-visible');
  const previous=Number(session.payload.previous??session.payload.current??0);
  const current=Number(session.payload.current??previous);
  const started=performance.now();
  const frame=now=>{
    if(active!==session||session.closed||session.skipped)return;
    const progress=clamp((now-started)/3000);
    const rating=previous+(current-previous)*easeOut(progress);
    paintRpFrame(session,rating,progress>=1);
    if(progress<1)session.rpRaf=requestAnimationFrame(frame);
    else revealActions(session);
  };
  paintRpFrame(session,previous,false);
  session.rpRaf=requestAnimationFrame(frame);
}

function startBallSequence(session){
  if(active!==session||session.closed||session.skipped)return;
  const {sets,outcome}=renderPlayers(session);
  session.root.dataset.phase='score';
  session.root.dataset.scoreState='players';
  let index=0;
  const reveal=()=>{
    if(active!==session||session.closed||session.skipped)return;
    if(index>=sets.length){animateRp(session);return}
    const set=sets[index++];
    const side=Number(set.player1_points)>Number(set.player2_points)?1:2;
    addBall(session.root,side,outcome.cleanSweep&&side===outcome.winnerSide);
    schedule(session,reveal,1000);
  };
  reveal();
}

function enterScore(session){
  if(active!==session||session.closed||session.skipped)return;
  cancelAnimationFrame(session.particleRaf||0);
  const canvas=session.root.querySelector('#postMatchCanvasV748');
  const context=canvas?.getContext('2d');
  context?.clearRect(0,0,canvas.width,canvas.height);
  session.root.dataset.phase='score';
  Promise.race([session.hydration,wait(180).then(()=>null)]).then(()=>{
    if(active===session&&!session.closed&&!session.skipped)startBallSequence(session);
  });
}

function skipAnimations(session){
  if(active!==session||session.closed||session.root.dataset.scoreState==='final')return;
  session.skipped=true;
  clearTimers(session);
  session.root.dataset.phase='score';
  renderPlayers(session,{allBalls:true,instant:true});
  const section=session.root.querySelector('#postMatchRpV750');
  section?.classList.add('is-visible','is-instant');
  if(session.payload)paintRpFrame(session,Number(session.payload.current||0),true);
  else{
    const delta=session.root.querySelector('#postMatchRpDeltaV750');
    const next=session.root.querySelector('#postMatchRpNextV750');
    if(delta)delta.textContent='ACTUALIZANDO RP…';
    if(next)next.textContent='Resultado confirmado';
  }
  revealActions(session,{instant:true});
}

function startParticles(session){
  const canvas=session.root.querySelector('#postMatchCanvasV748');
  if(!canvas)return enterScore(session);
  let frame=configureCanvas(canvas);
  let particles=buildParticles(frame.width,frame.height);
  const started=performance.now();
  session.resize=()=>{frame=configureCanvas(canvas);particles=buildParticles(frame.width,frame.height)};
  window.addEventListener('resize',session.resize,{passive:true});
  const draw=now=>{
    if(active!==session||session.closed||session.skipped)return;
    const elapsed=now-started;
    const {context,width,height}=frame;
    context.clearRect(0,0,width,height);context.globalAlpha=1;context.shadowBlur=0;
    if(elapsed<3000){session.root.dataset.phase='gather';drawGather(context,particles,width,height,elapsed)}
    else if(elapsed<4000){session.root.dataset.phase='charge';drawCharge(context,particles,width,height,elapsed)}
    else if(elapsed<5000){session.root.dataset.phase='burst';drawBurst(context,particles,width,height,elapsed)}
    else return enterScore(session);
    session.particleRaf=requestAnimationFrame(draw);
  };
  session.particleRaf=requestAnimationFrame(draw);
}

function resetUi(session){
  const root=session.root;
  root.querySelector('#postMatchPlayer1BallsV748')?.replaceChildren();
  root.querySelector('#postMatchPlayer2BallsV748')?.replaceChildren();
  root.querySelector('#postMatchRpV750')?.classList.remove('is-visible','is-instant','is-casual');
  root.querySelector('#postMatchActionsV750')?.classList.remove('is-visible','is-instant');
  const details=root.querySelector('#postMatchDetailsPanelV750');
  const toggle=root.querySelector('#postMatchDetailsToggleV750');
  details?.classList.add('hidden');
  if(toggle){toggle.setAttribute('aria-expanded','false');toggle.textContent='Detalles'}
  const skip=root.querySelector('#postMatchSkipV748');
  if(skip)skip.textContent='TOCÁ EN CUALQUIER LUGAR PARA SALTEAR';
  root.dataset.phase='gather';delete root.dataset.scoreState;
}

export function beginPostMatchCinematicV750(match){
  const id=Number(match?.id||0);
  if(!id)return false;
  if(active?.id===id)return true;
  if(startedMatches.has(id))return false;
  if(active)closePostMatchCinematicV750({remember:true});
  const root=document.getElementById(ROOT_ID);
  if(!root)return false;
  const session={id,match:{...match,id},root,data:null,payload:null,timers:[],particleRaf:0,rpRaf:0,skipped:false,closed:false,waitingForPayload:false,hydrationVersion:0};
  active=session;startedMatches.add(id);resetUi(session);
  root.classList.remove('hidden');root.setAttribute('aria-hidden','false');
  document.body.classList.add('postmatch-cinematic-open-v748');root.focus({preventScroll:true});

  session.onPointer=event=>{
    if(event.target.closest('button,a,input,select,textarea,#postMatchDetailsPanelV750'))return;
    skipAnimations(session);
  };
  session.onKey=event=>{
    if(['Enter',' '].includes(event.key)&&root.dataset.scoreState!=='final'){
      event.preventDefault();skipAnimations(session);
    }
  };
  session.onDetails=event=>{
    event.stopPropagation();
    const panel=root.querySelector('#postMatchDetailsPanelV750');
    const expanded=panel?.classList.contains('hidden');
    panel?.classList.toggle('hidden',!expanded);
    event.currentTarget.setAttribute('aria-expanded',String(expanded));
    event.currentTarget.textContent=expanded?'Ocultar detalles':'Detalles';
  };
  root.addEventListener('pointerdown',session.onPointer);
  root.addEventListener('keydown',session.onKey);
  root.querySelector('#postMatchDetailsToggleV750')?.addEventListener('click',session.onDetails);

  const hydrationVersion=++session.hydrationVersion;
  session.hydration=hydrate(session.match).then(data=>{
    if(active!==session||session.closed||hydrationVersion!==session.hydrationVersion)return data;
    session.data=data;renderDetails(session);
    if(session.skipped)renderPlayers(session,{allBalls:true,instant:true});
    return data;
  });

  if(reduceMotion()||match?.completion_type==='abandonment'){
    session.skipped=true;root.dataset.phase='score';
    renderPlayers(session,{allBalls:true,instant:true});
    root.querySelector('#postMatchRpV750')?.classList.add('is-visible','is-instant');
  }else startParticles(session);
  return true;
}

export function completePostMatchCinematicV750(match,payload={}){
  const id=Number(match?.id||payload?.matchId||0);
  if(!id)return false;
  if(!active||active.id!==id)beginPostMatchCinematicV750(match||{id});
  const session=active;
  if(!session||session.id!==id)return false;
  const merged={...session.match,...match,player1:{...(session.match?.player1||{}),...(match?.player1||{})},player2:{...(session.match?.player2||{}),...(match?.player2||{})}};
  const changedIds=merged.player1_id!==session.match?.player1_id||merged.player2_id!==session.match?.player2_id;
  session.match=merged;session.payload={...payload,matchId:id};
  if(session.data){
    session.data.match={
      ...session.data.match,...merged,
      player1:{...(session.data.match?.player1||{}),...(merged.player1||{})},
      player2:{...(session.data.match?.player2||{}),...(merged.player2||{})}
    };
  }
  if(changedIds||!session.data){
    const hydrationVersion=++session.hydrationVersion;
    session.hydration=hydrate(merged).then(data=>{
      if(active===session&&!session.closed&&hydrationVersion===session.hydrationVersion){session.data=data;renderDetails(session);if(session.skipped)renderPlayers(session,{allBalls:true,instant:true})}
      return data;
    });
  }
  if(session.skipped){
    paintRpFrame(session,Number(session.payload.current||0),true);
    revealActions(session,{instant:true});
  }else if(session.waitingForPayload)animateRp(session);
  return true;
}

export function closePostMatchCinematicV750({remember=true}={}){
  const session=active;
  if(!session)return;
  session.closed=true;clearTimers(session);
  if(session.resize)window.removeEventListener('resize',session.resize);
  session.root.removeEventListener('pointerdown',session.onPointer);
  session.root.removeEventListener('keydown',session.onKey);
  session.root.querySelector('#postMatchDetailsToggleV750')?.removeEventListener('click',session.onDetails);
  session.root.classList.add('hidden');session.root.setAttribute('aria-hidden','true');
  delete session.root.dataset.phase;delete session.root.dataset.scoreState;
  document.body.classList.remove('postmatch-cinematic-open-v748');
  if(!remember)startedMatches.delete(session.id);
  active=null;
}

export function isPostMatchCinematicOpenV750(){
  return !!active&&!active.closed&&!active.root.classList.contains('hidden');
}

export function resetPostMatchCinematicV748ForTests(){
  closePostMatchCinematicV750({remember:false});startedMatches.clear();
}

// Compatibilidad con llamadas antiguas: ahora abre de inmediato y no espera el final.
export async function playPostMatchCinematicV748(match){
  return {played:beginPostMatchCinematicV750(match)};
}

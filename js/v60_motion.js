/* TT RIVALS V60.1.0 — Motion & Feedback
   Sin MutationObserver. Las animaciones se disparan desde puntos explícitos de render.
*/

const reduceMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
const numberJobs=new WeakMap();
let rewardQueue=Promise.resolve();

function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function esc(value=''){return String(value).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}

export function initMotionV601(){
  document.documentElement.classList.add('v601-motion-ready');
  document.body?.classList.add('v601-motion-ready');
}

export function animateTabEnterV601(tab){
  const page=document.querySelector(`#tab-${tab}`);
  if(!page||reduceMotion())return;
  page.classList.remove('v601-tab-enter');
  void page.offsetWidth;
  page.classList.add('v601-tab-enter');
  setTimeout(()=>page.classList.remove('v601-tab-enter'),520);
}

export function animateNumberV601(el,target,{suffix='',duration=520,decimals=0}={}){
  if(!el)return;
  const end=Number(target);
  if(!Number.isFinite(end)){el.textContent=`${target}${suffix}`;return}
  const oldJob=numberJobs.get(el);
  if(oldJob)cancelAnimationFrame(oldJob.raf);
  const parsed=Number(String(el.dataset.v601Number??el.textContent??'').replace(/[^0-9+\-.]/g,''));
  const start=Number.isFinite(parsed)?parsed:end;
  el.dataset.v601Number=String(end);
  const delta=end-start;
  el.classList.remove('v601-number-up','v601-number-down');
  if(delta>0)el.classList.add('v601-number-up');
  if(delta<0)el.classList.add('v601-number-down');
  if(reduceMotion()||Math.abs(delta)<0.001){
    el.textContent=`${end.toFixed(decimals)}${suffix}`;
    return;
  }
  const started=performance.now();
  const ease=t=>1-Math.pow(1-t,3);
  const job={raf:0};
  const tick=now=>{
    const p=clamp((now-started)/duration,0,1);
    const value=start+delta*ease(p);
    el.textContent=`${value.toFixed(decimals)}${suffix}`;
    if(p<1)job.raf=requestAnimationFrame(tick);
    else{
      el.textContent=`${end.toFixed(decimals)}${suffix}`;
      setTimeout(()=>el.classList.remove('v601-number-up','v601-number-down'),650);
      numberJobs.delete(el);
    }
  };
  job.raf=requestAnimationFrame(tick);
  numberJobs.set(el,job);
}

export function animateProgressV601(el,value){
  if(!el)return;
  const pct=clamp(Number(value)||0,0,100);
  el.style.width=`${pct}%`;
  if(reduceMotion())return;
  el.classList.remove('v601-progress-pulse');
  void el.offsetWidth;
  el.classList.add('v601-progress-pulse');
  setTimeout(()=>el.classList.remove('v601-progress-pulse'),850);
}

export function animatePriorityV601(box,signature=''){
  if(!box||reduceMotion())return;
  const sig=String(signature||box.textContent||'').replace(/\s+/g,' ').trim().slice(0,180);
  if(box.dataset.v601Priority===sig)return;
  box.dataset.v601Priority=sig;
  box.classList.remove('v601-priority-change');
  void box.offsetWidth;
  box.classList.add('v601-priority-change');
  setTimeout(()=>box.classList.remove('v601-priority-change'),900);
}

export function animateListV601(container,selector=':scope > *',limit=18){
  if(!container||reduceMotion())return;
  const nodes=[...container.querySelectorAll(selector)].slice(0,limit);
  nodes.forEach((node,index)=>{
    node.classList.remove('v601-list-reveal');
    node.style.setProperty('--v601-delay',`${Math.min(index*32,320)}ms`);
    void node.offsetWidth;
    node.classList.add('v601-list-reveal');
  });
}

export function animateRankingMovementV601({container,position,mode='individual'}={}){
  if(!container||!Number.isFinite(Number(position)))return;
  const current=Number(position);
  const key=`tt-rivals-v601-rank-${mode}`;
  let previous=NaN;
  try{previous=Number(sessionStorage.getItem(key));sessionStorage.setItem(key,String(current))}catch{}
  const me=container.querySelector('.v60-rank-row.is-me');
  if(!me||!Number.isFinite(previous)||previous===current||reduceMotion())return;
  const up=current<previous;
  me.classList.add(up?'v601-rank-up':'v601-rank-down');
  const tag=document.createElement('span');
  tag.className='v601-rank-movement';
  tag.textContent=up?`↑ #${previous} → #${current}`:`↓ #${previous} → #${current}`;
  me.appendChild(tag);
  setTimeout(()=>{tag.classList.add('is-leaving');setTimeout(()=>tag.remove(),260)},2600);
  setTimeout(()=>me.classList.remove('v601-rank-up','v601-rank-down'),3200);
}

export function pulseProtectionReadyV601(card,ready){
  if(!card)return;
  const before=card.dataset.v601Shield==='1';
  card.dataset.v601Shield=ready?'1':'0';
  if(!ready||before||reduceMotion())return;
  card.classList.remove('v601-shield-earned');
  void card.offsetWidth;
  card.classList.add('v601-shield-earned');
  setTimeout(()=>card.classList.remove('v601-shield-earned'),1800);
}

function makeConfetti(host,count=16){
  if(reduceMotion())return;
  const wrap=document.createElement('div');
  wrap.className='v601-confetti';
  for(let i=0;i<count;i++){
    const p=document.createElement('i');
    p.style.setProperty('--v601-x',`${Math.round(-145+Math.random()*290)}px`);
    p.style.setProperty('--v601-y',`${Math.round(95+Math.random()*150)}px`);
    p.style.setProperty('--v601-r',`${Math.round(-180+Math.random()*360)}deg`);
    p.style.setProperty('--v601-d',`${Math.round(Math.random()*260)}ms`);
    p.style.setProperty('--v601-s',`${(0.65+Math.random()*0.75).toFixed(2)}`);
    wrap.appendChild(p);
  }
  host.appendChild(wrap);
  setTimeout(()=>wrap.remove(),1800);
}

export function animatePostMatchV601(modal,{won=false,positive=false,protectedElo=false,hasRewards=false}={}){
  if(!modal)return;
  modal.classList.remove('v601-post-motion','v601-post-victory','v601-post-positive','v601-post-protected','v601-post-rewarded');
  void modal.offsetWidth;
  modal.classList.add('v601-post-motion');
  if(won)modal.classList.add('v601-post-victory');
  if(positive)modal.classList.add('v601-post-positive');
  if(protectedElo)modal.classList.add('v601-post-protected');
  if(hasRewards)modal.classList.add('v601-post-rewarded');
  if(won)makeConfetti(modal.querySelector('.modal-card')||modal,18);
}

async function runRewardCelebration(reward){
  if(reduceMotion())return;
  const overlay=document.createElement('div');
  overlay.className=`v601-reward-celebration reward-${reward.kind||'achievement'}`;
  overlay.innerHTML=`<div class="v601-reward-backdrop"></div><article><span>${esc(reward.icon||'✦')}</span><small>${esc(reward.kicker||'NUEVO DESBLOQUEO')}</small><strong>${esc(reward.name||'Recompensa')}</strong><p>${esc(reward.detail||'Tu progreso competitivo avanzó.')}</p></article>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(()=>overlay.classList.add('show'));
  await sleep(1850);
  overlay.classList.remove('show');
  await sleep(260);
  overlay.remove();
}

export function celebrateRewardV601(reward){
  if(!reward)return;
  rewardQueue=rewardQueue.then(()=>runRewardCelebration(reward)).catch(()=>{});
}

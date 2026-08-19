import { supabase } from './supabase.js';

const V59_BUILD='59.0.0';
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];

let v59Session=null;
let timingRows=[];
let timingById=new Map();
let durationStats=null;
let liveTimer=null;
let refreshTimer=null;
let observer=null;

function esc(value=''){
  return String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function formatDuration(seconds,{compact=false}={}){
  const n=Number(seconds);
  if(!Number.isFinite(n)||n<0)return '—';
  const total=Math.round(n);
  const h=Math.floor(total/3600);
  const m=Math.floor((total%3600)/60);
  const s=total%60;
  if(compact){
    if(h)return `${h}h ${m}m`;
    if(m)return `${m}m ${String(s).padStart(2,'0')}s`;
    return `${s}s`;
  }
  if(h)return `${h} h ${m} min`;
  if(m)return `${m} min ${s} s`;
  return `${s} s`;
}

function goTab(tab){
  const nav=$(`.nav-item[data-tab="${tab}"]`);
  const shortcut=$(`[data-go-tab="${tab}"]`);
  if(nav){nav.click();return true;}
  if(shortcut){shortcut.click();return true;}
  return false;
}

function findSectionByText(text){
  const needle=text.toLowerCase();
  return $$('section,article,div').find(el=>{
    if(el.children.length>35)return false;
    return (el.textContent||'').trim().toLowerCase().includes(needle);
  })||null;
}

function handleV59Action(action){
  if(action==='play')return goTab('play');
  if(action==='stats')return goTab('stats');
  if(action==='ranking')return goTab('ranking');
  if(action==='doubles'){
    goTab('ranking');
    setTimeout(()=>{
      const doubles=$('[data-ranking-mode="dobles"]');
      if(doubles)doubles.click();
    },80);
    return;
  }
  if(action==='titles'){
    goTab('profile');
    setTimeout(()=>$('#profileChooseTitle')?.click(),100);
    return;
  }
  if(action==='protection'){
    goTab('home');
    setTimeout(()=>{
      const target=findSectionByText('protección de elo')
        || $('[id*="protection" i]')
        || $('[class*="protection" i]');
      if(target){
        target.scrollIntoView({behavior:'smooth',block:'center'});
        target.classList.add('v59-focus-pulse');
        setTimeout(()=>target.classList.remove('v59-focus-pulse'),1500);
      }
    },120);
  }
}

function createModeHub(){
  const home=$('#tab-home');
  if(!home||$('#v59ModeHub'))return;

  const season=$('#homeSeasonStrip');
  const anchor=season||$('.v15-home-layout',home);
  if(!anchor)return;

  const section=document.createElement('section');
  section.id='v59ModeHub';
  section.className='v59-mode-hub section-card';
  section.innerHTML=`
    <div class="v59-section-head">
      <div>
        <p class="muted-label">TU COMPETENCIA</p>
        <h3>Elegí cómo querés jugar</h3>
        <span>Cada modalidad tiene su propio camino. Tocá una tarjeta para explorar.</span>
      </div>
      <span class="v59-live-chip"><i></i> ACTIVO</span>
    </div>
    <div class="v59-mode-grid">
      <button class="v59-mode-card is-primary" data-v59-action="play" type="button">
        <span class="v59-mode-icon">⚔</span>
        <div class="v59-mode-copy">
          <small>INDIVIDUAL · 1VS1</small>
          <strong id="v59IndividualRating">— Elo</strong>
          <span id="v59IndividualRank">Tu ranking individual</span>
        </div>
        <b>Jugar ahora <em>→</em></b>
      </button>
      <button class="v59-mode-card is-doubles" data-v59-action="doubles" type="button">
        <span class="v59-mode-icon">👥</span>
        <div class="v59-mode-copy">
          <small>DOBLES · 2VS2</small>
          <strong id="v59DoublesRating">— Elo</strong>
          <span id="v59DoublesRank">Tu ranking de dobles</span>
        </div>
        <b>Explorar dobles <em>→</em></b>
      </button>
    </div>
    <div class="v59-discovery-dock" aria-label="Accesos rápidos">
      <button type="button" data-v59-action="ranking"><span>#</span><div><strong>Ranking</strong><small>Ver quién está arriba</small></div><b>›</b></button>
      <button type="button" data-v59-action="stats"><span>⌁</span><div><strong>Estadísticas</strong><small>Descubrí tus números</small></div><b>›</b></button>
      <button type="button" data-v59-action="titles"><span>✦</span><div><strong>Títulos</strong><small>Qué te falta desbloquear</small></div><b>›</b></button>
      <button type="button" data-v59-action="protection"><span>♢</span><div><strong>Protección</strong><small>Estado de tu escudo Elo</small></div><b>›</b></button>
    </div>`;

  anchor.insertAdjacentElement('afterend',section);

  const legacyDoubles=$('#homeDoublesRating')?.closest('.v15-mini-panel');
  if(legacyDoubles)legacyDoubles.classList.add('v59-legacy-doubles-source');
  $('.v15-home-footer-grid')?.classList.add('v59-footer-clean');
  syncModeHub();
}

function syncModeHub(){
  const individual=$('#homeIndividualRating')?.textContent?.trim();
  const individualRank=$('#homeIndividualRank')?.textContent?.trim();
  const doubles=$('#homeDoublesRating')?.textContent?.trim();
  const doublesRank=$('#homeDoublesRank')?.textContent?.trim();

  if($('#v59IndividualRating'))$('#v59IndividualRating').textContent=individual?`${individual.replace(/\s*Elo$/i,'')} Elo`:'— Elo';
  if($('#v59IndividualRank'))$('#v59IndividualRank').textContent=individualRank||'Ranking individual';
  if($('#v59DoublesRating'))$('#v59DoublesRating').textContent=doubles?`${doubles.replace(/\s*Elo$/i,'')} Elo`:'— Elo';
  if($('#v59DoublesRank'))$('#v59DoublesRank').textContent=doublesRank||'Ranking de dobles';
}

function enhanceClickableSurfaces(){
  $$('.section-card').forEach(card=>{
    if(card.classList.contains('v59-enhanced'))return;
    card.classList.add('v59-enhanced');
  });
  $$('button').forEach(btn=>btn.classList.add('v59-button-feel'));
}

async function fetchTimingRows(){
  if(!v59Session?.user?.id)return;
  const uid=v59Session.user.id;
  const {data,error}=await supabase
    .from('matches')
    .select('id,player1_id,player2_id,match_format,result_status,completion_type,created_at,started_at,result_submitted_at,confirmed_at,gameplay_seconds,duration_seconds,duration_minimum_seconds_v59,duration_risk_score_v59,duration_anomaly_v59')
    .or(`player1_id.eq.${uid},player2_id.eq.${uid}`)
    .order('created_at',{ascending:false})
    .limit(300);
  if(error)throw error;
  timingRows=data||[];
  timingById=new Map(timingRows.map(row=>[Number(row.id),row]));
}

async function fetchDurationStats(){
  if(!v59Session?.user)return;
  const {data,error}=await supabase.rpc('get_my_duration_stats_v59');
  if(error)throw error;
  durationStats=data||{};
}

function renderDurationStats(){
  const statsTab=$('#tab-stats');
  if(!statsTab||!durationStats)return;
  let section=$('#v59DurationStats');
  if(!section){
    section=document.createElement('section');
    section.id='v59DurationStats';
    section.className='section-card v59-duration-stats';
    const grid=$('.stats-grid',statsTab);
    if(grid)grid.insertAdjacentElement('afterend',section);
    else statsTab.prepend(section);
  }

  const s=durationStats;
  const measured=Number(s.measured_matches||0);
  const fast=Number(s.fast_flags||0);
  const cleanPct=measured?Math.max(0,Math.round((measured-fast)*100/measured)):100;

  section.innerHTML=`
    <div class="v59-section-head">
      <div>
        <p class="muted-label">TIEMPO DE JUEGO</p>
        <h3>Cuánto duran tus partidos</h3>
        <span>Desde que el desafío queda aceptado hasta la confirmación final.</span>
      </div>
      <span class="v59-timing-badge">${measured} medidos</span>
    </div>
    <div class="v59-duration-grid">
      <article><span>⏱</span><small>Duración media</small><strong>${formatDuration(s.average_duration_seconds,{compact:true})}</strong><em>inicio → confirmación</em></article>
      <article><span>⚡</span><small>Más rápido</small><strong>${formatDuration(s.shortest_duration_seconds,{compact:true})}</strong><em>récord de tiempo</em></article>
      <article><span>⌛</span><small>Más largo</small><strong>${formatDuration(s.longest_duration_seconds,{compact:true})}</strong><em>máxima duración</em></article>
      <article class="${fast?'has-alert':''}"><span>◉</span><small>Ritmo normal</small><strong>${cleanPct}%</strong><em>${fast?`${fast} señal${fast===1?'':'es'} rápida${fast===1?'':'s'}`:'sin señales rápidas'}</em></article>
    </div>
    <div class="v59-format-times">
      <span><b>1 set</b> ${formatDuration(s.single_average_seconds,{compact:true})}</span>
      <span><b>Bo3</b> ${formatDuration(s.bo3_average_seconds,{compact:true})}</span>
      <span><b>Bo5</b> ${formatDuration(s.bo5_average_seconds,{compact:true})}</span>
    </div>`;
}

function currentElapsed(row){
  if(!row?.started_at)return null;
  const start=new Date(row.started_at).getTime();
  if(!Number.isFinite(start))return null;
  const end=row.confirmed_at?new Date(row.confirmed_at).getTime():Date.now();
  return Math.max(0,Math.floor((end-start)/1000));
}

function timingLabel(row){
  if(!row)return null;
  if(row.result_status==='pending'){
    return {text:`⏱ En juego · ${formatDuration(currentElapsed(row),{compact:true})}`,kind:'live'};
  }
  if(row.result_status==='awaiting_confirmation'){
    return {text:`✓ Resultado cargado en ${formatDuration(row.gameplay_seconds,{compact:true})}`,kind:row.duration_anomaly_v59?'alert':'waiting'};
  }
  if(row.result_status==='disputed'){
    return {text:`⚖ En disputa · resultado cargado en ${formatDuration(row.gameplay_seconds,{compact:true})}`,kind:'waiting'};
  }
  if(row.result_status==='confirmed'){
    return {text:`⏱ ${formatDuration(row.duration_seconds,{compact:true})}`,kind:row.duration_anomaly_v59?'alert':'done'};
  }
  return null;
}

function decorateActiveMatches(){
  const rows=$$('#activeMatches .match-row');
  if(!rows.length)return;
  const active=timingRows.filter(m=>m.result_status!=='confirmed'&&m.result_status!=='annulled');
  rows.forEach((el,index)=>{
    const row=active[index];
    if(!row)return;
    el.dataset.v59MatchId=row.id;
    let pill=$('.v59-match-time',el);
    if(!pill){
      pill=document.createElement('span');
      pill.className='v59-match-time';
      $('.match-meta',el)?.appendChild(pill);
    }
    const info=timingLabel(row);
    if(info){
      pill.textContent=info.text;
      pill.dataset.kind=info.kind;
    }
  });
}

function decorateHistory(){
  $$('#matchHistoryList .history-match-card').forEach(card=>{
    const id=Number($('[data-match-detail]',card)?.dataset.matchDetail);
    if(!id)return;
    const row=timingById.get(id);
    if(!row)return;
    let pill=$('.v59-history-duration',card);
    if(!pill){
      pill=document.createElement('span');
      pill.className='v59-history-duration';
      const opponent=$('.history-opponent',card);
      if(opponent)opponent.appendChild(pill);
      else card.appendChild(pill);
    }
    const info=timingLabel(row);
    pill.textContent=info?.text||'⏱ Duración no disponible';
    pill.dataset.kind=info?.kind||'unknown';
  });
}

function decorateMatchDetail(){
  ['#matchDetailContent','#postMatchContent'].forEach(selector=>{
    const content=$(selector);
    if(!content||!content.children.length)return;
    const id=Number($('[data-rematch]',content)?.dataset.rematch);
    if(!id)return;
    const row=timingById.get(id);
    if(!row||$('.v59-detail-duration',content))return;

    const box=document.createElement('div');
    box.className='v59-detail-duration';
    box.innerHTML=`
      <div><span>⏱</span><small>Duración del partido</small><strong>${formatDuration(row.duration_seconds)}</strong></div>
      <div><span>✓</span><small>Resultado cargado en</small><strong>${formatDuration(row.gameplay_seconds)}</strong></div>
      ${row.duration_anomaly_v59?'<p>Esta duración quedó marcada como señal automática de integridad. No invalida el partido por sí sola.</p>':''}`;
    const target=$('.match-detail-meta',content)||$('.post-match-result',content)||content.firstElementChild;
    target?.insertAdjacentElement('afterend',box);
  });
}

function decorateAll(){
  createModeHub();
  syncModeHub();
  enhanceClickableSurfaces();
  renderDurationStats();
  decorateActiveMatches();
  decorateHistory();
  decorateMatchDetail();
}

async function refreshV59Data({quiet=true}={}){
  if(!v59Session?.user)return;
  try{
    await Promise.all([fetchTimingRows(),fetchDurationStats()]);
    decorateAll();
  }catch(err){
    if(!quiet)console.error('[TT Rivals V59]',err);
  }
}

function scheduleRefresh(){
  clearTimeout(refreshTimer);
  refreshTimer=setTimeout(()=>refreshV59Data(),180);
}

function startObserver(){
  if(observer)return;
  observer=new MutationObserver(()=>{
    decorateAll();
    scheduleRefresh();
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
}

function startLiveClock(){
  if(liveTimer)clearInterval(liveTimer);
  liveTimer=setInterval(()=>{
    decorateActiveMatches();
    syncModeHub();
  },1000);
}

function wireEvents(){
  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-v59-action]');
    if(action){
      event.preventDefault();
      handleV59Action(action.dataset.v59Action);
      return;
    }

    if(event.target.closest('[data-confirm-match],[data-enter-result],[data-response],[data-dispute-match],[data-rematch]')){
      setTimeout(()=>refreshV59Data(),650);
      setTimeout(()=>refreshV59Data(),1800);
    }
  },true);
}

async function bootV59(){
  document.documentElement.dataset.ttV59=V59_BUILD;
  createModeHub();
  decorateAll();
  wireEvents();
  startObserver();
  startLiveClock();

  const {data}=await supabase.auth.getSession();
  v59Session=data?.session||null;
  if(v59Session?.user)await refreshV59Data({quiet:false});

  supabase.auth.onAuthStateChange((_event,session)=>{
    v59Session=session;
    if(session?.user)setTimeout(()=>refreshV59Data(),100);
  });

  // Actualización liviana. Evita recargar toda la app y mantiene duraciones al día.
  setInterval(()=>refreshV59Data(),30000);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',bootV59,{once:true});
}else{
  bootV59();
}

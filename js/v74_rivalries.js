import { supabase } from './supabase.js';

let initialized=false;
let cache={at:0,rivalries:[],streaks:null};
const CACHE_MS=30000;
const $=selector=>document.querySelector(selector);

function esc(value=''){
  return String(value).replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  })[char]);
}
function number(value){return Number(value||0)}
function fullName(row){
  const name=[row?.first_name,row?.last_name].filter(Boolean).join(' ').trim();
  return name||row?.username||'Rival';
}
function initials(row){
  return fullName(row).split(/\s+/).slice(0,2).map(part=>part[0]||'').join('').toUpperCase()||'TT';
}
function avatar(row,className=''){
  const photo=String(row?.profile_photo_url||'').trim();
  return photo
    ? '<span class="v74r-avatar '+esc(className)+'"><img src="'+esc(photo)+'" alt=""></span>'
    : '<span class="v74r-avatar '+esc(className)+'"><b>'+esc(initials(row))+'</b></span>';
}
function dateLabel(value){
  if(!value)return 'Sin fecha';
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return 'Sin fecha';
  return new Intl.DateTimeFormat('es-UY',{day:'2-digit',month:'short',year:'numeric'}).format(date);
}
function levelLabel(level){
  return ({
    classic:'CLÁSICO PAREJO',
    consolidated:'RIVALIDAD CONSOLIDADA',
    growing:'EN CRECIMIENTO',
    new:'NUEVO CRUCE',
    insufficient:'EN FORMACIÓN'
  })[level]||'RIVALIDAD REAL';
}
function recentHtml(recent=[]){
  return recent.length
    ? '<div class="v74r-recent" aria-label="Últimos resultados">'+recent.map(item=>
        '<span class="'+(item.won?'win':'loss')+'" title="'+esc(dateLabel(item.played_at))+' · '+number(item.my_sets)+'-'+number(item.opponent_sets)+'">'+(item.won?'V':'D')+'</span>'
      ).join('')+'</div>'
    : '<small class="v74r-muted">Todavía no hay resultados oficiales.</small>';
}
function resultRun(row){
  const recent=Array.isArray(row?.recent)?row.recent:[];
  if(!recent.length)return {owner:null,count:0};
  const first=!!recent[0].won;
  let count=0;
  for(const item of recent){
    if(!!item.won!==first)break;
    count++;
  }
  return {owner:first?'me':'opponent',count};
}

export function buildRivalryNarrativeV74(row){
  const total=number(row?.total);
  if(total<2)return ['Todavía no hay suficientes cruces oficiales para formar una rivalidad.'];
  const wins=number(row?.wins),losses=number(row?.losses);
  const mySets=number(row?.my_sets),theirSets=number(row?.opponent_sets);
  const name=fullName(row);
  const lines=[];

  if(wins===losses)lines.push('La serie con '+name+' está completamente igualada: '+wins+' a '+losses+'.');
  else if(wins>losses)lines.push('Llevás la ventaja ante '+name+': '+wins+' victorias contra '+losses+'.');
  else lines.push(name+' lidera el historial '+losses+' a '+wins+'. Es un cruce de exigencia alta.');

  const setGap=Math.abs(mySets-theirSets);
  if(setGap<=2)lines.push('También están muy parejos en sets: '+mySets+'–'+theirSets+'.');
  else if(mySets>theirSets)lines.push('Tu diferencia acumulada de sets es favorable: '+mySets+'–'+theirSets+'.');
  else lines.push('El principal margen a recuperar está en los sets: '+mySets+'–'+theirSets+'.');

  const run=row?.current_run_owner
    ? {owner:row.current_run_owner,count:number(row.current_run)}
    : resultRun(row);
  if(run.count>=2){
    lines.push(run.owner==='me'
      ? 'Llegás con '+run.count+' victorias seguidas en este cara a cara.'
      : name+' ganó los últimos '+run.count+' enfrentamientos.');
  }else{
    const last=Array.isArray(row?.recent)&&row.recent[0];
    if(last)lines.push(last.won?'Ganaste el cruce más reciente.':'El último enfrentamiento quedó para '+name+'.');
  }

  return lines.slice(0,3);
}

function preparationHtml(row){
  const recent=Array.isArray(row?.recent)?row.recent.slice(0,5):[];
  const recentWins=recent.filter(item=>item.won).length;
  const name=fullName(row);
  let focus='Tomá el próximo partido como una nueva muestra: el historial da contexto, pero no decide el resultado.';
  if(recent.length>=3&&recentWins<=1)focus='Preparación recomendada: priorizá un comienzo seguro y evitá regalar los primeros sets ante '+name+'.';
  else if(recent.length>=3&&recentWins>=4)focus='Venís dominando los cruces recientes. Conservá el patrón que te dio la ventaja sin subestimar el ajuste rival.';
  else if(Math.abs(number(row?.my_sets)-number(row?.opponent_sets))<=2)focus='La diferencia está en detalles: saque, recepción y cierre de sets deberían ser el foco previo.';
  return '<section class="v74r-coach"><span>✦</span><div><small>TT COACH · SIN TOKENS</small><p>'+esc(focus)+'</p></div></section>';
}

export async function getPlayerCompetitiveStreaksV74(playerId){
  const {data,error}=await supabase.rpc('get_player_competitive_streaks_v74',{p_player_id:playerId||null});
  if(error)throw error;
  return data||null;
}
export async function getMyRivalriesV74(limit=6){
  const {data,error}=await supabase.rpc('get_my_rivalries_v74',{p_limit:limit});
  if(error)throw error;
  return Array.isArray(data)?data:(data?.rivalries||[]);
}
export async function getCompetitiveRivalryV74(opponentId){
  const {data,error}=await supabase.rpc('get_competitive_rivalry_v74',{p_opponent_id:opponentId});
  if(error)throw error;
  return data||null;
}
export function invalidateRivalriesV74(){cache.at=0}

function renderStreaks(streaks){
  const root=$('#competitiveStreaksV74');
  if(!root)return;
  const individual=streaks?.individual||{};
  const doubles=streaks?.doubles||{};
  root.innerHTML=
    '<article class="v74r-streak-card individual">'+
      '<span>INDIVIDUAL</span><strong>'+number(individual.current)+'</strong><small>racha actual · mejor '+number(individual.best)+'</small>'+
      '<em>'+number(individual.played)+' partidos oficiales medidos</em>'+
    '</article>'+
    '<article class="v74r-streak-card doubles">'+
      '<span>DOBLES</span><strong>'+number(doubles.current)+'</strong><small>racha actual · mejor '+number(doubles.best)+'</small>'+
      '<em>'+number(doubles.played)+' partidos oficiales medidos</em>'+
    '</article>'+
    '<p class="v74r-rule">Las casuales no suman ni cortan ninguna racha. Individual y dobles se calculan por separado.</p>';
}
function cardHtml(row,index){
  const name=fullName(row);
  const lead=number(row.wins)-number(row.losses);
  return '<article class="v74r-card '+(index===0?'is-primary':'')+'">'+
    '<div class="v74r-card-head">'+avatar(row)+
      '<div><small>'+(index===0?'RIVALIDAD PRINCIPAL AUTOMÁTICA':levelLabel(row.level))+'</small>'+
      '<h4>'+esc(name)+'</h4><span>@'+esc(row.username||'jugador')+'</span></div>'+
      '<b>'+esc(levelLabel(row.level))+'</b>'+
    '</div>'+
    '<div class="v74r-score"><div><span>VOS</span><strong>'+number(row.wins)+'</strong></div><i>—</i><div><span>'+esc((row.first_name||'RIVAL').toUpperCase())+'</span><strong>'+number(row.losses)+'</strong></div></div>'+
    '<div class="v74r-meta"><span>'+number(row.total)+' cruces</span><span>Sets '+number(row.my_sets)+'–'+number(row.opponent_sets)+'</span><span class="'+(lead>=0?'positive':'negative')+'">'+(lead>0?'+':'')+lead+' balance</span></div>'+
    recentHtml(row.recent||[])+
    '<div class="v74r-actions"><button type="button" data-rivalry-detail-v74="'+esc(row.opponent_id)+'">Ver cara a cara</button>'+
    '<button type="button" class="soft" data-open-player="'+esc(row.opponent_id)+'">Ver perfil</button></div>'+
  '</article>';
}
function renderRivalries(rows){
  const root=$('#rivalriesGridV74');
  const count=$('#rivalriesCountV74');
  if(count)count.textContent=rows.length+' '+(rows.length===1?'rivalidad':'rivalidades');
  if(!root)return;
  root.innerHTML=rows.length
    ? rows.map(cardHtml).join('')
    : '<div class="v74r-empty"><span>◎</span><strong>Tus rivalidades todavía se están formando</strong><p>Aparecen automáticamente después de dos partidos competitivos verificados contra la misma persona.</p></div>';
}

function friendlyLoadError(error){
  const message=String(error?.message||'');
  if(/function|get_my_rivalries_v74|get_player_competitive_streaks_v74|schema cache|PGRST202/i.test(message)){
    return 'La interfaz P7.4 está lista. Falta ejecutar el SQL de Rivalidades reales en Supabase.';
  }
  return 'No pudimos actualizar las rivalidades en este momento.';
}
function renderLoadError(error){
  const text=friendlyLoadError(error);
  const grid=$('#rivalriesGridV74');
  const streaks=$('#competitiveStreaksV74');
  if(grid)grid.innerHTML='<div class="v74r-empty is-error"><strong>Rivalidades no disponibles</strong><p>'+esc(text)+'</p><button type="button" data-refresh-rivalries-v74>Reintentar</button></div>';
  if(streaks)streaks.innerHTML='<p class="v74r-rule is-error">'+esc(text)+'</p>';
}

export async function loadRivalriesV74(force=false){
  const now=Date.now();
  if(!force&&cache.at&&now-cache.at<CACHE_MS){
    renderStreaks(cache.streaks);
    renderRivalries(cache.rivalries);
    return cache;
  }
  const sessionResult=await supabase.auth.getSession();
  const user=sessionResult?.data?.session?.user;
  if(!user)return null;
  const grid=$('#rivalriesGridV74');
  if(grid)grid.innerHTML='<div class="loading-row">Reconstruyendo tus cara a cara oficiales…</div>';
  try{
    const result=await Promise.all([
      getMyRivalriesV74(6),
      getPlayerCompetitiveStreaksV74(user.id)
    ]);
    cache={at:Date.now(),rivalries:result[0]||[],streaks:result[1]||null};
    renderStreaks(cache.streaks);
    renderRivalries(cache.rivalries);
    return cache;
  }catch(error){
    console.warn('P7.4 Rivalidades:',error);
    renderLoadError(error);
    throw error;
  }
}

function setModalOpen(open){
  const modal=$('#rivalryModalV74');
  if(!modal)return;
  modal.classList.toggle('hidden',!open);
  if(open)document.body.classList.add('modal-open');
  else if(!Array.from(document.querySelectorAll('.modal')).some(item=>!item.classList.contains('hidden')))document.body.classList.remove('modal-open');
}
async function openRivalry(opponentId){
  const modal=$('#rivalryModalV74');
  const content=$('#rivalryModalContentV74');
  if(!modal||!content)return;
  setModalOpen(true);
  content.innerHTML='<div class="loading-row">Preparando el análisis del rival…</div>';
  try{
    const row=await getCompetitiveRivalryV74(opponentId);
    const narratives=buildRivalryNarrativeV74(row);
    content.innerHTML=
      '<div class="v74r-detail-head">'+avatar(row,'large')+
        '<div><p class="muted-label">'+esc(levelLabel(row.level))+'</p><h2>'+esc(fullName(row))+'</h2><span>@'+esc(row.username||'jugador')+' · '+number(row.total)+' cruces oficiales</span></div>'+
      '</div>'+
      '<section class="v74r-detail-score"><div><small>VOS</small><strong>'+number(row.wins)+'</strong></div><i>VS</i><div><small>'+esc((row.first_name||'RIVAL').toUpperCase())+'</small><strong>'+number(row.losses)+'</strong></div></section>'+
      '<div class="v74r-detail-stats">'+
        '<article><span>SETS</span><strong>'+number(row.my_sets)+'–'+number(row.opponent_sets)+'</strong></article>'+
        '<article><span>RP NETO</span><strong class="'+(number(row.net_elo)>=0?'positive':'negative')+'">'+(number(row.net_elo)>0?'+':'')+number(row.net_elo)+'</strong></article>'+
        '<article><span>MEJOR RACHA</span><strong>'+number(row.best_win_streak)+'</strong></article>'+
      '</div>'+
      '<section class="v74r-story"><small>LECTURA DE LA RIVALIDAD</small>'+narratives.map(line=>'<p>'+esc(line)+'</p>').join('')+'</section>'+
      preparationHtml(row)+
      '<section class="v74r-detail-recent"><div><small>ÚLTIMOS CRUCES</small><span>Ranked '+number(row.ranked_matches)+' · Torneos '+number(row.tournament_matches)+'</span></div>'+recentHtml(row.recent||[])+'</section>'+
      '<div class="v74r-detail-actions"><button type="button" class="btn btn-start" data-public-challenge="'+esc(row.opponent_id)+'" data-name="'+esc(fullName(row))+'" data-user="'+esc(row.username||'jugador')+'">DESAFIAR</button>'+
      '<button type="button" class="secondary-action-button" data-open-player="'+esc(row.opponent_id)+'">VER PERFIL</button></div>';
  }catch(error){
    content.innerHTML='<div class="v74r-empty is-error"><strong>No se pudo abrir el análisis</strong><p>'+esc(friendlyLoadError(error))+'</p></div>';
  }
}
function openCoach(){
  const modal=$('#rivalryModalV74');
  const content=$('#rivalryModalContentV74');
  if(!modal||!content)return;
  setModalOpen(true);
  if(!cache.rivalries.length){
    content.innerHTML='<div class="v74r-empty"><span>◎</span><strong>Análisis de rivales</strong><p>Necesitás al menos dos cruces oficiales contra una misma persona. No usa tokens ni envía tus datos a un modelo.</p></div>';
    loadRivalriesV74().catch(()=>{});
    return;
  }
  const cards=cache.rivalries.map((row,index)=>{
    const story=buildRivalryNarrativeV74(row)[0]||'Rivalidad en formación.';
    return '<button type="button" class="v74r-coach-choice" data-rivalry-detail-v74="'+esc(row.opponent_id)+'">'+avatar(row)+
      '<span><small>'+(index===0?'RIVAL PRINCIPAL':levelLabel(row.level))+'</small><strong>'+esc(fullName(row))+'</strong><em>'+esc(story)+'</em></span><b>→</b></button>';
  }).join('');
  content.innerHTML='<div class="v74r-coach-index"><p class="muted-label">TT INTELLIGENCE · SIN TOKENS</p><h2>Análisis de rivales</h2><p>Elegí una rivalidad para ver historial, momento de la serie y preparación sugerida.</p><div>'+cards+'</div></div>';
}

function onClick(event){
  const detail=event.target.closest('[data-rivalry-detail-v74]');
  if(detail){event.preventDefault();openRivalry(detail.dataset.rivalryDetailV74);return}
  if(event.target.closest('[data-ai-rivalries-v74]')){event.preventDefault();openCoach();return}
  if(event.target.closest('[data-close-rivalry-v74]')||event.target.id==='rivalryModalV74'){setModalOpen(false);return}
  if(event.target.closest('[data-refresh-rivalries-v74]')){loadRivalriesV74(true).catch(()=>{});return}
  if(event.target.closest('#rivalryModalV74 [data-open-player],#rivalryModalV74 [data-public-challenge]')){
    setModalOpen(false);
  }
}
export function initRivalriesV74(){
  if(initialized)return;
  initialized=true;
  document.addEventListener('click',onClick);
  const observer=new MutationObserver(()=>{
    const tab=document.body.dataset.activeTabV101;
    if(tab==='profile'||tab==='ai')loadRivalriesV74().catch(()=>{});
  });
  observer.observe(document.body,{attributes:true,attributeFilter:['data-active-tab-v101']});
  window.addEventListener('tt-v62-doubles-confirmed',()=>{
    invalidateRivalriesV74();
    loadRivalriesV74(true).catch(()=>{});
  });
}

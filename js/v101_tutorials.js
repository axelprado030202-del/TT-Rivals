const VERSION='2';
const GUIDES={
  play:{icon:'＋',kicker:'PRIMEROS PASOS',title:'Tu centro para jugar',steps:[
    {target:'#tab-play .play-primary-actions-v751',title:'Elegí cómo competir',text:'Usá 1 vs 1 para un desafío individual, 2 vs 2 para armar parejas o Torneos para una competencia organizada.'},
    {target:'#playProgressHubV751',title:'Seguí tu avance',text:'Acá ves los RP que faltan para el próximo rango y el estado de tu Protección de RP.'},
    {target:'#tab-play .play-activity-v751',title:'Todo lo pendiente, junto',text:'Invitaciones recibidas, desafíos enviados y resultados que necesitan tu atención aparecen en este panel.'}]},
  ranking:{icon:'⌁',kicker:'CLASIFICACIÓN',title:'Entendé el Ranking',steps:[
    {target:'#tab-ranking .ranking-season-header',title:'Tu temporada',text:'Revisá cuánto falta para que termine la temporada, tu posición y los premios disponibles.'},
    {target:'#tab-ranking .segmented',title:'Dos rankings diferentes',text:'Cambiá entre Individual y Dobles. Los RP y la posición se calculan por separado.'},
    {target:'#rankingSearchBox',title:'Encontrá y desafiá',text:'Buscá a cualquier jugador por nombre o usuario y abrí su perfil para desafiarlo.'}]},
  training:{icon:'⏱',kicker:'ENTRENAMIENTO',title:'Usá el cronómetro',steps:[
    {target:'#tab-training .training-clock-shell-v53',title:'Tu tiempo de trabajo',text:'El reloj muestra el tiempo restante y reinicia el ciclo automáticamente al llegar a cero.'},
    {target:'#tab-training .training-config-grid-v53',title:'Configurá el ciclo',text:'Elegí minutos, segundos y cantidad total de repeticiones antes de comenzar.'},
    {target:'#tab-training .training-controls-v53',title:'Control simple',text:'Play comienza o reanuda, Stop pausa exactamente donde quedó y Reiniciar vuelve al inicio.'}]},
  history:{icon:'≡',kicker:'TUS PARTIDOS',title:'Leé tu Historial',steps:[
    {target:'#tab-history .history-summary-grid',title:'Resumen inmediato',text:'Partidos, victorias, derrotas y abandonos confirmados se resumen acá.'},
    {target:'#tab-history .history-filter-bar',title:'Filtrá sin perderte',text:'Separá modalidad, tipo de partido, resultado, rival, temporada y fechas.'},
    {target:'#tab-history .v15-history-shell',title:'Abrí cada resultado',text:'Cada partido conserva sus sets, cambio de RP y los demás detalles disponibles.'}]},
  profile:{icon:'◫',kicker:'TU IDENTIDAD',title:'Conocé tu Perfil',steps:[
    {target:'#tab-profile .v15-profile-hero',title:'Tu identidad competitiva',text:'Tu nombre, club, rango y elementos equipados forman la tarjeta principal del perfil.'},
    {target:'#tab-profile .profile-rating-grid',title:'Tu rendimiento',text:'Acá ves RP individual y de dobles, posición global y racha actual.'},
    {target:'#tab-profile .profile-hub-menu-wrap-v743',title:'Información ordenada',text:'Estadísticas, misiones, logros, rivalidades, temporadas y datos del jugador se abren por separado.'}]},
  settings:{icon:'⚙',kicker:'TU EXPERIENCIA',title:'Configuración',steps:[
    {target:'#tab-settings .settings-feedback-hub-v101',title:'Ayudanos a mejorar',text:'Desde estas tarjetas podés informar un problema o enviarnos una idea con su contexto.'},
    {target:'#tab-settings .settings-accordion',title:'Todo es ajustable',text:'Personalizá apariencia, rendimiento, partidos, notificaciones, privacidad, perfil y cuenta.'}]},
  ai:{icon:'✦',kicker:'TT RIVALS INTELLIGENCE',title:'Asistente de IA',steps:[
    {target:'#tab-ai .ai-assistant-hero-v61',title:'Tu asistente competitivo',text:'Las herramientas usan tu contexto deportivo para ayudarte a entrenar y analizar tu evolución.'},
    {target:'#tab-ai .ai-feature-grid-v61',title:'Elegí una herramienta',text:'Las tarjetas indican qué funciones están disponibles, en beta o todavía en desarrollo.'}]},
  activity:{icon:'🔔',kicker:'CENTRO DE ACTIVIDAD',title:'Tus notificaciones',steps:[
    {target:'#activityCenterModal .v60-activity-summary',title:'Lo urgente primero',text:'Los contadores separan lo pendiente, lo no leído y la actividad reciente.'},
    {target:'#activityCenterModal .v60-activity-tabs',title:'Elegí qué revisar',text:'Filtrá lo que requiere atención, las novedades recientes o toda tu actividad.'}]}
};

let active=null;
const key=(id,userId)=>`tt-rivals-guide-v${VERSION}:${userId||'guest'}:${id}`;
const seen=(id,userId)=>{try{return localStorage.getItem(key(id,userId))==='1'}catch{return false}};
const mark=(id,userId)=>{try{localStorage.setItem(key(id,userId),'1')}catch{}};
const esc=(value='')=>String(value).replace(/[&<>\"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[char]));
const visible=element=>{
  if(!element)return false;
  const style=getComputedStyle(element),rect=element.getBoundingClientRect();
  return style.display!=='none'&&style.visibility!=='hidden'&&rect.width>1&&rect.height>1;
};

function removeListeners(){
  if(!active)return;
  window.removeEventListener('resize',active.reposition);
  window.removeEventListener('scroll',active.reposition,true);
}

function close(){
  if(!active)return;
  mark(active.id,active.userId);
  removeListeners();
  active.root.remove();
  active=null;
  document.body.classList.remove('tt-guide-open-v101');
}

function place(){
  if(!active)return;
  const {root,target}=active;
  const spot=root.querySelector('[data-guide-spotlight-v101]');
  const card=root.querySelector('[data-guide-card-v101]');
  if(!visible(target)){
    spot.hidden=true;
    card.style.left='50%';card.style.top='50%';card.style.transform='translate(-50%,-50%)';card.style.visibility='visible';
    return;
  }
  spot.hidden=false;
  const padding=8,rect=target.getBoundingClientRect();
  const left=Math.max(8,rect.left-padding),top=Math.max(8,rect.top-padding);
  const right=Math.min(innerWidth-8,rect.right+padding),bottom=Math.min(innerHeight-8,rect.bottom+padding);
  Object.assign(spot.style,{left:`${left}px`,top:`${top}px`,width:`${Math.max(20,right-left)}px`,height:`${Math.max(20,bottom-top)}px`});

  card.style.transform='none';card.style.visibility='hidden';card.style.left='12px';card.style.top='12px';
  const cardRect=card.getBoundingClientRect(),gap=18,margin=12;
  let cardLeft=Math.min(Math.max(margin,left+(right-left-cardRect.width)/2),innerWidth-cardRect.width-margin);
  let cardTop=bottom+gap;
  if(cardTop+cardRect.height>innerHeight-margin)cardTop=top-gap-cardRect.height;
  if(cardTop<margin){
    const rightSpace=innerWidth-right;
    if(rightSpace>=cardRect.width+gap){cardLeft=right+gap;cardTop=Math.min(Math.max(margin,top),innerHeight-cardRect.height-margin)}
    else if(left>=cardRect.width+gap){cardLeft=left-gap-cardRect.width;cardTop=Math.min(Math.max(margin,top),innerHeight-cardRect.height-margin)}
    else cardTop=Math.max(margin,innerHeight-cardRect.height-margin);
  }
  Object.assign(card.style,{left:`${cardLeft}px`,top:`${cardTop}px`,visibility:'visible'});
}

let paintSequence=0;
async function paint(){
  if(!active)return;
  const sequence=++paintSequence;
  const {root,guide,index}=active,step=guide.steps[index];
  root.querySelector('[data-guide-content-v101]').innerHTML=`<div class="tt-guide-mini-icon-v101">${esc(guide.icon)}</div><div><p>${esc(guide.kicker)}</p><h2>${esc(index?step.title:guide.title)}</h2>${index?'':`<h3>${esc(step.title)}</h3>`}<div class="tt-guide-copy-v101">${esc(step.text)}</div></div>`;
  root.querySelector('[data-guide-count-v101]').textContent=`${index+1} de ${guide.steps.length}`;
  root.querySelector('[data-guide-prev-v101]').hidden=index===0;
  root.querySelector('[data-guide-next-v101]').textContent=index===guide.steps.length-1?'ENTENDIDO':'SIGUIENTE';
  root.querySelector('[data-guide-dots-v101]').innerHTML=guide.steps.map((_,i)=>`<i class="${i===index?'active':''}"></i>`).join('');
  active.target=document.querySelector(step.target);
  if(visible(active.target))active.target.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});
  await new Promise(resolve=>setTimeout(resolve,visible(active.target)?340:20));
  if(!active||sequence!==paintSequence)return;
  place();
}

export function maybeShowTutorialV101(id,userId){
  const guide=GUIDES[id];if(!guide||active||seen(id,userId))return false;
  const root=document.createElement('div');root.className='tt-guide-overlay-v101';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');
  root.innerHTML=`<div class="tt-guide-spotlight-v101" data-guide-spotlight-v101></div><section class="tt-guide-card-v101" data-guide-card-v101><button class="tt-guide-close-v101" data-guide-close-v101 type="button" aria-label="Cerrar tutorial">×</button><div class="tt-guide-content-v101" data-guide-content-v101></div><div class="tt-guide-progress-v101"><span data-guide-count-v101></span><div data-guide-dots-v101></div></div><footer><button class="tt-guide-secondary-v101" data-guide-prev-v101 type="button">ATRÁS</button><button class="tt-guide-primary-v101" data-guide-next-v101 type="button">SIGUIENTE</button></footer></section>`;
  document.body.append(root);document.body.classList.add('tt-guide-open-v101');
  const reposition=()=>requestAnimationFrame(place);
  active={id,userId,guide,index:0,root,target:null,reposition};
  window.addEventListener('resize',reposition,{passive:true});window.addEventListener('scroll',reposition,true);
  root.addEventListener('wheel',event=>event.preventDefault(),{passive:false});
  root.querySelector('[data-guide-close-v101]').onclick=close;
  root.querySelector('[data-guide-prev-v101]').onclick=()=>{active.index=Math.max(0,active.index-1);paint()};
  root.querySelector('[data-guide-next-v101]').onclick=()=>{if(active.index>=guide.steps.length-1)return close();active.index++;paint()};
  root.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
  requestAnimationFrame(()=>root.classList.add('is-visible'));paint();root.querySelector('[data-guide-next-v101]').focus();return true;
}

export function maybeShowSectionTutorialV101(tab,userId){
  return ['play','ranking','training','history','profile'].includes(tab)&&maybeShowTutorialV101(tab,userId);
}

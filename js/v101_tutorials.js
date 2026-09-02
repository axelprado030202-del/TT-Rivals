const VERSION='1';
const GUIDES={
  play:{icon:'＋',kicker:'PRIMEROS PASOS',title:'Tu centro para jugar',steps:[
    ['Elegí cómo competir','Usá 1 vs 1 para un desafío individual, 2 vs 2 para armar parejas o Torneos para una competencia organizada.'],
    ['Seguí tu avance','“Rumbo al próximo rango” muestra los RP que te faltan. La Protección de RP reduce el impacto de algunas derrotas cuando está disponible.'],
    ['Todo lo pendiente, junto','En Partidas y desafíos vas a encontrar invitaciones recibidas, desafíos enviados y resultados que necesitan tu atención.']]},
  ranking:{icon:'⌁',kicker:'CLASIFICACIÓN',title:'Entendé el Ranking',steps:[
    ['Dos rankings diferentes','Cambiá entre Individual y Dobles. Los RP y la posición se calculan por separado en cada modalidad.'],
    ['Elegí qué querés ver','Global muestra toda la clasificación; Siguiendo limita la lista a jugadores que seguís y Actividad reúne novedades competitivas.'],
    ['Encontrá y desafiá','Buscá un jugador por nombre o usuario. Desde su fila podés abrir el perfil o enviarle un desafío.']]},
  training:{icon:'⏱',kicker:'ENTRENAMIENTO',title:'Usá el cronómetro',steps:[
    ['Configurá el ciclo','Elegí minutos, segundos y cantidad de repeticiones. El reloj reinicia automáticamente hasta completar la serie.'],
    ['Control simple','Play comienza o reanuda, Stop pausa exactamente donde quedó y Reiniciar vuelve a la configuración inicial.'],
    ['Encontrá dónde practicar','Debajo del cronómetro podés explorar clubes, plazas y otros espacios para entrenar tenis de mesa.']]},
  history:{icon:'≡',kicker:'TUS PARTIDOS',title:'Leé tu Historial',steps:[
    ['Resumen inmediato','Arriba se muestran partidos, victorias, derrotas y abandonos confirmados.'],
    ['Filtrá sin perderte','Separá Ranked, Casual o Torneos; además podés buscar un rival, elegir modalidad, temporada y fechas.'],
    ['Abrí cada resultado','Cada partido conserva sets, cambio de RP y demás detalles disponibles. Estadísticas amplía el análisis global.']]},
  profile:{icon:'◫',kicker:'TU IDENTIDAD',title:'Conocé tu Perfil',steps:[
    ['Tu tarjeta competitiva','Acá ves RP individual y de dobles, ranking global, racha y progreso de la cuenta.'],
    ['Información ordenada','Estadísticas, Misiones, Logros, Rivalidades, Temporadas y Datos del jugador se abren por separado.'],
    ['Editalo cuando quieras','“Editar perfil” permite cambiar datos personales, club, situación federativa, estilo y mano hábil.']]},
  settings:{icon:'⚙',kicker:'TU EXPERIENCIA',title:'Configuración',steps:[
    ['Todo es ajustable','Personalizá apariencia, rendimiento visual, partidos, notificaciones y privacidad desde grupos separados.'],
    ['Perfil y cuenta','En Perfil competitivo completás los datos que no pedimos al registrarte. En Cuenta cambiás contraseña o administrás la cuenta.']]},
  ai:{icon:'✦',kicker:'TT RIVALS INTELLIGENCE',title:'Asistente de IA',steps:[
    ['Herramientas disponibles','Entrenamiento IA crea sesiones, Diario deportivo guarda observaciones y Análisis de rivales resume antecedentes.'],
    ['Funciones en desarrollo','Las tarjetas “Próximamente” todavía no están activas. Video Lab continúa identificado como beta.']]},
  activity:{icon:'🔔',kicker:'CENTRO DE ACTIVIDAD',title:'Tus notificaciones',steps:[
    ['Lo urgente primero','“Requiere atención” reúne desafíos, resultados, disputas y decisiones que necesitan una acción tuya.'],
    ['Controlá lo pendiente','También podés ver lo reciente, revisar todo y marcar las notificaciones como leídas.']]}
};
let active=null;
const key=(id,userId)=>`tt-rivals-guide-v${VERSION}:${userId||'guest'}:${id}`;
const seen=(id,userId)=>{try{return localStorage.getItem(key(id,userId))==='1'}catch{return false}};
const mark=(id,userId)=>{try{localStorage.setItem(key(id,userId),'1')}catch{}};
const esc=(value='')=>String(value).replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
function close(){if(!active)return;mark(active.id,active.userId);active.root.remove();active=null;document.body.classList.remove('tt-guide-open-v101')}
function paint(){
  if(!active)return;const {root,guide,index}=active,[heading,text]=guide.steps[index];
  root.querySelector('[data-guide-step-v101]').innerHTML=`<div class="tt-guide-step-icon-v101">${esc(guide.icon)}</div><p>${esc(guide.kicker)}</p><h2>${esc(index?heading:guide.title)}</h2><h3>${esc(index?'':heading)}</h3><div class="tt-guide-copy-v101">${esc(text)}</div>`;
  root.querySelector('[data-guide-count-v101]').textContent=`${index+1} de ${guide.steps.length}`;
  root.querySelector('[data-guide-prev-v101]').hidden=index===0;
  root.querySelector('[data-guide-next-v101]').textContent=index===guide.steps.length-1?'ENTENDIDO':'SIGUIENTE';
  root.querySelector('[data-guide-dots-v101]').innerHTML=guide.steps.map((_,i)=>`<i class="${i===index?'active':''}"></i>`).join('');
}
export function maybeShowTutorialV101(id,userId){
  const guide=GUIDES[id];if(!guide||active||seen(id,userId))return false;
  const root=document.createElement('div');root.className='tt-guide-overlay-v101';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');
  root.innerHTML=`<section class="tt-guide-card-v101"><button class="tt-guide-close-v101" data-guide-close-v101 type="button" aria-label="Cerrar tutorial">×</button><div class="tt-guide-step-v101" data-guide-step-v101></div><div class="tt-guide-progress-v101"><span data-guide-count-v101></span><div data-guide-dots-v101></div></div><footer><button class="tt-guide-secondary-v101" data-guide-prev-v101 type="button">ATRÁS</button><button class="tt-guide-primary-v101" data-guide-next-v101 type="button">SIGUIENTE</button></footer></section>`;
  document.body.append(root);document.body.classList.add('tt-guide-open-v101');active={id,userId,guide,index:0,root};
  root.querySelector('[data-guide-close-v101]').onclick=close;
  root.querySelector('[data-guide-prev-v101]').onclick=()=>{active.index=Math.max(0,active.index-1);paint()};
  root.querySelector('[data-guide-next-v101]').onclick=()=>{if(active.index>=guide.steps.length-1)return close();active.index++;paint()};
  root.addEventListener('click',event=>{if(event.target===root)close()});root.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
  paint();requestAnimationFrame(()=>root.classList.add('is-visible'));root.querySelector('[data-guide-next-v101]').focus();return true;
}
export function maybeShowSectionTutorialV101(tab,userId){
  return ['play','ranking','training','history','profile'].includes(tab)&&maybeShowTutorialV101(tab,userId);
}

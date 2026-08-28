import {supabase} from './supabase.js';

// TT Rivals 1.0.1 — entrada motivacional sin IA ni consumo de API.
// Las frases se construyen con reglas y datos reales del jugador.
let shown=false;
let removeTimer=null;

const GENERAL=[
  ['🏓','Un punto a la vez.','El partido todavía no existe hasta que se juega.'],
  ['🔥','Hoy puede empezar tu próxima racha.','La primera victoria siempre cuenta como una.'],
  ['🎯','Jugá con intención.','No hace falta pegar más fuerte si podés elegir mejor.'],
  ['⚔️','Tu próximo rival también está mejorando.','Que la mesa decida quién mejoró más.'],
  ['🧠','Leé primero. Atacá después.','Una buena decisión vale más que un golpe apurado.'],
  ['🏓','El próximo punto empieza 0–0.','Lo anterior ya no puede jugarlo por vos.'],
  ['🔥','Convertí regularidad en presión.','Una pelota buena ayuda. Cinco seguidas cambian el punto.'],
  ['🎯','Hacé simple lo importante.','Saque, recepción y tercera pelota.'],
  ['⚡','Hoy alguien va a subir en el ranking.','La mesa está abierta.'],
  ['🏆','Los títulos se construyen partido a partido.','El próximo puede ser parte de la historia.'],
  ['🛡️','No regales el punto siguiente.','El anterior ya terminó.'],
  ['🏓','Entrená lo que evitás.','Ahí suele esconderse la próxima mejora.'],
  ['🎯','La precisión también es velocidad.','Llegar antes sirve si sabés adónde jugar.'],
  ['🧠','Cambiá antes de que te obliguen a cambiar.','Leer al rival también es competir.'],
  ['🔥','Un buen día empieza con una buena primera pelota.','Después se construye todo lo demás.'],
  ['🏓','La mesa no recuerda tu último resultado.','Vos elegís qué hacer con él.'],
  ['⚔️','Cada rival muestra algo distinto.','Usalo a tu favor.'],
  ['🎯','No busques el punto perfecto.','Buscá una decisión repetible.'],
  ['🏓','La ventaja se construye.','Una recepción, una ubicación, una pelota más.'],
  ['🔥','Tu racha futura todavía no tiene número.','Hoy puede empezar.'],
  ['⚡','Movete antes de golpear.','Llegar equilibrado cambia la pelota.'],
  ['🧠','El ritmo también se juega.','A veces acelerar es la respuesta; a veces no.'],
  ['🏓','Que tu saque tenga una intención.','El punto empieza antes del primer ataque.'],
  ['🎯','La profundidad incomoda.','La colocación decide más puntos de los que parece.'],
  ['🔥','Competir también es sostener.','No todo punto se gana en la primera pelota.'],
  ['🏆','Subir es difícil. Mantenerse también.','Disfrutá las dos partes.'],
  ['⚔️','Jugá el rival que tenés enfrente.','No el que imaginaste antes del partido.'],
  ['🏓','Un set cerrado sigue siendo un set.','Jugá la siguiente pelota.'],
  ['🧠','Variar sin intención es ruido.','Variá para provocar una respuesta.'],
  ['🎯','Una pelota segura puede preparar una pelota agresiva.','Construí antes de cerrar.'],
  ['🔥','La confianza se gana repitiendo buenas decisiones.','No necesita apuro.'],
  ['🏓','El marcador informa; no golpea la pelota.','Seguí jugando.'],
  ['⚡','Piernas activas, cabeza tranquila.','Una combinación difícil de enfrentar.'],
  ['🧠','Si el rival se adapta, vos también.','El partido cambia mientras se juega.'],
  ['🎯','Saque corto, largo o al cuerpo: elegí por qué.','Cada inicio de punto puede tener un plan.'],
  ['🏓','No hay dos rivales idénticos.','Ahí está la gracia.'],
  ['🔥','La regularidad también presiona.','Hacé que el rival juegue una pelota más.'],
  ['⚔️','No hace falta dominar todo el partido.','Hace falta competir cada punto.'],
  ['🏆','La posición del ranking es una foto.','La temporada todavía se mueve.'],
  ['🎯','Jugá a espacios, no solamente a golpes.','La mesa tiene más opciones de las que parece.'],
  ['🏓','Tu mejor recurso puede ser cambiar el patrón.','No repitas por costumbre.'],
  ['🔥','Una remontada empieza reduciendo la diferencia.','No intentando ganarlo todo de una vez.'],
  ['🧠','La recepción define más de lo que parece.','Empezá el punto con una decisión.'],
  ['⚡','Anticipar no es adivinar.','Es reconocer patrones.'],
  ['🏓','Hoy la mesa vuelve a medir lo mismo.','Lo que cambia sos vos.'],
  ['🎯','Control primero, aceleración después.','Cuando el punto lo pida.'],
  ['🔥','El próximo partido todavía está limpio.','Escribilo bien.'],
  ['⚔️','Un rival incómodo es información útil.','Tomá nota y seguí.'],
  ['🏓','La pelota corta también puede atacar.','Presión no siempre significa potencia.'],
  ['🧠','La mejor táctica es la que podés ejecutar.','Simple y clara gana valor bajo presión.'],
  ['🏆','Los RP llegan después.','Primero hay que ganar el partido.'],
  ['🎯','Poné la pelota donde el rival tenga que decidir.','Las dudas también generan errores.'],
  ['🔥','Buen ritmo. Buena elección. Buena repetición.','Tres cosas que suman.'],
  ['🏓','Cada saque es una oportunidad nueva.','No lo uses en automático.'],
  ['⚡','Llegar bien parado cambia tu margen de error.','El movimiento también puntúa, aunque no se vea.'],
  ['🧠','Mirá qué respuesta provoca tu pelota.','Ahí empieza la táctica.'],
  ['🎯','No todo ataque necesita terminar el punto.','Algunos ataques construyen el siguiente.'],
  ['🏓','Si hoy jugás, hoy aprendés algo.','Guardalo para el próximo rival.'],
  ['🔥','Una racha larga se arma con victorias de a una.','No existe el atajo.'],
  ['⚔️','Jugá para imponer algo.','Aunque sea una sola idea clara.'],
  ['🏆','El progreso no siempre se nota en el marcador.','Pero termina apareciendo.'],
  ['🏓','TT Rivals está listo.','La mesa también.']
];

const RANKS=[
  {name:'Plata',min:1100,icon:'🥈'},
  {name:'Oro',min:1250,icon:'🥇'},
  {name:'Platino',min:1400,icon:'✦'},
  {name:'Diamante',min:1600,icon:'💎'}
];

function pick(list,seed=''){
  if(!list.length)return null;
  let h=2166136261;
  const text=`${seed}-${Date.now()>>18}`;
  for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}
  return list[Math.abs(h)%list.length];
}

async function safeQuery(factory){
  try{
    const {data,error}=await factory();
    return error?{data:null,error}:{data,error:null};
  }catch(error){return {data:null,error}}
}

async function contextFor(userId){
  const [ratingRes,streakRes,missionRes]=await Promise.all([
    safeQuery(()=>supabase.from('ratings').select('rating').eq('user_id',userId).eq('modality','individual').maybeSingle()),
    safeQuery(()=>supabase.rpc('get_my_streak_status_v101')),
    safeQuery(()=>supabase.rpc('get_my_daily_missions_v101'))
  ]);
  return {
    rating:Number(ratingRes?.data?.rating||1000),
    streak:Number(streakRes?.data?.current_streak||0),
    nextMultiplier:Number(streakRes?.data?.next_win_multiplier||1),
    missions:missionRes?.data||null
  };
}

function contextualMessage(ctx){
  const {rating,streak,nextMultiplier,missions}=ctx||{};
  if(missions?.all_completed){
    return ['✅','Misiones diarias completadas.',`Objetivos cumplidos. Hoy ya sumaste ${Number(missions.xp_earned_today||0)} XP.`];
  }
  if(missions&&Number(missions.total||3)-Number(missions.completed||0)===1){
    return ['🎯','Te queda una misión diaria.','Un objetivo más y cerrás el día completo.'];
  }
  if(streak>=12){
    return ['🔥',`Racha de ${streak}. Boost máximo activo.`,`Tu próxima victoria ranked mantiene x3 en la ganancia positiva de RP.`];
  }
  if(streak>=5&&nextMultiplier>1){
    return ['🔥',`Racha de ${streak}.`,`Tu próxima victoria ranked activa x${String(nextMultiplier)} en la ganancia positiva de RP.`];
  }
  const next=RANKS.find(r=>rating<r.min);
  if(next){
    const gap=next.min-rating;
    if(gap>0&&gap<=30)return [next.icon,`${next.name} está a ${gap} RP.`,`Cerca no significa conseguido. Jugá el partido, no el número.`];
  }
  return null;
}

function buildOverlay(message,firstName=''){
  document.querySelector('#v101MotivationOverlay')?.remove();
  const [icon,title,body]=message;
  const el=document.createElement('div');
  el.id='v101MotivationOverlay';
  el.className='v101-motivation-overlay';
  el.setAttribute('role','status');
  el.setAttribute('aria-live','polite');
  el.innerHTML=`<button type="button" class="v101-motivation-skip" aria-label="Cerrar">Saltar</button><div class="v101-motivation-glow"></div><div class="v101-motivation-card"><span class="v101-motivation-icon">${icon}</span><small>${firstName?`TT RIVALS · ${String(firstName).toUpperCase()}`:'TT RIVALS'}</small><h2>${title}</h2><p>${body}</p><i></i></div>`;
  const close=()=>{
    if(removeTimer)clearTimeout(removeTimer);
    el.classList.add('leaving');
    setTimeout(()=>el.remove(),360);
  };
  el.addEventListener('click',close,{once:true});
  document.addEventListener('keydown',function esc(ev){if(ev.key==='Escape'){document.removeEventListener('keydown',esc);close()}},{once:true});
  document.body.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  removeTimer=setTimeout(close,3000);
}

export async function showEntryMotivationV101({profile=null,newAccount=false}={}){
  if(shown)return;
  shown=true;
  let message;
  if(newAccount||!profile?.profile_completed){
    message=['🏓','Bienvenido a TT Rivals.','Tu historia competitiva empieza ahora. Completá tu perfil y prepará la mesa.'];
  }else{
    let ctx=null;
    try{ctx=await contextFor(profile.id)}catch{}
    message=contextualMessage(ctx)||pick(GENERAL,profile.id)||GENERAL[0];
  }
  buildOverlay(message,profile?.first_name||'');
}

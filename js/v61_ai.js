import {supabase} from './supabase.js';
import {getMyProfile,getMyRatings} from './profile.js';
import {getMyMatches} from './matches.js';
import {getMyStatsV56} from './v56_stats.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const TOOL_IDS={training:'aiTrainingToolV61',video:'aiVideoToolV61',journal:'aiJournalToolV61'};
const GOAL_LABELS={saque:'Saque',recepcion:'Recepción',derecha:'Derecha',reves:'Revés',topspin:'Topspin / apertura',bloqueo:'Bloqueo',desplazamientos:'Desplazamientos',regularidad:'Regularidad',velocidad:'Velocidad',tactica:'Táctica',partido:'Situaciones de partido'};
let initialized=false;
let engineState='unknown';
let selectedVideoFile=null;
let selectedVideoUrl='';
let lastVideoAnalysis=null;
let lastTrainingPlan=null;

function esc(value=''){return String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function setText(el,text){if(el)el.textContent=text||''}
function setBusy(button,busy,label){
  if(!button)return;
  if(busy){
    if(!button.dataset.originalText)button.dataset.originalText=button.innerHTML;
    button.disabled=true;button.classList.add('is-loading');button.innerHTML=`<span class="ai-spinner-v61"></span>${esc(label||'Procesando…')}`;
  }else{
    button.disabled=false;button.classList.remove('is-loading');
    if(button.dataset.originalText){button.innerHTML=button.dataset.originalText;delete button.dataset.originalText}
  }
}
function fmtDate(value){try{return new Intl.DateTimeFormat('es-UY',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))}catch{return '—'}}
function fmtDuration(seconds){const n=Math.max(0,Number(seconds)||0);const m=Math.floor(n/60),s=Math.round(n%60);return m?`${m} min ${s?`${s} s`:''}`:`${s} s`}
function humanBytes(bytes){const n=Number(bytes)||0;if(n<1024*1024)return`${(n/1024).toFixed(0)} KB`;return`${(n/1024/1024).toFixed(1)} MB`}

function listV61(value){
  if(Array.isArray(value))return value.flatMap(v=>listV61(v)).filter(Boolean);
  if(value==null)return [];
  if(typeof value==='string')return value.split(/\n|\s*[•·]\s*|\s*;\s*/).map(x=>x.replace(/^[-–—*\d.)\s]+/,'').trim()).filter(Boolean);
  if(typeof value==='number'||typeof value==='boolean')return [String(value)];
  return [];
}
function observationsV61(value){
  if(Array.isArray(value))return value.filter(v=>v&&typeof v==='object');
  if(value&&typeof value==='object')return [value];
  return [];
}
function textV61(value,fallback=''){
  if(typeof value==='string')return value;
  if(value==null)return fallback;
  return String(value);
}

async function currentUser(){
  const {data,error}=await supabase.auth.getSession();
  if(error)throw error;
  return data?.session?.user||null;
}

async function buildCompetitiveContextV61(){
  const user=await currentUser();
  if(!user)return {};
  const [profile,ratings,matches,stats,journalRes]=await Promise.all([
    getMyProfile(user.id).catch(()=>({})),
    getMyRatings(user.id).catch(()=>([])),
    getMyMatches(user.id).catch(()=>([])),
    getMyStatsV56().catch(()=>({})),
    supabase.from('ai_journal_v61').select('entry_type,title,body,mood,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(5)
  ]);
  const confirmed=(matches||[]).filter(m=>m.result_status==='confirmed').slice(0,20);
  const recent=confirmed.slice(0,10);
  const wins=recent.filter(m=>m.winner_id===user.id).length;
  const losses=Math.max(0,recent.length-wins);
  const individual=(ratings||[]).find(r=>r.modality==='individual')||{};
  const doubles=(ratings||[]).find(r=>r.modality==='doubles'||r.modality==='dobles')||{};
  const durations=recent.map(m=>Number(m.gameplay_seconds||m.duration_seconds||0)).filter(n=>n>0);
  return {
    player:{
      playing_style:profile.playing_style||profile.style||null,
      dominant_hand:profile.dominant_hand||profile.hand||null,
      birth_date:profile.birth_date||null
    },
    ratings:{
      individual:Number(individual.rating)||null,
      doubles:Number(doubles.rating)||null
    },
    recent_form:{
      measured_matches:recent.length,wins,losses,
      average_duration_seconds:durations.length?Math.round(durations.reduce((a,b)=>a+b,0)/durations.length):null
    },
    stats:stats||{},
    recent_notes:(journalRes.data||[]).map(x=>({type:x.entry_type,title:x.title,body:x.body,mood:x.mood,date:x.created_at}))
  };
}

async function invokeAiV61(action,payload){
  const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('El motor IA tardó demasiado.')),60000));
  const call=supabase.functions.invoke('tt-ai-v61',{body:{action,...payload}});
  const {data,error}=await Promise.race([call,timeout]);
  if(error){
    let message=error?.message||'No se pudo completar el análisis.';
    try{
      if(error?.context&&typeof error.context.json==='function'){
        const payload=await error.context.clone().json();
        if(payload?.error)message=payload.error;
      }
    }catch{}
    throw new Error(message);
  }
  if(!data?.ok)throw new Error(data?.error||'No se pudo completar el análisis.');
  engineState='online';renderEngineStateV61();
  return data;
}

function renderEngineStateV61(){
  const dot=$('#aiEngineDotV61'),label=$('#aiEngineLabelV61');
  if(!dot||!label)return;
  dot.className='';
  if(engineState==='online'){dot.classList.add('is-online');label.textContent='Disponible'}
  else if(engineState==='offline'){dot.classList.add('is-offline');label.textContent='Plan base disponible'}
  else{label.textContent='Comprobando…'}
}

async function probeEngineV61(){
  try{
    const {data,error}=await supabase.functions.invoke('tt-ai-v61',{body:{action:'health'}});
    engineState=(!error&&data?.ok&&data?.configured)?'online':'offline';
  }catch{
    engineState='offline';
  }
  renderEngineStateV61();
  const button=$('#aiAnalyzeVideoV61');
  if(button&&selectedVideoFile)button.disabled=engineState!=='online';
}

function openToolV61(tool){
  const workspace=$('#aiWorkspaceV61');
  if(!workspace||!TOOL_IDS[tool])return;
  workspace.classList.remove('hidden');
  Object.values(TOOL_IDS).forEach(id=>$('#'+id)?.classList.add('hidden'));
  $('#'+TOOL_IDS[tool])?.classList.remove('hidden');
  const titles={training:'Entrenamiento IA',video:'Video Lab',journal:'Diario deportivo'};
  setText($('#aiWorkspaceTitleV61'),titles[tool]);
  workspace.dataset.tool=tool;
  workspace.scrollIntoView({behavior:'smooth',block:'start'});
  if(tool==='journal')loadJournalV61();
}

function closeWorkspaceV61(){
  const workspace=$('#aiWorkspaceV61');
  if(!workspace)return;
  workspace.classList.add('hidden');
  workspace.dataset.tool='';
  document.querySelector('.ai-feature-grid-v61')?.scrollIntoView({behavior:'smooth',block:'start'});
}

function localTrainingPlanV61(req){
  const total=Math.max(20,Math.min(90,Number(req.duration_minutes)||45));
  const warm=Math.max(4,Math.round(total*.12));
  const technique=Math.max(6,Math.round(total*.28));
  const decision=Math.max(6,Math.round(total*.24));
  const game=Math.max(5,Math.round(total*.25));
  const cool=Math.max(3,total-warm-technique-decision-game);
  const goal=GOAL_LABELS[req.goal]||req.goal;
  const two=req.players==='2';
  const solo=req.players==='solo';
  const partner=two?'Jugador A / Jugador B':solo?'Trabajo individual':'Rotación de jugadores';
  return {
    title:`Sesión práctica de ${goal} · ${total} min`,
    summary:`Plan base con ejercicios concretos para ${req.players==='solo'?'trabajo individual':req.players==='2'?'dos jugadores':'grupo'}, intensidad ${req.intensity}.`,
    duration_minutes:total,
    source:'local',
    blocks:[
      {type:'ACTIVACIÓN',name:'Pelota + apoyos específicos',minutes:warm,objective:'Entrar en ritmo sin separar la movilidad del tenis de mesa.',setup:`${partner}. Mesa y pelotas.`,execution:[`Intercambios suaves relacionados con ${goal.toLowerCase()} durante 60–90 s.`,`Cada 4–6 golpes, recuperar posición base antes de continuar.`,`Subir progresivamente el ritmo sin buscar máxima velocidad.`],volume:'Trabajo continuo por tiempo.',coaching_cues:['Apoyos activos','Equilibrio después del golpe','Calidad antes que velocidad'],progression:'Añadir cambio de dirección cuando el control sea estable.',success_criteria:'Mantener continuidad y volver a posición base después de cada acción.'},
      {type:'TÉCNICA',name:`Repetición de ${goal}`,minutes:technique,objective:`Conseguir ejecuciones repetibles de ${goal.toLowerCase()}.`,setup:solo?'Robot, multibolas o autocontrol según material disponible.':`${partner}. Un jugador alimenta o inicia siempre la misma situación; cambiar roles a mitad del bloque.`,execution:[`Hacer series de 6–10 ejecuciones de ${goal.toLowerCase()} con una consigna concreta.`,`Descansar brevemente y repetir buscando la misma calidad.`,`Registrar cuántas ejecuciones consecutivas cumplen la consigna.`],volume:'4–6 series por jugador.',coaching_cues:['Punto de contacto consistente','Recuperar posición','No acelerar si baja la calidad'],progression:'Cambiar una sola variable: ubicación, profundidad o velocidad.',success_criteria:'Lograr al menos 70% de ejecuciones que cumplan la consigna.'},
      {type:'DECISIÓN',name:'Dos opciones, una lectura',minutes:decision,objective:'Pasar del gesto conocido a reconocer qué pelota llega y elegir.',setup:solo?'Robot con dos ubicaciones/variaciones si está disponible.':`${partner}. El alimentador alterna dos opciones previamente acordadas.`,execution:[`Opción A exige ${goal.toLowerCase()}; opción B exige una respuesta alternativa segura.`,`La secuencia debe ser aleatoria, no alternada de forma previsible.`,`Después de cada acción, volver a base y prepararse para la siguiente pelota.`],volume:'Series de 8–12 decisiones.',coaching_cues:['Leer antes de moverse','No adivinar','Primera respuesta de calidad'],progression:'Agregar una tercera opción solo cuando las dos primeras se distingan con claridad.',success_criteria:'Tomar la decisión correcta en 7 de cada 10 pelotas.'},
      {type:'SITUACIÓN DE PARTIDO',name:'Puntos condicionados',minutes:game,objective:'Transferir el objetivo a una situación competitiva real.',setup:solo?'Simular secuencias completas con robot/multibolas y objetivo de puntuación.':`${partner}. Saque y recepción alternados; jugar el punto completo.`,execution:[`Jugar a 11 puntos.`,`El punto vale doble si aparece una acción correcta vinculada a ${goal.toLowerCase()}.`,`Después de cada 5 puntos, comentar una decisión que funcionó y una que se puede mejorar.`],volume:'1–2 juegos según el tiempo.',coaching_cues:['Marcador real','Decidir bajo presión','No forzar el objetivo cuando la pelota no corresponde'],progression:'Quitar la puntuación doble y jugar un game normal manteniendo la intención.',success_criteria:'Aplicar el objetivo de forma útil en al menos 5 puntos reales.'},
      {type:'CIERRE',name:'Registro breve',minutes:cool,objective:'Cerrar la sesión y dejar una prioridad para la próxima.',setup:'Sin material adicional.',execution:['1–2 min de intercambios suaves o movilidad.','Anotar qué ejercicio funcionó mejor.','Registrar una dificultad concreta para la próxima sesión.'],volume:'Una reflexión breve.',coaching_cues:['Ser específico','Registrar sensaciones'],progression:'Usar la nota como entrada del próximo Entrenamiento IA.',success_criteria:'Salir con una prioridad concreta, no con una valoración general.'}
    ],
    focus_points:['Ejercicios con organización clara','Técnica → decisión → situación real','Medir calidad, no solo tiempo'],
    progression:'Aumentar incertidumbre antes que volumen cuando la ejecución sea estable.',
    next_session:'Repetir el objetivo cambiando una variable y comparar el criterio de éxito.'
  };
}

function renderTrainingPlanV61(plan,source='ai'){
  lastTrainingPlan=plan;
  const root=$('#aiTrainingResultV61');if(!root)return;
  const blocks=Array.isArray(plan.blocks)?plan.blocks:[];
  const focus=listV61(plan.focus_points);
  root.classList.remove('hidden');
  root.innerHTML=`<div class="ai-result-head-v61"><div><p class="muted-label">${source==='ai'?'GENERADO POR TT AI':'PLAN BASE LOCAL'}</p><h3>${esc(plan.title||'Entrenamiento')}</h3><p>${esc(plan.summary||'')}</p></div><span>${Number(plan.duration_minutes)||'—'} min</span></div>
    <div class="ai-plan-blocks-v61">${blocks.map((b,i)=>{
      const steps=listV61(b.execution||b.steps||b.exercise);
      const cues=listV61(b.coaching_cues||b.keys);
      return `<article><div class="ai-plan-time-v61"><strong>${Number(b.minutes)||0}</strong><small>MIN</small></div><div><span>${esc(b.type||`EJERCICIO ${i+1}`)}</span><h4>${esc(b.name||'Trabajo')}</h4><p>${esc(b.objective||'')}</p>${b.setup?`<small><b>Organización:</b> ${esc(b.setup)}</small>`:''}<div class="ai-exercise-steps-v611">${steps.map((x,n)=>`<small><b>${n+1}.</b> ${esc(x)}</small>`).join('')}</div>${b.volume?`<small><b>Volumen:</b> ${esc(b.volume)}</small>`:''}${cues.length?`<ul>${cues.slice(0,5).map(k=>`<li>${esc(k)}</li>`).join('')}</ul>`:''}${b.progression?`<small><b>Progresión:</b> ${esc(b.progression)}</small>`:''}${b.success_criteria?`<small><b>Sale bien si:</b> ${esc(b.success_criteria)}</small>`:''}</div><button type="button" data-ai-timer-v61="${Math.max(1,Number(b.minutes)||1)}" title="Usar este ejercicio en el cronómetro">⏱</button></article>`}).join('')}</div>
    ${focus.length?`<div class="ai-result-columns-v61"><div><span>CLAVES DE LA SESIÓN</span>${focus.map(x=>`<small>• ${esc(x)}</small>`).join('')}</div><div><span>PROGRESIÓN GENERAL</span><small>${esc(plan.progression||'')}</small><small>${esc(plan.next_session||'')}</small></div></div>`:''}
    <div class="ai-result-actions-v61"><button id="aiMarkTrainingDoneV61" type="button">✓ Marcar realizado</button><button id="aiSaveTrainingNoteV61" type="button">▤ Guardar en diario</button></div>`;
  root.querySelectorAll('[data-ai-timer-v61]').forEach(btn=>btn.addEventListener('click',()=>openTimerForMinutesV61(Number(btn.dataset.aiTimerV61))));
  $('#aiMarkTrainingDoneV61')?.addEventListener('click',()=>completeTrainingV61());
  $('#aiSaveTrainingNoteV61')?.addEventListener('click',()=>saveTrainingToJournalV61());
}

async function saveTrainingPlanV61(req,plan,source){
  const user=await currentUser();if(!user)return null;
  const {data,error}=await supabase.from('ai_training_sessions_v61').insert({
    user_id:user.id,request:req,plan,source:source||'ai',status:'planned'
  }).select('id').single();
  if(error)throw error;
  return data?.id||null;
}

async function generateTrainingV61(){
  const button=$('#aiGenerateTrainingV61'),status=$('#aiTrainingStatusV61');
  const req={
    goal:$('#aiTrainingGoalV61')?.value||'regularidad',
    training_type:$('#aiTrainingTypeV61')?.value||'mixto',
    duration_minutes:Number($('#aiTrainingMinutesV61')?.value)||45,
    players:$('#aiTrainingPlayersV61')?.value||'2',
    intensity:$('#aiTrainingIntensityV61')?.value||'media',
    equipment:$$('[data-ai-equipment-v61]:checked').map(x=>x.value),
    notes:$('#aiTrainingNotesV61')?.value?.trim()||''
  };
  setBusy(button,true,'Creando sesión…');
  setText(status,'Analizando tu contexto deportivo…');
  let plan,source='ai';
  try{
    const context=await buildCompetitiveContextV61();
    const result=await invokeAiV61('training_plan',{request:req,context});
    plan=result.result;source='ai';
    setText(status,'Plan generado con TT AI.');
  }catch(err){
    console.warn('TT AI training fallback:',err);
    engineState='offline';renderEngineStateV61();
    plan=localTrainingPlanV61(req);source='local';
    setText(status,'Motor IA no disponible: se generó un plan base local. Al configurar el backend, TT AI usará tu contexto deportivo.');
  }finally{
    setBusy(button,false);
  }
  renderTrainingPlanV61(plan,source);
  try{
    const id=await saveTrainingPlanV61(req,plan,source);
    if(lastTrainingPlan)lastTrainingPlan.__session_id=id;
  }catch(err){console.warn('No se pudo guardar plan IA:',err)}
}

function openTimerForMinutesV61(minutes){
  const min=$('#trainingMinutesV53'),sec=$('#trainingSecondsV54'),cycles=$('#trainingCyclesV53');
  if(min)min.value=String(Math.max(0,Math.floor(minutes)));
  if(sec)sec.value='0';
  if(cycles)cycles.value='1';
  document.querySelector('[data-tab="training"]')?.click();
}

async function completeTrainingV61(){
  const id=lastTrainingPlan?.__session_id;
  if(id){
    try{await supabase.from('ai_training_sessions_v61').update({status:'completed',completed_at:new Date().toISOString()}).eq('id',id)}catch{}
  }
  const btn=$('#aiMarkTrainingDoneV61');
  if(btn){btn.textContent='Realizado ✓';btn.disabled=true}
}

async function saveTrainingToJournalV61(){
  const plan=lastTrainingPlan;if(!plan)return;
  const user=await currentUser();if(!user)return;
  const body=`${plan.summary||''}\n\n${listV61(plan.focus_points).map(x=>'• '+x).join('\n')}`.trim();
  const {error}=await supabase.from('ai_journal_v61').insert({user_id:user.id,entry_type:'entrenamiento',title:plan.title||'Entrenamiento IA',body,mood:3,linked_training_id:plan.__session_id||null});
  if(error){alert('No se pudo guardar en el diario.');return}
  const btn=$('#aiSaveTrainingNoteV61');if(btn){btn.textContent='Guardado ✓';btn.disabled=true}
}

function waitEvent(el,name,timeout=5000){
  return new Promise((resolve,reject)=>{
    const to=setTimeout(()=>{cleanup();reject(new Error(`Tiempo agotado esperando ${name}`))},timeout);
    const done=()=>{cleanup();resolve()};
    const fail=()=>{cleanup();reject(new Error('No se pudo leer el video.'))};
    const cleanup=()=>{clearTimeout(to);el.removeEventListener(name,done);el.removeEventListener('error',fail)};
    el.addEventListener(name,done,{once:true});el.addEventListener('error',fail,{once:true});
  });
}

async function seekVideoV61(video,time){
  if(Math.abs(video.currentTime-time)<.04)return;
  const p=waitEvent(video,'seeked',7000);
  video.currentTime=Math.min(Math.max(0,time),Math.max(0,video.duration-.03));
  await p;
}

function canvasDataUrlV61(video,maxWidth=900){
  const ratio=Math.min(1,maxWidth/(video.videoWidth||maxWidth));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(video.videoWidth*ratio));
  canvas.height=Math.max(1,Math.round(video.videoHeight*ratio));
  const ctx=canvas.getContext('2d',{alpha:false});
  ctx.drawImage(video,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/jpeg',.72);
}

async function extractFramesV61(video){
  const duration=Number(video.duration)||0;
  if(!duration)throw new Error('No se pudo determinar la duración.');
  const pct=duration<12?[.12,.3,.5,.7,.88]:[.08,.24,.40,.56,.72,.88];
  const frames=[];
  const previous=video.currentTime;
  video.pause();
  for(let i=0;i<pct.length;i++){
    const t=Math.min(duration-.05,Math.max(.01,duration*pct[i]));
    await seekVideoV61(video,t);
    frames.push({index:i+1,time_seconds:Number(t.toFixed(2)),image_url:canvasDataUrlV61(video)});
  }
  try{await seekVideoV61(video,Math.min(previous,duration-.05))}catch{}
  return frames;
}

function renderFramesV61(frames){
  const root=$('#aiVideoFramesV61');if(!root)return;
  root.classList.remove('hidden');
  root.innerHTML=`<div class="ai-frames-head-v61"><span>FOTOGRAMAS ENVIADOS AL ANÁLISIS</span><small>${frames.length} imágenes · el video completo permanece en tu dispositivo</small></div><div>${frames.map(f=>`<figure><img src="${f.image_url}" alt="Fotograma ${f.index}"><figcaption>${fmtDuration(f.time_seconds)}</figcaption></figure>`).join('')}</div>`;
}

function renderVideoAnalysisV61(data){
  data=data&&typeof data==='object'?data:{};
  const strengths=listV61(data.strengths),priorities=listV61(data.priorities),limitations=listV61(data.limitations),obs=observationsV61(data.observations);
  lastVideoAnalysis={...data,strengths,priorities,limitations,observations:obs};
  const root=$('#aiVideoResultV61');if(!root)return;
  root.classList.remove('hidden');
  root.innerHTML=`<div class="ai-result-head-v61"><div><p class="muted-label">ANÁLISIS TT AI</p><h3>${esc(data.title||'Lectura del video')}</h3><p>${esc(data.summary||'')}</p></div><span>${esc(data.confidence||'orientativo')}</span></div>
    ${strengths.length?`<div class="ai-video-strengths-v61"><span>LO QUE SE VE BIEN</span>${strengths.map(x=>`<small>✓ ${esc(x)}</small>`).join('')}</div>`:''}
    <div class="ai-video-observations-v61">${obs.map((o,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><div><h4>${esc(textV61(o.title,'Observación'))}</h4><p>${esc(textV61(o.evidence,''))}</p>${o.impact?`<small><b>Puede influir:</b> ${esc(textV61(o.impact))}</small>`:''}${o.suggestion?`<small><b>Probar:</b> ${esc(textV61(o.suggestion))}</small>`:''}${o.frame_hint?`<small><b>Fotograma:</b> ${esc(textV61(o.frame_hint))}</small>`:''}</div></article>`).join('')}</div>
    ${(priorities.length||limitations.length)?`<div class="ai-result-columns-v61"><div><span>PRIORIDADES</span>${priorities.length?priorities.map(x=>`<small>• ${esc(x)}</small>`).join(''):'<small>Sin prioridades adicionales.</small>'}</div><div><span>LÍMITES DEL ANÁLISIS</span>${limitations.length?limitations.map(x=>`<small>• ${esc(x)}</small>`).join(''):'<small>El análisis se basa únicamente en los fotogramas enviados.</small>'}</div></div>`:''}
    <div class="ai-result-actions-v61"><button id="aiVideoToTrainingV61" class="primary" type="button">🏓 Crear entrenamiento desde esto</button><button id="aiVideoToJournalV61" type="button">▤ Guardar resumen</button></div>`;
  $('#aiVideoToTrainingV61')?.addEventListener('click',()=>videoToTrainingV61());
  $('#aiVideoToJournalV61')?.addEventListener('click',()=>saveVideoToJournalV61());
}

async function saveVideoAnalysisV61(focus,file,frames,result){
  const user=await currentUser();if(!user)return null;
  const meta={name:file?.name||'',type:file?.type||'',size:file?.size||0,duration_seconds:Number($('#aiVideoPreviewV61')?.duration)||0,width:$('#aiVideoPreviewV61')?.videoWidth||0,height:$('#aiVideoPreviewV61')?.videoHeight||0};
  const {data,error}=await supabase.from('ai_video_analyses_v61').insert({user_id:user.id,focus,video_metadata:meta,frame_count:frames.length,analysis:result}).select('id').single();
  if(error)throw error;
  return data?.id||null;
}

async function analyzeVideoV61(){
  const file=selectedVideoFile,video=$('#aiVideoPreviewV61'),button=$('#aiAnalyzeVideoV61'),status=$('#aiVideoStatusV61');
  if(!file||!video)return;
  if(engineState==='offline'){
    setText(status,'Video listo, pero el motor IA todavía no está configurado. El archivo no se subió.');
    return;
  }
  setBusy(button,true,'Extrayendo fotogramas…');
  setText(status,'El video permanece en tu dispositivo. Preparando imágenes…');
  try{
    const frames=await extractFramesV61(video);
    renderFramesV61(frames);
    setBusy(button,true,'Analizando…');
    setText(status,'TT AI está comparando los fotogramas…');
    const context=await buildCompetitiveContextV61().catch(()=>({}));
    const result=await invokeAiV61('video_analysis',{focus:$('#aiVideoFocusV61')?.value||'tecnica_general',frames,video:{duration_seconds:video.duration,width:video.videoWidth,height:video.videoHeight},context});
    renderVideoAnalysisV61(result.result||{});
    const id=await saveVideoAnalysisV61($('#aiVideoFocusV61')?.value,file,frames,result.result||{}).catch(()=>null);
    if(lastVideoAnalysis)lastVideoAnalysis.__analysis_id=id;
    setText(status,'Análisis completado. Revisá las observaciones y sus limitaciones.');
  }catch(err){
    console.error('Video Lab V61:',err);
    setText(status,err?.message||'No se pudo analizar el video.');
  }finally{
    setBusy(button,false);
    if(selectedVideoFile)button.disabled=false;
  }
}

async function onVideoSelectedV61(file){
  const status=$('#aiVideoStatusV61'),preview=$('#aiVideoPreviewV61'),shell=$('#aiVideoPreviewShellV61'),button=$('#aiAnalyzeVideoV61');
  if(!file)return;
  if(file.size>250*1024*1024){setText(status,'El archivo supera 250 MB. Elegí un fragmento más corto.');return}
  if(selectedVideoUrl)URL.revokeObjectURL(selectedVideoUrl);
  selectedVideoFile=file;selectedVideoUrl=URL.createObjectURL(file);
  preview.src=selectedVideoUrl;shell.classList.remove('hidden');
  $('#aiVideoFramesV61')?.classList.add('hidden');$('#aiVideoResultV61')?.classList.add('hidden');
  setText(status,'Leyendo metadatos del video…');
  try{
    if(preview.readyState<1)await waitEvent(preview,'loadedmetadata',8000);
    if(preview.duration>600){setText(status,'Para V61 usá un fragmento de hasta 10 minutos.');button.disabled=true;return}
    $('#aiVideoMetaV61').innerHTML=`<span>${esc(file.name)}</span><span>${fmtDuration(preview.duration)}</span><span>${preview.videoWidth}×${preview.videoHeight}</span><span>${humanBytes(file.size)}</span>`;
    button.disabled=engineState!=='online';
    setText(status,engineState==='online'?'Listo para extraer fotogramas y analizar.':'Video listo. Falta configurar el motor IA para analizarlo.');
  }catch(err){
    button.disabled=true;setText(status,'Este formato no pudo abrirse. Probá MP4/H.264 o WebM.');
  }
}

function videoToTrainingV61(){
  const priorities=listV61(lastVideoAnalysis?.priorities).join('. ');
  const focus=$('#aiVideoFocusV61')?.value||'tecnica_general';
  const map={saque:'saque',recepcion:'recepcion',derecha:'derecha',reves:'reves',desplazamientos:'desplazamientos',tactica:'tactica',tecnica_general:'regularidad'};
  if($('#aiTrainingGoalV61'))$('#aiTrainingGoalV61').value=map[focus]||'regularidad';
  if($('#aiTrainingNotesV61'))$('#aiTrainingNotesV61').value=`Basar la sesión en estas prioridades detectadas en Video Lab: ${priorities||lastVideoAnalysis?.summary||'trabajo técnico general'}`;
  openToolV61('training');
}

async function saveVideoToJournalV61(){
  if(!lastVideoAnalysis)return;
  const user=await currentUser();if(!user)return;
  const body=[lastVideoAnalysis.summary,...listV61(lastVideoAnalysis.priorities).map(x=>'• '+x)].filter(Boolean).join('\n');
  const {error}=await supabase.from('ai_journal_v61').insert({user_id:user.id,entry_type:'tecnica',title:lastVideoAnalysis.title||'Video Lab',body,mood:3,linked_video_id:lastVideoAnalysis.__analysis_id||null});
  if(error){alert('No se pudo guardar el resumen.');return}
  const btn=$('#aiVideoToJournalV61');if(btn){btn.textContent='Guardado ✓';btn.disabled=true}
}

async function saveJournalV61(){
  const user=await currentUser();if(!user)return;
  const title=$('#aiJournalTitleV61')?.value?.trim(),body=$('#aiJournalBodyV61')?.value?.trim();
  const status=$('#aiJournalStatusV61'),button=$('#aiSaveJournalV61');
  if(!title||!body){setText(status,'Escribí un título y una nota.');return}
  setBusy(button,true,'Guardando…');
  const {error}=await supabase.from('ai_journal_v61').insert({user_id:user.id,entry_type:$('#aiJournalTypeV61')?.value||'entrenamiento',title,body,mood:Number($('#aiJournalMoodV61')?.value)||3});
  setBusy(button,false);
  if(error){setText(status,'No se pudo guardar. ¿Ejecutaste el SQL V61?');return}
  $('#aiJournalTitleV61').value='';$('#aiJournalBodyV61').value='';
  setText(status,'Nota guardada ✓');loadJournalV61();
}

async function loadJournalV61(){
  const root=$('#aiJournalListV61');if(!root)return;
  root.innerHTML='<div class="loading-row">Cargando diario…</div>';
  const user=await currentUser();if(!user){root.innerHTML='<div class="compact-empty">Iniciá sesión para usar el diario.</div>';return}
  const {data,error}=await supabase.from('ai_journal_v61').select('id,entry_type,title,body,mood,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(20);
  if(error){root.innerHTML='<div class="compact-empty">El diario todavía no está disponible. Ejecutá el SQL V61.</div>';return}
  const mood={1:'●',2:'●●',3:'●●●',4:'●●●●',5:'●●●●●'};
  root.innerHTML=(data||[]).length?(data||[]).map(x=>`<article><div><span>${esc((x.entry_type||'nota').toUpperCase())}</span><small>${fmtDate(x.created_at)}</small></div><h4>${esc(x.title)}</h4><p>${esc(x.body)}</p><footer><span aria-label="Sensación ${x.mood||3} de 5">${mood[x.mood]||mood[3]}</span></footer></article>`).join(''):'<div class="compact-empty">Todavía no guardaste notas deportivas.</div>';
}

export function initAiV61(){
  if(initialized)return;initialized=true;
  $$('[data-ai-tool-v61]').forEach(btn=>btn.addEventListener('click',()=>openToolV61(btn.dataset.aiToolV61)));
  $('#aiWorkspaceBackV61')?.addEventListener('click',closeWorkspaceV61);
  $('#aiGenerateTrainingV61')?.addEventListener('click',generateTrainingV61);
  $('#aiVideoFileV61')?.addEventListener('change',e=>onVideoSelectedV61(e.target.files?.[0]));
  $('#aiVideoDropV61')?.addEventListener('click',()=>$('#aiVideoFileV61')?.click());
  $('#aiAnalyzeVideoV61')?.addEventListener('click',analyzeVideoV61);
  $('#aiSaveJournalV61')?.addEventListener('click',saveJournalV61);
  $('#aiRefreshJournalV61')?.addEventListener('click',loadJournalV61);
  probeEngineV61();
}

export function refreshAiV61(){
  initAiV61();
  renderEngineStateV61();
  if(engineState!=='online')probeEngineV61();
  if($('#aiWorkspaceV61')?.dataset.tool==='journal')loadJournalV61();
}

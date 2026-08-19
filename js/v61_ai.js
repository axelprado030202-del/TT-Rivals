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
  if(error)throw error;
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
  const main1=Math.max(6,Math.round(total*.25));
  const main2=Math.max(6,Math.round(total*.24));
  const game=Math.max(5,Math.round(total*.25));
  let cool=Math.max(3,total-warm-main1-main2-game);
  const goal=GOAL_LABELS[req.goal]||req.goal;
  const specific=req.notes?.trim()||`Mejorar ${goal.toLowerCase()} con buena calidad de ejecución.`;
  return {
    title:`Sesión de ${goal} · ${total} min`,
    summary:`Plan base estructurado para ${req.players==='solo'?'trabajo individual':req.players==='2'?'dos jugadores':'grupo'}, intensidad ${req.intensity}. ${specific}`,
    duration_minutes:total,
    source:'local',
    blocks:[
      {name:'Activación específica',minutes:warm,objective:'Preparar apoyos, coordinación y sensación de pelota.',exercise:`Movilidad dinámica + intercambios controlados relacionados con ${goal.toLowerCase()}.`,keys:['Ritmo progresivo','Priorizar calidad','Recuperar posición']},
      {name:'Bloque técnico',minutes:main1,objective:`Aislar el gesto principal de ${goal.toLowerCase()}.`,exercise:req.goal==='saque'?'Series de 8–10 saques por objetivo, alternando corto/largo y ubicación.':`Series controladas de ${goal.toLowerCase()} con objetivo de 6–10 ejecuciones de calidad antes de aumentar velocidad.`,keys:['Punto de contacto consistente','Equilibrio','Repetición con intención']},
      {name:'Bloque con decisión',minutes:main2,objective:'Pasar de ejecución previsible a lectura y elección.',exercise:`Alterná dos consignas para obligarte a reconocer la pelota antes de ejecutar ${goal.toLowerCase()}.`,keys:['No anticipar','Primera pelota de calidad','Volver a base']},
      {name:'Situación competitiva',minutes:game,objective:'Transferir el trabajo al punto real.',exercise:`Jugá puntos condicionados: el punto solo cuenta si aparece una acción vinculada a ${goal.toLowerCase()}.`,keys:['Marcador real','Saque/recepción alternados','Registrar qué falla bajo presión']},
      {name:'Cierre',minutes:cool,objective:'Bajar intensidad y registrar sensaciones.',exercise:'2–3 minutos suaves + anotá una cosa que mejoró y una prioridad para la próxima sesión.',keys:['Respiración','Feedback breve']}
    ],
    focus_points:['Calidad antes que volumen','Recuperar posición después de cada golpe','Trasladar el ejercicio a puntos reales'],
    progression:'Cuando logres estabilidad, aumentá incertidumbre o velocidad antes de agregar más volumen.',
    next_session:'Repetí la misma habilidad con una consigna diferente y compará tu sensación.'
  };
}

function renderTrainingPlanV61(plan,source='ai'){
  lastTrainingPlan=plan;
  const root=$('#aiTrainingResultV61');if(!root)return;
  const blocks=Array.isArray(plan.blocks)?plan.blocks:[];
  root.classList.remove('hidden');
  root.innerHTML=`<div class="ai-result-head-v61"><div><p class="muted-label">${source==='ai'?'GENERADO POR TT AI':'PLAN BASE LOCAL'}</p><h3>${esc(plan.title||'Entrenamiento')}</h3><p>${esc(plan.summary||'')}</p></div><span>${Number(plan.duration_minutes)||'—'} min</span></div>
    <div class="ai-plan-blocks-v61">${blocks.map((b,i)=>`<article><div class="ai-plan-time-v61"><strong>${Number(b.minutes)||0}</strong><small>MIN</small></div><div><span>BLOQUE ${i+1}</span><h4>${esc(b.name||'Trabajo')}</h4><p>${esc(b.objective||'')}</p><strong class="ai-exercise-v61">${esc(b.exercise||'')}</strong>${Array.isArray(b.keys)?`<ul>${b.keys.slice(0,4).map(k=>`<li>${esc(k)}</li>`).join('')}</ul>`:''}</div><button type="button" data-ai-timer-v61="${Math.max(1,Number(b.minutes)||1)}" title="Usar este bloque en el cronómetro">⏱</button></article>`).join('')}</div>
    ${Array.isArray(plan.focus_points)&&plan.focus_points.length?`<div class="ai-result-columns-v61"><div><span>CLAVES</span>${plan.focus_points.map(x=>`<small>• ${esc(x)}</small>`).join('')}</div><div><span>PROGRESIÓN</span><small>${esc(plan.progression||'')}</small><small>${esc(plan.next_session||'')}</small></div></div>`:''}
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
  const body=`${plan.summary||''}\n\n${(plan.focus_points||[]).map(x=>'• '+x).join('\n')}`.trim();
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
  lastVideoAnalysis=data;
  const root=$('#aiVideoResultV61');if(!root)return;
  const obs=Array.isArray(data.observations)?data.observations:[];
  root.classList.remove('hidden');
  root.innerHTML=`<div class="ai-result-head-v61"><div><p class="muted-label">ANÁLISIS TT AI</p><h3>${esc(data.title||'Lectura del video')}</h3><p>${esc(data.summary||'')}</p></div><span>${esc(data.confidence||'orientativo')}</span></div>
    ${Array.isArray(data.strengths)&&data.strengths.length?`<div class="ai-video-strengths-v61"><span>LO QUE SE VE BIEN</span>${data.strengths.map(x=>`<small>✓ ${esc(x)}</small>`).join('')}</div>`:''}
    <div class="ai-video-observations-v61">${obs.map((o,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><div><h4>${esc(o.title||'Observación')}</h4><p>${esc(o.evidence||'')}</p>${o.impact?`<small><b>Puede influir:</b> ${esc(o.impact)}</small>`:''}${o.suggestion?`<small><b>Probar:</b> ${esc(o.suggestion)}</small>`:''}</div></article>`).join('')}</div>
    ${Array.isArray(data.priorities)&&data.priorities.length?`<div class="ai-result-columns-v61"><div><span>PRIORIDADES</span>${data.priorities.map(x=>`<small>• ${esc(x)}</small>`).join('')}</div><div><span>LÍMITES DEL ANÁLISIS</span>${(data.limitations||[]).map(x=>`<small>• ${esc(x)}</small>`).join('')}</div></div>`:''}
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
  const priorities=(lastVideoAnalysis?.priorities||[]).join('. ');
  const focus=$('#aiVideoFocusV61')?.value||'tecnica_general';
  const map={saque:'saque',recepcion:'recepcion',derecha:'derecha',reves:'reves',desplazamientos:'desplazamientos',tactica:'tactica',tecnica_general:'regularidad'};
  if($('#aiTrainingGoalV61'))$('#aiTrainingGoalV61').value=map[focus]||'regularidad';
  if($('#aiTrainingNotesV61'))$('#aiTrainingNotesV61').value=`Basar la sesión en estas prioridades detectadas en Video Lab: ${priorities||lastVideoAnalysis?.summary||'trabajo técnico general'}`;
  openToolV61('training');
}

async function saveVideoToJournalV61(){
  if(!lastVideoAnalysis)return;
  const user=await currentUser();if(!user)return;
  const body=[lastVideoAnalysis.summary,...(lastVideoAnalysis.priorities||[]).map(x=>'• '+x)].filter(Boolean).join('\n');
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

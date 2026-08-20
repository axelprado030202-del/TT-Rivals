import {supabase} from './supabase.js';
import {APP_VERSION,APP_BUILD} from './version.js';

// TT Rivals 1.0.1 P5 — feedback aislado.
// Un fallo de este módulo no bloquea el resto de la aplicación.

const $=s=>document.querySelector(s);
const FUNCTION_NAME='tt-feedback-v101';
const MAX_FILES=3;
const MAX_SOURCE_BYTES=8*1024*1024;
const MAX_DIMENSION=1440;
const JPEG_QUALITY=.78;
const MAX_ATTACHMENT_BASE64=1_500_000;
const state={kind:'problem',files:[],urls:[],sending:false};

function lockPageScroll(open){
  document.body.classList.toggle('modal-open',open||[...document.querySelectorAll('.modal')].some(m=>!m.classList.contains('hidden')));
}
function setStatus(message='',type=''){
  const el=$('#feedbackStatusV101');if(!el)return;
  el.textContent=message;el.className=`status feedback-status-v101 ${type}`.trim();
}
function resetUrls(){
  for(const u of state.urls)try{URL.revokeObjectURL(u)}catch{}
  state.urls=[];
}
function modeConfig(kind){
  return kind==='idea'?{
    kind:'idea',icon:'✦',eyebrow:'DESARROLLO TT RIVALS',title:'Ideas para mejorar',
    lead:'Contanos qué sumarías, cambiarías o mejorarías en TT Rivals.',
    subject:'Ideas de desarrollo de la aplicación',label:'Descripción de la idea',
    placeholder:'Explicá tu idea, qué problema resolvería y cómo te imaginás que debería funcionar...',submit:'Enviar idea'
  }:{
    kind:'problem',icon:'!',eyebrow:'SOPORTE TT RIVALS',title:'Reportar un problema',
    lead:'Contanos qué ocurrió y, si ayuda, adjuntá capturas.',
    subject:'Reporte de problema',label:'Descripción del problema',
    placeholder:'Explicá qué pasó, qué estabas intentando hacer y qué esperabas que ocurriera...',submit:'Enviar reporte'
  };
}
function applyMode(kind){
  const cfg=modeConfig(kind);state.kind=cfg.kind;
  const modal=$('#feedbackModalV101');if(modal){modal.dataset.kind=cfg.kind;modal.classList.remove('hidden')}
  $('#feedbackKindV101').value=cfg.kind;
  $('#feedbackModalIconV101').textContent=cfg.icon;
  $('#feedbackModalEyebrowV101').textContent=cfg.eyebrow;
  $('#feedbackModalTitleV101').textContent=cfg.title;
  $('#feedbackModalLeadV101').textContent=cfg.lead;
  $('#feedbackSubjectV101').value=cfg.subject;
  $('#feedbackDescriptionLabelV101').textContent=cfg.label;
  $('#feedbackDescriptionV101').placeholder=cfg.placeholder;
  const submit=$('#feedbackSubmitV101');submit.className=`feedback-submit-v101 ${cfg.kind}`;submit.querySelector('span').textContent=cfg.submit;
  setStatus('');
  lockPageScroll(true);
  setTimeout(()=>$('#feedbackDescriptionV101')?.focus(),80);
}
function closeModal(){
  $('#feedbackModalV101')?.classList.add('hidden');
  lockPageScroll(false);
}
function renderFiles(){
  const box=$('#feedbackImagePreviewV101');if(!box)return;
  resetUrls();
  box.innerHTML='';
  state.files.forEach((file,index)=>{
    const url=URL.createObjectURL(file);state.urls.push(url);
    const item=document.createElement('div');item.className='feedback-preview-item-v101';
    const img=document.createElement('img');img.src=url;img.alt=`Imagen adjunta ${index+1}`;
    const remove=document.createElement('button');remove.type='button';remove.textContent='✕';remove.setAttribute('aria-label',`Quitar ${file.name}`);
    remove.addEventListener('click',()=>{state.files.splice(index,1);renderFiles()});
    item.append(img,remove);box.appendChild(item);
  });
}
function addFiles(fileList){
  const candidates=[...(fileList||[])];
  const available=Math.max(0,MAX_FILES-state.files.length);
  const overflow=candidates.length>available;
  for(const file of candidates){
    if(state.files.length>=MAX_FILES)break;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type))continue;
    if(file.size>MAX_SOURCE_BYTES){setStatus(`“${file.name}” es demasiado grande. Máximo 8 MB antes de comprimir.`,'error');continue}
    if(state.files.some(f=>f.name===file.name&&f.size===file.size&&f.lastModified===file.lastModified))continue;
    state.files.push(file);
  }
  renderFiles();
  const input=$('#feedbackImagesV101');if(input)input.value='';
  if(overflow)setStatus('Podés adjuntar hasta 3 imágenes.','error');
}
function imageFromFile(file){
  return new Promise((resolve,reject)=>{
    const img=new Image();const url=URL.createObjectURL(file);
    img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error(`No pudimos leer ${file.name}.`))};
    img.src=url;
  });
}
async function compressImage(file,index){
  const img=await imageFromFile(file);
  const nativeW=img.naturalWidth||img.width,nativeH=img.naturalHeight||img.height;
  let maxDim=MAX_DIMENSION,quality=JPEG_QUALITY,content='';
  for(let attempt=0;attempt<5;attempt++){
    const ratio=Math.min(1,maxDim/Math.max(nativeW,nativeH));
    const width=Math.max(1,Math.round(nativeW*ratio));
    const height=Math.max(1,Math.round(nativeH*ratio));
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('No pudimos preparar la imagen.');
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);
    content=(canvas.toDataURL('image/jpeg',quality).split(',')[1]||'');
    if(content.length<=MAX_ATTACHMENT_BASE64)break;
    maxDim=Math.round(maxDim*.82);quality=Math.max(.56,quality-.07);
  }
  if(!content||content.length>MAX_ATTACHMENT_BASE64)throw new Error(`No pudimos comprimir ${file.name} lo suficiente. Probá con una captura más pequeña.`);
  return {filename:`tt-rivals-${state.kind}-${Date.now()}-${index+1}.jpg`,content,content_type:'image/jpeg'};
}
function activeSection(){
  const active=document.querySelector('.tab-page.active');
  return active?.id?.replace(/^tab-/,'')||'unknown';
}
function standaloneMode(){
  return window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true;
}
async function buildPayload(){
  const {data:{session}}=await supabase.auth.getSession();
  const user=session?.user||null;
  const attachments=[];
  for(let i=0;i<state.files.length;i++)attachments.push(await compressImage(state.files[i],i));
  return {
    kind:state.kind,
    subject:modeConfig(state.kind).subject,
    description:$('#feedbackDescriptionV101').value.trim(),
    context:{
      app_version:APP_VERSION,
      app_build:APP_BUILD,
      section:activeSection(),
      theme:document.body.dataset.theme||'system',
      viewport:`${window.innerWidth}x${window.innerHeight}`,
      screen:`${screen.width}x${screen.height}`,
      standalone:standaloneMode(),
      language:navigator.language||'',
      user_agent:navigator.userAgent||'',
      platform:navigator.platform||'',
      user_id:user?.id||null,
      user_email:user?.email||null,
      sent_at:new Date().toISOString()
    },
    attachments
  };
}
async function submitFeedback(event){
  event.preventDefault();if(state.sending)return;
  const description=$('#feedbackDescriptionV101').value.trim();
  if(description.length<10){setStatus('Escribí un poco más de detalle para que podamos entender el mensaje.','error');$('#feedbackDescriptionV101').focus();return}
  state.sending=true;const button=$('#feedbackSubmitV101');button.disabled=true;
  const original=button.querySelector('span').textContent;button.querySelector('span').textContent=state.kind==='idea'?'Enviando idea…':'Enviando reporte…';
  setStatus(state.files.length?'Preparando imágenes…':'Enviando…');
  try{
    const payload=await buildPayload();
    const {data,error}=await supabase.functions.invoke(FUNCTION_NAME,{body:payload});
    if(error)throw new Error(error?.message||'No pudimos conectar con el canal de soporte.');
    if(!data?.ok)throw new Error(data?.error||'No pudimos enviar el mensaje.');
    setStatus(state.kind==='idea'?'Idea enviada. ¡Gracias por ayudar a mejorar TT Rivals!':'Reporte enviado. Gracias por ayudarnos a detectar el problema.','ok');
    $('#feedbackDescriptionV101').value='';$('#feedbackCharCountV101').textContent='0';state.files=[];renderFiles();
    button.querySelector('span').textContent=state.kind==='idea'?'Idea enviada ✓':'Reporte enviado ✓';
  }catch(err){
    console.error('TT feedback:',err);
    const raw=String(err?.message||'');
    const friendly=/non-2xx|Failed to send|FunctionsHttpError|fetch/i.test(raw)
      ?'No pudimos enviar el mensaje ahora. Comprobá tu conexión y volvé a intentar.'
      :raw||'No pudimos enviar el mensaje ahora. Volvé a intentar.';
    setStatus(friendly,'error');button.querySelector('span').textContent=original;
  }finally{state.sending=false;button.disabled=false}
}

function init(){
  const problem=$('#openProblemReportV101'),idea=$('#openImprovementIdeaV101');
  if(!problem||!idea||!$('#feedbackModalV101'))return;
  problem.addEventListener('click',()=>applyMode('problem'));
  idea.addEventListener('click',()=>applyMode('idea'));
  $('#closeFeedbackModalV101')?.addEventListener('click',closeModal);
  $('#feedbackModalV101')?.addEventListener('click',e=>{if(e.target===$('#feedbackModalV101'))closeModal()});
  $('#feedbackImagesV101')?.addEventListener('change',e=>addFiles(e.target.files));
  $('#feedbackDescriptionV101')?.addEventListener('input',e=>{$('#feedbackCharCountV101').textContent=String(e.target.value.length)});
  $('#feedbackFormV101')?.addEventListener('submit',submitFeedback);
  window.addEventListener('beforeunload',resetUrls);
}

try{init()}catch(err){console.warn('Feedback V101 desactivado:',err)}

import {supabase} from './supabase.js';
import {getInstallationIdV58} from './v58_competition.js';

const PENDING_KEY_V76='tt_rivals_pending_email_registration_v76';
const APPEAL_EMAIL_V76='ttrivalsuy@gmail.com';
let initializedV76=false;
let adminStateV76={users:[],pending_appeals:0};

const $=selector=>document.querySelector(selector);
const escV76=value=>String(value??'').replace(/[&<>"']/g,char=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
}[char]));

export function createRegistrationCancelTokenV76(){
  const bytes=new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
}

export function maskEmailV76(email=''){
  const [local='',domain='']=String(email).trim().split('@');
  if(!domain)return String(email||'');
  const shown=local.slice(0,Math.min(2,local.length));
  return `${shown}${'*'.repeat(Math.max(3,Math.min(8,local.length-shown.length)))}@${domain}`;
}

export function savePendingRegistrationV76(data){
  const safe={
    email:String(data?.email||'').trim().toLowerCase(),
    userId:String(data?.userId||''),
    cancelToken:String(data?.cancelToken||''),
    firstName:String(data?.firstName||''),
    lastName:String(data?.lastName||''),
    username:String(data?.username||''),
    resendAt:Number(data?.resendAt||0),
    createdAt:Number(data?.createdAt||Date.now())
  };
  localStorage.setItem(PENDING_KEY_V76,JSON.stringify(safe));
  return safe;
}

export function getPendingRegistrationV76(){
  try{
    const value=JSON.parse(localStorage.getItem(PENDING_KEY_V76)||'null');
    if(!value?.email||!value?.userId||!value?.cancelToken)return null;
    if(Date.now()-Number(value.createdAt||0)>7*24*60*60*1000){
      localStorage.removeItem(PENDING_KEY_V76);
      return null;
    }
    return value;
  }catch{
    localStorage.removeItem(PENDING_KEY_V76);
    return null;
  }
}

export function clearPendingRegistrationV76(){
  localStorage.removeItem(PENDING_KEY_V76);
}

export async function getRegistrationConfigV76(){
  const {data,error}=await supabase.rpc('get_registration_config_v76');
  if(error)throw error;
  return data||{enabled:false,otp_minutes:10,resend_seconds:60};
}

export async function verifyRegistrationCodeV76(email,token){
  return supabase.auth.verifyOtp({
    email:String(email||'').trim().toLowerCase(),
    token:String(token||'').replace(/\D/g,'').slice(0,6),
    type:'email'
  });
}

export async function resendRegistrationCodeV76(email){
  return supabase.auth.resend({
    type:'signup',
    email:String(email||'').trim().toLowerCase()
  });
}

export async function cancelPendingRegistrationV76(pending){
  if(!pending?.userId||!pending?.cancelToken)return;
  const {error}=await supabase.rpc('cancel_unverified_signup_v76',{
    p_user_id:pending.userId,
    p_cancel_token:pending.cancelToken
  });
  if(error)throw error;
}

function appealModalV76(){
  let modal=$('#banAppealModalV76');
  if(modal)return modal;
  modal=document.createElement('div');
  modal.id='banAppealModalV76';
  modal.className='modal hidden';
  modal.setAttribute('role','dialog');
  modal.setAttribute('aria-modal','true');
  modal.setAttribute('aria-labelledby','banAppealTitleV76');
  modal.innerHTML=`
    <div class="modal-card v76-appeal-card">
      <button class="modal-close" data-close-appeal-v76 type="button" aria-label="Cerrar">✕</button>
      <div class="v76-appeal-icon" aria-hidden="true">◇</div>
      <p class="eyebrow">REVISIÓN DE CUENTA</p>
      <h2 id="banAppealTitleV76">Apelar suspensión</h2>
      <p class="v76-appeal-copy">Tu mensaje quedará registrado en el panel de Administración. Después abriremos tu correo para que también puedas enviarlo a <strong>${APPEAL_EMAIL_V76}</strong>.</p>
      <form id="banAppealFormV76" class="v76-appeal-form">
        <label>Correo de la cuenta
          <input id="banAppealEmailV76" type="email" autocomplete="email" required>
        </label>
        <label>Tu apelación
          <textarea id="banAppealMessageV76" rows="7" minlength="20" maxlength="2000" required placeholder="Explicá qué ocurrió y por qué querés que revisemos la suspensión…"></textarea>
        </label>
        <div class="v76-appeal-meta"><span>Asunto</span><strong>cuenta suspendida</strong></div>
        <button class="btn btn-start" type="submit">ENVIAR APELACIÓN</button>
        <p id="banAppealStatusV76" class="status" aria-live="polite"></p>
      </form>
    </div>`;
  document.body.appendChild(modal);
  return modal;
}

function closeAppealV76(){
  $('#banAppealModalV76')?.classList.add('hidden');
  if(![...document.querySelectorAll('.modal')].some(item=>!item.classList.contains('hidden'))){
    document.body.classList.remove('modal-open');
  }
}

export function openBanAppealV76(email=''){
  const modal=appealModalV76();
  const input=$('#banAppealEmailV76');
  if(input)input.value=String(email||'').trim();
  const status=$('#banAppealStatusV76');
  if(status){status.textContent='';status.className='status'}
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  setTimeout(()=>$('#banAppealMessageV76')?.focus(),60);
}

export function clearAccessBlockedActionV76(){
  $('#appealAccessButtonV76')?.remove();
}

export function showAccessBlockedV76(error,email='',statusElement=null){
  clearAccessBlockedActionV76();
  if(error?.code!=='TT_ACCESS_BLOCKED')return false;
  const decision=error.decision||{};
  const status=statusElement||$('#loginStatus');
  if(status){
    status.textContent=decision.message||error.message||'No podés acceder a TT Rivals.';
    status.classList.remove('ok');
    status.classList.add('error');
  }
  const button=document.createElement('button');
  button.id='appealAccessButtonV76';
  button.className='v76-appeal-entry';
  button.type='button';
  button.textContent='APELAR SUSPENSIÓN';
  button.addEventListener('click',()=>openBanAppealV76(email));
  status?.insertAdjacentElement('afterend',button);
  return true;
}

async function submitAppealV76(event){
  event.preventDefault();
  const button=event.currentTarget.querySelector('button[type="submit"]');
  const status=$('#banAppealStatusV76');
  const email=$('#banAppealEmailV76')?.value.trim()||'';
  const message=$('#banAppealMessageV76')?.value.trim()||'';
  try{
    button.disabled=true;
    if(status){status.textContent='Registrando apelación…';status.className='status'}
    const {data,error}=await supabase.rpc('submit_ban_appeal_v76',{
      p_email:email,
      p_message:message,
      p_installation_id:getInstallationIdV58()
    });
    if(error)throw error;
    if(status){
      status.textContent=data?.already_pending
        ?'Ya existe una apelación pendiente. Abriremos tu correo para que puedas completar el envío.'
        :'Apelación registrada. Abriremos tu correo para que también puedas enviarla a TT Rivals.';
      status.className='status ok';
    }
    const subject=encodeURIComponent(data?.subject||'cuenta suspendida');
    const body=encodeURIComponent(
      `Cuenta: ${email}\n\nApelación:\n${message}\n\nReferencia TT Rivals: ${data?.appeal_id||'pendiente'}`
    );
    setTimeout(()=>{window.location.href=`mailto:${data?.email_to||APPEAL_EMAIL_V76}?subject=${subject}&body=${body}`},350);
  }catch(error){
    if(status){
      status.textContent=error?.message||'No pudimos registrar la apelación.';
      status.className='status error';
    }
  }finally{
    button.disabled=false;
  }
}

function banLabelsV76(user){
  const labels=[];
  if(user.account_ban?.type==='temporary'){
    labels.push(`TEMPORAL · hasta ${new Date(user.account_ban.until).toLocaleString('es-UY')}`);
  }else if(user.account_ban?.type==='email_permanent'){
    labels.push('CORREO PERMANENTE');
  }
  if(Number(user.device_bans)>0)labels.push('DISPOSITIVO');
  if(Number(user.ip_bans)>0)labels.push('IP / RED');
  return labels;
}

function renderSuspendedUsersV76(data={}){
  adminStateV76=data||{users:[],pending_appeals:0};
  const rows=Array.isArray(data.users)?data.users:[];
  const count=$('#adminCountSuspendedV76');
  if(count)count.textContent=`${rows.length} suspendido${rows.length===1?'':'s'}`;
  const badge=$('#adminPendingAppealsV76');
  if(badge)badge.textContent=`${Number(data.pending_appeals||0)} apelación${Number(data.pending_appeals||0)===1?'':'es'} pendiente${Number(data.pending_appeals||0)===1?'':'s'}`;

  const host=$('#adminSuspendedListV76');
  if(!host)return;
  if(!rows.length){
    host.innerHTML='<div class="compact-empty">No hay cuentas suspendidas activas.</div>';
    return;
  }
  host.innerHTML=rows.map(user=>{
    const name=`${user.first_name||''} ${user.last_name||''}`.trim()||user.username||'Cuenta';
    const appeal=user.latest_appeal;
    const pending=appeal?.status==='pending';
    return `
      <article class="v76-suspended-row">
        <div class="v76-suspended-head">
          <div class="v76-suspended-avatar">${user.profile_photo_url?`<img src="${escV76(user.profile_photo_url)}" alt="">`:'◆'}</div>
          <div><strong>${escV76(name)}</strong><small>@${escV76(user.username||'sin_usuario')} · ${escV76(user.email||'')}</small></div>
          <div class="v76-ban-labels">${banLabelsV76(user).map(label=>`<span>${escV76(label)}</span>`).join('')}</div>
        </div>
        ${appeal?`
          <div class="v76-appeal-message">
            <div><span>APELACIÓN #${appeal.id}</span><time>${new Date(appeal.submitted_at).toLocaleString('es-UY')}</time></div>
            <p>${escV76(appeal.message)}</p>
            <small>Estado: ${escV76(appeal.status)}</small>
          </div>`:''}
        <div class="v76-suspended-actions">
          ${pending?`
            <button class="btn btn-start" data-v76-appeal-decision="approved" data-v76-appeal-id="${appeal.id}" type="button">DESBANEAR Y APROBAR</button>
            <button class="btn v76-reject" data-v76-appeal-decision="rejected" data-v76-appeal-id="${appeal.id}" type="button">RECHAZAR APELACIÓN</button>`:''}
          <button class="btn" data-admin-ban-user-v75="${user.user_id}" data-admin-ban-name-v75="${escV76(name)}" type="button">ADMINISTRAR BLOQUEO</button>
        </div>
      </article>`;
  }).join('');
}

export async function loadAdminSuspendedV76(){
  const host=$('#adminSuspendedListV76');
  if(host)host.innerHTML='<div class="loading-row">Cargando cuentas suspendidas…</div>';
  const {data,error}=await supabase.rpc('admin_list_suspended_users_v76');
  if(error){
    if(host)host.innerHTML=`<div class="compact-empty">${escV76(error.message||'No se pudo cargar el listado.')}</div>`;
    throw error;
  }
  renderSuspendedUsersV76(data||{});
  return data;
}

function showAdminDecisionV76(message){
  let toast=$('#adminDecisionToastV76');
  if(!toast){
    toast=document.createElement('div');
    toast.id='adminDecisionToastV76';
    toast.className='v76-admin-decision-toast';
    toast.setAttribute('role','status');
    document.body.appendChild(toast);
  }
  toast.textContent=message;
  toast.classList.add('show');
  clearTimeout(showAdminDecisionV76.timer);
  showAdminDecisionV76.timer=setTimeout(()=>toast.classList.remove('show'),3600);
}

async function resolveAppealV76(button){
  const appealId=Number(button.dataset.v76AppealId||0);
  const decision=button.dataset.v76AppealDecision;
  if(!appealId||!['approved','rejected'].includes(decision))return;
  const buttons=[...document.querySelectorAll(`[data-v76-appeal-id="${appealId}"]`)];
  buttons.forEach(item=>item.disabled=true);
  try{
    const {data,error}=await supabase.rpc('admin_resolve_ban_appeal_v76',{
      p_appeal_id:appealId,
      p_decision:decision,
      p_note:null
    });
    if(error)throw error;
    renderSuspendedUsersV76(data||{});
    showAdminDecisionV76(decision==='approved'
      ?'Decisión: apelación aprobada y cuenta desbaneada'
      :'Decisión: apelación rechazada');
    window.dispatchEvent(new CustomEvent('tt-v76-suspensions-changed',{detail:{appealId,decision}}));
  }catch(error){
    showAdminDecisionV76(error?.message||'No se pudo guardar la decisión.');
    buttons.forEach(item=>item.disabled=false);
  }
}

export function initModerationEmailV76(){
  if(initializedV76)return;
  initializedV76=true;
  appealModalV76();
  $('#banAppealFormV76')?.addEventListener('submit',submitAppealV76);
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-close-appeal-v76]')){
      closeAppealV76();
      return;
    }
    const decision=event.target.closest('[data-v76-appeal-decision]');
    if(decision)resolveAppealV76(decision);
  });
  window.addEventListener('tt-v75-access-changed',async event=>{
    const userId=String(event.detail?.userId||'');
    if(event.detail?.type==='unban'){
      const user=(adminStateV76.users||[]).find(item=>String(item.user_id)===userId);
      const appeal=user?.latest_appeal;
      if(appeal?.status==='pending'){
        const {error}=await supabase.rpc('admin_resolve_ban_appeal_v76',{
          p_appeal_id:Number(appeal.id),
          p_decision:'approved',
          p_note:null
        });
        if(error)console.warn('Apelación V76:',error);
      }
      showAdminDecisionV76('Decisión: cuenta desbaneada');
    }
    if(document.body.dataset.activeTabV101==='admin'){
      loadAdminSuspendedV76().catch(()=>{});
    }
  });
}

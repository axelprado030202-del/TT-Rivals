import {supabase} from './supabase.js';
import {getInstallationIdV58} from './v58_competition.js';

let initializedV75=false;
let selectedUserV75=null;
let accessGuardChannelV76=null;
let accessGuardTimerV76=null;
let accessGuardUserV76=null;
let accessGuardEmailV76='';
let accessGuardCheckV76=null;
let accessGuardTokenV76=0;
let accessGuardFocusV76=null;
let accessGuardVisibilityV76=null;
let accessGuardOnlineV76=null;

export class AccessBlockedErrorV75 extends Error{
  constructor(decision={}){
    super(decision.message||'No podés acceder a TT Rivals.');
    this.name='AccessBlockedErrorV75';
    this.code='TT_ACCESS_BLOCKED';
    this.decision=decision;
  }
}

export async function checkAccessGateV75({email=null}={}){
  const {data,error}=await supabase.rpc('check_access_gate_v75',{
    p_email:email||null,
    p_installation_id:getInstallationIdV58()
  });
  if(error)throw error;
  const decision=data||{allowed:true};
  if(decision.allowed===false)throw new AccessBlockedErrorV75(decision);
  return decision;
}

export async function checkSessionAccessV75(session){
  return checkAccessGateV75({email:session?.user?.email||null});
}

export async function stopSessionAccessGuardV76(){
  accessGuardTokenV76++;
  if(accessGuardTimerV76){clearInterval(accessGuardTimerV76);accessGuardTimerV76=null}
  if(accessGuardFocusV76)window.removeEventListener('focus',accessGuardFocusV76);
  if(accessGuardVisibilityV76)document.removeEventListener('visibilitychange',accessGuardVisibilityV76);
  if(accessGuardOnlineV76)window.removeEventListener('online',accessGuardOnlineV76);
  accessGuardFocusV76=null;
  accessGuardVisibilityV76=null;
  accessGuardOnlineV76=null;
  accessGuardUserV76=null;
  accessGuardEmailV76='';
  accessGuardCheckV76=null;
  if(accessGuardChannelV76){
    const channel=accessGuardChannelV76;
    accessGuardChannelV76=null;
    await supabase.removeChannel(channel).catch(()=>{});
  }
}

async function enforceOpenSessionAccessV76(reason='periodic'){
  if(!accessGuardUserV76)return;
  if(accessGuardCheckV76)return accessGuardCheckV76;
  const token=accessGuardTokenV76;
  accessGuardCheckV76=(async()=>{
    try{
      await checkAccessGateV75({email:accessGuardEmailV76});
    }catch(error){
      if(error?.code!=='TT_ACCESS_BLOCKED')return;
      const email=accessGuardEmailV76;
      await stopSessionAccessGuardV76();
      await supabase.auth.signOut({scope:'local'}).catch(()=>supabase.auth.signOut().catch(()=>{}));
      window.dispatchEvent(new CustomEvent('tt-v75-session-blocked',{
        detail:{error,email,reason}
      }));
    }finally{
      if(token===accessGuardTokenV76)accessGuardCheckV76=null;
    }
  })();
  return accessGuardCheckV76;
}

export function startSessionAccessGuardV76(activeSession){
  const userId=String(activeSession?.user?.id||'');
  if(!userId)return stopSessionAccessGuardV76();
  const email=String(activeSession?.user?.email||'');
  if(accessGuardUserV76===userId&&accessGuardChannelV76)return;

  void stopSessionAccessGuardV76().then(()=>{
    accessGuardUserV76=userId;
    accessGuardEmailV76=email;
    const token=++accessGuardTokenV76;
    const suffix=globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2);
    accessGuardChannelV76=supabase
      .channel(`tt-access-revocation-${userId}-${suffix}`)
      .on('postgres_changes',{
        event:'INSERT',schema:'public',table:'access_revocation_events_v76',
        filter:`user_id=eq.${userId}`
      },()=>{if(token===accessGuardTokenV76)void enforceOpenSessionAccessV76('realtime')})
      .subscribe();

    accessGuardFocusV76=()=>void enforceOpenSessionAccessV76('focus');
    accessGuardVisibilityV76=()=>{
      if(document.visibilityState==='visible')void enforceOpenSessionAccessV76('visible');
    };
    accessGuardOnlineV76=()=>void enforceOpenSessionAccessV76('online');
    window.addEventListener('focus',accessGuardFocusV76,{passive:true});
    document.addEventListener('visibilitychange',accessGuardVisibilityV76,{passive:true});
    window.addEventListener('online',accessGuardOnlineV76,{passive:true});
    // Realtime es la vía inmediata; esta comprobación espaciada es el respaldo
    // para redes móviles que pausan el WebSocket en segundo plano.
    accessGuardTimerV76=setInterval(()=>void enforceOpenSessionAccessV76('periodic'),30000);
  });
}

function escV75(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]))}
function $(selector){return document.querySelector(selector)}

function currentSummaryV75(data={}){
  const account=data.account_ban;
  const rows=[];
  if(account?.type==='temporary'){
    rows.push('<article><span>Cuenta</span><strong>Temporal hasta '+escV75(new Date(account.until).toLocaleString('es-UY'))+'</strong></article>');
  }else if(account?.type==='email_permanent'){
    rows.push('<article><span>Correo</span><strong>Baneo permanente</strong></article>');
  }
  if(Number(data.device_bans)>0)rows.push('<article><span>Dispositivo</span><strong>'+Number(data.device_bans)+' bloqueado(s)</strong></article>');
  if(Number(data.ip_bans)>0)rows.push('<article><span>IP / red</span><strong>'+Number(data.ip_bans)+' bloqueada(s)</strong></article>');
  return rows.length?rows.join(''):'<div class="compact-empty">Este usuario no tiene bloqueos activos.</div>';
}

function renderAdminBanV75(data,name=''){
  selectedUserV75={...data,name};
  const host=$('#adminAccessBanContentV75');if(!host)return;
  host.innerHTML=`
    <div class="v75-ban-head">
      <div><p class="muted-label">CONTROL DE ACCESO</p><h2>Administrar baneo</h2><p>${escV75(name||'Usuario')} · ${escV75(data.email||'')}</p></div>
      <span class="v75-ban-shield">◆</span>
    </div>
    <section class="v75-ban-current">
      <h3>Estado actual</h3>
      <div class="v75-ban-current-grid">${currentSummaryV75(data)}</div>
    </section>
    <form id="adminAccessBanFormV75" class="v75-ban-form">
      <label>Tipo de baneo
        <select id="adminAccessBanTypeV75">
          <option value="temporary">Temporal de cuenta</option>
          <option value="email_permanent">Permanente de correo</option>
          <option value="device_permanent">Permanente de dispositivo</option>
          <option value="ip_permanent">Permanente de IP / red</option>
        </select>
      </label>
      <label id="adminAccessBanDaysWrapV75">Duración
        <select id="adminAccessBanDaysV75">
          <option value="1">1 día</option><option value="3">3 días</option>
          <option value="7" selected>7 días</option><option value="14">14 días</option>
          <option value="30">30 días</option><option value="90">90 días</option>
          <option value="365">1 año</option>
        </select>
      </label>
      <label class="v75-ban-note">Nota administrativa <small>(opcional)</small>
        <textarea id="adminAccessBanNoteV75" rows="2" maxlength="1000" placeholder="Información interna sobre la decisión…"></textarea>
      </label>
      <div id="adminAccessBanWarningV75" class="v75-ban-warning"></div>
      <div class="v75-ban-actions">
        <button class="btn btn-start" type="submit">APLICAR BANEO</button>
        <button id="adminAccessUnbanV75" class="btn" type="button">QUITAR TODOS LOS BANEOS</button>
      </div>
      <p id="adminAccessBanStatusV75" class="status" aria-live="polite"></p>
    </form>`;
  bindBanFormV75();
}

function updateBanWarningV75(){
  const type=$('#adminAccessBanTypeV75')?.value;
  const days=$('#adminAccessBanDaysWrapV75');
  const warning=$('#adminAccessBanWarningV75');
  if(days)days.classList.toggle('hidden',type!=='temporary');
  if(!warning)return;
  warning.innerHTML=({
    temporary:'Bloquea el inicio de sesión hasta la fecha indicada y cierra las sesiones activas.',
    email_permanent:'Ese correo —incluidas variantes equivalentes de Gmail— no podrá volver a registrarse.',
    device_permanent:'Bloquea las instalaciones vinculadas. Se puede levantar desde este mismo panel.',
    ip_permanent:'Bloquea toda la red pública detectada. Puede afectar a otras personas del mismo hogar, club o Wi-Fi.'
  })[type]||'';
  warning.className='v75-ban-warning '+(type==='ip_permanent'?'is-danger':'');
}

async function applyBanV75(type){
  if(!selectedUserV75?.user_id)return;
  const status=$('#adminAccessBanStatusV75');
  const buttons=[...document.querySelectorAll('#adminAccessBanFormV75 button')];
  buttons.forEach(button=>button.disabled=true);
  if(status){status.textContent=type==='unban'?'Quitando bloqueos…':'Aplicando baneo…';status.className='status'}
  try{
    const {data,error}=await supabase.rpc('admin_apply_user_ban_v75',{
      p_user_id:selectedUserV75.user_id,
      p_ban_type:type,
      p_days:type==='temporary'?Number($('#adminAccessBanDaysV75')?.value||7):null,
      p_note:$('#adminAccessBanNoteV75')?.value||null
    });
    if(error)throw error;
    renderAdminBanV75(data,selectedUserV75.name);
    const nextStatus=$('#adminAccessBanStatusV75');
    if(nextStatus){nextStatus.textContent=type==='unban'?'Decisión: Baneos retirados':'Decisión: Baneo aplicado';nextStatus.className='status ok'}
    window.dispatchEvent(new CustomEvent('tt-v75-access-changed',{detail:{userId:selectedUserV75.user_id,type}}));
  }catch(error){
    if(status){status.textContent=error.message||'No se pudo aplicar la decisión.';status.className='status error'}
    buttons.forEach(button=>button.disabled=false);
  }
}

function bindBanFormV75(){
  $('#adminAccessBanTypeV75')?.addEventListener('change',updateBanWarningV75);
  $('#adminAccessBanFormV75')?.addEventListener('submit',event=>{
    event.preventDefault();applyBanV75($('#adminAccessBanTypeV75')?.value||'temporary');
  });
  $('#adminAccessUnbanV75')?.addEventListener('click',()=>applyBanV75('unban'));
  updateBanWarningV75();
}

export async function openAdminBanUserV75(userId,name=''){
  const modal=$('#adminAccessBanModalV75'),host=$('#adminAccessBanContentV75');
  if(!modal||!host)return;
  modal.classList.remove('hidden');document.body.classList.add('modal-open');
  host.innerHTML='<div class="loading-row">Cargando estado de acceso…</div>';
  const {data,error}=await supabase.rpc('admin_get_user_ban_v75',{p_user_id:userId});
  if(error){host.innerHTML='<div class="compact-empty">'+escV75(error.message||'No se pudo abrir el control de acceso.')+'</div>';return}
  renderAdminBanV75(data,name);
}

export function initAccessControlV75(){
  if(initializedV75)return;initializedV75=true;
  document.addEventListener('click',event=>{
    const direct=event.target.closest('[data-admin-ban-user-v75]');
    if(direct){
      openAdminBanUserV75(direct.dataset.adminBanUserV75,direct.dataset.adminBanNameV75||'').catch(console.error);
      return;
    }
    const selected=event.target.closest('[data-admin-ban-selected-v75]');
    if(selected){
      const picker=$('#adminSanctionUserV63');
      const option=picker?.selectedOptions?.[0];
      if(picker?.value)openAdminBanUserV75(picker.value,option?.textContent||'').catch(console.error);
    }
  });
  $('#closeAdminAccessBanV75')?.addEventListener('click',()=>{
    $('#adminAccessBanModalV75')?.classList.add('hidden');
    if(![...document.querySelectorAll('.modal')].some(modal=>!modal.classList.contains('hidden')))document.body.classList.remove('modal-open');
  });
}

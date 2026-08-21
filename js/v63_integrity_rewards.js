import {supabase} from './supabase.js';

const $=s=>document.querySelector(s);
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmtDate=v=>{try{return new Intl.DateTimeFormat('es-UY',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v))}catch{return '—'}};
const fmtDuration=s=>{const n=Math.max(0,Number(s)||0);const m=Math.floor(n/60),r=n%60;return m?`${m} min${r?` ${r} s`:''}`:`${r} s`};
const fullName=p=>`${p?.first_name||''} ${p?.last_name||''}`.trim()||p?.username||'Jugador';

async function rpc(name,args={}){
  const {data,error}=await supabase.rpc(name,args);
  if(error)throw error;
  return data;
}

const REWARDS=[
  {from:1,to:1,label:'#1 · CAMPEÓN',icon:'🏆',className:'champion',frame:'Marco exclusivo de campeón · 90 días',titles:'Élite + Podio + Número Uno',palmares:'Trofeo de campeón permanente',xp:5000,tickets:3},
  {from:2,to:2,label:'#2 · SUBCAMPEÓN',icon:'🥈',className:'second',frame:'Marco exclusivo #2 · 90 días',titles:'Élite + Podio de Temporada',palmares:'Trofeo plateado permanente',xp:3000,tickets:2},
  {from:3,to:3,label:'#3 · TERCER PUESTO',icon:'🥉',className:'third',frame:'Marco exclusivo #3 · 90 días',titles:'Élite + Podio de Temporada',palmares:'Trofeo de bronce permanente',xp:2000,tickets:1},
  {from:4,to:10,label:'#4–#10 · ÉLITE',icon:'👑',className:'elite',frame:'Marco Élite Top 10 · 90 días',titles:'Élite de TT Rivals',palmares:'Medalla Top 10 permanente',xp:1000,tickets:0}
];

function rewardForPosition(position){
  const p=Number(position)||0;
  return REWARDS.find(r=>p>=r.from&&p<=r.to)||null;
}

export async function openSeasonRewardsV63({position=null}={}){
  const modal=$('#seasonRewardsModalV63'),grid=$('#seasonRewardsGridV63'),current=$('#seasonRewardsCurrentV63');
  if(!modal||!grid)return;
  const pos=Number(position)||0;
  const mine=rewardForPosition(pos);
  grid.innerHTML=REWARDS.map(r=>`<article class="v63-reward-tier is-${r.className} ${mine===r?'is-current':''}">
    <div class="v63-reward-tier-head"><span>${r.icon}</span><div><small>PREMIO DE TEMPORADA</small><strong>${esc(r.label)}</strong></div>${mine===r?'<b>TU PREMIO HOY</b>':''}</div>
    <ul>
      <li>◈ ${esc(r.frame)}</li>
      <li>✦ ${esc(r.titles)}</li>
      <li>🏛 ${esc(r.palmares)}</li>
      <li>⚡ +${r.xp.toLocaleString('es-UY')} XP de cuenta</li>
      ${r.tickets?`<li>🎟 +${r.tickets} ticket${r.tickets===1?'':'s'} de Video Lab acumulable${r.tickets===1?'':'s'}</li>`:'<li>🎟 Sin tickets adicionales</li>'}
    </ul>
  </article>`).join('');
  if(current){
    current.innerHTML=mine
      ?`<span>Si la temporada terminara hoy</span><strong>#${pos}</strong><small>${mine.icon} ${esc(mine.label.replace(/^#[^·]+·\s*/,''))} · +${mine.xp.toLocaleString('es-UY')} XP${mine.tickets?` · +${mine.tickets} 🎟`:''}</small>`
      :`<span>Tu posición actual</span><strong>${pos?`#${pos}`:'#—'}</strong><small>Entrá al Top 10 para obtener un premio de temporada.</small>`;
  }
  modal.classList.remove('hidden');
}

export async function loadOwnPalmaresV63(){
  const host=$('#profilePalmaresV63');if(!host)return;
  host.innerHTML='<div class="loading-row">Cargando palmarés…</div>';
  try{
    const {data:{session}}=await supabase.auth.getSession();
    if(!session?.user){host.innerHTML='<div class="compact-empty">Iniciá sesión para ver tu palmarés.</div>';return}
    const p=await rpc('get_player_palmares_v63',{p_user_id:session.user.id});
    const items=Array.isArray(p?.items)?p.items:[];
    host.innerHTML=`<div class="v63-palmares-summary">
      <article><span>🏆</span><strong>${Number(p?.championships)||0}</strong><small>campeonatos</small></article>
      <article><span>🥉</span><strong>${Number(p?.podiums)||0}</strong><small>podios</small></article>
      <article><span>👑</span><strong>${Number(p?.top10)||0}</strong><small>Top 10</small></article>
    </div>
    <div class="v63-palmares-list">${items.length?items.slice(0,8).map(x=>{
      const pos=Number(x.final_position)||0;
      const icon=pos===1?'🏆':pos===2?'🥈':pos===3?'🥉':'👑';
      return `<article><span>${icon}</span><div><strong>Temporada ${esc(x.season_number||'—')} · #${pos||'—'}</strong><small>${esc(x.rank_name||'')} · ${Number(x.final_rating)||0} Elo${Number(x.xp_awarded)>0?` · +${Number(x.xp_awarded).toLocaleString('es-UY')} XP`:''}${Number(x.tickets_awarded)>0?` · +${x.tickets_awarded} 🎟`:''}</small></div></article>`;
    }).join(''):'<div class="compact-empty">Tu palmarés se estrenará cuando cierres una temporada dentro del Top 10.</div>'}</div>`;
  }catch(err){
    console.warn('Palmarés V63:',err);host.innerHTML='<div class="compact-empty">El palmarés estará disponible cuando se instale el backend V63.</div>';
  }
}


export async function loadPublicPalmaresV63(userId){
  const host=$('#publicPalmaresV63');if(!host||!userId)return;
  host.innerHTML='<div class="loading-row">Cargando palmarés…</div>';
  try{
    const p=await rpc('get_player_palmares_v63',{p_user_id:userId});
    const items=Array.isArray(p?.items)?p.items:[];
    host.innerHTML=`<div class="public-showcase-head"><p class="muted-label">PALMARÉS</p><span>${Number(p?.championships)||0} campeonatos · ${Number(p?.podiums)||0} podios · ${Number(p?.top10)||0} Top 10</span></div>
      <div class="v63-palmares-list">${items.length?items.slice(0,6).map(x=>{
        const pos=Number(x.final_position)||0;
        const icon=pos===1?'🏆':pos===2?'🥈':pos===3?'🥉':'👑';
        return `<article><span>${icon}</span><div><strong>Temporada ${esc(x.season_number||'—')} · #${pos||'—'}</strong><small>${esc(x.rank_name||'')} · ${Number(x.final_rating)||0} Elo</small></div></article>`;
      }).join(''):'<div class="compact-empty">Este jugador todavía no tiene premios de temporada.</div>'}</div>`;
  }catch(err){
    console.warn('Palmarés público V63:',err);host.innerHTML='<div class="compact-empty">No se pudo cargar el palmarés.</div>';
  }
}

function riskLabel(n){n=Number(n)||0;return n>=75?'ALTO':n>=50?'MEDIO':n>0?'BAJO':'SIN ALERTA'}
function sanctionLabel(k){return ({warning:'Advertencia',ranked_block:'Bloqueo de Elo',suspension:'Suspensión'})[k]||k}
function decisionCopyV63(action){return ({legitimate:{label:'Legítimo',detail:'La señal quedó cerrada como legítima.',icon:'✓'},watch:{label:'En observación',detail:'La señal seguirá visible para seguimiento.',icon:'◉'},reopen:{label:'Reabierto',detail:'El resultado volvió a estar disponible para resolver.',icon:'↩'},annul:{label:'Anulado',detail:'El partido y su impacto competitivo fueron anulados.',icon:'✕'}})[action]||{label:'Registrada',detail:'La decisión administrativa fue aplicada.',icon:'✓'}}
function showAdminDecisionToastV63(action){
  const copy=decisionCopyV63(action);let host=document.querySelector('#v63AdminDecisionToastHost');
  if(!host){host=document.createElement('div');host.id='v63AdminDecisionToastHost';host.className='v63-admin-decision-toast-host';document.body.appendChild(host)}
  const toast=document.createElement('article');toast.className='v63-admin-decision-toast action-'+String(action||'').replace(/[^a-z]/g,'');
  toast.innerHTML='<span>'+esc(copy.icon)+'</span><div><small>DECISIÓN ADMINISTRATIVA</small><strong>Decisión: '+esc(copy.label)+'</strong><p>'+esc(copy.detail)+'</p></div>';
  host.appendChild(toast);requestAnimationFrame(()=>toast.classList.add('show'));setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),260)},4800);
}
function integritySummaryCard(data,label){
  const sanctions=(data?.sanctions||[]).filter(s=>s.active&&(!s.ends_at||new Date(s.ends_at)>new Date()));
  return `<article class="v63-player-integrity"><span>${esc(label)}</span><div><b>${Number(data?.alerts)||0}</b><small>alertas</small></div><div><b>${Number(data?.legitimate)||0}</b><small>legítimas</small></div><div><b>${Number(data?.annulled)||0}</b><small>anuladas</small></div><p>${sanctions.length?`⚠ ${sanctions.map(s=>sanctionLabel(s.kind)).join(' · ')}`:'Sin sanciones activas'}</p></article>`;
}

function renderAdminMatchReviewV63(payload){
  const host=$('#adminMatchReviewContentV63');if(!host)return;
  const m=payload?.match||{},p1=payload?.player1||{},p2=payload?.player2||{};
  const sets=Array.isArray(payload?.sets)?payload.sets:[],rating=Array.isArray(payload?.rating_history)?payload.rating_history:[],audit=Array.isArray(payload?.audit)?payload.audit:[];
  const review=payload?.review||{};
  const statusLabel=({legitimate:'LEGÍTIMO',watching:'EN OBSERVACIÓN',reopened:'REABIERTO',annulled:'ANULADO',pending:'SIN REVISAR'})[review.status]||'SIN REVISAR';
  host.innerHTML=`
    <div class="v63-admin-review-hero">
      <div><p class="muted-label">PARTIDO #${Number(m.id)||'—'}</p><h2>${esc(fullName(p1))} <span>${Number(m.player1_sets)||0}–${Number(m.player2_sets)||0}</span> ${esc(fullName(p2))}</h2><small>@${esc(p1.username||'—')} vs @${esc(p2.username||'—')}</small></div>
      <b class="risk-${Number(m.risk_score)>=75?'high':Number(m.risk_score)>=50?'medium':'low'}">${riskLabel(m.risk_score)} · ${Number(m.risk_score)||0}/100</b>
    </div>
    <div class="v63-admin-evidence-grid">
      <article><span>Formato</span><strong>${m.match_format==='bo5'?'Bo5':m.match_format==='bo3'?'Bo3':'1 set'}</strong><small>${esc(m.match_type||'ranked')}</small></article>
      <article><span>Juego medido</span><strong>${fmtDuration(m.gameplay_seconds)}</strong><small>mínimo esperado ${fmtDuration(m.minimum_seconds)}</small></article>
      <article><span>Duración oficial</span><strong>${m.duration_seconds==null?'—':fmtDuration(m.duration_seconds)}</strong><small>${m.started_at?fmtDate(m.started_at):'sin inicio registrado'}</small></article>
      <article><span>Repetición rápida</span><strong>${Number(m.fast_matches_between_pair)||0}</strong><small>entre esta pareja</small></article>
      <article><span>Instalación</span><strong>${m.same_device_or_linked?'VINCULADA':'Sin vínculo'}</strong><small>${m.same_device_or_linked?'señal de mayor atención':'no detectada'}</small></article>
      <article><span>Estado Admin</span><strong>${statusLabel}</strong><small>${review.reviewed_at?fmtDate(review.reviewed_at):'pendiente'}</small></article>
    </div>
    <section class="v63-admin-review-section"><div class="section-title-row"><div><p class="muted-label">RESULTADO CARGADO</p><h3>Sets del partido</h3></div></div>
      <div class="v63-admin-set-list">${sets.length?sets.map(s=>`<div><span>Set ${s.set_number}</span><strong>${esc(fullName(p1))} ${s.player1_points} – ${s.player2_points} ${esc(fullName(p2))}</strong></div>`).join(''):'<div class="compact-empty">No hay sets guardados.</div>'}</div>
    </section>
    <section class="v63-admin-review-section"><div class="section-title-row"><div><p class="muted-label">ELO</p><h3>Trazabilidad del rating</h3></div></div>
      <div class="v63-admin-rating-list">${rating.length?rating.map(r=>`<div><span>${esc(r.user_id===p1.id?fullName(p1):fullName(p2))}</span><b>${r.previous_rating} ${Number(r.rating_change)>=0?'+':''}${r.rating_change} → ${r.new_rating}</b><small>${esc(r.source_type||'')}</small></div>`).join(''):'<div class="compact-empty">Este partido no tiene movimientos de Elo.</div>'}</div>
    </section>
    <div class="v63-player-integrity-grid">${integritySummaryCard(payload.player1_integrity,fullName(p1))}${integritySummaryCard(payload.player2_integrity,fullName(p2))}</div>
    <section class="v63-admin-review-actions">
      <div><p class="muted-label">DECISIÓN ADMINISTRATIVA</p><h3>Resolver señal</h3><small>La alerta nunca sanciona automáticamente. La decisión queda registrada.</small></div>
      <textarea id="adminMatchReviewNoteV63" rows="2" maxlength="1500" placeholder="Nota administrativa (opcional)…">${esc(review.note||'')}</textarea>
      <div class="v63-admin-action-grid">
        <button data-v63-review-action="legitimate" type="button">✓ Marcar legítimo</button>
        <button data-v63-review-action="watch" type="button">👁 Mantener en observación</button>
        <button data-v63-review-action="reopen" class="is-warning" type="button">↩ Reabrir resultado</button>
        <button data-v63-review-action="annul" class="is-danger" type="button">✕ Anular partido</button>
      </div>
      <p id="adminMatchReviewStatusV63" class="status"></p>
    </section>
    <section class="v63-admin-review-section v63-sanction-box">
      <div><p class="muted-label">JUGADORES</p><h3>Medida administrativa</h3><small>Advertencia, bloqueo temporal de partidas con Elo o suspensión temporal.</small></div>
      <div class="v63-sanction-form">
        <select id="adminSanctionUserV63"><option value="${p1.id}">${esc(fullName(p1))}</option><option value="${p2.id}">${esc(fullName(p2))}</option></select>
        <select id="adminSanctionKindV63"><option value="warning">Advertencia</option><option value="ranked_block">Bloquear partidas con Elo</option><option value="suspension">Suspender desafíos</option><option value="clear">Quitar sanciones activas</option></select>
        <input id="adminSanctionDaysV63" type="number" min="1" max="365" value="7" aria-label="Días">
        <textarea id="adminSanctionReasonV63" rows="2" maxlength="1000" placeholder="Motivo de la medida…"></textarea>
        <button id="adminApplySanctionV63" type="button">Aplicar medida</button><button data-admin-ban-selected-v75 class="v75-open-ban-from-review" type="button">◆ Administrar baneo</button>
      </div><p id="adminSanctionStatusV63" class="status"></p>
    </section>
    <section class="v63-admin-review-section"><div class="section-title-row"><div><p class="muted-label">AUDITORÍA</p><h3>Historial de decisiones</h3></div></div>
      <div class="v63-audit-list">${audit.length?audit.map(a=>`<article><span>${fmtDate(a.created_at)}</span><strong>${esc(String(a.action||'').toUpperCase())}</strong><small>${esc(a.note||'Sin nota')}</small></article>`).join(''):'<div class="compact-empty">Todavía no hay decisiones administrativas sobre este partido.</div>'}</div>
    </section>`;

  host.querySelectorAll('[data-v63-review-action]').forEach(btn=>btn.addEventListener('click',async()=>{
    const status=$('#adminMatchReviewStatusV63'),note=$('#adminMatchReviewNoteV63')?.value||'',action=btn.dataset.v63ReviewAction;
    btn.disabled=true;if(status){status.textContent='Aplicando decisión…';status.className='status'}
    try{
      const next=await rpc('admin_review_match_v63',{p_match_id:Number(m.id),p_action:action,p_note:note});
      renderAdminMatchReviewV63(next);showAdminDecisionToastV63(action);window.dispatchEvent(new CustomEvent('tt-v63-integrity-changed'));
    }catch(err){if(status){status.textContent=err.message||'No se pudo aplicar la decisión.';status.className='status error'}btn.disabled=false}
  }));
  $('#adminApplySanctionV63')?.addEventListener('click',async e=>{
    const b=e.currentTarget,status=$('#adminSanctionStatusV63'),kind=$('#adminSanctionKindV63')?.value||'warning';
    const userId=$('#adminSanctionUserV63')?.value,reason=$('#adminSanctionReasonV63')?.value||'',days=Number($('#adminSanctionDaysV63')?.value)||7;
    b.disabled=true;if(status){status.textContent='Guardando medida…';status.className='status'}
    try{await rpc('admin_set_player_sanction_v63',{p_user_id:userId,p_kind:kind,p_days:days,p_reason:reason});const next=await rpc('admin_get_match_review_v63',{p_match_id:Number(m.id)});renderAdminMatchReviewV63(next);}
    catch(err){if(status){status.textContent=err.message||'No se pudo aplicar la medida.';status.className='status error'}b.disabled=false}
  });
}

export async function openAdminMatchReviewV63(matchId){
  const modal=$('#adminMatchReviewModalV63'),host=$('#adminMatchReviewContentV63');if(!modal||!host)return;
  modal.classList.remove('hidden');
  host.innerHTML='<div class="loading-row">Cargando evidencia del partido…</div>';
  try{renderAdminMatchReviewV63(await rpc('admin_get_match_review_v63',{p_match_id:Number(matchId)}))}
  catch(err){host.innerHTML=`<div class="compact-empty">${esc(err.message||'No se pudo abrir la revisión.')}</div>`}
}

export function initV63IntegrityRewards(){
  $('#closeSeasonRewardsV63')?.addEventListener('click',()=>{$('#seasonRewardsModalV63')?.classList.add('hidden')});
  $('#seasonRewardsModalV63')?.addEventListener('click',e=>{if(e.target===e.currentTarget)$('#closeSeasonRewardsV63')?.click()});
  $('#closeAdminMatchReviewV63')?.addEventListener('click',()=>{$('#adminMatchReviewModalV63')?.classList.add('hidden')});
  $('#adminMatchReviewModalV63')?.addEventListener('click',e=>{if(e.target===e.currentTarget)$('#closeAdminMatchReviewV63')?.click()});
}

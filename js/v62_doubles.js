import {supabase} from './supabase.js';
import {searchPlayers} from './profile.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let initialized=false;
let sessionUser=null;
let activeSlot='teammate';
let searchTimer=null;
let selected={teammate:null,opponent1:null,opponent2:null};
let matchType='ranked';
let profileMap=new Map();

async function me(){
  if(sessionUser)return sessionUser;
  const {data,error}=await supabase.auth.getSession();
  if(error)throw error;
  sessionUser=data?.session?.user||null;
  return sessionUser;
}
function setStatus(text='',kind=''){
  const el=$('#doublesCreateStatusV62');if(!el)return;
  el.textContent=text;el.className=`status ${kind}`.trim();
}
function playerName(p){return `${p?.first_name||''} ${p?.last_name||''}`.trim()||'Jugador'}
function slotButton(key){return document.querySelector(`[data-doubles-slot-v62="${key}"]`)}
function updateSlots(){
  for(const key of ['teammate','opponent1','opponent2']){
    const b=slotButton(key),p=selected[key];if(!b)continue;
    const fallback=key==='teammate'?['＋ Compañero','Elegir jugador']:key==='opponent1'?['＋ Rival 1','Elegir jugador']:['＋ Rival 2','Elegir jugador'];
    b.classList.toggle('filled',!!p);b.classList.toggle('active',activeSlot===key);
    b.innerHTML=p?`<b>${esc(playerName(p))}</b><small>@${esc(p.username||'usuario')} · tocar para cambiar</small>`:`<b>${fallback[0]}</b><small>${fallback[1]}</small>`;
  }
  const ready=selected.teammate&&selected.opponent1&&selected.opponent2;
  const send=$('#sendDoublesChallengeV62');if(send)send.disabled=!ready;
}
function chooseSlot(key){activeSlot=key;updateSlots();$('#doublesSearchShellV62')?.classList.remove('hidden');$('#doublesPlayerSearchV62')?.focus();}
function alreadySelected(id){return Object.values(selected).some(p=>p?.id===id)}
async function runSearch(){
  const input=$('#doublesPlayerSearchV62'),box=$('#doublesPlayerResultsV62');if(!input||!box)return;
  const q=input.value.trim();
  if(!q){box.innerHTML='<div class="loading-row">Escribí para buscar jugadores.</div>';return}
  const user=await me();if(!user)return;
  try{
    const rows=await searchPlayers(q,user.id);
    const filtered=(rows||[]).filter(p=>!alreadySelected(p.id));
    box.innerHTML=filtered.length?filtered.map(p=>`<button class="doubles-player-pick-v62" type="button" data-doubles-pick-v62="${esc(p.id)}"><span class="doubles-pick-avatar-v62">${p.profile_photo_url?`<img src="${esc(p.profile_photo_url)}" alt="">`:esc((p.first_name||'?').slice(0,1))}</span><div><strong>${esc(playerName(p))}</strong><small>@${esc(p.username||'usuario')}</small></div><b>Elegir</b></button>`).join(''):'<div class="loading-row">No se encontraron jugadores disponibles.</div>';
    filtered.forEach(p=>profileMap.set(p.id,p));
  }catch(err){box.innerHTML=`<div class="loading-row">${esc(err?.message||'No se pudo buscar.')}</div>`}
}
function pickPlayer(id){
  const p=profileMap.get(id);if(!p)return;
  selected[activeSlot]=p;
  const order=['teammate','opponent1','opponent2'];const idx=order.indexOf(activeSlot);const next=order.slice(idx+1).find(k=>!selected[k]);
  if(next)activeSlot=next;
  updateSlots();
  const input=$('#doublesPlayerSearchV62');if(input)input.value='';
  const box=$('#doublesPlayerResultsV62');if(box)box.innerHTML=next?'<div class="loading-row">Buscá el siguiente jugador.</div>':'<div class="compact-empty">Parejas completas. Revisá la configuración y enviá el desafío.</div>';
  if(!next)$('#doublesSearchShellV62')?.classList.add('hidden');
}
function formatLabel(fmt){return fmt==='bo5'?'Mejor de 5':fmt==='bo3'?'Mejor de 3':'1 set'}
function typeLabel(type){return type==='casual'?'Casual':'Con ranking'}
function statusLabel(status){return ({pending:'Esperando respuestas',accepted:'Aceptado',rejected:'Rechazado',cancelled:'Cancelado',completed:'Completado'})[status]||status}
async function loadProfiles(ids=[]){
  const clean=[...new Set(ids.filter(Boolean))];if(!clean.length)return;
  const missing=clean.filter(id=>!profileMap.has(id));if(!missing.length)return;
  const {data}=await supabase.from('profiles').select('id,username,first_name,last_name,profile_photo_url').in('id',missing);
  (data||[]).forEach(p=>profileMap.set(p.id,p));
}
function teamText(c,team){
  const ids=team===1?[c.creator_id,c.teammate_id]:[c.opponent1_id,c.opponent2_id];
  return ids.map(id=>playerName(profileMap.get(id))).join(' / ');
}
async function loadChallenges(){
  const user=await me(),root=$('#doublesChallengesV62');if(!user||!root)return;
  const {data,error}=await supabase.from('doubles_challenges_v62').select('*').or(`creator_id.eq.${user.id},teammate_id.eq.${user.id},opponent1_id.eq.${user.id},opponent2_id.eq.${user.id}`).order('created_at',{ascending:false}).limit(30);
  if(error){root.innerHTML='<div class="compact-empty">Activá el SQL V62 para usar desafíos 2 vs 2.</div>';return}
  const rows=data||[];await loadProfiles(rows.flatMap(c=>[c.creator_id,c.teammate_id,c.opponent1_id,c.opponent2_id]));
  $('#doublesChallengeCountV62').textContent=String(rows.filter(c=>['pending','accepted'].includes(c.status)).length);
  root.innerHTML=rows.length?rows.map(c=>{
    const accepted=Array.isArray(c.accepted_ids)?c.accepted_ids:[];
    const participant=[c.creator_id,c.teammate_id,c.opponent1_id,c.opponent2_id].includes(user.id);
    const needsResponse=participant&&c.creator_id!==user.id&&c.status==='pending'&&!accepted.includes(user.id);
    const canCancel=c.creator_id===user.id&&c.status==='pending';
    return `<article class="doubles-challenge-card-v62"><div class="doubles-challenge-teams-v62"><div><small>EQUIPO A</small><strong>${esc(teamText(c,1))}</strong></div><b>VS</b><div><small>EQUIPO B</small><strong>${esc(teamText(c,2))}</strong></div></div><div class="doubles-challenge-meta-v62"><span>${formatLabel(c.match_format)}</span><span>${typeLabel(c.match_type)}</span><span>${statusLabel(c.status)}</span><span>${accepted.length}/4 confirmados</span></div>${needsResponse?`<div class="doubles-card-actions-v62"><button data-doubles-response-v62="accept" data-id="${c.id}" type="button">Aceptar</button><button class="danger" data-doubles-response-v62="reject" data-id="${c.id}" type="button">Rechazar</button></div>`:''}${canCancel?`<div class="doubles-card-actions-v62"><button class="danger soft" data-doubles-cancel-v62="${c.id}" type="button">Cancelar desafío</button></div>`:''}</article>`;
  }).join(''):'<div class="compact-empty">No tenés desafíos 2 vs 2 todavía.</div>';
}
function matchTeam(m,team){return team===1?[m.team1_player1,m.team1_player2]:[m.team2_player1,m.team2_player2]}
function matchTeamText(m,team){return matchTeam(m,team).map(id=>playerName(profileMap.get(id))).join(' / ')}
function resultSetsHtml(m){
  const sets=Array.isArray(m.set_scores)?m.set_scores:[];
  return sets.length?`<div class="doubles-set-chips-v62">${sets.map((s,i)=>`<span>Set ${i+1}: <b>${Number(s.team1_points)}–${Number(s.team2_points)}</b></span>`).join('')}</div>`:'';
}
async function loadMatches(){
  const user=await me(),root=$('#doublesMatchesV62');if(!user||!root)return;
  const {data,error}=await supabase.from('doubles_matches_v62').select('*').or(`team1_player1.eq.${user.id},team1_player2.eq.${user.id},team2_player1.eq.${user.id},team2_player2.eq.${user.id}`).order('created_at',{ascending:false}).limit(30);
  if(error){root.innerHTML='<div class="compact-empty">Los partidos 2 vs 2 estarán disponibles al ejecutar el SQL V62.</div>';return}
  const rows=data||[];await loadProfiles(rows.flatMap(m=>[m.team1_player1,m.team1_player2,m.team2_player1,m.team2_player2]));
  const active=rows.filter(m=>!['confirmed'].includes(m.result_status));$('#doublesMatchCountV62').textContent=String(active.length);
  root.innerHTML=active.length?active.map(m=>{
    const myTeam=matchTeam(m,1).includes(user.id)?1:2;
    const submitterTeam=Number(m.result_submitted_team||0);
    const canConfirm=m.result_status==='awaiting_confirmation'&&submitterTeam&&submitterTeam!==myTeam;
    const canSubmit=['pending','disputed'].includes(m.result_status);
    const state=m.result_status==='pending'?'Pendiente de resultado':m.result_status==='awaiting_confirmation'?'Esperando confirmación':m.result_status==='disputed'?'Resultado disputado':'Confirmado';
    return `<article class="doubles-match-card-v62"><div class="doubles-match-score-v62"><div><small>EQUIPO A</small><strong>${esc(matchTeamText(m,1))}</strong></div><b>${Number(m.team1_sets||0)} <i>–</i> ${Number(m.team2_sets||0)}</b><div><small>EQUIPO B</small><strong>${esc(matchTeamText(m,2))}</strong></div></div><div class="doubles-challenge-meta-v62"><span>${formatLabel(m.match_format)}</span><span>${typeLabel(m.match_type)}</span><span>${state}</span></div>${resultSetsHtml(m)}<div class="doubles-card-actions-v62">${canSubmit?`<button data-doubles-result-v62="${m.id}" type="button">Registrar resultado</button>`:''}${canConfirm?`<button data-doubles-confirm-v62="${m.id}" type="button">Confirmar</button><button class="danger" data-doubles-dispute-v62="${m.id}" type="button">Disputar</button>`:''}</div></article>`;
  }).join(''):'<div class="compact-empty">No hay partidos 2 vs 2 pendientes.</div>';
}
async function refresh(){await Promise.all([loadChallenges(),loadMatches()])}
function buildResultModal(m){
  let modal=$('#doublesResultModalV62');if(modal)modal.remove();
  const max=m.match_format==='bo5'?5:m.match_format==='bo3'?3:1;
  modal=document.createElement('div');modal.id='doublesResultModalV62';modal.className='modal';
  modal.innerHTML=`<div class="modal-card doubles-result-modal-v62"><button class="modal-close" data-close-doubles-result-v62 type="button">✕</button><p class="muted-label">RESULTADO 2 VS 2</p><h2>${esc(matchTeamText(m,1))} <span>vs</span> ${esc(matchTeamText(m,2))}</h2><p class="subtitle compact">Cargá los puntos de cada set. El otro equipo deberá confirmar el resultado.</p><div class="doubles-result-sets-v62">${Array.from({length:max},(_,i)=>`<div><span>Set ${i+1}</span><input type="number" min="0" max="99" inputmode="numeric" data-doubles-team1-points-v62><b>–</b><input type="number" min="0" max="99" inputmode="numeric" data-doubles-team2-points-v62></div>`).join('')}</div><button class="btn btn-start" data-submit-doubles-result-v62="${m.id}" type="button">ENVIAR RESULTADO</button><p class="status" id="doublesResultStatusV62"></p></div>`;
  document.body.appendChild(modal);
}
function collectSets(modal,format){
  const a=[...modal.querySelectorAll('[data-doubles-team1-points-v62]')],b=[...modal.querySelectorAll('[data-doubles-team2-points-v62]')];
  const sets=[];let gap=false;const need=format==='bo5'?3:format==='bo3'?2:1;let w1=0,w2=0;
  for(let i=0;i<a.length;i++){
    const av=a[i].value,bv=b[i].value;if(av===''&&bv===''){gap=true;continue}if(gap)throw new Error('Los sets deben cargarse en orden.');if(av===''||bv==='')throw new Error('Completá ambos puntajes.');
    const x=Number(av),y=Number(bv);if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x===y)throw new Error('Revisá los puntajes de los sets.');
    if(Math.max(x,y)<11||Math.abs(x-y)<2)throw new Error('Cada set debe terminar con al menos 11 puntos y 2 de diferencia.');
    sets.push({team1_points:x,team2_points:y});if(x>y)w1++;else w2++;if(w1>=need||w2>=need)gap=true;
  }
  if(!sets.length||Math.max(w1,w2)<need)throw new Error('Todavía no hay un ganador de la serie.');return sets;
}
async function createChallenge(event){
  event.preventDefault();const form=event.currentTarget;const user=await me();if(!user)return;
  if(!selected.teammate||!selected.opponent1||!selected.opponent2)return;
  const btn=$('#sendDoublesChallengeV62');btn.disabled=true;setStatus('Enviando desafío…');
  const {error}=await supabase.rpc('create_doubles_challenge_v62',{p_teammate:selected.teammate.id,p_opponent1:selected.opponent1.id,p_opponent2:selected.opponent2.id,p_match_format:$('#doublesFormatV62').value,p_match_type:matchType,p_scheduled_date:$('#doublesDateV62').value||null,p_scheduled_time:$('#doublesTimeV62').value||null,p_location:$('#doublesLocationV62').value.trim()||null});
  if(error){setStatus(error.message,'error');btn.disabled=false;return}
  setStatus('Desafío 2 vs 2 enviado ✓','ok');selected={teammate:null,opponent1:null,opponent2:null};activeSlot='teammate';updateSlots();form.reset();matchType='ranked';$$('[data-doubles-type-v62]').forEach(b=>b.classList.toggle('active',b.dataset.doublesTypeV62==='ranked'));await refresh();
}
async function handleClick(e){
  const mode=e.target.closest('[data-play-mode-v62]');if(mode){const value=mode.dataset.playModeV62;$$('[data-play-mode-v62]').forEach(b=>b.classList.toggle('active',b===mode));$('#playIndividualModeV62')?.classList.toggle('hidden',value!=='individual');$('#playDoublesModeV62')?.classList.toggle('hidden',value!=='doubles');if(value==='doubles')refresh();return}
  const slot=e.target.closest('[data-doubles-slot-v62]');if(slot){chooseSlot(slot.dataset.doublesSlotV62);return}
  const pick=e.target.closest('[data-doubles-pick-v62]');if(pick){pickPlayer(pick.dataset.doublesPickV62);return}
  const type=e.target.closest('[data-doubles-type-v62]');if(type){matchType=type.dataset.doublesTypeV62==='casual'?'casual':'ranked';$$('[data-doubles-type-v62]').forEach(b=>b.classList.toggle('active',b===type));return}
  const response=e.target.closest('[data-doubles-response-v62]');if(response){response.disabled=true;const {error}=await supabase.rpc('respond_doubles_challenge_v62',{p_challenge_id:Number(response.dataset.id),p_accept:response.dataset.doublesResponseV62==='accept'});if(error)alert(error.message);await refresh();return}
  const cancel=e.target.closest('[data-doubles-cancel-v62]');if(cancel){cancel.disabled=true;const {error}=await supabase.rpc('cancel_doubles_challenge_v62',{p_challenge_id:Number(cancel.dataset.doublesCancelV62)});if(error)alert(error.message);await refresh();return}
  const result=e.target.closest('[data-doubles-result-v62]');if(result){const user=await me();const {data}=await supabase.from('doubles_matches_v62').select('*').eq('id',Number(result.dataset.doublesResultV62)).single();if(data){await loadProfiles([data.team1_player1,data.team1_player2,data.team2_player1,data.team2_player2]);buildResultModal(data)}return}
  if(e.target.closest('[data-close-doubles-result-v62]')){$('#doublesResultModalV62')?.remove();return}
  const submit=e.target.closest('[data-submit-doubles-result-v62]');if(submit){const modal=$('#doublesResultModalV62'),status=$('#doublesResultStatusV62');submit.disabled=true;try{const {data:m,error:readErr}=await supabase.from('doubles_matches_v62').select('*').eq('id',Number(submit.dataset.submitDoublesResultV62)).single();if(readErr)throw readErr;const sets=collectSets(modal,m.match_format);const {error}=await supabase.rpc('submit_doubles_match_result_v62',{p_match_id:m.id,p_sets:sets});if(error)throw error;modal.remove();await refresh()}catch(err){status.textContent=err.message;status.className='status error';submit.disabled=false}return}
  const confirm=e.target.closest('[data-doubles-confirm-v62]');if(confirm){confirm.disabled=true;const {error}=await supabase.rpc('confirm_doubles_match_result_v62',{p_match_id:Number(confirm.dataset.doublesConfirmV62)});if(error)alert(error.message);else window.dispatchEvent(new CustomEvent('tt-v62-doubles-confirmed'));await refresh();return}
  const dispute=e.target.closest('[data-doubles-dispute-v62]');if(dispute){dispute.disabled=true;const {error}=await supabase.rpc('dispute_doubles_match_result_v62',{p_match_id:Number(dispute.dataset.doublesDisputeV62)});if(error)alert(error.message);await refresh();return}
}
export async function refreshDoublesV62(){return refresh()}
export async function initDoublesV62(){
  if(initialized)return;initialized=true;
  const user=await me();if(!user)return;
  const {data:p}=await supabase.from('profiles').select('id,username,first_name,last_name,profile_photo_url').eq('id',user.id).single();if(p){profileMap.set(p.id,p);const own=$('#doublesCreatorV62');if(own)own.innerHTML=`<b>${esc(playerName(p))}</b><small>@${esc(p.username||'vos')} · Vos</small>`}
  updateSlots();document.addEventListener('click',handleClick);$('#doublesChallengeFormV62')?.addEventListener('submit',createChallenge);$('#doublesPlayerSearchV62')?.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(runSearch,220)});await refresh();
}

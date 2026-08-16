import {getSession,signUpUser,signInUser,signOutUser} from './auth.js';
import {getMyProfile,getMyRatings,completeSportsProfile,getRanking,searchPlayers,getRatingHistory} from './profile.js';
import {createChallenge,respondToChallenge,cancelChallenge,getMyChallenges} from './challenges.js';
import {getMyMatches,submitMatchResult,confirmMatchResult,disputeMatchResult} from './matches.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const authShell=$('#authShell'),mainApp=$('#mainApp'),views=$$('.view');
let session=null,profile=null,ratings=[],rankingMode='individual',selectedRival=null,currentMatch=null;

function showView(id){authShell.classList.remove('hidden');mainApp.classList.add('hidden');views.forEach(v=>v.classList.toggle('active',v.id===id));window.scrollTo(0,0)}
function showMain(){authShell.classList.add('hidden');mainApp.classList.remove('hidden');activateTab('home')}
function setStatus(el,msg,type=''){el.textContent=msg;el.classList.remove('ok','error');if(type)el.classList.add(type)}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function cap(v){return v?v[0].toUpperCase()+v.slice(1):'—'}
function age(d){if(!d)return'—';const b=new Date(`${d}T00:00:00`),t=new Date();let a=t.getFullYear()-b.getFullYear();const m=t.getMonth()-b.getMonth();if(m<0||(m===0&&t.getDate()<b.getDate()))a--;return`${a} años`}
function getRating(mod){return ratings.find(r=>r.modality===mod)||{rating:1000,matches_played:0,wins:0,losses:0}}
function category(r,m){if(m<5)return'Provisional';if(r<700)return'Principiante';if(r<1000)return'Intermedio';if(r<1300)return'Avanzado';return'Competitivo'}
function friendly(m=''){const t=m.toLowerCase();if(t.includes('already registered'))return'Ese correo ya está registrado.';if(t.includes('duplicate')||t.includes('unique'))return'Ese nombre de usuario ya está en uso.';if(t.includes('invalid login credentials'))return'Correo o contraseña incorrectos.';return m||'Ocurrió un error.'}

function populate(){
  const ind=getRating('individual'),dob=getRating('dobles');
  $('#topGreeting').textContent=`Hola, ${profile.first_name}`;
  $('#homeUsername').textContent=`@${profile.username}`; $('#homeCategory').textContent=category(ind.rating,ind.matches_played);
  $('#homeIndividualRating').textContent=ind.rating; $('#homeDoublesRating').textContent=dob.rating;
  $('#profileName').textContent=`${profile.first_name} ${profile.last_name}`; $('#profileUsername').textContent=`@${profile.username}`;
  $('#profileIndividualRating').textContent=ind.rating; $('#profileDoublesRating').textContent=dob.rating;
  $('#profileStyle').textContent=cap(profile.playing_style);$('#profileHand').textContent=cap(profile.dominant_hand);$('#profileAge').textContent=age(profile.birth_date);$('#profileClub').textContent=profile.club_name||'N/A';
  $('#statMatches').textContent=ind.matches_played;$('#statWins').textContent=ind.wins;$('#statLosses').textContent=ind.losses;
  $('#statWinRate').textContent=ind.matches_played?`${((ind.wins/ind.matches_played)*100).toFixed(1)}%`:'—';
}
async function refreshCore(){ratings=await getMyRatings(session.user.id);populate();await Promise.all([loadRanking(),loadChallenges(),loadMatches(),loadHistory()])}
async function loadApp(uid,p=null){profile=p||await getMyProfile(uid);ratings=await getMyRatings(uid);populate();showMain();await Promise.all([loadRanking(),loadChallenges(),loadMatches(),loadHistory()])}
async function route(){session=await getSession();if(!session?.user){showView('welcomeView');setStatus($('#globalStatus'),'Conectado a TT Rivals.','ok');return}const p=await getMyProfile(session.user.id);if(!p.profile_completed){showView('sportsProfileView');return}await loadApp(session.user.id,p)}
function activateTab(tab){$$('.tab-page').forEach(p=>p.classList.toggle('active',p.id===`tab-${tab}`));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));window.scrollTo({top:0,behavior:'smooth'});if(tab==='ranking')loadRanking();if(tab==='play'||tab==='home'){loadChallenges();loadMatches()}if(tab==='stats')loadHistory()}

async function loadRanking(){const list=$('#rankingList'),q=$('#rankingSearch').value||'';list.innerHTML='<div class="loading-row">Cargando…</div>';try{const rows=await getRanking(rankingMode,q);list.innerHTML=rows.length?rows.map(x=>{const p=x.profile,m=x.position===1?'🥇':x.position===2?'🥈':x.position===3?'🥉':`#${x.position}`;return`<div class="rank-row"><div class="rank-pos">${m}</div><div class="rank-name"><strong>${esc(p.first_name)} ${esc(p.last_name)}</strong><small>@${esc(p.username)}</small></div><div class="rank-rating">${x.rating}</div></div>`}).join(''):'<div class="loading-row">Sin jugadores.</div>'}catch(e){list.innerHTML='<div class="loading-row">No se pudo cargar.</div>'}}

async function playerSearch(){const box=$('#challengePlayerResults'),q=$('#challengePlayerSearch').value.trim();if(!q){box.innerHTML='<div class="loading-row">Escribí para buscar jugadores.</div>';return}const rows=await searchPlayers(q,session.user.id);box.innerHTML=rows.length?rows.map(p=>`<div class="player-row"><div><strong>${esc(p.first_name)} ${esc(p.last_name)}</strong><small>@${esc(p.username)}</small></div><button data-select-rival="${p.id}" data-name="${esc(p.first_name)} ${esc(p.last_name)}" data-user="${esc(p.username)}">Desafiar</button></div>`).join(''):'<div class="loading-row">No encontrados.</div>'}
function selectRival(b){selectedRival={id:b.dataset.selectRival,name:b.dataset.name,user:b.dataset.user};$('#selectedRivalName').textContent=selectedRival.name;$('#selectedRivalUsername').textContent=`@${selectedRival.user}`;$('#challengeComposer').classList.remove('hidden');$('#challengePlayerResults').innerHTML='';$('#challengePlayerSearch').value=''}
function clearRival(){selectedRival=null;$('#challengeComposer').classList.add('hidden')}

function chCard(c,kind){const other=kind==='received'?c.challenger:c.challenged;const fmt=c.match_format==='bo5'?'Bo5':c.match_format==='bo3'?'Bo3':'1 set';let actions='';if(kind==='received'&&c.status==='pending')actions=`<div class="challenge-actions"><button class="accept-btn" data-response="accepted" data-id="${c.id}">Aceptar</button><button class="reject-btn" data-response="rejected" data-id="${c.id}">Rechazar</button></div>`;if(kind==='sent'&&c.status==='pending')actions=`<div class="challenge-actions"><button class="cancel-btn" data-cancel-challenge="${c.id}">Cancelar</button></div>`;return`<div class="challenge-row"><div class="challenge-meta"><strong>${esc(other?.first_name)} ${esc(other?.last_name)}</strong><small>@${esc(other?.username)} · ${fmt}</small><span class="challenge-status ${c.status==='accepted'?'status-accepted':'status-pending'}">${c.status}</span></div>${actions}</div>`}
async function loadChallenges(){if(!session)return;const rows=await getMyChallenges(session.user.id),rec=rows.filter(r=>r.challenged_id===session.user.id&&r.status==='pending'),sen=rows.filter(r=>r.challenger_id===session.user.id&&r.status==='pending');$('#receivedChallenges').innerHTML=rec.length?rec.map(r=>chCard(r,'received')).join(''):'<div class="loading-row">No tenés desafíos recibidos.</div>';$('#sentChallenges').innerHTML=sen.length?sen.map(r=>chCard(r,'sent')).join(''):'<div class="loading-row">No tenés desafíos enviados.</div>';$('#homeChallenges').innerHTML=rows.slice(0,3).length?rows.slice(0,3).map(r=>chCard(r,r.challenged_id===session.user.id?'received':'sent')).join(''):'<div class="loading-row">Todavía no tenés desafíos.</div>';$('#notificationBadge').textContent=rec.length}

function matchCard(m){
  const me=session.user.id,other=m.player1_id===me?m.player2:m.player1;
  const fmt=m.match_format==='bo5'?'Mejor de 5':m.match_format==='bo3'?'Mejor de 3':'1 set';
  let state='Pendiente de resultado', cls='status-accepted', actions='';
  if(m.result_status==='pending'){
    actions=`<div class="match-actions"><button class="result-btn" data-enter-result="${m.id}">Registrar resultado</button></div>`;
  }else if(m.result_status==='awaiting_confirmation'){
    state='Esperando confirmación';cls='status-confirmation';
    if(m.result_submitted_by!==me) actions=`<div class="match-actions"><button class="confirm-btn" data-confirm-match="${m.id}">Confirmar</button><button class="dispute-btn" data-dispute-match="${m.id}">Disputar</button></div>`;
  }else if(m.result_status==='confirmed'){state='Confirmado';cls='status-accepted'}
  else if(m.result_status==='disputed'){state='En disputa';cls='status-disputed'}
  const result=m.player1_sets||m.player2_sets?` · ${m.player1_sets}-${m.player2_sets}`:'';
  return`<div class="match-row"><div class="match-meta"><strong>vs ${esc(other?.first_name)} ${esc(other?.last_name)}</strong><small>${fmt}${result}</small><span class="challenge-status ${cls}">${state}</span></div>${actions}</div>`
}
async function loadMatches(){if(!session)return;try{const rows=await getMyMatches(session.user.id);$('#activeMatches').innerHTML=rows.length?rows.filter(m=>m.result_status!=='confirmed').map(matchCard).join('')||'<div class="loading-row">No hay partidos pendientes.</div>':'<div class="loading-row">No hay partidos todavía.</div>'}catch(e){console.error(e);$('#activeMatches').innerHTML='<div class="loading-row">No se pudieron cargar los partidos.</div>'}}

async function loadHistory(){if(!session)return;try{const rows=await getRatingHistory(session.user.id);$('#ratingHistoryList').innerHTML=rows.length?rows.map(r=>`<div class="history-row"><div><strong>${r.new_rating} Elo</strong><small>${new Date(r.created_at).toLocaleDateString()}</small></div><strong class="history-change ${r.rating_change>=0?'positive':'negative'}">${r.rating_change>=0?'+':''}${r.rating_change}</strong></div>`).join(''):'<div class="loading-row">Todavía no hay cambios de rating.</div>'}catch(e){$('#ratingHistoryList').innerHTML='<div class="loading-row">No se pudo cargar el historial.</div>'}}

function openMatchModal(matchId,matchesCache=[]){
  const m=matchesCache.find(x=>x.id===Number(matchId)); if(!m)return;
  currentMatch=m;const fmt=m.match_format==='bo5'?5:m.match_format==='bo3'?3:1;
  $('#matchModalTitle').textContent=`${m.player1?.first_name||'Jugador 1'} vs ${m.player2?.first_name||'Jugador 2'}`;
  $('#matchModalFormat').textContent=m.match_format==='bo5'?'Mejor de 5':m.match_format==='bo3'?'Mejor de 3':'1 set';
  $('#setInputs').innerHTML=Array.from({length:fmt},(_,i)=>`<div class="set-row"><strong>Set ${i+1}</strong><label>${esc(m.player1?.first_name||'J1')}<input type="number" min="0" max="99" data-p1-set="${i+1}"></label><label>${esc(m.player2?.first_name||'J2')}<input type="number" min="0" max="99" data-p2-set="${i+1}"></label></div>`).join('');
  $('#matchModal').classList.remove('hidden');setStatus($('#matchResultStatus'),'');
}
function closeMatchModal(){currentMatch=null;$('#matchModal').classList.add('hidden')}

let cachedMatches=[];
async function refreshMatchesCache(){cachedMatches=await getMyMatches(session.user.id);return cachedMatches}

$('#goRegister').onclick=()=>showView('registerView');$('#goLogin').onclick=()=>showView('loginView');$$('[data-back]').forEach(b=>b.onclick=()=>showView(b.dataset.back));
$('#clubName').onchange=()=>{const c=$('#clubName').value==='Otro';$('#customClubWrap').classList.toggle('hidden',!c);$('#customClubName').required=c};

$('#registerForm').onsubmit=async e=>{e.preventDefault();const st=$('#registerStatus'),firstName=$('#firstName').value.trim(),lastName=$('#lastName').value.trim(),username=$('#username').value.trim().toLowerCase(),email=$('#registerEmail').value.trim(),password=$('#registerPassword').value;if(password!==$('#confirmPassword').value)return setStatus(st,'Las contraseñas no coinciden.','error');if(!/^[a-z0-9_]{3,24}$/.test(username))return setStatus(st,'Usuario inválido.','error');try{const {data,error}=await signUpUser({email,password,firstName,lastName,username});if(error)throw error;session=data.session;showView('sportsProfileView')}catch(err){setStatus(st,friendly(err.message),'error')}};
$('#loginForm').onsubmit=async e=>{e.preventDefault();const st=$('#loginStatus');try{const {data,error}=await signInUser({email:$('#loginEmail').value.trim(),password:$('#loginPassword').value});if(error)throw error;session=data.session;const p=await getMyProfile(data.user.id);if(!p.profile_completed)return showView('sportsProfileView');await loadApp(data.user.id,p)}catch(err){setStatus(st,friendly(err.message),'error')}};
$('#sportsProfileForm').onsubmit=async e=>{e.preventDefault();const finalClub=$('#clubName').value==='Otro'?$('#customClubName').value.trim():$('#clubName').value;try{await completeSportsProfile({birthDate:$('#birthDate').value,playingStyle:$('#playingStyle').value,dominantHand:$('#dominantHand').value,clubName:finalClub,profilePhotoUrl:$('#profilePhotoUrl').value.trim()});session=await getSession();await loadApp(session.user.id)}catch(err){setStatus($('#sportsStatus'),err.message,'error')}};

$$('.nav-item').forEach(b=>b.onclick=()=>activateTab(b.dataset.tab));$$('[data-go-tab]').forEach(b=>b.onclick=()=>activateTab(b.dataset.goTab));
$$('[data-ranking-mode]').forEach(b=>b.onclick=()=>{rankingMode=b.dataset.rankingMode;$$('[data-ranking-mode]').forEach(x=>x.classList.toggle('active',x===b));loadRanking()});
let rt;$('#rankingSearch').oninput=()=>{clearTimeout(rt);rt=setTimeout(loadRanking,220)};
let pt;$('#challengePlayerSearch').oninput=()=>{clearTimeout(pt);pt=setTimeout(playerSearch,220)};
$('#challengePlayerResults').onclick=e=>{const b=e.target.closest('[data-select-rival]');if(b)selectRival(b)};
$('#clearSelectedRival').onclick=clearRival;

$('#challengeForm').onsubmit=async e=>{e.preventDefault();if(!selectedRival)return;try{await createChallenge({challengerId:session.user.id,challengedId:selectedRival.id,format:$('#challengeFormat').value,scheduledDate:$('#challengeDate').value,scheduledTime:$('#challengeTime').value,location:$('#challengeLocation').value.trim()});e.currentTarget.reset();clearRival();await loadChallenges()}catch(err){setStatus($('#challengeCreateStatus'),err.message,'error')}};

document.addEventListener('click',async e=>{
  const resp=e.target.closest('[data-response]');if(resp){try{await respondToChallenge(Number(resp.dataset.id),resp.dataset.response);await Promise.all([loadChallenges(),loadMatches()])}catch(err){alert(err.message)}return}
  const cancel=e.target.closest('[data-cancel-challenge]');if(cancel){try{await cancelChallenge(Number(cancel.dataset.cancelChallenge));await loadChallenges()}catch(err){alert(err.message)}return}
  const result=e.target.closest('[data-enter-result]');if(result){await refreshMatchesCache();openMatchModal(result.dataset.enterResult,cachedMatches);return}
  const confirm=e.target.closest('[data-confirm-match]');if(confirm){try{await confirmMatchResult(Number(confirm.dataset.confirmMatch));await refreshCore()}catch(err){alert(err.message)}return}
  const dispute=e.target.closest('[data-dispute-match]');if(dispute){try{await disputeMatchResult(Number(dispute.dataset.disputeMatch));await loadMatches()}catch(err){alert(err.message)}}
});

$('#closeMatchModal').onclick=closeMatchModal;
$('#matchResultForm').onsubmit=async e=>{
  e.preventDefault();if(!currentMatch)return;
  const rows=[...$('#setInputs').querySelectorAll('.set-row')];
  const sets=[];
  for(const row of rows){
    const p1=row.querySelector('[data-p1-set]').value,p2=row.querySelector('[data-p2-set]').value;
    if(p1===''&&p2==='')continue;
    if(p1===''||p2==='')return setStatus($('#matchResultStatus'),'Completá ambos puntajes del set.','error');
    sets.push({player1_points:Number(p1),player2_points:Number(p2)});
  }
  if(!sets.length)return setStatus($('#matchResultStatus'),'Ingresá al menos un set.','error');
  try{await submitMatchResult(currentMatch.id,sets);closeMatchModal();await loadMatches()}catch(err){setStatus($('#matchResultStatus'),err.message,'error')}
};

$('#notificationButton').onclick=()=>activateTab('play');
$('#logoutButton').onclick=async()=>{await signOutUser();session=null;profile=null;ratings=[];showView('welcomeView')};

(async()=>{try{await route()}catch(e){console.error(e);showView('welcomeView');setStatus($('#globalStatus'),'Hubo un problema al cargar la app.','error')}})();

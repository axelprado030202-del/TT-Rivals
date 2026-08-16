import {getSession,signUpUser,signInUser,signOutUser} from './auth.js';
import {getMyProfile,getMyRatings,completeSportsProfile,getRanking,searchPlayers,getRatingHistory} from './profile.js';
import {createChallenge,respondToChallenge,cancelChallenge,getMyChallenges} from './challenges.js';
import {getMyMatches,submitMatchResult,confirmMatchResult,disputeMatchResult} from './matches.js';
import {createTournamentV8,getTournamentsV8,getTournamentEntriesV8,getTournamentMembersV8,getTournamentGamesV8,getTournamentStandingsV8,submitTournamentGameResultV8,closeGroupStageV8,finalizeTournamentV8,searchTournamentUsersV8} from './tournaments.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const authShell=$('#authShell'),mainApp=$('#mainApp'),views=$$('.view');
let session=null,profile=null,ratings=[],rankingMode='individual',selectedRival=null,currentMatch=null;
let selectedTournament=null,currentTournamentMatch=null,tournamentPlayerTimer=null;
let tournamentDraft={modality:null,preset:null,selectedUsers:[]};

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
function activateTab(tab){$$('.tab-page').forEach(p=>p.classList.toggle('active',p.id===`tab-${tab}`));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));window.scrollTo({top:0,behavior:'smooth'});if(tab==='ranking')loadRanking();if(tab==='play'||tab==='home'){loadChallenges();loadMatches()}if(tab==='stats')loadHistory();if(tab==='tournaments')loadTournamentList()}

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



function tournamentStageLabel(stage){
  return ({groups:'Fase de grupos',r32:'Dieciseisavos',r16:'Octavos',qf:'Cuartos de final',sf:'Semifinales',final:'Final'})[stage]||stage;
}
function tournamentPresetLabel(preset){
  return ({simple:'Simple · 1 set',intermediate:'Intermedio · Mejor de 3',extended:'Extenso · Mejor de 5',custom:'Personalizado'})[preset]||preset;
}
function tournamentBestOf(t,stage){
  if(t.preset==='simple')return 1;
  if(t.preset==='intermediate')return 3;
  if(t.preset==='extended')return 5;
  return Number(t.stage_sets?.[stage]||3);
}
function resetTournamentWizard(){
  tournamentDraft={modality:null,preset:null,selectedUsers:[]};
  $('#tournamentModeChooser').classList.remove('hidden');
  $('#tournamentPresetChooser').classList.add('hidden');
  $('#tournamentBuilder').classList.add('hidden');
  $('#tournamentDetail').classList.add('hidden');
  renderSelectedTournamentPlayers();
}
async function loadTournamentList(){
  const box=$('#tournamentList');if(!box)return;
  box.innerHTML='<div class="loading-row">Cargando torneos…</div>';
  try{
    const rows=await getTournamentsV8();
    box.innerHTML=rows.length?rows.map(t=>`
      <div class="tournament-card" data-open-tournament="${t.id}">
        <div>
          <strong>${t.modality==='doubles'?'👥':'🏓'} ${esc(t.name)}</strong>
          <small>${t.modality==='doubles'?'2vs2':'1vs1'} · ${tournamentPresetLabel(t.preset)} · Desde ${tournamentStageLabel(t.start_stage)}</small>
          <span class="tournament-status ${t.status==='completed'?'completed':'active'}">${t.status==='completed'?'Finalizado':'En juego'}</span>
        </div><b>→</b>
      </div>`).join(''):'<div class="loading-row">Todavía no hay torneos.</div>';
  }catch(err){console.error(err);box.innerHTML='<div class="loading-row">No se pudieron cargar los torneos.</div>'}
}
function openTournamentPresetChooser(modality){
  tournamentDraft.modality=modality;
  $('#selectedTournamentModeTitle').textContent=modality==='doubles'?'Torneo 2vs2':'Torneo 1vs1';
  $('#tournamentModeChooser').classList.add('hidden');
  $('#tournamentPresetChooser').classList.remove('hidden');
  $('#tournamentBuilder').classList.add('hidden');
}
function openTournamentBuilder(preset){
  tournamentDraft.preset=preset;
  tournamentDraft.selectedUsers=[];
  $('#tournamentPresetChooser').classList.add('hidden');
  $('#tournamentBuilder').classList.remove('hidden');
  $('#tournamentBuilderTitle').textContent=`${tournamentDraft.modality==='doubles'?'2vs2':'1vs1'} · ${tournamentPresetLabel(preset)}`;
  $('#customSetOptions').classList.toggle('hidden',preset!=='custom');
  $('#participantRequirement').textContent=tournamentDraft.modality==='doubles'?'Mínimo 4 · número par':'Mínimo 2';
  renderSelectedTournamentPlayers();
}
function updateGroupOptions(){
  $('#groupOptions').classList.toggle('hidden',$('#tournamentStartStage').value!=='groups');
}
function renderSelectedTournamentPlayers(){
  const box=$('#selectedTournamentPlayers');if(!box)return;
  $('#selectedParticipantCount').textContent=`${tournamentDraft.selectedUsers.length} seleccionados`;
  box.innerHTML=tournamentDraft.selectedUsers.map(p=>`<div class="player-chip"><span>${esc(p.first_name)} ${esc(p.last_name)} · @${esc(p.username)}</span><button type="button" data-remove-selected-player="${p.id}">×</button></div>`).join('');
}
async function searchTournamentPlayers(){
  const q=$('#tournamentPlayerSearch').value.trim(),box=$('#tournamentPlayerSearchResults');
  if(!q){box.innerHTML='';return}
  try{
    const already=new Set(tournamentDraft.selectedUsers.map(x=>x.id));
    const rows=(await searchTournamentUsersV8(q)).filter(p=>!already.has(p.id));
    box.innerHTML=rows.length?rows.map(p=>`<div class="player-row"><div><strong>${esc(p.first_name)} ${esc(p.last_name)}</strong><small>@${esc(p.username)}</small></div><button type="button" data-add-selected-player="${p.id}" data-first="${esc(p.first_name)}" data-last="${esc(p.last_name)}" data-user="${esc(p.username)}">Agregar</button></div>`).join(''):'<div class="loading-row">No se encontraron usuarios.</div>';
  }catch(err){box.innerHTML='<div class="loading-row">No se pudo buscar.</div>'}
}
function collectCustomStageSets(){
  const o={};$$('[data-custom-stage]').forEach(s=>o[s.dataset.customStage]=Number(s.value));return o;
}
async function openTournament(tournamentId){
  const all=await getTournamentsV8();
  selectedTournament=all.find(t=>t.id===Number(tournamentId));if(!selectedTournament)return;
  $('#tournamentModeChooser').classList.add('hidden');
  $('#tournamentPresetChooser').classList.add('hidden');
  $('#tournamentBuilder').classList.add('hidden');
  $('#tournamentDetail').classList.remove('hidden');
  $('#tournamentDetailName').textContent=selectedTournament.name;
  $('#tournamentDetailMeta').textContent=`${selectedTournament.modality==='doubles'?'2vs2':'1vs1'} · ${tournamentPresetLabel(selectedTournament.preset)} · Desde ${tournamentStageLabel(selectedTournament.start_stage)}`;
  await renderTournamentBracket();
  $('#tournamentDetail').scrollIntoView({behavior:'smooth',block:'start'});
}
function memberNamesForEntry(entry,members){
  const names=members.filter(m=>m.entry_id===entry.id).map(m=>m.profile?`${m.profile.first_name} ${m.profile.last_name}`:'').filter(Boolean);
  return names.length?names.join(' / '):entry.display_name;
}
async function renderTournamentBracket(){
  if(!selectedTournament)return;
  const [entries,members,games,standings]=await Promise.all([
    getTournamentEntriesV8(selectedTournament.id),
    getTournamentMembersV8(selectedTournament.id),
    getTournamentGamesV8(selectedTournament.id),
    getTournamentStandingsV8(selectedTournament.id)
  ]);
  const entryMap=new Map(entries.map(e=>[e.id,{...e,display_name:memberNamesForEntry(e,members)}]));
  const box=$('#tournamentBracket');

  if(selectedTournament.status==='completed'){
    const champion=entries.find(e=>e.id===selectedTournament.champion_entry_id);
    box.innerHTML=`<div class="final-champion"><span>🏆</span><strong>${esc(champion?memberNamesForEntry(champion,members):'Campeón')}</strong><small>Torneo finalizado</small></div>`;
    renderFinalStandings(standings);
    $('#finalStandingsArea').classList.remove('hidden');
    $('#groupCloseArea').classList.add('hidden');$('#finalizeTournamentArea').classList.add('hidden');
    return;
  }

  const groupGames=games.filter(g=>g.stage==='groups');
  const knockoutGames=games.filter(g=>g.stage!=='groups');

  let html='';
  if(groupGames.length){
    const groupNos=[...new Set(groupGames.map(g=>g.group_no))].sort((a,b)=>a-b);
    html+=`<div class="group-section"><p class="muted-label tournament-subtitle">FASE DE GRUPOS</p>`;
    for(const gn of groupNos){
      const gs=groupGames.filter(g=>g.group_no===gn);
      html+=`<div class="group-section"><h4 class="group-heading">Grupo ${gn}</h4><div class="group-games-grid">${gs.map(g=>gameHtml(g,entryMap,selectedTournament)).join('')}</div></div>`;
    }
    html+=`</div>`;
  }

  if(knockoutGames.length){
    const stages=['r32','r16','qf','sf','final'].filter(s=>knockoutGames.some(g=>g.stage===s));
    html+=`<p class="muted-label tournament-subtitle">LLAVE ELIMINATORIA</p><div class="bracket-scroll"><div class="bracket">`;
    for(const s of stages){
      const gs=knockoutGames.filter(g=>g.stage===s);
      html+=`<div class="bracket-stage"><div class="bracket-stage-title">${tournamentStageLabel(s)}</div><div class="bracket-games">${gs.map(g=>gameHtml(g,entryMap,selectedTournament)).join('')}</div></div>`;
    }
    html+=`</div></div>`;
  }

  box.innerHTML=html||'<div class="loading-row">Preparando torneo…</div>';

  const owner=selectedTournament.creator_id===session.user.id;
  const groupsFinished=groupGames.length>0&&groupGames.every(g=>g.status==='completed');
  const hasKnockout=knockoutGames.length>0;
  $('#groupCloseArea').classList.toggle('hidden',!(owner&&selectedTournament.start_stage==='groups'&&!hasKnockout&&groupsFinished));
  const finalGame=games.find(g=>g.stage==='final');
  $('#finalizeTournamentArea').classList.toggle('hidden',!(owner&&finalGame?.status==='completed'));
  $('#finalStandingsArea').classList.add('hidden');
}
function gameHtml(g,entryMap,t){
  const e1=entryMap.get(g.entry1_id),e2=entryMap.get(g.entry2_id);
  const n1=e1?.display_name||'—',n2=e2?.display_name||'—';
  const done=g.status==='completed',bye=g.status==='bye',waiting=g.status==='waiting';
  return `<div class="bracket-game">
    <div class="bracket-game-header"><span>Partido ${g.match_index}</span><span>${tournamentBestOf(t,g.stage)===1?'1 set':`Mejor de ${tournamentBestOf(t,g.stage)}`}</span></div>
    <div class="bracket-participant ${done&&g.winner_entry_id===g.entry1_id?'winner':''}"><span>${esc(n1)}</span><span>${done?g.entry1_sets:''}</span></div>
    <div class="bracket-participant ${done&&g.winner_entry_id===g.entry2_id?'winner':''}"><span>${esc(n2)}</span><span>${done?g.entry2_sets:''}</span></div>
    ${g.status==='pending'&&g.entry1_id&&g.entry2_id&&t.creator_id===session.user.id?`<button class="bracket-result-btn" data-t8-result="${g.id}">Colocar resultado</button>`:''}
    <div class="bracket-status">${done?'✓ Resultado cerrado':bye?'Pase automático':waiting?'Esperando clasificados':'Pendiente'}</div>
  </div>`;
}
function renderFinalStandings(rows){
  $('#tournamentStandings').innerHTML=`<table class="standings-table"><thead><tr><th>#</th><th>Participante</th><th>PJ</th><th>G</th><th>P</th><th>Sets</th><th>Etapa</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td class="standing-pos">${r.final_position||i+1}</td><td><strong>${esc(r.display_name)}</strong></td><td>${r.played}</td><td>${r.wins}</td><td>${r.losses}</td><td>${r.sets_for}-${r.sets_against}</td><td>${r.stage_reached==='champion'?'🏆 Campeón':tournamentStageLabel(r.stage_reached)}</td></tr>`).join('')}</tbody></table>`;
}
async function openTournamentMatchModalV8(gameId){
  const [games,entries,members]=await Promise.all([
    getTournamentGamesV8(selectedTournament.id),
    getTournamentEntriesV8(selectedTournament.id),
    getTournamentMembersV8(selectedTournament.id)
  ]);
  const g=games.find(x=>x.id===Number(gameId));if(!g)return;
  const map=new Map(entries.map(e=>[e.id,{...e,display_name:memberNamesForEntry(e,members)}]));
  currentTournamentMatch=g;
  const best=tournamentBestOf(selectedTournament,g.stage);
  const e1=map.get(g.entry1_id),e2=map.get(g.entry2_id);
  $('#tournamentMatchModalTitle').textContent=`${e1?.display_name||'Participante 1'} vs ${e2?.display_name||'Participante 2'}`;
  $('#tournamentMatchModalFormat').textContent=best===1?'1 set (1×11)':`Mejor de ${best} sets`;
  $('#tournamentSetInputs').innerHTML=Array.from({length:best},(_,i)=>`<div class="set-row"><strong>Set ${i+1}</strong><label>${esc(e1?.display_name||'P1')}<input type="number" min="0" max="99" data-t8p1="${i+1}"></label><label>${esc(e2?.display_name||'P2')}<input type="number" min="0" max="99" data-t8p2="${i+1}"></label></div>`).join('');
  setStatus($('#tournamentMatchResultStatus'),'');$('#tournamentMatchModal').classList.remove('hidden');
}
function closeTournamentMatchModal(){currentTournamentMatch=null;$('#tournamentMatchModal').classList.add('hidden')}

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

$('#challengeForm').onsubmit=async e=>{e.preventDefault();if(!selectedRival)return;
  const form=e.currentTarget;
  const statusEl=$('#challengeCreateStatus');
  try{
    await createChallenge({
      challengerId:session.user.id,
      challengedId:selectedRival.id,
      format:$('#challengeFormat').value,
      scheduledDate:$('#challengeDate').value,
      scheduledTime:$('#challengeTime').value,
      location:$('#challengeLocation').value.trim()
    });
    if(form && typeof form.reset==='function') form.reset();
    clearRival();
    await loadChallenges();
  }catch(err){
    if(statusEl) setStatus(statusEl,err.message,'error');
    else alert(err.message);
  }
};

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



$$('[data-tournament-modality]').forEach(b=>b.onclick=()=>openTournamentPresetChooser(b.dataset.tournamentModality));
$('#backToTournamentModes').onclick=()=>{tournamentDraft.modality=null;$('#tournamentPresetChooser').classList.add('hidden');$('#tournamentModeChooser').classList.remove('hidden')};
$$('[data-tournament-preset]').forEach(b=>b.onclick=()=>openTournamentBuilder(b.dataset.tournamentPreset));
$('#backToTournamentPresets').onclick=()=>{$('#tournamentBuilder').classList.add('hidden');$('#tournamentPresetChooser').classList.remove('hidden')};
$('#tournamentStartStage').onchange=updateGroupOptions;
updateGroupOptions();

$('#tournamentPlayerSearch').oninput=()=>{
  clearTimeout(tournamentPlayerTimer);
  tournamentPlayerTimer=setTimeout(searchTournamentPlayers,220);
};
$('#tournamentPlayerSearchResults').onclick=e=>{
  const b=e.target.closest('[data-add-selected-player]');if(!b)return;
  if(tournamentDraft.selectedUsers.some(x=>x.id===b.dataset.addSelectedPlayer))return;
  tournamentDraft.selectedUsers.push({
    id:b.dataset.addSelectedPlayer,
    first_name:b.dataset.first,
    last_name:b.dataset.last,
    username:b.dataset.user
  });
  $('#tournamentPlayerSearch').value='';$('#tournamentPlayerSearchResults').innerHTML='';
  renderSelectedTournamentPlayers();
};
$('#selectedTournamentPlayers').onclick=e=>{
  const b=e.target.closest('[data-remove-selected-player]');if(!b)return;
  tournamentDraft.selectedUsers=tournamentDraft.selectedUsers.filter(x=>x.id!==b.dataset.removeSelectedPlayer);
  renderSelectedTournamentPlayers();
};

$('#tournamentCreateForm').onsubmit=async e=>{
  e.preventDefault();const st=$('#tournamentCreateStatus');
  if(tournamentDraft.modality==='individual'&&tournamentDraft.selectedUsers.length<2)
    return setStatus(st,'Seleccioná al menos 2 jugadores.','error');
  if(tournamentDraft.modality==='doubles'&&(tournamentDraft.selectedUsers.length<4||tournamentDraft.selectedUsers.length%2!==0))
    return setStatus(st,'Para 2vs2 necesitás mínimo 4 jugadores y una cantidad par.','error');

  const start=$('#tournamentStartStage').value;
  try{
    const id=await createTournamentV8({
      name:$('#tournamentName').value.trim(),
      modality:tournamentDraft.modality,
      preset:tournamentDraft.preset,
      startStage:start,
      afterGroupsStage:start==='groups'?$('#tournamentAfterGroupsStage').value:null,
      groupCount:start==='groups'?Number($('#tournamentGroupCount').value):null,
      qualifiersPerGroup:start==='groups'?Number($('#tournamentQualifiers').value):null,
      stageSets:tournamentDraft.preset==='custom'?collectCustomStageSets():{},
      selectedUsers:tournamentDraft.selectedUsers.map(x=>x.id)
    });
    setStatus(st,'Torneo creado y sorteo realizado.','ok');
    await loadTournamentList();
    await openTournament(id);
  }catch(err){setStatus(st,err.message,'error')}
};

$('#tournamentList').onclick=e=>{const c=e.target.closest('[data-open-tournament]');if(c)openTournament(c.dataset.openTournament)};
$('#closeTournamentDetail').onclick=()=>{selectedTournament=null;resetTournamentWizard();loadTournamentList()};
$('#tournamentBracket').onclick=e=>{const b=e.target.closest('[data-t8-result]');if(b)openTournamentMatchModalV8(b.dataset.t8Result)};
$('#closeTournamentMatchModal').onclick=closeTournamentMatchModal;

$('#tournamentMatchResultForm').onsubmit=async e=>{
  e.preventDefault();if(!currentTournamentMatch)return;
  const rows=[...$('#tournamentSetInputs').querySelectorAll('.set-row')],sets=[];
  for(const row of rows){
    const p1=row.querySelector('[data-t8p1]').value,p2=row.querySelector('[data-t8p2]').value;
    if(p1===''&&p2==='')continue;
    if(p1===''||p2==='')return setStatus($('#tournamentMatchResultStatus'),'Completá ambos puntajes del set.','error');
    sets.push({entry1_points:Number(p1),entry2_points:Number(p2)});
  }
  if(!sets.length)return setStatus($('#tournamentMatchResultStatus'),'Ingresá al menos un set.','error');
  try{
    await submitTournamentGameResultV8(currentTournamentMatch.id,sets);
    closeTournamentMatchModal();
    await Promise.all([renderTournamentBracket(),refreshCore()]);
  }catch(err){setStatus($('#tournamentMatchResultStatus'),err.message,'error')}
};

$('#closeGroupStageButton').onclick=async()=>{
  if(!selectedTournament)return;
  if(!confirm('Se cerrará la fase de grupos y se sortearán al azar los cruces eliminatorios. ¿Continuar?'))return;
  try{await closeGroupStageV8(selectedTournament.id);selectedTournament=(await getTournamentsV8()).find(t=>t.id===selectedTournament.id);await renderTournamentBracket()}catch(err){alert(err.message)}
};

$('#finalizeTournamentButton').onclick=async()=>{
  if(!selectedTournament)return;
  if(!confirm('La final ya tiene ganador. ¿Cerrar resultados y generar la tabla final?'))return;
  try{
    await finalizeTournamentV8(selectedTournament.id);
    selectedTournament=(await getTournamentsV8()).find(t=>t.id===selectedTournament.id);
    await renderTournamentBracket();await loadTournamentList();
  }catch(err){alert(err.message)}
};

$('#notificationButton').onclick=()=>activateTab('play');
$('#logoutButton').onclick=async()=>{await signOutUser();session=null;profile=null;ratings=[];showView('welcomeView')};

(async()=>{try{await route()}catch(e){console.error(e);showView('welcomeView');setStatus($('#globalStatus'),'Hubo un problema al cargar la app.','error')}})();

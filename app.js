import { supabase } from './supabase.js';
import {getSession,signUpUser,signInUser,signOutUser} from './auth.js';
import {getMyProfile,getMyRatings,completeSportsProfile,getRanking,searchPlayers,getRatingHistory,getRankTiers,setProfilePhotoUrl,uploadProfilePhoto,deleteProfilePhotoByUrl} from './profile.js';
import {createChallenge,respondToChallenge,cancelChallenge,getMyChallenges} from './challenges.js';
import {getMyMatches,submitMatchResult,confirmMatchResult,disputeMatchResult} from './matches.js';
import {createTournamentV8,getTournamentsV8,getTournamentEntriesV8,getTournamentMembersV8,getTournamentGamesV8,getTournamentStandingsV8,submitTournamentGameResultV8,closeGroupStageV8,finalizeTournamentV8,searchTournamentUsersV8} from './tournaments.js';
import {getReviewsForUser,getReviewsAuthoredByUser,submitPlayerReview,getPlayerProfile,getPlayerRatings,followPlayer,unfollowPlayer,getFollowingIds,getFollowingRanking,getPublicPlayerCard,getFollowingFeed,setPrimaryRival,clearPrimaryRival,getMyPrimaryRival,getShowcaseAchievements,setShowcaseAchievements} from './social.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const authShell=$('#authShell'),mainApp=$('#mainApp'),views=$$('.view');
let session=null,profile=null,ratings=[],rankingMode='individual',selectedRival=null,currentMatch=null,rankTiers=[];
let selectedTournament=null,currentTournamentMatch=null,tournamentPlayerTimer=null;
let tournamentDraft={modality:null,preset:null,selectedUsers:[]};
let onboardingPhotoFile=null,onboardingPhotoPreviewUrl=null;
let socialState={matches:[],ratingHistory:[],reviewsReceived:[],reviewsAuthored:[],streak:{current:0,max:0},achievements:[]};
let reviewTargetMatch=null,selectedReviewStars=0;
let liveRealtimeChannels=[],livePollTimer=null;
let rankingScope='global',followingIds=[],primaryRivalId=null;
let myShowcaseAchievementIds=[],showcaseDraftIds=[];


function showView(id){authShell.classList.remove('hidden');mainApp.classList.add('hidden');views.forEach(v=>v.classList.toggle('active',v.id===id));window.scrollTo(0,0)}
function showMain(){authShell.classList.add('hidden');mainApp.classList.remove('hidden');activateTab('home')}
function setStatus(el,msg,type=''){el.textContent=msg;el.classList.remove('ok','error');if(type)el.classList.add(type)}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function cap(v){return v?v[0].toUpperCase()+v.slice(1):'—'}
function age(d){if(!d)return'—';const b=new Date(`${d}T00:00:00`),t=new Date();let a=t.getFullYear()-b.getFullYear();const m=t.getMonth()-b.getMonth();if(m<0||(m===0&&t.getDate()<b.getDate()))a--;return`${a} años`}
function getRating(mod){return ratings.find(r=>r.modality===mod)||{rating:1000,matches_played:0,wins:0,losses:0}}
function rankForRating(rating){
  const value=Math.max(0,Number(rating)||0);
  if(!rankTiers.length){
    if(value>=1600)return'Diamante';
    if(value>=1400)return'Platino';
    if(value>=1250)return'Oro';
    if(value>=1100)return'Plata';
    return'Bronce';
  }
  const eligible=rankTiers.filter(t=>value>=Number(t.min_rating));
  return eligible.length?eligible[eligible.length-1].name:rankTiers[0]?.name||'Bronce';
}

function rankCss(name){
  return `rank-${String(name||'Bronce').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}`;
}

function averageReviews(rows=[]){
  if(!rows.length)return {average:null,count:0};
  const average=rows.reduce((s,r)=>s+Number(r.stars||0),0)/rows.length;
  return {average,count:rows.length};
}
function computeStreaks(matches,userId){
  const confirmed=(matches||[])
    .filter(m=>m.result_status==='confirmed')
    .sort((a,b)=>new Date(a.played_at||a.created_at)-new Date(b.played_at||b.created_at));
  let current=0,max=0;
  for(const m of confirmed){
    if(m.winner_id===userId){current++;max=Math.max(max,current)}
    else current=0;
  }
  return {current,max};
}
function maxHistoricalRating(history,currentRating){
  return Math.max(Number(currentRating)||1000,...(history||[]).flatMap(r=>[
    Number(r.previous_rating)||0,Number(r.new_rating)||0
  ]));
}
function achievementDefinitions(ctx={}){
  const n=v=>Number(v||0);
  const total=n(ctx.totalMatches),wins=n(ctx.wins),streak=n(ctx.maxStreak),maxElo=n(ctx.maxElo);
  const casual=n(ctx.casualMatches),ranked=n(ctx.rankedMatches);
  const repCount=n(ctx.reputationCount),repAvg=n(ctx.reputationAverage),following=n(ctx.followingCount);

  const make=(id,icon,name,desc,unlocked,group)=>({id,icon,name,desc,unlocked:!!unlocked,group});
  return [
    make('match_1','◉','Primer saque','Completá tu primer partido.',total>=1,'Partidos'),
    make('match_5','5','Entrando en ritmo','Completá 5 partidos.',total>=5,'Partidos'),
    make('match_10','10','Competidor','Completá 10 partidos.',total>=10,'Partidos'),
    make('match_25','25','Habitual','Completá 25 partidos.',total>=25,'Partidos'),
    make('match_50','50','Veterano','Completá 50 partidos.',total>=50,'Partidos'),
    make('match_75','75','Constancia','Completá 75 partidos.',total>=75,'Partidos'),
    make('match_100','100','Centenario','Completá 100 partidos.',total>=100,'Partidos'),
    make('match_150','150','Mesa infinita','Completá 150 partidos.',total>=150,'Partidos'),
    make('match_250','250','Leyenda del club','Completá 250 partidos.',total>=250,'Partidos'),

    make('win_1','✓','Primera victoria','Ganá tu primer partido.',wins>=1,'Victorias'),
    make('win_3','III','Triplete','Alcanzá 3 victorias.',wins>=3,'Victorias'),
    make('win_5','V','Cinco arriba','Alcanzá 5 victorias.',wins>=5,'Victorias'),
    make('win_10','★','Doble dígito','Alcanzá 10 victorias.',wins>=10,'Victorias'),
    make('win_20','20','Ganador habitual','Alcanzá 20 victorias.',wins>=20,'Victorias'),
    make('win_30','30','Treinta triunfos','Alcanzá 30 victorias.',wins>=30,'Victorias'),
    make('win_50','♛','Medio centenar','Alcanzá 50 victorias.',wins>=50,'Victorias'),
    make('win_75','✦','Especialista','Alcanzá 75 victorias.',wins>=75,'Victorias'),
    make('win_100','🏆','Club de las 100','Alcanzá 100 victorias.',wins>=100,'Victorias'),

    make('streak_2','🔥','Chispa','Ganá 2 partidos consecutivos.',streak>=2,'Rachas'),
    make('streak_3','🔥','En racha','Ganá 3 partidos consecutivos.',streak>=3,'Rachas'),
    make('streak_5','⚡','Imparable','Ganá 5 partidos consecutivos.',streak>=5,'Rachas'),
    make('streak_7','7','Semana perfecta','Ganá 7 partidos consecutivos.',streak>=7,'Rachas'),
    make('streak_10','♛','Dominio total','Ganá 10 partidos consecutivos.',streak>=10,'Rachas'),
    make('streak_15','✹','Incandescente','Ganá 15 partidos consecutivos.',streak>=15,'Rachas'),
    make('streak_20','☄','Inalcanzable','Ganá 20 partidos consecutivos.',streak>=20,'Rachas'),

    make('elo_1050','◇','Primer ascenso','Alcanzá 1050 Elo.',maxElo>=1050,'Elo'),
    make('elo_1100','◇','Plata','Alcanzá 1100 Elo.',maxElo>=1100,'Elo'),
    make('elo_1200','◈','Escalador','Alcanzá 1200 Elo.',maxElo>=1200,'Elo'),
    make('elo_1250','◆','Oro','Alcanzá 1250 Elo.',maxElo>=1250,'Elo'),
    make('elo_1300','◆','Elite 1300','Alcanzá 1300 Elo.',maxElo>=1300,'Elo'),
    make('elo_1400','✦','Platino','Alcanzá 1400 Elo.',maxElo>=1400,'Elo'),
    make('elo_1500','✦','Elite 1500','Alcanzá 1500 Elo.',maxElo>=1500,'Elo'),
    make('elo_1600','✧','Diamante','Alcanzá 1600 Elo.',maxElo>=1600,'Elo'),
    make('elo_1700','✺','Más allá','Alcanzá 1700 Elo.',maxElo>=1700,'Elo'),
    make('elo_1800','♜','Maestro TT','Alcanzá 1800 Elo.',maxElo>=1800,'Elo'),

    make('casual_1','C','Sin presión','Completá tu primer partido casual.',casual>=1,'Casuales'),
    make('casual_5','C5','Amistoso habitual','Completá 5 partidos casuales.',casual>=5,'Casuales'),
    make('casual_10','C10','Modo casual','Completá 10 partidos casuales.',casual>=10,'Casuales'),
    make('casual_25','C25','Por el juego','Completá 25 partidos casuales.',casual>=25,'Casuales'),
    make('casual_50','C50','Amante del juego','Completá 50 partidos casuales.',casual>=50,'Casuales'),

    make('ranked_5','R5','Primeros puntos','Completá 5 partidos con ranking.',ranked>=5,'Ranking'),
    make('ranked_25','R25','Competidor serio','Completá 25 partidos con ranking.',ranked>=25,'Ranking'),
    make('ranked_50','R50','Ranked veteran','Completá 50 partidos con ranking.',ranked>=50,'Ranking'),
    make('ranked_100','R100','Centurión competitivo','Completá 100 partidos con ranking.',ranked>=100,'Ranking'),

    make('rep_1','★','Primera impresión','Recibí tu primera valoración.',repCount>=1,'Reputación'),
    make('rep_4_5','★4','Buen rival','Mantené 4.0★ o más con al menos 5 valoraciones.',repCount>=5&&repAvg>=4,'Reputación'),
    make('rep_45_10','★4.5','Juego limpio','Mantené 4.5★ o más con al menos 10 valoraciones.',repCount>=10&&repAvg>=4.5,'Reputación'),
    make('rep_48_20','★4.8','Rival ejemplar','Mantené 4.8★ o más con al menos 20 valoraciones.',repCount>=20&&repAvg>=4.8,'Reputación'),

    make('follow_1','＋','Primer seguimiento','Seguí a tu primer jugador.',following>=1,'Social'),
    make('follow_5','5+','Red de rivales','Seguí al menos a 5 jugadores.',following>=5,'Social')
  ];
}

function buildAchievements({matches=[],streak={current:0,max:0},history=[],rating=1000,reviews=[],followingCount=0}){
  const confirmed=matches.filter(m=>m.result_status==='confirmed');
  const wins=confirmed.filter(m=>m.winner_id===session.user.id).length;
  const rankedMatches=confirmed.filter(m=>(m.match_type||'ranked')==='ranked').length;
  const casualMatches=confirmed.filter(m=>m.match_type==='casual').length;
  const maxElo=maxHistoricalRating(history,rating);
  const rep=averageReviews(reviews);

  return achievementDefinitions({
    totalMatches:confirmed.length,
    wins,
    maxStreak:streak.max,
    maxElo,
    casualMatches,
    rankedMatches,
    reputationCount:rep.count,
    reputationAverage:rep.average||0,
    followingCount
  });
}

function achievementById(id,ctxAchievements=socialState.achievements){
  return (ctxAchievements||[]).find(a=>a.id===id)||achievementDefinitions({}).find(a=>a.id===id)||null;
}

function formatMatchDate(m){
  const d=new Date(m.played_at||m.created_at);
  return d.toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'});
}
function avatarHtml(p,cls='mini-player-avatar'){
  if(p?.profile_photo_url){
    return `<span class="${cls} has-photo"><img src="${esc(p.profile_photo_url)}" alt=""></span>`;
  }
  const initials=((p?.first_name?.[0]||'')+(p?.last_name?.[0]||'')).toUpperCase()||'TT';
  return `<span class="${cls}">${esc(initials)}</span>`;
}
function nextRankInfo(rating){
  const current=rankForRating(rating);
  const tiers=rankTiers.length?rankTiers:[
    {name:'Bronce',min_rating:0},{name:'Plata',min_rating:1100},{name:'Oro',min_rating:1250},
    {name:'Platino',min_rating:1400},{name:'Diamante',min_rating:1600}
  ];
  const i=Math.max(0,tiers.findIndex(t=>t.name===current));
  const next=tiers[i+1]||null;
  const floor=Number(tiers[i]?.min_rating||0);
  const ceiling=Number(next?.min_rating||rating);
  const progress=next?Math.max(0,Math.min(100,((Number(rating)-floor)/(ceiling-floor))*100)):100;
  return {current,next,progress,floor,ceiling};
}

function friendly(m=''){const t=m.toLowerCase();if(t.includes('already registered'))return'Ese correo ya está registrado.';if(t.includes('duplicate')||t.includes('unique'))return'Ese nombre de usuario ya está en uso.';if(t.includes('invalid login credentials'))return'Correo o contraseña incorrectos.';return m||'Ocurrió un error.'}

function populate(){
  const ind=getRating('individual'),dob=getRating('dobles');
  const currentRank=rankForRating(ind.rating);
  const doublesRank=rankForRating(dob.rating);

  $('#topGreeting').textContent=`Hola, ${profile.first_name}`;

  // Home summary
  $('#homeUsername').textContent=`@${profile.username}`;
  $('#homeCategory').textContent=currentRank;
  $('#homeIndividualRank').textContent=currentRank;
  $('#homeDoublesRank').textContent=doublesRank;
  $('#homeIndividualRank').className=`rank-mini ${rankCss(currentRank)}`;
  $('#homeDoublesRank').className=`rank-mini ${rankCss(doublesRank)}`;
  $('#homeIndividualRating').textContent=ind.rating;
  $('#homeDoublesRating').textContent=dob.rating;

  const rankBadge=$('#homeRankBadge');
  if(rankBadge){
    rankBadge.className=`home-rank-badge ${rankCss(currentRank)}`;
  }

  const homeRankIcon=$('#homeRankIconSmall');
  if(homeRankIcon){
    homeRankIcon.src=rankImagePath(currentRank);
    homeRankIcon.alt=`Rango ${currentRank}`;
    homeRankIcon.dataset.rank=currentRank.toLowerCase();
  }

  const avatar=$('#homeAvatar');
  const avatarImg=$('#homeAvatarImg');
  const avatarFallback=$('#homeAvatarFallback');
  const initials=((profile.first_name?.[0]||'') + (profile.last_name?.[0]||'')).toUpperCase() || 'TT';
  if(avatarFallback) avatarFallback.textContent=initials;

  if(profile.profile_photo_url){
    avatar.dataset.hasPhoto='true';
    avatarImg.src=profile.profile_photo_url;
    avatarImg.alt=`Foto de ${profile.first_name}`;
  }else{
    avatar.dataset.hasPhoto='false';
    avatarImg.removeAttribute('src');
    avatarImg.alt='Sin foto de perfil';
  }

  // Profile tab
  $('#profileName').textContent=`${profile.first_name} ${profile.last_name}`;
  $('#profileUsername').textContent=`@${profile.username}`;
  $('#profileIndividualRating').textContent=ind.rating;
  $('#profileDoublesRating').textContent=dob.rating;
  $('#profileIndividualRank').textContent=currentRank;
  $('#profileDoublesRank').textContent=doublesRank;
  $('#profileIndividualRank').className=`rank-mini ${rankCss(currentRank)}`;
  $('#profileDoublesRank').className=`rank-mini ${rankCss(doublesRank)}`;
  $('#profileStyle').textContent=cap(profile.playing_style);
  $('#profileHand').textContent=cap(profile.dominant_hand);
  $('#profileAge').textContent=age(profile.birth_date);
  $('#profileClub').textContent=profile.club_name||'N/A';

  const profileAvatar=$('#profileAvatar');
  const profileAvatarImg=$('#profileAvatarImg');
  const profileAvatarFallback=$('#profileAvatarFallback');
  if(profileAvatar&&profileAvatarImg&&profileAvatarFallback){
    profileAvatarFallback.textContent=initials;
    if(profile.profile_photo_url){
      profileAvatar.classList.add('has-photo');
      profileAvatarImg.src=profile.profile_photo_url;
    }else{
      profileAvatar.classList.remove('has-photo');
      profileAvatarImg.removeAttribute('src');
    }
  }

  const rep=averageReviews(socialState.reviewsReceived);
  if($('#profileRankTag'))$('#profileRankTag').textContent=currentRank;
  if($('#profileReputationTag'))$('#profileReputationTag').textContent=rep.count?`★ ${rep.average.toFixed(1)}`:'★ Sin valorar';
  if($('#profileStreakTag'))$('#profileStreakTag').textContent=`🔥 Racha ${socialState.streak.current}`;
  if($('#profileMaxStreak'))$('#profileMaxStreak').textContent=socialState.streak.max;
  if($('#profileReputation'))$('#profileReputation').textContent=rep.count?rep.average.toFixed(1):'—';
  if($('#profileReviewCount'))$('#profileReviewCount').textContent=`${rep.count} ${rep.count===1?'valoración':'valoraciones'}`;

  // Stats
  $('#statMatches').textContent=ind.matches_played;
  $('#statWins').textContent=ind.wins;
  $('#statLosses').textContent=ind.losses;
  $('#statWinRate').textContent=ind.matches_played?`${((ind.wins/ind.matches_played)*100).toFixed(1)}%`:'—';
  const confirmedMatches=(socialState.matches||[]).filter(m=>m.result_status==='confirmed');
  const rankedMatches=confirmedMatches.filter(m=>(m.match_type||'ranked')==='ranked').length;
  const casualMatches=confirmedMatches.filter(m=>m.match_type==='casual').length;
  if($('#statRankedMatches'))$('#statRankedMatches').textContent=rankedMatches;
  if($('#statCasualMatches'))$('#statCasualMatches').textContent=casualMatches;
  if($('#statTotalMatches'))$('#statTotalMatches').textContent=confirmedMatches.length;
}
async function loadSocialState(){
  if(!session?.user)return;
  const [matches,history,reviewsReceived,reviewsAuthored,follows,rivalId,showcaseIds]=await Promise.all([
    getMyMatches(session.user.id),
    getRatingHistory(session.user.id),
    getReviewsForUser(session.user.id).catch(()=>[]),
    getReviewsAuthoredByUser(session.user.id).catch(()=>[]),
    getFollowingIds(session.user.id).catch(()=>[]),
    getMyPrimaryRival(session.user.id).catch(()=>null),
    getShowcaseAchievements(session.user.id).catch(()=>[])
  ]);
  socialState.matches=matches;
  socialState.ratingHistory=history;
  socialState.reviewsReceived=reviewsReceived;
  socialState.reviewsAuthored=reviewsAuthored;
  socialState.streak=computeStreaks(matches,session.user.id);
  followingIds=follows.map(x=>x.followed_id);
  socialState.achievements=buildAchievements({
    matches,
    streak:socialState.streak,
    history,
    rating:getRating('individual').rating,
    reviews:reviewsReceived,
    followingCount:followingIds.length
  });
  primaryRivalId=rivalId;
  myShowcaseAchievementIds=showcaseIds||[];
}
async function refreshCore(){
  ratings=await getMyRatings(session.user.id);
  try{rankTiers=await getRankTiers()}catch(e){}
  await loadSocialState();
  populate();
  await Promise.all([loadRanking(),loadChallenges(),loadMatches(),loadHistory(),loadHomeDashboard(),loadHistoryPage(),loadLiveNotifications()]);
}
async function loadApp(uid,p=null){
  profile=p||await getMyProfile(uid);
  ratings=await getMyRatings(uid);
  try{rankTiers=await getRankTiers()}catch(e){console.error(e);rankTiers=[]}
  await loadSocialState();
  populate();
  showMain();
  startLiveNotificationStream();
  await Promise.all([loadRanking(),loadChallenges(),loadMatches(),loadHistory(),loadHomeDashboard(),loadHistoryPage(),loadLiveNotifications()]);
}
async function route(){
  session=await getSession();
  if(!session?.user){showView('welcomeView');setStatus($('#globalStatus'),'Conectado a TT Rivals.','ok');return}
  const p=await getMyProfile(session.user.id);
  if(!p.profile_completed){showView('sportsProfileView');return}
  await loadApp(session.user.id,p);
}
function activateTab(tab){
  $$('.tab-page').forEach(p=>p.classList.toggle('active',p.id===`tab-${tab}`));
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  window.scrollTo({top:0,behavior:'smooth'});
  if(tab==='ranking')loadRanking();
  if(tab==='play'){loadChallenges();loadMatches()}
  if(tab==='home')loadHomeDashboard();
  if(tab==='history')loadHistoryPage();
  if(tab==='stats')loadHistory();
  if(tab==='profile'){renderAchievements();renderPrimaryRival();}
  if(tab==='tournaments')loadTournamentList();
}

async function loadRanking(){
  const list=$('#rankingList'),q=$('#rankingSearch').value||'';
  const listSection=$('#rankingListSection'),feedSection=$('#followingFeedSection'),searchBox=$('#rankingSearchBox');

  if(rankingScope==='feed'){
    listSection.classList.add('hidden');
    searchBox.classList.add('hidden');
    feedSection.classList.remove('hidden');
    await loadFollowingFeed();
    return;
  }

  feedSection.classList.add('hidden');
  listSection.classList.remove('hidden');
  searchBox.classList.remove('hidden');
  list.innerHTML='<div class="loading-row">Cargando…</div>';

  try{
    const rows=rankingScope==='following'
      ?await getFollowingRanking(session.user.id,rankingMode,q)
      :await getRanking(rankingMode,q);

    list.innerHTML=rows.length?rows.map(x=>{
      const p=x.profile,m=x.position<=3?String(x.position):`#${x.position}`;
      const rank=rankForRating(x.rating);
      return `<button class="rank-row rank-row-button ${x.profile.id===session.user.id?'is-me':''}" data-open-player="${p.id}" type="button">
        <div class="rank-pos"><strong>${m}</strong><small>POS</small></div>
        ${avatarHtml(p,'ranking-avatar')}
        <div class="rank-name">
          <strong>${esc(p.first_name)} ${esc(p.last_name)}</strong>
          <small>@${esc(p.username)}${x.profile.id===session.user.id?' · Vos':''}</small>
        </div>
        <div class="ranking-rank-chip ${rankCss(rank)}">${rank}</div>
        <div class="rank-rating"><strong>${x.rating}</strong><small>Elo</small></div>
        <span class="ranking-chevron">›</span>
      </button>`;
    }).join(''):(rankingScope==='following'
      ?'<div class="following-empty"><strong>Todavía no seguís a ningún jugador.</strong><span>Abrí un perfil desde el ranking global y tocá “Seguir”.</span></div>'
      :'<div class="loading-row">Sin jugadores.</div>');
  }catch(e){
    console.error(e);
    list.innerHTML='<div class="loading-row">No se pudo cargar.</div>';
  }
}

async function loadFollowingFeed(){
  const box=$('#followingFeedList');
  box.innerHTML='<div class="loading-row">Cargando actividad…</div>';
  try{
    const rows=await getFollowingFeed(40);
    box.innerHTML=rows.length?rows.map(r=>{
      const label=r.completion_type==='abandonment'
        ?(r.won?'Ganó por abandono':'Abandonó el partido')
        :(r.won?'Ganó':'Perdió');
      const cls=r.completion_type==='abandonment'?'feed-abandon':r.won?'feed-win':'feed-loss';
      const mode=r.match_type==='casual'?'CASUAL':'RANKING';
      const delta=r.rating_change===null||r.rating_change===undefined?'':` · ${Number(r.rating_change)>=0?'+':''}${r.rating_change} Elo`;
      return `<article class="following-feed-item ${cls}">
        ${avatarHtml({first_name:r.followed_first_name,last_name:r.followed_last_name,profile_photo_url:r.followed_photo},'feed-avatar')}
        <div class="following-feed-copy">
          <button type="button" data-open-player="${r.followed_user_id}">${esc(r.followed_first_name)} ${esc(r.followed_last_name)}</button>
          <strong>${label} ${r.player_sets}–${r.opponent_sets} vs ${esc(r.opponent_first_name)} ${esc(r.opponent_last_name)}</strong>
          <span>${mode}${delta} · ${new Date(r.event_at).toLocaleDateString()}</span>
        </div>
      </article>`;
    }).join(''):'<div class="following-empty"><strong>No hay actividad para mostrar.</strong><span>Seguí jugadores para ver sus últimos partidos acá.</span></div>';
  }catch(err){
    console.error(err);
    box.innerHTML='<div class="loading-row">No se pudo cargar la actividad.</div>';
  }
}
async function playerSearch(){const box=$('#challengePlayerResults'),q=$('#challengePlayerSearch').value.trim();if(!q){box.innerHTML='<div class="loading-row">Escribí para buscar jugadores.</div>';return}const rows=await searchPlayers(q,session.user.id);box.innerHTML=rows.length?rows.map(p=>`<div class="player-row"><div><strong>${esc(p.first_name)} ${esc(p.last_name)}</strong><small>@${esc(p.username)}</small></div><button data-select-rival="${p.id}" data-name="${esc(p.first_name)} ${esc(p.last_name)}" data-user="${esc(p.username)}">Desafiar</button></div>`).join(''):'<div class="loading-row">No encontrados.</div>'}
function selectRival(b){selectedRival={id:b.dataset.selectRival,name:b.dataset.name,user:b.dataset.user};$('#selectedRivalName').textContent=selectedRival.name;$('#selectedRivalUsername').textContent=`@${selectedRival.user}`;$('#challengeComposer').classList.remove('hidden');$('#challengePlayerResults').innerHTML='';$('#challengePlayerSearch').value=''}
function clearRival(){selectedRival=null;$('#challengeComposer').classList.add('hidden')}


function matchTypeLabel(type){return type==='casual'?'CASUAL':'RANKING'}
function matchTypeClass(type){return type==='casual'?'mode-casual':'mode-ranked'}
function setChallengeType(type='ranked'){
  const clean=type==='casual'?'casual':'ranked';
  const input=$('#challengeMatchType');
  if(input)input.value=clean;
  $$('[data-challenge-type]').forEach(b=>b.classList.toggle('active',b.dataset.challengeType===clean));
}
function chCard(c,kind){
  const other=kind==='received'?c.challenger:c.challenged;
  const fmt=c.match_format==='bo5'?'Bo5':c.match_format==='bo3'?'Bo3':'1 set';
  let actions='';
  if(kind==='received'&&c.status==='pending'){
    actions=`<div class="challenge-actions"><button class="accept-btn" data-response="accepted" data-id="${c.id}">Aceptar</button><button class="reject-btn" data-response="rejected" data-id="${c.id}">Declinar</button></div>`;
  }
  if(kind==='sent'&&c.status==='pending')actions=`<div class="challenge-actions"><button class="cancel-btn" data-cancel-challenge="${c.id}">Cancelar</button></div>`;
  return `<div class="challenge-row"><div class="challenge-meta">
    <strong>${esc(other?.first_name)} ${esc(other?.last_name)}</strong>
    <small>@${esc(other?.username)} · ${fmt} · <b class="inline-match-mode ${matchTypeClass(c.match_type)}">${matchTypeLabel(c.match_type)}</b></small>
    <span class="challenge-status ${c.status==='accepted'?'status-accepted':'status-pending'}">${c.status}</span>
  </div>${actions}</div>`;
}
async function loadChallenges(){
  if(!session)return;
  const rows=await getMyChallenges(session.user.id),
    rec=rows.filter(r=>r.challenged_id===session.user.id&&r.status==='pending'),
    sen=rows.filter(r=>r.challenger_id===session.user.id&&r.status==='pending');
  $('#receivedChallenges').innerHTML=rec.length?rec.map(r=>chCard(r,'received')).join(''):'<div class="loading-row">No tenés desafíos recibidos.</div>';
  $('#sentChallenges').innerHTML=sen.length?sen.map(r=>chCard(r,'sent')).join(''):'<div class="loading-row">No tenés desafíos enviados.</div>';
}

function matchCard(m){
  const me=session.user.id,other=m.player1_id===me?m.player2:m.player1;
  const fmt=m.match_format==='bo5'?'Mejor de 5':m.match_format==='bo3'?'Mejor de 3':'1 set';
  const mode=m.match_type==='casual'?'Casual · sin Elo':'Con ranking';
  let state='Pendiente de resultado', cls='status-accepted', actions='';
  if(m.result_status==='pending'){
    actions=`<div class="match-actions"><button class="result-btn" data-enter-result="${m.id}">Registrar resultado</button></div>`;
  }else if(m.result_status==='awaiting_confirmation'){
    state='Esperando confirmación';cls='status-confirmation';
    if(m.result_submitted_by!==me) actions=`<div class="match-actions"><button class="confirm-btn" data-confirm-match="${m.id}">Confirmar</button><button class="dispute-btn" data-dispute-match="${m.id}">Disputar</button></div>`;
  }else if(m.result_status==='confirmed'){state='Confirmado';cls='status-accepted'}
  else if(m.result_status==='disputed'){state='En disputa';cls='status-disputed'}
  const result=m.player1_sets||m.player2_sets?` · ${m.player1_sets}-${m.player2_sets}`:'';
  const finish=m.completion_type==='abandonment'?' · Abandono':'';
  return`<div class="match-row"><div class="match-meta"><strong>vs ${esc(other?.first_name)} ${esc(other?.last_name)}</strong><small>${fmt} · ${mode}${result}${finish}</small><span class="challenge-status ${cls}">${state}</span></div>${actions}</div>`
}
async function loadMatches(){if(!session)return;try{const rows=await getMyMatches(session.user.id);$('#activeMatches').innerHTML=rows.length?rows.filter(m=>m.result_status!=='confirmed').map(matchCard).join('')||'<div class="loading-row">No hay partidos pendientes.</div>':'<div class="loading-row">No hay partidos todavía.</div>'}catch(e){console.error(e);$('#activeMatches').innerHTML='<div class="loading-row">No se pudieron cargar los partidos.</div>'}}

async function loadHistory(){
  if(!session)return;
  try{
    const rows=await getRatingHistory(session.user.id);
    renderRatingChart(rows);

    $('#ratingHistoryList').innerHTML=rows.length?rows.slice(0,8).map(r=>`
      <div class="history-row">
        <div><strong>${r.new_rating} Elo</strong><small>${new Date(r.created_at).toLocaleDateString()}</small></div>
        <strong class="history-change ${r.rating_change>=0?'positive':'negative'}">${r.rating_change>=0?'+':''}${r.rating_change}</strong>
      </div>`).join(''):'';
  }catch(e){
    console.error(e);
    $('#ratingHistoryList').innerHTML='<div class="loading-row">No se pudo cargar el historial.</div>';
    $('#ratingChartEmpty').classList.remove('hidden');
  }
}


async function loadLiveNotifications(){
  if(!session?.user||!$('#liveNotificationStack'))return;
  try{
    const [challenges,matches]=await Promise.all([
      getMyChallenges(session.user.id),getMyMatches(session.user.id)
    ]);
    const pending=challenges.filter(c=>c.challenged_id===session.user.id&&c.status==='pending');
    const confirmations=matches.filter(m=>m.result_status==='awaiting_confirmation'&&m.result_submitted_by!==session.user.id);
    const items=[];
    for(const c of pending.slice(0,3)){
      const other=c.challenger;
      const fmt=c.match_format==='bo5'?'Bo5':c.match_format==='bo3'?'Bo3':'1 set';
      items.push(`<article class="live-action-notification">
        <div class="live-notification-icon">!</div>
        <div class="live-notification-copy"><small>NUEVO DESAFÍO · ${matchTypeLabel(c.match_type)}</small>
          <strong>${esc(other?.first_name||'Jugador')} te desafió</strong>
          <span>${fmt}${c.match_type==='casual'?' · No modifica el Elo':' · Partido con ranking'}</span></div>
        <div class="live-notification-actions">
          <button class="live-accept" data-response="accepted" data-id="${c.id}" type="button">Aceptar</button>
          <button class="live-decline" data-response="rejected" data-id="${c.id}" type="button">Declinar</button>
        </div>
      </article>`);
    }
    for(const m of confirmations.slice(0,2)){
      const other=m.player1_id===session.user.id?m.player2:m.player1;
      items.push(`<article class="live-action-notification">
        <div class="live-notification-icon">✓</div>
        <div class="live-notification-copy"><small>RESULTADO PENDIENTE · ${matchTypeLabel(m.match_type)}</small>
          <strong>${esc(other?.first_name||'Tu rival')} cargó el resultado</strong>
          <span>Revisalo y confirmá o disputá el partido.</span></div>
        <div class="live-notification-actions">
          <button class="live-accept" data-confirm-match="${m.id}" type="button">Confirmar</button>
          <button class="live-decline" data-dispute-match="${m.id}" type="button">Disputar</button>
        </div>
      </article>`);
    }
    const stack=$('#liveNotificationStack');
    stack.innerHTML=items.join('');
    stack.classList.toggle('hidden',items.length===0);
    $('#notificationBadge').textContent=items.length;
  }catch(err){console.warn('Notificaciones:',err)}
}
function stopLiveNotificationStream(){
  for(const channel of liveRealtimeChannels){try{supabase.removeChannel(channel)}catch(e){}}
  liveRealtimeChannels=[];
  if(livePollTimer){clearInterval(livePollTimer);livePollTimer=null}
}
function startLiveNotificationStream(){
  if(!session?.user)return;
  stopLiveNotificationStream();
  const uid=session.user.id;
  try{
    const c=supabase.channel(`tt-ch-${uid}-${Date.now()}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'challenges',filter:`challenged_id=eq.${uid}`},()=>loadLiveNotifications()).subscribe();
    const m=supabase.channel(`tt-m-${uid}-${Date.now()}`)
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'matches'},payload=>{
        const row=payload.new;if(row?.player1_id===uid||row?.player2_id===uid)loadLiveNotifications();
      }).subscribe();
    liveRealtimeChannels=[c,m];
  }catch(err){console.warn('Realtime no disponible:',err)}
  livePollTimer=setInterval(loadLiveNotifications,12000);
  loadLiveNotifications();
}
async function loadHomeDashboard(){
  if(!session?.user)return;

  const ind=getRating('individual');
  const dob=getRating('dobles');
  const rep=averageReviews(socialState.reviewsReceived);
  const streak=socialState.streak;
  const achievements=socialState.achievements;
  const unlocked=achievements.filter(a=>a.unlocked).length;

  if($('#homeCurrentStreak'))$('#homeCurrentStreak').textContent=streak.current;
  if($('#homeMaxStreak'))$('#homeMaxStreak').textContent=streak.max;
  if($('#homeReputation'))$('#homeReputation').textContent=rep.count?rep.average.toFixed(1):'—';
  if($('#homeReviewCount'))$('#homeReviewCount').textContent=rep.count?`${rep.count} ${rep.count===1?'valoración':'valoraciones'}`:'sin valoraciones';
  if($('#homeAchievementCount'))$('#homeAchievementCount').textContent=unlocked;
  if($('#homeAchievementTotal'))$('#homeAchievementTotal').textContent=`de ${achievements.length} desbloqueados`;
  if($('#homeDoublesRating'))$('#homeDoublesRating').textContent=`${dob.rating} Elo`;

  const info=nextRankInfo(ind.rating);
  if($('#homeNextRankText')){
    $('#homeNextRankText').textContent=info.next?`${info.next.name} a ${info.next.min_rating}`:'Rango máximo';
  }
  if($('#homeRankProgressBar'))$('#homeRankProgressBar').style.width=`${info.progress}%`;

  if(info.next){
    const remaining=Math.max(0,Number(info.next.min_rating)-Number(ind.rating));
    $('#homeObjectiveTitle').textContent=`Alcanzá ${info.next.name}`;
    $('#homeObjectiveDetail').textContent=`Te faltan ${remaining} puntos de Elo.`;
  }else{
    $('#homeObjectiveTitle').textContent='Rango máximo alcanzado';
    $('#homeObjectiveDetail').textContent='Defendé tu lugar entre los mejores.';
  }

  try{
    const ranking=await getRanking('individual','');
    const me=ranking.find(x=>x.profile?.id===session.user.id);
    $('#homeRankPosition').textContent=me?`#${me.position} Ranking global`:'Ranking global: —';
  }catch(e){
    $('#homeRankPosition').textContent='Ranking global: —';
  }

  renderAchievements();
}


async function renderPrimaryRival(){
  const box=$('#primaryRivalCard');
  if(!box)return;

  if(!primaryRivalId){
    box.innerHTML='<div class="primary-rival-empty"><strong>Sin rival principal</strong><span>Seguí a un jugador y marcálo como tu rival desde su perfil.</span></div>';
    return;
  }

  try{
    const p=await getPublicPlayerCard(primaryRivalId);
    box.innerHTML=`<button class="primary-rival-player" data-open-player="${p.id}" type="button">
      ${avatarHtml(p,'primary-rival-avatar')}
      <div>
        <small>⚔ RIVAL PRINCIPAL</small>
        <strong>${esc(p.first_name)} ${esc(p.last_name)}</strong>
        <span>${rankForRating(p.individual_rating)} · ${p.individual_rating} Elo · Cara a cara ${p.h2h_me}-${p.h2h_them}</span>
      </div>
      <b>Ver perfil →</b>
    </button>`;
  }catch(err){
    box.innerHTML='<div class="loading-row">No se pudo cargar el rival.</div>';
  }
}

function achievementPlateHtml(a,{selected=false,clickable=true}={}){
  if(!a)return'';
  return `<button class="achievement-plate ${a.unlocked?'unlocked':'locked'} ${selected?'selected':''}" ${clickable?`data-achievement-info="${a.id}"`:'disabled'} type="button">
    <span class="achievement-plate-icon">${a.icon}</span>
    <span class="achievement-plate-copy"><strong>${esc(a.name)}</strong><small>${esc(a.group)}</small></span>
  </button>`;
}

function renderAchievements(){
  const box=$('#profileAchievements');
  if(!box)return;
  const rows=socialState.achievements||[];
  const unlocked=rows.filter(a=>a.unlocked).length;
  $('#profileAchievementCounter').textContent=`${unlocked} / ${rows.length}`;

  box.innerHTML=rows.map(a=>`
    <article class="achievement-card ${a.unlocked?'unlocked':'locked'}" data-achievement-card="${a.id}">
      <button class="achievement-card-main" data-achievement-info="${a.id}" type="button">
        <span class="achievement-icon">${a.icon}</span>
        <div><strong>${esc(a.name)}</strong><small>${esc(a.desc)}</small></div>
        <i>${a.unlocked?'DESBLOQUEADO':'BLOQUEADO'}</i>
      </button>
    </article>`).join('');

  renderMyShowcaseAchievements();
}

function renderMyShowcaseAchievements(){
  const box=$('#myShowcaseAchievements');
  if(!box)return;
  const selected=myShowcaseAchievementIds
    .map(id=>achievementById(id))
    .filter(Boolean);

  box.innerHTML=selected.length
    ?selected.map(a=>achievementPlateHtml(a,{selected:true})).join('')
    :'<div class="showcase-empty">No elegiste placas todavía.</div>';
}

function openAchievementInfo(id,sourceAchievements=socialState.achievements){
  const a=achievementById(id,sourceAchievements);
  if(!a)return;
  $('#achievementInfoContent').innerHTML=`
    <div class="achievement-detail">
      <span class="achievement-detail-icon">${a.icon}</span>
      <p class="muted-label">${esc(a.group)}</p>
      <h2>${esc(a.name)}</h2>
      <p>${esc(a.desc)}</p>
      <span class="achievement-detail-state ${a.unlocked?'unlocked':'locked'}">${a.unlocked?'DESBLOQUEADO':'BLOQUEADO'}</span>
    </div>`;
  $('#achievementInfoModal').classList.remove('hidden');
}

function openShowcaseSelector(){
  showcaseDraftIds=[...myShowcaseAchievementIds];
  renderShowcaseSelector();
  setStatus($('#showcaseStatus'),'');
  $('#showcaseAchievementModal').classList.remove('hidden');
}

function renderShowcaseSelector(){
  const rows=(socialState.achievements||[]).filter(a=>a.unlocked);
  $('#showcaseSelectorCount').textContent=`${showcaseDraftIds.length} / 3 seleccionados`;
  $('#showcaseSelectorList').innerHTML=rows.length?rows.map(a=>{
    const selected=showcaseDraftIds.includes(a.id);
    return `<button class="showcase-selector-item ${selected?'selected':''}" data-toggle-showcase="${a.id}" type="button">
      <span>${a.icon}</span>
      <div><strong>${esc(a.name)}</strong><small>${esc(a.desc)}</small></div>
      <b>${selected?'✓':'＋'}</b>
    </button>`;
  }).join(''):'<div class="loading-row">Todavía no desbloqueaste logros.</div>';
}

async function saveShowcaseSelection(){
  const btn=$('#saveShowcaseAchievements');
  btn.disabled=true;
  setStatus($('#showcaseStatus'),'Guardando…');
  try{
    await setShowcaseAchievements(showcaseDraftIds);
    myShowcaseAchievementIds=[...showcaseDraftIds];
    renderMyShowcaseAchievements();
    setStatus($('#showcaseStatus'),'Placas guardadas.','ok');
    setTimeout(()=>$('#showcaseAchievementModal').classList.add('hidden'),350);
  }catch(err){
    setStatus($('#showcaseStatus'),err.message,'error');
  }finally{
    btn.disabled=false;
  }
}

async function loadHistoryPage(){
  if(!session?.user||!$('#matchHistoryList'))return;
  try{
    if(!socialState.matches.length && getRating('individual').matches_played){
      await loadSocialState();
    }

    const matches=(socialState.matches||[])
      .filter(m=>m.result_status==='confirmed')
      .sort((a,b)=>new Date(b.played_at||b.created_at)-new Date(a.played_at||a.created_at));

    const ratingByMatch=new Map((socialState.ratingHistory||[]).map(r=>[Number(r.match_id),r]));
    const reviewByMatch=new Map((socialState.reviewsAuthored||[]).map(r=>[Number(r.match_id),r]));

    let wins=0,losses=0,abandons=0;
    for(const m of matches){
      if(m.completion_type==='abandonment')abandons++;
      else if(m.winner_id===session.user.id)wins++;
      else losses++;
    }

    $('#historyMatchesCount').textContent=matches.length;
    $('#historyWinsCount').textContent=wins;
    $('#historyLossesCount').textContent=losses;
    $('#historyAbandonsCount').textContent=abandons;

    $('#matchHistoryList').innerHTML=matches.length?matches.map(m=>{
      const other=m.player1_id===session.user.id?m.player2:m.player1;
      const isAbandon=m.completion_type==='abandonment';
      const won=m.winner_id===session.user.id;
      const type=isAbandon?'abandonment':won?'victory':'defeat';
      const label=isAbandon?'ABANDONO':won?'VICTORIA':'DERROTA';
      const mySets=m.player1_id===session.user.id?m.player1_sets:m.player2_sets;
      const otherSets=m.player1_id===session.user.id?m.player2_sets:m.player1_sets;
      const rh=ratingByMatch.get(Number(m.id));
      const delta=rh?Number(rh.rating_change):null;
      const review=reviewByMatch.get(Number(m.id));
      const fmt=m.match_format==='bo5'?'Bo5':m.match_format==='bo3'?'Bo3':'1 set';

      return `<article class="history-match-card ${type}">
        <div class="history-result-band">
          <span>${label}</span>
          ${delta!==null?`<strong>${delta>=0?'+':''}${delta} Elo</strong>`:''}
        </div>
        <div class="history-match-main">
          ${avatarHtml(other,'history-opponent-avatar')}
          <div class="history-opponent">
            <small>VS</small>
            <strong>${esc(other?.first_name||'Jugador')} ${esc(other?.last_name||'')}</strong>
            <span>@${esc(other?.username||'usuario')} · ${fmt} · <b class="inline-match-mode ${matchTypeClass(m.match_type)}">${matchTypeLabel(m.match_type)}</b> · ${formatMatchDate(m)}</span>
          </div>
          <div class="history-score">
            <strong>${mySets||0}<i>–</i>${otherSets||0}</strong>
            <small>${isAbandon?(m.abandoned_by===session.user.id?'Abandonaste':'Rival abandonó'):'Resultado final'}</small>
          </div>
        </div>
        <div class="history-match-actions">
          <button type="button" data-rematch="${m.id}">↻ Revancha</button>
          <button type="button" data-review-match="${m.id}">
            ${review?`★ Tu valoración: ${review.stars}`:'☆ Valorar rival'}
          </button>
          <button type="button" data-open-player="${other?.id}">Ver perfil</button>
        </div>
      </article>`;
    }).join(''):'<div class="history-empty"><strong>Todavía no hay partidos confirmados.</strong><span>Cuando termines tu primer partido aparecerá acá.</span></div>';
  }catch(err){
    console.error(err);
    $('#matchHistoryList').innerHTML='<div class="loading-row">No se pudo cargar el historial.</div>';
  }
}

async function requestRematch(matchId,button){
  const m=(socialState.matches||[]).find(x=>Number(x.id)===Number(matchId));
  if(!m)return;
  const opponentId=m.player1_id===session.user.id?m.player2_id:m.player1_id;
  const old=button.textContent;
  button.disabled=true;
  button.textContent='Enviando…';
  try{
    await createChallenge({
      challengerId:session.user.id,
      challengedId:opponentId,
      format:m.match_format||'bo3',
      matchType:m.match_type||'ranked',
      scheduledDate:null,
      scheduledTime:null,
      location:null
    });
    button.textContent='✓ Revancha enviada';
    await loadChallenges();
  }catch(err){
    button.disabled=false;
    button.textContent=old;
    alert(friendly(err.message));
  }
}

function openReviewModal(matchId){
  const m=(socialState.matches||[]).find(x=>Number(x.id)===Number(matchId));
  if(!m)return;
  const other=m.player1_id===session.user.id?m.player2:m.player1;
  const existing=(socialState.reviewsAuthored||[]).find(r=>Number(r.match_id)===Number(matchId));
  reviewTargetMatch=m;
  selectedReviewStars=existing?Number(existing.stars):0;
  $('#reviewModalTitle').textContent=`Valorá a ${other?.first_name||'tu rival'}`;
  setStatus($('#reviewStatus'),'');
  paintReviewStars();
  $('#reviewModal').classList.remove('hidden');
}

function paintReviewStars(){
  $$('#reviewStars [data-review-star]').forEach(b=>{
    b.classList.toggle('selected',Number(b.dataset.reviewStar)<=selectedReviewStars);
  });
  $('#saveReviewButton').disabled=!selectedReviewStars;
  $('#reviewStarText').textContent=selectedReviewStars?`${selectedReviewStars} de 5 estrellas`:'Elegí de 1 a 5 estrellas';
}

async function saveCurrentReview(){
  if(!reviewTargetMatch||!selectedReviewStars)return;
  const btn=$('#saveReviewButton');
  btn.disabled=true;
  setStatus($('#reviewStatus'),'Guardando…');
  try{
    await submitPlayerReview(Number(reviewTargetMatch.id),selectedReviewStars);
    socialState.reviewsAuthored=await getReviewsAuthoredByUser(session.user.id);
    socialState.reviewsReceived=await getReviewsForUser(session.user.id).catch(()=>socialState.reviewsReceived);
    populate();
    setStatus($('#reviewStatus'),'Valoración guardada.','ok');
    await loadHistoryPage();
    setTimeout(()=>$('#reviewModal').classList.add('hidden'),450);
  }catch(err){
    setStatus($('#reviewStatus'),err.message,'error');
  }finally{
    btn.disabled=false;
  }
}

async function openPublicPlayerProfile(userId){
  if(!userId)return;
  const modal=$('#playerProfileModal');
  modal.classList.remove('hidden');
  const box=$('#publicPlayerProfileContent');
  box.innerHTML='<div class="loading-row">Cargando perfil…</div>';

  try{
    const [p,showcaseIds]=await Promise.all([
      getPublicPlayerCard(userId),
      getShowcaseAchievements(userId).catch(()=>[])
    ]);

    const rank=rankForRating(p.individual_rating);
    const isMe=userId===session.user.id;
    const rep=p.reputation_count?`★ ${Number(p.reputation_average).toFixed(1)}`:'★ Sin valorar';
    const member=new Date(p.member_since).toLocaleDateString(undefined,{month:'long',year:'numeric'});

    const publicAchievements=achievementDefinitions({
      totalMatches:p.total_matches,
      wins:p.wins,
      maxStreak:p.max_streak,
      maxElo:p.max_elo,
      casualMatches:p.casual_matches,
      rankedMatches:p.ranked_matches,
      reputationCount:p.reputation_count,
      reputationAverage:p.reputation_average||0,
      followingCount:p.following
    });
    const unlockedCount=publicAchievements.filter(a=>a.unlocked).length;
    const selectedPlates=(showcaseIds||[]).map(id=>achievementById(id,publicAchievements)).filter(Boolean);

    box.dataset.publicAchievements=JSON.stringify(publicAchievements);

    box.innerHTML=`
      <section class="public-profile-v17">
        <div class="public-profile-cover ${rankCss(rank)}"></div>

        <div class="public-profile-v17-head">
          ${avatarHtml(p,'public-profile-avatar-v17')}
          <div class="public-profile-v17-identity">
            <p class="muted-label">PERFIL DE JUGADOR</p>
            <h2>${esc(p.first_name)} ${esc(p.last_name)}</h2>
            <p>@${esc(p.username)}</p>
            <div class="public-profile-chips">
              <span>${esc(rank)}</span>
              <span>${rep}</span>
              <span>🔥 Racha ${p.current_streak}</span>
            </div>
          </div>
        </div>

        <div class="public-profile-social-row">
          <div class="public-profile-social-counts">
            <span><strong>${p.followers}</strong> seguidores</span>
            <span><strong>${p.following}</strong> siguiendo</span>
            <span>Miembro desde <strong>${esc(member)}</strong></span>
          </div>
          ${!isMe?`<button class="follow-player-button ${p.is_following?'following':''}" data-follow-player="${p.id}" data-is-following="${p.is_following?'1':'0'}" type="button">${p.is_following?'Siguiendo ✓':'＋ Seguir jugador'}</button>`:'<span class="own-profile-chip">Tu perfil</span>'}
        </div>

        <div class="public-profile-highlight-grid">
          <article><span>Elo individual</span><strong>${p.individual_rating}</strong><small>#${p.ranking_position||'—'} ranking</small></article>
          <article><span>Elo máximo</span><strong>${p.max_elo}</strong><small>récord histórico</small></article>
          <article><span>Reputación</span><strong>${rep}</strong><small>${p.reputation_count} valoraciones</small></article>
          <article><span>Logros</span><strong>${unlockedCount}</strong><small>de 50</small></article>
        </div>

        <section class="public-showcase-section">
          <div class="public-showcase-head"><p class="muted-label">PLACAS DESTACADAS</p><span>${selectedPlates.length} / 3</span></div>
          <div class="showcase-achievements public-showcase">
            ${selectedPlates.length
              ?selectedPlates.map(a=>achievementPlateHtml(a,{selected:true})).join('')
              :'<div class="showcase-empty">Este jugador todavía no eligió placas.</div>'}
          </div>
        </section>

        <section class="public-profile-sport">
          <div><span>Estilo</span><strong>${esc(cap(p.playing_style))}</strong></div>
          <div><span>Mano hábil</span><strong>${esc(cap(p.dominant_hand))}</strong></div>
          <div><span>Club</span><strong>${esc(p.club_name||'N/A')}</strong></div>
          <div><span>Dobles</span><strong>${p.doubles_rating} Elo</strong></div>
        </section>

        <section class="public-profile-record">
          <div class="public-record-title"><p class="muted-label">ESTADÍSTICAS</p><strong>${p.win_rate===null?'—':p.win_rate+'%'} victorias</strong></div>
          <div class="public-record-grid">
            <article><span>Ranking</span><strong>${p.ranked_matches}</strong></article>
            <article><span>Casuales</span><strong>${p.casual_matches}</strong></article>
            <article><span>Totales</span><strong>${p.total_matches}</strong></article>
            <article><span>Victorias</span><strong>${p.wins}</strong></article>
            <article><span>Derrotas</span><strong>${p.losses}</strong></article>
            <article><span>Mejor racha</span><strong>${p.max_streak}</strong></article>
          </div>
        </section>

        ${!isMe?`
          <section class="public-h2h-v17">
            <p class="muted-label">CARA A CARA</p>
            <div>
              <strong>Vos <b>${p.h2h_me}</b></strong>
              <span>${p.h2h_total} enfrentamientos</span>
              <strong><b>${p.h2h_them}</b> ${esc(p.first_name)}</strong>
            </div>
          </section>

          <div class="public-profile-actions-v17">
            <button class="btn btn-start" type="button" data-public-challenge="${p.id}" data-name="${esc(p.first_name)} ${esc(p.last_name)}" data-user="${esc(p.username)}">DESAFIAR</button>
            ${p.is_following?`<button class="primary-rival-button ${p.is_primary_rival?'active':''}" data-primary-rival="${p.id}" data-is-primary="${p.is_primary_rival?'1':'0'}" type="button">${p.is_primary_rival?'⚔ Rival principal ✓':'⚔ Marcar como rival'}</button>`:''}
          </div>
        `:''}
      </section>
    `;
  }catch(err){
    console.error(err);
    box.innerHTML='<div class="loading-row">No se pudo cargar el perfil.</div>';
  }
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
  $('#tournamentSetInputs').innerHTML=Array.from({length:best},(_,i)=>`<div class="set-row result-set-row"><strong>Set ${i+1}</strong><label>${esc(e1?.display_name||'P1')}<input type="number" min="0" max="99" data-t8p1="${i+1}"></label><label>${esc(e2?.display_name||'P2')}<input type="number" min="0" max="99" data-t8p2="${i+1}"></label><label class="unplayed-toggle"><input type="checkbox" data-t8-unplayed="${i+1}"><span>Set no jugado</span></label></div>`).join('');
  $('#tournamentSetInputs').insertAdjacentHTML('beforeend','<div class="unplayed-help">Los sets que no se jugaron pueden quedar vacíos o marcarse como <strong>Set no jugado</strong>. Ejemplo: en Bo3, 11-4 / 11-7 se guarda directamente como 2-0.</div>');
  setStatus($('#tournamentMatchResultStatus'),'');$('#tournamentMatchModal').classList.remove('hidden');
}
function closeTournamentMatchModal(){currentTournamentMatch=null;$('#tournamentMatchModal').classList.add('hidden')}



function renderRatingChart(historyRows){
  const svg=$('#ratingChart');
  if(!svg)return;

  // DB comes newest first. Chart must run oldest -> newest.
  const rows=[...(historyRows||[])].reverse();

  if(!rows.length){
    $('#ratingChartWrap').classList.add('hidden');
    $('#ratingChartEmpty').classList.remove('hidden');
    $('#ratingChartCurrent').textContent=`${getRating('individual').rating} Elo`;
    $('#ratingChartMin').textContent='—';
    $('#ratingChartMax').textContent='—';
    return;
  }

  $('#ratingChartWrap').classList.remove('hidden');
  $('#ratingChartEmpty').classList.add('hidden');

  // Include the rating before the first change so the curve has a true starting point.
  const points=[
    {
      rating:Number(rows[0].previous_rating),
      date:new Date(new Date(rows[0].created_at).getTime()-1000),
      change:0,
      label:'Inicio'
    },
    ...rows.map(r=>({
      rating:Number(r.new_rating),
      date:new Date(r.created_at),
      change:Number(r.rating_change),
      label:`${r.rating_change>=0?'+':''}${r.rating_change}`
    }))
  ];

  const width=700,height=280;
  const pad={left:26,right:22,top:24,bottom:30};
  const ratingsValues=points.map(p=>p.rating);
  let min=Math.min(...ratingsValues),max=Math.max(...ratingsValues);

  // Make small changes still visually readable.
  const spread=Math.max(20,max-min);
  const extra=Math.max(10,spread*.18);
  min=Math.floor(min-extra);
  max=Math.ceil(max+extra);

  const x=i=>pad.left+(i/(Math.max(1,points.length-1)))*(width-pad.left-pad.right);
  const y=v=>pad.top+((max-v)/(max-min))*(height-pad.top-pad.bottom);

  // Curva suavizada de evolución. Visualmente muestra la tendencia como una
  // curva continua en lugar de una lista plana de cambios.
  let line=`M ${x(0).toFixed(1)} ${y(points[0].rating).toFixed(1)}`;
  for(let i=1;i<points.length;i++){
    const x0=x(i-1),y0=y(points[i-1].rating),x1=x(i),y1=y(points[i].rating);
    const dx=(x1-x0)*0.42;
    line+=` C ${(x0+dx).toFixed(1)} ${y0.toFixed(1)}, ${(x1-dx).toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }

  const baseline=height-pad.bottom;
  const area=`${line} L ${x(points.length-1).toFixed(1)} ${baseline} L ${x(0).toFixed(1)} ${baseline} Z`;

  $('#ratingChartLine').setAttribute('d',line);
  $('#ratingChartArea').setAttribute('d',area);
  $('#ratingChartLine').classList.remove('chart-draw');
  void $('#ratingChartLine').getBoundingClientRect();
  $('#ratingChartLine').classList.add('chart-draw');

  // Grid
  const gridLines=4;
  $('#ratingChartGrid').innerHTML=Array.from({length:gridLines+1},(_,i)=>{
    const gy=pad.top+(i/gridLines)*(height-pad.top-pad.bottom);
    const val=Math.round(max-(i/gridLines)*(max-min));
    return `<line x1="${pad.left}" y1="${gy}" x2="${width-pad.right}" y2="${gy}" class="chart-grid-line"></line>
            <text x="${pad.left}" y="${gy-5}" class="chart-grid-label">${val}</text>`;
  }).join('');

  // Dots with data attributes for tooltip.
  $('#ratingChartDots').innerHTML=points.map((p,i)=>`
    <circle class="rating-chart-dot ${i===points.length-1?'latest':''}"
      cx="${x(i)}" cy="${y(p.rating)}" r="${i===points.length-1?6:4}"
      data-chart-index="${i}"></circle>`).join('');

  $('#ratingChartCurrent').textContent=`${points.at(-1).rating} Elo`;
  $('#ratingChartMin').textContent=`${Math.min(...ratingsValues)} min`;
  $('#ratingChartMax').textContent=`${Math.max(...ratingsValues)} max`;

  const tooltip=$('#ratingChartTooltip');
  $('#ratingChartDots').querySelectorAll('[data-chart-index]').forEach(dot=>{
    const show=()=>{
      const p=points[Number(dot.dataset.chartIndex)];
      tooltip.innerHTML=`<strong>${p.rating} Elo</strong><span>${p.date.toLocaleDateString()}${p.change?` · ${p.change>=0?'+':''}${p.change}`:''}</span>`;
      tooltip.classList.remove('hidden');
    };
    dot.addEventListener('mouseenter',show);
    dot.addEventListener('click',show);
    dot.addEventListener('mouseleave',()=>tooltip.classList.add('hidden'));
  });
}

function openProfilePhotoMenu(){
  $('#profilePhotoMenu').classList.toggle('hidden');
}
function closeProfilePhotoMenu(){
  $('#profilePhotoMenu').classList.add('hidden');
}
async function reloadOwnProfile(){
  profile=await getMyProfile(session.user.id);
  populate();
}

function rankImagePath(name){
  const file=({Bronce:'bronce',Plata:'plata',Oro:'oro',Platino:'platino',Diamante:'diamante'})[name]||'bronce';
  return `assets/ranks/${file}.png`;
}
function rankIcon(name){
  return `<img class="rank-art-thumb" src="${rankImagePath(name)}" alt="Rango ${esc(name)}">`;
}
async function openRankTable(){
  try{
    if(!rankTiers.length)rankTiers=await getRankTiers();
  }catch(e){console.error(e)}
  const ind=getRating('individual');
  const current=rankForRating(ind.rating);
  const currentIndex=Math.max(0,rankTiers.findIndex(t=>t.name===current));
  const next=rankTiers[currentIndex+1];

  $('#rankTableCurrent').innerHTML=`
    <div class="current-rank-art ${current==='Diamante'?'diamond-aura':''}">
      <img src="${rankImagePath(current)}" alt="Rango ${esc(current)}">
    </div>
    <div class="current-rank-copy">
      <span class="current-rank-kicker">RANGO ACTUAL</span>
      <strong>${esc(current)}</strong>
      <small>Rating individual: ${ind.rating}${next?` · Próximo rango a ${next.min_rating}`:' · Rango máximo alcanzado'}</small>
      ${next?`<div class="rank-progress"><span style="width:${Math.max(0,Math.min(100,((ind.rating-rankTiers[currentIndex].min_rating)/(next.min_rating-rankTiers[currentIndex].min_rating))*100))}%"></span></div>`:''}
    </div>
  `;

  $('#rankTierList').innerHTML=rankTiers.map((t,i)=>{
    const nextTier=rankTiers[i+1];
    const range=nextTier?`${t.min_rating} – ${nextTier.min_rating-1}`:`${t.min_rating}+`;
    return `<div class="rank-tier-row rank-${t.name.toLowerCase()} ${t.name===current?'current':''}">
      <div class="rank-tier-icon">${rankIcon(t.name)}</div>
      <div class="rank-tier-copy"><strong>${esc(t.name)}</strong><small>${range} puntos de ranking</small></div>
      <div class="rank-threshold"><span>DESDE</span>${t.min_rating}</div>
    </div>`;
  }).join('');

  $('#rankTableModal').classList.remove('hidden');
}
function closeRankTable(){$('#rankTableModal').classList.add('hidden')}

$('#goRegister').onclick=()=>showView('registerView');$('#goLogin').onclick=()=>showView('loginView');$$('[data-back]').forEach(b=>b.onclick=()=>showView(b.dataset.back));
$('#clubName').onchange=()=>{const c=$('#clubName').value==='Otro';$('#customClubWrap').classList.toggle('hidden',!c);$('#customClubName').required=c};

$('#registerForm').onsubmit=async e=>{e.preventDefault();const st=$('#registerStatus'),firstName=$('#firstName').value.trim(),lastName=$('#lastName').value.trim(),username=$('#username').value.trim().toLowerCase(),email=$('#registerEmail').value.trim(),password=$('#registerPassword').value;if(password!==$('#confirmPassword').value)return setStatus(st,'Las contraseñas no coinciden.','error');if(!/^[a-z0-9_]{3,24}$/.test(username))return setStatus(st,'Usuario inválido.','error');try{const {data,error}=await signUpUser({email,password,firstName,lastName,username});if(error)throw error;session=data.session;showView('sportsProfileView')}catch(err){setStatus(st,friendly(err.message),'error')}};
$('#loginForm').onsubmit=async e=>{e.preventDefault();const st=$('#loginStatus');try{const {data,error}=await signInUser({email:$('#loginEmail').value.trim(),password:$('#loginPassword').value});if(error)throw error;session=data.session;const p=await getMyProfile(data.user.id);if(!p.profile_completed)return showView('sportsProfileView');await loadApp(data.user.id,p)}catch(err){setStatus(st,friendly(err.message),'error')}};
$('#sportsProfileForm').onsubmit=async e=>{
  e.preventDefault();
  const status=$('#sportsStatus');
  const finalClub=$('#clubName').value==='Otro'?$('#customClubName').value.trim():$('#clubName').value;

  if(!$('#birthDate').value||!$('#playingStyle').value||!$('#dominantHand').value||!finalClub){
    return setStatus(status,'Completá todos los campos obligatorios.','error');
  }

  const submitButton=e.currentTarget.querySelector('button[type="submit"]');
  submitButton.disabled=true;
  setStatus(status,'Guardando perfil…');

  try{
    session=await getSession();
    if(!session?.user)throw new Error('No hay una sesión activa.');

    let photoUrl=null;

    if(onboardingPhotoFile){
      setStatus(status,'Subiendo foto…');
      const uploaded=await uploadProfilePhoto(session.user.id,onboardingPhotoFile);
      photoUrl=uploaded.publicUrl;
    }

    await completeSportsProfile({
      birthDate:$('#birthDate').value,
      playingStyle:$('#playingStyle').value,
      dominantHand:$('#dominantHand').value,
      clubName:finalClub,
      profilePhotoUrl:photoUrl
    });

    onboardingPhotoFile=null;
    if(onboardingPhotoPreviewUrl){
      URL.revokeObjectURL(onboardingPhotoPreviewUrl);
      onboardingPhotoPreviewUrl=null;
    }

    await loadApp(session.user.id);
  }catch(err){
    console.error(err);
    setStatus(status,err.message||'No se pudo completar el perfil.','error');
  }finally{
    submitButton.disabled=false;
  }
};

$$('.nav-item').forEach(b=>b.onclick=()=>activateTab(b.dataset.tab));$$('[data-go-tab]').forEach(b=>b.onclick=()=>activateTab(b.dataset.goTab));
$$('[data-ranking-mode]').forEach(b=>b.onclick=()=>{rankingMode=b.dataset.rankingMode;$$('[data-ranking-mode]').forEach(x=>x.classList.toggle('active',x===b));loadRanking()});
$$('[data-ranking-scope]').forEach(b=>b.onclick=()=>{
  rankingScope=b.dataset.rankingScope;
  $$('[data-ranking-scope]').forEach(x=>x.classList.toggle('active',x===b));
  loadRanking();
});

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
      matchType:$('#challengeMatchType').value||'ranked',
      scheduledDate:$('#challengeDate').value,
      scheduledTime:$('#challengeTime').value,
      location:$('#challengeLocation').value.trim()
    });
    if(form && typeof form.reset==='function') form.reset();
    setChallengeType('ranked');
    clearRival();
    await loadChallenges();
  }catch(err){
    if(statusEl) setStatus(statusEl,err.message,'error');
    else alert(err.message);
  }
};

document.addEventListener('click',async e=>{
  const resp=e.target.closest('[data-response]');if(resp){try{await respondToChallenge(Number(resp.dataset.id),resp.dataset.response);await Promise.all([loadChallenges(),loadMatches(),loadLiveNotifications()])}catch(err){alert(err.message)}return}
  const cancel=e.target.closest('[data-cancel-challenge]');if(cancel){try{await cancelChallenge(Number(cancel.dataset.cancelChallenge));await loadChallenges()}catch(err){alert(err.message)}return}
  const result=e.target.closest('[data-enter-result]');if(result){await refreshMatchesCache();openMatchModal(result.dataset.enterResult,cachedMatches);return}
  const confirm=e.target.closest('[data-confirm-match]');if(confirm){
    const matchId=Number(confirm.dataset.confirmMatch);
    try{
      await confirmMatchResult(matchId);
      await refreshCore();
      openReviewModal(matchId);
    }catch(err){alert(err.message)}
    return
  }
  const dispute=e.target.closest('[data-dispute-match]');if(dispute){try{await disputeMatchResult(Number(dispute.dataset.disputeMatch));await loadMatches()}catch(err){alert(err.message)}}
});

$('#closeMatchModal').onclick=closeMatchModal;
$('#matchResultForm').onsubmit=async e=>{
  e.preventDefault();if(!currentMatch)return;
  const rows=[...$('#setInputs').querySelectorAll('.set-row')];
  const sets=[];
  let foundUnplayed=false;
  for(const row of rows){
    const skip=row.querySelector('[data-unplayed-set]')?.checked;
    const p1=row.querySelector('[data-p1-set]').value,p2=row.querySelector('[data-p2-set]').value;
    if(skip){foundUnplayed=true;continue}
    if(p1===''&&p2===''){foundUnplayed=true;continue}
    if(foundUnplayed)return setStatus($('#matchResultStatus'),'No puede haber un set jugado después de un set marcado como no jugado.','error');
    if(p1===''||p2==='')return setStatus($('#matchResultStatus'),'Completá ambos puntajes del set o marcá “Set no jugado”.','error');
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
  let foundUnplayed=false;
  for(const row of rows){
    const skip=row.querySelector('[data-t8-unplayed]')?.checked;
    const p1=row.querySelector('[data-t8p1]').value,p2=row.querySelector('[data-t8p2]').value;
    if(skip){foundUnplayed=true;continue}
    if(p1===''&&p2===''){foundUnplayed=true;continue}
    if(foundUnplayed)return setStatus($('#tournamentMatchResultStatus'),'No puede haber un set jugado después de un set no jugado.','error');
    if(p1===''||p2==='')return setStatus($('#tournamentMatchResultStatus'),'Completá ambos puntajes o marcá “Set no jugado”.','error');
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


document.addEventListener('change',e=>{
  const unplayed=e.target.closest('[data-unplayed-set],[data-t8-unplayed]');
  if(!unplayed)return;
  const row=unplayed.closest('.set-row');
  if(!row)return;
  row.classList.toggle('set-unplayed',unplayed.checked);
  row.querySelectorAll('input[type="number"]').forEach(inp=>{
    inp.disabled=unplayed.checked;
    if(unplayed.checked)inp.value='';
  });
});




$('#onboardingPhotoPicker').onclick=()=>$('#onboardingPhotoFileInput').click();

$('#onboardingPhotoFileInput').onchange=e=>{
  const file=e.target.files?.[0];
  if(!file)return;

  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){
    alert('Usá una imagen JPG, PNG o WEBP.');
    e.target.value='';
    return;
  }

  if(file.size>5*1024*1024){
    alert('La foto no puede superar 5 MB.');
    e.target.value='';
    return;
  }

  onboardingPhotoFile=file;

  if(onboardingPhotoPreviewUrl)URL.revokeObjectURL(onboardingPhotoPreviewUrl);
  onboardingPhotoPreviewUrl=URL.createObjectURL(file);

  $('#onboardingPhotoPreview').innerHTML=`<img src="${onboardingPhotoPreviewUrl}" alt="Vista previa de foto">`;
  $('#clearOnboardingPhoto').classList.remove('hidden');
};

$('#clearOnboardingPhoto').onclick=()=>{
  onboardingPhotoFile=null;
  $('#onboardingPhotoFileInput').value='';
  if(onboardingPhotoPreviewUrl){
    URL.revokeObjectURL(onboardingPhotoPreviewUrl);
    onboardingPhotoPreviewUrl=null;
  }
  $('#onboardingPhotoPreview').innerHTML='<span class="onboarding-photo-plus">+</span>';
  $('#clearOnboardingPhoto').classList.add('hidden');
};

$('#profilePhotoMenuButton').onclick=e=>{
  e.stopPropagation();
  openProfilePhotoMenu();
};

$('#addProfilePhotoButton').onclick=()=>{
  closeProfilePhotoMenu();
  $('#profilePhotoFileInput').click();
};

$('#profilePhotoFileInput').onchange=async e=>{
  const file=e.target.files?.[0];
  if(!file)return;

  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){
    alert('Usá una imagen JPG, PNG o WEBP.');
    e.target.value='';
    return;
  }
  if(file.size>5*1024*1024){
    alert('La foto no puede superar 5 MB.');
    e.target.value='';
    return;
  }

  const plus=$('#profilePhotoMenuButton');
  const oldText=plus.textContent;
  plus.disabled=true;
  plus.textContent='…';

  try{
    const previous=profile.profile_photo_url;
    const uploaded=await uploadProfilePhoto(session.user.id,file);
    await setProfilePhotoUrl(uploaded.publicUrl);

    // If there was a previous app-managed photo, delete the old file after the new one is safely linked.
    if(previous){
      try{await deleteProfilePhotoByUrl(previous,session.user.id)}catch(err){console.warn(err)}
    }

    await reloadOwnProfile();
  }catch(err){
    console.error(err);
    alert(`No se pudo subir la foto: ${err.message}`);
  }finally{
    plus.disabled=false;
    plus.textContent=oldText;
    e.target.value='';
  }
};

$('#removeProfilePhotoButton').onclick=async()=>{
  closeProfilePhotoMenu();
  if(!profile.profile_photo_url)return;
  try{
    // "Quitar" = clear the profile reference but leave the stored file.
    await setProfilePhotoUrl(null);
    await reloadOwnProfile();
  }catch(err){
    alert(err.message);
  }
};

$('#deleteProfilePhotoButton').onclick=async()=>{
  closeProfilePhotoMenu();
  if(!profile.profile_photo_url)return;

  if(!confirm('¿Eliminar definitivamente tu foto de perfil?'))return;

  try{
    const url=profile.profile_photo_url;
    await setProfilePhotoUrl(null);
    try{await deleteProfilePhotoByUrl(url,session.user.id)}catch(err){console.warn(err)}
    await reloadOwnProfile();
  }catch(err){
    alert(err.message);
  }
};

document.addEventListener('click',e=>{
  if(!e.target.closest('.home-avatar-wrap'))closeProfilePhotoMenu();
});


document.addEventListener('click',async e=>{
  const rematch=e.target.closest('[data-rematch]');
  if(rematch){
    await requestRematch(Number(rematch.dataset.rematch),rematch);
    return;
  }

  const review=e.target.closest('[data-review-match]');
  if(review){
    openReviewModal(Number(review.dataset.reviewMatch));
    return;
  }

  const player=e.target.closest('[data-open-player]');
  if(player){
    await openPublicPlayerProfile(player.dataset.openPlayer);
    return;
  }

  const follow=e.target.closest('[data-follow-player]');
  if(follow){
    const target=follow.dataset.followPlayer;
    const isFollowing=follow.dataset.isFollowing==='1';
    follow.disabled=true;
    try{
      if(isFollowing)await unfollowPlayer(session.user.id,target);
      else await followPlayer(session.user.id,target);
      await loadSocialState();
      await openPublicPlayerProfile(target);
      if(rankingScope==='following'||rankingScope==='feed')await loadRanking();
      await renderPrimaryRival();
    }catch(err){alert(err.message)}
    return;
  }

  const rival=e.target.closest('[data-primary-rival]');
  if(rival){
    const target=rival.dataset.primaryRival;
    const isPrimary=rival.dataset.isPrimary==='1';
    rival.disabled=true;
    try{
      if(isPrimary)await clearPrimaryRival();
      else await setPrimaryRival(target);
      await loadSocialState();
      await openPublicPlayerProfile(target);
      await renderPrimaryRival();
    }catch(err){alert(err.message)}
    return;
  }

  const publicChallenge=e.target.closest('[data-public-challenge]');
  if(publicChallenge){
    $('#playerProfileModal').classList.add('hidden');
    activateTab('play');
    selectedRival={
      id:publicChallenge.dataset.publicChallenge,
      name:publicChallenge.dataset.name,
      user:publicChallenge.dataset.user
    };
    $('#selectedRivalName').textContent=selectedRival.name;
    $('#selectedRivalUsername').textContent=`@${selectedRival.user}`;
    $('#challengeComposer').classList.remove('hidden');
    return;
  }
});

$$('#reviewStars [data-review-star]').forEach(b=>b.onclick=()=>{
  selectedReviewStars=Number(b.dataset.reviewStar);
  paintReviewStars();
});
$('#saveReviewButton').onclick=saveCurrentReview;
$('#closeReviewModal').onclick=()=>$('#reviewModal').classList.add('hidden');
function closePlayerProfileModal(){
  $('#playerProfileModal').classList.add('hidden');
  $('#publicPlayerProfileContent').innerHTML='';
}
$('#closePlayerProfileModal').onclick=closePlayerProfileModal;
$('#playerProfileModal').addEventListener('click',e=>{
  if(e.target===$('#playerProfileModal'))closePlayerProfileModal();
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(!$('#playerProfileModal').classList.contains('hidden'))closePlayerProfileModal();
    $('#achievementInfoModal')?.classList.add('hidden');
    $('#showcaseAchievementModal')?.classList.add('hidden');
  }
});


$('#chooseShowcaseAchievements').onclick=openShowcaseSelector;
$('#saveShowcaseAchievements').onclick=saveShowcaseSelection;

document.addEventListener('click',e=>{
  const info=e.target.closest('[data-achievement-info]');
  if(info){
    const id=info.dataset.achievementInfo;
    const publicBox=$('#publicPlayerProfileContent');
    let source=socialState.achievements;
    if(publicBox?.dataset.publicAchievements){
      try{source=JSON.parse(publicBox.dataset.publicAchievements)}catch(err){}
    }
    openAchievementInfo(id,source);
    return;
  }

  const toggle=e.target.closest('[data-toggle-showcase]');
  if(toggle){
    const id=toggle.dataset.toggleShowcase;
    if(showcaseDraftIds.includes(id)){
      showcaseDraftIds=showcaseDraftIds.filter(x=>x!==id);
    }else if(showcaseDraftIds.length<3){
      showcaseDraftIds.push(id);
    }
    renderShowcaseSelector();
    return;
  }

  if(e.target.closest('[data-close-achievement-info]')){
    $('#achievementInfoModal').classList.add('hidden');
    return;
  }
  if(e.target.closest('[data-close-showcase-selector]')){
    $('#showcaseAchievementModal').classList.add('hidden');
    return;
  }
});

$('#achievementInfoModal').addEventListener('click',e=>{
  if(e.target===$('#achievementInfoModal'))$('#achievementInfoModal').classList.add('hidden');
});
$('#showcaseAchievementModal').addEventListener('click',e=>{
  if(e.target===$('#showcaseAchievementModal'))$('#showcaseAchievementModal').classList.add('hidden');
});

$('#openRankTableHome').onclick=openRankTable;
$('#openRankTableProfile').onclick=openRankTable;
$('#closeRankTableModal').onclick=closeRankTable;

$('#notificationButton').onclick=()=>{
  const stack=$('#liveNotificationStack');
  if(stack&&!stack.classList.contains('hidden')){
    stack.classList.add('attention');
    setTimeout(()=>stack.classList.remove('attention'),650);
  }else activateTab('play');
};
$('#logoutButton').onclick=async()=>{stopLiveNotificationStream();await signOutUser();session=null;profile=null;ratings=[];showView('welcomeView')};

(async()=>{try{await route()}catch(e){console.error(e);showView('welcomeView');setStatus($('#globalStatus'),'Hubo un problema al cargar la app.','error')}})();

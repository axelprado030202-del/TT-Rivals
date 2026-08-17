import { supabase } from './supabase.js';
import {getSession,signUpUser,signInUser,signOutUser} from './auth.js';
import {getMyProfile,getMyRatings,completeSportsProfile,getRanking,searchPlayers,getRatingHistory,getRankTiers,setProfilePhotoUrl,uploadProfilePhoto,deleteProfilePhotoByUrl} from './profile.js';
import {createChallenge,respondToChallenge,cancelChallenge,getMyChallenges} from './challenges.js';
import {getMyMatches,submitMatchResult,confirmMatchResult,disputeMatchResult} from './matches.js';
import {createTournamentV8,getTournamentsV8,getTournamentEntriesV8,getTournamentMembersV8,getTournamentGamesV8,getTournamentStandingsV8,submitTournamentGameResultV8,closeGroupStageV8,finalizeTournamentV8,searchTournamentUsersV8,getTournamentParticipantProfilesV8} from './tournaments.js';
import {getReviewsForUser,getReviewsAuthoredByUser,submitPlayerReview,getPlayerProfile,getPlayerRatings,followPlayer,unfollowPlayer,getFollowingIds,getFollowingRanking,getPublicPlayerCard,getFollowingFeed,setPrimaryRival,clearPrimaryRival,getMyPrimaryRival,getShowcaseAchievements,setShowcaseAchievements} from './social.js';
import {getPreferences,updatePreferences,getFrames,equipFrame,getSeasonDashboard,getSeasonHistory,getRecommendedRivals,getPlayerPercentiles,getPublicProfilePreferences} from './preferences.js';
import {getSeasonChampions,getPublicPlayerSeasons,getH2HAdvanced,getPlayerRecords,getTournamentSummary} from './history.js';
import {getPlayerTitles,equipCompetitiveTitle,getTournamentHistory,getComparativeStats,getPostMatchSummary} from './v21.js';

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
let userPreferences=null,frameState={catalog:[],unlocks:[],equipped:null},seasonState=null,percentileState={},titleState={equipped:null,items:[]},comparativeState={};
let historyModeFilter='all',historyResultFilter='all',competitivePulseTarget=null;



function applyTheme(theme='dark'){
  const clean=['dark','light','system'].includes(theme)?theme:'dark';
  let resolved=clean;
  if(clean==='system'){
    resolved=window.matchMedia?.('(prefers-color-scheme: light)').matches?'light':'dark';
  }
  document.body.dataset.theme=resolved;
  document.documentElement.dataset.theme=resolved;
  $$('[data-theme-choice]').forEach(b=>b.classList.toggle('active',b.dataset.themeChoice===clean));
}

async function loadExperienceSettings(){
  if(!session?.user)return;
  try{
    [userPreferences,frameState,seasonState,percentileState,titleState,comparativeState]=await Promise.all([
      getPreferences(),
      getFrames(session.user.id),
      getSeasonDashboard(),
      getPlayerPercentiles().catch(()=>({})),
      getPlayerTitles(session.user.id).catch(()=>({equipped:null,items:[]})),
      getComparativeStats().catch(()=>({})
      )
    ]);
    applyTheme(userPreferences?.theme||'dark');
    populateSettingsUI();
  }catch(err){
    console.error('settings',err);
  }
}

function populateSettingsUI(){
  if(!userPreferences)return;
  const set=(id,v)=>{const el=$(id);if(el)el.value=v};
  const check=(id,v)=>{const el=$(id);if(el)el.checked=!!v};
  set('#prefDefaultMatchType',userPreferences.default_match_type||'ask');
  set('#prefDefaultMatchFormat',userPreferences.default_match_format||'bo3');
  check('#prefConfirmChallenge',userPreferences.confirm_before_challenge);
  check('#prefNotifyChallenges',userPreferences.notify_challenges);
  check('#prefNotifyConfirmations',userPreferences.notify_confirmations);
  check('#prefNotifyAchievements',userPreferences.notify_achievements);
  check('#prefNotifyRankUp',userPreferences.notify_rank_up);
  check('#prefNotifyFollowing',userPreferences.notify_following_activity);
  check('#prefNotifyTournaments',userPreferences.notify_tournaments);
  check('#prefNotifyFollowers',userPreferences.notify_followers);
  check('#prefShowClub',userPreferences.show_club);
  check('#prefShowStyle',userPreferences.show_playing_style);
  check('#prefShowHand',userPreferences.show_dominant_hand);
  check('#prefShowFollows',userPreferences.show_follow_counts);
  check('#prefShowReputation',userPreferences.show_reputation);
  if($('#settingsAccountEmail'))$('#settingsAccountEmail').textContent=session?.user?.email||'—';
  if(profile){
    if($('#prefProfileFirstName'))$('#prefProfileFirstName').value=profile.first_name||'';
    if($('#prefProfileLastName'))$('#prefProfileLastName').value=profile.last_name||'';
    if($('#prefProfileUsername'))$('#prefProfileUsername').value=profile.username||'';
    if($('#prefProfileBirthDate'))$('#prefProfileBirthDate').value=profile.birth_date||'';
    if($('#prefProfileClub'))$('#prefProfileClub').value=profile.club_name||'';
    if($('#prefProfileStyle'))$('#prefProfileStyle').value=profile.playing_style||'allround';
    if($('#prefProfileHand'))$('#prefProfileHand').value=profile.dominant_hand||'diestro';
  }
  applyTheme(userPreferences.theme||'dark');
  renderFrameGallery();
}

function frameClass(id=''){
  return `frame-${String(id||'none').replaceAll('_','-')}`;
}

function frameIsAvailable(frame){
  if(frame.id==='none')return true;
  const unlock=frameState.unlocks.find(x=>x.frame_id===frame.id);
  if(!unlock)return false;
  return !unlock.expires_at||new Date(unlock.expires_at)>new Date();
}

function renderFrameGallery(){
  const box=$('#frameGallery');
  if(!box)return;
  const rows=[{id:'none',name:'Sin marco',category:'special',rarity:'common',description:'Perfil limpio, sin marco.',sort_order:-1},...(frameState.catalog||[]).filter(x=>x.id!=='none')];
  box.innerHTML=rows.map(f=>{
    const available=frameIsAvailable(f);
    const equipped=(frameState.equipped||null)===(f.id==='none'?null:f.id);
    return `<article class="frame-card ${frameClass(f.id)} ${available?'unlocked':'locked'} ${equipped?'equipped':''}">
      <div class="frame-preview ${frameClass(f.id)}"><span>AP</span></div>
      <div class="frame-card-copy"><strong>${esc(f.name)}</strong><small>${esc(f.description||'')}</small><i>${String(f.rarity||'common').toUpperCase()}</i></div>
      <button type="button" data-equip-frame="${f.id}" ${available?'':'disabled'}>${equipped?'Equipado ✓':available?'Equipar':'🔒'}</button>
    </article>`;
  }).join('');
}

async function savePreferencePatch(patch){
  try{
    userPreferences=await updatePreferences(session.user.id,{...userPreferences,...patch});
    populateSettingsUI();
    setStatus($('#settingsStatus'),'Configuración guardada.','ok');
  }catch(err){
    setStatus($('#settingsStatus'),err.message,'error');
  }
}

function lockPageScroll(lock=true){
  const body=document.body;
  if(lock){
    if(body.classList.contains('modal-open'))return;
    const y=window.scrollY||window.pageYOffset||0;
    body.dataset.scrollY=String(y);
    body.classList.add('modal-open');
    body.style.top=`-${y}px`;
    body.style.width='100%';
  }else{
    const y=Math.max(0,parseInt(body.dataset.scrollY||'0',10)||0);
    body.classList.remove('modal-open');
    body.style.top='';
    body.style.width='';
    body.style.overflow='';
    body.style.touchAction='';
    delete body.dataset.scrollY;
    requestAnimationFrame(()=>window.scrollTo(0,y));
  }
}

function modalIsActuallyOpen(modal){
  if(!modal||modal.classList.contains('hidden'))return false;
  const style=getComputedStyle(modal);
  return style.display!=='none'&&style.visibility!=='hidden';
}

function syncModalScrollLock(){
  const anyOpen=$$('.modal').some(modalIsActuallyOpen);
  lockPageScroll(anyOpen);
}

function recoverPageScrollIfIdle(){
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      const anyOpen=$$('.modal').some(modalIsActuallyOpen);
      if(!anyOpen)lockPageScroll(false);
    });
  });
}

/*
  V25: guardián global del scroll.
  Si cualquier modal cambia de visible a oculto por un flujo que no pase
  por su botón X, vuelve a sincronizar el body automáticamente.
*/
const modalScrollObserver=new MutationObserver(()=>recoverPageScrollIfIdle());
$$('.modal').forEach(m=>modalScrollObserver.observe(m,{attributes:true,attributeFilter:['class','style','hidden']}));

document.addEventListener('click',()=>setTimeout(recoverPageScrollIfIdle,0),true);
document.addEventListener('touchend',()=>setTimeout(recoverPageScrollIfIdle,0),{passive:true,capture:true});
window.addEventListener('pageshow',recoverPageScrollIfIdle);
window.addEventListener('focus',recoverPageScrollIfIdle);

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

  const rarityFor=(id)=>{
    if(['elo_1800','win_100','streak_20'].includes(id))return'legendary';
    if(['elo_1600','elo_1700','win_50','win_75','streak_10','streak_15','ranked_100','rep_48_20'].includes(id))return'epic';
    if(['elo_1400','elo_1500','win_20','win_30','streak_5','streak_7','match_100','ranked_50','rep_45_10'].includes(id))return'rare';
    return'common';
  };
  const make=(id,icon,name,desc,unlocked,group)=>({id,icon,name,desc,unlocked:!!unlocked,group,rarity:rarityFor(id)});
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

  const equippedFrameClass=frameClass(frameState?.equipped||'none');
  if(avatar){
    [...avatar.classList].filter(c=>c.startsWith('frame-')).forEach(c=>avatar.classList.remove(c));
    avatar.classList.add(equippedFrameClass,'equipped-avatar-frame');
  }

  const profileAvatar=$('#profileAvatar');
  const profileAvatarImg=$('#profileAvatarImg');
  const profileAvatarFallback=$('#profileAvatarFallback');
  if(profileAvatar&&profileAvatarImg&&profileAvatarFallback){
    [...profileAvatar.classList].filter(c=>c.startsWith('frame-')).forEach(c=>profileAvatar.classList.remove(c));
    profileAvatar.classList.add(equippedFrameClass,'equipped-avatar-frame');
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
  await loadExperienceSettings();
  populate();
  await Promise.all([loadRanking(),loadChallenges(),loadMatches(),loadHistory(),loadHomeDashboard(),loadHistoryPage(),loadLiveNotifications(),loadRecommendedRivals(),loadChampionsHall(),loadPersonalRecords()]);
}
async function loadApp(uid,p=null){
  profile=p||await getMyProfile(uid);
  ratings=await getMyRatings(uid);
  try{rankTiers=await getRankTiers()}catch(e){console.error(e);rankTiers=[]}
  await loadSocialState();
  await loadExperienceSettings();
  populate();
  showMain();
  startLiveNotificationStream();
  await Promise.all([loadRanking(),loadChallenges(),loadMatches(),loadHistory(),loadHomeDashboard(),loadHistoryPage(),loadLiveNotifications(),loadRecommendedRivals(),loadChampionsHall(),loadPersonalRecords()]);
}
async function route(){
  session=await getSession();
  if(!session?.user){showView('welcomeView');setStatus($('#globalStatus'),'Conectado a TT Rivals.','ok');return}
  const p=await getMyProfile(session.user.id);
  if(!p.profile_completed){showView('sportsProfileView');return}
  await loadApp(session.user.id,p);
}
function activateTab(tab){
  // V23: recupera el scroll si algún flujo anterior ocultó un modal sin limpiarlo.
  if(!$$('.modal').some(m=>!m.classList.contains('hidden')))lockPageScroll(false);
  $$('.tab-page').forEach(p=>p.classList.toggle('active',p.id===`tab-${tab}`));
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  window.scrollTo({top:0,behavior:'smooth'});
  if(tab==='ranking')loadRanking();
  if(tab==='play'){loadChallenges();loadMatches()}
  if(tab==='home')loadHomeDashboard();
  if(tab==='history')loadHistoryPage();
  if(tab==='stats')loadHistory();
  if(tab==='profile'){renderAchievements();renderPrimaryRival();renderProfileSeasonCards();renderEquippedTitle();renderIdentityShowcase();}
  if(tab==='tournaments'){loadTournamentList();loadTournamentHistoryV21();}
  if(tab==='settings'){populateSettingsUI();renderFrameGallery();}
  if(tab==='ranking')loadChampionsHall();
  if(tab==='stats'){loadPersonalRecords();renderComparativeStats();}
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

    renderRankingPodium(rows);
    const regularRows=rankingScope==='global'?rows.filter(x=>x.position>3):rows;
    list.innerHTML=regularRows.length?regularRows.map(x=>{
      const p=x.profile,m=`#${x.position}`;
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
      :rows.length?'<div class="compact-empty">El podio ocupa actualmente todo el ranking.</div>':'<div class="compact-empty">Sin jugadores.</div>');
  }catch(e){
    console.error(e);
    list.innerHTML='<div class="loading-row">No se pudo cargar.</div>';
  }
}


function renderRankingPodium(rows=[]){
  const section=$('#rankingPodiumSection'),box=$('#rankingPodium');
  if(!section||!box)return;
  if(rankingScope!=='global'){
    section.classList.add('hidden');
    return;
  }
  const top=rows.filter(x=>x.position<=3).sort((a,b)=>a.position-b.position);
  if(!top.length){
    section.classList.add('hidden');return;
  }
  section.classList.remove('hidden');
  const order=[2,1,3];
  box.innerHTML=order.map(pos=>{
    const x=top.find(r=>r.position===pos);
    if(!x)return `<div class="podium-slot empty"></div>`;
    const p=x.profile,rank=rankForRating(x.rating);
    return `<button class="podium-slot podium-${pos} ${p.id===session.user.id?'is-me':''}" data-open-player="${p.id}" type="button">
      <span class="podium-crown">${pos===1?'♛':pos===2?'♕':'♜'}</span>
      <div class="podium-avatar-wrap">${avatarHtml(p,'podium-avatar')}<b>${pos}</b></div>
      <strong>${esc(p.first_name)}</strong>
      <small>@${esc(p.username)}</small>
      <div class="podium-rating">${x.rating} <span>Elo</span></div>
      <em class="${rankCss(rank)}">${rank}</em>
    </button>`;
  }).join('');
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
  $$('[data-challenge-type]').forEach(b=>{
    const active=b.dataset.challengeType===clean;
    b.classList.toggle('active',active);
    b.setAttribute('aria-pressed',active?'true':'false');
  });
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
  $('#receivedChallenges').innerHTML=rec.length?rec.map(r=>chCard(r,'received')).join(''):'<div class="compact-empty">Sin desafíos recibidos</div>';
  $('#sentChallenges').innerHTML=sen.length?sen.map(r=>chCard(r,'sent')).join(''):'<div class="compact-empty">Sin desafíos enviados</div>';
  if($('#receivedChallengeCount'))$('#receivedChallengeCount').textContent=rec.length;
  if($('#sentChallengeCount'))$('#sentChallengeCount').textContent=sen.length;
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
async function loadMatches(){
  if(!session)return;
  try{
    const rows=await getMyMatches(session.user.id);
    const active=rows.filter(m=>m.result_status!=='confirmed');
    $('#activeMatches').innerHTML=active.length?active.map(matchCard).join(''):'<div class="compact-empty">No hay partidos pendientes</div>';
    if($('#activeMatchCount'))$('#activeMatchCount').textContent=active.length;
  }catch(e){
    console.error(e);
    $('#activeMatches').innerHTML='<div class="compact-empty">No se pudieron cargar los partidos.</div>';
  }
}

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
    $('#notificationBadge').classList.toggle('hidden',items.length===0);
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

async function renderCompetitivePulse(rankingRows){
  const title=$('#competitivePulseTitle'),badge=$('#competitivePulseBadge'),
        myPos=$('#pulseMyPosition'),label=$('#pulseTargetLabel'),
        name=$('#pulseTargetName'),detail=$('#pulseTargetDetail'),
        fill=$('#pulseTrackFill'),btn=$('#pulseChallengeButton');
  if(!title||!session?.user)return;

  competitivePulseTarget=null;
  const me=rankingRows.find(x=>x.profile?.id===session.user.id);
  if(!me){
    myPos.textContent='#—';label.textContent='Entrá al ranking con tu primer partido';
    name.textContent='Todavía sin posición';detail.textContent='Jugá un ranked para empezar.';
    fill.style.width='0%';btn.classList.add('hidden');return;
  }

  myPos.textContent=`#${me.position}`;

  const above=rankingRows.find(x=>x.position===me.position-1);
  const below=rankingRows.find(x=>x.position===me.position+1);
  const target=above||below;

  if(target){
    competitivePulseTarget=target.profile;
    const gap=Math.abs(Number(target.rating)-Number(me.rating));
    const chasing=target.position<me.position;
    title.textContent=chasing?'Subí un puesto':'Defendé tu lugar';
    badge.textContent=chasing?'A LA CAZA':'DEFENSA';
    label.textContent=chasing?`#${target.position} está a ${gap} Elo`:`#${target.position} está detrás tuyo`;
    name.textContent=`${target.profile.first_name} ${target.profile.last_name}`;
    detail.textContent=`@${target.profile.username} · ${target.rating} Elo`;
    const pct=Math.max(8,Math.min(100,100-gap/4));
    fill.style.width=`${pct}%`;
    btn.classList.remove('hidden');
    btn.textContent='Desafiar';
  }else{
    title.textContent=me.position===1?'Defendé la cima':'Seguí compitiendo';
    badge.textContent=me.position===1?'#1':'RANKING';
    label.textContent=me.position===1?'Sos el líder actual':'No hay un rival adyacente todavía';
    name.textContent=me.position===1?'Todos van por vos':'Seguí sumando partidos';
    detail.textContent=seasonState?`${seasonState.name||'Temporada actual'} en curso`:'Temporada activa';
    fill.style.width=me.position===1?'100%':'35%';
    btn.classList.add('hidden');
  }
}

function renderIdentityShowcase(){
  const box=$('#identityShowcaseCard');if(!box||!profile)return;
  const equippedFrame=frameState?.equipped||null;
  const title=(titleState?.items||[]).find(x=>x.id===titleState?.equipped);
  const showcase=(socialState?.achievements||[]).filter(a=>myShowcaseAchievementIds.includes(a.id)).slice(0,3);
  box.innerHTML=`
    <div class="identity-avatar ${frameClass(equippedFrame||'none')}">${avatarHtml(profile,'identity-avatar-img')}</div>
    <div class="identity-showcase-copy">
      <small>ASÍ TE VEN LOS DEMÁS</small>
      <strong>${esc(profile.first_name)} ${esc(profile.last_name)}</strong>
      <span>@${esc(profile.username)}</span>
      ${title?`<em class="public-equipped-title rarity-${title.rarity}">✦ ${esc(title.name)}</em>`:'<em class="identity-empty-title">Sin título equipado</em>'}
    </div>
    <div class="identity-showcase-achievements">
      ${showcase.length?showcase.map(a=>`<span title="${esc(a.name)}">${a.icon||'◆'} <b>${esc(a.name)}</b></span>`).join(''):'<span class="identity-no-achievements">Elegí hasta 3 logros destacados</span>'}
    </div>`;
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
    $('#homeObjectiveTitle').textContent=`¡Rumbo a ${info.next.name}!`;
    $('#homeObjectiveDetail').textContent=`Te faltan ${remaining} puntos de Elo para tu próximo ascenso.`;
    if($('#homeObjectiveProgress'))$('#homeObjectiveProgress').style.width=`${info.progress}%`;
    if($('#homeObjectiveReward'))$('#homeObjectiveReward').textContent=`RECOMPENSA · Marco ${info.next.name}`;
    if($('#homeObjectiveGlyph'))$('#homeObjectiveGlyph').textContent='✦';
  }else{
    $('#homeObjectiveTitle').textContent='Defendé tu lugar';
    $('#homeObjectiveDetail').textContent='Llegaste al rango máximo. Ahora peleá por la temporada.';
    if($('#homeObjectiveProgress'))$('#homeObjectiveProgress').style.width='100%';
    if($('#homeObjectiveReward'))$('#homeObjectiveReward').textContent='OBJETIVO · Mejor posición de temporada';
    if($('#homeObjectiveGlyph'))$('#homeObjectiveGlyph').textContent='♛';
  }

  if(seasonState){
    const start=new Date(seasonState.starts_at),end=new Date(seasonState.ends_at),now=new Date();
    const total=Math.max(1,end-start),elapsed=Math.max(0,Math.min(total,now-start));
    const day=Math.max(1,Math.min(90,Math.floor(elapsed/86400000)+1));
    const remaining=Math.max(0,Math.ceil((end-now)/86400000));
    if($('#homeSeasonName'))$('#homeSeasonName').textContent=String(seasonState.name||'Temporada').toUpperCase();
    if($('#homeSeasonPosition'))$('#homeSeasonPosition').textContent=seasonState.position?`#${seasonState.position}`:'#—';
    if($('#homeSeasonDay'))$('#homeSeasonDay').textContent=`Día ${day} de 90`;
    if($('#homeSeasonRemaining'))$('#homeSeasonRemaining').textContent=`${remaining} días restantes`;
    if($('#homeSeasonBar'))$('#homeSeasonBar').style.width=`${(elapsed/total)*100}%`;
    if($('#rankingSeasonName'))$('#rankingSeasonName').textContent=seasonState.name||'Temporada';
    if($('#rankingSeasonRemaining'))$('#rankingSeasonRemaining').textContent=`${remaining} días restantes · soft reset ${seasonState.soft_reset_percent||20}%`;
    if($('#rankingSeasonPosition'))$('#rankingSeasonPosition').textContent=seasonState.position?`#${seasonState.position}`:'#—';
  }

  try{
    const ranking=await getRanking('individual','');
    const me=ranking.find(x=>x.profile?.id===session.user.id);
    $('#homeRankPosition').textContent=me?`#${me.position} Ranking global`:'Ranking global: —';
    await renderCompetitivePulse(ranking);
  }catch(e){
    $('#homeRankPosition').textContent='Ranking global: —';
    await renderCompetitivePulse([]);
  }

  renderAchievements();
  renderIdentityShowcase();
}





function titleRarityLabel(r){
  return ({common:'Común',rare:'Raro',epic:'Épico',legendary:'Legendario',mythic:'Mítico'})[r]||'Común';
}
function renderEquippedTitle(){
  const box=$('#equippedTitleCard');if(!box)return;
  const t=(titleState.items||[]).find(x=>x.id===titleState.equipped);
  if(!t){box.innerHTML='<span class="title-none">Sin título equipado</span><small>Podés equipar uno desde Perfil competitivo.</small>';return}
  box.innerHTML=`<div class="title-emblem rarity-${t.rarity}">✦</div><div><span>${titleRarityLabel(t.rarity)}</span><strong>${esc(t.name)}</strong><small>${esc(t.description)}</small></div>`;
}
async function openTitleSelector(){
  $('#titleSelectorModal').classList.remove('hidden');syncModalScrollLock();
  const box=$('#titleSelectorList');box.innerHTML='<div class="loading-row">Cargando títulos…</div>';
  try{
    titleState=await getPlayerTitles(session.user.id);
    const items=[{id:'',name:'Sin título',description:'No mostrar ningún título bajo tu nombre.',rarity:'common',unlocked:true},...(titleState.items||[])];
    box.innerHTML=items.map(t=>{
      const active=(titleState.equipped||'')===t.id;
      return `<article class="title-choice ${t.unlocked?'unlocked':'locked'} ${active?'active':''}">
        <div class="title-emblem rarity-${t.rarity}">${t.unlocked?'✦':'🔒'}</div>
        <div><strong>${esc(t.name)}</strong><small>${esc(t.description)}</small><i>${titleRarityLabel(t.rarity)}</i></div>
        <button type="button" data-equip-title="${t.id}" ${t.unlocked?'':'disabled'}>${active?'Equipado ✓':t.unlocked?'Equipar':'Bloqueado'}</button>
      </article>`;
    }).join('');
  }catch(err){box.innerHTML='<div class="compact-empty">No se pudieron cargar los títulos.</div>'}
}
function renderComparativeStats(){
  const box=$('#comparativeStatsGrid');if(!box)return;
  const c=comparativeState||{};
  if($('#comparativePopulation'))$('#comparativePopulation').textContent=`${c.population||0} jugadores`;
  if(!c.rating){box.innerHTML='<div class="compact-empty">Todavía no hay suficientes datos para comparar.</div>';return}
  const wrDelta=Number(c.win_rate.value||0)-Number(c.win_rate.average||0);
  const ratingDelta=Number(c.rating.value||0)-Number(c.rating.average||0);
  box.innerHTML=`
    <article><span>Elo</span><strong>${c.rating.value}</strong><b>Top ${c.rating.top_percent}%</b><small>${ratingDelta>=0?'+':''}${Math.round(ratingDelta)} vs promedio</small></article>
    <article><span>Win rate</span><strong>${c.win_rate.value}%</strong><b>Percentil ${c.win_rate.percentile}</b><small>${wrDelta>=0?'+':''}${wrDelta.toFixed(1)} pts vs promedio</small></article>
    <article><span>Actividad</span><strong>${c.activity.matches}</strong><b>Percentil ${c.activity.percentile}</b><small>partidos ranked jugados</small></article>`;
}
async function loadTournamentHistoryV21(){
  const box=$('#tournamentHistoryList');if(!box)return;
  box.innerHTML='<div class="loading-row">Cargando ediciones…</div>';
  try{
    const rows=await getTournamentHistory(80);
    if(!rows.length){box.innerHTML='<div class="compact-empty">Todavía no hay torneos para mostrar.</div>';return}
    const groups={};
    rows.forEach(r=>{const key=r.normalized_series||r.tournament_name;(groups[key] ||= []).push(r)});
    box.innerHTML=Object.entries(groups).map(([series,list])=>{
      const ordered=[...list].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
      const base=ordered[0].tournament_name.replace(/\s*[·-]\s*(Nueva edición|Edición\s*\d+)\s*$/i,'');
      return `<article class="tournament-series-card">
        <div class="tournament-series-head"><div><span>SERIE</span><strong>${esc(base)}</strong></div><b>${ordered.length} ${ordered.length===1?'edición':'ediciones'}</b></div>
        <div class="tournament-editions">${ordered.map((t,i)=>`<button type="button" data-open-tournament-history="${t.tournament_id}">
          <span>Edición ${i+1}</span><strong>${t.status==='completed'?esc(t.champion_name||'Sin campeón'):'En curso'}</strong>
          <small>${t.participants} participantes · ${t.completed_games} partidos</small></button>`).join('')}</div>
      </article>`;
    }).join('');
  }catch(err){box.innerHTML='<div class="compact-empty">No se pudo cargar el historial de torneos.</div>'}
}

async function loadChampionsHall(){
  const box=$('#championsHall');if(!box)return;
  try{
    const rows=await getSeasonChampions(8);
    if(!rows.length){
      box.innerHTML='<div class="compact-empty">El Salón de Campeones se estrenará cuando finalice la primera temporada.</div>';
      return;
    }
    const seasons=[...new Set(rows.map(r=>r.season_number))];
    box.innerHTML=seasons.map(sn=>{
      const podium=rows.filter(r=>r.season_number===sn).sort((a,b)=>a.position-b.position);
      return `<article class="champion-season-card">
        <div class="champion-season-title"><span>TEMPORADA ${sn}</span><small>${podium[0]?.season_name||''}</small></div>
        <div class="champion-podium">
          ${podium.map(r=>`<button type="button" class="champion-place place-${r.position}" data-open-player="${r.user_id}">
            <span class="champion-crown">${r.position===1?'♛':r.position===2?'♕':'♜'}</span>
            ${avatarHtml(r,'champion-avatar')}
            <strong>${esc(r.first_name)} ${esc(r.last_name)}</strong>
            <small>#${r.position} · ${r.final_rating} Elo</small>
          </button>`).join('')}
        </div>
      </article>`;
    }).join('');
  }catch(err){
    console.error(err);box.innerHTML='<div class="compact-empty">No se pudo cargar el Salón de Campeones.</div>';
  }
}

function seasonCardHtml(s,label){
  if(!s)return `<article class="season-profile-card empty"><span>${label}</span><strong>Sin datos todavía</strong><small>Se completará al cerrar una temporada.</small></article>`;
  const wr=s.matches_played?Number(s.win_rate||0):0;
  return `<article class="season-profile-card">
    <span>${label}</span>
    <div class="season-profile-place"><strong>#${s.final_position||'—'}</strong><b>${esc(s.rank_name||'—')}</b></div>
    <div class="season-profile-stats">
      <small>Elo final <b>${s.final_rating}</b></small>
      <small>Máximo <b>${s.max_rating}</b></small>
      <small>Partidos <b>${s.matches_played}</b></small>
      <small>Victorias <b>${s.wins}</b></small>
      <small>Win rate <b>${wr}%</b></small>
    </div>
  </article>`;
}

async function renderProfileSeasonCards(){
  const box=$('#profileSeasonCards');if(!box||!session?.user)return;
  try{
    const s=await getPublicPlayerSeasons(session.user.id);
    box.innerHTML=seasonCardHtml(s.last_season,'ÚLTIMA TEMPORADA')+seasonCardHtml(s.best_season,'MEJOR TEMPORADA');
  }catch(err){box.innerHTML='<div class="compact-empty">No se pudieron cargar las temporadas.</div>'}
}

async function loadPersonalRecords(){
  const box=$('#personalRecordsGrid');if(!box||!session?.user)return;
  try{
    const rec=await getPlayerRecords(session.user.id);
    const pct=percentileState?.top_percent;
    if($('#statsComparativeLabel')){
      $('#statsComparativeLabel').textContent=pct?`Top ${pct}% por Elo`:'Comparativa pendiente';
    }
    const rival=rec.most_faced_rival;
    const upset=rec.biggest_upset;
    box.innerHTML=`
      <article><span>Elo máximo</span><strong>${rec.max_elo||1000}</strong><small>mejor rating histórico</small></article>
      <article><span>Mejor temporada</span><strong>${rec.best_season_position?`#${rec.best_season_position}`:'—'}</strong><small>posición final</small></article>
      <article><span>Torneos ganados</span><strong>${rec.tournaments_won||0}</strong><small>${rec.finals_played||0} finales jugadas</small></article>
      <article><span>Rival más enfrentado</span><strong>${rival?esc(rival.first_name):'—'}</strong><small>${rival?`${rival.matches} partidos · ${rival.wins} victorias`:'Sin suficientes partidos'}</small></article>
      <article class="record-wide"><span>Mayor sorpresa</span><strong>${upset?`+${upset.rating_gap} Elo de diferencia`:'—'}</strong><small>${upset?`Venciste a ${esc(upset.first_name)} ${esc(upset.last_name)} siendo ${upset.my_rating} vs ${upset.opponent_rating}`:'Todavía no venciste a un rival con Elo superior.'}</small></article>`;
  }catch(err){console.error(err);box.innerHTML='<div class="compact-empty">No se pudieron cargar los récords.</div>'}
}

async function loadActivityCenter(){
  const box=$('#activityCenterList');if(!box)return;
  box.innerHTML='<div class="loading-row">Actualizando actividad…</div>';
  try{
    const [challenges,matches,feed]=await Promise.all([
      getChallenges(session.user.id),
      getMyMatches(session.user.id),
      getFollowingFeed(12).catch(()=>[])
    ]);
    const items=[];
    if(seasonState){
      const end=new Date(seasonState.ends_at),remaining=Math.max(0,Math.ceil((end-new Date())/86400000));
      items.push({
        kind:'season',icon:'♛',
        title:`${seasonState.name||'Temporada actual'} · ${seasonState.position?`#${seasonState.position}`:'sin posición'}`,
        detail:`${remaining} días restantes`,
        action:`data-activity-tab="ranking"`
      });
    }
    if(userPreferences?.notify_challenges!==false)challenges.filter(c=>c.challenged_id===session.user.id&&c.status==='pending').forEach(c=>{
      items.push({kind:'challenge',icon:'⚔',title:`${c.challenger?.first_name||'Un jugador'} te desafió`,detail:`${matchTypeLabel(c.match_type)} · ${c.match_format==='bo5'?'Bo5':c.match_format==='bo3'?'Bo3':'1 set'}`,action:`data-activity-tab="play"`});
    });
    if(userPreferences?.notify_confirmations!==false)matches.filter(m=>m.result_status==='pending_confirmation'&&m.result_submitted_by!==session.user.id).forEach(m=>{
      const other=m.player1_id===session.user.id?m.player2:m.player1;
      items.push({kind:'confirmation',icon:'✓',title:'Resultado pendiente de confirmar',detail:`vs ${other?.first_name||'Jugador'} ${other?.last_name||''}`,action:`data-activity-tab="play"`});
    });
    if(userPreferences?.notify_following_activity!==false)feed.slice(0,8).forEach(f=>{
      items.push({kind:'following',icon:f.won?'↑':'↓',title:`${f.followed_first_name} ${f.followed_last_name} ${f.won?'ganó':'perdió'}`,detail:`${f.player_sets}-${f.opponent_sets} vs ${f.opponent_first_name} ${f.opponent_last_name}`,action:`data-open-player="${f.followed_user_id}"`});
    });
    box.innerHTML=items.length?items.map(i=>`<button class="activity-center-item activity-${i.kind}" ${i.action} type="button"><span>${i.icon}</span><div><strong>${esc(i.title)}</strong><small>${esc(i.detail)}</small></div><b>›</b></button>`).join(''):'<div class="activity-empty-state"><span>✓</span><strong>Todo al día</strong><small>No tenés acciones pendientes por ahora.</small></div>';
  }catch(err){box.innerHTML='<div class="compact-empty">No se pudo cargar la actividad.</div>'}
}

async function loadRecommendedRivals(){
  const box=$('#recommendedRivals');
  if(!box||!session?.user)return;
  try{
    const rows=await getRecommendedRivals(6);
    box.innerHTML=rows.length?rows.map(r=>{
      const h2h=r.h2h_total?`${r.h2h_me}–${r.h2h_them}`:'Sin enfrentamientos';
      return `<article class="recommended-rival-card">
        <button class="recommended-rival-profile" data-open-player="${r.user_id}" type="button">
          ${avatarHtml({first_name:r.first_name,last_name:r.last_name,profile_photo_url:r.profile_photo_url},'recommended-avatar')}
          <div><strong>${esc(r.first_name)} ${esc(r.last_name)}</strong><small>@${esc(r.username)} · ${r.rating} Elo</small></div>
        </button>
        <div class="recommended-rival-meta"><span>${r.rating_gap} Elo de diferencia</span><span>H2H ${h2h}</span></div>
        <button class="recommended-challenge" data-quick-challenge="${r.user_id}" data-name="${esc(r.first_name)} ${esc(r.last_name)}" data-user="${esc(r.username)}" type="button">Desafiar</button>
      </article>`;
    }).join(''):'<div class="compact-empty">No encontramos rivales recomendados todavía.</div>';
  }catch(err){
    console.error(err);
    box.innerHTML='<div class="compact-empty">No se pudieron cargar las recomendaciones.</div>';
  }
}

async function openSeasonHistoryModal(){
  $('#seasonHistoryModal').classList.remove('hidden');syncModalScrollLock();
  const box=$('#seasonHistoryList');
  box.innerHTML='<div class="loading-row">Cargando temporadas…</div>';
  try{
    const rows=await getSeasonHistory(20);
    box.innerHTML=rows.length?rows.map(s=>{
      const wr=s.matches_played?Math.round((s.wins/s.matches_played)*100):0;
      return `<article class="season-history-card">
        <div><small>TEMPORADA ${s.season_number}</small><strong>#${s.final_position||'—'}</strong></div>
        <div><span>Rango</span><b>${esc(s.rank_name)}</b></div>
        <div><span>Elo final</span><b>${s.final_rating}</b></div>
        <div><span>Elo máximo</span><b>${s.max_rating}</b></div>
        <div><span>Partidos</span><b>${s.matches_played}</b></div>
        <div><span>Victorias</span><b>${s.wins} · ${wr}%</b></div>
      </article>`;
    }).join(''):'<div class="compact-empty">Todavía no finalizaste ninguna temporada.</div>';
  }catch(err){box.innerHTML='<div class="compact-empty">No se pudo cargar el historial.</div>'}
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


function achievementVisualMeta(a){
  const id=String(a.id||'');
  const parts=id.split('_');
  let symbol='✦',value='',kind='special',detail='';

  if(id.startsWith('match_')){
    symbol='🏓'; value=parts[1]||''; kind='matches'; detail='PARTIDOS';
  }else if(id.startsWith('win_')){
    symbol='🏆'; value=parts[1]||''; kind='wins'; detail='VICTORIAS';
  }else if(id.startsWith('streak_')){
    symbol='🔥'; value=parts[1]||''; kind='streak'; detail='RACHA';
  }else if(id.startsWith('elo_')){
    symbol='◆'; value=parts[1]||''; kind='elo'; detail='ELO';
  }else if(id.startsWith('casual_')){
    symbol='●'; value=parts[1]||''; kind='casual'; detail='CASUAL';
  }else if(id.startsWith('ranked_')){
    symbol='♜'; value=parts[1]||''; kind='ranked'; detail='RANKED';
  }else if(id.startsWith('rep_')){
    symbol='★'; kind='reputation'; detail='REPUTACIÓN';
    if(id==='rep_1')value='1';
    else if(id==='rep_4_5')value='4.0';
    else if(id==='rep_45_10')value='4.5';
    else if(id==='rep_48_20')value='4.8';
  }else if(id.startsWith('follow_')){
    symbol='♧'; value=parts[1]||''; kind='social'; detail='RIVALES';
  }

  return {symbol,value,kind,detail};
}

function achievementEmblemHtml(a,compact=false){
  const v=achievementVisualMeta(a);
  return `<span class="achievement-illustration achievement-${v.kind} rarity-${a.rarity||'common'} ${compact?'compact':''}">
    <span class="achievement-illustration-halo"></span>
    <span class="achievement-illustration-symbol">${v.symbol}</span>
    ${v.value?`<b class="achievement-illustration-value">${esc(v.value)}</b>`:''}
    <small>${esc(v.detail)}</small>
    <i class="achievement-illustration-shine"></i>
  </span>`;
}

function achievementPlateHtml(a,{selected=false,clickable=true}={}){
  if(!a)return'';
  return `<button class="achievement-plate ${a.unlocked?'unlocked':'locked'} ${selected?'selected':''}" ${clickable?`data-achievement-info="${a.id}"`:'disabled'} type="button">
    <span class="achievement-plate-icon">${achievementEmblemHtml(a,true)}</span>
    <span class="achievement-plate-copy"><strong>${esc(a.name)}</strong><small>${esc(a.group)} · ${esc(a.rarity||'common')}</small></span>
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
        <span class="achievement-icon">${achievementEmblemHtml(a)}</span>
        <div><strong>${esc(a.name)}</strong><small>${esc(a.desc)}</small></div>
        <em class="achievement-rarity rarity-${a.rarity||'common'}">${String(a.rarity||'common').toUpperCase()}</em>
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
      <p class="muted-label">${esc(a.group)} · ${String(a.rarity||'common').toUpperCase()}</p>
      <h2>${esc(a.name)}</h2>
      <p>${esc(a.desc)}</p>
      <span class="achievement-detail-state ${a.unlocked?'unlocked':'locked'}">${a.unlocked?'DESBLOQUEADO':'BLOQUEADO'}</span>
    </div>`;
  $('#achievementInfoModal').classList.remove('hidden');syncModalScrollLock();
}

function openShowcaseSelector(){
  showcaseDraftIds=[...myShowcaseAchievementIds];
  renderShowcaseSelector();
  setStatus($('#showcaseStatus'),'');
  $('#showcaseAchievementModal').classList.remove('hidden');syncModalScrollLock();
}

function renderShowcaseSelector(){
  const rows=(socialState.achievements||[]).filter(a=>a.unlocked);
  $('#showcaseSelectorCount').textContent=`${showcaseDraftIds.length} / 3 seleccionados`;
  $('#showcaseSelectorList').innerHTML=rows.length?rows.map(a=>{
    const selected=showcaseDraftIds.includes(a.id);
    return `<button class="showcase-selector-item ${selected?'selected':''}" data-toggle-showcase="${a.id}" type="button">
      <span class="showcase-selector-emblem">${achievementEmblemHtml(a,true)}</span>
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

    const allConfirmed=(socialState.matches||[])
      .filter(m=>m.result_status==='confirmed')
      .sort((a,b)=>new Date(b.played_at||b.created_at)-new Date(a.played_at||a.created_at));

    const opponentQuery=($('#historyOpponentSearch')?.value||'').trim().toLowerCase();
    const matches=allConfirmed.filter(m=>{
      const other=m.player1_id===session.user.id?m.player2:m.player1;
      const source=String(m.source_type||m.origin||'').toLowerCase();
      const isTournament=source.includes('tournament')||m.tournament_match_id;
      const modeOk=historyModeFilter==='all'
        ||(historyModeFilter==='tournament'&&isTournament)
        ||(historyModeFilter==='ranked'&&!isTournament&&(m.match_type||'ranked')==='ranked')
        ||(historyModeFilter==='casual'&&!isTournament&&m.match_type==='casual');
      const isAbandon=m.completion_type==='abandonment';
      const won=m.winner_id===session.user.id;
      const result=isAbandon?'abandonment':won?'victory':'defeat';
      const resultOk=historyResultFilter==='all'||historyResultFilter===result;
      const name=`${other?.first_name||''} ${other?.last_name||''} ${other?.username||''}`.toLowerCase();
      return modeOk&&resultOk&&(!opponentQuery||name.includes(opponentQuery));
    });

    const ratingByMatch=new Map((socialState.ratingHistory||[]).map(r=>[Number(r.match_id),r]));
    const reviewByMatch=new Map((socialState.reviewsAuthored||[]).map(r=>[Number(r.match_id),r]));

    let wins=0,losses=0,abandons=0;
    for(const m of allConfirmed){
      if(m.completion_type==='abandonment')abandons++;
      else if(m.winner_id===session.user.id)wins++;
      else losses++;
    }

    $('#historyMatchesCount').textContent=allConfirmed.length;
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
          <button type="button" data-match-detail="${m.id}">Ver partido</button>
          <button type="button" data-open-player="${other?.id}">Ver perfil</button>
        </div>
      </article>`;
    }).join(''):'<div class="history-empty"><strong>Todavía no hay partidos confirmados.</strong><span>Cuando termines tu primer partido aparecerá acá.</span></div>';
  }catch(err){
    console.error(err);
    $('#matchHistoryList').innerHTML='<div class="loading-row">No se pudo cargar el historial.</div>';
  }
}


async function openMatchDetail(matchId){
  const m=(socialState.matches||[]).find(x=>Number(x.id)===Number(matchId));
  if(!m)return;
  const other=m.player1_id===session.user.id?m.player2:m.player1;
  const rh=(socialState.ratingHistory||[]).find(r=>Number(r.match_id)===Number(matchId));
  const won=m.winner_id===session.user.id;
  const mySets=m.player1_id===session.user.id?m.player1_sets:m.player2_sets;
  const otherSets=m.player1_id===session.user.id?m.player2_sets:m.player1_sets;
  let setRows='';
  try{
    const {data}=await supabase.from('match_sets').select('*').eq('match_id',matchId).order('set_number');
    setRows=(data||[]).map(s=>{
      const mine=m.player1_id===session.user.id?s.player1_points:s.player2_points;
      const theirs=m.player1_id===session.user.id?s.player2_points:s.player1_points;
      return `<div class="match-detail-set"><span>Set ${s.set_number}</span><strong>${mine}–${theirs}</strong></div>`;
    }).join('');
  }catch(e){}
  $('#matchDetailContent').innerHTML=`
    <div class="match-detail-head ${won?'victory':'defeat'}">
      <p class="muted-label">${won?'VICTORIA':'DERROTA'}</p>
      <h2>${mySets||0} – ${otherSets||0}</h2>
      <span>vs ${esc(other?.first_name||'Jugador')} ${esc(other?.last_name||'')}</span>
    </div>
    <div class="match-detail-meta">
      <span>${matchTypeLabel(m.match_type)}</span>
      <span>${m.match_format==='bo5'?'Bo5':m.match_format==='bo3'?'Bo3':'1 set'}</span>
      <span>${formatMatchDate(m)}</span>
    </div>
    <div class="match-detail-sets">${setRows||'<div class="compact-empty">Sets no disponibles</div>'}</div>
    ${rh?`<div class="match-detail-elo">
      <div><span>Elo antes</span><strong>${rh.previous_rating}</strong></div>
      <div><span>Cambio</span><strong class="${Number(rh.rating_change)>=0?'positive':'negative'}">${Number(rh.rating_change)>=0?'+':''}${rh.rating_change}</strong></div>
      <div><span>Elo después</span><strong>${rh.new_rating}</strong></div>
    </div>`:''}
    <button class="btn btn-start" data-rematch="${m.id}" type="button">REVANCHA</button>`;
  $('#matchDetailModal').classList.remove('hidden');syncModalScrollLock();
}

async function showPostMatch({matchId,won,oldRating,newRating,opponentName='Rival'}){
  let summary=null;
  try{if(matchId)summary=await getPostMatchSummary(matchId)}catch(e){console.error(e)}
  const delta=summary?.rating_change ?? (newRating-oldRating);
  const current=summary?.current_rating ?? newRating;
  const previous=summary?.previous_rating ?? oldRating;
  const rank=summary?.current_rank||rankForRating(current);
  const toNext=summary?.to_next_rank;
  const nextRank=summary?.next_rank;
  const pos=summary?.position;
  const newBest=summary?.is_new_best;
  $('#postMatchContent').innerHTML=`
    <div class="post-match-result ${won?'victory':'defeat'}">
      <span>${won?'VICTORIA':'PARTIDO CONFIRMADO'}</span>
      <h2>${delta>=0?'+':''}${delta} Elo</h2><p>${previous} → <strong>${current}</strong></p>
    </div>
    <div class="post-match-progress-grid">
      <article><span>Rango</span><strong>${esc(rank)}</strong><small>${nextRank?`${toNext} Elo para ${esc(nextRank)}`:'Rango máximo'}</small></article>
      <article><span>Ranking</span><strong>${pos?`#${pos}`:'—'}</strong><small>posición actual</small></article>
      <article><span>Marca personal</span><strong>${newBest?'NUEVO RÉCORD':'En progreso'}</strong><small>${summary?.best_rating||current} Elo máximo</small></article>
    </div>
    ${newBest?`<div class="post-new-record"><span>✦</span><div><strong>Nuevo máximo histórico</strong><small>Acabás de elevar tu mejor Elo personal.</small></div></div>`:''}
    <div class="post-match-actions"><button class="btn btn-start" type="button" data-close-post-match>CONTINUAR</button></div>`;
  $('#postMatchModal').classList.remove('hidden');syncModalScrollLock();
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
  $('#reviewModal').classList.remove('hidden');syncModalScrollLock();
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
  modal.classList.remove('hidden');syncModalScrollLock();
  const box=$('#publicPlayerProfileContent');
  box.innerHTML='<div class="loading-row">Cargando perfil…</div>';

  try{
    const [p,showcaseIds,publicPrefs,cosmetics,seasons,records,h2hAdvanced,publicTitles]=await Promise.all([
      getPublicPlayerCard(userId),
      getShowcaseAchievements(userId).catch(()=>[]),
      getPublicProfilePreferences(userId).catch(()=>({})),
      getPublicProfilePreferences(userId).catch(()=>({})),
      getPublicPlayerSeasons(userId).catch(()=>({})),
      getPlayerRecords(userId).catch(()=>({})),
      userId===session.user.id?Promise.resolve(null):getH2HAdvanced(userId).catch(()=>null),
      getPlayerTitles(userId).catch(()=>({equipped:null,items:[]}))
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
          <div class="public-avatar-frame ${frameClass((cosmetics||publicPrefs)?.equipped_frame_id||'none')}">${avatarHtml(p,'public-profile-avatar-v17')}</div>
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
          ${publicPrefs?.show_playing_style===false?'':`<div><span>Estilo</span><strong>${esc(cap(p.playing_style))}</strong></div>`}
          ${publicPrefs?.show_dominant_hand===false?'':`<div><span>Mano hábil</span><strong>${esc(cap(p.dominant_hand))}</strong></div>`}
          ${publicPrefs?.show_club===false?'':`<div><span>Club</span><strong>${esc(p.club_name||'N/A')}</strong></div>`}
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

        <section class="public-seasons-v20">
          <div class="public-showcase-head"><p class="muted-label">TEMPORADAS</p><span>${seasons?.championships||0} campeonatos · ${seasons?.podiums||0} podios</span></div>
          <div class="public-season-grid">
            ${seasonCardHtml(seasons?.last_season,'ÚLTIMA TEMPORADA')}
            ${seasonCardHtml(seasons?.best_season,'MEJOR TEMPORADA')}
          </div>
        </section>

        <section class="public-records-v20">
          <p class="muted-label">RÉCORDS</p>
          <div class="public-records-grid-v20">
            <div><span>Elo máximo</span><strong>${records?.max_elo||p.max_elo}</strong></div>
            <div><span>Mejor temporada</span><strong>${records?.best_season_position?`#${records.best_season_position}`:'—'}</strong></div>
            <div><span>Torneos ganados</span><strong>${records?.tournaments_won||0}</strong></div>
            <div><span>Finales</span><strong>${records?.finals_played||0}</strong></div>
          </div>
        </section>

        ${!isMe?`
          <section class="public-h2h-v20">
            <div class="public-h2h-title"><p class="muted-label">CARA A CARA</p><span>${h2hAdvanced?.total||0} enfrentamientos</span></div>
            <div class="h2h-scoreboard">
              <strong>Vos <b>${h2hAdvanced?.me_wins||0}</b></strong>
              <div><span>SETS</span><b>${h2hAdvanced?.me_sets||0} – ${h2hAdvanced?.them_sets||0}</b></div>
              <strong><b>${h2hAdvanced?.them_wins||0}</b> ${esc(p.first_name)}</strong>
            </div>
            <div class="h2h-details">
              <span>Tu mejor racha <b>${h2hAdvanced?.best_streak||0}</b></span>
              <span>Elo neto <b class="${Number(h2hAdvanced?.net_elo||0)>=0?'positive':'negative'}">${Number(h2hAdvanced?.net_elo||0)>=0?'+':''}${h2hAdvanced?.net_elo||0}</b></span>
            </div>
            <div class="h2h-recent">
              ${(h2hAdvanced?.recent||[]).length?(h2hAdvanced.recent||[]).map(x=>`<span class="${x.won?'win':'loss'}" title="${x.me_sets}-${x.them_sets}">${x.won?'V':'D'}</span>`).join(''):'<small>Todavía no jugaron entre ustedes.</small>'}
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

function openMatchModal(matchId,matches=[]){
  const id=Number(matchId);
  const m=(matches||[]).find(x=>Number(x.id)===id);
  if(!m){
    alert('No se pudo abrir este partido. Actualizá la pantalla e intentá nuevamente.');
    return;
  }
  if(m.result_status!=='pending'){
    alert('Este partido ya no está pendiente de resultado.');
    loadMatches();
    return;
  }

  currentMatch=m;
  const p1=m.player1,p2=m.player2;
  const best=m.match_format==='bo5'?5:m.match_format==='bo3'?3:1;
  const need=Math.floor(best/2)+1;
  $('#matchModalTitle').textContent=`${p1?.first_name||'Jugador 1'} ${p1?.last_name||''} vs ${p2?.first_name||'Jugador 2'} ${p2?.last_name||''}`;
  $('#matchModalFormat').textContent=`${best===1?'1 set':`Mejor de ${best}`} · ${matchTypeLabel(m.match_type)} · primero en ganar ${need} ${need===1?'set':'sets'}`;

  $('#setInputs').innerHTML=Array.from({length:best},(_,i)=>`
    <div class="set-row result-set-row">
      <strong>Set ${i+1}</strong>
      <label>${esc(p1?.first_name||'P1')}<input type="number" min="0" max="99" inputmode="numeric" data-p1-set="${i+1}"></label>
      <label>${esc(p2?.first_name||'P2')}<input type="number" min="0" max="99" inputmode="numeric" data-p2-set="${i+1}"></label>
      ${best>1?`<label class="unplayed-toggle"><input type="checkbox" data-unplayed-set="${i+1}"><span>Set no jugado</span></label>`:''}
    </div>`).join('');

  setStatus($('#matchResultStatus'),'');
  $('#matchModal').classList.remove('hidden');
  syncModalScrollLock();

  // Facilita cargar el resultado inmediatamente en móvil/PC.
  requestAnimationFrame(()=>$('#setInputs input[type="number"]')?.focus());
}

function closeMatchModal(){currentMatch=null;$('#matchModal').classList.add('hidden');syncModalScrollLock()}

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
  await renderTournamentSummaryV20();
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

async function renderTournamentSummaryV20(){
  const box=$('#tournamentSummaryV20');if(!box||!selectedTournament)return;
  if(selectedTournament.status!=='completed'){box.classList.add('hidden');return}
  try{
    const s=await getTournamentSummary(selectedTournament.id);
    box.classList.remove('hidden');
    box.innerHTML=`<div class="tournament-summary-head"><p class="muted-label">RESUMEN DEL TORNEO</p><strong>${esc(s.champion||'Campeón')}</strong></div>
      <div class="tournament-summary-grid">
        <article><span>Partidos</span><strong>${s.games_played||0}</strong></article>
        <article><span>Sets</span><strong>${s.sets_played||0}</strong></article>
        <article><span>Finalista</span><strong>${esc(s.runner_up||'—')}</strong></article>
        <article><span>Jugador destacado</span><strong>${esc(s.mvp?.name||'—')}</strong><small>${s.mvp?`${s.mvp.wins} victorias · dif. sets ${Number(s.mvp.set_diff)>=0?'+':''}${s.mvp.set_diff}`:''}</small></article>
      </div>
      ${s.closest_match?`<div class="closest-tournament-match"><span>PARTIDO MÁS AJUSTADO</span><strong>${esc(s.closest_match.player1)} ${s.closest_match.sets1}–${s.closest_match.sets2} ${esc(s.closest_match.player2)}</strong><small>${tournamentStageLabel(s.closest_match.stage)}</small></div>`:''}`;
  }catch(err){console.error(err);box.classList.add('hidden')}
}

async function duplicateSelectedTournament(){
  if(!selectedTournament)return;
  try{
    const profiles=await getTournamentParticipantProfilesV8(selectedTournament.id);
    tournamentDraft={
      modality:selectedTournament.modality,
      preset:selectedTournament.preset,
      selectedUsers:profiles.map(p=>({id:p.id,first_name:p.first_name,last_name:p.last_name,username:p.username}))
    };
    $('#tournamentDetail').classList.add('hidden');
    $('#tournamentModeChooser').classList.add('hidden');
    $('#tournamentPresetChooser').classList.add('hidden');
    $('#tournamentBuilder').classList.remove('hidden');
    $('#tournamentBuilderTitle').textContent=`Duplicar · ${selectedTournament.name}`;
    $('#tournamentName').value=`${selectedTournament.name} · Nueva edición`;
    $('#tournamentStartStage').value=selectedTournament.start_stage;
    updateGroupOptions();
    if(selectedTournament.group_count)$('#tournamentGroupCount').value=selectedTournament.group_count;
    if(selectedTournament.qualifiers_per_group)$('#tournamentQualifiers').value=selectedTournament.qualifiers_per_group;
    if(selectedTournament.after_groups_stage)$('#tournamentAfterGroupsStage').value=selectedTournament.after_groups_stage;
    $('#customSetOptions').classList.toggle('hidden',selectedTournament.preset!=='custom');
    if(selectedTournament.preset==='custom'&&selectedTournament.stage_sets){
      $$('[data-custom-stage]').forEach(el=>{
        if(selectedTournament.stage_sets[el.dataset.customStage])el.value=selectedTournament.stage_sets[el.dataset.customStage];
      });
    }
    renderSelectedTournamentPlayers();
    $('#tournamentBuilder').scrollIntoView({behavior:'smooth',block:'start'});
  }catch(err){alert('No se pudo duplicar el torneo: '+err.message)}
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

$$('[data-challenge-type]').forEach(b=>b.addEventListener('click',e=>{
  e.preventDefault();
  setChallengeType(b.dataset.challengeType);
}));

$('#settingsButton').onclick=()=>activateTab('settings');

$$('[data-settings-toggle]').forEach(b=>b.onclick=()=>{
  const key=b.dataset.settingsToggle;
  const group=b.closest('.settings-group');
  const content=$(`[data-settings-content="${key}"]`);
  const open=!content.classList.contains('hidden');
  $$('.settings-group-content').forEach(x=>x.classList.add('hidden'));
  $$('.settings-group').forEach(x=>x.classList.remove('open'));
  if(!open){content.classList.remove('hidden');group.classList.add('open')}
});

$$('[data-theme-choice]').forEach(b=>b.onclick=async()=>{
  const theme=b.dataset.themeChoice;
  applyTheme(theme);
  await savePreferencePatch({theme});
});

const preferenceBindings=[
  ['#prefDefaultMatchType','default_match_type','value'],
  ['#prefDefaultMatchFormat','default_match_format','value'],
  ['#prefConfirmChallenge','confirm_before_challenge','checked'],
  ['#prefNotifyChallenges','notify_challenges','checked'],
  ['#prefNotifyConfirmations','notify_confirmations','checked'],
  ['#prefNotifyAchievements','notify_achievements','checked'],
  ['#prefNotifyRankUp','notify_rank_up','checked'],
  ['#prefNotifyFollowing','notify_following_activity','checked'],
  ['#prefNotifyTournaments','notify_tournaments','checked'],
  ['#prefNotifyFollowers','notify_followers','checked'],
  ['#prefShowClub','show_club','checked'],
  ['#prefShowStyle','show_playing_style','checked'],
  ['#prefShowHand','show_dominant_hand','checked'],
  ['#prefShowFollows','show_follow_counts','checked'],
  ['#prefShowReputation','show_reputation','checked']
];
preferenceBindings.forEach(([sel,key,kind])=>{
  const el=$(sel);if(!el)return;
  el.onchange=()=>savePreferencePatch({[key]:kind==='checked'?el.checked:el.value});
});

$('#settingsChooseAchievements').onclick=openShowcaseSelector;

$('#competitiveProfileSettingsForm').onsubmit=async e=>{
  e.preventDefault();
  const status=$('#competitiveProfileSettingsStatus');
  const payload={
    first_name:$('#prefProfileFirstName').value.trim(),
    last_name:$('#prefProfileLastName').value.trim(),
    username:$('#prefProfileUsername').value.trim().replace(/^@/,''),
    birth_date:$('#prefProfileBirthDate').value||null,
    club_name:$('#prefProfileClub').value.trim()||'N/A',
    playing_style:$('#prefProfileStyle').value,
    dominant_hand:$('#prefProfileHand').value,
    updated_at:new Date().toISOString()
  };
  if(!payload.first_name||!payload.last_name||!payload.username){
    return setStatus(status,'Nombre, apellido y usuario son obligatorios.','error');
  }
  try{
    setStatus(status,'Guardando…');
    const {data,error}=await supabase.from('profiles').update(payload).eq('id',session.user.id).select().single();
    if(error)throw error;
    profile=data;
    populate();
    populateSettingsUI();
    setStatus(status,'Perfil competitivo actualizado.','ok');
  }catch(err){
    const msg=String(err?.message||'');
    setStatus(status,msg.toLowerCase().includes('duplicate')?'Ese @usuario ya está en uso.':msg,'error');
  }
};

$('#changeEmailForm').onsubmit=async e=>{
  e.preventDefault();
  const status=$('#accountSettingsStatus');
  const email=$('#newAccountEmail').value.trim();
  try{
    setStatus(status,'Solicitando cambio de correo…');
    const {data,error}=await supabase.auth.updateUser({email});
    if(error)throw error;
    $('#newAccountEmail').value='';
    if(data?.user?.email)session.user.email=data.user.email;
    if($('#settingsAccountEmail'))$('#settingsAccountEmail').textContent=data?.user?.email||email;
    setStatus(status,'Cambio solicitado. Revisá el correo nuevo si Supabase requiere confirmación.','ok');
  }catch(err){setStatus(status,err.message,'error')}
};

$('#changePasswordForm').onsubmit=async e=>{
  e.preventDefault();
  const status=$('#accountSettingsStatus');
  const pass=$('#newAccountPassword').value;
  const confirmPass=$('#confirmAccountPassword').value;
  if(pass.length<8)return setStatus(status,'Usá una contraseña de al menos 8 caracteres.','error');
  if(pass!==confirmPass)return setStatus(status,'Las contraseñas no coinciden.','error');
  try{
    setStatus(status,'Actualizando contraseña…');
    const {error}=await supabase.auth.updateUser({password:pass});
    if(error)throw error;
    e.currentTarget.reset();
    setStatus(status,'Contraseña actualizada correctamente.','ok');
  }catch(err){setStatus(status,err.message,'error')}
};

$('#deleteAccountButton').onclick=async()=>{
  const first=confirm('Vas a eliminar permanentemente tu cuenta TT Rivals y los datos asociados. ¿Querés continuar?');
  if(!first)return;
  const typed=prompt('Para confirmar, escribí ELIMINAR');
  if(typed!=='ELIMINAR')return alert('Eliminación cancelada.');
  const status=$('#accountSettingsStatus');
  try{
    setStatus(status,'Eliminando cuenta…');
    const {error}=await supabase.rpc('delete_my_tt_rivals_account');
    if(error)throw error;
    try{await supabase.auth.signOut()}catch(e){}
    session=null;profile=null;ratings=[];
    showView('welcomeView');
    alert('Tu cuenta fue eliminada.');
  }catch(err){
    setStatus(status,err.message,'error');
  }
};

$('#settingsLogoutButton').onclick=async()=>{stopLiveNotificationStream();await signOutUser();session=null;profile=null;ratings=[];showView('welcomeView')};

$$('[data-ranking-mode]').forEach(b=>b.onclick=()=>{rankingMode=b.dataset.rankingMode;$$('[data-ranking-mode]').forEach(x=>x.classList.toggle('active',x===b));loadRanking()});
$$('[data-ranking-scope]').forEach(b=>b.onclick=()=>{
  rankingScope=b.dataset.rankingScope;
  $$('[data-ranking-scope]').forEach(x=>x.classList.toggle('active',x===b));
  loadRanking();
});

let rt;$('#rankingSearch').oninput=()=>{clearTimeout(rt);rt=setTimeout(loadRanking,220)};
let pt;$('#challengePlayerSearch').oninput=()=>{clearTimeout(pt);pt=setTimeout(playerSearch,220)};

$$('[data-history-mode]').forEach(b=>b.onclick=()=>{
  historyModeFilter=b.dataset.historyMode;
  $$('[data-history-mode]').forEach(x=>x.classList.toggle('active',x===b));
  loadHistoryPage();
});
$$('[data-history-result]').forEach(b=>b.onclick=()=>{
  historyResultFilter=b.dataset.historyResult;
  $$('[data-history-result]').forEach(x=>x.classList.toggle('active',x===b));
  loadHistoryPage();
});
let historySearchTimer;
$('#historyOpponentSearch').oninput=()=>{clearTimeout(historySearchTimer);historySearchTimer=setTimeout(loadHistoryPage,180)};

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
    setChallengeType(userPreferences?.default_match_type==='casual'?'casual':'ranked');
    clearRival();
    await loadChallenges();
  }catch(err){
    if(statusEl) setStatus(statusEl,err.message,'error');
    else alert(err.message);
  }
};

document.addEventListener('click',async e=>{
  const resp=e.target.closest('[data-response]');if(resp){try{await respondToChallenge(Number(resp.dataset.id),resp.dataset.response);await Promise.all([loadChallenges(),loadMatches(),loadLiveNotifications()]);recoverPageScrollIfIdle()}catch(err){alert(err.message)}return}
  const cancel=e.target.closest('[data-cancel-challenge]');if(cancel){try{await cancelChallenge(Number(cancel.dataset.cancelChallenge));await loadChallenges();recoverPageScrollIfIdle()}catch(err){alert(err.message)}return}
  const result=e.target.closest('[data-enter-result]');
  if(result){
    try{
      result.disabled=true;
      await refreshMatchesCache();
      openMatchModal(result.dataset.enterResult,cachedMatches);
    }catch(err){
      console.error(err);
      alert('No se pudo abrir el registro de resultado: '+(err?.message||'error desconocido'));
    }finally{
      result.disabled=false;
    }
    return;
  }
  const confirm=e.target.closest('[data-confirm-match]');if(confirm){
    const matchId=Number(confirm.dataset.confirmMatch);
    try{
      const before=getRating('individual').rating;
      const target=(socialState.matches||[]).find(x=>Number(x.id)===matchId);
      const won=target?.winner_id===session.user.id;
      await confirmMatchResult(matchId);
      await refreshCore();
      const after=getRating('individual').rating;
      showPostMatch({matchId,won,oldRating:before,newRating:after});
      openReviewModal(matchId);
      setTimeout(syncModalScrollLock,0);
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
  try{await submitMatchResult(currentMatch.id,sets);closeMatchModal();await loadMatches();recoverPageScrollIfIdle()}catch(err){setStatus($('#matchResultStatus'),err.message,'error')}
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

  const titleBtn=e.target.closest('[data-equip-title]');
  if(titleBtn){
    titleBtn.disabled=true;
    try{
      await equipCompetitiveTitle(titleBtn.dataset.equipTitle||null);
      titleState=await getPlayerTitles(session.user.id);
      renderEquippedTitle();
      renderIdentityShowcase();
      await openTitleSelector();
    }catch(err){alert(err.message)}
    return;
  }

  const histTournament=e.target.closest('[data-open-tournament-history]');
  if(histTournament){
    await openTournament(Number(histTournament.dataset.openTournamentHistory));
    return;
  }

  const pulseChallenge=e.target.closest('#pulseChallengeButton');
  if(pulseChallenge&&competitivePulseTarget){
    const p=competitivePulseTarget;
    selectedRival={id:p.id,name:`${p.first_name} ${p.last_name}`,user:p.username};
    activateTab('play');
    $('#challengeComposer').classList.remove('hidden');
    $('#selectedRivalName').textContent=selectedRival.name;
    $('#selectedRivalUsername').textContent=`@${selectedRival.user}`;
    const pref=userPreferences?.default_match_type||'ask';
    setChallengeType(pref==='casual'?'casual':'ranked');
    if(userPreferences?.default_match_format)$('#challengeFormat').value=userPreferences.default_match_format;
    return;
  }

  const quick=e.target.closest('[data-quick-challenge]');
  if(quick){
    selectedRival={id:quick.dataset.quickChallenge,first_name:quick.dataset.name?.split(' ')[0]||'',last_name:quick.dataset.name?.split(' ').slice(1).join(' ')||'',username:quick.dataset.user||''};
    activateTab('play');
    $('#challengeComposer').classList.remove('hidden');
    $('#selectedRivalName').textContent=quick.dataset.name||'Jugador';
    $('#selectedRivalUsername').textContent=`@${quick.dataset.user||''}`;
    const pref=userPreferences?.default_match_type||'ask';
    setChallengeType(pref==='casual'?'casual':'ranked');
    if(userPreferences?.default_match_format)$('#challengeFormat').value=userPreferences.default_match_format;
    return;
  }

  const frameBtn=e.target.closest('[data-equip-frame]');
  if(frameBtn){
    frameBtn.disabled=true;
    try{
      await equipFrame(frameBtn.dataset.equipFrame);
      frameState=await getFrames(session.user.id);
      renderFrameGallery();
      setStatus($('#settingsStatus'),'Marco actualizado.','ok');
    }catch(err){setStatus($('#settingsStatus'),err.message,'error')}
    return;
  }

  const detail=e.target.closest('[data-match-detail]');
  if(detail){await openMatchDetail(Number(detail.dataset.matchDetail));return;}

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
    // V23: cerrar el modal por el flujo oficial antes de navegar.
    // En V22 se ocultaba visualmente, pero quedaba body.modal-open activo,
    // dejando el scroll bloqueado en otras interfaces móviles.
    const target={
      id:publicChallenge.dataset.publicChallenge,
      name:publicChallenge.dataset.name,
      user:publicChallenge.dataset.user
    };
    closePlayerProfileModal();
    selectedRival=target;
    activateTab('play');
    $('#selectedRivalName').textContent=selectedRival.name;
    $('#selectedRivalUsername').textContent=`@${selectedRival.user}`;
    $('#challengeComposer').classList.remove('hidden');
    // Garantía extra: si no queda ningún modal visible, liberar body.
    syncModalScrollLock();
    return;
  }
});

$$('#reviewStars [data-review-star]').forEach(b=>b.onclick=()=>{
  selectedReviewStars=Number(b.dataset.reviewStar);
  paintReviewStars();
});
$('#saveReviewButton').onclick=saveCurrentReview;
$('#closeReviewModal').onclick=()=>{$('#reviewModal').classList.add('hidden');syncModalScrollLock();recoverPageScrollIfIdle()};
function closePlayerProfileModal(){
  $('#playerProfileModal').classList.add('hidden');
  $('#publicPlayerProfileContent').innerHTML='';
  syncModalScrollLock();
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
    $('#achievementInfoModal').classList.add('hidden');syncModalScrollLock();
    return;
  }
  if(e.target.closest('[data-close-showcase-selector]')){
    $('#showcaseAchievementModal').classList.add('hidden');syncModalScrollLock();
    return;
  }
});

$('#achievementInfoModal').addEventListener('click',e=>{
  if(e.target===$('#achievementInfoModal'))$('#achievementInfoModal').classList.add('hidden');syncModalScrollLock();
});
$('#showcaseAchievementModal').addEventListener('click',e=>{
  if(e.target===$('#showcaseAchievementModal'))$('#showcaseAchievementModal').classList.add('hidden');syncModalScrollLock();
});



$('#profileChooseTitle').onclick=openTitleSelector;
$('#settingsChooseTitle').onclick=openTitleSelector;
$('#closeTitleSelector').onclick=()=>{$('#titleSelectorModal').classList.add('hidden');syncModalScrollLock()};
$('#titleSelectorModal').addEventListener('click',e=>{if(e.target===$('#titleSelectorModal')){$('#titleSelectorModal').classList.add('hidden');syncModalScrollLock()}});
$('#refreshTournamentHistory').onclick=loadTournamentHistoryV21;
$('#profileOpenSeasonHistory').onclick=openSeasonHistoryModal;
$('#duplicateTournamentButton').onclick=duplicateSelectedTournament;
$('#closeActivityCenter').onclick=()=>{$('#activityCenterModal').classList.add('hidden');syncModalScrollLock()};
$('#activityCenterModal').addEventListener('click',e=>{if(e.target===$('#activityCenterModal')){$('#activityCenterModal').classList.add('hidden');syncModalScrollLock()}});
document.addEventListener('click',e=>{
  const activityTab=e.target.closest('[data-activity-tab]');
  if(activityTab){
    $('#activityCenterModal').classList.add('hidden');syncModalScrollLock();
    activateTab(activityTab.dataset.activityTab);
  }
});
$('#openSeasonHistory').onclick=openSeasonHistoryModal;
$('#closeSeasonHistory').onclick=()=>{$('#seasonHistoryModal').classList.add('hidden');syncModalScrollLock()};
$('#closeMatchDetail').onclick=()=>{$('#matchDetailModal').classList.add('hidden');syncModalScrollLock()};
$('#closePostMatch').onclick=()=>{$('#postMatchModal').classList.add('hidden');syncModalScrollLock()};
document.addEventListener('click',e=>{
  if(e.target.closest('[data-close-post-match]')){$('#postMatchModal').classList.add('hidden');syncModalScrollLock()}
});
['seasonHistoryModal','matchDetailModal','postMatchModal'].forEach(id=>{
  const m=$('#'+id);if(m)m.addEventListener('click',e=>{if(e.target===m){m.classList.add('hidden');syncModalScrollLock()}});
});
$('#openRankTableHome').onclick=openRankTable;
$('#openRankTableProfile').onclick=openRankTable;
$('#closeRankTableModal').onclick=closeRankTable;

$('#notificationButton').onclick=async()=>{
  $('#activityCenterModal').classList.remove('hidden');
  syncModalScrollLock();
  await loadActivityCenter();
};
$('#logoutButton').onclick=async()=>{stopLiveNotificationStream();await signOutUser();session=null;profile=null;ratings=[];showView('welcomeView')};

(async()=>{try{await route()}catch(e){console.error(e);showView('welcomeView');setStatus($('#globalStatus'),'Hubo un problema al cargar la app.','error')}})();

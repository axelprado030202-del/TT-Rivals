import { supabase } from './supabase.js';
import {getSession,signUpUser,signInUser,signOutUser,requestPasswordReset,updateRecoveredPassword} from './auth.js';
import {getMyProfile,getMyRatings,completeSportsProfile,getClubsV47,ensureClubV47,getClubsV49,getClubsV50,getClubsV51,suggestClubsV49,suggestClubsV50,suggestClubsV51,ensureClubV49,ensureClubV51,setMyClubV49,setMyClubV51,getMyClubV49,getMyClubV51,adminListClubsV49,adminListClubsV51,adminMergeClubsV49,adminMergeClubsV51,adminRenameClubV49,adminCreateClubV51,adminUpdateClubV51,getRanking,searchPlayers,getRatingHistory,getRankTiers,setProfilePhotoUrl,uploadProfilePhoto,deleteProfilePhotoByUrl} from './profile.js';
import {createChallenge,respondToChallenge,cancelChallenge,getMyChallenges} from './challenges.js';
import {getMyMatches,submitMatchResult,confirmMatchResult,disputeMatchResult} from './matches.js';
import {createTournamentV8,getTournamentsV8,getTournamentEntriesV8,getTournamentMembersV8,getTournamentGamesV8,getTournamentStandingsV8,getTournamentStandingsV31,submitTournamentGameResultV8,closeGroupStageV8,finalizeTournamentV8,searchTournamentUsersV8,getTournamentParticipantProfilesV8,createTournamentV30,getMyTournamentHistoryV30,searchActiveTournamentsV30,joinTournamentV30,leaveTournamentV30,startTournamentV30,getTournamentLobbyV30} from './tournaments.js';
import {getReviewsForUser,getReviewsAuthoredByUser,submitPlayerReview,getPlayerProfile,getPlayerRatings,followPlayer,unfollowPlayer,getFollowingIds,getFollowingRanking,getPublicPlayerCard,getFollowingFeed,setPrimaryRival,clearPrimaryRival,getMyPrimaryRival,getShowcaseAchievements,setShowcaseAchievements,getPlayerReliabilityV34} from './social.js';
import {getPreferences,updatePreferences,getFrames,equipFrame,getSeasonDashboard,getSeasonHistory,getRecommendedRivals,getPlayerPercentiles,getPublicProfilePreferences} from './preferences.js';
import {getSeasonChampions,getPublicPlayerSeasons,getH2HAdvanced,getPlayerRecords,getTournamentSummary} from './history.js';
import {getPlayerTitles,equipCompetitiveTitle,getTournamentHistory,getComparativeStats,getPostMatchSummary} from './v21.js';
import {getV28Dashboard,getV28LastSeasonRecap} from './v28.js';
import {getMyV35Flags,updateMyLocationV35,getNearbyPlayersV35,createPresenceManagerV35} from './v35_social.js';
import {getPublicAdminFlagV37,getPublicAdminIdsV38} from './v36_live.js';
import {getFrameFitsV44,saveFrameFitV44,resetFrameFitV44,subscribeAvatarLiveV44} from './v44_avatar_fit.js';
import {createTeamTournamentV32,getTeamTournamentV32,listMyTeamTournamentsV32,submitTeamTournamentMatchResultV32,createTeamTiebreakV32,finalizeTeamTournamentDrawV32,finalizeTeamTournamentV33,listMyTeamTournamentHistoryV33} from './team_tournaments.js';
import {setupTrainingTimerV53} from './training.js';
import {createCompetitionLiveSyncV55} from './v55_competition_live.js';
import {getMyStatsV56} from './v56_stats.js';
import {setupPwaV573} from './pwa.js';
import {
  LEGAL_V57,
  getPublicLegalConfigV57,
  getMyLegalStatusV57,
  recordMyLegalAcceptanceV57,
  exportMyDataV57,
  adminSecurityAuditV57,
  adminUpdateLegalConfigV57,
  renderLegalDocumentV57
} from './v57_legal.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const authShell=$('#authShell'),mainApp=$('#mainApp'),views=$$('.view');
let session=null,profile=null,ratings=[],rankingMode='individual',selectedRival=null,currentMatch=null,rankTiers=[];
let selectedTournament=null,currentTournamentMatch=null,tournamentPlayerTimer=null;
let tournamentHubModeV30='history',tournamentDiscoverTimerV30=null,pendingTournamentJoinV30=null;
let teamDraftV32={home:[null,null,null,null],away:[null,null,null,null]},teamSearchTimerV32=null,selectedTeamTournamentV32=null,currentTeamMatchV32=null;
let tournamentDraft={modality:null,preset:null,selectedUsers:[]};
let onboardingPhotoFile=null,onboardingPhotoPreviewUrl=null;
let onboardingPhotoSourceFileV47=null,onboardingPhotoSourceUrlV47=null,pendingOnboardingPhotoSourceV47=null;
let onboardingCropV47={naturalWidth:0,naturalHeight:0,zoom:1,x:0,y:0,baseScale:1,dragging:false,lastX:0,lastY:0};
let availableClubsV47=[];
let availableClubsV49=[],myClubV49={club_id:null,name:'N/A'},adminClubsV49=[];
let clubSuggestionTimerV49=null;
let socialState={matches:[],ratingHistory:[],reviewsReceived:[],reviewsAuthored:[],streak:{current:0,max:0},achievements:[]};
let reviewTargetMatch=null,selectedReviewStars=0;
let competitionLiveSyncV55=null;
let liveRefreshTimersV55=new Map(),competitionRefreshPromiseV55=null;
let lastRatingSignatureV55='';
let statsModeV56='all',statsModeStateV56=null,statsModeLoadPromiseV56=null;
let legalConfigV57=null,legalStatusV57=null,currentLegalTabV57='terms';
let rankingScope='global',followingIds=[],primaryRivalId=null;
let myShowcaseAchievementIds=[],showcaseDraftIds=[];
let userPreferences=null,frameState={catalog:[],unlocks:[],equipped:null},seasonState=null,percentileState={},titleState={equipped:null,items:[]},comparativeState={};
let historyModeFilter='all',historyResultFilter='all',competitivePulseTarget=null;
let v28Dashboard={},v28SeasonRecap={};
let myReliabilityV34={reliability:100,completed_matches:0,abandoned_matches:0,total_matches:0,provisional:true,label:'Jugador fiable'};
let v35Flags={is_test_admin:false,nearby_opt_in:false,nearby_visibility:'everyone'},presenceManagerV35=null,onlineUserIdsV35=new Set(),lastKnownPositionV35=null;
let frameFitsV44=new Map(),liveFramePreviewV44=null,stopAvatarLiveV44=null;
let adminUserIdsV38=new Set(),universalPlayerObserverV38=null;
let passwordRecoveryActiveV53=false,recoveryProfileV53=null;
const stopTrainingTimerV53=setupTrainingTimerV53();

let liveMatchStatusSnapshot=new Map(),liveMatchStatusPrimed=false,postMatchShownIds=new Set(),pendingPostMatchReviewId=null;




const FRAME_ART_V37={
  rank_bronze:'./assets/frames/rank-bronze.png',
  rank_silver:'./assets/frames/rank-silver.png',
  rank_gold:'./assets/frames/rank-gold.png',
  rank_platinum:'./assets/frames/rank-platinum.png',
  rank_diamond:'./assets/frames/rank-diamond.png',
  season_first:'./assets/frames/season-first.png',
  season_second:'./assets/frames/season-second.png',
  season_third:'./assets/frames/season-third.png',
  season_elite:'./assets/frames/season-elite.png',
  admin_arcane_gear:'./assets/frames/admin-arcane-gear.png'
};
const ADMIN_ONLY_FRAME_IDS_V52=new Set(['admin_arcane_gear']);
function frameArtUrlV37(frameId){return FRAME_ART_V37[frameId]||''}
function adminBadgeV37(isAdmin=false){return isAdmin?'<span class="admin-profile-badge-v37">◆ PERFIL DE ADMINISTRADOR</span>':''}


/* ============================================================
   V44 — AUTO-FIT MATEMÁTICO
   La FOTO es la medida maestra.
   El hueco interno del PNG se escala hasta coincidir con ella.
   ============================================================ */

function getFrameFitV44(frameId){
  const row=frameFitsV44.get(frameId)||null;
  if(row)return {
    frame_id:row.frame_id,
    png_width:Number(row.png_width),
    png_height:Number(row.png_height),
    hole_center_x:Number(row.hole_center_x),
    hole_center_y:Number(row.hole_center_y),
    hole_diameter:Number(row.hole_diameter),
    fine_scale:Number(row.fine_scale??100),
    fine_x:Number(row.fine_x??0),
    fine_y:Number(row.fine_y??0)
  };
  return null;
}

function activeFrameFitV44(frameId){
  const base=getFrameFitV44(frameId);
  if(!base)return null;
  if(
    v35Flags?.is_test_admin &&
    liveFramePreviewV44?.enabled &&
    liveFramePreviewV44.frameId===frameId
  ){
    return {
      ...base,
      fine_scale:Number(liveFramePreviewV44.fine_scale),
      fine_x:Number(liveFramePreviewV44.fine_x),
      fine_y:Number(liveFramePreviewV44.fine_y)
    };
  }
  return base;
}

function ensureTTAvatarV44(host){
  if(!host)return null;

  // Los avatares V44 no heredan clases de motores V43 o anteriores.
  [...host.classList].forEach(c=>{
    if(c.startsWith('tt-avatar-') && !c.endsWith('-v44'))host.classList.remove(c);
  });
  host.classList.add('tt-avatar-v44');

  let stage=host.querySelector(':scope > .tt-avatar-stage-v44');
  if(!stage){
    host.innerHTML='';
    stage=document.createElement('div');
    stage.className='tt-avatar-stage-v44';

    const photo=document.createElement('div');
    photo.className='tt-avatar-photo-v44';
    const img=document.createElement('img');img.alt='';
    const fallback=document.createElement('span');fallback.textContent='TT';
    photo.append(img,fallback);

    const frameStage=document.createElement('div');
    frameStage.className='tt-avatar-frame-stage-v44 hidden';
    frameStage.setAttribute('aria-hidden','true');
    const frameImg=document.createElement('img');
    frameImg.className='tt-avatar-frame-img-v44';frameImg.alt='';
    frameStage.appendChild(frameImg);

    const online=document.createElement('span');
    online.className='tt-avatar-online-v44 hidden';
    online.title='Online';
    online.setAttribute('aria-label','Online');

    stage.append(photo,frameStage,online);
    host.appendChild(stage);
  }

  return {
    host,
    stage,
    photo:stage.querySelector(':scope > .tt-avatar-photo-v44'),
    photoImg:stage.querySelector(':scope > .tt-avatar-photo-v44 > img'),
    fallback:stage.querySelector(':scope > .tt-avatar-photo-v44 > span'),
    frameStage:stage.querySelector(':scope > .tt-avatar-frame-stage-v44'),
    frameImg:stage.querySelector(':scope > .tt-avatar-frame-stage-v44 > .tt-avatar-frame-img-v44'),
    online:stage.querySelector(':scope > .tt-avatar-online-v44')
  };
}

function applyFrameAutoFitV44(parts,frameId,fitOverride=null){
  const id=frameId||'none';
  const src=id==='none'?'':frameArtUrlV37(id);

  if(!src){
    parts.frameStage.classList.add('hidden');
    parts.frameImg.removeAttribute('src');
    parts.host.dataset.frameId='none';
    return;
  }

  const fit=fitOverride||activeFrameFitV44(id);
  if(!fit || !fit.hole_diameter){
    parts.frameStage.classList.add('hidden');
    parts.frameImg.removeAttribute('src');
    return;
  }

  // La foto ocupa 100% del AvatarStage.
  // Si el hueco del PNG mide D píxeles y el PNG W×H:
  //
  // ancho render = W / D × diámetroFoto
  // alto render  = H / D × diámetroFoto
  //
  // Como diámetroFoto = 100% del AvatarStage:
  const fineScale=Number(fit.fine_scale??100)/100;
  const widthPct=(Number(fit.png_width)/Number(fit.hole_diameter))*100*fineScale;
  const heightPct=(Number(fit.png_height)/Number(fit.hole_diameter))*100*fineScale;

  // El transform alinea EL CENTRO DEL HUECO con el centro de la foto,
  // no el centro geométrico del canvas PNG.
  const anchorXPct=(Number(fit.hole_center_x)/Number(fit.png_width))*100;
  const anchorYPct=(Number(fit.hole_center_y)/Number(fit.png_height))*100;

  parts.frameStage.classList.remove('hidden');
  if(parts.frameImg.getAttribute('src')!==src)parts.frameImg.src=src;
  parts.frameImg.style.width=`${widthPct}%`;
  parts.frameImg.style.height=`${heightPct}%`;
  parts.frameImg.style.left=`${50+Number(fit.fine_x??0)}%`;
  parts.frameImg.style.top=`${50+Number(fit.fine_y??0)}%`;
  parts.frameImg.style.transform=`translate(-${anchorXPct}%,-${anchorYPct}%)`;
  parts.host.dataset.frameId=id;
}

function renderTTAvatarV44(host,{frameId='none',fit=null,photoUrl=null,initials='TT',alt='Foto de perfil',userId=null}={}){
  const p=ensureTTAvatarV44(host);
  if(!p)return;

  p.fallback.textContent=initials||'TT';
  if(photoUrl){
    p.photoImg.src=photoUrl;
    p.photoImg.alt=alt;
    p.host.classList.add('has-photo');
  }else{
    p.photoImg.removeAttribute('src');
    p.photoImg.alt='Sin foto de perfil';
    p.host.classList.remove('has-photo');
  }

  applyFrameAutoFitV44(p,frameId,fit);

  const uid=userId||p.host.dataset.userId||null;
  if(uid)p.host.dataset.userId=String(uid);
  p.online.classList.toggle('hidden',!uid||!isOnlineV35(uid));
}

function ownFrameSelectionV44(){
  if(v35Flags?.is_test_admin && liveFramePreviewV44?.enabled){
    return {
      frameId:liveFramePreviewV44.frameId,
      fit:activeFrameFitV44(liveFramePreviewV44.frameId)
    };
  }
  const frameId=frameState?.equipped||'none';
  return {frameId,fit:activeFrameFitV44(frameId)};
}

function renderOwnAvatarsV44(){
  if(!profile)return;
  const initials=((profile.first_name?.[0]||'')+(profile.last_name?.[0]||'')).toUpperCase()||'TT';
  const {frameId,fit}=ownFrameSelectionV44();
  const common={
    frameId,
    fit,
    photoUrl:profile.profile_photo_url||null,
    initials,
    alt:`Foto de ${profile.first_name||'jugador'}`,
    userId:session?.user?.id||profile.id
  };
  renderTTAvatarV44($('#homeAvatar'),common);
  renderTTAvatarV44($('#profileAvatar'),common);
}

function refreshOwnVisualsV44(){
  populate();
  renderOwnAvatarsV44();
  renderFrameGallery();
  if(v35Flags?.is_test_admin)setupAdminFrameLabV44();
}


// V46: una selección explícita desde la galería siempre tiene prioridad.
// El preview de calibración V44 sigue pudiendo persistir entre pestañas
// mientras se calibra, pero se abandona en el momento en que el usuario
// pulsa "Equipar" sobre un marco real.
function applyEquippedFrameLiveV46(chosenFrameId){
  const normalized=chosenFrameId==='none'?null:chosenFrameId;

  // Actualización optimista/local inmediata.
  frameState={...frameState,equipped:normalized};

  // En Admin, el modo preview puede estar mostrando otro marco y tiene
  // prioridad en ownFrameSelectionV44(). Al equipar salimos de ese modo.
  if(v35Flags?.is_test_admin){
    liveFramePreviewV44=null;
    const liveToggle=$('#adminLivePreviewV43');
    if(liveToggle)liveToggle.checked=false;
  }

  // No esperamos Realtime ni una recarga: actualizamos los dos avatares
  // principales y la galería en el mismo ciclo de interacción.
  renderOwnAvatarsV44();
  renderFrameGallery();

  // Mantiene el laboratorio Admin preparado, pero sin volver a activar
  // el preview global automáticamente.
  if(v35Flags?.is_test_admin)setupAdminFrameLabV44();
}


function framePreviewMarkupV45(frameId){
  const initials=((profile?.first_name?.[0]||'')+(profile?.last_name?.[0]||'')).toUpperCase()||'TT';
  const fit=activeFrameFitV44(frameId);
  const art=frameId==='none'?'':frameArtUrlV37(frameId);
  const photo=profile?.profile_photo_url
    ? `<img src="${esc(profile.profile_photo_url)}" alt="">`
    : `<span>${esc(initials)}</span>`;

  // La galería NO cambia la geometría real del avatar.
  // Solo reduce TODO el conjunto proporcionalmente para que entre en una
  // caja propia y nunca invada texto ni otras tarjetas.
  let holePct=48;
  let frame='';
  if(art&&fit){
    const s=Number(fit.fine_scale??100)/100;
    const fx=Number(fit.fine_x??0)/100;
    const fy=Number(fit.fine_y??0)/100;

    const left=(fit.hole_center_x/fit.hole_diameter)*s-fx;
    const right=((fit.png_width-fit.hole_center_x)/fit.hole_diameter)*s+fx;
    const top=(fit.hole_center_y/fit.hole_diameter)*s-fy;
    const bottom=((fit.png_height-fit.hole_center_y)/fit.hole_diameter)*s+fy;
    const maxExtent=Math.max(left,right,top,bottom,0.01);

    // 45% desde el centro deja margen suficiente en una caja 136x136.
    holePct=Math.min(48,45/maxExtent);

    const w=(fit.png_width/fit.hole_diameter)*100*s;
    const h=(fit.png_height/fit.hole_diameter)*100*s;
    const ax=(fit.hole_center_x/fit.png_width)*100;
    const ay=(fit.hole_center_y/fit.png_height)*100;

    frame=`<div class="tt-frame-preview-stage-v45" style="width:${holePct}%;height:${holePct}%">
      <img src="${esc(art)}" alt="" style="width:${w}%;height:${h}%;left:${50+fit.fine_x}%;top:${50+fit.fine_y}%;transform:translate(-${ax}%,-${ay}%)">
    </div>`;
  }

  return `<div class="tt-frame-preview-v45">
    <div class="tt-frame-preview-photo-v45" style="width:${holePct}%;height:${holePct}%">${photo}</div>
    ${frame}
  </div>`;
}


async function loadFrameFitsV44(){
  try{
    const rows=await getFrameFitsV44();
    frameFitsV44=new Map((rows||[]).map(x=>[x.frame_id,x]));
    renderOwnAvatarsV44();
    renderFrameGallery();
    if(v35Flags?.is_test_admin)setupAdminFrameLabV44();
  }catch(e){
    console.error('V44 frame fit',e);
  }
}

function updateVisibleFrameFitV44(frameId,row){
  document.querySelectorAll(`.tt-avatar-v44[data-frame-id="${CSS.escape(frameId)}"]`).forEach(host=>{
    const own=(host.id==='homeAvatar'||host.id==='profileAvatar'||host.id==='adminAvatarPreviewV43');
    if(own && v35Flags?.is_test_admin && liveFramePreviewV44?.enabled && liveFramePreviewV44.frameId===frameId)return;
    const p=ensureTTAvatarV44(host);
    applyFrameAutoFitV44(p,frameId,row);
  });
}

function startAvatarLiveSyncV44(){
  if(!session?.user?.id)return;
  if(stopAvatarLiveV44)stopAvatarLiveV44().catch?.(()=>{});

  stopAvatarLiveV44=subscribeAvatarLiveV44(session.user.id,{
    onProfile:row=>{
      if(!row)return;
      profile={...profile,...row};
      refreshOwnVisualsV44();
    },
    onCosmetics:row=>{
      frameState={...frameState,equipped:row?.equipped_frame_id||null};
      if(!liveFramePreviewV44?.enabled)renderOwnAvatarsV44();
      renderFrameGallery();
    },
    onFrameFit:row=>{
      if(!row?.frame_id)return;
      frameFitsV44.set(row.frame_id,row);
      updateVisibleFrameFitV44(row.frame_id,row);
      renderFrameGallery();
      if(
        v35Flags?.is_test_admin &&
        $('#adminFrameSelectV43')?.value===row.frame_id &&
        !liveFramePreviewV44?.enabled
      ) setAdminFrameControlsV44(row);
    }
  });
}

function publicFramedAvatarV44(p,frameId='none'){
  const initials=((p?.first_name?.[0]||'')+(p?.last_name?.[0]||'')).toUpperCase()||'TT';
  const fit=activeFrameFitV44(frameId);
  const art=frameId==='none'?'':frameArtUrlV37(frameId);
  const photo=p?.profile_photo_url
    ? `<img src="${esc(p.profile_photo_url)}" alt="Foto de ${esc(p.first_name||'jugador')}">`
    : `<span>${esc(initials)}</span>`;

  let frame='';
  if(art&&fit){
    const s=Number(fit.fine_scale??100)/100;
    const w=(fit.png_width/fit.hole_diameter)*100*s;
    const h=(fit.png_height/fit.hole_diameter)*100*s;
    const ax=(fit.hole_center_x/fit.png_width)*100;
    const ay=(fit.hole_center_y/fit.png_height)*100;
    frame=`<div class="tt-avatar-frame-stage-v44"><img class="tt-avatar-frame-img-v44" src="${esc(art)}" alt="" aria-hidden="true" style="width:${w}%;height:${h}%;left:${50+fit.fine_x}%;top:${50+fit.fine_y}%;transform:translate(-${ax}%,-${ay}%)"></div>`;
  }

  return `<div class="tt-avatar-v44 tt-avatar-public-v44 ${p?.profile_photo_url?'has-photo':''}" data-frame-id="${esc(frameId)}" data-user-id="${esc(p?.id||'')}">
    <div class="tt-avatar-stage-v44">
      <div class="tt-avatar-photo-v44">${photo}</div>
      ${frame||'<div class="tt-avatar-frame-stage-v44 hidden"><img class="tt-avatar-frame-img-v44" alt=""></div>'}
      <span class="tt-avatar-online-v44 ${isOnlineV35(p?.id)?'':'hidden'}" title="Online" aria-label="Online"></span>
    </div>
  </div>`;
}

function identityAvatarMarkupV44(p,frameId='none'){
  const initials=((p?.first_name?.[0]||'')+(p?.last_name?.[0]||'')).toUpperCase()||'TT';
  const fit=activeFrameFitV44(frameId);
  const art=frameId==='none'?'':frameArtUrlV37(frameId);
  const photo=p?.profile_photo_url
    ? `<img src="${esc(p.profile_photo_url)}" alt="">`
    : `<span>${esc(initials)}</span>`;

  let frame='';
  if(art&&fit){
    const s=Number(fit.fine_scale??100)/100;
    const w=(fit.png_width/fit.hole_diameter)*100*s;
    const h=(fit.png_height/fit.hole_diameter)*100*s;
    const ax=(fit.hole_center_x/fit.png_width)*100;
    const ay=(fit.hole_center_y/fit.png_height)*100;
    frame=`<div class="tt-avatar-frame-stage-v44"><img class="tt-avatar-frame-img-v44" src="${esc(art)}" alt="" aria-hidden="true" style="width:${w}%;height:${h}%;left:${50+fit.fine_x}%;top:${50+fit.fine_y}%;transform:translate(-${ax}%,-${ay}%)"></div>`;
  }

  return `<div class="tt-avatar-v44 tt-avatar-identity-v44 ${p?.profile_photo_url?'has-photo':''}" data-frame-id="${esc(frameId)}" data-user-id="${esc(p?.id||'')}">
    <div class="tt-avatar-stage-v44">
      <div class="tt-avatar-photo-v44">${photo}</div>
      ${frame||'<div class="tt-avatar-frame-stage-v44 hidden"><img class="tt-avatar-frame-img-v44" alt=""></div>'}
      <span class="tt-avatar-online-v44 ${isOnlineV35(p?.id)?'':'hidden'}" title="Online" aria-label="Online"></span>
    </div>
  </div>`;
}

function isAdminV38(userId){return adminUserIdsV38.has(String(userId))}

function ensureOnlineDotOnNodeV38(node,userId){
  if(!node||!userId)return;
  node.classList.add('online-anchor-v38');
  let dot=node.querySelector(':scope > .online-dot-universal-v38');
  if(isOnlineV35(userId)){
    if(!dot){
      dot=document.createElement('span');
      dot.className='online-dot-universal-v38';
      dot.title='Online';
      dot.setAttribute('aria-label','Online');
      node.appendChild(dot);
    }
  }else dot?.remove();
}

function decoratePlayerCardV38(card){
  const uid=card?.dataset?.openPlayer||card?.dataset?.userIdV35;
  if(!uid)return;

  let anchor=null;
  if(card.dataset?.userIdV35){
    anchor=card;
  }else{
    anchor=
      card.querySelector('[data-user-id-v35]')||
      card.querySelector('.ranking-avatar-online-v35')||
      card.querySelector('.podium-avatar-wrap')||
      card.querySelector('.nearby-avatar-v35')||
      card.querySelector('.recommended-avatar-online-v37')||
      card.querySelector('.mini-player-avatar')?.parentElement||
      card.querySelector('.ranking-avatar')?.parentElement||
      card.querySelector('.podium-avatar')?.parentElement||
      card.querySelector('img')?.parentElement;
  }
  ensureOnlineDotOnNodeV38(anchor,uid);

  if(isAdminV38(uid)){
    const nameTarget=
      card.querySelector('.rank-name strong')||
      card.querySelector('.recommended-rival-copy strong')||
      card.querySelector('.nearby-player-card-v35 strong')||
      card.querySelector('strong');
    if(nameTarget && !nameTarget.querySelector('.admin-mini-universal-v38')){
      const badge=document.createElement('span');
      badge.className='admin-mini-universal-v38';
      badge.textContent='◆ ADMIN';
      badge.title='Perfil de Administrador';
      nameTarget.appendChild(document.createTextNode(' '));
      nameTarget.appendChild(badge);
    }
  }
}

function decorateAllPlayersV38(root=document){
  root.querySelectorAll?.('[data-open-player],[data-user-id-v35]').forEach(decoratePlayerCardV38);
}

function startUniversalPlayerObserverV38(){
  if(universalPlayerObserverV38)return;
  decorateAllPlayersV38(document);
  universalPlayerObserverV38=new MutationObserver(mutations=>{
    let needs=false;
    for(const m of mutations){
      if(m.addedNodes?.length){needs=true;break}
    }
    if(needs)requestAnimationFrame(()=>decorateAllPlayersV38(document));
  });
  universalPlayerObserverV38.observe(document.body,{childList:true,subtree:true});
}

async function loadAdminIdsV38(){
  try{adminUserIdsV38=await getPublicAdminIdsV38()}
  catch(e){console.error('admin ids V38',e);adminUserIdsV38=new Set()}
  decorateAllPlayersV38(document);
}




/* ============================================================
   V44 — LABORATORIO: AUTO-FIT + AJUSTE FINO
   ============================================================ */

function clampV44(v,min,max){const n=Number(v);return Math.max(min,Math.min(max,Number.isFinite(n)?n:min))}
function fmtV44(v){const n=Number(v);return Number.isInteger(n)?String(n):n.toFixed(1)}

function currentAdminFrameValuesV44(){
  return {
    fine_scale:clampV44($('#adminFrameScaleV43')?.value||100,60,140),
    fine_x:clampV44($('#adminFrameXV43')?.value||0,-30,30),
    fine_y:clampV44($('#adminFrameYV43')?.value||0,-30,30)
  };
}

function syncAdminControlPairV44(rangeId,numberId,labelId,sourceId){
  const range=$('#'+rangeId),number=$('#'+numberId),label=$('#'+labelId),source=$('#'+sourceId);
  if(!range||!number||!source)return;
  const value=clampV44(source.value,Number(range.min),Number(range.max));
  range.value=value;
  number.value=value;
  if(label)label.textContent=`${fmtV44(value)}%`;
}

function setAdminFrameControlsV44(c){
  [
    ['adminFrameScaleV43','adminFrameScaleNumberV43','adminFrameScaleLabelV43',Number(c?.fine_scale??100)],
    ['adminFrameXV43','adminFrameXNumberV43','adminFrameXLabelV43',Number(c?.fine_x??0)],
    ['adminFrameYV43','adminFrameYNumberV43','adminFrameYLabelV43',Number(c?.fine_y??0)]
  ].forEach(([r,n,l,v])=>{
    if($('#'+r))$('#'+r).value=v;
    if($('#'+n))$('#'+n).value=v;
    if($('#'+l))$('#'+l).textContent=`${fmtV44(v)}%`;
  });
}

function setLiveFramePreviewV44(frameId,values){
  liveFramePreviewV44={enabled:true,frameId,...values};
  renderOwnAvatarsV44();
}

function clearLiveFramePreviewV44(){
  liveFramePreviewV44=null;
  renderOwnAvatarsV44();
}

function updateAdminFramePreviewV44(propagate=true){
  if(!v35Flags?.is_test_admin)return;
  const frameId=$('#adminFrameSelectV43')?.value;
  const preview=$('#adminAvatarPreviewV43');
  if(!frameId||!preview)return;

  const base=getFrameFitV44(frameId);
  if(!base)return;

  const fine=currentAdminFrameValuesV44();
  const fit={...base,...fine};
  const initials=((profile?.first_name?.[0]||'')+(profile?.last_name?.[0]||'')).toUpperCase()||'TT';

  renderTTAvatarV44(preview,{
    frameId,
    fit,
    photoUrl:profile?.profile_photo_url||null,
    initials,
    alt:`Foto de ${profile?.first_name||'jugador'}`,
    userId:session?.user?.id
  });

  const frame=(frameState.catalog||[]).find(f=>f.id===frameId);
  if($('#adminFrameNameV43'))$('#adminFrameNameV43').textContent=frame?.name||frameId;

  if(propagate && $('#adminLivePreviewV43')?.checked){
    setLiveFramePreviewV44(frameId,fine);
  }
}

function setupAdminFrameLabV44(){
  if(!v35Flags?.is_test_admin||!$('#adminFrameSelectV43'))return;

  const select=$('#adminFrameSelectV43');
  const frames=(frameState.catalog||[]).filter(f=>f.id!=='none'&&frameArtUrlV37(f.id)&&getFrameFitV44(f.id));

  const desired=
    (liveFramePreviewV44?.frameId&&frames.some(f=>f.id===liveFramePreviewV44.frameId))
      ? liveFramePreviewV44.frameId
      : (frames.some(f=>f.id===select.value)
          ? select.value
          : (frames.some(f=>f.id===frameState.equipped)?frameState.equipped:frames[0]?.id));

  select.innerHTML=frames.map(f=>`<option value="${esc(f.id)}">${esc(f.name)}</option>`).join('');
  if(desired)select.value=desired;

  if(!select.dataset.boundV44){
    select.dataset.boundV44='1';

    select.addEventListener('change',()=>{
      setAdminFrameControlsV44(getFrameFitV44(select.value));
      updateAdminFramePreviewV44();
    });

    [
      ['adminFrameScaleV43','adminFrameScaleNumberV43','adminFrameScaleLabelV43'],
      ['adminFrameXV43','adminFrameXNumberV43','adminFrameXLabelV43'],
      ['adminFrameYV43','adminFrameYNumberV43','adminFrameYLabelV43']
    ].forEach(([r,n,l])=>{
      $('#'+r)?.addEventListener('input',()=>{
        syncAdminControlPairV44(r,n,l,r);
        updateAdminFramePreviewV44();
      });
      $('#'+n)?.addEventListener('input',()=>{
        if($('#'+n).value==='')return;
        syncAdminControlPairV44(r,n,l,n);
        updateAdminFramePreviewV44();
      });
      $('#'+n)?.addEventListener('change',()=>{
        if($('#'+n).value==='')$('#'+n).value=$('#'+r).value;
        syncAdminControlPairV44(r,n,l,n);
        updateAdminFramePreviewV44();
      });
    });
  }

  const source=
    liveFramePreviewV44?.enabled&&liveFramePreviewV44.frameId===select.value
      ? {...getFrameFitV44(select.value),...liveFramePreviewV44}
      : getFrameFitV44(select.value);

  setAdminFrameControlsV44(source);
  updateAdminFramePreviewV44();
}

async function saveAdminFrameV44(){
  const st=$('#adminFrameStatusV43');
  const frameId=$('#adminFrameSelectV43')?.value;
  if(!frameId)return;

  try{
    const fine=currentAdminFrameValuesV44();
    const saved=await saveFrameFitV44(frameId,fine);
    frameFitsV44.set(frameId,saved);

    if($('#adminLivePreviewV43')?.checked)setLiveFramePreviewV44(frameId,fine);
    updateVisibleFrameFitV44(frameId,saved);
    renderFrameGallery();

    setStatus(st,'Guardado. El diámetro interior del marco sigue igualando automáticamente el diámetro de la foto.','ok');
  }catch(e){
    setStatus(st,e.message,'error');
  }
}

async function resetAdminFrameV44(){
  const st=$('#adminFrameStatusV43');
  const frameId=$('#adminFrameSelectV43')?.value;
  if(!frameId)return;

  try{
    const saved=await resetFrameFitV44(frameId);
    frameFitsV44.set(frameId,saved);
    setAdminFrameControlsV44(saved);
    updateAdminFramePreviewV44();
    setStatus(st,'Ajustes finos restaurados. El encaje vuelve al cálculo automático puro.','ok');
  }catch(e){
    setStatus(st,e.message,'error');
  }
}

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
    if($('#prefProfileStyle'))$('#prefProfileStyle').value=profile.playing_style||'allround';
    if($('#prefProfileHand'))$('#prefProfileHand').value=profile.dominant_hand||'diestro';
  }
  applyTheme(userPreferences.theme||'dark');
  renderFrameGallery();
}


function frameIsAvailable(frame){
  if(frame.id==='none')return true;
  if(v35Flags?.is_test_admin)return true;
  const unlock=frameState.unlocks.find(x=>x.frame_id===frame.id);
  if(!unlock)return false;
  return !unlock.expires_at||new Date(unlock.expires_at)>new Date();
}

function renderFrameGallery(){
  const box=$('#frameGallery');
  if(!box)return;
  const visibleCatalog=(frameState.catalog||[]).filter(x=>
    x.id!=='none' &&
    (v35Flags?.is_test_admin || !ADMIN_ONLY_FRAME_IDS_V52.has(x.id))
  );
  const rows=[{id:'none',name:'Sin marco',category:'special',rarity:'common',description:'Perfil limpio, sin marco.',sort_order:-1},...visibleCatalog];
  box.innerHTML=rows.map(f=>{
    const available=frameIsAvailable(f);
    const equipped=(frameState.equipped||null)===(f.id==='none'?null:f.id);
    const cardTier=f.id==='season_first'?'season-card-first':f.id==='season_second'?'season-card-second':f.id==='season_third'?'season-card-third':f.id==='season_elite'?'season-card-elite':f.id==='admin_arcane_gear'?'admin-frame-card-v52':'';
    return `<article class="frame-card ${cardTier} ${available?'unlocked':'locked'} ${equipped?'equipped':''}" data-frame-id="${esc(f.id)}">
      ${framePreviewMarkupV45(f.id)}
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
    const hadLock=body.classList.contains('modal-open')||('scrollY' in body.dataset);
    if(!hadLock)return;
    const y=Math.max(0,parseInt(body.dataset.scrollY||String(window.scrollY||0),10)||0);
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

function setBootMessageV572(message){
  const el=$('#ttBootMessageV572');
  if(el)el.textContent=message;
}
function closeBootScreenV572(){
  document.body.classList.remove('tt-booting-v572');
  const splash=$('#ttBootScreenV572');
  if(!splash)return;
  splash.classList.add('is-leaving');
  setTimeout(()=>splash.remove(),220);
}

function showView(id){authShell.classList.remove('hidden');mainApp.classList.add('hidden');views.forEach(v=>v.classList.toggle('active',v.id===id));window.scrollTo(0,0);if(id==='sportsProfileView')loadAvailableClubsV49().catch(err=>console.warn('Clubes V49:',err))}
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

function reliabilityHueV34(pct){
  return Math.round(Math.max(0,Math.min(100,Number(pct)||0))*1.2);
}
function reliabilityHtmlV34(r,compact=false){
  const pct=Math.max(0,Math.min(100,Number(r?.reliability??100)));
  const hue=reliabilityHueV34(pct);
  return `<section class="reliability-inline-v34 ${compact?'compact':''}">
    <div class="reliability-inline-head-v34">
      <div><span>Fiabilidad${r?.provisional?' · provisional':''}</span><strong>${esc(r?.label||'Jugador fiable')}</strong></div>
      <b>${pct}%</b>
    </div>
    <div class="reliability-track-v34"><span style="width:${pct}%;--reliability-hue:${hue}"></span></div>
    <small>${Number(r?.completed_matches||0)} completados · ${Number(r?.abandoned_matches||0)} abandonos</small>
  </section>`;
}

function isOnlineV35(userId){return onlineUserIdsV35.has(String(userId))}
function onlineDotV35(userId){return isOnlineV35(userId)?'<span class="online-dot-v35" title="Online"></span>':''}
function decorateOnlineIndicatorsV35(){
  $$('[data-user-id-v35]').forEach(el=>{
    const uid=el.dataset.userIdV35;
    const dot=el.querySelector(':scope > .online-dot-v35');
    if(isOnlineV35(uid)&&!dot){const d=document.createElement('span');d.className='online-dot-v35';d.title='Online';el.appendChild(d)}
    if(!isOnlineV35(uid)&&dot)dot.remove();
  });
}
function formatDistanceV35(km){const n=Number(km||0);return n<1?`${Math.max(1,Math.round(n*1000))} m`:`${n.toFixed(n<10?1:0)} km`}
async function requestDeviceLocationV35(){
  if(!navigator.geolocation)throw new Error('Este dispositivo no permite ubicación.');
  return new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(
    p=>resolve({lat:p.coords.latitude,lon:p.coords.longitude}),
    e=>reject(new Error(e.code===1?'Necesitás permitir la ubicación para usar Jugadores cerca.':'No pudimos obtener tu ubicación.')),
    {enableHighAccuracy:false,timeout:10000,maximumAge:300000}
  ));
}
async function loadV35Flags(){
  try{v35Flags=await getMyV35Flags()}catch(e){console.error('V35 flags',e)}
  // V41: las herramientas admin salen de Configuración y viven en su propia pestaña.
  $('#testAdminSectionV35')?.classList.add('hidden');
  $('#adminNavItemV43')?.classList.toggle('hidden',!v35Flags.is_test_admin);
  document.body.classList.toggle('is-admin-v43',!!v35Flags.is_test_admin);

  if($('#nearbyOptInV35'))$('#nearbyOptInV35').checked=!!v35Flags.nearby_opt_in;
  if($('#nearbyVisibilityV35'))$('#nearbyVisibilityV35').value=v35Flags.nearby_visibility||'everyone';

  if(v35Flags.is_test_admin){
    document.body.classList.add('test-admin-v35');
    socialState.achievements=(socialState.achievements||[]).map(a=>({...a,unlocked:true}));
    titleState.items=(titleState.items||[]).map(t=>({...t,unlocked:true}));
    renderFrameGallery();
    setupAdminFrameLabV44();
  }else{
    document.body.classList.remove('test-admin-v35');
    if($('#tab-admin')?.classList.contains('active'))activateTab('home');
  }
}
async function enableNearbyV35(){
  try{
    const p=await requestDeviceLocationV35();lastKnownPositionV35=p;
    await updateMyLocationV35(p.lat,p.lon,true,v35Flags.nearby_visibility||'everyone');
    v35Flags.nearby_opt_in=true;
    if($('#nearbyOptInV35'))$('#nearbyOptInV35').checked=true;
    await loadNearbyPlayersV35(false);
  }catch(e){alert(e.message)}
}
async function loadNearbyPlayersV35(refresh=false){
  const box=$('#nearbyPlayersListV35'),permission=$('#nearbyPermissionCardV35');
  if(!box)return;
  if(!v35Flags.nearby_opt_in){permission?.classList.remove('hidden');box.innerHTML='';return}
  permission?.classList.add('hidden');
  box.innerHTML='<div class="loading-row">Buscando jugadores cerca…</div>';
  try{
    if(refresh||!lastKnownPositionV35)lastKnownPositionV35=await requestDeviceLocationV35();
    const p=lastKnownPositionV35;
    await updateMyLocationV35(p.lat,p.lon,true,v35Flags.nearby_visibility||'everyone');
    const rows=await getNearbyPlayersV35(p.lat,p.lon,50,30);
    box.innerHTML=rows.length?rows.map(x=>`<button type="button" class="nearby-player-card-v35" data-open-player="${x.user_id}"><div class="nearby-avatar-v35" data-user-id-v35="${x.user_id}">${x.profile_photo_url?`<img src="${esc(x.profile_photo_url)}" alt="">`:`<span>${esc(((x.first_name?.[0]||'')+(x.last_name?.[0]||'')).toUpperCase()||'TT')}</span>`}${onlineDotV35(x.user_id)}</div><div><strong>${esc(`${x.first_name||''} ${x.last_name||''}`.trim()||x.username)} ${x.is_test_admin?'<span class="admin-mini-v37">◆ ADMIN</span>':''}</strong><small>@${esc(x.username||'')} · ${formatDistanceV35(x.distance_km)}</small></div><span>→</span></button>`).join(''):'<div class="loading-row">No encontramos jugadores visibles a menos de 50 km.</div>';
  }catch(e){box.innerHTML=`<div class="loading-row">${esc(e.message)}</div>`}
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

  const initials=((profile.first_name?.[0]||'') + (profile.last_name?.[0]||'')).toUpperCase() || 'TT';

  // V29: la navegación usa la foto real del usuario en PC y celular.
  const navProfileAvatar=$('#navProfileAvatar');
  const navProfileAvatarImg=$('#navProfileAvatarImg');
  const navProfileAvatarFallback=$('#navProfileAvatarFallback');
  if(navProfileAvatar&&navProfileAvatarImg&&navProfileAvatarFallback){
    navProfileAvatarFallback.textContent=initials;
    if(profile.profile_photo_url){
      navProfileAvatar.classList.add('has-photo');
      navProfileAvatarImg.src=profile.profile_photo_url;
      navProfileAvatarImg.alt=`Foto de ${profile.first_name}`;
    }else{
      navProfileAvatar.classList.remove('has-photo');
      navProfileAvatarImg.removeAttribute('src');
      navProfileAvatarImg.alt='Sin foto de perfil';
    }
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

  // V43: el componente aislado administra foto + marco en ambas vistas.
  renderOwnAvatarsV44();

  const rep=averageReviews(socialState.reviewsReceived);
  if($('#profileRankTag'))$('#profileRankTag').textContent=currentRank;
  if($('#profileReputationTag'))$('#profileReputationTag').textContent=rep.count?`★ ${rep.average.toFixed(1)}`:'★ Sin valorar';
  if($('#profileStreakTag'))$('#profileStreakTag').textContent=`🔥 Racha ${socialState.streak.current}`;
  if($('#profileMaxStreak'))$('#profileMaxStreak').textContent=socialState.streak.max;
  if($('#profileReputation'))$('#profileReputation').textContent=rep.count?rep.average.toFixed(1):'—';
  if($('#profileReviewCount'))$('#profileReviewCount').textContent=`${rep.count} ${rep.count===1?'valoración':'valoraciones'}`;

  const rel=myReliabilityV34||{reliability:100,completed_matches:0,abandoned_matches:0,provisional:true,label:'Jugador fiable'};
  const relPct=Math.max(0,Math.min(100,Number(rel.reliability||0)));
  const relHue=reliabilityHueV34(relPct);
  if($('#profileReliabilityLabelV34'))$('#profileReliabilityLabelV34').textContent=rel.label||'Jugador fiable';
  if($('#profileReliabilityPctV34'))$('#profileReliabilityPctV34').textContent=`${relPct}%`;
  if($('#profileReliabilityFillV34')){
    $('#profileReliabilityFillV34').style.width=`${relPct}%`;
    $('#profileReliabilityFillV34').style.setProperty('--reliability-hue',relHue);
  }
  if($('#profileReliabilityMatchesV34'))$('#profileReliabilityMatchesV34').textContent=`${rel.completed_matches||0} completados · ${rel.abandoned_matches||0} abandonos`;
  if($('#profileReliabilityProvisionalV34')){
    $('#profileReliabilityProvisionalV34').textContent=rel.provisional?'Fiabilidad provisional · se estabiliza desde 5 partidos':'Historial de partidos confirmados';
    $('#profileReliabilityProvisionalV34').classList.toggle('hidden',false);
  }

  // Stats V56: el modo seleccionado gobierna toda la pantalla.
  // Mientras llega la primera carga RPC mostramos el competitivo histórico
  // como fallback y después renderStatsModeV56() lo sustituye.
  if(!statsModeStateV56){
    $('#statMatches').textContent=ind.matches_played;
    $('#statWins').textContent=ind.wins;
    $('#statLosses').textContent=ind.losses;
    $('#statWinRate').textContent=ind.matches_played?`${((ind.wins/ind.matches_played)*100).toFixed(1)}%`:'—';
  }else{
    renderStatsModeV56();
  }
}
async function loadSocialState(){
  if(!session?.user)return;
  const [matches,history,reviewsReceived,reviewsAuthored,follows,rivalId,showcaseIds,reliability]=await Promise.all([
    getMyMatches(session.user.id),
    getRatingHistory(session.user.id),
    getReviewsForUser(session.user.id).catch(()=>[]),
    getReviewsAuthoredByUser(session.user.id).catch(()=>[]),
    getFollowingIds(session.user.id).catch(()=>[]),
    getMyPrimaryRival(session.user.id).catch(()=>null),
    getShowcaseAchievements(session.user.id).catch(()=>[]),
    getPlayerReliabilityV34(session.user.id).catch(()=>({reliability:100,completed_matches:0,abandoned_matches:0,total_matches:0,provisional:true,label:'Jugador fiable'}))
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
  myReliabilityV34=reliability||myReliabilityV34;
}

function v28EventOfWeek(){
  const week=Math.floor(Date.now()/604800000);
  const events=[
    {title:'Semana Bo5',desc:'Los partidos largos son el centro de la semana. Probá un Mejor de 5.',badge:'BO5'},
    {title:'Caza de gigantes',desc:'Buscá una victoria contra un rival con Elo superior.',badge:'UPSET'},
    {title:'Rivalidad abierta',desc:'Jugá contra rivales distintos y ampliá tu historial competitivo.',badge:'RIVALES'}
  ];
  return events[Math.abs(week)%events.length];
}

function v28Stars(n){
  const v=Math.max(1,Math.min(5,Number(n)||1));
  return `${'★'.repeat(v)}${'☆'.repeat(5-v)}`;
}

function buildV28CoachText(){
  const d=v28Dashboard||{};
  const formats=d.format_stats||[];
  const best=[...formats].sort((a,b)=>(b.win_rate||0)-(a.win_rate||0))[0];
  const streak=socialState.streak?.current||0;
  const rating=getRating('individual').rating;
  const next=nextRankInfo(rating);
  const parts=[];
  if(streak>=3)parts.push(`Estás en una racha de ${streak} victorias.`);
  if(d.comebacks>0)parts.push(`Ya registraste ${d.comebacks} remontada${d.comebacks===1?'':'s'} desde 0-2 en Bo5.`);
  if(d.upsets>0)parts.push(`Tenés ${d.upsets} victoria${d.upsets===1?'':'s'} contra rivales que partían con más Elo.`);
  if(best?.played>=2)parts.push(`Tu mejor rendimiento aparece en ${best.format==='bo5'?'Bo5':best.format==='bo3'?'Bo3':'1 set'}: ${best.win_rate}% de victorias.`);
  if(next.next)parts.push(`Te separan ${Math.max(0,next.next.min_rating-rating)} Elo de ${next.next.name}.`);
  if(!parts.length)parts.push('Tu perfil competitivo todavía está creciendo. Sumá partidos para que el análisis gane precisión.');
  return parts.slice(0,3).join(' ');
}

function renderV28Dashboard(){
  const d=v28Dashboard||{};
  if($('#v28Level'))$('#v28Level').textContent=d.level||1;
  if($('#v28XpText'))$('#v28XpText').textContent=`${d.level_progress||0} / ${d.level_goal||500} XP`;
  if($('#v28XpBar'))$('#v28XpBar').style.width=`${Math.min(100,((d.level_progress||0)/(d.level_goal||500))*100)}%`;

  const missions=$('#v28MissionList');
  if(missions){
    missions.innerHTML=(d.missions||[]).map(m=>{
      const pct=Math.min(100,(Number(m.progress||0)/Math.max(1,Number(m.goal||1)))*100);
      const done=Number(m.progress)>=Number(m.goal);
      return `<article class="v28-mission ${done?'complete':''}">
        <div><span>${m.period==='daily'?'HOY':'SEMANA'}</span><strong>${esc(m.title)}</strong><small>+${m.reward} XP</small></div>
        <b>${m.progress}/${m.goal}</b>
        <div class="v28-mission-track"><i style="width:${pct}%"></i></div>
      </article>`;
    }).join('');
  }

  const ev=v28EventOfWeek();
  if($('#v28EventTitle'))$('#v28EventTitle').textContent=ev.title;
  if($('#v28EventDesc'))$('#v28EventDesc').textContent=ev.desc;
  if($('#v28EventBadge')){
    $('#v28EventBadge').textContent=ev.badge;
    $('#v28EventBadge').dataset.eventAction=ev.badge==='RIVALES'?'rivals':ev.badge==='UPSET'?'rivals':'play';
    $('#v28EventBadge').title=ev.badge==='RIVALES'?'Ver rivales recomendados':'Abrir acción del evento';
  }

  const mw=$('#v28MatchWeek');
  if(mw){
    if(d.match_of_week?.match_id){
      mw.classList.remove('hidden');
      mw.innerHTML=`<div><p class="muted-label">PARTIDO DE LA SEMANA</p><h3>⚡ ${esc(d.match_of_week.opponent_name||'Rival')}</h3><span>${d.match_of_week.rating_gap>0?`Victoria ante un rival ${d.match_of_week.rating_gap} Elo superior`:`+${d.match_of_week.rating_change||0} Elo`}</span></div><button data-match-detail="${d.match_of_week.match_id}" type="button">Ver partido →</button>`;
    }else mw.classList.add('hidden');
  }

  const rivalry=$('#v28RivalryCard');
  if(rivalry){
    const r=d.rivalry;
    if(r?.opponent_id&&r.active){
      rivalry.classList.remove('hidden');
      rivalry.innerHTML=`<div><p class="muted-label">🔥 RIVALIDAD ACTIVA</p><h3>${esc(r.opponent_name||'Rival')}</h3><span>${r.matches} partidos · ${r.wins}V–${r.losses}D</span></div><button data-open-player="${r.opponent_id}" type="button">Ver rivalidad →</button>`;
    }else rivalry.classList.add('hidden');
  }

  const fg=$('#v28FormatStats');
  if(fg){
    const labels={single:'1 SET',bo3:'BO3',bo5:'BO5'};
    const by=new Map((d.format_stats||[]).map(x=>[x.format,x]));
    fg.innerHTML=['single','bo3','bo5'].map(k=>{
      const x=by.get(k)||{played:0,wins:0,win_rate:0};
      return `<article><span>${labels[k]}</span><strong>${x.win_rate||0}%</strong><small>${x.wins||0}V · ${x.played||0} PJ</small></article>`;
    }).join('');
  }

  const sm=$('#v28StrengthMap');
  if(sm){
    const total=Math.max(1,Number(d.matches||0));
    const wr=Math.round((Number(d.wins||0)/total)*100);
    const bo5=(d.format_stats||[]).find(x=>x.format==='bo5');
    const strength=[
      ['Consistencia',Math.ceil(wr/20)],
      ['Racha',Math.min(5,Math.ceil((socialState.streak?.max||0)/2))],
      ['Bo5',bo5?.played?Math.ceil((bo5.win_rate||0)/20):1],
      ['Sorpresas',Math.min(5,1+Math.floor((d.upsets||0)/2))],
      ['Actividad',Math.min(5,Math.ceil(total/10))]
    ];
    sm.innerHTML=strength.map(([n,v])=>`<div><span>${n}</span><strong>${v28Stars(v)}</strong></div>`).join('');
  }

  if($('#v28CoachText'))$('#v28CoachText').textContent=buildV28CoachText();

  const tg=$('#v28TrophyGrid');
  if(tg){
    const recCount=(socialState.achievements||[]).filter(a=>a.unlocked).length;
    const seasonTop=v28SeasonRecap?.final_position;
    tg.innerHTML=`
      <article><span>✦</span><strong>Nivel ${d.level||1}</strong><small>${d.xp||0} XP acumulados</small></article>
      <article><span>⚡</span><strong>${d.upsets||0}</strong><small>sorpresas competitivas</small></article>
      <article><span>🔥</span><strong>${d.comebacks||0}</strong><small>remontadas 0-2</small></article>
      <article><span>◆</span><strong>${recCount}</strong><small>logros desbloqueados</small></article>
      <article><span>♛</span><strong>${seasonTop?`#${seasonTop}`:'—'}</strong><small>última temporada</small></article>`;
  }
}

async function loadV28Experience(){
  try{
    [v28Dashboard,v28SeasonRecap]=await Promise.all([
      getV28Dashboard(),
      getV28LastSeasonRecap().catch(()=>({}))
    ]);
    renderV28Dashboard();
  }catch(err){
    console.error('V28 dashboard',err);
  }
}

async function openV28SeasonRecap(){
  if(!v28SeasonRecap||!Object.keys(v28SeasonRecap).length){
    v28SeasonRecap=await getV28LastSeasonRecap().catch(()=>({}));
  }
  const r=v28SeasonRecap||{};
  $('#v28SeasonRecapContent').innerHTML=Object.keys(r).length?`
    <div class="v28-recap-hero">
      <p class="muted-label">TU TEMPORADA</p>
      <span>Temporada ${r.season_number||'—'}</span>
      <h2>${esc(r.season_name||'Resumen competitivo')}</h2>
      <strong>#${r.final_position||'—'}</strong>
      <small>posición final</small>
    </div>
    <div class="v28-recap-grid">
      <article><span>Elo final</span><strong>${r.final_rating||'—'}</strong></article>
      <article><span>Elo máximo</span><strong>${r.max_rating||'—'}</strong></article>
      <article><span>Partidos</span><strong>${r.matches||0}</strong></article>
      <article><span>Victorias</span><strong>${r.wins||0}</strong></article>
      <article><span>Win rate</span><strong>${r.win_rate||0}%</strong></article>
      <article><span>Rango</span><strong>${esc(r.rank_name||'—')}</strong></article>
    </div>`:
    '<div class="v28-recap-empty"><strong>Todavía no cerraste una temporada.</strong><span>Cuando termine tu primera temporada, el resumen permanente aparecerá acá.</span></div>';
  $('#v28SeasonRecapModal').classList.remove('hidden');syncModalScrollLock();
}

async function refreshCore(){
  ratings=await getMyRatings(session.user.id);
  try{rankTiers=await getRankTiers()}catch(e){}
  await loadSocialState();
  await loadExperienceSettings();
  await loadV35Flags();
  await loadFrameFitsV44();
  populate();
  await Promise.all([loadRanking(),loadChallenges(),loadMatches(),loadHistory(),loadHomeDashboard(),loadHistoryPage(),loadLiveNotifications(),loadRecommendedRivals(),loadChampionsHall(),loadStatsModeV56(false),loadV28Experience()]);
}
async function loadApp(uid,p=null){
  profile=p||await getMyProfile(uid);
  ratings=await getMyRatings(uid);
  try{rankTiers=await getRankTiers()}catch(e){console.error(e);rankTiers=[]}
  await loadSocialState();
  await loadExperienceSettings();
  await loadV35Flags();
  await loadFrameFitsV44();
  populate();
  showMain();
  presenceManagerV35=createPresenceManagerV35(session.user.id,ids=>{
    onlineUserIdsV35=new Set([...ids].map(String));
    decorateOnlineIndicatorsV35();
    renderOwnAvatarsV44();
    decorateAllPlayersV38(document);
  });
  presenceManagerV35.start().catch(console.error);
  await loadAdminIdsV38();
  startUniversalPlayerObserverV38();
  startAvatarLiveSyncV44();

  // Primero cargamos/primamos estados. Después abrimos Realtime.
  // Así una confirmación no puede quedar "absorbida" como snapshot inicial.
  await Promise.all([loadRanking(),loadChallenges(),loadMatches(),loadHistory(),loadHomeDashboard(),loadHistoryPage(),loadLiveNotifications(),loadRecommendedRivals(),loadChampionsHall(),loadStatsModeV56(false),loadV28Experience()]);

  lastRatingSignatureV55=JSON.stringify(
    ratings.map(r=>[r.modality,r.rating,r.matches_played,r.wins,r.losses])
  );
  startLiveNotificationStream();
}
async function route(prefetchedSession=null){
  session=prefetchedSession||await getSession();

  if(!session?.user){
    showView('welcomeView');
    setStatus($('#globalStatus'),'');
    closeBootScreenV572();
    return;
  }

  setBootMessageV572('Cargando tu perfil…');
  const p=await getMyProfile(session.user.id);

  if(!p.profile_completed){
    showView('sportsProfileView');
    closeBootScreenV572();
    return;
  }

  await loadApp(session.user.id,p);
  closeBootScreenV572();
}
function activateTab(tab){
  if(tab==='admin'&&!v35Flags?.is_test_admin){
    tab='home';
  }
  // V23: recupera el scroll si algún flujo anterior ocultó un modal sin limpiarlo.
  if(!$$('.modal').some(m=>!m.classList.contains('hidden')))lockPageScroll(false);
  $$('.tab-page').forEach(p=>p.classList.toggle('active',p.id===`tab-${tab}`));
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  window.scrollTo({top:0,behavior:'smooth'});
  if(tab==='ranking')loadRanking();
  if(tab==='play'){loadChallenges();loadMatches()}
  if(tab==='home'){loadHomeDashboard();loadNearbyPlayersV35(false).catch(()=>{});}
  if(tab==='history')loadHistoryPage();
  if(tab==='stats'){
    loadHistory();
    loadStatsModeV56(false);
  }
  if(tab==='profile'){renderAchievements();renderPrimaryRival();renderProfileSeasonCards();renderEquippedTitle();renderIdentityShowcase();}
  if(tab==='tournaments'){loadTournamentHubV30();}
  if(tab==='training'){
    // El cronómetro sigue corriendo aunque el usuario navegue por otras secciones.
    // Entrar a esta pestaña sólo muestra su estado actual.
  }
  if(tab==='settings'){
    populateSettingsUI();
    renderFrameGallery();
    loadLegalStatusV57();
    loadSettingsClubV49().catch(err=>console.warn('Club settings V49:',err));
    loadV35Flags().then(()=>{renderFrameGallery();renderAchievements();});
  }
  if(tab==='admin'){
    setupAdminFrameLabV44();
    if(v35Flags?.is_test_admin){
      loadAdminClubsV49().catch(err=>console.warn('Admin clubes V49:',err));
      loadAdminLegalConfigV57();
    }
  }
  if(tab==='ranking')loadChampionsHall();
  if(tab==='stats')renderStatsModeV56();
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
        <span class="ranking-avatar-online-v35" data-user-id-v35="${p.id}">${avatarHtml(p,'ranking-avatar')}${onlineDotV35(p.id)}</span>
        <div class="rank-name">
          <strong>${esc(p.first_name)} ${esc(p.last_name)} ${adminBadgeV37(!!p.is_test_admin)}</strong>
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
      <div class="podium-avatar-wrap" data-user-id-v35="${p.id}">${avatarHtml(p,'podium-avatar')}${onlineDotV35(p.id)}<b>${pos}</b></div>
      <strong>${esc(p.first_name)} ${p.is_test_admin?'<span class="admin-mini-v37">◆</span>':''}</strong>
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

    // V27: si el rival confirma un resultado que yo había cargado, también
    // veo el resumen de Elo. La primera carga solo inicializa el snapshot
    // para no abrir partidos antiguos al entrar a la app.
    if(!liveMatchStatusPrimed){
      liveMatchStatusSnapshot=new Map(matches.map(m=>[Number(m.id),m.result_status]));
      liveMatchStatusPrimed=true;
    }else{
      for(const m of matches){
        const id=Number(m.id),previous=liveMatchStatusSnapshot.get(id);
        if(m.result_status==='confirmed'&&previous&&previous!=='confirmed'&&!postMatchShownIds.has(id)){
          // V55: ambos jugadores reciben la transición. Antes el que había
          // enviado el resultado podía quedar con la UI vieja y sin valoración.
          setTimeout(()=>handleConfirmedMatchV55(m),40);
        }
        liveMatchStatusSnapshot.set(id,m.result_status);
      }
    }
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
function scheduleLiveRefreshV55(key,fn,delay=90){
  const old=liveRefreshTimersV55.get(key);
  if(old)clearTimeout(old);

  const timer=setTimeout(async()=>{
    liveRefreshTimersV55.delete(key);
    try{await fn()}catch(err){console.warn(`V55 ${key}:`,err)}
  },delay);

  liveRefreshTimersV55.set(key,timer);
}

async function refreshDuelViewsV55(){
  if(!session?.user)return;

  // Estas tres vistas deben moverse juntas:
  // desafío -> partido -> confirmación.
  await Promise.all([
    loadChallenges(),
    loadMatches(),
    loadLiveNotifications()
  ]);
}

async function refreshCompetitionExperienceV55(){
  if(!session?.user)return;
  if(competitionRefreshPromiseV55)return competitionRefreshPromiseV55;

  competitionRefreshPromiseV55=(async()=>{
    ratings=await getMyRatings(session.user.id);
    lastRatingSignatureV55=JSON.stringify(
      ratings.map(r=>[r.modality,r.rating,r.matches_played,r.wins,r.losses])
    );

    await loadSocialState();
    populate();

    // No llamamos loadLiveNotifications acá para no crear un bucle:
    // esa función es quien detecta la transición a confirmed.
    await Promise.all([
      loadRanking(),
      loadChallenges(),
      loadMatches(),
      loadHistory(),
      loadHomeDashboard(),
      loadHistoryPage(),
      loadRecommendedRivals(),
      loadStatsModeV56(true),
      loadV28Experience()
    ]);
  })();

  try{
    await competitionRefreshPromiseV55;
  }finally{
    competitionRefreshPromiseV55=null;
  }
}

async function handleConfirmedMatchV55(matchRow){
  if(!session?.user||!matchRow)return;

  const id=Number(matchRow.id);
  if(!id||postMatchShownIds.has(id))return;

  // Se marca ANTES del refresh para bloquear eventos duplicados de:
  // matches + ratings + rating_history + polling.
  postMatchShownIds.add(id);
  pendingPostMatchReviewId=id;

  try{
    // Actualiza Elo, historial, socialState y la copia del partido ANTES
    // de abrir el modal. Así "Valorar rival" funciona para ambos lados.
    await refreshCompetitionExperienceV55();

    const fresh=(socialState.matches||[]).find(x=>Number(x.id)===id)||matchRow;
    const won=fresh?.winner_id===session.user.id;

    await showPostMatch({
      matchId:id,
      won,
      oldRating:null,
      newRating:null
    });
  }catch(err){
    console.error('V55 post-match live',err);
    // Si algo excepcional falló, permitimos reintentar mediante polling.
    postMatchShownIds.delete(id);
    pendingPostMatchReviewId=null;
  }
}

async function refreshRatingViewsV55(){
  if(!session?.user)return;
  await refreshCompetitionExperienceV55();
}

async function refreshReviewViewsV55(){
  if(!session?.user)return;

  // Reputación + historial + placas pueden depender de valoraciones.
  await loadSocialState();
  populate();
  await Promise.all([
    loadHomeDashboard(),
    loadHistoryPage()
  ]);
}

async function refreshSelectedTournamentV55(){
  if(!session?.user)return;

  const detailVisible=!!$('#tournamentDetail')&&!$('#tournamentDetail').classList.contains('hidden');
  const tournamentTabActive=$('#tab-tournaments')?.classList.contains('active');

  if(selectedTournament?.id&&detailVisible){
    const all=await getTournamentsV8();
    const updated=all.find(t=>Number(t.id)===Number(selectedTournament.id));
    if(updated)selectedTournament=updated;

    await renderTournamentBracket();
    await renderTournamentSummaryV20();
  }

  if(tournamentTabActive){
    await loadTournamentHubV30();
  }
}

async function refreshSelectedTeamTournamentV55(){
  if(!session?.user)return;

  const detailVisible=!!$('#teamTournamentDetailV32')&&!$('#teamTournamentDetailV32').classList.contains('hidden');
  const builderVisible=!!$('#teamTournamentBuilderV32')&&!$('#teamTournamentBuilderV32').classList.contains('hidden');

  if(selectedTeamTournamentV32?.tournament?.id&&detailVisible){
    selectedTeamTournamentV32=await getTeamTournamentV32(
      selectedTeamTournamentV32.tournament.id
    );
    renderTeamTournamentDetailV32();
  }

  if(detailVisible||builderVisible||$('#tab-tournaments')?.classList.contains('active')){
    await Promise.all([
      loadTeamTournamentListV32(),
      loadTeamTournamentHistoryV33()
    ]);
  }
}

async function fallbackCompetitionPollV55(){
  if(!session?.user||document.visibilityState==='hidden')return;

  // Respaldo de los duelos. Realtime sigue siendo el camino inmediato;
  // esto corrige desconexiones temporales de red / suspensión móvil.
  await refreshDuelViewsV55();

  // Si cambió el Elo por un torneo, refrescamos toda la experiencia competitiva.
  try{
    const latest=await getMyRatings(session.user.id);
    const signature=JSON.stringify(
      latest.map(r=>[r.modality,r.rating,r.matches_played,r.wins,r.losses])
    );

    if(lastRatingSignatureV55&&signature!==lastRatingSignatureV55){
      ratings=latest;
      await refreshCompetitionExperienceV55();
    }else if(!lastRatingSignatureV55){
      lastRatingSignatureV55=signature;
    }
  }catch(err){
    console.warn('V55 rating poll',err);
  }

  // Sólo hacemos polling pesado de torneos cuando realmente están abiertos.
  if(
    $('#tab-tournaments')?.classList.contains('active')||
    ($('#tournamentDetail')&&!$('#tournamentDetail').classList.contains('hidden'))
  ){
    await refreshSelectedTournamentV55().catch(()=>{});
    await refreshSelectedTeamTournamentV55().catch(()=>{});
  }
}

function stopLiveNotificationStream(){
  for(const timer of liveRefreshTimersV55.values())clearTimeout(timer);
  liveRefreshTimersV55.clear();

  if(competitionLiveSyncV55){
    competitionLiveSyncV55.stop().catch?.(()=>{});
    competitionLiveSyncV55=null;
  }
}

function startLiveNotificationStream(){
  if(!session?.user)return;

  stopLiveNotificationStream();
  const uid=session.user.id;

  competitionLiveSyncV55=createCompetitionLiveSyncV55({
    userId:uid,

    onChallengeChange:()=>{
      scheduleLiveRefreshV55('duels',refreshDuelViewsV55,70);
    },

    onMatchChange:()=>{
      scheduleLiveRefreshV55('duels',refreshDuelViewsV55,70);
      scheduleLiveRefreshV55('stats-v56',()=>loadStatsModeV56(true),120);
    },

    onRatingChange:()=>{
      scheduleLiveRefreshV55('rating',refreshRatingViewsV55,140);
    },

    onReviewChange:()=>{
      scheduleLiveRefreshV55('reviews',refreshReviewViewsV55,130);
    },

    onTournamentChange:()=>{
      scheduleLiveRefreshV55('tournaments',async()=>{
        await refreshSelectedTournamentV55();
        await loadStatsModeV56(true);
        await refreshRatingViewsV55();
      },110);
    },

    onTeamTournamentChange:()=>{
      scheduleLiveRefreshV55('team-tournaments',async()=>{
        await refreshSelectedTeamTournamentV55();
        await loadStatsModeV56(true);
        await refreshRatingViewsV55();
      },110);
    },

    onFallbackPoll:fallbackCompetitionPollV55,
    pollMs:5000
  });

  competitionLiveSyncV55.start();
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
    ${identityAvatarMarkupV44(profile,equippedFrame||'none')}
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
function statModeLabelV56(mode=statsModeV56){
  return ({
    all:'Todo',
    casual:'Casual',
    competitive:'Competitivo',
    tournament:'Torneos'
  })[mode]||'Todo';
}

function statModeDescriptionV56(mode=statsModeV56){
  return ({
    all:'Resumen unificado de Casual, Competitivo y Torneos. El Win Rate principal es el promedio entre las modalidades que ya jugaste.',
    casual:'Sólo partidos casuales: resultados sin impacto en el Elo.',
    competitive:'Sólo duelos competitivos con ranking y evolución de Elo.',
    tournament:'Todos tus partidos de torneo: individuales, dobles y enfrentamientos por equipos.'
  })[mode];
}

function selectedStatsV56(){
  return statsModeStateV56?.[statsModeV56]||{
    matches:0,wins:0,losses:0,win_rate:0,
    sets_for:0,sets_against:0,set_balance:0,
    tournaments_played:0
  };
}

function renderStatsModeTopV56(){
  const s=selectedStatsV56();
  const mode=statsModeV56;
  const played=Number(s.matches||0);
  const wr=played?Number(s.win_rate||0):0;

  if($('#statsModeDescriptionV56'))$('#statsModeDescriptionV56').textContent=statModeDescriptionV56(mode);

  if($('#statMatches'))$('#statMatches').textContent=played;
  if($('#statWins'))$('#statWins').textContent=Number(s.wins||0);
  if($('#statLosses'))$('#statLosses').textContent=Number(s.losses||0);
  if($('#statWinRate'))$('#statWinRate').textContent=played?`${wr.toFixed(1)}%`:'—';

  const texts={
    all:{
      rate:'Win Rate promedio',
      rateHint:'promedio entre modalidades activas',
      matches:'registro unificado',
      wins:'todas las modalidades',
      losses:'todas las modalidades'
    },
    casual:{
      rate:'Win Rate casual',
      rateHint:'partidos sin Elo',
      matches:'partidos casuales',
      wins:'victorias casuales',
      losses:'derrotas casuales'
    },
    competitive:{
      rate:'Win Rate competitivo',
      rateHint:'duelos con ranking',
      matches:'partidos competitivos',
      wins:'victorias competitivas',
      losses:'derrotas competitivas'
    },
    tournament:{
      rate:'Win Rate en torneos',
      rateHint:`${Number(s.tournaments_played||0)} torneo${Number(s.tournaments_played||0)===1?'':'s'} jugado${Number(s.tournaments_played||0)===1?'':'s'}`,
      matches:'partidos de torneo',
      wins:'victorias en torneo',
      losses:'derrotas en torneo'
    }
  }[mode];

  if($('#statWinRateLabelV56'))$('#statWinRateLabelV56').textContent=texts.rate;
  if($('#statWinRateHintV56'))$('#statWinRateHintV56').textContent=texts.rateHint;
  if($('#statMatchesHintV56'))$('#statMatchesHintV56').textContent=texts.matches;
  if($('#statWinsHintV56'))$('#statWinsHintV56').textContent=texts.wins;
  if($('#statLossesHintV56'))$('#statLossesHintV56').textContent=texts.losses;
}

function renderStatsDistributionV56(){
  const st=statsModeStateV56||{};
  const casual=st.casual||{};
  const competitive=st.competitive||{};
  const tournament=st.tournament||{};
  const all=st.all||{};

  if($('#statCasualMatches'))$('#statCasualMatches').textContent=Number(casual.matches||0);
  if($('#statRankedMatches'))$('#statRankedMatches').textContent=Number(competitive.matches||0);
  if($('#statTournamentMatchesV56'))$('#statTournamentMatchesV56').textContent=Number(tournament.matches||0);
  if($('#statTotalMatches'))$('#statTotalMatches').textContent=Number(all.matches||0);

  $$('[data-stats-tile-v56]').forEach(card=>{
    card.classList.toggle('active-v56',card.dataset.statsTileV56===statsModeV56);
  });
}

function renderModeComparativeV56(){
  const box=$('#comparativeStatsGrid');
  if(!box)return;

  const badge=$('#comparativePopulation');
  const kicker=$('#comparativeKickerV56');
  const title=$('#comparativeTitleV56');
  const st=statsModeStateV56||{};
  const current=selectedStatsV56();

  if(statsModeV56==='competitive'){
    const c=comparativeState||{};
    if(kicker)kicker.textContent='COMPARATIVA';
    if(title)title.textContent='Cómo estás frente a la comunidad';
    if(badge)badge.textContent=`${c.population||0} jugadores`;

    if(!c.rating){
      box.innerHTML='<div class="compact-empty">Todavía no hay suficientes datos para comparar.</div>';
      return;
    }

    const wrDelta=Number(c.win_rate.value||0)-Number(c.win_rate.average||0);
    const ratingDelta=Number(c.rating.value||0)-Number(c.rating.average||0);

    box.innerHTML=`
      <article><span>Elo</span><strong>${c.rating.value}</strong><b>Top ${c.rating.top_percent}%</b><small>${ratingDelta>=0?'+':''}${Math.round(ratingDelta)} vs promedio</small></article>
      <article><span>Win rate</span><strong>${c.win_rate.value}%</strong><b>Percentil ${c.win_rate.percentile}</b><small>${wrDelta>=0?'+':''}${wrDelta.toFixed(1)} pts vs promedio</small></article>
      <article><span>Actividad</span><strong>${c.activity.matches}</strong><b>Percentil ${c.activity.percentile}</b><small>partidos ranked jugados</small></article>`;
    return;
  }

  if(kicker)kicker.textContent=statsModeV56==='all'?'MODALIDADES':'LECTURA DEL MODO';
  if(title)title.textContent=statsModeV56==='all'?'Cómo se reparte tu actividad':`Radiografía ${statModeLabelV56().toLowerCase()}`;
  if(badge)badge.textContent=statsModeV56==='all'?'3 modalidades':statModeLabelV56();

  if(statsModeV56==='all'){
    const rows=[
      ['Casual',st.casual||{},'sin Elo'],
      ['Competitivo',st.competitive||{},'con ranking'],
      ['Torneos',st.tournament||{},'competencia organizada']
    ];
    box.innerHTML=rows.map(([name,s,detail])=>`
      <article>
        <span>${name}</span>
        <strong>${Number(s.matches||0)} PJ</strong>
        <b>${Number(s.matches||0)?Number(s.win_rate||0).toFixed(1):'0.0'}% victorias</b>
        <small>${detail}</small>
      </article>`).join('');
    return;
  }

  const balance=Number(current.wins||0)-Number(current.losses||0);
  const setBalance=Number(current.set_balance||0);
  const allMatches=Math.max(1,Number(st.all?.matches||0));
  const share=Math.round((Number(current.matches||0)/allMatches)*100);

  box.innerHTML=`
    <article><span>Actividad</span><strong>${Number(current.matches||0)}</strong><b>${share}% del total</b><small>partidos registrados</small></article>
    <article><span>Balance</span><strong>${balance>=0?'+':''}${balance}</strong><b>${Number(current.wins||0)}V–${Number(current.losses||0)}D</b><small>diferencia entre victorias y derrotas</small></article>
    <article><span>Sets</span><strong>${Number(current.sets_for||0)}–${Number(current.sets_against||0)}</strong><b>${setBalance>=0?'+':''}${setBalance}</b><small>diferencia de sets</small></article>`;
}

function renderModeRecordsV56(){
  const box=$('#personalRecordsGrid');
  if(!box)return;

  const s=selectedStatsV56();
  const title=$('#recordsTitleV56');
  const kicker=$('#recordsKickerV56');
  const badge=$('#statsComparativeLabel');

  if(statsModeV56==='competitive'){
    if(kicker)kicker.textContent='HISTORIA PERSONAL';
    if(title)title.textContent='Récords competitivos';
    loadPersonalRecords();
    return;
  }

  if(kicker)kicker.textContent='RESUMEN DEL MODO';
  if(title)title.textContent=statsModeV56==='all'?'Panorama general':`Detalle ${statModeLabelV56().toLowerCase()}`;
  if(badge)badge.textContent=statModeLabelV56();

  const balance=Number(s.wins||0)-Number(s.losses||0);
  const setBalance=Number(s.set_balance||0);

  if(statsModeV56==='tournament'){
    box.innerHTML=`
      <article><span>Torneos disputados</span><strong>${Number(s.tournaments_played||0)}</strong><small>ediciones con al menos un partido</small></article>
      <article><span>Partidos</span><strong>${Number(s.matches||0)}</strong><small>todos los encuentros de torneo</small></article>
      <article><span>Individuales</span><strong>${Number(s.tournament_individual_matches||0)}</strong><small>cuadro individual</small></article>
      <article><span>Dobles</span><strong>${Number(s.tournament_doubles_matches||0)}</strong><small>cuadro de parejas</small></article>
      <article><span>Por equipos</span><strong>${Number(s.tournament_team_matches||0)}</strong><small>encuentros dentro de series 4vs4</small></article>
      <article><span>Balance de sets</span><strong>${setBalance>=0?'+':''}${setBalance}</strong><small>${Number(s.sets_for||0)} a favor · ${Number(s.sets_against||0)} en contra</small></article>`;
    return;
  }

  if(statsModeV56==='all'){
    const weighted=Number(s.weighted_win_rate||0);
    box.innerHTML=`
      <article><span>Partidos totales</span><strong>${Number(s.matches||0)}</strong><small>suma de todas las modalidades</small></article>
      <article><span>Win Rate promedio</span><strong>${Number(s.win_rate||0).toFixed(1)}%</strong><small>promedio simple entre modalidades activas</small></article>
      <article><span>Win Rate ponderado</span><strong>${weighted.toFixed(1)}%</strong><small>ponderado por cantidad real de partidos</small></article>
      <article><span>Balance global</span><strong>${balance>=0?'+':''}${balance}</strong><small>${Number(s.wins||0)}V–${Number(s.losses||0)}D</small></article>
      <article class="record-wide"><span>Balance de sets</span><strong>${setBalance>=0?'+':''}${setBalance}</strong><small>${Number(s.sets_for||0)} sets a favor · ${Number(s.sets_against||0)} en contra</small></article>`;
    return;
  }

  box.innerHTML=`
    <article><span>Partidos</span><strong>${Number(s.matches||0)}</strong><small>${statModeLabelV56()}</small></article>
    <article><span>Victorias</span><strong>${Number(s.wins||0)}</strong><small>partidos ganados</small></article>
    <article><span>Derrotas</span><strong>${Number(s.losses||0)}</strong><small>partidos perdidos</small></article>
    <article><span>Win Rate</span><strong>${Number(s.matches||0)?Number(s.win_rate||0).toFixed(1):'0.0'}%</strong><small>rendimiento del modo</small></article>
    <article class="record-wide"><span>Balance de sets</span><strong>${setBalance>=0?'+':''}${setBalance}</strong><small>${Number(s.sets_for||0)} a favor · ${Number(s.sets_against||0)} en contra</small></article>`;
}

function renderStatsSpecializedSectionsV56(){
  const competitive=statsModeV56==='competitive';
  $$('.stats-competitive-only-v56').forEach(el=>el.classList.toggle('hidden',!competitive));
}

function renderStatsModeV56(){
  if(!statsModeStateV56)return;

  const select=$('#statsModeSelectV56');
  if(select&&select.value!==statsModeV56)select.value=statsModeV56;

  renderStatsModeTopV56();
  renderStatsDistributionV56();
  renderModeComparativeV56();
  renderModeRecordsV56();
  renderStatsSpecializedSectionsV56();
}

async function loadStatsModeV56(force=false){
  if(!session?.user)return;
  if(statsModeLoadPromiseV56&&!force)return statsModeLoadPromiseV56;

  statsModeLoadPromiseV56=(async()=>{
    try{
      statsModeStateV56=await getMyStatsV56();
      renderStatsModeV56();
    }catch(err){
      console.error('V56 estadísticas',err);
      if($('#comparativeStatsGrid')){
        $('#comparativeStatsGrid').innerHTML='<div class="compact-empty">No se pudieron cargar las estadísticas por modalidad.</div>';
      }
    }
  })();

  try{
    await statsModeLoadPromiseV56;
  }finally{
    statsModeLoadPromiseV56=null;
  }
}

function setStatsModeV56(mode){
  const clean=['all','casual','competitive','tournament'].includes(mode)?mode:'all';
  statsModeV56=clean;

  // La pantalla cambia inmediatamente con los datos ya cargados.
  renderStatsModeV56();

  // Y refresca silenciosamente desde Supabase para asegurar estado actual.
  loadStatsModeV56(true).catch(()=>{});
}

function renderComparativeStats(){
  renderModeComparativeV56();
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

  // Los récords históricos son competitivos. En otros modos el contenedor
  // lo gobierna renderModeRecordsV56().
  if(statsModeV56!=='competitive')return;

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
          <span class="recommended-avatar-online-v37" data-user-id-v35="${r.user_id}">${avatarHtml({first_name:r.first_name,last_name:r.last_name,profile_photo_url:r.profile_photo_url},'recommended-avatar')}${onlineDotV35(r.user_id)}</span>
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
  if(!matchId)return;

  // V55: el modal de valoración depende de socialState.matches.
  // Si este cambio llegó por Realtime a quien NO confirmó el resultado,
  // garantizamos que la copia local ya contiene el partido confirmado.
  if(!(socialState.matches||[]).some(x=>Number(x.id)===Number(matchId))){
    try{socialState.matches=await getMyMatches(session.user.id)}catch{}
  }

  let summary=null;
  try{summary=await getPostMatchSummary(matchId)}catch(e){console.error(e)}
  let m=(socialState.matches||[]).find(x=>Number(x.id)===Number(matchId));
  if(!m){
    try{m=(await getMyMatches(session.user.id)).find(x=>Number(x.id)===Number(matchId))||null}catch(e){}
  }
  const isCasual=(summary?.match_type||m?.match_type)==='casual';
  const delta=summary?.rating_change ?? ((newRating??0)-(oldRating??0));
  const current=summary?.current_rating ?? newRating ?? getRating('individual').rating;
  const previous=summary?.previous_rating ?? oldRating ?? current;
  const rank=summary?.current_rank||rankForRating(current);
  const toNext=summary?.to_next_rank;
  const nextRank=summary?.next_rank;
  const pos=summary?.position;
  const newBest=summary?.is_new_best;
  const format=summary?.match_format||m?.match_format||'bo3';
  const formatLabel=format==='bo5'?'Mejor de 5':format==='bo3'?'Mejor de 3':'1 set';
  const weightLabel=format==='bo5'?'Mayor peso competitivo':format==='bo3'?'Peso competitivo estándar':'Menor peso competitivo';
  const effectiveK=summary?.effective_k ?? (format==='bo5'?80:format==='bo3'?52:24);

  $('#postMatchContent').innerHTML=`
    <div class="post-match-result ${won?'victory':'defeat'}">
      <span>${won?'VICTORIA':'PARTIDO CONFIRMADO'}</span>
      <h2>${isCasual?'Sin cambio de Elo':`${Number(delta)>=0?'+':''}${delta} Elo`}</h2>
      <p>${isCasual?'Partido casual':`${previous} → <strong>${current}</strong>`}</p>
      <div class="post-match-format-chip"><b>${formatLabel}</b><span>${isCasual?'Sin ranking':`${weightLabel} · K${effectiveK}`}</span></div>
    </div>
    ${!isCasual?`<div class="post-match-progress-grid">
      <article><span>Rango</span><strong>${esc(rank)}</strong><small>${nextRank?`${toNext} Elo para ${esc(nextRank)}`:'Rango máximo'}</small></article>
      <article><span>Ranking</span><strong>${pos?`#${pos}`:'—'}</strong><small>posición actual</small></article>
      <article><span>Marca personal</span><strong>${newBest?'NUEVO RÉCORD':'En progreso'}</strong><small>${summary?.best_rating||current} Elo máximo</small></article>
    </div>`:''}
    ${newBest&&!isCasual?`<div class="post-new-record"><span>✦</span><div><strong>Nuevo máximo histórico</strong><small>Acabás de elevar tu mejor Elo personal.</small></div></div>`:''}
    <div class="v28-post-coach"><span>✦</span><div><strong>TT Coach</strong><small>${esc(buildV28CoachText())}</small></div></div>
    <div class="post-match-actions post-match-actions-v27">
      <button class="btn post-rematch-btn" data-rematch="${matchId}" type="button">↻ REVANCHA · ${formatLabel.toUpperCase()}</button>
      <button class="btn btn-start" type="button" data-close-post-match>CONTINUAR</button>
    </div>`;
  $('#postMatchModal').classList.remove('hidden');
  syncModalScrollLock();
}

async function requestRematch(matchId,button){
  let m=(socialState.matches||[]).find(x=>Number(x.id)===Number(matchId));
  if(!m){
    try{m=(await getMyMatches(session.user.id)).find(x=>Number(x.id)===Number(matchId))||null}catch(e){}
  }
  if(!m)return alert('No se pudo recuperar el partido para crear la revancha.');
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
    const [p,showcaseIds,publicPrefs,cosmetics,seasons,records,h2hAdvanced,publicTitles,reliability,adminFlagV37]=await Promise.all([
      getPublicPlayerCard(userId),
      getShowcaseAchievements(userId).catch(()=>[]),
      getPublicProfilePreferences(userId).catch(()=>({})),
      getPublicProfilePreferences(userId).catch(()=>({})),
      getPublicPlayerSeasons(userId).catch(()=>({})),
      getPlayerRecords(userId).catch(()=>({})),
      userId===session.user.id?Promise.resolve(null):getH2HAdvanced(userId).catch(()=>null),
      getPlayerTitles(userId).catch(()=>({equipped:null,items:[]})),
      getPlayerReliabilityV34(userId).catch(()=>({reliability:100,completed_matches:0,abandoned_matches:0,total_matches:0,provisional:true,label:'Jugador fiable'})),
      getPublicAdminFlagV37(userId).catch(()=>false)
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
          ${publicFramedAvatarV44(p,(cosmetics||publicPrefs)?.equipped_frame_id||'none')}
          <div class="public-profile-v17-identity">
            <p class="muted-label">PERFIL DE JUGADOR</p>
            <h2>${esc(p.first_name)} ${esc(p.last_name)}</h2>
            <p>@${esc(p.username)}</p>
            ${adminBadgeV37(adminFlagV37||isAdminV38(p.id))}
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

        ${reliabilityHtmlV34(reliability)}

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

function updateLiveResultBoard(){
  if(!currentMatch)return;
  const rows=[...$('#setInputs').querySelectorAll('.v28-score-row')];
  let p1wins=0,p2wins=0;
  let seriesFinished=false;
  let abandonment=false;
  const need=currentMatch.match_format==='bo5'?3:currentMatch.match_format==='bo3'?2:1;

  rows.forEach((row,idx)=>{
    const a=row.querySelector('[data-p1-set]');
    const b=row.querySelector('[data-p2-set]');
    const skip=row.querySelector('[data-unplayed-set]');

    row.classList.remove('auto-unplayed','abandonment-row');
    delete row.dataset.winner;

    if(seriesFinished||abandonment){
      row.classList.add('auto-unplayed');
      if(skip)skip.checked=true;
      a.disabled=true;
      b.disabled=true;
      return;
    }

    a.disabled=false;
    b.disabled=false;

    if(skip?.checked){
      // Si el usuario marca un set como no jugado, los posteriores también quedan fuera.
      seriesFinished=true;
      return;
    }

    if(a.value===''&&b.value==='')return;
    if(a.value===''||b.value==='')return;

    const x=Number(a.value),y=Number(b.value);
    if(!Number.isFinite(x)||!Number.isFinite(y)||x===y)return;

    const high=Math.max(x,y);
    const low=Math.min(x,y);

    // Ninguno llegó a 11: se interpreta visualmente como abandono.
    // No suma un set al marcador: el backend define al ganador del partido por abandono.
    if(high<11){
      abandonment=true;
      row.classList.add('abandonment-row');
      row.dataset.winner=x>y?'p1':'p2';
      return;
    }

    // Sólo contamos como set ganado si es reglamentario.
    if(high-low>=2){
      if(x>y){p1wins++;row.dataset.winner='p1'}
      else{p2wins++;row.dataset.winner='p2'}
      if(p1wins>=need||p2wins>=need)seriesFinished=true;
    }
  });

  if($('#v28LiveP1Sets'))$('#v28LiveP1Sets').textContent=p1wins;
  if($('#v28LiveP2Sets'))$('#v28LiveP2Sets').textContent=p2wins;

  const status=$('#v28LiveMatchState');
  if(status){
    if(abandonment){
      status.textContent='ABANDONO';
      status.className='v28-live-state abandonment';
    }else if(p1wins>=need||p2wins>=need){
      status.textContent='PARTIDO DEFINIDO';
      status.className='v28-live-state finished';
    }else{
      status.textContent='CARGANDO RESULTADO';
      status.className='v28-live-state';
    }
  }
}

function openMatchModal(matchId,matches=[]){
  const id=Number(matchId);
  const m=(matches||[]).find(x=>Number(x.id)===id);
  if(!m){alert('No se pudo abrir este partido. Actualizá la pantalla e intentá nuevamente.');return}
  if(m.result_status!=='pending'){alert('Este partido ya no está pendiente de resultado.');loadMatches();return}

  currentMatch=m;
  const p1=m.player1,p2=m.player2;
  const best=m.match_format==='bo5'?5:m.match_format==='bo3'?3:1;
  const need=Math.floor(best/2)+1;
  const p1name=`${p1?.first_name||'Jugador 1'} ${p1?.last_name||''}`.trim();
  const p2name=`${p2?.first_name||'Jugador 2'} ${p2?.last_name||''}`.trim();

  $('#matchModalTitle').textContent='Cargar resultado';
  $('#matchModalFormat').innerHTML=`<span>${best===1?'1 SET':`MEJOR DE ${best}`}</span><b>${matchTypeLabel(m.match_type)}</b><small>Primero en ganar ${need} ${need===1?'set':'sets'}</small>`;

  $('#setInputs').innerHTML=`
    <div class="v28-live-score">
      <div><small>${esc(p1name)}</small><strong id="v28LiveP1Sets">0</strong></div>
      <span>SETS</span>
      <div><small>${esc(p2name)}</small><strong id="v28LiveP2Sets">0</strong></div>
    </div>
    <div id="v28LiveMatchState" class="v28-live-state">CARGANDO RESULTADO</div>
    <div class="v28-score-head"><span>SET</span><span>${esc(p1?.first_name||'J1')}</span><span>${esc(p2?.first_name||'J2')}</span><span></span></div>
    ${Array.from({length:best},(_,i)=>`
      <div class="v28-score-row" data-set-number="${i+1}">
        <strong>SET ${i+1}</strong>
        <input type="number" min="0" max="99" inputmode="numeric" data-p1-set="${i+1}" aria-label="${esc(p1name)} set ${i+1}">
        <input type="number" min="0" max="99" inputmode="numeric" data-p2-set="${i+1}" aria-label="${esc(p2name)} set ${i+1}">
        <label class="v28-unplayed"><input type="checkbox" data-unplayed-set="${i+1}"><span>No jugado</span></label>
      </div>`).join('')}`;

  $('#setInputs').oninput=updateLiveResultBoard;
  $('#setInputs').onchange=updateLiveResultBoard;
  setStatus($('#matchResultStatus'),'');
  $('#matchModal').classList.add('v28-result-modal');
  $('#matchModal').classList.remove('hidden');
  syncModalScrollLock();
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

function t30EntryCountFromPlayers(players,modality=tournamentDraft.modality){
  const n=Math.max(0,Number(players)||0);
  return modality==='doubles'?Math.floor(n/2):n;
}
function t30BalancedGroupSizes(entryCount){
  const n=Math.max(0,Number(entryCount)||0);
  if(!n)return [];
  const groups=Math.max(1,Math.ceil(n/4));
  const base=Math.floor(n/groups);
  const extra=n%groups;
  return Array.from({length:groups},(_,i)=>base+(i<extra?1:0));
}
function t30RecommendedStage(total){
  if(total<=2)return 'final';
  if(total<=4)return 'sf';
  if(total<=8)return 'qf';
  if(total<=16)return 'r16';
  return 'r32';
}
function updateTournamentAutoGroupsV30(){
  const maxEl=$('#tournamentMaxPlayers');if(!maxEl)return;
  let players=Math.max(0,Number(maxEl.value)||0);
  if(tournamentDraft.modality==='doubles'&&players%2!==0)players++;
  const entries=t30EntryCountFromPlayers(players);
  const sizes=t30BalancedGroupSizes(entries);
  const count=sizes.length;
  if($('#autoGroupCountLabel'))$('#autoGroupCountLabel').textContent=count?`${count} ${count===1?'grupo':'grupos'}`:'—';
  if($('#autoGroupDistribution')){
    $('#autoGroupDistribution').textContent=sizes.length
      ?`Distribución prevista: ${sizes.map((n,i)=>`Grupo ${i+1}: ${n}`).join(' · ')}`
      :'Elegí los cupos para calcular la distribución.';
  }
  const q=Math.max(1,Number($('#tournamentQualifiers')?.value)||1);
  if($('#tournamentAfterGroupsStage')&&count){
    $('#tournamentAfterGroupsStage').value=t30RecommendedStage(count*q);
  }
}
function updateTournamentVisibilityV30(){
  const isPrivate=$('#tournamentVisibility')?.value==='private';
  $('#tournamentPrivateCodeWrap')?.classList.toggle('hidden',!isPrivate);
  if($('#tournamentPrivateCode'))$('#tournamentPrivateCode').required=isPrivate;
}
function openTournamentHubPanelV30(mode){
  tournamentHubModeV30=mode==='discover'?'discover':'history';
  $$('[data-tournament-hub-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tournamentHubTab===tournamentHubModeV30));
  $('#tournamentHubHistory')?.classList.toggle('hidden',tournamentHubModeV30!=='history');
  $('#tournamentHubDiscover')?.classList.toggle('hidden',tournamentHubModeV30!=='discover');
  if(tournamentHubModeV30==='discover')loadTournamentDiscoveryV30();
  else loadMyTournamentHistoryV30();
}
async function loadMyTournamentHistoryV30(){
  const box=$('#myTournamentHistoryV30');if(!box)return;
  box.innerHTML='<div class="loading-row">Cargando tu historial…</div>';
  try{
    const rows=await getMyTournamentHistoryV30();
    box.innerHTML=rows.length?rows.map(t=>{
      const active=t.status==='active';
      return `<article class="t30-history-card ${active?'active-tournament':''}" data-open-tournament="${t.tournament_id}">
        <div class="t30-history-main">
          <span class="t30-history-icon">${active?'●':'🏓'}</span>
          <div>
            ${active?'<b class="t30-active-badge">TORNEO ACTIVO</b>':''}
            <strong>${esc(t.name)}</strong>
            <small>${t.modality==='doubles'?'2vs2':'1vs1'} · ${tournamentPresetLabel(t.preset)} · ${t.participant_count||0} participantes</small>
            ${!active&&t.champion?'<em>🏆 Campeón</em>':(!active&&t.final_position?`<em>Puesto #${t.final_position}</em>`:'')}
          </div>
        </div>
        <span>→</span>
      </article>`;
    }).join(''):'<div class="loading-row">Todavía no participaste en ningún torneo.</div>';
  }catch(err){
    console.error(err);
    box.innerHTML='<div class="loading-row">No se pudo cargar tu historial.</div>';
  }
}
async function loadTournamentDiscoveryV30(){
  const box=$('#activeTournamentDiscoveryV30');if(!box)return;
  const q=$('#tournamentDiscoverSearch')?.value.trim()||'';
  box.innerHTML='<div class="loading-row">Buscando torneos activos…</div>';
  try{
    const rows=await searchActiveTournamentsV30(q);
    box.innerHTML=rows.length?rows.map(t=>{
      const waiting=!t.started_at&&t.registration_open;
      const full=waiting&&Number(t.participant_count)>=Number(t.max_players||0);
      const state=t.started_at?'EN JUEGO':full?'COMPLETO':'INSCRIPCIONES';
      return `<article class="t30-discovery-card">
        <button class="t30-discovery-open" type="button" data-open-tournament="${t.tournament_id}">
          <div>
            <span class="t30-visibility">${t.visibility==='private'?'🔒 PRIVADO':'🌐 PÚBLICO'}</span>
            <strong>${esc(t.name)}</strong>
            <small>Host: ${esc(t.creator_name||'Jugador')} · ${t.modality==='doubles'?'2vs2':'1vs1'} · ${tournamentPresetLabel(t.preset)}</small>
          </div>
          <b>${state}</b>
        </button>
        <div class="t30-discovery-footer">
          <span>${t.participant_count||0}/${t.max_players||'—'} jugadores</span>
          ${t.already_joined
            ?'<button class="joined" type="button" disabled>YA PARTICIPÁS</button>'
            :t.can_join
              ?`<button type="button" data-join-tournament-v30="${t.tournament_id}" data-private="${t.visibility==='private'}" data-name="${esc(t.name)}">UNIRME</button>`
              :'<button type="button" disabled>INSCRIPCIÓN CERRADA</button>'}
        </div>
      </article>`;
    }).join(''):'<div class="loading-row">No encontramos torneos activos con ese nombre.</div>';
  }catch(err){
    console.error(err);
    box.innerHTML='<div class="loading-row">No se pudieron cargar los torneos activos.</div>';
  }
}
async function loadTournamentHubV30(){
  if(tournamentHubModeV30==='discover')await loadTournamentDiscoveryV30();
  else await loadMyTournamentHistoryV30();
}
async function joinPublicTournamentV30(tournamentId){
  try{
    await joinTournamentV30(tournamentId,null);
    await Promise.all([loadTournamentDiscoveryV30(),loadMyTournamentHistoryV30()]);
    alert('Te uniste al torneo.');
  }catch(err){alert(err.message)}
}
function openPrivateJoinV30(id,name){
  pendingTournamentJoinV30=Number(id);
  $('#tournamentJoinNameV30').textContent=name||'Torneo privado';
  $('#tournamentJoinCodeV30').value='';
  setStatus($('#tournamentJoinStatusV30'),'');
  $('#tournamentJoinModalV30').classList.remove('hidden');
  syncModalScrollLock();
  setTimeout(()=>$('#tournamentJoinCodeV30')?.focus(),80);
}
function closePrivateJoinV30(){
  pendingTournamentJoinV30=null;
  $('#tournamentJoinModalV30').classList.add('hidden');
  syncModalScrollLock();
}

function teamPlayerNameV32(p){return p?`${p.first_name||''} ${p.last_name||''}`.trim()||p.username:'—'}
function renderTeamRacketsV32(){
  ['home','away'].forEach(side=>{
    const box=$(`#team${side==='home'?'Home':'Away'}RacketsV32`);
    if(!box)return;
    box.innerHTML=teamDraftV32[side].map((p,i)=>`
      <div class="team-racket-row-v32">
        <span class="team-racket-number-v32">R${i+1}</span>
        <div class="team-player-picker-v32" data-team-side="${side}" data-team-slot="${i}">
          ${p?`<div class="team-picked-player-v32"><strong>${esc(teamPlayerNameV32(p))}</strong><small>@${esc(p.username||'')}</small><button type="button" data-clear-team-player="${side}:${i}">✕</button></div>`:
          `<input type="search" data-team-player-search="${side}:${i}" placeholder="Buscar @usuario..." autocomplete="off"><div class="team-player-results-v32 hidden"></div>`}
        </div>
      </div>`).join('');
  });
  updateTeamDoublesOptionsV32();
}
function updateTeamDoublesOptionsV32(){
  const ids=[
    ['home','teamHomeD1AV32'],['home','teamHomeD1BV32'],['home','teamHomeD2AV32'],['home','teamHomeD2BV32'],
    ['away','teamAwayD1AV32'],['away','teamAwayD1BV32'],['away','teamAwayD2AV32'],['away','teamAwayD2BV32']
  ];
  ids.forEach(([side,id])=>{
    const el=$('#'+id);if(!el)return;
    const old=el.value;
    el.innerHTML='<option value="">Elegir</option>'+teamDraftV32[side].map((p,i)=>p?`<option value="${p.id}">R${i+1} · ${esc(teamPlayerNameV32(p))}</option>`:'').join('');
    if([...el.options].some(o=>o.value===old))el.value=old;
  });
}
function resetTeamTournamentBuilderV32(){
  teamDraftV32={home:[null,null,null,null],away:[null,null,null,null]};
  $('#teamHomeNameV32').value='';
  $('#teamAwayNameV32').value='';
  ['teamHomeD1AV32','teamHomeD1BV32','teamHomeD2AV32','teamHomeD2BV32','teamAwayD1AV32','teamAwayD1BV32','teamAwayD2AV32','teamAwayD2BV32'].forEach(id=>{if($('#'+id))$('#'+id).value=''});
  setStatus($('#teamTournamentCreateStatusV32'),'');
  renderTeamRacketsV32();
}
async function searchTeamPlayerV32(input){
  const [side,slotRaw]=input.dataset.teamPlayerSearch.split(':');
  const slot=Number(slotRaw);
  const results=input.parentElement.querySelector('.team-player-results-v32');
  const q=input.value.trim();
  if(q.length<1){results.classList.add('hidden');results.innerHTML='';return}
  clearTimeout(teamSearchTimerV32);
  teamSearchTimerV32=setTimeout(async()=>{
    try{
      let users=await searchTournamentUsersV8(q);
      // V48: repetir jugadores es una herramienta exclusiva de Admin.
      // Para cuentas normales ni siquiera mostramos usuarios ya elegidos.
      if(!v35Flags?.is_test_admin){
        const used=new Set([...teamDraftV32.home,...teamDraftV32.away].filter(Boolean).map(p=>String(p.id)));
        users=users.filter(u=>!used.has(String(u.id)));
      }
      users=users.slice(0,8);
      results.innerHTML=users.length?users.map(u=>`<button type="button" data-pick-team-player="${side}:${slot}:${u.id}" data-name="${esc(`${u.first_name||''} ${u.last_name||''}`.trim())}" data-user="${esc(u.username||'')}"><strong>${esc(`${u.first_name||''} ${u.last_name||''}`.trim()||u.username)}</strong><small>@${esc(u.username||'')}</small></button>`).join(''):'<span>No encontramos usuarios disponibles.</span>';
      results.classList.remove('hidden');
    }catch(err){results.innerHTML=`<span>${esc(err.message)}</span>`;results.classList.remove('hidden')}
  },220);
}
async function loadTeamTournamentListV32(){
  const box=$('#teamTournamentListV32');if(!box)return;
  box.innerHTML='<div class="loading-row">Cargando enfrentamientos…</div>';
  try{
    const rows=await listMyTeamTournamentsV32();
    box.innerHTML=rows.length?rows.map(t=>`
      <button class="team-series-history-v32" type="button" data-open-team-tournament="${t.tournament_id}">
        <div><span>${t.status==='completed'?'✓':t.status==='draw'?'＝':'●'}</span><div><strong>${esc(t.home_name)} vs ${esc(t.away_name)}</strong><small>${t.home_score}–${t.away_score} · ${t.status==='tied_pending'?'Desempate pendiente':t.status==='draw'?'Empate':t.status==='completed'?'Finalizado':'En juego'}</small></div></div><b>→</b>
      </button>`).join(''):'<div class="loading-row">Todavía no tenés torneos por equipos.</div>';
  }catch(err){box.innerHTML='<div class="loading-row">No se pudieron cargar los enfrentamientos.</div>'}
}
function openTeamTournamentBuilderV32(){
  hideAllTournamentPanelsV32();
  const builder=$('#teamTournamentBuilderV32');
  const isAdminTest=!!v35Flags?.is_test_admin;
  builder.classList.remove('hidden');
  builder.classList.toggle('team-test-mode-v32',isAdminTest);
  $('#teamTestBannerV48')?.classList.toggle('hidden',!isAdminTest);
  resetTeamTournamentBuilderV32();
  loadTeamTournamentListV32();
  loadTeamTournamentHistoryV33();
  window.scrollTo({top:0,behavior:'instant'});
}
function teamPersonMapV32(data){
  return new Map((data.players||[]).map(p=>[p.user_id,p]));
}
function teamParticipantLabelV32(match,map,side){
  const u1=map.get(match[`${side}_user1_id`]);
  const u2=map.get(match[`${side}_user2_id`]);
  if(match.match_type==='doubles')return `${u1?.name||'—'} / ${u2?.name||'—'}`;
  return u1?.name||'—';
}
async function openTeamTournamentDetailV32(id){
  try{
    selectedTeamTournamentV32=await getTeamTournamentV32(id);
    hideAllTournamentPanelsV32();
    $('#teamTournamentDetailV32').classList.remove('hidden');
    renderTeamTournamentDetailV32();
    window.scrollTo({top:0,behavior:'instant'});
  }catch(err){alert(err.message)}
}
function renderTeamTournamentDetailV32(){
  const data=selectedTeamTournamentV32;if(!data)return;
  const t=data.tournament,map=teamPersonMapV32(data);

  const statusLabel=t.status==='completed'
    ?'FINALIZADO'
    :t.status==='draw'
      ?'EMPATE'
      :t.series_decided
        ?'RESULTADO DEFINIDO'
        :t.status==='tied_pending'
          ?'5–5 · DECISIÓN'
          :'EN JUEGO';

  $('#teamTournamentScoreboardV32').innerHTML=`
    <div class="team-score-status-v32 ${t.series_decided&&t.status==='active'?'decided':''}">${statusLabel}</div>
    <div class="team-main-score-v32">
      <div><span>LOCATARIO</span><strong>${esc(t.home_name)}</strong></div>
      <b>${t.home_score} <small>—</small> ${t.away_score}</b>
      <div class="away"><span>VISITANTE</span><strong>${esc(t.away_name)}</strong></div>
    </div>
    <p>${t.series_decided&&t.status==='active'
      ?`La serie ya tiene ganador. ${t.is_host?'Finalizá el torneo para guardar el resultado oficial.':'Esperando al organizador para cerrar el torneo.'}`
      :'Primero en llegar a <strong>6 partidos</strong> · Todos los encuentros al mejor de 3 sets.'}</p>`;

  $('#teamTournamentMatchesV32').innerHTML=(data.matches||[]).map(m=>{
    const home=teamParticipantLabelV32(m,map,'home');
    const away=teamParticipantLabelV32(m,map,'away');
    const type=m.match_type==='doubles'?'DOBLES':'INDIVIDUAL';
    return `<article class="team-match-card-v32 ${m.status} ${m.winner_side?`winner-${m.winner_side}`:''}">
      <div class="team-match-no-v32"><span>P${m.match_no}</span><small>${type}</small></div>
      <div class="team-match-side-v32 ${m.winner_side==='home'?'winner':''}">
        <strong>${esc(home)}</strong>${m.status==='completed'?`<b>${m.home_sets}</b>`:''}
      </div>
      <span class="team-match-vs-v32">VS</span>
      <div class="team-match-side-v32 away ${m.winner_side==='away'?'winner':''}">
        <strong>${esc(away)}</strong>${m.status==='completed'?`<b>${m.away_sets}</b>`:''}
      </div>
      <div class="team-match-action-v32">
        ${m.status==='pending'&&t.is_host&&!t.series_decided
          ?`<button type="button" data-team-match-result="${m.id}">Cargar resultado</button>`
          :m.status==='completed'
            ?'<span>✓ Finalizado</span>'
            :m.status==='unplayed'
              ?'<span>No jugado</span>'
              :'<span>Pendiente</span>'}
      </div>
    </article>`;
  }).join('');

  const tb=$('#teamTournamentTiebreakV32');
  if(t.status==='tied_pending'&&t.is_host){
    tb.classList.remove('hidden');
    tb.innerHTML=`<div class="team-tiebreak-decision-v32">
      <div>
        <p class="muted-label">5–5</p>
        <h3>¿Cómo termina la serie?</h3>
        <span>Podés jugar un dobles decisivo o cerrar oficialmente el torneo como empate.</span>
      </div>
      <div>
        <button type="button" data-open-team-tiebreak>⚔ DESEMPATE</button>
        <button class="draw" type="button" data-finalize-team-draw>FINALIZAR 5–5</button>
      </div>
    </div>`;
  }else{
    tb.classList.add('hidden');
  }

  const fin=$('#teamTournamentFinalizeV33');
  if(t.series_decided&&t.status==='active'){
    fin.classList.remove('hidden');
    const winner=t.winner_side==='home'?t.home_name:t.away_name;
    fin.innerHTML=t.is_host
      ?`<div class="team-finalize-panel-v33">
          <div>
            <p class="muted-label">SERIE DEFINIDA</p>
            <h3>🏆 ${esc(winner)} ganó ${t.home_score}–${t.away_score}</h3>
            <span>Confirmá el cierre para guardar oficialmente el resultado y mostrar el resumen final.</span>
          </div>
          <button type="button" data-finalize-team-v33>FINALIZAR TORNEO</button>
        </div>`
      :`<div class="team-finalize-panel-v33 waiting">
          <div>
            <p class="muted-label">SERIE DEFINIDA</p>
            <h3>${esc(winner)} ganó ${t.home_score}–${t.away_score}</h3>
            <span>Esperando a que el organizador finalice el torneo.</span>
          </div>
        </div>`;
  }else{
    fin.classList.add('hidden');
  }

  const summary=$('#teamTournamentSummaryV32');
  if(['completed','draw'].includes(t.status)){
    summary.classList.remove('hidden');
    const winner=t.status==='draw'?'EMPATE':t.winner_side==='home'?t.home_name:t.away_name;
    summary.innerHTML=`<div class="section-title-row">
        <div><p class="muted-label">RESUMEN FINAL</p><h3>${t.status==='draw'?'Serie empatada':`🏆 ${esc(winner)}`}</h3></div>
        <strong>${t.home_score}–${t.away_score}</strong>
      </div>
      ${v35Flags?.is_test_admin&&t.test_mode?'<div class="team-elo-test-v33">🧪 Modo prueba: los resultados no modificaron Elo.</div>':''}
      <div class="team-elo-summary-v32">${(data.elo_summary||[]).map(s=>`<article>
        <strong>${esc(s.name)}</strong>
        <small>${s.matches_played} PJ · ${s.wins}V–${s.losses}D</small>
        <div>
          <span>Individual <b class="${s.individual_change>=0?'positive':'negative'}">${s.individual_change>=0?'+':''}${s.individual_change}</b></span>
          <span>Dobles <b class="${s.doubles_change>=0?'positive':'negative'}">${s.doubles_change>=0?'+':''}${s.doubles_change}</b></span>
        </div>
        <em>TOTAL ${s.total_change>=0?'+':''}${s.total_change} Elo</em>
      </article>`).join('')}</div>`;
  }else{
    summary.classList.add('hidden');
  }
}
function openTeamMatchModalV32(matchId){
  const data=selectedTeamTournamentV32;if(!data)return;
  currentTeamMatchV32=(data.matches||[]).find(m=>Number(m.id)===Number(matchId));
  if(!currentTeamMatchV32)return;
  const map=teamPersonMapV32(data),t=data.tournament;
  const home=teamParticipantLabelV32(currentTeamMatchV32,map,'home');
  const away=teamParticipantLabelV32(currentTeamMatchV32,map,'away');
  $('#teamMatchModalTitleV32').textContent=`Partido ${currentTeamMatchV32.match_no} · ${currentTeamMatchV32.match_type==='doubles'?'Dobles':'Individual'}`;
  $('#teamMatchModalSubtitleV32').textContent=`${home} vs ${away}`;
  $('#teamModalHomeV32').textContent=t.home_name;
  $('#teamModalAwayV32').textContent=t.away_name;
  $('#teamSetInputsV32').innerHTML=[1,2,3].map(n=>`<div class="team-set-row-v32"><strong>SET ${n}</strong><input type="number" min="0" max="99" inputmode="numeric" data-team-home-set="${n}" placeholder="0"><span>—</span><input type="number" min="0" max="99" inputmode="numeric" data-team-away-set="${n}" placeholder="0"></div>`).join('');
  setStatus($('#teamMatchStatusV32'),'');
  $('#teamMatchModalV32').classList.remove('hidden');syncModalScrollLock();
}
function populateTeamTiebreakV32(){
  const data=selectedTeamTournamentV32;if(!data)return;
  ['home','away'].forEach(side=>{
    const arr=(data.players||[]).filter(p=>p.side===side).sort((a,b)=>a.racket_no-b.racket_no);
    const prefix=side==='home'?'Home':'Away';
    [`teamTiebreak${prefix}AV32`,`teamTiebreak${prefix}BV32`].forEach(id=>{
      $('#'+id).innerHTML=arr.map(p=>`<option value="${p.user_id}">R${p.racket_no} · ${esc(p.name)}</option>`).join('');
    });
  });
}

function hideAllTournamentPanelsV32(){
  [
    '#tournamentModeChooser',
    '#tournamentPresetChooser',
    '#tournamentBuilder',
    '#tournamentDetail',
    '#teamTournamentBuilderV32',
    '#teamTournamentDetailV32'
  ].forEach(sel=>$(sel)?.classList.add('hidden'));
}
function showTournamentModesV32(){
  hideAllTournamentPanelsV32();
  $('#tournamentModeChooser')?.classList.remove('hidden');
  tournamentDraft.modality=null;
  tournamentDraft.preset=null;
  window.scrollTo({top:0,behavior:'instant'});
}

async function loadTeamTournamentHistoryV33(){
  const box=$('#teamTournamentHistoryV33');if(!box)return;
  box.innerHTML='<div class="loading-row">Cargando historial…</div>';
  try{
    const rows=await listMyTeamTournamentHistoryV33();
    box.innerHTML=rows.length?rows.map(t=>{
      const draw=t.status==='draw';
      const result=`${t.home_score}–${t.away_score}`;
      const winner=draw?'Empate':t.winner_side==='home'?t.home_name:t.away_name;
      return `<button class="team-history-card-v33" type="button" data-open-team-tournament="${t.tournament_id}">
        <div class="team-history-result-v33">
          <strong>${esc(t.home_name)}</strong>
          <b>${result}</b>
          <strong>${esc(t.away_name)}</strong>
        </div>
        <div class="team-history-meta-v33">
          <span>${draw?'＝ EMPATE':`🏆 ${esc(winner)}`}</span>
          <small>${t.completed_at?new Date(t.completed_at).toLocaleDateString('es-UY'):''}${v35Flags?.is_test_admin&&t.test_mode?' · 🧪 prueba':''}</small>
        </div>
      </button>`;
    }).join(''):'<div class="loading-row">Todavía no tenés resultados de torneos por equipos.</div>';
  }catch(err){
    console.error(err);
    box.innerHTML='<div class="loading-row">No se pudo cargar el historial por equipos.</div>';
  }
}
function showTeamVictoryV33(data){
  if(!data?.tournament)return;
  const t=data.tournament;
  const draw=t.status==='draw';
  const winnerName=draw?'Empate':t.winner_side==='home'?t.home_name:t.away_name;

  $('#teamVictoryTitleV33').textContent=draw?'¡Partido finalizado!':'¡Felicitaciones!';
  $('#teamVictoryEyebrowV33').textContent=draw?'TORNEO DE EQUIPOS · EMPATE':'TORNEO DE EQUIPOS 4 VS 4';
  $('#teamVictoryClubV33').textContent=draw?`${t.home_name} · ${t.away_name}`:winnerName;
  $('#teamVictoryScoreV33').innerHTML=`${t.home_score} <small>—</small> ${t.away_score}`;
  $('#teamVictoryHomeV33').textContent=t.home_name;
  $('#teamVictoryAwayV33').textContent=t.away_name;

  const badge=$('.team-victory-emblem-v33 b');
  if(badge)badge.textContent=draw?'EMPATE':'CAMPEÓN';

  $('#teamVictoryOverlayV33').classList.remove('hidden');
  syncModalScrollLock();
}
function closeTeamVictoryV33(){
  $('#teamVictoryOverlayV33')?.classList.add('hidden');
  syncModalScrollLock();
}
function showTeamEloV33(){
  const data=selectedTeamTournamentV32;if(!data)return;
  const t=data.tournament;
  closeTeamVictoryV33();

  $('#teamEloSubtitleV33').textContent=`${t.home_name} ${t.home_score}–${t.away_score} ${t.away_name}`;
  $('#teamEloTestNoticeV33').classList.toggle('hidden',!(v35Flags?.is_test_admin&&t.test_mode));

  const rows=data.elo_summary||[];
  $('#teamEloPlayersV33').innerHTML=rows.length?rows.map(s=>`
    <article class="team-elo-player-v33">
      <div>
        <strong>${esc(s.name)}</strong>
        <small>${s.matches_played||0} partidos · ${s.wins||0}V–${s.losses||0}D</small>
      </div>
      <div class="team-elo-splits-v33">
        <span>Individual <b class="${s.individual_change>0?'positive':s.individual_change<0?'negative':''}">${s.individual_change>0?'+':''}${s.individual_change||0}</b></span>
        <span>Dobles <b class="${s.doubles_change>0?'positive':s.doubles_change<0?'negative':''}">${s.doubles_change>0?'+':''}${s.doubles_change||0}</b></span>
      </div>
      <em class="${s.total_change>0?'positive':s.total_change<0?'negative':''}">TOTAL ${s.total_change>0?'+':''}${s.total_change||0} Elo</em>
    </article>`).join(''):'<div class="loading-row">No hay movimientos de Elo para mostrar.</div>';

  $('#teamEloOverlayV33').classList.remove('hidden');
  syncModalScrollLock();
}
function closeTeamEloV33(){
  $('#teamEloOverlayV33')?.classList.add('hidden');
  syncModalScrollLock();
}
async function finalizeCurrentTeamTournamentV33(){
  const data=selectedTeamTournamentV32;
  if(!data?.tournament)return;
  const t=data.tournament;
  try{
    await finalizeTeamTournamentV33(t.id);
    selectedTeamTournamentV32=await getTeamTournamentV32(t.id);
    renderTeamTournamentDetailV32();
    await Promise.all([loadTeamTournamentListV32(),loadTeamTournamentHistoryV33()]);
    showTeamVictoryV33(selectedTeamTournamentV32);
  }catch(err){
    alert(err.message);
  }
}
function resetTournamentWizard(){
  tournamentDraft={modality:null,preset:null,selectedUsers:[]};
  hideAllTournamentPanelsV32();
  $('#tournamentModeChooser').classList.remove('hidden');
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
  hideAllTournamentPanelsV32();
  $('#selectedTournamentModeTitle').textContent=modality==='doubles'?'Torneo 2vs2':'Torneo 1vs1';
  $('#tournamentPresetChooser').classList.remove('hidden');
  window.scrollTo({top:0,behavior:'instant'});
}
function openTournamentBuilder(preset){
  tournamentDraft.preset=preset;
  tournamentDraft.selectedUsers=[];
  hideAllTournamentPanelsV32();
  $('#tournamentBuilder').classList.remove('hidden');
  $('#tournamentBuilderTitle').textContent=`${tournamentDraft.modality==='doubles'?'2vs2':'1vs1'} · ${tournamentPresetLabel(preset)}`;
  $('#customSetOptions').classList.toggle('hidden',preset!=='custom');
  $('#participantRequirement').textContent='Podrán unirse hasta completar los cupos';
  $('#tournamentMaxPlayers').min=tournamentDraft.modality==='doubles'?'4':'2';
  $('#tournamentMaxPlayers').step=tournamentDraft.modality==='doubles'?'2':'1';
  $('#tournamentMaxPlayers').value=tournamentDraft.modality==='doubles'?'8':'8';
  $('#tournamentVisibility').value='public';
  $('#tournamentPrivateCode').value='';
  $('#tournamentHostPlays').checked=true;
  updateTournamentVisibilityV30();
  updateTournamentAutoGroupsV30();
  renderSelectedTournamentPlayers();
}
function updateGroupOptions(){
  $('#groupOptions').classList.toggle('hidden',$('#tournamentStartStage').value!=='groups');
  updateTournamentAutoGroupsV30();
}
function renderSelectedTournamentPlayers(){
  const box=$('#selectedTournamentPlayers');if(!box)return;
  $('#selectedParticipantCount').textContent=`${tournamentDraft.selectedUsers.length} ${tournamentDraft.selectedUsers.length===1?'invitado':'invitados'}`;
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

function tournamentStageLabelV31(stage){
  return {groups:'Fase de grupos',r32:'Dieciseisavos',r16:'Octavos',qf:'Cuartos de final',sf:'Semifinal',final:'Final'}[stage]||stage;
}
function tournamentStageOrderV31(stage){
  return {groups:0,r32:1,r16:2,qf:3,sf:4,final:5}[stage]??9;
}
function renderTournamentStandingsV31(standings=[]){
  if(!standings.length)return '';
  const groups=new Map();
  standings.forEach(r=>{
    if(!groups.has(r.group_no))groups.set(r.group_no,[]);
    groups.get(r.group_no).push(r);
  });
  return [...groups.entries()].map(([g,rows])=>`
    <section class="t31-group-table-card">
      <div class="t31-group-title"><span>GRUPO ${g}</span><small>Todos contra todos</small></div>
      <div class="t31-table">
        <div class="t31-table-head"><span>#</span><span>Jugador</span><span>PG</span><span>DS</span><span>DP</span></div>
        ${rows.sort((a,b)=>a.position-b.position).map(r=>`
          <div class="t31-table-row ${r.position<=Number(selectedTournament.qualifiers_per_group||1)?'qualified':''}">
            <b>${r.position}</b><strong>${esc(r.display_name)}</strong><span>${r.wins}</span>
            <span>${r.set_diff>0?'+':''}${r.set_diff}</span>
            <span>${r.point_diff>0?'+':''}${r.point_diff}</span>
          </div>`).join('')}
      </div>
      <p class="t31-tiebreak-note">Desempate: partidos ganados → enfrentamiento directo → diferencia de sets → diferencia de puntos → sorteo.</p>
    </section>`).join('');
}
function renderKnockoutV31(games=[],entryMap=new Map()){
  const stages=[...new Set(games.filter(g=>g.stage!=='groups').map(g=>g.stage))]
    .sort((a,b)=>tournamentStageOrderV31(a)-tournamentStageOrderV31(b));
  return `<section class="t31-bracket">${stages.map(stage=>{
    const stageGames=games.filter(g=>g.stage===stage).sort((a,b)=>a.match_index-b.match_index);
    return `<div class="t31-stage-column ${stage==='final'?'final-stage':''}">
      <div class="t31-stage-heading"><span>${tournamentStageLabelV31(stage)}</span><b>${stageGames.length} ${stageGames.length===1?'partido':'partidos'}</b></div>
      <div class="t31-stage-games">${stageGames.map(g=>{
        const e1=entryMap.get(g.entry1_id),e2=entryMap.get(g.entry2_id);
        const bye=g.status==='bye';
        return `<article class="t31-match-card ${bye?'bye-match':''}">
          ${bye?'<span class="t31-bye-badge">PASE DIRECTO</span>':''}
          <div class="${g.winner_entry_id===g.entry1_id?'winner':''}"><span>${esc(e1?.display_name||'—')}</span>${g.winner_entry_id===g.entry1_id?'<b>✓</b>':''}</div>
          <div class="${g.winner_entry_id===g.entry2_id?'winner':''}"><span>${esc(e2?.display_name||'—')}</span>${g.winner_entry_id===g.entry2_id?'<b>✓</b>':''}</div>
          ${g.status==='pending'?`<button type="button" data-t8-result="${g.id}">Registrar resultado</button>`:g.status==='completed'?'<small>Finalizado</small>':bye?'<small>Avanza automáticamente</small>':'<small>Esperando clasificados</small>'}
        </article>`;
      }).join('')}</div>
    </div>`;
  }).join('')}</section>`;
}
async function renderTournamentBracket(){
  if(!selectedTournament)return;
  const box=$('#tournamentBracket');

  if(!selectedTournament.started_at){
    try{
      const lobby=await getTournamentLobbyV30(selectedTournament.id);
      const people=lobby.participants||[];
      box.innerHTML=`<section class="t30-lobby">
        <div class="t30-lobby-head">
          <div><p class="muted-label">INSCRIPCIONES ${lobby.registration_open?'ABIERTAS':'CERRADAS'}</p><h4>${lobby.participant_count||0}/${lobby.max_players||'—'} jugadores</h4></div>
          <span>${lobby.visibility==='private'?'🔒 Privado':'🌐 Público'}</span>
        </div>
        <div class="t30-lobby-people">${people.length?people.map(p=>`<div><span>${p.photo?`<img src="${esc(p.photo)}" alt="">`:esc((p.name||'TT').slice(0,2).toUpperCase())}</span><strong>${esc(p.name||p.username||'Jugador')}</strong><small>@${esc(p.username||'')}</small></div>`).join(''):'<p class="loading-row">Todavía no hay participantes.</p>'}</div>
        ${lobby.is_host?`<div class="t30-host-actions"><button class="btn btn-start" type="button" data-start-tournament-v30="${selectedTournament.id}">INICIAR TORNEO</button><small>La estructura se adaptará automáticamente a la cantidad real de participantes.</small></div>`:lobby.already_joined?'<div class="t30-waiting-host">✓ Estás inscripto. Esperando al organizador.</div>':''}
      </section>`;
    }catch(err){
      box.innerHTML=`<div class="t30-structure-error"><strong>No se pudo cargar el torneo.</strong><span>${esc(err.message||'Intentá nuevamente.')}</span><button type="button" data-retry-tournament-v30>Reintentar</button></div>`;
    }
    $('#groupCloseArea').classList.add('hidden');
    $('#finalizeTournamentArea').classList.add('hidden');
    $('#finalStandingsArea').classList.add('hidden');
    return;
  }

  try{
    const [entries,games,standings]=await Promise.all([
      getTournamentEntriesV8(selectedTournament.id),
      getTournamentGamesV8(selectedTournament.id),
      getTournamentStandingsV31(selectedTournament.id)
    ]);
    const entryMap=new Map(entries.map(e=>[e.id,e]));
    const groupGames=games.filter(g=>g.stage==='groups');
    const knockout=games.filter(g=>g.stage!=='groups');
    let html='';

    if(groupGames.length){
      html+=`<section class="t31-groups-wrap">
        <div class="t31-section-head"><div><p class="muted-label">FASE DE GRUPOS</p><h4>${selectedTournament.group_count||1} ${Number(selectedTournament.group_count||1)===1?'grupo':'grupos'}</h4></div><span>Todos contra todos</span></div>
        ${renderTournamentStandingsV31(standings)}
        <div class="t31-group-matches">
          ${[...new Set(groupGames.map(g=>g.group_no))].sort((a,b)=>a-b).map(groupNo=>`
            <div class="t31-group-match-list"><strong>Partidos · Grupo ${groupNo}</strong>
              ${groupGames.filter(g=>g.group_no===groupNo).map(g=>{
                const e1=entryMap.get(g.entry1_id),e2=entryMap.get(g.entry2_id);
                return `<button class="t31-group-game ${g.status==='completed'?'completed':''}" type="button" ${g.status==='completed'?'disabled':`data-t8-result="${g.id}"`}>
                  <span>${esc(e1?.display_name||'—')}</span><b>VS</b><span>${esc(e2?.display_name||'—')}</span><small>${g.status==='completed'?'Finalizado':'Cargar resultado'}</small>
                </button>`;
              }).join('')}
            </div>`).join('')}
        </div>
      </section>`;
    }

    if(knockout.length)html+=renderKnockoutV31(knockout,entryMap);

    box.innerHTML=html||`<div class="t30-structure-error"><strong>No se generó una estructura válida.</strong><span>Reintentá la carga.</span><button type="button" data-retry-tournament-v30>Reintentar</button></div>`;

    const groupsPending=groupGames.some(g=>g.status!=='completed');
    const finalDone=knockout.some(g=>g.stage==='final'&&g.status==='completed');
    $('#groupCloseArea').classList.toggle('hidden',!groupGames.length||groupsPending||knockout.length>0);
    $('#finalizeTournamentArea').classList.toggle('hidden',!finalDone||selectedTournament.status==='completed');
    $('#finalStandingsArea').classList.toggle('hidden',selectedTournament.status!=='completed');
    if(selectedTournament.status==='completed'){
      try{
        const finalRows=await getTournamentStandingsV8(selectedTournament.id);
        renderFinalStandings(finalRows);
      }catch(standErr){
        console.error('tabla final',standErr);
        $('#tournamentStandings').innerHTML='<div class="loading-row">No se pudo cargar la tabla final.</div>';
      }
    }
  }catch(err){
    console.error(err);
    box.innerHTML=`<div class="t30-structure-error"><strong>No se pudo construir la vista del torneo.</strong><span>${esc(err.message||'Error inesperado.')}</span><button type="button" data-retry-tournament-v30>Reintentar</button></div>`;
  }
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
    $('#tournamentMaxPlayers').value=selectedTournament.max_players||Math.max(2,profiles.length);
    $('#tournamentVisibility').value=selectedTournament.visibility||'public';
    $('#tournamentPrivateCode').value='';
    $('#tournamentHostPlays').checked=profiles.some(p=>p.id===session.user.id);
    updateTournamentVisibilityV30();
    updateGroupOptions();
    updateTournamentAutoGroupsV30();
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

// ============================================================
// V48 — Menú de foto estable: portal + popover/action-sheet.
// Ya no vive dentro del stacking-context del avatar, por lo que el rating
// nunca puede dibujarse por encima del menú.
// ============================================================
function ensureProfilePhotoMenuPortalV48(){
  const menu=$('#profilePhotoMenu');
  if(!menu)return null;
  if(menu.parentElement!==document.body)document.body.appendChild(menu);
  menu.classList.add('tt-photo-popover-v48');
  return menu;
}
function ensureProfilePhotoBackdropV48(){
  let back=$('#profilePhotoBackdropV48');
  if(!back){
    back=document.createElement('button');
    back.id='profilePhotoBackdropV48';
    back.type='button';
    back.className='tt-photo-backdrop-v48 hidden';
    back.setAttribute('aria-label','Cerrar opciones de foto');
    back.addEventListener('click',closeProfilePhotoMenu);
    document.body.appendChild(back);
  }
  return back;
}
function positionProfilePhotoMenuV48(){
  const menu=ensureProfilePhotoMenuPortalV48();
  const button=$('#profilePhotoMenuButton');
  if(!menu||!button||menu.classList.contains('hidden'))return;

  // En móvil/tablet compacto funciona como action sheet inferior.
  if(window.innerWidth<=900){
    menu.style.left='';menu.style.right='';menu.style.top='';menu.style.bottom='';
    return;
  }

  const r=button.getBoundingClientRect();
  const gap=12,edge=14;
  const width=Math.min(300,window.innerWidth-edge*2);
  menu.style.width=`${width}px`;
  menu.style.bottom='auto';
  menu.style.right='auto';
  menu.style.top='0px';
  menu.style.left='0px';

  const h=menu.getBoundingClientRect().height||190;
  let left=r.right+gap;
  if(left+width>window.innerWidth-edge)left=r.left-width-gap;
  left=Math.max(edge,Math.min(left,window.innerWidth-width-edge));

  let top=r.top+r.height/2-h/2;
  top=Math.max(edge,Math.min(top,window.innerHeight-h-edge));
  menu.style.left=`${Math.round(left)}px`;
  menu.style.top=`${Math.round(top)}px`;
}
function openProfilePhotoMenu(){
  const menu=ensureProfilePhotoMenuPortalV48();
  const back=ensureProfilePhotoBackdropV48();
  if(!menu)return;
  const opening=menu.classList.contains('hidden');
  if(!opening){closeProfilePhotoMenu();return}
  menu.classList.remove('hidden');
  back?.classList.remove('hidden');
  $('#profilePhotoMenuButton')?.setAttribute('aria-expanded','true');
  requestAnimationFrame(positionProfilePhotoMenuV48);
}
function closeProfilePhotoMenu(){
  $('#profilePhotoMenu')?.classList.add('hidden');
  $('#profilePhotoBackdropV48')?.classList.add('hidden');
  $('#profilePhotoMenuButton')?.setAttribute('aria-expanded','false');
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



function normalizeClubNameClientV49(value=''){
  return String(value).trim().replace(/\s+/g,' ');
}
function clubByIdV49(id){
  return (availableClubsV49||[]).find(c=>String(c.id)===String(id))||null;
}

function clubDirectoryOptionsV50(clubs=[]){
  const groups=new Map();
  for(const c of clubs){
    const dept=c.department||'Otros';
    if(!groups.has(dept))groups.set(dept,[]);
    groups.get(dept).push(c);
  }

  const ordered=[...groups.entries()].sort((a,b)=>{
    if(a[0]==='Otros')return 1;
    if(b[0]==='Otros')return -1;
    return a[0].localeCompare(b[0],'es');
  });

  return ordered.map(([dept,items])=>`<optgroup label="${esc(dept)}">${
    items.map(c=>{
      const place=c.locality&&c.locality!==dept?` · ${esc(c.locality)}`:'';
      return `<option value="${c.id}">${esc(c.name)}${place}</option>`;
    }).join('')
  }</optgroup>`).join('');
}
async function loadAvailableClubsV49(preferred=''){
  const select=$('#clubName');
  if(!select)return;
  const previous=preferred||select.value||'';

  try{
    availableClubsV49=await getClubsV51();
    const options=[
      '<option value="">Seleccioná</option>',
      '<option value="N/A">N/A — No pertenezco a un club</option>',
      clubDirectoryOptionsV50(availableClubsV49||[]),
      '<option value="Otro">Otro</option>'
    ];
    select.innerHTML=options.join('');

    if(previous&&[...select.options].some(o=>o.value===String(previous)))select.value=String(previous);

    const hint=$('#clubDirectoryHintV47');
    if(hint)hint.textContent=availableClubsV49.length
      ?`${availableClubsV49.length} club${availableClubsV49.length===1?'':'es'} oficial${availableClubsV49.length===1?'':'es'} en TT Rivals.`
      :'Si alguien registra un club nuevo, aparecerá acá automáticamente.';
  }catch(err){
    console.error('loadAvailableClubsV49',err);
    const hint=$('#clubDirectoryHintV47');
    if(hint)hint.textContent='No se pudo actualizar el directorio de clubes. Podés continuar y escribir “Otro”.';
  }
}

async function renderClubSuggestionsV49(input,box,context){
  if(!input||!box)return;
  const q=normalizeClubNameClientV49(input.value);
  if(q.length<2){box.classList.add('hidden');box.innerHTML='';return}

  try{
    const rows=await suggestClubsV51(q,8);
    if(!rows.length){box.classList.add('hidden');box.innerHTML='';return}
    box.innerHTML=`<div class="club-suggestions-head-v49"><strong>¿Ya existe?</strong><small>Elegí el club oficial para evitar duplicados.</small></div>`+
      rows.map(r=>`<button type="button" data-use-club-v49="${r.id}" data-club-context-v49="${context}">
        <span>🏓</span>
        <div><strong>${esc(r.name)}</strong><small>${r.department?`${esc(r.department)}${r.locality&&r.locality!==r.department?` · ${esc(r.locality)}`:''} · `:''}${r.display_alias&&r.display_alias!==r.name?`Perfil: ${esc(r.display_alias)} · `:''}${r.reason==='sigla'?'Coincide por sigla':r.reason==='alias'||r.reason==='alias_visible'?'Nombre alternativo reconocido':'Nombre parecido'}</small></div>
        <b>USAR</b>
      </button>`).join('');
    box.classList.remove('hidden');
  }catch(err){
    console.warn('suggestClubsV49',err);
    box.classList.add('hidden');
  }
}

function scheduleClubSuggestionsV49(input,box,context){
  clearTimeout(clubSuggestionTimerV49);
  clubSuggestionTimerV49=setTimeout(()=>renderClubSuggestionsV49(input,box,context),220);
}

function syncCustomClubVisibilityV49(){
  const c=$('#clubName')?.value==='Otro';
  $('#customClubWrap')?.classList.toggle('hidden',!c);
  if($('#customClubName'))$('#customClubName').required=!!c;
  if(!c){
    $('#customClubSuggestionsV49')?.classList.add('hidden');
  }else{
    setTimeout(()=>$('#customClubName')?.focus(),80);
  }
}

async function loadSettingsClubV49(){
  const select=$('#prefProfileClubSelect');
  if(!select)return;

  const [clubs,current]=await Promise.all([
    getClubsV51(),
    getMyClubV51().catch(()=>({club_id:null,name:profile?.club_name||'N/A'}))
  ]);
  availableClubsV49=clubs||[];
  myClubV49=current||{club_id:null,name:'N/A'};

  select.innerHTML=[
    '<option value="N/A">N/A — No pertenezco a un club</option>',
    clubDirectoryOptionsV50(availableClubsV49||[]),
    '<option value="Otro">Otro</option>'
  ].join('');

  if(myClubV49.club_id&&[...select.options].some(o=>o.value===String(myClubV49.club_id))){
    select.value=String(myClubV49.club_id);
  }else{
    select.value='N/A';
  }

  $('#prefProfileCustomClubWrapV49')?.classList.add('hidden');
  $('#prefProfileClubSuggestionsV49')?.classList.add('hidden');
  const hint=$('#prefProfileClubHintV49');
  if(hint)hint.textContent=myClubV49.club_id
    ?`Club oficial: ${myClubV49.name} · En tu perfil: ${myClubV49.display_alias||myClubV49.name}.`
    :'No pertenecés a un club.';
}

function syncSettingsClubVisibilityV49(){
  const isOther=$('#prefProfileClubSelect')?.value==='Otro';
  $('#prefProfileCustomClubWrapV49')?.classList.toggle('hidden',!isOther);
  if(!isOther){
    $('#prefProfileClubSuggestionsV49')?.classList.add('hidden');
    if($('#prefProfileCustomClubV49'))$('#prefProfileCustomClubV49').value='';
  }else{
    setTimeout(()=>$('#prefProfileCustomClubV49')?.focus(),80);
  }
}

async function resolveSelectedClubV49(selectId,customInputId){
  const select=$(selectId);
  const value=select?.value||'N/A';
  if(value==='N/A'||value===''){
    return {club_id:null,name:'N/A',created:false};
  }
  if(value==='Otro'){
    const raw=normalizeClubNameClientV49($(customInputId)?.value||'');
    if(raw.length<2)throw new Error('Escribí el nombre del club.');
    const result=await ensureClubV51(raw);
    if(!result?.club_id)throw new Error('No se pudo registrar el club.');
    return result;
  }
  const club=clubByIdV49(value);
  if(!club)throw new Error('El club seleccionado ya no está disponible. Actualizá la lista.');
  return {club_id:Number(club.id),name:club.name,created:false};
}

$('#clubName').onchange=syncCustomClubVisibilityV49;
$('#customClubName')?.addEventListener('input',()=>scheduleClubSuggestionsV49(
  $('#customClubName'),
  $('#customClubSuggestionsV49'),
  'onboarding'
));
$('#prefProfileClubSelect')?.addEventListener('change',syncSettingsClubVisibilityV49);
$('#prefProfileCustomClubV49')?.addEventListener('input',()=>scheduleClubSuggestionsV49(
  $('#prefProfileCustomClubV49'),
  $('#prefProfileClubSuggestionsV49'),
  'settings'
));

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-use-club-v49]');
  if(!b)return;
  const id=String(b.dataset.useClubV49||'');
  const context=b.dataset.clubContextV49;

  if(context==='onboarding'){
    const select=$('#clubName');
    if(select&&[...select.options].some(o=>o.value===id)){
      select.value=id;
      syncCustomClubVisibilityV49();
      $('#customClubName').value='';
    }
  }else if(context==='settings'){
    const select=$('#prefProfileClubSelect');
    if(select&&[...select.options].some(o=>o.value===id)){
      select.value=id;
      syncSettingsClubVisibilityV49();
    }
  }
});

async function ensureLegalConfigV57(force=false){
  if(legalConfigV57&&!force)return legalConfigV57;
  legalConfigV57=await getPublicLegalConfigV57();
  return legalConfigV57;
}

async function openLegalModalV57(type='terms'){
  currentLegalTabV57=type==='privacy'?'privacy':'terms';
  const modal=$('#legalModalV57'),body=$('#legalModalBodyV57');
  if(!modal||!body)return;

  modal.classList.remove('hidden');
  syncModalScrollLock();
  body.innerHTML='<div class="loading-row">Cargando documento…</div>';

  $$('[data-legal-tab-v57]').forEach(b=>{
    b.classList.toggle('active',b.dataset.legalTabV57===currentLegalTabV57);
  });

  try{
    const cfg=await ensureLegalConfigV57();
    body.innerHTML=renderLegalDocumentV57(currentLegalTabV57,cfg);
    $('#legalModalTitleV57').textContent=currentLegalTabV57==='terms'
      ?'Términos y Condiciones'
      :'Política de Privacidad';
    body.scrollTop=0;
  }catch(err){
    body.innerHTML=`<div class="compact-empty">${esc(err.message||'No se pudo cargar el documento.')}</div>`;
  }
}

function closeLegalModalV57(){
  $('#legalModalV57')?.classList.add('hidden');
  syncModalScrollLock();
}

async function loadLegalStatusV57(){
  if(!session?.user)return;
  const badge=$('#legalAcceptanceBadgeV57');
  const accept=$('#acceptCurrentLegalV57');

  try{
    legalStatusV57=await getMyLegalStatusV57();
    const accepted=!!legalStatusV57.accepted;

    if(badge){
      badge.textContent=accepted
        ?`Aceptado · ${new Date(legalStatusV57.accepted_at).toLocaleDateString('es-UY')}`
        :'Aceptación pendiente';
      badge.classList.toggle('ok',accepted);
      badge.classList.toggle('pending',!accepted);
    }

    accept?.classList.toggle('hidden',accepted);
  }catch(err){
    if(badge)badge.textContent='No se pudo verificar';
  }
}

async function loadAdminLegalConfigV57(){
  if(!v35Flags?.is_test_admin)return;

  try{
    const cfg=await ensureLegalConfigV57(true);
    if($('#adminLegalResponsibleV57'))$('#adminLegalResponsibleV57').value=cfg.responsible_name||'TT Rivals';
    if($('#adminLegalAddressV571'))$('#adminLegalAddressV571').value=cfg.responsible_address||'';
    if($('#adminLegalEmailV57'))$('#adminLegalEmailV57').value=cfg.privacy_email||'';
    if($('#adminLegalInfrastructureV57'))$('#adminLegalInfrastructureV57').value=cfg.infrastructure_destination||'';

    if(!cfg.complete){
      setStatus(
        $('#adminLegalConfigStatusV57'),
        'Completá responsable, domicilio, email de privacidad y región real de infraestructura antes de abrir TT Rivals al público.',
        'error'
      );
    }else{
      setStatus($('#adminLegalConfigStatusV57'),'Información legal completa.','ok');
    }
  }catch(err){
    setStatus($('#adminLegalConfigStatusV57'),err.message,'error');
  }
}

function downloadJsonV57(data,filename){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function renderSecurityAuditV57(audit){
  const box=$('#securityAuditResultV57');
  if(!box)return;

  const s=audit?.summary||{};
  const rls=(audit?.rls_disabled_tables||[]);
  const anon=(audit?.anon_grants||[]);
  const auth=(audit?.authenticated_write_grants||[]);
  const definer=(audit?.security_definer_without_search_path||[]);

  const card=(label,value,state,detail)=>`<article class="security-audit-card-v57 ${state}">
    <span>${label}</span>
    <strong>${value}</strong>
    <small>${detail}</small>
  </article>`;

  box.innerHTML=`
    <div class="security-audit-grid-v57">
      ${card('RLS habilitado',`${Number(s.rls_enabled||0)}/${Number(s.public_tables||0)}`,Number(s.rls_disabled||0)===0?'ok':'warn',Number(s.rls_disabled||0)===0?'Todas las tablas públicas detectadas usan RLS.':`${s.rls_disabled} tabla(s) requieren revisión.`)}
      ${card('Grants anon',Number(s.anon_grants||0),Number(s.anon_grants||0)===0?'ok':'warn','Permisos SQL visibles para el rol anon.')}
      ${card('Escritura authenticated',Number(s.authenticated_write_grants||0),'info','Deben estar limitados por RLS/policies.')}
      ${card('SECURITY DEFINER',Number(s.security_definer_without_search_path||0),Number(s.security_definer_without_search_path||0)===0?'ok':'danger','Funciones sin search_path fijado.')}
    </div>

    <details ${rls.length?'open':''}>
      <summary>Tablas sin RLS (${rls.length})</summary>
      <pre>${esc(rls.length?rls.join('\n'):'Ninguna detectada')}</pre>
    </details>
    <details>
      <summary>Grants para anon (${anon.length})</summary>
      <pre>${esc(anon.length?anon.map(x=>`${x.table}: ${x.privilege}`).join('\n'):'Ninguno detectado')}</pre>
    </details>
    <details>
      <summary>Escritura directa para authenticated (${auth.length})</summary>
      <pre>${esc(auth.length?auth.map(x=>`${x.table}: ${x.privilege}`).join('\n'):'Ninguna detectada')}</pre>
    </details>
    <details ${definer.length?'open':''}>
      <summary>SECURITY DEFINER sin search_path (${definer.length})</summary>
      <pre>${esc(definer.length?definer.map(x=>`${x.function}(${x.arguments||''})`).join('\n'):'Ninguna detectada')}</pre>
    </details>
    <p class="security-audit-note-v57">Un grant no es automáticamente una vulnerabilidad: debe evaluarse junto con RLS y sus políticas.</p>`;
}

$('#goRegister').onclick=()=>showView('registerView');
$('#goLogin').onclick=()=>showView('loginView');
$$('[data-back]').forEach(b=>b.onclick=()=>showView(b.dataset.back));

function cleanRecoveryUrlV53(){
  try{
    const clean=new URL(window.location.href);
    clean.searchParams.delete('recovery');
    clean.hash='';
    history.replaceState({},'',clean.pathname+(clean.search||''));
  }catch{}
}

function showPasswordRecoveryViewV53(nextSession){
  passwordRecoveryActiveV53=true;
  if(nextSession)session=nextSession;
  showView('resetPasswordView');

  const userLabel=$('#recoveryAccountUserV53');
  if(userLabel)userLabel.textContent='Verificando usuario…';

  if(session?.user?.id){
    getMyProfile(session.user.id).then(p=>{
      recoveryProfileV53=p;
      if(userLabel)userLabel.textContent=p?.username?`@${p.username}`:'Cuenta TT Rivals';
    }).catch(()=>{
      if(userLabel)userLabel.textContent='Cuenta TT Rivals';
    });
  }
}

$('#forgotPasswordButtonV53')?.addEventListener('click',()=>{
  const current=$('#loginEmail')?.value.trim()||'';
  if($('#forgotPasswordEmailV53'))$('#forgotPasswordEmailV53').value=current;
  setStatus($('#forgotPasswordStatusV53'),'');
  showView('forgotPasswordView');
});

$('#forgotPasswordFormV53')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const st=$('#forgotPasswordStatusV53');
  const email=$('#forgotPasswordEmailV53')?.value.trim()||'';
  const button=e.currentTarget.querySelector('button[type="submit"]');

  if(!email)return setStatus(st,'Ingresá el correo asociado a tu cuenta.','error');

  try{
    button.disabled=true;
    setStatus(st,'Enviando enlace seguro…');
    const {error}=await requestPasswordReset(email);
    if(error)throw error;

    // Mensaje neutro para no confirmar si un correo pertenece o no a una cuenta.
    setStatus(
      st,
      'Si ese correo está asociado a TT Rivals, recibirás un enlace para crear una nueva contraseña. Revisá también Spam.',
      'ok'
    );
  }catch(err){
    const msg=String(err?.message||'').toLowerCase();
    if(msg.includes('rate')||msg.includes('limit')){
      setStatus(st,'Se enviaron demasiados correos recientemente. Esperá un momento y volvé a intentar.','error');
    }else{
      setStatus(st,'No pudimos enviar el correo de recuperación. Intentá nuevamente.','error');
    }
  }finally{
    button.disabled=false;
  }
});

$('#resetPasswordFormV53')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const st=$('#resetPasswordStatusV53');
  const password=$('#recoveryPasswordV53')?.value||'';
  const confirm=$('#recoveryPasswordConfirmV53')?.value||'';
  const button=e.currentTarget.querySelector('button[type="submit"]');

  if(password.length<8)return setStatus(st,'La nueva contraseña debe tener al menos 8 caracteres.','error');
  if(password!==confirm)return setStatus(st,'Las contraseñas no coinciden.','error');

  try{
    button.disabled=true;
    setStatus(st,'Actualizando contraseña…');
    const {error}=await updateRecoveredPassword(password);
    if(error)throw error;

    const email=session?.user?.email||'';
    await signOutUser();
    session=null;
    passwordRecoveryActiveV53=false;
    cleanRecoveryUrlV53();

    if($('#loginEmail'))$('#loginEmail').value=email;
    if($('#loginPassword'))$('#loginPassword').value='';
    showView('loginView');
    setStatus($('#loginStatus'),'Contraseña actualizada. Ya podés iniciar sesión con tu nueva contraseña.','ok');
  }catch(err){
    setStatus(st,err?.message||'No se pudo actualizar la contraseña.','error');
  }finally{
    button.disabled=false;
  }
});

$('#registerForm').onsubmit=async e=>{
  e.preventDefault();

  const st=$('#registerStatus'),
    firstName=$('#firstName').value.trim(),
    lastName=$('#lastName').value.trim(),
    username=$('#username').value.trim().toLowerCase(),
    email=$('#registerEmail').value.trim(),
    password=$('#registerPassword').value;

  if(password!==$('#confirmPassword').value){
    return setStatus(st,'Las contraseñas no coinciden.','error');
  }

  if(!/^[a-z0-9_]{3,24}$/.test(username)){
    return setStatus(st,'Usuario inválido.','error');
  }

  if(!$('#acceptTermsV57')?.checked){
    return setStatus(st,'Para crear la cuenta tenés que aceptar los Términos y Condiciones.','error');
  }

  if(!$('#ackPrivacyV57')?.checked){
    return setStatus(st,'Antes de crear la cuenta tenés que leer la Política de Privacidad.','error');
  }

  try{
    const {data,error}=await signUpUser({
      email,password,firstName,lastName,username,
      legalTermsVersion:LEGAL_V57.termsVersion,
      legalPrivacyVersion:LEGAL_V57.privacyVersion
    });

    if(error)throw error;
    session=data.session;

    if(session?.user){
      try{await recordMyLegalAcceptanceV57()}catch(err){console.warn('Legal V57:',err)}
    }

    showView('sportsProfileView');
  }catch(err){
    setStatus(st,friendly(err.message),'error');
  }
};
$('#loginForm').onsubmit=async e=>{e.preventDefault();const st=$('#loginStatus');try{const {data,error}=await signInUser({email:$('#loginEmail').value.trim(),password:$('#loginPassword').value});if(error)throw error;session=data.session;const p=await getMyProfile(data.user.id);if(!p.profile_completed)return showView('sportsProfileView');await loadApp(data.user.id,p)}catch(err){setStatus(st,friendly(err.message),'error')}};
$('#sportsProfileForm').onsubmit=async e=>{
  e.preventDefault();
  const status=$('#sportsStatus');

  if(!$('#birthDate').value||!$('#playingStyle').value||!$('#dominantHand').value||!$('#clubName').value){
    return setStatus(status,'Completá todos los campos obligatorios.','error');
  }

  const submitButton=e.currentTarget.querySelector('button[type="submit"]');
  submitButton.disabled=true;
  setStatus(status,'Guardando perfil…');

  try{
    session=await getSession();
    if(!session?.user)throw new Error('No hay una sesión activa.');

    setStatus(status,'Verificando club…');
    const clubResult=await resolveSelectedClubV49('#clubName','#customClubName');
    const finalClub=clubResult.name;

    let photoUrl=null;
    if(onboardingPhotoFile){
      setStatus(status,'Subiendo foto ajustada…');
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

    await setMyClubV51(clubResult.club_id??null);

    cleanupOnboardingPhotoV47();
    await loadApp(session.user.id);
  }catch(err){
    console.error(err);
    setStatus(status,err.message||'No se pudo completar el perfil.','error');
  }finally{
    submitButton.disabled=false;
  }
};

$$('.nav-item').forEach(b=>b.onclick=()=>activateTab(b.dataset.tab));$$('[data-go-tab]').forEach(b=>b.onclick=()=>activateTab(b.dataset.goTab));

$$('[data-open-legal-v57]').forEach(button=>{
  button.addEventListener('click',()=>openLegalModalV57(button.dataset.openLegalV57));
});

$$('[data-legal-tab-v57]').forEach(button=>{
  button.addEventListener('click',()=>openLegalModalV57(button.dataset.legalTabV57));
});

$('#closeLegalModalV57')?.addEventListener('click',closeLegalModalV57);
$('#legalModalV57')?.addEventListener('click',e=>{
  if(e.target.id==='legalModalV57')closeLegalModalV57();
});

$('#acceptCurrentLegalV57')?.addEventListener('click',async()=>{
  const st=$('#legalSettingsStatusV57');
  try{
    const ok=confirm(
      `¿Confirmás que leíste y aceptás Términos ${LEGAL_V57.termsVersion} y que leíste Privacidad ${LEGAL_V57.privacyVersion}?`
    );
    if(!ok)return;

    setStatus(st,'Registrando aceptación…');
    await recordMyLegalAcceptanceV57();
    await loadLegalStatusV57();
    setStatus(st,'Aceptación registrada.','ok');
  }catch(err){
    setStatus(st,err.message,'error');
  }
});

$('#exportMyDataButtonV57')?.addEventListener('click',async()=>{
  const st=$('#legalSettingsStatusV57');
  const button=$('#exportMyDataButtonV57');

  try{
    button.disabled=true;
    setStatus(st,'Preparando exportación…');
    const data=await exportMyDataV57();
    const date=new Date().toISOString().slice(0,10);
    downloadJsonV57(data,`tt-rivals-mis-datos-${date}.json`);
    setStatus(st,'Exportación generada.','ok');
  }catch(err){
    setStatus(st,err.message,'error');
  }finally{
    button.disabled=false;
  }
});

$('#saveAdminLegalConfigV57')?.addEventListener('click',async()=>{
  const st=$('#adminLegalConfigStatusV57');
  try{
    setStatus(st,'Guardando información legal…');
    legalConfigV57=await adminUpdateLegalConfigV57({
      responsibleName:$('#adminLegalResponsibleV57')?.value.trim()||'',
      responsibleAddress:$('#adminLegalAddressV571')?.value.trim()||'',
      privacyEmail:$('#adminLegalEmailV57')?.value.trim()||'',
      infrastructureDestination:$('#adminLegalInfrastructureV57')?.value.trim()||''
    });

    setStatus(
      st,
      legalConfigV57.complete
        ?'Información legal completa y publicada en los documentos.'
        :'Guardado. Todavía faltan datos para considerar completa la información legal.',
      legalConfigV57.complete?'ok':'error'
    );
  }catch(err){
    setStatus(st,err.message,'error');
  }
});

$('#runSecurityAuditV57')?.addEventListener('click',async()=>{
  const box=$('#securityAuditResultV57');
  const button=$('#runSecurityAuditV57');

  try{
    button.disabled=true;
    box.innerHTML='<div class="loading-row">Auditando Supabase…</div>';
    const audit=await adminSecurityAuditV57();
    renderSecurityAuditV57(audit);
  }catch(err){
    box.innerHTML=`<div class="compact-empty">${esc(err.message)}</div>`;
  }finally{
    button.disabled=false;
  }
});

$('#statsModeSelectV56')?.addEventListener('change',e=>setStatsModeV56(e.target.value));

$$('[data-stats-tile-v56]').forEach(card=>{
  card.addEventListener('click',()=>{
    setStatsModeV56(card.dataset.statsTileV56);
    $('#statsModeSelectV56')?.focus({preventScroll:true});
  });
});

$$('[data-challenge-type]').forEach(b=>b.addEventListener('click',e=>{
  e.preventDefault();
  setChallengeType(b.dataset.challengeType);
}));


if($('#v28EventBadge'))$('#v28EventBadge').onclick=()=>{
  const action=$('#v28EventBadge').dataset.eventAction;
  if(action==='rivals'){
    activateTab('home');
    setTimeout(()=>{
      const target=$('#recommendedRivals')?.closest('.recommended-rivals-section')||$('#recommendedRivals');
      target?.scrollIntoView({behavior:'smooth',block:'center'});
    },80);
  }else{
    activateTab('play');
  }
};





if($('#adminSaveFrameV43'))$('#adminSaveFrameV43').onclick=saveAdminFrameV44;
if($('#adminResetFrameV43'))$('#adminResetFrameV43').onclick=resetAdminFrameV44;
if($('#adminRestoreEquippedV43'))$('#adminRestoreEquippedV43').onclick=()=>{clearLiveFramePreviewV44();if($('#adminLivePreviewV43'))$('#adminLivePreviewV43').checked=false;setStatus($('#adminFrameStatusV43'),'Mostrando el marco realmente equipado.','ok')};
if($('#adminLivePreviewV43'))$('#adminLivePreviewV43').onchange=()=>{$('#adminLivePreviewV43').checked?updateAdminFramePreviewV44():clearLiveFramePreviewV44()};

if($('#enableNearbyPlayersV35'))$('#enableNearbyPlayersV35').onclick=enableNearbyV35;
if($('#refreshNearbyPlayersV35'))$('#refreshNearbyPlayersV35').onclick=()=>loadNearbyPlayersV35(true);
if($('#saveNearbySettingsV35'))$('#saveNearbySettingsV35').onclick=async()=>{
  const st=$('#nearbySettingsStatusV35');
  try{
    const opt=$('#nearbyOptInV35').checked,vis=$('#nearbyVisibilityV35').value;
    let p=lastKnownPositionV35;
    if(opt&&!p)p=await requestDeviceLocationV35();
    await updateMyLocationV35(p?.lat||0,p?.lon||0,opt,vis);
    v35Flags.nearby_opt_in=opt;v35Flags.nearby_visibility=vis;
    setStatus(st,'Privacidad actualizada.','ok');
    await loadNearbyPlayersV35(false);
  }catch(e){setStatus(st,e.message,'error')}
};

$('#settingsButton').onclick=()=>activateTab('settings');
$('#aiButton').onclick=()=>activateTab('ai');

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
    playing_style:$('#prefProfileStyle').value,
    dominant_hand:$('#prefProfileHand').value,
    updated_at:new Date().toISOString()
  };
  if(!payload.first_name||!payload.last_name||!payload.username){
    return setStatus(status,'Nombre, apellido y usuario son obligatorios.','error');
  }
  try{
    setStatus(status,'Verificando club…');
    const clubResult=await resolveSelectedClubV49('#prefProfileClubSelect','#prefProfileCustomClubV49');

    setStatus(status,'Guardando…');
    const {data,error}=await supabase.from('profiles').update(payload).eq('id',session.user.id).select().single();
    if(error)throw error;

    await setMyClubV51(clubResult.club_id??null);
    profile=await getMyProfile(session.user.id);
    myClubV49={club_id:clubResult.club_id??null,name:clubResult.name,display_alias:clubResult.display_alias||clubResult.name};

    populate();
    populateSettingsUI();
    await loadSettingsClubV49();
    setStatus(status,'Perfil competitivo actualizado.','ok');
  }catch(err){
    const msg=String(err?.message||'');
    setStatus(status,msg.toLowerCase().includes('duplicate')?'Ese @usuario ya está en uso.':msg,'error');
  }
};



function renderAdminClubListV49(){
  const box=$('#adminClubMergeListV49'),target=$('#adminClubTargetV49');
  if(!box||!target)return;

  const q=normalizeClubNameClientV49($('#adminClubSearchV49')?.value||'').toLowerCase();
  const targetId=String(target.value||'');

  const rows=(adminClubsV49||[]).filter(c=>{
    if(!q)return true;
    const hay=normalizeClubNameClientV49(
      `${c.name} ${c.display_alias||''} ${c.department||''} ${c.locality||''} ${(c.aliases||[]).join(' ')}`
    ).toLowerCase();
    return hay.includes(q);
  });

  box.innerHTML=rows.length?rows.map(c=>{
    const isTarget=String(c.id)===targetId;
    const aliases=(c.aliases||[]).filter(a=>{
      const n=normalizeClubNameClientV49(a).toLowerCase();
      return n!==normalizeClubNameClientV49(c.name).toLowerCase()
        && n!==normalizeClubNameClientV49(c.display_alias||'').toLowerCase();
    });
    const place=[c.department,c.locality&&c.locality!==c.department?c.locality:''].filter(Boolean).join(' · ');
    return `<label class="admin-club-row-v49 ${isTarget?'is-target':''}">
      <input type="checkbox" data-admin-club-source-v49="${c.id}" ${isTarget?'disabled':''}>
      <div>
        <strong>${esc(c.name)} ${isTarget?'<span>OFICIAL</span>':''}</strong>
        <small><b class="admin-profile-alias-v51">Perfil: ${esc(c.display_alias||c.name)}</b> · ${Number(c.member_count||0)} jugador${Number(c.member_count||0)===1?'':'es'}${place?` · ${esc(place)}`:''}${aliases.length?` · Alias: ${esc(aliases.slice(0,3).join(', '))}`:''}</small>
      </div>
      <b>#${c.id}</b>
    </label>`;
  }).join(''):'<div class="loading-row">No hay clubes que coincidan con la búsqueda.</div>';
}

function syncAdminClubTargetV49(){
  const targetId=$('#adminClubTargetV49')?.value;
  const club=(adminClubsV49||[]).find(c=>String(c.id)===String(targetId));
  if($('#adminClubRenameInputV49'))$('#adminClubRenameInputV49').value=club?.name||'';
  if($('#adminClubDisplayInputV51'))$('#adminClubDisplayInputV51').value=club?.display_alias||club?.name||'';
  renderAdminClubListV49();
}

async function loadAdminClubsV49(){
  if(!v35Flags?.is_test_admin)return;
  const box=$('#adminClubMergeListV49'),target=$('#adminClubTargetV49');
  if(!box||!target)return;

  box.innerHTML='<div class="loading-row">Cargando clubes…</div>';
  adminClubsV49=await adminListClubsV51();

  const previous=target.value;
  target.innerHTML=adminClubsV49.map(c=>
    `<option value="${c.id}">${esc(c.name)} · ${Number(c.member_count||0)} jugadores</option>`
  ).join('');
  if(previous&&[...target.options].some(o=>o.value===previous))target.value=previous;

  syncAdminClubTargetV49();
}

function adminClubAliasesFromInputV51(selector){
  return ($(selector)?.value||'')
    .split(',')
    .map(x=>normalizeClubNameClientV49(x))
    .filter(Boolean);
}

$('#adminCreateClubButtonV51')?.addEventListener('click',async()=>{
  const st=$('#adminCreateClubStatusV51');
  const button=$('#adminCreateClubButtonV51');
  const name=normalizeClubNameClientV49($('#adminNewClubNameV51')?.value||'');
  const displayAlias=normalizeClubNameClientV49($('#adminNewClubDisplayV51')?.value||'');
  const department=$('#adminNewClubDepartmentV51')?.value||'Sin departamento';
  const locality=normalizeClubNameClientV49($('#adminNewClubLocalityV51')?.value||'');
  const aliases=adminClubAliasesFromInputV51('#adminNewClubAliasesV51');

  if(name.length<2)return setStatus(st,'Escribí el nombre oficial del club.','error');
  if(displayAlias.length<2)return setStatus(st,'Escribí el alias corto que querés mostrar en los perfiles.','error');

  try{
    button.disabled=true;
    setStatus(st,'Agregando club al diccionario…');

    const result=await adminCreateClubV51({
      name,
      displayAlias,
      department,
      locality,
      aliases
    });

    ['#adminNewClubNameV51','#adminNewClubDisplayV51','#adminNewClubLocalityV51','#adminNewClubAliasesV51']
      .forEach(sel=>{if($(sel))$(sel).value='';});

    if($('#adminNewClubDepartmentV51'))$('#adminNewClubDepartmentV51').value='Montevideo';

    await Promise.all([
      loadAdminClubsV49(),
      loadAvailableClubsV49().catch(()=>{}),
      loadSettingsClubV49().catch(()=>{})
    ]);

    if(result?.club_id&&$('#adminClubTargetV49')){
      $('#adminClubTargetV49').value=String(result.club_id);
      syncAdminClubTargetV49();
    }

    setStatus(st,`Club agregado: ${result?.name||name}. En los perfiles se mostrará “${result?.display_alias||displayAlias}”.`,'ok');
  }catch(err){
    setStatus(st,err.message,'error');
  }finally{
    button.disabled=false;
  }
});

$('#adminClubTargetV49')?.addEventListener('change',syncAdminClubTargetV49);
$('#adminClubSearchV49')?.addEventListener('input',renderAdminClubListV49);
$('#adminRefreshClubsV49')?.addEventListener('click',()=>loadAdminClubsV49().catch(err=>setStatus($('#adminClubStatusV49'),err.message,'error')));

$('#adminRenameClubButtonV49')?.addEventListener('click',async()=>{
  const st=$('#adminClubStatusV49');
  const id=$('#adminClubTargetV49')?.value;
  const name=normalizeClubNameClientV49($('#adminClubRenameInputV49')?.value||'');
  const displayAlias=normalizeClubNameClientV49($('#adminClubDisplayInputV51')?.value||'');

  if(!id||name.length<2)return setStatus(st,'Elegí un club y escribí un nombre oficial válido.','error');
  if(displayAlias.length<2)return setStatus(st,'Definí el alias que querés mostrar en los perfiles.','error');

  try{
    setStatus(st,'Guardando nombre oficial y alias visible…');
    const result=await adminUpdateClubV51(id,name,displayAlias);

    await Promise.all([
      loadAdminClubsV49(),
      loadAvailableClubsV49().catch(()=>{}),
      loadSettingsClubV49().catch(()=>{})
    ]);

    profile=await getMyProfile(session.user.id);
    populate();

    setStatus(
      st,
      `Identidad actualizada. Selector: “${result?.name||name}” · Perfil: “${result?.display_alias||displayAlias}”.`,
      'ok'
    );
  }catch(err){setStatus(st,err.message,'error')}
});

$('#adminMergeClubsButtonV49')?.addEventListener('click',async()=>{
  const st=$('#adminClubStatusV49');
  const targetId=$('#adminClubTargetV49')?.value;
  const sourceIds=[...document.querySelectorAll('[data-admin-club-source-v49]:checked')]
    .map(x=>Number(x.dataset.adminClubSourceV49));

  if(!targetId)return setStatus(st,'Elegí el club oficial.','error');
  if(!sourceIds.length)return setStatus(st,'Marcá al menos un club duplicado para fusionar.','error');

  const target=(adminClubsV49||[]).find(c=>String(c.id)===String(targetId));
  const sourceNames=(adminClubsV49||[])
    .filter(c=>sourceIds.includes(Number(c.id)))
    .map(c=>c.name);

  const ok=confirm(
    `Se conservará "${target?.name||'el club oficial'}" y su alias visible "${target?.display_alias||target?.name||''}". `+
    `Se fusionarán: ${sourceNames.join(', ')}. Los usuarios no perderán datos. ¿Continuar?`
  );
  if(!ok)return;

  const aliases=adminClubAliasesFromInputV51('#adminClubAliasesV49');

  try{
    setStatus(st,'Fusionando clubes…');
    const result=await adminMergeClubsV51(targetId,sourceIds,aliases);
    if($('#adminClubAliasesV49'))$('#adminClubAliasesV49').value='';

    await Promise.all([
      loadAdminClubsV49(),
      loadAvailableClubsV49().catch(()=>{}),
      loadSettingsClubV49().catch(()=>{})
    ]);

    profile=await getMyProfile(session.user.id);
    populate();

    const n=result?.merged_clubs||sourceIds.length;
    setStatus(
      st,
      `Listo. ${n} club${n===1?'':'es'} fusionado${n===1?'':'s'} en ${result?.target_name||target?.name}. `+
      `En perfiles se verá “${result?.display_alias||target?.display_alias||target?.name}”.`,
      'ok'
    );
  }catch(err){setStatus(st,err.message,'error')}
});


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

$('#settingsLogoutButton').onclick=async()=>{stopTrainingTimerV53?.();stopLiveNotificationStream();await signOutUser();session=null;profile=null;ratings=[];showView('welcomeView')};

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

document.addEventListener('input',e=>{const teamSearch=e.target.closest('[data-team-player-search]');if(teamSearch)searchTeamPlayerV32(teamSearch)});

document.addEventListener('click',async e=>{
  const teamModeButton=e.target.closest('#openTeamTournamentV32,[data-open-team-mode-v32]');
  if(teamModeButton){
    e.preventDefault();
    openTeamTournamentBuilderV32();
    return;
  }
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
      // Marcar antes del refresh evita que Realtime/Polling abra dos veces el mismo post-match.
      postMatchShownIds.add(matchId);
      pendingPostMatchReviewId=matchId;
      await refreshCore();
      const after=getRating('individual').rating;
      await showPostMatch({matchId,won,oldRating:before,newRating:after});
      setTimeout(syncModalScrollLock,0);
    }catch(err){alert(err.message)}
    return
  }
  const dispute=e.target.closest('[data-dispute-match]');if(dispute){try{
    await disputeMatchResult(Number(dispute.dataset.disputeMatch));
    await Promise.all([loadMatches(),loadLiveNotifications()]);
  }catch(err){alert(err.message)}}
});

$('#closeMatchModal').onclick=closeMatchModal;
$('#matchResultForm').onsubmit=async e=>{
  e.preventDefault();
  if(!currentMatch)return;

  const rows=[...$('#setInputs').querySelectorAll('.v28-score-row')];
  const sets=[];
  const need=currentMatch.match_format==='bo5'?3:currentMatch.match_format==='bo3'?2:1;

  let p1wins=0,p2wins=0;
  let reachedGap=false;
  let abandonment=false;

  for(const row of rows){
    const skip=row.querySelector('[data-unplayed-set]')?.checked;
    const p1raw=row.querySelector('[data-p1-set]').value;
    const p2raw=row.querySelector('[data-p2-set]').value;

    const emptyBoth=p1raw===''&&p2raw==='';

    // El primer set vacío / no jugado cierra la secuencia.
    // Después de eso no puede existir otro set cargado.
    if(skip||emptyBoth){
      reachedGap=true;
      continue;
    }

    if(reachedGap){
      return setStatus(
        $('#matchResultStatus'),
        'No puede haber un set jugado después de un set no jugado.',
        'error'
      );
    }

    if(p1raw===''||p2raw===''){
      return setStatus(
        $('#matchResultStatus'),
        'Completá ambos puntajes del set o dejalo sin jugar.',
        'error'
      );
    }

    const a=Number(p1raw),b=Number(p2raw);
    if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0){
      return setStatus($('#matchResultStatus'),'Ingresá puntajes válidos.','error');
    }

    if(a===b){
      return setStatus($('#matchResultStatus'),'Un set no puede terminar empatado.','error');
    }

    const high=Math.max(a,b);
    const low=Math.min(a,b);

    // ABANDONO:
    // si ninguno llegó a 11, este es el último set realmente informado.
    // Puede ser Set 1, 2, 3, 4 o 5. Las filas posteriores simplemente quedan sin jugar.
    if(high<11){
      abandonment=true;
      sets.push({player1_points:a,player2_points:b});
      reachedGap=true;
      continue;
    }

    if(high-low<2){
      return setStatus(
        $('#matchResultStatus'),
        'Al llegar a 11 o más, el set debe terminar con 2 puntos de diferencia.',
        'error'
      );
    }

    if(a>b)p1wins++;
    else p2wins++;

    sets.push({player1_points:a,player2_points:b});

    if(p1wins>=need||p2wins>=need){
      reachedGap=true;
    }
  }

  if(!sets.length){
    return setStatus($('#matchResultStatus'),'Ingresá al menos un set.','error');
  }

  if(!abandonment&&p1wins<need&&p2wins<need){
    return setStatus(
      $('#matchResultStatus'),
      'Todavía no hay un ganador de la serie.',
      'error'
    );
  }

  try{
    await submitMatchResult(currentMatch.id,sets);
    closeMatchModal();

    // La UI local cambia inmediatamente; el rival recibe lo mismo por Realtime.
    await Promise.all([
      loadChallenges(),
      loadMatches(),
      loadLiveNotifications(),
      loadV28Experience()
    ]);

    recoverPageScrollIfIdle();
  }catch(err){
    setStatus($('#matchResultStatus'),err.message,'error');
  }
};


$$('[data-tournament-modality]').forEach(b=>b.onclick=()=>openTournamentPresetChooser(b.dataset.tournamentModality));
$('#backToTournamentModes').onclick=()=>showTournamentModesV32();
$$('[data-tournament-preset]').forEach(b=>b.onclick=()=>openTournamentBuilder(b.dataset.tournamentPreset));
$('#backToTournamentPresets').onclick=()=>{hideAllTournamentPanelsV32();$('#tournamentPresetChooser').classList.remove('hidden');window.scrollTo({top:0,behavior:'instant'})};
$('#tournamentStartStage').onchange=updateGroupOptions;
$('#tournamentMaxPlayers').oninput=updateTournamentAutoGroupsV30;
$('#tournamentQualifiers').oninput=updateTournamentAutoGroupsV30;
$('#tournamentVisibility').onchange=updateTournamentVisibilityV30;
$$('[data-tournament-hub-tab]').forEach(b=>b.onclick=()=>openTournamentHubPanelV30(b.dataset.tournamentHubTab));
$('#refreshTournamentHubV30').onclick=loadTournamentHubV30;
$('#tournamentDiscoverSearch').oninput=()=>{
  clearTimeout(tournamentDiscoverTimerV30);
  tournamentDiscoverTimerV30=setTimeout(loadTournamentDiscoveryV30,250);
};
$('#tournamentJoinFormV30').onsubmit=async e=>{
  e.preventDefault();
  if(!pendingTournamentJoinV30)return;
  const st=$('#tournamentJoinStatusV30');
  try{
    await joinTournamentV30(pendingTournamentJoinV30,$('#tournamentJoinCodeV30').value);
    closePrivateJoinV30();
    await Promise.all([loadTournamentDiscoveryV30(),loadMyTournamentHistoryV30()]);
    alert('Te uniste al torneo.');
  }catch(err){setStatus(st,err.message,'error')}
};
$('#closeTournamentJoinModalV30').onclick=closePrivateJoinV30;
$('#tournamentJoinModalV30').addEventListener('click',e=>{if(e.target===$('#tournamentJoinModalV30'))closePrivateJoinV30()});
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
  e.preventDefault();
  const st=$('#tournamentCreateStatus');
  const maxPlayers=Number($('#tournamentMaxPlayers').value);
  const hostPlays=$('#tournamentHostPlays').checked;
  const invited=new Set(tournamentDraft.selectedUsers.map(x=>x.id));
  const initialCount=invited.size+(hostPlays&&!invited.has(session.user.id)?1:0);

  if(tournamentDraft.modality==='individual'&&(maxPlayers<2||maxPlayers>64))
    return setStatus(st,'Elegí entre 2 y 64 cupos.','error');
  if(tournamentDraft.modality==='doubles'&&(maxPlayers<4||maxPlayers>64||maxPlayers%2!==0))
    return setStatus(st,'En 2vs2 los cupos deben ser pares, entre 4 y 64.','error');
  if(initialCount>maxPlayers)
    return setStatus(st,'Tenés más invitados iniciales que cupos disponibles.','error');

  const visibility=$('#tournamentVisibility').value;
  if(visibility==='private'&&$('#tournamentPrivateCode').value.trim().length<4)
    return setStatus(st,'La clave privada debe tener al menos 4 caracteres.','error');

  const startStage=$('#tournamentStartStage').value;

  try{
    const id=await createTournamentV30({
      name:$('#tournamentName').value.trim(),
      modality:tournamentDraft.modality,
      preset:tournamentDraft.preset,
      startStage,
      afterGroupsStage:startStage==='groups'?$('#tournamentAfterGroupsStage').value:null,
      qualifiersPerGroup:startStage==='groups'?Number($('#tournamentQualifiers').value):null,
      stageSets:tournamentDraft.preset==='custom'?collectCustomStageSets():{},
      maxPlayers,
      visibility,
      accessCode:visibility==='private'?$('#tournamentPrivateCode').value.trim():null,
      hostPlays,
      selectedUsers:[...invited]
    });

    setStatus(st,'Torneo creado. Las inscripciones están abiertas.','ok');
    await Promise.all([loadTournamentHubV30(),openTournament(id)]);
  }catch(err){
    setStatus(st,err.message,'error');
  }
};

$('#myTournamentHistoryV30').onclick=e=>{const c=e.target.closest('[data-open-tournament]');if(c)openTournament(c.dataset.openTournament)};
$('#activeTournamentDiscoveryV30').onclick=async e=>{
  const open=e.target.closest('[data-open-tournament]');
  if(open){openTournament(open.dataset.openTournament);return}
  const join=e.target.closest('[data-join-tournament-v30]');
  if(join){
    if(join.dataset.private==='true')openPrivateJoinV30(join.dataset.joinTournamentV30,join.dataset.name);
    else await joinPublicTournamentV30(join.dataset.joinTournamentV30);
  }
};
$('#closeTournamentDetail').onclick=()=>{selectedTournament=null;resetTournamentWizard();loadTournamentHubV30()};
$('#tournamentBracket').onclick=async e=>{
  const result=e.target.closest('[data-t8-result]');
  if(result){openTournamentMatchModalV8(result.dataset.t8Result);return}
  const start=e.target.closest('[data-start-tournament-v30]');
  if(start){
    const lobby=await getTournamentLobbyV30(start.dataset.startTournamentV30).catch(()=>null);
    const n=Number(lobby?.participant_count||0);
    const entries=selectedTournament.modality==='doubles'?Math.floor(n/2):n;
    const preview=entries===2?'2 participantes → Final directa':entries===3?'3 participantes → grupo único, todos contra todos → clasifican 2 → Final':selectedTournament.start_stage==='groups'?`${entries} participantes → grupos automáticos equilibrados`:`${entries} participantes → llave eliminatoria automática`;
    if(!confirm(`Se cerrarán las inscripciones.\n\n${preview}\n\n¿Continuar?`))return;
    try{
      await startTournamentV30(start.dataset.startTournamentV30);
      selectedTournament=(await getTournamentsV8()).find(t=>t.id===selectedTournament.id);
      await Promise.all([renderTournamentBracket(),loadTournamentHubV30()]);
    }catch(err){alert(err.message)}
    return;
  }
  if(e.target.closest('[data-retry-tournament-v30]')){await renderTournamentBracket()}
};
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
    await renderTournamentBracket();
    try{renderFinalStandings(await getTournamentStandingsV8(selectedTournament.id))}catch(e){console.error('tabla final',e)}
    await loadTournamentList();
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





function setOnboardingPhotoPreviewV47(file){
  onboardingPhotoFile=file;
  if(onboardingPhotoPreviewUrl)URL.revokeObjectURL(onboardingPhotoPreviewUrl);
  onboardingPhotoPreviewUrl=URL.createObjectURL(file);
  $('#onboardingPhotoPreview').innerHTML=`<img src="${onboardingPhotoPreviewUrl}" alt="Vista previa de foto ajustada">`;
  $('#onboardingPhotoActionsV47').classList.remove('hidden');
  $('#onboardingPhotoPickerTitle').textContent='Cambiar imagen';
  $('#onboardingPhotoPickerHelp').textContent='La foto se guardará exactamente con este encuadre';
}

function cleanupOnboardingPhotoV47(){
  onboardingPhotoFile=null;
  onboardingPhotoSourceFileV47=null;
  pendingOnboardingPhotoSourceV47=null;
  $('#onboardingPhotoFileInput').value='';
  if(onboardingPhotoPreviewUrl){URL.revokeObjectURL(onboardingPhotoPreviewUrl);onboardingPhotoPreviewUrl=null;}
  if(onboardingPhotoSourceUrlV47){URL.revokeObjectURL(onboardingPhotoSourceUrlV47);onboardingPhotoSourceUrlV47=null;}
  $('#onboardingPhotoPreview').innerHTML='<span class="onboarding-photo-plus">+</span>';
  $('#onboardingPhotoActionsV47').classList.add('hidden');
  $('#onboardingPhotoPickerTitle').textContent='Añadir foto';
  $('#onboardingPhotoPickerHelp').textContent='Elegí una imagen y acomodala dentro del círculo';
}

function closeOnboardingPhotoEditorV47({discardPending=false}={}){
  $('#onboardingPhotoEditorV47').classList.add('hidden');
  document.body.classList.remove('onboarding-photo-editor-open-v47');
  if(discardPending&&pendingOnboardingPhotoSourceV47?.url&&pendingOnboardingPhotoSourceV47.url!==onboardingPhotoSourceUrlV47){
    URL.revokeObjectURL(pendingOnboardingPhotoSourceV47.url);
  }
  pendingOnboardingPhotoSourceV47=null;
}

function clampOnboardingCropV47(){
  const viewport=$('#onboardingCropViewportV47');
  if(!viewport||!onboardingCropV47.naturalWidth)return;
  const size=viewport.clientWidth||280;
  const scale=onboardingCropV47.baseScale*onboardingCropV47.zoom;
  const maxX=Math.max(0,(onboardingCropV47.naturalWidth*scale-size)/2);
  const maxY=Math.max(0,(onboardingCropV47.naturalHeight*scale-size)/2);
  onboardingCropV47.x=Math.max(-maxX,Math.min(maxX,onboardingCropV47.x));
  onboardingCropV47.y=Math.max(-maxY,Math.min(maxY,onboardingCropV47.y));
}

function renderOnboardingCropV47(){
  const viewport=$('#onboardingCropViewportV47'),img=$('#onboardingCropImageV47');
  if(!viewport||!img||!onboardingCropV47.naturalWidth)return;
  const size=viewport.clientWidth||280;
  onboardingCropV47.baseScale=Math.max(size/onboardingCropV47.naturalWidth,size/onboardingCropV47.naturalHeight);
  clampOnboardingCropV47();
  const scale=onboardingCropV47.baseScale*onboardingCropV47.zoom;
  img.style.width=`${onboardingCropV47.naturalWidth*scale}px`;
  img.style.height=`${onboardingCropV47.naturalHeight*scale}px`;
  img.style.left=`calc(50% + ${onboardingCropV47.x}px)`;
  img.style.top=`calc(50% + ${onboardingCropV47.y}px)`;
  $('#onboardingZoomLabelV47').textContent=`${Math.round(onboardingCropV47.zoom*100)}%`;
}

function resetOnboardingCropV47(){
  onboardingCropV47.zoom=1;
  onboardingCropV47.x=0;
  onboardingCropV47.y=0;
  $('#onboardingZoomV47').value='1';
  renderOnboardingCropV47();
}

function openOnboardingPhotoEditorV47(file,url,{newSource=false}={}){
  const editor=$('#onboardingPhotoEditorV47'),img=$('#onboardingCropImageV47');
  if(!editor||!img)return;
  pendingOnboardingPhotoSourceV47={file,url,newSource};
  editor.classList.remove('hidden');
  document.body.classList.add('onboarding-photo-editor-open-v47');
  img.onload=()=>{
    onboardingCropV47.naturalWidth=img.naturalWidth;
    onboardingCropV47.naturalHeight=img.naturalHeight;
    resetOnboardingCropV47();
  };
  img.src=url;
  if(img.complete&&img.naturalWidth)img.onload();
}

async function createCroppedOnboardingPhotoV47(){
  const viewport=$('#onboardingCropViewportV47'),img=$('#onboardingCropImageV47');
  if(!viewport||!img||!img.naturalWidth)throw new Error('No se pudo preparar la imagen.');
  const size=viewport.clientWidth||280;
  const scale=onboardingCropV47.baseScale*onboardingCropV47.zoom;
  const renderedW=onboardingCropV47.naturalWidth*scale;
  const renderedH=onboardingCropV47.naturalHeight*scale;
  const left=size/2+onboardingCropV47.x-renderedW/2;
  const top=size/2+onboardingCropV47.y-renderedH/2;
  const sx=Math.max(0,(0-left)/scale);
  const sy=Math.max(0,(0-top)/scale);
  const sw=Math.min(onboardingCropV47.naturalWidth-sx,size/scale);
  const sh=Math.min(onboardingCropV47.naturalHeight-sy,size/scale);
  const output=512;
  const canvas=document.createElement('canvas');
  canvas.width=output;canvas.height=output;
  const ctx=canvas.getContext('2d',{alpha:false});
  ctx.fillStyle='#0b1020';ctx.fillRect(0,0,output,output);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(img,sx,sy,sw,sh,0,0,output,output);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('No se pudo recortar la foto.')),'image/jpeg',.92));
  return new File([blob],`tt-rivals-profile-${Date.now()}.jpg`,{type:'image/jpeg'});
}

$('#onboardingPhotoPicker').onclick=()=>{const input=$('#onboardingPhotoFileInput');input.value='';input.click();};

$('#onboardingPhotoFileInput').onchange=e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){
    alert('Usá una imagen JPG, PNG o WEBP.');e.target.value='';return;
  }
  if(file.size>5*1024*1024){
    alert('La foto no puede superar 5 MB.');e.target.value='';return;
  }
  const url=URL.createObjectURL(file);
  openOnboardingPhotoEditorV47(file,url,{newSource:true});
};

$('#editOnboardingPhotoV47').onclick=()=>{
  if(!onboardingPhotoSourceFileV47||!onboardingPhotoSourceUrlV47)return;
  openOnboardingPhotoEditorV47(onboardingPhotoSourceFileV47,onboardingPhotoSourceUrlV47,{newSource:false});
};

$('#clearOnboardingPhoto').onclick=cleanupOnboardingPhotoV47;
$('#cancelOnboardingPhotoV47').onclick=()=>{$('#onboardingPhotoFileInput').value='';closeOnboardingPhotoEditorV47({discardPending:true});};
$('#resetOnboardingPhotoV47').onclick=resetOnboardingCropV47;
$('#onboardingZoomV47').oninput=e=>{onboardingCropV47.zoom=Number(e.target.value)||1;renderOnboardingCropV47();};

const onboardingCropViewportV47=$('#onboardingCropViewportV47');
onboardingCropViewportV47.onpointerdown=e=>{
  onboardingCropV47.dragging=true;onboardingCropV47.lastX=e.clientX;onboardingCropV47.lastY=e.clientY;
  onboardingCropViewportV47.setPointerCapture?.(e.pointerId);e.preventDefault();
};
onboardingCropViewportV47.onpointermove=e=>{
  if(!onboardingCropV47.dragging)return;
  onboardingCropV47.x+=e.clientX-onboardingCropV47.lastX;
  onboardingCropV47.y+=e.clientY-onboardingCropV47.lastY;
  onboardingCropV47.lastX=e.clientX;onboardingCropV47.lastY=e.clientY;
  renderOnboardingCropV47();e.preventDefault();
};
onboardingCropViewportV47.onpointerup=onboardingCropViewportV47.onpointercancel=e=>{
  onboardingCropV47.dragging=false;
  try{onboardingCropViewportV47.releasePointerCapture?.(e.pointerId)}catch(_){ }
};
onboardingCropViewportV47.addEventListener('wheel',e=>{
  e.preventDefault();
  onboardingCropV47.zoom=Math.max(1,Math.min(3,onboardingCropV47.zoom+(e.deltaY<0?.08:-.08)));
  $('#onboardingZoomV47').value=String(onboardingCropV47.zoom);
  renderOnboardingCropV47();
},{passive:false});

$('#useOnboardingPhotoV47').onclick=async()=>{
  const button=$('#useOnboardingPhotoV47');button.disabled=true;
  try{
    const cropped=await createCroppedOnboardingPhotoV47();
    const pending=pendingOnboardingPhotoSourceV47;
    if(pending?.newSource){
      if(onboardingPhotoSourceUrlV47&&onboardingPhotoSourceUrlV47!==pending.url)URL.revokeObjectURL(onboardingPhotoSourceUrlV47);
      onboardingPhotoSourceFileV47=pending.file;
      onboardingPhotoSourceUrlV47=pending.url;
    }
    setOnboardingPhotoPreviewV47(cropped);
    closeOnboardingPhotoEditorV47();
  }catch(err){alert(err.message||'No se pudo ajustar la foto.');}
  finally{button.disabled=false;}
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
    profile={...profile,profile_photo_url:uploaded.publicUrl};
    refreshOwnVisualsV44();

    // If there was a previous app-managed photo, delete the old file after the new one is safely linked.
    if(previous){
      try{await deleteProfilePhotoByUrl(previous,session.user.id)}catch(err){console.warn(err)}
    }

    // La UI ya quedó actualizada en vivo; Realtime sincroniza otras sesiones.
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
    profile={...profile,profile_photo_url:null};
    refreshOwnVisualsV44();
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
  if(!e.target.closest('#profilePhotoMenu')&&!e.target.closest('#profilePhotoMenuButton'))closeProfilePhotoMenu();
});
window.addEventListener('resize',()=>{
  if(!$('#profilePhotoMenu')?.classList.contains('hidden'))positionProfilePhotoMenuV48();
});
window.addEventListener('scroll',()=>{
  if(!$('#profilePhotoMenu')?.classList.contains('hidden')&&window.innerWidth>900)closeProfilePhotoMenu();
},{passive:true});


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

  if(e.target.closest('#v28CoachHome')||e.target.closest('#v28RefreshCoach')){
    if($('#v28CoachText'))$('#v28CoachText').textContent=buildV28CoachText();
    if(e.target.closest('#v28CoachHome')){activateTab('stats');setTimeout(()=>$('#v28CoachText')?.scrollIntoView({behavior:'smooth',block:'center'}),120)}
    return;
  }
  if(e.target.closest('#v28QuickRival')){
    const first=$('#recommendedRivals [data-quick-challenge]');
    if(first){first.click()}else{activateTab('play');$('#challengePlayerSearch')?.focus()}
    return;
  }
  if(e.target.closest('#v28SeasonRecapButton')){await openV28SeasonRecap();return}
  const pickTeam=e.target.closest('[data-pick-team-player]');
  if(pickTeam){
    const [side,slotRaw,id]=pickTeam.dataset.pickTeamPlayer.split(':');
    const slot=Number(slotRaw);
    if(!v35Flags?.is_test_admin){
      const duplicate=[...teamDraftV32.home,...teamDraftV32.away].filter(Boolean).some(p=>String(p.id)===String(id));
      if(duplicate){
        setStatus($('#teamTournamentCreateStatusV32'),'Ese jugador ya ocupa otra raqueta. En modo normal los 8 jugadores deben ser diferentes.','error');
        return;
      }
    }
    teamDraftV32[side][slot]={id,first_name:pickTeam.dataset.name,last_name:'',username:pickTeam.dataset.user};
    renderTeamRacketsV32();return;
  }
  const clearTeam=e.target.closest('[data-clear-team-player]');
  if(clearTeam){
    const [side,slotRaw]=clearTeam.dataset.clearTeamPlayer.split(':');
    teamDraftV32[side][Number(slotRaw)]=null;renderTeamRacketsV32();return;
  }
  const teamMatch=e.target.closest('[data-team-match-result]');
  if(teamMatch){openTeamMatchModalV32(teamMatch.dataset.teamMatchResult);return}
  const openTeam=e.target.closest('[data-open-team-tournament]');
  if(openTeam){await openTeamTournamentDetailV32(openTeam.dataset.openTeamTournament);return}
  if(e.target.closest('[data-open-team-tiebreak]')){
    populateTeamTiebreakV32();$('#teamTiebreakModalV32').classList.remove('hidden');syncModalScrollLock();return;
  }
  if(e.target.closest('[data-finalize-team-v33]')){
    if(confirm('¿Finalizar oficialmente este torneo por equipos?')){
      await finalizeCurrentTeamTournamentV33();
    }
    return;
  }
  if(e.target.closest('[data-finalize-team-draw]')){
    if(confirm('¿Finalizar oficialmente la serie como empate 5–5?')){
      try{
        await finalizeTeamTournamentDrawV32(selectedTeamTournamentV32.tournament.id);
        selectedTeamTournamentV32=await getTeamTournamentV32(selectedTeamTournamentV32.tournament.id);
        renderTeamTournamentDetailV32();
        await Promise.all([loadTeamTournamentListV32(),loadTeamTournamentHistoryV33()]);
        showTeamVictoryV33(selectedTeamTournamentV32);
      }catch(err){alert(err.message)}
    }
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
      const chosen=frameBtn.dataset.equipFrame;
      await equipFrame(chosen);

      // V46: cambia en pantalla inmediatamente, sin F5/refresh.
      applyEquippedFrameLiveV46(chosen);

      setStatus($('#settingsStatus'),'Marco equipado y actualizado en vivo.','ok');
    }catch(err){
      frameBtn.disabled=false;
      setStatus($('#settingsStatus'),err.message,'error');
    }
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
if($('#refreshTournamentHistory'))$('#refreshTournamentHistory').onclick=loadTournamentHistoryV21;
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

if($('#openTeamTournamentV32')){
  $('#openTeamTournamentV32').onclick=e=>{
    e.preventDefault();
    openTeamTournamentBuilderV32();
  };
}
window.__TT_RIVALS_V32_TEAM_READY__=true;
if($('#backFromTeamTournamentV32'))$('#backFromTeamTournamentV32').onclick=()=>{showTournamentModesV32();loadTournamentHubV30()};
if($('#backFromTeamDetailV32'))$('#backFromTeamDetailV32').onclick=()=>{selectedTeamTournamentV32=null;openTeamTournamentBuilderV32()};
if($('#refreshTeamTournamentsV32'))$('#refreshTeamTournamentsV32').onclick=loadTeamTournamentListV32;
if($('#refreshTeamHistoryV33'))$('#refreshTeamHistoryV33').onclick=loadTeamTournamentHistoryV33;
if($('#closeTeamMatchModalV32'))$('#closeTeamMatchModalV32').onclick=()=>{$('#teamMatchModalV32').classList.add('hidden');currentTeamMatchV32=null;syncModalScrollLock()};
$('#teamMatchModalV32').addEventListener('click',e=>{if(e.target===$('#teamMatchModalV32'))$('#closeTeamMatchModalV32').click()});
if($('#closeTeamTiebreakModalV32'))$('#closeTeamTiebreakModalV32').onclick=()=>{$('#teamTiebreakModalV32').classList.add('hidden');syncModalScrollLock()};
if($('#closeTeamVictoryV33'))$('#closeTeamVictoryV33').onclick=closeTeamVictoryV33;
if($('#dismissTeamVictoryV33'))$('#dismissTeamVictoryV33').onclick=closeTeamVictoryV33;
if($('#continueTeamVictoryV33'))$('#continueTeamVictoryV33').onclick=showTeamEloV33;
if($('#closeTeamEloV33'))$('#closeTeamEloV33').onclick=closeTeamEloV33;
if($('#finishTeamEloV33'))$('#finishTeamEloV33').onclick=()=>{closeTeamEloV33();openTeamTournamentBuilderV32()};
$('#teamVictoryOverlayV33')?.addEventListener('click',e=>{if(e.target===$('#teamVictoryOverlayV33'))closeTeamVictoryV33()});
$('#teamEloOverlayV33')?.addEventListener('click',e=>{if(e.target===$('#teamEloOverlayV33'))closeTeamEloV33()});
$('#teamTiebreakModalV32').addEventListener('click',e=>{if(e.target===$('#teamTiebreakModalV32'))$('#closeTeamTiebreakModalV32').click()});

$('#teamTournamentFormV32').onsubmit=async e=>{
  e.preventDefault();
  const st=$('#teamTournamentCreateStatusV32');
  const all=[...teamDraftV32.home,...teamDraftV32.away];
  if(all.some(x=>!x))return setStatus(st,'Completá las 4 raquetas de cada equipo.','error');
  const isAdminTest=!!v35Flags?.is_test_admin;
  if(!isAdminTest){
    const uniquePlayers=new Set(all.map(x=>String(x.id)));
    if(uniquePlayers.size!==8)return setStatus(st,'En modo normal los 8 jugadores deben ser diferentes.','error');
  }
  // V48: las excepciones de prueba sólo existen para Admin.
  const pairIds={
    hd1:[$('#teamHomeD1AV32').value,$('#teamHomeD1BV32').value],
    hd2:[$('#teamHomeD2AV32').value,$('#teamHomeD2BV32').value],
    ad1:[$('#teamAwayD1AV32').value,$('#teamAwayD1BV32').value],
    ad2:[$('#teamAwayD2AV32').value,$('#teamAwayD2BV32').value]
  };
  if(Object.values(pairIds).some(p=>!p[0]||!p[1]))return setStatus(st,'Completá las cuatro parejas de dobles.','error');
  if(!isAdminTest&&Object.values(pairIds).some(p=>p[0]===p[1]))return setStatus(st,'En modo normal cada pareja de dobles debe tener dos jugadores diferentes.','error');

  try{
    const id=await createTeamTournamentV32({
      homeName:$('#teamHomeNameV32').value.trim(),
      awayName:$('#teamAwayNameV32').value.trim(),
      homeUsers:teamDraftV32.home.map(x=>x.id),
      awayUsers:teamDraftV32.away.map(x=>x.id),
      homeDoubles:{pair1:pairIds.hd1,pair2:pairIds.hd2},
      awayDoubles:{pair1:pairIds.ad1,pair2:pairIds.ad2}
    });
    await openTeamTournamentDetailV32(id);
  }catch(err){setStatus(st,err.message,'error')}
};

$('#teamMatchResultFormV32').onsubmit=async e=>{
  e.preventDefault();
  if(!currentTeamMatchV32)return;
  const rows=[...$('#teamSetInputsV32').querySelectorAll('.team-set-row-v32')];
  const sets=[];let hw=0,aw=0;
  for(const row of rows){
    const h=row.querySelector('[data-team-home-set]').value;
    const a=row.querySelector('[data-team-away-set]').value;
    if(h===''&&a==='')continue;
    if(h===''||a==='')return setStatus($('#teamMatchStatusV32'),'Completá ambos puntajes del set.','error');
    const hp=Number(h),ap=Number(a);
    if(hp===ap||Math.max(hp,ap)<11||Math.abs(hp-ap)<2)return setStatus($('#teamMatchStatusV32'),'Set inválido: mínimo 11 y diferencia de 2.','error');
    sets.push({home_points:hp,away_points:ap});
    if(hp>ap)hw++;else aw++;
    if(Math.max(hw,aw)===2)break;
  }
  if(Math.max(hw,aw)!==2)return setStatus($('#teamMatchStatusV32'),'El Bo3 debe terminar 2–0 o 2–1.','error');
  try{
    await submitTeamTournamentMatchResultV32(currentTeamMatchV32.id,sets);
    $('#closeTeamMatchModalV32').click();
    selectedTeamTournamentV32=await getTeamTournamentV32(selectedTeamTournamentV32.tournament.id);
    renderTeamTournamentDetailV32();
  }catch(err){setStatus($('#teamMatchStatusV32'),err.message,'error')}
};

$('#teamTiebreakFormV32').onsubmit=async e=>{
  e.preventDefault();
  const home=[$('#teamTiebreakHomeAV32').value,$('#teamTiebreakHomeBV32').value];
  const away=[$('#teamTiebreakAwayAV32').value,$('#teamTiebreakAwayBV32').value];
  if(!selectedTeamTournamentV32?.tournament?.test_mode&&(home[0]===home[1]||away[0]===away[1]))return setStatus($('#teamTiebreakStatusV32'),'Elegí dos jugadores diferentes por equipo.','error');
  try{
    await createTeamTiebreakV32(selectedTeamTournamentV32.tournament.id,home,away);
    $('#closeTeamTiebreakModalV32').click();
    selectedTeamTournamentV32=await getTeamTournamentV32(selectedTeamTournamentV32.tournament.id);
    renderTeamTournamentDetailV32();
  }catch(err){setStatus($('#teamTiebreakStatusV32'),err.message,'error')}
};

$('#v28CloseSeasonRecap').onclick=()=>{$('#v28SeasonRecapModal').classList.add('hidden');syncModalScrollLock()};
$('#closePostMatch').onclick=()=>{$('#postMatchModal').classList.add('hidden');pendingPostMatchReviewId=null;syncModalScrollLock()};
document.addEventListener('click',e=>{
  if(e.target.closest('[data-close-post-match]')){
    $('#postMatchModal').classList.add('hidden');syncModalScrollLock();
    const reviewId=pendingPostMatchReviewId;
    pendingPostMatchReviewId=null;
    if(reviewId)setTimeout(()=>openReviewModal(reviewId),80);
  }
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
$('#logoutButton').onclick=async()=>{stopTrainingTimerV53?.();stopLiveNotificationStream();await signOutUser();session=null;profile=null;ratings=[];showView('welcomeView')};

supabase.auth.onAuthStateChange((event,nextSession)=>{
  if(event==='PASSWORD_RECOVERY'){
    showPasswordRecoveryViewV53(nextSession);
  }
});

setupPwaV573().catch(err=>console.error('PWA V57.3:',err));

(async()=>{
  try{
    const recoveryHint=new URLSearchParams(window.location.search).get('recovery')==='1';

    setBootMessageV572('Comprobando sesión…');
    const startupSession=await getSession();

    if(recoveryHint){
      if(startupSession?.user){
        session=startupSession;
        showPasswordRecoveryViewV53(startupSession);
        closeBootScreenV572();
        return;
      }
      await new Promise(resolve=>setTimeout(resolve,300));
      if(passwordRecoveryActiveV53){
        closeBootScreenV572();
        return;
      }
    }

    await route(startupSession);
  }catch(e){
    console.error(e);
    showView('welcomeView');
    setStatus($('#globalStatus'),'Hubo un problema al comprobar la sesión. Podés iniciar sesión nuevamente.','error');
    closeBootScreenV572();
  }
})();

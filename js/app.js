import { supabase } from './supabase.js';
import {getSession,signUpUser,signInUser,signOutUser,requestPasswordReset,updateRecoveredPassword} from './auth.js';
import {getMyProfile,getMyRatings,completeSportsProfile,getClubsV47,ensureClubV47,getClubsV49,getClubsV50,getClubsV51,suggestClubsV49,suggestClubsV50,suggestClubsV51,ensureClubV49,ensureClubV51,setMyClubV49,setMyClubV51,getMyClubV49,getMyClubV51,adminListClubsV49,adminListClubsV51,adminMergeClubsV49,adminMergeClubsV51,adminRenameClubV49,adminCreateClubV51,adminUpdateClubV51,getRanking,searchPlayers,getRatingHistory,getRankTiers,setProfilePhotoUrl,uploadProfilePhoto,deleteProfilePhotoByUrl} from './profile.js';
import {createChallenge,createRematchChallengeV73,respondToChallenge,cancelChallenge,getMyChallenges} from './challenges.js?v=1.0.1-p7.3';
import {getMyMatches,submitMatchResult,confirmMatchResult,disputeMatchResult,getMyDurationStatsV59,adminListMatchIntegrityV59} from './matches.js';
import {createTournamentV8,getTournamentsV8,getTournamentEntriesV8,getTournamentMembersV8,getTournamentGamesV8,getTournamentStandingsV8,getTournamentStandingsV31,submitTournamentGameResultV8,closeGroupStageV8,finalizeTournamentV8,searchTournamentUsersV8,getTournamentParticipantProfilesV8,createTournamentV30,getMyTournamentHistoryV30,searchActiveTournamentsV30,joinTournamentV30,leaveTournamentV30,startTournamentV30,getTournamentLobbyV30} from './tournaments.js';
import {getReviewsForUser,getReviewsAuthoredByUser,submitPlayerReview,getPlayerProfile,getPlayerRatings,followPlayer,unfollowPlayer,getFollowingIds,getFollowingRanking,getPublicPlayerCard,getFollowingFeed,setPrimaryRival,clearPrimaryRival,getMyPrimaryRival,getShowcaseAchievements,setShowcaseAchievements,getPlayerReliabilityV34} from './social.js';
import {getPreferences,updatePreferences,getFrames,equipFrame,getSeasonDashboard,getSeasonHistory,getRecommendedRivals,getPlayerPercentiles,getPublicProfilePreferences} from './preferences.js';
import {getSeasonChampions,getPublicPlayerSeasons,getH2HAdvanced,getPlayerRecords,getTournamentSummary} from './history.js';
import {getPlayerTitles,equipCompetitiveTitle,refreshOwnCompetitiveTitlesV58,getTournamentHistory,getComparativeStats,getPostMatchSummary} from './v21.js';
import {getV28Dashboard,getV28LastSeasonRecap,getDailyMissionsV101} from './v28.js';
import {getMyV35Flags,updateMyLocationV35,getNearbyPlayersV35,createPresenceManagerV35} from './v35_social.js';
import {getPublicAdminFlagV37,getPublicAdminIdsV38} from './v36_live.js';
import {getFrameFitsV44,saveFrameFitV44,resetFrameFitV44,subscribeAvatarLiveV44} from './v44_avatar_fit.js';
import {createTeamTournamentV32,getTeamTournamentV32,listMyTeamTournamentsV32,submitTeamTournamentMatchResultV32,createTeamTiebreakV32,finalizeTeamTournamentDrawV32,finalizeTeamTournamentV33,listMyTeamTournamentHistoryV33} from './team_tournaments.js';
import {setupTrainingTimerV53} from './training.js';
import {createCompetitionLiveSyncV55} from './v55_competition_live.js';
import {getMyStatsV56} from './v56_stats.js';
import {setupPwaV573,getPwaDiagnosticsV60,checkForUpdateV60} from './pwa.js';
import {APP_VERSION,APP_BUILD} from './version.js';
import {withActionLockV60,installRapidClickGuardV60,installErrorCaptureV60,getRecentErrorsV60,recordClientErrorV60} from './v60_runtime.js';
import {getPresenceV60,createPresenceHeartbeatV60} from './v60_presence.js';
import {getAdminProductMetricsV70,recordProductEventV70} from './v70_metrics.js';
import {getCompetitiveProgressV72} from './v72_progress.js';
import {getHistorySeasonsV60} from './v60_history.js';
import {initMotionV601,animateTabEnterV601,animateNumberV601,animateProgressV601,animatePriorityV601,animateListV601,animateRankingMovementV601,pulseProtectionReadyV601,animatePostMatchV601,celebrateRewardV601} from './v60_motion.js';
import {
  registerCurrentInstallationV58,
  getMyProtectionV58,
  getMyNotificationsV58,markNotificationReadV58,markAllNotificationsReadV58,
  getMatchDisputeV58,searchDisputeArbitersV58,proposeDisputeArbiterV58,respondDisputeArbiterV58,
  declineDisputeAssignmentV58,requestAdminDisputeV58,requestAnnulDisputeV58,resolveDisputeV58,
  adminListDisputesV58,adminListLinkedAccountsV58,adminAllowRelatedPairV58,adminRevokeRelatedPairV58,
  submitPlayerReviewV58,getMyReviewTagsV58,adminListReviewTagsV58,adminInvalidateReviewTagV58
} from './v58_competition.js';
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

// V61.1.2 — La IA se carga de forma aislada para que un fallo del módulo
// de Intelligence Lab nunca bloquee el arranque del resto de TT Rivals.
let aiModuleV612=null;
let aiModulePromiseV612=null;
function showAiModuleErrorV612(error){
  console.error('TT AI module:',error);
  const label=$('#aiEngineLabelV61');
  const dot=$('#aiEngineDotV61');
  if(label)label.textContent='IA no disponible';
  if(dot){dot.className='';dot.classList.add('is-offline')}
  const host=$('#aiWorkspaceV61');
  if(host){
    let note=$('#aiModuleErrorV612');
    if(!note){
      note=document.createElement('div');
      note.id='aiModuleErrorV612';
      note.className='status error';
      host.prepend(note);
    }
    note.textContent='Intelligence Lab no pudo cargarse. El resto de TT Rivals sigue disponible.';
  }
}
async function ensureAiModuleV612(){
  if(aiModuleV612)return aiModuleV612;
  if(!aiModulePromiseV612){
    aiModulePromiseV612=import(`./v61_ai.js?v=${encodeURIComponent(APP_VERSION)}`)
      .then(mod=>{
        aiModuleV612=mod;
        mod.initAiV61?.();
        return mod;
      })
      .catch(error=>{
        aiModulePromiseV612=null;
        showAiModuleErrorV612(error);
        throw error;
      });
  }
  return aiModulePromiseV612;
}

// V62 — Dobles se carga de forma aislada. Un problema en el flujo 2vs2
// nunca debe impedir que el núcleo 1vs1 de TT Rivals arranque.
let doublesModuleV62=null;
let doublesModulePromiseV62=null;
function showPlayModeV62(mode=null){
  const individual=mode==='individual',doubles=mode==='doubles';
  document.querySelector('#playIndividualModeV62')?.classList.toggle('hidden',!individual);
  document.querySelector('#playDoublesModeV62')?.classList.toggle('hidden',!doubles);
  document.querySelectorAll('[data-play-mode-v62]').forEach(b=>b.classList.toggle('active',b.dataset.playModeV62===mode));
}

async function ensureDoublesModuleV62(){
  if(doublesModuleV62)return doublesModuleV62;
  if(!doublesModulePromiseV62){
    doublesModulePromiseV62=import(`./v62_doubles.js?v=${encodeURIComponent(APP_VERSION)}`)
      .then(mod=>{doublesModuleV62=mod;mod.initDoublesV62?.();return mod})
      .catch(error=>{doublesModulePromiseV62=null;recordClientErrorV60(error,'v62-doubles');console.error('Dobles V62:',error);throw error});
  }
  return doublesModulePromiseV62;
}

// V63 — Integridad Admin + recompensas se cargan de forma aislada.
// Un fallo en estas herramientas nunca debe impedir el arranque de TT Rivals.
let v63Module=null;
let v63ModulePromise=null;
async function ensureV63Module(){
  if(v63Module)return v63Module;
  if(!v63ModulePromise){
    v63ModulePromise=import(`./v63_integrity_rewards.js?v=${encodeURIComponent(APP_VERSION)}`)
      .then(mod=>{v63Module=mod;mod.initV63IntegrityRewards?.();return mod})
      .catch(error=>{v63ModulePromise=null;recordClientErrorV60(error,'v63-integrity-rewards');console.error('V63:',error);throw error});
  }
  return v63ModulePromise;
}

// TT-Rivals Versión 1.0 — comunidad, clubes internacionales y Dónde practicar.
// Se mantiene desacoplado del arranque crítico igual que IA, Dobles y V63.
let v100Module=null;
let v100ModulePromise=null;
async function ensureV100Module(){
  if(v100Module)return v100Module;
  if(!v100ModulePromise){
    v100ModulePromise=import(`./v100_launch.js?v=${encodeURIComponent(APP_VERSION)}`)
      .then(mod=>{v100Module=mod;return mod})
      .catch(error=>{v100ModulePromise=null;recordClientErrorV60(error,'v100-community');console.error('TT-Rivals 1.0:',error);throw error});
  }
  return v100ModulePromise;
}

// TT Rivals 1.0.1 — experiencia de entrada sin IA/tokens.
// Se carga de forma lazy para que nunca pueda bloquear el arranque principal.
let v101ExperienceModule=null;
let v101ExperiencePromise=null;
async function ensureV101Experience(){
  if(v101ExperienceModule)return v101ExperienceModule;
  if(!v101ExperiencePromise){
    v101ExperiencePromise=import(`./v101_experience.js?v=${encodeURIComponent(APP_VERSION)}`)
      .then(mod=>{v101ExperienceModule=mod;return mod})
      .catch(error=>{v101ExperiencePromise=null;recordClientErrorV60(error,'v101-experience');console.warn('TT Rivals 1.0.1 experiencia:',error);throw error});
  }
  return v101ExperiencePromise;
}
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
let reviewTargetMatch=null,selectedReviewStars=0,reviewStarsLockedV62=false;
let competitionLiveSyncV55=null;
let liveRefreshTimersV55=new Map(),competitionRefreshPromiseV55=null;
let lastRatingSignatureV55='';
let statsModeV56='all',statsModeStateV56=null,statsModeLoadPromiseV56=null;
let legalConfigV57=null,legalStatusV57=null,currentLegalTabV57='terms';
let v58State={protection:{points:0,shield_available:false},notifications:[],installation:null,dispute:null,adminDisputes:[],linkedAccounts:[],reviewTags:[]};
let durationStatsV59=null,adminIntegrityV59=[],matchClockTimerV59=null;
let selectedReviewTagsV58=new Set(),disputeSearchTimerV58=null;
let rankingScope='global',followingIds=[],primaryRivalId=null;
let myShowcaseAchievementIds=[],showcaseDraftIds=[];
let userPreferences=null,frameState={catalog:[],unlocks:[],equipped:null},seasonState=null,percentileState={},titleState={equipped:null,items:[]},comparativeState={};
let historyModeFilter='all',historyResultFilter='all',competitivePulseTarget=null;
let v28Dashboard={},v28SeasonRecap={};
let myReliabilityV34={reliability:100,completed_matches:0,abandoned_matches:0,total_matches:0,provisional:true,label:'Jugador fiable'};
let v35Flags={is_test_admin:false,nearby_opt_in:false,nearby_visibility:'everyone'},presenceManagerV35=null,onlineUserIdsV35=new Set(),lastKnownPositionV35=null;
let frameFitsV44=new Map(),liveFramePreviewV44=null,stopAvatarLiveV44=null;

const PRIMARY_ADMIN_EMAIL_V101='ttrivalsuy@gmail.com';
function canUseAdminUIV101(){
  return !!v35Flags?.is_test_admin && String(session?.user?.email||'').trim().toLowerCase()===PRIMARY_ADMIN_EMAIL_V101;
}
let adminUserIdsV38=new Set(),universalPlayerObserverV38=null;
let passwordRecoveryActiveV53=false,recoveryProfileV53=null;
const stopTrainingTimerV53=setupTrainingTimerV53();

let liveMatchStatusSnapshot=new Map(),liveMatchStatusPrimed=false,postMatchShownIds=new Set(),pendingPostMatchReviewId=null;
let v60State={challenges:[],matches:[],matchSets:new Map(),recommended:[],activityItems:[],activityFilter:'attention',historyModality:'all',historySeason:'all',historyDateFrom:'',historyDateTo:'',historySort:'recent',recentPresence:new Map(),historySeasons:[],adminCategory:'disputes',lastDiagnostics:null,metricsDays:7,lastProductMetrics:null};
let presenceHeartbeatV60=null,activityLoadPromiseV60=null,achievementUnlockPrimedV60=false,titleUnlockPrimedV60=false,missionUnlockPrimedV60=false;
let lastUnlockedAchievementsV60=new Set(),lastUnlockedTitlesV60=new Set(),lastCompletedMissionsV60=new Set();
let recentRewardsV60=[];




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
  admin_arcane_gear:'./assets/frames/admin-arcane-gear.png',
  tester_collaborator_v100:'./assets/frames/tester-exclusive-v100.png'
};
const ADMIN_ONLY_FRAME_IDS_V52=new Set(['admin_arcane_gear']);
const GRANT_ONLY_FRAME_IDS_V100=new Set(['tester_collaborator_v100']);
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
  const themeMeta=document.querySelector('meta[name="theme-color"]');
  if(themeMeta)themeMeta.setAttribute('content',resolved==='light'?'#f4f7fb':'#080d18');
  document.documentElement.style.colorScheme=resolved;
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
  check('#prefShowActivityV60',userPreferences.show_activity_status!==false);
  set('#prefBackgroundEffectQualityP61',userPreferences.background_effect_quality||'auto');
  applyBackgroundEffectPreferenceP61(userPreferences.background_effect_quality||'auto');
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
    (v35Flags?.is_test_admin || !ADMIN_ONLY_FRAME_IDS_V52.has(x.id)) &&
    (v35Flags?.is_test_admin || !GRANT_ONLY_FRAME_IDS_V100.has(x.id) || frameIsAvailable(x))
  );
  const rows=[{id:'none',name:'Sin marco',category:'special',rarity:'common',description:'Perfil limpio, sin marco.',sort_order:-1},...visibleCatalog];
  box.innerHTML=rows.map(f=>{
    const available=frameIsAvailable(f);
    const equipped=(frameState.equipped||null)===(f.id==='none'?null:f.id);
    const cardTier=f.id==='season_first'?'season-card-first':f.id==='season_second'?'season-card-second':f.id==='season_third'?'season-card-third':f.id==='season_elite'?'season-card-elite':f.id==='admin_arcane_gear'?'admin-frame-card-v52':f.id==='tester_collaborator_v100'?'tester-frame-card-v100':'';
    return `<article class="frame-card ${cardTier} ${available?'unlocked':'locked'} ${equipped?'equipped':''}" data-frame-id="${esc(f.id)}">
      ${framePreviewMarkupV45(f.id)}
      <div class="frame-card-copy"><strong>${esc(f.name)}</strong><small>${esc(f.description||'')}</small><i>${f.id==='tester_collaborator_v100'?'EXCLUSIVO':String(f.rarity||'common').toUpperCase()}</i></div>
      <button type="button" data-equip-frame="${f.id}" ${available?'':'disabled'}>${equipped?'Equipado ✓':available?'Equipar':'🔒'}</button>
    </article>`;
  }).join('');
}

const BACKGROUND_EFFECT_LABELS_P61={
  auto:{badge:'AUTO',title:'TT Rivals adapta los efectos al dispositivo',detail:'Si detecta presión de rendimiento, reduce automáticamente partículas, resolución y FPS.'},
  high:{badge:'ALTO',title:'Máxima intensidad visual',detail:'Más partículas, estelas, nodos y resolución del fondo. Recomendado para dispositivos potentes.'},
  medium:{badge:'MEDIO',title:'Equilibrio entre fluidez y detalle',detail:'Mantiene todos los efectos con una carga moderada.'},
  low:{badge:'BAJO',title:'Modo liviano para dispositivos antiguos',detail:'Reduce partículas, estelas, resolución interna y FPS de los fondos.'},
  off:{badge:'OFF',title:'Fondos animados desactivados',detail:'La interfaz conserva toda su calidad; únicamente se detienen las animaciones decorativas del fondo.'}
};
function applyBackgroundEffectPreferenceP61(value='auto'){
  const pref=BACKGROUND_EFFECT_LABELS_P61[value]?value:'auto';
  window.__TT_MOTION_V101?.setPreference?.(pref);
  document.documentElement.dataset.ttFxPreference=pref;
  const copy=BACKGROUND_EFFECT_LABELS_P61[pref];
  if($('#backgroundEffectQualityBadgeP61'))$('#backgroundEffectQualityBadgeP61').textContent=copy.badge;
  if($('#backgroundEffectQualityTitleP61'))$('#backgroundEffectQualityTitleP61').textContent=copy.title;
  if($('#backgroundEffectQualityDetailP61'))$('#backgroundEffectQualityDetailP61').textContent=copy.detail;
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
  window.__TT_BOOT_FINISHED=true;
  if(window.__TT_BOOT_WATCHDOG)clearTimeout(window.__TT_BOOT_WATCHDOG);
  document.body.classList.remove('tt-booting-v572');
  const recovery=document.querySelector('#ttBootRecoveryV601');
  recovery?.remove();
  const splash=$('#ttBootScreenV572');
  if(!splash)return;
  splash.classList.add('is-leaving');
  setTimeout(()=>splash.remove(),220);
}

function showView(id){authShell.classList.remove('hidden');mainApp.classList.add('hidden');views.forEach(v=>v.classList.toggle('active',v.id===id));window.scrollTo(0,0);if(id==='sportsProfileView'){loadAvailableClubsV49().catch(err=>console.warn('Clubes V49:',err));ensureV100Module().then(mod=>mod.initOnboardingV100?.()).catch(err=>console.warn('Onboarding 1.0:',err))}}
function showMain(){authShell.classList.add('hidden');mainApp.classList.remove('hidden');activateTab('home')}
function setStatus(el,msg,type=''){el.textContent=msg;el.classList.remove('ok','error');if(type)el.classList.add(type)}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function formatDurationV59(seconds,{clock=false}={}){
  const total=Math.max(0,Math.floor(Number(seconds)||0));
  const h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60;
  if(clock)return h>0?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`;
  if(h>0)return `${h} h ${m} min`;
  if(m>0)return `${m} min${s?` ${s} s`:''}`;
  return `${s} s`;
}
function elapsedFromV59(value){
  if(!value)return null;
  const ms=new Date(value).getTime();
  if(!Number.isFinite(ms))return null;
  return Math.max(0,Math.floor((Date.now()-ms)/1000));
}
function matchTimingChipV59(m){
  if(!m)return'';
  const started=m.started_at||m.created_at;
  if(m.result_status==='pending'&&started){
    const secs=elapsedFromV59(started);
    return `<span class="match-time-chip-v59 live" data-live-match-duration-v59="${m.id}" data-started-at-v59="${esc(started)}">⏱ En juego · ${formatDurationV59(secs,{clock:true})}</span>`;
  }
  if(m.gameplay_seconds!==null&&m.gameplay_seconds!==undefined){
    const warning=m.duration_anomaly_v59&&m.completion_type!=='abandonment';
    const label=m.result_status==='confirmed'?'Tiempo de juego':'Resultado cargado';
    return `<span class="match-time-chip-v59 ${warning?'review':''}">⏱ ${label} · ${formatDurationV59(m.gameplay_seconds)}</span>`;
  }
  return'';
}
function updateLiveMatchClocksV59(){
  $$('[data-live-match-duration-v59]').forEach(el=>{
    const secs=elapsedFromV59(el.dataset.startedAtV59);
    if(secs===null)return;
    el.textContent=`⏱ En juego · ${formatDurationV59(secs,{clock:true})}`;
  });
}
function startMatchClocksV59(){
  if(matchClockTimerV59)return;
  updateLiveMatchClocksV59();
  matchClockTimerV59=setInterval(updateLiveMatchClocksV59,1000);
}

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
  // V1.0.1: la racha competitiva que alimenta el boost de Elo usa sólo ranked.
  // Ganar por abandono no aumenta la racha; abandonar sí la corta.
  const confirmed=(matches||[])
    .filter(m=>m.result_status==='confirmed'&&(m.match_type||'ranked')==='ranked')
    .sort((a,b)=>new Date(a.confirmed_at||a.played_at||a.created_at)-new Date(b.confirmed_at||b.played_at||b.created_at));
  let current=0,max=0;
  for(const m of confirmed){
    if(m.completion_type==='abandonment'){
      if(m.abandoned_by===userId)current=0;
      continue;
    }
    if(m.winner_id===userId){current++;max=Math.max(max,current)}
    else current=0;
  }
  return {current,max};
}
function streakBoostForNextWinV101(streak){
  const n=Number(streak||0);
  if(n>=12)return 3;
  if(n===11)return 2.75;
  if(n===10)return 2.5;
  if(n===9)return 2.25;
  if(n===8)return 2;
  if(n===7)return 1.75;
  if(n===6)return 1.5;
  if(n===5)return 1.25;
  return 1;
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
  const rows=[
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

  const metric=(a)=>{
    const id=String(a.id||'');
    const target=Number(id.split('_').at(-1))||1;
    let current=0,goal=target,label='';
    if(id.startsWith('match_'))current=total;
    else if(id.startsWith('win_'))current=wins;
    else if(id.startsWith('streak_'))current=streak;
    else if(id.startsWith('elo_'))current=maxElo;
    else if(id.startsWith('casual_'))current=casual;
    else if(id.startsWith('ranked_'))current=ranked;
    else if(id.startsWith('follow_'))current=following;
    else if(id==='rep_1'){current=repCount;goal=1}
    else if(id==='rep_4_5'){
      const countPct=Math.min(1,repCount/5),ratingPct=Math.min(1,repAvg/4);
      const progress=Math.round(Math.min(countPct,ratingPct)*100);
      return {current:progress,goal:100,progress,progress_label:`${Math.min(repCount,5)}/5 valoraciones · ${repAvg.toFixed(1)}/4.0★`};
    }else if(id==='rep_45_10'){
      const countPct=Math.min(1,repCount/10),ratingPct=Math.min(1,repAvg/4.5);
      const progress=Math.round(Math.min(countPct,ratingPct)*100);
      return {current:progress,goal:100,progress,progress_label:`${Math.min(repCount,10)}/10 valoraciones · ${repAvg.toFixed(1)}/4.5★`};
    }else if(id==='rep_48_20'){
      const countPct=Math.min(1,repCount/20),ratingPct=Math.min(1,repAvg/4.8);
      const progress=Math.round(Math.min(countPct,ratingPct)*100);
      return {current:progress,goal:100,progress,progress_label:`${Math.min(repCount,20)}/20 valoraciones · ${repAvg.toFixed(1)}/4.8★`};
    }
    const progress=Math.round(Math.max(0,Math.min(100,(current/Math.max(1,goal))*100)));
    if(id.startsWith('elo_'))label=`${Math.min(current,goal)} / ${goal} Elo`;
    else label=`${Math.min(current,goal)} / ${goal}`;
    return {current,goal,progress,progress_label:label};
  };
  return rows.map(a=>({...a,...metric(a)}));
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

function showRewardToastV60(reward){
  if(!reward)return;
  let host=$('#v60RewardToastHost');
  if(!host){host=document.createElement('div');host.id='v60RewardToastHost';host.className='v60-reward-toast-host';document.body.appendChild(host)}
  const toast=document.createElement('article');
  toast.className=`v60-reward-toast reward-${reward.kind||'achievement'}`;
  toast.innerHTML=`<span>${esc(reward.icon||'✦')}</span><div><small>${esc(reward.kicker||'NUEVO DESBLOQUEO')}</small><strong>${esc(reward.name||'Recompensa')}</strong><p>${esc(reward.detail||'Tu progreso competitivo avanzó.')}</p></div>`;
  host.appendChild(toast);
  requestAnimationFrame(()=>toast.classList.add('show'));
  setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),300)},5200);
}
function pushRewardV60(reward,{toast=true}={}){
  const row={...reward,at:Date.now()};
  recentRewardsV60.push(row);
  recentRewardsV60=recentRewardsV60.filter(x=>Date.now()-Number(x.at||0)<90000).slice(-8);
  if(toast){
    if(row.kind==='achievement'||row.kind==='title')celebrateRewardV601(row);
    else showRewardToastV60(row);
  }
  return row;
}
function trackAchievementUnlocksV60(items=[]){
  const unlocked=new Set(items.filter(x=>x.unlocked).map(x=>String(x.id)));
  if(achievementUnlockPrimedV60){
    items.filter(x=>x.unlocked&&!lastUnlockedAchievementsV60.has(String(x.id))).forEach(a=>pushRewardV60({kind:'achievement',icon:a.icon||'✦',kicker:'LOGRO DESBLOQUEADO',name:a.name,detail:a.desc}));
  }else achievementUnlockPrimedV60=true;
  lastUnlockedAchievementsV60=unlocked;
}
function trackTitleUnlocksV60(items=[]){
  const unlocked=new Set(items.filter(x=>x.unlocked).map(x=>String(x.id)));
  if(titleUnlockPrimedV60){
    items.filter(x=>x.unlocked&&!lastUnlockedTitlesV60.has(String(x.id))).forEach(t=>pushRewardV60({kind:'title',icon:t.icon||'✦',kicker:'TÍTULO DESBLOQUEADO',name:t.name,detail:t.description||t.progress_label||'Nuevo título disponible.'}));
  }else titleUnlockPrimedV60=true;
  lastUnlockedTitlesV60=unlocked;
}
function trackMissionCompletionsV60(missions=[]){
  const complete=new Set(missions.filter(m=>Number(m.progress||0)>=Number(m.goal||1)).map(m=>String(m.id||m.title)));
  if(missionUnlockPrimedV60){
    missions.filter(m=>Number(m.progress||0)>=Number(m.goal||1)&&!lastCompletedMissionsV60.has(String(m.id||m.title))).forEach(m=>pushRewardV60({kind:'mission',icon:'⚡',kicker:'MISIÓN COMPLETADA',name:m.title,detail:`+${Number(m.reward||0)} XP` }));
  }else missionUnlockPrimedV60=true;
  lastCompletedMissionsV60=complete;
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

function presenceLabelV60(userId){
  const id=String(userId||'');
  if(!id)return 'Estado no disponible';
  if(isOnlineV35(id))return 'En línea ahora';
  const seen=v60State.recentPresence.get(id);
  if(!seen)return 'Sin actividad reciente';
  const diff=Math.max(0,Date.now()-new Date(seen).getTime());
  const min=Math.floor(diff/60000);
  if(min<2)return 'Activo hace un momento';
  if(min<60)return `Activo hace ${min} min`;
  const h=Math.floor(min/60);
  if(h<24)return `Activo hace ${h} h`;
  const d=Math.floor(h/24);
  if(d<=7)return `Activo hace ${d} d`;
  return 'Activo hace más de 7 días';
}
function decoratePresenceTextV60(){
  $$('[data-presence-text-v60]').forEach(el=>{
    const uid=el.dataset.presenceTextV60;
    el.textContent=presenceLabelV60(uid);
    el.classList.toggle('is-online',isOnlineV35(uid));
  });
  $$('[data-user-id-v35]').forEach(el=>{el.title=presenceLabelV60(el.dataset.userIdV35)});
}
async function refreshPresenceV60(userIds=[]){
  const ids=[...new Set((userIds||[]).filter(Boolean).map(String))];
  if(!ids.length)return;
  try{
    const rows=await getPresenceV60(ids);
    for(const row of rows)v60State.recentPresence.set(String(row.user_id),row.last_seen_at);
    decoratePresenceTextV60();
  }catch(err){console.warn('Actividad reciente V60:',err)}
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
  $('#adminNavItemV43')?.classList.toggle('hidden',!canUseAdminUIV101());
  $('#adminTopButtonV101')?.classList.toggle('hidden',!canUseAdminUIV101());
  document.body.classList.toggle('is-admin-v43',canUseAdminUIV101());
  $('#checkAppUpdateV59')?.classList.toggle('hidden',!canUseAdminUIV101());

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
    box.innerHTML=rows.length?rows.map(x=>`<article class="nearby-player-card-v35 v60-nearby-card"><button type="button" class="v60-nearby-profile" data-open-player="${x.user_id}"><div class="nearby-avatar-v35" data-user-id-v35="${x.user_id}">${x.profile_photo_url?`<img src="${esc(x.profile_photo_url)}" alt="">`:`<span>${esc(((x.first_name?.[0]||'')+(x.last_name?.[0]||'')).toUpperCase()||'TT')}</span>`}${onlineDotV35(x.user_id)}</div><div><strong>${esc(`${x.first_name||''} ${x.last_name||''}`.trim()||x.username)} ${x.is_test_admin?'<span class="admin-mini-v37">◆ ADMIN</span>':''}</strong><small>@${esc(x.username||'')} · ${formatDistanceV35(x.distance_km)}</small><em class="v60-presence-text" data-presence-text-v60="${x.user_id}">${presenceLabelV60(x.user_id)}</em></div></button><button class="v60-nearby-challenge" data-quick-challenge="${x.user_id}" data-name="${esc(`${x.first_name||''} ${x.last_name||''}`.trim()||x.username)}" data-user="${esc(x.username||'')}" type="button">⚔</button></article>`).join(''):'<div class="loading-row">No encontramos jugadores visibles a menos de 50 km.</div>';
    refreshPresenceV60(rows.map(x=>x.user_id)).catch(()=>{});
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
  const value=Number(rating)||0;
  const current=rankForRating(value);
  const tiers=rankTiers.length?rankTiers:[
    {name:'Bronce',min_rating:0},{name:'Plata',min_rating:1100},{name:'Oro',min_rating:1250},
    {name:'Platino',min_rating:1400},{name:'Diamante',min_rating:1600}
  ];
  const i=Math.max(0,tiers.findIndex(t=>t.name===current));
  const next=tiers[i+1]||null;
  const rawFloor=Number(tiers[i]?.min_rating||0);
  // Bronce históricamente tiene piso técnico 0, pero TT Rivals nace alrededor de 1000 Elo.
  // Para la barra visual usamos 800 como piso competitivo para no mostrar un 833 como 76% de Plata.
  const floor=current==='Bronce'?Math.max(rawFloor,800):rawFloor;
  const ceiling=Number(next?.min_rating||value);
  const span=Math.max(1,ceiling-floor);
  const progress=next?Math.max(0,Math.min(100,((value-floor)/span)*100)):100;
  const remaining=next?Math.max(0,Number(next.min_rating)-value):0;
  return {current,next,progress,floor,rawFloor,ceiling,remaining};
}

function friendly(m=''){const t=m.toLowerCase();if(t.includes('mismo dispositivo')||t.includes('relacionadas por dispositivo')||t.includes('misma instalación'))return'Estas cuentas están vinculadas a la misma instalación de TT Rivals y no pueden enfrentarse entre sí.';if(t.includes('already registered'))return'Ese correo ya está registrado.';if(t.includes('duplicate')||t.includes('unique'))return'Ese nombre de usuario ya está en uso.';if(t.includes('invalid login credentials'))return'Correo o contraseña incorrectos.';return m||'Ocurrió un error.'}

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
  animateNumberV601($('#homeIndividualRating'),ind.rating,{duration:560});
  animateNumberV601($('#homeDoublesRating'),dob.rating,{duration:560});

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
  if($('#profileStreakTag')){
    const streak=Number(socialState.streak.current||0),mult=streakBoostForNextWinV101(streak);
    $('#profileStreakTag').textContent=`🔥 Racha ${streak}${mult>1?` · próxima x${String(mult).replace('.00','')}`:''}`;
    $('#profileStreakTag').title=mult>1?`Tu próxima victoria ranked recibe x${mult} en la ganancia positiva de Elo.`:'El boost de Elo empieza al buscar la 6.ª victoria consecutiva ranked.';
  }
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
  trackAchievementUnlocksV60(socialState.achievements);
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

function missionTimeLeftV101(resetAt){
  const reset=Number.isFinite(Date.parse(resetAt))?new Date(resetAt):null;
  const left=reset?Math.max(0,reset-Date.now()):0;
  return {hours:Math.floor(left/3600000),mins:Math.floor((left%3600000)/60000)};
}

function renderDailyMissionsV101(daily=null,errorMessage=''){
  const missions=$('#v28MissionList');
  if(!missions)return;
  if(errorMessage){
    console.warn('Misiones V101:',errorMessage);
    missions.innerHTML=`<article class="ui101-mission-error"><span class="ui101-mission-error-icon">↻</span><div><strong>No pudimos sincronizar tus misiones.</strong><small>Tu progreso está seguro. Reintentá en unos segundos.</small></div><button id="retryDailyMissionsV101" type="button">Reintentar</button></article>`;
    return;
  }
  if(!daily){
    missions.innerHTML='<article class="ui101-mission-error"><span class="ui101-mission-error-icon">◎</span><div><strong>Misiones temporalmente no disponibles.</strong><small>Podés seguir usando TT Rivals con normalidad.</small></div><button id="retryDailyMissionsV101" type="button">Reintentar</button></article>';
    return;
  }
  const all=Array.isArray(daily.missions)?daily.missions:[];
  const active=all.filter(m=>!m.completed);
  const {hours,mins}=missionTimeLeftV101(daily.reset_at);
  if(daily.all_completed||(!active.length&&Number(daily.completed||0)>=Number(daily.total||3))){
    missions.innerHTML=`<article class="v101-missions-complete"><span>✓</span><div><small>OBJETIVOS DEL DÍA</small><strong>Misiones diarias completadas</strong><p>Ganaste ${Number(daily.xp_earned_today||0)} XP hoy.</p><em data-v101-mission-reset="${esc(daily.reset_at||'')}">Nuevas misiones en ${hours} h ${mins} min</em></div></article>`;
    return;
  }
  if(!all.length){
    missions.innerHTML='<article class="ui101-mission-error"><span class="ui101-mission-error-icon">🎯</span><div><strong>Preparando tus objetivos del día.</strong><small>Generamos una selección nueva para tu sesión.</small></div><button id="retryDailyMissionsV101" type="button">Generar</button></article>';
    return;
  }
  missions.innerHTML=`<div class="v101-mission-cycle-head"><span>${Number(daily.completed||0)} / ${Number(daily.total||3)} completadas</span><small data-v101-mission-reset="${esc(daily.reset_at||'')}">Renuevan en ${hours} h ${mins} min</small></div>${active.map(m=>{
    const goal=Math.max(1,Number(m.goal||1));
    const progress=Math.max(0,Number(m.progress||0));
    const pct=Math.min(100,(progress/goal)*100);
    const diff=m.difficulty==='challenge'?'DESAFÍO':m.difficulty==='medium'?'MEDIA':'RÁPIDA';
    return `<article class="v28-mission v101-mission-${esc(m.difficulty||'easy')}">
      <div><span>${diff}</span><strong>${esc(m.title||'Misión diaria')}</strong><small>${esc(m.description||'Objetivo diario')} · +${Number(m.reward||0)} XP</small></div>
      <b>${progress}/${goal}</b>
      <div class="v28-mission-track"><i style="width:${pct}%"></i></div>
    </article>`;
  }).join('')}`;
}

async function retryDailyMissionsV101(){
  const box=$('#v28MissionList');
  if(box)box.innerHTML='<div class="ui101-mission-skeleton" aria-label="Cargando misiones"><i></i><i></i><i></i></div>';
  try{
    const daily=await getDailyMissionsV101();
    v28Dashboard={...(v28Dashboard||{}),daily_missions_v101:daily,daily_missions_error:null,missions:daily?.missions||[]};
    renderDailyMissionsV101(daily,'');
    trackMissionCompletionsV60(daily?.missions||[]);
  }catch(err){
    console.error('Misiones V101',err);
    renderDailyMissionsV101(null,err?.message||'No se pudo completar la consulta.');
  }
}

function renderV28Dashboard(){
  const d=v28Dashboard||{};
  if($('#v28Level'))$('#v28Level').textContent=d.level||1;
  if($('#v28XpText'))$('#v28XpText').textContent=`${d.level_progress||0} / ${d.level_goal||500} XP`;
  if($('#v28XpBar'))animateProgressV601($('#v28XpBar'),Math.min(100,((d.level_progress||0)/(d.level_goal||500))*100));

  renderDailyMissionsV101(d.daily_missions_v101||null,d.daily_missions_error||'');

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
    trackMissionCompletionsV60(v28Dashboard?.missions||[]);
    renderV28Dashboard();
  }catch(err){
    console.error('V28 dashboard',err);
    renderDailyMissionsV101(null,err?.message||'No se pudo cargar el panel competitivo.');
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
  await loadV58Core({refreshTitles:true});
  titleState=await getPlayerTitles(session.user.id).catch(()=>titleState);
  trackTitleUnlocksV60(titleState.items||[]);
  populate();
  await Promise.all([loadRanking(),loadChallenges(),loadMatches(),loadHistory(),loadHomeDashboard(),loadHistoryPage(),loadLiveNotifications(),loadRecommendedRivals(),loadChampionsHall(),loadStatsModeV56(false),loadDurationStatsV59(),loadV28Experience(),loadActivityCenter()]);
}
async function loadApp(uid,p=null){
  profile=p||await getMyProfile(uid);

  // V58: sólo bloquean la primera pintura el rating y el registro de la
  // instalación (seguridad anti-multicuenta). Todo lo demás se hidrata después.
  const [myRatings,installation]=await Promise.all([
    getMyRatings(uid),
    registerCurrentInstallationV58().catch(err=>({error:err.message}))
  ]);
  ratings=myRatings;
  v58State.installation=installation;

  populate();
  showMain();

  // La bienvenida se monta después de identificar la sesión. Es decorativa y
  // queda completamente fuera del camino crítico de carga.
  ensureV101Experience()
    .then(mod=>mod.showEntryMotivationV101?.({profile}))
    .catch(()=>{});

  // Carga secundaria en paralelo. La pantalla ya es utilizable.
  (async()=>{
    try{
      const [tiers]=await Promise.all([
        getRankTiers().catch(e=>{console.error(e);return []}),
        loadSocialState(),
        loadExperienceSettings(),
        loadV35Flags(),
        loadFrameFitsV44(),
        loadV58Core({refreshTitles:true,skipInstallation:true})
      ]);
      rankTiers=tiers||[];
      titleState=await getPlayerTitles(session.user.id).catch(()=>titleState);
      trackTitleUnlocksV60(titleState.items||[]);
      ensureV100Module().then(mod=>mod.refreshV100?.()).catch(()=>{});
      populate();
      renderProtectionV58();
      renderEquippedTitle();

      presenceManagerV35=createPresenceManagerV35(session.user.id,ids=>{
        onlineUserIdsV35=new Set([...ids].map(String));
        decorateOnlineIndicatorsV35();
        decoratePresenceTextV60();
        renderOwnAvatarsV44();
        decorateAllPlayersV38(document);
      },{trackSelf:userPreferences?.show_activity_status!==false});
      presenceManagerV35.start().catch(console.error);
      presenceHeartbeatV60=createPresenceHeartbeatV60({intervalMs:60000,onTouch:()=>{
        if(session?.user?.id)v60State.recentPresence.set(String(session.user.id),new Date().toISOString());
      }});
      if(userPreferences?.show_activity_status!==false)presenceHeartbeatV60.start().catch(console.error);
      await loadAdminIdsV38();
      startUniversalPlayerObserverV38();
      startAvatarLiveSyncV44();

      // Primero cargamos/primamos estados. Después abrimos Realtime.
      await Promise.all([
        loadRanking(),loadChallenges(),loadMatches(),loadHistory(),loadHomeDashboard(),
        loadHistoryPage(),loadLiveNotifications(),loadRecommendedRivals(),loadChampionsHall(),
        loadStatsModeV56(false),loadDurationStatsV59(),loadV28Experience()
      ]);

      lastRatingSignatureV55=JSON.stringify(
        ratings.map(r=>[r.modality,r.rating,r.matches_played,r.wins,r.losses])
      );
      startLiveNotificationStream();
    }catch(err){
      console.error('Carga secundaria V58:',err);
      // La app permanece visible; el usuario puede reintentar navegando.
    }
  })();
}
async function route(prefetchedSession=undefined){
  session=prefetchedSession===undefined?await getSession():prefetchedSession;

  if(!session?.user){
    showView('welcomeView');
    setStatus($('#globalStatus'),'');
    closeBootScreenV572();
    return;
  }

  document.body.dataset.ttBootStage='profile';
  setBootMessageV572('Cargando tu perfil…');
  const p=await getMyProfile(session.user.id);

  if(!p.profile_completed){
    showView('sportsProfileView');
    closeBootScreenV572();
    ensureV101Experience()
      .then(mod=>mod.showEntryMotivationV101?.({profile:p,newAccount:true}))
      .catch(()=>{});
    return;
  }

  await loadApp(session.user.id,p);
  closeBootScreenV572();
}
function activateTab(tab){
  if(tab==='admin'&&!canUseAdminUIV101()){
    tab='home';
  }
  document.body.dataset.activeTabV101=tab||'home';
  // V23: recupera el scroll si algún flujo anterior ocultó un modal sin limpiarlo.
  if(!$$('.modal').some(m=>!m.classList.contains('hidden')))lockPageScroll(false);
  $$('.tab-page').forEach(p=>p.classList.toggle('active',p.id===`tab-${tab}`));
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  animateTabEnterV601(tab);
  window.scrollTo({top:0,behavior:'smooth'});
  if(tab==='ranking')loadRanking();
  if(tab==='play'){showPlayModeV62(null);loadChallenges();loadMatches()}
  if(tab==='home'){loadHomeDashboard();loadNearbyPlayersV35(false).catch(()=>{});}
  if(tab==='history')loadHistoryPage();
  if(tab==='stats'){
    loadHistory();
    loadStatsModeV56(false);
    loadDurationStatsV59();
  }
  if(tab==='profile'){renderAchievements();renderPrimaryRival();renderProfileSeasonCards();renderEquippedTitle();renderIdentityShowcase();ensureV63Module().then(mod=>mod.loadOwnPalmaresV63?.()).catch(()=>{});ensureV100Module().then(mod=>mod.loadOwnSportsIdentityV100?.()).catch(()=>{});}
  if(tab==='tournaments'){loadTournamentHubV30();}
  if(tab==='training'){
    // El cronómetro sigue corriendo aunque el usuario navegue por otras secciones.
    // Entrar a esta pestaña sólo muestra su estado actual.
  }
  if(tab==='ai')ensureAiModuleV612().then(mod=>mod.refreshAiV61?.()).catch(()=>{});
  if(tab==='places')ensureV100Module().then(mod=>mod.loadPlacesV100?.()).catch(err=>console.warn('Dónde practicar:',err));
  if(tab==='settings'){
    populateSettingsUI();
    renderFrameGallery();
    loadLegalStatusV57();
    loadSettingsClubV49().catch(err=>console.warn('Club settings V49:',err));
    loadV35Flags().then(()=>{renderFrameGallery();renderAchievements();});
  }
  if(tab==='admin'){
    setupAdminFrameLabV44();
    setupAdminPanelsV60();
    if(v35Flags?.is_test_admin){
      loadAdminClubsV49().catch(err=>console.warn('Admin clubes V49:',err));
      loadAdminLegalConfigV57();
      loadAdminDisputesV58();
      loadAdminLinkedAccountsV58();
      loadAdminIntegrityV59();
      loadAdminReviewTagsV58();
      ensureV100Module().then(mod=>mod.loadAdminCommunityV100?.()).catch(err=>console.warn('Admin comunidad 1.0:',err));
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
      return `<article class="v62-rank-row ${x.profile.id===session.user.id?'is-me':''}">
        <button class="v62-rank-profile" data-open-player="${p.id}" type="button">
          <div class="v62-rank-position"><strong>${m}</strong><small>POS</small></div>
          <span class="v62-rank-avatar ranking-avatar-online-v35" data-user-id-v35="${p.id}">${avatarHtml(p,'ranking-avatar')}${onlineDotV35(p.id)}</span>
          <div class="v62-rank-identity">
            <strong>${esc(p.first_name||'Jugador')} ${esc(p.last_name||'')} ${adminBadgeV37(!!p.is_test_admin)}</strong>
            <div class="v62-rank-meta"><small>@${esc(p.username||'usuario')}${x.profile.id===session.user.id?' · Vos':''}</small><span class="ranking-rank-chip ${rankCss(rank)}">${rank}</span></div>
            ${p.id===session.user.id?'':`<em class="v60-presence-text" data-presence-text-v60="${p.id}">${presenceLabelV60(p.id)}</em>`}
          </div>
          <div class="v62-rank-elo"><strong>${Number(x.rating)||1000}</strong><small>Elo</small></div>
        </button>
        ${p.id===session.user.id?'':`<button class="v62-rank-challenge" data-quick-challenge="${p.id}" data-name="${esc(p.first_name||'')} ${esc(p.last_name||'')}" data-user="${esc(p.username||'')}" type="button" aria-label="Desafiar a ${esc(p.first_name||'jugador')}"><span aria-hidden="true">⚔</span><b>Desafiar</b></button>`}
      </article>`;
    }).join(''):(rankingScope==='following'
      ?'<div class="following-empty"><strong>Todavía no seguís a ningún jugador.</strong><span>Abrí un perfil desde el ranking global y tocá “Seguir”.</span></div>'
      :rows.length?'<div class="compact-empty">El podio ocupa actualmente todo el ranking.</div>':'<div class="compact-empty">Sin jugadores.</div>');
    refreshPresenceV60(rows.map(x=>x.profile?.id).filter(Boolean)).catch(()=>{});
    animateListV601(list,'.v62-rank-row',20);
    const meV601=rows.find(x=>x.profile?.id===session.user.id);
    if(meV601)animateRankingMovementV601({container:list,position:Number(meV601.position),mode:rankingMode});
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
        <button class="v60-feed-challenge" data-quick-challenge="${r.followed_user_id}" data-name="${esc(r.followed_first_name)} ${esc(r.followed_last_name)}" data-user="" type="button">⚔</button>
      </article>`;
    }).join(''):'<div class="following-empty"><strong>No hay actividad para mostrar.</strong><span>Seguí jugadores para ver sus últimos partidos acá.</span></div>';
  }catch(err){
    console.error(err);
    box.innerHTML='<div class="loading-row">No se pudo cargar la actividad.</div>';
  }
}
async function playerSearch(){
  const box=$('#challengePlayerResults'),q=$('#challengePlayerSearch').value.trim();
  if(!q){box.innerHTML='<div class="loading-row">Escribí para buscar jugadores.</div>';return}
  const rows=await searchPlayers(q,session.user.id);
  box.innerHTML=rows.length?rows.map(p=>`<article class="player-row v60-player-row">
    <button class="v60-player-main" data-open-player="${p.id}" type="button">
      ${avatarHtml(p,'v60-search-avatar')}
      <div><strong>${esc(p.first_name)} ${esc(p.last_name)}</strong><small>@${esc(p.username)}</small><em class="v60-presence-text" data-presence-text-v60="${p.id}">${presenceLabelV60(p.id)}</em></div>
    </button>
    <button class="v60-player-challenge" data-select-rival="${p.id}" data-name="${esc(p.first_name)} ${esc(p.last_name)}" data-user="${esc(p.username)}" type="button">⚔ Desafiar</button>
  </article>`).join(''):'<div class="loading-row">No encontrados.</div>';
  refreshPresenceV60(rows.map(p=>p.id)).catch(()=>{});
}
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
function renderHomePriorityV60(){
  const box=$('#homePriorityV60');
  if(!box||!session?.user)return;
  const challenges=v60State.challenges||[];
  const matches=v60State.matches||[];
  const uid=session.user.id;
  const received=challenges.find(c=>c.challenged_id===uid&&c.status==='pending');
  const confirmation=matches.find(m=>m.result_status==='awaiting_confirmation'&&m.result_submitted_by!==uid);
  const disputed=matches.find(m=>m.result_status==='disputed');
  const active=matches.find(m=>m.result_status==='pending');
  const waiting=matches.find(m=>m.result_status==='awaiting_confirmation'&&m.result_submitted_by===uid);
  const otherOf=m=>m?.player1_id===uid?m?.player2:m?.player1;
  const fmt=x=>x?.match_format==='bo5'?'Bo5':x?.match_format==='bo3'?'Bo3':'1 set';
  let html='';
  if(confirmation){
    const o=otherOf(confirmation);
    html=`<div class="v60-priority-kicker"><span>ACCIÓN PRIORITARIA</span><b>Resultado pendiente</b></div>
      <div class="v60-priority-main"><span class="v60-priority-icon">✓</span><div><strong>Revisá el resultado de ${esc(o?.first_name||'tu rival')}</strong><small>${fmt(confirmation)} · ${matchTypeLabel(confirmation.match_type)} · requiere tu confirmación</small></div></div>
      <div class="v60-priority-actions"><button class="primary" data-confirm-match="${confirmation.id}" type="button">Confirmar resultado</button><button data-dispute-match="${confirmation.id}" type="button">Disputar</button></div>`;
  }else if(received){
    const o=received.challenger;
    html=`<div class="v60-priority-kicker"><span>TE DESAFIARON</span><b>Respondé cuando puedas</b></div>
      <div class="v60-priority-main"><span class="v60-priority-icon">⚔</span><div><strong>${esc(o?.first_name||'Un jugador')} ${esc(o?.last_name||'')} quiere jugar</strong><small>${fmt(received)} · ${matchTypeLabel(received.match_type)}</small></div></div>
      <div class="v60-priority-actions"><button class="primary" data-response="accepted" data-id="${received.id}" type="button">Aceptar</button><button data-response="rejected" data-id="${received.id}" type="button">Declinar</button></div>`;
  }else if(disputed){
    const o=otherOf(disputed);
    html=`<div class="v60-priority-kicker"><span>PARTIDO EN DISPUTA</span><b>Seguimiento activo</b></div>
      <div class="v60-priority-main"><span class="v60-priority-icon">⚖</span><div><strong>Resolución pendiente vs ${esc(o?.first_name||'Jugador')}</strong><small>Revisá árbitro, acuerdo o intervención del Administrador.</small></div></div>
      <div class="v60-priority-actions"><button class="primary" data-resolve-dispute-v58="${disputed.id}" type="button">Abrir disputa</button></div>`;
  }else if(active){
    const o=otherOf(active);
    html=`<div class="v60-priority-kicker"><span>PARTIDO ACTIVO</span><b>${fmt(active)}</b></div>
      <div class="v60-priority-main"><span class="v60-priority-icon">🏓</span><div><strong>Estás jugando contra ${esc(o?.first_name||'Jugador')}</strong><small>${matchTimingChipV59(active).replace(/<[^>]+>/g,'')||'Partido iniciado'}</small></div></div>
      <div class="v60-priority-actions"><button class="primary" data-enter-result="${active.id}" type="button">Cargar resultado</button><button data-go-tab="play" type="button">Ver partido</button></div>`;
  }else if(waiting){
    const o=otherOf(waiting);
    html=`<div class="v60-priority-kicker"><span>RESULTADO ENVIADO</span><b>Esperando confirmación</b></div>
      <div class="v60-priority-main"><span class="v60-priority-icon">◷</span><div><strong>${esc(o?.first_name||'Tu rival')} todavía debe confirmar</strong><small>${fmt(waiting)} · podés seguir usando TT Rivals mientras tanto.</small></div></div>
      <div class="v60-priority-actions"><button data-go-tab="play" class="primary" type="button">Ver estado</button></div>`;
  }else if(v60State.recommended?.length){
    const r=v60State.recommended[0];
    html=`<div class="v60-priority-kicker"><span>TODO AL DÍA</span><b>Tu próxima partida</b></div>
      <div class="v60-priority-main"><span class="v60-priority-icon">◎</span><div><strong>${esc(r.first_name)} ${esc(r.last_name)} puede ser un buen rival</strong><small>${r.rating} Elo · ${r.rating_gap} de diferencia · ${presenceLabelV60(r.user_id)}</small></div></div>
      <div class="v60-priority-actions"><button class="primary" data-quick-challenge="${r.user_id}" data-name="${esc(r.first_name)} ${esc(r.last_name)}" data-user="${esc(r.username)}" type="button">Desafiar</button><button data-open-player="${r.user_id}" type="button">Ver perfil</button></div>`;
  }else{
    html=`<div class="v60-priority-kicker"><span>TODO AL DÍA</span><b>Sin acciones pendientes</b></div><div class="v60-priority-main"><span class="v60-priority-icon">✓</span><div><strong>Todo listo</strong><small>Tu panel está al día. Usá la navegación principal cuando quieras jugar, competir o revisar tu actividad.</small></div></div>`;
  }
  box.innerHTML=html;
  animatePriorityV601(box,html.replace(/<[^>]+>/g,' '));
}

function chCard(c,kind){
  const other=kind==='received'?c.challenger:c.challenged;
  const fmt=c.match_format==='bo5'?'Bo5':c.match_format==='bo3'?'Bo3':'1 set';
  let actions='';
  if(kind==='received'&&c.status==='pending'){
    actions=`<div class="challenge-actions"><button class="accept-btn" data-response="accepted" data-id="${c.id}">Aceptar</button><button class="reject-btn" data-response="rejected" data-id="${c.id}">Declinar</button></div>`;
  }
  if(kind==='sent'&&c.status==='pending')actions=`<div class="challenge-actions"><button class="cancel-btn" data-cancel-challenge="${c.id}">Cancelar</button></div>`;
  const rematch=!!c.source_match_id;
  return `<div class="challenge-row ${rematch?'is-rematch-v73':''}"><div class="challenge-meta">
    <strong>${rematch?'<span class="v73-rematch-badge">↻ REVANCHA</span>':''}${esc(other?.first_name)} ${esc(other?.last_name)}</strong>
    <small>@${esc(other?.username)} · ${fmt} · <b class="inline-match-mode ${matchTypeClass(c.match_type)}">${matchTypeLabel(c.match_type)}</b></small>
    <span class="challenge-status ${c.status==='accepted'?'status-accepted':'status-pending'}">${c.status}</span>
  </div>${actions}</div>`;
}
async function loadChallenges(){
  if(!session)return;
  const rows=await getMyChallenges(session.user.id),
    rec=rows.filter(r=>r.challenged_id===session.user.id&&r.status==='pending'),
    sen=rows.filter(r=>r.challenger_id===session.user.id&&r.status==='pending');
  v60State.challenges=rows;renderHomePriorityV60();
  $('#receivedChallenges').innerHTML=rec.length?rec.map(r=>chCard(r,'received')).join(''):'<div class="compact-empty">Sin desafíos recibidos</div>';
  $('#sentChallenges').innerHTML=sen.length?sen.map(r=>chCard(r,'sent')).join(''):'<div class="compact-empty">Sin desafíos enviados</div>';
  if($('#receivedChallengeCount'))$('#receivedChallengeCount').textContent=rec.length;
  if($('#sentChallengeCount'))$('#sentChallengeCount').textContent=sen.length;
}

/* ============================================================
   V58 — DISPUTAS / PROTECCIÓN / MULTICUENTA / NOTIFICACIONES
   ============================================================ */

async function loadV58Core({refreshTitles=false,skipInstallation=false}={}){
  if(!session?.user)return;
  try{
    const jobs=[
      skipInstallation?Promise.resolve(v58State.installation):registerCurrentInstallationV58().catch(err=>({error:err.message})),
      getMyProtectionV58().catch(()=>({points:0,shield_available:false})),
      getMyNotificationsV58(50).catch(()=>[])
    ];
    if(refreshTitles)jobs.push(refreshOwnCompetitiveTitlesV58().catch(()=>[]));
    const [installation,protection,notifications]=await Promise.all(jobs);
    v58State.installation=installation;
    v58State.protection=protection||{points:0,shield_available:false};
    v58State.notifications=notifications||[];
    renderProtectionV58();
  }catch(err){console.warn('V58 core:',err)}
}

function renderProtectionV58(){
  const w=v58State.protection||{};
  const shield=!!w.shield_available;
  const points=shield?100:Math.max(0,Math.min(99,Number(w.points||0)));
  const pct=shield?100:points;

  if($('#homeProtectionTitleV58'))$('#homeProtectionTitleV58').textContent=shield?'Protección disponible':'Acumulando protección';
  if($('#homeProtectionDetailV58'))$('#homeProtectionDetailV58').textContent=shield
    ?'Tu próxima derrota ranked normal no reducirá tu Elo.'
    :`Te faltan ${100-points} puntos para activar una protección.`;
  if($('#homeProtectionValueV58'))$('#homeProtectionValueV58').textContent=shield?'1 / 1':`${points} / 100`;
  if($('#homeProtectionBarV58'))animateProgressV601($('#homeProtectionBarV58'),pct);
  if($('#homeProtectionStatusV58'))$('#homeProtectionStatusV58').textContent=shield?'🛡️ Escudo listo':'Sin escudo disponible';
  $('#homeProtectionV58')?.classList.toggle('shield-ready-v58',shield);
  pulseProtectionReadyV601($('#homeProtectionV58'),shield);

  if($('#profileProtectionTitleV58'))$('#profileProtectionTitleV58').textContent=shield?'Protección disponible':`${points} / 100 puntos`;
  if($('#profileProtectionShieldV58'))$('#profileProtectionShieldV58').textContent=shield?'🛡️ 1 / 1':'0 / 1';
  if($('#profileProtectionBarV58'))animateProgressV601($('#profileProtectionBarV58'),pct);
  if($('#profileProtectionDetailV58'))$('#profileProtectionDetailV58').textContent=shield
    ?'Escudo activo. Se consume sólo en una derrota ranked normal; nunca en abandono.'
    :'La dificultad del rival y la repetición contra el mismo jugador determinan cuántos puntos recibís.';
  $('#profileProtectionV58')?.classList.toggle('shield-ready-v58',shield);
}

function notificationIconV58(type=''){
  if(type.includes('dispute')||type.includes('arbiter'))return '⚖';
  if(type.includes('protection'))return '🛡';
  if(type.includes('title'))return '✦';
  if(type.includes('annul'))return '∅';
  return '●';
}

async function loadPersistentNotificationsV58(){
  if(!session?.user)return [];
  try{
    v58State.notifications=await getMyNotificationsV58(60);
    return v58State.notifications;
  }catch(err){console.warn('V58 notifications',err);return v58State.notifications||[]}
}

async function handleNotificationActionV58(n){
  if(!n)return;
  if(!n.read_at){
    try{await markNotificationReadV58(n.id);n.read_at=new Date().toISOString()}catch{}
  }
  if(n.entity_kind==='match'&&n.entity_id&&(n.action==='dispute'||n.action==='resolve_dispute'||n.action==='admin_dispute')){
    await openDisputeModalV58(Number(n.entity_id),{admin:n.action==='admin_dispute'});
    return;
  }
  if(n.action==='titles'){activateTab('profile');setTimeout(openTitleSelector,100);return}
  if(n.action==='history'){activateTab('history');return}
  if(n.action==='protection'){activateTab('home');return}
  if(n.action==='places'){activateTab('places');return}
  if(n.action==='profile'){activateTab('profile');return}
  if(n.action==='admin_community'&&v35Flags?.is_test_admin){activateTab('admin');setTimeout(()=>ensureV100Module().then(mod=>mod.loadAdminCommunityV100?.()).catch(()=>{}),120);return}
}

function disputeFormatLabelV58(format){return format==='bo5'?'Mejor de 5':format==='bo3'?'Mejor de 3':'1 set'}
function disputeStatusLabelV58(status){return ({open:'Abierta',arbiter_proposed:'Árbitro propuesto',awaiting_arbiter:'Esperando árbitro',admin_requested:'Esperando Administrador',annul_requested:'Anulación propuesta',resolved:'Resuelta',annulled:'Anulada'})[status]||status}

function renderDisputeSetInputsV58(match){
  const box=$('#disputeSetInputsV58');if(!box)return;
  const max=match?.match_format==='bo5'?5:match?.match_format==='bo3'?3:1;
  const p1=v58State.dispute?.player1?.first_name||'Jugador 1';
  const p2=v58State.dispute?.player2?.first_name||'Jugador 2';
  box.innerHTML=Array.from({length:max},(_,i)=>`<div class="dispute-set-row-v58" data-dispute-set-row-v58>
    <span>Set ${i+1}</span>
    <label><small>${esc(p1)}</small><input type="number" min="0" max="99" inputmode="numeric" data-dispute-p1-v58></label>
    <b>–</b>
    <label><small>${esc(p2)}</small><input type="number" min="0" max="99" inputmode="numeric" data-dispute-p2-v58></label>
  </div>`).join('');
}

function collectDisputeSetsV58(){
  const rows=$$('[data-dispute-set-row-v58]');
  const sets=[];let gap=false;
  for(const row of rows){
    const a=row.querySelector('[data-dispute-p1-v58]').value;
    const b=row.querySelector('[data-dispute-p2-v58]').value;
    if(a===''&&b===''){gap=true;continue}
    if(gap)throw new Error('Los sets deben cargarse en orden, sin dejar espacios vacíos.');
    if(a===''||b==='')throw new Error('Completá los dos puntajes de cada set utilizado.');
    sets.push({player1_points:Number(a),player2_points:Number(b)});
  }
  if(!sets.length)throw new Error('Ingresá al menos un set.');
  return sets;
}

async function renderDisputeModalV58(){
  const data=v58State.dispute;
  if(!data?.dispute)return;
  const d=data.dispute,m=data.match,me=session.user.id;
  const isPlayer=me===m.player1_id||me===m.player2_id;
  const isAdmin=!!v35Flags?.is_test_admin;
  const isArbiter=d.agreed_arbiter_id===me;
  const proposals=data.proposals||[];
  const current=proposals.find(p=>Number(p.id)===Number(d.current_proposal_id));
  const p1=data.player1||{},p2=data.player2||{};
  const original=data.original_result||{};
  const setText=(original.sets||[]).map(s=>`${s.player1_points}-${s.player2_points}`).join(' · ');

  $('#disputeTitleV58').textContent=`${p1.first_name||'Jugador 1'} vs ${p2.first_name||'Jugador 2'}`;
  const deadline=d.admin_deadline_at?new Date(d.admin_deadline_at):null;
  const deadlineLeft=deadline?Math.max(0,deadline-Date.now()):null;
  const deadlineText=deadlineLeft===null?'':deadlineLeft<86400000?`${Math.ceil(deadlineLeft/3600000)} h restantes`:`${Math.ceil(deadlineLeft/86400000)} días restantes`;
  $('#disputeSummaryV58').innerHTML=`
    <div class="dispute-state-v58"><span>${disputeStatusLabelV58(d.status)}</span><strong>${disputeFormatLabelV58(m.match_format)} · ${m.match_type==='casual'?'Casual':'Ranked'}</strong></div>
    ${d.status==='admin_requested'&&deadline?`<div class="dispute-deadline-v101 ${deadlineLeft<=86400000?'urgent':''}"><span>⏱</span><div><strong>${deadlineText}</strong><small>Administración tiene hasta ${deadline.toLocaleString('es-UY')} para resolver. Si vence, el partido se anula y su impacto competitivo se revierte.</small></div></div>`:''}
    <div class="dispute-original-v58"><small>RESULTADO ORIGINAL</small><strong>${original.player1_sets??m.player1_sets??0} – ${original.player2_sets??m.player2_sets??0}</strong><span>${esc(setText||'Sin detalle de sets')}</span></div>
    ${data.arbiter?`<div class="dispute-arbiter-chip-v58">⚖ Árbitro acordado: <b>${esc(data.arbiter.first_name||'')} ${esc(data.arbiter.last_name||'')}</b> · @${esc(data.arbiter.username||'')}</div>`:''}
    ${proposals.length?`<div class="dispute-proposal-history-v58"><small>HISTORIAL DE ÁRBITROS</small>${proposals.slice(0,5).map(x=>`<span>${esc(x.arbiter_name||x.arbiter_username)} · <b>${esc(x.status)}</b></span>`).join('')}</div>`:''}`;

  const actions=$('#disputePlayerActionsV58');
  const search=$('#disputeArbiterSearchV58');
  const score=$('#disputeScoreFormV58');
  actions.classList.add('hidden');search.classList.add('hidden');score.classList.add('hidden');
  actions.innerHTML='';

  if(['resolved','annulled'].includes(d.status)){
    actions.classList.remove('hidden');
    actions.innerHTML=`<div class="compact-empty">${d.status==='annulled'?'Este partido fue anulado de común acuerdo.':'La disputa ya fue resuelta.'}</div>`;
    return;
  }

  if((isAdmin&&d.status!=='resolved')||isArbiter){
    score.classList.remove('hidden');
    renderDisputeSetInputsV58(m);
    if(isArbiter&&!isAdmin){
      actions.classList.remove('hidden');
      actions.innerHTML='<button class="dispute-secondary-v58" data-decline-arbiter-v58 type="button">No puedo arbitrar este partido</button>';
    }
    return;
  }

  if(!isPlayer)return;
  actions.classList.remove('hidden');

  if(d.status==='arbiter_proposed'&&current&&current.proposed_by!==me){
    actions.innerHTML=`<div class="dispute-proposal-question-v58"><strong>${esc(current.arbiter_name||current.arbiter_username)} fue propuesto como árbitro</strong><small>Ambos jugadores deben estar de acuerdo.</small></div>
      <button class="dispute-primary-v58" data-respond-arbiter-v58="accept" type="button">ACEPTAR ÁRBITRO</button>
      <button class="dispute-secondary-v58" data-respond-arbiter-v58="reject" type="button">RECHAZAR · ELEGIR OTRO</button>
      <button class="dispute-admin-v58" data-request-admin-v58 type="button">SOLICITAR ADMINISTRADOR</button>`;
    return;
  }

  if(d.status==='arbiter_proposed'&&current?.proposed_by===me){
    actions.innerHTML=`<div class="compact-empty">Esperando que tu rival acepte o rechace a <strong>${esc(current.arbiter_name||current.arbiter_username)}</strong>.</div>
      <button class="dispute-admin-v58" data-request-admin-v58 type="button">SOLICITAR ADMINISTRADOR</button>`;
    return;
  }

  if(d.status==='awaiting_arbiter'){
    actions.innerHTML='<div class="compact-empty">Ambos aceptaron al árbitro. La disputa se resolverá cuando cargue el resultado definitivo.</div><button class="dispute-admin-v58" data-request-admin-v58 type="button">SOLICITAR ADMINISTRADOR</button>';
    return;
  }

  if(d.status==='admin_requested'){
    actions.innerHTML=`<div class="compact-empty">La disputa fue enviada al Administrador. Recibirán una notificación cuando quede resuelta.${deadlineText?` <strong>${deadlineText}.</strong>`:''} Si el plazo vence, el partido se anula automáticamente y se revierte cualquier impacto competitivo.</div>`;
    return;
  }

  if(d.status==='annul_requested'){
    if(d.annul_requested_by===me){
      actions.innerHTML='<div class="compact-empty">Esperando que el rival confirme la anulación.</div><button class="dispute-secondary-v58" data-show-arbiter-search-v58 type="button">PROPONER ÁRBITRO EN SU LUGAR</button><button class="dispute-admin-v58" data-request-admin-v58 type="button">SOLICITAR ADMINISTRADOR</button>';
    }else{
      actions.innerHTML='<div class="dispute-proposal-question-v58"><strong>Tu rival propone anular el partido</strong><small>Si aceptás, no contará para Elo, estadísticas ni rachas.</small></div><button class="dispute-primary-v58" data-request-annul-v58 type="button">ACEPTAR ANULACIÓN</button><button class="dispute-secondary-v58" data-show-arbiter-search-v58 type="button">NO · PROPONER ÁRBITRO</button><button class="dispute-admin-v58" data-request-admin-v58 type="button">SOLICITAR ADMINISTRADOR</button>';
    }
    return;
  }

  actions.innerHTML=`<button class="dispute-primary-v58" data-show-arbiter-search-v58 type="button">⚖ PROPONER ÁRBITRO</button>
    <button class="dispute-admin-v58" data-request-admin-v58 type="button">🛡 SOLICITAR ADMINISTRADOR</button>
    <button class="dispute-secondary-v58" data-request-annul-v58 type="button">∅ ANULAR DE COMÚN ACUERDO</button>`;
}

async function openDisputeModalV58(matchId,{admin=false}={}){
  if(!matchId)return;
  const modal=$('#disputeResolutionModalV58');
  if(!modal){
    console.error('V58: falta #disputeResolutionModalV58 en index.html');
    alert('La interfaz de resolución de disputas no está disponible. Actualizá TT Rivals a V58.0.2.');
    return;
  }
  modal.classList.remove('hidden');syncModalScrollLock();
  $('#disputeSummaryV58').innerHTML='<div class="loading-row">Cargando disputa…</div>';
  setStatus($('#disputeStatusV58'),'');
  try{
    v58State.dispute=await getMatchDisputeV58(matchId);
    if(admin&&!v35Flags?.is_test_admin)throw new Error('Acceso administrativo no disponible.');
    await renderDisputeModalV58();
  }catch(err){
    $('#disputeSummaryV58').innerHTML=`<div class="compact-empty">${esc(err.message)}</div>`;
  }
}

async function refreshOpenDisputeV58(){
  const id=v58State.dispute?.match?.id;
  if(id)await openDisputeModalV58(Number(id));
}

async function searchArbitersUiV58(){
  const id=v58State.dispute?.match?.id,box=$('#disputeArbiterResultsV58');if(!id||!box)return;
  const q=$('#disputeArbiterQueryV58')?.value.trim()||'';
  box.innerHTML='<div class="loading-row">Buscando…</div>';
  try{
    const rows=await searchDisputeArbitersV58(id,q);
    box.innerHTML=rows.length?rows.map(u=>`<button type="button" data-pick-arbiter-v58="${u.id}"><strong>${esc(`${u.first_name||''} ${u.last_name||''}`.trim()||u.username)}</strong><small>@${esc(u.username||'')}</small><b>Proponer →</b></button>`).join(''):'<div class="compact-empty">No encontramos árbitros disponibles.</div>';
  }catch(err){box.innerHTML=`<div class="compact-empty">${esc(err.message)}</div>`}
}

async function loadAdminDisputesV58(){
  const box=$('#adminDisputesListV58');if(!box||!v35Flags?.is_test_admin)return;
  box.innerHTML='<div class="loading-row">Cargando disputas…</div>';
  try{
    v58State.adminDisputes=await adminListDisputesV58();
    const rows=v58State.adminDisputes||[];
    if($('#adminCountDisputesV60'))$('#adminCountDisputesV60').textContent=`${rows.length} ${rows.length===1?'pendiente':'pendientes'}`;
    box.innerHTML=rows.length?rows.map(d=>{
      const deadline=d.admin_deadline_at?new Date(d.admin_deadline_at):null;
      const left=deadline?Math.max(0,deadline-Date.now()):null;
      const deadlineText=left===null?'':left<86400000?`${Math.ceil(left/3600000)} h para resolver`:`${Math.ceil(left/86400000)} días para resolver`;
      const urgent=left!==null&&left<=86400000;
      return `<button type="button" class="admin-dispute-row-v58 ${urgent?'deadline-urgent-v101':''}" data-admin-open-dispute-v58="${d.match_id}"><span>⚖</span><div><strong>${esc(d.player1_name||'Jugador')} vs ${esc(d.player2_name||'Jugador')}</strong><small>${esc(disputeStatusLabelV58(d.status))} · ${disputeFormatLabelV58(d.match_format)}${deadlineText?` · ⏱ ${deadlineText}`:''}</small></div><b>Resolver →</b></button>`;
    }).join(''):'<div class="compact-empty">No hay disputas abiertas que requieran atención.</div>';
  }catch(err){box.innerHTML=`<div class="compact-empty">${esc(err.message)}</div>`}
}

async function loadAdminLinkedAccountsV58(){
  const box=$('#adminLinkedAccountsV58');if(!box||!v35Flags?.is_test_admin)return;
  box.innerHTML='<div class="loading-row">Analizando instalaciones…</div>';
  try{
    v58State.linkedAccounts=await adminListLinkedAccountsV58();
    const rows=v58State.linkedAccounts||[];
    if($('#adminCountMultiV60'))$('#adminCountMultiV60').textContent=`${rows.length} ${rows.length===1?'vínculo':'vínculos'}`;
    box.innerHTML=rows.length?rows.map(x=>`<article class="linked-account-row-v58"><div><strong>${esc(x.user1_name||x.user1_username)} ↔ ${esc(x.user2_name||x.user2_username)}</strong><small>@${esc(x.user1_username||'')} · @${esc(x.user2_username||'')} · instalación ${esc(String(x.installation_id).slice(0,8))}…</small></div><span class="${x.exception_allowed?'allowed':'blocked'}">${x.exception_allowed?'EXCEPCIÓN':'BLOQUEADAS'}</span><button type="button" data-toggle-related-v58="${x.user1_id}:${x.user2_id}:${x.exception_allowed?'revoke':'allow'}">${x.exception_allowed?'Revocar':'Autorizar'}</button></article>`).join(''):'<div class="compact-empty">No hay pares de cuentas vinculadas registrados.</div>';
  }catch(err){box.innerHTML=`<div class="compact-empty">${esc(err.message)}</div>`}
}

async function loadAdminReviewTagsV58(){
  const box=$('#adminReviewTagsV58');if(!box||!v35Flags?.is_test_admin)return;
  box.innerHTML='<div class="loading-row">Cargando menciones…</div>';
  try{
    v58State.reviewTags=await adminListReviewTagsV58(100);
    const labels={edge_ball:'🏓 Edge Ball',defense:'🧱 Defensa difícil',creative:'🎩 Creativo',tactical:'🧠 Adaptación táctica',sportsmanship:'🤝 Deportividad'};
    const activeSignals=v58State.reviewTags.filter(x=>x.active).length;
    if($('#adminCountIntegrityV60'))$('#adminCountIntegrityV60').textContent=`${activeSignals} ${activeSignals===1?'señal':'señales'}`;
    box.innerHTML=v58State.reviewTags.length?v58State.reviewTags.map(t=>`<article class="admin-review-tag-row-v58 ${t.active?'':'invalid'}"><div><strong>${labels[t.tag_key]||esc(t.tag_key)}</strong><small>${esc(t.reviewer_name||t.reviewer_username)} → ${esc(t.reviewed_name||t.reviewed_username)} · Partido #${t.match_id}</small></div><span>${t.active?'ACTIVA':'INVALIDADA'}</span>${t.active?`<button type="button" data-invalidate-tag-v58="${t.id}">Invalidar</button>`:''}</article>`).join(''):'<div class="compact-empty">Todavía no hay menciones comunitarias.</div>';
  }catch(err){box.innerHTML=`<div class="compact-empty">${esc(err.message)}</div>`}
}


async function loadDurationStatsV59(){
  const box=$('#matchDurationStatsV59');
  if(!box||!session?.user)return;
  try{
    durationStatsV59=await getMyDurationStatsV59();
    const s=durationStatsV59||{};
    const measured=Number(s.measured_matches||0);
    $('#durationMeasuredBadgeV59').textContent=`${measured} ${measured===1?'medido':'medidos'}`;
    $('#durationAverageV59').textContent=measured?formatDurationV59(s.average_duration_seconds):'—';
    $('#gameplayAverageV59').textContent=measured?formatDurationV59(s.average_gameplay_seconds):'—';
    $('#durationShortestV59').textContent=measured?formatDurationV59(s.shortest_duration_seconds):'—';
    $('#durationLongestV59').textContent=measured?formatDurationV59(s.longest_duration_seconds):'—';
    $('#durationSingleV59').textContent=s.single_average_seconds?formatDurationV59(s.single_average_seconds):'—';
    $('#durationBo3V59').textContent=s.bo3_average_seconds?formatDurationV59(s.bo3_average_seconds):'—';
    $('#durationBo5V59').textContent=s.bo5_average_seconds?formatDurationV59(s.bo5_average_seconds):'—';
    box.classList.toggle('v59-no-duration-data',measured===0);
  }catch(err){
    console.warn('Duración V59:',err);
    $('#durationMeasuredBadgeV59').textContent='Sin datos';
    ['durationAverageV59','gameplayAverageV59','durationShortestV59','durationLongestV59','durationSingleV59','durationBo3V59','durationBo5V59']
      .forEach(id=>{const el=$(`#${id}`);if(el)el.textContent='—'});
  }
}

function integrityRiskLabelV59(score=0){
  const n=Number(score)||0;
  if(n>=75)return'Alta';
  if(n>=50)return'Media';
  return'Baja';
}

async function loadAdminIntegrityV59(){
  const box=$('#adminMatchIntegrityV59');
  if(!box||!v35Flags?.is_test_admin)return;
  box.innerHTML='<div class="loading-row">Analizando duración de partidos…</div>';
  try{
    adminIntegrityV59=await adminListMatchIntegrityV59(100);
    const rows=adminIntegrityV59||[];
    if($('#adminCountSuspiciousV60'))$('#adminCountSuspiciousV60').textContent=`${rows.length} ${rows.length===1?'alerta':'alertas'}`;
    box.innerHTML=rows.length?rows.map(x=>{
      const linked=!!x.same_device_or_linked;
      const repeats=Number(x.fast_matches_between_pair||0);
      return `<article class="v59-integrity-row risk-${Number(x.risk_score||0)>=75?'high':Number(x.risk_score||0)>=50?'medium':'low'}">
        <div class="v59-integrity-main">
          <div class="v59-integrity-title"><strong>${esc(x.player1_name||'Jugador')} ↔ ${esc(x.player2_name||'Jugador')}</strong><span>${esc(x.match_format==='bo5'?'Bo5':x.match_format==='bo3'?'Bo3':'1 set')}</span></div>
          <small>Juego ${formatDurationV59(x.gameplay_seconds)} · mínimo esperado ${formatDurationV59(x.minimum_seconds)} · oficial ${x.duration_seconds===null?'—':formatDurationV59(x.duration_seconds)}</small>
          <div class="v59-integrity-signals">
            <span>Riesgo ${integrityRiskLabelV59(x.risk_score)} · ${Number(x.risk_score||0)}/100</span>
            ${linked?'<b>Instalaciones vinculadas</b>':''}
            ${repeats>1?`<b>${repeats} partidos rápidos entre ambos</b>`:''}
          </div>
        </div>
        <div class="v63-integrity-row-actions"><b class="v59-integrity-id">#${x.match_id}</b><button data-admin-review-match-v63="${x.match_id}" type="button">Revisar partido</button></div>
      </article>`;
    }).join(''):'<div class="compact-empty">No hay partidos rápidos marcados para revisión.</div>';
    setStatus($('#adminIntegrityStatusV59'),rows.length?`${rows.length} señal${rows.length===1?'':'es'} para revisar.`:'Sin señales activas.','ok');
  }catch(err){
    console.error('Integridad V59:',err);
    box.innerHTML=`<div class="compact-empty">${esc(err.message||'No se pudo cargar la integridad de partidos.')}</div>`;
    setStatus($('#adminIntegrityStatusV59'),'No se pudo cargar el panel.','error');
  }
}



function metricNumberV70(value,digits=0){
  const n=Number(value||0);
  return Number.isFinite(n)?n.toLocaleString('es-UY',{minimumFractionDigits:digits,maximumFractionDigits:digits}):'0';
}
function renderAdminProductMetricsV70(data={}){
  const grid=$('#adminMetricsGridV70'),funnel=$('#adminMetricsFunnelV70'),trend=$('#adminMetricsTrendV70');
  if(!grid||!funnel||!trend)return;
  const active=Number(data.active_competitive_players||0);
  const verified=Number(data.verified_matches||0);
  const ranked=Number(data.ranked_verified_matches||0);
  const casual=Number(data.casual_verified_matches||0);
  const sent=Number(data.challenges_sent||0);
  const accepted=Number(data.challenges_accepted||0);
  const submitted=Number(data.results_submitted||0);
  const perPlayer=Number(data.verified_matches_per_active_player||0);
  const acceptance=Number(data.challenge_acceptance_rate||0);
  const confirmation=Number(data.confirmation_rate||0);
  const rematches=Number(data.rematch_requests||0);
  const pairs=Number(data.different_rival_pairs||0);
  grid.innerHTML=`
    <article class="v70-metric primary"><span>Partidos / jugador</span><strong>${metricNumberV70(perPlayer,2)}</strong><small>ranked verificados por jugador competitivo activo</small></article>
    <article class="v70-metric"><span>Jugadores activos</span><strong>${metricNumberV70(active)}</strong><small>con al menos un ranked verificado</small></article>
    <article class="v70-metric"><span>Partidos verificados</span><strong>${metricNumberV70(verified)}</strong><small>${metricNumberV70(ranked)} ranked · ${metricNumberV70(casual)} casuales</small></article>
    <article class="v70-metric"><span>Pares de rivales</span><strong>${metricNumberV70(pairs)}</strong><small>enfrentamientos distintos confirmados</small></article>
    <article class="v70-metric"><span>Desafíos enviados</span><strong>${metricNumberV70(sent)}</strong><small>${metricNumberV70(acceptance,1)}% de aceptación en la ventana</small></article>
    <article class="v70-metric"><span>Resultados cargados</span><strong>${metricNumberV70(submitted)}</strong><small>${metricNumberV70(confirmation,1)}% terminaron confirmados</small></article>
    <article class="v70-metric"><span>Revanchas</span><strong>${metricNumberV70(rematches)}</strong><small>solicitudes desde un partido finalizado</small></article>
    <article class="v70-metric"><span>Integridad</span><strong>${metricNumberV70(data.disputes||0)}</strong><small>${metricNumberV70(data.annulled_matches||0)} anulados en la ventana</small></article>`;

  const steps=[['Desafíos enviados',sent],['Aceptados',accepted],['Resultados cargados',submitted],['Partidos verificados',verified]];
  const max=Math.max(1,...steps.map(x=>Number(x[1]||0)));
  funnel.innerHTML=`<div class="v70-funnel-head"><strong>Embudo competitivo</strong><small>${metricNumberV70(acceptance,1)}% aceptación · ${metricNumberV70(confirmation,1)}% confirmación</small></div>${steps.map(([label,value])=>`<div class="v70-funnel-row"><span>${esc(label)}</span><div class="v70-funnel-track"><i style="width:${Math.max(3,Math.min(100,(Number(value||0)/max)*100))}%"></i></div><b>${metricNumberV70(value)}</b></div>`).join('')}`;

  const daily=Array.isArray(data.daily)?data.daily:[];
  const maxDaily=Math.max(1,...daily.map(x=>Number(x.verified_matches||0)));
  trend.innerHTML=`<div class="v70-trend-head"><strong>Partidos verificados por día</strong><small>${data.days||v60State.metricsDays} días</small></div><div class="v70-bars">${daily.map(x=>{const n=Number(x.verified_matches||0);const h=Math.max(4,(n/maxDaily)*100);const label=new Date(`${x.date}T12:00:00`).toLocaleDateString('es-UY',{day:'2-digit',month:'2-digit'});return `<div class="v70-bar" data-tip="${esc(label)} · ${n} verificados"><i style="height:${h}%"></i></div>`}).join('')}</div>`;

  if($('#adminCountMetricsV70'))$('#adminCountMetricsV70').textContent=`${verified} verificados`;
}
async function loadAdminProductMetricsV70(days=v60State.metricsDays||7){
  if(!v35Flags?.is_test_admin)return;
  const grid=$('#adminMetricsGridV70');if(!grid)return;
  const clean=Math.max(1,Math.min(90,Number(days)||7));
  v60State.metricsDays=clean;
  if($('#adminMetricsRangeV70'))$('#adminMetricsRangeV70').value=String(clean);
  grid.innerHTML='<div class="loading-row">Calculando actividad competitiva…</div>';
  try{
    const data=await getAdminProductMetricsV70(clean);
    v60State.lastProductMetrics=data;
    renderAdminProductMetricsV70(data);
    const started=data.telemetry_started_at?new Date(data.telemetry_started_at).toLocaleString('es-UY'):'sin eventos todavía';
    setStatus($('#adminMetricsStatusV70'),`Ventana de ${clean} días · instrumentación P7 activa desde ${started}.`,'ok');
  }catch(err){
    recordClientErrorV60(err,'admin-product-metrics-v70');
    grid.innerHTML=`<div class="compact-empty">${esc(err.message||'No se pudieron cargar las métricas P7.')}</div>`;
    if($('#adminMetricsFunnelV70'))$('#adminMetricsFunnelV70').innerHTML='';
    if($('#adminMetricsTrendV70'))$('#adminMetricsTrendV70').innerHTML='';
    setStatus($('#adminMetricsStatusV70'),'Si todavía no ejecutaste el SQL P7.0, instalalo primero en Supabase.','error');
  }
}

function setupAdminPanelsV60(){
  const admin=$('#tab-admin');if(!admin)return;
  const map=[
    ['disputes','#adminDisputesListV58'],
    ['multi','#adminLinkedAccountsV58'],
    ['suspicious','#adminMatchIntegrityV59'],
    ['integrity','#adminReviewTagsV58']
  ];
  map.forEach(([category,selector])=>$(selector)?.closest('.section-card')?.setAttribute('data-admin-panel-v60',category));
  [...admin.querySelectorAll(':scope > .section-card')].forEach(card=>{
    if(!card.dataset.adminPanelV60)card.dataset.adminPanelV60='system';
  });
  setAdminCategoryV60(v60State.adminCategory||'disputes');
}
function setAdminCategoryV60(category='disputes'){
  const allowed=new Set(['disputes','integrity','multi','users','suspicious','community','metrics','system']);
  const clean=allowed.has(category)?category:'disputes';
  v60State.adminCategory=clean;
  $$('[data-admin-category-v60]').forEach(b=>b.classList.toggle('active',b.dataset.adminCategoryV60===clean));
  $$('[data-admin-panel-v60]').forEach(panel=>panel.classList.toggle('hidden',panel.dataset.adminPanelV60!==clean));
  if(clean==='system'&&v35Flags?.is_test_admin)runAdminDiagnosticsV60().catch(()=>{});
  if(clean==='metrics'&&v35Flags?.is_test_admin)loadAdminProductMetricsV70().catch(()=>{});
}

let adminUserSearchTimerV60=null;
async function searchAdminUsersV60(){
  const box=$('#adminUserResultsV60'),input=$('#adminUserSearchV60');if(!box||!input||!v35Flags?.is_test_admin)return;
  const q=input.value.trim();
  if(q.length<2){box.innerHTML='<div class="compact-empty">Escribí al menos 2 caracteres para buscar usuarios.</div>';return}
  box.innerHTML='<div class="loading-row">Buscando usuarios…</div>';
  try{
    const rows=await searchPlayers(q,session?.user?.id);
    box.innerHTML=rows.length?rows.slice(0,30).map(u=>`<article class="v60-admin-user-row"><button data-open-player="${u.id}" type="button">${avatarHtml(u,'v60-admin-user-avatar')}<div><strong>${esc(`${u.first_name||''} ${u.last_name||''}`.trim()||u.username)}</strong><small>@${esc(u.username||'')} · Perfil de TT Rivals</small><em class="v60-presence-text" data-presence-text-v60="${u.id}">${esc(presenceLabelV60(u.id))}</em></div></button><button data-quick-challenge="${u.id}" data-name="${esc(`${u.first_name||''} ${u.last_name||''}`.trim()||u.username)}" data-user="${esc(u.username||'')}" type="button">⚔</button></article>`).join(''):'<div class="compact-empty">No encontramos usuarios con esa búsqueda.</div>';
    refreshPresenceV60(rows.map(x=>x.id)).catch(()=>{});
  }catch(err){recordClientErrorV60(err,'admin-user-search');box.innerHTML=`<div class="compact-empty">${esc(err.message||'No se pudo buscar usuarios.')}</div>`}
}

function diagnosticCellV60(label,value,state=''){
  return `<article class="${state}"><span>${esc(label)}</span><strong>${esc(String(value??'—'))}</strong></article>`;
}
async function runAdminDiagnosticsV60(){
  if(!v35Flags?.is_test_admin)return;
  const grid=$('#adminDiagnosticsGridV60'),errors=$('#adminRecentErrorsV60');if(!grid)return;
  grid.innerHTML='<div class="loading-row">Probando aplicación, caché y Supabase…</div>';
  const started=performance.now();
  try{
    const [pwa,checks]=await Promise.all([
      getPwaDiagnosticsV60().catch(err=>({error:err.message})),
      Promise.allSettled([
        getMyRatings(session.user.id),
        getMyChallenges(session.user.id,{force:true}),
        getMyMatches(session.user.id,{force:true}),
        getMyNotificationsV58(1)
      ])
    ]);
    const latency=Math.round(performance.now()-started);
    const failed=checks.filter(x=>x.status==='rejected');
    failed.forEach((x,i)=>recordClientErrorV60(x.reason,`diagnostic-supabase-${i+1}`));
    const recent=getRecentErrorsV60();
    const perf=window.__TT_PERF_V101||{};
    const realtimeChannels=typeof supabase.getChannels==='function'?supabase.getChannels().length:null;
    const diag={
      generatedAt:new Date().toISOString(),version:APP_VERSION,build:APP_BUILD,userId:session?.user?.id||null,
      username:profile?.username||null,online:navigator.onLine,supabaseOk:failed.length===0,supabaseLatencyMs:latency,pwa,recentErrors:recent,
      performance:{...perf,realtimeChannels}
    };
    v60State.lastDiagnostics=diag;
    grid.innerHTML=[
      diagnosticCellV60('Versión',`V${APP_VERSION}`,'ok'),
      diagnosticCellV60('Internet',navigator.onLine?'Conectado':'Sin conexión',navigator.onLine?'ok':'warn'),
      diagnosticCellV60('Supabase',failed.length?'Con errores':'Conectado',failed.length?'error':'ok'),
      diagnosticCellV60('Respuesta',`${latency} ms`,latency>2500?'warn':'ok'),
      diagnosticCellV60('Service Worker',pwa.serviceWorkerState||pwa.error||'—',pwa.controlled?'ok':'warn'),
      diagnosticCellV60('Caché activa',(pwa.caches||[]).join(', ')||'Sin caché TT',((pwa.caches||[]).includes(pwa.expectedCache))?'ok':'warn'),
      diagnosticCellV60('Modo app',pwa.standalone?'Instalada':'Navegador',pwa.standalone?'ok':''),
      diagnosticCellV60('Usuario',profile?`@${profile.username}`:'Sin perfil',profile?'ok':'warn'),
      diagnosticCellV60('FPS fondo',perf.motion?.fps?`${perf.motion.fps} / ${perf.motion.targetFps||'—'}`:'En espera',perf.motion?.fps&&perf.motion.fps<18?'warn':'ok'),
      diagnosticCellV60('Calidad gráfica',(perf.motion?.quality||'—').toUpperCase(),perf.motion?.quality==='low'?'warn':'ok'),
      diagnosticCellV60('Canvas activos',perf.motion?.canvasActive??0,'ok'),
      diagnosticCellV60('Realtime activos',realtimeChannels??'—',realtimeChannels>10?'warn':'ok'),
      diagnosticCellV60('Memoria JS',perf.jsHeapMB?`${perf.jsHeapMB} MB`:'No disponible',perf.jsHeapMB>180?'warn':''),
      diagnosticCellV60('Tareas largas',perf.longTasks??0,(perf.longTasks||0)>8?'warn':'ok')
    ].join('');
    if(errors)errors.textContent=recent.length?recent.map(x=>`${x.at} · ${x.context}\n${x.message}`).join('\n\n'):'Sin errores registrados en esta sesión.';
    setStatus($('#adminDiagnosticsStatusV60'),failed.length?'Diagnóstico completado con advertencias.':'Diagnóstico completado correctamente.',failed.length?'error':'ok');
    return diag;
  }catch(err){recordClientErrorV60(err,'admin-diagnostics');grid.innerHTML=`<div class="compact-empty">${esc(err.message||'No se pudo completar el diagnóstico.')}</div>`;setStatus($('#adminDiagnosticsStatusV60'),'Falló el diagnóstico.','error');throw err}
}
async function copyAdminDiagnosticsV60(){
  const diag=v60State.lastDiagnostics||await runAdminDiagnosticsV60();
  const text=JSON.stringify(diag,null,2);
  try{await navigator.clipboard.writeText(text);setStatus($('#adminDiagnosticsStatusV60'),'Diagnóstico copiado.','ok')}catch{setStatus($('#adminDiagnosticsStatusV60'),'No se pudo copiar automáticamente.','error')}
}

async function loadActiveMatchSetsV62(rows=[]){
  const ids=rows.filter(m=>m.result_status==='awaiting_confirmation').map(m=>Number(m.id)).filter(Number.isFinite);
  const map=new Map();
  if(!ids.length){v60State.matchSets=map;return map}
  try{
    const {data,error}=await supabase.from('match_sets').select('match_id,set_number,player1_points,player2_points').in('match_id',ids).order('set_number');
    if(error)throw error;
    (data||[]).forEach(row=>{const id=Number(row.match_id);if(!map.has(id))map.set(id,[]);map.get(id).push(row)});
  }catch(err){console.warn('Detalle de sets V62:',err)}
  v60State.matchSets=map;return map;
}
function confirmationResultV62(m){
  if(m.result_status!=='awaiting_confirmation')return '';
  const p1=m.player1||{},p2=m.player2||{};
  const sets=v60State.matchSets?.get?.(Number(m.id))||[];
  const score=`${esc(p1.first_name||'Jugador 1')} ${Number(m.player1_sets||0)} – ${Number(m.player2_sets||0)} ${esc(p2.first_name||'Jugador 2')}`;
  const detail=sets.length?sets.map(s=>`<span>Set ${Number(s.set_number)||''}<b>${Number(s.player1_points)}–${Number(s.player2_points)}</b></span>`).join(''):'<small>El detalle de sets todavía no está disponible.</small>';
  return `<details class="match-confirm-review-v62"><summary><span>Revisar resultado</span><strong>${score}</strong></summary><div class="match-confirm-sets-v62">${detail}</div></details>`;
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
  else if(m.result_status==='disputed'){state='En disputa';cls='status-disputed';actions=`<div class="match-actions"><button class="dispute-resolve-btn-v58" data-resolve-dispute-v58="${m.id}">Resolver disputa</button></div>`}
  else if(m.result_status==='annulled'){state='Anulado';cls='status-annulled-v58'}
  const result=m.player1_sets||m.player2_sets?` · ${m.player1_sets}-${m.player2_sets}`:'';
  const finish=m.completion_type==='abandonment'?' · Abandono':'';
  const timing=matchTimingChipV59(m);
  return`<div class="match-row v59-match-row v62-match-row"><div class="match-meta"><strong>vs ${esc(other?.first_name)} ${esc(other?.last_name)}</strong><small>${fmt} · ${mode}${result}${finish}</small><div class="v59-match-state-line"><span class="challenge-status ${cls}">${state}</span>${timing}</div>${m.result_submitted_by!==me?confirmationResultV62(m):''}</div>${actions}</div>`
}
async function loadMatches(){
  if(!session)return;
  try{
    const rows=await getMyMatches(session.user.id);
    v60State.matches=rows;renderHomePriorityV60();
    const active=rows.filter(m=>!['confirmed','annulled'].includes(m.result_status));
    await loadActiveMatchSetsV62(active);
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
    const [challenges,matches,persistent]=await Promise.all([
      getMyChallenges(session.user.id),
      getMyMatches(session.user.id),
      loadPersistentNotificationsV58()
    ]);

    if(!liveMatchStatusPrimed){
      liveMatchStatusSnapshot=new Map(matches.map(m=>[Number(m.id),m.result_status]));
      liveMatchStatusPrimed=true;
    }else{
      for(const m of matches){
        const id=Number(m.id),previous=liveMatchStatusSnapshot.get(id);
        if(m.result_status==='confirmed'&&previous&&previous!=='confirmed'&&!postMatchShownIds.has(id)){
          setTimeout(()=>handleConfirmedMatchV55(m),40);
        }
        liveMatchStatusSnapshot.set(id,m.result_status);
      }
    }

    const pending=challenges.filter(c=>c.challenged_id===session.user.id&&c.status==='pending');
    const confirmations=matches.filter(m=>m.result_status==='awaiting_confirmation'&&m.result_submitted_by!==session.user.id);
    const unread=(persistent||[]).filter(n=>!n.read_at);
    const items=[];

    for(const c of pending.slice(0,2)){
      const other=c.challenger;
      const fmt=c.match_format==='bo5'?'Bo5':c.match_format==='bo3'?'Bo3':'1 set';
      items.push(`<article class="live-action-notification"><div class="live-notification-icon">!</div><div class="live-notification-copy"><small>NUEVO DESAFÍO · ${matchTypeLabel(c.match_type)}</small><strong>${esc(other?.first_name||'Jugador')} te desafió</strong><span>${fmt}${c.match_type==='casual'?' · No modifica el Elo':' · Partido con ranking'}</span></div><div class="live-notification-actions"><button class="live-accept" data-response="accepted" data-id="${c.id}" type="button">Aceptar</button><button class="live-decline" data-response="rejected" data-id="${c.id}" type="button">Declinar</button></div></article>`);
    }
    for(const m of confirmations.slice(0,2)){
      const other=m.player1_id===session.user.id?m.player2:m.player1;
      items.push(`<article class="live-action-notification"><div class="live-notification-icon">✓</div><div class="live-notification-copy"><small>RESULTADO PENDIENTE · ${matchTypeLabel(m.match_type)}</small><strong>${esc(other?.first_name||'Tu rival')} cargó el resultado</strong><span>Revisalo y confirmá o disputá el partido.</span></div><div class="live-notification-actions"><button class="live-accept" data-confirm-match="${m.id}" type="button">Confirmar</button><button class="live-decline" data-dispute-match="${m.id}" type="button">Disputar</button></div></article>`);
    }
    for(const n of unread.slice(0,3)){
      items.push(`<button class="live-action-notification live-persistent-v58" data-notification-v58="${n.id}" type="button"><div class="live-notification-icon">${notificationIconV58(n.type)}</div><div class="live-notification-copy"><small>${esc(String(n.type||'ACTIVIDAD').replaceAll('_',' ').toUpperCase())}</small><strong>${esc(n.title)}</strong><span>${esc(n.body||'')}</span></div><b>›</b></button>`);
    }

    const stack=$('#liveNotificationStack');
    stack.innerHTML=items.join('');
    stack.classList.toggle('hidden',items.length===0);
    const count=pending.length+confirmations.length+unread.length;
    $('#notificationBadge').textContent=count>99?'99+':String(count);
    $('#notificationBadge').classList.toggle('hidden',count===0);
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
        await refreshOwnCompetitiveTitlesV58().catch(()=>[]);
        titleState=await getPlayerTitles(session.user.id).catch(()=>titleState);
        await refreshRatingViewsV55();
      },110);
    },

    onTeamTournamentChange:()=>{
      scheduleLiveRefreshV55('team-tournaments',async()=>{
        await refreshSelectedTeamTournamentV55();
        await loadStatsModeV56(true);
        await refreshOwnCompetitiveTitlesV58().catch(()=>[]);
        titleState=await getPlayerTitles(session.user.id).catch(()=>titleState);
        await refreshRatingViewsV55();
      },110);
    },

    onV58Change:()=>{
      scheduleLiveRefreshV55('v58',async()=>{
        await loadV58Core({refreshTitles:true});
        titleState=await getPlayerTitles(session.user.id).catch(()=>titleState);
        frameState=await getFrames(session.user.id).catch(()=>frameState);
        renderEquippedTitle();
        renderFrameGallery();
        renderOwnAvatarsV44();
        await Promise.all([loadLiveNotifications(),loadMatches()]);
        if(!$('#disputeResolutionModalV58')?.classList.contains('hidden'))await refreshOpenDisputeV58();
        if(v35Flags?.is_test_admin){await loadAdminDisputesV58();await loadAdminLinkedAccountsV58();await loadAdminReviewTagsV58()}
      },100);
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

  if($('#homeCurrentStreak'))animateNumberV601($('#homeCurrentStreak'),streak.current,{duration:430});
  if($('#homeMaxStreak'))animateNumberV601($('#homeMaxStreak'),streak.max,{duration:430});
  const streakCaption=$('#homeCurrentStreak')?.nextElementSibling;
  if(streakCaption){
    const st=Number(streak.current||0);
    const nextBoost=st>=12?3:st===11?2.75:st===10?2.5:st===9?2.25:st===8?2:st===7?1.75:st===6?1.5:st===5?1.25:1;
    streakCaption.textContent=st>=5?`victorias seguidas · próxima x${nextBoost}`:'victorias seguidas';
    streakCaption.classList.toggle('has-elo-boost',st>=5);
  }
  if($('#homeReputation'))$('#homeReputation').textContent=rep.count?rep.average.toFixed(1):'—';
  if($('#homeReviewCount'))$('#homeReviewCount').textContent=rep.count?`${rep.count} ${rep.count===1?'valoración':'valoraciones'}`:'sin valoraciones';
  if($('#homeAchievementCount'))animateNumberV601($('#homeAchievementCount'),unlocked,{duration:430});
  if($('#homeAchievementTotal'))$('#homeAchievementTotal').textContent=`de ${achievements.length} desbloqueados`;
  if($('#homeDoublesRating'))animateNumberV601($('#homeDoublesRating'),dob.rating,{duration:520});

  const info=nextRankInfo(ind.rating);
  if($('#homeNextRankText')){
    $('#homeNextRankText').textContent=info.next?`${info.remaining} Elo para ${info.next.name}`:'Rango máximo';
  }
  if($('#homeRankProgressBar'))animateProgressV601($('#homeRankProgressBar'),info.progress);

  if(info.next){
    const remaining=Math.max(0,Number(info.next.min_rating)-Number(ind.rating));
    $('#homeObjectiveTitle').textContent=`¡Rumbo a ${info.next.name}!`;
    $('#homeObjectiveDetail').textContent=`Te faltan ${remaining} puntos de Elo para tu próximo ascenso.`;
    if($('#homeObjectiveProgress'))animateProgressV601($('#homeObjectiveProgress'),info.progress);
    if($('#homeObjectiveReward'))$('#homeObjectiveReward').textContent=`RECOMPENSA · Marco ${info.next.name}`;
    if($('#homeObjectiveGlyph'))$('#homeObjectiveGlyph').textContent='✦';
  }else{
    $('#homeObjectiveTitle').textContent='Defendé tu lugar';
    $('#homeObjectiveDetail').textContent='Llegaste al rango máximo. Ahora peleá por la temporada.';
    if($('#homeObjectiveProgress'))animateProgressV601($('#homeObjectiveProgress'),100);
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
    if($('#homeSeasonBar'))animateProgressV601($('#homeSeasonBar'),(elapsed/total)*100);
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
  return ({common:'Común',rare:'Raro',epic:'Épico',legendary:'Legendario',mythic:'Mítico',exclusive:'Exclusivo'})[r]||'Común';
}
function renderEquippedTitle(){
  const box=$('#equippedTitleCard');if(!box)return;
  const t=(titleState.items||[]).find(x=>x.id===titleState.equipped);
  const hero=$('#profileEquippedTitleV58');
  if(!t){
    box.innerHTML='<span class="title-none">Sin título equipado</span><small>Podés equipar uno desde Perfil competitivo.</small>';
    if(hero){hero.className='profile-equipped-title-v58 hidden';hero.innerHTML='';hero.removeAttribute('title')}
    return
  }
  box.innerHTML=`<div class="title-emblem rarity-${t.rarity}">${esc(t.icon||'✦')}</div><div><span>${titleRarityLabel(t.rarity)}</span><strong>${esc(t.name)}</strong><small>${esc(t.description)}</small></div>`;
  if(hero){
    hero.className=`profile-equipped-title-v58 rarity-${t.rarity}`;
    hero.innerHTML=`<span>${esc(t.icon||'✦')}</span><strong>${esc(t.name)}</strong><small>${esc(titleRarityLabel(t.rarity))}</small>`;
    hero.title=t.description||t.name;
  }
}
async function openTitleSelector(){
  $('#titleSelectorModal').classList.remove('hidden');syncModalScrollLock();
  const box=$('#titleSelectorList');box.innerHTML='<div class="loading-row">Actualizando progreso de títulos…</div>';
  try{
    await refreshOwnCompetitiveTitlesV58().catch(()=>[]);
    titleState=await getPlayerTitles(session.user.id);
    trackTitleUnlocksV60(titleState.items||[]);
    const visibleTitles=(titleState.items||[]).filter(t=>t.id!=='v100_tester'||v35Flags?.is_test_admin||t.unlocked);
    const items=[{id:'',icon:'○',name:'Sin título',description:'No mostrar ningún título bajo tu nombre.',rarity:'common',unlocked:true,progress:100,progress_label:'Disponible',source:'system'},...visibleTitles];
    box.innerHTML=items.map(t=>{
      const active=(titleState.equipped||'')===t.id;
      const progress=Math.max(0,Math.min(100,Number(t.progress??(t.unlocked?100:0))));
      return `<article class="title-choice title-choice-v58 ${t.unlocked?'unlocked':'locked'} ${active?'active':''}">
        <div class="title-emblem rarity-${t.rarity}">${t.unlocked?esc(t.icon||'✦'):'🔒'}</div>
        <div class="title-choice-copy-v58">
          <div class="title-choice-name-v58"><strong>${esc(t.name)}</strong><i>${titleRarityLabel(t.rarity)}</i></div>
          <small>${esc(t.description)}</small>
          ${['v58','v100'].includes(t.source)?`<div class="title-progress-v58"><div><span>${esc(t.progress_label||'Progreso')}</span><b>${Math.round(progress)}%</b></div><div class="title-progress-track-v58"><span style="width:${progress}%"></span></div></div>`:''}
        </div>
        <button type="button" data-equip-title="${t.id}" ${t.unlocked?'':'disabled'}>${active?'Equipado ✓':t.unlocked?'Equipar':'Bloqueado'}</button>
      </article>`;
    }).join('');
  }catch(err){box.innerHTML=`<div class="compact-empty">${esc(err.message||'No se pudieron cargar los títulos.')}</div>`}
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
    loadCompetitiveProgressV72();
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

async function loadCompetitiveProgressV72(){
  const box=$('#competitiveProgressV72');if(!box||!session?.user||statsModeV56!=='competitive')return;
  box.innerHTML='<div class="loading-row">Calculando tu progreso…</div>';
  try{
    const p=await getCompetitiveProgressV72();
    const signed=n=>`${Number(n)>=0?'+':''}${Number(n)}`;
    const trendLabel=p.trend==='up'?'EN ASCENSO':p.trend==='down'?'EN RECUPERACIÓN':'ESTABLE';
    const deltaClass=n=>Number(n)>0?'v72-positive':Number(n)<0?'v72-negative':'';
    box.innerHTML=`
      <div class="v72-progress-head">
        <div><p class="muted-label">P7.2 · PROGRESO</p><h3>Tu momento competitivo</h3></div>
        <div class="v72-momentum ${p.trend}"><small>ÚLTIMOS 7 DÍAS</small><strong>${trendLabel}</strong></div>
      </div>
      <div class="v72-progress-hero">
        <section class="v72-rank-panel">
          <div class="v72-rank-copy"><div><small>RANGO ACTUAL</small><strong>${esc(p.rank)}</strong></div><div><small>ELO</small><b>${p.rating}</b></div></div>
          <div class="v72-rank-track" role="progressbar" aria-label="Progreso hacia ${esc(p.nextRank||'el rango máximo')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(p.progress)}"><i style="width:${p.progress}%"></i></div>
          <p>${p.nextRank?`${p.toNext} Elo para <strong>${esc(p.nextRank)}</strong>`:'Alcanzaste el rango máximo'}</p>
        </section>
        <section class="v72-record-panel">
          <div><small>MÁXIMO HISTÓRICO</small><strong>${p.maxElo}</strong><em>Elo</em></div>
          <div><small>POSICIÓN ACTUAL</small><strong>${p.position?`#${p.position}`:'—'}</strong><em>${p.bestPosition?`mejor conocida #${p.bestPosition}`:'ranking global'}</em></div>
        </section>
      </div>
      <div class="v72-progress-grid">
        <article><span>Variación 7 días</span><strong class="${deltaClass(p.delta7)}">${signed(p.delta7)}</strong><small>Elo acumulado</small></article>
        <article><span>Variación 30 días</span><strong class="${deltaClass(p.delta30)}">${signed(p.delta30)}</strong><small>Elo acumulado</small></article>
        <article><span>Racha actual</span><strong>${p.currentStreak}</strong><small>victorias seguidas</small></article>
        <article><span>Mejor racha</span><strong>${p.bestStreak}</strong><small>récord personal</small></article>
      </div>
      <section class="v72-milestone"><span>${esc(p.milestone.icon)}</span><div><small>${esc(p.milestone.label)}</small><strong>${esc(p.milestone.title)}</strong><p>${esc(p.milestone.detail)}</p></div></section>`;
  }catch(err){
    console.error('P7.2 progreso',err);
    box.innerHTML='<div class="v72-progress-error">No se pudo calcular el progreso en este momento.</div>';
  }
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

function activityItemHtmlV60(i){
  const unread=i.unread?' is-unread':'';
  const urgent=i.attention?' is-attention':'';
  return `<button class="activity-center-item activity-${i.kind}${unread}${urgent}" ${i.attr||''} type="button"><span>${i.icon}</span><div><strong>${esc(i.title)}</strong><small>${esc(i.detail||'')}</small>${i.when?`<em>${esc(i.when)}</em>`:''}</div><b>›</b></button>`;
}

function renderActivityCenterV60(){
  const box=$('#activityCenterList');if(!box)return;
  const all=v60State.activityItems||[];
  const attention=all.filter(x=>x.attention);
  const unread=all.filter(x=>x.unread);
  const recent=all.filter(x=>x.recent);
  if($('#activityPendingCountV60'))$('#activityPendingCountV60').textContent=attention.length;
  if($('#activityUnreadCountV60'))$('#activityUnreadCountV60').textContent=unread.length;
  if($('#activityRecentCountV60'))$('#activityRecentCountV60').textContent=recent.length;
  const filter=v60State.activityFilter||'attention';
  const rows=filter==='attention'?attention:filter==='recent'?recent:all;
  box.innerHTML=rows.length?rows.map(activityItemHtmlV60).join(''):'<div class="activity-empty-state"><span>✓</span><strong>Todo al día</strong><small>No tenés actividad para mostrar en este filtro.</small></div>';
  animateListV601(box,'.activity-center-item',16);
  $$('[data-activity-filter-v60]').forEach(b=>b.classList.toggle('active',b.dataset.activityFilterV60===filter));
}

async function loadActivityCenter(){
  if(activityLoadPromiseV60)return activityLoadPromiseV60;
  const box=$('#activityCenterList');if(!box)return;
  box.innerHTML='<div class="loading-row">Actualizando actividad…</div>';
  activityLoadPromiseV60=(async()=>{
    try{
      const [challenges,matches,feed,notifications]=await Promise.all([
        getMyChallenges(session.user.id),
        getMyMatches(session.user.id),
        getFollowingFeed(12).catch(()=>[]),
        loadPersistentNotificationsV58()
      ]);
      const items=[];
      const now=Date.now();
      const when=t=>{
        if(!t)return'';const diff=Math.max(0,now-new Date(t).getTime());const min=Math.floor(diff/60000);
        if(min<2)return'Ahora';if(min<60)return`Hace ${min} min`;const h=Math.floor(min/60);if(h<24)return`Hace ${h} h`;return new Date(t).toLocaleDateString('es-UY');
      };

      (notifications||[]).slice(0,40).forEach(n=>{
        const type=String(n.type||'activity');
        const action=String(n.action||'');
        const attention=!n.read_at&&(type.includes('dispute')||type.includes('arbiter')||type.includes('challenge')||type.includes('confirm')||action.includes('dispute'));
        items.push({
          key:`n:${n.id}`,kind:type.includes('title')?'title':type.includes('tournament')?'tournament':type.includes('dispute')||type.includes('arbiter')?'dispute':'notification',
          icon:notificationIconV58(type),title:n.title,detail:n.body||'',unread:!n.read_at,attention,recent:true,when:when(n.created_at),at:new Date(n.created_at||0).getTime(),attr:`data-notification-v58="${n.id}"`
        });
      });

      recentRewardsV60.filter(r=>now-Number(r.at||0)<90000).forEach(r=>{
        items.push({key:`reward:${r.kind}:${r.name}:${r.at}`,kind:r.kind||'achievement',icon:r.icon||'✦',title:r.name||'Nuevo logro',detail:r.kicker||r.detail||'Progreso desbloqueado',attention:false,recent:true,at:Number(r.at||now),when:when(r.at),attr:'data-activity-tab="profile"'});
      });

      challenges.filter(c=>c.challenged_id===session.user.id&&c.status==='pending').forEach(c=>{
        items.push({key:`c:${c.id}`,kind:'challenge',icon:'⚔',title:`${c.challenger?.first_name||'Un jugador'} te desafió`,detail:`${matchTypeLabel(c.match_type)} · ${c.match_format==='bo5'?'Bo5':c.match_format==='bo3'?'Bo3':'1 set'}`,attention:true,recent:true,at:new Date(c.created_at||0).getTime(),when:when(c.created_at),attr:'data-activity-tab="play"'});
      });
      matches.filter(m=>m.result_status==='awaiting_confirmation'&&m.result_submitted_by!==session.user.id).forEach(m=>{
        const other=m.player1_id===session.user.id?m.player2:m.player1;
        items.push({key:`m-confirm:${m.id}`,kind:'confirmation',icon:'✓',title:'Resultado pendiente de confirmar',detail:`vs ${other?.first_name||'Jugador'} ${other?.last_name||''}`,attention:true,recent:true,at:new Date(m.result_submitted_at||m.created_at||0).getTime(),when:when(m.result_submitted_at||m.created_at),attr:'data-activity-tab="play"'});
      });
      matches.filter(m=>m.result_status==='disputed').forEach(m=>{
        const other=m.player1_id===session.user.id?m.player2:m.player1;
        items.push({key:`m-dispute:${m.id}`,kind:'dispute',icon:'⚖',title:'Partido en disputa',detail:`vs ${other?.first_name||'Jugador'} · revisá el estado de la resolución`,attention:true,recent:true,at:new Date(m.updated_at||m.created_at||0).getTime(),when:when(m.updated_at||m.created_at),attr:`data-resolve-dispute-v58="${m.id}"`});
      });

      (socialState.ratingHistory||[]).slice(0,10).forEach(r=>{
        const delta=Number(r.rating_change||0);
        items.push({key:`elo:${r.id}`,kind:'elo',icon:delta>=0?'↑':'↓',title:`${delta>=0?'+':''}${delta} Elo`,detail:`${r.previous_rating} → ${r.new_rating}`,attention:false,recent:true,at:new Date(r.created_at||0).getTime(),when:when(r.created_at),attr:r.match_id?`data-match-detail="${r.match_id}"`:'data-activity-tab="history"'});
      });

      if(seasonState){
        const end=new Date(seasonState.ends_at),remaining=Math.max(0,Math.ceil((end-new Date())/86400000));
        items.push({key:'season',kind:'season',icon:'♛',title:`${seasonState.name||'Temporada actual'} · ${seasonState.position?`#${seasonState.position}`:'sin posición'}`,detail:`${remaining} días restantes`,attention:false,recent:false,at:0,attr:'data-activity-tab="ranking"'});
      }

      if(userPreferences?.notify_following_activity!==false)feed.slice(0,8).forEach(f=>{
        items.push({key:`feed:${f.followed_user_id}:${f.event_at}`,kind:'following',icon:f.won?'↑':'↓',title:`${f.followed_first_name} ${f.followed_last_name} ${f.won?'ganó':'perdió'}`,detail:`${f.player_sets}-${f.opponent_sets} vs ${f.opponent_first_name} ${f.opponent_last_name}`,attention:false,recent:true,at:new Date(f.event_at||0).getTime(),when:when(f.event_at),attr:`data-open-player="${f.followed_user_id}"`});
      });

      const dedup=new Map();
      for(const item of items){if(!dedup.has(item.key))dedup.set(item.key,item)}
      v60State.activityItems=[...dedup.values()].sort((a,b)=>(Number(b.attention)-Number(a.attention))||(b.at-a.at));
      renderActivityCenterV60();
    }catch(err){
      console.error(err);recordClientErrorV60(err,'activity-center');
      box.innerHTML='<div class="compact-empty">No se pudo cargar la actividad.</div>';
    }
  })().finally(()=>{activityLoadPromiseV60=null});
  return activityLoadPromiseV60;
}

async function loadRecommendedRivals(){
  const box=$('#recommendedRivals');
  if(!box||!session?.user)return;
  try{
    const rows=await getRecommendedRivals(6);
    v60State.recommended=rows||[];renderHomePriorityV60();
    box.innerHTML=rows.length?rows.map(r=>{
      const h2h=r.h2h_total?`${r.h2h_me}–${r.h2h_them}`:'Sin enfrentamientos';
      return `<article class="recommended-rival-card">
        <button class="recommended-rival-profile" data-open-player="${r.user_id}" type="button">
          <span class="recommended-avatar-online-v37" data-user-id-v35="${r.user_id}">${avatarHtml({first_name:r.first_name,last_name:r.last_name,profile_photo_url:r.profile_photo_url},'recommended-avatar')}${onlineDotV35(r.user_id)}</span>
          <div><strong>${esc(r.first_name)} ${esc(r.last_name)}</strong><small>@${esc(r.username)} · ${r.rating} Elo</small><em class="v60-presence-text" data-presence-text-v60="${r.user_id}">${presenceLabelV60(r.user_id)}</em></div>
        </button>
        <div class="recommended-rival-meta"><span>${r.rating_gap} Elo de diferencia</span><span>H2H ${h2h}</span></div>
        <button class="recommended-challenge" data-quick-challenge="${r.user_id}" data-name="${esc(r.first_name)} ${esc(r.last_name)}" data-user="${esc(r.username)}" type="button">Desafiar</button>
      </article>`;
    }).join(''):'<div class="compact-empty">No encontramos rivales recomendados todavía.</div>';
    refreshPresenceV60(rows.map(r=>r.user_id)).catch(()=>{});
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

  box.innerHTML=rows.map(a=>{
    const progress=Math.max(0,Math.min(100,Number(a.progress??(a.unlocked?100:0))));
    return `<article class="achievement-card ${a.unlocked?'unlocked':'locked'}" data-achievement-card="${a.id}">
      <button class="achievement-card-main" data-achievement-info="${a.id}" type="button">
        <span class="achievement-icon">${achievementEmblemHtml(a)}</span>
        <div class="achievement-copy-v60"><strong>${esc(a.name)}</strong><small>${esc(a.desc)}</small><span class="achievement-progress-label-v60">${esc(a.unlocked?'Completado':a.progress_label||'En progreso')}</span><span class="achievement-progress-track-v60"><i style="width:${a.unlocked?100:progress}%"></i></span></div>
        <em class="achievement-rarity rarity-${a.rarity||'common'}">${String(a.rarity||'common').toUpperCase()}</em>
        <i>${a.unlocked?'DESBLOQUEADO':`${Math.round(progress)}%`}</i>
      </button>
    </article>`;
  }).join('');

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
      <div class="achievement-detail-progress-v60"><span>${esc(a.unlocked?'Completado':a.progress_label||'En progreso')}</span><div><i style="width:${a.unlocked?100:Math.max(0,Math.min(100,Number(a.progress||0)))}%"></i></div></div>
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

function matchModalityV60(m){
  const raw=String(m?.modality||m?.tournament_modality||m?.match_type||'').toLowerCase();
  return raw.includes('double')||raw.includes('doble')?'doubles':'individual';
}

async function ensureHistorySeasonsV60(){
  if(v60State.historySeasons?.length)return v60State.historySeasons;
  try{v60State.historySeasons=await getHistorySeasonsV60()}catch(err){console.warn('Temporadas historial V60:',err);v60State.historySeasons=[]}
  const select=$('#historySeasonV60');
  if(select){
    const current=String(v60State.historySeason||'all');
    const options=['<option value="all">Todas las temporadas</option>'];
    for(const row of v60State.historySeasons||[]){
      const isCurrent=seasonState&&new Date().getTime()>=new Date(row.starts_at).getTime()&&new Date().getTime()<=new Date(row.ends_at).getTime();
      options.push(`<option value="${esc(String(row.season_id))}">${esc(row.season_name||'Temporada')}${isCurrent?' · actual':''}</option>`);
    }
    select.innerHTML=options.join('');
    select.value=[...select.options].some(o=>o.value===current)?current:'all';
    v60State.historySeason=select.value;
  }
  return v60State.historySeasons;
}

async function loadHistoryPage(){
  if(!session?.user||!$('#matchHistoryList'))return;
  try{
    if(!socialState.matches.length && getRating('individual').matches_played)await loadSocialState();
    await ensureHistorySeasonsV60();

    const allConfirmed=(socialState.matches||[])
      .filter(m=>m.result_status==='confirmed');

    const opponentQuery=($('#historyOpponentSearch')?.value||'').trim().toLowerCase();
    const selectedSeason=(v60State.historySeasons||[]).find(x=>String(x.season_id)===String(v60State.historySeason));
    const dateFrom=v60State.historyDateFrom?new Date(`${v60State.historyDateFrom}T00:00:00`).getTime():null;
    const dateTo=v60State.historyDateTo?new Date(`${v60State.historyDateTo}T23:59:59.999`).getTime():null;

    let matches=allConfirmed.filter(m=>{
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
      const modalityOk=v60State.historyModality==='all'||matchModalityV60(m)===v60State.historyModality;
      const ts=new Date(m.played_at||m.confirmed_at||m.created_at).getTime();
      const seasonOk=!selectedSeason||(ts>=new Date(selectedSeason.starts_at).getTime()&&ts<=new Date(selectedSeason.ends_at).getTime());
      const datesOk=(!dateFrom||ts>=dateFrom)&&(!dateTo||ts<=dateTo);
      return modeOk&&resultOk&&modalityOk&&seasonOk&&datesOk&&(!opponentQuery||name.includes(opponentQuery));
    });

    const sort=v60State.historySort||'recent';
    matches.sort((a,b)=>{
      const ad=new Date(a.played_at||a.confirmed_at||a.created_at).getTime();
      const bd=new Date(b.played_at||b.confirmed_at||b.created_at).getTime();
      if(sort==='oldest')return ad-bd;
      if(sort==='longest')return Number(b.duration_seconds??-1)-Number(a.duration_seconds??-1)||bd-ad;
      if(sort==='shortest'){
        const av=a.duration_seconds===null||a.duration_seconds===undefined?Number.MAX_SAFE_INTEGER:Number(a.duration_seconds);
        const bv=b.duration_seconds===null||b.duration_seconds===undefined?Number.MAX_SAFE_INTEGER:Number(b.duration_seconds);
        return av-bv||bd-ad;
      }
      return bd-ad;
    });

    const ratingByMatch=new Map((socialState.ratingHistory||[]).map(r=>[Number(r.match_id),r]));
    const reviewByMatch=new Map((socialState.reviewsAuthored||[]).map(r=>[Number(r.match_id),r]));
    let wins=0,losses=0,abandons=0;
    for(const m of allConfirmed){if(m.completion_type==='abandonment')abandons++;else if(m.winner_id===session.user.id)wins++;else losses++}
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
      const modality=matchModalityV60(m);
      return `<article class="history-match-card ${type}">
        <div class="history-result-band"><span>${label}</span><div class="history-result-meta-v59">${m.duration_seconds!==null&&m.duration_seconds!==undefined?`<em>⏱ ${formatDurationV59(m.duration_seconds)}</em>`:''}${delta!==null?`<strong>${delta>=0?'+':''}${delta} Elo</strong>`:''}</div></div>
        <div class="history-match-main">
          ${avatarHtml(other,'history-opponent-avatar')}
          <div class="history-opponent"><small>VS · <b class="v60-history-modality">${modality==='doubles'?'DOBLES':'INDIVIDUAL'}</b></small><strong>${esc(other?.first_name||'Jugador')} ${esc(other?.last_name||'')}</strong><span>@${esc(other?.username||'usuario')} · ${fmt} · <b class="inline-match-mode ${matchTypeClass(m.match_type)}">${matchTypeLabel(m.match_type)}</b> · ${formatMatchDate(m)}</span></div>
          <div class="history-score"><strong>${mySets||0}<i>–</i>${otherSets||0}</strong><small>${isAbandon?(m.abandoned_by===session.user.id?'Abandonaste':'Rival abandonó'):'Resultado final'}</small></div>
        </div>
        <div class="history-match-actions"><button type="button" data-rematch="${m.id}">↻ Revancha</button><button type="button" data-review-match="${m.id}">${review?`★ Tu valoración: ${review.stars}`:'☆ Valorar rival'}</button><button type="button" data-match-detail="${m.id}">Ver partido</button><button type="button" data-open-player="${other?.id}">Ver perfil</button></div>
      </article>`;
    }).join(''):'<div class="history-empty"><strong>No hay partidos que coincidan con estos filtros.</strong><span>Probá limpiar algún filtro o ampliar el período.</span></div>';
    animateListV601($('#matchHistoryList'),'.history-match-card',16);
  }catch(err){
    console.error(err);recordClientErrorV60(err,'history');
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
      ${m.duration_seconds!==null&&m.duration_seconds!==undefined?`<span class="match-detail-duration-v59">⏱ ${formatDurationV59(m.duration_seconds)} oficial</span>`:''}
      ${m.gameplay_seconds!==null&&m.gameplay_seconds!==undefined?`<span class="match-detail-gameplay-v59">Resultado cargado en ${formatDurationV59(m.gameplay_seconds)}</span>`:''}
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

  if(!(socialState.matches||[]).some(x=>Number(x.id)===Number(matchId))){
    try{socialState.matches=await getMyMatches(session.user.id)}catch{}
  }

  let summary=null;
  try{summary=await getPostMatchSummary(matchId)}catch(e){console.error(e)}
  let m=(socialState.matches||[]).find(x=>Number(x.id)===Number(matchId));
  if(!m){
    try{m=(await getMyMatches(session.user.id)).find(x=>Number(x.id)===Number(matchId))||null}catch(e){}
  }
  if(!rankTiers.length){
    try{rankTiers=await getRankTiers()}catch{}
  }

  const isCasual=(summary?.match_type||m?.match_type)==='casual';
  const delta=Number(summary?.rating_change ?? ((newRating??0)-(oldRating??0)));
  const current=Number(summary?.current_rating ?? newRating ?? getRating('individual').rating);
  const previous=Number(summary?.previous_rating ?? oldRating ?? current);
  const rank=summary?.current_rank||rankForRating(current);
  const pos=summary?.position;
  const newBest=!!(summary?.is_new_best ?? summary?.personal_best);
  const bestRating=Number(summary?.best_rating??summary?.best_after??current);
  const format=summary?.match_format||m?.match_format||'bo3';
  const formatLabel=format==='bo5'?'Mejor de 5':format==='bo3'?'Mejor de 3':'1 set';
  const other=m?(m.player1_id===session.user.id?m.player2:m.player1):null;
  const opponent=other?.first_name||opponentName||'Rival';
  const mySets=m?(m.player1_id===session.user.id?Number(m.player1_sets||0):Number(m.player2_sets||0)):null;
  const otherSets=m?(m.player1_id===session.user.id?Number(m.player2_sets||0):Number(m.player1_sets||0)):null;

  const tierIndex=Math.max(0,rankTiers.findIndex(t=>t.name===rank));
  const tier=rankTiers[tierIndex]||null;
  const nextTier=rankTiers[tierIndex+1]||null;
  const nextRank=summary?.next_rank ?? summary?.next_rank_name ?? nextTier?.name ?? null;
  const toNext=Number(summary?.to_next_rank ?? summary?.next_rank_remaining ?? (nextTier?Math.max(0,Number(nextTier.min_rating)-current):0));
  const tierMin=Number(tier?.min_rating??current);
  const nextMin=Number(nextTier?.min_rating??current);
  const rankProgress=nextTier&&nextMin>tierMin
    ?Math.max(0,Math.min(100,((current-tierMin)/(nextMin-tierMin))*100))
    :100;

  const rewards=recentRewardsV60.filter(x=>Date.now()-Number(x.at||0)<45000).slice(-4);
  const streakMult=Number(summary?.streak_boost_multiplier||1);
  const breakerMult=Number(summary?.streak_breaker_multiplier||1);
  let highlightHtml='';
  if(newBest&&!isCasual){
    highlightHtml=`<section class="v71-highlight record"><span>✦</span><div><small>NUEVO RÉCORD PERSONAL</small><strong>${bestRating} Elo</strong><p>Superaste tu mejor marca histórica.</p></div></section>`;
  }else if(summary?.protection_used){
    highlightHtml=`<section class="v71-highlight shield"><span>🛡️</span><div><small>PROTECCIÓN ACTIVADA</small><strong>Tu Elo quedó protegido</strong><p>El escudo evitó una pérdida de ${Number(summary.protected_elo||0)} Elo.</p></div></section>`;
  }else if(won&&!isCasual&&streakMult>1){
    highlightHtml=`<section class="v71-highlight streak"><span>${breakerMult>=2?'⚡':'🔥'}</span><div><small>${breakerMult>=2?'RACHA CORTADA':'BONUS DE RACHA'}</small><strong>Multiplicador x${streakMult.toFixed(2).replace(/0+$/,'').replace(/\.$/,'')}</strong><p>${breakerMult>=2?'Terminaste la racha de tu rival.':'Tu rendimiento consecutivo aumentó la ganancia.'}</p></div></section>`;
  }else if(rewards.length){
    const reward=rewards[rewards.length-1];
    highlightHtml=`<section class="v71-highlight reward"><span>${esc(reward.icon||'✦')}</span><div><small>PROGRESO CONSEGUIDO</small><strong>${esc(reward.name)}</strong><p>${esc(reward.kicker||reward.detail||'Nueva recompensa desbloqueada.')}</p></div></section>`;
  }

  const resultLabel=isCasual?'PARTIDO CASUAL':won?'VICTORIA':'DERROTA';
  const eloLabel=isCasual?'Sin cambio de Elo':summary?.protection_used?'0 Elo':`${delta>=0?'+':''}${delta} Elo`;
  const resultClass=isCasual?'casual':won?'victory':'defeat';

  $('#postMatchContent').innerHTML=`
    <div class="v71-result-shell ${resultClass}">
      <header class="v71-result-hero">
        <div class="v71-result-kicker"><span></span>${resultLabel}<span></span></div>
        <h2 id="postMatchTitleV71">${isCasual?'PARTIDO COMPLETADO':won?'GANASTE':'ESTA VEZ NO'}</h2>
        ${m?`<div class="v71-score" aria-label="Resultado final: ${mySets??0} a ${otherSets??0}">
          <div><small>VOS</small><strong>${mySets??0}</strong></div>
          <span>—</span>
          <div><small>${esc(opponent)}</small><strong>${otherSets??0}</strong></div>
        </div>`:''}
        <div class="v71-format"><span>${formatLabel}</span><span>${isCasual?'Casual':'Ranked'}</span></div>
      </header>

      <main class="v71-result-body">
        <section class="v71-elo-card ${isCasual?'is-casual':''}">
          <div class="v71-elo-change">
            <small>${isCasual?'RESULTADO REGISTRADO':'CAMBIO DE ELO'}</small>
            <strong>${eloLabel}</strong>
          </div>
          ${!isCasual?`<div class="v71-elo-journey" aria-label="Elo anterior ${previous}, Elo actual ${current}">
            <span><small>ANTES</small><b>${previous}</b></span>
            <i>→</i>
            <span class="current"><small>AHORA</small><b>${current}</b></span>
          </div>`:`<p>Este partido cuenta en tu historial sin modificar el ranking.</p>`}
        </section>

        ${!isCasual?`<section class="v71-rank-card">
          <div class="v71-rank-head">
            <div><small>RANGO ACTUAL</small><strong>${esc(rank)}</strong></div>
            <div class="v71-position"><small>POSICIÓN</small><strong>${pos?`#${pos}`:'—'}</strong></div>
          </div>
          <div class="v71-rank-track" role="progressbar" aria-label="Progreso hacia ${esc(nextRank||'el rango máximo')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(rankProgress)}"><i style="width:${rankProgress}%"></i></div>
          <p>${nextRank?`${toNext} Elo para <strong>${esc(nextRank)}</strong>`:'Alcanzaste el rango máximo'}</p>
        </section>`:''}

        ${highlightHtml}

        <div class="v71-match-meta">
          ${m?.duration_seconds!==null&&m?.duration_seconds!==undefined?`<span>⏱ ${formatDurationV59(m.duration_seconds)}</span>`:''}
          ${!isCasual&&Number(summary?.protection_earned||0)>0?`<span>🛡 +${Number(summary.protection_earned)} protección</span>`:''}
          ${!isCasual?`<span>Máximo: ${bestRating} Elo</span>`:''}
        </div>

        <section class="v71-coach"><span>✦</span><div><small>TT COACH</small><p>${esc(buildV28CoachText())}</p></div></section>

        <div class="v71-actions">
          <button class="btn btn-start v71-rematch" data-rematch="${matchId}" type="button">↻ ${won?'OFRECER':'PEDIR'} REVANCHA</button>
          <button class="btn v71-continue" type="button" data-close-post-match>CONTINUAR</button>
          <p class="v73-rematch-status" data-rematch-status-v73="${matchId}" aria-live="polite"></p>
        </div>
      </main>
    </div>`;

  $('#postMatchModal').classList.remove('hidden');
  animatePostMatchV601($('#postMatchModal'),{won,positive:delta>0,protectedElo:!!summary?.protection_used,hasRewards:!!highlightHtml});
  syncModalScrollLock();
  const telemetryOpponentId=m?(m.player1_id===session.user.id?m.player2_id:m.player1_id):null;
  recordProductEventV70('post_match_opened',{matchId,opponentId:telemetryOpponentId,metadata:{match_type:summary?.match_type||m?.match_type||'ranked',match_format:format,ui_version:'p7.1'}}).catch(()=>{});
}

async function requestRematch(matchId,button){
  let m=(socialState.matches||[]).find(x=>Number(x.id)===Number(matchId));
  if(!m){
    try{m=(await getMyMatches(session.user.id)).find(x=>Number(x.id)===Number(matchId))||null}catch{}
  }
  if(!m)return alert('No se pudo recuperar el partido para crear la revancha.');

  const opponentId=m.player1_id===session.user.id?m.player2_id:m.player1_id;
  const status=$(`[data-rematch-status-v73="${matchId}"]`);
  const old=button.textContent;
  button.disabled=true;
  button.textContent='Enviando revancha…';
  button.classList.remove('is-pending');
  if(status){status.className='v73-rematch-status';status.textContent='Comprobando desafíos pendientes…'}

  try{
    const result=await createRematchChallengeV73(matchId,{
      challengerId:session.user.id,
      challengedId:opponentId,
      format:m.match_format||'bo3',
      matchType:m.match_type||'ranked',
      scheduledDate:null,
      scheduledTime:null,
      location:null
    });
    const challenge=result.challenge;
    recordProductEventV70('rematch_requested',{
      matchId,
      challengeId:challenge?.id||null,
      opponentId,
      metadata:{
        match_type:m.match_type||'ranked',
        match_format:m.match_format||'bo3',
        reused:!!result.reused,
        backend_v73:!!result.backend
      }
    }).catch(()=>{});

    button.textContent=result.reused?'✓ REVANCHA YA PENDIENTE':'✓ REVANCHA ENVIADA';
    button.classList.add('is-pending');
    if(status){
      status.className='v73-rematch-status success';
      status.textContent=result.reused
        ?'Ya existe una solicitud pendiente entre ustedes.'
        :'El rival recibió un desafío vinculado a este partido.';
    }
    await Promise.all([loadChallenges(),loadActivityCenter()]);
  }catch(err){
    button.disabled=false;
    button.textContent=old;
    if(status){status.className='v73-rematch-status error';status.textContent=friendly(err.message)}
    else alert(friendly(err.message));
  }
}

async function openReviewModal(matchId){
  const m=(socialState.matches||[]).find(x=>Number(x.id)===Number(matchId));
  if(!m)return;
  const other=m.player1_id===session.user.id?m.player2:m.player1;
  const sameMatch=(socialState.reviewsAuthored||[]).find(r=>Number(r.match_id)===Number(matchId));
  const previousForPlayer=(socialState.reviewsAuthored||[]).find(r=>r.reviewed_id===other?.id);
  reviewTargetMatch=m;
  reviewStarsLockedV62=!!previousForPlayer;
  selectedReviewStars=previousForPlayer?Number(previousForPlayer.stars||0):(sameMatch?Number(sameMatch.stars||0):0);
  selectedReviewTagsV58=new Set();
  try{
    const tags=await getMyReviewTagsV58(Number(matchId));
    (tags||[]).forEach(x=>selectedReviewTagsV58.add(typeof x==='string'?x:x.tag_key));
  }catch{}
  $('#reviewModalTitle').textContent=reviewStarsLockedV62?`Destacá a ${other?.first_name||'tu rival'}`:`Valorá a ${other?.first_name||'tu rival'}`;
  if($('#reviewIntroV62'))$('#reviewIntroV62').textContent=reviewStarsLockedV62?'La valoración general ya fue realizada. Ahora podés destacar lo que hizo bien tu rival en este partido.':'La puntuación representa deportividad, respeto y experiencia general. No evalúa el nivel de juego.';
  $('#reviewStarsSectionV62')?.classList.toggle('hidden',reviewStarsLockedV62);
  $('#reviewStarsLockedV62')?.classList.toggle('hidden',!reviewStarsLockedV62);
  const save=$('#saveReviewButton');if(save)save.textContent=reviewStarsLockedV62?'GUARDAR DESTACADOS':'GUARDAR VALORACIÓN';
  setStatus($('#reviewStatus'),'');
  paintReviewStars();
  paintReviewTagsV58();
  $('#reviewModal').classList.remove('hidden');syncModalScrollLock();
}

function paintReviewStars(){
  $$('#reviewStars [data-review-star]').forEach(b=>{
    b.classList.toggle('selected',Number(b.dataset.reviewStar)<=selectedReviewStars);
    b.disabled=reviewStarsLockedV62;
  });
  const save=$('#saveReviewButton');
  if(save)save.disabled=reviewStarsLockedV62?selectedReviewTagsV58.size===0:!selectedReviewStars;
  if($('#reviewStarText'))$('#reviewStarText').textContent=selectedReviewStars?`${selectedReviewStars} de 5 estrellas`:'Elegí de 1 a 5 estrellas';
}
function paintReviewTagsV58(){
  $$('[data-review-tag-v58]').forEach(b=>b.classList.toggle('selected',selectedReviewTagsV58.has(b.dataset.reviewTagV58)));
}

async function saveCurrentReview(){
  if(!reviewTargetMatch)return;
  if(!reviewStarsLockedV62&&!selectedReviewStars)return;
  if(reviewStarsLockedV62&&!selectedReviewTagsV58.size)return;
  const btn=$('#saveReviewButton');
  btn.disabled=true;
  setStatus($('#reviewStatus'),'Guardando…');
  try{
    await submitPlayerReviewV58(Number(reviewTargetMatch.id),reviewStarsLockedV62?null:selectedReviewStars,[...selectedReviewTagsV58]);
    socialState.reviewsAuthored=await getReviewsAuthoredByUser(session.user.id);
    socialState.reviewsReceived=await getReviewsForUser(session.user.id).catch(()=>socialState.reviewsReceived);
    await refreshOwnCompetitiveTitlesV58().catch(()=>[]);
    titleState=await getPlayerTitles(session.user.id).catch(()=>titleState);
    trackTitleUnlocksV60(titleState.items||[]);
    populate();
    renderEquippedTitle();
    setStatus($('#reviewStatus'),reviewStarsLockedV62?'Destacados guardados.':'Valoración guardada.','ok');
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

    await refreshPresenceV60([p.id]).catch(()=>{});
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
            ${(()=>{const t=(publicTitles.items||[]).find(x=>x.id===publicTitles.equipped);return t?`<div class="public-equipped-title-v58 rarity-${t.rarity}" title="${esc(t.description||t.name)}"><span>${esc(t.icon||'✦')}</span><strong>${esc(t.name)}</strong><small>${esc(titleRarityLabel(t.rarity))}</small></div>`:''})()}
            <p>@${esc(p.username)}</p>
            <span class="v60-public-presence ${isOnlineV35(p.id)?'is-online':''}" data-presence-text-v60="${p.id}">${esc(presenceLabelV60(p.id))}</span>
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

        <section id="publicPalmaresV63" class="public-palmares-v63">
          <div class="loading-row">Cargando palmarés…</div>
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
    ensureV63Module().then(mod=>mod.loadPublicPalmaresV63?.(userId)).catch(()=>{});
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
  if($('#prefProfileCountryV100')){
    await ensureV100Module().then(mod=>mod.initSettingsProfileV100?.());
    return;
  }
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

  if(!$('#birthDate').value||!$('#playingStyle').value||!$('#dominantHand').value){
    return setStatus(status,'Completá todos los campos obligatorios.','error');
  }

  const submitButton=e.currentTarget.querySelector('button[type="submit"]');
  submitButton.disabled=true;
  setStatus(status,'Guardando perfil…');

  try{
    session=await getSession();
    if(!session?.user)throw new Error('No hay una sesión activa.');

    setStatus(status,'Verificando perfil deportivo…');
    let sportsV100=null;
    try{
      const mod=await ensureV100Module();
      sportsV100=await mod.resolveSportsProfileV100?.();
    }catch(err){
      throw err;
    }
    const clubResult=sportsV100?.clubResult||await resolveSelectedClubV49('#clubName','#customClubName');
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
    if(sportsV100){
      const mod=await ensureV100Module();
      await mod.saveSportsIdentityV100?.(sportsV100);
    }

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
$('#adminTopButtonV101')?.addEventListener('click',()=>{if(canUseAdminUIV101())activateTab('admin')});
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

$('#prefBackgroundEffectQualityP61')?.addEventListener('change',async e=>{
  const value=e.target.value;
  const st=$('#visualPerformanceSettingsStatusP61');
  applyBackgroundEffectPreferenceP61(value);
  try{
    userPreferences=await updatePreferences(session.user.id,{...userPreferences,background_effect_quality:value});
    applyBackgroundEffectPreferenceP61(userPreferences.background_effect_quality||value);
    setStatus(st,'Calidad de los efectos de fondo guardada.','ok');
  }catch(err){
    setStatus(st,err.message,'error');
  }
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
  ['#prefShowReputation','show_reputation','checked'],
  ['#prefShowActivityV60','show_activity_status','checked']
];
preferenceBindings.forEach(([sel,key,kind])=>{
  const el=$(sel);if(!el)return;
  el.onchange=async()=>{
    await savePreferencePatch({[key]:kind==='checked'?el.checked:el.value});
    if(key==='show_activity_status'){
      try{
        await presenceManagerV35?.stop?.();
        presenceManagerV35=createPresenceManagerV35(session.user.id,ids=>{
          onlineUserIdsV35=new Set([...ids].map(String));
          decorateOnlineIndicatorsV35();decoratePresenceTextV60();renderOwnAvatarsV44();decorateAllPlayersV38(document);
        },{trackSelf:userPreferences?.show_activity_status!==false});
        await presenceManagerV35.start();
        presenceHeartbeatV60?.stop?.();
        if(userPreferences?.show_activity_status!==false)await presenceHeartbeatV60?.start?.();
      }catch(err){console.warn('Privacidad presencia V60:',err)}
    }
  };
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
    const sportsV100=await ensureV100Module().then(mod=>mod.resolveSettingsSportsProfileV100?.());
    const clubResult=sportsV100?.clubResult||await resolveSelectedClubV49('#prefProfileClubSelect','#prefProfileCustomClubV49');

    setStatus(status,'Guardando…');
    const {data,error}=await supabase.from('profiles').update(payload).eq('id',session.user.id).select().single();
    if(error)throw error;

    await setMyClubV51(clubResult.club_id??null);
    if(sportsV100)await ensureV100Module().then(mod=>mod.saveSportsIdentityV100?.(sportsV100));
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
  const form=e.currentTarget;
  const status=$('#accountSettingsStatus');
  const pass=$('#newAccountPassword').value;
  const confirmPass=$('#confirmAccountPassword').value;
  if(pass.length<8)return setStatus(status,'Usá una contraseña de al menos 8 caracteres.','error');
  if(pass!==confirmPass)return setStatus(status,'Las contraseñas no coinciden.','error');
  try{
    setStatus(status,'Actualizando contraseña…');
    const {error}=await supabase.auth.updateUser({password:pass});
    if(error)throw error;
    form.reset();
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
$$('[data-home-rating-mode-v59]').forEach(button=>button.addEventListener('click',()=>{
  rankingMode=button.dataset.homeRatingModeV59||'individual';
  $$('[data-ranking-mode]').forEach(x=>x.classList.toggle('active',x.dataset.rankingMode===rankingMode));
  activateTab('ranking');
}));
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

function syncHistoryAdvancedFiltersV60(){
  v60State.historyModality=$('#historyModalityV60')?.value||'all';
  v60State.historySeason=$('#historySeasonV60')?.value||'all';
  v60State.historyDateFrom=$('#historyDateFromV60')?.value||'';
  v60State.historyDateTo=$('#historyDateToV60')?.value||'';
  v60State.historySort=$('#historySortV60')?.value||'recent';
  loadHistoryPage();
}
['historyModalityV60','historySeasonV60','historyDateFromV60','historyDateToV60','historySortV60'].forEach(id=>{
  $(`#${id}`)?.addEventListener('change',syncHistoryAdvancedFiltersV60);
});
$('#historyClearFiltersV60')?.addEventListener('click',()=>{
  historyModeFilter='all';historyResultFilter='all';
  v60State.historyModality='all';v60State.historySeason='all';v60State.historyDateFrom='';v60State.historyDateTo='';v60State.historySort='recent';
  $$('[data-history-mode]').forEach(x=>x.classList.toggle('active',x.dataset.historyMode==='all'));
  $$('[data-history-result]').forEach(x=>x.classList.toggle('active',x.dataset.historyResult==='all'));
  if($('#historyOpponentSearch'))$('#historyOpponentSearch').value='';
  if($('#historyModalityV60'))$('#historyModalityV60').value='all';
  if($('#historySeasonV60'))$('#historySeasonV60').value='all';
  if($('#historyDateFromV60'))$('#historyDateFromV60').value='';
  if($('#historyDateToV60'))$('#historyDateToV60').value='';
  if($('#historySortV60'))$('#historySortV60').value='recent';
  loadHistoryPage();
});

$('#challengePlayerResults').onclick=e=>{const b=e.target.closest('[data-select-rival]');if(b)selectRival(b)};
$('#clearSelectedRival').onclick=clearRival;

$('#challengeForm').onsubmit=async e=>{e.preventDefault();if(!selectedRival)return;
  const form=e.currentTarget;
  const statusEl=$('#challengeCreateStatus');
  const submit=form.querySelector('[type="submit"]');
  const rivalId=selectedRival.id;
  await withActionLockV60(`create-challenge:${rivalId}`,submit,async()=>{
    try{
      await createChallenge({
        challengerId:session.user.id,
        challengedId:rivalId,
        format:$('#challengeFormat').value,
        matchType:$('#challengeMatchType').value||'ranked',
        scheduledDate:$('#challengeDate').value,
        scheduledTime:$('#challengeTime').value,
        location:$('#challengeLocation').value.trim()
      });
      if(form && typeof form.reset==='function') form.reset();
      setChallengeType(userPreferences?.default_match_type==='casual'?'casual':'ranked');
      clearRival();
      await Promise.all([loadChallenges(),loadActivityCenter()]);
    }catch(err){
      if(statusEl) setStatus(statusEl,err.message,'error');
      else alert(err.message);
    }
  },{loadingText:'Enviando…',successText:'Desafío enviado ✓'});
};

document.addEventListener('input',e=>{const teamSearch=e.target.closest('[data-team-player-search]');if(teamSearch)searchTeamPlayerV32(teamSearch)});

document.addEventListener('click',async e=>{
  const teamModeButton=e.target.closest('#openTeamTournamentV32,[data-open-team-mode-v32]');
  if(teamModeButton){
    e.preventDefault();
    openTeamTournamentBuilderV32();
    return;
  }
  const resp=e.target.closest('[data-response]');if(resp){
    const id=Number(resp.dataset.id),response=resp.dataset.response;
    await withActionLockV60(`challenge-response:${id}:${response}`,resp,async()=>{try{await respondToChallenge(id,response);await Promise.all([loadChallenges(),loadMatches(),loadLiveNotifications(),loadActivityCenter()]);recoverPageScrollIfIdle()}catch(err){alert(err.message)}},{loadingText:response==='accepted'?'Aceptando…':'Procesando…',successText:response==='accepted'?'Partido listo ✓':'Listo ✓'});
    return
  }
  const cancel=e.target.closest('[data-cancel-challenge]');if(cancel){
    const id=Number(cancel.dataset.cancelChallenge);
    await withActionLockV60(`challenge-cancel:${id}`,cancel,async()=>{try{await cancelChallenge(id);await Promise.all([loadChallenges(),loadActivityCenter()]);recoverPageScrollIfIdle()}catch(err){alert(err.message)}},{loadingText:'Cancelando…'});
    return
  }
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
    await withActionLockV60(`confirm-match:${matchId}`,confirm,async()=>{try{
      const before=getRating('individual').rating;
      await confirmMatchResult(matchId);
      postMatchShownIds.add(matchId);
      pendingPostMatchReviewId=matchId;
      await refreshCore();
      const after=getRating('individual').rating;
      let confirmedMatch=(socialState.matches||[]).find(x=>Number(x.id)===matchId);
      if(!confirmedMatch?.winner_id){
        try{confirmedMatch=(await getMyMatches(session.user.id)).find(x=>Number(x.id)===matchId)||confirmedMatch}catch{}
      }
      const won=confirmedMatch?.winner_id===session.user.id;
      await showPostMatch({matchId,won,oldRating:before,newRating:after});
      setTimeout(syncModalScrollLock,0);
    }catch(err){alert(err.message)}},{loadingText:'Confirmando…',successText:'Confirmado ✓'});
    return
  }
  const dispute=e.target.closest('[data-dispute-match]');if(dispute){
    const matchId=Number(dispute.dataset.disputeMatch);
    await withActionLockV60(`dispute-match:${matchId}`,dispute,async()=>{try{
      await disputeMatchResult(matchId);
      await Promise.all([loadMatches(),loadLiveNotifications(),loadActivityCenter()]);
      await openDisputeModalV58(matchId);
    }catch(err){alert(err.message)}},{loadingText:'Abriendo disputa…',successText:'Disputa abierta ✓'});
    return
  }
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

  const matchId=Number(currentMatch.id);
  const submitButton=e.currentTarget.querySelector('[type="submit"]');
  await withActionLockV60(`submit-result:${matchId}`,submitButton,async()=>{
    try{
      await submitMatchResult(matchId,sets);
      closeMatchModal();

      // La UI local cambia inmediatamente; el rival recibe lo mismo por Realtime.
      await Promise.all([
        loadChallenges(),
        loadMatches(),
        loadLiveNotifications(),
        loadV28Experience(),
        loadActivityCenter()
      ]);

      recoverPageScrollIfIdle();
    }catch(err){
      setStatus($('#matchResultStatus'),err.message,'error');
    }
  },{loadingText:'Guardando resultado…',successText:'Resultado enviado ✓'});
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
  const playMode=e.target.closest('[data-play-mode-v62]');
  if(playMode){
    const mode=playMode.dataset.playModeV62==='doubles'?'doubles':'individual';
    showPlayModeV62(mode);
    if(mode==='individual')setTimeout(()=>$('#challengePlayerSearch')?.focus(),40);
    else ensureDoublesModuleV62().then(mod=>mod.refreshDoublesV62?.()).catch(err=>alert('No se pudo cargar el modo 2 vs 2. El modo 1 vs 1 sigue disponible.'));
    return;
  }

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
    showPlayModeV62('individual');
    $('#challengeComposer').classList.remove('hidden');
    $('#selectedRivalName').textContent=selectedRival.name;
    $('#selectedRivalUsername').textContent=`@${selectedRival.user}`;
    const pref=userPreferences?.default_match_type||'ask';
    setChallengeType(pref==='casual'?'casual':'ranked');
    if(userPreferences?.default_match_format)$('#challengeFormat').value=userPreferences.default_match_format;
    return;
  }

  if(e.target.closest('#retryDailyMissionsV101')){await retryDailyMissionsV101();return}

  if(e.target.closest('#v28CoachHome')||e.target.closest('#v28RefreshCoach')){
    if($('#v28CoachText'))$('#v28CoachText').textContent=buildV28CoachText();
    if(e.target.closest('#v28CoachHome')){activateTab('stats');setTimeout(()=>$('#v28CoachText')?.scrollIntoView({behavior:'smooth',block:'center'}),120)}
    return;
  }
  if(e.target.closest('#v28QuickRival')){
    const first=$('#recommendedRivals [data-quick-challenge]');
    if(first){first.click()}else{activateTab('play');showPlayModeV62('individual');$('#challengePlayerSearch')?.focus()}
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
    showPlayModeV62('individual');
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
  if(reviewStarsLockedV62)return;
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
$('#homeTitlesShortcutV59')?.addEventListener('click',()=>{
  activateTab('profile');
  setTimeout(()=>openTitleSelector(),120);
});
$('#homeProtectionShortcutV59')?.addEventListener('click',()=>{
  activateTab('home');
  setTimeout(()=>$('#homeProtectionV58')?.scrollIntoView({behavior:'smooth',block:'center'}),120);
});
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
$('#openSeasonRewardsV63')?.addEventListener('click',()=>{
  ensureV63Module().then(mod=>mod.openSeasonRewardsV63?.({position:seasonState?.position||null})).catch(err=>alert(err?.message||'No se pudieron abrir los premios.'));
});
document.addEventListener('click',e=>{
  const review=e.target.closest('[data-admin-review-match-v63]');
  if(!review)return;
  ensureV63Module().then(mod=>mod.openAdminMatchReviewV63?.(Number(review.dataset.adminReviewMatchV63))).catch(err=>alert(err?.message||'No se pudo abrir la revisión.'));
});
window.addEventListener('tt-v63-integrity-changed',()=>{if(v35Flags?.is_test_admin)loadAdminIntegrityV59().catch(()=>{});});
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

// ============================================================
// V58 — EVENTOS DE INTERFAZ
// ============================================================

document.addEventListener('click',async e=>{
  const tag=e.target.closest('[data-review-tag-v58]');
  if(tag){
    const key=tag.dataset.reviewTagV58;
    if(selectedReviewTagsV58.has(key))selectedReviewTagsV58.delete(key);else selectedReviewTagsV58.add(key);
    paintReviewTagsV58();
    paintReviewStars();
    return;
  }

  const openDispute=e.target.closest('[data-resolve-dispute-v58]');
  if(openDispute){await openDisputeModalV58(Number(openDispute.dataset.resolveDisputeV58));return}

  const showSearch=e.target.closest('[data-show-arbiter-search-v58]');
  if(showSearch){
    $('#disputeArbiterSearchV58').classList.remove('hidden');
    $('#disputeArbiterQueryV58').value='';
    await searchArbitersUiV58();
    return;
  }

  const pick=e.target.closest('[data-pick-arbiter-v58]');
  if(pick){
    try{
      pick.disabled=true;
      await proposeDisputeArbiterV58(Number(v58State.dispute.match.id),pick.dataset.pickArbiterV58);
      $('#disputeArbiterSearchV58').classList.add('hidden');
      await refreshOpenDisputeV58();await loadLiveNotifications();
    }catch(err){setStatus($('#disputeStatusV58'),err.message,'error')}finally{pick.disabled=false}
    return;
  }

  const respond=e.target.closest('[data-respond-arbiter-v58]');
  if(respond){
    try{await respondDisputeArbiterV58(Number(v58State.dispute.match.id),respond.dataset.respondArbiterV58==='accept');await refreshOpenDisputeV58();await loadLiveNotifications()}catch(err){setStatus($('#disputeStatusV58'),err.message,'error')}
    return;
  }

  if(e.target.closest('[data-request-admin-v58]')){
    try{await requestAdminDisputeV58(Number(v58State.dispute.match.id));await refreshOpenDisputeV58();await loadLiveNotifications()}catch(err){setStatus($('#disputeStatusV58'),err.message,'error')}
    return;
  }

  if(e.target.closest('[data-request-annul-v58]')){
    try{await requestAnnulDisputeV58(Number(v58State.dispute.match.id));await Promise.all([refreshOpenDisputeV58(),loadMatches(),loadLiveNotifications()])}catch(err){setStatus($('#disputeStatusV58'),err.message,'error')}
    return;
  }

  if(e.target.closest('[data-decline-arbiter-v58]')){
    try{await declineDisputeAssignmentV58(Number(v58State.dispute.match.id));await refreshOpenDisputeV58();await loadLiveNotifications()}catch(err){setStatus($('#disputeStatusV58'),err.message,'error')}
    return;
  }

  const adminDispute=e.target.closest('[data-admin-open-dispute-v58]');
  if(adminDispute){await openDisputeModalV58(Number(adminDispute.dataset.adminOpenDisputeV58),{admin:true});return}

  const related=e.target.closest('[data-toggle-related-v58]');
  if(related){
    const [u1,u2,action]=related.dataset.toggleRelatedV58.split(':');
    const reason=prompt(action==='allow'?'Motivo de la excepción (ej: hermanos que comparten celular):':'Motivo para revocar la excepción:')||'';
    try{
      if(action==='allow')await adminAllowRelatedPairV58(u1,u2,reason);else await adminRevokeRelatedPairV58(u1,u2,reason);
      await loadAdminLinkedAccountsV58();
      setStatus($('#adminLinkedStatusV58'),action==='allow'?'Excepción autorizada.':'Excepción revocada.','ok');
    }catch(err){setStatus($('#adminLinkedStatusV58'),err.message,'error')}
    return;
  }

  const invalidateTag=e.target.closest('[data-invalidate-tag-v58]');
  if(invalidateTag){
    const reason=prompt('Motivo para invalidar esta mención:')||'';
    try{await adminInvalidateReviewTagV58(Number(invalidateTag.dataset.invalidateTagV58),reason);await loadAdminReviewTagsV58();setStatus($('#adminReviewTagsStatusV58'),'Mención invalidada. Dejó de contar para títulos.','ok')}catch(err){setStatus($('#adminReviewTagsStatusV58'),err.message,'error')}
    return;
  }

  const notification=e.target.closest('[data-notification-v58]');
  if(notification){
    const n=(v58State.notifications||[]).find(x=>Number(x.id)===Number(notification.dataset.notificationV58));
    $('#activityCenterModal')?.classList.add('hidden');syncModalScrollLock();
    await handleNotificationActionV58(n);
    await loadLiveNotifications();
    return;
  }
});

document.addEventListener('input',e=>{
  if(e.target.id==='disputeArbiterQueryV58'){
    clearTimeout(disputeSearchTimerV58);
    disputeSearchTimerV58=setTimeout(searchArbitersUiV58,220);
  }
});

$('#resolveDisputeScoreV58')?.addEventListener('click',async()=>{
  const btn=$('#resolveDisputeScoreV58');
  try{
    btn.disabled=true;setStatus($('#disputeStatusV58'),'Resolviendo partido…');
    const sets=collectDisputeSetsV58();
    const id=Number(v58State.dispute.match.id);
    await resolveDisputeV58(id,sets);
    $('#disputeResolutionModalV58').classList.add('hidden');syncModalScrollLock();
    await refreshCore();
    await loadV58Core({refreshTitles:true});
    if(v35Flags?.is_test_admin)await Promise.all([loadAdminDisputesV58(),loadAdminIntegrityV59()]);
  }catch(err){setStatus($('#disputeStatusV58'),err.message,'error')}finally{btn.disabled=false}
});

$('#closeDisputeModalV58')?.addEventListener('click',()=>{$('#disputeResolutionModalV58').classList.add('hidden');syncModalScrollLock()});
$('#disputeResolutionModalV58')?.addEventListener('click',e=>{if(e.target===$('#disputeResolutionModalV58')){$('#disputeResolutionModalV58').classList.add('hidden');syncModalScrollLock()}});
$('#adminRefreshDisputesV58')?.addEventListener('click',loadAdminDisputesV58);
$('#adminRefreshLinkedV58')?.addEventListener('click',loadAdminLinkedAccountsV58);
$('#adminRefreshIntegrityV59')?.addEventListener('click',loadAdminIntegrityV59);
$('#adminRefreshReviewTagsV58')?.addEventListener('click',loadAdminReviewTagsV58);
$('#markAllNotificationsReadV58')?.addEventListener('click',async()=>{try{await markAllNotificationsReadV58();await Promise.all([loadLiveNotifications(),loadActivityCenter()])}catch(err){console.warn(err)}});

$$('[data-activity-filter-v60]').forEach(button=>button.addEventListener('click',()=>{
  v60State.activityFilter=button.dataset.activityFilterV60||'attention';
  renderActivityCenterV60();
}));
$$('[data-admin-category-v60]').forEach(button=>button.addEventListener('click',()=>setAdminCategoryV60(button.dataset.adminCategoryV60)));
$('#adminRefreshMetricsV70')?.addEventListener('click',()=>loadAdminProductMetricsV70(Number($('#adminMetricsRangeV70')?.value||7)));
$('#adminMetricsRangeV70')?.addEventListener('change',e=>loadAdminProductMetricsV70(Number(e.target.value||7)));
$('#adminUserSearchV60')?.addEventListener('input',()=>{
  clearTimeout(adminUserSearchTimerV60);
  adminUserSearchTimerV60=setTimeout(searchAdminUsersV60,220);
});
$('#adminRunDiagnosticsV60')?.addEventListener('click',e=>withActionLockV60('admin-diagnostics',e.currentTarget,runAdminDiagnosticsV60,{loadingText:'Diagnosticando…'}));
$('#adminCopyDiagnosticsV60')?.addEventListener('click',e=>withActionLockV60('admin-copy-diagnostics',e.currentTarget,copyAdminDiagnosticsV60,{loadingText:'Copiando…'}));
$('#adminCheckUpdateV60')?.addEventListener('click',e=>withActionLockV60('admin-check-update',e.currentTarget,checkForUpdateV60,{loadingText:'Buscando…'}));

$('#notificationButton').onclick=async()=>{
  $('#activityCenterModal').classList.remove('hidden');
  syncModalScrollLock();
  await loadActivityCenter();
};
$('#logoutButton').onclick=async()=>{stopTrainingTimerV53?.();stopLiveNotificationStream();presenceHeartbeatV60?.stop?.();await presenceManagerV35?.stop?.();await signOutUser();session=null;profile=null;ratings=[];showView('welcomeView')};
window.addEventListener('tt-v62-doubles-confirmed',()=>refreshCore().catch(err=>console.warn('Refresh dobles V62:',err)));

supabase.auth.onAuthStateChange((event,nextSession)=>{
  if(event==='PASSWORD_RECOVERY'){
    showPasswordRecoveryViewV53(nextSession);
  }
});

installErrorCaptureV60();
installRapidClickGuardV60();
setupAdminPanelsV60();
startMatchClocksV59();
initMotionV601();
setupPwaV573().catch(err=>{recordClientErrorV60(err,'pwa-v60');console.error('PWA V60:',err)});

(async()=>{
  try{
    const recoveryHint=new URLSearchParams(window.location.search).get('recovery')==='1';

    document.body.dataset.ttBootStage='session';
    setBootMessageV572('Comprobando sesión…');
    const startupSession=await getSession({timeoutMs:8000});

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


// TT Rivals 1.0.1 Premium P4 — ayuda contextual de métricas de Inicio.
const METRIC_INFO_V101={
  streak:{icon:'🔥',eyebrow:'RACHA ACTUAL',title:'Tu impulso competitivo',body:`<p>La racha cuenta tus <strong>victorias ranked consecutivas</strong>. Una derrota corta la racha.</p><div class="metric-info-benefit-v101"><strong>Bonus de Elo por racha</strong><span>6.ª victoria x1.25 · 7.ª x1.50 · 8.ª x1.75 · 9.ª x2 · 10.ª x2.25 · 11.ª x2.50 · 12.ª x2.75 · 13.ª y siguientes x3.</span></div><p class="metric-info-note-v101">Si derrotás a un rival con una racha activa de 5+ victorias, tu ganancia puede recibir un bonus x2. El rival pierde únicamente su Elo normal. Los bonus nunca superan x3.</p>`},
  'best-streak':{icon:'🏆',eyebrow:'MEJOR RACHA',title:'Tu récord personal',body:`<p>Muestra la mayor cantidad de <strong>victorias consecutivas</strong> que alcanzaste en tu historial competitivo.</p><div class="metric-info-benefit-v101"><strong>Es un récord histórico</strong><span>No baja cuando perdés. Tu racha actual puede volver a superarlo en cualquier momento.</span></div>`},
  reputation:{icon:'★',eyebrow:'REPUTACIÓN',title:'Cómo te perciben tus rivales',body:`<p>La reputación resume las <strong>valoraciones post partido</strong> relacionadas con deportividad, respeto y experiencia de juego.</p><div class="metric-info-benefit-v101"><strong>No mide tu nivel</strong><span>Tu Elo mide rendimiento competitivo. La reputación mide la experiencia que otros jugadores tuvieron al enfrentarte.</span></div>`},
  achievements:{icon:'◆',eyebrow:'LOGROS',title:'Hitos de tu carrera',body:`<p>Los logros reconocen objetivos, marcas competitivas, temporadas, torneos y otros hitos de TT Rivals.</p><div class="metric-info-benefit-v101"><strong>Construyen tu identidad</strong><span>Los logros desbloqueados permanecen en tu perfil y algunos pueden convertirse en placas destacadas.</span></div>`}
};
function openMetricInfoV101(key){
  const d=METRIC_INFO_V101[key];if(!d)return;
  const modal=$('#metricInfoModalV101');if(!modal)return;
  $('#metricInfoIconV101').textContent=d.icon;
  $('#metricInfoEyebrowV101').textContent=d.eyebrow;
  $('#metricInfoTitleV101').textContent=d.title;
  $('#metricInfoBodyV101').innerHTML=d.body;
  modal.classList.remove('hidden');syncModalScrollLock();
}
function closeMetricInfoV101(){
  $('#metricInfoModalV101')?.classList.add('hidden');syncModalScrollLock();
}
document.addEventListener('click',e=>{
  const btn=e.target.closest?.('[data-metric-info-v101]');
  if(btn){e.preventDefault();e.stopPropagation();openMetricInfoV101(btn.dataset.metricInfoV101);return}
  if(e.target.closest?.('#closeMetricInfoV101')){closeMetricInfoV101();return}
  if(e.target?.id==='metricInfoModalV101')closeMetricInfoV101();
});

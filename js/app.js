Warning: truncated output (original token count: 109884)
Total output lines: 8901

import { supabase } from './supabase.js';
import {getSession,signUpUser,signInUser,signOutUser,requestPasswordReset,updateRecoveredPassword,verifySessionAccessV75} from './auth.js?v=1.0.1-p7.4r.3.1';
import {initAccessControlV75,startSessionAccessGuardV76,stopSessionAccessGuardV76} from './v75_access_control.js?v=1.0.1-p7.4r.3.1';
import {
  initModerationEmailV76,showAccessBlockedV76,clearAccessBlockedActionV76,
  loadAdminSuspendedV76,createRegistrationCancelTokenV76,maskEmailV76,
  savePendingRegistrationV76,getPendingRegistrationV76,clearPendingRegistrationV76,
  getRegistrationConfigV76,verifyRegistrationCodeV76,resendRegistrationCodeV76,
  cancelPendingRegistrationV76
} from './v76_moderation_email.js?v=1.0.1-p7.4r.3';
import {
  getAdminAutoModerationV77,setAutoModerationModeV77,
  dismissAutoModerationCaseV77,reprocessAutoModerationV77,
  getMyIntegrityStatusV78,submitIntegrityAppealV78,resolveIntegrityHoldV78
} from './v77_auto_moderation.js?v=1.0.1-p7.4r.4.1';
import {getMyProfile,getMyRatings,completeSportsProfile,getClubsV47,ensureClubV47,getClubsV49,getClubsV50,getClubsV51,suggestClubsV49,suggestClubsV50,suggestClubsV51,ensureClubV49,ensureClubV51,setMyClubV49,setMyClubV51,getMyClubV49,getMyClubV51,adminListClubsV49,adminListClubsV51,adminMergeClubsV49,adminMergeClubsV51,adminRenameClubV49,adminCreateClubV51,adminUpdateClubV51,getRanking,searchPlayers,getRatingHistory,getRankTiers,setProfilePhotoUrl,uploadProfilePhoto,deleteProfilePhotoByUrl} from './profile.js?v=1.0.1-p7.4r.3';
import {createChallenge,createRematchChallengeV73,respondToChallenge,cancelChallenge,getMyChallenges,invalidateChallengesCacheV60} from './challenges.js?v=1.0.1-p7.4r.3';
import {getMyMatches,submitMatchResult,confirmMatchResult,disputeMatchResult,getMyDurationStatsV59,adminListMatchIntegrityV59,invalidateMatchesCacheV60} from './matches.js?v=1.0.1-p7.4r.4.1';
import {createTournamentV8,getTournamentsV8,getTournamentEntriesV8,getTournamentMembersV8,getTournamentGamesV8,getTournamentStandingsV8,getTournamentStandingsV31,submitTournamentGameResultV8,closeGroupStageV8,finalizeTournamentV8,searchTournamentUsersV8,getTournamentParticipantProfilesV8,createTournamentV30,getMyTournamentHistoryV30,searchActiveTournamentsV30,joinTournamentV30,leaveTournamentV30,startTournamentV30,getTournamentLobbyV30} from './tournaments.js?v=1.0.1-p7.4r.3';
import {getReviewsForUser,getReviewsAuthoredByUser,submitPlayerReview,getPlayerProfile,getPlayerRatings,followPlayer,unfollowPlayer,getFollowingIds,getFollowingRanking,getPublicPlayerCard,getFollowingFeed,setPrimaryRival,clearPrimaryRival,getMyPrimaryRival,getShowcaseAchievements,setShowcaseAchievements,getPlayerReliabilityV34} from './social.js?v=1.0.1-p7.4r.3';
import {getPreferences,updatePreferences,getFrames,equipFrame,getSeasonDashboard,getSeasonHistory,getRecommendedRivals,getPlayerPercentiles,getPublicProfilePreferences} from './preferences.js?v=1.0.1-p7.4r.3';
import {getSeasonChampions,getPublicPlayerSeasons,getH2HAdvanced,getPlayerRecords,getTournamentSummary} from './history.js?v=1.0.1-p7.4r.3';
import {getPlayerTitles,equipCompetitiveTitle,refreshOwnCompetitiveTitlesV58,getTournamentHistory,getComparativeStats,getPostMatchSummary} from './v21.js';
import {getV28Dashboard,getV28LastSeasonRecap,getDailyMissionsV101} from './v28.js';
import {getMyV35Flags,updateMyLocationV35,getNearbyPlayersV35,createPresenceManagerV35} from './v35_social.js?v=1.0.1-p7.4r.3';
import {getPublicAdminFlagV37,getPublicAdminIdsV38} from './v36_live.js';
import {getFrameFitsV44,saveFrameFitV44,resetFrameFitV44,subscribeAvatarLiveV44} from './v44_avatar_fit.js';
import {createTeamTournamentV32,getTeamTournamentV32,listMyTeamTournamentsV32,submitTeamTournamentMatchResultV32,createTeamTiebreakV32,finalizeTeamTournamentDrawV32,finalizeTeamTournamentV33,listMyTeamTournamentHistoryV33} from './team_tournaments.js';
import {setupTrainingTimerV53} from './training.js';
import {createCompetitionLiveSyncV55} from './v55_competition_live.js?v=1.0.1-p7.4';
import {getMyStatsV56} from './v56_stats.js';
import {setupPwaV573,getPwaDiagnosticsV60,checkForUpdateV60} from './pwa.js?v=1.0.1-p7.4r.4.1';
import {APP_VERSION,APP_BUILD} from './version.js?v=1.0.1-p7.4r.4.1';
import {withActionLockV60,installRapidClickGuardV60,installErrorCaptureV60,getRecentErrorsV60,recordClientErrorV60} from './v60_runtime.js?v=1.0.1-p7.4';
import {getPresenceV60,createPresenceHeartbeatV60} from './v60_presence.js';
import {getAdminProductMetricsV70,recordProductEventV70} from './v70_metrics.js';
import {getCompetitiveProgressV72} from './v72_progress.js';
import {getHistorySeasonsV60} from './v60_history.js';
import {initMotionV601,animateTabEnterV601,animateNumberV601,animateProgressV601,animatePriorityV601,animateListV601,animateRankingMovementV601,pulseProtectionReadyV601,animatePostMatchV601,celebrateRewardV601} from './v60_motion.js?v=1.0.1-p7.3.1';
import {installSwipeNavigationV74} from './v74_navigation.js?v=1.0.1-p7.4.3';
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

// P7.4R — Rivalidades se carga de forma aislada.
// Si la interfaz o el SQL todavía no están disponibles, el núcleo sigue funcionando.
let rivalriesModuleV74=null;
let rivalriesModulePromiseV74=null;
async function ensureRivalriesV74(){
  if(rivalriesModuleV74)return rivalriesModuleV74;
  if(!rivalriesModulePromiseV74){
    rivalriesModulePromiseV74=import(`./v74_rivalries.js?v=${encodeURIComponent(APP_VERSION)}`)
      .then(mod=>{
        rivalriesModuleV74=mod;
        mod.initRivalriesV74?.();
        return mod;
      })
      .catch(error=>{
        rivalriesModulePromiseV74=null;
        recordClientErrorV60(error,'v74-rivalries');
        console.warn('P7.4 Rivalidades:',error);
        throw error;
      });
  }
  return rivalriesModulePromiseV74;
}
async function getPlayerCompetitiveStreaksV74(playerId){
  const mod=await ensureRivalriesV74();
  return mod.getPlayerCompetitiveStreaksV74?.(playerId);
}
async function getCompetitiveRivalryV74(opponentId){
  const mod=await ensureRivalriesV74();
  return mod.getCompetitiveRivalryV74?.(opponentId);
}
async function loadRivalriesV74(force=false){
  const mod=await ensureRivalriesV74();
  return mod.loadRivalriesV74?.(force);
}
function invalidateRivalriesV74(){rivalriesModuleV74?.invalidateRivalriesV74?.()}
function initRivalriesV74(){
  ensureRivalriesV74().catch(()=>{});
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
    doublesModulePromiseV62=import('./v62_doubles.js?v=1.0.1-p7.4r.3')
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
    v100ModulePromise=import('./v100_launch.js?v=1.0.1-p7.4r.3')
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
let socialState={matches:[],ratingHistory:[],reviewsReceived:[],reviewsAuthored:[],streak:{current:0,max:0},competitiveStreaks:null,achievements:[]};
let reviewTargetMatch=null,selectedReviewStars=0,reviewStarsLockedV62=false;
let competitionLiveSyncV55=null;
let liveRefreshTimersV55=new Map(),competitionRefreshPromiseV55=null;
let lastRatingSignatureV55='';
let statsModeV56='all',statsModeStateV56=null,statsModeLoadPromiseV56=null;
let legalConfigV57=null,legalStatusV57=null,currentLegalTabV57='terms';
let v58State={protection:{points:0,shield_available:false},notifications:[],installation:null,dispute:null,adminDisputes:[],linkedAccounts:[],reviewTags:[]};
let durationStatsV59=null,adminIntegrityV59=[],adminAutoModerationV77=null,myIntegrityStatusV78=null,matchClockTimerV59=null;
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
let pendingRematchV744=null,rematchOutcomeTimerV744=null;
let incomingRematchV745=null;
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
    const streak=Number(socialState.streak.current||0);
    $('#profileStreakTag').textContent=`🔥 Racha competitiva ${streak}`;
    $('#profileStreakTag').title='Cuenta partidos individuales oficiales con Elo. Las casuales no suman ni cortan la racha.';
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
  const [matches,history,reviewsReceived,reviewsAuthored,follows,rivalId,showcaseIds,reliability,competitiveStreaks]=await Promise.all([
    getMyMatches(session.user.id),
    getRatingHistory(session.user.id),
    getReviewsForUser(session.user.id).catch(()=>[]),
    getReviewsAuthoredByUser(session.user.id).catch(()=>[]),
    getFollowingIds(session.user.id).catch(()=>[]),
    getMyPrimaryRival(session.user.id).catch(()=>null),
    getShowcaseAchievements(session.user.id).catch(()=>[]),
    getPlayerReliabilityV34(session.user.id).catch(()=>({reliability:100,completed_matches:0,abandoned_matches:0,total_matches:0,provisional:true,label:'Jugador fiable'})),
    getPlayerCompetitiveStreaksV74(session.user.id).catch(()=>null)
  ]);
  socialState.matches=matches;
  socialState.ratingHistory=history;
  socialState.reviewsReceived=reviewsReceived;
  socialState.reviewsAuthored=reviewsAuthored;
  const fallbackStreak=computeStreaks(matches,session.user.id);
  const officialIndividual=competitiveStreaks?.individual||null;
  socialState.competitiveStreaks=competitiveStreaks||{individual:{current:fallbackStreak.current,best:fallbackStreak.max,played:0},doubles:{current:0,best:0,played:0}};
  socialState.streak={
    current:Number(officialIndividual?.current??fallbackStreak.current),
    max:Number(officialIndividual?.best??fallbackStreak.max)
  };
  invalidateRivalriesV74();
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

      // P7.4: sólo el estado competitivo esencial se carga al iniciar.
      // El resto se solicita al abrir su pestaña.
      await Promise.all([loadChallenges(),loadMatches(),loadLiveNotifications(),loadMyIntegrityStatusV78()]);
      lastRatingSignatureV55=JSON.stringify(
        ratings.map(r=>[r.modality,r.rating,r.matches_played,r.wins,r.losses])
      );
      startLiveNotificationStream();

      const hydrateHome=()=>runTabLoadV74('home',()=>Promise.all([
        loadHomeDashboard(),loadRecommendedRivals(),loadV28Experience()
      ]),{ttl:20000});
      if('requestIdleCallback' in window)requestIdleCallback(hydrateHome,{timeout:1800});
      else setTimeout(hydrateHome,350);
    }catch(err){
      console.error('Carga secundaria V58:',err);
      // La app permanece visible; el usuario puede reintentar navegando.
    }
  })();
}
async function route(prefetchedSession=undefined){
  session=prefetchedSession===undefined?await getSession():prefetchedSession;

  if(!session?.user){
    const pending=getPendingRegistrationV76();
    if(pending){
      try{
        const config=await getRegistrationConfigV76();
        if(config?.enabled){
          showEmailVerificationV76(pending,config);
          closeBootScreenV572();
          return;
        }
      }catch(error){
        console.warn('Registro pendiente V76:',error);
      }
    }
    showView('welcomeView');
    setStatus($('#globalStatus'),'');
    closeBootScreenV572();
    return;
  }

  document.body.dataset.ttBootStage='access';
  setBootMessageV572('Verificando acceso…');
  try{
    await verifySessionAccessV75(session);
  }catch(error){
    await signOutUser().catch(()=>{});
    const email=session?.user?.email||'';
    session=null;
    showView('loginView');
    if($('#loginEmail'))$('#loginEmail').value=email;
    if(!showAccessBlockedV76(error,email,$('#loginStatus'))){
      setStatus($('#loginStatus'),error.message||'No podés acceder a TT Rivals.','error');
    }
    closeBootScreenV572();
    return;
  }

  startSessionAccessGuardV76(session);

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
const tabLoadStateV74=new Map();

function invalidateTabLoadsV74(...tabs){
  for(const tab of tabs)tabLoadStateV74.delete(tab);
}

function runTabLoadV74(tab,loader,{ttl=30000}={}){
  const now=Date.now();
  const current=tabLoadStateV74.get(tab);
  if(current?.promise)return current.promise;
  if(current?.loadedAt&&now-current.loadedAt<ttl)return Promise.resolve(current.value);

  const promise=Promise.resolve()
    .then(loader)
    .then(value=>{
      tabLoadStateV74.set(tab,{loadedAt:Date.now(),value,promise:null});
      return value;
    })
    .catch(err=>{
      tabLoadStateV74.delete(tab);
      console.warn(`P7.4 carga de ${tab}:`,err);
      return null;
    });
  tabLoadStateV74.set(tab,{loadedAt:current?.loadedAt||0,value:current?.value,promise});
  return promise;
}

function recordTabSwitchV74(tab,startedAt,source){
  requestAnimationFrame(()=>{
    const ms=Math.round((performance.now()-startedAt)*10)/10;
    const rows=window.__TT_V74_PERF__||[];
    rows.push({tab,source,ms,at:new Date().toISOString()});
    window.__TT_V74_PERF__=rows.slice(-30);
    document.body.dataset.lastTabSwitchMsV74=String(ms);
  });
}

function activateTab(tab,{source='tap'}={}){
  const startedAt=performance.now();
  if(tab==='admin'&&!canUseAdminUIV101())tab='home';

  const previousTab=document.body.dataset.activeTabV101||'home';
  document.body.dataset.activeTabV101=tab||'home';
  if(!$$('.modal').some(m=>!m.classList.contains('hidden')))lockPageScroll(false);
  $$('.tab-page').forEach(page=>page.classList.toggle('active',page.id===`tab-${tab}`));
  $$('.nav-item').forEach(button=>button.classList.toggle('active',button.dataset.tab===tab));
  if(previousTab!==tab)animateTabEnterV601(tab);
  if(window.scrollY>0)window.scrollTo({top:0,behavior:'auto'});
  recordTabSwitchV74(tab,startedAt,source);

  // Render local inmediato. Las consultas se deduplican y respetan TTL.
  if(tab==='play')showPlayModeV62(null);
  if(tab==='profile'){
    renderAchievements();renderPrimaryRival();renderProfileSeasonCards();
    renderEquippedTitle();renderIdentityShowcase();
  }
  if(tab==='settings'){populateSettingsUI();renderFrameGallery()}
  if(tab==='admin'){setupAdminFrameLabV44();setupAdminPanelsV60()}
  if(tab==='stats')renderStatsModeV56();

  requestAnimationFrame(()=>{
    if(tab==='home')runTabLoadV74('home',()=>Promise.all([
      loadHomeDashboard(),loadNearbyPlayersV35(false),loadRecommendedRivals(),loadV28Experience()
    ]),{ttl:20000});

    if(tab==='ranking')runTabLoadV74('ranking',()=>Promise.all([
      loadRanking(),loadChampionsHall()
    ]),{ttl:30000});

    if(tab==='play')runTabLoadV74('play',()=>Promise.all([
      loadChallenges(),loadMatches()
    ]),{ttl:15000});

    if(tab==='tournaments')runTabLoadV74('tournaments',()=>loadTournamentHubV30(),{ttl:30000});

    if(tab==='history')runTabLoadV74('history',()=>loadHistoryPage(),{ttl:30000});

    if(tab==='stats')runTabLoadV74('stats',()=>Promise.all([
      loadHistory(),loadStatsModeV56(false),loadDurationStatsV59()
    ]),{ttl:30000});

    if(tab==='profile')runTabLoadV74('profile',()=>Promise.all([
      ensureV63Module().then(mod=>mod.loadOwnPalmaresV63?.()),
      ensureV100Module().then(mod=>mod.loadOwnSportsIdentityV100?.()),
      loadRivalriesV74()
    ]),{ttl:60000});

    if(tab==='ai')runTabLoadV74('ai',()=>ensureAiModuleV612().then(mod=>mod.refreshAiV61?.()),{ttl:30000});

    if(tab==='places')runTabLoadV74('places',()=>ensureV100Module().then(mod=>mod.loadPlacesV100?.()),{ttl:30000});

    if(tab==='settings')runTabLoadV74('settings',()=>Promise.all([
      loadLegalStatusV57(),
      loadSettingsClubV49(),
      loadV35Flags().then(()=>{renderFrameGallery();renderAchievements()})
    ]),{ttl:30000});

    if(tab==='admin'&&v35Flags?.is_test_admin)runTabLoadV74('admin',()=>Promise.all([
      loadAdminClubsV49(),loadAdminLegalConfigV57(),loadAdminDisputesV58(),
      loadAdminLinkedAccountsV58(),loadAdminIntegrityV59(),loadAdminReviewTagsV58(),
      loadAdminSuspendedV76(),loadAdminAutoModerationV77(),
      ensureV100Module().then(mod=>mo…59884 tokens truncated…('#registerPassword').value='';
    if($('#confirmPassword'))$('#confirmPassword').value='';
    showView('registerView');
    setStatus($('#registerStatus'),'Ingresá el correo correcto para comenzar nuevamente.','ok');
    setTimeout(()=>$('#registerEmail')?.focus(),80);
  }catch(error){
    setStatus(status,error?.message||'No se pudo cambiar el correo.','error');
  }finally{
    buttons.forEach(button=>button.disabled=false);
  }
}

emailOtpInputsV76().forEach((input,index,inputs)=>{
  input.addEventListener('input',()=>{
    const digits=String(input.value||'').replace(/\D/g,'');
    if(digits.length>1){
      digits.slice(0,6).split('').forEach((digit,offset)=>{
        if(inputs[index+offset])inputs[index+offset].value=digit;
      });
      inputs[Math.min(inputs.length-1,index+digits.length-1)]?.focus();
      return;
    }
    input.value=digits.slice(-1);
    if(input.value&&index<inputs.length-1)inputs[index+1].focus();
  });
  input.addEventListener('keydown',event=>{
    if(event.key==='Backspace'&&!input.value&&index>0)inputs[index-1].focus();
    if(event.key==='ArrowLeft'&&index>0)inputs[index-1].focus();
    if(event.key==='ArrowRight'&&index<inputs.length-1)inputs[index+1].focus();
  });
  input.addEventListener('paste',event=>{
    const digits=event.clipboardData?.getData('text')?.replace(/\D/g,'').slice(0,6)||'';
    if(!digits)return;
    event.preventDefault();
    inputs.forEach((item,i)=>{item.value=digits[i]||''});
    inputs[Math.min(digits.length,inputs.length)-1]?.focus();
  });
});

$('#emailVerificationFormV76')?.addEventListener('submit',async event=>{
  event.preventDefault();
  const pending=getPendingRegistrationV76();
  const status=$('#emailVerificationStatusV76');
  const button=event.currentTarget.querySelector('button[type="submit"]');
  const token=emailOtpValueV76();
  if(!pending)return setStatus(status,'El registro pendiente ya no está disponible.','error');
  if(token.length!==6)return setStatus(status,'Ingresá los 6 dígitos del código.','error');
  try{
    button.disabled=true;
    setStatus(status,'Verificando código…');
    const {data,error}=await verifyRegistrationCodeV76(pending.email,token);
    if(error)throw error;
    session=data?.session||await getSession();
    if(!session?.user)throw new Error('El correo se verificó, pero no pudimos abrir la sesión.');
    startSessionAccessGuardV76(session);
    clearPendingRegistrationV76();
    clearInterval(emailVerificationTimerV76);
    try{await recordMyLegalAcceptanceV57()}catch(error){console.warn('Legal V76:',error)}
    setStatus(status,'Correo verificado. Preparando tu perfil…','ok');
    setTimeout(()=>showView('sportsProfileView'),250);
  }catch(error){
    const message=String(error?.message||'').toLowerCase();
    setStatus(status,
      message.includes('expired')||message.includes('invalid')
        ?'El código es incorrecto o venció. Podés solicitar uno nuevo.'
        :friendly(error?.message||'No se pudo verificar el código.'),
      'error'
    );
  }finally{
    button.disabled=false;
  }
});

$('#resendEmailCodeV76')?.addEventListener('click',async event=>{
  const pending=getPendingRegistrationV76();
  const status=$('#emailVerificationStatusV76');
  if(!pending)return setStatus(status,'El registro pendiente ya no está disponible.','error');
  if(Number(pending.resendAt||0)>Date.now())return;
  try{
    event.currentTarget.disabled=true;
    setStatus(status,'Enviando un código nuevo…');
    const {error}=await resendRegistrationCodeV76(pending.email);
    if(error)throw error;
    pending.resendAt=Date.now()+Number(emailVerificationConfigV76.resend_seconds||60)*1000;
    savePendingRegistrationV76(pending);
    startEmailResendTimerV76();
    setStatus(status,`Código reenviado a ${maskEmailV76(pending.email)}.`,'ok');
  }catch(error){
    setStatus(status,
      /rate|limit/i.test(error?.message||'')
        ?'Esperá un momento antes de solicitar otro código.'
        :friendly(error?.message||'No se pudo reenviar el código.'),
      'error'
    );
    event.currentTarget.disabled=false;
  }
});

$('#changeRegistrationEmailV76')?.addEventListener('click',changePendingRegistrationEmailV76);
$('#emailVerificationBackV76')?.addEventListener('click',changePendingRegistrationEmailV76);

$('#goRegister').onclick=async()=>{
  if(await openPendingRegistrationV76())return;
  showView('registerView');
};
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
  const submitButton=e.currentTarget.querySelector('button[type="submit"]');

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
    submitButton.disabled=true;
    setStatus(st,'Preparando verificación segura…');
    const config=await getRegistrationConfigV76();
    if(!config?.enabled){
      throw new Error('La verificación de correo todavía se está activando. Intentá nuevamente en unos minutos.');
    }
    const cancelToken=createRegistrationCancelTokenV76();
    const {data,error}=await signUpUser({
      email,password,firstName,lastName,username,
      legalTermsVersion:LEGAL_V57.termsVersion,
      legalPrivacyVersion:LEGAL_V57.privacyVersion,
      registrationCancelToken:cancelToken
    });

    if(error)throw error;
    if(Array.isArray(data?.user?.identities)&&data.user.identities.length===0){
      throw new Error('Ese correo ya está registrado o no puede utilizarse.');
    }
    if(!data?.user?.id)throw new Error('No pudimos crear el registro pendiente.');

    const pending=savePendingRegistrationV76({
      email,userId:data.user.id,cancelToken,firstName,lastName,username,
      createdAt:Date.now(),
      resendAt:Date.now()+Number(config.resend_seconds||60)*1000
    });

    if(data.session){
      session=data.session;
      await cancelPendingRegistrationV76(pending).catch(()=>{});
      await signOutUser().catch(()=>{});
      session=null;
      clearPendingRegistrationV76();
      throw new Error('La confirmación de correo todavía no está habilitada en Supabase. El registro fue cancelado de forma segura.');
    }

    emailVerificationConfigV76=config;
    showEmailVerificationV76(pending,config);
  }catch(err){
    setStatus(st,friendly(err.message),'error');
  }finally{
    submitButton.disabled=false;
  }
};
$('#loginForm').onsubmit=async e=>{
  e.preventDefault();
  const st=$('#loginStatus');
  const email=$('#loginEmail').value.trim();
  clearAccessBlockedActionV76();
  try{
    const {data,error}=await signInUser({email,password:$('#loginPassword').value});
    if(error)throw error;
    session=data.session;
    startSessionAccessGuardV76(session);
    const p=await getMyProfile(data.user.id);
    if(!p.profile_completed)return showView('sportsProfileView');
    await loadApp(data.user.id,p);
  }catch(err){
    if(showAccessBlockedV76(err,email,st))return;
    if(/email.*not.*confirm|confirm.*email/i.test(err?.message||'')){
      const pending=getPendingRegistrationV76();
      if(pending&&pending.email.toLowerCase()===email.toLowerCase()){
        try{
          const config=await getRegistrationConfigV76();
          if(config?.enabled)return showEmailVerificationV76(pending,config);
        }catch{}
      }
      return setStatus(st,'Primero tenés que verificar tu correo con el código enviado.','error');
    }
    setStatus(st,friendly(err.message),'error');
  }
};
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
installSwipeNavigationV74({
  root:$('#mainApp'),
  getActiveTab:()=>document.body.dataset.activeTabV101||'home',
  activateTab,
  tabs:['home','ranking','tournaments','play','training','history','profile']
});

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

$('#settingsLogoutButton').onclick=async()=>{stopTrainingTimerV53?.();stopLiveNotificationStream();await stopSessionAccessGuardV76();await signOutUser();session=null;profile=null;ratings=[];showView('welcomeView')};

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
  const rematchResponse=e.target.closest('[data-rematch-response-v745]');
  if(rematchResponse){
    const id=Number(rematchResponse.dataset.id);
    const response=rematchResponse.dataset.rematchResponseV745;
    const status=$('#incomingRematchStatusV745');
    await withActionLockV60(`rematch-response-v745:${id}:${response}`,rematchResponse,async()=>{
      try{
        await respondToChallenge(id,response);
        closeIncomingRematchV745();
        if(response==='accepted')closePostMatchForRematchV744();
        await Promise.all([loadChallenges(),loadMatches(),loadLiveNotifications(),loadActivityCenter()]);
        recoverPageScrollIfIdle();
      }catch(err){
        if(status){status.textContent=friendly(err.message);status.className='v745-rematch-status error'}
        else alert(friendly(err.message));
        throw err;
      }
    },{
      loadingText:response==='accepted'?'Aceptando revancha…':'Declinando…',
      successText:response==='accepted'?'Revancha aceptada ✓':'Revancha declinada'
    }).catch(()=>{});
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
      const confirmation=await confirmMatchResult(matchId);
      if(confirmation?.integrity_hold||confirmation?.integrity_locked){
        await Promise.all([loadMatches(),loadLiveNotifications(),loadActivityCenter()]);
        await loadMyIntegrityStatusV78({show:true});
        return;
      }
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
$('#closePostMatch').onclick=()=>{closeIncomingRematchV745();$('#postMatchModal').classList.add('hidden');pendingPostMatchReviewId=null;clearPendingRematchV744();syncModalScrollLock()};
document.addEventListener('click',e=>{
  if(e.target.closest('[data-close-post-match]')){
    closeIncomingRematchV745();
    $('#postMatchModal').classList.add('hidden');syncModalScrollLock();
    clearPendingRematchV744();
    const reviewId=pendingPostMatchReviewId;
    pendingPostMatchReviewId=null;
    if(reviewId)setTimeout(()=>openReviewModal(reviewId),80);
  }
});
['seasonHistoryModal','matchDetailModal','postMatchModal'].forEach(id=>{
  const m=$('#'+id);if(m)m.addEventListener('click',e=>{if(e.target===m){m.classList.add('hidden');if(id==='postMatchModal'){closeIncomingRematchV745();clearPendingRematchV744()}syncModalScrollLock()}});
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
$('#adminRefreshAutoV77')?.addEventListener('click',loadAdminAutoModerationV77);
$('#adminReprocessAutoV77')?.addEventListener('click',event=>reprocessAdminAutoModerationV77(event.currentTarget));
$$('[data-auto-mode-v77]').forEach(button=>button.addEventListener('click',()=>changeAutoModerationModeV77(button)));
$('#adminAutoModerationCasesV77')?.addEventListener('click',event=>{
  const resolve=event.target.closest('[data-resolve-integrity-hold-v78]');
  if(resolve){resolveIntegrityHoldAdminV78(resolve);return}
  const dismiss=event.target.closest('[data-dismiss-auto-case-v77]');
  if(dismiss)dismissAdminAutoCaseV77(dismiss);
});
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
$('#logoutButton').onclick=async()=>{stopTrainingTimerV53?.();stopLiveNotificationStream();presenceHeartbeatV60?.stop?.();await presenceManagerV35?.stop?.();await stopSessionAccessGuardV76();await signOutUser();session=null;profile=null;ratings=[];showView('welcomeView')};
window.addEventListener('tt-v62-doubles-confirmed',()=>{
  invalidateRivalriesV74();
  Promise.all([refreshCore(),loadRivalriesV74(true)]).catch(err=>console.warn('Refresh dobles V62:',err));
});

window.addEventListener('tt-v75-session-blocked',async event=>{
  const error=event.detail?.error;
  const email=event.detail?.email||session?.user?.email||'';
  stopTrainingTimerV53?.();
  stopLiveNotificationStream();
  presenceHeartbeatV60?.stop?.();
  await presenceManagerV35?.stop?.().catch?.(()=>{});
  session=null;profile=null;ratings=[];
  $$('.modal').forEach(modal=>modal.classList.add('hidden'));
  document.body.classList.remove('modal-open');
  showView('loginView');
  if($('#loginEmail'))$('#loginEmail').value=email;
  if($('#loginPassword'))$('#loginPassword').value='';
  if(!showAccessBlockedV76(error,email,$('#loginStatus'))){
    setStatus($('#loginStatus'),error?.message||'Tu sesión fue cerrada porque la cuenta está suspendida.','error');
  }
});

supabase.auth.onAuthStateChange((event,nextSession)=>{
  if(event==='PASSWORD_RECOVERY'){
    showPasswordRecoveryViewV53(nextSession);
  }
  if(event==='SIGNED_OUT')void stopSessionAccessGuardV76();
});

installErrorCaptureV60();
installRapidClickGuardV60();
setupAdminPanelsV60();
startMatchClocksV59();
initMotionV601();
initRivalriesV74();
initAccessControlV75();
initModerationEmailV76();
setupPwaV573().catch(err=>{recordClientErrorV60(err,'pwa-v60');console.error('PWA V60:',err)});

async function bootApplicationV741(){
  const recoveryHint=new URLSearchParams(window.location.search).get('recovery')==='1';

  document.body.dataset.ttBootStage='session';
  setBootMessageV572('Comprobando sesión…');
  const startupSession=await getSession({timeoutMs:18000});

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
}

(async()=>{
  let finalError=null;
  for(let attempt=0;attempt<2;attempt++){
    try{
      await bootApplicationV741();
      return;
    }catch(error){
      finalError=error;
      console.warn(`P7.4.1 inicio intento ${attempt+1}:`,error);
      if(attempt===0){
        setBootMessageV572('Reconectando con tu cuenta…');
        stopLiveNotificationStream();
        session=null;profile=null;ratings=[];
        await new Promise(resolve=>setTimeout(resolve,700));
      }
    }
  }

  console.error(finalError);
  showView('welcomeView');
  const detail=String(finalError?.message||'Error desconocido')
    .replace(/https?:\/\/\S+/g,'servidor')
    .slice(0,140);
  setStatus(
    $('#globalStatus'),
    `No pudimos completar el inicio después de dos intentos. Detalle: ${detail}`,
    'error'
  );
  closeBootScreenV572();
})();


// TT Rivals 1.0.1 Premium P4 — ayuda contextual de métricas de Inicio.
const METRIC_INFO_V101={
  streak:{icon:'🔥',eyebrow:'RACHA COMPETITIVA',title:'Tu impulso oficial',body:`<p>La racha individual cuenta victorias consecutivas en <strong>ranked y torneos oficiales</strong>. Dobles lleva una racha separada.</p><div class="metric-info-benefit-v101"><strong>Las casuales quedan fuera</strong><span>Una victoria casual no aumenta la racha y una derrota casual tampoco la corta.</span></div><p class="metric-info-note-v101">Solo entran resultados verificados. Este cambio no modifica la fórmula Elo vigente.</p>`},
  'best-streak':{icon:'🏆',eyebrow:'MEJOR RACHA OFICIAL',title:'Tu récord competitivo',body:`<p>Muestra la mayor cantidad de <strong>victorias oficiales consecutivas</strong> que alcanzaste en individual.</p><div class="metric-info-benefit-v101"><strong>Es un récord histórico</strong><span>No baja cuando perdés y nunca se altera por un partido casual. Dobles conserva su propio récord.</span></div>`},
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


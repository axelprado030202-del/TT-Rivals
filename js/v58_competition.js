import {supabase} from './supabase.js';

const INSTALLATION_KEY='tt-rivals-installation-v58';

function makeUuidV58(){
  if(globalThis.crypto?.randomUUID)return globalThis.crypto.randomUUID();
  const b=new Uint8Array(16);globalThis.crypto?.getRandomValues?.(b);
  b[6]=(b[6]&0x0f)|0x40;b[8]=(b[8]&0x3f)|0x80;
  const h=[...b].map(x=>x.toString(16).padStart(2,'0')).join('');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

export function getInstallationIdV58(){
  try{
    let id=localStorage.getItem(INSTALLATION_KEY);
    if(!id){id=makeUuidV58();localStorage.setItem(INSTALLATION_KEY,id)}
    return id;
  }catch{
    if(!globalThis.__ttInstallationV58)globalThis.__ttInstallationV58=makeUuidV58();
    return globalThis.__ttInstallationV58;
  }
}

export async function registerCurrentInstallationV58(){
  const id=getInstallationIdV58();
  const {data,error}=await supabase.rpc('register_installation_v58',{
    p_installation_id:id,
    p_platform:navigator.userAgentData?.platform||navigator.platform||'web',
    p_user_agent:navigator.userAgent||''
  });
  if(error)throw error;return data||{};
}

export async function getMyProtectionV58(){const {data,error}=await supabase.rpc('get_my_protection_v58');if(error)throw error;return data||{points:0,shield_available:false}}
export async function getMyNotificationsV58(limit=40){const {data,error}=await supabase.rpc('get_my_notifications_v58',{p_limit:limit});if(error)throw error;return data||[]}
export async function markNotificationReadV58(id){const {error}=await supabase.rpc('mark_notification_read_v58',{p_notification_id:id});if(error)throw error}
export async function markAllNotificationsReadV58(){const {error}=await supabase.rpc('mark_all_notifications_read_v58');if(error)throw error}

export async function getMatchDisputeV58(matchId){const {data,error}=await supabase.rpc('get_match_dispute_v58',{p_match_id:matchId});if(error)throw error;return data||{}}
export async function searchDisputeArbitersV58(matchId,query=''){const {data,error}=await supabase.rpc('search_dispute_arbiters_v58',{p_match_id:matchId,p_query:query});if(error)throw error;return data||[]}
export async function proposeDisputeArbiterV58(matchId,arbiterId){const {data,error}=await supabase.rpc('propose_dispute_arbiter_v58',{p_match_id:matchId,p_arbiter_id:arbiterId});if(error)throw error;return data}
export async function respondDisputeArbiterV58(matchId,accept){const {error}=await supabase.rpc('respond_dispute_arbiter_v58',{p_match_id:matchId,p_accept:!!accept});if(error)throw error}
export async function declineDisputeAssignmentV58(matchId){const {error}=await supabase.rpc('decline_dispute_assignment_v58',{p_match_id:matchId});if(error)throw error}
export async function requestAdminDisputeV58(matchId){const {error}=await supabase.rpc('request_admin_dispute_v58',{p_match_id:matchId});if(error)throw error}
export async function requestAnnulDisputeV58(matchId){const {data,error}=await supabase.rpc('request_annul_dispute_v58',{p_match_id:matchId});if(error)throw error;return data||{}}
export async function resolveDisputeV58(matchId,sets){const {data,error}=await supabase.rpc('resolve_dispute_v58',{p_match_id:matchId,p_sets:sets});if(error)throw error;return data||{}}
export async function adminListDisputesV58(){const {data,error}=await supabase.rpc('admin_list_disputes_v58');if(error)throw error;return data||[]}

export async function adminListLinkedAccountsV58(){const {data,error}=await supabase.rpc('admin_list_linked_accounts_v58');if(error)throw error;return data||[]}
export async function adminAllowRelatedPairV58(user1,user2,reason=''){const {error}=await supabase.rpc('admin_allow_related_pair_v58',{p_user1:user1,p_user2:user2,p_reason:reason});if(error)throw error}
export async function adminRevokeRelatedPairV58(user1,user2,reason=''){const {error}=await supabase.rpc('admin_revoke_related_pair_v58',{p_user1:user1,p_user2:user2,p_reason:reason});if(error)throw error}

export async function refreshMyTitlesV58(){const {data,error}=await supabase.rpc('refresh_my_titles_v58');if(error)throw error;return data||[]}
export async function getTitlesV58(userId){const {data,error}=await supabase.rpc('get_titles_v58',{p_user_id:userId});if(error)throw error;return data||{equipped:null,items:[]}}
export async function equipTitleV58(titleId){const {error}=await supabase.rpc('equip_title_v58',{p_title_id:titleId||null});if(error)throw error}

export async function submitPlayerReviewV58(matchId,stars,tags=[]){const {data,error}=await supabase.rpc('submit_player_review_v58',{p_match_id:matchId,p_stars:stars,p_tags:tags});if(error)throw error;return data}
export async function getMyReviewTagsV58(matchId){const {data,error}=await supabase.rpc('get_my_review_tags_v58',{p_match_id:matchId});if(error)throw error;return data||[]}
export async function adminListReviewTagsV58(limit=80){const {data,error}=await supabase.rpc('admin_list_review_tags_v58',{p_limit:limit});if(error)throw error;return data||[]}
export async function adminInvalidateReviewTagV58(tagId,reason=''){const {error}=await supabase.rpc('admin_invalidate_review_tag_v58',{p_tag_id:tagId,p_reason:reason});if(error)throw error}

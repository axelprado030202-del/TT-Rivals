import {supabase} from './supabase.js';

export async function getAdminAutoModerationV77(limit=50){
  const {data,error}=await supabase.rpc('admin_get_auto_moderation_v77',{
    p_limit:Math.max(1,Math.min(200,Number(limit)||50))
  });
  if(error)throw error;
  return data||{config:{mode:'observe'},summary:{},cases:[]};
}

export async function setAutoModerationModeV77(mode){
  const clean=String(mode||'').toLowerCase();
  const {data,error}=await supabase.rpc('admin_set_auto_moderation_mode_v77',{
    p_mode:clean,
    p_confirmation:clean==='enforce'?'ACTIVAR':null
  });
  if(error)throw error;
  return data||{};
}

export async function dismissAutoModerationCaseV77(caseId,note=null){
  const {data,error}=await supabase.rpc('admin_dismiss_auto_moderation_case_v77',{
    p_case_id:Number(caseId),
    p_note:note||null
  });
  if(error)throw error;
  return data||{};
}

export async function reprocessAutoModerationV77(days=7,limit=500){
  const {data,error}=await supabase.rpc('admin_reprocess_auto_moderation_v77',{
    p_days:Math.max(1,Math.min(14,Number(days)||7)),
    p_limit:Math.max(1,Math.min(1000,Number(limit)||500))
  });
  if(error)throw error;
  return data||{};
}

export async function getMyIntegrityStatusV78(){
  const {data,error}=await supabase.rpc('get_my_integrity_status_v78');
  if(error)throw error;
  return data||{active:false,pending_holds:[],notifications:[]};
}

export async function submitIntegrityAppealV78(message){
  const {data,error}=await supabase.rpc('submit_integrity_appeal_v78',{
    p_message:String(message||'').trim()
  });
  if(error)throw error;
  return data||{};
}

export async function resolveIntegrityHoldV78(matchId,action,note=null){
  const {data,error}=await supabase.rpc('admin_resolve_integrity_hold_v78',{
    p_match_id:Number(matchId),
    p_action:String(action||''),
    p_note:note||null
  });
  if(error)throw error;
  return data||{};
}


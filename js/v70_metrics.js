import { supabase } from './supabase.js';

export async function getAdminProductMetricsV70(days=7){
  const clean=Math.max(1,Math.min(90,Number(days)||7));
  const {data,error}=await supabase.rpc('admin_get_product_metrics_v70',{p_days:clean});
  if(error)throw error;
  return data||{};
}

export async function recordProductEventV70(eventName,{matchId=null,challengeId=null,opponentId=null,metadata={}}={}){
  const clean=String(eventName||'').trim().toLowerCase();
  if(!clean)return false;
  const {data,error}=await supabase.rpc('record_client_product_event_v70',{
    p_event_name:clean,
    p_match_id:matchId===null?null:Number(matchId),
    p_challenge_id:challengeId===null?null:Number(challengeId),
    p_opponent_id:opponentId||null,
    p_metadata:metadata&&typeof metadata==='object'?metadata:{}
  });
  if(error)throw error;
  return data===true;
}

import { supabase } from './supabase.js';
import {createRequestCacheV60} from './v60_runtime.js?v=1.0.1-p7.4';

const matchesCacheV60=createRequestCacheV60(30000);

export async function getMyMatches(userId,{force=false}={}){
  return matchesCacheV60.run(userId,async()=>{
    const {data:rows,error}=await supabase.from('matches').select('*').or(`player1_id.eq.${userId},player2_id.eq.${userId}`).order('created_at',{ascending:false});
    if(error)throw error;
    if(!rows?.length)return[];
    const ids=[...new Set(rows.flatMap(r=>[r.player1_id,r.player2_id]))];
    const {data:profiles,error:e2}=await supabase.from('profiles').select('id,username,first_name,last_name,profile_photo_url').in('id',ids);
    if(e2)throw e2;
    const map=new Map((profiles||[]).map(p=>[p.id,p]));
    return rows.map(r=>({...r,player1:map.get(r.player1_id),player2:map.get(r.player2_id)}));
  },{force});
}

export function invalidateMatchesCacheV60(userId){matchesCacheV60.clear(userId)}

export async function submitMatchResult(matchId,sets){
  const {data,error}=await supabase.rpc('submit_match_result',{p_match_id:matchId,p_sets:sets});
  if(error)throw error; matchesCacheV60.clear(); return data;
}

export async function confirmMatchResult(matchId){
  const {data,error}=await supabase.rpc('confirm_match_result',{p_match_id:matchId});
  if(error)throw error; matchesCacheV60.clear(); return data;
}

export async function disputeMatchResult(matchId){
  const {data,error}=await supabase.rpc('dispute_match_result',{p_match_id:matchId});
  if(error)throw error; matchesCacheV60.clear(); return data;
}


// V59 — duración e integridad competitiva
export async function getMyDurationStatsV59(){
  const {data,error}=await supabase.rpc('get_my_duration_stats_v59');
  if(error)throw error;
  return data||{};
}

export async function adminListMatchIntegrityV59(limit=100){
  const {data,error}=await supabase.rpc('admin_list_match_integrity_v59',{p_limit:limit});
  if(error)throw error;
  return data||[];
}

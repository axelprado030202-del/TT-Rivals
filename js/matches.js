import { supabase } from './supabase.js';

export async function getMyMatches(userId){
  const {data:rows,error}=await supabase.from('matches').select('*').or(`player1_id.eq.${userId},player2_id.eq.${userId}`).order('created_at',{ascending:false});
  if(error)throw error;
  if(!rows?.length)return[];
  const ids=[...new Set(rows.flatMap(r=>[r.player1_id,r.player2_id]))];
  const {data:profiles,error:e2}=await supabase.from('profiles').select('id,username,first_name,last_name,profile_photo_url').in('id',ids);
  if(e2)throw e2;
  const map=new Map((profiles||[]).map(p=>[p.id,p]));
  return rows.map(r=>({...r,player1:map.get(r.player1_id),player2:map.get(r.player2_id)}));
}

export async function submitMatchResult(matchId,sets){
  const {data,error}=await supabase.rpc('submit_match_result',{p_match_id:matchId,p_sets:sets});
  if(error)throw error; return data;
}

export async function confirmMatchResult(matchId){
  const {data,error}=await supabase.rpc('confirm_match_result',{p_match_id:matchId});
  if(error)throw error; return data;
}

export async function disputeMatchResult(matchId){
  const {data,error}=await supabase.rpc('dispute_match_result',{p_match_id:matchId});
  if(error)throw error; return data;
}

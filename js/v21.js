import {supabase} from './supabase.js';

export async function getPlayerTitles(userId){
  const {data,error}=await supabase.rpc('get_player_titles',{p_user_id:userId});
  if(error)throw error; return data||{equipped:null,items:[]};
}
export async function equipCompetitiveTitle(titleId){
  const {error}=await supabase.rpc('equip_competitive_title',{p_title_id:titleId||null});
  if(error)throw error;
}
export async function getTournamentHistory(limit=50){
  const {data,error}=await supabase.rpc('get_tournament_history_v21',{p_limit:limit});
  if(error)throw error; return data||[];
}
export async function getComparativeStats(){
  const {data,error}=await supabase.rpc('get_comparative_stats_v21');
  if(error)throw error; return data||{};
}
export async function getPostMatchSummary(matchId){
  const {data,error}=await supabase.rpc('get_post_match_summary_v21',{p_match_id:matchId});
  if(error)throw error; return data||{};
}

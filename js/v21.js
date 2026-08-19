import {supabase} from './supabase.js';
import {getTitlesV58,equipTitleV58,refreshMyTitlesV58} from './v58_competition.js';

export async function getPlayerTitles(userId){
  const [{data:legacy,error:e1},v58]=await Promise.all([
    supabase.rpc('get_player_titles',{p_user_id:userId}),
    getTitlesV58(userId).catch(()=>({equipped:null,items:[]}))
  ]);
  if(e1)throw e1;
  const old=legacy||{equipped:null,items:[]};
  const oldItems=(old.items||[]).map(x=>({...x,source:'legacy',progress:x.unlocked?100:0,progress_label:x.unlocked?'Desbloqueado':'Hito histórico'}));
  const newItems=(v58.items||[]).map(x=>({...x,source:'v58'}));
  return {
    equipped:v58.equipped||old.equipped||null,
    items:[...newItems,...oldItems]
  };
}

export async function refreshOwnCompetitiveTitlesV58(){
  return refreshMyTitlesV58();
}

export async function equipCompetitiveTitle(titleId){
  const id=titleId||null;
  if(id?.startsWith('v58_')){
    const {error}=await supabase.rpc('equip_competitive_title',{p_title_id:null});
    if(error)throw error;
    await equipTitleV58(id);
    return;
  }
  await equipTitleV58(null).catch(()=>{});
  const {error}=await supabase.rpc('equip_competitive_title',{p_title_id:id});
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

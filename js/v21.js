import {supabase} from './supabase.js';
import {getTitlesV58,equipTitleV58,refreshMyTitlesV58} from './v58_competition.js';

export async function getPlayerTitles(userId){
  const [{data:legacy,error:e1},v58,v100Progress]=await Promise.all([
    supabase.rpc('get_player_titles',{p_user_id:userId}),
    getTitlesV58(userId).catch(()=>({equipped:null,items:[]})),
    supabase.rpc('get_title_progress_v100',{p_user_id:userId}).then(({data,error})=>error?[]:(data||[])).catch(()=>[])
  ]);
  if(e1)throw e1;
  const old=legacy||{equipped:null,items:[]};
  const oldItems=(old.items||[]).map(x=>({...x,source:'legacy',progress:x.unlocked?100:0,progress_label:x.unlocked?'Desbloqueado':'Hito histórico'}));
  const progressMap=new Map((v100Progress||[]).map(x=>[x.title_id,x]));
  const newItems=(v58.items||[]).map(x=>{
    const p=progressMap.get(x.id);
    return p?{...x,...p,id:x.id,source:'v100'}:{...x,source:'v58'};
  });
  return {
    equipped:v58.equipped||old.equipped||null,
    items:[...newItems,...oldItems]
  };
}

export async function refreshOwnCompetitiveTitlesV58(){
  const [v58,v100]=await Promise.all([
    refreshMyTitlesV58(),
    supabase.rpc('refresh_my_titles_v100').then(({data,error})=>error?null:data).catch(()=>null)
  ]);
  return {v58,v100};
}

export async function equipCompetitiveTitle(titleId){
  const id=titleId||null;
  if(id?.startsWith('v58_')||id?.startsWith('v100_')){
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
  const [{data,error},{data:streakData,error:streakError}]=await Promise.all([
    supabase.rpc('get_post_match_summary_v21',{p_match_id:matchId}),
    supabase.rpc('get_match_streak_boost_v101',{p_match_id:matchId}).catch(()=>({data:null,error:null}))
  ]);
  if(error)throw error;
  return {...(data||{}),...(!streakError&&streakData?{
    streak_boost_multiplier:Number(streakData.applied_multiplier||1),
    streak_multiplier:Number(streakData.streak_multiplier||1),
    streak_breaker_multiplier:Number(streakData.breaker_multiplier||1),
    winner_streak_before:Number(streakData.winner_streak_before||0),
    winner_streak_after:Number(streakData.winner_streak_after||0),
    loser_streak_before:Number(streakData.loser_streak_before||0),
    base_winner_gain:Number(streakData.base_winner_gain||0),
    boosted_winner_gain:Number(streakData.boosted_winner_gain||0)
  }:{})};
}

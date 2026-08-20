import { supabase } from './supabase.js';

export async function getV28Dashboard(){
  const [{data,error},{data:rewardData,error:rewardError}]=await Promise.all([
    supabase.rpc('get_v28_competitive_dashboard'),
    supabase.rpc('get_my_season_reward_summary_v63').catch(()=>({data:null,error:null}))
  ]);
  if(error)throw error;
  const base={...(data||{})};
  if(!rewardError&&rewardData){
    const bonus=Math.max(0,Number(rewardData.xp_bonus)||0);
    const goal=Math.max(1,Number(base.level_goal)||500);
    let level=Math.max(1,Number(base.level)||1);
    let progress=Math.max(0,Number(base.level_progress)||0)+bonus;
    while(progress>=goal){progress-=goal;level+=1}
    base.level=level;
    base.level_progress=progress;
    base.xp=(Math.max(0,Number(base.xp)||0)+bonus);
    base.season_xp_bonus=bonus;
    base.video_lab_tickets=Math.max(0,Number(rewardData.tickets)||0);
  }
  return base;
}

export async function getV28LastSeasonRecap(){
  const {data,error}=await supabase.rpc('get_v28_last_season_recap');
  if(error)throw error;
  return data||{};
}

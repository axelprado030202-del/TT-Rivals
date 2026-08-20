import { supabase } from './supabase.js';

export async function getV28Dashboard(){
  const [baseRes,rewardRes,missionRes]=await Promise.all([
    supabase.rpc('get_v28_competitive_dashboard'),
    supabase.rpc('get_my_season_reward_summary_v63').catch(()=>({data:null,error:null})),
    supabase.rpc('get_my_daily_missions_v101').catch(()=>({data:null,error:null}))
  ]);
  if(baseRes.error)throw baseRes.error;

  const base={...(baseRes.data||{})};
  const seasonBonus=!rewardRes.error&&rewardRes.data?Math.max(0,Number(rewardRes.data.xp_bonus)||0):0;
  const missionBonus=!missionRes.error&&missionRes.data?Math.max(0,Number(missionRes.data.xp_total)||0):0;
  const bonus=seasonBonus+missionBonus;
  const goal=Math.max(1,Number(base.level_goal)||500);
  let level=Math.max(1,Number(base.level)||1);
  let progress=Math.max(0,Number(base.level_progress)||0)+bonus;
  while(progress>=goal){progress-=goal;level+=1}

  base.level=level;
  base.level_progress=progress;
  base.xp=Math.max(0,Number(base.xp)||0)+bonus;
  base.season_xp_bonus=seasonBonus;
  base.daily_mission_xp_bonus=missionBonus;
  base.video_lab_tickets=!rewardRes.error&&rewardRes.data?Math.max(0,Number(rewardRes.data.tickets)||0):0;

  if(!missionRes.error&&missionRes.data){
    base.daily_missions_v101=missionRes.data;
    // V60 usa base.missions para detectar recompensas recién completadas.
    base.missions=missionRes.data.missions||[];
  }
  return base;
}

export async function getV28LastSeasonRecap(){
  const {data,error}=await supabase.rpc('get_v28_last_season_recap');
  if(error)throw error;
  return data||{};
}

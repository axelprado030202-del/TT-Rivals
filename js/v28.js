import { supabase } from './supabase.js';

async function safeRpc(name,args=undefined){
  try{
    const query=args===undefined?supabase.rpc(name):supabase.rpc(name,args);
    const {data,error}=await query;
    if(error)return {data:null,error};
    return {data,error:null};
  }catch(error){
    return {data:null,error};
  }
}

export async function getDailyMissionsV101(){
  const {data,error}=await safeRpc('get_my_daily_missions_v101');
  if(error)throw error;
  return data||null;
}

export async function getStreakStatusV101(){
  const {data,error}=await safeRpc('get_my_streak_status_v101');
  if(error)throw error;
  return data||null;
}

export async function getV28Dashboard(){
  const [baseRes,rewardRes,missionRes]=await Promise.all([
    safeRpc('get_v28_competitive_dashboard'),
    safeRpc('get_my_season_reward_summary_v63'),
    safeRpc('get_my_daily_missions_v101')
  ]);

  // 1.0.1 Premium: cada módulo es independiente. Un RPC viejo nunca debe
  // impedir que Inicio o Misiones se rendericen.
  if(baseRes.error)console.warn('V28 dashboard base:',baseRes.error);
  if(rewardRes.error)console.warn('V63 season reward summary:',rewardRes.error);
  if(missionRes.error)console.warn('V101 daily missions:',missionRes.error);

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
  base.level_goal=goal;
  base.xp=Math.max(0,Number(base.xp)||0)+bonus;
  base.season_xp_bonus=seasonBonus;
  base.daily_mission_xp_bonus=missionBonus;
  base.video_lab_tickets=!rewardRes.error&&rewardRes.data?Math.max(0,Number(rewardRes.data.tickets)||0):0;
  base.dashboard_base_error=baseRes.error?.message||null;
  base.daily_missions_error=missionRes.error?.message||null;

  if(!missionRes.error&&missionRes.data){
    base.daily_missions_v101=missionRes.data;
    base.missions=missionRes.data.missions||[];
  }else{
    base.daily_missions_v101=null;
    base.missions=[];
  }
  return base;
}

export async function getV28LastSeasonRecap(){
  const {data,error}=await safeRpc('get_v28_last_season_recap');
  if(error)throw error;
  return data||{};
}

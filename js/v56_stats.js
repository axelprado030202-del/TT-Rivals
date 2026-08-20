import {supabase} from './supabase.js';

export async function getMyStatsV56(){
  const {data,error}=await supabase.rpc('get_my_stats_v56');
  if(error)throw error;
  return data||{};
}

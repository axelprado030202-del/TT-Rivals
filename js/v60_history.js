import {supabase} from './supabase.js';

export async function getHistorySeasonsV60(){
  const {data,error}=await supabase.rpc('get_history_seasons_v60');
  if(error)throw error;
  return data||[];
}

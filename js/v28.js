
import { supabase } from './supabase.js';

export async function getV28Dashboard(){
  const {data,error}=await supabase.rpc('get_v28_competitive_dashboard');
  if(error)throw error;
  return data||{};
}

export async function getV28LastSeasonRecap(){
  const {data,error}=await supabase.rpc('get_v28_last_season_recap');
  if(error)throw error;
  return data||{};
}

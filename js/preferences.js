import {supabase} from './supabase.js';

export async function getPreferences(){
  const {data,error}=await supabase.rpc('ensure_user_preferences');
  if(error)throw error;
  let privacy={};
  try{
    const {data:auth}=await supabase.auth.getUser();
    const uid=auth?.user?.id;
    if(uid){
      const {data:row}=await supabase.from('user_preferences').select('show_activity_status').eq('user_id',uid).maybeSingle();
      if(row)privacy=row;
    }
  }catch{}
  return {...(data||{}),...privacy};
}

export async function updatePreferences(userId,patch){
  const payload={...patch,user_id:userId,updated_at:new Date().toISOString()};
  const {data,error}=await supabase.from('user_preferences').upsert(payload,{onConflict:'user_id'}).select().single();
  if(error)throw error;
  return data;
}

export async function getFrames(userId){
  await supabase.rpc('sync_rank_frame_unlocks',{p_user_id:userId});
  const [{data:catalog,error:e1},{data:unlocks,error:e2},{data:cosmetics,error:e3}]=await Promise.all([
    supabase.from('profile_frames').select('*').order('sort_order'),
    supabase.from('player_frame_unlocks').select('*').eq('user_id',userId),
    supabase.from('player_cosmetics').select('*').eq('user_id',userId).maybeSingle()
  ]);
  if(e1)throw e1;if(e2)throw e2;if(e3)throw e3;
  return {catalog:catalog||[],unlocks:unlocks||[],equipped:cosmetics?.equipped_frame_id||null};
}

export async function equipFrame(frameId){
  const {error}=await supabase.rpc('equip_profile_frame',{p_frame_id:frameId||'none'});
  if(error)throw error;
}

export async function getSeasonDashboard(){
  const {data,error}=await supabase.rpc('get_season_dashboard');
  if(error)throw error;
  return data;
}

export async function getSeasonHistory(limit=12){
  const {data,error}=await supabase.rpc('get_season_history',{p_limit:limit});
  if(error)throw error;
  return data||[];
}

export async function getRecommendedRivals(limit=6){
  const {data,error}=await supabase.rpc('get_recommended_rivals',{p_limit:limit});
  if(error)throw error;
  return data||[];
}

export async function getPlayerPercentiles(){
  const {data,error}=await supabase.rpc('get_player_percentiles');
  if(error)throw error;
  return data||{};
}

export async function getPublicProfilePreferences(userId){
  const {data,error}=await supabase.rpc('get_public_profile_preferences',{p_user_id:userId});
  if(error)throw error;
  return data||{};
}

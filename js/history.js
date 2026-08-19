import {supabase} from './supabase.js';

export async function getSeasonChampions(limit=10){
  const {data,error}=await supabase.rpc('get_season_champions',{p_limit:limit});
  if(error)throw error;
  return data||[];
}

export async function getPublicPlayerSeasons(userId){
  const {data,error}=await supabase.rpc('get_public_player_seasons',{p_user_id:userId});
  if(error)throw error;
  return data||{};
}

export async function getH2HAdvanced(opponentId){
  const {data,error}=await supabase.rpc('get_h2h_v20',{p_opponent_id:opponentId});
  if(error)throw error;
  return data||{};
}

export async function getPlayerRecords(userId){
  const {data,error}=await supabase.rpc('get_player_records_v20',{p_user_id:userId});
  if(error)throw error;
  return data||{};
}

export async function getTournamentSummary(tournamentId){
  const {data,error}=await supabase.rpc('get_tournament_summary_v20',{p_tournament_id:tournamentId});
  if(error)throw error;
  return data||{};
}

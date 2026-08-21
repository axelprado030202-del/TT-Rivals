import {supabase} from './supabase.js';
import {getVisibleUserIdSetV76,filterVisibleRowsV76} from './v76_visibility.js';

export async function getSeasonChampions(limit=10){
  const {data,error}=await supabase.rpc('get_season_champions',{p_limit:limit});
  if(error)throw error;
  return filterVisibleRowsV76(data||[],['user_id','champion_id','player_id']);
}

export async function getPublicPlayerSeasons(userId){
  const visible=await getVisibleUserIdSetV76([userId]);
  if(!visible.has(String(userId)))throw new Error('Este perfil no está disponible.');
  const {data,error}=await supabase.rpc('get_public_player_seasons',{p_user_id:userId});
  if(error)throw error;
  return data||{};
}

export async function getH2HAdvanced(opponentId){
  const visible=await getVisibleUserIdSetV76([opponentId]);
  if(!visible.has(String(opponentId)))throw new Error('Este perfil no está disponible.');
  const {data,error}=await supabase.rpc('get_h2h_v20',{p_opponent_id:opponentId});
  if(error)throw error;
  return data||{};
}

export async function getPlayerRecords(userId){
  const visible=await getVisibleUserIdSetV76([userId]);
  if(!visible.has(String(userId)))throw new Error('Este perfil no está disponible.');
  const {data,error}=await supabase.rpc('get_player_records_v20',{p_user_id:userId});
  if(error)throw error;
  return data||{};
}

export async function getTournamentSummary(tournamentId){
  const {data,error}=await supabase.rpc('get_tournament_summary_v20',{p_tournament_id:tournamentId});
  if(error)throw error;
  return data||{};
}

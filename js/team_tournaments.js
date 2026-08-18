
import {supabase} from './supabase.js';

export async function createTeamTournamentV32(payload){
  const {data,error}=await supabase.rpc('create_team_tournament_v32',{
    p_home_name:payload.homeName,
    p_away_name:payload.awayName,
    p_home_users:payload.homeUsers,
    p_away_users:payload.awayUsers,
    p_home_doubles:payload.homeDoubles,
    p_away_doubles:payload.awayDoubles
  });
  if(error)throw error;
  return data;
}

export async function getTeamTournamentV32(id){
  const {data,error}=await supabase.rpc('get_team_tournament_v32',{p_tournament_id:Number(id)});
  if(error)throw error;
  return data;
}

export async function listMyTeamTournamentsV32(){
  const {data,error}=await supabase.rpc('list_my_team_tournaments_v32');
  if(error)throw error;
  return data||[];
}

export async function submitTeamTournamentMatchResultV32(matchId,sets){
  const {data,error}=await supabase.rpc('submit_team_tournament_match_result_v32',{
    p_match_id:Number(matchId),
    p_sets:sets
  });
  if(error)throw error;
  return data;
}

export async function createTeamTiebreakV32(tournamentId,homeUsers,awayUsers){
  const {data,error}=await supabase.rpc('create_team_tiebreak_v32',{
    p_tournament_id:Number(tournamentId),
    p_home_user1:homeUsers[0],
    p_home_user2:homeUsers[1],
    p_away_user1:awayUsers[0],
    p_away_user2:awayUsers[1]
  });
  if(error)throw error;
  return data;
}

export async function finalizeTeamTournamentDrawV32(tournamentId){
  const {error}=await supabase.rpc('finalize_team_tournament_draw_v32',{
    p_tournament_id:Number(tournamentId)
  });
  if(error)throw error;
}


export async function finalizeTeamTournamentV33(tournamentId){
  const {data,error}=await supabase.rpc('finalize_team_tournament_v33',{
    p_tournament_id:Number(tournamentId)
  });
  if(error)throw error;
  return data;
}

export async function listMyTeamTournamentHistoryV33(){
  const {data,error}=await supabase.rpc('list_my_team_tournament_history_v33');
  if(error)throw error;
  return data||[];
}

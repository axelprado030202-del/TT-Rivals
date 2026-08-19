import { supabase } from './supabase.js';

export async function createTournamentV8(config) {
  const { data, error } = await supabase.rpc('create_tournament_v8', {
    p_name: config.name,
    p_modality: config.modality,
    p_preset: config.preset,
    p_start_stage: config.startStage,
    p_after_groups_stage: config.afterGroupsStage || null,
    p_group_count: config.groupCount || null,
    p_qualifiers_per_group: config.qualifiersPerGroup || null,
    p_stage_sets: config.stageSets || {},
    p_selected_users: config.selectedUsers
  });
  if (error) throw error;
  return data;
}

export async function getTournamentsV8() {
  const { data, error } = await supabase
    .from('tournaments_v8')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getTournamentEntriesV8(tournamentId) {
  const { data, error } = await supabase
    .from('tournament_entries_v8')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('seed_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getTournamentMembersV8(tournamentId) {
  const { data, error } = await supabase
    .from('tournament_entry_members_v8')
    .select('entry_id,user_id')
    .eq('tournament_id', tournamentId);
  if (error) throw error;

  const ids = [...new Set((data || []).map(x => x.user_id))];
  if (!ids.length) return [];

  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id,username,first_name,last_name,profile_photo_url')
    .in('id', ids);
  if (pError) throw pError;

  const map = new Map((profiles || []).map(p => [p.id, p]));
  return (data || []).map(x => ({ ...x, profile: map.get(x.user_id) }));
}

export async function getTournamentGamesV8(tournamentId) {
  const { data, error } = await supabase
    .from('tournament_games_v8')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('stage_order', { ascending: true })
    .order('round_index', { ascending: true })
    .order('match_index', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getTournamentStandingsV8(tournamentId) {
  const { data, error } = await supabase.rpc('get_tournament_standings_v8', {
    p_tournament_id: tournamentId
  });
  if (error) throw error;
  return data || [];
}

export async function submitTournamentGameResultV8(gameId, sets) {
  const { data, error } = await supabase.rpc('submit_tournament_game_result_v8', {
    p_game_id: gameId,
    p_sets: sets
  });
  if (error) throw error;
  return data;
}

export async function closeGroupStageV8(tournamentId) {
  const { data, error } = await supabase.rpc('close_group_stage_v8', {
    p_tournament_id: tournamentId
  });
  if (error) throw error;
  return data;
}

export async function finalizeTournamentV8(tournamentId) {
  const { data, error } = await supabase.rpc('finalize_tournament_v8', {
    p_tournament_id: tournamentId
  });
  if (error) throw error;
  return data;
}

export async function searchTournamentUsersV8(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id,username,first_name,last_name')
    .limit(100);
  if (error) throw error;

  return (data || []).filter(p =>
    p.username?.toLowerCase().includes(q) ||
    p.first_name?.toLowerCase().includes(q) ||
    p.last_name?.toLowerCase().includes(q) ||
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(q)
  ).slice(0, 20);
}


export async function getTournamentParticipantProfilesV8(tournamentId){
  const members=await getTournamentMembersV8(tournamentId);
  const unique=new Map();
  members.forEach(m=>{if(m.profile)unique.set(m.profile.id,m.profile)});
  return [...unique.values()];
}


// ============================================================
// V30 — Torneos sociales, inscripciones y grupos automáticos
// ============================================================

export async function createTournamentV30(config){
  const {data,error}=await supabase.rpc('create_tournament_v30',{
    p_name:config.name,
    p_modality:config.modality,
    p_preset:config.preset,
    p_start_stage:config.startStage,
    p_after_groups_stage:config.afterGroupsStage||null,
    p_qualifiers_per_group:config.qualifiersPerGroup||null,
    p_stage_sets:config.stageSets||{},
    p_max_players:config.maxPlayers,
    p_visibility:config.visibility||'public',
    p_access_code:config.accessCode||null,
    p_host_plays:Boolean(config.hostPlays),
    p_initial_users:config.selectedUsers||[]
  });
  if(error)throw error;
  return data;
}

export async function getMyTournamentHistoryV30(){
  const {data,error}=await supabase.rpc('get_my_tournament_history_v30');
  if(error)throw error;
  return data||[];
}

export async function searchActiveTournamentsV30(search=''){
  const {data,error}=await supabase.rpc('search_active_tournaments_v30',{
    p_search:search||''
  });
  if(error)throw error;
  return data||[];
}

export async function joinTournamentV30(tournamentId,accessCode=null){
  const {data,error}=await supabase.rpc('join_tournament_v30',{
    p_tournament_id:Number(tournamentId),
    p_access_code:accessCode||null
  });
  if(error)throw error;
  return data;
}

export async function leaveTournamentV30(tournamentId){
  const {error}=await supabase.rpc('leave_tournament_v30',{
    p_tournament_id:Number(tournamentId)
  });
  if(error)throw error;
}

export async function startTournamentV30(tournamentId){
  const {data,error}=await supabase.rpc('start_tournament_v30',{
    p_tournament_id:Number(tournamentId)
  });
  if(error)throw error;
  return data;
}

export async function getTournamentLobbyV30(tournamentId){
  const {data,error}=await supabase.rpc('get_tournament_lobby_v30',{
    p_tournament_id:Number(tournamentId)
  });
  if(error)throw error;
  return data||{};
}


export async function getTournamentStandingsV31(tournamentId){
  const {data,error}=await supabase.rpc('t31_group_standings',{
    p_tournament_id:Number(tournamentId)
  });
  if(error)throw error;
  return data||[];
}

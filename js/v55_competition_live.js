import {supabase} from './supabase.js';

/*
  TT RIVALS V55 — SINCRONIZACIÓN COMPETITIVA CENTRAL

  Realtime inmediato:
  - desafíos: ambos lados (envía / recibe)
  - partidos 1vs1
  - Elo / historial de Elo
  - valoraciones
  - torneos 1vs1 / 2vs2
  - torneos por equipos

  Además incluye polling de respaldo mientras la app está visible.
  Si Realtime se desconecta temporalmente, el estado termina convergiendo
  igualmente sin que el usuario tenga que recargar la página.
*/

export function createCompetitionLiveSyncV55({
  userId,
  onChallengeChange,
  onMatchChange,
  onRatingChange,
  onReviewChange,
  onTournamentChange,
  onTeamTournamentChange,
  onFallbackPoll,
  pollMs=5000
}={}){
  const uid=String(userId||'');
  let channels=[];
  let pollTimer=null;
  let visibilityHandler=null;
  let started=false;

  const token=()=>`${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

  function keep(channel){
    channels.push(channel);
    return channel;
  }

  function subscribeFiltered(table,column,callback){
    const ch=supabase
      .channel(`v55-${table}-${column}-${uid}-${token()}`)
      .on('postgres_changes',{
        event:'*',
        schema:'public',
        table,
        filter:`${column}=eq.${uid}`
      },payload=>callback?.(payload))
      .subscribe();
    keep(ch);
  }

  function subscribeTable(table,callback){
    const ch=supabase
      .channel(`v55-${table}-${token()}`)
      .on('postgres_changes',{
        event:'*',
        schema:'public',
        table
      },payload=>callback?.(payload))
      .subscribe();
    keep(ch);
  }

  function runPoll(){
    if(document.visibilityState==='hidden')return;
    Promise.resolve(onFallbackPoll?.()).catch(err=>{
      console.warn('V55 polling competitivo:',err);
    });
  }

  function start(){
    if(started||!uid)return;
    started=true;

    // DESAFÍOS: el bug anterior escuchaba solamente challenged_id.
    // Ahora ambos participantes reciben cualquier cambio.
    subscribeFiltered('challenges','challenger_id',onChallengeChange);
    subscribeFiltered('challenges','challenged_id',onChallengeChange);

    // PARTIDOS 1vs1: INSERT + UPDATE + DELETE para ambos participantes.
    subscribeFiltered('matches','player1_id',onMatchChange);
    subscribeFiltered('matches','player2_id',onMatchChange);

    // Elo propio. Fundamental para torneos y cualquier proceso que modifique rating.
    subscribeFiltered('ratings','user_id',onRatingChange);
    subscribeFiltered('rating_history','user_id',onRatingChange);

    // Valoraciones: refresca tanto al autor como a quien la recibe.
    subscribeFiltered('player_reviews','reviewer_id',onReviewChange);
    subscribeFiltered('player_reviews','reviewed_id',onReviewChange);

    // Torneos individuales y dobles.
    [
      'tournaments_v8',
      'tournament_entries_v8',
      'tournament_entry_members_v8',
      'tournament_games_v8'
    ].forEach(table=>subscribeTable(table,onTournamentChange));

    // Torneos por equipos.
    [
      'team_tournaments_v32',
      'team_tournament_players_v32',
      'team_tournament_matches_v32'
    ].forEach(table=>subscribeTable(table,onTeamTournamentChange));

    pollTimer=setInterval(runPoll,Math.max(2500,Number(pollMs)||5000));

    visibilityHandler=()=>{
      if(document.visibilityState==='visible')runPoll();
    };
    document.addEventListener('visibilitychange',visibilityHandler);
  }

  async function stop(){
    started=false;

    if(pollTimer){
      clearInterval(pollTimer);
      pollTimer=null;
    }

    if(visibilityHandler){
      document.removeEventListener('visibilitychange',visibilityHandler);
      visibilityHandler=null;
    }

    const pending=channels;
    channels=[];
    for(const channel of pending){
      try{await supabase.removeChannel(channel)}catch{}
    }
  }

  return {start,stop,runPoll};
}

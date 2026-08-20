import {supabase} from './supabase.js';

/*
  TT RIVALS P7.4 — SINCRONIZACIÓN COMPETITIVA EFICIENTE
  Tres canales compartidos reemplazan decenas de canales independientes.
  El polling existe únicamente mientras Realtime está desconectado.
*/

export function createCompetitionLiveSyncV55({
  userId,
  onChallengeChange,
  onMatchChange,
  onRatingChange,
  onReviewChange,
  onTournamentChange,
  onTeamTournamentChange,
  onV58Change,
  onFallbackPoll,
  pollMs=15000
}={}){
  const uid=String(userId||'');
  const channels=[];
  const statuses=new Map();
  let pollTimer=null;
  let visibilityHandler=null;
  let started=false;

  const token=()=>`${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

  function runPoll(){
    if(document.visibilityState==='hidden')return;
    Promise.resolve(onFallbackPoll?.()).catch(err=>console.warn('P7.4 polling de respaldo:',err));
  }

  function startFallback(){
    if(!started||pollTimer)return;
    runPoll();
    pollTimer=setInterval(runPoll,Math.max(10000,Number(pollMs)||15000));
    document.body.dataset.realtimeV74='fallback';
  }

  function stopFallback(){
    if(pollTimer){clearInterval(pollTimer);pollTimer=null}
    if(started)document.body.dataset.realtimeV74='connected';
  }

  function handleStatus(name,status){
    if(!started)return;
    statuses.set(name,status);
    if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){
      startFallback();
      return;
    }
    const allConnected=channels.length>0&&channels.every(item=>statuses.get(item.name)==='SUBSCRIBED');
    if(allConnected)stopFallback();
  }

  function createChannel(name,specs){
    let channel=supabase.channel(`v74-${name}-${uid}-${token()}`);
    for(const spec of specs){
      const filter=spec.column?`${spec.column}=eq.${uid}`:undefined;
      const config={event:'*',schema:'public',table:spec.table};
      if(filter)config.filter=filter;
      channel=channel.on('postgres_changes',config,payload=>spec.callback?.(payload));
    }
    const item={name,channel};
    channels.push(item);
    channel.subscribe(status=>handleStatus(name,status));
  }

  function start(){
    if(started||!uid)return;
    started=true;
    document.body.dataset.realtimeV74='connecting';

    createChannel('competition',[
      {table:'challenges',column:'challenger_id',callback:onChallengeChange},
      {table:'challenges',column:'challenged_id',callback:onChallengeChange},
      {table:'matches',column:'player1_id',callback:onMatchChange},
      {table:'matches',column:'player2_id',callback:onMatchChange},
      {table:'ratings',column:'user_id',callback:onRatingChange},
      {table:'rating_history',column:'user_id',callback:onRatingChange},
      {table:'player_reviews',column:'reviewer_id',callback:onReviewChange},
      {table:'player_reviews',column:'reviewed_id',callback:onReviewChange}
    ]);

    createChannel('tournaments',[
      {table:'tournaments_v8',callback:onTournamentChange},
      {table:'tournament_entries_v8',callback:onTournamentChange},
      {table:'tournament_entry_members_v8',callback:onTournamentChange},
      {table:'tournament_games_v8',callback:onTournamentChange},
      {table:'team_tournaments_v32',callback:onTeamTournamentChange},
      {table:'team_tournament_players_v32',callback:onTeamTournamentChange},
      {table:'team_tournament_matches_v32',callback:onTeamTournamentChange}
    ]);

    createChannel('experience',[
      {table:'notifications_v58',column:'user_id',callback:onV58Change},
      {table:'protection_wallet_v58',column:'user_id',callback:onV58Change},
      {table:'player_title_unlocks_v58',column:'user_id',callback:onV58Change},
      {table:'player_equipped_title_v58',column:'user_id',callback:onV58Change},
      {table:'player_frame_unlocks',column:'user_id',callback:onV58Change},
      {table:'review_tags_v58',column:'reviewer_id',callback:onV58Change},
      {table:'review_tags_v58',column:'reviewed_id',callback:onV58Change},
      {table:'match_disputes_v58',callback:onV58Change},
      {table:'dispute_arbiter_proposals_v58',callback:onV58Change}
    ]);

    visibilityHandler=()=>{
      if(document.visibilityState==='visible'&&pollTimer)runPoll();
    };
    document.addEventListener('visibilitychange',visibilityHandler);
  }

  async function stop(){
    started=false;
    stopFallback();
    delete document.body.dataset.realtimeV74;
    if(visibilityHandler){document.removeEventListener('visibilitychange',visibilityHandler);visibilityHandler=null}
    const pending=channels.splice(0);
    statuses.clear();
    for(const item of pending){
      try{await supabase.removeChannel(item.channel)}catch{}
    }
  }

  return {
    start,
    stop,
    runPoll,
    getStatus:()=>({channels:Object.fromEntries(statuses),fallback:!!pollTimer})
  };
}

import {supabase} from './supabase.js';

function windowDelta(history,current,days){
  const cutoff=Date.now()-days*86400000;
  const rows=(history||[]).filter(x=>new Date(x.created_at).getTime()>=cutoff).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
  if(!rows.length)return 0;
  return Number(current)-Number(rows[0].previous_rating??current);
}

export async function getCompetitiveProgressV72(){
  const {data:{user},error:userError}=await supabase.auth.getUser();
  if(userError)throw userError;
  if(!user)throw new Error('Sesión no disponible.');

  const [ratingRes,historyRes,tiersRes,recordsRes,cardRes]=await Promise.all([
    supabase.from('ratings').select('rating,matches_played,wins,losses').eq('user_id',user.id).eq('modality','individual').maybeSingle(),
    supabase.from('rating_history').select('previous_rating,rating_change,new_rating,created_at,match_id').eq('user_id',user.id).eq('modality','individual').order('created_at',{ascending:false}).limit(150),
    supabase.from('rank_tiers').select('name,min_rating,sort_order').order('sort_order',{ascending:true}),
    supabase.rpc('get_player_records_v20',{p_user_id:user.id}),
    supabase.rpc('get_public_player_card',{p_user_id:user.id})
  ]);

  if(ratingRes.error)throw ratingRes.error;
  if(historyRes.error)throw historyRes.error;
  if(tiersRes.error)throw tiersRes.error;

  const rating=Number(ratingRes.data?.rating||1000);
  const history=historyRes.data||[];
  const tiers=tiersRes.data||[];
  const eligible=tiers.filter(t=>rating>=Number(t.min_rating));
  const tier=eligible[eligible.length-1]||tiers[0]||{name:'Bronce',min_rating:0};
  const tierIndex=Math.max(0,tiers.findIndex(t=>t.name===tier.name));
  const nextTier=tiers[tierIndex+1]||null;
  const tierMin=Number(tier.min_rating||0);
  const nextMin=Number(nextTier?.min_rating||rating);
  const progress=nextTier&&nextMin>tierMin?Math.max(0,Math.min(100,((rating-tierMin)/(nextMin-tierMin))*100)):100;
  const records=!recordsRes.error&&recordsRes.data?recordsRes.data:{};
  const card=!cardRes.error&&cardRes.data?cardRes.data:{};
  const maxElo=Math.max(rating,Number(records.max_elo||card.max_elo||rating),...history.map(x=>Number(x.new_rating||0)));
  const delta7=windowDelta(history,rating,7);
  const delta30=windowDelta(history,rating,30);
  const latestGain=history.find(x=>Number(x.rating_change)>0)||null;
  const latestChange=history[0]||null;
  const currentStreak=Number(card.current_streak||0);
  const bestStreak=Number(card.max_streak||0);
  const position=Number(card.ranking_position||0)||null;
  const bestPosition=Number(records.best_ranking_position||records.best_position||position||0)||null;

  let milestone={icon:'◎',label:'OBJETIVO ACTUAL',title:nextTier?`Llegar a ${nextTier.name}`:'Defender el rango máximo',detail:nextTier?`Te faltan ${Math.max(0,nextMin-rating)} Elo.`:'Seguí ampliando tu máximo histórico.'};
  if(rating>=maxElo&&history.length){
    milestone={icon:'✦',label:'MARCA PERSONAL',title:`${maxElo} Elo`,detail:'Estás en tu máximo histórico.'};
  }else if(latestGain){
    milestone={icon:'↗',label:'ÚLTIMA SUBIDA',title:`+${Number(latestGain.rating_change)} Elo`,detail:new Date(latestGain.created_at).toLocaleDateString('es-UY',{day:'numeric',month:'short'})};
  }

  return {
    rating,maxElo,delta7,delta30,
    rank:tier.name,nextRank:nextTier?.name||null,toNext:nextTier?Math.max(0,nextMin-rating):0,progress,
    position,bestPosition,currentStreak,bestStreak,
    matches:Number(ratingRes.data?.matches_played||0),
    trend:delta7>0?'up':delta7<0?'down':'stable',
    latestChange:latestChange?Number(latestChange.rating_change||0):0,
    milestone
  };
}

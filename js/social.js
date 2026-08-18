import { supabase } from './supabase.js';

export async function getReviewsForUser(userId){
  const {data,error}=await supabase
    .from('player_reviews')
    .select('id,match_id,reviewer_id,reviewed_id,stars,created_at,updated_at')
    .eq('reviewed_id',userId)
    .order('created_at',{ascending:false});
  if(error)throw error;
  return data||[];
}

export async function getReviewsAuthoredByUser(userId){
  const {data,error}=await supabase
    .from('player_reviews')
    .select('id,match_id,reviewer_id,reviewed_id,stars,created_at,updated_at')
    .eq('reviewer_id',userId);
  if(error)throw error;
  return data||[];
}

export async function submitPlayerReview(matchId,stars){
  const {data,error}=await supabase.rpc('submit_player_review',{
    p_match_id:matchId,
    p_stars:stars
  });
  if(error)throw error;
  return data;
}

export async function getPlayerProfile(userId){
  const {data,error}=await supabase
    .from('profiles')
    .select('id,username,first_name,last_name,profile_photo_url,playing_style,dominant_hand,club_name')
    .eq('id',userId)
    .single();
  if(error)throw error;
  return data;
}

export async function getPlayerRatings(userId){
  const {data,error}=await supabase
    .from('ratings')
    .select('modality,rating,matches_played,wins,losses')
    .eq('user_id',userId);
  if(error)throw error;
  return data||[];
}


export async function followPlayer(userId,followedId){
  const {error}=await supabase.from('player_follows').insert({
    follower_id:userId,
    followed_id:followedId
  });
  if(error && !String(error.message||'').toLowerCase().includes('duplicate'))throw error;
}

export async function unfollowPlayer(userId,followedId){
  const {error}=await supabase
    .from('player_follows')
    .delete()
    .eq('follower_id',userId)
    .eq('followed_id',followedId);
  if(error)throw error;
}

export async function getFollowingIds(userId){
  const {data,error}=await supabase
    .from('player_follows')
    .select('followed_id,created_at')
    .eq('follower_id',userId)
    .order('created_at',{ascending:false});
  if(error)throw error;
  return data||[];
}

export async function getFollowingRanking(userId,modality='individual',search=''){
  const follows=await getFollowingIds(userId);
  const ids=follows.map(x=>x.followed_id);
  if(!ids.length)return[];

  const {data:ratings,error:e1}=await supabase
    .from('ratings')
    .select('user_id,rating')
    .eq('modality',modality)
    .in('user_id',ids)
    .order('rating',{ascending:false});
  if(e1)throw e1;

  const {data:profiles,error:e2}=await supabase
    .from('profiles')
    .select('id,username,first_name,last_name,profile_photo_url,is_test_admin')
    .in('id',ids);
  if(e2)throw e2;

  const map=new Map((profiles||[]).map(p=>[p.id,p]));
  let rows=(ratings||[]).map((r,i)=>({
    position:i+1,
    rating:r.rating,
    profile:map.get(r.user_id)
  })).filter(x=>x.profile);

  const q=search.trim().toLowerCase();
  if(q){
    rows=rows.filter(x=>{
      const p=x.profile;
      return p.username?.toLowerCase().includes(q)
        || p.first_name?.toLowerCase().includes(q)
        || p.last_name?.toLowerCase().includes(q)
        || `${p.first_name} ${p.last_name}`.toLowerCase().includes(q);
    });
  }
  return rows;
}

export async function getPublicPlayerCard(userId){
  const {data,error}=await supabase.rpc('get_public_player_card',{p_user_id:userId});
  if(error)throw error;
  return data;
}

export async function getFollowingFeed(limit=30){
  const {data,error}=await supabase.rpc('get_following_feed',{p_limit:limit});
  if(error)throw error;
  return data||[];
}

export async function setPrimaryRival(userId){
  const {error}=await supabase.rpc('set_primary_rival',{p_rival_id:userId});
  if(error)throw error;
}

export async function clearPrimaryRival(){
  const {error}=await supabase.rpc('clear_primary_rival');
  if(error)throw error;
}

export async function getMyPrimaryRival(userId){
  const {data,error}=await supabase
    .from('primary_rivals')
    .select('rival_id')
    .eq('user_id',userId)
    .maybeSingle();
  if(error)throw error;
  return data?.rival_id||null;
}


export async function getShowcaseAchievements(userId){
  const {data,error}=await supabase.rpc('get_public_showcase',{p_user_id:userId});
  if(error)throw error;
  return data||[];
}

export async function setShowcaseAchievements(ids){
  const {error}=await supabase.rpc('set_showcase_achievements',{p_ids:ids});
  if(error)throw error;
}


export async function getPlayerReliabilityV34(userId){
  const {data,error}=await supabase.rpc('get_player_reliability_v34',{
    p_user_id:userId
  });
  if(error)throw error;
  return data||{
    reliability:100,
    completed_matches:0,
    abandoned_matches:0,
    total_matches:0,
    provisional:true,
    label:'Jugador fiable'
  };
}

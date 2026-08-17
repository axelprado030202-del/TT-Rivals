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

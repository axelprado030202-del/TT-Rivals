import { supabase } from './supabase.js';

export async function getMyProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getMyRatings(userId) {
  const { data, error } = await supabase
    .from('ratings')
    .select('modality, rating')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function completeSportsProfile({
  birthDate,
  playingStyle,
  dominantHand,
  clubName,
  profilePhotoUrl
}) {
  const { error } = await supabase.rpc('complete_sports_profile', {
    p_birth_date: birthDate,
    p_playing_style: playingStyle,
    p_dominant_hand: dominantHand,
    p_club_name: clubName,
    p_profile_photo_url: profilePhotoUrl || null
  });

  if (error) throw error;
}

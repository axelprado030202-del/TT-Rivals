import { supabase } from './supabase.js';
export async function getMyProfile(userId){const {data,error}=await supabase.from('profiles').select('*').eq('id',userId).single();if(error)throw error;return data;}
export async function getMyRatings(userId){const {data,error}=await supabase.from('ratings').select('modality,rating,matches_played,wins,losses').eq('user_id',userId);if(error)throw error;return data;}
export async function completeSportsProfile(x){const {error}=await supabase.rpc('complete_sports_profile',{p_birth_date:x.birthDate,p_playing_style:x.playingStyle,p_dominant_hand:x.dominantHand,p_club_name:x.clubName,p_profile_photo_url:x.profilePhotoUrl||null});if(error)throw error;}

export async function getClubsV47(){
  const {data,error}=await supabase.rpc('list_tt_clubs_v47');
  if(error)throw error;
  return data||[];
}
export async function ensureClubV47(name){
  const {data,error}=await supabase.rpc('ensure_tt_club_v47',{p_name:name});
  if(error)throw error;
  return typeof data==='string'?data:(data?.name||name);
}

export async function getClubsV49(){
  const {data,error}=await supabase.rpc('list_tt_clubs_v49');
  if(error)throw error;
  return data||[];
}
export async function getClubsV50(){
  const {data,error}=await supabase.rpc('list_tt_clubs_v50');
  if(error)throw error;
  return data||[];
}

export async function getClubsV51(){
  const {data,error}=await supabase.rpc('list_tt_clubs_v51');
  if(error)throw error;
  return data||[];
}
export async function suggestClubsV51(name,limit=8){
  const {data,error}=await supabase.rpc('suggest_tt_clubs_v51',{p_name:name,p_limit:limit});
  if(error)throw error;
  return data||[];
}
export async function ensureClubV51(name){
  const {data,error}=await supabase.rpc('ensure_tt_club_v51',{p_name:name});
  if(error)throw error;
  return data||null;
}
export async function setMyClubV51(clubId){
  const {data,error}=await supabase.rpc('set_my_tt_club_v51',{p_club_id:clubId??null});
  if(error)throw error;
  return data||null;
}
export async function getMyClubV51(){
  const {data,error}=await supabase.rpc('get_my_tt_club_v51');
  if(error)throw error;
  return data||{club_id:null,name:'N/A',display_alias:'N/A'};
}
export async function adminListClubsV51(){
  const {data,error}=await supabase.rpc('admin_list_tt_clubs_v51');
  if(error)throw error;
  return data||[];
}
export async function adminCreateClubV51({name,displayAlias,department,locality,aliases=[]}){
  const {data,error}=await supabase.rpc('admin_create_tt_club_v51',{
    p_name:name,
    p_display_alias:displayAlias,
    p_department:department||'Sin departamento',
    p_locality:locality||'',
    p_aliases:aliases||[]
  });
  if(error)throw error;
  return data||null;
}
export async function adminUpdateClubV51(clubId,name,displayAlias){
  const {data,error}=await supabase.rpc('admin_update_tt_club_v51',{
    p_club_id:Number(clubId),
    p_name:name,
    p_display_alias:displayAlias
  });
  if(error)throw error;
  return data||null;
}
export async function adminMergeClubsV51(targetId,sourceIds,extraAliases=[]){
  const {data,error}=await supabase.rpc('admin_merge_tt_clubs_v51',{
    p_target_id:Number(targetId),
    p_source_ids:(sourceIds||[]).map(Number),
    p_extra_aliases:extraAliases||[]
  });
  if(error)throw error;
  return data||null;
}
export async function suggestClubsV50(name,limit=8){
  const {data,error}=await supabase.rpc('suggest_tt_clubs_v50',{p_name:name,p_limit:limit});
  if(error)throw error;
  return data||[];
}
export async function suggestClubsV49(name,limit=5){
  const {data,error}=await supabase.rpc('suggest_tt_clubs_v49',{p_name:name,p_limit:limit});
  if(error)throw error;
  return data||[];
}
export async function ensureClubV49(name){
  const {data,error}=await supabase.rpc('ensure_tt_club_v49',{p_name:name});
  if(error)throw error;
  return data||null;
}
export async function setMyClubV49(clubId){
  const {data,error}=await supabase.rpc('set_my_tt_club_v49',{p_club_id:clubId??null});
  if(error)throw error;
  return data||null;
}
export async function setMyClubByNameV49(name){
  const {data,error}=await supabase.rpc('set_my_tt_club_by_name_v49',{p_name:name});
  if(error)throw error;
  return data||null;
}
export async function getMyClubV49(){
  const {data,error}=await supabase.rpc('get_my_tt_club_v49');
  if(error)throw error;
  return data||{club_id:null,name:'N/A'};
}
export async function adminListClubsV49(){
  const {data,error}=await supabase.rpc('admin_list_tt_clubs_v49');
  if(error)throw error;
  return data||[];
}
export async function adminMergeClubsV49(targetId,sourceIds,extraAliases=[]){
  const {data,error}=await supabase.rpc('admin_merge_tt_clubs_v49',{
    p_target_id:Number(targetId),
    p_source_ids:(sourceIds||[]).map(Number),
    p_extra_aliases:extraAliases||[]
  });
  if(error)throw error;
  return data||null;
}
export async function adminRenameClubV49(clubId,newName){
  const {data,error}=await supabase.rpc('admin_rename_tt_club_v49',{
    p_club_id:Number(clubId),
    p_new_name:newName
  });
  if(error)throw error;
  return data||null;
}
const rankingCacheV101=new Map();
export async function getRanking(modality='individual',search=''){
  const key=String(modality||'individual');
  let base=rankingCacheV101.get(key);
  if(!base||Date.now()-base.at>12000){
    const {data:ratings,error:e1}=await supabase.from('ratings').select('user_id,rating').eq('modality',modality).order('rating',{ascending:false}).limit(100);if(e1)throw e1;
    if(!ratings?.length){rankingCacheV101.set(key,{at:Date.now(),rows:[]});base={at:Date.now(),rows:[]}}
    else{
      const ids=ratings.map(r=>r.user_id);const {data:profiles,error:e2}=await supabase.from('profiles').select('id,username,first_name,last_name,profile_photo_url,is_test_admin').in('id',ids);if(e2)throw e2;
      const map=new Map((profiles||[]).map(p=>[p.id,p]));const rows=ratings.map((r,i)=>({position:i+1,rating:r.rating,profile:map.get(r.user_id)})).filter(x=>x.profile);
      base={at:Date.now(),rows};rankingCacheV101.set(key,base);
    }
  }
  let rows=[...(base?.rows||[])];const q=search.trim().toLowerCase();if(q)rows=rows.filter(x=>{const p=x.profile;return p.username?.toLowerCase().includes(q)||p.first_name?.toLowerCase().includes(q)||p.last_name?.toLowerCase().includes(q)||`${p.first_name} ${p.last_name}`.toLowerCase().includes(q)});return rows;
}
export async function searchPlayers(query,excludeUserId){const q=query.trim().toLowerCase();if(!q)return[];const {data,error}=await supabase.from('profiles').select('id,username,first_name,last_name,profile_photo_url,is_test_admin').neq('id',excludeUserId).limit(50);if(error)throw error;return(data||[]).filter(p=>p.username?.toLowerCase().includes(q)||p.first_name?.toLowerCase().includes(q)||p.last_name?.toLowerCase().includes(q)||`${p.first_name} ${p.last_name}`.toLowerCase().includes(q)).slice(0,12);}
export async function getRatingHistory(userId){const {data,error}=await supabase.from('rating_history').select('id,previous_rating,rating_change,new_rating,created_at,match_id').eq('user_id',userId).eq('modality','individual').order('created_at',{ascending:false}).limit(100);if(error)throw error;return data||[];}

let rankTiersCacheV101=null;
export async function getRankTiers(){
  if(rankTiersCacheV101&&Date.now()-rankTiersCacheV101.at<300000)return rankTiersCacheV101.data;
  const {data,error}=await supabase.from('rank_tiers').select('name,min_rating,sort_order').order('sort_order',{ascending:true});
  if(error)throw error;
  rankTiersCacheV101={at:Date.now(),data:data||[]};return rankTiersCacheV101.data;
}


export async function setProfilePhotoUrl(url){
  const {error}=await supabase.rpc('set_profile_photo_url',{p_url:url||null});
  if(error)throw error;
}

export async function uploadProfilePhoto(userId,file){
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
  const path=`${userId}/profile-${Date.now()}.${ext}`;

  const {error}=await supabase.storage
    .from('profile-photos')
    .upload(path,file,{
      cacheControl:'3600',
      upsert:false,
      contentType:file.type||undefined
    });
  if(error)throw error;

  const {data}=supabase.storage.from('profile-photos').getPublicUrl(path);
  if(!data?.publicUrl)throw new Error('No se pudo obtener la URL pública de la foto.');

  return {path,publicUrl:data.publicUrl};
}

export async function deleteProfilePhotoByUrl(url,userId){
  if(!url)return;
  try{
    const marker='/storage/v1/object/public/profile-photos/';
    const idx=url.indexOf(marker);
    if(idx===-1)return;
    const path=decodeURIComponent(url.slice(idx+marker.length));
    if(!path.startsWith(`${userId}/`))return;
    const {error}=await supabase.storage.from('profile-photos').remove([path]);
    if(error)throw error;
  }catch(error){
    throw error;
  }
}

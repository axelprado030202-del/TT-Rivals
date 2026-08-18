
import {supabase} from './supabase.js';

export async function getFrameCalibrationsV36(){
  const {data,error}=await supabase.rpc('get_frame_calibrations_v36');
  if(error)throw error;
  return data||[];
}

export async function saveFrameCalibrationV36(frameId,values){
  const {data,error}=await supabase.rpc('save_frame_calibration_v36',{
    p_frame_id:frameId,
    p_photo_scale:Number(values.photo_scale),
    p_photo_x:Number(values.photo_x),
    p_photo_y:Number(values.photo_y),
    p_frame_scale:Number(values.frame_scale),
    p_plus_x:Number(values.plus_x),
    p_plus_y:Number(values.plus_y)
  });
  if(error)throw error;
  return data;
}

export async function resetFrameCalibrationV36(frameId){
  const {data,error}=await supabase.rpc('reset_frame_calibration_v36',{p_frame_id:frameId});
  if(error)throw error;
  return data;
}

export function subscribeVisualLiveV36(userId,{onProfile,onCosmetics,onCalibration}={}){
  const channels=[];

  const profileChannel=supabase.channel(`v36-profile-${userId}`)
    .on('postgres_changes',{
      event:'UPDATE',schema:'public',table:'profiles',filter:`id=eq.${userId}`
    },payload=>onProfile?.(payload.new))
    .subscribe();
  channels.push(profileChannel);

  const cosmeticsChannel=supabase.channel(`v36-cosmetics-${userId}`)
    .on('postgres_changes',{
      event:'*',schema:'public',table:'player_cosmetics',filter:`user_id=eq.${userId}`
    },payload=>onCosmetics?.(payload.new||payload.old))
    .subscribe();
  channels.push(cosmeticsChannel);

  const calibrationChannel=supabase.channel('v36-frame-calibration-live')
    .on('postgres_changes',{
      event:'*',schema:'public',table:'frame_calibration_v36'
    },payload=>onCalibration?.(payload.new||payload.old))
    .subscribe();
  channels.push(calibrationChannel);

  return async()=>{
    for(const c of channels){
      try{await supabase.removeChannel(c)}catch{}
    }
  };
}

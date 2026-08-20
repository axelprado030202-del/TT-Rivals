
import {supabase} from './supabase.js';

export async function getFrameFitsV44(){
  const {data,error}=await supabase.rpc('get_frame_fits_v44');
  if(error)throw error;
  return data||[];
}

export async function saveFrameFitV44(frameId,values){
  const {data,error}=await supabase.rpc('save_frame_fit_v44',{
    p_frame_id:frameId,
    p_fine_scale:Number(values.fine_scale??100),
    p_fine_x:Number(values.fine_x??0),
    p_fine_y:Number(values.fine_y??0)
  });
  if(error)throw error;
  return data;
}

export async function resetFrameFitV44(frameId){
  const {data,error}=await supabase.rpc('reset_frame_fit_v44',{
    p_frame_id:frameId
  });
  if(error)throw error;
  return data;
}

export function subscribeAvatarLiveV44(userId,{onProfile,onCosmetics,onFrameFit}={}){
  const channels=[];
  const instance=`${String(userId).slice(0,8)}-${Math.random().toString(36).slice(2,8)}`;

  const profile=supabase.channel(`v44-profile-${instance}`)
    .on('postgres_changes',{
      event:'UPDATE',
      schema:'public',
      table:'profiles',
      filter:`id=eq.${userId}`
    },payload=>onProfile?.(payload.new))
    .subscribe();
  channels.push(profile);

  const cosmetics=supabase.channel(`v44-cosmetics-${instance}`)
    .on('postgres_changes',{
      event:'*',
      schema:'public',
      table:'player_cosmetics',
      filter:`user_id=eq.${userId}`
    },payload=>onCosmetics?.(payload.new||payload.old))
    .subscribe();
  channels.push(cosmetics);

  const fits=supabase.channel(`v44-frame-fit-live-${instance}`)
    .on('postgres_changes',{
      event:'*',
      schema:'public',
      table:'frame_fit_v44'
    },payload=>onFrameFit?.(payload.new||payload.old))
    .subscribe();
  channels.push(fits);

  return async()=>{
    for(const c of channels){
      try{await supabase.removeChannel(c)}catch{}
    }
  };
}

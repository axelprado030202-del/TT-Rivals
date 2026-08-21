
import {supabase} from './supabase.js';
import {filterVisibleRowsV76} from './v76_visibility.js';

export async function getMyV35Flags(){
  const {data,error}=await supabase.rpc('get_my_v35_flags');
  if(error)throw error;
  return data||{is_test_admin:false,nearby_opt_in:false,nearby_visibility:'everyone'};
}
export async function updateMyLocationV35(lat,lon,optIn=true,visibility='everyone'){
  const {error}=await supabase.rpc('update_my_location_v35',{
    p_lat:Number(lat),p_lon:Number(lon),p_opt_in:Boolean(optIn),p_visibility:visibility
  });
  if(error)throw error;
}
export async function getNearbyPlayersV35(lat,lon,maxKm=50,limit=30){
  const {data,error}=await supabase.rpc('get_nearby_players_v35',{
    p_lat:Number(lat),p_lon:Number(lon),p_limit:Number(limit),p_max_km:Number(maxKm)
  });
  if(error)throw error;
  return filterVisibleRowsV76(data||[],['user_id']);
}
export function createPresenceManagerV35(userId,onChange,{trackSelf=true}={}){
  let channel=null,ids=new Set();
  async function start(){
    if(channel)return;
    const instance=`${String(userId).slice(0,8)}-${Math.random().toString(36).slice(2,8)}`;
    channel=supabase.channel(`tt-rivals-online-v35-${instance}`,{config:{presence:{key:String(userId)}}});
    channel.on('presence',{event:'sync'},()=>{
      ids=new Set(Object.keys(channel.presenceState()||{}).map(String));
      onChange?.(ids);
    }).subscribe(async status=>{
      if(status==='SUBSCRIBED'&&trackSelf){
        try{await channel.track({user_id:String(userId),online_at:new Date().toISOString()})}catch(e){console.error(e)}
      }
    });
  }
  async function stop(){
    if(!channel)return;
    try{await channel.untrack()}catch{}
    try{await supabase.removeChannel(channel)}catch{}
    channel=null;ids=new Set();
  }
  return {start,stop,getOnlineIds:()=>ids};
}

import {supabase} from './supabase.js';

export async function touchPresenceV60(){
  const {error}=await supabase.rpc('touch_presence_v60');
  if(error)throw error;
}

export async function getPresenceV60(userIds=[]){
  const ids=[...new Set((userIds||[]).filter(Boolean).map(String))].slice(0,100);
  if(!ids.length)return [];
  const {data,error}=await supabase.rpc('get_presence_v60',{p_user_ids:ids});
  if(error)throw error;
  return data||[];
}

export function createPresenceHeartbeatV60({intervalMs=60000,onTouch}={}){
  let timer=null;
  let stopped=false;
  const tick=async()=>{
    if(stopped||document.visibilityState==='hidden'||!navigator.onLine)return;
    try{await touchPresenceV60();onTouch?.()}catch(err){console.warn('Presence V60:',err)}
  };
  return {
    async start(){
      stopped=false;
      await tick();
      if(!timer)timer=setInterval(tick,intervalMs);
      document.addEventListener('visibilitychange',tick);
      window.addEventListener('online',tick);
    },
    stop(){
      stopped=true;
      if(timer)clearInterval(timer);
      timer=null;
      document.removeEventListener('visibilitychange',tick);
      window.removeEventListener('online',tick);
    },
    touch:tick
  };
}

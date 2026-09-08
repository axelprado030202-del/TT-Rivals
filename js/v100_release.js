import {supabase} from './supabase.js';

const rewardQueues=new Map();
const PUSH_HEARTBEAT_MS=45000;
let pushHeartbeat=null;
let pushVisibilityHandler=null;

function base64UrlToUint8Array(value=''){
  const padding='='.repeat((4-value.length%4)%4);
  const base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(base64);
  return Uint8Array.from([...raw].map(char=>char.charCodeAt(0)));
}

function localRewardSync(userId,kind,keys){
  const storageKey=`tt-rivals-v100-rewards:${userId}:${kind}`;
  try{
    const raw=localStorage.getItem(storageKey);
    if(raw===null){
      localStorage.setItem(storageKey,JSON.stringify(keys));
      return [];
    }
    const known=new Set(JSON.parse(raw)||[]);
    const fresh=keys.filter(key=>!known.has(key));
    keys.forEach(key=>known.add(key));
    localStorage.setItem(storageKey,JSON.stringify([...known]));
    return fresh;
  }catch{return []}
}

async function syncRewardKeys(userId,kind,keys){
  if(!userId||!keys.length)return [];
  try{
    const {data,error}=await supabase.rpc('sync_reward_unlocks_v100',{
      p_kind:kind,
      p_reward_keys:keys
    });
    if(error)throw error;
    return Array.isArray(data)?data.map(String):[];
  }catch(error){
    // La versión local mantiene el comportamiento correcto aunque la migración
    // todavía no se haya ejecutado. La base de datos sigue siendo la fuente
    // autoritativa cuando está disponible, incluso entre dispositivos.
    if(!/sync_reward_unlocks_v100|schema cache|function/i.test(String(error?.message||'')))console.warn('Reward ledger V1.0.0:',error);
    return localRewardSync(userId,kind,keys);
  }
}

export function syncRewardUnlocksV100(userId,kind,items=[]){
  const unlocked=items.filter(item=>item?.unlocked).map(item=>String(item.id||item.key||item.title||'')).filter(Boolean);
  const queueKey=`${userId}:${kind}`;
  const previous=rewardQueues.get(queueKey)||Promise.resolve([]);
  const next=previous.catch(()=>[]).then(()=>syncRewardKeys(userId,kind,unlocked));
  rewardQueues.set(queueKey,next);
  return next;
}

async function touchPushPresence(userId,visible){
  if(!userId)return;
  await supabase.rpc('touch_app_presence_v100',{
    p_visible:!!visible,
    p_device_id:getPushDeviceIdV100()
  }).then(({error})=>{if(error)throw error}).catch(error=>{
    if(!/touch_app_presence_v100|schema cache|function/i.test(String(error?.message||'')))console.warn('Push presence V1.0.0:',error);
  });
}

function getPushDeviceIdV100(){
  const key='tt-rivals-v100-push-device';
  try{
    let value=localStorage.getItem(key);
    if(!value){value=crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;localStorage.setItem(key,value)}
    return value;
  }catch{return 'browser-session'}
}

export function startPushPresenceV100(userId){
  stopPushPresenceV100();
  const report=()=>touchPushPresence(userId,document.visibilityState==='visible');
  pushVisibilityHandler=report;
  document.addEventListener('visibilitychange',report);
  window.addEventListener('pagehide',report);
  pushHeartbeat=setInterval(()=>{
    if(document.visibilityState==='visible')report();
  },PUSH_HEARTBEAT_MS);
  report();
}

export function stopPushPresenceV100(){
  if(pushHeartbeat)clearInterval(pushHeartbeat);
  pushHeartbeat=null;
  if(pushVisibilityHandler){
    document.removeEventListener('visibilitychange',pushVisibilityHandler);
    window.removeEventListener('pagehide',pushVisibilityHandler);
  }
  pushVisibilityHandler=null;
}

async function getPushConfig(){
  const {data,error}=await supabase.rpc('get_push_public_config_v100');
  if(error)throw error;
  return data||{};
}

export async function getPushStatusV100(){
  if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){
    return {supported:false,enabled:false,permission:'unsupported'};
  }
  const registration=await navigator.serviceWorker.ready;
  const subscription=await registration.pushManager.getSubscription();
  return {supported:true,enabled:!!subscription,permission:Notification.permission};
}

export async function enablePushV100(){
  if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window))throw new Error('Este dispositivo no admite notificaciones externas.');
  const permission=await Notification.requestPermission();
  if(permission!=='granted')throw new Error('El permiso de notificaciones no fue concedido.');
  const config=await getPushConfig();
  if(!config.enabled||!config.vapid_public_key)throw new Error('Las notificaciones externas todavía no fueron activadas en el servidor.');
  const registration=await navigator.serviceWorker.ready;
  let subscription=await registration.pushManager.getSubscription();
  if(!subscription){
    subscription=await registration.pushManager.subscribe({
      userVisibleOnly:true,
      applicationServerKey:base64UrlToUint8Array(config.vapid_public_key)
    });
  }
  const payload=subscription.toJSON();
  const {error}=await supabase.rpc('register_push_subscription_v100',{
    p_device_id:getPushDeviceIdV100(),
    p_endpoint:payload.endpoint,
    p_p256dh:payload.keys?.p256dh||'',
    p_auth:payload.keys?.auth||'',
    p_user_agent:navigator.userAgent.slice(0,500)
  });
  if(error)throw error;
  return {supported:true,enabled:true,permission};
}

export async function disablePushV100(){
  if(!('serviceWorker' in navigator)||!('PushManager' in window))return {supported:false,enabled:false};
  const registration=await navigator.serviceWorker.ready;
  const subscription=await registration.pushManager.getSubscription();
  if(subscription){
    await supabase.rpc('remove_push_subscription_v100',{p_endpoint:subscription.endpoint}).catch(()=>{});
    await subscription.unsubscribe();
  }
  return {supported:true,enabled:false,permission:Notification.permission};
}

export function installPerformanceTelemetryV100(){
  if(window.__TT_V100_PERF__)return window.__TT_V100_PERF__;
  const state={startedAt:performance.now(),longTasks:[],navigation:performance.getEntriesByType?.('navigation')?.[0]||null};
  window.__TT_V100_PERF__=state;
  try{
    const observer=new PerformanceObserver(list=>{
      list.getEntries().forEach(entry=>state.longTasks.push({start:Math.round(entry.startTime),duration:Math.round(entry.duration)}));
      state.longTasks=state.longTasks.slice(-40);
    });
    observer.observe({type:'longtask',buffered:true});
    state.observer=observer;
  }catch{}
  return state;
}

export function consumePushDeepLinkV100(activateTab){
  const url=new URL(location.href);
  const action=url.searchParams.get('tt_push_action')||'';
  const entity=url.searchParams.get('tt_push_entity')||'';
  if(!action&&!entity)return false;
  const target=action==='history'?'history':action==='profile'||action==='protection'||action==='titles'?'profile':'play';
  setTimeout(()=>activateTab?.(target,{source:'push'}),120);
  url.searchParams.delete('tt_push_action');
  url.searchParams.delete('tt_push_entity');
  url.searchParams.delete('tt_push_id');
  history.replaceState(history.state,'',url);
  return true;
}

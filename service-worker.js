/* TT Rivals 1.0.1 — Service Worker P7.4.3
   Navegación: network-first.
   Estáticos: cache-first + actualización en segundo plano.
   Al activar, elimina cachés TT Rivals de builds anteriores. */
const params=new URL(self.location.href).searchParams;
const TT_BUILD=params.get('v')||'v1.0.1-p7.4.3-progressive-swipe';
const CACHE_PREFIX='tt-rivals-';
const CACHE_NAME='tt-rivals-v1-0-1-p7-4-3-progressive-swipe';

const APP_SHELL=[
  './','./index.html','./manifest.webmanifest',
  './css/style.css','./css/v101_ui_rework.css','./css/v101_premium.css','./css/v101_motion_fx.css','./css/v70_metrics.css','./css/v71_result.css','./css/v72_progress.css','./css/v73_rematch.css','./css/v74_performance.css',
  './js/version.js','./js/app.js','./js/v55_competition_live.js','./js/v74_navigation.js','./js/v70_metrics.js','./js/v72_progress.js','./js/v101_feedback.js','./js/v101_motion_fx.js','./js/v101_performance.js',
  './js/pwa.js','./js/v61_ai.js','./js/v62_doubles.js','./js/v63_integrity_rewards.js','./js/v100_launch.js','./js/v101_experience.js',
  './js/v60_runtime.js','./js/v60_motion.js','./js/v60_presence.js','./js/v60_history.js','./js/supabase.js','./js/auth.js',
  './js/challenges.js','./js/matches.js','./js/profile.js','./js/preferences.js','./js/social.js','./js/history.js','./js/tournaments.js',
  './js/team_tournaments.js','./js/training.js','./js/v21.js','./js/v28.js','./js/v35_social.js','./js/v36_live.js','./js/v44_avatar_fit.js',
  './js/v55_competition_live.js','./js/v56_stats.js','./js/v57_legal.js','./js/v58_competition.js',
  './assets/pwa/icon-192.png','./assets/pwa/icon-512.png','./assets/pwa/icon-maskable-192.png','./assets/pwa/icon-maskable-512.png',
  './assets/pwa/apple-touch-icon.png','./assets/pwa/favicon-64.png','./assets/frames/tester-exclusive-v100.png'
];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await Promise.allSettled(APP_SHELL.map(async url=>{
      const response=await fetch(new Request(url,{cache:'reload'}));
      if(response.ok)await cache.put(url,response.clone());
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});

async function navigationResponse(request){
  try{
    const fresh=await fetch(new Request(request,{cache:'no-store'}));
    if(fresh.ok){const cache=await caches.open(CACHE_NAME);cache.put('./index.html',fresh.clone()).catch(()=>{})}
    return fresh;
  }catch(err){return (await caches.match('./index.html'))||(await caches.match('./'))||Response.error()}
}
async function staticResponse(request){
  const cached=await caches.match(request);
  if(cached){
    // Stale-while-revalidate: respuesta instantánea, actualización silenciosa.
    fetch(new Request(request,{cache:'no-store'})).then(async fresh=>{if(fresh.ok){const cache=await caches.open(CACHE_NAME);await cache.put(request,fresh.clone())}}).catch(()=>{});
    return cached;
  }
  try{
    const fresh=await fetch(new Request(request,{cache:'no-store'}));
    if(fresh.ok){const cache=await caches.open(CACHE_NAME);cache.put(request,fresh.clone()).catch(()=>{})}
    return fresh;
  }catch(err){return (await caches.match(request,{ignoreSearch:true}))||Response.error()}
}
self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  const url=new URL(request.url);if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){event.respondWith(navigationResponse(request));return}
  event.respondWith(staticResponse(request));
});

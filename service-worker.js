/* TT Rivals 1.0.1 — el build llega desde js/version.js a través de ?v=. */
const params=new URL(self.location.href).searchParams;
const TT_BUILD=params.get('v')||'1.0.1';
const CACHE_PREFIX='tt-rivals-';
const CACHE_NAME='tt-rivals-v1-0-1-premium-p5-adminfix1';

const APP_SHELL=[
  './','./index.html','./css/style.css','./css/v101_ui_rework.css','./css/v101_premium.css','./manifest.webmanifest',
  './js/version.js','./js/app.js','./js/v101_feedback.js','./js/pwa.js','./js/v61_ai.js','./js/v62_doubles.js','./js/v63_integrity_rewards.js','./js/v100_launch.js','./js/v101_experience.js','./js/v60_runtime.js','./js/v60_motion.js','./js/v60_presence.js','./js/v60_history.js',
  './js/supabase.js','./js/auth.js','./js/challenges.js','./js/matches.js','./js/profile.js',
  './js/preferences.js','./js/social.js','./js/history.js','./js/tournaments.js','./js/team_tournaments.js',
  './js/training.js','./js/v21.js','./js/v28.js','./js/v35_social.js','./js/v36_live.js',
  './js/v44_avatar_fit.js','./js/v55_competition_live.js','./js/v56_stats.js','./js/v57_legal.js','./js/v58_competition.js',
  './assets/pwa/icon-192.png','./assets/pwa/icon-512.png','./assets/pwa/icon-maskable-512.png',
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

async function networkNoStore(request){return fetch(new Request(request,{cache:'no-store'}))}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const fresh=await networkNoStore(request);
        if(fresh.ok){const cache=await caches.open(CACHE_NAME);cache.put('./index.html',fresh.clone()).catch(()=>{})}
        return fresh;
      }catch(error){
        const cached=await caches.match('./index.html');
        if(cached)return cached;
        throw error;
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    try{
      const fresh=await networkNoStore(request);
      if(fresh.ok){const cache=await caches.open(CACHE_NAME);cache.put(request,fresh.clone()).catch(()=>{})}
      return fresh;
    }catch(error){
      const direct=await caches.match(request,{ignoreSearch:true});
      if(direct)return direct;
      throw error;
    }
  })());
});

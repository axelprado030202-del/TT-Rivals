/* TT Rivals 1.0.1 — Performance Guard P6
   Optimizaciones no invasivas para imágenes, pestañas ocultas y diagnóstico. */
const state=window.__TT_PERF_V101=window.__TT_PERF_V101||{};
state.startedAt=Date.now();state.longTasks=0;state.longTaskMs=0;state.imagesOptimized=0;

function optimizeImage(img){
  if(!img||img.dataset.ttPerfOptimized==='1')return;
  img.dataset.ttPerfOptimized='1';
  if(!img.hasAttribute('decoding'))img.decoding='async';
  // Logos críticos y avatares ya visibles no se fuerzan a lazy; el resto sí.
  const critical=img.closest('#ttBootScreenV572,.tt-loader-v572,.desktop-brand,.v15-player-identity')||img.id==='homeRankIconSmall';
  if(!critical&&!img.hasAttribute('loading'))img.loading='lazy';
  state.imagesOptimized++;
}
document.querySelectorAll('img').forEach(optimizeImage);
const imageObserver=new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType!==1)return;if(n.matches?.('img'))optimizeImage(n);n.querySelectorAll?.('img').forEach(optimizeImage)})));
imageObserver.observe(document.documentElement,{childList:true,subtree:true});

if('PerformanceObserver' in window){
  try{
    const po=new PerformanceObserver(list=>{
      for(const entry of list.getEntries()){state.longTasks++;state.longTaskMs+=Math.round(entry.duration)}
      if(state.longTasks>=4&&window.__TT_MOTION_V101?.getDiagnostics?.().quality==='high')window.__TT_MOTION_V101.setQuality('medium','long-tasks');
      if(state.longTasks>=10)window.__TT_MOTION_V101?.setQuality?.('low','long-tasks');
    });
    po.observe({type:'longtask',buffered:true});
  }catch(_){ }
}

function updateSnapshot(){
  state.visibility=document.visibilityState;
  state.online=navigator.onLine;
  state.hardwareConcurrency=navigator.hardwareConcurrency||null;
  state.deviceMemory=navigator.deviceMemory||null;
  state.saveData=!!navigator.connection?.saveData;
  state.effectiveType=navigator.connection?.effectiveType||null;
  state.jsHeapMB=performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null;
  state.motion=window.__TT_MOTION_V101?.getDiagnostics?.()||state.motion||{};
}
updateSnapshot();setInterval(updateSnapshot,5000);
document.addEventListener('visibilitychange',updateSnapshot,{passive:true});
window.addEventListener('online',updateSnapshot,{passive:true});window.addEventListener('offline',updateSnapshot,{passive:true});

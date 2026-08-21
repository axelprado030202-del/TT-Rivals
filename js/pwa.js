import {APP_VERSION,APP_BUILD,APP_CACHE_NAME} from './version.js?v=1.0.1-p7.4r.4.2';

const TT_SW_URL_V60=`./service-worker.js?v=${encodeURIComponent(APP_BUILD)}`;
const TT_CACHE_PREFIX='tt-rivals-';
let deferredInstallPromptV573=null;
let registrationV60=null;
let lastUpdateCheckV60=null;

function isStandaloneV573(){
  return window.matchMedia?.('(display-mode: standalone)').matches
    || window.navigator.standalone===true;
}
function isAndroidV573(){return /Android/i.test(navigator.userAgent)}

function setInstallUiV573(state='hidden'){
  document.querySelectorAll('[data-pwa-install-v573]').forEach(button=>{
    button.classList.toggle('hidden',state==='hidden');
    button.disabled=state==='installed';
    if(state==='installed')button.textContent='✓ TT Rivals instalado';
  });
  document.querySelectorAll('[data-pwa-install-status-v573]').forEach(el=>{
    if(state==='installed')el.textContent='TT Rivals está instalado como aplicación independiente.';
    else if(state==='ready')el.textContent='Instalalo como app para abrirlo sin la interfaz del navegador.';
    else if(isAndroidV573()&&!isStandaloneV573())el.textContent='En Android, usá “Instalar app” para obtener el modo independiente.';
  });
}

function setUpdateStatusV60(message,state=''){
  const el=document.querySelector('#appUpdateStatusV59');
  if(!el)return;
  el.textContent=message;
  el.dataset.state=state;
}

async function requestInstallV573(){
  if(isStandaloneV573()){setInstallUiV573('installed');return}
  if(deferredInstallPromptV573){
    deferredInstallPromptV573.prompt();
    const choice=await deferredInstallPromptV573.userChoice.catch(()=>null);
    deferredInstallPromptV573=null;
    setInstallUiV573(choice?.outcome==='accepted'?'installed':'hidden');
    return;
  }
  alert('Para abrir TT Rivals sin la barra de Chrome, abrí el menú ⋮ y elegí “Instalar app”. Evitá crear un acceso directo común: ese acceso puede seguir abriéndose dentro del navegador.');
}

function ensureAndroidInstallGuideV62(){
  if(!isAndroidV573()||isStandaloneV573()){
    document.querySelector('#androidInstallGuideV62')?.remove();
    return;
  }
  if(document.querySelector('#androidInstallGuideV62'))return;
  const guide=document.createElement('aside');
  guide.id='androidInstallGuideV62';
  guide.className='android-install-guide-v62';
  guide.innerHTML=`<span aria-hidden="true">◈</span><div><strong>Abrir como aplicación</strong><small>Estás usando TT Rivals dentro de Chrome. Instalalo como app para abrirlo sin la barra del navegador.</small></div><button type="button" data-android-install-v62>Instalar</button><button type="button" class="close" aria-label="Cerrar" data-close-android-install-v62>✕</button>`;
  document.body.appendChild(guide);
  guide.querySelector('[data-android-install-v62]')?.addEventListener('click',requestInstallV573);
  guide.querySelector('[data-close-android-install-v62]')?.addEventListener('click',()=>guide.remove());
}

async function clearOldTTRivalsCachesV60({includeCurrent=false}={}){
  if(!('caches' in window))return [];
  const keys=await caches.keys();
  const targets=keys.filter(key=>key.startsWith(TT_CACHE_PREFIX)&&(includeCurrent||key!==APP_CACHE_NAME));
  await Promise.all(targets.map(key=>caches.delete(key)));
  return targets;
}

async function readPublishedVersionV60(){
  const response=await fetch(`./js/version.js?tt_update=${Date.now()}`,{
    cache:'no-store',headers:{'cache-control':'no-cache'}
  });
  if(!response.ok)throw new Error(`El servidor responde ${response.status}`);
  const text=await response.text();
  const match=text.match(/APP_VERSION\s*=\s*['\"]([^'\"]+)['\"]/);
  if(!match)throw new Error('No se pudo identificar la versión publicada');
  return match[1];
}

export async function checkForUpdateV60(){
  const button=document.querySelector('#checkAppUpdateV59');
  if(button)button.disabled=true;
  if(!navigator.onLine){
    setUpdateStatusV60('No hay conexión. Se mantiene el respaldo local disponible.','offline');
    if(button)button.disabled=false;
    return {ok:false,offline:true};
  }
  try{
    setUpdateStatusV60('Buscando la versión más reciente…','checking');
    const published=await readPublishedVersionV60();
    lastUpdateCheckV60={at:new Date().toISOString(),published};
    await registrationV60?.update().catch(()=>{});
    if(published!==APP_VERSION){
      await clearOldTTRivalsCachesV60({includeCurrent:true});
      setUpdateStatusV60(`Nueva versión ${published} detectada. Recargando…`,'ok');
      setTimeout(()=>location.reload(),250);
      return {ok:true,update:true,published};
    }
    await clearOldTTRivalsCachesV60();
    setUpdateStatusV60(`V${APP_VERSION} está actualizada.`,'ok');
    return {ok:true,update:false,published};
  }catch(err){
    console.error('Actualización V60:',err);
    lastUpdateCheckV60={at:new Date().toISOString(),error:err.message};
    setUpdateStatusV60(`No se pudo verificar la publicación: ${err.message}`,'error');
    return {ok:false,error:err.message};
  }finally{
    if(button)button.disabled=false;
  }
}

export async function getPwaDiagnosticsV60(){
  const cacheKeys='caches' in window?await caches.keys():[];
  const reg=registrationV60||await navigator.serviceWorker?.getRegistration('./').catch(()=>null);
  return {
    appVersion:APP_VERSION,
    appBuild:APP_BUILD,
    expectedCache:APP_CACHE_NAME,
    caches:cacheKeys.filter(x=>x.startsWith(TT_CACHE_PREFIX)),
    standalone:isStandaloneV573(),
    online:navigator.onLine,
    serviceWorkerSupported:'serviceWorker' in navigator,
    serviceWorkerState:reg?.active?.state||reg?.installing?.state||reg?.waiting?.state||'sin registro',
    serviceWorkerScript:reg?.active?.scriptURL||null,
    controlled:!!navigator.serviceWorker?.controller,
    lastUpdateCheck:lastUpdateCheckV60
  };
}

export async function setupPwaV573(){
  const wasControlled=!!navigator.serviceWorker?.controller;
  document.documentElement.dataset.ttVersion=APP_VERSION;
  document.body?.setAttribute('data-tt-build',APP_BUILD);
  document.querySelector('#appBuildLabelV59')?.replaceChildren(document.createTextNode(`V${APP_VERSION}`));

  if('serviceWorker' in navigator){
    try{
      registrationV60=await navigator.serviceWorker.register(TT_SW_URL_V60,{scope:'./',updateViaCache:'none'});
      if(wasControlled){
        let reloading=false;
        navigator.serviceWorker.addEventListener('controllerchange',()=>{
          if(reloading)return;reloading=true;location.reload();
        });
      }
      await registrationV60.update().catch(()=>{});
      await clearOldTTRivalsCachesV60();
    }catch(err){
      console.error('Service Worker V60:',err);
      setUpdateStatusV60('No se pudo comprobar la actualización automática.','error');
    }
  }

  if(isStandaloneV573()){
    document.documentElement.classList.add('pwa-standalone-v573');
    setInstallUiV573('installed');
    document.querySelector('#androidInstallGuideV62')?.remove();
  }else{
    document.documentElement.classList.remove('pwa-standalone-v573');
    if(isAndroidV573()){
      setInstallUiV573('manual');
      ensureAndroidInstallGuideV62();
    }
  }

  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();deferredInstallPromptV573=event;setInstallUiV573('ready');ensureAndroidInstallGuideV62();
  });
  window.addEventListener('appinstalled',()=>{
    deferredInstallPromptV573=null;setInstallUiV573('installed');document.querySelector('#androidInstallGuideV62')?.remove();
  });
  document.querySelectorAll('[data-pwa-install-v573]').forEach(button=>button.addEventListener('click',requestInstallV573));
  document.querySelector('#checkAppUpdateV59')?.addEventListener('click',checkForUpdateV60);
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')registrationV60?.update().catch(()=>{});
  });
}

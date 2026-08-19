const TT_BUILD_V59='59.0.0';
const TT_SW_URL_V59=`./service-worker.js?v=${TT_BUILD_V59}`;
const TT_CACHE_PREFIX_V59='tt-rivals-';

let deferredInstallPromptV573=null;
let registrationV59=null;

function isStandaloneV573(){
  return window.matchMedia?.('(display-mode: standalone)').matches
    || window.navigator.standalone===true;
}

function isAndroidV573(){
  return /Android/i.test(navigator.userAgent);
}

function setInstallUiV573(state='hidden'){
  document.querySelectorAll('[data-pwa-install-v573]').forEach(button=>{
    button.classList.toggle('hidden',state==='hidden');
    button.disabled=state==='installed';
    if(state==='installed')button.textContent='✓ TT Rivals instalado';
  });

  document.querySelectorAll('[data-pwa-install-status-v573]').forEach(el=>{
    if(state==='installed'){
      el.textContent='TT Rivals está instalado como aplicación independiente.';
    }else if(state==='ready'){
      el.textContent='Instalalo como app para abrirlo sin la interfaz del navegador.';
    }else if(isAndroidV573()&&!isStandaloneV573()){
      el.textContent='En Android, usá “Instalar app” para obtener el modo independiente.';
    }
  });
}

function setUpdateStatusV59(message,state=''){
  const el=document.querySelector('#appUpdateStatusV59');
  if(!el)return;
  el.textContent=message;
  el.dataset.state=state;
}

async function requestInstallV573(){
  if(isStandaloneV573()){
    setInstallUiV573('installed');
    return;
  }

  if(deferredInstallPromptV573){
    deferredInstallPromptV573.prompt();
    const choice=await deferredInstallPromptV573.userChoice.catch(()=>null);
    deferredInstallPromptV573=null;

    if(choice?.outcome==='accepted'){
      setInstallUiV573('installed');
    }else{
      setInstallUiV573('hidden');
    }
    return;
  }

  alert(
    'Chrome todavía no habilitó el instalador. Abrí el menú ⋮ y buscá “Instalar app” o “Agregar a pantalla principal”. Si ya existía un acceso directo viejo, borrá ese acceso y volvé a instalar TT Rivals.'
  );
}

async function clearOldTTRivalsCachesV59({includeCurrent=false}={}){
  if(!('caches' in window))return;
  const current=`tt-rivals-v${TT_BUILD_V59.replaceAll('.','-')}`;
  const keys=await caches.keys();
  await Promise.all(
    keys
      .filter(key=>key.startsWith(TT_CACHE_PREFIX_V59) && (includeCurrent||key!==current))
      .map(key=>caches.delete(key))
  );
}

async function checkForUpdateV59(){
  const button=document.querySelector('#checkAppUpdateV59');
  if(button)button.disabled=true;

  if(!navigator.onLine){
    setUpdateStatusV59('No hay conexión. TT Rivals mantiene el respaldo local disponible.','offline');
    if(button)button.disabled=false;
    return;
  }

  try{
    setUpdateStatusV59('Buscando la versión más reciente…','checking');
    await clearOldTTRivalsCachesV59();

    const reg=registrationV59||await navigator.serviceWorker?.getRegistration('./');
    if(reg)await reg.update();

    // Esta petición no usa la caché HTTP. Además verificamos el build escrito
    // dentro del HTML: así distinguimos "GitHub todavía no publicó" de
    // "mi navegador sigue usando una copia vieja".
    const probe=await fetch(`./index.html?tt_update=${Date.now()}`,{
      cache:'no-store',
      headers:{'cache-control':'no-cache'}
    });

    if(!probe.ok){
      throw new Error(`El servidor todavía responde ${probe.status}`);
    }

    const html=await probe.text();
    if(!html.includes('data-tt-build="v59.0.0"')){
      throw new Error('GitHub Pages todavía está publicando la versión anterior');
    }

    await clearOldTTRivalsCachesV59({includeCurrent:true});
    setUpdateStatusV59('V59.0.0 ya está publicada. Recargando…','ok');
    setTimeout(()=>location.reload(),180);
  }catch(err){
    console.error('Actualización V59:',err);
    setUpdateStatusV59(`La publicación todavía no está disponible: ${err.message}`,'error');
    if(button)button.disabled=false;
  }
}

export async function setupPwaV573(){
  const wasControlled=!!navigator.serviceWorker?.controller;

  document.querySelector('#appBuildLabelV59')?.replaceChildren(document.createTextNode(`V${TT_BUILD_V59}`));

  if('serviceWorker' in navigator){
    try{
      registrationV59=await navigator.serviceWorker.register(TT_SW_URL_V59,{
        scope:'./',
        updateViaCache:'none'
      });

      // Si ya había una versión de TT Rivals controlando la página, un nuevo
      // worker toma control y recargamos una sola vez para pintar el build nuevo.
      if(wasControlled){
        let reloading=false;
        navigator.serviceWorker.addEventListener('controllerchange',()=>{
          if(reloading)return;
          reloading=true;
          location.reload();
        });
      }

      await registrationV59.update().catch(()=>{});
      await clearOldTTRivalsCachesV59();
    }catch(err){
      console.error('Service Worker V59:',err);
      setUpdateStatusV59('No se pudo comprobar la actualización automática.','error');
    }
  }

  if(isStandaloneV573()){
    document.documentElement.classList.add('pwa-standalone-v573');
    setInstallUiV573('installed');
  }else{
    document.documentElement.classList.remove('pwa-standalone-v573');
    if(isAndroidV573())setInstallUiV573('manual');
  }

  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    deferredInstallPromptV573=event;
    setInstallUiV573('ready');
  });

  window.addEventListener('appinstalled',()=>{
    deferredInstallPromptV573=null;
    setInstallUiV573('installed');
  });

  document.querySelectorAll('[data-pwa-install-v573]').forEach(button=>{
    button.addEventListener('click',requestInstallV573);
  });

  document.querySelector('#checkAppUpdateV59')?.addEventListener('click',checkForUpdateV59);

  // Al volver a la app después de un rato, pedimos al navegador que compruebe
  // el worker. No recargamos salvo que realmente aparezca una nueva versión.
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')registrationV59?.update().catch(()=>{});
  });
}

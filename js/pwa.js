let deferredInstallPromptV573=null;

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

  // Si Chrome no expuso el prompt todavía, no abrimos URLs ni simulamos APK.
  // El mensaje orienta al menú nativo.
  alert(
    'Chrome todavía no habilitó el instalador. Abrí el menú ⋮ y buscá “Instalar app” o “Agregar a pantalla principal”. Si ya existía un acceso directo viejo, borrá ese acceso y volvé a instalar TT Rivals.'
  );
}

export async function setupPwaV573(){
  if('serviceWorker' in navigator){
    try{
      const registration=await navigator.serviceWorker.register('./service-worker.js',{
        scope:'./',
        updateViaCache:'none'
      });
      registration.update().catch(()=>{});
    }catch(err){
      console.error('Service Worker V57.3:',err);
    }
  }

  if(isStandaloneV573()){
    document.documentElement.classList.add('pwa-standalone-v573');
    setInstallUiV573('installed');
  }else{
    document.documentElement.classList.remove('pwa-standalone-v573');

    // En Android mostramos el acceso aunque el evento tarde en llegar.
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
}

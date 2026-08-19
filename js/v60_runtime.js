const lockMap=new Map();
const recentErrors=[];
const MAX_ERRORS=12;

export function actionKeyV60(kind,id=''){
  return `${String(kind||'action')}:${String(id||'')}`;
}

export function isActionLockedV60(key){
  return lockMap.has(String(key));
}

export async function withActionLockV60(key,button,job,{loadingText='Procesando…',successText='',successHold=520,keepDisabled=false}={}){
  const k=String(key||'action');
  if(lockMap.has(k))return {skipped:true};
  const token={startedAt:Date.now()};
  lockMap.set(k,token);
  const el=button||null;
  const oldText=el?.textContent;
  const oldDisabled=el?.disabled;
  let succeeded=false;
  if(el){
    el.dataset.v60Busy='1';
    el.setAttribute('aria-busy','true');
    el.disabled=true;
    if(loadingText)el.textContent=loadingText;
  }
  try{
    const result=await job();
    succeeded=true;
    if(el&&successText){
      el.removeAttribute('aria-busy');
      el.classList.add('v601-action-success');
      el.textContent=successText;
      await new Promise(resolve=>setTimeout(resolve,Math.max(0,Number(successHold)||0)));
    }
    return result;
  }finally{
    if(lockMap.get(k)===token)lockMap.delete(k);
    if(el){
      delete el.dataset.v60Busy;
      el.removeAttribute('aria-busy');
      el.classList.remove('v601-action-success');
      if(!keepDisabled){
        el.disabled=!!oldDisabled;
        if(oldText!==undefined)el.textContent=oldText;
      }
    }
  }
}

export function installRapidClickGuardV60(root=document){
  root.addEventListener('click',event=>{
    const btn=event.target.closest('button,a,[role="button"]');
    if(!btn)return;
    const sig=btn.dataset.v60ActionKey
      || btn.dataset.confirmMatch
      || btn.dataset.response&&`${btn.dataset.response}:${btn.dataset.id||''}`
      || btn.dataset.cancelChallenge
      || btn.dataset.rematch
      || btn.dataset.publicChallenge
      || btn.dataset.quickChallenge
      || btn.dataset.enterResult
      || btn.dataset.disputeMatch
      || ((btn.tagName==='BUTTON'||btn.tagName==='INPUT')&&String(btn.type||'').toLowerCase()==='submit'?`submit:${btn.form?.id||btn.form?.getAttribute('name')||'form'}`:'');
    if(!sig)return;
    const key=`rapid:${sig}`;
    if(lockMap.has(key)){
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    lockMap.set(key,{startedAt:Date.now()});
    btn.classList.add('v60-tap-locked');
    setTimeout(()=>{
      lockMap.delete(key);
      btn.classList.remove('v60-tap-locked');
    },900);
  },true);
}

export function recordClientErrorV60(error,context='app'){
  const message=error?.message||String(error||'Error desconocido');
  recentErrors.unshift({at:new Date().toISOString(),context,message});
  recentErrors.splice(MAX_ERRORS);
}

export function getRecentErrorsV60(){return [...recentErrors]}

export function installErrorCaptureV60(){
  window.addEventListener('error',e=>recordClientErrorV60(e.error||e.message,'window.error'));
  window.addEventListener('unhandledrejection',e=>recordClientErrorV60(e.reason,'unhandledrejection'));
}

export function createRequestCacheV60(ttlMs=1500){
  const values=new Map();
  const inflight=new Map();
  return {
    async run(key,loader,{force=false}={}){
      const k=String(key);
      const now=Date.now();
      const cached=values.get(k);
      if(!force&&cached&&now-cached.at<ttlMs)return cached.value;
      if(!force&&inflight.has(k))return inflight.get(k);
      const p=Promise.resolve().then(loader).then(value=>{
        values.set(k,{at:Date.now(),value});
        return value;
      }).finally(()=>inflight.delete(k));
      inflight.set(k,p);
      return p;
    },
    clear(key){if(key===undefined){values.clear();inflight.clear()}else{values.delete(String(key));inflight.delete(String(key))}},
    snapshot(){return {cached:values.size,inflight:inflight.size}}
  };
}

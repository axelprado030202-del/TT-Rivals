import { supabase } from './supabase.js';
import {checkAccessGateV75,checkSessionAccessV75} from './v75_access_control.js?v=1.0.1-p7.4r.3.1';
import {getInstallationIdV58} from './v58_competition.js';
export async function signUpUser({
  email,password,firstName,lastName,username,
  birthDate=null,isMinor=false,parentalPermission=false,
  legalTermsVersion=null,legalPrivacyVersion=null,
  registrationCancelToken=null
}){
  await checkAccessGateV75({email});
  return supabase.auth.signUp({
    email,
    password,
    options:{
      data:{
        first_name:firstName,
        last_name:lastName,
        username,
        birth_date:birthDate,
        is_minor_at_registration:!!isMinor,
        parental_permission_declared:!!parentalPermission,
        parental_permission_declared_at:parentalPermission?new Date().toISOString():null,
        parental_permission_terms_version:parentalPermission?legalTermsVersion:null,
        installation_id:getInstallationIdV58(),
        legal_terms_accepted:true,
        legal_privacy_acknowledged:true,
        legal_terms_version:legalTermsVersion,
        legal_privacy_version:legalPrivacyVersion,
        registration_cancel_token:registrationCancelToken
      }
    }
  });
}
export async function signInUser({email,password}){
  await checkAccessGateV75({email});
  const result=await supabase.auth.signInWithPassword({email,password});
  if(result.error||!result.data?.session)return result;
  try{
    await checkSessionAccessV75(result.data.session);
    return result;
  }catch(error){
    await supabase.auth.signOut().catch(()=>{});
    throw error;
  }
}
export const verifySessionAccessV75=checkSessionAccessV75;
export const signOutUser=()=>supabase.auth.signOut();
function decodeStoredAuthV741(raw){
  try{
    let value=String(raw||'');
    if(value.startsWith('base64-')){
      let encoded=value.slice(7).replace(/-/g,'+').replace(/_/g,'/');
      encoded=encoded.padEnd(Math.ceil(encoded.length/4)*4,'=');
      const bytes=Uint8Array.from(atob(encoded),char=>char.charCodeAt(0));
      value=new TextDecoder().decode(bytes);
    }
    const parsed=JSON.parse(value);
    return parsed?.currentSession||parsed?.session||parsed||null;
  }catch{return null}
}

function getStoredSessionV741(){
  try{
    const preferred='sb-yfwuwrpfpzhpddgkjvty-auth-token';
    const keys=[preferred,...Array.from({length:localStorage.length},(_,i)=>localStorage.key(i))]
      .filter((key,index,all)=>key&&/^sb-.*-auth-token$/.test(key)&&all.indexOf(key)===index);
    for(const key of keys){
      const candidate=decodeStoredAuthV741(localStorage.getItem(key));
      if(candidate?.access_token&&candidate?.refresh_token)return candidate;
    }
  }catch{}
  return null;
}

function withAuthTimeoutV741(promise,ms,message){
  let timer=null;
  const timeout=new Promise((_,reject)=>{
    timer=setTimeout(()=>reject(new Error(message)),Math.max(1000,Number(ms)||1000));
  });
  return Promise.race([promise,timeout]).finally(()=>{if(timer)clearTimeout(timer)});
}

function waitForInitialSessionV741(waitMs=4000){
  return new Promise(resolve=>{
    let finished=false;
    let timer=null;
    let subscription=null;
    const finish=(seen,session)=>{
      if(finished)return;
      finished=true;
      if(timer)clearTimeout(timer);
      queueMicrotask(()=>subscription?.unsubscribe?.());
      resolve({seen,session:session||null});
    };
    const listener=supabase.auth.onAuthStateChange((event,session)=>{
      if(['INITIAL_SESSION','SIGNED_IN','TOKEN_REFRESHED'].includes(event)){
        finish(true,session);
      }
    });
    subscription=listener?.data?.subscription||null;
    timer=setTimeout(()=>finish(false,null),Math.max(500,Number(waitMs)||4000));
  });
}

export async function getSession({timeoutMs=18000}={}){
  // P7.4.1: el SDK debe adoptar la sesión antes de que la app consulte
  // perfil o rating. Nunca se entrega directamente el JSON de localStorage.
  const started=Date.now();
  const initial=await waitForInitialSessionV741(Math.min(4500,timeoutMs));
  if(initial.seen)return initial.session;

  let lastError=null;
  const remaining=()=>Math.max(2500,timeoutMs-(Date.now()-started));

  try{
    const {data,error}=await withAuthTimeoutV741(
      supabase.auth.getSession(),
      remaining(),
      'Supabase demoró al recuperar la sesión.'
    );
    if(error)throw error;
    if(data?.session)return data.session;
  }catch(error){
    lastError=error;
  }

  const stored=getStoredSessionV741();
  if(stored?.access_token&&stored?.refresh_token){
    try{
      const {data,error}=await withAuthTimeoutV741(
        supabase.auth.setSession({
          access_token:stored.access_token,
          refresh_token:stored.refresh_token
        }),
        remaining(),
        'Supabase demoró al restaurar la sesión.'
      );
      if(error)throw error;
      if(data?.session)return data.session;
    }catch(error){
      lastError=error;
    }
  }

  if(lastError&&stored)throw lastError;
  return null;
}

// V53 — recuperación segura de cuenta.
// Supabase no expone la contraseña actual; se envía un enlace de recuperación
// y el usuario crea una contraseña nueva.
export async function requestPasswordReset(email){
  const target=new URL(window.location.href);
  target.search='';
  target.hash='';
  target.searchParams.set('recovery','1');

  return supabase.auth.resetPasswordForEmail(email,{
    redirectTo:target.toString()
  });
}

export async function updateRecoveredPassword(password){
  return supabase.auth.updateUser({password});
}

import { supabase } from './supabase.js';
export const signUpUser=({
  email,password,firstName,lastName,username,
  legalTermsVersion=null,legalPrivacyVersion=null
})=>supabase.auth.signUp({
  email,
  password,
  options:{
    data:{
      first_name:firstName,
      last_name:lastName,
      username,
      legal_terms_accepted:true,
      legal_privacy_acknowledged:true,
      legal_terms_version:legalTermsVersion,
      legal_privacy_version:legalPrivacyVersion
    }
  }
});
export const signInUser=({email,password})=>supabase.auth.signInWithPassword({email,password});
export const signOutUser=()=>supabase.auth.signOut();
function decodeStoredAuthV732(raw){
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

function getStoredSessionV732(){
  try{
    const preferred='sb-yfwuwrpfpzhpddgkjvty-auth-token';
    const keys=[preferred,...Array.from({length:localStorage.length},(_,i)=>localStorage.key(i))]
      .filter((key,index,all)=>key&&/^sb-.*-auth-token$/.test(key)&&all.indexOf(key)===index);
    for(const key of keys){
      const candidate=decodeStoredAuthV732(localStorage.getItem(key));
      if(candidate?.user&&candidate?.access_token&&candidate?.refresh_token)return candidate;
    }
  }catch{}
  return null;
}

export async function getSession({timeoutMs=8000}={}){
  // Supabase puede demorar al recuperar el bloqueo de Auth al reabrir una PWA.
  // La sesión local permite pintar la app inmediatamente; el SDK la valida
  // y renueva en segundo plano antes de las operaciones protegidas.
  const stored=getStoredSessionV732();
  if(stored){
    supabase.auth.getSession().catch(()=>{});
    return stored;
  }

  let timer=null;
  const timeout=new Promise((_,reject)=>{
    timer=setTimeout(()=>reject(new Error('La comprobación de sesión tardó demasiado.')),timeoutMs);
  });
  try{
    const {data,error}=await Promise.race([supabase.auth.getSession(),timeout]);
    if(error)throw error;
    return data.session;
  }finally{
    if(timer)clearTimeout(timer);
  }
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

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
export async function getSession(){const {data,error}=await supabase.auth.getSession();if(error)throw error;return data.session;}


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

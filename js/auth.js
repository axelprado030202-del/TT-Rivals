import { supabase } from './supabase.js';
export const signUpUser=({email,password,firstName,lastName,username})=>supabase.auth.signUp({email,password,options:{data:{first_name:firstName,last_name:lastName,username}}});
export const signInUser=({email,password})=>supabase.auth.signInWithPassword({email,password});
export const signOutUser=()=>supabase.auth.signOut();
export async function getSession(){const {data,error}=await supabase.auth.getSession();if(error)throw error;return data.session;}

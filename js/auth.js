import { supabase } from './supabase.js';

export async function signUpUser({ email, password, firstName, lastName, username }) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        username
      }
    }
  });
}

export async function signInUser({ email, password }) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOutUser() {
  return await supabase.auth.signOut();
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

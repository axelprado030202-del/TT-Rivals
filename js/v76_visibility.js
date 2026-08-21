import {supabase} from './supabase.js';

const cacheV76=new Map();

function cleanIdsV76(ids=[]){
  return [...new Set((ids||[]).filter(Boolean).map(String))].slice(0,500);
}

export async function getVisibleUserIdSetV76(ids=[]){
  const clean=cleanIdsV76(ids);
  if(!clean.length)return new Set();
  const key=clean.slice().sort().join(',');
  const cached=cacheV76.get(key);
  if(cached&&Date.now()-cached.at<15000)return new Set(cached.ids);
  const {data,error}=await supabase.rpc('filter_visible_user_ids_v76',{p_user_ids:clean});
  if(error)throw error;
  const visible=(data||[]).map(row=>String(row?.user_id||row)).filter(Boolean);
  cacheV76.set(key,{at:Date.now(),ids:visible});
  return new Set(visible);
}

export async function filterVisibleRowsV76(rows=[],keys=['user_id']){
  const list=Array.isArray(rows)?rows:[];
  const ids=list.map(row=>{
    for(const key of keys){
      if(row?.[key])return String(row[key]);
    }
    return null;
  }).filter(Boolean);
  const visible=await getVisibleUserIdSetV76(ids);
  return list.filter(row=>{
    for(const key of keys){
      if(row?.[key])return visible.has(String(row[key]));
    }
    return true;
  });
}

export function invalidateVisibleUsersV76(){
  cacheV76.clear();
}


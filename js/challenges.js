import { supabase } from './supabase.js';
import {createRequestCacheV60} from './v60_runtime.js?v=1.0.1-p7.4';
const challengesCacheV60=createRequestCacheV60(30000);
export async function createChallenge(x){const {data,error}=await supabase.from('challenges').insert({challenger_id:x.challengerId,challenged_id:x.challengedId,modality:'individual',match_format:x.format,match_type:x.matchType||'ranked',scheduled_date:x.scheduledDate||null,scheduled_time:x.scheduledTime||null,location:x.location||null,status:'pending'}).select().single();if(error)throw error;challengesCacheV60.clear();return data;}
export async function respondToChallenge(challengeId,action){const {data,error}=await supabase.rpc('respond_to_challenge',{p_challenge_id:challengeId,p_action:action});if(error)throw error;challengesCacheV60.clear();return data;}
export async function cancelChallenge(challengeId){const {data,error}=await supabase.rpc('cancel_challenge',{p_challenge_id:challengeId});if(error)throw error;challengesCacheV60.clear();return data;}
export async function getMyChallenges(userId,{force=false}={}){return challengesCacheV60.run(userId,async()=>{const {data:rows,error}=await supabase.from('challenges').select('*').or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`).order('created_at',{ascending:false});if(error)throw error;if(!rows?.length)return[];const ids=[...new Set(rows.flatMap(r=>[r.challenger_id,r.challenged_id]))];const {data:profiles,error:e2}=await supabase.from('profiles').select('id,username,first_name,last_name,profile_photo_url').in('id',ids);if(e2)throw e2;const map=new Map((profiles||[]).map(p=>[p.id,p]));return rows.map(r=>({...r,challenger:map.get(r.challenger_id),challenged:map.get(r.challenged_id)}));},{force});}
export function invalidateChallengesCacheV60(userId){challengesCacheV60.clear(userId)}


export async function createRematchChallengeV73(matchId,fallback){
  const {data,error}=await supabase.rpc('create_rematch_challenge_v73',{p_match_id:Number(matchId)});
  if(!error)return {
    challenge:data?.challenge||null,
    reused:!!data?.reused,
    backend:true
  };

  const unavailable=['PGRST202','42883'].includes(error.code)||/create_rematch_challenge_v73|schema cache/i.test(error.message||'');
  if(!unavailable)throw error;
  if(!fallback)throw error;

  const rows=await getMyChallenges(fallback.challengerId,{force:true}).catch(()=>[]);
  const existing=(rows||[]).find(x=>
    x.status==='pending'&&
    ((x.challenger_id===fallback.challengerId&&x.challenged_id===fallback.challengedId)||
     (x.challenger_id===fallback.challengedId&&x.challenged_id===fallback.challengerId))&&
    x.match_format===(fallback.format||'bo3')&&
    x.match_type===(fallback.matchType||'ranked')
  );
  if(existing)return {challenge:existing,reused:true,backend:false};

  const challenge=await createChallenge(fallback);
  return {challenge,reused:false,backend:false};
}

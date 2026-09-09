import webpush from 'npm:web-push@3.6.7';
import {createClient} from 'npm:@supabase/supabase-js@2';

const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});

Deno.serve(async request=>{
  const startedAt=Date.now();
  const cronSecret=Deno.env.get('TT_PUSH_CRON_SECRET')||'';
  if(!cronSecret||request.headers.get('x-tt-push-secret')!==cronSecret)return json({error:'Unauthorized'},401);

  const url=Deno.env.get('SUPABASE_URL')||'';
  const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
  const publicKey=Deno.env.get('TT_VAPID_PUBLIC_KEY')||'';
  const privateKey=Deno.env.get('TT_VAPID_PRIVATE_KEY')||'';
  const subject=Deno.env.get('TT_VAPID_SUBJECT')||'mailto:ttrivalsuy@gmail.com';
  if(!url||!serviceKey||!publicKey||!privateKey)return json({error:'Push is not configured'},503);

  const supabase=createClient(url,serviceKey,{auth:{persistSession:false}});
  webpush.setVapidDetails(subject,publicKey,privateKey);
  const {data:jobs,error}=await supabase
    .from('push_delivery_queue_v100')
    .select('id,subscription_id,payload,attempts,push_subscriptions_v100!inner(endpoint,p256dh,auth_key)')
    .eq('status','pending').lte('available_at',new Date().toISOString())
    .order('created_at',{ascending:true}).limit(50);
  if(error)return json({error:error.message},500);

  let processed=0,sent=0,failed=0,expired=0,claimErrors=0;
  async function deliver(job:NonNullable<typeof jobs>[number]){
    const sub=Array.isArray(job.push_subscriptions_v100)?job.push_subscriptions_v100[0]:job.push_subscriptions_v100;
    if(!sub)return;
    // El aviso inmediato y Cron pueden coincidir. Solo quien cambia una fila
    // todavía pendiente a "sending" obtiene permiso para enviarla.
    const {data:claimed,error:claimError}=await supabase.from('push_delivery_queue_v100')
      .update({status:'sending',attempts:Number(job.attempts||0)+1})
      .eq('id',job.id).eq('status','pending').select('id').maybeSingle();
    if(claimError){claimErrors++;return;}
    if(!claimed)return;
    processed++;
    try{
      await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth_key}},JSON.stringify(job.payload),{
        TTL:3600,
        urgency:job.payload?.type==='challenge_received'?'high':'normal',
        timeout:10000
      });
      await supabase.from('push_delivery_queue_v100').update({status:'sent',sent_at:new Date().toISOString(),last_error:null}).eq('id',job.id);
      sent++;
    }catch(error){
      const status=Number((error as {statusCode?:number})?.statusCode||0);
      if(status===404||status===410){
        await supabase.from('push_subscriptions_v100').delete().eq('id',job.subscription_id);
        expired++;
      }else{
        await supabase.from('push_delivery_queue_v100').update({status:'failed',last_error:String((error as Error)?.message||error).slice(0,800)}).eq('id',job.id);
        failed++;
      }
    }
  }
  // Un teléfono lento no retrasa todos los demás dispositivos de la tanda.
  const pending=jobs||[];
  for(let i=0;i<pending.length;i+=4){
    await Promise.all(pending.slice(i,i+4).map(deliver));
  }
  return json({version:'1.0.2',processed,sent,failed,expired,claim_errors:claimErrors,duration_ms:Date.now()-startedAt},claimErrors?500:200);
});

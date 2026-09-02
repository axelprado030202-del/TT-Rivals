import {supabase} from './supabase.js';
import {filterVisibleRowsV76} from './v76_visibility.js';
import {getClubsV51,getMyClubV51} from './profile.js?v=1.0.1-p7.4r.3';

// TT-Rivals Versión 1.0 — módulo aislado de comunidad.
// Si este archivo falla, el núcleo competitivo de TT Rivals sigue iniciando.

const COUNTRY_CODES=['AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ','BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ','CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ','DE','DJ','DK','DM','DO','DZ','EC','EE','EG','EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR','GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY','HK','HM','HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM','JO','JP','KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY','MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY','QA','RE','RO','RS','RU','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','UM','US','UY','UZ','VA','VC','VE','VG','VI','VN','VU','WF','WS','YE','YT','ZA','ZM','ZW'];
const PINNED_COUNTRIES=['UY','AR','BR','CL','PY','BO','PE','ES','US','MX'];
const URUGUAY_DEPARTMENTS=['Artigas','Canelones','Cerro Largo','Colonia','Durazno','Flores','Florida','Lavalleja','Maldonado','Montevideo','Paysandú','Río Negro','Rivera','Rocha','Salto','San José','Soriano','Tacuarembó','Treinta y Tres'];

const PLACE_TYPES={
  table_tennis_club:'Club de tenis de mesa',sports_social_club:'Club deportivo / social',sports_center:'Polideportivo',
  community_hall:'Salón comunal / vecinal',park_plaza:'Plaza / parque',youth_center:'Centro juvenil',school:'Escuela',
  secondary_school:'Liceo / colegio',university:'Universidad / centro educativo',gym:'Gimnasio',municipal_complex:'Complejo municipal',
  community_center:'Centro comunitario',cultural_center:'Centro cultural / barrial',civil_association:'Asociación civil',
  table_tennis_academy:'Academia / escuela de tenis de mesa',hotel_recreation:'Hotel / complejo recreativo',
  commercial_venue:'Local comercial con mesas',other:'Otro'
};
const ACCESS_TYPES={free:'Gratuito',pay_per_use:'Pago por uso',monthly_fee:'Cuota mensual',table_rental:'Alquiler de mesa',members_only:'Solo socios',consult:'Consultar'};
const ACCESS_ICONS={free:'🟢',pay_per_use:'🔵',monthly_fee:'🟣',table_rental:'🟠',members_only:'🟡',consult:'⚪'};

const state={
  clubs:[],meta:new Map(),selectedClub:null,noClub:false,requestMode:false,placeClub:null,
  settingsSelectedClub:null,settingsNoClub:false,settingsRequestMode:false,
  initialized:false,settingsInitialized:false,placesInitialized:false,adminInitialized:false,identity:null,mergeContext:null
};

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const bool=v=>v===true||v==='true';

function countryName(code){
  try{return new Intl.DisplayNames(['es'],{type:'region'}).of(code)||code}catch{return code}
}
function countryOptions(selected='UY',includeAll=true){
  const sorted=[...PINNED_COUNTRIES,...COUNTRY_CODES.filter(c=>!PINNED_COUNTRIES.includes(c))];
  return sorted.map(c=>`<option value="${c}" ${c===selected?'selected':''}>${c==='UY'?'🇺🇾 ':''}${esc(countryName(c))}</option>`).join('');
}
function regionLabel(code){
  return ({UY:'Departamento',AR:'Provincia',BR:'Estado',US:'Estado',MX:'Estado',ES:'Provincia / comunidad',CL:'Región',PY:'Departamento',BO:'Departamento',PE:'Región'})[code]||'Región / provincia / estado';
}
function setStatus(el,msg,type=''){if(!el)return;el.textContent=msg||'';el.className=`status ${type}`.trim()}
function setModal(el,open){if(!el)return;el.classList.toggle('hidden',!open)}
function titleCase(s){return String(s||'').replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase())}

async function rpc(name,args={}){
  const {data,error}=await supabase.rpc(name,args);if(error)throw error;return data;
}

async function loadClubData(force=false){
  if(state.clubs.length&&!force)return state.clubs;
  const [clubs,metadata]=await Promise.all([
    getClubsV51(),
    rpc('list_club_metadata_v100').catch(()=>[])
  ]);
  state.meta=new Map((metadata||[]).map(x=>[String(x.club_id),x]));
  state.clubs=(clubs||[]).map(c=>{
    const m=state.meta.get(String(c.id));
    return {...c,country_code:m?.country_code||'UY',region_name:m?.region_name||c.department||'',city_name:m?.city_name||c.locality||'',verified:m?.verified||false};
  });
  return state.clubs;
}

function clubsForCountry(code){return state.clubs.filter(c=>(c.country_code||'UY')===code)}
function clubSearchRows(query,country,limit=12){
  const q=norm(query);const rows=clubsForCountry(country);
  if(!q)return rows.slice(0,limit);
  return rows.filter(c=>norm([c.name,c.display_alias,c.region_name,c.city_name,c.department,c.locality].join(' ')).includes(q)).slice(0,limit);
}
function clubLocation(c){return [c.city_name,c.region_name].filter((x,i,a)=>x&&a.indexOf(x)===i).join(' · ')}

function updateRegionLabelsV100(code){
  const label=regionLabel(code);
  const a=$('#clubRequestRegionLabelV100');if(a){const node=a.childNodes[0];if(node)node.nodeValue=label;}
  const b=$('#placeRegionLabelV100');if(b){const node=b.childNodes[0];if(node)node.nodeValue=label;}
}

function renderSelectedClubV100(){
  const box=$('#clubSelectedV100');if(!box)return;
  if(state.noClub){box.innerHTML='<div><strong>Sin club / N/A</strong><small>Podés cambiarlo más adelante.</small></div><button type="button" data-clear-club-v100>✕</button>';box.classList.remove('hidden');return}
  if(!state.selectedClub){box.classList.add('hidden');box.innerHTML='';return}
  const c=state.selectedClub;
  box.innerHTML=`<div><strong>✓ ${esc(c.display_alias||c.name)}</strong><small>${esc(clubLocation(c)||countryName(c.country_code))}</small></div><button type="button" data-clear-club-v100>✕</button>`;
  box.classList.remove('hidden');
}

function selectClubV100(id,context='onboarding'){
  const c=state.clubs.find(x=>String(x.id)===String(id));if(!c)return;
  if(context==='place'){state.placeClub=c;renderPlaceSelectedClubV100();$('#placeClubResultsV100')?.classList.add('hidden');return}
  state.selectedClub=c;state.noClub=false;state.requestMode=false;
  $('#clubRequestPanelV100')?.classList.add('hidden');
  const hidden=$('#clubName');
  if(hidden){
    if(![...hidden.options].some(o=>String(o.value)===String(c.id)))hidden.add(new Option(c.name,String(c.id)));
    hidden.value=String(c.id);
  }
  if($('#clubSearchV100'))$('#clubSearchV100').value='';
  $('#clubSearchResultsV100')?.classList.add('hidden');renderSelectedClubV100();
}

function renderClubResultsV100(context='onboarding'){
  const isPlace=context==='place';
  const input=$(isPlace?'#placeClubSearchV100':'#clubSearchV100');
  const box=$(isPlace?'#placeClubResultsV100':'#clubSearchResultsV100');if(!input||!box)return;
  const country=$(isPlace?'#placeCountryFormV100':'#sportsCountryV100')?.value||'UY';
  const rows=clubSearchRows(input.value,country,12);
  if(!input.value.trim()&&!isPlace){box.classList.add('hidden');return}
  box.innerHTML=rows.length?rows.map(c=>`<button type="button" data-v100-use-club="${c.id}" data-v100-club-context="${context}"><div><strong>${esc(c.display_alias||c.name)}</strong><small>${esc(clubLocation(c)||countryName(c.country_code))}</small></div><b>USAR</b></button>`).join(''):`<div class="club-empty-v100"><strong>No encontramos coincidencias.</strong><small>${isPlace?'Podés dejar el club vacío.':'Usá “Mi club no aparece” para solicitarlo.'}</small></div>`;
  box.classList.remove('hidden');
  if(!isPlace)renderSimilarRequestClubsV100();
}

function renderSimilarRequestClubsV100(){
  const box=$('#clubRequestSimilarV100');if(!box||!state.requestMode)return;
  const q=$('#clubRequestNameV100')?.value||$('#clubSearchV100')?.value||'';
  const country=$('#sportsCountryV100')?.value||'UY';
  const rows=clubSearchRows(q,country,5);
  if(q.trim().length<2||!rows.length){box.innerHTML='';return}
  box.innerHTML=`<span>¿Puede ser alguno de estos?</span>${rows.map(c=>`<button type="button" data-v100-use-club="${c.id}" data-v100-club-context="onboarding"><strong>${esc(c.display_alias||c.name)}</strong><small>${esc(clubLocation(c))}</small></button>`).join('')}`;
}

function syncClubDirectoryHintV100(){
  const code=$('#sportsCountryV100')?.value||'UY';const n=clubsForCountry(code).length;const hint=$('#clubDirectoryHintV100');
  if(hint)hint.textContent=n?`${n} club${n===1?'':'es'} registrado${n===1?'':'s'} en ${countryName(code)}.`:`Todavía no hay clubes aprobados de ${countryName(code)}. Podés solicitar el primero.`;
}

function setNoClubV100(){
  state.selectedClub=null;state.noClub=true;state.requestMode=false;
  const hidden=$('#clubName');if(hidden)hidden.value='N/A';
  $('#clubRequestPanelV100')?.classList.add('hidden');$('#clubSearchResultsV100')?.classList.add('hidden');renderSelectedClubV100();
}
function clearClubV100(){state.selectedClub=null;state.noClub=false;state.requestMode=false;const h=$('#clubName');if(h)h.value='';renderSelectedClubV100()}
function toggleClubRequestV100(force){
  state.requestMode=force??!state.requestMode;state.selectedClub=null;state.noClub=false;renderSelectedClubV100();
  $('#clubRequestPanelV100')?.classList.toggle('hidden',!state.requestMode);
  $('#clubSearchResultsV100')?.classList.add('hidden');
  const h=$('#clubName');if(h)h.value='';
  if(state.requestMode){
    const q=$('#clubSearchV100')?.value?.trim();if(q&&!$('#clubRequestNameV100')?.value)$('#clubRequestNameV100').value=q;
    updateRegionLabelsV100($('#sportsCountryV100')?.value||'UY');renderSimilarRequestClubsV100();
    setTimeout(()=>$('#clubRequestNameV100')?.focus(),50);
  }
}

function setFederationStatusV100(value){
  const hidden=$('#federationStatusV100');if(hidden)hidden.value=value;
  document.querySelectorAll('[data-federation-v100]').forEach(b=>b.classList.toggle('active',b.dataset.federationV100===value));
  $('#federationDetailsV100')?.classList.toggle('hidden',value!=='federated');
}

export async function initOnboardingV100(){
  const country=$('#sportsCountryV100');if(!country)return;
  if(!country.options.length)country.innerHTML=countryOptions('UY');
  if(!$('#federationStatusV100')?.value)setFederationStatusV100('non_federated');
  if(!state.initialized){
    state.initialized=true;
    country.addEventListener('change',()=>{clearClubV100();syncClubDirectoryHintV100();updateRegionLabelsV100(country.value);renderClubResultsV100();});
    $('#clubSearchV100')?.addEventListener('input',()=>renderClubResultsV100('onboarding'));
    $('#clubRequestNameV100')?.addEventListener('input',renderSimilarRequestClubsV100);
    $('#clubNoClubV100')?.addEventListener('click',setNoClubV100);
    $('#clubRequestToggleV100')?.addEventListener('click',()=>toggleClubRequestV100());
    document.querySelectorAll('[data-federation-v100]').forEach(b=>b.addEventListener('click',()=>setFederationStatusV100(b.dataset.federationV100)));
  }
  try{
    await loadClubData(true);
    syncClubDirectoryHintV100();
    const identity=await rpc('get_my_sports_identity_v100').catch(()=>null);state.identity=identity;
    if(identity?.country_code&&country.querySelector(`option[value="${identity.country_code}"]`))country.value=identity.country_code;
    setFederationStatusV100(identity?.exists===false?'non_federated':(identity?.federation_status||'non_federated'));
    if(identity?.federation_name&&$('#federationNameV100'))$('#federationNameV100').value=identity.federation_name;
    if(identity?.federation_license&&$('#federationLicenseV100'))$('#federationLicenseV100').value=identity.federation_license;
    updateRegionLabelsV100(country.value);syncClubDirectoryHintV100();
  }catch(err){console.warn('TT V1.0 onboarding',err);syncClubDirectoryHintV100();}
}

export async function resolveSportsProfileV100(){
  await loadClubData();
  const country=$('#sportsCountryV100')?.value||'UY';
  const federation=$('#federationStatusV100')?.value||'';
  if(!federation)throw new Error('Indicá si sos federado o no federado.');
  let clubResult;
  if(state.selectedClub)clubResult={club_id:Number(state.selectedClub.id),name:state.selectedClub.name,created:false,pending:false};
  else if(state.noClub)clubResult={club_id:null,name:'N/A',created:false,pending:false};
  else if(state.requestMode){
    const name=$('#clubRequestNameV100')?.value?.trim()||'';
    const region=$('#clubRequestRegionV100')?.value?.trim()||'';
    const city=$('#clubRequestCityV100')?.value?.trim()||'';
    if(name.length<2)throw new Error('Escribí el nombre del club que querés solicitar.');
    if(!region)throw new Error(`Completá ${regionLabel(country).toLowerCase()} del club.`);
    if(!city)throw new Error('Completá la ciudad o localidad del club.');
    const req=await rpc('request_club_v100',{
      p_name:name,p_country_code:country,p_region_name:region,p_city_name:city,
      p_website:$('#clubRequestWebsiteV100')?.value?.trim()||null,p_social_contact:null,
      p_notes:$('#clubRequestNotesV100')?.value?.trim()||null
    });
    clubResult={club_id:null,name:'N/A',created:false,pending:true,request:req,requested_name:name};
  }else throw new Error('Elegí tu club, seleccioná “Sin club / N/A” o solicitá el registro de tu club.');

  return {
    clubResult,countryCode:country,federationStatus:federation,
    federationName:$('#federationNameV100')?.value?.trim()||null,
    federationLicense:$('#federationLicenseV100')?.value?.trim()||null
  };
}

export async function saveSportsIdentityV100(data){
  return rpc('save_my_sports_identity_v100',{
    p_country_code:data.countryCode,p_federation_status:data.federationStatus,
    p_federation_name:data.federationName||null,p_federation_license:data.federationLicense||null
  });
}


function renderSettingsSelectedClubV100(){
  const box=$('#prefClubSelectedV100');if(!box)return;
  if(state.settingsNoClub){box.innerHTML='<div><strong>Sin club / N/A</strong><small>No pertenecés a un club actualmente.</small></div><button type="button" data-clear-settings-club-v100>✕</button>';box.classList.remove('hidden');return}
  if(!state.settingsSelectedClub){box.classList.add('hidden');box.innerHTML='';return}
  const c=state.settingsSelectedClub;
  box.innerHTML=`<div><strong>✓ ${esc(c.display_alias||c.name)}</strong><small>${esc(clubLocation(c)||countryName(c.country_code))}</small></div><button type="button" data-clear-settings-club-v100>✕</button>`;
  box.classList.remove('hidden');
}
function selectSettingsClubV100(id){
  const c=state.clubs.find(x=>String(x.id)===String(id));if(!c)return;
  state.settingsSelectedClub=c;state.settingsNoClub=false;state.settingsRequestMode=false;
  $('#prefClubRequestPanelV100')?.classList.add('hidden');
  const hidden=$('#prefProfileClubSelect');
  if(hidden){if(![...hidden.options].some(o=>String(o.value)===String(c.id)))hidden.add(new Option(c.name,String(c.id)));hidden.value=String(c.id)}
  if($('#prefClubSearchV100'))$('#prefClubSearchV100').value='';
  $('#prefClubResultsV100')?.classList.add('hidden');renderSettingsSelectedClubV100();
}
function renderSettingsClubResultsV100(){
  const input=$('#prefClubSearchV100'),box=$('#prefClubResultsV100');if(!input||!box)return;
  const country=$('#prefProfileCountryV100')?.value||'UY';const rows=clubSearchRows(input.value,country,12);
  if(!input.value.trim()){box.classList.add('hidden');return}
  box.innerHTML=rows.length?rows.map(c=>`<button type="button" data-v100-use-club="${c.id}" data-v100-club-context="settings"><div><strong>${esc(c.display_alias||c.name)}</strong><small>${esc(clubLocation(c)||countryName(c.country_code))}</small></div><b>USAR</b></button>`).join(''):`<div class="club-empty-v100"><strong>No encontramos coincidencias.</strong><small>Usá “Mi club no aparece” para solicitarlo.</small></div>`;
  box.classList.remove('hidden');renderSettingsSimilarRequestClubsV100();
}
function renderSettingsSimilarRequestClubsV100(){
  const box=$('#prefClubRequestSimilarV100');if(!box||!state.settingsRequestMode)return;
  const q=$('#prefClubRequestNameV100')?.value||$('#prefClubSearchV100')?.value||'';const country=$('#prefProfileCountryV100')?.value||'UY';
  const rows=clubSearchRows(q,country,5);if(q.trim().length<2||!rows.length){box.innerHTML='';return}
  box.innerHTML=`<span>¿Puede ser alguno de estos?</span>${rows.map(c=>`<button type="button" data-v100-use-club="${c.id}" data-v100-club-context="settings"><strong>${esc(c.display_alias||c.name)}</strong><small>${esc(clubLocation(c))}</small></button>`).join('')}`;
}
function syncSettingsClubDirectoryHintV100(extra=''){
  const code=$('#prefProfileCountryV100')?.value||'UY',n=clubsForCountry(code).length,hint=$('#prefProfileClubHintV100');if(!hint)return;
  hint.textContent=extra||(n?`${n} club${n===1?'':'es'} registrado${n===1?'':'s'} en ${countryName(code)}.`:`Todavía no hay clubes aprobados de ${countryName(code)}. Podés solicitar el primero.`);
}
function setSettingsNoClubV100(){
  state.settingsSelectedClub=null;state.settingsNoClub=true;state.settingsRequestMode=false;
  const h=$('#prefProfileClubSelect');if(h)h.value='N/A';
  $('#prefClubRequestPanelV100')?.classList.add('hidden');$('#prefClubResultsV100')?.classList.add('hidden');renderSettingsSelectedClubV100();
}
function clearSettingsClubV100(){state.settingsSelectedClub=null;state.settingsNoClub=false;state.settingsRequestMode=false;const h=$('#prefProfileClubSelect');if(h)h.value='';renderSettingsSelectedClubV100()}
function toggleSettingsClubRequestV100(force){
  state.settingsRequestMode=force??!state.settingsRequestMode;state.settingsSelectedClub=null;state.settingsNoClub=false;renderSettingsSelectedClubV100();
  $('#prefClubRequestPanelV100')?.classList.toggle('hidden',!state.settingsRequestMode);$('#prefClubResultsV100')?.classList.add('hidden');
  const h=$('#prefProfileClubSelect');if(h)h.value='';
  if(state.settingsRequestMode){const q=$('#prefClubSearchV100')?.value?.trim();if(q&&!$('#prefClubRequestNameV100')?.value)$('#prefClubRequestNameV100').value=q;updateSettingsRegionLabelV100();renderSettingsSimilarRequestClubsV100();setTimeout(()=>$('#prefClubRequestNameV100')?.focus(),50)}
}
function updateSettingsRegionLabelV100(){
  const label=regionLabel($('#prefProfileCountryV100')?.value||'UY'),el=$('#prefClubRequestRegionLabelV100');if(el){const n=el.childNodes[0];if(n)n.nodeValue=label}
}
function setSettingsFederationStatusV100(value){
  const hidden=$('#prefFederationStatusV100');if(hidden)hidden.value=value;
  document.querySelectorAll('[data-pref-federation-v100]').forEach(b=>b.classList.toggle('active',b.dataset.prefFederationV100===value));
  $('#prefFederationDetailsV100')?.classList.toggle('hidden',value!=='federated');
}
export async function initSettingsProfileV100(){
  const country=$('#prefProfileCountryV100');if(!country)return;
  if(!country.options.length)country.innerHTML=countryOptions('UY');
  if(!state.settingsInitialized){
    state.settingsInitialized=true;
    country.addEventListener('change',()=>{clearSettingsClubV100();syncSettingsClubDirectoryHintV100();updateSettingsRegionLabelV100();renderSettingsClubResultsV100()});
    $('#prefClubSearchV100')?.addEventListener('input',renderSettingsClubResultsV100);
    $('#prefClubRequestNameV100')?.addEventListener('input',renderSettingsSimilarRequestClubsV100);
    $('#prefClubNoClubV100')?.addEventListener('click',setSettingsNoClubV100);
    $('#prefClubRequestToggleV100')?.addEventListener('click',()=>toggleSettingsClubRequestV100());
    document.querySelectorAll('[data-pref-federation-v100]').forEach(b=>b.addEventListener('click',()=>setSettingsFederationStatusV100(b.dataset.prefFederationV100)));
  }
  try{
    await loadClubData(true);
    const [identity,current,pending]=await Promise.all([
      rpc('get_my_sports_identity_v100').catch(()=>null),
      getMyClubV51().catch(()=>({club_id:null,name:'N/A'})),
      rpc('get_my_club_requests_v100').catch(()=>[])
    ]);
    state.identity=identity;
    country.value=identity?.country_code&&country.querySelector(`option[value="${identity.country_code}"]`)?identity.country_code:'UY';
    setSettingsFederationStatusV100(identity?.exists===false?'':(identity?.federation_status||''));
    if($('#prefFederationNameV100'))$('#prefFederationNameV100').value=identity?.federation_name||'';
    if($('#prefFederationLicenseV100'))$('#prefFederationLicenseV100').value=identity?.federation_license||'';
    state.settingsSelectedClub=current?.club_id?state.clubs.find(c=>String(c.id)===String(current.club_id))||null:null;
    state.settingsNoClub=!state.settingsSelectedClub;
    state.settingsRequestMode=false;
    renderSettingsSelectedClubV100();updateSettingsRegionLabelV100();
    const pendingReq=(pending||[]).find(x=>x.status==='pending');
    syncSettingsClubDirectoryHintV100(pendingReq?`Solicitud pendiente: ${pendingReq.requested_name||pendingReq.name||'club'}. Podés mantener N/A hasta que Administración la resuelva.`:'');
  }catch(err){console.warn('TT V1.0 settings profile',err);syncSettingsClubDirectoryHintV100()}
}
export async function resolveSettingsSportsProfileV100(){
  await loadClubData();
  const country=$('#prefProfileCountryV100')?.value||'UY',federation=$('#prefFederationStatusV100')?.value||'';
  if(!federation)throw new Error('Indicá si sos federado o no federado.');
  let clubResult;
  if(state.settingsSelectedClub)clubResult={club_id:Number(state.settingsSelectedClub.id),name:state.settingsSelectedClub.name,created:false,pending:false};
  else if(state.settingsNoClub)clubResult={club_id:null,name:'N/A',created:false,pending:false};
  else if(state.settingsRequestMode){
    const name=$('#prefClubRequestNameV100')?.value?.trim()||'',region=$('#prefClubRequestRegionV100')?.value?.trim()||'',city=$('#prefClubRequestCityV100')?.value?.trim()||'';
    if(name.length<2)throw new Error('Escribí el nombre del club que querés solicitar.');
    if(!region)throw new Error(`Completá ${regionLabel(country).toLowerCase()} del club.`);if(!city)throw new Error('Completá la ciudad o localidad del club.');
    const req=await rpc('request_club_v100',{p_name:name,p_country_code:country,p_region_name:region,p_city_name:city,p_website:$('#prefClubRequestWebsiteV100')?.value?.trim()||null,p_social_contact:null,p_notes:$('#prefClubRequestNotesV100')?.value?.trim()||null});
    clubResult={club_id:null,name:'N/A',created:false,pending:true,request:req,requested_name:name};
  }else throw new Error('Elegí tu club, seleccioná “Sin club / N/A” o solicitá el registro de tu club.');
  return {clubResult,countryCode:country,federationStatus:federation,federationName:$('#prefFederationNameV100')?.value?.trim()||null,federationLicense:$('#prefFederationLicenseV100')?.value?.trim()||null};
}

export async function loadOwnSportsIdentityV100(){
  try{
    const x=await rpc('get_my_sports_identity_v100');state.identity=x;
    if($('#profileCountryV100'))$('#profileCountryV100').textContent=countryName(x?.country_code||'UY');
    if($('#profileFederationV100'))$('#profileFederationV100').textContent=x?.federation_status==='federated'?`🏓 Federado${x.federation_name?` · ${x.federation_name}`:''}`:'🎮 No federado';
    return x;
  }catch(err){
    if($('#profileCountryV100'))$('#profileCountryV100').textContent='—';
    if($('#profileFederationV100'))$('#profileFederationV100').textContent='—';
    return null;
  }
}

function fillSelectOptionsV100(){
  const typeOptions=Object.entries(PLACE_TYPES).map(([v,l])=>`<option value="${v}">${esc(l)}</option>`).join('');
  const accessOptions=Object.entries(ACCESS_TYPES).map(([v,l])=>`<option value="${v}">${esc(l)}</option>`).join('');
  const types=$('#placesTypeV100');if(types&&types.options.length<=1)types.insertAdjacentHTML('beforeend',typeOptions);
  const access=$('#placesAccessV100');if(access&&access.options.length<=1)access.insertAdjacentHTML('beforeend',accessOptions);
  const formType=$('#placeTypeFormV100');if(formType&&!formType.options.length)formType.innerHTML='<option value="">Seleccioná</option>'+typeOptions;
  const formAccess=$('#placeAccessV100');if(formAccess&&!formAccess.options.length)formAccess.innerHTML=accessOptions;
}

function renderPlaceSelectedClubV100(){
  const box=$('#placeClubSelectedV100');if(!box)return;
  if(!state.placeClub){box.classList.add('hidden');box.innerHTML='';return}
  box.innerHTML=`<div><strong>✓ ${esc(state.placeClub.display_alias||state.placeClub.name)}</strong><small>${esc(clubLocation(state.placeClub))}</small></div><button type="button" data-clear-place-club-v100>✕</button>`;box.classList.remove('hidden');
}

function accessTextV100(p){
  let text=`${ACCESS_ICONS[p.access_type]||'⚪'} ${ACCESS_TYPES[p.access_type]||'Consultar'}`;
  if(p.price_amount!==null&&p.price_amount!==undefined&&Number(p.price_amount)>0)text+=` · ${p.price_currency||''} ${Number(p.price_amount).toLocaleString('es-UY')}`;
  return text;
}
function relativeDateV100(v){
  if(!v)return 'Sin verificación reciente';const d=new Date(v),days=Math.max(0,Math.floor((Date.now()-d.getTime())/86400000));
  if(days===0)return 'Actualizado hoy';if(days===1)return 'Actualizado ayer';if(days<30)return `Actualizado hace ${days} días`;return `Actualizado hace ${Math.floor(days/30)} mes${Math.floor(days/30)===1?'':'es'}`;
}
function featureChipsV100(p){
  const a=[];if(p.tables_count)a.push(`🏓 ${p.tables_count} mesa${Number(p.tables_count)===1?'':'s'}`);if(bool(p.indoor))a.push('🏠 Interior');
  if(bool(p.lessons_available))a.push('👨‍🏫 Clases');if(bool(p.recreational_play))a.push('🎮 Recreativo');if(bool(p.competitive_training))a.push('🏆 Competitivo');
  if(bool(p.accessibility))a.push('♿ Accesible');return a.slice(0,6);
}
function renderPracticePlacesV100(rows){
  const box=$('#practicePlacesListV100');if(!box)return;
  box.innerHTML=rows.length?rows.map(p=>`<article class="practice-place-card-v100">
    <div class="practice-place-card-head-v100"><div><span>${p.place_type==='park_plaza'?'🌳':p.place_type==='table_tennis_club'?'🏓':'📍'}</span><div><strong>${esc(p.name)}</strong><small>${esc([p.city_name,p.region_name,countryName(p.country_code)].filter(Boolean).join(' · '))}</small></div></div><b>${esc(PLACE_TYPES[p.place_type]||'Lugar')}</b></div>
    <div class="practice-place-access-v100">${esc(accessTextV100(p))}</div>
    ${p.address?`<p class="practice-place-address-v100">📌 ${esc(p.address)}</p>`:''}
    ${p.schedule_text?`<p class="practice-place-schedule-v100">🕐 ${esc(p.schedule_text)}</p>`:''}
    <div class="practice-place-chips-v100">${featureChipsV100(p).map(x=>`<span>${esc(x)}</span>`).join('')}</div>
    <div class="practice-place-card-foot-v100"><small>✓ ${esc(relativeDateV100(p.last_verified_at))}</small><button type="button" data-report-place-v100="${p.id}">⚑ Reportar información</button></div>
  </article>`).join(''):'<div class="section-card compact-empty"><strong>No encontramos lugares con esos filtros.</strong><span>Podés ser la primera persona en añadir uno.</span></div>';
}

async function loadMyPlaceSubmissionsV100(){
  const box=$('#myPracticeSubmissionsV100');if(!box)return;
  try{const rows=await rpc('get_my_practice_place_submissions_v100')||[];const active=rows.filter(x=>x.status==='pending').slice(0,4);box.classList.toggle('hidden',!active.length);if(active.length)box.innerHTML=`<p class="muted-label">TUS APORTES</p><h3>Pendientes de revisión</h3><div class="my-place-pending-list-v100">${active.map(x=>`<div><strong>${esc(x.name)}</strong><small>${esc([x.city_name,x.region_name].filter(Boolean).join(' · '))}</small><span>🕐 Pendiente</span></div>`).join('')}</div>`;}catch{box.classList.add('hidden')}
}

export async function loadPlacesV100(){
  const box=$('#practicePlacesListV100');if(!box)return;
  fillSelectOptionsV100();
  if(!state.placesInitialized){
    state.placesInitialized=true;
    const identity=state.identity||await rpc('get_my_sports_identity_v100').catch(()=>({country_code:'UY'}));
    const pc=$('#placesCountryV100');if(pc)pc.innerHTML=countryOptions(identity?.country_code||'UY');
    ['#placesCountryV100','#placesTypeV100','#placesAccessV100'].forEach(sel=>$(sel)?.addEventListener('change',()=>loadPlacesV100()));
    let timer;$('#placesSearchV100')?.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(loadPlacesV100,220)});
    $('#openAddPracticePlaceV100')?.addEventListener('click',openPracticePlaceModalV100);
    $('#closePracticePlaceModalV100')?.addEventListener('click',closePracticePlaceModalV100);
    $('#practicePlaceModalV100')?.addEventListener('click',e=>{if(e.target.id==='practicePlaceModalV100')closePracticePlaceModalV100()});
    $('#practicePlaceFormV100')?.addEventListener('submit',submitPracticePlaceFormV100);
    $('#placeClubSearchV100')?.addEventListener('input',()=>renderClubResultsV100('place'));
    $('#placeCountryFormV100')?.addEventListener('change',()=>{state.placeClub=null;renderPlaceSelectedClubV100();updateRegionLabelsV100($('#placeCountryFormV100').value);if($('#placeCurrencyV100'))$('#placeCurrencyV100').value=$('#placeCountryFormV100').value==='UY'?'UYU':'';});
  }
  box.innerHTML='<div class="loading-row">Buscando lugares…</div>';
  try{
    const rows=await rpc('list_practice_places_v100',{
      p_country_code:$('#placesCountryV100')?.value||'UY',p_query:$('#placesSearchV100')?.value?.trim()||null,
      p_place_type:$('#placesTypeV100')?.value||null,p_access_type:$('#placesAccessV100')?.value||null,p_limit:120
    })||[];renderPracticePlacesV100(rows);await loadMyPlaceSubmissionsV100();
  }catch(err){box.innerHTML=`<div class="section-card compact-empty"><strong>No se pudo cargar Dónde practicar.</strong><span>${esc(err.message||'Verificá que el backend Versión 1.0 esté instalado.')}</span></div>`}
}

async function openPracticePlaceModalV100(){
  await loadClubData(true).catch(()=>[]);fillSelectOptionsV100();
  const identity=state.identity||await rpc('get_my_sports_identity_v100').catch(()=>({country_code:'UY'}));
  const country=$('#placeCountryFormV100');if(country)country.innerHTML=countryOptions(identity?.country_code||'UY');
  state.placeClub=null;renderPlaceSelectedClubV100();updateRegionLabelsV100(country?.value||'UY');
  setStatus($('#practicePlaceFormStatusV100'),'');setModal($('#practicePlaceModalV100'),true);setTimeout(()=>$('#placeNameV100')?.focus(),60);
}
function closePracticePlaceModalV100(){setModal($('#practicePlaceModalV100'),false)}

async function submitPracticePlaceFormV100(e){
  e.preventDefault();const form=e.currentTarget;const st=$('#practicePlaceFormStatusV100');const btn=form.querySelector('[type="submit"]');
  const name=$('#placeNameV100')?.value?.trim()||'',type=$('#placeTypeFormV100')?.value||'',country=$('#placeCountryFormV100')?.value||'UY';
  if(name.length<2)return setStatus(st,'Escribí el nombre del lugar.','error');if(!type)return setStatus(st,'Elegí el tipo de lugar.','error');
  if(!$('#placeRegionV100')?.value?.trim()||!$('#placeCityV100')?.value?.trim())return setStatus(st,'Completá región/departamento y ciudad/localidad.','error');
  btn.disabled=true;setStatus(st,'Enviando para revisión…');
  try{
    const payload={name,place_type:type,country_code:country,region_name:$('#placeRegionV100').value.trim(),city_name:$('#placeCityV100').value.trim(),address:$('#placeAddressV100').value.trim()||null,
      club_id:state.placeClub?.id||null,club_name:state.placeClub?.display_alias||state.placeClub?.name||null,access_type:$('#placeAccessV100').value||'consult',price_amount:$('#placePriceV100').value||null,
      price_currency:$('#placeCurrencyV100').value.trim().toUpperCase()||null,reservation_policy:$('#placeReservationV100').value||'consult',schedule_text:$('#placeScheduleV100').value.trim()||null,tables_count:$('#placeTablesV100').value||null,
      indoor:$('#placeIndoorV100').checked,lighting:$('#placeLightingV100').checked,paddles_available:$('#placePaddlesV100').checked,balls_available:$('#placeBallsV100').checked,changing_rooms:$('#placeChangingV100').checked,
      accessibility:$('#placeAccessibilityV100').checked,minors_allowed:$('#placeMinorsV100').checked,adults_allowed:$('#placeAdultsV100').checked,competitive_training:$('#placeCompetitiveV100').checked,recreational_play:$('#placeRecreationalV100').checked,lessons_available:$('#placeLessonsV100').checked,
      phone:$('#placePhoneV100').value.trim()||null,whatsapp:$('#placeWhatsappV100').value.trim()||null,instagram:$('#placeInstagramV100').value.trim()||null,website:$('#placeWebsiteV100').value.trim()||null,notes:$('#placeNotesV100').value.trim()||null};
    await rpc('submit_practice_place_v100',{p_payload:payload});form.reset();state.placeClub=null;setStatus(st,'✓ Lugar enviado. Quedó pendiente de aprobación.','ok');setTimeout(()=>{closePracticePlaceModalV100();loadPlacesV100()},800);
  }catch(err){setStatus(st,err.message||'No se pudo enviar el lugar.','error')}finally{btn.disabled=false}
}

async function reportPlaceV100(id){
  const reason=prompt('¿Qué información está incorrecta?\nEj.: cambió el horario, cambió el precio, ya no se juega acá, lugar cerrado.');if(!reason)return;
  const details=prompt('Detalle adicional (opcional):')||null;
  try{await rpc('report_practice_place_v100',{p_place_id:Number(id),p_reason:reason,p_details:details});alert('Gracias. El reporte quedó enviado a Administración.')}catch(err){alert(err.message)}
}

function adminClubRequestCardV100(r){
  return `<article class="admin-community-row-v100"><div><strong>${esc(r.requested_name)}</strong><small>${esc([r.city_name,r.region_name,countryName(r.country_code)].filter(Boolean).join(' · '))}</small><em>Solicitó @${esc(r.requester_username||'usuario')} · ${new Date(r.created_at).toLocaleDateString('es-UY')}</em></div><div class="admin-community-actions-v100"><button data-admin-club-approve-v100="${r.id}">Aprobar nuevo</button><button data-admin-club-merge-v100="${r.id}">Fusionar</button><button class="danger" data-admin-club-reject-v100="${r.id}">Rechazar</button></div></article>`;
}
function adminPlaceCardV100(p){
  return `<article class="admin-community-row-v100"><div><strong>${esc(p.name)}</strong><small>${esc(PLACE_TYPES[p.place_type]||p.place_type)} · ${esc([p.city_name,p.region_name,countryName(p.country_code)].filter(Boolean).join(' · '))}</small><em>${esc(accessTextV100(p))} · enviado por @${esc(p.submitter_username||'usuario')}</em></div><div class="admin-community-actions-v100"><button data-admin-place-approve-v100="${p.id}">Aprobar</button><button data-admin-place-merge-v100="${p.id}">Fusionar</button><button class="danger" data-admin-place-reject-v100="${p.id}">Rechazar</button></div></article>`;
}

async function loadAdminClubRequestsV100(){
  const box=$('#adminClubRequestsListV100');if(!box)return;box.innerHTML='<div class="loading-row">Cargando solicitudes…</div>';
  try{const rows=await rpc('admin_list_club_requests_v100',{p_status:'pending'})||[];box.innerHTML=rows.length?rows.map(adminClubRequestCardV100).join(''):'<div class="compact-empty">No hay clubes pendientes.</div>';}catch(err){box.innerHTML=`<div class="compact-empty">${esc(err.message)}</div>`}
}
async function loadAdminPlacesV100(){
  const box=$('#adminPracticePlacesListV100');if(!box)return;box.innerHTML='<div class="loading-row">Cargando lugares…</div>';
  try{const rows=await rpc('admin_list_practice_places_v100',{p_status:'pending'})||[];box.innerHTML=rows.length?rows.map(adminPlaceCardV100).join(''):'<div class="compact-empty">No hay lugares pendientes.</div>';}catch(err){box.innerHTML=`<div class="compact-empty">${esc(err.message)}</div>`}
}
async function loadAdminReportsV100(){
  const box=$('#adminPracticeReportsListV100');if(!box)return;box.innerHTML='<div class="loading-row">Cargando reportes…</div>';
  try{const rows=await rpc('admin_list_practice_reports_v100',{p_limit:80})||[];box.innerHTML=rows.length?rows.map(r=>`<article class="admin-community-row-v100"><div><strong>${esc(r.place_name)}</strong><small>${esc(r.reason)}</small><em>@${esc(r.reporter_username||'usuario')} · ${new Date(r.created_at).toLocaleDateString('es-UY')}${r.details?` · ${esc(r.details)}`:''}</em></div><div class="admin-community-actions-v100"><button data-admin-report-resolve-v100="${r.report_id}">Resuelto</button><button data-admin-report-dismiss-v100="${r.report_id}">Descartar</button></div></article>`).join(''):'<div class="compact-empty">No hay reportes abiertos.</div>';}catch(err){box.innerHTML=`<div class="compact-empty">${esc(err.message)}</div>`}
}

async function searchAdminTesterV100(){
  const box=$('#adminTesterResultsV100'),q=$('#adminTesterSearchV100')?.value?.trim()||'';if(!box)return;
  if(q.length<2){box.innerHTML='<div class="compact-empty">Escribí al menos 2 caracteres.</div>';return}
  box.innerHTML='<div class="loading-row">Buscando…</div>';
  try{const found=await rpc('admin_search_users_v100',{p_query:q})||[];const rows=await filterVisibleRowsV76(found,['user_id']);box.innerHTML=rows.length?rows.map(u=>`<article class="admin-tester-row-v100"><div class="admin-tester-avatar-v100">${u.profile_photo_url?`<img src="${esc(u.profile_photo_url)}" alt="">`:'🧪'}</div><div><strong>${esc(u.display_name||u.username)}</strong><small>@${esc(u.username)} · ${u.current_elo} RP · ${u.recognitions} reconocimientos</small><em>${u.tester_granted?'✓ Tester otorgado':'Sin reconocimiento Tester'}</em></div><button class="${u.tester_granted?'danger':''}" data-admin-tester-v100="${u.user_id}" data-grant="${u.tester_granted?'false':'true'}">${u.tester_granted?'Retirar':'Otorgar Tester'}</button></article>`).join(''):'<div class="compact-empty">No encontramos usuarios.</div>';}catch(err){box.innerHTML=`<div class="compact-empty">${esc(err.message)}</div>`}
}

function openMergePickerV100(kind,id){
  state.mergeContext={kind,id};const modal=$('#adminMergePickerV100'),title=$('#adminMergePickerTitleV100'),input=$('#adminMergeSearchV100');
  if(title)title.textContent=kind==='club'?'Fusionar con club existente':'Fusionar con lugar existente';if(input)input.value='';renderMergeResultsV100();setModal(modal,true);setTimeout(()=>input?.focus(),50);
}
async function renderMergeResultsV100(){
  const box=$('#adminMergeResultsV100'),q=$('#adminMergeSearchV100')?.value||'';if(!box||!state.mergeContext)return;
  if(state.mergeContext.kind==='club'){
    await loadClubData(true).catch(()=>[]);const rows=state.clubs.filter(c=>norm([c.name,c.display_alias,c.city_name,c.region_name].join(' ')).includes(norm(q))).slice(0,25);
    box.innerHTML=rows.length?rows.map(c=>`<button type="button" data-admin-merge-select-v100="${c.id}"><strong>${esc(c.display_alias||c.name)}</strong><small>${esc(clubLocation(c)||countryName(c.country_code))}</small></button>`).join(''):'<div class="compact-empty">Sin coincidencias.</div>';
  }else{
    try{const rows=await rpc('admin_list_practice_places_v100',{p_status:'approved'})||[];const filtered=rows.filter(p=>norm([p.name,p.city_name,p.region_name].join(' ')).includes(norm(q))).slice(0,25);box.innerHTML=filtered.length?filtered.map(p=>`<button type="button" data-admin-merge-select-v100="${p.id}"><strong>${esc(p.name)}</strong><small>${esc([p.city_name,p.region_name].filter(Boolean).join(' · '))}</small></button>`).join(''):'<div class="compact-empty">Sin coincidencias.</div>';}catch(err){box.innerHTML=`<div class="compact-empty">${esc(err.message)}</div>`}
  }
}
async function chooseMergeTargetV100(targetId){
  const ctx=state.mergeContext;if(!ctx)return;const note=prompt('Nota administrativa (opcional):')||null;
  try{if(ctx.kind==='club')await rpc('admin_resolve_club_request_v100',{p_request_id:Number(ctx.id),p_action:'merge',p_existing_club_id:Number(targetId),p_note:note});else await rpc('admin_resolve_practice_place_v100',{p_place_id:Number(ctx.id),p_action:'merge',p_existing_place_id:Number(targetId),p_note:note});setModal($('#adminMergePickerV100'),false);state.mergeContext=null;await loadAdminCommunityV100();}catch(err){alert(err.message)}
}

export async function loadAdminCommunityV100(){
  if(!state.adminInitialized){
    state.adminInitialized=true;let testerTimer;
    $('#adminTesterSearchV100')?.addEventListener('input',()=>{clearTimeout(testerTimer);testerTimer=setTimeout(searchAdminTesterV100,220)});
    $('#adminRefreshClubRequestsV100')?.addEventListener('click',loadAdminClubRequestsV100);
    $('#adminRefreshPlacesV100')?.addEventListener('click',loadAdminPlacesV100);
    $('#adminRefreshPlaceReportsV100')?.addEventListener('click',loadAdminReportsV100);
    $('#closeAdminMergePickerV100')?.addEventListener('click',()=>setModal($('#adminMergePickerV100'),false));
    $('#adminMergePickerV100')?.addEventListener('click',e=>{if(e.target.id==='adminMergePickerV100')setModal($('#adminMergePickerV100'),false)});
    $('#adminMergeSearchV100')?.addEventListener('input',renderMergeResultsV100);
  }
  await Promise.all([loadAdminClubRequestsV100(),loadAdminPlacesV100(),loadAdminReportsV100(),loadClubData(true).catch(()=>[])]);
}

async function handleAdminActionV100(target){
  if(target.matches('[data-admin-club-approve-v100]')){if(!confirm('¿Aprobar y crear este club oficial?'))return;await rpc('admin_resolve_club_request_v100',{p_request_id:Number(target.dataset.adminClubApproveV100),p_action:'approve',p_existing_club_id:null,p_note:null});await loadClubData(true);await loadAdminClubRequestsV100();return}
  if(target.matches('[data-admin-club-reject-v100]')){const note=prompt('Motivo del rechazo:');if(!note)return;await rpc('admin_resolve_club_request_v100',{p_request_id:Number(target.dataset.adminClubRejectV100),p_action:'reject',p_existing_club_id:null,p_note:note});await loadAdminClubRequestsV100();return}
  if(target.matches('[data-admin-club-merge-v100]')){openMergePickerV100('club',target.dataset.adminClubMergeV100);return}
  if(target.matches('[data-admin-place-approve-v100]')){if(!confirm('¿Publicar este lugar en Dónde practicar?'))return;await rpc('admin_resolve_practice_place_v100',{p_place_id:Number(target.dataset.adminPlaceApproveV100),p_action:'approve',p_existing_place_id:null,p_note:null});await loadAdminPlacesV100();return}
  if(target.matches('[data-admin-place-reject-v100]')){const note=prompt('Motivo del rechazo:');if(!note)return;await rpc('admin_resolve_practice_place_v100',{p_place_id:Number(target.dataset.adminPlaceRejectV100),p_action:'reject',p_existing_place_id:null,p_note:note});await loadAdminPlacesV100();return}
  if(target.matches('[data-admin-place-merge-v100]')){openMergePickerV100('place',target.dataset.adminPlaceMergeV100);return}
  if(target.matches('[data-admin-tester-v100]')){const grant=target.dataset.grant==='true';const note=prompt(grant?'Nota opcional sobre la colaboración:':'Motivo opcional para retirar el reconocimiento:')||null;if(!confirm(grant?'Se otorgarán el título y el marco TESTER. ¿Continuar?':'Se retirarán el título y el marco TESTER. ¿Continuar?'))return;await rpc('admin_set_tester_recognition_v100',{p_user_id:target.dataset.adminTesterV100,p_grant:grant,p_note:note});setStatus($('#adminTesterStatusV100'),grant?'✓ Reconocimiento Tester otorgado.':'Reconocimiento Tester retirado.','ok');await searchAdminTesterV100();return}
  if(target.matches('[data-admin-report-resolve-v100]')){await rpc('admin_resolve_practice_report_v100',{p_report_id:Number(target.dataset.adminReportResolveV100),p_action:'resolved'});await loadAdminReportsV100();return}
  if(target.matches('[data-admin-report-dismiss-v100]')){await rpc('admin_resolve_practice_report_v100',{p_report_id:Number(target.dataset.adminReportDismissV100),p_action:'dismissed'});await loadAdminReportsV100();return}
}

document.addEventListener('click',e=>{
  const use=e.target.closest('[data-v100-use-club]');if(use){const context=use.dataset.v100ClubContext||'onboarding';if(context==='settings')selectSettingsClubV100(use.dataset.v100UseClub);else selectClubV100(use.dataset.v100UseClub,context);return}
  if(e.target.closest('[data-clear-club-v100]')){clearClubV100();return}
  if(e.target.closest('[data-clear-settings-club-v100]')){clearSettingsClubV100();return}
  if(e.target.closest('[data-clear-place-club-v100]')){state.placeClub=null;renderPlaceSelectedClubV100();return}
  const report=e.target.closest('[data-report-place-v100]');if(report){reportPlaceV100(report.dataset.reportPlaceV100);return}
  const merge=e.target.closest('[data-admin-merge-select-v100]');if(merge){chooseMergeTargetV100(merge.dataset.adminMergeSelectV100);return}
  const admin=e.target.closest('[data-admin-club-approve-v100],[data-admin-club-reject-v100],[data-admin-club-merge-v100],[data-admin-place-approve-v100],[data-admin-place-reject-v100],[data-admin-place-merge-v100],[data-admin-tester-v100],[data-admin-report-resolve-v100],[data-admin-report-dismiss-v100]');
  if(admin)handleAdminActionV100(admin).catch(err=>alert(err.message));
});

export async function refreshV100(){await Promise.all([loadClubData(true).catch(()=>[]),loadOwnSportsIdentityV100().catch(()=>null)]);}

import {readNews,readHomeNews} from '../../../lib/admin-store';
import {accountIdentity,accountJson} from '../../../lib/account-auth';
import {maybeIngest} from '../../../lib/news-ingest';
import {waitUntil} from 'cloudflare:workers';
export async function GET(request:Request){const params=new URL(request.url).searchParams,id=params.get('id'),page=Number(params.get('page')||1),search=params.get('q')||'',category=params.get('category')||'';if(!Number.isInteger(page)||page<1||page>1000||search.length>100||category.length>80)return accountJson({error:'Filtre invalide.'},400);if(id&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return accountJson({error:'Știre invalidă.'},400);
 // Fluxul automat se actualizează în fundal, cel mult o dată la 30 de minute pe instanță.
 try{maybeIngest(waitUntil);}catch{}
 try{if(params.get('home')==='1'&&!id){let profile=null;try{profile=(await accountIdentity(request))?.teaching||null;}catch{}return accountJson(await readHomeNews(profile));}
  return accountJson(await readNews(false,id||undefined,{home:false,page,search,category}));}catch{return accountJson({error:'Știrile nu sunt disponibile momentan.'},503);}}

import {requireAdministrator,adminRequest} from '../../../../lib/admin-store';
import {accountJson} from '../../../../lib/account-auth';
import {sameOrigin} from '../../../../lib/document-store';
import {validNews,validNewsSettings} from '../../../../lib/news';
export async function POST(request:Request){
 if(!sameOrigin(request))return accountJson({error:'Origine nepermisă.'},403);if(!request.headers.get('content-type')?.includes('application/json'))return accountJson({error:'Cerere invalidă.'},415);
 try{const user=await requireAdministrator(request);if(!user)return accountJson({error:'Acces rezervat administratorului.'},403);
 const reader=request.body?.getReader();if(!reader)return accountJson({error:'Cerere invalidă.'},400);let size=0;const chunks:Uint8Array[]=[];while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>100000){await reader.cancel();return accountJson({error:'Cerere prea mare.'},413);}chunks.push(value);}const raw=await new Blob(chunks as BlobPart[]).text();if(raw.length>26000)return accountJson({error:'Cerere prea mare.'},413);const b=JSON.parse(raw);
 if(Object.keys(b).some(k=>!['article','settings'].includes(k))||!!b.article===!!b.settings||b.article&&!validNews(b.article)||b.settings&&!validNewsSettings(b.settings))return accountJson({error:'Verifică titlul, textul, poziția și adresele HTTPS.'},400);
 const result=await adminRequest('rpc/profplus_save_news',{method:'POST',body:JSON.stringify({actor:user.id.slice(9),article:b.article||null,settings:b.settings||null})});
 return accountJson({message:'Modificările au fost salvate.',result});
 }catch(e){if(e instanceof SyntaxError)return accountJson({error:'Cerere invalidă.'},400);const conflict=e instanceof Error&&e.message==='NEWS_CONFLICT';return accountJson({error:conflict?'Poziția este ocupată sau știrea a fost modificată. Reîncarcă lista.':'Salvarea nu a fost confirmată. Reîncearcă.'},conflict?409:503);}
}

import {env} from 'cloudflare:workers';
import {userId,json} from '../../../../../../lib/document-store';
import {cloudOriginal,type CloudConfig} from '../../../../../../lib/supabase-storage';
export async function GET(request:Request,context:{params:Promise<{family:string;uid:string}>}){
 if(!await userId(request))return json({error:'Autentifică-te pentru document.'},401);
 const {family,uid}=await context.params;if(!['manuals','competitions'].includes(family)||!/^[a-zA-Z0-9_-]{1,160}$/.test(uid))return json({error:'Document invalid.'},400);
 try{const item=await cloudOriginal(env as unknown as CloudConfig,family,uid);if(!item)return json({error:'Document indisponibil.'},404);
 return new Response(item.body,{headers:{'Content-Type':item.mime,'Content-Disposition':`${item.mime.startsWith('application/pdf')?'inline':'attachment'}; filename*=UTF-8''${encodeURIComponent(item.name)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return json({error:'Document temporar indisponibil.'},503);}
}

// Server-only: verified identity -> stored membership, never client role/email/metadata.
import {env} from 'cloudflare:workers';
import {accountIdentity,type AccountIdentity} from './account-auth';
import type {NewsArticle,NewsSettings} from './news';
type Config={SUPABASE_URL?:string;SUPABASE_SECRET_KEY?:string};
export async function adminRequest<T=unknown>(path:string,init:RequestInit={}){
 const c=env as unknown as Config;if(!c.SUPABASE_URL||!c.SUPABASE_SECRET_KEY)throw new Error('ADMIN_STORAGE_UNAVAILABLE');
 const url=new URL(c.SUPABASE_URL);if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co')||url.username||url.password)throw new Error('ADMIN_STORAGE_UNAVAILABLE');
 const headers=new Headers(init.headers);headers.set('apikey',c.SUPABASE_SECRET_KEY);headers.set('Content-Type','application/json');
 const response=await fetch(url.origin+'/rest/v1/'+path,{...init,headers,signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error(response.status===409?'NEWS_CONFLICT':'ADMIN_PROVIDER_UNAVAILABLE');return response.json() as Promise<T>;
}
export async function isAdministrator(user:AccountIdentity|null){
 if(!user||user.provider!=='supabase'||!user.emailVerified||user.deleting)return false;
 const query=new URLSearchParams({user_id:'eq.'+user.id.slice(9),select:'user_id',limit:'1'});
 const rows=await adminRequest<{user_id:string}[]>('profplus_admins?'+query);return Array.isArray(rows)&&rows.length===1;
}
export async function requireAdministrator(request:Request){const user=await accountIdentity(request);if(!await isAdministrator(user))return null;return user;}
export async function readNews(admin=false,id?:string):Promise<{articles:NewsArticle[];settings:NewsSettings}>{
 const query=new URLSearchParams({select:'id,title,summary,body,category,image_url,source_url,slot,status,published_at,revision',order:'slot.asc,published_at.desc',limit:admin?'100':'40'});
 if(!admin){query.set('status','eq.published');query.set('published_at','lte.'+new Date().toISOString());}if(id)query.set('id','eq.'+id);
 const [articles,settings]=await Promise.all([adminRequest<NewsArticle[]>('profplus_news?'+query),adminRequest<NewsSettings[]>('profplus_news_settings?select=title,intro&id=eq.1')]);return {articles,settings:settings[0]};
}

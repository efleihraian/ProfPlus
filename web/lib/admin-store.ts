// Server-only: verified identity -> stored membership, never client role/email/metadata.
import {env} from 'cloudflare:workers';
import {accountIdentity,type AccountIdentity} from './account-auth';
import type {NewsArticle,NewsSettings} from './news';
import type {TeachingProfile} from './teaching-profile';
import {homeSelection} from './news-feed';
type Config={SUPABASE_URL?:string;SUPABASE_SECRET_KEY?:string};
export async function adminRequest<T=unknown>(path:string,init:RequestInit={}){
 const c=env as unknown as Config;if(!c.SUPABASE_URL||!c.SUPABASE_SECRET_KEY)throw new Error('ADMIN_STORAGE_UNAVAILABLE');
 const url=new URL(c.SUPABASE_URL);if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co')||url.username||url.password)throw new Error('ADMIN_STORAGE_UNAVAILABLE');
 const headers=new Headers(init.headers);headers.set('apikey',c.SUPABASE_SECRET_KEY);headers.set('Content-Type','application/json');
 const response=await fetch(url.origin+'/rest/v1/'+path,{...init,headers,signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error(response.status===409?'NEWS_CONFLICT':'ADMIN_PROVIDER_UNAVAILABLE');return response.json() as Promise<T>;
}
/** Scriere server-only fără corp de răspuns (de ex. inserări idempotente cu Prefer: return=minimal). */
export async function adminWrite(path:string,init:RequestInit){
 const c=env as unknown as Config;if(!c.SUPABASE_URL||!c.SUPABASE_SECRET_KEY)throw new Error('ADMIN_STORAGE_UNAVAILABLE');
 const url=new URL(c.SUPABASE_URL);if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co')||url.username||url.password)throw new Error('ADMIN_STORAGE_UNAVAILABLE');
 const headers=new Headers(init.headers);headers.set('apikey',c.SUPABASE_SECRET_KEY);headers.set('Content-Type','application/json');
 const response=await fetch(url.origin+'/rest/v1/'+path,{...init,headers,signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('ADMIN_PROVIDER_UNAVAILABLE');
}
export async function isAdministrator(user:AccountIdentity|null){
 if(!user||user.provider!=='supabase'||!user.emailVerified||user.deleting)return false;
 const query=new URLSearchParams({user_id:'eq.'+user.id.slice(9),select:'user_id',limit:'1'});
 const rows=await adminRequest<{user_id:string}[]>('profplus_admins?'+query);return Array.isArray(rows)&&rows.length===1;
}
export async function requireAdministrator(request:Request){const user=await accountIdentity(request);if(!await isAdministrator(user))return null;return user;}
export type NewsQuery={home?:boolean;page?:number;search?:string;category?:string;paged?:boolean;status?:string};
export async function readNews(admin=false,id?:string,options:NewsQuery={}):Promise<{articles:NewsArticle[];settings:NewsSettings;hasMore:boolean}>{
 const query=new URLSearchParams({select:'id,title,summary,body,category,image_url,source_url,slot,status,published_at,revision',order:options.home?'slot.asc':'published_at.desc.nullslast,id.desc',limit:options.home?'4':admin&&!options.paged?'100':id?'1':'21'});
 if(!admin){query.set('status','eq.published');query.set('published_at','lte.'+new Date().toISOString());}
 if(id)query.set('id','eq.'+id);else if(options.home)query.set('slot','lt.4');else if(!admin||options.paged)query.set('offset',String(((options.page||1)-1)*20));
 if(admin&&(options.status||options.home))query.set('status','eq.'+(options.home?'published':options.status));
 if(options.category)query.set('category','eq.'+options.category);
 const search=options.search?.replace(/[%_*.,()]/g,' ').trim();if(search)query.set('title','ilike.*'+search+'*');
 const [articles,settings]=await Promise.all([adminRequest<NewsArticle[]>('profplus_news?'+query),adminRequest<NewsSettings[]>('profplus_news_settings?select=title,intro&id=eq.1')]);
 const hasMore=(!admin||!!options.paged)&&!id&&!options.home&&articles.length>20;return {articles:hasMore?articles.slice(0,20):articles,settings:settings[0],hasMore};
}
/** Acasă: fixările recente ale editorului + recomandările automate (importanță, profil didactic, actualitate). */
export async function readHomeNews(profile:TeachingProfile|null,now=Date.now()){
 const since=new Date(now-21*86400000).toISOString(),until=new Date(now).toISOString();
 const fields='id,title,summary,body,category,image_url,source_url,slot,status,published_at,revision';
 const [home,candidates]=await Promise.all([readNews(false,undefined,{home:true}),adminRequest<NewsArticle[]>('profplus_news?'+new URLSearchParams([['select',fields],['status','eq.published'],['published_at','gte.'+since],['published_at','lte.'+until],['order','published_at.desc'],['limit','200']]))]);
 return {articles:homeSelection(home.articles,candidates,profile,now),settings:home.settings,hasMore:false};
}

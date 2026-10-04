import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';
import {createServerClient} from '@supabase/ssr';
export type AccountIdentity={id:string;email:string;name:string;emailVerified:boolean|null;provider:'sites'|'supabase'};
type Config={AUTH_PROVIDER?:string;SUPABASE_URL?:string;SUPABASE_PUBLISHABLE_KEY?:string;APP_ORIGIN?:string;AUTH_GOOGLE_ENABLED?:string;AUTH_APPLE_ENABLED?:string;AUTH_REGISTRATION_ENABLED?:string};
export function authConfig(){
 const c=env as unknown as Config;
 const provider=c.AUTH_PROVIDER==='supabase'?'supabase':'sites';
 let origin='';try{const u=new URL(c.APP_ORIGIN||'');if(u.protocol==='https:'||(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)))origin=u.origin;}catch{}
 const ready=provider==='supabase'&&!!c.SUPABASE_URL&&!!c.SUPABASE_PUBLISHABLE_KEY&&!!origin;
 return {...c,provider,ready,origin,google:ready&&c.AUTH_GOOGLE_ENABLED==='true',apple:ready&&c.AUTH_APPLE_ENABLED==='true',registration:ready&&c.AUTH_REGISTRATION_ENABLED==='true'};
}
export async function authClient(){
 const c=authConfig();if(!c.ready)throw new Error('AUTH_NOT_CONFIGURED');
 const jar=await cookies();
 return createServerClient(c.SUPABASE_URL!,c.SUPABASE_PUBLISHABLE_KEY!,{
  cookieOptions:{name:'profos-auth',httpOnly:true,sameSite:'lax',secure:c.origin.startsWith('https:'),path:'/'},
  cookies:{getAll:()=>jar.getAll(),setAll:values=>{for(const {name,value,options} of values)jar.set(name,value,options);}},
 });
}
export async function accountIdentity(request:Request):Promise<AccountIdentity|null>{
 const c=authConfig();
 if(c.provider==='supabase'){
  if(!c.ready)return null;
  try{const client=await authClient();const {data,error}=await client.auth.getUser();const u=data.user;
   if(error||!u||!u.email_confirmed_at)return null;
   return {id:'supabase:'+u.id,email:u.email||'',name:String(u.user_metadata?.full_name||'').slice(0,100),emailVerified:true,provider:'supabase'};
  }catch{return null;}
 }
 const id=request.headers.get('oai-authenticated-user-id');if(!id)return null;
 let name=request.headers.get('oai-authenticated-user-full-name')||'';
 if(request.headers.get('oai-authenticated-user-full-name-encoding')==='percent-encoded-utf-8'){try{name=decodeURIComponent(name);}catch{name='';}}
 return {id,email:request.headers.get('oai-authenticated-user-email')||'',name:name.slice(0,100),emailVerified:null,provider:'sites'};
}
export const accountJson=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store, max-age=0','Pragma':'no-cache','Expires':'0'}});

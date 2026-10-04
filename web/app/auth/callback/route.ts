import {authClient,authConfig} from '../../../lib/account-auth';
export async function GET(request:Request){
 const c=authConfig();const target=new URL('/account',c.origin||new URL(request.url).origin);
 const redirect=(notice:string,view?:string)=>{target.searchParams.set('notice',notice);if(view)target.searchParams.set('view',view);return new Response(null,{status:303,headers:{Location:target.toString(),'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}});};
 if(!c.ready)return redirect('not-configured');
 const url=new URL(request.url);const code=url.searchParams.get('code'),hash=url.searchParams.get('token_hash'),type=url.searchParams.get('type');
 if(hash&&!c.emailEnabled)return redirect('email-disabled');
 try{
  const client=await authClient();
  if(hash&&['signup','recovery','email_change'].includes(type||'')){
   const {error}=await client.auth.verifyOtp({token_hash:hash,type:type as 'signup'|'recovery'|'email_change'});
   return error?redirect('invalid-link'):redirect('verified',type==='recovery'?'reset':undefined);
  }
  if(code){const {error}=await client.auth.exchangeCodeForSession(code);return redirect(error?'invalid-link':'verified');}
 }catch{}
 return redirect('invalid-link');
}

// Local contract tests: a synthetic Auth server, never a real Supabase project.
// Run after npm run build; ports 3098/3099 must be free. No API secrets are needed.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {readFile,writeFile,rm} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
const socialOnly=process.argv.includes('--social-only');
const origin='http://127.0.0.1:3099',mockOrigin='http://127.0.0.1:3098';
const configPath='dist/server/.dev.vars';
const original=await readFile(configPath).catch(()=>null);
let worker,output='',requests=0,confirmed=true,autoConfirm=false;
const uid='44444444-4444-4444-8444-444444444444';
const jwt=[{alg:'HS256',typ:'JWT'},{sub:uid,exp:Math.floor(Date.now()/1000)+3600},'test-only'].map(x=>Buffer.from(typeof x==='string'?x:JSON.stringify(x)).toString('base64url')).join('.');
const user=()=>({id:uid,aud:'authenticated',role:'authenticated',email:'fixture@example.test',email_confirmed_at:confirmed?'2026-10-04T00:00:00Z':null,created_at:'2026-10-04T00:00:00Z',app_metadata:{provider:'email'},identities:[{provider:'google'},{provider:'apple'},{provider:'google'},{provider:'unsupported'}],user_metadata:{full_name:'Profesor test'}});
const session=()=>({access_token:jwt,token_type:'bearer',expires_in:3600,refresh_token:'synthetic-refresh',user:user()});
const server=createServer(async(req,res)=>{
 requests++;let raw='';for await(const chunk of req)raw+=chunk;
 const b=raw?JSON.parse(raw):{},url=new URL(req.url,mockOrigin);
 const send=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data));};
 if(url.pathname==='/auth/v1/token')return b.password==='valid-test-password'?send(session()):send({msg:'Invalid login credentials',code:'invalid_credentials'},400);
 if(url.pathname==='/auth/v1/user'){
  if(req.headers.authorization!==`Bearer ${jwt}`)return send({msg:'Invalid token',code:'bad_jwt'},401);
  return send(user());
 }
 if(url.pathname==='/auth/v1/signup')return send(autoConfirm?session():user());
 if(url.pathname==='/auth/v1/recover'||url.pathname==='/auth/v1/resend')return send({});
 if(url.pathname==='/auth/v1/logout'){res.writeHead(204);return res.end();}
 if(url.pathname==='/auth/v1/verify')return b.token_hash==='valid-recovery'?send(session()):send({msg:'Token expired',code:'otp_expired'},403);
 return send({msg:'Unknown test endpoint'},404);
});
const cookies=new Map();
function applyCookies(response){for(const c of response.headers.getSetCookie()){const pair=c.split(';')[0],at=pair.indexOf('=');cookies.set(pair.slice(0,at),pair.slice(at+1));}}
async function call(path='/api/account',body,extra={}){
 const response=await fetch(origin+path,{method:body?'POST':'GET',redirect:'manual',headers:{Origin:origin,'Content-Type':'application/json',Cookie:[...cookies].map(([k,v])=>k+'='+v).join('; '),...extra},...(body?{body:JSON.stringify(body)}:{})});
 applyCookies(response);return response;
}
async function action(body,status){const r=await call('/api/account',body);assert.equal(r.status,status,JSON.stringify(body.action));return r;}
try{
 await new Promise(resolve=>server.listen(3098,'127.0.0.1',resolve));
 await writeFile(configPath,`AUTH_PROVIDER=supabase\nSUPABASE_URL=${mockOrigin}\nSUPABASE_PUBLISHABLE_KEY=synthetic-publishable-key\nAPP_ORIGIN=${origin}\nAUTH_GOOGLE_ENABLED=true\nAUTH_APPLE_ENABLED=${socialOnly}\nAUTH_EMAIL_ENABLED=${!socialOnly}\nAUTH_REGISTRATION_ENABLED=true\n`,{mode:0o600});
 worker=spawn(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','dev','--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/account-test','--ip','127.0.0.1','--inspector-port','0','--port','3099'],{stdio:['ignore','pipe','pipe']});
 worker.stdout.on('data',b=>output+=b);worker.stderr.on('data',b=>output+=b);
 let ready=false;for(let i=0;i<80;i++){try{const r=await call();if(r.ok){ready=true;break;}}catch{}await delay(250);}
 assert.ok(ready,'Local Worker did not become ready');
 let r=await call();assert.equal((await r.json()).user,null);assert.match(r.headers.get('Cache-Control'),/no-store/);
 r=await call('/api/account',undefined,{'oai-authenticated-user-id':'spoofed'});assert.equal((await r.json()).user,null,'No fallback to Sites identity in Supabase mode');
 r=await call('/api/account',{action:'login',email:'fixture@example.test',password:'valid-test-password'},{Origin:'https://untrusted.example'});assert.equal(r.status,403);
 if(socialOnly){
  const flags=await(await call()).json();assert.equal(flags.emailEnabled,false);assert.equal(flags.registration,false);
  const before=requests;
  for(const name of ['login','register','forgot','resend','password','email'])await action({action:name,email:'fixture@example.test',password:'valid-test-password'},503);
  r=await call('/auth/callback?token_hash=valid-recovery&type=recovery');assert.match(r.headers.get('location'),/email-disabled/);
  assert.equal(requests,before,'Disabled email flows must not contact the provider');
  for(const provider of ['google','apple']){
   const result=await action({action:'oauth',provider},200);const url=new URL((await result.json()).url);
   assert.equal(url.searchParams.get('provider'),provider);assert.equal(url.searchParams.get('redirect_to'),origin+'/auth/callback');assert.ok(url.searchParams.get('code_challenge'));
  }
  console.log('PASS: social-only mode enables Google/Apple PKCE and blocks every email/password endpoint and token-hash callback without provider calls.');
 }else{
 await action({action:'register',email:'fixture@example.test',password:'short'},400);
 await action({action:'login',email:'fixture@example.test',password:'wrong'},401);
 confirmed=false;await action({action:'login',email:'fixture@example.test',password:'valid-test-password'},401);assert.equal((await(await call()).json()).user,null);
 confirmed=true;r=await action({action:'login',email:'fixture@example.test',password:'valid-test-password'},200);
 assert.ok(r.headers.getSetCookie().some(c=>c.startsWith('profos-auth=')&&/httponly/i.test(c)&&/samesite=lax/i.test(c)),'Session cookie must be HTTP-only and SameSite=Lax');
 const before=requests,identity=(await(await call()).json()).user;assert.equal(identity.id,'supabase:'+uid);assert.equal(identity.emailVerified,true);assert.deepEqual(identity.linkedProviders,['google','apple']);assert.ok(requests>before,'Identity must be checked remotely');
 await action({action:'profile',name:'Profesor test'},200);
 await action({action:'email',email:'new@example.test'},200);
 await action({action:'logout'},200);assert.equal((await(await call()).json()).user,null);
 await action({action:'register',email:'fixture@example.test',password:'valid-test-password'},200);assert.equal((await(await call()).json()).user,null);
 autoConfirm=true;await action({action:'register',email:'fixture@example.test',password:'valid-test-password'},503);assert.equal((await(await call()).json()).user,null);autoConfirm=false;
 await action({action:'forgot',email:'fixture@example.test'},200);await action({action:'resend',email:'fixture@example.test'},200);
 await action({action:'oauth',provider:'apple'},503);
 r=await action({action:'oauth',provider:'google'},200);const authUrl=new URL((await r.json()).url);assert.equal(authUrl.searchParams.get('provider'),'google');assert.equal(authUrl.searchParams.get('redirect_to'),origin+'/auth/callback');assert.ok(authUrl.searchParams.get('code_challenge'));
 r=await call('/auth/callback?token_hash=invalid&type=recovery');assert.equal(r.status,303);assert.match(r.headers.get('location'),/invalid-link/);
 r=await call('/auth/callback?token_hash=valid-recovery&type=recovery&next=https://untrusted.example');assert.equal(r.status,303);assert.equal(new URL(r.headers.get('location')).origin,origin);assert.match(r.headers.get('location'),/view=reset/);
 assert.ok((await(await call()).json()).user);
 await action({action:'password',password:'another-test-password'},200);assert.equal((await(await call()).json()).user,null);
 // A fabricated cookie must never authenticate a user.
 cookies.set('profos-auth','base64-'+Buffer.from(JSON.stringify({...session(),access_token:jwt+'tampered'})).toString('base64url'));
 assert.equal((await(await call()).json()).user,null);
 console.log('PASS: configuration, CSRF, verification gate, remote identity, session cookies, register/login/logout, profile, email, password recovery, OAuth PKCE, safe redirects, tampered session.');
 }
 console.log('Provider is mocked; Google/Apple login and delivery through Resend require separate live acceptance tests.');
}finally{
 if(worker){worker.kill('SIGTERM');await Promise.race([new Promise(resolve=>worker.once('exit',resolve)),delay(3000)]);}
 await new Promise(resolve=>server.close(resolve));
 if(original)await writeFile(configPath,original,{mode:0o600});else await rm(configPath,{force:true});
 await rm('.wrangler/account-test',{recursive:true,force:true});
}

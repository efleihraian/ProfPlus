import {accountIdentity,accountJson,authClient,authConfig} from '../../../lib/account-auth';
import {isAdministrator} from '../../../lib/admin-store';
import {teachingProfile,defaultManualIds} from '../../../lib/teaching-profile';
import collection from '../../../lib/active-collection.json';
import {deletionPending} from '../../../lib/account-state';
import {deleteOwnAccount,deletionEnabled,DeletionError} from '../../../lib/account-deletion';
export async function GET(request:Request){
 const c=authConfig(),user=await accountIdentity(request);
 const admin=await isAdministrator(user).catch(()=>false);
 return accountJson({user,admin,provider:c.provider,ready:c.ready,google:c.google,apple:c.apple,registration:c.registration,emailEnabled:c.emailEnabled,deletionEnabled:deletionEnabled(),defaultManualIds:defaultManualIds(user?.teaching||null,collection.uids)});
}
export async function POST(request:Request){
 const c=authConfig();
 const origin=request.headers.get('origin');
 if(!origin||origin!==(c.ready?c.origin:new URL(request.url).origin))return accountJson({error:'Origine nepermisă.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return accountJson({error:'Cerere invalidă.'},415);
 if(!c.ready)return accountJson({error:'Autentificarea independentă nu este încă activată.'},503);
 try{
  const raw=await request.text();if(raw.length>4000)return accountJson({error:'Cerere prea mare.'},413);
  const b=JSON.parse(raw),action=b.action;
  const actions=['login','register','forgot','resend','oauth','logout','profile','password','email','teaching','delete'];
  if(!actions.includes(action))return accountJson({error:'Acțiune invalidă.'},400);
  if(['login','register','forgot','resend','password','email'].includes(action)&&!c.emailEnabled)return accountJson({error:'Autentificarea prin e-mail este dezactivată. Folosește Google sau Apple.'},503);
  const email=typeof b.email==='string'?b.email.trim():'';
  if(['login','register','forgot','resend','email'].includes(action)&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254))return accountJson({error:'Introdu o adresă de e-mail validă.'},400);
  if(['login','register','password'].includes(action)&&(typeof b.password!=='string'||b.password.length>(128)||b.password.length<(action==='login'?1:12)))return accountJson({error:'Parola nouă trebuie să aibă între 12 și 128 de caractere.'},400);
  if(action==='register'&&!c.registration)return accountJson({error:'Înregistrarea conturilor noi nu este încă activată.'},503);
  const client=await authClient();
  if(action==='oauth'){
   if(!['google','apple'].includes(b.provider)||!(b.provider==='google'?c.google:c.apple))return accountJson({error:'Metoda de conectare nu este încă activată.'},503);
   const {data,error}=await client.auth.signInWithOAuth({provider:b.provider,options:{redirectTo:c.origin+'/auth/callback',skipBrowserRedirect:true}});
   if(error||!data.url)return accountJson({error:'Conectarea nu a putut fi pornită. Reîncearcă.'},502);
   return accountJson({url:data.url});
  }
  if(action==='login'){
   const {data,error}=await client.auth.signInWithPassword({email,password:b.password});
   if(error||!data.user?.email_confirmed_at){if(data.session)await client.auth.signOut({scope:'local'});return accountJson({error:'Conectarea a eșuat. Verifică e-mailul, parola și confirmarea adresei.'},401);}
   return accountJson({redirect:'/'});
  }
  if(action==='register'){
   const {data,error}=await client.auth.signUp({email,password:b.password,options:{emailRedirectTo:c.origin+'/auth/callback'}});
   // Registration must never silently bypass email verification if provider settings are wrong.
   if(data.session){await client.auth.signOut({scope:'local'});return accountJson({error:'Înregistrarea nu este disponibilă momentan. Confirmarea e-mailului trebuie configurată.'},503);}
   if(error&&error.status===429)return accountJson({error:'Prea multe încercări. Așteaptă înainte să reîncerci.'},429);
   if(error&&error.code!=='user_already_exists')return accountJson({error:'Înregistrarea nu a putut fi procesată. Reîncearcă mai târziu.'},400);
   return accountJson({message:'Dacă adresa poate fi înregistrată, vei primi un e-mail de confirmare. Verifică și folderul Spam.'});
  }
  if(action==='forgot'||action==='resend'){
   const {error}=action==='forgot'?await client.auth.resetPasswordForEmail(email,{redirectTo:c.origin+'/auth/callback'}):await client.auth.resend({type:'signup',email,options:{emailRedirectTo:c.origin+'/auth/callback'}});
   if(error)return accountJson({error:'Solicitarea nu a putut fi procesată acum. Așteaptă și reîncearcă.'},error.status===429?429:502);
   return accountJson({message:'Dacă adresa este eligibilă, vei primi un e-mail cu pașii următori. Verifică și folderul Spam.'});
  }
  const current=await accountIdentity(request);
  if(current?.deleting&&!['delete','logout'].includes(action))return accountJson({error:'Ștergerea contului este în curs. Reia ștergerea din Cont și setări.'},409);
  if(action==='logout'){const {error}=await client.auth.signOut({scope:b.allDevices===true?'global':'local'});if(error)return accountJson({error:'Deconectarea a eșuat. Reîncearcă.'},502);return accountJson({redirect:'/account?view=login'});}
  const identity=await accountIdentity(request);if(!identity)return accountJson({error:'Autentifică-te cu o adresă verificată.'},401);
  if(action==='teaching'){
   const profile=teachingProfile(b.teaching);if(!profile)return accountJson({error:'Alege rolul, disciplina și cel puțin un ciclu de clase.'},400);
   const {error}=await client.auth.updateUser({data:{teaching:profile}});if(error)return accountJson({error:'Profilul didactic nu a putut fi salvat.'},502);
   return accountJson({message:'Profil didactic salvat. Biblioteca se actualizează în conversațiile cu selecție automată.'});
  }
  if(action==='delete'){
   if(b.confirmation!=='STERGE')return accountJson({error:'Confirmă ștergerea contului.'},400);
   // getUser above validates the session remotely. amr is the signed authentication time,
   // unlike iat which changes when a token is refreshed.
   const {data:{session}}=await client.auth.getSession();
   let authenticatedAt=0;try{const payload=JSON.parse(atob(session!.access_token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(payload.sub===identity.id.slice(9))authenticatedAt=Math.max(0,...(payload.amr||[]).map((a:{timestamp?:number})=>Number(a.timestamp)||0));}catch{}
   if(!identity.deleting&&(!authenticatedAt||authenticatedAt>Date.now()/1000+60||Date.now()/1000-authenticatedAt>900))return accountJson({error:'Pentru ștergere, conectează-te din nou, apoi revino aici.',reauthenticate:true},409);
   try{await deleteOwnAccount(identity.id,c.SUPABASE_URL!);}catch(e){const blocked=await deletionPending(identity.id);return accountJson({error:e instanceof DeletionError?e.message:blocked?'Ștergerea nu este completă. Reia ștergerea din această pagină; datele rămase nu sunt accesibile în aplicație.':'Ștergerea nu a putut fi pornită. Reîncearcă.'},e instanceof DeletionError?e.status:503);}
   await client.auth.signOut({scope:'local'});
   return accountJson({redirect:'/account?notice=deleted'+(identity.linkedProviders?.includes('apple')?'&apple=1':''),clearLocalData:true});
  }
  if(action==='profile'){
   if(typeof b.name!=='string'||b.name.trim().length>100)return accountJson({error:'Numele poate avea maximum 100 de caractere.'},400);
   const teaching=b.teaching===undefined?undefined:teachingProfile(b.teaching);if(teaching===null)return accountJson({error:'Alege rolul, disciplina și cel puțin un ciclu de clase.'},400);
   const {error}=await client.auth.updateUser({data:{full_name:b.name.trim(),...(teaching?{teaching}: {})}});if(error)return accountJson({error:'Profilul nu a putut fi salvat.'},502);
   return accountJson({message:'Profil salvat.'});
  }
  if(action==='email'){
   const {error}=await client.auth.updateUser({email},{emailRedirectTo:c.origin+'/auth/callback'});if(error)return accountJson({error:'Schimbarea e-mailului nu a putut fi solicitată.'},400);
   return accountJson({message:'Verifică mesajele de confirmare trimise pe adresele de e-mail implicate.'});
  }
  const {error}=await client.auth.updateUser({password:b.password});if(error)return accountJson({error:'Parola nu a putut fi schimbată. Solicită un link nou de recuperare.'},400);
  await client.auth.signOut({scope:'global'});
  return accountJson({redirect:'/account?view=login&notice=password-updated'});
 }catch{return accountJson({error:'Serviciul de cont nu este disponibil momentan.'},503);}
}

import {env} from 'cloudflare:workers';
import {json} from '../../../lib/document-store';
import {accountIdentity} from '../../../lib/account-auth';
import {librarySnapshot} from '../../../lib/library';
export async function GET(request:Request){
 const c=env as unknown as {OPENAI_API_KEY?:string;OPENAI_VECTOR_STORE_ID?:string};const identity=await accountIdentity(request);
 if(!identity&&new URL(request.url).searchParams.has('chatId'))return json({error:'Conversație privată.'},401);
 if(identity?.deleting)return json({error:'Ștergerea contului este în curs.'},401);
 return json(await librarySnapshot(identity?.id||null,identity?.teaching||null,c.OPENAI_API_KEY,c.OPENAI_VECTOR_STORE_ID,new URL(request.url).searchParams.get('chatId')||undefined));
}

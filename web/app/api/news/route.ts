import {readNews} from '../../../lib/admin-store';
import {accountJson} from '../../../lib/account-auth';
export async function GET(request:Request){const id=new URL(request.url).searchParams.get('id');if(id&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return accountJson({error:'Știre invalidă.'},400);try{return accountJson(await readNews(false,id||undefined));}catch{return accountJson({error:'Știrile nu sunt disponibile momentan.'},503);}}

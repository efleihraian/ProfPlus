import {requireAdministrator} from '../../../../../lib/admin-store';
import {accountJson} from '../../../../../lib/account-auth';
import {sameOrigin} from '../../../../../lib/document-store';
import {ingestNews} from '../../../../../lib/news-ingest';
/** Actualizare manuală a fluxului automat, numai pentru administrator. */
export async function POST(request:Request){
 if(!sameOrigin(request))return accountJson({error:'Origine nepermisă.'},403);
 try{if(!await requireAdministrator(request))return accountJson({error:'Acces rezervat administratorului.'},403);return accountJson(await ingestNews());}
 catch{return accountJson({error:'Fluxul de știri nu a putut fi actualizat. Reîncearcă.'},503);}
}

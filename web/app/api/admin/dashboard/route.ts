import {requireAdministrator,adminRequest,readNews} from '../../../../lib/admin-store';
import {accountJson} from '../../../../lib/account-auth';
export async function GET(request:Request){try{if(!await requireAdministrator(request))return accountJson({error:'Acces rezervat administratorului.'},403);const [stats,news]=await Promise.all([adminRequest('rpc/profplus_admin_stats',{method:'POST',body:'{}'}),readNews(true)]);return accountJson({stats,...news});}catch{return accountJson({error:'Administrarea nu este disponibilă momentan.'},503);}}

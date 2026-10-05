import {userId,json} from '../../../../lib/document-store';
import {env} from 'cloudflare:workers';
import {manualStates} from '../../../../lib/library';
import catalog from '../../../../lib/manual-catalog.json';
export async function GET(request:Request){
 if(!await userId(request))return json({error:'Autentificare necesară.'},401);
 const config=env as unknown as {OPENAI_API_KEY?:string;OPENAI_VECTOR_STORE_ID?:string};
 if(!config.OPENAI_API_KEY||!config.OPENAI_VECTOR_STORE_ID)return json({available:false},503);
 try{
  const states=await manualStates(config.OPENAI_API_KEY,config.OPENAI_VECTOR_STORE_ID);
  const ids=Object.keys(catalog);
  return json({available:true,indexed:ids.filter(id=>states[id]==='ready').length,processing:ids.filter(id=>states[id]==='indexing').length,catalogTotal:ids.length});
 }catch{return json({available:false},503);}
}

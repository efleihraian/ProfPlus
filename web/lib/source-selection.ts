import {matchesTeaching,type TeachingProfile,type Stage} from './teaching-profile';
export type SourceSelection={mode?:'automatic'|'manual';manualIds:string[];documentIds:string[]};
export type SelectableSource={id:string;kind:'manual'|'document';status:string;subject?:string;schoolClass?:string;stages?:Stage[];chatId?:string};
export function automaticSources(items:SelectableSource[],profile:TeachingProfile|null,chatId?:string):SourceSelection{
 const eligible=items.filter(i=>i.status==='ready'&&((profile&&matchesTeaching(i,profile))||(!profile&&i.kind==='manual')||(i.kind==='document'&&i.chatId===chatId&&!!chatId&&!i.subject)));
 return {mode:'automatic',manualIds:[...new Set(eligible.filter(i=>i.kind==='manual').map(i=>i.id))],documentIds:[...new Set(eligible.filter(i=>i.kind==='document').map(i=>i.id))]};
}
export function savedSelection(value:SourceSelection|null):SourceSelection|null{return !value?null:value.mode==='automatic'?{mode:'automatic',manualIds:[],documentIds:[]}:value;}
export function validSelection(value:unknown):value is SourceSelection{
 if(!value||typeof value!=='object')return false;const s=value as SourceSelection;
 return (s.mode===undefined||s.mode==='manual'||s.mode==='automatic')&&Array.isArray(s.manualIds)&&Array.isArray(s.documentIds)&&s.manualIds.length<=5000&&s.documentIds.length<=50&&[...s.manualIds,...s.documentIds].every(id=>typeof id==='string'&&id.length<=80);
}

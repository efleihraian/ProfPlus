import {matchesTeaching,type TeachingProfile,type Stage} from './teaching-profile';
export type SourceSelection={mode?:'automatic'|'manual';manualIds:string[];documentIds:string[];priorityManualIds?:string[];priorityDocumentIds?:string[]};
export type SelectableSource={id:string;kind:'manual'|'document';status:string;subject?:string;schoolClass?:string;stages?:Stage[];modelTypes?:string[];chatId?:string};
export function automaticSources(items:SelectableSource[],profile:TeachingProfile|null,chatId?:string):SourceSelection{
 const eligible=items.filter(i=>!i.modelTypes?.length&&i.status==='ready'&&((profile&&matchesTeaching(i,profile))||(!profile&&i.kind==='manual')||(i.kind==='document'&&i.chatId===chatId&&!!chatId&&!i.subject)));
 return {mode:'automatic',manualIds:[...new Set(eligible.filter(i=>i.kind==='manual').map(i=>i.id))],documentIds:[...new Set(eligible.filter(i=>i.kind==='document').map(i=>i.id))]};
}
export function withPriorities(selection:SourceSelection,preferred:SourceSelection|null|undefined):SourceSelection{
 return {...selection,...(preferred?.priorityManualIds?.length?{priorityManualIds:preferred.priorityManualIds.filter(id=>selection.manualIds.includes(id))}:{}),...(preferred?.priorityDocumentIds?.length?{priorityDocumentIds:preferred.priorityDocumentIds.filter(id=>selection.documentIds.includes(id))}:{})};
}
export function savedSelection(value:SourceSelection|null):SourceSelection|null{return !value?null:value.mode==='automatic'?{...value,manualIds:[],documentIds:[]}:value;}
export function validSelection(value:unknown):value is SourceSelection{
 if(!value||typeof value!=='object')return false;const s=value as SourceSelection;
 if(!((s.mode===undefined||s.mode==='manual'||s.mode==='automatic')&&Array.isArray(s.manualIds)&&Array.isArray(s.documentIds)&&s.manualIds.length<=5000&&s.documentIds.length<=50&&[...s.manualIds,...s.documentIds].every(id=>typeof id==='string'&&id.length>0&&id.length<=80)))return false;
 return ([['priorityManualIds','manualIds'],['priorityDocumentIds','documentIds']] as const).every(([p,all])=>s[p]===undefined||Array.isArray(s[p])&&s[p]!.length<=10&&s[p]!.every(id=>typeof id==='string'&&id.length>0&&id.length<=80&&(s.mode==='automatic'||s[all].includes(id))));
}

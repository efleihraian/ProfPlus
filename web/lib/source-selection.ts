import {validExerciseOptions,type ExerciseOptions} from './exercise-options';
import {matchesTeaching,type TeachingProfile,type Stage} from './teaching-profile';
export type SourceSelection={mode?:'automatic'|'manual';manualIds:string[];documentIds:string[];priorityManualIds?:string[];priorityDocumentIds?:string[];exerciseOptions?:ExerciseOptions};
export type SelectableSource={id:string;kind:'manual'|'document';status:string;subject?:string;schoolClass?:string;stages?:Stage[];modelTypes?:string[];chatId?:string;category?:string};
export function automaticSources(items:SelectableSource[],profile:TeachingProfile|null,chatId?:string):SourceSelection{
 const eligible=items.filter(i=>!i.modelTypes?.length&&i.status==='ready'&&((profile&&matchesTeaching(i,profile))||(!profile&&i.kind==='manual')||(i.kind==='document'&&i.chatId===chatId&&!!chatId&&!i.subject)));
 return {mode:'automatic',manualIds:[...new Set(eligible.filter(i=>i.kind==='manual').map(i=>i.id))],documentIds:[...new Set(eligible.filter(i=>i.kind==='document').map(i=>i.id))]};
}
export function withPriorities(selection:SourceSelection,preferred:SourceSelection|null|undefined):SourceSelection{
 return {...selection,...(preferred?.exerciseOptions?{exerciseOptions:preferred.exerciseOptions}:{}),...(preferred?.priorityManualIds?.length?{priorityManualIds:preferred.priorityManualIds.filter(id=>selection.manualIds.includes(id))}:{}),...(preferred?.priorityDocumentIds?.length?{priorityDocumentIds:preferred.priorityDocumentIds.filter(id=>selection.documentIds.includes(id))}:{})};
}
export function savedSelection(value:SourceSelection|null):SourceSelection|null{return !value?null:value.mode==='automatic'?{...value,manualIds:[],documentIds:[]}:value;}
export function validSelection(value:unknown):value is SourceSelection{
 if(!value||typeof value!=='object')return false;const s=value as SourceSelection;
 if(s.exerciseOptions!==undefined&&!validExerciseOptions(s.exerciseOptions))return false;
 if(!((s.mode===undefined||s.mode==='manual'||s.mode==='automatic')&&Array.isArray(s.manualIds)&&Array.isArray(s.documentIds)&&s.manualIds.length<=10000&&s.documentIds.length<=50&&[...s.manualIds,...s.documentIds].every(id=>typeof id==='string'&&id.length>0&&id.length<=80)))return false;
 return ([['priorityManualIds','manualIds'],['priorityDocumentIds','documentIds']] as const).every(([p,all])=>s[p]===undefined||Array.isArray(s[p])&&s[p]!.length<=10&&s[p]!.every(id=>typeof id==='string'&&id.length>0&&id.length<=80&&(s.mode==='automatic'||s[all].includes(id))));
}

export function bulkSources(selection:SourceSelection,items:SelectableSource[],select:boolean):SourceSelection{
 const next={...selection,mode:'manual' as const,manualIds:[...selection.manualIds],documentIds:[...selection.documentIds]};
 for(const kind of ['manual','document'] as const){
  const field=kind==='manual'?'manualIds':'documentIds',priority=kind==='manual'?'priorityManualIds':'priorityDocumentIds';
  const ids=items.filter(i=>i.kind===kind&&(!select||i.status==='ready'&&!i.modelTypes?.length)).map(i=>i.id),set=new Set(ids);
  next[field]=select?[...new Set([...next[field],...ids])].slice(0,kind==='manual'?10000:50):next[field].filter(id=>!set.has(id));
  if(next[priority])next[priority]=next[priority]!.filter(id=>next[field].includes(id));
 }
 return next;
}

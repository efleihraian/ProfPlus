import {stages,teachingProfile,type Stage} from './teaching-profile';
import {validModelTypes,type DocumentModelType} from './document-models';
export const resourceTypes=[{id:'manual',label:'Manual'},{id:'collection',label:'Culegere'},{id:'olympiad',label:'Olimpiadă'},{id:'competition',label:'Concurs'},{id:'document',label:'Alt document'}] as const;
export type ResourceCategory=typeof resourceTypes[number]['id'];
export type ResourceMetadata={category:ResourceCategory;subject:string;stages:Stage[];modelTypes?:DocumentModelType[]};
export function resourceMetadata(value:unknown):ResourceMetadata|null{
 if(!value||typeof value!=='object')return null;const r=value as Partial<ResourceMetadata>;
 if(!resourceTypes.some(t=>t.id===r.category)||typeof r.subject!=='string'||!Array.isArray(r.stages)||!r.stages.length||r.stages.length>3||r.stages.some(s=>!stages.some(t=>t.id===s))||(r.modelTypes!==undefined&&!validModelTypes(r.modelTypes)))return null;
 const profile=teachingProfile({role:'teacher',subject:r.subject,stages:r.stages});
 if(r.subject!=='*'&&!profile)return null;
 return {category:r.category!,subject:r.subject==='*'?'*':profile!.subject,stages:[...new Set(r.stages)],...(r.modelTypes?.length?{modelTypes:r.modelTypes}:{})};
}
export function categoryLabel(category?:string){return resourceTypes.find(t=>t.id===category)?.label||'Document';}

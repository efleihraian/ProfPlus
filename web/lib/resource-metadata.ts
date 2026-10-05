import {stages,teachingProfile,type Stage} from './teaching-profile';
export const resourceTypes=[{id:'manual',label:'Manual'},{id:'collection',label:'Culegere'},{id:'olympiad',label:'Olimpiadă'},{id:'competition',label:'Concurs'},{id:'document',label:'Alt document'}] as const;
export type ResourceCategory=typeof resourceTypes[number]['id'];
export type ResourceMetadata={category:ResourceCategory;subject:string;stages:Stage[]};
export function resourceMetadata(value:unknown):ResourceMetadata|null{
 if(!value||typeof value!=='object')return null;const r=value as Partial<ResourceMetadata>;
 if(!resourceTypes.some(t=>t.id===r.category)||typeof r.subject!=='string'||!(r.subject==='*'||teachingProfile({role:'teacher',subject:r.subject==='*'?'*':teachingProfile({role:'teacher',subject:r.subject,stages:r.stages})!.subject,stages:r.stages}))||!Array.isArray(r.stages)||!r.stages.length||r.stages.length>3||r.stages.some(s=>!stages.some(t=>t.id===s)))return null;
 return {category:r.category!,subject:r.subject==='*'?'*':teachingProfile({role:'teacher',subject:r.subject,stages:r.stages})!.subject,stages:[...new Set(r.stages)]};
}
export function categoryLabel(category?:string){return resourceTypes.find(t=>t.id===category)?.label||'Document';}

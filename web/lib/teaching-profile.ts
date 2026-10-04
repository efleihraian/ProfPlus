import catalog from './manual-catalog.json';
export const stages = [{id:'primary',label:'Clasele 0–4'},{id:'middle',label:'Clasele 5–8'},{id:'high',label:'Clasele 9–12'}] as const;
export type Stage = typeof stages[number]['id'];
export type TeachingProfile = {role:'primary'|'teacher';subject:string;stages:Stage[]};
const subjectKey=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase('ro');
export const subjects = [...new Set(Object.values(catalog).map(m=>m.subject.trim()))].sort((a,b)=>a.localeCompare(b,'ro'));
export function teachingProfile(value:unknown):TeachingProfile|null {
 if(!value||typeof value!=='object')return null;
 const p=value as Partial<TeachingProfile>;
 if(p.role==='primary')return {role:'primary',subject:'*',stages:['primary']};
 const subject=typeof p.subject==='string'?subjects.find(s=>subjectKey(s)===subjectKey(p.subject!)):undefined;
 if(p.role!=='teacher'||!subject||!Array.isArray(p.stages)||!p.stages.length||p.stages.length>3||p.stages.some(s=>!stages.some(stage=>stage.id===s)))return null;
 return {role:'teacher',subject,stages:[...new Set(p.stages)]};
}
const roman:Record<string,number>={I:1,II:2,III:3,IV:4,V:5,VI:6,VII:7,VIII:8,IX:9,X:10,XI:11,XII:12};
export function matchesTeaching(item:{subject?:string;schoolClass?:string},profile:TeachingProfile):boolean {
 if(!item.schoolClass||!item.subject)return false;
 const grades=[...item.schoolClass.matchAll(/\b(XIII|XII|XI|IX|VIII|VII|VI|IV|III|II|X|V|I)\b/g)].map(m=>roman[m[1]]).filter(Boolean);
 if(/pregatitoare|clasa 0/i.test(subjectKey(item.schoolClass)))grades.push(0);
 return (profile.role==='primary'||subjectKey(item.subject)===subjectKey(profile.subject))&&grades.some(g=>profile.stages.includes(g<=4?'primary':g<=8?'middle':'high'));
}
export function defaultManualIds(profile:TeachingProfile|null,eligibleIds:string[]):string[]{
 return eligibleIds.filter(id=>{const m=catalog[id as keyof typeof catalog];return m&&(!profile||matchesTeaching({schoolClass:m.class,subject:m.subject},profile));}).slice(0,50);
}

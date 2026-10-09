/** Public metadata only. Private documents live in separate, owner-scoped stores. */
export type CommonResource={title:string;subject:string;publisher:string;url:string;schoolClass?:string;class?:string;stages:('primary'|'middle'|'high')[];category:'olympiad'|'competition';pageLocator?:string};
export function commonResource(value:unknown):{uid:string;resource:CommonResource}|null{
 if(!value||typeof value!=='object')return null;
 const a=value as Record<string,unknown>;
 if(typeof a.uid!=='string'||!/^competition-[a-f0-9]{24}$/.test(a.uid)||!['olympiad','competition'].includes(String(a.category))||typeof a.title!=='string'||!a.title.trim()||typeof a.subject!=='string'||typeof a.source_url!=='string')return null;
 try{const u=new URL(a.source_url);if(u.protocol!=='https:'||u.username||u.password)return null;}catch{return null;}
 const stages=typeof a.stages==='string'?a.stages.split(',').filter((s):s is 'primary'|'middle'|'high'=>['primary','middle','high'].includes(s)):[];
 return {uid:a.uid,resource:{title:a.title.slice(0,256),subject:a.subject.slice(0,256),publisher:typeof a.publisher==='string'?a.publisher.slice(0,256):'',url:a.source_url,category:a.category as 'olympiad'|'competition',stages,schoolClass:typeof a.class==='string'&&a.class?a.class:undefined,pageLocator:a.page_locator==='fragment'?'fragment':'pdf'}};
}

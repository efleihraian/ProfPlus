export type NewsArticle={id:string;title:string;summary:string;body:string;category:string;image_url:string;source_url:string;slot:number;status:'draft'|'published'|'archived';published_at:string|null;revision:number};
export type NewsSettings={title:string;intro:string};
export const defaultNewsSettings={title:'Știri pentru profesori',intro:'Legislație, examene, resurse și evenimente din educație.'};
export function safeNewsUrl(value:unknown){if(value==='')return true;if(typeof value!=='string'||value.length>2048)return false;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}
export function validNews(value:unknown):value is NewsArticle{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;const n=value as NewsArticle;
 if(Object.keys(n).some(k=>!['id','title','summary','body','category','image_url','source_url','slot','status','published_at','revision'].includes(k)))return false;
 return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(n.id)&&Number.isInteger(n.revision)&&n.revision>=0&&Number.isInteger(n.slot)&&n.slot>=0&&n.slot<=3&&['draft','published','archived'].includes(n.status)&&
 [['title',200],['summary',600],['body',20000],['category',80]].every(([k,max])=>typeof n[k as keyof NewsArticle]==='string'&&(n[k as keyof NewsArticle] as string).length<=Number(max))&&!!n.title.trim()&&
 safeNewsUrl(n.image_url)&&safeNewsUrl(n.source_url)&&(n.published_at===null||typeof n.published_at==='string'&&/^\d{4}-\d\d-\d\dT/.test(n.published_at)&&Number.isFinite(Date.parse(n.published_at)))&&(n.status!=='published'||!!n.published_at);
}
export function validNewsSettings(value:unknown):value is NewsSettings{if(!value||typeof value!=='object'||Array.isArray(value))return false;const s=value as NewsSettings;return Object.keys(s).length===2&&typeof s.title==='string'&&!!s.title.trim()&&s.title.length<=100&&typeof s.intro==='string'&&s.intro.length<=600;}

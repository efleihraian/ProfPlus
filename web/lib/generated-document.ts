export type GeneratedDocument={title:string;content:string;latex?:string};
export function validGeneratedDocument(value:unknown):value is GeneratedDocument{
 if(!value||typeof value!=='object')return false;
 const doc=value as GeneratedDocument;
 return typeof doc.title==='string'&&!!doc.title.trim()&&doc.title.length<=200&&typeof doc.content==='string'&&!!doc.content.trim()&&doc.content.length<=20000&&(doc.latex===undefined||(typeof doc.latex==='string'&&!!doc.latex.trim()&&doc.latex.length<=60000));
}

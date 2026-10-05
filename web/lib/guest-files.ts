export type GuestFile={name:string;data:string};
export const guestMimes:Record<string,string>={pdf:'application/pdf',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',txt:'text/plain',md:'text/markdown',html:'text/html'};
export function validateGuestFiles(value:unknown):GuestFile[]{
 if(value===undefined)return [];
 if(!Array.isArray(value)||value.length>3)throw Error('Maximum trei fișiere temporare.');
 let total=0;
 return value.map(f=>{
 if(!f||typeof f.name!=='string'||f.name.length>180||/[\x00-\x1f/\\]/.test(f.name)||typeof f.data!=='string')throw Error('Fișier invalid.');
 const ext=f.name.split('.').at(-1)?.toLowerCase()||'',mime=guestMimes[ext];
 const prefix=`data:${mime};base64,`;if(!mime||!f.data.startsWith(prefix))throw Error('Format nepermis.');
 const encoded=f.data.slice(prefix.length);if(!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)||encoded.length%4)throw Error('Fișier invalid.');
 const bytes=atob(encoded);total+=bytes.length;if(!bytes.length||total>10*1024*1024)throw Error('Maximum 10 MB în total.');
 if(ext==='pdf'&&!bytes.startsWith('%PDF-')||['docx','pptx'].includes(ext)&&!bytes.startsWith('PK')||ext==='doc'&&bytes.charCodeAt(0)!==208&&bytes.charCodeAt(0)!==123)throw Error('Semnătură invalidă.');
 if(['txt','md','html'].includes(ext)&&bytes.includes('\0'))throw Error('Fișier text invalid.');
 return {name:f.name,data:f.data};
 });
}

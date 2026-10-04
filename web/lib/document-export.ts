import type {GeneratedDocument} from './generated-document';
import type {Source} from './rag';
type Block={type:'text'|'heading'|'break';text:string;level?:number}|{type:'table';rows:string[][]};
export function blocks(content:string):Block[]{
 const lines=content.replace(/\r/g,'').split('\n'),result:Block[]=[];
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();if(!line)continue;
  if(/^---+$/.test(line)){result.push({type:'break',text:''});continue;}
  if(line.includes('|')&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1]||'')){
   const cells=(v:string)=>v.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
   const rows=[cells(line)];i++;
   while(i+1<lines.length&&lines[i+1].includes('|'))rows.push(cells(lines[++i]));
   result.push({type:'table',rows});continue;
  }
  const heading=/^(#{1,6})\s+(.+)$/.exec(line);
  result.push(heading?{type:'heading',text:heading[2],level:heading[1].length}:{type:'text',text:line.replace(/^[-*+]\s+/,'• ')});
 }
 return result;
}
const plain=(text:string)=>text.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1 ($2)').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/\*([^*]+)\*/g,'$1').replace(/`([^`]+)`/g,'$1');
function content(doc:GeneratedDocument,sources:Source[]){return doc.content+(sources.length?'\n\n## Surse consultate\n'+sources.map(s=>`[${s.id}] ${s.title}\n${s.url.startsWith('/')&&typeof location!=='undefined'?location.origin+s.url:s.url}`).join('\n\n'):'');}
export async function exportDocx(doc:GeneratedDocument,sources:Source[]=[]):Promise<Blob>{
 const {Document,Paragraph,TextRun,Table,TableRow,TableCell,Packer,HeadingLevel,WidthType}=await import('docx');
 const paragraph=(text:string,level?:number)=>new Paragraph({heading:level?(level===1?HeadingLevel.HEADING_1:HeadingLevel.HEADING_2):undefined,spacing:{after:130},children:text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map(part=>new TextRun({text:plain(part),bold:part.startsWith('**'),italics:part.startsWith('*')&&!part.startsWith('**')}))});
 const children=[paragraph(doc.title,1),...blocks(content(doc,sources)).map(b=>b.type==='table'?new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:b.rows.map((row,i)=>new TableRow({tableHeader:i===0,children:row.map(cell=>new TableCell({children:[paragraph(cell)]}))}))}):b.type==='break'?new Paragraph({pageBreakBefore:true}):paragraph(b.text,b.level))];
 return Packer.toBlob(new Document({styles:{default:{document:{run:{font:'Arial',size:22},paragraph:{spacing:{line:300}}}}},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},children}]}));
}
export async function exportPdf(doc:GeneratedDocument,sources:Source[]=[],fontBytes?:Uint8Array,boldBytes?:Uint8Array):Promise<Blob>{
 const [{PDFDocument,rgb},{default:fontkit}]=await Promise.all([import('pdf-lib'),import('@pdf-lib/fontkit')]);
 if(!fontBytes){const r=await fetch('/fonts/NotoSans-Regular.ttf');if(!r.ok)throw new Error('Fontul PDF nu este disponibil.');fontBytes=new Uint8Array(await r.arrayBuffer());const bold=await fetch('/fonts/NotoSans-Bold.ttf');if(!bold.ok)throw new Error('Fontul PDF nu este disponibil.');boldBytes=new Uint8Array(await bold.arrayBuffer());}
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);const font=await pdf.embedFont(fontBytes,{subset:true});const boldFont=boldBytes?await pdf.embedFont(boldBytes,{subset:true}):font;pdf.setTitle(doc.title);
 const width=595.28,height=841.89,margin=48;let page=pdf.addPage([width,height]),y=height-margin;
 const addPage=()=>{page=pdf.addPage([width,height]);y=height-margin;};
 const wrap=(value:string,size:number,max:number,measureFont=font)=>{
  const result:string[]=[];let line='';
  for(const word of plain(value).split(/\s+/)){
   const candidate=line?line+' '+word:word;
   if(measureFont.widthOfTextAtSize(candidate,size)<=max){line=candidate;continue;}
   if(line){result.push(line);line='';}
   for(const char of word){if(measureFont.widthOfTextAtSize(line+char,size)>max&&line){result.push(line);line='';}line+=char;}
  }if(line)result.push(line);return result.length?result:[''];
 };
 const draw=(text:string,size=11,bold=false)=>{for(const line of wrap(text,size,width-margin*2,bold?boldFont:font)){if(y-size*1.5<margin)addPage();y-=size*1.5;page.drawText(line,{x:margin,y,size,font:bold?boldFont:font,color:rgb(.12,.14,.12)});}y-=7;};
 draw(doc.title,19,true);
 for(const b of blocks(content(doc,sources))){
  if(b.type==='break'){addPage();continue;}
  if(b.type!=='table'){draw(b.text,b.type==='heading'?(b.level===1?17:14):11,b.type==='heading');continue;}
  const columns=Math.max(...b.rows.map(r=>r.length)),cellWidth=(width-2*margin)/columns;
  for(const row of b.rows){const cells=Array.from({length:columns},(_,i)=>wrap(row[i]||'',10,cellWidth-12));const count=Math.max(...cells.map(c=>c.length));let start=0;
   while(start<count){if(y-margin<40)addPage();const take=Math.min(count-start,Math.max(1,Math.floor((y-margin-12)/15))),rowHeight=take*15+12;
    cells.forEach((lines,i)=>{page.drawRectangle({x:margin+i*cellWidth,y:y-rowHeight,width:cellWidth,height:rowHeight,borderWidth:.5,borderColor:rgb(.7,.75,.7)});lines.slice(start,start+take).forEach((line,j)=>page.drawText(line,{x:margin+i*cellWidth+6,y:y-16-j*15,size:10,font}));});y-=rowHeight;start+=take;if(start<count)addPage();
   }
  }y-=10;
 }
 const pages=pdf.getPages();pages.forEach((p,i)=>p.drawText(`${i+1} / ${pages.length}`,{x:width/2-12,y:25,size:9,font,color:rgb(.5,.5,.5)}));
 return new Blob([new Uint8Array(await pdf.save())],{type:'application/pdf'});
}
export function download(blob:Blob,title:string,extension:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(title.replace(/[\\/:*?"<>|]/g,'').trim()||'Document')+'.'+extension;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}

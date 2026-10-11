import type {GeneratedDocument} from './generated-document';
import type {Source} from './rag';
import {mathParts,normalizeMath} from './math-format';
type Block={type:'text'|'heading'|'break';text:string;level?:number}|{type:'table';rows:string[][]};
export function blocks(content:string):Block[]{
 const lines=normalizeMath(content).replace(/\r/g,'').split('\n'),result:Block[]=[];
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();if(!line)continue;
  if(line==='$$'){let formula='';while(i+1<lines.length&&lines[++i].trim()!=='$$')formula+=lines[i]+'\n';result.push({type:'text',text:'$$'+formula.trim()+'$$'});continue;}
  if(/^---+$/.test(line)){result.push({type:'break',text:''});continue;}
  if(line.includes('|')&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1]||'')){
   const cells=(v:string)=>v.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
   const rows=[cells(line)];i++;
   while(i+1<lines.length&&lines[i+1].includes('|'))rows.push(cells(lines[++i]));
   result.push({type:'table',rows});continue;
  }
  const heading=/^(#{1,6})\s+(.+)$/.exec(line);
  result.push(heading?{type:'heading',text:heading[2],level:heading[1].length}:{type:'text',text:line.replace(/^[-*+]\s+(?=[a-z]\))/, '').replace(/^[-*+]\s+/,'• ')});
 }
 return result;
}
const plain=(text:string)=>text.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1 ($2)').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/\*([^*]+)\*/g,'$1').replace(/`([^`]+)`/g,'$1');
function content(doc:GeneratedDocument,sources:Source[]){return doc.content+(sources.length?'\n\n## Surse consultate\n'+sources.map(s=>`[${s.id}] ${s.title}\n${s.url.startsWith('/')&&typeof location!=='undefined'?location.origin+s.url:s.url}`).join('\n\n'):'');}
export async function exportDocx(doc:GeneratedDocument,sources:Source[]=[]):Promise<Blob>{
 const {Document,Paragraph,TextRun,ImageRun,Table,TableRow,TableCell,Packer,HeadingLevel,WidthType}=await import('docx');
 const images=new Map<string,Promise<Awaited<ReturnType<typeof import('./math-export').formulaImage>>>>();
 const image=(tex:string)=>{if(!images.has(tex))images.set(tex,import('./math-export').then(m=>m.formulaImage(tex)));return images.get(tex)!;};
 const paragraph=async(text:string,level?:number)=>new Paragraph({heading:level?(level===1?HeadingLevel.HEADING_1:HeadingLevel.HEADING_2):undefined,spacing:{after:130},children:(await Promise.all(mathParts(text).map(async part=>{
  if(part.math){const img=await image(part.text),scale=Math.min(1,600/img.width);return [new ImageRun({type:'png',data:img.data,transformation:{width:img.width*scale,height:img.height*scale},altText:{title:'Formulă',description:part.text,name:'Formulă matematică'}})];}
  return part.text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map(p=>new TextRun({text:plain(p),bold:p.startsWith('**'),italics:p.startsWith('*')&&!p.startsWith('**')}));
 }))).flat()});
 const children=[await paragraph(doc.title,1),...await Promise.all(blocks(content(doc,sources)).map(async b=>b.type==='table'?new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:await Promise.all(b.rows.map(async(row,i)=>new TableRow({tableHeader:i===0,children:await Promise.all(row.map(async cell=>new TableCell({children:[await paragraph(cell)]})))})))}):b.type==='break'?new Paragraph({pageBreakBefore:true}):paragraph(b.text,b.level)))];
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
 const images=new Map<string,Promise<{image:Awaited<ReturnType<typeof pdf.embedPng>>;width:number;height:number;descent:number}>>();
 const draw=async(text:string,size=11,bold=false,maxWidth=width-margin*2,xStart=margin,dryRun=false)=>{
  const startY=y,measure=bold?boldFont:font,parts=mathParts(text);let x=xStart,line:({text:string;width:number}|{image:Awaited<ReturnType<typeof pdf.embedPng>>;width:number;height:number;descent:number})[]=[];
  const flush=()=>{if(!line.length)return;const ascent=Math.max(size,...line.map(p=>'image'in p?p.height-p.descent:size)),descent=Math.max(size*.3,...line.map(p=>'image'in p?p.descent:0)),height=ascent+descent+4;if(!dryRun&&y-height<margin)addPage();const baseline=y-ascent;let pos=xStart;for(const p of line){if(dryRun){pos+=p.width;continue;}if('image'in p)page.drawImage(p.image,{x:pos,y:baseline-p.descent,width:p.width,height:p.height});else page.drawText(p.text,{x:pos,y:baseline,size,font:measure,color:rgb(.12,.14,.12)});pos+=p.width;}y-=height;line=[];x=xStart;};
  for(const part of parts){
   if(part.math){const key=size+':'+part.text;if(!images.has(key))images.set(key,import('./math-export').then(async m=>{const img=await m.formulaImage(part.text,size);return {...img,image:await pdf.embedPng(img.data)};}));let img=await images.get(key)!;const scale=Math.min(1,maxWidth/img.width,(height-margin*2-20)/img.height);img={...img,width:img.width*scale,height:img.height*scale,descent:img.descent*scale};if(part.display||x+img.width>xStart+maxWidth)flush();line.push(img);x+=img.width;if(part.display)flush();}
   else for(const token of plain(part.text).split(/(\s+)/).filter(Boolean)){
    if(/^\s+$/.test(token)&&!line.length)continue;
    for(const word of wrap(token,size,maxWidth,measure)){const value=/^\s+$/.test(token)?' ':word,w=measure.widthOfTextAtSize(value,size);if(x+w>xStart+maxWidth)flush();if(value===' '&&!line.length)continue;line.push({text:value,width:w});x+=w;}
   }
  }flush();y-=7;const used=startY-y;if(dryRun)y=startY;return used;
 };
 await draw(doc.title,19,true);
 for(const b of blocks(content(doc,sources))){
  if(b.type==='break'){addPage();continue;}
  if(b.type!=='table'){await draw(b.text,b.type==='heading'?(b.level===1?17:14):11,b.type==='heading');continue;}
  const columns=Math.max(...b.rows.map(r=>r.length)),cellWidth=(width-2*margin)/columns;
  for(let r=0;r<b.rows.length;r++){
   const row=b.rows[r],heights:number[]=[];for(let i=0;i<columns;i++)heights.push(await draw(row[i]||'',10,r===0,cellWidth-12,margin+i*cellWidth+6,true));const rowHeight=Math.max(...heights)+12;
   if(rowHeight>height-margin*2){for(let i=0;i<columns;i++)await draw((r?plain(b.rows[0][i]||'')+': ':'')+(row[i]||''),10,r===0);continue;}
   if(y-rowHeight<margin)addPage();const top=y;
   for(let i=0;i<columns;i++){page.drawRectangle({x:margin+i*cellWidth,y:top-rowHeight,width:cellWidth,height:rowHeight,borderWidth:.5,borderColor:rgb(.7,.75,.7)});y=top-6;await draw(row[i]||'',10,r===0,cellWidth-12,margin+i*cellWidth+6);}
   y=top-rowHeight;
  }y-=10;
 }
 const pages=pdf.getPages();pages.forEach((p,i)=>p.drawText(`${i+1} / ${pages.length}`,{x:width/2-12,y:25,size:9,font,color:rgb(.5,.5,.5)}));
 return new Blob([new Uint8Array(await pdf.save())],{type:'application/pdf'});
}
export function download(blob:Blob,title:string,extension:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(title.replace(/[\\/:*?"<>|]/g,'').trim()||'Document')+'.'+extension;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}

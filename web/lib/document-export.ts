import type {GeneratedDocument} from './generated-document';
import type {Source} from './rag';
import {mathParts,normalizeMath} from './math-format';
type Block={type:'text'|'heading'|'separator'|'break';text:string;level?:number}|{type:'table';rows:string[][]};
export function blocks(content:string):Block[]{
 const lines=normalizeMath(content).replace(/\r/g,'').split('\n'),result:Block[]=[];
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();if(!line)continue;
  if(line==='$$'){let formula='';while(i+1<lines.length&&lines[++i].trim()!=='$$')formula+=lines[i]+'\n';result.push({type:'text',text:'$$'+formula.trim()+'$$'});continue;}
  if(/^(?:-{3,}|\*{3,}|_{3,})$/.test(line)){result.push({type:'separator',text:''});continue;}
  if(/^(?:<!--\s*pagebreak\s*-->|\\(?:newpage|pagebreak))$/.test(line)){result.push({type:'break',text:''});continue;}
  if(line.includes('|')&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1]||'')){
   const cells=(v:string)=>v.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
   const rows=[cells(line)];i++;
   while(i+1<lines.length&&lines[i+1].includes('|'))rows.push(cells(lines[++i]));
   result.push({type:'table',rows});continue;
  }
  const heading=/^(#{1,6})\s+(.+)$/.exec(line);
  if(!heading&&/^(?:partea\b|subiectul\b|probleme bonus\b|barem(?: de|$|:))/i.test(line.replace(/^\*\*|\*\*$/g,''))){result.push({type:'heading',text:line.replace(/^\*\*|\*\*$/g,''),level:2});continue;}
  result.push(heading?{type:'heading',text:heading[2],level:heading[1].length}:{type:'text',text:line.replace(/^[-*+]\s+(?=[a-z]\))/, '').replace(/^[-*+]\s+/,'• ')});
 }
 return result;
}
export function exportBlocks(doc:GeneratedDocument,sources:Source[]=[]):Block[]{
 const parsed=blocks(content(doc,sources));
 // The editable title is authoritative; don't print a second title from the body.
 if(parsed[0]?.type==='heading'&&parsed[0].level===1)parsed.shift();
 const result:Block[]=[{type:'heading',text:doc.title,level:1},...parsed];
 return result.filter((b,i)=>b.type!=='separator'||(result[i-1]?.type!=='heading'&&result[i+1]?.type!=='heading'));
}
const plain=(text:string)=>text.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1 ($2)').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/\*([^*]+)\*/g,'$1').replace(/`([^`]+)`/g,'$1');
function content(doc:GeneratedDocument,sources:Source[]){return doc.content+(sources.length?'\n\n## Surse consultate\n'+sources.map(s=>`[${s.id}] ${s.title}\n${s.url.startsWith('/')&&typeof location!=='undefined'?location.origin+s.url:s.url}`).join('\n\n'):'');}
export async function exportDocx(doc:GeneratedDocument,sources:Source[]=[]):Promise<Blob>{
 const {Document,Paragraph,TextRun,ImageRun,Table,TableRow,TableCell,Packer,HeadingLevel,WidthType,AlignmentType,BorderStyle}=await import('docx');
 const images=new Map<string,Promise<Awaited<ReturnType<typeof import('./math-export').formulaImage>>>>();
 const image=(tex:string)=>{if(!images.has(tex))images.set(tex,import('./math-export').then(m=>m.formulaImage(tex)));return images.get(tex)!;};
 const paragraph=async(text:string,level?:number)=>new Paragraph({heading:level?(level===1?HeadingLevel.HEADING_1:HeadingLevel.HEADING_2):undefined,alignment:level===1?AlignmentType.CENTER:AlignmentType.LEFT,keepNext:!!level,spacing:{before:level===1?0:level?120:0,after:level===1?100:level?80:70},border:level&&level>1?{bottom:{style:BorderStyle.SINGLE,size:4,color:'555555',space:3}}:undefined,children:(await Promise.all(mathParts(text).map(async part=>{
  if(part.math){const img=await image(part.text),scale=Math.min(1,600/img.width);return [new ImageRun({type:'png',data:img.data,transformation:{width:img.width*scale,height:img.height*scale},altText:{title:'Formulă',description:part.text,name:'Formulă matematică'}})];}
  return part.text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map(p=>new TextRun({text:plain(p),bold:p.startsWith('**'),italics:p.startsWith('*')&&!p.startsWith('**')}));
 }))).flat()});
 const children=await Promise.all(exportBlocks(doc,sources).map(async b=>b.type==='table'?new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:await Promise.all(b.rows.map(async(row,i)=>new TableRow({tableHeader:i===0,children:await Promise.all(row.map(async cell=>new TableCell({children:[await paragraph(cell)]})))})))}):b.type==='break'?new Paragraph({pageBreakBefore:true}):b.type==='separator'?new Paragraph({keepNext:true,spacing:{before:40,after:70},border:{bottom:{style:BorderStyle.SINGLE,size:4,color:'777777'}}}):paragraph(b.text,b.level)));
 return Packer.toBlob(new Document({styles:{default:{document:{run:{font:'Cambria',size:22},paragraph:{spacing:{line:260}}}},paragraphStyles:[{id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',run:{size:30,bold:true,color:'000000'},paragraph:{keepNext:true}},{id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',run:{size:24,bold:true,color:'000000'},paragraph:{keepNext:true}}]},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},children}]}));
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
 const draw=async(text:string,size=11,bold=false,maxWidth=width-margin*2,xStart=margin,dryRun=false,center=false)=>{
  const startY=y,measure=bold?boldFont:font,parts=mathParts(text);let x=xStart,line:({text:string;width:number}|{image:Awaited<ReturnType<typeof pdf.embedPng>>;width:number;height:number;descent:number})[]=[];
  const flush=()=>{if(!line.length)return;const ascent=Math.max(size,...line.map(p=>'image'in p?p.height-p.descent:size)),descent=Math.max(size*.3,...line.map(p=>'image'in p?p.descent:0)),height=ascent+descent+2;if(!dryRun&&y-height<margin)addPage();const baseline=y-ascent;let pos=xStart+(center?Math.max(0,(maxWidth-line.reduce((total,p)=>total+p.width,0))/2):0);for(const p of line){if(dryRun){pos+=p.width;continue;}if('image'in p)page.drawImage(p.image,{x:pos,y:baseline-p.descent,width:p.width,height:p.height});else page.drawText(p.text,{x:pos,y:baseline,size,font:measure,color:rgb(.12,.14,.12)});pos+=p.width;}y-=height;line=[];x=xStart;};
  for(const part of parts){
   if(part.math){const key=size+':'+part.text;if(!images.has(key))images.set(key,import('./math-export').then(async m=>{const img=await m.formulaImage(part.text,size);return {...img,image:await pdf.embedPng(img.data)};}));let img=await images.get(key)!;const scale=Math.min(1,maxWidth/img.width,(height-margin*2-20)/img.height);img={...img,width:img.width*scale,height:img.height*scale,descent:img.descent*scale};if(part.display||x+img.width>xStart+maxWidth)flush();line.push(img);x+=img.width;if(part.display)flush();}
   else for(const token of plain(part.text).split(/(\s+)/).filter(Boolean)){
    if(/^\s+$/.test(token)&&!line.length)continue;
    for(const word of wrap(token,size,maxWidth,measure)){const value=/^\s+$/.test(token)?' ':word,w=measure.widthOfTextAtSize(value,size);if(x+w>xStart+maxWidth)flush();if(value===' '&&!line.length)continue;line.push({text:value,width:w});x+=w;}
   }
  }flush();y-=4;const used=startY-y;if(dryRun)y=startY;return used;
 };
 const documentBlocks=exportBlocks(doc,sources),topY=height-margin;
 const rule=()=>{if(y-8<margin)addPage();page.drawLine({start:{x:margin,y:y-1},end:{x:width-margin,y:y-1},thickness:.5,color:rgb(.35,.35,.35)});y-=8;};
 for(let index=0;index<documentBlocks.length;index++){
  const b=documentBlocks[index];
  if(b.type==='break'){if(y<topY)addPage();continue;}
  if(b.type==='separator'){
   // A Markdown thematic break is a visual divider, never a new page.
   if(index>0&&documentBlocks[index-1].type!=='heading'&&y<topY&&y-8>=margin)rule();
   continue;
  }
  if(b.type!=='table'){
   const heading=b.type==='heading',size=heading?(b.level===1?15:12):11;
   const score=heading&&b.level!==1?plain(b.text).match(/^(.*?)\s*[-–—:]\s*(\d+\s*puncte)$/i):null;
   const scoreWidth=score?boldFont.widthOfTextAtSize(score[2],size):0;
   const text=score?score[1]:b.text,textWidth=width-margin*2-(score?scoreWidth+18:0);
   const used=await draw(text,size,heading,textWidth,margin,true);
   const options=!heading?plain(b.text).match(/^A\.\s+([\s\S]+?)\s+B\.\s+([\s\S]+?)\s+C\.\s+([\s\S]+?)\s+D\.\s+([\s\S]+)$/):null;
   if(options){
    const cellWidth=(width-2*margin)/4,cells=options.slice(1).map((v,i)=>String.fromCharCode(65+i)+'. '+v);let rowHeight=0;
    for(const cell of cells)rowHeight=Math.max(rowHeight,await draw(cell,size,false,cellWidth-10,margin,true));
    if(y-rowHeight<margin&&y<topY)addPage();const top=y;
    for(let i=0;i<cells.length;i++){y=top;await draw(cells[i],size,false,cellWidth-10,margin+i*cellWidth);}
    y=top-rowHeight;continue;
   }
   if(heading){
    const next=documentBlocks.slice(index+1).find(v=>v.type!=='separator');
    let following=0;
    if(next&&next.type!=='break'){
     if(next.type==='table'){
      const cols=Math.max(...next.rows.map(r=>r.length)),cellWidth=(width-2*margin)/cols;
      for(const cell of next.rows[0])following=Math.max(following,await draw(cell,10,true,cellWidth-12,margin,true)+12);
     }else{
      const measured=await draw(next.text,next.type==='heading'?12:11,next.type==='heading',width-margin*2,margin,true);
      following=measured<=80?measured:24;
     }
    }
    let needed=used+(b.level===1?8:14)+following;
    // Keep a short final problem section and its bonus together, as in the test references.
    if(/^partea\s+(?:a\s*)?III\b/i.test(plain(b.text))){
     let tail=used+14;
     for(const block of documentBlocks.slice(index+1)){
      if(block.type==='break'||block.type==='table')break;
      if(block.type==='separator'){tail+=8;continue;}
      if(block.type==='heading'&&!/^probleme bonus\b/i.test(plain(block.text)))break;
      tail+=await draw(block.text,block.type==='heading'?12:11,block.type==='heading',width-margin*2,margin,true)+(block.type==='heading'?14:0);
     }
     if(tail<=(height-2*margin)*.65)needed=Math.max(needed,tail);
    }
    if(y-Math.min(needed,height-2*margin)<margin&&y<topY)addPage();
    if(b.level!==1&&y<topY)y-=6;
   }else if(used<=80&&y-used<margin&&y<topY)addPage();
   const start=y;
   await draw(text,size,heading,textWidth,margin,false,(heading&&b.level===1)||(!heading&&index<3&&/^clasa\b/i.test(plain(text))));
   if(score){const end=y;y=start;await draw(score[2],size,true,scoreWidth+1,width-margin-scoreWidth);y=Math.min(y,end);}
   if(heading){if(b.level===1)y-=8;else rule();}
   continue;
  }
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

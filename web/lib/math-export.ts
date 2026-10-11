// Loaded only on export. Paths keep formulas independent of installed fonts/CDNs.
import {mathjax} from 'mathjax-full/js/mathjax.js';
import {TeX} from 'mathjax-full/js/input/tex.js';
import {SVG} from 'mathjax-full/js/output/svg.js';
import {liteAdaptor} from 'mathjax-full/js/adaptors/liteAdaptor.js';
import {RegisterHTMLHandler} from 'mathjax-full/js/handlers/html.js';
import 'mathjax-full/js/input/tex/ams/AmsConfiguration.js';
const adaptor=liteAdaptor();RegisterHTMLHandler(adaptor);
export function formulaSvg(tex:string,size=15){
 if(tex.length>4000)throw new Error('Formula este prea lungă pentru export.');
 const renderer=mathjax.document('',{InputJax:new TeX({packages:['base','ams'],maxBuffer:5000,maxMacros:200}),OutputJax:new SVG({fontCache:'none'})});
 const markup=adaptor.outerHTML(renderer.convert(tex,{display:false}));
 if(markup.includes('data-mjx-error')||/<(?:script|image|foreignObject|a)\b/i.test(markup))throw new Error('O formulă nu poate fi exportată. Corectează formula în document.');
 const svg=markup.match(/<svg\b[\s\S]*<\/svg>/)?.[0],box=svg?.match(/viewBox="([^"]+)"/)?.[1].split(' ').map(Number);
 if(!svg||!box||box.length!==4||box.some(v=>!Number.isFinite(v)))throw new Error('Formula nu poate fi pregătită.');
 const width=Math.max(1,box[2]/1000*size),height=Math.max(1,box[3]/1000*size),descent=Math.max(0,(box[1]+box[3])/1000*size);
 if(width>10000||height>3000||width*height*9>12000000)throw new Error('Formula depășește dimensiunea permisă.');
 return {svg:svg.replace(/width="[^"]+"/,`width="${width}"`).replace(/height="[^"]+"/,`height="${height}"`).replace('<svg ', '<svg color="black" '),width,height,descent};
}
export async function formulaImage(tex:string,size=15){
 const formula=formulaSvg(tex,size),url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(formula.svg);
 {
  const img=new Image();await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('Formula nu poate fi afișată pentru export.'));img.src=url;});
  const canvas=document.createElement('canvas');canvas.width=Math.ceil(formula.width*3);canvas.height=Math.ceil(formula.height*3);
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Exportul formulelor nu este disponibil.');ctx.drawImage(img,0,0,canvas.width,canvas.height);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Formula nu poate fi exportată.')),'image/png'));
  return {...formula,data:new Uint8Array(await blob.arrayBuffer())};
 }
}

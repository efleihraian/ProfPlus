// Applied at the Worker boundary, including API errors and static responses.
export function secureResponse(request:Request,response:Response,independentAuth:boolean){
 const url=new URL(request.url),local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 if(!local&&url.protocol==='http:'){url.protocol='https:';response=Response.redirect(url.toString(),308);}
 const headers=new Headers(response.headers);
 headers.set('X-Content-Type-Options','nosniff');
 headers.set('Referrer-Policy','no-referrer');
 headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=()');
 if(independentAuth)headers.set('X-Frame-Options','DENY');
 // The private Sites pilot is embedded by ChatGPT; independent hosting denies framing.
 const ancestors=independentAuth?"'none'":"'self' https://chatgpt.com https://chat.openai.com";
 headers.set('Content-Security-Policy',`default-src 'self'; script-src 'self' 'unsafe-inline'${local?" 'unsafe-eval'":''}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'${local?' ws: wss:':''}; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors ${ancestors}`);
 if(url.protocol==='https:'&&!local)headers.set('Strict-Transport-Security','max-age=31536000');
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

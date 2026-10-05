// Bound provider requests when a teacher has many indexed materials.
export async function parallelMap<T,R>(items:T[],fn:(item:T)=>Promise<R>,limit=4):Promise<R[]>{
 const result:R[]=new Array(items.length);let cursor=0;
 await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{while(cursor<items.length){const index=cursor++;result[index]=await fn(items[index]);}}));return result;
}

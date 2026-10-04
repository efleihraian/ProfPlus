export type ErasureDocument={id:string;user_id:string;store_id:string|null;file_id:string|null};
export type ErasureBackend={
 lock:(user:string)=>Promise<void>;documents:(user:string)=>Promise<ErasureDocument[]>;
 mark:(user:string,id:string)=>Promise<void>;eraseIndex:(id:string)=>Promise<void>;eraseFile:(id:string)=>Promise<void>;
 eraseOriginal:(id:string)=>Promise<void>;eraseRow:(user:string,id:string)=>Promise<void>;
 eraseAppData:(user:string)=>Promise<void>;eraseIdentity:(user:string)=>Promise<void>;finish:(user:string)=>Promise<void>;
};
export async function eraseAccount(user:string,backend:ErasureBackend){
 await backend.lock(user);
 for(const row of await backend.documents(user)){
  if(row.user_id!==user)throw new Error('ERASURE_OWNERSHIP_MISMATCH');
  await backend.mark(user,row.id);
  if(row.store_id)await backend.eraseIndex(row.store_id);
  if(row.file_id)await backend.eraseFile(row.file_id);
  await backend.eraseOriginal(row.id);
  await backend.eraseRow(user,row.id);
 }
 await backend.eraseAppData(user);
 await backend.eraseIdentity(user);
 await backend.finish(user);
}

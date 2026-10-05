// Aggregate pilot budget; no visitor identifiers or messages stored.
export async function allowGuestChat(db: D1Database, now = Date.now()): Promise<boolean> {
 await db.prepare('CREATE TABLE IF NOT EXISTS guest_chat_budget (bucket TEXT PRIMARY KEY, used INTEGER NOT NULL, expires INTEGER NOT NULL)').run();
 await db.prepare('DELETE FROM guest_chat_budget WHERE expires < ?').bind(now).run();
 for(const [duration,limit] of [[60000,5],[3600000,30]]){
 const start=Math.floor(now/duration)*duration;
 const row=await db.prepare('INSERT INTO guest_chat_budget(bucket,used,expires) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET used=used+1 WHERE used < ? RETURNING used').bind(`${duration}:${start}`,start+duration,limit).first();
 if(!row)return false;
 }return true;
}

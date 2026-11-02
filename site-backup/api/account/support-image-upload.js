import { db, storage } from 'hatchable';
import crypto from 'node:crypto';
export const access='user';
export const methods=['POST'];
const MAX_BYTES=2*1024*1024;
function jpeg(b){return b.length>3&&b[0]===255&&b[1]===216&&b[2]===255}
function png(b){return b.length>8&&b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71}
function webp(b){return b.length>12&&b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP'}
export default async function(req,res){
 const userId=String(req.user.id);
 const {rows:blocked}=await db.query('SELECT banned FROM app_moderation WHERE user_id=$1',[userId]);
 if(blocked[0]?.banned)return res.status(403).json({error:'Esta conta está impedida de enviar novas mensagens.'});
 const file=(req.files||[]).find(f=>f.field==='file');
 if(!file||!file.buffer)return res.status(400).json({error:'Escolha uma foto.'});
 if(file.buffer.length>MAX_BYTES)return res.status(413).json({error:'Foto muito grande. Limite de 2 MB.'});
 const mime=jpeg(file.buffer)?'image/jpeg':png(file.buffer)?'image/png':webp(file.buffer)?'image/webp':null;
 if(!mime)return res.status(415).json({error:'Formato não suportado. Use JPG, PNG ou WebP.'});
 const {rows:rate}=await db.query(
  "SELECT COUNT(*)::int AS amount FROM app_support_messages m JOIN app_support_threads t ON t.id=m.thread_id WHERE t.user_id=$1 AND m.sender_role='user' AND m.created_at>now()-interval '1 hour'",
  [userId]);
 if(Number(rate[0]?.amount)>=10)return res.status(429).json({error:'Máximo de 10 mensagens por hora.'});
 const ext=mime==='image/png'?'png':mime==='image/webp'?'webp':'jpg';
 const key='support/'+userId+'/'+crypto.randomUUID()+'.'+ext;
 await storage.put(key,file.buffer,mime);
 const {rows:thread}=await db.query(
  "INSERT INTO app_support_threads(user_id,status) VALUES($1,'open') ON CONFLICT(user_id) DO UPDATE SET status='open',updated_at=now() RETURNING id",
  [userId]);
 const caption=typeof req.body?.caption==='string'?req.body.caption.trim().slice(0,1000):'';
 const {rows}=await db.query(
  "INSERT INTO app_support_messages(thread_id,sender_role,body,image_key,image_mime) VALUES($1,'user',$2,$3,$4) RETURNING id",
  [thread[0].id,caption,key,mime]);
 await db.query('UPDATE app_support_threads SET updated_at=now() WHERE id=$1',[thread[0].id]);
 return res.status(201).json({ok:true,id:rows[0].id});
}
import { db } from 'hatchable';
export const access='user';
export const methods=['GET','POST'];
export default async function(req,res){
 const userId=String(req.user.id);
 res.setHeader('Cache-Control','no-store');
 const existing=await db.query('SELECT id,status FROM app_support_threads WHERE user_id=$1',[userId]);
 if(req.method==='GET'){
  if(!existing.rows.length)return res.json({messages:[],status:'new'});
  const {rows}=await db.query(
   'SELECT id,sender_role AS "senderRole",body,created_at AS "createdAt",(image_key IS NOT NULL) AS "hasImage" FROM app_support_messages WHERE thread_id=$1 ORDER BY id ASC LIMIT 150',[existing.rows[0].id]);
  return res.json({messages:rows,status:existing.rows[0].status});
 }
 const {rows:blocked}=await db.query('SELECT banned FROM app_moderation WHERE user_id=$1',[userId]);
 if(blocked[0]?.banned)return res.status(403).json({error:'Esta conta está impedida de enviar novas mensagens.'});
 const body=typeof req.body?.message==='string'?req.body.message.trim():'';
 if(body.length<3||body.length>1500)return res.status(400).json({error:'Escreva entre 3 e 1500 caracteres.'});
 const {rows:rate}=await db.query(
  "SELECT COUNT(*)::int AS amount FROM app_support_messages m JOIN app_support_threads t ON t.id=m.thread_id WHERE t.user_id=$1 AND m.sender_role='user' AND m.created_at>now()-interval '1 hour'",
  [userId]);
 if(Number(rate[0]?.amount)>=10)return res.status(429).json({error:'Limite de 10 mensagens por hora. Tente mais tarde.'});
 const {rows:thread}=await db.query(
  "INSERT INTO app_support_threads(user_id,status) VALUES($1,'open') ON CONFLICT(user_id) DO UPDATE SET status='open',updated_at=now() RETURNING id",
  [userId]);
 const {rows}=await db.query("INSERT INTO app_support_messages(thread_id,sender_role,body) VALUES($1,'user',$2) RETURNING id",[thread[0].id,body]);
 await db.query('UPDATE app_support_threads SET updated_at=now() WHERE id=$1',[thread[0].id]);
 return res.status(201).json({ok:true,id:rows[0].id});
}
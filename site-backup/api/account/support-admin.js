import { db } from 'hatchable';
export const access='user';
export const methods=['GET','POST'];
export default async function(req,res){
 const {rows:binding}=await db.query('SELECT app_user_id FROM app_owner_link WHERE slot=1');
 if(!binding.length||String(binding[0].app_user_id)!==String(req.user.id))
  return res.status(403).json({error:'Apenas o proprietário pode acessar o atendimento.'});
 res.setHeader('Cache-Control','no-store');
 const data=req.body||{};
 if(req.method==='GET'){
  const threadId=Number(req.query?.thread||0);
  if(threadId>0){
   if(!Number.isSafeInteger(threadId))return res.status(400).json({error:'Conversa inválida.'});
   const {rows:threads}=await db.query(
    'SELECT t.id,t.status,u.email,u.name FROM app_support_threads t JOIN users u ON u.id=t.user_id WHERE t.id=$1',[threadId]);
   if(!threads.length)return res.status(404).json({error:'Conversa não encontrada.'});
   const {rows:messages}=await db.query(
    'SELECT id,sender_role AS "senderRole",body,(image_key IS NOT NULL) AS "hasImage",created_at AS "createdAt" FROM app_support_messages WHERE thread_id=$1 ORDER BY id ASC LIMIT 200',[threadId]);
   return res.json({thread:threads[0],messages});
  }
  const {rows}=await db.query(
   `SELECT t.id,t.status,t.updated_at AS "updatedAt",u.email,u.name,
   (SELECT CASE WHEN m.image_key IS NOT NULL THEN '[Foto] '||m.body ELSE m.body END FROM app_support_messages m WHERE m.thread_id=t.id ORDER BY m.id DESC LIMIT 1) AS "preview",
   (SELECT COUNT(*)::int FROM app_support_messages m WHERE m.thread_id=t.id AND m.sender_role='user') AS "studentMessages"
   FROM app_support_threads t JOIN users u ON u.id=t.user_id ORDER BY t.updated_at DESC LIMIT 100`);
  return res.json({threads:rows});
 }
 const id=Number(data.id);
 if(!Number.isSafeInteger(id)||id<1)return res.status(400).json({error:'Conversa inválida.'});
 const {rows:exists}=await db.query('SELECT id FROM app_support_threads WHERE id=$1',[id]);
 if(!exists.length)return res.status(404).json({error:'Conversa inexistente.'});
 if(data.action==='reply'){
  const body=typeof data.message==='string'?data.message.trim():'';
  if(body.length<3||body.length>1500)return res.status(400).json({error:'Resposta de 3 a 1500 caracteres.'});
  const {rows:message}=await db.query(
   "INSERT INTO app_support_messages(thread_id,sender_role,body) VALUES($1,'owner',$2) RETURNING id",[id,body]);
  await db.query("UPDATE app_support_threads SET status='open',updated_at=now() WHERE id=$1",[id]);
  return res.status(201).json({ok:true,id:message[0].id});
 }
 if(data.action==='close'||data.action==='reopen'){
  await db.query('UPDATE app_support_threads SET status=$1,updated_at=now() WHERE id=$2',[data.action==='close'?'closed':'open',id]);
  return res.json({ok:true});
 }
 return res.status(400).json({error:'Ação inválida.'});
}
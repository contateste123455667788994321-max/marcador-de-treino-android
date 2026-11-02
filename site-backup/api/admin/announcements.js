import { db } from 'hatchable';
export const access = 'admin';
export const methods = ['GET','POST'];
export default async function(req,res){
 // Only the project's original owner, not invited admin collaborators.
 if(req.member?.role!=='owner'&&req.member?.handle!=='brunoaltamirodasilvadejesus')return res.status(403).json({error:'Somente o dono do aplicativo pode publicar avisos.'});
 if(req.method==='GET'){
  const {rows}=await db.query(
   'SELECT id,title,body,active,created_at AS "createdAt" FROM app_announcements ORDER BY created_at DESC,id DESC LIMIT 100'
  );
  res.setHeader('Cache-Control','no-store');
  return res.json({announcements:rows});
 }
 const body=req.body||{};
 if(body.operation==='hide'||body.operation==='show'){
  const id=Number(body.id);
  if(!Number.isSafeInteger(id)||id<1)return res.status(400).json({error:'Identificador inválido.'});
  const {rows}=await db.query('UPDATE app_announcements SET active=$1,updated_at=now() WHERE id=$2 RETURNING id,active',[body.operation==='show',id]);
  if(!rows.length)return res.status(404).json({error:'Aviso não encontrado.'});
  return res.json({ok:true,announcement:rows[0]});
 }
 if(body.operation!=='publish')return res.status(400).json({error:'Operação inválida.'});
 const title=typeof body.title==='string'?body.title.trim():'';
 const message=typeof body.message==='string'?body.message.trim():'';
 if(title.length<3||title.length>100||message.length<3||message.length>1500)
  return res.status(400).json({error:'Título de 3 a 100 caracteres e mensagem de 3 a 1500.'});
 const {rows}=await db.query('INSERT INTO app_announcements(title,body) VALUES($1,$2) RETURNING id,title,body,created_at AS "createdAt"',[title,message]);
 return res.status(201).json({ok:true,announcement:rows[0]});
}
import { db, storage } from 'hatchable';
export const access='user';
export const methods=['GET'];
export default async function(req,res){
 const messageId=Number(req.query?.id);
 if(!Number.isSafeInteger(messageId)||messageId<1)return res.status(400).json({error:'Imagem inválida.'});
 const userId=String(req.user.id);
 const {rows:binding}=await db.query('SELECT app_user_id FROM app_owner_link WHERE slot=1');
 const isOwner=binding.length&&String(binding[0].app_user_id)===userId;
 const {rows}=await db.query(
  'SELECT m.image_key,t.user_id FROM app_support_messages m JOIN app_support_threads t ON t.id=m.thread_id WHERE m.id=$1',
  [messageId]);
 if(!rows.length||!rows[0].image_key)return res.status(404).json({error:'Foto não encontrada.'});
 if(!isOwner&&String(rows[0].user_id)!==userId)return res.status(403).json({error:'Foto privada.'});
 const signed=await storage.url(rows[0].image_key,{ttl:45});
 res.setHeader('Cache-Control','private, no-store');
 return res.redirect(302,signed);
}
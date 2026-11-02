import { db } from 'hatchable';
export const access = 'scheduler';
export const methods = ['POST'];
export default async function(req,res){
 const id=req.body?.user?.id;
 if(req.body?.event!=='user.deleting'||!id)return res.status(400).json({error:'Evento inválido'});
 await db.query('DELETE FROM run_sessions WHERE user_id=$1',[String(id)]);
 return res.json({ok:true});
}